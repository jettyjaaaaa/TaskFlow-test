import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useStore } from '../store/useStore';
import KanbanColumn from '../components/KanbanColumn';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import CreateTaskModal from '../components/CreateTaskModal';
import SkeletonLoader from '../components/SkeletonLoader';
import { Plus, Search } from 'lucide-react';

export default function Dashboard() {
  const {
    tasks,
    users,
    loading,
    fetchTasks,
    fetchUsers,
    updateTask,
    deleteTask,
    setFilters,
    setSelectedPage,
    selectedPage,
    filters
  } = useStore();

  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Fetch initial data
  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  // Apply filters
  useEffect(() => {
    const newFilters = {};
    if (searchQuery) newFilters.search = searchQuery;
    if (statusFilter !== 'All') newFilters.status = statusFilter;
    if (priorityFilter !== 'All') newFilters.priority = priorityFilter;
    setFilters(newFilters);
  }, [searchQuery, statusFilter, priorityFilter]);

  // Refetch when filters change
  useEffect(() => {
    fetchTasks();
  }, [filters, selectedPage]);

  // Group tasks by status
  const groupedTasks = {
    'To Do': tasks.filter(t => t.status === 'To Do'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Done': tasks.filter(t => t.status === 'Done')
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && over.id !== active.id) {
      const task = tasks.find(t => t.id === active.id);
      if (task) {
        try {
          await updateTask(task.id, { status: over.id });
        } catch (error) {
          console.error('Error updating task:', error);
        }
      }
    }
  };

  const handleTaskOpen = (task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleTaskDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        setIsDetailOpen(false);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="px-6 py-4 bg-white dark:bg-slate-800 border-b dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All Priorities</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Status: All</option>
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-6 overflow-auto">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-3 gap-4 min-h-full">
              {Object.entries(groupedTasks).map(([status, statusTasks]) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={statusTasks}
                  onTaskOpen={handleTaskOpen}
                  onTaskDrop={(e, dropStatus) => {
                    // Drag and drop handling
                  }}
                />
              ))}
            </div>
          </DndContext>
        )}
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700 flex items-center justify-center gap-2">
        <button
          onClick={() => setSelectedPage(Math.max(1, selectedPage - 1))}
          disabled={selectedPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
        >
          Previous
        </button>
        <span className="px-3 py-1 dark:text-slate-300">Page {selectedPage}</span>
        <button
          onClick={() => setSelectedPage(selectedPage + 1)}
          className="px-3 py-1 border rounded dark:border-slate-600 dark:text-slate-300"
        >
          Next
        </button>
      </div>

      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(task) => {
          setIsCreateOpen(true);
          setIsDetailOpen(false);
        }}
        onDelete={handleTaskDelete}
      />

      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTaskCreated={() => fetchTasks()}
        task={selectedTask}
      />
    </div>
  );
}
