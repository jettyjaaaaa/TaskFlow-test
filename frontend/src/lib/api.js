const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Auth
  login: (email, password) =>
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(r => r.json()),

  getMe: (token) =>
    fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),

  // Users
  getUsers: () =>
    fetch(`${API_URL}/users`).then(r => r.json()),

  getUser: (id) =>
    fetch(`${API_URL}/users/${id}`).then(r => r.json()),

  // Tasks
  getTasks: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetch(`${API_URL}/tasks?${params}`).then(r => r.json());
  },

  getTask: (id) =>
    fetch(`${API_URL}/tasks/${id}`).then(r => r.json()),

  createTask: (token, data) =>
    fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  updateTask: (token, id, data) =>
    fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  deleteTask: (token, id) =>
    fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
};
