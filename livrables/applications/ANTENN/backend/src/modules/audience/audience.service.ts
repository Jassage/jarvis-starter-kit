import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { SourceAudience } from '@prisma/client';

// Intervalle de heartbeat attendu des players (web et mobile). Le serveur ne fait
// jamais confiance au client sur la durée vue : il la recalcule à partir de l'écart
// entre deux pings, plafonné à ce seuil. Un onglet mis en veille pendant une heure
// puis réveillé n'ajoute donc que 60 s, pas 3600.
const INTERVALLE_PING_SECONDES = 30;
const INCREMENT_MAX_SECONDES = INTERVALLE_PING_SECONDES * 2;

// Au-delà, une session inactive est considérée close : un nouveau ping de la même
// sessionKey sur le même créneau reprend la ligne existante mais sans combler le trou
// (l'incrément reste plafonné), donc la durée cumulée reste honnête.
const RETENTION_SESSIONS_JOURS = 90;

interface PingInput {
  sessionKey: string;
  source?: SourceAudience;
  creneauId?: string | null;
  replayId?: string | null;
}

// Heartbeat d'un player. Public par nature (le player n'est pas authentifié), donc
// tout ce qui est envoyé par le client est traité comme non fiable : l'existence du
// créneau/replay est vérifiée, la durée est calculée côté serveur, et l'unicité
// (sessionKey, cible) empêche une même session de compter plusieurs fois.
export async function enregistrerPing({ sessionKey, source = 'WEB', creneauId, replayId }: PingInput) {
  if (!creneauId && !replayId) {
    throw new AppError('Un ping d\'audience doit porter soit un créneau, soit un replay', 400);
  }
  if (creneauId && replayId) {
    throw new AppError('Un ping d\'audience ne peut pas porter à la fois un créneau et un replay', 400);
  }

  // Une cible inexistante ne doit pas créer de session fantôme : on refuse plutôt que
  // d'accumuler des lignes non rattachables (la clé étrangère le refuserait de toute
  // façon, mais avec une 500 illisible).
  const now = new Date();

  if (creneauId) {
    const creneau = await prisma.creneauGrille.findUnique({
      where: { id: creneauId },
      select: { id: true, syncStatus: true, dateHeureDebut: true, dateHeureFin: true },
    });
    if (!creneau) throw new AppError('Créneau introuvable', 404);
    // Un brouillon n'est jamais à l'antenne : compter une audience dessus fausserait
    // le rapport sponsor (même règle que l'EPG public).
    if (creneau.syncStatus !== 'SYNCHRONISE') {
      throw new AppError('Ce créneau n\'est pas à l\'antenne', 409);
    }
    // On ne peut regarder en direct qu'un programme en cours de diffusion. Sans cette
    // garde, on pourrait gonfler après coup l'audience d'un programme déjà passé, tant
    // que sa preuve de diffusion n'a pas encore été générée. La tolérance couvre le
    // ping en vol au moment de la bascule d'un programme au suivant.
    const toleranceMs = INCREMENT_MAX_SECONDES * 1000;
    if (
      now.getTime() < creneau.dateHeureDebut.getTime() - toleranceMs ||
      now.getTime() > creneau.dateHeureFin.getTime() + toleranceMs
    ) {
      throw new AppError('Ce créneau n\'est pas en cours de diffusion', 409);
    }
  }
  if (replayId) {
    const replay = await prisma.replay.findUnique({ where: { id: replayId }, select: { id: true } });
    if (!replay) throw new AppError('Replay introuvable', 404);
  }

  const existante = await prisma.audienceSession.findFirst({
    where: { sessionKey, creneauId: creneauId ?? null, replayId: replayId ?? null },
  });

  if (!existante) {
    // Première apparition de cette session sur cette cible : c'est la vue.
    const creee = await prisma.audienceSession.create({
      data: {
        sessionKey,
        source,
        creneauId: creneauId ?? null,
        replayId: replayId ?? null,
        debutAt: now,
        dernierPingAt: now,
        dureeSecondes: 0,
      },
    });
    // `Replay.nombreVues` reste le compteur affiché au catalogue : il n'est incrémenté
    // qu'à l'ouverture d'une session, jamais à chaque ping — c'est ce qui le rend non
    // gonflable par un simple rappel de l'endpoint.
    if (replayId) {
      await prisma.replay.update({ where: { id: replayId }, data: { nombreVues: { increment: 1 } } });
    }
    return { sessionId: creee.id, dureeSecondes: creee.dureeSecondes, nouvelleSession: true };
  }

  const ecartSecondes = Math.floor((now.getTime() - existante.dernierPingAt.getTime()) / 1000);
  const increment = Math.max(0, Math.min(ecartSecondes, INCREMENT_MAX_SECONDES));

  const maj = await prisma.audienceSession.update({
    where: { id: existante.id },
    data: { dernierPingAt: now, dureeSecondes: { increment } },
  });
  return { sessionId: maj.id, dureeSecondes: maj.dureeSecondes, nouvelleSession: false };
}

