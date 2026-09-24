/**
 * Security Middleware: Comprehensive Input Sanitization & Injection Defense
 * 
 * Concept: Input sanitization & injection awareness (Auth & Security)
 * Mitigates:
 * 1. NoSQL Injection: Prevents operator injection attacks ($gt, $where, $ne, dot notation keys)
 * 2. SQL Injection: Parameterizes and validates input patterns to prevent SQL injection vectors
 * 3. Cross-Site Scripting (XSS): Sanitizes malicious script tags and HTML execution vectors
 */

import { logger } from '../../config/logger.js';

// Suspicious SQL injection patterns to detect and block in unparameterized inputs
const SQL_INJECTION_PATTERN = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b\s+.*\b(FROM|INTO|TABLE|DATABASE|WHERE)\b)|(--\s*$)|(\bOR\b\s+['"\d\w]+\s*=\s*['"\d\w]+)/i;

// HTML / Script tags for XSS stripping
const XSS_SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const XSS_EVENT_HANDLER_REGEX = /\bon\w+\s*=\s*["'][^"']*["']/gi;
const JAVASCRIPT_URI_REGEX = /javascript\s*:\s*[^\s'"]+/gi;

/**
 * Deep sanitization of values to neutralize NoSQL operator injection and XSS
 */
export function sanitizeValue(value) {
  if (value === null || value === undefined) {
    return value;
  }

  // Sanitize strings
  if (typeof value === 'string') {
    let clean = value
      .replace(XSS_SCRIPT_REGEX, '')
      .replace(XSS_EVENT_HANDLER_REGEX, '')
      .replace(JAVASCRIPT_URI_REGEX, '');
    
    return clean.trim();
  }

  // Sanitize arrays
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  // Sanitize objects
  if (typeof value === 'object') {
    const cleanObj = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        logger.warn({ dangerousKey: key }, 'Blocked potential NoSQL injection key');
        continue;
      }
      cleanObj[key] = sanitizeValue(val);
    }
    return cleanObj;
  }

  return value;
}

/**
 * Express 5 compatible middleware executing in-place input sanitization
 */
export function sanitizationMiddleware(req, res, next) {
  try {
    // Sanitize body in-place (handles NoSQL operator injection)
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      for (const key of Object.keys(req.body)) {
        if (key.startsWith('$') || key.includes('.')) {
          logger.warn({ key }, 'Removing NoSQL injection key from request body');
          delete req.body[key];
        } else {
          req.body[key] = sanitizeValue(req.body[key]);
        }
      }
    }

    // Sanitize query in-place (Express 5 req.query is a getter, so mutate keys)
    if (req.query && typeof req.query === 'object') {
      for (const key of Object.keys(req.query)) {
        const val = req.query[key];
        if (typeof val === 'string' && SQL_INJECTION_PATTERN.test(val)) {
          logger.warn({ key, val }, 'Potential SQL Injection pattern intercepted in query');
          return res.status(400).json({
            status: 'error',
            code: 'INVALID_INPUT',
            message: `Illegal characters or SQL pattern detected in query parameter: "${key}"`,
          });
        }
        req.query[key] = sanitizeValue(val);
      }
    }

    // Sanitize params in-place
    if (req.params && typeof req.params === 'object') {
      for (const key of Object.keys(req.params)) {
        req.params[key] = sanitizeValue(req.params[key]);
      }
    }

    next();
  } catch (err) {
    logger.error({ err }, 'Error during input sanitization');
    next(err);
  }
}
