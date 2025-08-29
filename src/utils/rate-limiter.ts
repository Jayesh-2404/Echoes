import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '@/src/lib/redis';

// Standard rate limiter for all incoming requests.
export const standardRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rate-limiter:standard',
  points: 10, // Max 10 requests from a single IP...
  duration: 60, // ...per 60 seconds.
});

// A much stricter rate limiter for IPs that have been flagged as suspicious.
export const suspiciousRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rate-limiter:suspicious',
  points: 1, // Max 1 request from a suspicious IP...
  duration: 300, // ...per 5 minutes (300 seconds).
});
