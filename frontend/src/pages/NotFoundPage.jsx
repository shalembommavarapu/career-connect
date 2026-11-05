import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white">404</h1>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Opportunity Page Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            The page or job listing you are looking for might have been moved, closed, or does not exist.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-sm"
        >
          Return to CareerConnect Home
        </Link>
      </div>
    </div>
  );
};
