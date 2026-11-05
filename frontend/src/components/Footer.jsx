import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-dark-border bg-white dark:bg-dark-card/60 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-accent p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-brand-400" />
                </div>
              </div>
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                Career<span className="text-brand-500">Connect</span>
              </span>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The premier job & internship portal purpose-built for college students, freshers, and university placement squads. Transparent skill matching, zero noise.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Verified Entry-Level Listings</span>
            </div>
          </div>

          {/* Student Hub */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              For Freshers & Students
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/jobs" className="hover:text-brand-500 transition-colors">
                  Campus & Fresher Jobs
                </Link>
              </li>
              <li>
                <Link to="/internships" className="hover:text-brand-500 transition-colors">
                  Paid Summer Internships
                </Link>
              </li>
              <li>
                <Link to="/student/dashboard" className="hover:text-brand-500 transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/student/profile" className="hover:text-brand-500 transition-colors">
                  Resume & Skill Profile
                </Link>
              </li>
              <li>
                <Link to="/student/saved-jobs" className="hover:text-brand-500 transition-colors">
                  Saved Opportunities
                </Link>
              </li>
            </ul>
          </div>

          {/* Recruiters & Universities */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              For Recruiters & Campus
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/recruiter" className="hover:text-brand-500 transition-colors">
                  Recruiter Dashboard
                </Link>
              </li>
              <li>
                <Link to="/recruiter/post-job" className="hover:text-brand-500 transition-colors">
                  Post Fresher Role
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-brand-500 transition-colors">
                  Partner Companies
                </Link>
              </li>
              <li>
                <Link to="/register?role=recruiter" className="hover:text-brand-500 transition-colors">
                  Recruiter Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparency & Disclaimer */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Platform & Integrity
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              External listings (such as curated Unstop opportunities) redirect candidates directly to the official external provider. We never store unauthorized third-party credentials or charge students application fees.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-brand-600 dark:text-brand-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack MERN Architecture</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} CareerConnect Portal. Built for early-career developers & freshers.</p>
          <div className="flex items-center space-x-4">
            <Link to="/about" className="hover:text-brand-500 transition-colors">About Us</Link>
            <Link to="/login" className="hover:text-brand-500 transition-colors">Portal Access</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-brand-500 transition-colors">
              GitHub Project
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
