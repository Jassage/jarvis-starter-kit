import 'dotenv/config';
import { createServer } from 'http';
import app from './app';
import { env } from './config/env';
import { initSocket } from './config/socket';
import prisma from './config/database';
import redis from './config/redis';
import logger from './utils/logger';
import { scheduleMaintenanceJobs } from './queues';
import './workers/notification.worker';
import './workers/email.worker';
import './workers/maintenance.worker';

const httpServer = createServer(app);
initSocket(httpServer);

async function start() {
  try {
    // Vérifier connexion DB
    await prisma.$connect();
    logger.info('✅ PostgreSQL connecté');

    // Vérifier connexion Redis
    await redis.connect();

    // Planifier les jobs de maintenance (expiration abonnements + annonces)
    await scheduleMaintenanceJobs();
    logger.info('🧹 Job de maintenance planifié (balayage horaire)');

    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 LAKAY API démarrée sur le port ${env.PORT}`);
      logger.info(`📚 Documentation Swagger : http://localhost:${env.PORT}/api-docs`);
      logger.info(`🌐 Environnement : ${env.NODE_ENV}`);
    });
  } catch (err) {
    logger.error(err, '❌ Échec du démarrage');
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM reçu. Arrêt propre...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Promise Rejection');
});

process.on('uncaughtException', (err) => {
  logger.error(err, 'Uncaught Exception');
  process.exit(1);
});
