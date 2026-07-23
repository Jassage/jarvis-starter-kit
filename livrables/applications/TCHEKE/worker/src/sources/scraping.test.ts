import { describe, it, expect } from "vitest";
import { parseDateAffichee, parserPremierTirage } from "./scraping";

// Extraits HTML reels (lotteryusa.com), captures en verifiant la source le
// 2026-07-22. Sert de garde anti-regression si le parsing devait changer :
// si le site modifie sa structure, un fixture fige permet de voir la casse
// sans dependre du reseau.

const EXTRAIT_3_CHIFFRES = `
<table class="c-results-table">
  <tbody id="js-state-results-table">
    <tr class="c-results-table__item c-results-table__item--medium c-draw-card">
      <th class="c-draw-card__date" scope="row">
        <time class="c-draw-card__draw-date">
          <span class="c-draw-card__draw-date-dow">Wednesday,</span>
          <span class="c-draw-card__draw-date-sub">Jul 22, 2026</span>
        </time>
      </th>
      <td class="c-draw-card__result">
        <div class="c-draw-card__draws">
          <div class="c-draw-card__ball-box">
            <ul class="c-result c-draw-card__ball-list">
              <li class="c-ball c-ball--sm">6</li>
              <li class="c-ball c-ball--sm">3</li>
              <li class="c-ball c-ball--sm">5</li>
            </ul>
          </div>
        </div>
      </td>
    </tr>
  </tbody>
</table>`;

const EXTRAIT_4_CHIFFRES = `
<table class="c-results-table">
  <tbody id="js-state-results-table">
    <tr class="c-results-table__item c-results-table__item--medium c-draw-card">
      <th class="c-draw-card__date" scope="row">
        <time class="c-draw-card__draw-date">
          <span class="c-draw-card__draw-date-dow">Wednesday,</span>
          <span class="c-draw-card__draw-date-sub">Jul 22, 2026</span>
        </time>
      </th>
      <td class="c-draw-card__result">
        <div class="c-draw-card__draws">
          <div class="c-draw-card__ball-box">
            <ul  class="c-result c-draw-card__ball-list">
              <li class="c-ball c-ball--sm">6</li>
              <li class="c-ball c-ball--sm">1</li>
              <li class="c-ball c-ball--sm">4</li>
              <li class="c-ball c-ball--sm">5</li>
            </ul>
          </div>
        </div>
      </td>
    </tr>
  </tbody>
</table>`;

// Extrait reel de florida/midday-pick-4/ : la Floride ajoute un numero bonus
// "Fireball" (class c-ball--fire) dans la meme liste que les 4 vrais chiffres.
const EXTRAIT_FLORIDE_AVEC_FIREBALL = `
<table class="c-results-table">
  <tbody id="js-state-results-table">
    <tr class="c-results-table__item c-results-table__item--medium c-draw-card">
      <th class="c-draw-card__date" scope="row">
        <time class="c-draw-card__draw-date">
          <span class="c-draw-card__draw-date-dow">Wednesday,</span>
          <span class="c-draw-card__draw-date-sub">Jul 22, 2026</span>
        </time>
      </th>
      <td class="c-draw-card__result">
        <div class="c-draw-card__draws">
          <div class="c-draw-card__ball-box">
            <ul class="c-result c-draw-card__ball-list">
              <li class="c-ball c-ball--sm">4</li>
              <li class="c-ball c-ball--sm">9</li>
              <li class="c-ball c-ball--sm">3</li>
              <li class="c-ball c-ball--sm">4</li>
              <li class="c-result__bonus">
                <abbr class="c-result__bonus-abbr" title="Fireball">FB</abbr>
                <span class="u-hidden-visually">:</span>
                <span class="c-ball c-ball--fire c-ball--sm">3</span>
              </li>
            </ul>
          </div>
        </div>
      </td>
    </tr>
  </tbody>
</table>`;

describe("parseDateAffichee", () => {
  it("convertit le format affiche par le site en YYYY-MM-DD", () => {
    expect(parseDateAffichee("Jul 22, 2026")).toBe("2026-07-22");
    expect(parseDateAffichee("Jan 5, 2026")).toBe("2026-01-05");
  });

  it("rejette un format inattendu plutot que de deviner", () => {
    expect(parseDateAffichee("22/07/2026")).toBeNull();
    expect(parseDateAffichee("")).toBeNull();
  });
});

describe("parserPremierTirage", () => {
  it("extrait la date et les 3 chiffres d'un tirage Lotto 3 (fixture reelle)", () => {
    expect(parserPremierTirage(EXTRAIT_3_CHIFFRES)).toEqual({
      date: "2026-07-22",
      chiffres: "635",
    });
  });

  it("extrait la date et les 4 chiffres d'un tirage Lotto 4 (fixture reelle)", () => {
    expect(parserPremierTirage(EXTRAIT_4_CHIFFRES)).toEqual({
      date: "2026-07-22",
      chiffres: "6145",
    });
  });

  it("renvoie null si la page ne contient pas la structure attendue", () => {
    expect(parserPremierTirage("<html><body>rien ici</body></html>")).toBeNull();
  });

  it("exclut le numero bonus Fireball de la Floride (bug reel trouve en verification)", () => {
    // Sans le filtre, ce fixture renverrait "49343" (5 chiffres) au lieu de "4934".
    expect(parserPremierTirage(EXTRAIT_FLORIDE_AVEC_FIREBALL)).toEqual({
      date: "2026-07-22",
      chiffres: "4934",
    });
  });
});
