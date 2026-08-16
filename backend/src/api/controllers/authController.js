import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../../models/index.js';
import { registerSchema, loginSchema, googleAuthSchema } from '../validators/authValidators.js';
import { setAuthCookie, clearAuthCookie } from '../middleware/auth.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

// ─── Auth Controller ──────────────────────────────────────────────────────────
// Handles registration, login, logout, profile checks, and standard Google OAuth 2.0 / OpenID Connect.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate signed JWT token for user id.
 */
function signToken(userId) {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: '7d' });
}

/**
 * Helper to get or create OAuth2Client instance for Google Authentication.
 */
function getGoogleOAuth2Client() {
  if (!env.googleClientId || !env.googleClientSecret) {
    return null;
  }
  return new OAuth2Client(
    env.googleClientId,
    env.googleClientSecret,
    env.googleCallbackUrl
  );
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

    // Check if user is Google-only account without password
    if (!user.passwordHash) {
      return res.status(401).json({
        success: false,
        data: null,
        error: {
          code: 'GOOGLE_AUTH_REQUIRED',
          message: 'This account was created with Google. Please sign in with Google.',
        },
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
 * GET /api/v1/auth/google
 * Initiates the standard Google OAuth 2.0 authorization redirect.
 * Includes cryptographically secure state protection stored in an HTTP-only cookie.
 */
export async function initiateGoogleAuth(req, res) {
  try {
    const oauth2Client = getGoogleOAuth2Client();

    if (!oauth2Client) {
      logger.warn('Google OAuth is not configured in backend/.env');
      return res.redirect(
        `${env.frontendUrl}/login?error=GOOGLE_OAUTH_NOT_CONFIGURED`
      );
    }

    // 1. Generate cryptographically random state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // 2. Store state parameter in a short-lived HTTP-only cookie (10 min expiry)
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: env.isProduction ? 'none' : 'lax',
      maxAge: 10 * 60 * 1000,
    });

    // 3. Generate Google authorization URL with minimal scopes and online access (no offline refresh tokens)
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'online', // GeoMonitor only needs authentication, no offline API access
      scope: ['openid', 'profile', 'email'], // Minimal authentication scopes
      state,
      prompt: 'select_account',
    });

    res.redirect(authorizeUrl);
  } catch (err) {
    logger.error({ err }, 'Failed to initiate Google OAuth');
    res.redirect(`${env.frontendUrl}/login?error=OAUTH_INITIATION_FAILED`);
  }
}

/**
 * GET /api/v1/auth/google/callback
 * Handles OAuth 2.0 authorization code callback from Google.
 * Verifies state, exchanges code for ID token, cryptographically verifies the token,
 * provisions/logs in user in MongoDB, sets HTTP-only auth cookie, and redirects to frontend.
 */
export async function handleGoogleCallback(req, res, next) {
  try {
    const { code, state, error } = req.query;
    const storedState = req.cookies.oauth_state;

    // Clear state cookie immediately
    res.clearCookie('oauth_state', {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: env.isProduction ? 'none' : 'lax',
    });

    // Handle user cancellation or Google error
    if (error) {
      logger.warn({ error }, 'Google OAuth returned error or was cancelled by user');
      return res.redirect(`${env.frontendUrl}/login?error=OAUTH_CANCELLED`);
    }

    // Verify OAuth state matches stored transaction state (CSRF mitigation)
    if (!state || !storedState || state !== storedState) {
      logger.warn('Google OAuth state mismatch detected');
      return res.redirect(`${env.frontendUrl}/login?error=INVALID_OAUTH_STATE`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect(`${env.frontendUrl}/login?error=MISSING_AUTH_CODE`);
    }

    const oauth2Client = getGoogleOAuth2Client();
    if (!oauth2Client) {
      return res.redirect(`${env.frontendUrl}/login?error=GOOGLE_OAUTH_NOT_CONFIGURED`);
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.id_token) {
      logger.error('Google token exchange did not return an id_token');
      return res.redirect(`${env.frontendUrl}/login?error=TOKEN_EXCHANGE_FAILED`);
    }

    // Cryptographically verify Google ID Token (signature, audience, issuer, expiry)
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      return res.redirect(`${env.frontendUrl}/login?error=INVALID_USER_PAYLOAD`);
    }

    const googleId = payload.sub; // Stable Google Subject ID
    const email = payload.email.toLowerCase();
    const name = payload.name || payload.given_name || 'Google Reader';
    const avatar = payload.picture || '';

    // Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // Create new user (no fake password stored!)
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        authProvider: 'GOOGLE',
      });
      logger.info({ userId: user._id, email }, 'New user registered via Google OAuth');
    } else if (!user.googleId) {
      // Link existing account with Google
      user.googleId = googleId;
      user.authProvider = user.passwordHash ? 'BOTH' : 'GOOGLE';
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save();
      logger.info({ userId: user._id, email }, 'Linked existing user with Google OAuth');
    }

    // Set signed JWT session cookie
    const token = signToken(user._id);
    setAuthCookie(res, token);

    // Redirect back to frontend
    res.redirect(`${env.frontendUrl}/?auth=google_success`);
  } catch (err) {
    logger.error({ err }, 'Google OAuth callback processing failed');
    res.redirect(`${env.frontendUrl}/login?error=OAUTH_PROCESSING_FAILED`);
  }
}

/**
 * POST /api/v1/auth/google
 * Direct credential / mock handler for testing and API integration.
 */
export async function googleAuth(req, res, next) {
  try {
    let { name, email, googleId, avatar, credential } = req.body;

    // If Google ID Token is provided directly
    if (credential && typeof credential === 'string') {
      try {
        const oauth2Client = getGoogleOAuth2Client();
        if (oauth2Client && env.googleClientId) {
          const ticket = await oauth2Client.verifyIdToken({
            idToken: credential,
            audience: env.googleClientId,
          });
          const payload = ticket.getPayload();
          if (payload) {
            email = payload.email;
            name = payload.name || name;
            googleId = payload.sub || googleId;
            avatar = payload.picture || avatar;
          }
        } else {
          // Fallback decoding if client ID is not configured
          const decoded = jwt.decode(credential);
          if (decoded && decoded.email) {
            email = decoded.email;
            name = decoded.name || name;
            googleId = decoded.sub || googleId;
            avatar = decoded.picture || avatar;
          }
        }
      } catch (err) {
        logger.warn({ err }, 'Direct credential verification notice');
      }
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'INVALID_PAYLOAD', message: 'Google account email is required' },
      });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email: email.toLowerCase(),
        googleId: googleId || `google-${Date.now()}`,
        avatar: avatar || '',
        authProvider: 'GOOGLE',
      });
    } else if (!user.googleId && googleId) {
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
