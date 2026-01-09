// Selectores del DOM
const todoInput = document.getElementById('todo-input');
const todoForm = document.getElementById('todo-form');
const todoList = document.getElementById('todo-list');
const errorMsg = document.getElementById('error-msg');
const filterBtns = document.querySelectorAll('.filter-btn');
const emptyState = document.getElementById('empty-state');

// Elementos de estadísticas
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const statsPending = document.getElementById('stats-pending');
const statsCompleted = document.getElementById('stats-completed');
const statsTotal = document.getElementById('stats-total');
const allCount = document.getElementById('all-count');
const pendingCount = document.getElementById('pending-count');
const completedCount = document.getElementById('completed-count');

// Estado de la aplicación
let todos = [];
let currentFilter = 'all';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar tareas del localStorage al iniciar
    if (localStorage.getItem('todos')) {
        todos = JSON.parse(localStorage.getItem('todos'));
    }
    renderTodos();
    updateStats();
    updateFilterCounts();
});

todoForm.addEventListener('submit', addTodo);
todoList.addEventListener('click', handleListActions);

// Lógica de Filtros
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remover clase active de todos
        filterBtns.forEach(b => b.classList.remove('active'));
        // Agregar active al clickeado
        e.target.classList.add('active');
        // Actualizar filtro actual
        currentFilter = e.target.dataset.filter;
        // Renderizar según filtro
        renderTodos();
    });
});

// Funciones

function addTodo(e) {
    e.preventDefault();

    const text = todoInput.value.trim();

    // Validación
    if (text === '') {
        showError('Por favor, escribe una tarea.');
        todoInput.focus();
        return;
    }

    if (text.length > 100) {
        showError('La tarea no puede exceder los 100 caracteres.');
        return;
    }

    // Crear objeto tarea
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.unshift(newTodo); // Agregar al inicio
    saveLocal();
    renderTodos();
    updateStats();
    updateFilterCounts();
    
    // Limpiar input y mostrar mensaje de éxito
    todoInput.value = '';
    showError('');
    todoInput.focus();
}

function handleListActions(e) {
    const item = e.target;
    const todoItem = item.closest('.todo-item');
    
    if (!todoItem) return;
    
    const todoId = Number(todoItem.dataset.id);

    // Acción: Eliminar
    if (item.classList.contains('delete-btn') || item.closest('.delete-btn')) {
        const confirmDelete = confirm('¿Estás seguro de eliminar esta tarea?');
        if (confirmDelete) {
            todos = todos.filter(todo => todo.id !== todoId);
            saveLocal();
            renderTodos();
            updateStats();
            updateFilterCounts();
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
        updateStats();
        updateFilterCounts();
    }
}

function renderTodos() {
    // Limpiar lista actual
    todoList.innerHTML = '';

    // Filtrar tareas según selección
    let filteredTodos = todos;
    if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    } else if (currentFilter === 'pending') {
        filteredTodos = todos.filter(todo => !todo.completed);
    }

    // Mostrar/ocultar empty state
    if (filteredTodos.length === 0) {
        emptyState.style.display = 'block';
        if (currentFilter === 'completed' && todos.length > 0) {
            emptyState.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <h3>¡No hay tareas completadas!</h3>
                <p>Completa algunas tareas para verlas aquí.</p>
            `;
        } else if (currentFilter === 'pending' && todos.length > 0) {
            emptyState.innerHTML = `
                <i class="fas fa-trophy"></i>
                <h3>¡Todas las tareas completadas!</h3>
                <p>¡Felicidades! Has completado todas tus tareas.</p>
            `;
        }
    } else {
        emptyState.style.display = 'none';
    }

    // Generar HTML
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.classList.add('todo-item');
        li.setAttribute('data-id', todo.id);
        
        if (todo.completed) {
            li.classList.add('completed');
        }

        li.innerHTML = `
            <button class="check-btn" aria-label="${todo.completed ? 'Marcar como pendiente' : 'Marcar como completada'}">
                <i class="fas ${todo.completed ? 'fa-check' : ''}"></i>
            </button>
            <span class="todo-content">${escapeHtml(todo.text)}</span>
            <div class="task-meta">
                <small class="task-time">${formatDate(todo.createdAt)}</small>
            </div>
            <button class="delete-btn" aria-label="Eliminar tarea">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        todoList.appendChild(li);
    });
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Actualizar estadísticas
    statsTotal.textContent = total;
    statsCompleted.textContent = completed;
    statsPending.textContent = pending;
    
    // Actualizar barra de progreso
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}% completado`;
    
    // Color dinámico de la barra
    if (percentage === 100) {
        progressFill.style.background = 'linear-gradient(90deg, #10b981 0%, #34d399 100%)';
    } else if (percentage >= 50) {
        progressFill.style.background = 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)';
    } else {
        progressFill.style.background = 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)';
    }
}

function updateFilterCounts() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;

    allCount.textContent = total;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;
}

function saveLocal() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function showError(message) {
    errorMsg.textContent = message;
    if (message) {
        errorMsg.style.display = 'flex';
    } else {
        errorMsg.style.display = 'none';
    }
}

// Formatear fecha
function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
    });
}

// Seguridad: Evitar inyección HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Agregar funcionalidad de búsqueda con teclado
todoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        todoInput.value = '';
        showError('');
    }
});