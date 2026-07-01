import 'dotenv/config';
import app from './app';
import { startCleanupJob } from './jobs/cleanupTokens';

const PORT = parseInt(process.env.PORT || '4002', 10);

app.listen(PORT, () => {
  console.log(`GESCOM backend démarré sur le port ${PORT}`);
  startCleanupJob();
});
