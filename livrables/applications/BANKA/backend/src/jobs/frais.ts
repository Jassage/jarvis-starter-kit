import { preleverFraisTenueCompte } from '../services/frais.service';

function prochainPremier(): number {
  const now = new Date();
  const premier = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 10, 0);
  return Math.max(0, premier.getTime() - now.getTime());
}

export function startFraisJob(): void {
  const delai = prochainPremier();
  const prochaine = new Date(Date.now() + delai);
  console.log(`[FRAIS] Prochain prélèvement tenue de compte : ${prochaine.toLocaleString('fr-HT')}`);

  setTimeout(function tick() {
    preleverFraisTenueCompte().catch((err) => console.error('[FRAIS] erreur:', err));
    setTimeout(tick, 28 * 24 * 60 * 60 * 1000);
  }, delai);
}
