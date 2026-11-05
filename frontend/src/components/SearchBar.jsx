import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';

export const SearchBar = ({ onSearch, initialSearch = '', initialLocation = '' }) => {
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search, location });
  };

  const handleClear = () => {
    setSearch('');
    setLocation('');
    onSearch({ search: '', location: '' });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full p-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-lg dark:shadow-glow/10 flex flex-col md:flex-row items-center gap-2"
    >
      <div className="relative flex-1 w-full flex items-center">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Job title, technical skill, or company (e.g. React, Node, Google)..."
          className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-dark-border"></div>

      <div className="relative flex-1 w-full md:max-w-xs flex items-center">
        <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, State, or 'Remote'..."
          className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
        />
        {location && (
          <button
            type="button"
            onClick={() => setLocation('')}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2 w-full md:w-auto">
        <button
          type="submit"
          className="w-full md:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-brand-accent hover:from-brand-500 hover:to-brand-accent/90 shadow-sm hover:shadow-glow transition-all"
        >
          Find Opportunities
        </button>
        {(search || location) && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-surface"
            title="Reset Search"
          >
            Reset
          </button>
        )}
      </div>
    </form>
  );
};
