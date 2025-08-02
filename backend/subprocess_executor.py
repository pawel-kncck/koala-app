"""
Alternative code execution using subprocess with security restrictions.
Fallback option when Docker is not available.
"""

import subprocess
import tempfile
import json
import os
import sys
import resource
import signal
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class SubprocessExecutor:
    """Execute Python code in a restricted subprocess environment."""
    
    def __init__(self, timeout: int = 30, memory_limit_mb: int = 512):
        """
        Initialize the subprocess executor.
        
        Args:
            timeout: Maximum execution time in seconds
            memory_limit_mb: Memory limit in megabytes
        """
        self.timeout = timeout
        self.memory_limit_mb = memory_limit_mb
        self.uploads_dir = Path("uploads")
        
    def execute_code(self, code: str, data_files: Dict[str, str]) -> Tuple[bool, str, Optional[Any]]:
        """
        Execute Python code in a restricted subprocess.
        
        Args:
            code: Python code to execute
            data_files: Dict mapping variable names to file paths
            
        Returns:
            Tuple of (success, output/error, result_data)
        """
        try:
            # Create temporary directory for this execution
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)
                
                # Write the wrapped code
                code_file = temp_path / "user_code.py"
                wrapped_code = self._wrap_code(code, data_files)
                code_file.write_text(wrapped_code)
                
                # Create restricted environment
                env = self._create_restricted_env()
                
                # Prepare subprocess with security restrictions
                process = subprocess.Popen(
                    [sys.executable, "-u", str(code_file)],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    env=env,
                    cwd=str(temp_path),
                    preexec_fn=self._set_resource_limits if os.name != 'nt' else None
                )
                
                try:
                    # Execute with timeout
                    stdout, stderr = process.communicate(timeout=self.timeout)
                    
                    if process.returncode != 0:
                        return False, f"Execution error: {stderr}", None
                    
                    # Read results
                    result_file = temp_path / "result.json"
                    if result_file.exists():
                        result_data = json.loads(result_file.read_text())
                        return True, stdout, result_data
                    else:
                        return True, stdout, None
                        
                except subprocess.TimeoutExpired:
                    process.kill()
                    return False, f"Code execution timed out after {self.timeout} seconds", None
                    
        except Exception as e:
            logger.error(f"Subprocess execution error: {str(e)}")
            return False, f"Internal error: {str(e)}", None
    
    def _create_restricted_env(self) -> Dict[str, str]:
        """Create a restricted environment for subprocess execution."""
        # Start with minimal environment
        restricted_env = {
            'PATH': '/usr/bin:/bin',
            'PYTHONPATH': '',
            'HOME': '/tmp',
            'TMPDIR': '/tmp',
            'PYTHONDONTWRITEBYTECODE': '1',
            'PYTHONUNBUFFERED': '1'
        }
        
        # Add Python path
        if 'PYTHONHOME' in os.environ:
            restricted_env['PYTHONHOME'] = os.environ['PYTHONHOME']
            
        return restricted_env
    
    def _set_resource_limits(self):
        """Set resource limits for the subprocess (Unix only)."""
        # Memory limit
        memory_bytes = self.memory_limit_mb * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_AS, (memory_bytes, memory_bytes))
        
        # CPU time limit (as backup to timeout)
        resource.setrlimit(resource.RLIMIT_CPU, (self.timeout + 5, self.timeout + 5))
        
        # Limit number of processes
        resource.setrlimit(resource.RLIMIT_NPROC, (1, 1))
        
        # Limit file size (10MB max)
        file_size_limit = 10 * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_FSIZE, (file_size_limit, file_size_limit))
        
        # Disable core dumps
        resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    
    def _wrap_code(self, user_code: str, data_files: Dict[str, str]) -> str:
        """
        Wrap user code with security restrictions and data loading.
        
        Args:
            user_code: The user's Python code
            data_files: Dict mapping variable names to file paths
            
        Returns:
            Wrapped Python code
        """
        wrapper = """
import sys
import os

# Remove dangerous modules and builtins
dangerous_modules = [
    'subprocess', 'socket', 'ftplib', 'telnetlib', 'ssl',
    'select', 'selectors', 'asyncio', 'threading', 'multiprocessing',
    'ctypes', 'cffi', 'mmap', 'pickle', 'shelve', 'marshal',
    'importlib', 'zipimport', 'pkgutil', 'inspect', 'dis',
    'webbrowser', 'antigravity', 'this', 'pip', 'setuptools'
]

for module in dangerous_modules:
    if module in sys.modules:
        del sys.modules[module]

# Override dangerous builtins
safe_builtins = {
    'abs': abs, 'all': all, 'any': any, 'ascii': ascii,
    'bin': bin, 'bool': bool, 'bytearray': bytearray, 'bytes': bytes,
    'chr': chr, 'complex': complex, 'dict': dict, 'divmod': divmod,
    'enumerate': enumerate, 'filter': filter, 'float': float,
    'format': format, 'frozenset': frozenset, 'hash': hash,
    'hex': hex, 'int': int, 'isinstance': isinstance, 'issubclass': issubclass,
    'iter': iter, 'len': len, 'list': list, 'map': map,
    'max': max, 'min': min, 'next': next, 'object': object,
    'oct': oct, 'ord': ord, 'pow': pow, 'print': print,
    'range': range, 'repr': repr, 'reversed': reversed, 'round': round,
    'set': set, 'slice': slice, 'sorted': sorted, 'str': str,
    'sum': sum, 'tuple': tuple, 'type': type, 'zip': zip,
    'False': False, 'None': None, 'True': True,
    '__name__': '__main__', '__doc__': None,
}

import builtins
for name in dir(builtins):
    if name not in safe_builtins:
        try:
            delattr(builtins, name)
        except:
            pass

# Now import allowed libraries
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import json

# Load data files
"""
        
        # Add data loading with absolute paths
        for var_name, file_path in data_files.items():
            abs_path = self.uploads_dir / file_path
            file_ext = Path(file_path).suffix.lower()
            
            if file_ext == '.csv':
                wrapper += f"{var_name} = pd.read_csv('{abs_path}')\n"
            elif file_ext in ['.xlsx', '.xls']:
                wrapper += f"{var_name} = pd.read_excel('{abs_path}')\n"
        
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

    # Capture results
    for var_name, var_value in list(locals().items()):
        if not var_name.startswith('_') and var_name not in ['pd', 'np', 'plt', 'json', 'matplotlib']:
            if isinstance(var_value, pd.DataFrame):
                __result[var_name] = {
                    'type': 'dataframe',
                    'data': var_value.head(1000).to_dict('records'),  # Limit rows
                    'columns': list(var_value.columns),
                    'shape': var_value.shape
                }
            elif isinstance(var_value, pd.Series):
                __result[var_name] = {
                    'type': 'series',
                    'data': var_value.head(1000).to_dict(),  # Limit rows
                    'name': var_value.name
                }
            elif isinstance(var_value, (int, float, str, bool)):
                __result[var_name] = {
                    'type': type(var_value).__name__,
                    'data': var_value
                }
            elif isinstance(var_value, (list, dict)):
                # Limit size of collections
                if len(str(var_value)) < 10000:
                    __result[var_name] = {
                        'type': type(var_value).__name__,
                        'data': var_value
                    }
    
    # Save any plots
    fig_nums = plt.get_fignums()
    plots = []
    for i, num in enumerate(fig_nums):
        if i < 5:  # Limit number of plots
            plt.figure(num)
            plot_path = f'plot_{i}.png'
            plt.savefig(plot_path, dpi=150, bbox_inches='tight')
            plots.append(plot_path)
    
    if plots:
        __result['__plots'] = {'type': 'plots', 'data': plots}
    
    # Write results
    with open('result.json', 'w') as f:
        json.dump(__result, f, indent=2)
        
