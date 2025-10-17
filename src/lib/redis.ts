import Redis from 'ioredis';

declare global {
  // eslint-disable-next-line no-var
  var redis: Redis | undefined;
}

let redis: Redis;

// For local development, Redis is optional
if (!process.env.REDIS_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Redis connection failed: REDIS_URL environment variable is not set.'
    );
  } else {
    // Create a mock Redis client for local development
    redis = new Redis({
      host: 'localhost',
      port: 6379,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });

    // Handle connection errors gracefully in development
    redis.on('error', (err) => {
      console.warn('Redis connection error (development mode):', err.message);
    });
  }
} else {
  // Similar to the Prisma client, we use a singleton pattern to manage the Redis connection
  // efficiently, especially in a serverless or hot-reloading environment.
  if (process.env.NODE_ENV === 'production') {
    redis = new Redis(process.env.REDIS_URL);
  } else {
    if (!global.redis) {
      global.redis = new Redis(process.env.REDIS_URL);
    }
    redis = global.redis;
  }

  // Event listeners for connection status are invaluable for debugging and monitoring.
  redis.on('connect', () => {
    console.log('Successfully connected to Redis!');
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });
}

export { redis };
