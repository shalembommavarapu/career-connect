import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs,
  getRecommendations
} from '../controllers/jobController.js';
import { protect, optionalAuth, authorize } from '../middleware/authMiddleware.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/', optionalAuth, getJobs);
router.get('/student/recommendations', protect, authorize(USER_ROLES.STUDENT), getRecommendations);
router.get('/recruiter/my-jobs', protect, authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN), getRecruiterJobs);
router.get('/:id', optionalAuth, getJobById);
router.post('/', protect, authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN), createJob);
router.put('/:id', protect, authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN), updateJob);
router.delete('/:id', protect, authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN), deleteJob);

export default router;
