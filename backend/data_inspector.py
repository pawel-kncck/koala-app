"""
Data inspection service for analyzing uploaded files and extracting schema information.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class DataInspector:
    """Service for inspecting and analyzing data files."""
    
    def __init__(self, uploads_dir: Path = Path("uploads")):
        """
        Initialize the data inspector.
        
        Args:
            uploads_dir: Directory containing uploaded files
        """
        self.uploads_dir = uploads_dir
    
    def inspect_file(self, file_path: str, encoding: str = 'utf-8') -> Dict[str, Any]:
        """
        Inspect a data file and extract comprehensive schema information.
        
        Args:
            file_path: Path to the file
            encoding: File encoding (for CSV files)
            
        Returns:
            Dictionary containing schema and statistics
        """
        try:
            full_path = self.uploads_dir / file_path if not Path(file_path).is_absolute() else Path(file_path)
            
            # Load the data
            if file_path.endswith('.csv'):
                df = pd.read_csv(full_path, encoding=encoding)
            else:  # Excel files
                df = pd.read_excel(full_path)
            
            # Basic information
            info = {
                'file_name': Path(file_path).name,
                'shape': df.shape,
                'columns': list(df.columns),
                'row_count': len(df),
                'column_count': len(df.columns),
                'memory_usage': df.memory_usage(deep=True).sum() / 1024 / 1024,  # MB
                'has_null_values': df.isnull().any().any(),
            }
            
            # Column details
            column_info = []
            for col in df.columns:
                col_data = df[col]
                col_info = {
                    'name': col,
                    'dtype': str(col_data.dtype),
                    'null_count': col_data.isnull().sum(),
                    'null_percentage': (col_data.isnull().sum() / len(df)) * 100,
                    'unique_count': col_data.nunique(),
                    'unique_percentage': (col_data.nunique() / len(df)) * 100,
                }
                
                # Type-specific information
                if pd.api.types.is_numeric_dtype(col_data):
                    col_info['type'] = 'numeric'
                    col_info['stats'] = {
                        'min': float(col_data.min()) if not col_data.empty else None,
                        'max': float(col_data.max()) if not col_data.empty else None,
                        'mean': float(col_data.mean()) if not col_data.empty else None,
                        'median': float(col_data.median()) if not col_data.empty else None,
                        'std': float(col_data.std()) if not col_data.empty else None,
                        'q25': float(col_data.quantile(0.25)) if not col_data.empty else None,
                        'q75': float(col_data.quantile(0.75)) if not col_data.empty else None,
                    }
                elif pd.api.types.is_datetime64_any_dtype(col_data):
                    col_info['type'] = 'datetime'
                    col_info['stats'] = {
                        'min': str(col_data.min()) if not col_data.empty else None,
                        'max': str(col_data.max()) if not col_data.empty else None,
                        'range_days': (col_data.max() - col_data.min()).days if not col_data.empty else None,
                    }
                elif pd.api.types.is_object_dtype(col_data):
                    col_info['type'] = 'text'
                    # Sample values for text columns
                    unique_vals = col_data.dropna().unique()
                    col_info['sample_values'] = list(unique_vals[:10])  # First 10 unique values
                    
                    # Check if it might be categorical
                    if col_info['unique_count'] < 50 and col_info['unique_percentage'] < 5:
                        col_info['is_categorical'] = True
                        col_info['categories'] = list(unique_vals)
                    else:
                        col_info['is_categorical'] = False
                        
                    # Text statistics
                    if len(col_data) > 0:
                        text_lengths = col_data.dropna().astype(str).str.len()
                        if len(text_lengths) > 0:
                            col_info['text_stats'] = {
                                'min_length': int(text_lengths.min()),
                                'max_length': int(text_lengths.max()),
                                'avg_length': float(text_lengths.mean()),
                            }
                elif pd.api.types.is_bool_dtype(col_data):
                    col_info['type'] = 'boolean'
                    col_info['stats'] = {
                        'true_count': col_data.sum(),
                        'false_count': (~col_data).sum(),
                        'true_percentage': (col_data.sum() / len(col_data)) * 100,
                    }
                else:
                    col_info['type'] = 'unknown'
                
                column_info.append(col_info)
            
            info['columns_detail'] = column_info
            
            # Data quality insights
            insights = []
            
            # Check for columns with high null percentage
            high_null_cols = [col for col in column_info if col['null_percentage'] > 50]
            if high_null_cols:
                insights.append({
                    'type': 'warning',
                    'message': f"{len(high_null_cols)} column(s) have more than 50% missing values",
                    'columns': [col['name'] for col in high_null_cols]
                })
            
            # Check for potential ID columns
            potential_ids = [col for col in column_info 
                            if col['unique_count'] == info['row_count'] and col['null_count'] == 0]
            if potential_ids:
                insights.append({
                    'type': 'info',
                    'message': f"Found {len(potential_ids)} potential ID column(s)",
                    'columns': [col['name'] for col in potential_ids]
                })
            
            # Check for constant columns
            constant_cols = [col for col in column_info if col['unique_count'] == 1]
            if constant_cols:
                insights.append({
                    'type': 'warning',
                    'message': f"{len(constant_cols)} column(s) have only one unique value",
                    'columns': [col['name'] for col in constant_cols]
                })
            
            info['quality_insights'] = insights
            
            # Sample data
            info['sample_data'] = df.head(5).to_dict('records')
            
            return info
            
        except Exception as e:
            logger.error(f"Error inspecting file {file_path}: {str(e)}")
            return {
                'error': str(e),
                'file_name': Path(file_path).name
            }
    
    def get_column_relationships(self, df: pd.DataFrame, sample_size: int = 1000) -> List[Dict]:
        """
        Analyze potential relationships between columns.
        
        Args:
            df: DataFrame to analyze
            sample_size: Number of rows to sample for analysis
            
        Returns:
            List of potential relationships
        """
        relationships = []
        
        # Sample data if too large
        if len(df) > sample_size:
            df_sample = df.sample(n=sample_size, random_state=42)
        else:
            df_sample = df
        
        numeric_cols = df_sample.select_dtypes(include=[np.number]).columns
        
        # Check correlations between numeric columns
        if len(numeric_cols) > 1:
            corr_matrix = df_sample[numeric_cols].corr()
            
            for i, col1 in enumerate(numeric_cols):
                for j, col2 in enumerate(numeric_cols):
                    if i < j:  # Upper triangle only
                        corr = corr_matrix.loc[col1, col2]
                        if abs(corr) > 0.7:  # Strong correlation
                            relationships.append({
                                'type': 'correlation',
                                'column1': col1,
                                'column2': col2,
                                'strength': float(corr),
                                'description': f"Strong {'positive' if corr > 0 else 'negative'} correlation"
                            })
        
        return relationships
    
    def generate_data_description(self, schema: Dict) -> str:
        """
        Generate a natural language description of the data.
        
        Args:
            schema: Schema information from inspect_file
            
        Returns:
            Natural language description
        """
        desc_parts = []
        
        # Basic description
        desc_parts.append(
            f"This dataset contains {schema['row_count']:,} rows and {schema['column_count']} columns."
        )
        
        # Column types summary
        col_types = {}
        for col in schema['columns_detail']:
            col_type = col['type']
            col_types[col_type] = col_types.get(col_type, 0) + 1
        
        type_desc = []
        for col_type, count in col_types.items():
            type_desc.append(f"{count} {col_type}")
        
        desc_parts.append(f"The columns include: {', '.join(type_desc)}.")
        
        # Key columns
        numeric_cols = [col['name'] for col in schema['columns_detail'] if col['type'] == 'numeric']
        text_cols = [col['name'] for col in schema['columns_detail'] if col['type'] == 'text']
        date_cols = [col['name'] for col in schema['columns_detail'] if col['type'] == 'datetime']
        
        if numeric_cols:
            desc_parts.append(f"Numeric columns: {', '.join(numeric_cols[:5])}" + 
                            (" and more" if len(numeric_cols) > 5 else ""))
        
        if text_cols:
            desc_parts.append(f"Text columns: {', '.join(text_cols[:5])}" + 
                            (" and more" if len(text_cols) > 5 else ""))
        
        if date_cols:
            desc_parts.append(f"Date columns: {', '.join(date_cols)}")
        
        # Quality notes
        if schema.get('has_null_values'):
            desc_parts.append("Note: The dataset contains missing values in some columns.")
        
        return " ".join(desc_parts)