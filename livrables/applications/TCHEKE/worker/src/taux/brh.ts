import { FieldValue } from "firebase-admin/firestore";
import { db } from "../firebase.js";

/**
 * Taux de reference BRH du jour, ecrit dans `taux_officiel/{date}`.
 *
 * ETAT : la BRH ne publie pas d'API ouverte. La recuperation reelle (scraping du
 * bulletin BRH ou saisie manuelle admin via config distante) reste a brancher.
 * En attendant, `enregistrerTauxBrh` accepte une valeur fournie, ce qui permet
 * deja la saisie manuelle et le futur scraping sans changer l'ecriture.
 */
export async function enregistrerTauxBrh(
  date: string,
  refBrh: number,
): Promise<void> {
  if (!Number.isFinite(refBrh) || refBrh <= 0) {
    throw new Error(`Taux BRH invalide: ${refBrh}`);
  }
  await db.collection("taux_officiel").doc(date).set({
    date,
    refBrh,
    publieLe: FieldValue.serverTimestamp(),
  });
}

/**
 * Recalcule l'agregat du taux de rue par ville a partir des contributions
 * recentes, en ecartant les valeurs extremes (mediane robuste), et l'ecrit dans
 * `taux_agrege/{date}_{vil}`.
 */
export async function recalculerAgregatTaux(date: string): Promise<void> {
  const depuis = new Date();
  depuis.setDate(depuis.getDate() - 2); // fenetre glissante 48h

  const snap = await db
    .collection("taux_kontribisyon")
    .where("statut", "==", "AKTIF")
    .where("kreyeLe", ">=", depuis)
    .get();

  const parVille = new Map<string, { achat: number[]; vente: number[] }>();
  for (const doc of snap.docs) {
    const vil = doc.get("vil") as string;
    const achat = doc.get("achat") as number;
    const vente = doc.get("vente") as number;
    if (!vil || !Number.isFinite(achat) || !Number.isFinite(vente)) continue;
    const e = parVille.get(vil) ?? { achat: [], vente: [] };
    e.achat.push(achat);
    e.vente.push(vente);
    parVille.set(vil, e);
  }

  const batch = db.batch();
  for (const [vil, vals] of parVille) {
    batch.set(db.collection("taux_agrege").doc(`${date}_${vil}`), {
      date,
      vil,
      achatMwayen: medianeElaguee(vals.achat),
      venteMwayen: medianeElaguee(vals.vente),
      nbKontribisyon: vals.achat.length,
      calculeLe: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
}

/** Moyenne apres retrait des 10% extremes de chaque cote (robuste au spam). */
function medianeElaguee(valeurs: number[]): number {
  if (valeurs.length === 0) return 0;
  const triees = [...valeurs].sort((a, b) => a - b);
  const coupe = Math.floor(triees.length * 0.1);
  const centre = triees.slice(coupe, triees.length - coupe);
  const echantillon = centre.length > 0 ? centre : triees;
  const somme = echantillon.reduce((a, b) => a + b, 0);
  return Math.round((somme / echantillon.length) * 100) / 100;
}
