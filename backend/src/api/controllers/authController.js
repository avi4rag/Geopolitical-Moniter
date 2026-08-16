import jwt from 'jsonwebtoken';
import { User } from '../../models/index.js';
import { registerSchema, loginSchema, googleAuthSchema } from '../validators/authValidators.js';
import { setAuthCookie, clearAuthCookie } from '../middleware/auth.js';
import { env } from '../../config/env.js';

// ─── Auth Controller ──────────────────────────────────────────────────────────
// Handles registration, login, logout, profile checks, and Google OAuth.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate signed JWT token for user id.
 */
function signToken(userId) {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: '7d' });
}

/**
 * POST /api/v1/auth/register
 * Register a new user with name, email, password.
 */
export async function register(req, res, next) {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: issue.message },
      });
    }

    const { name, email, password } = parseResult.data;

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'EMAIL_IN_USE', message: 'An account with this email already exists' },
      });
    }

    // Hash password & create user
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      authProvider: 'LOCAL',
    });

    const token = signToken(user._id);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/login
 * Log in with email and password.
 */
export async function login(req, res, next) {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: issue.message },
      });
    }

    const { email, password } = parseResult.data;

    // Query user WITH passwordHash
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const token = signToken(user._id);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/logout
 * Clear HTTP-only auth cookie.
 */
export async function logout(req, res) {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    data: { message: 'Successfully logged out' },
    error: null,
  });
}

/**
 * GET /api/v1/auth/me
 * Get current authenticated user profile.
 */
export async function getMe(req, res) {
  if (!req.user) {
    return res.status(200).json({
      success: true,
      data: { user: null },
      error: null,
    });
  }

  res.status(200).json({
    success: true,
    data: {
      user: req.user.toJSON(),
    },
    error: null,
  });
}

/**
 * POST /api/v1/auth/google
 * Authenticate or register with Google OAuth credential token.
 */
export async function googleAuth(req, res, next) {
  try {
    const { name, email, googleId, avatar } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'INVALID_PAYLOAD', message: 'Google account email is required' },
      });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId: googleId || `google-${Date.now()}`,
        avatar: avatar || '',
        authProvider: 'GOOGLE',
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = user.passwordHash ? 'BOTH' : 'GOOGLE';
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save();
    }

    const token = signToken(user._id);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
}
