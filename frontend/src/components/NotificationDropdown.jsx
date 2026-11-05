import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink, Briefcase, FileCheck, Info } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'application_status':
        return <FileCheck className="w-4 h-4 text-emerald-500" />;
      case 'new_application':
        return <Briefcase className="w-4 h-4 text-brand-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
        title="Notifications"
        aria-label="Open notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface/50">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-border">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 6).map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => !notif.read && markAsRead(notif._id)}
                  className={`p-3.5 hover:bg-slate-50 dark:hover:bg-dark-surface/60 transition-colors cursor-pointer flex items-start space-x-3 ${
                    !notif.read ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-dark-surface mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      {notif.link && (
                        <Link
                          to={notif.link}
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-brand-500 mt-2"></span>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 text-center border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface/50">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-500"
            >
              See all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
