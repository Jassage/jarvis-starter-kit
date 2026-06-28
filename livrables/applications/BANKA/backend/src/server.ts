import 'dotenv/config';
import app from './app';
import { startCleanupJob } from './jobs/cleanupTokens';
import { startEpargneJob } from './jobs/epargne';

const PORT = parseInt(process.env.PORT || '4001', 10);

app.listen(PORT, () => {
  console.log(`BANKA backend démarré sur le port ${PORT}`);
  startCleanupJob();
  startEpargneJob();
});
