import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { ChevronDown, LogOut, Search } from 'lucide-react';
import { getAvatarUrl } from '../lib/avatar';

export default function TopBar() {
  const { logout, setFilters, setSelectedPage, filters, user } = useStore();
  const [search, setSearch] = useState(filters.search || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setSearch(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value) => {
    setSearch(value);
    setSelectedPage(1);
    setFilters({ search: value, search_scope: 'summary' });
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-800 border-b dark:border-slate-700 gap-4">
      <div className="flex-1 max-w-lg relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search"
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <img
            src={getAvatarUrl(user)}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full"
          />
          <ChevronDown size={16} className="text-slate-500 dark:text-slate-300" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
