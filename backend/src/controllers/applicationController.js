import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { APPLICATION_STATUS, USER_ROLES } from '../config/constants.js';

/**
 * @route   POST /api/applications
 * @desc    Apply for an internal job opportunity
 * @access  Private (Student)
 */
export const applyJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter, resumeUrl, resumeOriginalName } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This opportunity is no longer accepting applications' });
    }

    if (job.listingType === 'external') {
      return res.status(400).json({
        success: false,
        message: 'This is an external listing. Please apply on the partner portal directly using the external link.'
      });
    }

    // Check duplicate application
    const existing = await Application.findOne({ studentId: req.user._id, jobId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this position. Check your dashboard to track your status.'
      });
    }

    // Determine resume
    const user = await User.findById(req.user._id);
    const finalResumeUrl = resumeUrl || user.resume?.url;
    const finalResumeName = resumeOriginalName || user.resume?.originalName || 'student_resume.pdf';

    if (!finalResumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume in your profile or provide one before applying.'
      });
    }

    const application = await Application.create({
      studentId: req.user._id,
      jobId: job._id,
      recruiterId: job.recruiterId,
      resumeUrl: finalResumeUrl,
      resumeOriginalName: finalResumeName,
      coverLetter: coverLetter ? coverLetter.trim() : '',
      status: APPLICATION_STATUS.APPLIED,
      statusHistory: [{
        status: APPLICATION_STATUS.APPLIED,
        note: 'Application submitted successfully by candidate',
        changedBy: req.user._id,
        changedAt: new Date()
      }]
    });

    // Increment applications count on job
    await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });

    // In-app notification to student
    await Notification.create({
      recipientId: req.user._id,
      senderId: null,
      type: 'application_status',
      title: 'Application Submitted',
      message: `Your application for "${job.title}" at ${job.companyName} was submitted successfully.`,
      link: `/student/applications`
    });

    // In-app notification to recruiter if internal recruiter exists
    if (job.recruiterId) {
      await Notification.create({
        recipientId: job.recruiterId,
        senderId: req.user._id,
        type: 'new_application',
        title: 'New Applicant Received',
        message: `${req.user.name} applied for "${job.title}".`,
        link: `/recruiter/applicants?jobId=${job._id}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! You can track its status in your dashboard.',
      application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/applications/my
 * @desc    Get all applications submitted by current student
 * @access  Private (Student)
 */
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate('jobId')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/applications/job/:jobId
 * @desc    Get applicants for a specific job
 * @access  Private (Recruiter / Admin)
 */
export const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status, search } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (req.user.role !== USER_ROLES.ADMIN && job.recruiterId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view applicants for this job' });
    }

    const filter = { jobId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('studentId', 'name email phone avatar skills education headline location resume')
      .sort({ createdAt: -1 })
      .lean();

    let filtered = applications;
    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      filtered = applications.filter(app => {
        const name = app.studentId?.name?.toLowerCase() || '';
        const email = app.studentId?.email?.toLowerCase() || '';
        const skills = (app.studentId?.skills || []).join(' ').toLowerCase();
        return name.includes(term) || email.includes(term) || skills.includes(term);
      });
    }

    res.json({
      success: true,
      job: {
        _id: job._id,
        title: job.title,
        companyName: job.companyName,
        requiredSkills: job.requiredSkills
      },
      applications: filtered
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/applications/recruiter/all
 * @desc    Get all applicants across all jobs posted by current recruiter
 * @access  Private (Recruiter)
 */
export const getAllRecruiterApplications = async (req, res, next) => {
  try {
    const recruiterJobs = await Job.find({ recruiterId: req.user._id }).select('_id');
    const jobIds = recruiterJobs.map(j => j._id);

    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title companyName requiredSkills workMode employmentType')
      .populate('studentId', 'name email phone avatar skills education headline location resume')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/applications/:id/status
 * @desc    Update candidate application status
 * @access  Private (Recruiter / Admin)
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    if (!Object.values(APPLICATION_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided' });
    }

    const application = await Application.findById(req.params.id).populate('jobId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify ownership
    if (
      req.user.role !== USER_ROLES.ADMIN &&
      application.jobId?.recruiterId?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this candidate status' });
    }

    application.status = status;
    application.statusHistory.push({
      status,
      note: note ? note.trim() : `Status changed to ${status}`,
      changedBy: req.user._id,
      changedAt: new Date()
    });

    await application.save();

    // Create in-app notification for the student
    await Notification.create({
      recipientId: application.studentId,
      senderId: req.user._id,
      type: 'application_status',
      title: `Application Status Updated: ${status}`,
      message: `Your application for "${application.jobId.title}" has been updated to "${status}". ${note ? `Note: "${note}"` : ''}`,
      link: '/student/applications'
    });

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/applications/:id/withdraw
 * @desc    Withdraw a student application
 * @access  Private (Student)
 */
export const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only withdraw your own applications' });
    }

    if (application.status === APPLICATION_STATUS.SELECTED) {
      return res.status(400).json({ success: false, message: 'Cannot withdraw an accepted or selected offer directly. Please contact the recruiter.' });
    }

    if (application.status === APPLICATION_STATUS.WITHDRAWN) {
      return res.status(400).json({ success: false, message: 'This application is already withdrawn.' });
    }

    application.status = APPLICATION_STATUS.WITHDRAWN;
    application.statusHistory.push({
      status: APPLICATION_STATUS.WITHDRAWN,
      note: 'Withdrawn by student',
      changedBy: req.user._id,
      changedAt: new Date()
    });

    await application.save();

    // Decrement application count on job
    await Job.findByIdAndUpdate(application.jobId, { $inc: { applicationsCount: -1 } });

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      application
    });
  } catch (error) {
    next(error);
  }
};
