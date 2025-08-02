from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import json
import uuid
from datetime import datetime
import pandas as pd
import chardet
from pathlib import Path
import logging
import platform

# Import code executors
from code_executor import CodeExecutor
from subprocess_executor import SubprocessExecutor

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Koala API", version="0.1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories for file storage
UPLOAD_DIR = Path("uploads")
DATA_DIR = Path("data")
UPLOAD_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

# In-memory storage for MVP (replace with database in production)
projects_db = {}
files_db = {}
contexts_db = {}

# Initialize code executor (try Docker first, fallback to subprocess)
code_executor = None
try:
    # Check if Docker is available
    import subprocess
    result = subprocess.run(['docker', '--version'], capture_output=True)
    if result.returncode == 0:
        code_executor = CodeExecutor()
        logger.info("Using Docker-based code executor")
    else:
        raise Exception("Docker not available")
except:
    code_executor = SubprocessExecutor()
    logger.info("Using subprocess-based code executor (fallback)")

# Models
class Project(BaseModel):
    id: str
    name: str
    created_at: datetime
    
class FileInfo(BaseModel):
    id: str
    project_id: str
    filename: str
    size: int
    upload_date: datetime
    file_type: str
    
class Context(BaseModel):
    project_id: str
    content: str
    updated_at: datetime
    
class ChatMessage(BaseModel):
    project_id: str
    message: str

class CodeExecutionRequest(BaseModel):
    code: str
    project_id: str

# API Routes

@app.get("/")
async def root():
    return {"message": "Koala API is running"}

@app.post("/api/projects")
async def create_project(name: str):
    """Create a new project"""
    project_id = str(uuid.uuid4())
    project = Project(
        id=project_id,
        name=name,
        created_at=datetime.now()
    )
    projects_db[project_id] = project.dict()
    return project

@app.get("/api/projects")
async def list_projects():
    """List all projects"""
    return list(projects_db.values())

@app.get("/api/projects/{project_id}")
async def get_project(project_id: str):
    """Get a specific project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    return projects_db[project_id]

# File Upload endpoints
@app.post("/api/projects/{project_id}/files")
async def upload_file(
    project_id: str,
    file: UploadFile = File(...)
):
    """Upload a file to a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Validate file type
    allowed_extensions = ['.csv', '.xlsx', '.xls']
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are allowed")
    
    # Save file
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{project_id}_{file_id}_{file.filename}"
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Detect encoding for CSV files
    encoding = 'utf-8'
    if file_ext == '.csv':
        detected = chardet.detect(content)
        encoding = detected['encoding'] or 'utf-8'
    
    # Store file metadata
    file_info = FileInfo(
        id=file_id,
        project_id=project_id,
        filename=file.filename,
        size=len(content),
        upload_date=datetime.now(),
        file_type='CSV' if file_ext == '.csv' else 'Excel'
    )
    
    if project_id not in files_db:
        files_db[project_id] = {}
    files_db[project_id][file_id] = {
        **file_info.dict(),
        'file_path': str(file_path),
        'encoding': encoding
    }
    
    return file_info

@app.get("/api/projects/{project_id}/files")
async def list_files(project_id: str):
    """List all files in a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project_id not in files_db:
        return []
    
    return list(files_db[project_id].values())

@app.get("/api/projects/{project_id}/files/{file_id}/preview")
async def preview_file(project_id: str, file_id: str, rows: int = 100):
    """Preview the first N rows of a file"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project_id not in files_db or file_id not in files_db[project_id]:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_info = files_db[project_id][file_id]
    file_path = file_info['file_path']
    
    try:
        if file_info['file_type'] == 'CSV':
            df = pd.read_csv(file_path, encoding=file_info['encoding'], nrows=rows)
        else:
            df = pd.read_excel(file_path, nrows=rows)
        
        # Convert to JSON-serializable format
        preview_data = {
            'columns': df.columns.tolist(),
            'data': df.to_dict('records'),
            'total_rows': len(df),
            'preview_rows': rows
        }
        
        return preview_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

