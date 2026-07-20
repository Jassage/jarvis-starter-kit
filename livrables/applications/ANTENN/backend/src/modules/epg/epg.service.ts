import prisma from '../../config/database';
import { getContenuDeRepli } from '../contenus/contenus.service';
import { getConfig } from '../config/config.service';

const INCLUDE = {
  contenu: { include: { sponsor: true } },
  match: { include: { sponsorPrincipal: true } },
  incrustations: { where: { actif: true }, include: { sponsor: true } },
  bandeaux: { where: { actif: true } },
} as const;

// EPG public consommé par le player : créneau courant + les suivants de la journée.
// Ne remonte que la grille synchronisée (ce qui est réellement à l'antenne), jamais
// un brouillon en cours d'édition côté admin.
// Logo de chaîne exposé au player quand il est actif et défini — rendu en permanence,
// indépendamment du programme (cf. Overlay.tsx côté frontend).
async function getLogoChaine() {
  const config = await getConfig();
  if (!config.logoActif || !config.logoUrl) return null;
  return {
    nomChaine: config.nomChaine,
    logoUrl: config.logoUrl,
    logoPosition: config.logoPosition,
    logoOpacite: config.logoOpacite,
  };
}

export async function getEpg() {
  const now = new Date();
  const finJournee = new Date(now);
  finJournee.setHours(23, 59, 59, 999);

  const configChaine = await getLogoChaine();

  const [enCours, aSuivre] = await Promise.all([
    prisma.creneauGrille.findFirst({
      where: { syncStatus: 'SYNCHRONISE', dateHeureDebut: { lte: now }, dateHeureFin: { gt: now } },
      include: INCLUDE,
    }),
    prisma.creneauGrille.findMany({
      where: { syncStatus: 'SYNCHRONISE', dateHeureDebut: { gt: now, lte: finJournee } },
      include: INCLUDE,
      orderBy: { dateHeureDebut: 'asc' },
      take: 10,
    }),
  ]);

  // Continuité d'antenne : un vrai créneau à l'antenne a toujours priorité. Dans un
  // trou de grille, on renvoie le contenu de repli (s'il est désigné) sous la forme
  // d'un enCours synthétique — le viewer voit "Programmation continue" au lieu de
  // "Hors antenne". Pas d'habillage sponsor sur le repli (aucun créneau associé).
  if (!enCours) {
    const repli = await getContenuDeRepli();
    if (repli) {
      return {
        enCours: {
          id: null,
          estRepli: true,
          typeCreneau: 'PROGRAMME' as const,
          dateHeureDebut: null,
          dateHeureFin: null,
          contenu: repli,
          match: null,
          incrustations: [],
          bandeaux: [],
        },
        aSuivre,
        configChaine,
      };
    }
  }

  return { enCours, aSuivre, configChaine };
}

// Guide des programmes multi-jours (public) : de aujourd'hui 00:00 à J+jours, groupé
// par jour calendaire. Ne remonte que la grille SYNCHRONISE (jamais un brouillon),
// même règle que getEpg.
export async function getGuide(jours = 3) {
  const nbJours = Math.min(7, Math.max(1, Math.floor(jours)));

  const debut = new Date();
  debut.setHours(0, 0, 0, 0);
  const fin = new Date(debut);
  fin.setDate(fin.getDate() + nbJours);

  const creneaux = await prisma.creneauGrille.findMany({
    where: {
      syncStatus: 'SYNCHRONISE',
      dateHeureDebut: { gte: debut, lt: fin },
    },
    include: {
      contenu: { include: { sponsor: true } },
      match: { include: { sponsorPrincipal: true } },
    },
    orderBy: { dateHeureDebut: 'asc' },
  });

  // Un jour par date calendaire de la fenêtre (même vide, pour afficher l'onglet).
  const jourList: { date: string; creneaux: typeof creneaux }[] = [];
  for (let i = 0; i < nbJours; i++) {
    const d = new Date(debut);
    d.setDate(d.getDate() + i);
    const cle = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    jourList.push({ date: cle, creneaux: [] });
  }
  for (const c of creneaux) {
    const d = c.dateHeureDebut;
    const cle = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const jour = jourList.find((j) => j.date === cle);
    if (jour) jour.creneaux.push(c);
  }

  return { jours: jourList, configChaine: await getLogoChaine() };
}
