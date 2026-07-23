import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase.js";
import { construireResultat, idTirage, type ResultatBorlette } from "./borlette/mapping.js";
import type { TirageSource } from "./sources/types.js";

export interface ResultatPublication {
  id: string;
  nouveau: boolean;
  resultat: ResultatBorlette;
}

/**
 * Ecrit un tirage dans la collection `tirages` (idempotent).
 * Renvoie `nouveau: true` seulement si le document n'existait pas encore, afin de
 * ne declencher les notifications push qu'une seule fois par tirage.
 */
export async function publierTirage(
  source: TirageSource,
): Promise<ResultatPublication> {
  const resultat = construireResultat(source);
  const id = idTirage(resultat);
  const ref = db.collection("tirages").doc(id);

  const nouveau = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) return false;
    tx.set(ref, {
      ...resultat,
      statut: "OFFICIEL",
      publieLe: FieldValue.serverTimestamp(),
    });
    return true;
  });

  return { id, nouveau, resultat };
}

/** Publie une liste de tirages, renvoie ceux qui etaient reellement nouveaux. */
export async function publierPlusieurs(
  sources: TirageSource[],
): Promise<ResultatPublication[]> {
  const resultats: ResultatPublication[] = [];
  for (const s of sources) {
    try {
      resultats.push(await publierTirage(s));
    } catch (e) {
      console.error(`Echec publication tirage ${s.etat}/${s.moment}/${s.date}:`, e);
    }
  }
  return resultats;
}
