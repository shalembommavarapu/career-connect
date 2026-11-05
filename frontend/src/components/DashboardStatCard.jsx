import React from 'react';

export const DashboardStatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  color = 'brand',
  trend
}) => {
  const colorMap = {
    brand: 'bg-brand-500/10 text-brand-500 border-brand-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  };

  const style = colorMap[color] || colorMap.brand;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border shadow-sm flex items-center justify-between">
      <div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
          {label}
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
            {trend && <span className="font-semibold text-emerald-500">{trend}</span>}
            <span>{subtext}</span>
          </p>
        )}
      </div>

      <div className={`p-3.5 rounded-2xl border ${style} flex-shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
