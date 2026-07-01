import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

redis.on('connect', () => console.log('✅ Redis connecté'));
redis.on('error', (err) => console.error('❌ Redis erreur:', err.message));

export default redis;
