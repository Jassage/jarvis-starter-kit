import { Queue } from 'bullmq';
import { env } from '../config/env';

// BullMQ bundles its own ioredis — pass URL options, not the shared instance
function redisConnection() {
  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname,
    port: Number(url.port) || 6379,
    password: url.password || undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null as unknown as number,
  };
}

const JOB_DEFAULTS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 2000 },
  removeOnComplete: 100,
  removeOnFail: 50,
};

export const notificationQueue = new Queue('notifications', {
  connection: redisConnection(),
  defaultJobOptions: JOB_DEFAULTS,
});

export const emailQueue = new Queue('email', {
  connection: redisConnection(),
  defaultJobOptions: { ...JOB_DEFAULTS, backoff: { type: 'exponential', delay: 5000 } },
});
