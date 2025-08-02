"""
Secure code execution service for running user-generated pandas code.
Uses Docker containers for isolation and security.
"""

import subprocess
import tempfile
import json
import os
import uuid
from typing import Dict, Any, Optional, Tuple
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class CodeExecutor:
    """Manages secure execution of Python code in Docker containers."""
    
    def __init__(self, docker_image: str = "koala-sandbox:latest", 
                 timeout: int = 30,
                 memory_limit: str = "512m",
                 cpu_limit: str = "0.5"):
        """
        Initialize the code executor.
        
        Args:
            docker_image: Docker image name for sandbox
            timeout: Maximum execution time in seconds
            memory_limit: Memory limit (e.g., "512m", "1g")
            cpu_limit: CPU limit (e.g., "0.5" for half a CPU)
        """
        self.docker_image = docker_image
        self.timeout = timeout
        self.memory_limit = memory_limit
        self.cpu_limit = cpu_limit
        self.uploads_dir = Path("uploads")
        
    def build_sandbox_image(self) -> bool:
        """Build the Docker sandbox image."""
        try:
            dockerfile_path = Path(__file__).parent / "Dockerfile.sandbox"
            cmd = [
                "docker", "build",
                "-t", self.docker_image,
                "-f", str(dockerfile_path),
                "."
            ]
            
            result = subprocess.run(cmd, 
                                  capture_output=True, 
                                  text=True,
                                  cwd=Path(__file__).parent)
            
            if result.returncode != 0:
                logger.error(f"Failed to build Docker image: {result.stderr}")
                return False
                
            logger.info("Successfully built sandbox Docker image")
            return True
            
        except Exception as e:
            logger.error(f"Error building Docker image: {str(e)}")
            return False
    
    def execute_code(self, code: str, data_files: Dict[str, str]) -> Tuple[bool, str, Optional[Any]]:
        """
        Execute Python code in a secure Docker container.
        
        Args:
            code: Python code to execute
            data_files: Dict mapping variable names to file paths
            
        Returns:
            Tuple of (success, output/error, result_data)
        """
        execution_id = str(uuid.uuid4())
        
        try:
            # Create temporary directory for this execution
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)
                
                # Write the code to execute
                code_file = temp_path / "user_code.py"
                
                # Wrap user code with data loading and result capture
                wrapped_code = self._wrap_code(code, data_files)
                code_file.write_text(wrapped_code)
                
                # Copy data files to temp directory
                for var_name, file_path in data_files.items():
                    src_path = self.uploads_dir / file_path
                    if src_path.exists():
                        dest_path = temp_path / Path(file_path).name
                        subprocess.run(["cp", str(src_path), str(dest_path)])
                
                # Docker run command with security restrictions
                docker_cmd = [
                    "docker", "run",
                    "--rm",  # Remove container after execution
                    "--network", "none",  # No network access
                    "--memory", self.memory_limit,  # Memory limit
                    "--cpus", self.cpu_limit,  # CPU limit
                    "--read-only",  # Read-only root filesystem
                    "-v", f"{temp_path}:/sandbox/workspace:ro",  # Mount workspace as read-only
                    "-v", f"{temp_path}/output:/sandbox/output:rw",  # Output directory
                    "--cap-drop", "ALL",  # Drop all capabilities
                    "--security-opt", "no-new-privileges",  # No privilege escalation
                    self.docker_image,
                    "/sandbox/workspace/user_code.py"
                ]
                
                # Create output directory
                (temp_path / "output").mkdir(exist_ok=True)
                
                # Execute with timeout
                try:
                    result = subprocess.run(
                        docker_cmd,
                        capture_output=True,
                        text=True,
                        timeout=self.timeout
                    )
                    
                    # Check for execution errors
                    if result.returncode != 0:
                        return False, f"Execution error: {result.stderr}", None
                    
                    # Read the result file if it exists
                    result_file = temp_path / "output" / "result.json"
                    if result_file.exists():
                        result_data = json.loads(result_file.read_text())
                        return True, result.stdout, result_data
                    else:
                        return True, result.stdout, None
                        
                except subprocess.TimeoutExpired:
                    return False, f"Code execution timed out after {self.timeout} seconds", None
                    
        except Exception as e:
            logger.error(f"Code execution error: {str(e)}")
            return False, f"Internal error: {str(e)}", None
    
    def _wrap_code(self, user_code: str, data_files: Dict[str, str]) -> str:
        """
        Wrap user code with data loading and result capture logic.
        
        Args:
            user_code: The user's Python code
            data_files: Dict mapping variable names to file paths
            
        Returns:
            Wrapped Python code
        """
        wrapper = """
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import json
import sys
import os

# Redirect matplotlib output
os.makedirs('/sandbox/output/plots', exist_ok=True)

# Load data files
"""
        
        # Add data loading code
        for var_name, file_path in data_files.items():
            file_name = Path(file_path).name
            file_ext = Path(file_path).suffix.lower()
            
            if file_ext == '.csv':
                wrapper += f"{var_name} = pd.read_csv('/sandbox/workspace/{file_name}')\n"
            elif file_ext in ['.xlsx', '.xls']:
                wrapper += f"{var_name} = pd.read_excel('/sandbox/workspace/{file_name}')\n"
        
        wrapper += """
# Dictionary to store results
__result = {}

# Execute user code
try:
"""
        
        # Indent user code
        indented_code = '\n'.join('    ' + line for line in user_code.split('\n'))
        wrapper += indented_code
        
        wrapper += """

    # Capture any variables that look like results
    for var_name, var_value in locals().items():
        if not var_name.startswith('_'):
            if isinstance(var_value, pd.DataFrame):
                # Convert DataFrame to dict for JSON serialization
                __result[var_name] = {
                    'type': 'dataframe',
                    'data': var_value.to_dict('records'),
                    'columns': list(var_value.columns),
                    'shape': var_value.shape
                }
            elif isinstance(var_value, pd.Series):
                __result[var_name] = {
                    'type': 'series',
                    'data': var_value.to_dict(),
                    'name': var_value.name
                }
            elif isinstance(var_value, (int, float, str, bool, list, dict)):
                __result[var_name] = {
                    'type': type(var_value).__name__,
                    'data': var_value
                }
    
    # Save any plots
    import matplotlib.pyplot as plt
    fig_nums = plt.get_fignums()
    for i, num in enumerate(fig_nums):
        plt.figure(num)
        plt.savefig(f'/sandbox/output/plots/figure_{i}.png', dpi=150, bbox_inches='tight')
    
    # Write results to file
    with open('/sandbox/output/result.json', 'w') as f:
        json.dump(__result, f, indent=2)
        
except Exception as e:
    import traceback
    error_info = {
        'error': str(e),
        'traceback': traceback.format_exc()
    }
    with open('/sandbox/output/result.json', 'w') as f:
        json.dump({'__error': error_info}, f, indent=2)
    sys.exit(1)
"""
        
        return wrapper
    
    def validate_code(self, code: str) -> Tuple[bool, Optional[str]]:
        """
        Validate Python code for obvious security issues.
        
        Args:
            code: Python code to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Forbidden imports and functions
        forbidden_patterns = [
            'import os',
            'import subprocess',
            'import sys',
            'import socket',
            '__import__',
            'eval(',
            'exec(',
            'compile(',
            'open(',
            'file(',
            'input(',
            'raw_input(',
            'globals(',
            'locals(',
            'vars(',
            'dir(',
        ]
        
        code_lower = code.lower()
        for pattern in forbidden_patterns:
            if pattern.lower() in code_lower:
                return False, f"Forbidden pattern detected: {pattern}"
        
        # Try to parse the code
        try:
            compile(code, '<string>', 'exec')
            return True, None
        except SyntaxError as e:
            return False, f"Syntax error: {str(e)}"