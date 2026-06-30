import { crediterInteretsMensuels } from '../services/interet.service';

// Exécute le job le 1er de chaque mois à minuit
function prochainPremier(): number {
  const now = new Date();
  const premier = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 5, 0); // 1er du mois suivant à 00:05
  return Math.max(0, premier.getTime() - now.getTime());
}

async function run(): Promise<void> {
  const result = await crediterInteretsMensuels();
  if (result.erreurs > 0) {
    result.details.forEach((d) => console.error('[INTÉRÊTS]', d));
  }
}

export function startInteretsJob(): void {
  const delai = prochainPremier();
  const prochaine = new Date(Date.now() + delai);
  console.log(`[INTÉRÊTS] Prochain calcul : ${prochaine.toLocaleString('fr-HT')}`);

  setTimeout(function tick() {
    run().catch((err) => console.error('[INTÉRÊTS] erreur:', err));
    // Relancer dans 30 jours (28 jours minimum pour couvrir février)
    setTimeout(tick, 28 * 24 * 60 * 60 * 1000);
  }, delai);
}
