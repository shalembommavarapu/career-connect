import React from 'react';

export const ApplicationStatusBadge = ({ status, size = 'md' }) => {
  const styles = {
    'Applied': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    'Under Review': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    'Shortlisted': 'bg-brand-500/15 text-brand-600 dark:text-brand-400 border-brand-500/40',
    'Interview': 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/40',
    'Selected': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40',
    'Rejected': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    'Withdrawn': 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30'
  };

  const currentStyle = styles[status] || styles['Applied'];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center space-x-1.5 rounded-full border ${sizeClasses} ${currentStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span>{status}</span>
    </span>
  );
};
