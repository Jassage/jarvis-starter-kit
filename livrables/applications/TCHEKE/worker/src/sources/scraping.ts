import { request } from "undici";
import type { SourceTirages, TirageSource } from "./types.js";
import type { Etat, Moment } from "../borlette/mapping.js";

/**
 * Source de scraping pour le RESULTAT DU JOUR (source retenue pour le direct,
 * cf. PLAN.md : la source officielle Socrata NY accuse plusieurs jours de
 * retard). Verifiee en conditions reelles (curl direct, HTTP 200, structure
 * HTML stable) sur lotteryusa.com : chaque jeu/moment a sa propre page, la
 * plus recente en tete du tableau "Latest numbers".
 *
 * Une API JSON interne existe (`/api/draws/US_{etat}_{jeu}/{date}`) mais son
 * corps est chiffre (ciphertext/iv/salt) sans cle disponible : on scrape donc
 * la page HTML publique, dont la structure a ete inspectee directement.
 */

const URLS: Record<Etat, Record<Moment, { lotto3: string; lotto4: string }>> = {
  NY: {
    MIDI: {
      lotto3: "https://www.lotteryusa.com/new-york/midday-numbers/",
      lotto4: "https://www.lotteryusa.com/new-york/midday-win-4/",
    },
    SOIR: {
      lotto3: "https://www.lotteryusa.com/new-york/numbers/",
      lotto4: "https://www.lotteryusa.com/new-york/win-4/",
    },
  },
  FL: {
    MIDI: {
      lotto3: "https://www.lotteryusa.com/florida/midday-pick-3/",
      lotto4: "https://www.lotteryusa.com/florida/midday-pick-4/",
    },
    SOIR: {
      lotto3: "https://www.lotteryusa.com/florida/pick-3/",
      lotto4: "https://www.lotteryusa.com/florida/pick-4/",
    },
  },
};

const MOIS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

/** Convertit "Jul 22, 2026" en "2026-07-22", sans passer par Date() (evite tout piege de fuseau). */
export function parseDateAffichee(texte: string): string | null {
  const m = texte.trim().match(/^(\w{3})\s+(\d{1,2}),\s+(\d{4})$/);
  if (!m) return null;
  const [, mois, jour, annee] = m;
  if (!mois || !jour || !annee) return null;
  const moisNum = MOIS[mois];
  if (!moisNum) return null;
  return `${annee}-${moisNum}-${jour.padStart(2, "0")}`;
}

export interface TirageBrutPage {
  date: string;
  chiffres: string;
}

/**
 * Extrait la date et les chiffres du PREMIER tirage du tableau "Latest numbers"
 * (le plus recent, confirme par l'ordre du tableau observe sur le site).
 */
export function parserPremierTirage(html: string): TirageBrutPage | null {
  const dateMatch = html.match(/c-draw-card__draw-date-sub">([^<]+)</);
  if (!dateMatch) return null;
  const date = parseDateAffichee(dateMatch[1]!);
  if (!date) return null;

  const debutListe = html.indexOf("c-draw-card__ball-list");
  if (debutListe === -1) return null;
  const finListe = html.indexOf("</ul>", debutListe);
  const blocListe = html.slice(debutListe, finListe === -1 ? undefined : finListe);

  // Floride ajoute un numero bonus "Fireball" (class c-ball--fire) dans la
  // meme liste : on ne garde que les boules normales, jamais le Fireball
  // (verifie sur la vraie page florida/midday-pick-4/, qui renvoyait sinon
  // 5 chiffres au lieu de 4).
  const chiffres = [...blocListe.matchAll(/class="(c-ball[^"]*)">(\d)</g)]
    .filter(([, classe]) => !classe!.includes("fire"))
    .map(([, , chiffre]) => chiffre)
    .join("");
  if (chiffres.length === 0) return null;

  return { date, chiffres };
}

async function recupererPage(url: string): Promise<string> {
  const res = await request(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "text/html",
    },
  });
  if (res.statusCode >= 400) {
    throw new Error(`${url} a repondu ${res.statusCode}`);
  }
  return res.body.text();
}

export class SourceScraping implements SourceTirages {
  readonly nom = "Scraping direct (lotteryusa.com)";

  constructor(private readonly etat: Etat) {}

  async recupererPourDate(date: string): Promise<TirageSource[]> {
    const resultats: TirageSource[] = [];

    for (const moment of ["MIDI", "SOIR"] as const) {
      const urls = URLS[this.etat][moment];
      try {
        const [html3, html4] = await Promise.all([
          recupererPage(urls.lotto3),
          recupererPage(urls.lotto4),
        ]);
        const tirage3 = parserPremierTirage(html3);
        const tirage4 = parserPremierTirage(html4);

        // On n'accepte le tirage que si les DEUX pages confirment la meme date
        // demandee : evite de publier un melange (ex: lotto3 d'aujourd'hui
        // avec un lotto4 pas encore mis a jour).
        if (tirage3?.date === date && tirage4?.date === date) {
          resultats.push({
            etat: this.etat,
            moment,
            date,
            lotto3: tirage3.chiffres,
            lotto4: tirage4.chiffres,
          });
        }
      } catch (e) {
        console.error(`Scraping ${this.etat}/${moment} en echec:`, e);
      }
    }

    return resultats;
  }
}
