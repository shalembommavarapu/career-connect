import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';
import { calculateSkillMatch } from '../services/matchingService.js';

/**
 * @route   GET /api/saved-jobs
 * @desc    Get all jobs saved by current user
 * @access  Private (Student)
 */
export const getSavedJobs = async (req, res, next) => {
  try {
    const savedRecords = await SavedJob.find({ userId: req.user._id })
      .populate('jobId')
      .sort({ createdAt: -1 })
      .lean();

    const studentSkills = req.user.skills || [];

    const jobs = savedRecords
      .filter(record => record.jobId !== null)
      .map(record => {
        const job = record.jobId;
        const skillMatch = studentSkills.length > 0
          ? calculateSkillMatch(studentSkills, job.requiredSkills)
          : null;

        return {
          ...job,
          savedAt: record.createdAt,
          skillMatch,
          isSaved: true
        };
      });

    res.json({
      success: true,
      savedJobs: jobs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/saved-jobs/:jobId
 * @desc    Save/bookmark a job
 * @access  Private
 */
export const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const existing = await SavedJob.findOne({ userId: req.user._id, jobId });
    if (existing) {
      return res.json({ success: true, message: 'Job is already saved', isSaved: true });
    }

    await SavedJob.create({
      userId: req.user._id,
      jobId
    });

    res.status(201).json({
      success: true,
      message: 'Job saved to your bookmarks',
      isSaved: true
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/saved-jobs/:jobId
 * @desc    Remove a saved job
 * @access  Private
 */
export const unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    await SavedJob.findOneAndDelete({ userId: req.user._id, jobId });

    res.json({
      success: true,
      message: 'Job removed from your saved list',
      isSaved: false
    });
  } catch (error) {
    next(error);
  }
};
