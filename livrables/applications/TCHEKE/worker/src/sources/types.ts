import type { Etat, Moment } from "../borlette/mapping.js";

/** Un tirage recupere aupres d'une source, avant normalisation. */
export interface TirageSource {
  etat: Etat;
  moment: Moment;
  date: string; // YYYY-MM-DD
  lotto3: string | number;
  lotto4: string | number;
}

/**
 * Une source de tirages. Chaque implementation (NY Socrata, scraping FL, ...)
 * expose la meme interface pour que le reste du worker ne connaisse pas les details.
 */
export interface SourceTirages {
  readonly nom: string;
  /**
   * Recupere les tirages disponibles pour une date donnee (heure de l'Est).
   * Renvoie un tableau (0, 1 ou 2 tirages selon MIDI/SOIR deja sortis).
   */
  recupererPourDate(date: string): Promise<TirageSource[]>;
}
