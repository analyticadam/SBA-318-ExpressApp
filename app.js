const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware: Parse request bodies and serve static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

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

// POST: Add a new task
app.post("/tasks", (req, res) => {
	const { title, description, status, dueDate } = req.body;
	const newTask = { id: tasks.length + 1, title, description, status, dueDate };
	tasks.push(newTask);
	res.redirect("/");
});

// PUT: Update an existing task
app.put("/tasks/:id", (req, res) => {
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

// Error Handling Middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send("Something went wrong!");
});

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Start Server
app.listen(PORT, () =>
	console.log(`Server running on http://localhost:${PORT}`)
);
