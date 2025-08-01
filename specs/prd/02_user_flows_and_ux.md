### **`02_user_flows_and_ux.md`**

---

### **1. User Persona: The "Citizen Data Analyst"**

- **Who they are:** A business professional (e.g., Marketing Analyst, Product Manager) who is skilled in their domain and comfortable with data but is not a programmer.
- **Goal:** To get quick, reliable answers from their data without having to rely on a technical team or write complex code.
- **Core Need:** A tool that understands their business context to make data analysis intuitive and fast.

---

### **2. Core MVP User Flow: From Data to Insight**

This document describes the primary "happy path" for a user in the "Baby Shark" phase. The user experience is designed to be a seamless, linear progression across the three core tabs: Data Studio -> Context -> Chat.

#### **User Flow 1: Creating a Project and Uploading Data**

- **Goal:** The user wants to set up a new analysis project and upload their initial dataset.
- **UX Principles:** The process should feel simple and direct. Feedback on the upload process must be clear and immediate.

1.  **Login & Project Creation:**

    - The user logs into the application.
    - They click the "[+] New Project" button in the sidebar.
    - A prompt appears asking for a "Project Name." The user enters "Q3 Sales Analysis" and confirms.
    - The new project is created and automatically selected, loading the main project view.

2.  **Data Upload:**

    - The user is defaulted to the **"Data Studio"** tab.
    - They see a prominent file upload zone. They drag their `july_sales.csv` file onto the zone.
    - **UX Feedback:** A loading indicator appears next to the filename. Upon successful upload, the indicator turns into a checkmark, and the file is added to the "Uploaded Files" list below. If the upload fails (e.g., it's not a CSV), a clear error message appears.

3.  **Data Verification:**
    - The user clicks the "Preview" button next to `july_sales.csv`.
    - **UX Feedback:** A modal window appears, displaying the first 100 rows of their data in a clean, scrollable table. This gives them immediate confidence that their data has been uploaded and parsed correctly. They close the modal.

#### **User Flow 2: Defining the Project Context**

- **Goal:** The user wants to teach the AI about the business meaning of their data.
- **UX Principles:** This should feel like writing a simple note. The interface should be non-intimidating, with a single, clear call to action.

1.  **Navigate to Context:**

    - The user clicks on the **"Context"** tab.
    - They are presented with a large, empty text area with a placeholder suggesting what to write.

2.  **Input and Save Context:**
    - The user types a brief description: _"This project is for analyzing our Q3 sales. The 'QTY' column represents the number of units sold, and 'RRP' is the recommended retail price."_
    - They click the "Save" button.
    - **UX Feedback:** The button provides a brief "Saved!" confirmation, assuring the user their input has been persisted.

#### **User Flow 3: Engaging in a Context-Aware Chat**

- **Goal:** The user wants to ask questions and get relevant, expert-like answers based on the context they provided.
- **UX Principles:** The experience should be as familiar and intuitive as any modern messaging app.

1.  **Navigate to Chat:**

    - The user clicks on the **"Chat"** tab.
    - They see a welcome message and an empty chat input field at the bottom.

2.  **Ask a Question:**

    - The user types their first question: _"What are some good metrics to analyze based on the data I've provided?"_ and presses Enter.
    - **UX Feedback:** Their message appears instantly on the right side of the chat window. A typing indicator appears on the left, showing the AI is "thinking."

3.  **Receive a Context-Aware Answer:**
    - The AI's response streams into the chat window on the left. Because the AI received the user's saved context, the answer is tailored: _"Based on your sales data, you could analyze 'Total Revenue' (by multiplying QTY by RRP), 'Average Units per Transaction', and identify your 'Top Selling Products'."_
    - The user immediately sees the value of having provided context, as the answer is specific to their data's columns, not a generic business response.
