import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { api } from './lib/api';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import './index.css';

export default function App() {
  const { user, darkMode, logout } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and authenticate via API
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe(token).then((res) => {
        if (res && res.user) {
          useStore.getState().setUser(res.user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
        setLoading(false);
      }).catch(() => {
        setIsAuthenticated(false);
        setLoading(false);
      });
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [user]);

  // Set up real-time subscriptions when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Task update:', payload);
          // Fetch tasks again to get latest data
          useStore.getState().fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <TopBar />
          <div className="flex-1 overflow-auto">
            <Dashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
