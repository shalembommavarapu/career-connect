import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Award, Clock, ArrowRight, Building2, MapPin } from 'lucide-react';
import { SkillMatchBadge } from './SkillMatchBadge';

export const InternshipCard = ({ internship }) => {
  const details = internship.internshipDetails || {};

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border hover:border-brand-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center space-x-3 min-w-0">
            {internship.companyLogo ? (
              <img
                src={internship.companyLogo}
                alt={internship.companyName}
                className="w-12 h-12 rounded-xl object-cover border border-slate-100 dark:border-dark-border flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-accent to-purple-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
                {internship.companyName?.charAt(0) || 'I'}
              </div>
            )}
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block truncate">
                {internship.companyName}
              </span>
              <Link to={`/jobs/${internship._id}`}>
                <h3 className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-500 transition-colors line-clamp-1">
                  {internship.title}
                </h3>
              </Link>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 whitespace-nowrap">
            Internship
          </span>
        </div>

        {/* Highlight Stats: Duration & Stipend */}
        <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-surface/50 border border-slate-100 dark:border-dark-border/60">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Stipend</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {details.stipend || 'Competitive'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Duration</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {details.duration || 'Flexible'}
            </span>
          </div>
        </div>

        {/* Perks pill row */}
        {details.perks && details.perks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {details.perks.slice(0, 3).map((perk, i) => (
              <span
                key={i}
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-brand-50/60 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 border border-brand-200/40 dark:border-brand-900/40"
              >
                <Award className="w-2.5 h-2.5" />
                <span>{perk}</span>
              </span>
            ))}
          </div>
        )}

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {internship.requiredSkills?.slice(0, 3).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-surface text-slate-700 dark:text-slate-300 text-[11px] font-medium"
            >
              {skill}
            </span>
          ))}
          {internship.skillMatch && <SkillMatchBadge match={internship.skillMatch} />}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-dark-border flex items-center justify-between">
        <div className="flex items-center space-x-1 text-slate-400 text-xs">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate max-w-[140px]">{internship.location}</span>
        </div>
        <Link
          to={`/jobs/${internship._id}`}
          className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500"
        >
          <span>Apply Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