@app.delete("/api/projects/{project_id}/files/{file_id}")
async def delete_file(project_id: str, file_id: str):
    """Delete a file from a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project_id not in files_db or file_id not in files_db[project_id]:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete physical file
    file_info = files_db[project_id][file_id]
    file_path = Path(file_info['file_path'])
    if file_path.exists():
        file_path.unlink()
    
    # Remove from database
    del files_db[project_id][file_id]
    
    return {"message": "File deleted successfully"}

# Context endpoints
@app.get("/api/projects/{project_id}/context")
async def get_context(project_id: str):
    """Get the context for a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project_id not in contexts_db:
        return {"content": "", "updated_at": None}
    
    return contexts_db[project_id]

@app.put("/api/projects/{project_id}/context")
async def update_context(project_id: str, context: str = Form(...)):
    """Update the context for a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    context_data = Context(
        project_id=project_id,
        content=context,
        updated_at=datetime.now()
    )
    
    contexts_db[project_id] = context_data.dict()
    
    return {"message": "Context updated successfully", "context": context_data}

# Chat endpoint (basic implementation for Phase 2)
@app.post("/api/projects/{project_id}/chat")
async def chat(project_id: str, message: ChatMessage):
    """Send a message to the AI assistant"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get project context
    context = ""
    if project_id in contexts_db:
        context = contexts_db[project_id]['content']
    
    # For Phase 2, we'll return a mock response that includes the context
    # In Phase 3, this will be connected to an actual LLM
    mock_response = f"I understand you're asking about: '{message.message}'. "
    
    if context:
        mock_response += f"Based on the context you provided about {context[:100]}..., "
        mock_response += "I can help you analyze your data. In the next phase, I'll be able to access your uploaded files and provide real insights."
    else:
        mock_response += "Please provide some context about your project in the Context tab so I can give you more relevant insights."
    
    return {
        "response": mock_response,
        "timestamp": datetime.now(),
        "used_context": bool(context)
    }

# Code execution endpoint
@app.post("/api/projects/{project_id}/execute")
async def execute_code(project_id: str, request: CodeExecutionRequest):
    """Execute Python code in a secure sandbox environment"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Validate the code first
    is_valid, error_msg = code_executor.validate_code(request.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Code validation failed: {error_msg}")
    
    # Get all data files for this project
    data_files = {}
    if project_id in files_db:
        for file_id, file_info in files_db[project_id].items():
            # Use the filename without project prefix as variable name
            var_name = file_info['filename'].replace('.csv', '').replace('.xlsx', '').replace('.xls', '')
            var_name = var_name.replace('-', '_').replace(' ', '_')  # Make valid Python variable
            # Store relative path from uploads directory
            file_path = Path(file_info['file_path']).name
            data_files[var_name] = file_path
    
    # Log execution attempt
    logger.info(f"Executing code for project {project_id} with {len(data_files)} data files")
    
    try:
        # Execute the code
        success, output, result_data = code_executor.execute_code(request.code, data_files)
        
        if success:
            return {
                "success": True,
                "output": output,
                "results": result_data or {},
                "available_datasets": list(data_files.keys()),
                "timestamp": datetime.now()
            }
        else:
            # Check if it's an error result
            if result_data and '__error' in result_data:
                error_info = result_data['__error']
                return {
                    "success": False,
                    "error": error_info.get('error', 'Unknown error'),
                    "traceback": error_info.get('traceback', ''),
                    "output": output,
                    "timestamp": datetime.now()
                }
            else:
                return {
                    "success": False,
                    "error": output,
                    "output": output,
                    "timestamp": datetime.now()
                }
                
    except Exception as e:
        logger.error(f"Code execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Code execution failed: {str(e)}")

# Health check endpoint for code execution
@app.get("/api/execute/health")
async def code_execution_health():
    """Check if code execution service is available"""
    executor_type = "docker" if isinstance(code_executor, CodeExecutor) else "subprocess"
    
    # Try to build Docker image if using Docker executor
    if isinstance(code_executor, CodeExecutor):
        try:
            if code_executor.build_sandbox_image():
                return {
                    "status": "healthy",
                    "executor_type": executor_type,
                    "docker_available": True,
                    "message": "Code execution service is ready"
                }
            else:
                return {
                    "status": "warning",
                    "executor_type": "subprocess",
                    "docker_available": False,
                    "message": "Docker image build failed, using subprocess fallback"
                }
        except:
            pass
    
    return {
        "status": "healthy",
        "executor_type": executor_type,
        "docker_available": False,
        "message": "Code execution service is ready (subprocess mode)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)