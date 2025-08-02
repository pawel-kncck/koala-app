# Running Koala Locally

## Prerequisites

- Node.js 16+ (for frontend)
- Python 3.8+ (for backend)
- Docker (optional, for secure code execution)
- OpenAI API key (for AI features)

## Quick Start

### 1. Frontend (React + Vite)

The frontend is already running on port 8080. If you need to restart it:

```bash
# In the project root directory
npm install  # Install dependencies (if not done)
npm run dev  # Start development server
```

Frontend will be available at: http://localhost:8080

### 2. Backend (FastAPI)

Start the backend server:

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies (first time only)
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env

# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=your-actual-api-key-here

# Run the backend server
python main.py
# OR
uvicorn main:app --reload --port 8000
```

Backend API will be available at: http://localhost:8000
API documentation: http://localhost:8000/docs

### 3. Check Everything is Working

1. **Frontend Health Check**: 
   - Open http://localhost:8080
   - You should see the Koala application

2. **Backend Health Check**:
   - Open http://localhost:8000
   - Should return: `{"message": "Koala API is running"}`

3. **Code Execution Health Check**:
   - Open http://localhost:8000/api/execute/health
   - Check if Docker or subprocess execution is available

## Testing the Application

### 1. Create a Project
- Click "New Project" in the sidebar
- Enter a project name

### 2. Upload Data
- Go to Data Studio tab
- Upload a CSV or Excel file
- Click preview to see the data

### 3. Set Context
- Go to Context tab
- Describe what the data represents
- Save the context

### 4. Chat with AI
- Go to Chat tab
- Ask questions about your data, e.g.:
  - "What is the average of the sales column?"
  - "Show me the top 5 products by revenue"
  - "Create a bar chart of sales by region"

## Troubleshooting

### Frontend Issues
- Check console: `npm run dev` terminal
- Browser console: F12 → Console tab
- Ensure port 8080 is not in use

### Backend Issues
- Check if port 8000 is free: `lsof -i :8000`
- Check Python version: `python --version` (should be 3.8+)
- Check logs in terminal running `python main.py`

### AI Features Not Working
- Ensure OPENAI_API_KEY is set in backend/.env
- Check API key is valid
- Backend logs will show "LLM service initialized" if configured

### Code Execution Issues
- Try installing Docker Desktop
- Without Docker, subprocess execution will be used (less secure)
- Check execution health endpoint

## Security Notes

- Code execution is sandboxed for safety
- Only pandas, numpy, and matplotlib are allowed
- Resource limits prevent infinite loops
- All code is validated before execution

## Development Tips

- Frontend hot-reloads automatically
- Backend reloads with --reload flag
- Check API docs at http://localhost:8000/docs
- Logs are your friend - check both terminals