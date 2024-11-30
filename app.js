const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware: Parse request bodies and serve static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Custom middleware: Validation for task creation and update
function validateTask(req, res, next) {
	const { title, dueDate } = req.body; // Extract required fields
	if (!title || !dueDate) {
		return res.status(400).send("Title and Due Date are required.");
	}
	next(); // Proceed to the next middleware or route
}

// Customer middleware: Logger
app.use((req, res, next) => {
	const now = new Date();
	console.log(`[${now.toISOString()}] ${req.method} request to ${req.url}`);
	next(); // Pass control to the next middleware/route
});
// Custom Middleware: Logger to log request details
app.use((req, res, next) => {
	console.log(`${req.method} request to ${req.url}`);
	next();
});

// In-memory storage for tasks
let tasks = [
	{
		id: 1,
		title: "Sample Task",
		description: "This is a sample task.",
		status: "Pending",
		dueDate: "2024-12-01",
	},
];

// Home route
app.get("/", (req, res) => {
	res.render("index", { tasks }); // Render tasks on homepage
});

// API Routes
// GET: Retrieve all tasks or filter by status
app.get("/tasks", (req, res) => {
	const { status } = req.query;
	const filteredTasks = status
		? tasks.filter((task) => task.status === status)
		: tasks;
	res.json(filteredTasks);
});

// Route to render the Add Task form
app.get("/tasks/add", (req, res) => {
	res.render("add-task"); // Renders the add-task.ejs file
});

// POST route for creating a new task
app.post("/tasks", validateTask, (req, res) => {
	const { title, description, status, dueDate } = req.body;
	const newTask = { id: tasks.length + 1, title, description, status, dueDate };
	tasks.push(newTask);
	res.redirect("/");
});

// PUT route for updating an existing task
app.put("/tasks/:id", validateTask, (req, res) => {
	const { id } = req.params;
	const { title, description, status, dueDate } = req.body;
	const task = tasks.find((task) => task.id === parseInt(id));
	if (task) {
		task.title = title || task.title;
		task.description = description || task.description;
		task.status = status || task.status;
		task.dueDate = dueDate || task.dueDate;
		res.json(task);
	} else {
		res.status(404).send("Task not found");
	}
});

// DELETE: Delete a task
app.delete("/tasks/:id", (req, res) => {
	const { id } = req.params;
	tasks = tasks.filter((task) => task.id !== parseInt(id));
	res.json({ message: "Task deleted" });
});

// Error-handling middleware
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
