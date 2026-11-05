import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { applicationAPI } from '../../services/api';

export const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedAppHistory, setSelectedAppHistory] = useState(null);

  // Withdraw state
  const [appToWithdraw, setAppToWithdraw] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationAPI.getMyApplications();
      if (res.success) {
        setApplications(res.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdrawConfirm = async () => {
    if (!appToWithdraw) return;
    try {
      setWithdrawing(true);
      const res = await applicationAPI.withdraw(appToWithdraw._id);
      if (res.success) {
        setActionMessage('Application withdrawn successfully');
        setAppToWithdraw(null);
        fetchApplications();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWithdrawing(false);
    }
  };

  const displayedApplications = applications.filter(app => {
    if (filteredStatus === 'all') return true;
    return app.status === filteredStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-dark-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            My Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track real-time hiring review progress, interview calls, and status updates
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-semibold">Filter:</span>
          <select
            value={filteredStatus}
            onChange={(e) => setFilteredStatus(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Applications ({applications.length})</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-900/50">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading your applications...</p>
        </div>
      ) : displayedApplications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications in this category"
          description="You haven't submitted applications with this status yet. Discover new campus roles to apply!"
          actionLabel="Find Opportunities"
          actionLink="/jobs"
        />
      ) : (
        <div className="space-y-4">
          {displayedApplications.map((app) => (
            <div
              key={app._id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-brand-500/40 transition-colors"
            >
              <div className="flex items-start space-x-4 min-w-0">
                {app.jobId?.companyLogo ? (
                  <img
                    src={app.jobId.companyLogo}
                    alt={app.jobId.companyName}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-100 dark:border-dark-border flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                    {app.jobId?.companyName?.charAt(0) || 'J'}
                  </div>
                )}
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {app.jobId?.companyName || 'Internal Company'}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs text-slate-400">
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to={`/jobs/${app.jobId?._id}`}
                    className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-500 transition-colors block truncate"
                  >
                    {app.jobId?.title || 'Job Listing'}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {app.jobId?.location} • {app.jobId?.workMode} • Attached: {app.resumeOriginalName}
                  </p>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-dark-border">
                <ApplicationStatusBadge status={app.status} />

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setSelectedAppHistory(app)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface border border-slate-200 dark:border-dark-border flex items-center space-x-1"
                  >
                    <span>Timeline</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {app.status !== 'Selected' && app.status !== 'Rejected' && app.status !== 'Withdrawn' && (
                    <button
                      onClick={() => setAppToWithdraw(app)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Withdraw Application"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status History Timeline Modal */}
      {selectedAppHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 shadow-2xl relative">
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100 dark:border-dark-border">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Application Timeline
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedAppHistory.jobId?.title} at {selectedAppHistory.jobId?.companyName}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppHistory(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-2">
              {selectedAppHistory.statusHistory?.map((entry, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs relative">
                  <div className="p-1 rounded-full bg-brand-500 text-white mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {entry.status}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(entry.changedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5 italic">
                        "{entry.note}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-dark-border text-right">
              <button
                onClick={() => setSelectedAppHistory(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-brand-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Withdraw */}
      <ConfirmationModal
        isOpen={!!appToWithdraw}
        title="Withdraw Application?"
        message={`Are you sure you want to withdraw your application for "${appToWithdraw?.jobId?.title}"? The recruiter will be notified.`}
        confirmLabel="Confirm Withdrawal"
        isDestructive={true}
        isLoading={withdrawing}
        onConfirm={handleWithdrawConfirm}
        onClose={() => setAppToWithdraw(null)}
      />
    </div>
  );
};
