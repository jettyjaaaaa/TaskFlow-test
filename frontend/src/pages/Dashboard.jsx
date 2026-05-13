import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
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
import { ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import { getAvatarUrl } from '../lib/avatar';

export default function Dashboard() {
  const {
    tasks,
    users,
    loading,
    fetchTasks,
    fetchUsers,
    fetchTasksAll,
    updateTask,
    deleteTask,
    setSelectedPage,
    selectedPage,
    pagination,
    activeView,
    filters,
    user,
    setPageLimit
  } = useStore();
  const { tasksAll } = useStore();
  const [rowsPerColumn, setRowsPerColumn] = useState(3);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [activeId, setActiveId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Fetch initial data
  useEffect(() => {
    const computeAndSetLimit = async () => {
      const vh = window.innerHeight;
      const available = Math.max(600, vh - 300);
      const rows = Math.max(3, Math.min(4, Math.floor(available / 260)));
      const limit = rows * 3; 
      setRowsPerColumn(rows);
      setPageLimit(limit);
      await fetchTasksAll();
    };

    computeAndSetLimit();
    window.addEventListener('resize', computeAndSetLimit);
    fetchUsers();

    return () => window.removeEventListener('resize', computeAndSetLimit);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchTasksAll();
  }, [filters, selectedPage, searchQuery, statusFilter, priorityFilter]);

  const clearBoardFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
  };

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase().trim();

    return tasks.filter((task) => {
      const assignees = task.task_assignments?.map((assignment) => assignment.users).filter(Boolean) || [];
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

      if (!normalizedSearch) {
        return matchesStatus && matchesPriority;
      }

      const haystack = [
        task.title,
        task.description,
        task.project_name,
        task.tag,
        task.priority,
        task.status,
        task.due_date,
        ...assignees.map((assignee) => assignee.name),
        ...assignees.map((assignee) => assignee.email)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && matchesPriority && haystack.includes(normalizedSearch);
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  // Group tasks by status using full dataset for per-column pagination
  const allFiltered = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase().trim();
    return (tasksAll || []).filter((task) => {
      const assignees = task.task_assignments?.map((assignment) => assignment.users).filter(Boolean) || [];
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

      if (!normalizedSearch) {
        return matchesStatus && matchesPriority;
      }

      const haystack = [
        task.title,
        task.description,
        task.project_name,
        task.tag,
        task.priority,
        task.status,
        task.due_date,
        ...assignees.map((assignee) => assignee.name),
        ...assignees.map((assignee) => assignee.email)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && matchesPriority && haystack.includes(normalizedSearch);
    });
  }, [tasksAll, searchQuery, statusFilter, priorityFilter]);

  const allGrouped = useMemo(() => ({
    'To Do': allFiltered.filter(t => t.status === 'To Do'),
    'In Progress': allFiltered.filter(t => t.status === 'In Progress'),
    'Done': allFiltered.filter(t => t.status === 'Done')
  }), [allFiltered]);

  // compute total pages based on the tallest column
  const totalPagesComputed = useMemo(() => {
    const pagesPerCol = Object.values(allGrouped).map(col => Math.ceil((col.length || 0) / rowsPerColumn) || 0);
    const maxPages = Math.max(1, ...pagesPerCol);
    return maxPages;
  }, [allGrouped, rowsPerColumn]);

  const totalPages = totalPagesComputed;

  const groupedTasks = useMemo(() => {
    if (showAll) return allGrouped;
    const start = (selectedPage - 1) * rowsPerColumn;
    return {
      'To Do': allGrouped['To Do'].slice(start, start + rowsPerColumn),
      'In Progress': allGrouped['In Progress'].slice(start, start + rowsPerColumn),
      'Done': allGrouped['Done'].slice(start, start + rowsPerColumn)
    };
  }, [allGrouped, selectedPage, rowsPerColumn, showAll]);

  const teamMembers = useMemo(() => users, [users]);
  const pageNumbers = useMemo(() => {
    const visiblePages = [];
    const start = Math.max(1, selectedPage - 1);
    const end = Math.min(totalPages, start + 2);

    for (let page = start; page <= end; page += 1) {
      visiblePages.push(page);
    }

    if (visiblePages.length < 3 && totalPages > 3) {
      const extraStart = Math.max(1, totalPages - 2);
      return Array.from({ length: Math.min(3, totalPages) }, (_, index) => extraStart + index);
    }

    return visiblePages;
  }, [selectedPage, totalPages]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && over.id !== active.id) {
      const task = (tasksAll || []).find(t => String(t.id) === String(active.id)) || tasks.find(t => String(t.id) === String(active.id));
      if (task) {
        try {
          // Determine destination status: over.id may be a column id (status) or another task id
          let destinationStatus = task.status;

          const possibleStatuses = Object.keys(groupedTasks);
          if (possibleStatuses.includes(String(over.id))) {
            destinationStatus = over.id;
          } else {
            const targetTask = (tasksAll || []).find(t => String(t.id) === String(over.id)) || tasks.find(t => String(t.id) === String(over.id));
            if (targetTask) {
              destinationStatus = targetTask.status;
            }
          }

          if (destinationStatus && destinationStatus !== task.status) {
            await updateTask(task.id, { status: destinationStatus });
            // Refresh tasks after a successful status update to ensure assignments and filters are consistent
            await fetchTasksAll();
          }
        } catch (error) {
          console.error('Error updating task:', error);
        }
      }
    }
    setActiveId(null);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    // Only set active overlay if the current user is a member of the task
    const task = (tasksAll || []).find((t) => String(t.id) === String(active?.id)) || tasks.find((t) => String(t.id) === String(active?.id));
    if (!task) {
      setActiveId(null);
      return;
    }

    const isMember = Boolean(
      user && task?.task_assignments?.some((a) => String(a.user_id) === String(user.id))
    );

    if (isMember) {
      setActiveId(active?.id ?? null);
    } else {
      // ignore drag start for non-members
      setActiveId(null);
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
          <h1 className="text-3xl font-bold dark:text-white">
            {activeView === 'team' ? 'Team Members' : activeView === 'my-tasks' ? 'My Tasks' : 'Dashboard'}
          </h1>
        </div>

        {activeView !== 'team' && (
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="w-full pl-10 pr-10 py-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {!!searchQuery && (
                <button
                  type="button"
                  onClick={clearBoardFilters}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  <X size={16} className="text-slate-500 dark:text-slate-300" />
                </button>
              )}
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
              }}
              className="px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              className="px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">Status: All</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <Plus size={20} />
              New Task
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto pb-24">
        {activeView === 'team' ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 p-4 flex items-center gap-4 shadow-sm">
                <img
                  src={getAvatarUrl(member)}
                  alt={member.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                  <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 mt-1">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        ) : loading ? (
          <SkeletonLoader />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
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
            <DragOverlay>
                {activeId ? (
                  <TaskCard
                    task={(tasksAll || []).find((t) => String(t.id) === String(activeId))}
                    isOverlay
                    onOpen={() => {}}
                  />
                ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Pagination */}
      {activeView !== 'team' && (
        <div className="sticky bottom-0 z-20 px-6 py-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-t dark:border-slate-700 flex items-center justify-center gap-2">
          <button
            onClick={() => setSelectedPage(Math.max(1, selectedPage - 1))}
            disabled={selectedPage === 1}
            aria-label="Previous page"
            className="w-10 h-10 inline-flex items-center justify-center border rounded-lg disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setSelectedPage(page)}
                className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                  page === selectedPage
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedPage(Math.min(totalPages, selectedPage + 1))}
            disabled={selectedPage >= totalPages}
            aria-label="Next page"
            className="w-10 h-10 inline-flex items-center justify-center border rounded-lg disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ChevronRight size={18} />
          </button>

          <button
            type="button"
            onClick={async () => {
              if (!showAll) {
                await fetchTasksAll();
                setShowAll(true);
              } else {
                await fetchTasks();
                setShowAll(false);
              }
            }}
            className="ml-4 px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
          >
            {showAll ? 'Paginate' : 'Show all'}
          </button>
        </div>
      )}

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
        currentUser={user}
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
