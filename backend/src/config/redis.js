import Redis from 'ioredis';
import { logger } from './logger.js';
import { env } from './env.js';

/**
 * Resilient Redis Client Configuration with In-Memory Fallback
 * 
 * Concept: Caching with Redis (System & Integration)
 * - Cache-Aside Pattern
 * - TTL Expiration
 * - Graceful Degradation: If Redis server is offline or unreachable, the system
 *   seamlessly transitions to an in-process LRU/Map cache without throwing unhandled exceptions.
 */

class InMemoryFallbackCache {
  constructor() {
    this.store = new Map();
    this.expirations = new Map();
  }

  async get(key) {
    const exp = this.expirations.get(key);
    if (exp && Date.now() > exp) {
      this.store.delete(key);
      this.expirations.delete(key);
      return null;
    }
    return this.store.get(key) || null;
  }

  async set(key, value, mode, durationSeconds) {
    this.store.set(key, value);
    if (mode === 'EX' && typeof durationSeconds === 'number') {
      this.expirations.set(key, Date.now() + durationSeconds * 1000);
    }
    return 'OK';
  }

  async del(...keys) {
    let deleted = 0;
    for (const key of keys) {
      if (this.store.delete(key)) deleted++;
      this.expirations.delete(key);
    }
    return deleted;
  }

  async keys(pattern) {
    if (pattern === '*' || !pattern) {
      return Array.from(this.store.keys());
    }
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    return Array.from(this.store.keys()).filter((k) => regex.test(k));
  }

  async flushall() {
    this.store.clear();
    this.expirations.clear();
    return 'OK';
  }
}

const fallbackCache = new InMemoryFallbackCache();
let redisClient = null;
let isRedisConnected = false;

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

try {
  redisClient = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Redis retry threshold reached. Using in-memory cache fallback.');
        return null; // Stop reconnecting after 3 attempts
      }
      return Math.min(times * 100, 1000);
    },
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    logger.info('Connected to Redis server successfully');
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
    logger.debug({ err: err.message }, 'Redis server unavailable, utilizing fallback cache');
  });
} catch (err) {
  logger.warn({ err: err.message }, 'Failed to initialize Redis client, falling back');
  isRedisConnected = false;
}

/**
 * Unified Cache Interface (transparently delegates to Redis or in-memory fallback)
 */
export const cacheService = {
  isRedisActive: () => isRedisConnected,

  async get(key) {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.get(key);
      } catch {
        return await fallbackCache.get(key);
      }
    }
    return await fallbackCache.get(key);
  },

  async set(key, value, ttlSeconds = 300) {
    const stringVal = typeof value === 'string' ? value : JSON.stringify(value);
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.set(key, stringVal, 'EX', ttlSeconds);
      } catch {
        return await fallbackCache.set(key, stringVal, 'EX', ttlSeconds);
      }
    }
    return await fallbackCache.set(key, stringVal, 'EX', ttlSeconds);
  },

  async del(key) {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.del(key);
      } catch {
        return await fallbackCache.del(key);
      }
    }
    return await fallbackCache.del(key);
  },

  async clearPattern(pattern) {
    try {
      if (isRedisConnected && redisClient) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      }
      const memKeys = await fallbackCache.keys(pattern);
      if (memKeys.length > 0) {
        await fallbackCache.del(...memKeys);
      }
    } catch (err) {
      logger.error({ err }, 'Error invalidating cache pattern');
    }
  },
};

export { redisClient };
