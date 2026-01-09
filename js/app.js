// Selectores del DOM
const todoInput = document.getElementById('todo-input');
const todoForm = document.getElementById('todo-form');
const todoList = document.getElementById('todo-list');
const errorMsg = document.getElementById('error-msg');
const filterBtns = document.querySelectorAll('.filter-btn');
const emptyState = document.getElementById('empty-state');
const themeToggle = document.getElementById('theme-toggle');
const helpBtn = document.getElementById('help-btn');

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
let deleteCallback = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar tareas del localStorage al iniciar
    if (localStorage.getItem('todos')) {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    // Cargar Tema Oscuro si estaba guardado
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Crear modal de confirmación
    createCustomModal();
    
    // Crear modal de ayuda
    createHelpModal();

    renderTodos();
    updateStats();
    updateFilterCounts();
});

todoForm.addEventListener('submit', addTodo);
todoList.addEventListener('click', handleListActions);

// Listener para el Modo Oscuro
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    // Guardar preferencia
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Cambiar icono
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Listener para Drag and Drop (Arrastrar y Soltar)
todoList.addEventListener('dragover', initDragOver);

// Listener para botón de ayuda
if (helpBtn) {
    helpBtn.addEventListener('click', showHelpModal);
}

// Lógica de Filtros
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remover clase active de todos
        filterBtns.forEach(b => b.classList.remove('active'));
        // Agregar active al clickeado (buscando el botón padre por si se clickea el icono)
        const btnClicked = e.target.closest('.filter-btn');
        btnClicked.classList.add('active');
        // Actualizar filtro actual
        currentFilter = btnClicked.dataset.filter;
        // Renderizar según filtro
        renderTodos();
    });
});

// --- FUNCIONES ---

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
        showCustomConfirm('¿Eliminar tarea?', '¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.', () => {
            // Animación antes de borrar
            todoItem.style.transform = 'translateX(100px)';
            todoItem.style.opacity = '0';
            setTimeout(() => {
                todos = todos.filter(todo => todo.id !== todoId);
                saveLocal();
                renderTodos();
                updateStats();
                updateFilterCounts();
            }, 300);
        });
        return;
    }

    // Acción: Completar
    if (item.classList.contains('check-btn') || item.closest('.check-btn')) {
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
        return;
    }

    // Acción: Editar (doble clic en el contenido)
    if (item.classList.contains('todo-content')) {
        const todo = todos.find(t => t.id === todoId);
        if (todo && !todo.completed) {
            enableEdit(todoItem, todo);
        }
    }
}

// Función para Editar Tarea (Doble Click)
function enableEdit(todoItem, todo) {
    const span = todoItem.querySelector('.todo-content');
    const originalText = todo.text;

    // Crear input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalText;
    input.classList.add('edit-input');

    // Reemplazar span por input
    todoItem.replaceChild(input, span);
    input.focus();
    input.select();

    // Guardar cambios
    const saveEdit = () => {
        const newText = input.value.trim();
        if (newText && newText !== originalText && newText.length <= 100) {
            todos = todos.map(t => t.id === todo.id ? {...t, text: newText} : t);
            saveLocal();
            updateStats();
        }
        renderTodos(); // Volver a renderizar restaura el span
    };

    // Eventos para guardar o cancelar
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveEdit();
        if (e.key === 'Escape') renderTodos(); // Cancelar edición
    });
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
        } else {
             emptyState.innerHTML = `
                <i class="fas fa-clipboard"></i>
                <h3>¡No hay tareas!</h3>
                <p>Agrega tu primera tarea usando el formulario superior.</p>
            `;
        }
    } else {
        emptyState.style.display = 'none';
    }

    // Generar HTML
    filteredTodos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.classList.add('todo-item');
        li.setAttribute('data-id', todo.id);
        
        // Hacer arrastrable
        li.setAttribute('draggable', 'true');
        
        if (todo.completed) {
            li.classList.add('completed');
        }

        li.innerHTML = `
            <span class="task-number">#${index + 1}</span>
            <button class="check-btn" aria-label="${todo.completed ? 'Marcar como pendiente' : 'Marcar como completada'}">
                <i class="fas ${todo.completed ? 'fa-check' : ''}"></i>
            </button>
            <span class="todo-content" title="Doble clic para editar">${escapeHtml(todo.text)}</span>
            <button class="delete-btn" aria-label="Eliminar tarea">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        // Evento para doble clic (Editar)
        const contentSpan = li.querySelector('.todo-content');
        contentSpan.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if (!todo.completed) {
                enableEdit(li, todo);
            }
        });

        // Eventos Drag & Drop individuales
        li.addEventListener('dragstart', () => li.classList.add('dragging'));
        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
            updateOrderFromDOM(); // Guardar nuevo orden
        });

        todoList.appendChild(li);
    });
}

// Lógica del Drag & Drop (Algoritmo de ordenamiento)
function initDragOver(e) {
    e.preventDefault();
    const draggingItem = document.querySelector('.dragging');
    const siblings = [...todoList.querySelectorAll('.todo-item:not(.dragging)')];
    
    // Encontrar el elemento sobre el que estamos
    let nextSibling = siblings.find(sibling => {
        return e.clientY <= sibling.getBoundingClientRect().top + sibling.offsetHeight / 2;
    });

    todoList.insertBefore(draggingItem, nextSibling);
}

// Guardar el orden visual en el array lógico
function updateOrderFromDOM() {
    // Si hay filtros activos, no reordenamos el array principal para evitar bugs
    if (currentFilter !== 'all') return;

    const newOrderIds = [...todoList.querySelectorAll('.todo-item')]
        .map(item => Number(item.dataset.id));
    
    // Reordenar el array 'todos' basado en los IDs del DOM
    todos.sort((a, b) => {
        return newOrderIds.indexOf(a.id) - newOrderIds.indexOf(b.id);
    });
    
    saveLocal();
    renderTodos(); // Re-renderizar para actualizar los números
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

// Funcionalidad de búsqueda con teclado (Escape para limpiar)
todoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        todoInput.value = '';
        showError('');
    }
});

// --- MODAL DE CONFIRMACIÓN PERSONALIZADO ---

function createCustomModal() {
    const modalHTML = `
        <div id="custom-modal" class="custom-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="modal-title" id="modal-title">Confirmar acción</h3>
                </div>
                <div class="modal-body">
                    <p class="modal-text" id="modal-text">¿Estás seguro de realizar esta acción?</p>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn modal-btn-cancel" id="modal-cancel">Cancelar</button>
                    <button class="modal-btn modal-btn-confirm" id="modal-confirm">Confirmar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('custom-modal');
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm');
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideCustomModal();
        }
    });
    
    // Botón cancelar
    cancelBtn.addEventListener('click', hideCustomModal);
    
    // Botón confirmar
    confirmBtn.addEventListener('click', () => {
        if (deleteCallback) {
            deleteCallback();
            deleteCallback = null;
        }
        hideCustomModal();
    });
}

