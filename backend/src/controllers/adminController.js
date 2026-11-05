import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import AuditLog from '../models/AuditLog.js';
import { USER_ROLES } from '../config/constants.js';

/**
 * @route   GET /api/admin/overview
 * @desc    Get complete platform stats and analytics
 * @access  Private (Admin)
 */
export const getOverviewStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalRecruiters,
      totalJobs,
      activeJobs,
      externalJobs,
      internshipsCount,
      totalApplications,
      applicationsByStatus,
      recentUsers,
      recentApplications
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: USER_ROLES.STUDENT }),
      User.countDocuments({ role: USER_ROLES.RECRUITER }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments({ listingType: 'external' }),
      Job.countDocuments({ isInternship: true }),
      Application.countDocuments(),
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      User.find().select('-passwordHash').sort({ createdAt: -1 }).limit(5).lean(),
      Application.find()
        .populate('studentId', 'name email avatar')
        .populate('jobId', 'title companyName')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    // Format status breakdown
    const statusCounts = {};
    applicationsByStatus.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          students: totalStudents,
          recruiters: totalRecruiters
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          external: externalJobs,
          internships: internshipsCount
        },
        applications: {
          total: totalApplications,
          byStatus: statusCounts
        },
        recentUsers,
        recentApplications
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get paginated users list with filters
 * @access  Private (Admin)
 */
export const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 15 } = req.query;

    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { 'company.name': { $regex: term, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 15, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [users, totalUsers] = await Promise.all([
      User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Change user status (active/suspended) with audit logging
 * @access  Private (Admin)
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const targetUserId = req.params.id;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be active or suspended.' });
    }

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admins cannot suspend their own account.' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    // Create audit log
    await AuditLog.create({
      actorId: req.user._id,
      action: `USER_STATUS_${status.toUpperCase()}`,
      targetType: 'User',
      targetId: user._id,
      details: { previousStatus: oldStatus, newStatus: status, userEmail: user.email },
      ipAddress: req.ip || ''
    });

    res.json({
      success: true,
      message: `User account has been set to ${status}.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user account and associated data
 * @access  Private (Admin)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admins cannot delete their own account.' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await Promise.all([
      User.findByIdAndDelete(targetUserId),
      Job.deleteMany({ recruiterId: targetUserId }),
      Application.deleteMany({ studentId: targetUserId }),
      AuditLog.create({
        actorId: req.user._id,
        action: 'USER_DELETED',
        targetType: 'User',
        targetId: user._id,
        details: { deletedEmail: user.email, name: user.name, role: user.role },
        ipAddress: req.ip || ''
      })
    ]);

    res.json({
      success: true,
      message: `User account for ${user.email} removed permanently.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/jobs
 * @desc    Get all jobs for moderation with filters
 * @access  Private (Admin)
 */
export const getAdminJobs = async (req, res, next) => {
  try {
    const { status, listingType, search, page = 1, limit = 15 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (listingType && listingType !== 'all') {
      query.listingType = listingType;
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { companyName: { $regex: term, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 15, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [jobs, totalJobs] = await Promise.all([
      Job.find(query).populate('recruiterId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Job.countDocuments(query)
    ]);

    res.json({
      success: true,
      jobs,
      pagination: {
        totalJobs,
        totalPages: Math.ceil(totalJobs / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/jobs/:id/status
 * @desc    Moderate job listing status
 * @access  Private (Admin)
 */
export const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const oldStatus = job.status;
    job.status = status;
    await job.save();

    await AuditLog.create({
      actorId: req.user._id,
      action: `JOB_STATUS_${status.toUpperCase()}`,
      targetType: 'Job',
      targetId: job._id,
      details: { previousStatus: oldStatus, newStatus: status, title: job.title },
      ipAddress: req.ip || ''
    });

    res.json({
      success: true,
      message: `Job listing status updated to ${status}.`,
      job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit trail of system activities
 * @access  Private (Admin)
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [logs, totalLogs] = await Promise.all([
      AuditLog.find().populate('actorId', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      AuditLog.countDocuments()
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        totalLogs,
        totalPages: Math.ceil(totalLogs / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};
