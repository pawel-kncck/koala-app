Of course. Based on the comprehensive context from the provided files and our previous discussions, here is a clear and logical implementation plan for the MVP, structured around the five agile phases.

---

### **Jabiru MVP: Phased Implementation Plan**

**Version:** 2.0
**Objective:** To iteratively build and validate the core value proposition of an AI-powered, context-aware data analysis application. This plan replaces the previous linear roadmap with an agile, phased approach focused on delivering a testable product as quickly as possible.

---

### **Phase 1: "Ugly Duckling" - Foundational UI/UX**

**Goal:** Replace the current complex UI with a clean, functional, and scalable foundation inspired by modern chat applications. The output will be a clickable, visually complete frontend shell, ready for backend integration.

- **1.1. Deprecate and Remove Canvas UI:**

  - Remove all components related to the old Canvas editor from the codebase (`CanvasEditor.tsx`, `DraggableBlock.tsx`, `BlockLibrary.tsx`, etc.).
  - Clean up associated CSS files and routing logic in `App.tsx`.

- **1.2. Implement New Application Shell:**

  - Refactor `App.tsx` to create a main two-column layout.
  - Create a new `Sidebar.tsx` component for the left column. It must be collapsible and will contain the project list and user profile section.
  - Create a new `ProjectView.tsx` component for the right column, which will serve as the main content area.

- **1.3. Build Core Project View:**

  - Implement the project creation flow initiated from the `Sidebar.tsx`.
  - The `ProjectView.tsx` will display the selected project's name and a horizontal tab navigation bar.
  - Create placeholder components for the three core tabs: `DataStudioTab.tsx`, `ContextTab.tsx`, and `ChatTab.tsx`.

- **1.4. Apply Minimalist Dark Theme:**
  - Establish a consistent, dark-mode theme across the entire application using a component library (e.g., MUI with a dark theme) or a simple CSS variable system.
  - Ensure all text is high-contrast and readable, fixing the known usability bugs.

---

### **Phase 2: "Baby Shark" - First Testable MVP**

**Goal:** To implement the core backend functionality, making the UI from Phase 1 interactive. The output will be the first version of the product that can be used for end-to-end testing of the core loop: **Upload -> Context -> Chat**.

- **2.1. Implement Data Studio Backend:**

  - Build the API endpoints for file upload, listing, preview, and deletion as specified in `04_technical_requirements.md`.
  - **Crucially, refactor the CSV parsing logic (including encoding detection) to the backend** to resolve the existing data preview bug at its source.
  - Connect the `DataStudioTab.tsx` component to these new endpoints.

- **2.2. Implement Context Feature Backend:**

  - Add the `context` field to the `projects` table in the database.
  - Build the `GET` and `PUT` API endpoints to save and retrieve the project context.
  - Connect the `ContextTab.tsx` component to these endpoints, allowing users to save their input.

- **2.3. Implement Basic Chat Backend:**
  - Build the `POST /chat` API endpoint.
  - This endpoint will retrieve the saved project context from the database.
  - It will then construct a prompt by prepending the context to the user's message and send it to an external LLM API.
  - Connect the `ChatTab.tsx` component to this endpoint, streaming the LLM's response back to the user.
  - **Note:** At this stage, the AI does _not_ access the uploaded data files.

---

### **Phase 3: "Growing Panda" - Core Data Intelligence**

**Goal:** To implement the application's core value proposition: making the AI data-aware. The output will be a product that can perform basic data analysis based on natural language commands.

- **3.1. Architect and Build Secure Code Execution API:**

  - Set up the new, private backend service dedicated to executing data analysis code.
  - Implement robust security and sandboxing to ensure that user-triggered code execution is isolated and safe.

- **3.2. Integrate Pandas for Data Analysis:**

  - The new execution API will be equipped to run Python scripts using the Pandas library.
  - It will need access to the user's uploaded files from the secure storage location.

- **3.3. Develop LLM-to-Code Logic:**
  - Enhance the `/chat` endpoint. When a user asks a data-related question, the system will:
    1.  Analyze the user's query.
    2.  Inspect the schema of the relevant data file.
    3.  Generate a valid Pandas script to answer the query.
    4.  Send this script to the secure execution API.
    5.  Return the result (e.g., a number, a table of data) to the user in a formatted way in the chat.

---

### **Phase 4: "Mysterious Owl" - Proactive & Differentiated Features**

**Goal:** To move beyond simple Q&A and deliver unique, proactive insights that differentiate the product from generic code interpreters.

- **4.1. Implement Automated Data Profiling:**

  - Upon file upload, the backend will automatically scan the data to identify column types, statistical distributions, and potential data quality issues.

- **4.2. Develop Smart Context Generation:**

  - Using the results of the data profiling, the AI will automatically generate a draft description of the data in the "Context" tab, which the user can then edit and approve.

- **4.3. Introduce Basic Chart Generation:**
  - When a user asks for a visualization (e.g., "show me a bar chart of sales by product"), the backend will generate a simple, static chart image (using a library like `matplotlib`) and display it directly in the chat.

---

### **Phase 5: MVP Deployment & Launch**

**Goal:** To prepare the mature application for a public launch and onboard the first set of external users.

- **5.1. Production Infrastructure Setup:**

  - Configure a scalable cloud environment for the frontend, backend, and the private code execution service.
  - Set up a production-grade database and file storage solution.
  - Implement a full CI/CD pipeline to automate testing and deployments.

- **5.2. Polish User Onboarding:**

  - Create a polished first-time user experience, including a simple tutorial that guides new users through the core loop of uploading data, setting context, and asking their first question.

- **5.3. Launch Readiness:**
  - Integrate analytics and error tracking services.
  - Prepare support documentation and establish a user feedback channel.
  - Deploy the application to the production environment and make it publicly accessible.
