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

function saveData(filePath, data) {
	fs.writeFileSync(
		path.join(__dirname, "data", filePath),
		`module.exports = ${JSON.stringify(data, null, 4)};`
	);
}

// Middleware: Parse request bodies and serve static files
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Route to render the Add Task form
app.get("/tasks/add", (req, res) => {
	console.log("GET /tasks/add called");
	res.render("add-task");
});

// GET: Retrieve all tasks
app.get("/tasks", (req, res) => {
	console.log("GET /tasks called");
	res.json(tasks);
});

// GET: Fetch details of a specific task by ID
app.get("/tasks/:id", (req, res) => {
	console.log("GET /tasks/:id called with ID:", req.params.id);
	const task = tasks.find((t) => t.id == req.params.id);
	if (task) {
		console.log("Task found:", task);
		res.json(task);
	} else {
		console.log(`Task with ID ${req.params.id} not found.`);
		res.status(404).json({ error: `Task with ID ${req.params.id} not found.` });
	}
});

// POST: Create a new task
app.post("/tasks", (req, res) => {
	console.log("POST /tasks called");
	const { title, description, status, dueDate } = req.body;

	if (!title || !dueDate) {
		console.log("Validation failed: Missing required fields");
		return res.status(400).send("Title and Due Date are required.");
	}

	const newTask = {
		id: uuidv4(),
		title,
		description,
		status: status || "Pending",
		dueDate,
	};
	tasks.push(newTask);
	saveData("tasks.js", tasks);

	console.log("Task created:", newTask);
	res.status(201).json({ message: "Task created successfully", task: newTask });
});

// DELETE: Delete a task by ID
app.delete("/tasks/:id", (req, res) => {
	console.log("DELETE /tasks/:id called with ID:", req.params.id); // Log route call

	const { id } = req.params; // Extract task ID from request parameters

	// Filter out the task with the given ID
	const updatedTasks = tasks.filter((task) => task.id != id);

	if (tasks.length > updatedTasks.length) {
		tasks = updatedTasks; // Update the in-memory tasks array
		saveData("tasks.js", tasks); // Save the updated tasks array to tasks.js
		console.log(`Task with ID ${id} deleted.`); // Log success
		res.json({ message: "Task deleted successfully" }); // Respond with success
	} else {
		console.log(`Task with ID ${id} not found.`); // Log failure
		res.status(404).json({ error: `Task with ID ${id} not found.` }); // Respond with error
	}
});

// Handle undefined routes with a 404 error
app.use((req, res) => {
	res.status(404).send("Page Not Found");
});

// Start Server
app.listen(PORT, () =>
	console.log(`Server running on http://localhost:${PORT}`)
);
