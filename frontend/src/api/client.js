/**
 * API Client for Student Planner
 * In development: Proxied through Vite (/api) or configured via VITE_API_BASE_URL
 * In production: Served on same origin (/api)
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.errors = data?.errors || [];
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to reach the backend server. Please check if the server is running.');
    }
    throw error;
  }
}

export const api = {
  // Health check
  checkHealth: () => request('/health'),

  // Get all tasks with optional filters
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.subject) query.append('subject', params.subject);
    if (params.priority) query.append('priority', params.priority);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const qs = query.toString();
    return request(`/tasks${qs ? `?${qs}` : ''}`);
  },

  // Get task summary counts
  getCounts: () => request('/tasks/counts'),

  // Get single task
  getTask: (id) => request(`/tasks/${id}`),

  // Create new task
  createTask: (taskData) => request('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  }),

  // Update existing task
  updateTask: (id, taskData) => request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData)
  }),

  // Toggle task completion
  toggleTask: (id) => request(`/tasks/${id}/toggle`, {
    method: 'PATCH'
  }),

  // Delete task
  deleteTask: (id) => request(`/tasks/${id}`, {
    method: 'DELETE'
  }),

  // Seed sample demo data
  seedDemoTasks: (clearExisting = false) => request('/tasks/seed', {
    method: 'POST',
    body: JSON.stringify({ clearExisting })
  })
};
