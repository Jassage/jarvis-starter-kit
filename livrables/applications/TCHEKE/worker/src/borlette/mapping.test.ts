import { describe, it, expect } from "vitest";
import {
  normaliseChiffres,
  calculerLots,
  construireResultat,
  idTirage,
} from "./mapping";

describe("normaliseChiffres", () => {
  it("conserve les zeros de tete", () => {
    expect(normaliseChiffres("007", 3)).toBe("007");
    expect(normaliseChiffres(7, 3)).toBe("007");
    expect(normaliseChiffres("56", 2)).toBe("56");
  });

  it("complete les zeros de tete manquants", () => {
    expect(normaliseChiffres(5, 3)).toBe("005");
    expect(normaliseChiffres("91", 4)).toBe("0091");
  });

  it("retire les caracteres non numeriques", () => {
    expect(normaliseChiffres(" 4-5-6 ", 3)).toBe("456");
  });

  it("rejette une valeur vide", () => {
    expect(() => normaliseChiffres("", 3)).toThrow();
    expect(() => normaliseChiffres("abc", 3)).toThrow();
  });

  it("rejette une valeur trop longue (ne tronque pas en silence)", () => {
    expect(() => normaliseChiffres("4567", 3)).toThrow();
  });
});

describe("calculerLots", () => {
  it("applique les regles validees (exemple de reference 456 / 7891)", () => {
    expect(calculerLots("456", "7891")).toEqual({
      premyeLo: "56",
      dezyemLo: "91",
      twazyemLo: "78",
    });
  });

  it("gere les zeros de tete dans les lots", () => {
    // Lotto4 = 0091 -> 2e lo "91", 3e lo "00"
    expect(calculerLots("003", "0091")).toEqual({
      premyeLo: "03",
      dezyemLo: "91",
      twazyemLo: "00",
    });
  });
});

describe("construireResultat", () => {
  it("construit un resultat complet et normalise", () => {
    const r = construireResultat({
      etat: "NY",
      moment: "SOIR",
      date: "2026-07-22",
      lotto3: 456,
      lotto4: 7891,
    });
    expect(r).toEqual({
      etat: "NY",
      moment: "SOIR",
      date: "2026-07-22",
      lotto3: "456",
      lotto4: "7891",
      premyeLo: "56",
      dezyemLo: "91",
      twazyemLo: "78",
    });
  });

  it("rejette une date mal formee", () => {
    expect(() =>
      construireResultat({
        etat: "FL",
        moment: "MIDI",
        date: "22/07/2026",
        lotto3: "456",
        lotto4: "7891",
      }),
    ).toThrow();
  });
});

describe("idTirage", () => {
  it("produit un identifiant lisible et deterministe", () => {
    expect(idTirage({ date: "2026-07-22", etat: "NY", moment: "SOIR" })).toBe(
      "2026-07-22_NY_SOIR",
    );
  });
});
