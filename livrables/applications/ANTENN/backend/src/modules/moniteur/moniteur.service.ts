import prisma from '../../config/database';
import { detecterTrous, compterBrouillons } from '../grille/creneaux.service';
import { listContratsExpirantBientot } from '../sponsors/sponsors.service';
import { getContenuDeRepli } from '../contenus/contenus.service';
import {
  synchroniserDiffusionLogs,
  purgerAnciennesSessions,
  getAudienceDirect,
} from '../audience/audience.service';

const INCLUDE = {
  contenu: { include: { sponsor: true } },
  match: { include: { sponsorPrincipal: true } },
} as const;

// Vue de contrôle de la régie : ce qui est à l'antenne maintenant, ce qui suit, et les
// trois choses qui peuvent mal tourner (trou de grille, brouillon jamais répercuté,
// contrat sponsor qui expire).
//
// Toutes les données viennent de services déjà existants : ce module n'ajoute aucune
// règle métier, il rassemble en un appel ce qu'un opérateur devait auparavant aller
// chercher sur quatre pages différentes.
export async function getMoniteur() {
  const now = new Date();

  // Même occasion que les rapports pour rattraper les preuves de diffusion : le
  // moniteur est la page la plus ouverte de la régie, donc le déclencheur le plus
  // fiable en l'absence de tâche de fond.
  await synchroniserDiffusionLogs();
  await purgerAnciennesSessions();

  const [enCours, aSuivre, continuite, brouillons, contratsExpirant, repli, audience] = await Promise.all([
    prisma.creneauGrille.findFirst({
      where: { syncStatus: 'SYNCHRONISE', dateHeureDebut: { lte: now }, dateHeureFin: { gt: now } },
      include: INCLUDE,
    }),
    prisma.creneauGrille.findMany({
      where: { syncStatus: 'SYNCHRONISE', dateHeureDebut: { gt: now } },
      include: INCLUDE,
      orderBy: { dateHeureDebut: 'asc' },
      take: 4,
    }),
    detecterTrous(),
    compterBrouillons(),
    listContratsExpirantBientot(),
    getContenuDeRepli(),
    getAudienceDirect(),
  ]);

  // Matchs en direct déclarés : un opérateur qui oublie de terminer un direct doit le
  // voir depuis l'écran d'accueil, c'est ce qui empêche l'EPG de mentir.
  const matchsEnCours = await prisma.match.findMany({
    where: { statutDiffusion: 'EN_COURS' },
    select: { id: true, nomEvenement: true, equipes: true, dateHeurePrevue: true },
    orderBy: { dateHeurePrevue: 'asc' },
  });

  return {
    horodatage: now.toISOString(),
    enCours,
    // Secondes restantes sur le programme courant : c'est l'information qu'un opérateur
    // regarde en premier avant de lancer quoi que ce soit.
    resteSecondes: enCours
      ? Math.max(0, Math.round((enCours.dateHeureFin.getTime() - now.getTime()) / 1000))
      : null,
    aSuivre,
    audience,
    matchsEnCours,
    alertes: {
      trous: continuite.trous,
      totalMinutesTrous: continuite.totalMinutes,
      brouillons,
      contratsExpirant,
      // Sans contenu de repli désigné, le moindre trou de grille devient un écran noir.
      repliDefini: Boolean(repli),
    },
  };
}
