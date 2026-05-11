import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated, task = null }) {
  const { createTask, updateTask, users } = useStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_name: '',
    tag: '',
    priority: 'Medium',
    status: 'To Do',
    progress: 0,
    due_date: '',
    assignee_ids: []
  });

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        assignee_ids: task.task_assignments?.map(a => a.user_id) || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        project_name: '',
        tag: '',
        priority: 'Medium',
        status: 'To Do',
        progress: 0,
        due_date: '',
        assignee_ids: []
      });
    }
  }, [task, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssigneeToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      assignee_ids: prev.assignee_ids.includes(userId)
        ? prev.assignee_ids.filter(id => id !== userId)
        : [...prev.assignee_ids, userId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (task?.id) {
        await updateTask(task.id, formData);
      } else {
        await createTask(formData);
      }
      onTaskCreated();
      onClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full mx-4 shadow-lg max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
          <h2 className="text-xl font-semibold dark:text-white">
            {task?.id ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium dark:text-slate-300 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium dark:text-slate-300 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="Task description"
            />
          </div>

          {/* Project & Tag */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-slate-300 mb-1">Project</label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Project name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-slate-300 mb-1">Tag</label>
              <input
                type="text"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Tag"
              />
            </div>
          </div>

          {/* Priority, Status, Progress */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-slate-300 mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-slate-300 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-slate-300 mb-1">Progress %</label>
              <input
                type="number"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium dark:text-slate-300 mb-1">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium dark:text-slate-300 mb-2">Assign To</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {users.map(user => (
                <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.assignee_ids.includes(user.id)}
                    onChange={() => handleAssigneeToggle(user.id)}
                    className="rounded"
                  />
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-sm dark:text-slate-200">{user.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-4 border-t dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded dark:border-slate-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              {task?.id ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
