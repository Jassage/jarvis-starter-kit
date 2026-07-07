import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { scheduleMaintenanceJobs } from './queues';

app.listen(env.PORT, () => {
  logger.info(`SHOPAY backend démarré sur le port ${env.PORT}`);
  scheduleMaintenanceJobs();
});
