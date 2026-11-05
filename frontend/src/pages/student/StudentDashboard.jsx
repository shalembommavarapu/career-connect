import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { DashboardStatCard } from '../../components/DashboardStatCard';
import { JobCard } from '../../components/JobCard';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
import { applicationAPI, savedJobAPI, jobAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [appsRes, savedRes, recsRes] = await Promise.all([
          applicationAPI.getMyApplications(),
          savedJobAPI.getSavedJobs(),
          jobAPI.getRecommendations()
        ]);

        if (appsRes.success) setApplications(appsRes.applications || []);
        if (savedRes.success) setSavedJobs(savedRes.savedJobs || []);
        if (recsRes.success) setRecommendations(recsRes.recommendations || []);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute live statistics
  const totalApps = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interview' || a.status === 'Selected').length;
  const underReviewCount = applications.filter(a => a.status === 'Under Review' || a.status === 'Applied').length;
  const savedCount = savedJobs.length;

  // Chart data
  const chartData = [
    { name: 'Applied', count: applications.filter(a => a.status === 'Applied').length, color: '#3b82f6' },
    { name: 'Review', count: applications.filter(a => a.status === 'Under Review').length, color: '#a855f7' },
    { name: 'Shortlisted', count: applications.filter(a => a.status === 'Shortlisted').length, color: '#6366f1' },
    { name: 'Interview', count: applications.filter(a => a.status === 'Interview').length, color: '#06b6d4' },
    { name: 'Selected', count: applications.filter(a => a.status === 'Selected').length, color: '#10b981' }
  ];

  const profileCompletion = user?.profileCompletion || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900/40 via-dark-card to-dark-bg border border-brand-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wider block mb-1">
            Student Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Track your application lifecycle, check technical skill match scores, and review incoming recruiter updates.
          </p>
        </div>

        {/* Profile Completion Meter */}
        <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border w-full md:w-72 flex-shrink-0">
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Profile Completion</span>
            <span className="font-extrabold text-brand-500">{profileCompletion}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-dark-card rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
          <Link
            to="/student/profile"
            className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center justify-between"
          >
            <span>{profileCompletion === 100 ? 'Profile Complete' : 'Complete missing details'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardStatCard
          icon={FileText}
          label="Total Applications"
          value={totalApps}
          subtext="Submitted to internal portals"
          color="brand"
        />
        <DashboardStatCard
          icon={Sparkles}
          label="Shortlisted / Interviews"
          value={shortlistedCount}
          subtext="Advanced to hiring rounds"
          color="emerald"
        />
        <DashboardStatCard
          icon={Clock}
          label="Under Review"
          value={underReviewCount}
          subtext="Pending recruiter decision"
          color="purple"
        />
        <DashboardStatCard
          icon={BookmarkCheck}
          label="Saved Opportunities"
          value={savedCount}
          subtext="Bookmarked for later"
          color="amber"
        />
      </div>

      {/* Analytics Chart & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recharts Analytics */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Application Pipeline Analytics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live distribution of your submitted applications
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-500">
              Real-Time DB
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            {totalApps > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <FileText className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs">No application analytics available yet.</p>
                <Link to="/jobs" className="text-xs text-brand-500 font-semibold hover:underline mt-1">
                  Apply for opportunities to populate your chart
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Application Activity */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Recent Activity
            </h3>
            <Link
              to="/student/applications"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3.5">
            {applications.slice(0, 4).map((app) => (
              <div
                key={app._id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-dark-surface/60 border border-slate-100 dark:border-dark-border flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {app.jobId?.title || 'Engineering Role'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {app.jobId?.companyName} • {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <ApplicationStatusBadge status={app.status} size="sm" />
              </div>
            ))}

            {applications.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8">
                No recent applications found.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Skill-Matched Recommendations */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-brand-500" />
              <span>Recommended Based on Your Skills</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked transparently by matching requirements against skills in your student profile
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-xs sm:text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.slice(0, 3).map((rec) => (
            <JobCard key={rec.job._id} job={{ ...rec.job, skillMatch: rec.match }} />
          ))}
          {recommendations.length === 0 && (
            <div className="col-span-3 p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Add skills like React, Node.js, Python, or Docker to your profile to get personalized recommendations!
              </p>
              <Link to="/student/profile" className="text-xs font-bold text-brand-500 hover:underline">
                Update Profile Skills
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
