### **`03_feature_specifications.md`**

**Version:** 1.0
**Status:** Scoped for "Baby Shark" Phase

---

### **1. Data Upload & Processing (Data Studio)**

**Objective:** To enable users to upload, manage, and preview their data files within a project, ensuring data integrity from the point of upload.

- **FR-1.1:** The system shall provide a UI for file upload via both drag-and-drop and a file browser.
- **FR-1.2:** The system shall restrict uploads to `.csv` files only for the MVP.
- **FR-1.3:** On upload, the backend shall handle file storage, metadata extraction (name, size), and database record creation.
- **FR-1.4:** The backend shall perform robust CSV parsing on upload, including character encoding detection, to prevent data corruption. This resolves the existing preview bug.
- **FR-1.5:** The UI shall display a list of all uploaded files for the selected project.
- **FR-1.6:** The user shall be able to delete files from a project.
- **FR-1.7:** The user shall be able to preview the first 100 rows of any uploaded CSV file in a modal view.

---

### **2. Context Feature**

**Objective:** To provide a simple mechanism for users to save and persist a plain-text context for each project.

- **FR-2.1:** The UI shall display a dedicated text area for users to input and edit project-level context.
- **FR-2.2:** The system shall fetch and display any previously saved context when the user navigates to this feature.
- **FR-2.3:** A "Save" button shall trigger an API call to persist the text content to the backend database, associated with the current project ID.
- **FR-2.4:** The system shall provide a clear confirmation message to the user upon a successful save.

---

### **3. Chat**

**Objective:** To provide a functional, context-aware chat interface as the primary means of user interaction with the AI.

- **FR-3.1:** The UI shall present a standard chat interface with a message history view and a text input form.
- **FR-3.2:** When a user submits a message, the backend shall retrieve the saved context for the current project.
- **FR-3.3:** The backend shall construct a new prompt for the LLM by prepending the project context to the user's query.
- **FR-3.4:** The system shall send the combined prompt to an external LLM service and stream the response back to the user's chat window.
- **FR-3.5 (Out of Scope for this Phase):** The chat feature will **not** access or analyze the content of the uploaded data files. Its awareness is strictly limited to the user-provided context. Chat history is not required to persist between user sessions.
