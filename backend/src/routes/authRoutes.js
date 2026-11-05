import express from 'express';
import { register, login, getMe, updatePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegisterInput, validateLoginInput } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', validateRegisterInput, register);
router.post('/login', validateLoginInput, login);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

export default router;
