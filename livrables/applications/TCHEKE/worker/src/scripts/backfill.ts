import { publierTirage } from "../publish.js";
import { SourceNySocrata } from "../sources/ny.js";

/**
 * Backfill de l'historique New York depuis Open Data NY (gratuit).
 * Alimente les tirages passes pour que les statistiques boules chaudes/froides
 * aient de la matiere des le lancement. NE notifie PAS (donnees historiques).
 *
 * Usage : npm run backfill -- 500   (nombre de tirages recents a importer)
 */
async function main(): Promise<void> {
  const limite = Number(process.argv[2] ?? 500);
  const source = new SourceNySocrata();
  const tirages = await source.recupererRecents(limite);
  console.log(`Recuperes ${tirages.length} tirages NY, publication...`);

  let nouveaux = 0;
  for (const t of tirages) {
    try {
      const pub = await publierTirage(t);
      if (pub.nouveau) nouveaux++;
    } catch (e) {
      console.error(`Echec ${t.date}/${t.moment}:`, e);
    }
  }
  console.log(`Termine. ${nouveaux} nouveaux tirages ecrits.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
