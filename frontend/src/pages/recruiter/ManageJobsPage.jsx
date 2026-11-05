import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, PlusCircle, Edit3, Trash2, Power, Eye, AlertCircle } from 'lucide-react';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { EmptyState } from '../../components/EmptyState';
import { jobAPI } from '../../services/api';

export const ManageJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getRecruiterJobs();
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
  }, []);

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      const res = await jobAPI.updateJob(job._id, { status: newStatus });
      if (res.success) {
        setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status: newStatus } : j));
        setMessage(`Job listing set to ${newStatus}.`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
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
        setMessage('Job requisition and applications removed.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-dark-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Manage Job Requisitions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish, edit, pause, or remove open roles created under your recruiter account
          </p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md hover:shadow-glow transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Role</span>
        </Link>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-900/50">
          {message}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading your job postings...</p>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job requisitions created yet"
          description="Create your first fresher job or college internship listing to start receiving candidate applications."
          actionLabel="Post New Job"
          actionLink="/recruiter/post-job"
        />
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div
              key={job._id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
                    job.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                  }`}>
                    {job.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 capitalize">
                    {job.employmentType} • {job.workMode}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  {job.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {job.location} • Posted {new Date(job.createdAt).toLocaleDateString()}
                  {job.deadline && ` • Deadline: ${new Date(job.deadline).toLocaleDateString()}`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2.5 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-dark-border">
                <Link
                  to={`/recruiter/applicants?jobId=${job._id}`}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center space-x-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{job.applicantsCount || 0} Candidates</span>
                </Link>

                <Link
                  to={`/jobs/${job._id}`}
                  className="p-2 rounded-xl border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface"
                  title="View Public Listing"
                >
                  <Eye className="w-4 h-4" />
                </Link>

                <Link
                  to={`/recruiter/post-job?edit=${job._id}`}
                  className="p-2 rounded-xl border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface"
                  title="Edit Requisition"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleToggleStatus(job)}
                  className={`p-2 rounded-xl border transition-colors ${
                    job.status === 'active'
                      ? 'border-amber-300 dark:border-amber-800 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                      : 'border-emerald-300 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  }`}
                  title={job.status === 'active' ? 'Close/Pause Job' : 'Reactivate Job'}
                >
                  <Power className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setJobToDelete(job)}
                  className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!jobToDelete}
        title="Delete Job Requisition?"
        message={`Are you sure you want to permanently delete "${jobToDelete?.title}"? All applicant records for this job will also be removed.`}
        confirmLabel="Delete Job"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setJobToDelete(null)}
      />
    </div>
  );
};
