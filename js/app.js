// Selectores del DOM
const todoInput = document.getElementById('todo-input');
const todoForm = document.getElementById('todo-form');
const todoList = document.getElementById('todo-list');
const errorMsg = document.getElementById('error-msg');
const pendingCount = document.getElementById('pending-count');
const filterBtns = document.querySelectorAll('.filter-btn');

// Estado de la aplicación (Array de objetos)
let todos = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar tareas del localStorage al iniciar
    if (localStorage.getItem('todos')) {
        todos = JSON.parse(localStorage.getItem('todos'));
    }
    renderTodos();
});

todoForm.addEventListener('submit', addTodo);
todoList.addEventListener('click', handleListActions); // Delegación de eventos

// Lógica de Filtros
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remover clase active de todos
        filterBtns.forEach(b => b.classList.remove('active'));
        // Agregar active al clickeado
        e.target.classList.add('active');
        // Renderizar según filtro
        renderTodos(e.target.dataset.filter);
    });
});

// Funciones

function addTodo(e) {
    e.preventDefault(); // Prevenir recarga del formulario

    const text = todoInput.value.trim();

    // Validación: No vacíos
    if (text === '') {
        showError('Por favor, escribe una tarea.');
        return;
    }

    // Crear objeto tarea
    const newTodo = {
        id: Date.now(), // ID único basado en timestamp
        text: text,
        completed: false
    };

    todos.push(newTodo);
    saveLocal();
    renderTodos();
    
    // Limpiar input
    todoInput.value = '';
    showError(''); // Limpiar errores
}

function handleListActions(e) {
    const item = e.target;
    const todoItem = item.closest('.todo-item');
    
    if (!todoItem) return;
    
    const todoId = Number(todoItem.dataset.id);

    // Acción: Eliminar
    if (item.classList.contains('delete-btn') || item.closest('.delete-btn')) {
        // Confirmación antes de eliminar (Extra Plus)
        const confirmDelete = confirm('¿Estás seguro de eliminar esta tarea?');
        if (confirmDelete) {
            todos = todos.filter(todo => todo.id !== todoId);
            saveLocal();
            renderTodos();
        }
    }

    // Acción: Completar
    if (item.classList.contains('check-btn') || item.closest('.check-btn') || item.classList.contains('todo-content')) {
        todos = todos.map(todo => {
            if (todo.id === todoId) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        saveLocal();
        renderTodos();
    }
}

function renderTodos(filter = 'all') {
    // Limpiar lista actual
    todoList.innerHTML = '';

    // Filtrar tareas según selección
    let filteredTodos = todos;
    if (filter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    } else if (filter === 'pending') {
        filteredTodos = todos.filter(todo => !todo.completed);
    }

    // Generar HTML
    filteredTodos.forEach(todo => {
        // Crear elementos
        const li = document.createElement('li');
        li.classList.add('todo-item');
        li.setAttribute('data-id', todo.id);
        
        if (todo.completed) {
            li.classList.add('completed');
        }

        li.innerHTML = `
            <button class="action-btn check-btn" aria-label="Completar">
                <i class="fas ${todo.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
            </button>
            <span class="todo-content">${escapeHtml(todo.text)}</span>
            <button class="action-btn delete-btn" aria-label="Eliminar">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        todoList.appendChild(li);
    });

    updateCount();
}

function updateCount() {
    const count = todos.filter(todo => !todo.completed).length;
    pendingCount.innerText = count;
}

function saveLocal() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function showError(message) {
    errorMsg.innerText = message;
}

// Seguridad: Evitar inyección HTML (XSS básico)
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}