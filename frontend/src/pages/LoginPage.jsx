import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectUrl = searchParams.get('redirect') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password });
      if (res.success) {
        if (redirectUrl) {
          navigate(redirectUrl);
        } else if (res.user.role === 'admin') {
          navigate('/admin');
        } else if (res.user.role === 'recruiter') {
          navigate('/recruiter');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Sign in to access your CareerConnect workspace
          </p>
        </div>

        {import.meta.env.DEV && (
          <div className="p-3.5 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/50 dark:border-brand-900/40">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick-Fill Demo Credentials:</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('student@demo.dev', 'Student@123')}
                className="py-1.5 px-2 rounded-lg bg-white dark:bg-dark-card border border-brand-300 dark:border-brand-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-brand-100 dark:hover:bg-dark-surface transition-colors"
              >
                👨‍🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('marcus@stripe.dev', 'Recruiter@123')}
                className="py-1.5 px-2 rounded-lg bg-white dark:bg-dark-card border border-brand-300 dark:border-brand-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-brand-100 dark:hover:bg-dark-surface transition-colors"
              >
                💼 Recruiter
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@careerconnect.dev', 'Admin@123')}
                className="py-1.5 px-2 rounded-lg bg-white dark:bg-dark-card border border-brand-300 dark:border-brand-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-brand-100 dark:hover:bg-dark-surface transition-colors"
              >
                🛡️ Admin
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900/50 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@demo.dev"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-md hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Register as Student or Recruiter
          </Link>
        </p>
      </div>
    </div>
  );
};
