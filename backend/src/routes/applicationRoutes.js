import express from 'express';
import {
  applyJob,
  getMyApplications,
  getJobApplications,
  getAllRecruiterApplications,
  updateApplicationStatus,
  withdrawApplication
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

router.post('/', protect, authorize(USER_ROLES.STUDENT), applyJob);
router.get('/my', protect, authorize(USER_ROLES.STUDENT), getMyApplications);
router.get('/recruiter/all', protect, authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN), getAllRecruiterApplications);
router.get('/job/:jobId', protect, authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN), getJobApplications);
router.patch('/:id/status', protect, authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN), updateApplicationStatus);
router.patch('/:id/withdraw', protect, authorize(USER_ROLES.STUDENT), withdrawApplication);

export default router;
