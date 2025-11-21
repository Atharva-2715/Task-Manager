const AUTH_HEADER = `Basic ${btoa('admin:password123')}`;
const API_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: AUTH_HEADER,
};

const state = {
  view: 'tasks',
  currentPage: 1,
  totalPages: 1,
  search: '',
  isSubmitting: false,
};

const taskTableBody = document.querySelector('#taskTable tbody');
const logTableBody = document.querySelector('#logTable tbody');
const paginationInfo = document.querySelector('#paginationInfo');
const prevPageBtn = document.querySelector('#prevPage');
const nextPageBtn = document.querySelector('#nextPage');
const searchInput = document.querySelector('#searchInput');
const clearSearchBtn = document.querySelector('#clearSearchBtn');
const refreshTasksBtn = document.querySelector('#refreshTasksBtn');
const refreshLogsBtn = document.querySelector('#refreshLogsBtn');
const taskSection = document.querySelector('#taskSection');
const logSection = document.querySelector('#logSection');
const navButtons = document.querySelectorAll('.nav-link');

const modal = document.querySelector('#taskModal');
const modalBackdrop = document.querySelector('#modalBackdrop');
const modalTitle = document.querySelector('#modalTitle');
const taskForm = document.querySelector('#taskForm');
const taskIdInput = document.querySelector('#taskId');
const titleInput = document.querySelector('#taskTitle');
const descriptionInput = document.querySelector('#taskDescription');
const formError = document.querySelector('#formError');
const newTaskBtn = document.querySelector('#newTaskBtn');
const closeModalBtn = document.querySelector('#closeModalBtn');
const cancelModalBtn = document.querySelector('#cancelModalBtn');

const showToast = (message, isError = false) => {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
};

const toggleModal = (isOpen) => {
  modal.classList.toggle('hidden', !isOpen);
  modalBackdrop.classList.toggle('hidden', !isOpen);
  if (!isOpen) {
    taskForm.reset();
    taskIdInput.value = '';
    formError.textContent = '';
  }
};

const sanitizeInput = (value = '') => {
  const el = document.createElement('div');
  el.innerHTML = value;
  return el.textContent.trim();
};

const validateTaskPayload = (data) => {
  const sanitized = {
    title: sanitizeInput(data.title),
    description: sanitizeInput(data.description),
  };

  if (!sanitized.title) {
    return { error: 'Title is required.' };
  }
  if (sanitized.title.length > 100) {
    return { error: 'Title must be 100 characters or fewer.' };
  }
  if (!sanitized.description) {
    return { error: 'Description is required.' };
  }
  if (sanitized.description.length > 500) {
    return { error: 'Description must be 500 characters or fewer.' };
  }
  return { data: sanitized };
};

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const setView = (view) => {
  state.view = view;
  navButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  taskSection.classList.toggle('hidden', view !== 'tasks');
  logSection.classList.toggle('hidden', view !== 'logs');
  if (view === 'tasks') {
    fetchTasks();
  } else {
    fetchLogs();
  }
};

const renderTasks = (tasks = []) => {
  taskTableBody.innerHTML = '';
  if (tasks.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'No tasks found.';
    row.appendChild(cell);
    taskTableBody.appendChild(row);
    return;
  }

  tasks.forEach((task) => {
    const row = document.createElement('tr');
    const idCell = document.createElement('td');
    idCell.textContent = task.id;
    idCell.setAttribute('data-label', 'ID');
    const titleCell = document.createElement('td');
    titleCell.textContent = task.title;
    titleCell.setAttribute('data-label', 'Title');
    const descCell = document.createElement('td');
    descCell.textContent = task.description;
    descCell.setAttribute('data-label', 'Description');
    const createdCell = document.createElement('td');
    createdCell.textContent = formatDate(task.createdAt);
    createdCell.setAttribute('data-label', 'Created At');
    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions';
    actionsCell.setAttribute('data-label', 'Actions');

    const editBtn = document.createElement('button');
    editBtn.className = 'ghost-btn';
    editBtn.textContent = 'Edit';
    editBtn.dataset.action = 'edit';
    editBtn.dataset.id = task.id;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'ghost-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.dataset.id = task.id;

    actionsCell.append(editBtn, deleteBtn);
    row.append(idCell, titleCell, descCell, createdCell, actionsCell);
    taskTableBody.appendChild(row);
  });
};

const updatePagination = (pagination) => {
  state.currentPage = pagination.currentPage;
  state.totalPages = pagination.totalPages;
  paginationInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
  prevPageBtn.disabled = pagination.currentPage <= 1;
  nextPageBtn.disabled = pagination.currentPage >= pagination.totalPages;
};

const handleApiError = async (response) => {
  let message = 'Something went wrong.';
  try {
    const payload = await response.json();
    if (payload.error) {
      message = payload.error;
    }
  } catch (err) {
    // no-op
  }
  throw new Error(message);
};

