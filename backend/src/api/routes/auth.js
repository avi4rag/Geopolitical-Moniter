import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  initiateGoogleAuth,
  handleGoogleCallback,
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

// GET /api/v1/auth/google
// Initiates standard Google OAuth 2.0 redirect flow
router.get('/google', initiateGoogleAuth);

// GET /api/v1/auth/google/callback
// Handles Google OAuth 2.0 code exchange and state verification
router.get('/google/callback', handleGoogleCallback);

// POST /api/v1/auth/google
// Direct Google token / API authentication handler
router.post('/google', googleAuth);

export default router;
