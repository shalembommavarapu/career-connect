import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlusCircle, Briefcase, GraduationCap, DollarSign, Calendar, MapPin, X, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { jobAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const PostJobPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editJobId = searchParams.get('edit');
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState(user?.company?.name || '');
  const [companyLogo, setCompanyLogo] = useState(user?.company?.logo || '');
  const [description, setDescription] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [qualificationsText, setQualificationsText] = useState('');
  const [location, setLocation] = useState('Remote (Pan India)');
  const [workMode, setWorkMode] = useState('remote');
  const [employmentType, setEmploymentType] = useState('full-time');
  const [isInternship, setIsInternship] = useState(false);
  const [internshipDuration, setInternshipDuration] = useState('6 Months');
  const [internshipStipend, setInternshipStipend] = useState('₹35,000 / month');
  const [experienceLevel, setExperienceLevel] = useState('fresher');
  const [salaryMin, setSalaryMin] = useState(800000);
  const [salaryMax, setSalaryMax] = useState(1400000);
  const [deadline, setDeadline] = useState('');

  // Skills tags
  const [skills, setSkills] = useState(['React', 'Node.js', 'JavaScript']);
  const [newSkill, setNewSkill] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (editJobId) {
      const loadJob = async () => {
        try {
          setLoading(true);
          const res = await jobAPI.getJobById(editJobId);
          if (res.success && res.job) {
            const j = res.job;
            setTitle(j.title);
            setCompanyName(j.companyName);
            setCompanyLogo(j.companyLogo || '');
            setDescription(j.description);
            setResponsibilitiesText((j.responsibilities || []).join('\n'));
            setQualificationsText((j.qualifications || []).join('\n'));
            setLocation(j.location);
            setWorkMode(j.workMode);
            setEmploymentType(j.employmentType);
            setIsInternship(Boolean(j.isInternship));
            if (j.internshipDetails) {
              setInternshipDuration(j.internshipDetails.duration || '6 Months');
              setInternshipStipend(j.internshipDetails.stipend || '₹30,000 / month');
            }
            setExperienceLevel(j.experienceLevel);
            setSalaryMin(j.salary?.min || 600000);
            setSalaryMax(j.salary?.max || 1200000);
            setSkills(j.requiredSkills || []);
            if (j.deadline) {
              setDeadline(new Date(j.deadline).toISOString().split('T')[0]);
            }
          }
        } catch (err) {
          setError(err.message || 'Failed to load existing job details');
        } finally {
          setLoading(false);
        }
      };
      loadJob();
    }
  }, [editJobId]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !location || skills.length === 0) {
      setError('Please provide all mandatory fields: Title, Description, Location, and at least one Skill.');
      return;
    }

    const payload = {
      title,
      companyName: companyName || user?.company?.name || 'Company',
      companyLogo,
      description,
      responsibilities: responsibilitiesText.split('\n').map(s => s.trim()).filter(Boolean),
      qualifications: qualificationsText.split('\n').map(s => s.trim()).filter(Boolean),
      location,
      workMode,
      employmentType: isInternship ? 'internship' : employmentType,
      isInternship,
      internshipDetails: isInternship ? {
        duration: internshipDuration,
        stipend: internshipStipend,
        isPaid: true,
        perks: ['Certificate', 'Pre-Placement Offer (PPO) Potential', 'Flexible Hours']
      } : undefined,
      experienceLevel,
      salary: {
        min: Number(salaryMin),
        max: Number(salaryMax),
        currency: 'INR',
        display: isInternship ? internshipStipend : `₹${(salaryMin / 100000).toFixed(1)} - ₹${(salaryMax / 100000).toFixed(1)} LPA`
      },
      requiredSkills: skills,
      deadline: deadline ? new Date(deadline) : null
    };

    try {
      setSubmitting(true);
      if (editJobId) {
        await jobAPI.updateJob(editJobId, payload);
        setSuccessMsg('Job requisition updated successfully!');
      } else {
        await jobAPI.createJob(payload);
        setSuccessMsg('New job requisition published successfully!');
      }
      setTimeout(() => navigate('/recruiter/manage-jobs'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to save job requisition');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-dark-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {editJobId ? 'Edit Job Requisition' : 'Post New Campus / Fresher Role'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Specify technical skills, requirements, and compensation for fresh engineering graduates
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-900/50 flex items-center space-x-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900/50 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-dark-border">
            1. Role Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Associate Software Engineer (Fresher 2026)"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Company Display Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Stripe, Google Cloud"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Opportunity Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setIsInternship(false); setEmploymentType('full-time'); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    !isInternship
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Full-Time Job
                </button>
                <button
                  type="button"
                  onClick={() => { setIsInternship(true); setEmploymentType('internship'); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    isInternship
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400'
                  }`}
                >
                  College Internship
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Work Mode
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="remote">Remote (Work from Anywhere)</option>
                <option value="hybrid">Hybrid (Office + Remote)</option>
                <option value="on-site">On-Site (Office)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru, Karnataka / Remote"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                Application Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Compensation */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-dark-border">
            2. Compensation & Benefits
          </h3>

          {isInternship ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                  Monthly Stipend
                </label>
                <input
                  type="text"
                  value={internshipStipend}
                  onChange={(e) => setInternshipStipend(e.target.value)}
                  placeholder="e.g. ₹35,000 / month"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                  Internship Duration
                </label>
                <input
                  type="text"
                  value={internshipDuration}
                  onChange={(e) => setInternshipDuration(e.target.value)}
                  placeholder="e.g. 6 Months (Summer 2026)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                  Minimum Salary (INR / Year)
                </label>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="800000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                  Maximum Salary (INR / Year)
                </label>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="1400000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Required Skills Tagger */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-dark-border">
            3. Required Technical Skills (Matching Engine)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            These skills power CareerConnect's transparent matching percentage for students.
          </p>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="p-0.5 hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-2 max-w-sm">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. Docker, Python, AWS..."
              className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* Descriptions and Responsibilities */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-dark-border">
            4. Job Description & Responsibilities
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
              Role Overview / Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of the squad, core technologies, and day-to-day work..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
              Responsibilities <span className="font-normal text-slate-400">(One per line)</span>
            </label>
            <textarea
              rows={4}
              value={responsibilitiesText}
              onChange={(e) => setResponsibilitiesText(e.target.value)}
              placeholder="Design and implement verified features in React and Node.js
Write automated unit and integration tests
Participate in agile sprints and code reviews"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
              Qualifications & Eligibility <span className="font-normal text-slate-400">(One per line)</span>
            </label>
            <textarea
              rows={3}
              value={qualificationsText}
              onChange={(e) => setQualificationsText(e.target.value)}
              placeholder="Enrolled in or completed B.Tech / B.E / BCA or equivalent degree
Strong foundation in algorithms and computer science concepts"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/recruiter/manage-jobs')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md hover:shadow-glow transition-all disabled:opacity-50"
          >
            {submitting ? 'Publishing...' : editJobId ? 'Save Changes' : 'Publish Opportunity'}
          </button>
        </div>
      </form>
    </div>
  );
};
