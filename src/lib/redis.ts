import Redis from 'ioredis';

declare global {
  // eslint-disable-next-line no-var
  var redis: Redis | undefined;
}

let redis: Redis;


if (!process.env.REDIS_URL) {
  if (process.env.NODE_ENV === 'production') {

    redis = new Redis({
      host: 'localhost',
      port: 6379,
      enableReadyCheck: false,
      maxRetriesPerRequest: 0,
      lazyConnect: true,
      connectTimeout: 1000,
      commandTimeout: 1000,
    });


    redis.on('error', (err) => {
      console.warn('Redis not available in production, rate limiting disabled:', err.message);
    });
  } else {
    // Create a mock Redis client for local development
    redis = new Redis({
      host: 'localhost',
      port: 6379,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      console.warn('Redis connection error (development mode):', err.message);
    });
  }
} else {

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

