import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle2,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Building2,
  ExternalLink
} from 'lucide-react';
import { DashboardStatCard } from '../../components/DashboardStatCard';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
import { jobAPI, applicationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, appsRes] = await Promise.all([
          jobAPI.getRecruiterJobs(),
          applicationAPI.getRecruiterApplications()
        ]);

        if (jobsRes.success) setJobs(jobsRes.jobs || []);
        if (appsRes.success) setApplications(appsRes.applications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeJobsCount = jobs.filter(j => j.status === 'active').length;
  const totalApplicants = applications.length;
  const shortlistedApplicants = applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interview').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Recruiter Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 via-dark-card to-dark-bg border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
            Recruiter Workspace • {user?.company?.name || 'Enterprise'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Manage your open campus requisitions, review qualified college freshers, and advance candidates through your hiring funnel.
          </p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md hover:shadow-glow transition-all flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <DashboardStatCard
          icon={Briefcase}
          label="Active Requisitions"
          value={activeJobsCount}
          subtext="Currently receiving applications"
          color="brand"
        />
        <DashboardStatCard
          icon={Users}
          label="Total Candidates"
          value={totalApplicants}
          subtext="Submitted verified resumes"
          color="purple"
        />
        <DashboardStatCard
          icon={CheckCircle2}
          label="Shortlisted / In Interview"
          value={shortlistedApplicants}
          subtext="Advanced in recruitment stages"
          color="emerald"
        />
      </div>

      {/* Grid: Posted Jobs Summary + Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Active Postings */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Your Posted Requisitions
            </h3>
            <Link
              to="/recruiter/manage-jobs"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Manage All ({jobs.length})
            </Link>
          </div>

          <div className="space-y-3">
            {jobs.slice(0, 4).map(job => (
              <div
                key={job._id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-surface/60 border border-slate-100 dark:border-dark-border flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {job.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {job.location} • <span className="capitalize">{job.employmentType}</span> • Posted {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    {job.applicantsCount || 0} applicants
                  </span>
                  <Link
                    to={`/recruiter/applicants?jobId=${job._id}`}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Review Applicants"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}

            {jobs.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                You haven't posted any job listings yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Candidate Submissions */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Recent Candidate Applications
            </h3>
            <Link
              to="/recruiter/applicants"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Review All Candidates
            </Link>
          </div>

          <div className="space-y-3">
            {applications.slice(0, 4).map(app => (
              <div
                key={app._id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-surface/60 border border-slate-100 dark:border-dark-border flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {app.studentId?.avatar ? (
                    <img
                      src={app.studentId.avatar}
                      alt={app.studentId.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-dark-border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {app.studentId?.name?.charAt(0) || 'C'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {app.studentId?.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Applied for: {app.jobId?.title}
                    </p>
                  </div>
                </div>
                <ApplicationStatusBadge status={app.status} size="sm" />
              </div>
            ))}

            {applications.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                No candidate submissions received yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
