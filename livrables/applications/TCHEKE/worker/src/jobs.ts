import { publierTirage } from "./publish.js";
import { notifierTirage } from "./push.js";
import { recalculerAgregatTaux } from "./taux/brh.js";
import type { SourceTirages } from "./sources/types.js";

/** Date du jour au format YYYY-MM-DD dans un fuseau donne (heure de l'Est). */
export function dateDuJour(timezone: string): string {
  // en-CA donne directement le format YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Interroge chaque source pour la date du jour, publie les tirages et notifie
 * uniquement ceux reellement nouveaux. Tolerant aux pannes : une source qui
 * echoue n'empeche pas les autres.
 */
export async function collecterEtPublier(
  sources: SourceTirages[],
  date: string,
): Promise<void> {
  for (const source of sources) {
    try {
      const tirages = await source.recupererPourDate(date);
      for (const t of tirages) {
        const pub = await publierTirage(t);
        if (pub.nouveau) {
          console.log(`[NOUVEAU] ${pub.id}`);
          await notifierTirage(pub.resultat);
        }
      }
    } catch (e) {
      console.error(`Source "${source.nom}" en echec:`, e);
    }
  }

  // L'agregat du taux de rue depend des contributions, on le rafraichit au passage.
  try {
    await recalculerAgregatTaux(date);
  } catch (e) {
    console.error("Recalcul agregat taux en echec:", e);
  }
}
