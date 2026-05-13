import { create } from 'zustand';
import { api } from '../lib/api';

export const useStore = create((set, get) => ({
  user: null,
  tasks: [],
  users: [],
  pagination: { page: 1, limit: 12, total: 0, pages: 1 },
  loading: false,
  error: null,
  darkMode: localStorage.getItem('darkMode') === 'true',
  selectedPage: 1,
  activeView: 'dashboard',
  filters: {
    status: 'All',
    priority: 'All',
    search: '',
    search_scope: 'summary'
  },

  // Auth actions
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.login(email, password);
      if (response.error) throw new Error(response.error);
      
      localStorage.setItem('token', response.token);
      set({ user: response.user, loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, tasks: [] });
  },

  setUser: (user) => set({ user }),

  // Task actions
  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const filters = {
        page: get().selectedPage,
        limit: 12,
        ...Object.fromEntries(
          Object.entries(get().filters).filter(([k, v]) => v && v !== 'All')
        )
      };
      
      const response = await api.getTasks(filters);
      if (response.error) throw new Error(response.error);
      
      set({
        tasks: response.data || [],
        pagination: response.pagination || { page: 1, limit: 12, total: 0, pages: 1 },
        loading: false
      });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createTask: async (taskData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.createTask(token, taskData);
      if (response.error) throw new Error(response.error);
      
      set(state => ({ tasks: [...state.tasks, response] }));
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateTask: async (id, taskData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.updateTask(token, id, taskData);
      if (response.error) throw new Error(response.error);
      
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? response : t)
      }));
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.deleteTask(token, id);
      
      set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // User actions
  fetchUsers: async () => {
    try {
      const response = await api.getUsers();
      if (response.error) throw new Error(response.error);
      
      set({ users: Array.isArray(response) ? response : [] });
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // UI actions
  toggleDarkMode: () => {
    const newDarkMode = !get().darkMode;
    localStorage.setItem('darkMode', newDarkMode);
    set({ darkMode: newDarkMode });
  },

  setSelectedPage: (page) => {
    set({ selectedPage: page });
  },

  setActiveView: (activeView) => {
    set({ activeView });
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearError: () => {
    set({ error: null });
  }
}));
