export function telechargerCsv(nomFichier: string, entetes: string[], lignes: (string | number)[][]) {
  const echapper = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const contenu = [entetes, ...lignes].map((ligne) => ligne.map(echapper).join(',')).join('\n');
  const blob = new Blob([`﻿${contenu}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier;
  a.click();
  URL.revokeObjectURL(url);
}
