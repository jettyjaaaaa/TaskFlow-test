import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Menu, X, LayoutGrid, CheckSquare, Users, Settings, LogOut, Moon, Sun } from 'lucide-react';

export default function Sidebar() {
  const { user, logout, darkMode, toggleDarkMode } = useStore();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '#' },
    { icon: CheckSquare, label: 'My Tasks', href: '#' },
    { icon: Users, label: 'Team', href: '#' },
    { icon: Settings, label: 'Settings', href: '#' }
  ];

  return (
    <div
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } transition-all duration-300 bg-slate-900 text-white flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {isOpen && <h1 className="text-xl font-bold">TaskFlow</h1>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-slate-700 rounded"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <item.icon size={20} />
            {isOpen && <span>{item.label}</span>}
          </a>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 space-y-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          {isOpen && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User Profile */}
        {isOpen && user && (
          <div className="flex items-center space-x-2 mb-3">
            <img
              src={user.avatar_url || `https://i.pravatar.cc/150?img=0`}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-red-300"
        >
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
