// Générateur CSV minimal, sans dépendance : suffisant pour des rapports tabulaires simples
// (cohérent avec ASSOCOTISE ailleurs dans le portefeuille, qui exporte aussi en CSV brut plutôt
// que via une librairie dédiée). Échappe guillemets/virgules/retours à la ligne.
function echapper(valeur: unknown): string {
  const s = valeur === null || valeur === undefined ? '' : String(valeur);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function genererCsv(colonnes: { cle: string; label: string }[], lignes: Record<string, unknown>[]): string {
  const entete = colonnes.map((c) => echapper(c.label)).join(';');
  const corps = lignes.map((ligne) => colonnes.map((c) => echapper(ligne[c.cle])).join(';')).join('\n');
  // BOM UTF-8 pour qu'Excel (très présent chez les pharmacies) affiche correctement les accents.
  return `﻿${entete}\n${corps}`;
}
