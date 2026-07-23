import cron from "node-cron";
import { env } from "./env.js";
import { collecterEtPublier, dateDuJour } from "./jobs.js";
import { SourceScraping } from "./sources/scraping.js";
import type { SourceTirages } from "./sources/types.js";

/**
 * Sources du direct : scraping NY + FL (gratuit, rapide). La source Socrata NY
 * sert au backfill (script separe), pas au direct car trop en retard.
 */
const sources: SourceTirages[] = [
  new SourceScraping("NY"),
  new SourceScraping("FL"),
];

async function passe(): Promise<void> {
  const date = dateDuJour(env.timezone);
  console.log(`[${new Date().toISOString()}] Passe de collecte pour ${date}`);
  await collecterEtPublier(sources, date);
}

/**
 * Fenetres de collecte (heure de l'Est, = heure d'Haiti). On repasse quelques
 * fois apres chaque tirage pour rattraper une source lente, la publication etant
 * idempotente (aucun risque de doublon ni de double notification).
 *
 * Tirages :  NY midi ~12h30 · FL midi 13h30 · NY soir ~19h30 · FL soir 21h45
 */
const HORAIRES = [
  "40 12 * * *", // apres NY midi
  "45 13 * * *", // apres FL midi
  "15 14 * * *", // rattrapage midi
  "40 19 * * *", // apres NY soir
  "00 22 * * *", // apres FL soir
  "30 22 * * *", // rattrapage soir
];

function demarrer(): void {
  if (env.runMode === "once") {
    passe()
      .then(() => process.exit(0))
      .catch((e) => {
        console.error(e);
        process.exit(1);
      });
    return;
  }

  for (const expr of HORAIRES) {
    cron.schedule(expr, () => void passe(), { timezone: env.timezone });
  }
  console.log(
    `Worker TCHEKE demarre. ${HORAIRES.length} fenetres/jour (${env.timezone}).`,
  );
}

demarrer();