const fetchTasks = async () => {
  try {
    const params = new URLSearchParams({ page: state.currentPage.toString() });
    if (state.search.trim()) {
      params.set('search', state.search.trim());
    }

    const response = await fetch(`/api/tasks?${params.toString()}`, {
      headers: API_HEADERS,
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    const payload = await response.json();
    renderTasks(payload.data);
    updatePagination(payload.pagination);
  } catch (error) {
    showToast(error.message, true);
  }
};

const fetchLogs = async () => {
  try {
    const response = await fetch('/api/logs?limit=50', {
      headers: API_HEADERS,
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    const payload = await response.json();
    renderLogs(payload.data);
  } catch (error) {
    showToast(error.message, true);
  }
};

const renderLogs = (logs = []) => {
  logTableBody.innerHTML = '';
  if (logs.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = 'No audit logs yet.';
    row.appendChild(cell);
    logTableBody.appendChild(row);
    return;
  }

  logs.forEach((log) => {
    const row = document.createElement('tr');
    const actionType = log.action || '';
    if (actionType.includes('Create')) row.classList.add('log-create');
    if (actionType.includes('Update')) row.classList.add('log-update');
    if (actionType.includes('Delete')) row.classList.add('log-delete');

    const timestampCell = document.createElement('td');
    timestampCell.textContent = formatDate(log.timestamp);
    timestampCell.setAttribute('data-label', 'Timestamp');
    const actionCell = document.createElement('td');
    actionCell.textContent = log.action;
    actionCell.setAttribute('data-label', 'Action Type');
    const taskCell = document.createElement('td');
    taskCell.textContent = log.taskId;
    taskCell.setAttribute('data-label', 'Task ID');
    const contentCell = document.createElement('td');
    contentCell.setAttribute('data-label', 'Updated Content');

    if (log.updatedContent && Object.keys(log.updatedContent).length > 0) {
      const pairs = Object.entries(log.updatedContent).map(
        ([key, value]) => `${key}: ${value}`
      );
      contentCell.textContent = pairs.join(', ');
    } else {
      contentCell.textContent = 'No content recorded';
    }

    row.append(timestampCell, actionCell, taskCell, contentCell);
    logTableBody.appendChild(row);
  });
};

const submitTask = async (isEdit) => {
  const payload = {
    title: titleInput.value,
    description: descriptionInput.value,
  };

  const validation = validateTaskPayload(payload);

  if (validation.error) {
    formError.textContent = validation.error;
    return;
  }

  const url = isEdit ? `/api/tasks/${taskIdInput.value}` : '/api/tasks';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    state.isSubmitting = true;
    const response = await fetch(url, {
      method,
      headers: API_HEADERS,
      body: JSON.stringify(validation.data),
    });
    state.isSubmitting = false;

    if (!response.ok) {
      await handleApiError(response);
    }

    toggleModal(false);
    showToast(isEdit ? 'Task updated.' : 'Task created.');
    fetchTasks();
  } catch (error) {
    state.isSubmitting = false;
    formError.textContent = error.message;
  }
};

const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: API_HEADERS,
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    showToast('Task deleted.');
    fetchTasks();
  } catch (error) {
    showToast(error.message, true);
  }
};

// Event bindings
navButtons.forEach((btn) =>
  btn.addEventListener('click', () => setView(btn.dataset.view))
);

newTaskBtn.addEventListener('click', () => {
  modalTitle.textContent = 'Create Task';
  toggleModal(true);
});

closeModalBtn.addEventListener('click', () => toggleModal(false));
cancelModalBtn.addEventListener('click', () => toggleModal(false));
modalBackdrop.addEventListener('click', () => toggleModal(false));

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (state.isSubmitting) return;
  const isEdit = Boolean(taskIdInput.value);
  submitTask(isEdit);
});

taskTableBody.addEventListener('click', (event) => {
  const { action, id } = event.target.dataset;
  if (!action || !id) return;

  if (action === 'edit') {
    const row = event.target.closest('tr');
    const [idCell, titleCell, descCell] = row.children;
    taskIdInput.value = id;
    titleInput.value = titleCell.textContent;
    descriptionInput.value = descCell.textContent;
    modalTitle.textContent = `Edit Task #${id}`;
    toggleModal(true);
  }

  if (action === 'delete') {
    const confirmed = window.confirm(
      `Delete task #${id}? This action cannot be undone.`
    );
    if (confirmed) {
      deleteTask(id);
    }
  }
});

let searchDebounce;
searchInput.addEventListener('input', (event) => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    state.search = event.target.value;
    state.currentPage = 1;
    fetchTasks();
  }, 350);
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  state.search = '';
  state.currentPage = 1;
  fetchTasks();
});

refreshTasksBtn.addEventListener('click', () => fetchTasks());
refreshLogsBtn.addEventListener('click', () => fetchLogs());

prevPageBtn.addEventListener('click', () => {
  if (state.currentPage <= 1) return;
  state.currentPage -= 1;
  fetchTasks();
});

nextPageBtn.addEventListener('click', () => {
  if (state.currentPage >= state.totalPages) return;
  state.currentPage += 1;
  fetchTasks();
});

// Initial load
fetchTasks();

