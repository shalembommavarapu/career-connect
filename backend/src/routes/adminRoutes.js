import express from 'express';
import {
  getOverviewStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  getAdminJobs,
  updateJobStatus,
  getAuditLogs
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);
router.use(authorize(USER_ROLES.ADMIN));

router.get('/overview', getOverviewStats);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/jobs', getAdminJobs);
router.patch('/jobs/:id/status', updateJobStatus);
router.get('/audit-logs', getAuditLogs);

export default router;
