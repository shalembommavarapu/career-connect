import express from 'express';
import { getSavedJobs, saveJob, unsaveJob } from '../controllers/savedJobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/', protect, authorize(USER_ROLES.STUDENT), getSavedJobs);
router.post('/:jobId', protect, authorize(USER_ROLES.STUDENT), saveJob);
router.delete('/:jobId', protect, authorize(USER_ROLES.STUDENT), unsaveJob);

export default router;
