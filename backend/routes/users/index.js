import express from 'express';
import { registerUser, loginUser, getUserProfile } from './controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/me', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/me', protect, getUserProfile);

export default router;