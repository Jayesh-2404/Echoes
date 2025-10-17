import { redis } from '@/src/lib/redis';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';

// Create rate limiters that fallback to memory-based limiting if Redis is not available
let standardRateLimiter: RateLimiterRedis | RateLimiterMemory;
let suspiciousRateLimiter: RateLimiterRedis | RateLimiterMemory;

try {
  // Standard rate limiter for all incoming requests.
  standardRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rate-limiter:standard',
    points: 10, // Max 10 requests from a single IP...
    duration: 60, // ...per 60 seconds.
  });

  // A much stricter rate limiter for IPs that have been flagged as suspicious.
  suspiciousRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rate-limiter:suspicious',
    points: 1, // Max 1 request from a suspicious IP...
    duration: 300, // ...per 5 minutes (300 seconds).
  });
} catch (error) {
  console.warn('Redis not available, falling back to memory-based rate limiting');

  // Fallback to memory-based rate limiting for development
  standardRateLimiter = new RateLimiterMemory({
    keyPrefix: 'rate-limiter:standard',
    points: 10,
    duration: 60,
  });

  suspiciousRateLimiter = new RateLimiterMemory({
    keyPrefix: 'rate-limiter:suspicious',
    points: 1,
    duration: 300,
  });
}

export { standardRateLimiter, suspiciousRateLimiter };