function showCustomConfirm(title, message, callback) {
    const modal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    
    modalTitle.textContent = title;
    modalText.textContent = message;
    deleteCallback = callback;
    
    modal.classList.add('show');
}

function hideCustomModal() {
    const modal = document.getElementById('custom-modal');
    modal.classList.remove('show');
    deleteCallback = null;
}

// --- MODAL DE AYUDA ---

function createHelpModal() {
    const helpModalHTML = `
        <div id="help-modal" class="custom-modal">
            <div class="modal-content help-modal-content">
                <div class="modal-header">
                    <div class="modal-icon" style="background: rgba(79, 70, 229, 0.1); color: var(--primary-color);">
                        <i class="fas fa-question-circle"></i>
                    </div>
                    <h3 class="modal-title">¿Cómo usar la aplicación?</h3>
                </div>
                <div class="modal-body">
                    <div class="help-section">
                        <h4><i class="fas fa-plus-circle"></i> Agregar Tareas</h4>
                        <ul class="help-list">
                            <li>Escribe tu tarea en el campo de texto superior</li>
                            <li>Presiona <strong>Enter</strong> o haz clic en <strong>"Agregar"</strong></li>
                            <li>Límite de 100 caracteres por tarea</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4><i class="fas fa-edit"></i> Editar Tareas</h4>
                        <ul class="help-list">
                            <li>Haz <strong>doble clic</strong> sobre el texto de cualquier tarea pendiente</li>
                            <li>Modifica el texto y presiona <strong>Enter</strong> para guardar</li>
                            <li>Presiona <strong>Escape</strong> para cancelar la edición</li>
                            <li>No puedes editar tareas completadas</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4><i class="fas fa-check-circle"></i> Completar Tareas</h4>
                        <ul class="help-list">
                            <li>Haz clic en el <strong>círculo</strong> a la izquierda de la tarea</li>
                            <li>La tarea se marcará con una línea tachada</li>
                            <li>Vuelve a hacer clic para desmarcarla</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4><i class="fas fa-arrows-alt"></i> Reordenar Tareas</h4>
                        <ul class="help-list">
                            <li><strong>Arrastra y suelta</strong> las tareas para cambiar su orden</li>
                            <li>Los números se actualizarán automáticamente</li>
                            <li>Solo funciona en la vista <strong>"Todas"</strong></li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4><i class="fas fa-filter"></i> Filtrar Tareas</h4>
                        <ul class="help-list">
                            <li><strong>Todas:</strong> Muestra todas tus tareas</li>
                            <li><strong>Pendientes:</strong> Solo tareas sin completar</li>
                            <li><strong>Completadas:</strong> Solo tareas finalizadas</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4><i class="fas fa-moon"></i> Modo Oscuro</h4>
                        <ul class="help-list">
                            <li>Haz clic en el botón de <strong>luna/sol</strong> en el encabezado</li>
                            <li>Tu preferencia se guardará automáticamente</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4><i class="fas fa-trash"></i> Eliminar Tareas</h4>
                        <ul class="help-list">
                            <li>Haz clic en el <strong>icono de basura</strong> (🗑️)</li>
                            <li>Confirma la eliminación en el cuadro de diálogo</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn modal-btn-primary" id="help-close">¡Entendido!</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', helpModalHTML);
    
    const helpModal = document.getElementById('help-modal');
    const closeBtn = document.getElementById('help-close');
    
    // Cerrar modal al hacer clic fuera
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            hideHelpModal();
        }
    });
    
    // Botón cerrar
    closeBtn.addEventListener('click', hideHelpModal);
}

function showHelpModal() {
    const helpModal = document.getElementById('help-modal');
    helpModal.classList.add('show');
}

function hideHelpModal() {
    const helpModal = document.getElementById('help-modal');
    helpModal.classList.remove('show');
}