// ─────────────────────────────────────────
// GÉNÉRATION DES PREUVES DE DIFFUSION
// ─────────────────────────────────────────

// Transforme les créneaux réellement passés à l'antenne en DiffusionLog, en agrégeant
// les sessions d'audience de chacun. Pas de scheduler dans le projet (aucun module ne
// tourne en tâche de fond) : la synchronisation est paresseuse, déclenchée à la lecture
// des rapports et du moniteur d'antenne. Idempotente : un créneau déjà loggé est ignoré,
// et la contrainte d'unicité sur `creneauId` bloque en dernier recours deux exécutions
// concurrentes.
export async function synchroniserDiffusionLogs(): Promise<number> {
  const now = new Date();

  const aLogger = await prisma.creneauGrille.findMany({
    where: {
      syncStatus: 'SYNCHRONISE',
      dateHeureFin: { lt: now },
      diffusionLogs: { none: {} },
    },
    select: {
      id: true,
      matchId: true,
      dateHeureDebut: true,
      dateHeureFin: true,
    },
    orderBy: { dateHeureDebut: 'asc' },
    // Garde-fou sur une base laissée longtemps sans lecture : on rattrape par paquets
    // plutôt que de bloquer une requête utilisateur sur des milliers de créneaux.
    take: 500,
  });

  let crees = 0;
  for (const creneau of aLogger) {
    const sessions = await prisma.audienceSession.aggregate({
      where: { creneauId: creneau.id },
      _count: { _all: true },
      _sum: { dureeSecondes: true },
    });

    try {
      await prisma.diffusionLog.create({
        data: {
          creneauId: creneau.id,
          matchId: creneau.matchId,
          // Heure réelle de passage à l'antenne = début programmé du créneau. ANTENN ne
          // pilote pas le playout : tant qu'ErsatzTV n'est pas branché, c'est la seule
          // heure dont la régie dispose (cf. integrations/ersatztv.ts).
          dateHeureReelle: creneau.dateHeureDebut,
          dureeVisionneeEstimee: sessions._sum.dureeSecondes ?? 0,
          nombreVuesEstimees: sessions._count._all,
        },
      });
      crees += 1;
    } catch (err: unknown) {
      // P2002 = une exécution concurrente a déjà créé le log pour ce créneau. C'est le
      // résultat attendu, pas une erreur : on passe au suivant.
      const code = (err as { code?: string }).code;
      if (code !== 'P2002') throw err;
    }
  }

  return crees;
}

// Purge des sessions d'audience trop anciennes. Appelée à la même occasion que la
// synchronisation : leur seul rôle est d'alimenter les DiffusionLog, une fois ceux-ci
// écrits la donnée brute n'a plus à être conservée indéfiniment.
export async function purgerAnciennesSessions(): Promise<number> {
  const limite = new Date(Date.now() - RETENTION_SESSIONS_JOURS * 24 * 60 * 60 * 1000);
  const { count } = await prisma.audienceSession.deleteMany({
    where: { dernierPingAt: { lt: limite } },
  });
  return count;
}

// Audience en direct : sessions ayant pingé dans les deux dernières fenêtres de
// heartbeat. Alimente le moniteur d'antenne côté régie.
export async function getAudienceDirect() {
  const seuil = new Date(Date.now() - INCREMENT_MAX_SECONDES * 1000);
  const sessions = await prisma.audienceSession.findMany({
    where: { creneauId: { not: null }, dernierPingAt: { gte: seuil } },
    select: { sessionKey: true, source: true },
  });

  const cles = new Set(sessions.map((s) => s.sessionKey));
  return {
    total: cles.size,
    web: new Set(sessions.filter((s) => s.source === 'WEB').map((s) => s.sessionKey)).size,
    mobile: new Set(sessions.filter((s) => s.source === 'MOBILE').map((s) => s.sessionKey)).size,
  };
}
