let taskCounter = 0;
let categories = []; // Store categories

// Event listener to add a task
document.getElementById('addTaskBtn').addEventListener('click', function() {
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate').value;
    const taskTime = document.getElementById('taskTime').value; // Get task time
    const task = taskInput.value;
    const taskCategory = document.getElementById('taskCategory').value;

    if (task && taskDate && taskCategory && taskTime) {
        taskCounter++;
        addTask(taskCounter, task, taskDate, taskTime, false, taskCategory); // Include task time
        taskInput.value = ''; 
        saveTasks(); 
    }
});

// Event listener to add a category
document.getElementById('addCategoryBtn').addEventListener('click', function() {
    const newCategoryInput = document.getElementById('newCategoryInput');
    const newCategory = newCategoryInput.value.trim();

    if (newCategory && !categories.includes(newCategory)) {
        categories.push(newCategory);
        addCategoryToList(newCategory);
        updateCategoryDropdown();
        newCategoryInput.value = ''; // Clear the input field
        saveCategories(); // Save to localStorage
    }
});

// Function to add category to the sidebar list
function addCategoryToList(category) {
    const categoryList = document.getElementById('categoryList');
    const li = document.createElement('li');
    li.textContent = category;

    // Add delete button for category
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', function() {
        categoryList.removeChild(li); // Remove from the list
        categories = categories.filter(cat => cat !== category); // Update categories
        updateCategoryDropdown();
        saveCategories(); // Save updated categories
    });

    li.appendChild(deleteBtn);
    categoryList.appendChild(li);
}

// Function to update the task category dropdown
function updateCategoryDropdown() {
    const taskCategory = document.getElementById('taskCategory');
    taskCategory.innerHTML = '<option value="" disabled selected>Select Category</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        taskCategory.appendChild(option);
    });
}

// Search task function
document.getElementById('searchBar').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const tasks = document.querySelectorAll('#taskList li');
    tasks.forEach(task => {
        const taskText = task.textContent.toLowerCase();
        if (taskText.includes(searchTerm)) {
            task.style.display = ''; // Show the task if it matches
        } else {
            task.style.display = 'none'; // Hide the task if it doesn't match
        }
    });
});

// Function to add a task to the list
function addTask(number, task, taskDate, taskTime, isCompleted, category) {
    const taskList = document.getElementById('taskList');

    const li = document.createElement('li');
    li.textContent = `${number}. ${taskDate} ${taskTime}: ${task} [${category}]`;
    li.dataset.number = number;
    li.dataset.date = taskDate;
    li.dataset.time = taskTime; // Store the task time
    li.dataset.task = task;
    li.dataset.completed = isCompleted;

    // Create checkbox for completion status
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isCompleted;

    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
            li.classList.add('completed');
            li.dataset.completed = true;
        } else {
            li.classList.remove('completed');
            li.dataset.completed = false;
        }
        saveTasks();
    });

    // Create Edit Button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('edit-btn');

    editBtn.addEventListener('click', function() {
        const newTask = prompt('Edit your task:', li.dataset.task);
        const newDate = prompt('Edit task date (YYYY-MM-DD):', li.dataset.date);
        const newTime = prompt('Edit task time (HH:MM):', li.dataset.time); // Prompt for new time
        const newCategory = prompt('Edit category:', category);
        if (newTask && newDate && newTime && newCategory) {
            li.dataset.task = newTask;
            li.dataset.date = newDate;
            li.dataset.time = newTime;
            li.textContent = `${li.dataset.number}. ${newDate} ${newTime}: ${newTask} [${newCategory}]`;
            li.prepend(checkbox);
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
            saveTasks();
        }
    });

    // Create Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');

    deleteBtn.addEventListener('click', function() {
        taskList.removeChild(li);
        saveTasks();
        updateTaskNumbers(); // Update task numbering after deletion
    });

    li.prepend(checkbox);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
}

// Function to update task numbering
function updateTaskNumbers() {
    const tasks = document.querySelectorAll('#taskList li');
    taskCounter = 0; // Reset counter
    tasks.forEach((task, index) => {
        taskCounter++; // Increment counter for each task
        task.dataset.number = taskCounter; // Update the data attribute
        task.textContent = `${taskCounter}. ${task.dataset.date} ${task.dataset.time}: ${task.dataset.task} [${task.textContent.split('[')[1].split(']')[0]}]`;
    });
    saveTasks();
}

// Function to save tasks to localStorage
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('#taskList li').forEach(li => {
        tasks.push({
            number: li.dataset.number,
            task: li.dataset.task,
            date: li.dataset.date,
            time: li.dataset.time, // Include the time in the saved data
            completed: li.dataset.completed === 'true',
            category: li.textContent.split('[')[1].split(']')[0] // Extract category from the text
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to load tasks from localStorage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        addTask(task.number, task.task, task.date, task.time, task.completed, task.category); // Load tasks with time
        // Update the task counter to the highest number so new tasks are added sequentially
        if (task.number > taskCounter) {
            taskCounter = task.number;
        }
    });
}

// Function to save categories to localStorage
function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Function to load categories from localStorage
function loadCategories() {
    const savedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    savedCategories.forEach(category => {
        categories.push(category);
        addCategoryToList(category);
    });
    updateCategoryDropdown();
}

// Function to check alerts for tasks due today
function checkAlerts() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const now = new Date().toISOString().slice(0, 10);
    tasks.forEach(task => {
        if (task.date === now && !task.completed) {
            playAlert();
        }
    });
}

// Function to play an alert sound
function playAlert() {
    const alertSound = document.getElementById('alertSound');
    alertSound.play();
}

// Load tasks and categories on page load
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    loadCategories();
    checkAlerts();
    setInterval(checkAlerts, 60000); // Check alerts every minute
});
