# Task Manager Application

A simple and intuitive Task Manager web application built using **Node.js**, **Express**, **EJS**, and **Bootstrap**. This application allows users to create, view, edit, and delete tasks efficiently.

---

## Features

- **Add Tasks**: Create new tasks with a title, description, status, and due date.
- **View Tasks**: View all tasks in a clean, responsive interface.
- **Edit Tasks**: Modify task details, including the title, description, status, and due date.
- **Delete Tasks**: Remove tasks with a confirmation prompt to prevent accidental deletion.
- **Responsive Design**: Optimized for desktop and mobile views using Bootstrap.

---

## Technologies Used

- **Node.js**: Backend framework for handling server-side logic.
- **Express**: Web framework for routing and middleware.
- **EJS**: Template engine for dynamic HTML rendering.
- **Bootstrap**: CSS framework for responsive design.
- **JavaScript**: Frontend interactivity and form validation.

---

## Installation and Setup

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org) (v14 or later)
- [Git](https://git-scm.com)
- [Visual Studio Code](https://code.visualstudio.com)

### Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   Navigate to the project directory:
   ```

cd task-manager-app

Install dependencies:

npm install

Start the server:

nodemon app.js

Open the application in your browser:

    http://localhost:3000

Visual Studio Code Setup
Recommended Extensions

    Prettier (Code Formatter): For consistent code formatting.
        Install: Prettier - Code formatter

    ESLint: To ensure code quality and detect potential issues.
        Install: ESLint

    Path Autocomplete: Helps with autocompletion for file paths.
        Install: Path Autocomplete

    Live Server: Useful for previewing static files like CSS and EJS during development.
        Install: Live Server

    Node.js Extension Pack: For Node.js and Express development.
        Install: Node.js Extension Pack

Debugging with VS Code

    Open the project folder in VS Code:

code .

Configure the debugger:

    Go to the Run and Debug view in VS Code (Ctrl+Shift+D or Command+Shift+D).
    Click "Create a launch.json file."
    Select Node.js as the environment.
    Use the following configuration in the launch.json file:

        {
            "version": "0.2.0",
            "configurations": [
                {
                    "type": "node",
                    "request": "launch",
                    "name": "Launch Program",
                    "skipFiles": ["<node_internals>/**"],
                    "program": "${workspaceFolder}/app.js"
                }
            ]
        }

    Start Debugging:
        Set breakpoints in app.js or any other file by clicking next to the line numbers.
        Press F5 or click the "Run" button to start debugging.

File Structure

project/
├── data/
│ ├── tasks.js # Stores task data
│ ├── users.js # (Optional) Stores user data
│ └── categories.js # (Optional) Stores task categories
├── public/
│ └── css/
│ └── styles.css # Custom styles for the app
├── views/
│ ├── add-task.ejs # Page to add a new task
│ ├── edit-task.ejs # Page to edit an existing task
│ ├── index.ejs # Homepage showing all tasks
│ └── tasks.ejs # View for all tasks
├── app.js # Main server file
├── package.json # Node.js dependencies
└── README.md # Project documentation

How to Use

    Add a Task:
        Click the "Add Task" button on the homepage.
        Fill out the task details and submit the form.

    Edit a Task:
        Click the "Edit" button next to a task.
        Update the task details and save changes.

    Delete a Task:
        Click the "Delete" button next to a task.
        Confirm deletion in the popup dialog.

    View All Tasks:
        Navigate to /tasks to see a list of all tasks.

Screenshots
Homepage

Edit Task Page

Future Enhancements

    Authentication: Add user login and registration.
    Task Categories: Allow tasks to be grouped by categories.
    Search and Filters: Enable searching and filtering tasks by status or due date.
    API Integration: Create a RESTful API for external integrations.
