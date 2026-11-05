import React from 'react';
import { SearchX, Inbox, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = SearchX,
  title = 'No results found',
  description = 'Try adjusting your search criteria or clear your current filters to view available opportunities.',
  actionLabel,
  actionLink,
  onAction
}) => {
  return (
    <div className="py-14 px-4 text-center max-w-md mx-auto">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-dark-surface border border-slate-200 dark:border-dark-border flex items-center justify-center text-slate-400 dark:text-slate-500">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{description}</p>
      {actionLabel && (
        actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors shadow-sm"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors shadow-sm"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
};
