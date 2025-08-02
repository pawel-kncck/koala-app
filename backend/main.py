from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
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
from data_inspector import DataInspector
from llm_service import create_llm_service

# Import database and auth
from database import init_db, close_db, get_db
from models import User, Project, File as FileModel, Context, ChatHistory
from auth import Token
from dependencies import get_current_user
import auth_routes

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


app = FastAPI(title="Koala API", version="0.2.0", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth routes
app.include_router(auth_routes.router)

# Create directories for file storage
UPLOAD_DIR = Path("uploads")
DATA_DIR = Path("data")
UPLOAD_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

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

# Initialize data inspector
data_inspector = DataInspector(uploads_dir=UPLOAD_DIR)

# Initialize LLM service (Gemini as primary, OpenAI as fallback)
llm_service = create_llm_service(preferred_provider="gemini")

# Models
class ProjectCreate(BaseModel):
    name: str
    
class FileInfo(BaseModel):
    id: str
    project_id: str
    filename: str
    size: int
    upload_date: datetime
    file_type: str
    
class ContextUpdate(BaseModel):
    content: str
    
class ChatMessage(BaseModel):
    message: str

class ExecuteCode(BaseModel):
    code: str


# API Endpoints

@app.get("/api/projects")
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all projects for the current user."""
    stmt = select(Project).where(Project.user_id == current_user.id).order_by(Project.created_at.desc())
    result = await db.execute(stmt)
    projects = result.scalars().all()
    
    return [
        {
            "id": p.id,
            "name": p.name,
            "created_at": p.created_at.isoformat()
        }
        for p in projects
    ]


@app.post("/api/projects")
async def create_project(
    name: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new project."""
    project = Project(
        name=name,
        user_id=current_user.id
    )
    
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    return {
        "id": project.id,
        "name": project.name,
        "created_at": project.created_at.isoformat()
    }


@app.get("/api/projects/{project_id}")
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get project details."""
    stmt = select(Project).where(
        and_(Project.id == project_id, Project.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {
        "id": project.id,
        "name": project.name,
        "created_at": project.created_at.isoformat()
    }


@app.delete("/api/projects/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a project and all associated data."""
    stmt = select(Project).where(
        and_(Project.id == project_id, Project.user_id == current_user.id)
    ).options(selectinload(Project.files))
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete physical files
    for file in project.files:
        file_path = Path(file.file_path)
        if file_path.exists():
            file_path.unlink()
    
    # Delete project (cascade will handle related records)
    await db.delete(project)
    await db.commit()
    
    return {"success": True}


# File management endpoints
@app.get("/api/projects/{project_id}/files")
async def list_files(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all files in a project."""
    # Verify project ownership
    stmt = select(Project).where(
        and_(Project.id == project_id, Project.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get files
    stmt = select(FileModel).where(FileModel.project_id == project_id)
    result = await db.execute(stmt)
    files = result.scalars().all()
    
    return [
        {
            "id": f.id,
            "filename": f.original_filename,
            "size": f.size,
            "upload_date": f.upload_date.isoformat(),
            "file_type": f.file_type
        }
        for f in files
    ]


@app.post("/api/projects/{project_id}/files")
async def upload_file(
    project_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a file to a project."""
    # Verify project ownership
    stmt = select(Project).where(
        and_(Project.id == project_id, Project.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Validate file type
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ['.csv', '.xlsx', '.xls']:
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")
    
    # Read file content
    content = await file.read()
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    stored_filename = f"{project_id}_{file_id}_{file.filename}"
    file_path = UPLOAD_DIR / stored_filename
    
    # Save file to disk
    with open(file_path, 'wb') as f:
        f.write(content)
    
    # Get file schema and generate preview
    try:
        schema_info = data_inspector.inspect_file(str(file_path))
    except Exception as e:
        logger.error(f"Failed to inspect file: {str(e)}")
        schema_info = None
    
    # Generate preview data
    preview_data = None
    try:
        if file_ext == '.csv':
            # Detect encoding
            detected = chardet.detect(content)
            encoding = detected['encoding'] or 'utf-8'
            df = pd.read_csv(file_path, encoding=encoding, nrows=100)
        else:
            df = pd.read_excel(file_path, nrows=100)
        
        # Replace NaN and infinity values
        df = df.replace([float('inf'), float('-inf')], None)
        df = df.where(pd.notnull(df), None)
        
        preview_data = {
            "columns": df.columns.tolist(),
            "data": df.to_dict('records'),
            "total_rows": len(df)
        }
    except Exception as e:
        logger.error(f"Failed to generate preview: {str(e)}")
    
    # Create file record
    file_record = FileModel(
        project_id=project_id,
        filename=stored_filename,
        original_filename=file.filename,
        file_path=str(file_path),
        file_type=file_ext,
        size=len(content),
        schema_info=schema_info,
        preview_data=preview_data
    )
    
    db.add(file_record)
    await db.commit()
    await db.refresh(file_record)
    
    return {
        "id": file_record.id,
        "filename": file_record.original_filename,
        "size": file_record.size,
        "upload_date": file_record.upload_date.isoformat(),
        "file_type": file_record.file_type
    }


@app.get("/api/projects/{project_id}/files/{file_id}/preview")
async def preview_file(
    project_id: str,
    file_id: str,
    rows: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Preview file contents - returns pre-calculated preview data."""
    # Get file with project verification
    stmt = select(FileModel).join(Project).where(
        and_(
            FileModel.id == file_id,
            FileModel.project_id == project_id,
            Project.user_id == current_user.id
        )
    )
    result = await db.execute(stmt)
    file_record = result.scalar_one_or_none()
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Return pre-calculated preview if available
    if file_record.preview_data:
        return file_record.preview_data
    
    # Fallback: generate preview on demand (for old files)
    file_path = Path(file_record.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    try:
        if file_record.file_type == '.csv':
            # Detect encoding
            with open(file_path, 'rb') as f:
                raw_data = f.read()
                detected = chardet.detect(raw_data)
                encoding = detected['encoding'] or 'utf-8'
            
            df = pd.read_csv(file_path, encoding=encoding, nrows=rows)
        else:
            df = pd.read_excel(file_path, nrows=rows)
        
        # Replace NaN and infinity values to make JSON serializable
        df = df.replace([float('inf'), float('-inf')], None)
        df = df.where(pd.notnull(df), None)
        
        preview_data = {
            "columns": df.columns.tolist(),
            "data": df.to_dict('records'),
            "total_rows": len(df)
        }
        
        # Cache the preview for future use
        file_record.preview_data = preview_data
        await db.commit()
        
        return preview_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")


@app.delete("/api/projects/{project_id}/files/{file_id}")
async def delete_file(
    project_id: str,
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a file."""
    # Get file with project verification
    stmt = select(FileModel).join(Project).where(
        and_(
            FileModel.id == file_id,
            FileModel.project_id == project_id,
            Project.user_id == current_user.id
        )
    )
    result = await db.execute(stmt)
    file_record = result.scalar_one_or_none()
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete physical file
    file_path = Path(file_record.file_path)
    if file_path.exists():
        file_path.unlink()
    
    # Delete database record
    await db.delete(file_record)
    await db.commit()
    
    return {"success": True}


# Context endpoints
@app.get("/api/projects/{project_id}/context")
async def get_context(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get project context."""
    # Verify project ownership
    stmt = select(Project).where(
        and_(Project.id == project_id, Project.user_id == current_user.id)
    ).options(selectinload(Project.context))
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.context:
        return {
            "content": project.context.content,
            "updated_at": project.context.updated_at.isoformat()
        }
    else:
        return {"content": "", "updated_at": None}


@app.put("/api/projects/{project_id}/context")
async def update_context(
    project_id: str,
    context_data: ContextUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update project context."""
    # Verify project ownership
    stmt = select(Project).where(
        and_(Project.id == project_id, Project.user_id == current_user.id)
    ).options(selectinload(Project.context))
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.context:
        # Update existing context
        project.context.content = context_data.content
        project.context.updated_at = datetime.utcnow()
    else:
        # Create new context
        context = Context(
            project_id=project_id,
            content=context_data.content
        )
        db.add(context)
    
    await db.commit()
    
    return {"success": True}


# Chat endpoints
@app.get("/api/projects/{project_id}/chat/history")
async def get_chat_history(
    project_id: str,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get chat history for a project."""
    # Verify project ownership
    stmt = select(Project).where(
        and_(Project.id == project_id, Project.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get chat messages
    stmt = select(ChatHistory).where(
        ChatHistory.project_id == project_id
    ).order_by(ChatHistory.created_at.desc()).limit(limit)
    
    result = await db.execute(stmt)
    messages = result.scalars().all()
    
    return [
        {
            "id": msg.id,
            "role": msg.role,
            "message": msg.message,
            "generated_code": msg.generated_code,
            "execution_results": msg.execution_results,
            "error_message": msg.error_message,
            "created_at": msg.created_at.isoformat()
        }
        for msg in reversed(messages)  # Return in chronological order
    ]


@app.post("/api/projects/{project_id}/chat")
async def chat(
    project_id: str,
    message: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a chat message and get AI response."""
    # Verify project ownership and get context
    stmt = select(Project).where(
        and_(Project.id == project_id, Project.user_id == current_user.id)
    ).options(
        selectinload(Project.context),
        selectinload(Project.files)
    )
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Save user message
    user_msg = ChatHistory(
        project_id=project_id,
        role="user",
        message=message.message
    )
    db.add(user_msg)
    await db.commit()
    
    # Get context and data info
    context = project.context.content if project.context else ""
    
    # Prepare data info for LLM
    data_info = {}
    for file in project.files:
        if file.schema_info:
            var_name = file.original_filename.rsplit('.', 1)[0].replace('-', '_').replace(' ', '_')
            data_info[var_name] = {
                'description': f"DataFrame from {file.original_filename}",
                'columns': file.schema_info.get('columns', []),
                'shape': file.schema_info.get('shape', [])
            }
    
    # If no LLM service or no data, return simple response
    if not llm_service or not data_info:
        response_text = "I'm ready to help analyze your data. Please upload some data files first." if not data_info else "LLM service is not configured."
        
        assistant_msg = ChatHistory(
            project_id=project_id,
            role="assistant",
            message=response_text
        )
        db.add(assistant_msg)
        await db.commit()
        
        return {
            "response": response_text,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    try:
        # Generate code using LLM
        success, generated_code = llm_service.generate_pandas_code(
            query=message.message,
            context=context,
            data_info=data_info
        )
        
        if not success:
            raise Exception(generated_code)
        
        # Execute the generated code
        execution_request = ExecuteCode(code=generated_code)
        execution_result = await execute_code_internal(project_id, execution_request, project.files)
        
        # Format results as insight
        insight = llm_service.format_results_as_insight(
            query=message.message,
            results=execution_result.get("results", {}),
            context=context
        )
        
        # Build response
        response_text = f"{insight}\n\n"
        if execution_result.get("output"):
            response_text += f"**Output:**\n```\n{execution_result['output']}\n```\n\n"
        response_text += f"**Code:**\n```python\n{generated_code}\n```"
        
        # Save assistant message
        assistant_msg = ChatHistory(
            project_id=project_id,
            role="assistant",
            message=response_text,
            generated_code=generated_code,
            execution_results=execution_result.get("results")
        )
        db.add(assistant_msg)
        await db.commit()
        
        return {
            "response": response_text,
            "code": generated_code,
            "results": execution_result.get("results", {}),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        error_msg = f"I encountered an error: {str(e)}"
        
        # Save error message
        assistant_msg = ChatHistory(
            project_id=project_id,
            role="assistant",
            message=error_msg,
            error_message=str(e)
        )
        db.add(assistant_msg)
        await db.commit()
        
        return {
            "response": error_msg,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


# Code execution endpoint
async def execute_code_internal(project_id: str, request: ExecuteCode, files: List[FileModel]):
    """Internal function to execute code with project files."""
    # Prepare data files
    data_files = {}
    for file in files:
        if file.file_path and Path(file.file_path).exists():
            var_name = file.original_filename.rsplit('.', 1)[0].replace('-', '_').replace(' ', '_')
            data_files[var_name] = file.file_path
    
    logger.info(f"Executing code for project {project_id} with {len(data_files)} data files")
    
    # Execute code
    try:
        result = code_executor.execute(request.code, data_files)
        return result
    except Exception as e:
        logger.error(f"Code execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/projects/{project_id}/execute")
async def execute_code(
    project_id: str,
    request: ExecuteCode,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Execute Python code with project data."""
    # Get project with files
    stmt = select(Project).where(
        and_(Project.id == project_id, Project.user_id == current_user.id)
    ).options(selectinload(Project.files))
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return await execute_code_internal(project_id, request, project.files)


# Data schema endpoints
@app.get("/api/projects/{project_id}/schema")
async def get_project_schema(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get schema for all files in a project."""
    # Get project with files
    stmt = select(Project).where(
        and_(Project.id == project_id, Project.user_id == current_user.id)
    ).options(selectinload(Project.files))
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    schemas = {}
    for file in project.files:
        if file.schema_info:
            schemas[file.id] = {
                "filename": file.original_filename,
                "schema": file.schema_info
            }
    
    return schemas


@app.get("/api/projects/{project_id}/files/{file_id}/schema")
async def get_file_schema(
    project_id: str,
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get schema for a specific file."""
    # Get file with project verification
    stmt = select(FileModel).join(Project).where(
        and_(
            FileModel.id == file_id,
            FileModel.project_id == project_id,
            Project.user_id == current_user.id
        )
    )
    result = await db.execute(stmt)
    file_record = result.scalar_one_or_none()
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    if not file_record.schema_info:
        # Try to regenerate schema
        try:
            schema_info = data_inspector.inspect_file(file_record.file_path)
            file_record.schema_info = schema_info
            await db.commit()
        except Exception as e:
            logger.error(f"Failed to inspect file: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to analyze file")
    
    return file_record.schema_info


# Health check endpoints
@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Koala API v0.2.0"}


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "0.2.0",
        "llm_available": llm_service is not None,
        "code_executor": "docker" if isinstance(code_executor, CodeExecutor) else "subprocess"
    }


@app.get("/api/execute/health")
async def execute_health():
    """Check code execution service health."""
    try:
        result = code_executor.execute("print('healthy')", {})
        return {
            "status": "healthy",
            "executor_type": "docker" if isinstance(code_executor, CodeExecutor) else "subprocess",
            "test_output": result.get("output", "").strip()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }