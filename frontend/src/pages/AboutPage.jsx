import React from 'react';
import { Briefcase, ShieldCheck, Sparkles, Target, Users, Code, Award, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Core Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Empowering College Students to Launch Meaningful Engineering Careers
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Traditional job boards are flooded with "entry-level" roles demanding 3-5 years of industry experience. CareerConnect was built from scratch to dismantle that barrier.
        </p>
      </div>

      {/* 4 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Transparent Skill Matching
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            We reject ambiguous black-box algorithms. Our matching engine shows exactly which prerequisite technical skills you possess and points out what you need to learn next.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Verified Fresher & Campus Roles
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Every requisition posted directly on CareerConnect is reviewed to ensure zero prerequisite experience traps, transparent stipends, and active university recruitment teams.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            External Provider Integrity
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            When aggregating listings from partners such as Unstop, we provide honest attribution and seamless redirection to the official application page without unauthorized data harvesting.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Direct Recruiter Engagement
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Campus recruitment leads review candidate profiles and verified PDF resumes with one-click status transitions and direct in-app notifications to candidates.
          </p>
        </div>
      </div>

      {/* Tech Stack Callout */}
      <div className="p-8 rounded-3xl bg-gradient-to-tr from-slate-900 via-dark-card to-dark-bg border border-slate-700/50 text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-white">
          Built with the Modern MERN Stack
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Engineered with React 18, Vite, Tailwind CSS, Node.js, Express, MongoDB, Mongoose, and JWT authentication with enterprise security standards.
        </p>
        <div className="pt-2">
          <Link
            to="/jobs"
            className="inline-flex items-center px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-md transition-all"
          >
            Explore All Opportunities
          </Link>
        </div>
      </div>
    </div>
  );
};
