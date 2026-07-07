import { Queue, Worker, ConnectionOptions } from 'bullmq';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { runMaintenanceSweep } from '../workers/maintenance.worker';

const JOB_ID = 'shopay-maintenance-sweep';
let maintenanceQueue: Queue | null = null;
let maintenanceWorker: Worker | null = null;

// BullMQ embarque sa propre copie d'ioredis : on lui passe des options brutes (parsées depuis
// l'URL) plutôt qu'une instance construite avec le paquet `ioredis` de ce projet, pour éviter
// un conflit de types entre les deux copies du package.
function getConnection(): ConnectionOptions | null {
  if (!env.REDIS_URL) return null;
  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
  };
}

/**
 * Planifie le balayage horaire (expiration des commandes PENDING_PAYMENT abandonnées et
 * des abonnements marchands expirés). Utilise BullMQ si REDIS_URL est configuré (scaling
 * multi-instance, comme LAKAY) ; sinon retombe sur un setInterval en process, suffisant en
 * dev local et pour ne pas bloquer le MVP sur une dépendance Redis absente (comme POSTA sans queue).
 */
export function scheduleMaintenanceJobs(): void {
  const connection = getConnection();

  if (!connection) {
    logger.warn('REDIS_URL non configuré — balayage de maintenance en setInterval local (pas de scaling multi-instance)');
    setInterval(() => {
      runMaintenanceSweep().catch((err) => logger.error({ err }, 'Échec du balayage de maintenance'));
    }, 60 * 60 * 1000);
    return;
  }

  maintenanceQueue = new Queue('maintenance', { connection });
  maintenanceQueue
    .add(
      JOB_ID,
      {},
      {
        jobId: JOB_ID,
        repeat: { pattern: '0 * * * *' },
        removeOnComplete: true,
        removeOnFail: true,
      }
    )
    .catch((err) => logger.error({ err }, 'Échec de planification du job de maintenance'));

  // Le Worker est ce qui exécute réellement le job planifié — sans lui, la queue accumule
  // des jobs jamais traités.
  maintenanceWorker = new Worker(
    'maintenance',
    async () => {
      await runMaintenanceSweep();
    },
    { connection }
  );
  maintenanceWorker.on('failed', (job, err) => logger.error({ err, jobId: job?.id }, 'Job de maintenance échoué'));

  logger.info('Job de maintenance BullMQ planifié (horaire)');
}
