import { Request } from 'express';
import prisma from '../../config/database';
import { ActionAudit, Prisma } from '@prisma/client';
import logger from '../../utils/logger';

interface AuditContexte {
  cible?: string;
  cibleId?: string | null;
  details?: string | null;
  // Auteur explicite, pour les actions qui n'ont pas encore de `req.user` : la
  // connexion elle-même se trace avant que le middleware d'authentification n'ait pu
  // intervenir.
  auteur?: { id: string; email: string; nom: string };
}

// Écrit une entrée au journal d'audit à partir de la requête en cours. L'identité de
// l'auteur est figée en clair (email + nom) : supprimer un compte plus tard ne doit pas
// effacer la trace de ce qu'il a fait.
//
// Volontairement « best effort » : si l'écriture du journal échoue, l'action métier
// qui vient de réussir n'est pas annulée pour autant (on ne refuse pas une
// modification de grille parce que la table d'audit est indisponible). L'échec est
// journalisé côté serveur pour être visible en exploitation.
export async function logAudit(req: Request, action: ActionAudit, contexte: AuditContexte = {}) {
  const auteur = contexte.auteur ?? req.user;
  if (!auteur) return;

  try {
    await prisma.auditLog.create({
      data: {
        action,
        utilisateurId: auteur.id,
        utilisateurEmail: auteur.email,
        utilisateurNom: auteur.nom,
        cible: contexte.cible ?? null,
        cibleId: contexte.cibleId ?? null,
        details: contexte.details ?? null,
        // `req.ip` dépend de `trust proxy` en production (cf. server.ts) : derrière un
        // reverse proxy sans ce réglage, on enregistrerait l'IP du proxy.
        adresseIp: req.ip ?? null,
      },
    });
  } catch (err) {
    logger.error({ err, action }, 'Échec d\'écriture du journal d\'audit');
  }
}

interface ListOptions {
  action?: ActionAudit;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export async function listAudit({ action, from, to, page = 1, limit = 50 }: ListOptions) {
  const where: Prisma.AuditLogWhereInput = {
    ...(action ? { action } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const [entrees, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { entrees, total, page, limit };
}
