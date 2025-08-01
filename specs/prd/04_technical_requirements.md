Of course. Here is the essential `04_technical_requirements.md` file for the MVP.

---

### **`04_technical_requirements.md`**

**Version:** 1.0
**Status:** Scoped for MVP ("Baby Shark" / "Growing Panda" Phases)

---

### **1. Technology Stack**

This document confirms the technology stack based on the existing codebase.

- **Frontend:**

  - Framework: React with TypeScript
  - Styling: A component library (e.g., MUI, Ant Design) is recommended for the "Ugly Duckling" phase to ensure consistency and speed. All custom styling will use CSS modules.
  - State Management: React Context for simple state; Zustand if more complex global state is needed.
  - Build Tool: Vite

- **Backend:**

  - Framework: Python with FastAPI
  - Database: SQLite for local development and testing; PostgreSQL for production.
  - ORM: SQLAlchemy
  - Authentication: JWT-based authentication.

- **Infrastructure:**
  - Containerization: Docker and Docker Compose for local development consistency.
  - Deployment: To be deployed on a major cloud provider (e.g., AWS, GCP, Vercel).

---

### **2. High-Level API Contract (Baby Shark Phase)**

The following RESTful API endpoints are required to support the initial testable version of the application.

- **Projects**

  - `POST /api/v1/projects`: Create a new project.
    - Request: `{ "name": "Project Name" }`
    - Response: `{ "id": "uuid", "name": "Project Name" }`
  - `GET /api/v1/projects`: Get a list of all projects for the authenticated user.

- **Files**

  - `POST /api/v1/projects/{projectId}/files`: Upload a file to a specific project.
    - Request: `multipart/form-data` with the file.
    - Response: File metadata object.
  - `GET /api/v1/projects/{projectId}/files`: Get a list of files for a project.
  - `GET /api/v1/files/{fileId}/preview`: Get a JSON preview of a CSV file (first 100 rows).
  - `DELETE /api/v1/files/{fileId}`: Delete a file.

- **Context**

  - `GET /api/v1/projects/{projectId}/context`: Get the context for a project.
  - `PUT /api/v1/projects/{projectId}/context`: Create or update the context for a project.
    - Request: `{ "content": "User-provided text..." }`

- **Chat**
  - `POST /api/v1/projects/{projectId}/chat`: Send a message to the chat.
    - Request: `{ "message": "User's query" }`
    - Response: A server-sent event (SSE) stream with the LLM's response.

---

### **3. Data Model**

The database schema will be simplified for the MVP, focusing only on essential entities. The `canvases` table will be ignored.

- **`users`**

  - `id` (UUID, Primary Key)
  - `email` (String, Unique)
  - `hashed_password` (String)

- **`projects`**

  - `id` (UUID, Primary Key)
  - `name` (String)
  - `owner_id` (UUID, Foreign Key to `users.id`)
  - **`context` (Text, Nullable)** - _This field needs to be added to the existing model._

- **`files`**

  - `id` (UUID, Primary Key)
  - `name` (String)
  - `path` (String) - The location in the file storage.
  - `project_id` (UUID, Foreign Key to `projects.id`)

- **Relationships:**
  - A `User` can have many `Projects`.
  - A `Project` can have many `Files`.
