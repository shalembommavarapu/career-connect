import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  FileText,
  Upload,
  Trash2,
  Download,
  Plus,
  X,
  Check,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { profileAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const StudentProfile = () => {
  const { user, updateUserState } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Skill input state
  const [newSkill, setNewSkill] = useState('');

  // Resume upload state
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await profileAPI.getProfile();
        if (res.success) {
          setProfile(res.profile);
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleBasicChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const skillToAdd = newSkill.trim();
    if (!profile.skills?.includes(skillToAdd)) {
      setProfile(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillToAdd]
      }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setMessage('');

      const res = await profileAPI.updateProfile(profile);
      if (res.success) {
        setProfile(res.profile);
        updateUserState({
          name: res.profile.name,
          headline: res.profile.headline,
          skills: res.profile.skills,
          avatar: res.profile.avatar,
          profileCompletion: res.profile.profileCompletion
        });
        setMessage('Profile details saved successfully!');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Resume file exceeds maximum limit of 5 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploadingResume(true);
      setError('');
      setMessage('');

      const res = await profileAPI.uploadResume(formData);
      if (res.success) {
        setProfile(prev => ({
          ...prev,
          resume: res.resume,
          profileCompletion: res.profileCompletion
        }));
        updateUserState({
          resume: res.resume,
          profileCompletion: res.profileCompletion
        });
        setMessage('Resume document uploaded and verified successfully!');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    try {
      setUploadingResume(true);
      const res = await profileAPI.deleteResume();
      if (res.success) {
        setProfile(prev => ({
          ...prev,
          resume: null,
          profileCompletion: res.profileCompletion
        }));
        updateUserState({
          resume: null,
          profileCompletion: res.profileCompletion
        });
        setMessage('Resume removed successfully.');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete resume');
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading student profile...</p>
      </div>
    );
  }

  const completion = profile.profileCompletion || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with completion meter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-dark-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Student Profile & Verified Resume
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Keep your skills, degree credentials, and resume updated to qualify for fresher jobs
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white dark:bg-dark-card p-3 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-sm">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Completeness</span>
            <span className="text-sm font-extrabold text-brand-500">{completion}%</span>
          </div>
          <div className="w-16 h-2 bg-slate-100 dark:bg-dark-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full"
              style={{ width: `${completion}%` }}
            ></div>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-900/50 flex items-center space-x-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900/50 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Section 1: Personal Details */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-brand-500" />
            <span>Personal Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => handleBasicChange('name', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Email Address <span className="font-normal text-slate-400">(Read-Only)</span>
              </label>
              <input
                type="email"
                disabled
                value={profile.email || ''}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface/50 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Professional Headline
              </label>
              <input
                type="text"
                value={profile.headline || ''}
                onChange={(e) => handleBasicChange('headline', e.target.value)}
                placeholder="e.g. Final Year B.Tech CSE | Full Stack Developer"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Current Location
              </label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => handleBasicChange('location', e.target.value)}
                placeholder="e.g. Bengaluru, Karnataka"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => handleBasicChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Avatar Image URL
              </label>
              <input
                type="text"
                value={profile.avatar || ''}
                onChange={(e) => handleBasicChange('avatar', e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
              About / Bio
            </label>
            <textarea
              rows={3}
              value={profile.bio || ''}
              onChange={(e) => handleBasicChange('bio', e.target.value)}
              placeholder="Tell recruiters about your engineering passions, favorite technologies, and career aspirations..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Section 2: Resume Document Management */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-500" />
            <span>Resume Document (PDF / DOC / DOCX)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload your verified resume. This is automatically attached when you apply to internal postings. (Max 5 MB)
          </p>

          {profile.resume?.url ? (
            <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-3 rounded-xl bg-brand-600 text-white flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {profile.resume.originalName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Uploaded: {new Date(profile.resume.uploadedAt).toLocaleDateString()} • {Math.round((profile.resume.size || 0) / 1024)} KB
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <a
                  href={`/api/profile/resume/download/${profile.resume.url.split('/').pop()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-surface/80 flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={handleDeleteResume}
                  disabled={uploadingResume}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-dark-border text-center">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Upload your latest resume
              </p>
              <p className="text-[11px] text-slate-400 mb-4">
                Supported formats: PDF, DOC, DOCX up to 5 MB
              </p>
              <label className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 cursor-pointer shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingResume ? 'Uploading...' : 'Choose File'}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Section 3: Technical Skills Tagger */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-emerald-500" />
              <span>Technical Skills</span>
            </h2>
            <span className="text-xs text-brand-500 font-semibold">
              Powering match calculations
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Skills listed here are compared directly against employer prerequisites to determine your match percentage.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {profile.skills?.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="p-0.5 hover:text-rose-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-2 pt-2 max-w-sm">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. React, Docker, Python..."
              className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-dark-surface hover:bg-brand-600 dark:hover:bg-brand-600 transition-colors"
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* Section 4: Education */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            <span>Education & Degree</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Degree & Major
              </label>
              <input
                type="text"
                value={profile.education?.[0]?.degree || ''}
                onChange={(e) => {
                  const edu = [...(profile.education || [{}])];
                  edu[0] = { ...edu[0], degree: e.target.value };
                  setProfile(prev => ({ ...prev, education: edu }));
                }}
                placeholder="e.g. B.Tech in Computer Science"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                College / University
              </label>
              <input
                type="text"
                value={profile.education?.[0]?.college || ''}
                onChange={(e) => {
                  const edu = [...(profile.education || [{}])];
                  edu[0] = { ...edu[0], college: e.target.value };
                  setProfile(prev => ({ ...prev, education: edu }));
                }}
                placeholder="e.g. National Institute of Technology (NIT)"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Graduation Year
              </label>
              <input
                type="number"
                value={profile.education?.[0]?.graduationYear || 2026}
                onChange={(e) => {
                  const edu = [...(profile.education || [{}])];
                  edu[0] = { ...edu[0], graduationYear: Number(e.target.value) };
                  setProfile(prev => ({ ...prev, education: edu }));
                }}
                placeholder="2026"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                CGPA / Percentage
              </label>
              <input
                type="text"
                value={profile.education?.[0]?.cgpa || ''}
                onChange={(e) => {
                  const edu = [...(profile.education || [{}])];
                  edu[0] = { ...edu[0], cgpa: e.target.value };
                  setProfile(prev => ({ ...prev, education: edu }));
                }}
                placeholder="e.g. 8.8 / 10"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Online Profiles & Portfolios */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FolderGit2 className="w-5 h-5 text-amber-500" />
            <span>Developer Links & Socials</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                GitHub Profile
              </label>
              <input
                type="url"
                value={profile.socialLinks?.github || ''}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, github: e.target.value }
                }))}
                placeholder="https://github.com/..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                LinkedIn Profile
              </label>
              <input
                type="url"
                value={profile.socialLinks?.linkedin || ''}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                }))}
                placeholder="https://linkedin.com/in/..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Portfolio Website
              </label>
              <input
                type="url"
                value={profile.socialLinks?.portfolio || ''}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, portfolio: e.target.value }
                }))}
                placeholder="https://myportfolio.dev"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-md hover:shadow-glow transition-all disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </div>
      </form>
    </div>
  );
};
