import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Briefcase,
  FileText,
  AlertTriangle,
  History,
  TrendingUp,
  ExternalLink,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { DashboardStatCard } from '../../components/DashboardStatCard';
import { adminAPI } from '../../services/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getOverview();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading platform oversight metrics...</p>
      </div>
    );
  }

  const roleDistribution = [
    { name: 'Students', count: stats.users?.students || 0, color: '#6366f1' },
    { name: 'Recruiters', count: stats.users?.recruiters || 0, color: '#3b82f6' }
  ];

  const jobsBreakdown = [
    { name: 'Internal Direct', count: (stats.jobs?.total || 0) - (stats.jobs?.external || 0), color: '#10b981' },
    { name: 'External / Unstop', count: stats.jobs?.external || 0, color: '#f59e0b' },
    { name: 'Internships', count: stats.jobs?.internships || 0, color: '#8b5cf6' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-dark-card to-dark-bg border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            CareerConnect Platform Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            System moderation, security compliance, active listings oversight, and user auditing
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/admin/users"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition-colors"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/jobs"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-sm"
          >
            Job Moderation
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardStatCard
          icon={Users}
          label="Registered Users"
          value={stats.users?.total || 0}
          subtext={`${stats.users?.students || 0} Students • ${stats.users?.recruiters || 0} Recruiters`}
          color="brand"
        />
        <DashboardStatCard
          icon={Briefcase}
          label="Total Opportunities"
          value={stats.jobs?.total || 0}
          subtext={`${stats.jobs?.active || 0} Active Requisitions`}
          color="purple"
        />
        <DashboardStatCard
          icon={FileText}
          label="Total Applications"
          value={stats.applications?.total || 0}
          subtext="Processed through platform"
          color="emerald"
        />
        <DashboardStatCard
          icon={ExternalLink}
          label="External Feeds"
          value={stats.jobs?.external || 0}
          subtext="Unstop & Curated Partner jobs"
          color="amber"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Opportunity Source Distribution */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-dark-border">
            Opportunity Breakdown by Category
          </h3>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobsBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  {jobsBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Statuses Breakdown */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-dark-border">
            Application Pipeline Breakdown
          </h3>
          <div className="space-y-3 pt-2">
            {Object.entries(stats.applications?.byStatus || {}).map(([st, cnt], idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{st}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 dark:text-white">{cnt}</span>
                  <div className="w-24 h-2 bg-slate-100 dark:bg-dark-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${Math.min((cnt / Math.max(stats.applications?.total || 1, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Admin Actions & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registrations */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Recent Registrations
            </h3>
            <Link to="/admin/users" className="text-xs text-brand-500 font-semibold hover:underline">
              View All Users
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentUsers?.map(usr => (
              <div key={usr._id} className="p-3 rounded-2xl bg-slate-50 dark:bg-dark-surface/60 border border-slate-100 dark:border-dark-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{usr.name}</p>
                  <p className="text-[11px] text-slate-500">{usr.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  {usr.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Administration Links */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-dark-border">
            Administrative Modules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/admin/users"
              className="p-4 rounded-2xl border border-slate-200 dark:border-dark-border hover:border-brand-500 transition-colors text-left group"
            >
              <Users className="w-5 h-5 text-brand-500 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">User Accounts</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Activate or suspend accounts</p>
            </Link>

            <Link
              to="/admin/jobs"
              className="p-4 rounded-2xl border border-slate-200 dark:border-dark-border hover:border-brand-500 transition-colors text-left group"
            >
              <Briefcase className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Job Moderation</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Flag or remove invalid listings</p>
            </Link>

            <Link
              to="/admin/audit-logs"
              className="p-4 rounded-2xl border border-slate-200 dark:border-dark-border hover:border-brand-500 transition-colors text-left group"
            >
              <History className="w-5 h-5 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Audit Logs</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Review security & moderator logs</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
