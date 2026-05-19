const STORAGE_KEY = "mission.todo.localStorage.items";

const todoForm = document.querySelector("#todoForm");
const todoInput = document.querySelector("#todoInput");
const todoList = document.querySelector("#todoList");
const todoCount = document.querySelector("#todoCount");
const todayLabel = document.querySelector("#todayLabel");
const clearCompletedButton = document.querySelector("#clearCompletedButton");
const filterButtons = document.querySelectorAll(".filter-button");

let todos = loadTodos();
let currentFilter = "all";

todayLabel.textContent = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "full",
}).format(new Date());

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = todoInput.value.trim();
  if (!title) return;

  todos = [
    {
      id: createId(),
      title,
      completed: false,
      createdAt: Date.now(),
    },
    ...todos,
  ];

  todoInput.value = "";
  saveAndRender();
});

todoList.addEventListener("click", (event) => {
  const item = event.target.closest("[data-id]");
  if (!item) return;

  const id = item.dataset.id;

  if (event.target.matches("[data-action='toggle']")) {
    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );
    saveAndRender();
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const action = actionButton.dataset.action;

  if (action === "delete") {
    todos = todos.filter((todo) => todo.id !== id);
    saveAndRender();
  }

  if (action === "edit") {
    startEditing(item, id);
  }
});

clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  saveAndRender();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

function loadTodos() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(savedTodos) ? savedTodos : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function saveAndRender() {
  saveTodos();
  render();
}

function createId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getFilteredTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function render() {
  const visibleTodos = getFilteredTodos();
  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  todoList.innerHTML = "";

  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === currentFilter);
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.filter === currentFilter),
    );
  });

  todoCount.textContent = `남은 할 일 ${activeCount}개`;
  clearCompletedButton.disabled = completedCount === 0;

  if (visibleTodos.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-state";
    emptyMessage.textContent = getEmptyMessage();
    todoList.append(emptyMessage);
    return;
  }

  const fragment = document.createDocumentFragment();

  visibleTodos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = `todo-item${todo.completed ? " is-completed" : ""}`;
    item.dataset.id = todo.id;

    item.innerHTML = `
      <input
        class="todo-check"
        type="checkbox"
        data-action="toggle"
        aria-label="완료 상태 변경"
        ${todo.completed ? "checked" : ""}
      />
      <span class="todo-title"></span>
      <div class="todo-actions">
        <button class="icon-button" type="button" data-action="edit" aria-label="수정">✎</button>
        <button class="icon-button danger" type="button" data-action="delete" aria-label="삭제">×</button>
      </div>
    `;

    item.querySelector(".todo-title").textContent = todo.title;
    fragment.append(item);
  });

  todoList.append(fragment);
}

function getEmptyMessage() {
  if (currentFilter === "active") {
    return "진행중인 할 일이 없습니다.";
  }

  if (currentFilter === "completed") {
    return "완료한 할 일이 없습니다.";
  }

  return "아직 등록된 할 일이 없습니다.";
}

function startEditing(item, id) {
  const todo = todos.find((candidate) => candidate.id === id);
  if (!todo) return;

  const titleElement = item.querySelector(".todo-title");
  const editButton = item.querySelector("[data-action='edit']");
  const input = document.createElement("input");
  let isCancelled = false;

  input.className = "edit-input";
  input.type = "text";
  input.maxLength = 80;
  input.value = todo.title;
  input.setAttribute("aria-label", "할 일 수정");

  titleElement.replaceWith(input);
  editButton.disabled = true;
  input.focus();
  input.select();

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      input.blur();
    }

    if (event.key === "Escape") {
      isCancelled = true;
      render();
    }
  });

  input.addEventListener("blur", () => {
    if (isCancelled) return;

    const nextTitle = input.value.trim();

    if (!nextTitle) {
      render();
      return;
    }

    todos = todos.map((candidate) =>
      candidate.id === id ? { ...candidate, title: nextTitle } : candidate,
    );
    saveAndRender();
  });
}

render();
