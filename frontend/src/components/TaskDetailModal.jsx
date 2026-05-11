import React from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';

export default function TaskDetailModal({ task, isOpen, onClose, onEdit, onDelete }) {
  if (!isOpen || !task) return null;

  const assignees = task.task_assignments || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full mx-4 shadow-lg max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
          <h2 className="text-xl font-semibold dark:text-white">{task.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Project & Tag */}
          <div className="flex gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Project</p>
              <p className="font-medium dark:text-white">{task.project_name}</p>
            </div>
            {task.tag && (
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400">Tag</p>
                <p className="font-medium dark:text-white">{task.tag}</p>
              </div>
            )}
          </div>

          {/* Status, Priority, Progress */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Status</p>
              <p className="font-medium dark:text-white">{task.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Priority</p>
              <p className="font-medium dark:text-white">{task.priority}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Progress</p>
              <p className="font-medium dark:text-white">{task.progress}%</p>
            </div>
          </div>

          {/* Date */}
          {task.due_date && (
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Due Date</p>
              <p className="font-medium dark:text-white">
                {format(new Date(task.due_date), 'MMMM dd, yyyy')}
              </p>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Description</p>
              <p className="text-gray-800 dark:text-slate-200">{task.description}</p>
            </div>
          )}

          {/* Assignees */}
          <div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">Team Members</p>
            <div className="flex flex-wrap gap-2">
              {assignees.map((assignment) => (
                <div key={assignment.user_id} className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded">
                  <img
                    src={assignment.users?.avatar_url || `https://i.pravatar.cc/150?img=${assignment.user_id}`}
                    alt={assignment.users?.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm dark:text-slate-200">{assignment.users?.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t dark:border-slate-700">
            <button
              onClick={() => onEdit(task)}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
