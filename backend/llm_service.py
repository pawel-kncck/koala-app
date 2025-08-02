"""
LLM service for generating code and analyzing data queries.
Supports OpenAI GPT-4 and can be extended for other providers.
"""

import os
import logging
from typing import Dict, List, Optional, Tuple
from openai import OpenAI
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class LLMService:
    """Service for interacting with Large Language Models."""
    
    def __init__(self, model: str = "gpt-4", api_key: Optional[str] = None):
        """
        Initialize the LLM service.
        
        Args:
            model: Model identifier (e.g., "gpt-4", "gpt-3.5-turbo")
            api_key: OpenAI API key (uses env var if not provided)
        """
        self.model = model
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        
        if not self.api_key:
            logger.warning("No OpenAI API key found. LLM features will be limited.")
            self.client = None
        else:
            self.client = OpenAI(api_key=self.api_key)
            logger.info(f"LLM service initialized with model: {self.model}")
    
    def analyze_query(self, query: str, context: str, data_schema: Dict) -> Dict:
        """
        Analyze a user query to understand intent and required operations.
        
        Args:
            query: User's natural language query
            context: Project context
            data_schema: Schema of available data
            
        Returns:
            Analysis results including intent and required operations
        """
        if not self.client:
            return {"error": "LLM service not available"}
        
        system_prompt = """You are a data analysis assistant. Analyze the user's query and determine:
1. The primary intent (e.g., aggregation, filtering, visualization, calculation)
2. Which columns/fields are involved
3. What operations are needed
4. Whether visualization is requested

Return your analysis as JSON."""
        
        user_prompt = f"""Query: {query}

Context: {context}

Available data:
{json.dumps(data_schema, indent=2)}

Analyze this query and return a JSON object with:
- intent: primary goal (aggregate/filter/visualize/calculate/explore)
- columns: list of column names involved
- operations: list of required operations
- needs_visualization: boolean
- description: brief description of what to do"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            analysis = json.loads(response.choices[0].message.content)
            return analysis
            
        except Exception as e:
            logger.error(f"Query analysis failed: {str(e)}")
            return {"error": str(e)}
    
    def generate_pandas_code(self, query: str, context: str, data_info: Dict) -> Tuple[bool, str]:
        """
        Generate pandas code to answer a data analysis query.
        
        Args:
            query: User's natural language query
            context: Project context
            data_info: Information about available datasets
            
        Returns:
            Tuple of (success, generated_code)
        """
        if not self.client:
            return False, "# LLM service not available\nprint('Please configure OpenAI API key')"
        
        system_prompt = """You are an expert Python data analyst. Generate pandas code to answer data queries.

IMPORTANT RULES:
1. Only use pandas, numpy, and matplotlib
2. Always print or display results clearly
3. For DataFrames, use .head() to show samples
4. Include descriptive print statements
5. Handle potential errors gracefully
6. Use meaningful variable names
7. Add comments to explain complex operations
8. If creating visualizations, use matplotlib and save to file

Available variables are the loaded datasets."""
        
        # Build dataset description
        datasets_desc = []
        for var_name, info in data_info.items():
            datasets_desc.append(f"- {var_name}: {info.get('description', 'Dataset')}")
            if 'columns' in info:
                datasets_desc.append(f"  Columns: {', '.join(info['columns'])}")
            if 'shape' in info:
                datasets_desc.append(f"  Shape: {info['shape']}")
        
        user_prompt = f"""Query: {query}

Context: {context}

Available datasets:
{chr(10).join(datasets_desc)}

Generate Python code using pandas to answer this query. Make sure to:
1. Import any needed libraries (pandas as pd, numpy as np, matplotlib.pyplot as plt)
2. Use the available dataset variables directly (they are pre-loaded)
3. Print clear results
4. Create visualizations if requested"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            code = response.choices[0].message.content
            
            # Clean up the code (remove markdown if present)
            if "```python" in code:
                code = code.split("```python")[1].split("```")[0]
            elif "```" in code:
                code = code.split("```")[1].split("```")[0]
            
            return True, code.strip()
            
        except Exception as e:
            logger.error(f"Code generation failed: {str(e)}")
            return False, f"# Error generating code: {str(e)}"
    
    def format_results_as_insight(self, query: str, results: Dict, context: str) -> str:
        """
        Format execution results as a natural language insight.
        
        Args:
            query: Original user query
            results: Execution results
            context: Project context
            
        Returns:
            Formatted insight text
        """
        if not self.client:
            # Fallback formatting without LLM
            return self._format_results_simple(results)
        
        system_prompt = """You are a data analyst presenting insights. Convert technical results into clear, 
conversational insights. Be concise but informative. Use the context to make insights more relevant."""
        
        # Prepare results summary
        results_summary = []
        for key, value in results.items():
            if key.startswith('_'):
                continue
            
            if value.get('type') == 'dataframe':
                results_summary.append(f"{key}: DataFrame with {value['shape']} shape")
                if 'data' in value and value['data']:
                    results_summary.append(f"Sample: {value['data'][:2]}")
            elif value.get('type') in ['int', 'float']:
                results_summary.append(f"{key}: {value['data']}")
            elif value.get('type') == 'series':
                results_summary.append(f"{key}: {value['data']}")
        
        user_prompt = f"""Original query: {query}

Context: {context}

Results:
{chr(10).join(results_summary)}

Convert these results into a clear, conversational insight that answers the user's query."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.5,
                max_tokens=300
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Insight formatting failed: {str(e)}")
            return self._format_results_simple(results)
    
    def _format_results_simple(self, results: Dict) -> str:
        """Simple result formatting without LLM."""
        if not results:
            return "No results to display."
        
        formatted = []
        for key, value in results.items():
            if key.startswith('_'):
                continue
            
            if value.get('type') == 'dataframe':
                formatted.append(f"**{key}** (DataFrame):")
                formatted.append(f"Shape: {value['shape']}")
                if 'data' in value and value['data']:
                    formatted.append("First few rows:")
                    # Format as simple table
                    if value['columns']:
                        formatted.append(" | ".join(value['columns']))
                        for row in value['data'][:5]:
                            formatted.append(" | ".join(str(row.get(col, '')) for col in value['columns']))
            
            elif value.get('type') in ['int', 'float', 'str']:
                formatted.append(f"**{key}**: {value['data']}")
            
            elif value.get('type') == 'series':
                formatted.append(f"**{key}** (Series):")
                data = value['data']
                for k, v in list(data.items())[:10]:
                    formatted.append(f"  {k}: {v}")
        
        return "\n".join(formatted) if formatted else "Analysis complete."