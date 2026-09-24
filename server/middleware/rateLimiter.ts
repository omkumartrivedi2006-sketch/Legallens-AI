import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding-window store
const ipStore = new Map<string, RateLimitRecord>();
const userStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute max window

  for (const [key, record] of ipStore.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) ipStore.delete(key);
  }

  for (const [key, record] of userStore.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) userStore.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs?: number; // default 60,000ms (1 min)
  maxRequests?: number; // default 30 requests per minute
  message?: string;
}

/**
 * Creates an Express middleware that enforces sliding-window rate limiting
 * per authenticated user ID (or client IP address if unauthenticated).
 */
export function createRateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || 60 * 1000;
  const maxRequests = options.maxRequests || 30;
  const message =
    options.message ||
    'Too many requests. Please wait a moment before trying again.';

  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    const key = authReq.userId ? `user:${authReq.userId}` : `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
    const store = authReq.userId ? userStore : ipStore;

    const now = Date.now();
    let record = store.get(key);

    if (!record) {
      record = { timestamps: [] };
      store.set(key, record);
    }

    // Filter out timestamps outside the active sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldestTimestamp = record.timestamps[0];
      const resetTimeMs = Math.max(0, windowMs - (now - oldestTimestamp));
      const retryAfterSec = Math.ceil(resetTimeMs / 1000);

      res.setHeader('Retry-After', retryAfterSec);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + resetTimeMs) / 1000));

      res.status(429).json({
        error: message,
        retryAfter: retryAfterSec,
      });
      return;
    }

    record.timestamps.push(now);
    const remaining = maxRequests - record.timestamps.length;

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));

    next();
  };
}

// Pre-configured rate limiters for expensive GenAI actions (30 reqs/min)
export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'AI request limit reached. Please wait a minute before requesting further AI analyses.',
});
