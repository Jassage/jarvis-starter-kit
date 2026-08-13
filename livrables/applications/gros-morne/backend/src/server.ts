import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import prisma from './config/database';

async function start() {
  try {
    await prisma.$connect();
    console.log('PostgreSQL connecté');

    app.listen(env.PORT, () => {
      console.log(`gros-morne API démarrée sur le port ${env.PORT}`);
      console.log(`Environnement : ${env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('Échec du démarrage', err);
    process.exit(1);
  }
}

start();

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection', reason);
});
