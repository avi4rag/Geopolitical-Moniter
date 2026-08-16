import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  googleAuth,
} from '../controllers/authController.js';
import { optionalAuth } from '../middleware/auth.js';

// ─── Auth Router ──────────────────────────────────────────────────────────────
const router = Router();

// POST /api/v1/auth/register
router.post('/register', register);

// POST /api/v1/auth/login
router.post('/login', login);

// POST /api/v1/auth/logout
router.post('/logout', logout);

// GET /api/v1/auth/me
router.get('/me', optionalAuth, getMe);

// POST /api/v1/auth/google
router.post('/google', googleAuth);

export default router;
