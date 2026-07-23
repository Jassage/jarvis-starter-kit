/**
 * Coeur metier de la borlette : transformation d'un tirage americain
 * (Lotto 3 chif + Lotto 4 chif) en 5 valeurs affichees.
 *
 * Regles validees avec Jaslin :
 *   1ye lo   = 2 derniers chiffres du Lotto 3
 *   2em lo   = 2 derniers chiffres du Lotto 4
 *   3em lo   = 2 premiers chiffres du Lotto 4
 *
 * REGLE CRITIQUE : tout est manipule en `string`, jamais en `number`.
 * Un Lotto 3 « 007 » ne doit jamais devenir 7.
 */

export type Etat = "NY" | "FL";
export type Moment = "MIDI" | "SOIR";

export interface TirageBrut {
  etat: Etat;
  moment: Moment;
  /** Date du tirage au format YYYY-MM-DD (heure de l'Est). */
  date: string;
  /** Exactement 3 chiffres, en string (zeros de tete conserves). */
  lotto3: string;
  /** Exactement 4 chiffres, en string. */
  lotto4: string;
}

export interface ResultatBorlette extends TirageBrut {
  premyeLo: string;
  dezyemLo: string;
  twazyemLo: string;
}

/**
 * Normalise une valeur brute en une chaine de `longueur` chiffres.
 * Accepte un number ou une string, retire tout non-chiffre, verifie la longueur
 * et complete les zeros de tete manquants (ex: 7 -> "007").
 * Rejette une valeur qui a trop de chiffres (donnee suspecte, on ne tronque pas en silence).
 */
export function normaliseChiffres(valeur: string | number, longueur: number): string {
  const brut = String(valeur).trim();
  const chiffres = brut.replace(/\D/g, "");
  if (chiffres.length === 0) {
    throw new Error(`Valeur de tirage vide ou non numerique: "${brut}"`);
  }
  if (chiffres.length > longueur) {
    throw new Error(
      `Valeur "${brut}" a ${chiffres.length} chiffres, attendu ${longueur}`,
    );
  }
  return chiffres.padStart(longueur, "0");
}

/**
 * Calcule les 3 lots a partir des deux nombres deja normalises.
 * Fonction pure, aucun effet de bord, testee.
 */
export function calculerLots(lotto3: string, lotto4: string): {
  premyeLo: string;
  dezyemLo: string;
  twazyemLo: string;
} {
  return {
    premyeLo: lotto3.slice(-2),
    dezyemLo: lotto4.slice(-2),
    twazyemLo: lotto4.slice(0, 2),
  };
}

/**
 * Construit un ResultatBorlette complet et valide a partir d'un tirage brut.
 * Normalise les deux nombres puis calcule les lots.
 */
export function construireResultat(input: {
  etat: Etat;
  moment: Moment;
  date: string;
  lotto3: string | number;
  lotto4: string | number;
}): ResultatBorlette {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new Error(`Date invalide (attendu YYYY-MM-DD): "${input.date}"`);
  }
  const lotto3 = normaliseChiffres(input.lotto3, 3);
  const lotto4 = normaliseChiffres(input.lotto4, 4);
  const lots = calculerLots(lotto3, lotto4);
  return {
    etat: input.etat,
    moment: input.moment,
    date: input.date,
    lotto3,
    lotto4,
    ...lots,
  };
}

/** Identifiant de document Firestore, lisible et deterministe. */
export function idTirage(r: Pick<TirageBrut, "date" | "etat" | "moment">): string {
  return `${r.date}_${r.etat}_${r.moment}`;
}
