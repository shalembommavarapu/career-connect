import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this information. Please check your connection and try again.',
  onRetry
}) => {
  return (
    <div className="py-12 px-4 text-center max-w-md mx-auto">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-dark-surface hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
