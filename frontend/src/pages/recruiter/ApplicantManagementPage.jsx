import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Users,
  Search,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { applicationAPI, jobAPI, profileAPI } from '../../services/api';

export const ApplicantManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get('jobId') || 'all';

  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Candidate detail modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Status update modal
  const [statusModalApp, setStatusModalApp] = useState(null);
  const [newStatus, setNewStatus] = useState('Shortlisted');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const [jobsRes, appsRes] = await Promise.all([
          jobAPI.getRecruiterJobs(),
          selectedJobId !== 'all'
            ? applicationAPI.getJobApplications(selectedJobId)
            : applicationAPI.getRecruiterApplications()
        ]);

        if (jobsRes.success) setRecruiterJobs(jobsRes.jobs || []);
        if (appsRes.success) setApplicants(appsRes.applications || []);
      } catch (err) {
        setLoadError(err.message || 'Failed to load applicant data.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterData();
  }, [selectedJobId]);

  const handleJobSelect = (jobId) => {
    const updated = new URLSearchParams(searchParams);
    if (jobId === 'all') updated.delete('jobId');
    else updated.set('jobId', jobId);
    setSearchParams(updated);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModalApp) return;

    try {
      setUpdatingStatus(true);
      setActionError('');
      const res = await applicationAPI.updateStatus(statusModalApp._id, {
        status: newStatus,
        note: statusNote
      });

      if (res.success) {
        setApplicants(prev => prev.map(a => a._id === statusModalApp._id ? { ...a, status: newStatus } : a));
        setAlertMsg(`Updated status to "${newStatus}". In-app notification sent to student.`);
        setStatusModalApp(null);
        setStatusNote('');
        setTimeout(() => setAlertMsg(''), 4000);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to update application status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResumeDownload = async (application) => {
    try {
      setActionError('');
      const filename = application.resumeUrl?.split('/').pop();
      if (!filename) {
        throw new Error('Resume file is unavailable.');
      }
      await profileAPI.downloadResume(filename, application.resumeOriginalName);
    } catch (err) {
      setActionError(err.message || 'Failed to download resume');
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const cand = app.studentId || {};
    const name = cand.name?.toLowerCase() || '';
    const email = cand.email?.toLowerCase() || '';
    const skills = (cand.skills || []).join(' ').toLowerCase();
    const query = search.toLowerCase().trim();

    const matchesSearch = !query || name.includes(query) || email.includes(query) || skills.includes(query);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-dark-border">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Candidate Applications & Review
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review student profiles, inspect verified resumes, and update recruitment pipeline statuses
        </p>
      </div>

      {alertMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-900/50">
          {alertMsg}
        </div>
      )}
      {actionError && (
        <div role="alert" className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900/50">
          {actionError}
        </div>
      )}

      {/* Control Bar: Select Job, Search Input, Status Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
        {/* Job selector */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
            Filter by Requisition
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => handleJobSelect(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Posted Requisitions</option>
            {recruiterJobs.map(job => (
              <option key={job._id} value={job._id}>
                {job.title} ({job.applicantsCount || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Candidate Search */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
            Search Candidate or Skill
          </label>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. Aarav, React, Python..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Status filter */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
            Application Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Stages</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Candidate List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading applicants...</p>
        </div>
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={() => window.location.reload()} />
      ) : filteredApplicants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description="No candidate applications match your current filters. Share your job link with university campuses to receive more applications."
        />
      ) : (
        <div className="space-y-4">
          {filteredApplicants.map(app => {
            const student = app.studentId || {};
            const edu = student.education?.[0] || {};

            return (
              <div
                key={app._id}
                className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                <div className="flex items-start space-x-4 min-w-0">
                  {student.avatar ? (
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-100 dark:border-dark-border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-accent text-white font-black text-lg flex items-center justify-center flex-shrink-0">
                      {student.name?.charAt(0) || 'C'}
                    </div>
                  )}

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {student.name}
                      </h3>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
                        {app.jobId?.title}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {edu.degree || 'Engineering Undergrad'} • {edu.college || 'University'} (Grad {edu.graduationYear || '2026'})
                    </p>

                    {/* Candidate skills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {student.skills?.slice(0, 5).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-dark-surface text-slate-700 dark:text-slate-300">
                          {s}
                        </span>
                      ))}
                      {student.skills?.length > 5 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{student.skills.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Review Controls */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-dark-border">
                  <ApplicationStatusBadge status={app.status} />

                  {/* Resume download link */}
                  {app.resumeUrl && (
                    <button
                      type="button"
                      onClick={() => handleResumeDownload(app)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-dark-surface hover:bg-slate-200 flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedCandidate(app)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface border border-slate-200 dark:border-dark-border"
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setStatusModalApp(app);
                      setNewStatus(app.status);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-sm"
                  >
                    Update Stage
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Profile Drawer / Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>

            <div className="flex items-start space-x-4 mb-6 pb-6 border-b border-slate-100 dark:border-dark-border">
              {selectedCandidate.studentId?.avatar ? (
                <img
                  src={selectedCandidate.studentId.avatar}
                  alt={selectedCandidate.studentId.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-dark-border"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-brand-500 text-white font-bold text-xl flex items-center justify-center">
                  {selectedCandidate.studentId?.name?.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedCandidate.studentId?.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedCandidate.studentId?.headline}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedCandidate.studentId?.email} • {selectedCandidate.studentId?.phone || 'No phone'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {selectedCandidate.coverLetter && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-surface border border-slate-100 dark:border-dark-border">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider text-[10px]">
                    Cover Note / Intro
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 italic">
                    "{selectedCandidate.coverLetter}"
                  </p>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider text-[10px]">
                  Technical Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.studentId?.skills?.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider text-[10px]">
                  Education History
                </span>
                <div className="space-y-2">
                  {selectedCandidate.studentId?.education?.map((ed, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-100 dark:border-dark-border">
                      <p className="font-bold text-slate-900 dark:text-white">{ed.degree}</p>
                      <p className="text-slate-500">{ed.college} • Class of {ed.graduationYear} (CGPA: {ed.cgpa})</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-dark-border flex justify-end space-x-2">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Application Stage Modal */}
      {statusModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Update Candidate Stage
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Candidate: <span className="font-semibold text-slate-800 dark:text-slate-200">{statusModalApp.studentId?.name}</span>
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                  Feedback Note for Candidate <span className="font-normal text-slate-400">(Sent in in-app notification)</span>
                </label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Cleared initial screening. Technical discussion round scheduled for Friday 3 PM."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500"
                >
                  {updatingStatus ? 'Updating...' : 'Save & Notify Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
