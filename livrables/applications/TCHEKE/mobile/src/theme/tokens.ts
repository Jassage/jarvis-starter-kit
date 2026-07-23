/**
 * Tokens de theme, derives des maquettes validees (voir l'artifact de design).
 * Palette : bleu profond (confiance), rouge (energie bòlèt), or (numeros
 * gagnants). Vert/rouge reserves a la hausse/baisse du taux, jamais melanges
 * a l'identite de marque.
 */

export const palette = {
  navy: "#0B2A6B",
  navyDeep: "#0A1F52",
  red: "#E23744",
  gold: "#F4A621",
  goldDeep: "#C97E12",
  up: "#12855A",
  down: "#D83A3A",
} as const;

export interface Theme {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  line: string;
  chip: string;
  navy: string;
  navyDeep: string;
  red: string;
  gold: string;
  goldDeep: string;
  up: string;
  down: string;
}

export const themeClair: Theme = {
  bg: "#F4F6FB",
  surface: "#FFFFFF",
  ink: "#131A2E",
  muted: "#6B7590",
  line: "#E4E8F2",
  chip: "#EEF1FA",
  ...palette,
};

export const themeSombre: Theme = {
  bg: "#0C1120",
  surface: "#16203A",
  ink: "#EAEEF9",
  muted: "#8E9ABB",
  line: "#24304C",
  chip: "#1B2540",
  ...palette,
  // Le bleu de marque est eclairci en mode sombre pour rester lisible sur fond fonce.
  navy: "#4A74E0",
};

export const espacement = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const rayon = { sm: 9, md: 13, lg: 16, xl: 22, pill: 999 } as const;

export const typo = {
  chiffreGeant: { fontSize: 40, fontWeight: "800" as const },
  chiffreGros: { fontSize: 25, fontWeight: "800" as const },
  chiffreMoyen: { fontSize: 18, fontWeight: "800" as const },
  titre: { fontSize: 21, fontWeight: "800" as const },
  corps: { fontSize: 13.5, fontWeight: "600" as const },
  legende: { fontSize: 11, fontWeight: "600" as const },
};
