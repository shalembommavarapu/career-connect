import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { JobCard } from '../components/JobCard';
import { JobCardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Pagination } from '../components/Pagination';
import { jobAPI } from '../services/api';

export const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Extract parameters
  const search = searchParams.get('search') || '';
  const location = searchParams.get('location') || '';
  const workMode = searchParams.get('workMode') || '';
  const employmentType = searchParams.get('employmentType') || '';
  const experienceLevel = searchParams.get('experienceLevel') || '';
  const skills = searchParams.get('skills') || '';
  const source = searchParams.get('source') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search,
        location,
        workMode,
        employmentType,
        experienceLevel,
        skills,
        source,
        sort,
        page,
        limit: 9
      };

      const res = await jobAPI.getJobs(params);
      if (res.success) {
        setJobs(res.jobs || []);
        setPagination(res.pagination || { currentPage: 1, totalPages: 1, totalJobs: 0 });
      } else {
        throw new Error(res.message || 'Failed to load jobs');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to CareerConnect servers');
    } finally {
      setLoading(false);
    }
  }, [search, location, workMode, employmentType, experienceLevel, skills, source, sort, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        updated.set(key, val);
      } else {
        updated.delete(key);
      }
    });
    updated.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(updated);
  };

  const handleSearch = ({ search: s, location: l }) => {
    updateFilters({ search: s, location: l });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    const updated = new URLSearchParams(searchParams);
    updated.set('page', newPage.toString());
    setSearchParams(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Explore Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search across verified campus placements, tech startups, and partner platforms
          </p>
        </div>

        <SearchBar
          onSearch={handleSearch}
          initialSearch={search}
          initialLocation={location}
        />
      </div>

      {/* Control Bar: Filter Toggle for Mobile & Sort Selector */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-700 dark:text-slate-300"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
        </button>

        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
          Showing <span className="font-bold text-slate-900 dark:text-white">{pagination.totalJobs}</span> matching opportunities
        </p>

        <div className="flex items-center space-x-2 ml-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sort:</span>
          </span>
          <select
            value={sort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="newest">Newest First</option>
            <option value="salary">Highest Package</option>
            <option value="deadline">Application Deadline</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Panel */}
        <div className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} lg:col-span-1`}>
          <div className="sticky top-20">
            <FilterPanel
              filters={{ workMode, employmentType, experienceLevel, skills, source }}
              onChange={updateFilters}
              onReset={handleResetFilters}
            />
          </div>
        </div>

        {/* Listings Section */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <JobCardSkeleton key={idx} />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchJobs} />
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No opportunities found"
              description="No jobs match your current search terms or active filters. Try loosening your filters or resetting them."
              actionLabel="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>

              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
