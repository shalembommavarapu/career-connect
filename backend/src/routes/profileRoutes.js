import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadResumeFile,
  deleteResumeFile,
  downloadResume,
  getCandidateProfile
} from '../controllers/profileController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.post('/resume', protect, authorize(USER_ROLES.STUDENT), uploadResume.single('resume'), uploadResumeFile);
router.delete('/resume', protect, authorize(USER_ROLES.STUDENT), deleteResumeFile);
router.get('/resume/download/:filename', protect, downloadResume);
router.get('/candidate/:id', protect, authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN), getCandidateProfile);

export default router;
