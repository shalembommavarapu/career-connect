import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Compass,
  GraduationCap,
  Building2,
  Info,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Bookmark,
  Shield,
  PlusCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-brand-500 ${
      isActive
        ? 'text-brand-600 dark:text-brand-400 font-semibold'
        : 'text-slate-600 dark:text-slate-300'
    }`;

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'recruiter') return '/recruiter';
    return '/student/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-dark-border bg-white/80 dark:bg-dark-bg/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-accent p-0.5 shadow-glow/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Career<span className="text-brand-500">Connect</span>
            </span>
            <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-brand-500/10 text-brand-500 uppercase tracking-wider">
              Freshers
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink to="/jobs" className={navLinkClass}>
            Find Jobs
          </NavLink>
          <NavLink to="/internships" className={navLinkClass}>
            Internships
          </NavLink>
          <NavLink to="/companies" className={navLinkClass}>
            Top Companies
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </nav>

        {/* Right Section: Theme Toggle, Notifications, User Menu */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          {/* Theme Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* In-app Notifications Dropdown */}
          {isAuthenticated && <NotificationDropdown />}

          {/* Auth State Actions */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-1 pl-2 pr-2.5 rounded-full border border-slate-200 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-dark-surface transition-colors focus:outline-none"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-brand-500/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline max-w-[100px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface/50">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      {role} Account
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface"
                    >
                      <Compass className="w-4 h-4 text-brand-500" />
                      <span>Dashboard</span>
                    </Link>

                    {role === 'student' && (
                      <>
                        <Link
                          to="/student/applications"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface"
                        >
                          <FileText className="w-4 h-4 text-emerald-500" />
                          <span>My Applications</span>
                        </Link>
                        <Link
                          to="/student/saved-jobs"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface"
                        >
                          <Bookmark className="w-4 h-4 text-amber-500" />
                          <span>Saved Jobs</span>
                        </Link>
                        <Link
                          to="/student/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface"
                        >
                          <User className="w-4 h-4 text-purple-500" />
                          <span>Profile & Resume</span>
                        </Link>
                      </>
                    )}

                    {role === 'recruiter' && (
                      <>
                        <Link
                          to="/recruiter/post-job"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface"
                        >
                          <PlusCircle className="w-4 h-4 text-emerald-500" />
                          <span>Post New Job</span>
                        </Link>
                        <Link
                          to="/recruiter/manage-jobs"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface"
                        >
                          <Briefcase className="w-4 h-4 text-blue-500" />
                          <span>Manage Jobs</span>
                        </Link>
                        <Link
                          to="/recruiter/applicants"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface"
                        >
                          <GraduationCap className="w-4 h-4 text-brand-500" />
                          <span>Review Candidates</span>
                        </Link>
                      </>
                    )}

                    {role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface"
                      >
                        <Shield className="w-4 h-4 text-rose-500" />
                        <span>Platform Moderation</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-dark-border">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-500 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-sm hover:shadow-glow transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface"
            >
              Find Jobs
            </Link>
            <Link
              to="/internships"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface"
            >
              Internships
            </Link>
            <Link
              to="/companies"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface"
            >
              Top Companies
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface"
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
