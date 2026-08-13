import { AppError } from '../types';

export type PeriodePreset = 'jour' | 'semaine' | 'mois' | 'annee' | 'personnalisee';

// Résout un préréglage de période en bornes de dates concrètes. `semaine` = 7 derniers jours
// glissants (pas la semaine calendaire), `mois`/`annee` = depuis le 1er du mois/de l'année en
// cours — cohérent avec l'usage courant d'un tableau de bord ("ce mois-ci").
export function resoudrePeriode(preset: PeriodePreset, debutPersonnalise?: Date, finPersonnalisee?: Date): { debut: Date; fin: Date } {
  if (preset === 'personnalisee') {
    if (!debutPersonnalise || !finPersonnalisee) {
      throw new AppError(400, 'debut et fin sont requis pour une période personnalisée');
    }
    return { debut: debutPersonnalise, fin: finPersonnalisee };
  }

  const maintenant = new Date();
  const fin = new Date(maintenant);
  fin.setHours(23, 59, 59, 999);
  const debut = new Date(maintenant);
  debut.setHours(0, 0, 0, 0);

  if (preset === 'semaine') debut.setDate(debut.getDate() - 6);
  else if (preset === 'mois') debut.setDate(1);
  else if (preset === 'annee') debut.setMonth(0, 1);

  return { debut, fin };
}

// Regroupe des enregistrements datés en une série journalière continue (aucun jour sans
// activité n'est silencieusement omis — un graphique d'évolution doit montrer les creux).
export function serieJournaliere<T>(
  items: T[],
  getDate: (item: T) => Date,
  getValeur: (item: T) => number,
  debut: Date,
  fin: Date
): { date: string; valeur: number }[] {
  const parJour = new Map<string, number>();
  for (const item of items) {
    const cle = getDate(item).toISOString().slice(0, 10);
    parJour.set(cle, (parJour.get(cle) || 0) + getValeur(item));
  }

  const resultat: { date: string; valeur: number }[] = [];
  const curseur = new Date(debut);
  curseur.setHours(0, 0, 0, 0);
  const finJour = new Date(fin);
  finJour.setHours(0, 0, 0, 0);

  while (curseur <= finJour) {
    const cle = curseur.toISOString().slice(0, 10);
    resultat.push({ date: cle, valeur: parJour.get(cle) || 0 });
    curseur.setDate(curseur.getDate() + 1);
  }
  return resultat;
}
