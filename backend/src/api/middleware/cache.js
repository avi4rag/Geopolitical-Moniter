import { cacheService } from '../../config/redis.js';
import { logger } from '../../config/logger.js';

/**
 * Express Middleware for Redis Response Caching (Cache-Aside Pattern)
 * 
 * @param {number} [ttlSeconds=300] Time to live in seconds (default: 5 minutes)
 * @param {string} [prefix='api-cache'] Cache key namespace
 */
export function cacheMiddleware(ttlSeconds = 300, prefix = 'api-cache') {
  return async (req, res, next) => {
    // Only cache safe GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if authenticated user asks for fresh data via Cache-Control header
    if (req.headers['cache-control'] === 'no-cache') {
      return next();
    }

    const cacheKey = `${prefix}:${req.originalUrl || req.url}`;

    try {
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-TTL', `${ttlSeconds}s`);
        res.setHeader('Content-Type', 'application/json');
        return res.send(cachedData);
      }

      // Cache MISS: Intercept response to store payload
      res.setHeader('X-Cache', 'MISS');
      const originalJson = res.json.bind(res);

      res.json = (body) => {
        // Only cache successful 200 responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, body, ttlSeconds).catch((err) => {
            logger.warn({ err: err.message, cacheKey }, 'Failed to write cache entry');
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      logger.warn({ err: err.message }, 'Cache middleware error, proceeding without cache');
      next();
    }
  };
}

/**
 * Invalidation helper to clear cache by prefix or tag
 */
export async function invalidateCache(pattern = 'api-cache:*') {
  await cacheService.clearPattern(pattern);
  logger.info({ pattern }, 'Cache invalidated for pattern');
}
