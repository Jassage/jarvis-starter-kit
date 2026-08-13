import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import { startCleanupJob } from './jobs/cleanupTokens';

app.listen(env.PORT, () => {
  console.log(`REMED backend démarré sur le port ${env.PORT}`);
  startCleanupJob();
});
