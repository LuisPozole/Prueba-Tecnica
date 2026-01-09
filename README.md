# 📝 Lista de Tareas (Todo List) - Prueba Técnica

Aplicación web interactiva para la gestión de tareas, desarrollada con **JavaScript Vanilla (ES6+)**, **HTML5** y **CSS3**. Este proyecto fue creado como parte de una prueba técnica para demostrar competencias en desarrollo frontend, manipulación del DOM y diseño de interfaces sin el uso de frameworks externos.

## 🚀 Demo en Vivo

Puedes probar la aplicación directamente aquí:
> **https://luispozole.github.io/Prueba-Tecnica/**

## ✨ Funcionalidades Principales

Esta aplicación va más allá de un simple CRUD, implementando características avanzadas de UX/UI:

### 🔹 Gestión de Tareas (CRUD)
* **Crear:** Agrega nuevas tareas con validación de entrada (evita vacíos y textos excesivos).
* **Leer:** Visualización clara de tareas con numeración dinámica.
* **Actualizar (Edición):** Haz **doble clic** sobre cualquier tarea pendiente para editar su texto en tiempo real.
* **Borrar:** Eliminación de tareas con **modal de confirmación personalizado** (sin usar `alert` nativos).
* **Marcar:** Alternar entre estado pendiente y completado.

### 🔹 Características
* **🌗 Modo Oscuro:** Interruptor de tema persistente (guarda tu preferencia en el navegador).
* **✋ Drag & Drop:** Arrastra y suelta las tareas para reordenarlas a tu gusto.
* **📊 Estadísticas en Tiempo Real:** Barra de progreso dinámica y contadores de tareas pendientes/completadas.
* **🔍 Filtros:** Visualiza tareas según su estado (Todas / Pendientes / Completadas).
* **💾 Persistencia de Datos:** Uso de `localStorage` para que no pierdas tus tareas al recargar la página.
* **ℹ️ Ayuda Interactiva:** Modal de instrucciones integrado.

## 🛠️ Tecnologías Utilizadas

* **HTML5:** Estructura semántica (`header`, `main`, `section`, `footer`).
* **CSS3:**
    * Diseño Responsive (Mobile First).
    * Variables CSS (Custom Properties) para manejo de temas.
    * Flexbox y Grid Layout.
    * Animaciones y transiciones suaves (`keyframes`).
* **JavaScript (Vanilla):**
    * Manipulación avanzada del DOM.
    * Delegación de eventos.
    * API de `LocalStorage`.
    * Lógica de ordenamiento y filtrado de Arrays.

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura limpia y separada por responsabilidades:

```text
todo-list/
│
├── index.html          # Estructura semántica
├── css/
│   └── styles.css      # Estilos, variables y media queries
├── js/
│   └── app.js          # Lógica de negocio y manipulación del DOM
└── README.md           # Documentación del proyecto
```
## 🔧 Instalación y Uso Local
Para ejecutar este proyecto en tu computadora, no necesitas instalar dependencias de Node.js.

Clonar el repositorio:

Bash

git clone [https://github.com/tu-usuario/todo-list.git](https://github.com/tu-usuario/todo-list.git)
Navegar a la carpeta:

Bash

cd todo-list
Ejecutar:

Simplemente abre el archivo index.html en tu navegador web favorito (Chrome, Firefox, Edge).

Opcional: Si usas VS Code, puedes usar la extensión "Live Server".

## 👤 Autor
T.S.U Luis Enrique De Santiago Colin
