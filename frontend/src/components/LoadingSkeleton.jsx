import React from 'react';

export const JobCardSkeleton = () => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border animate-pulse space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-dark-surface"></div>
          <div className="space-y-2">
            <div className="w-36 h-4 bg-slate-200 dark:bg-dark-surface rounded"></div>
            <div className="w-24 h-3 bg-slate-100 dark:bg-dark-surface/60 rounded"></div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-dark-surface"></div>
      </div>
      <div className="w-full h-3 bg-slate-100 dark:bg-dark-surface/60 rounded"></div>
      <div className="flex gap-2">
        <div className="w-16 h-6 bg-slate-200 dark:bg-dark-surface rounded-md"></div>
        <div className="w-16 h-6 bg-slate-200 dark:bg-dark-surface rounded-md"></div>
        <div className="w-20 h-6 bg-slate-200 dark:bg-dark-surface rounded-md"></div>
      </div>
      <div className="pt-3 border-t border-slate-100 dark:border-dark-border flex justify-between items-center">
        <div className="w-24 h-4 bg-slate-200 dark:bg-dark-surface rounded"></div>
        <div className="w-20 h-8 bg-slate-200 dark:bg-dark-surface rounded-xl"></div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full divide-y divide-slate-100 dark:divide-dark-border animate-pulse">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-dark-surface"></div>
            <div className="space-y-1.5 flex-1">
              <div className="w-1/3 h-4 bg-slate-200 dark:bg-dark-surface rounded"></div>
              <div className="w-1/4 h-3 bg-slate-100 dark:bg-dark-surface/60 rounded"></div>
            </div>
          </div>
          <div className="w-24 h-6 bg-slate-200 dark:bg-dark-surface rounded-full"></div>
          <div className="w-16 h-8 bg-slate-200 dark:bg-dark-surface rounded-lg"></div>
        </div>
      ))}
    </div>
  );
};
