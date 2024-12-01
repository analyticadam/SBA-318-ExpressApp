const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

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

	// Redirect the user to the homepage after successfully adding the task
	res.redirect("/");
});

// PUT: Update an existing task by ID
// Validates input using validateTask middleware before processing
app.put("/tasks/:id", validateTask, (req, res) => {
	const { id } = req.params; // Extract task ID from the route parameter
	const { title, description, status, dueDate } = req.body; // Extract updated details from the request body

	// Find the task with the matching ID
	const task = tasks.find((task) => task.id === id);

	if (task) {
		// Update the task fields if new values are provided, otherwise keep the old values
		task.title = title || task.title;
		task.description = description || task.description;
		task.status = status || task.status;
		task.dueDate = dueDate || task.dueDate;

		// Save the updated tasks array to the file for persistence
		saveData("tasks.js", tasks);

		// Respond with the updated task details
		res.json(task);
	} else {
		// If no task is found with the provided ID, respond with a 404 error
		res.status(404).send("Task not found");
	}
});

// DELETE: Delete a task by ID
app.delete("/tasks/:id", (req, res) => {
	const { id } = req.params; // Extract task ID from the route parameter

	// Filter the tasks array to exclude the task with the specified ID
	// This creates a new array with all tasks except the one to be deleted
	const updatedTasks = tasks.filter((task) => task.id !== id);

	// Persist the updated tasks array to the tasks.js file
	// This ensures the deletion is saved for future use
	saveData("tasks.js", updatedTasks);

	// Respond with a success message after deletion
	res.json({ message: "Task deleted successfully" });
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
