import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Compass,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  TrendingUp,
  ShieldCheck,
  Code2,
  Cpu,
  Cloud,
  Palette,
  ShieldAlert
} from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { JobCard } from '../components/JobCard';
import { InternshipCard } from '../components/InternshipCard';
import { JobCardSkeleton } from '../components/LoadingSkeleton';
import { jobAPI } from '../services/api';

const POPULAR_CATEGORIES = [
  { name: 'Software Engineering', icon: Code2, count: '140+ Openings', color: 'from-blue-500 to-indigo-600' },
  { name: 'Data Science & AI', icon: Cpu, count: '65+ Openings', color: 'from-purple-500 to-pink-600' },
  { name: 'Cloud & DevOps', icon: Cloud, count: '48+ Openings', color: 'from-cyan-500 to-blue-600' },
  { name: 'Product & UI/UX', icon: Palette, count: '32+ Openings', color: 'from-amber-500 to-orange-600' },
  { name: 'Cybersecurity', icon: ShieldAlert, count: '24+ Openings', color: 'from-emerald-500 to-teal-600' }
];

const TOP_COMPANIES = [
  { name: 'Google Cloud', logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&h=120&fit=crop', jobs: '4 Roles', type: 'Tech Giant' },
  { name: 'Stripe', logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&h=120&fit=crop', jobs: '3 Roles', type: 'FinTech' },
  { name: 'Cisco', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop', jobs: '2 Roles', type: 'Networking' },
  { name: 'Zomato', logo: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=120&h=120&fit=crop', jobs: '2 Internships', type: 'Consumer Tech' },
  { name: 'Samsung R&D', logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=120&h=120&fit=crop', jobs: '1 Internship', type: 'Research' }
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'internships'
  const [jobs, setJobs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, internsRes] = await Promise.all([
          jobAPI.getJobs({ isInternship: false, limit: 6 }),
          jobAPI.getJobs({ isInternship: true, limit: 6 })
        ]);

        if (jobsRes.success) setJobs(jobsRes.jobs || []);
        if (internsRes.success) setInternships(internsRes.jobs || []);
      } catch (err) {
        console.error('Failed to load homepage opportunities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = ({ search, location }) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (location) params.append('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden border-b border-slate-200/60 dark:border-dark-border">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/15 dark:bg-brand-500/20 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 dark:bg-brand-500/15 border border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built Specifically for College Students & Freshers</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
            Your Next Opportunity <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-indigo-500 to-brand-accent">
              Starts Right Here.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover verified campus placements, summer internships, and graduate trainee positions. Experience transparent skill matching with zero gatekeeping.
          </p>

          {/* Search Bar Component */}
          <div className="max-w-3xl mx-auto mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Quick tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Trending Searches:</span>
            {['React Developer', 'Full Stack Intern', 'Python Fresher', 'Cloud Engineer', 'Remote'].map((tag, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch({ search: tag, location: '' })}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:border-brand-500 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Explore by Technical Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Find entry-level roles aligned directly with your tech stack
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-xs sm:text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
          >
            <span>Browse All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {POPULAR_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                onClick={() => handleSearch({ search: cat.name, location: '' })}
                className="group cursor-pointer p-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border hover:border-brand-500/50 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                  {cat.count}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Opportunities Section with Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Featured Opportunities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Hand-picked verified openings with active recruitment cycles
            </p>
          </div>

          {/* Tabs */}
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-dark-surface border border-slate-200/60 dark:border-dark-border flex space-x-1">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'jobs'
                  ? 'bg-white dark:bg-dark-card text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Full-Time Jobs
            </button>
            <button
              onClick={() => setActiveTab('internships')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'internships'
                  ? 'bg-white dark:bg-dark-card text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Internships
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <JobCardSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'jobs' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {internships.map((internship) => (
                  <InternshipCard key={internship._id} internship={internship} />
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-10 text-center">
          <Link
            to={activeTab === 'jobs' ? '/jobs' : '/internships'}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-brand-600 dark:bg-dark-surface dark:hover:bg-brand-600 border border-slate-700/50 transition-all shadow-sm"
          >
            <span>View All {activeTab === 'jobs' ? 'Jobs' : 'Internships'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Top Hiring Companies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-100 to-white dark:from-dark-card dark:to-dark-bg border border-slate-200 dark:border-dark-border">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Hiring Campuses & Startups
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              Leading global enterprises and hyper-growth startups actively recruiting fresh engineering talent
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {TOP_COMPANIES.map((comp, idx) => (
              <div
                key={idx}
                onClick={() => handleSearch({ search: comp.name, location: '' })}
                className="p-5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border/80 text-center hover:border-brand-500 cursor-pointer transition-all shadow-sm group"
              >
                <img
                  src={comp.logo}
                  alt={comp.name}
                  className="w-14 h-14 rounded-2xl object-cover mx-auto mb-3 border border-slate-100 dark:border-dark-border group-hover:scale-105 transition-transform"
                />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {comp.name}
                </h4>
                <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                  {comp.jobs}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {comp.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            How CareerConnect Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            A frictionless pathway from college classrooms to premier engineering teams
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border relative">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-black text-lg flex items-center justify-center mb-4">
              01
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Create Verified Student Profile
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Showcase your degree, technical skills, GitHub repositories, and verified PDF resume. No convoluted application forms.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border relative">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black text-lg flex items-center justify-center mb-4">
              02
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Transparent Skill-Match Discovery
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Instantly see your exact match percentage for every opportunity. Understand which skills qualify you and which to learn next.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-lg flex items-center justify-center mb-4">
              03
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Apply & Real-Time Tracking
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Apply in one click with your stored resume. Receive in-app notifications as recruiters review, shortlist, and schedule interviews.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-accent p-8 sm:p-14 text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Ready to Kickstart Your Career Journey?
            </h2>
            <p className="text-brand-100 text-sm sm:text-base mb-8 leading-relaxed">
              Join thousands of undergraduate students and fresh graduates discovering their first dream roles at high-growth engineering startups.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl font-bold text-sm bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-lg"
              >
                Create Student Account
              </Link>
              <Link
                to="/register?role=recruiter"
                className="px-6 py-3 rounded-xl font-bold text-sm bg-brand-800/60 hover:bg-brand-800 border border-white/20 text-white transition-colors"
              >
                Recruiter Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
