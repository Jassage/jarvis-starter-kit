import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import prisma from './config/database';
import logger from './utils/logger';

async function start() {
  try {
    await prisma.$connect();
    logger.info('✅ PostgreSQL connecté');

    app.listen(env.PORT, () => {
      logger.info(`🚀 REYINYON API démarrée sur le port ${env.PORT}`);
      logger.info(`🌐 Environnement : ${env.NODE_ENV}`);
    });
  } catch (err) {
    logger.error(err, '❌ Échec du démarrage');
    process.exit(1);
  }
}

start();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM reçu. Arrêt propre...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Promise Rejection');
});

process.on('uncaughtException', (err) => {
  logger.error(err, 'Uncaught Exception');
  process.exit(1);
});
