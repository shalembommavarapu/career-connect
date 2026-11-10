import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  Building2,
  Share2,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  FileText,
  Upload,
  Check
} from 'lucide-react';
import { SkillMatchBadge } from '../components/SkillMatchBadge';
import { JobCard } from '../components/JobCard';
import { ErrorState } from '../components/ErrorState';
import { jobAPI, applicationAPI, savedJobAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useAuth();

  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Application Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Save state
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await jobAPI.getJobById(id);
        if (res.success) {
          setJob(res.job);
          setIsSaved(res.job.isSaved || false);
          setRelatedJobs(res.relatedJobs || []);
        } else {
          throw new Error(res.message || 'Job opportunity not found');
        }
      } catch (err) {
        setError(err.message || 'Could not load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/jobs/${id}`);
      return;
    }
    try {
      if (isSaved) {
        await savedJobAPI.unsaveJob(job._id);
        setIsSaved(false);
      } else {
        await savedJobAPI.saveJob(job._id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?redirect=/jobs/${id}`);
      return;
    }

    if (!user?.resume?.url) {
      setApplyError('You must upload a resume to your profile before applying.');
      return;
    }

    try {
      setIsSubmitting(true);
      setApplyError('');

      const res = await applicationAPI.apply({
        jobId: job._id,
        coverLetter
      });

      if (res.success) {
        setApplySuccess(true);
        setJob(prev => ({ ...prev, hasApplied: true }));
      }
    } catch (err) {
      setApplyError(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading opportunity details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <ErrorState
          title="Opportunity Not Found"
          message={error || 'This job listing may have expired or been removed.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const isExternal = job.listingType === 'external';
  const salaryDisplay = job.isInternship
    ? job.internshipDetails?.stipend || 'Competitive Stipend'
    : job.salary?.display || (job.salary?.min ? `₹${(job.salary.min / 100000).toFixed(1)} - ₹${(job.salary.max / 100000).toFixed(1)} LPA` : 'Competitive');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/jobs"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all opportunities</span>
      </Link>

      {/* Main Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border shadow-sm">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-start space-x-4 sm:space-x-5">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.companyName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 dark:border-dark-border flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-accent text-white font-black text-2xl flex items-center justify-center flex-shrink-0">
                {job.companyName?.charAt(0)}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                  {job.companyName}
                </span>
                {isExternal ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                    Source: {job.source || 'External Partner'}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                    Verified Direct Listing
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{job.location}</span>
                </span>
                <span className="capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-surface font-medium text-slate-700 dark:text-slate-300">
                  {job.workMode}
                </span>
                <span className="capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-surface font-medium text-slate-700 dark:text-slate-300">
                  {job.employmentType}
                </span>
                <span className="capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-surface font-medium text-slate-700 dark:text-slate-300">
                  {job.experienceLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-dark-border">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                Compensation
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {salaryDisplay}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveToggle}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isSaved
                    ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-300 dark:border-brand-800 text-brand-600 dark:text-brand-400'
                    : 'border-slate-200 dark:border-dark-border text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-surface'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save opportunity'}
              >
                {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>

              {isExternal ? (
                <a
                  href={job.originalUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-sm transition-all"
                >
                  <span>Apply on {job.source || 'External Portal'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : job.hasApplied ? (
                <button
                  disabled
                  className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  <span>Applied</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md hover:shadow-glow transition-all"
                >
                  <span>Apply Now</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* External Provider Notice */}
        {isExternal && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">External Opportunity Notice: </span>
              This job is hosted on {job.source || 'a partner platform'} (Unstop or affiliated partner). Clicking "Apply" will redirect you directly to the official external portal to submit your application.
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Details on left, Skill Match & Overview on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              About This Opportunity
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Key Responsibilities
              </h3>
              <ul className="space-y-2.5">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Qualifications & Requirements */}
          {job.qualifications && job.qualifications.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Qualifications & Eligibility
              </h3>
              <ul className="space-y-2.5">
                {job.qualifications.map((qual, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-sm text-slate-700 dark:text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-2"></div>
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Sidebar: Skill Match Breakdown & Company Info */}
        <div className="space-y-6">
          {/* Skill Match Breakdown Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Skill Match Analysis
                </h3>
              </div>
              {job.skillMatch && (
                <span className="text-xs font-extrabold text-brand-500">
                  {job.skillMatch.matchPercentage}%
                </span>
              )}
            </div>

            {role === 'student' && job.skillMatch ? (
              <div className="space-y-4">
                {/* Progress bar */}
                <div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-dark-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${job.skillMatch.matchPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    {job.skillMatch.details}
                  </p>
                </div>

                {/* Skills breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Matched Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skillMatch.matchedSkills?.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {s}
                      </span>
                    ))}
                    {(!job.skillMatch.matchedSkills || job.skillMatch.matchedSkills.length === 0) && (
                      <span className="text-xs text-slate-400">No overlapping skills yet</span>
                    )}
                  </div>
                </div>

                {job.skillMatch.missingSkills?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Skills Recommended to Learn
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skillMatch.missingSkills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-dark-surface text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-dark-border">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Sign in with a student profile to see your transparent skill match percentage.
                </p>
                <Link
                  to={`/login?redirect=/jobs/${job._id}`}
                  className="inline-flex items-center text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Sign In to Calculate Match
                </Link>
              </div>
            )}
          </div>

          {/* Opportunity Specs Overview */}
          <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-3 text-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-dark-border">
              Opportunity Overview
            </h3>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Posted</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
            {job.deadline && (
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Deadline</span>
                <span className="font-semibold text-rose-500">
                  {new Date(job.deadline).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Experience</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {job.experienceLevel}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Work Mode</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {job.workMode}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Total Applicants</span>
              <span className="font-semibold text-brand-500">
                {job.applicationsCount || 0} applied
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Opportunities */}
      {relatedJobs && relatedJobs.length > 0 && (
        <div className="pt-8 border-t border-slate-200/80 dark:border-dark-border space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Similar Opportunities for Freshers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedJobs.map(rel => (
              <JobCard key={rel._id} job={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 sm:p-8 shadow-2xl relative">
            {applySuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Application Submitted!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Your profile and resume were forwarded to the hiring team at {job.companyName}. You can monitor review status in your dashboard.
                </p>
                <div className="pt-4 flex justify-center space-x-3">
                  <Link
                    to="/student/applications"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500"
                  >
                    Go to Applications
                  </Link>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Apply for {job.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {job.companyName} • {job.location}
                  </p>
                </div>

                {applyError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900/40">
                    {applyError}
                  </div>
                )}

                {/* Resume Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                    Resume Document
                  </label>
                  {user?.resume?.url ? (
                    <div className="p-3.5 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/50 dark:border-brand-900/40 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <FileText className="w-5 h-5 text-brand-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {user.resume.originalName}
                          </p>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Attached from verified student profile
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/student/profile"
                        className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex-shrink-0 ml-2"
                      >
                        Change
                      </Link>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-dark-border text-center space-y-2">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        No resume uploaded on your profile yet.
                      </p>
                      <Link
                        to="/student/profile"
                        className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 text-white"
                      >
                        Upload Resume in Profile
                      </Link>
                    </div>
                  )}
                </div>

                {/* Optional Cover Letter */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                    Note or Cover Letter <span className="font-normal text-slate-400">(Optional)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Briefly highlight relevant projects, hackathons, or why you're enthusiastic about this role..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100 dark:border-dark-border">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !user?.resume?.url}
                    className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
