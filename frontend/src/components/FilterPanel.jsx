import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const COMMON_SKILLS = [
  'React', 'Node.js', 'Python', 'JavaScript', 'MongoDB',
  'Tailwind CSS', 'Docker', 'Kubernetes', 'Java', 'SQL', 'C++'
];

export const FilterPanel = ({ filters, onChange, onReset }) => {
  const handleWorkModeToggle = (mode) => {
    const current = filters.workMode ? filters.workMode.split(',') : [];
    const updated = current.includes(mode)
      ? current.filter(m => m !== mode)
      : [...current, mode];
    onChange({ workMode: updated.join(',') });
  };

  const handleEmploymentTypeToggle = (type) => {
    const current = filters.employmentType ? filters.employmentType.split(',') : [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onChange({ employmentType: updated.join(',') });
  };

  const handleSkillToggle = (skill) => {
    const current = filters.skills ? filters.skills.split(',') : [];
    const updated = current.includes(skill)
      ? current.filter(s => s !== skill)
      : [...current, skill];
    onChange({ skills: updated.join(',') });
  };

  const activeFilterCount = [
    filters.workMode,
    filters.employmentType,
    filters.experienceLevel,
    filters.source && filters.source !== 'all' ? filters.source : null,
    filters.skills,
    filters.minSalary
  ].filter(Boolean).length;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-brand-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Listing Source */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider">
          Listing Source
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Sources' },
            { id: 'Internal', label: 'Internal Verified' },
            { id: 'Unstop', label: 'Unstop Feeds' },
            { id: 'External', label: 'Partners' }
          ].map(src => (
            <button
              key={src.id}
              type="button"
              onClick={() => onChange({ source: src.id })}
              className={`py-1.5 px-2.5 rounded-lg font-medium border text-left transition-colors ${
                (filters.source || 'all') === src.id
                  ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400 font-semibold'
                  : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-surface'
              }`}
            >
              {src.label}
            </button>
          ))}
        </div>
      </div>

      {/* Work Mode */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider">
          Work Mode
        </label>
        <div className="flex flex-wrap gap-1.5">
          {['remote', 'hybrid', 'on-site'].map(mode => {
            const isSelected = (filters.workMode || '').split(',').includes(mode);
            return (
              <button
                key={mode}
                type="button"
                onClick={() => handleWorkModeToggle(mode)}
                className={`py-1 px-3 rounded-lg text-xs capitalize border transition-colors ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 font-semibold'
                    : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-surface'
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {/* Employment Type */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider">
          Employment Type
        </label>
        <div className="space-y-1.5 text-xs">
          {['full-time', 'internship', 'part-time', 'contract'].map(type => {
            const isSelected = (filters.employmentType || '').split(',').includes(type);
            return (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleEmploymentTypeToggle(type)}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 border-slate-300 dark:border-dark-border dark:bg-dark-surface"
                />
                <span className="capitalize text-slate-700 dark:text-slate-300">{type}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider">
          Experience Level
        </label>
        <select
          value={filters.experienceLevel || ''}
          onChange={(e) => onChange({ experienceLevel: e.target.value })}
          className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Any Experience Level</option>
          <option value="fresher">Fresher (Campus 2025/2026)</option>
          <option value="entry">Entry Level (0 - 1 years)</option>
          <option value="mid">Mid Level (1 - 3 years)</option>
        </select>
      </div>

      {/* Popular Skills */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider">
          Technical Skills
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SKILLS.map(skill => {
            const isSelected = (filters.skills || '').split(',').includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className={`py-0.5 px-2 rounded text-[11px] border transition-colors ${
                  isSelected
                    ? 'bg-brand-500 text-white border-brand-500 font-semibold'
                    : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-surface'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
