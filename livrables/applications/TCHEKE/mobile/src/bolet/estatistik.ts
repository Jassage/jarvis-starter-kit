import type { Tirage } from "../types/firestore";

export interface FrekansBoul {
  boul: string; // "00".."99"
  fwa: number;
  dènyeFwa: string | null; // date YYYY-MM-DD de la derniere sortie
}

/**
 * Calcule la frequence de sortie de chaque boule (00-99) a partir de
 * l'historique en cache, tous lots confondus (1ye/2em/3em). Calcule cote
 * client, pas de collection dediee (cf. PLAN.md) : l'historique tient
 * entierement dans le cache offline Firestore.
 */
export function calculerFrekans(tirages: Tirage[]): FrekansBoul[] {
  const compteurs = new Map<string, { fwa: number; dènyeFwa: string }>();

  for (const t of tirages) {
    for (const boul of [t.premyeLo, t.dezyemLo, t.twazyemLo]) {
      const e = compteurs.get(boul);
      if (!e || t.date > e.dènyeFwa) {
        compteurs.set(boul, { fwa: (e?.fwa ?? 0) + 1, dènyeFwa: t.date });
      } else {
        compteurs.set(boul, { fwa: e.fwa + 1, dènyeFwa: e.dènyeFwa });
      }
    }
  }

  const resultat: FrekansBoul[] = [];
  for (let i = 0; i <= 99; i++) {
    const boul = String(i).padStart(2, "0");
    const e = compteurs.get(boul);
    resultat.push({ boul, fwa: e?.fwa ?? 0, dènyeFwa: e?.dènyeFwa ?? null });
  }
  return resultat.sort((a, b) => b.fwa - a.fwa);
}

export function boulCho(tirages: Tirage[], limite = 12): FrekansBoul[] {
  return calculerFrekans(tirages)
    .filter((f) => f.fwa > 0)
    .slice(0, limite);
}

export function boulFrèt(tirages: Tirage[], limite = 12): FrekansBoul[] {
  return [...calculerFrekans(tirages)]
    .sort((a, b) => a.fwa - b.fwa)
    .slice(0, limite);
}

/** Verifie si une boule saisie par l'utilisateur est sortie dans un tirage donne, et dans quel lot. */
export function tchèkeBoul(
  boul: string,
  t: Tirage,
): "premyeLo" | "dezyemLo" | "twazyemLo" | null {
  const cible = boul.padStart(2, "0");
  if (t.premyeLo === cible) return "premyeLo";
  if (t.dezyemLo === cible) return "dezyemLo";
  if (t.twazyemLo === cible) return "twazyemLo";
  return null;
}
