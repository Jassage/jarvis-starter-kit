import { executerEpargnes } from '../services/epargne-programme.service';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

async function run(): Promise<void> {
  const results = await executerEpargnes();
  if (results.executees > 0 || results.erreurs > 0) {
    console.log(`[epargne] ${results.executees} exécutée(s), ${results.erreurs} erreur(s)`);
    if (results.details.length > 0) {
      results.details.forEach((d) => console.warn(`[epargne] ${d}`));
    }
  }
}

export function startEpargneJob(): void {
  run().catch((err) => console.error('[epargne] erreur:', err));
  setInterval(() => {
    run().catch((err) => console.error('[epargne] erreur:', err));
  }, SIX_HOURS_MS);
}
