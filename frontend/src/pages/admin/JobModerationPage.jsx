import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Power, Trash2, ExternalLink, Eye, ShieldAlert } from 'lucide-react';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { adminAPI, jobAPI } from '../../services/api';

export const JobModerationPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [listingTypeFilter, setListingTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getJobs({
        status: statusFilter,
        listingType: listingTypeFilter,
        search
      });
      if (res.success) {
        setJobs(res.jobs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, listingTypeFilter]);

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      const res = await adminAPI.updateJobStatus(job._id, nextStatus);
      if (res.success) {
        setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status: nextStatus } : j));
        setMsg(`Job listing status changed to ${nextStatus}.`);
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    try {
      setDeleting(true);
      const res = await jobAPI.deleteJob(jobToDelete._id);
      if (res.success) {
        setJobs(prev => prev.filter(j => j._id !== jobToDelete._id));
        setJobToDelete(null);
        setMsg('Job opportunity removed permanently.');
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-200/80 dark:border-dark-border">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Job Requisition Moderation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review, moderate, close, or remove flagged opportunities across internal and external feeds
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-900/50">
          {msg}
        </div>
      )}

      {/* Control Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            placeholder="Search by title or company..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <select
            value={listingTypeFilter}
            onChange={(e) => setListingTypeFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Opportunity Types</option>
            <option value="internal">Internal Direct Postings</option>
            <option value="external">External / Unstop Feeds</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Moderation Statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed / Paused</option>
          </select>
        </div>
      </div>

      {/* Moderation Table */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading listings...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No job listings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-dark-surface/60 border-b border-slate-200 dark:border-dark-border text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Opportunity</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Applicants</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {jobs.map(job => (
                  <tr key={job._id} className="hover:bg-slate-50 dark:hover:bg-dark-surface/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{job.title}</p>
                        <p className="text-[11px] text-slate-500">{job.companyName} • {job.location}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {job.source || 'Internal'}
                      </span>
                    </td>
                    <td className="p-4 capitalize">
                      {job.employmentType}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        job.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-brand-500">
                      {job.applicationsCount || 0}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a
                          href={`/jobs/${job._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                          title="View Listing"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleToggleStatus(job)}
                          className={`p-1.5 rounded-lg border ${
                            job.status === 'active' ? 'border-amber-300 text-amber-600' : 'border-emerald-300 text-emerald-600'
                          }`}
                          title="Toggle Status"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setJobToDelete(job)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!jobToDelete}
        title="Remove Job Listing?"
        message={`Are you sure you want to moderate and remove "${jobToDelete?.title}" from the platform?`}
        confirmLabel="Remove Job"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setJobToDelete(null)}
      />
    </div>
  );
};
