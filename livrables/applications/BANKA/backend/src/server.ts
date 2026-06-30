import 'dotenv/config';
import app from './app';
import { startCleanupJob } from './jobs/cleanupTokens';
import { startEpargneJob } from './jobs/epargne';
import { startInteretsJob } from './jobs/interets';
import { startFraisJob } from './jobs/frais';

const PORT = parseInt(process.env.PORT || '4001', 10);

app.listen(PORT, () => {
  console.log(`BANKA backend démarré sur le port ${PORT}`);
  startCleanupJob();
  startEpargneJob();
  startInteretsJob();
  startFraisJob();
});
