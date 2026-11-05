import React, { useState, useEffect } from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import { JobCard } from '../../components/JobCard';
import { JobCardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { savedJobAPI } from '../../services/api';

export const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await savedJobAPI.getSavedJobs();
      if (res.success) {
        setSavedJobs(res.savedJobs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleSavedToggle = (jobId, isSaved) => {
    if (!isSaved) {
      setSavedJobs(prev => prev.filter(j => j._id !== jobId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-200/80 dark:border-dark-border">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Saved Opportunities
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review your bookmarked jobs and internships stored securely in the database
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <JobCardSkeleton key={idx} />
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Bookmark jobs and internships while browsing to keep track of deadlines and apply when ready."
          actionLabel="Explore Opportunities"
          actionLink="/jobs"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
            <JobCard key={job._id} job={job} onSavedToggle={handleSavedToggle} />
          ))}
        </div>
      )}
    </div>
  );
};
