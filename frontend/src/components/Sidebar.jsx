import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, CheckSquare, Moon, Settings, Sun, Users } from 'lucide-react';

export default function Sidebar() {
  const { activeView, darkMode, setActiveView, setFilters, setSelectedPage, toggleDarkMode, user } = useStore();
  const [isOpen, setIsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', view: 'dashboard' },
    { icon: CheckSquare, label: 'My Tasks', view: 'my-tasks' },
    { icon: Users, label: 'Team', view: 'team' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (view) => {
    setActiveView(view);
    setSelectedPage(1);

    if (view === 'dashboard') {
      setFilters({ assigned_user_id: '' });
      return;
    }

    if (view === 'my-tasks' && user) {
      setFilters({ assigned_user_id: user.id });
      return;
    }

    if (view === 'team') {
      setFilters({ assigned_user_id: '' });
    }
  };

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-slate-900 text-white flex flex-col overflow-hidden`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {isOpen && <h1 className="text-xl font-bold">TaskFlow</h1>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              handleNavigation(item.view);
              setSettingsOpen(false);
            }}
            className={`w-full text-left flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              activeView === item.view ? 'bg-slate-700 text-white' : 'hover:bg-slate-700'
            }`}
          >
            <item.icon size={20} />
            {isOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-3" ref={settingsRef}>
        <button
          type="button"
          onClick={() => setSettingsOpen((value) => !value)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <span className="flex items-center space-x-3">
            <Settings size={20} />
            {isOpen && <span>Settings</span>}
          </span>
          {isOpen && <ChevronDown size={16} className="opacity-70" />}
        </button>

        {settingsOpen && (
          <div className="rounded-xl bg-slate-800 border border-slate-700 p-2 space-y-1">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
