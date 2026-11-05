import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GraduationCap, Award, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { InternshipCard } from '../components/InternshipCard';
import { JobCardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Pagination } from '../components/Pagination';
import { jobAPI } from '../services/api';

export const InternshipsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [internships, setInternships] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isPaid = searchParams.get('isPaid') || '';
  const workMode = searchParams.get('workMode') || '';
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page')) || 1;

  const fetchInternships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        isInternship: true,
        isPaid: isPaid ? isPaid === 'true' : undefined,
        workMode: workMode || undefined,
        search: search || undefined,
        page,
        limit: 9
      };

      const res = await jobAPI.getJobs(params);
      if (res.success) {
        setInternships(res.jobs || []);
        setPagination(res.pagination || { currentPage: 1, totalPages: 1, totalJobs: 0 });
      } else {
        throw new Error(res.message || 'Failed to load internships');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [isPaid, workMode, search, page]);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  const updateParam = (key, val) => {
    const updated = new URLSearchParams(searchParams);
    if (val) updated.set(key, val);
    else updated.delete(key);
    updated.set('page', '1');
    setSearchParams(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-900/40 via-brand-900/30 to-dark-card border border-purple-500/20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Summer & Off-Campus Internships 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">
            Accelerate Your Engineering Career
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Gain real-world experience, learn production engineering workflows, and earn competitive stipends with Pre-Placement Offer (PPO) potential.
          </p>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">Compensation:</span>
          <button
            onClick={() => updateParam('isPaid', '')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              !isPaid
                ? 'bg-brand-600 text-white border-brand-600'
                : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400'
            }`}
          >
            All Internships
          </button>
          <button
            onClick={() => updateParam('isPaid', 'true')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              isPaid === 'true'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400'
            }`}
          >
            Paid Only
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">Work Mode:</span>
          {['', 'remote', 'hybrid', 'on-site'].map(mode => (
            <button
              key={mode}
              onClick={() => updateParam('workMode', mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-colors ${
                workMode === mode
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400'
              }`}
            >
              {mode || 'All Modes'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Internships */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <JobCardSkeleton key={idx} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchInternships} />
        ) : internships.length === 0 ? (
          <EmptyState
            title="No internships match your criteria"
            description="Try switching the compensation or work mode filter to explore more opportunities."
            actionLabel="Reset Filters"
            onAction={() => setSearchParams(new URLSearchParams())}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.map((internship) => (
                <InternshipCard key={internship._id} internship={internship} />
              ))}
            </div>

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(p) => {
                const u = new URLSearchParams(searchParams);
                u.set('page', p.toString());
                setSearchParams(u);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};
