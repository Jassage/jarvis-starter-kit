import { Worker, Job } from 'bullmq';
import { env } from '../config/env';
import { expireSubscriptions, expireStalePendingPayments } from '../modules/payments/payments.service';
import { expireListings } from '../modules/listings/listings.service';
import { completeElapsedVisits } from '../modules/visits/visits.service';

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

export const maintenanceWorker = new Worker(
  'maintenance',
  async (_job: Job) => {
    const [subscriptions, listings, payments, visits] = await Promise.all([
      expireSubscriptions(),
      expireListings(),
      expireStalePendingPayments(),
      completeElapsedVisits(),
    ]);
    console.log(`[MaintenanceWorker] Expiry sweep — ${subscriptions} abonnement(s) rétrogradé(s), ${listings} annonce(s) expirée(s), ${payments} paiement(s) orphelin(s) annulé(s), ${visits} visite(s) marquée(s) effectuée(s)`);
    return { subscriptions, listings, payments, visits };
  },
  {
    connection: redisConnection(),
    concurrency: 1,
  },
);

maintenanceWorker.on('failed', (job, err) => {
  console.error(`[MaintenanceWorker] Job ${job?.id} failed:`, err.message);
});
