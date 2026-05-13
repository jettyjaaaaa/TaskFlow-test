import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

export default function KanbanColumn({ status, tasks, onTaskOpen, onTaskDrop }) {
  const { setNodeRef } = useDroppable({
    id: status
  });

  const statusColors = {
    'To Do': 'bg-gray-100 dark:bg-slate-700',
    'In Progress': 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20',
    'Done': 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20'
  };

  const statusHeaderColors = {
    'To Do': 'text-gray-700 dark:text-slate-300',
    'In Progress': 'text-blue-700 dark:text-blue-300',
    'Done': 'text-green-700 dark:text-green-300'
  };

  return (
    <div className={`flex-1 rounded-lg p-4 min-h-96 ${statusColors[status]}`}>
      <h2 className={`font-bold mb-4 text-sm ${statusHeaderColors[status]}`}>
        {status}
      </h2>
      <div
        ref={setNodeRef}
        className="space-y-3 min-h-32"
        onDrop={(e) => onTaskDrop(e, status)}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={onTaskOpen} />
        ))}
      </div>
    </div>
  );
}
