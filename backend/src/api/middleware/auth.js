import jwt from 'jsonwebtoken';
import { User } from '../../models/index.js';
import { env } from '../../config/env.js';

// ─── Authentication Middleware ────────────────────────────────────────────────
// Parses JWT token from HTTP-only cookie or Authorization header.
// Attaches authenticated user document to req.user.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Required authentication middleware.
 * Returns 401 Unauthorized if token is missing, expired, or invalid.
 */
export async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please log in.' },
      });
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { code: 'USER_NOT_FOUND', message: 'User account no longer exists.' },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired session. Please log in again.' },
    });
  }
}

/**
 * Optional authentication middleware.
 * Attaches req.user if a valid token is present, but does not block unauthenticated users.
 */
export async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(decoded.userId);
      if (user) req.user = user;
    }
  } catch (err) {
    // Ignore invalid tokens in optional auth
  }
  next();
}

/**
 * Extract token from HTTP-only cookie or Authorization Bearer header.
 */
function extractToken(req) {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
}

/**
 * Helper to set HTTP-only authentication cookie on response.
 */
export function setAuthCookie(res, token) {
  const isProd = env.isProduction;
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Helper to clear HTTP-only authentication cookie.
 */
export function clearAuthCookie(res) {
  const isProd = env.isProduction;
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
}
