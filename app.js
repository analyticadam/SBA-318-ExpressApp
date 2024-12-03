const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override"); // Import method-override

const app = express();
const PORT = 3000;

// Import data
let tasks = require("./data/tasks");
const users = require("./data/users");
const categories = require("./data/categories");

// Helper function to save data to a file
const fs = require("fs");

/**
 * Function to save data to a specified file in the `data` directory.
 *
 * @param {string} filePath - The name of the file to save the data (e.g., "tasks.js").
 * @param {Array|Object} data - The data to be saved (must be serializable to JSON).
 */
function saveData(filePath, data) {
	const fs = require("fs"); // File system module for file operations
	const path = require("path"); // Path module to handle file paths

	try {
		// Construct the full path to the file in the "data" directory
		const fullPath = path.join(__dirname, "data", filePath);

		// Convert the data to a JSON string with indentation for readability
		// Wrap the data in a `module.exports` statement for compatibility with Node.js
		const fileContent = `module.exports = ${JSON.stringify(data, null, 4)};`;

		// Write the JSON string to the file, overwriting its contents
		fs.writeFileSync(fullPath, fileContent);

		// Log a success message for debugging
		console.log(`Data saved successfully to ${filePath}`);
	} catch (error) {
		// Log any errors that occur during the file writing process
		console.error(`Error saving data to ${filePath}:`, error.message);
	}
}

// Middleware: Parse request bodies and serve static files
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method")); // Enable method override for PUT and DELETE

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Home route
app.get("/", (req, res) => {
	console.log("GET / called"); // Log the route call

	// Ensure tasks array is up to date
	res.render("index", { tasks, categories, users }); // Render the main page with the tasks array
});

// Call Users
app.get("/users", (req, res) => {
	console.log("GET /users called");
	res.json(users);
});

// Get Categories
app.get("/categories", (req, res) => {
	console.log("GET /categories called");
	res.json(categories);
});

// Route to render the Add Task form
app.get("/tasks/add", (req, res) => {
	console.log("GET /tasks/add called");
	res.render("add-task", { categories, users }); // Pass categories to EJS
});

// GET: Render All Tasks Page
app.get("/tasks", (req, res) => {
	console.log("GET /tasks called"); // Log the route call
	res.render("tasks", { tasks }); // Render the tasks.ejs template and pass the tasks array
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
	// Destructure the task fields from the request body
	const { title, description, status, dueDate, category, user } = req.body;

	// Validation: Ensure required fields (title and dueDate) are provided
	if (!title || !dueDate) {
		// If validation fails, respond with a 400 status and error message
		return res.status(400).send("Title and Due Date are required.");
	}

	// Create a new task object with the provided data
	const newTask = {
		id: uuidv4(), // Generate a unique ID for the task
		title, // Task title
		description, // Task description (optional)
		status: status || "Pending", // Default to "Pending" if no status is provided
		user: user || null, // Save the user ID or null if not provided
		dueDate, // Due date for the task
		category: category || null, // Category for the task (optional, default to null)
	};

	// Add the new task to the tasks array
	tasks.push(newTask);

	// Save the updated tasks array to the file for persistence
	saveData("tasks.js", tasks);

	// Redirect the user to the homepage after successfully adding the task
	res.redirect("/"); // Redirect to the home page where tasks are displayed
});

// PUT: Update an existing task by ID
app.put("/tasks/:id", (req, res) => {
	const task = tasks.find((t) => t.id === req.params.id);

	if (task) {
		// Update fields
		task.title = req.body.title || task.title;
		task.description = req.body.description || task.description;
		task.status = req.body.status || task.status;
		task.dueDate = req.body.dueDate || task.dueDate;
		task.category = req.body.category || null;
		task.user = req.body.user || task.user;

		// Persist changes
		saveData("tasks.js", tasks);

		res.redirect("/");
	} else {
		res.status(404).send("Task not found.");
	}
});

// Route to render the Edit Task page
app.get("/tasks/:id/edit", (req, res) => {
	console.log("GET /tasks/:id/edit called with ID:", req.params.id); // Log the route call

	// Find the task with the matching ID
	const task = tasks.find((t) => t.id === req.params.id);

	if (task) {
		// Pass the task, categories, and users arrays to the EJS template
		res.render("edit-task", { task, categories, users, error: null });
	} else {
		console.log(`Task with ID ${req.params.id} not found.`); // Log if no task is found
		res.status(404).send("Task not found");
	}
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
		res.redirect("/"); // Redirect to the homepage after deletion
	} else {
		console.log(`Task with ID ${id} not found.`); // Log failure
		res.status(404).send("Task not found");
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
