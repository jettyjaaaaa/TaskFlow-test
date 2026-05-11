import React from 'react';
import { format } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PriorityBadge = ({ priority }) => {
  const colors = {
    Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[priority] || colors.Medium}`}>
      {priority}
    </span>
  );
};

const TagBadge = ({ tag }) => {
  return (
    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
      {tag}
    </span>
  );
};

export default function TaskCard({ task, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const assignees = task.task_assignments || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow cursor-move hover:shadow-lg transition-shadow"
    >
      <div className="space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-sm dark:text-white truncate">{task.title}</h3>

        {/* Project & Tag */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-600 dark:text-slate-400">{task.project_name}</span>
          {task.tag && <TagBadge tag={task.tag} />}
        </div>

        {/* Priority & Date */}
        <div className="flex items-center justify-between gap-2">
          <PriorityBadge priority={task.priority} />
          {task.due_date && (
            <span className="text-xs text-gray-500 dark:text-slate-400">
              {format(new Date(task.due_date), 'MMM dd')}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full"
            style={{ width: `${task.progress}%` }}
          />
        </div>

        {/* Progress Text */}
        <p className="text-xs text-gray-600 dark:text-slate-400">Progress {task.progress}%</p>

        {/* Assignees */}
        <div className="flex items-center -space-x-2">
          {assignees.slice(0, 3).map((assignment) => (
            <img
              key={assignment.user_id}
              src={assignment.users?.avatar_url || `https://i.pravatar.cc/150?img=${assignment.user_id}`}
              alt={assignment.users?.name || 'User'}
              className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800"
              title={assignment.users?.name}
            />
          ))}
          {assignees.length > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-gray-300 dark:bg-slate-600 flex items-center justify-center text-xs font-semibold">
              +{assignees.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
