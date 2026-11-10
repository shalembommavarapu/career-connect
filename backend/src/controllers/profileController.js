import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import Application from '../models/Application.js';
import { USER_ROLES } from '../config/constants.js';

const deleteResumeIfUnused = async (resumeUrl) => {
  if (!resumeUrl || await Application.exists({ resumeUrl })) {
    return;
  }

  const filePath = path.resolve('uploads', 'resumes', path.basename(resumeUrl));
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

/**
 * @route   GET /api/profile
 * @desc    Get logged in user profile with calculated completion
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const data = user.toObject();
    data.profileCompletion = user.calculateProfileCompletion();

    res.json({
      success: true,
      profile: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/profile/:id
 * @desc    Get candidate profile (accessible to authorized recruiters / admin)
 * @access  Private (Recruiter / Admin)
 */
export const getCandidateProfile = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    if (req.user.role === USER_ROLES.STUDENT && req.user._id.toString() !== targetUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Students cannot inspect other student profiles.'
      });
    }

    const candidate = await User.findById(targetUserId).select('-passwordHash');
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found' });
    }

    const data = candidate.toObject();
    data.profileCompletion = candidate.calculateProfileCompletion();

    res.json({
      success: true,
      candidate: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/profile
 * @desc    Update user profile details
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      headline,
      bio,
      phone,
      location,
      avatar,
      education,
      skills,
      projects,
      certifications,
      socialLinks,
      preferences,
      company
    } = req.body;

    if (name) user.name = name.trim();
    if (headline !== undefined) user.headline = headline;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (avatar !== undefined) user.avatar = avatar;

    // Student fields
    if (Array.isArray(skills)) user.skills = skills.map(s => s.trim()).filter(Boolean);
    if (Array.isArray(education)) user.education = education;
    if (Array.isArray(projects)) user.projects = projects;
    if (Array.isArray(certifications)) user.certifications = certifications;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    // Recruiter fields
    if (company && user.role === USER_ROLES.RECRUITER) {
      user.company = { ...user.company, ...company };
    }

    await user.save();

    const data = user.toObject();
    data.profileCompletion = user.calculateProfileCompletion();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/profile/resume
 * @desc    Upload student resume document
 * @access  Private (Student)
 */
export const uploadResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded. Please attach a valid PDF or Word document.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await deleteResumeIfUnused(user.resume?.url);

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    user.resume = {
      url: resumeUrl,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date()
    };

    await user.save();

    res.json({
      success: true,
      message: 'Resume uploaded and verified successfully',
      resume: user.resume,
      profileCompletion: user.calculateProfileCompletion()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/profile/resume
 * @desc    Delete student resume document
 * @access  Private (Student)
 */
export const deleteResumeFile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await deleteResumeIfUnused(user.resume?.url);

    user.resume = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Resume removed successfully',
      profileCompletion: user.calculateProfileCompletion()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/profile/resume/download/:filename
 * @desc    Secure download with authorization check
 * @access  Private
 */
export const downloadResume = async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.resolve('uploads', 'resumes', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Resume file not found' });
    }

    // Check authorization: Must be owner, an authorized recruiter who received an application, or admin
    if (req.user.role === USER_ROLES.STUDENT) {
      if (!req.user.resume?.url?.includes(filename)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to download this resume' });
      }
    } else if (req.user.role === USER_ROLES.RECRUITER) {
      // Verify student applied to one of recruiter's jobs
      const hasApplication = await Application.findOne({
        recruiterId: req.user._id,
        resumeUrl: `/uploads/resumes/${filename}`
      });

      if (!hasApplication && req.user.role !== USER_ROLES.ADMIN) {
        return res.status(403).json({ success: false, message: 'Unauthorized to access this candidate document' });
      }
    }

    res.download(filePath);
  } catch (error) {
    next(error);
  }
};
