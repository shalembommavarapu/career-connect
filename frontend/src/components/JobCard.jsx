import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Bookmark, BookmarkCheck, ExternalLink, Building2 } from 'lucide-react';
import { SkillMatchBadge } from './SkillMatchBadge';
import { savedJobAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const JobCard = ({ job, onSavedToggle }) => {
  const { user, isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(job.isSaved || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/jobs/${job._id}`;
      return;
    }

    try {
      setIsSaving(true);
      if (isSaved) {
        await savedJobAPI.unsaveJob(job._id);
        setIsSaved(false);
        if (onSavedToggle) onSavedToggle(job._id, false);
      } else {
        await savedJobAPI.saveJob(job._id);
        setIsSaved(true);
        if (onSavedToggle) onSavedToggle(job._id, true);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getSourceBadge = () => {
    if (job.source === 'Unstop') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
          <span>Unstop Feed</span>
          <ExternalLink className="w-3 h-3" />
        </span>
      );
    }
    if (job.listingType === 'external') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          <span>Partner Listing</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
        <span>Verified Internal</span>
      </span>
    );
  };

  const salaryDisplay = job.isInternship
    ? job.internshipDetails?.stipend || job.salary?.display || 'Paid Internship'
    : job.salary?.display || (job.salary?.min ? `₹${(job.salary.min / 100000).toFixed(1)} - ₹${(job.salary.max / 100000).toFixed(1)} LPA` : 'Competitive');

  return (
    <div className="group relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border hover:border-brand-500/40 dark:hover:border-brand-500/40 shadow-sm hover:shadow-xl dark:hover:shadow-glow/20 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Header: Company & Save Button */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center space-x-3.5 min-w-0">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.companyName}
                className="w-12 h-12 rounded-xl object-cover border border-slate-100 dark:border-dark-border flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-accent text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                {job.companyName?.charAt(0) || 'C'}
              </div>
            )}
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                {job.companyName}
              </h4>
              <Link to={`/jobs/${job._id}`}>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors line-clamp-1">
                  {job.title}
                </h3>
              </Link>
            </div>
          </div>

          <button
            onClick={handleSaveToggle}
            disabled={isSaving}
            className={`p-2 rounded-xl border transition-colors ${
              isSaved
                ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-300 dark:border-brand-800 text-brand-600 dark:text-brand-400'
                : 'border-slate-200 dark:border-dark-border text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-surface'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save job'}
            aria-label="Save Job"
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        {/* Badges row: source, mode, type */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          {getSourceBadge()}
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-dark-surface text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-dark-border capitalize">
            {job.workMode}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-dark-surface text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-dark-border capitalize">
            {job.employmentType}
          </span>
          {job.skillMatch && <SkillMatchBadge match={job.skillMatch} />}
        </div>

        {/* Short description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>

        {/* Skills pill tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.requiredSkills?.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-surface/80 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
            >
              {skill}
            </span>
          ))}
          {job.requiredSkills?.length > 4 && (
            <span className="px-1.5 py-0.5 text-[10px] text-slate-400 dark:text-slate-500 self-center">
              +{job.requiredSkills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Info: Location & Salary & Action */}
      <div className="pt-3.5 border-t border-slate-100 dark:border-dark-border flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-xs mb-0.5 truncate">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            {salaryDisplay}
          </div>
        </div>

        <Link
          to={`/jobs/${job._id}`}
          className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-brand-600 dark:bg-slate-800 dark:hover:bg-brand-600 transition-colors flex-shrink-0 shadow-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};