except Exception as e:
    import traceback
    error_info = {
        'error': str(e),
        'traceback': traceback.format_exc()
    }
    with open('result.json', 'w') as f:
        json.dump({'__error': error_info}, f, indent=2)
    sys.exit(1)
"""
        
        return wrapper
    
    def validate_code(self, code: str) -> Tuple[bool, Optional[str]]:
        """
        Validate Python code for security issues.
        
        Args:
            code: Python code to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Forbidden patterns
        forbidden_patterns = [
            '__import__',
            'eval',
            'exec',
            'compile',
            'open',
            'file',
            'input',
            'raw_input',
            'globals',
            'locals',
            'vars',
            'getattr',
            'setattr',
            'delattr',
            'hasattr',
            '__dict__',
            '__class__',
            '__base__',
            '__subclasses__',
            'mro',
            '__code__',
            '__closure__',
            '__func__',
            '__self__',
            '__module__',
            '__builtins__',
        ]
        
        # Check for forbidden patterns
        for pattern in forbidden_patterns:
            if pattern in code:
                return False, f"Forbidden pattern detected: {pattern}"
        
        # Try to parse the code
        try:
            compile(code, '<string>', 'exec')
            return True, None
        except SyntaxError as e:
            return False, f"Syntax error: {str(e)}"