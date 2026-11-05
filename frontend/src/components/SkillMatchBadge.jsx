import React, { useState } from 'react';
import { Sparkles, CheckCircle2, CircleDashed, Info } from 'lucide-react';

export const SkillMatchBadge = ({ match, size = 'sm' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!match) return null;

  const { matchPercentage, matchedSkills = [], missingSkills = [], scoreLabel } = match;

  let colorClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  let ringColor = '#94a3b8';

  if (matchPercentage >= 75) {
    colorClasses = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    ringColor = '#10b981';
  } else if (matchPercentage >= 50) {
    colorClasses = 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30';
    ringColor = '#6366f1';
  } else if (matchPercentage >= 25) {
    colorClasses = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    ringColor = '#f59e0b';
  }

  return (
    <div className="relative inline-block" onMouseLeave={() => setShowTooltip(false)}>
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all hover:scale-105 ${colorClasses}`}
      >
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>{matchPercentage}% Match</span>
        <span className="hidden sm:inline opacity-75 font-normal">({scoreLabel})</span>
      </button>

      {showTooltip && (
        <div className="absolute z-40 bottom-full left-0 mb-2 w-72 p-3.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100 dark:border-dark-border">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1">
              <span>Skill Match Breakdown</span>
            </span>
            <span className="text-xs font-extrabold text-brand-500">{matchPercentage}%</span>
          </div>

          <div className="space-y-2 text-xs">
            {matchedSkills.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 mb-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Skills You Have ({matchedSkills.length})</span>
                </p>
                <div className="flex flex-wrap gap-1">
                  {matchedSkills.map((s, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {missingSkills.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1 mb-1">
                  <CircleDashed className="w-3 h-3" />
                  <span>Skills To Learn ({missingSkills.length})</span>
                </p>
                <div className="flex flex-wrap gap-1">
                  {missingSkills.map((s, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-surface text-slate-600 dark:text-slate-400 text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-dark-border text-[10px] text-slate-400 flex items-center space-x-1">
            <Info className="w-3 h-3 flex-shrink-0" />
            <span>Calculated transparently from your profile skills</span>
          </div>
        </div>
      )}
    </div>
  );
};
