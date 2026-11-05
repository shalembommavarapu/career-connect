import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink, FileCheck, Briefcase, Info } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { EmptyState } from '../components/EmptyState';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState('all');

  const getIcon = (type) => {
    switch (type) {
      case 'application_status':
        return <FileCheck className="w-5 h-5 text-emerald-500" />;
      case 'new_application':
        return <Briefcase className="w-5 h-5 text-brand-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const displayed = notifications.filter(n => (filter === 'unread' ? !n.read : true));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-dark-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Application status updates, recruiter messages, and system alerts
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/50 hover:bg-brand-100 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}

          <div className="flex rounded-xl bg-slate-100 dark:bg-dark-surface p-1 text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg ${filter === 'all' ? 'bg-white dark:bg-dark-card text-brand-500 shadow-sm' : 'text-slate-500'}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg ${filter === 'unread' ? 'bg-white dark:bg-dark-card text-brand-500 shadow-sm' : 'text-slate-500'}`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={filter === 'unread' ? 'You have read all of your incoming notifications.' : 'You have no notifications in your inbox yet.'}
        />
      ) : (
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border shadow-sm divide-y divide-slate-100 dark:divide-dark-border overflow-hidden">
          {displayed.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.read && markAsRead(notif._id)}
              className={`p-5 flex items-start space-x-4 hover:bg-slate-50 dark:hover:bg-dark-surface/50 transition-colors cursor-pointer ${
                !notif.read ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
              }`}
            >
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-dark-surface flex-shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {notif.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 flex-shrink-0">
                    {new Date(notif.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.link && (
                  <div className="mt-2.5">
                    <Link
                      to={notif.link}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      <span>Take Action</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>

              {!notif.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 flex-shrink-0 mt-2"></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
