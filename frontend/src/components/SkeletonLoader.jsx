import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-200 dark:bg-slate-700 h-32 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
