const dateInput = document.getElementById('dateInput');
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const filterBtn = document.getElementById('filterBtn');
const todoList = document.getElementById('todoList');

let todos = [];
let filterStatus = 'all'; // 'all', 'completed', 'pending'

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

document.addEventListener('DOMContentLoaded', () => {
    setTodayDate();
    loadTodos();
    renderTodos();
    setupEventListeners();
});

function setupEventListeners() {
    addBtn.addEventListener('click', addTodo);
    clearBtn.addEventListener('click', clearAllTodos);
    filterBtn.addEventListener('click', openFilterModal);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
}

function addTodo() {
    const text = todoInput.value.trim();
    const date = dateInput.value;

    if (!text) {
        showValidationError('Please enter a todo item!');
        return;
    }

    if (!date) {
        showValidationError('Please select a date!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        date: date,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(todo);
    saveTodos();
    renderTodos();

    todoInput.value = '';
    todoInput.focus();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function clearAllTodos() {
    if (todos.length === 0) {
        showValidationError('No todos to clear!');
        return;
    }
    
    if (confirm('Are you sure you want to delete all todos?')) {
        todos = [];
        saveTodos();
        renderTodos();
    }
}

function openFilterModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('filterModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'filterModal';
        modal.className = 'filter-modal';
        modal.innerHTML = `
            <div class="filter-modal-content">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Filter Todos</h3>
                <div class="space-y-3">
                    <button class="filter-option w-full text-left px-4 py-2 rounded hover:bg-blue-50 transition-all ${filterStatus === 'all' ? 'bg-blue-100 text-blue-600 font-semibold' : 'text-gray-700'}" onclick="setFilter('all')">
                        ✓ All Todos
                    </button>
                    <button class="filter-option w-full text-left px-4 py-2 rounded hover:bg-blue-50 transition-all ${filterStatus === 'pending' ? 'bg-blue-100 text-blue-600 font-semibold' : 'text-gray-700'}" onclick="setFilter('pending')">
                        ⏱ Pending
                    </button>
                    <button class="filter-option w-full text-left px-4 py-2 rounded hover:bg-blue-50 transition-all ${filterStatus === 'completed' ? 'bg-blue-100 text-blue-600 font-semibold' : 'text-gray-700'}" onclick="setFilter('completed')">
                        ✓ Completed
                    </button>
                </div>
                <div class="mt-6 flex gap-2">
                    <button onclick="closeFilterModal()" class="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-semibold transition-all">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeFilterModal();
            }
        });
    }
    modal.classList.add('active');
}

function closeFilterModal() {
    const modal = document.getElementById('filterModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function setFilter(status) {
    filterStatus = status;
    renderTodos();
    closeFilterModal();
}

function renderTodos() {
    let filteredTodos = todos;

    if (filterStatus === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    } else if (filterStatus === 'pending') {
        filteredTodos = todos.filter(todo => !todo.completed);
    }

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<p class="text-center text-gray-500 py-8 text-sm">No todos available</p>';
        return;
    }

    todoList.innerHTML = filteredTodos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <div>
                <div class="todo-text">${escapeHtml(todo.text)}</div>
                <div class="todo-date">${formatDate(todo.date)}</div>
            </div>
            <button class="todo-delete" onclick="deleteTodo(${todo.id})">Delete</button>
        </div>
    `).join('');
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
    const stored = localStorage.getItem('todos');
    todos = stored ? JSON.parse(stored) : [];
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showValidationError(message) {
    const originalPlaceholder = todoInput.placeholder;
    todoInput.classList.add('border-red-500');
    todoInput.placeholder = message;

    setTimeout(() => {
        todoInput.classList.remove('border-red-500');
        todoInput.placeholder = originalPlaceholder;
    }, 2000);
}

