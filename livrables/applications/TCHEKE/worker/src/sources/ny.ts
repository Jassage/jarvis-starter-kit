import { request } from "undici";
import { env } from "../env.js";
import type { SourceTirages, TirageSource } from "./types.js";

/**
 * Source New York via l'API Open Data NY (Socrata).
 * GRATUIT et officiel. Ideal pour le BACKFILL HISTORIQUE (des annees de donnees)
 * qui alimente les statistiques boules chaudes/froides.
 *
 * ATTENTION FRAICHEUR : ce dataset gouvernemental accuse souvent un retard de
 * plusieurs jours. Il ne convient donc PAS pour publier le resultat du jour
 * quelques minutes apres le tirage. Pour le direct, voir la source de scraping.
 *
 * A VERIFIER avant mise en prod : les noms exacts des colonnes du dataset
 * (`SOCRATA_DATASET_NY`). Ils sont isoles dans `mapLigne` ci-dessous pour etre
 * ajustes en un seul endroit une fois confirmes sur data.ny.gov.
 */
export class SourceNySocrata implements SourceTirages {
  readonly nom = "NY Open Data (Socrata)";

  private async requeteSocrata(params: Record<string, string>): Promise<unknown[]> {
    const base = `https://data.ny.gov/resource/${env.socrataDatasetNy}.json`;
    const qs = new URLSearchParams(params).toString();
    const headers: Record<string, string> = { Accept: "application/json" };
    if (env.socrataAppToken) headers["X-App-Token"] = env.socrataAppToken;

    const res = await request(`${base}?${qs}`, { headers });
    if (res.statusCode >= 400) {
      throw new Error(`Socrata NY a repondu ${res.statusCode}`);
    }
    return (await res.body.json()) as unknown[];
  }

  async recupererPourDate(date: string): Promise<TirageSource[]> {
    // Socrata attend un timestamp floating : "2026-07-22T00:00:00.000"
    const lignes = await this.requeteSocrata({
      $where: `draw_date = '${date}T00:00:00.000'`,
      $limit: "10",
    });
    return lignes.flatMap((l) => this.mapLigne(l, date));
  }

  /** Recupere les N derniers tirages (backfill/historique). */
  async recupererRecents(limite: number): Promise<TirageSource[]> {
    const lignes = await this.requeteSocrata({
      $order: "draw_date DESC",
      $limit: String(limite),
    });
    return lignes.flatMap((l) => this.mapLigne(l));
  }

  /**
   * Traduit une ligne Socrata en 0..2 TirageSource (midi + soir).
   * Les noms de colonnes ci-dessous sont a confirmer sur le dataset reel.
   */
  private mapLigne(ligne: unknown, dateAttendue?: string): TirageSource[] {
    const row = ligne as Record<string, string>;
    const date = (row.draw_date ?? dateAttendue ?? "").slice(0, 10);
    if (!date) return [];

    const out: TirageSource[] = [];
    // Colonnes attendues : midday_numbers / midday_win_4 / evening_numbers / evening_win_4
    if (row.midday_numbers && row.midday_win_4) {
      out.push({
        etat: "NY",
        moment: "MIDI",
        date,
        lotto3: row.midday_numbers,
        lotto4: row.midday_win_4,
      });
    }
    if (row.evening_numbers && row.evening_win_4) {
      out.push({
        etat: "NY",
        moment: "SOIR",
        date,
        lotto3: row.evening_numbers,
        lotto4: row.evening_win_4,
      });
    }
    return out;
  }
}
