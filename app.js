const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override"); // Import method-override

const app = express();
const PORT = 3000;

// Import data
const tasks = require("./data/tasks");
const users = require("./data/users");
const categories = require("./data/categories");

// Helper function to save data to a file
const fs = require("fs");

// Helper function to save data to a file
// Takes the file path and the data to be saved
function saveData(filePath, data) {
	// Write the data to the specified file in the 'data' directory
	fs.writeFileSync(
		path.join(__dirname, "data", filePath),
		`module.exports = ${JSON.stringify(data, null, 4)};`
	);
}

// Middleware: Parse request bodies and serve static files
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Middleware: Validation for task creation and update
// Ensures that all required fields are provided and meet the validation criteria
function validateTask(req, res, next) {
	// Extract task fields from the request body
	const { title, dueDate, status } = req.body;

	// Check if 'title' is provided and meets the minimum length requirement
	if (!title || title.length < 3) {
		// If invalid, respond with a 400 status and an error message
		return res
			.status(400)
			.send("Title is required and must be at least 3 characters long.");
	}

	// Check if 'dueDate' is provided and is a valid date
	if (!dueDate || isNaN(Date.parse(dueDate))) {
		// If invalid, respond with a 400 status and an error message
		return res.status(400).send("A valid Due Date is required.");
	}

	// If 'status' is provided, ensure it is either 'Pending' or 'Completed'
	if (status && !["Pending", "Completed"].includes(status)) {
		// If invalid, respond with a 400 status and an error message
		return res.status(400).send("Status must be 'Pending' or 'Completed'.");
	}

	// If all validations pass, proceed to the next middleware or route handler
	next();
}

// Customer middleware: Logger
app.use((req, res, next) => {
	const now = new Date();
	console.log(`[${now.toISOString()}] ${req.method} request to ${req.url}`);
	next(); // Pass control to the next middleware/route
});

// Home route
app.get("/", (req, res) => {
	res.render("index", { tasks }); // Render tasks on homepage
});

// API Routes
// GET: Retrieve all tasks or filter by status and/or due date
// Includes validation for query parameters
app.get("/tasks", (req, res) => {
	const { status, dueDate } = req.query; // Extract query parameters

	let filteredTasks = tasks; // Start with the full list of tasks

	// Validate 'status' parameter
	if (status && !["Pending", "Completed"].includes(status)) {
		// If 'status' is invalid, respond with a 400 status and an error message
		return res
			.status(400)
			.send("Invalid status. Use 'Pending' or 'Completed'.");
	}

	// Validate 'dueDate' parameter
	if (dueDate && isNaN(Date.parse(dueDate))) {
		// If 'dueDate' is invalid, respond with a 400 status and an error message
		return res.status(400).send("Invalid due date format.");
	}

	// Filter tasks by 'status' if the parameter is provided and valid
	if (status) {
		filteredTasks = filteredTasks.filter((task) => task.status === status);
	}

	// Filter tasks by 'dueDate' if the parameter is provided and valid
	if (dueDate) {
		filteredTasks = filteredTasks.filter((task) => task.dueDate === dueDate);
	}

	// Return the filtered results as JSON
	res.json(filteredTasks);
});

// GET: Retrieve all users
// This route returns a JSON array of all users in the system.
app.get("/users", (req, res) => {
	// Respond with the users array as JSON
	res.json(users);
});

// GET: Retrieve all categories
// This route returns a JSON array of all task categories in the system.
app.get("/categories", (req, res) => {
	// Respond with the categories array as JSON
	res.json(categories);
});

// Route to render the Add Task form
app.get("/tasks/add", (req, res) => {
	res.render("add-task"); // Renders the add-task.ejs file
});

// GET: Fetch details of a specific task by ID
app.get("/tasks/:id", (req, res) => {
	const task = tasks.find((t) => t.id === req.params.id); // Find task by ID
	if (task) {
		res.render("task-detail", { task }); // Render a new EJS template for task details
	} else {
		res.status(404).json({ error: `Task with ID ${req.params.id} not found.` });
		// Respond with 404 if task doesn't exist
	}
});

// Route: Render the Edit Task page
// This route displays the form for editing a specific task
app.get("/tasks/:id/edit", (req, res) => {
	// Find the task in the tasks array by matching the provided ID
	const task = tasks.find((task) => task.id === req.params.id);

	if (task) {
		// If the task is found, render the 'edit-task.ejs' template and pass the task data
		res.render("edit-task", { task });
	} else {
		// If no task is found, respond with a 404 status and an error message
		res.status(404).send("Task not found");
	}
});

// POST: Create a new task
// Validates input using validateTask middleware before processing
app.post("/tasks", validateTask, (req, res) => {
	// Extract task details from the request body
	const { title, description, status, dueDate } = req.body;

	// Create a new task with a unique UUID and the provided details
	const newTask = { id: uuidv4(), title, description, status, dueDate };

	// Add the new task to the tasks array
	tasks.push(newTask);

	// Save the updated tasks array to the file for persistence
	saveData("tasks.js", tasks);

	// // Redirect the user to the homepage after successfully adding the task
	// res.redirect("/");

	// Respond with a success message and the new task
	res.status(201).json({ message: "Task created successfully", task: newTask });
});

// PUT: Update an existing task by ID
// This route updates a specific task in the tasks array based on the provided ID
app.put("/tasks/:id", validateTask, (req, res) => {
	const { id } = req.params; // Extract the task ID from the route parameter
	const { title, description, status, dueDate } = req.body; // Extract the updated task fields from the request body

	// Find the task with the matching ID in the tasks array
	const task = tasks.find((task) => task.id === id);

	if (task) {
		// Update the task fields only if new values are provided, otherwise keep the existing values
		task.title = title || task.title; // Update title if provided, else keep the current title
		task.description = description || task.description; // Update description if provided
		task.status = status || task.status; // Update status if provided
		task.dueDate = dueDate || task.dueDate; // Update due date if provided

		// Persist the updated tasks array to the tasks.js file
		// This ensures changes are saved for future use
		saveData("tasks.js", tasks);

		console.log(`[TASK UPDATED] ID: ${id} - Title: ${task.title}`);

		// Respond with the updated task object
		res.json({
			message: "Task updated successfully",
			task,
		});
	} else {
		// If no task with the specified ID is found, respond with a 404 error
		res.status(404).json({
			error: `Task with ID ${id} not found.`,
		});
	}
});

// DELETE: Delete a task by ID
app.delete("/tasks/:id", (req, res) => {
	const { id } = req.params; // Extract task ID from the route parameter

	// Filter the tasks array to exclude the task with the specified ID
	const updatedTasks = tasks.filter((task) => task.id !== id);

	tasks = updatedTasks; // Update the in-memory tasks array

	// Persist the updated tasks array to the tasks.js file
	saveData("tasks.js", updatedTasks);

	// Respond with a success message after deletion
	res.json({ message: "Task deleted successfully" });
});

// Handle undefined routes with a 404 error
app.use((req, res) => {
	res.status(404).send("Page Not Found");
});

// Handle server errors
// Logs the error stack and responds with a 500 status code
app.use((err, req, res, next) => {
	console.error(err.stack); // Log the error stack for debugging
	res.status(500).send("Something went wrong! Please try again later.");
});

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Start Server
app.listen(PORT, () =>
	console.log(`Server running on http://localhost:${PORT}`)
);
