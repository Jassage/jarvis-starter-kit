import { Request } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import logger from '../../utils/logger';

// Journal d'audit écrit explicitement par les services sensibles, jamais par un
// middleware global : un middleware ne sait ni quelle entité a été touchée, ni si
// l'opération a réellement abouti, et journaliserait autant les échecs de
// validation que les vraies actions métier.
//
// Règle absolue : journaliser() n'échoue JAMAIS vers l'appelant. Une écriture de
// journal ratée ne doit pas annuler un encaissement ou un check-in. Même principe
// que creerEcritureAuto sur BANKA ("l'opération bancaire ne doit jamais être
// bloquée par un problème comptable"). L'appel se fait donc hors transaction.

export type ActionAudit =
  | 'CONNEXION_REUSSIE'
  | 'CONNEXION_ECHOUEE'
  | 'DECONNEXION'
  | 'EMPLOYE_CREE'
  | 'EMPLOYE_MODIFIE'
  | 'MOT_DE_PASSE_REINITIALISE'
  | 'PAIEMENT_ENCAISSE'
  | 'RESERVATION_CREEE'
  | 'RESERVATION_ANNULEE'
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'ETABLISSEMENT_MODIFIE'
  | 'LOGO_MODIFIE'
  | 'PHOTO_AJOUTEE'
  | 'PHOTO_SUPPRIMEE';

interface EntreeAudit {
  action: ActionAudit;
  entite: string;
  entiteId?: string | null;
  etablissementId?: string | null;
  details?: Prisma.InputJsonValue;
  // Renseigné explicitement quand aucun employé n'est authentifié (échec de
  // connexion, réservation depuis le site public).
  auteur?: { id?: string | null; nom?: string | null; role?: string | null };
}

// Extrait l'IP réelle derrière un éventuel reverse proxy. Express ne renseigne
// req.ip depuis X-Forwarded-For que si 'trust proxy' est activé, d'où la lecture
// directe de l'en-tête en repli.
function extraireIp(req?: Request): string | null {
  if (!req) return null;
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip ?? req.socket?.remoteAddress ?? null;
}

export async function journaliser(entree: EntreeAudit, req?: Request): Promise<void> {
  try {
    const auteur = entree.auteur ?? {
      id: req?.employe?.id,
      nom: req?.employe?.nom,
      role: req?.employe?.role,
    };

    await prisma.journalAudit.create({
      data: {
        employeId: auteur.id ?? null,
        employeNom: auteur.nom ?? null,
        employeRole: auteur.role ?? null,
        etablissementId: entree.etablissementId ?? req?.employe?.etablissementId ?? null,
        action: entree.action,
        entite: entree.entite,
        entiteId: entree.entiteId ?? null,
        details: entree.details ?? Prisma.JsonNull,
        ip: extraireIp(req),
      },
    });
  } catch (err) {
    // Volontairement avalé : voir le commentaire d'en-tête.
    logger.error({ err, action: entree.action, entite: entree.entite }, "Échec d'écriture du journal d'audit");
  }
}

export interface FiltresJournal {
  action?: string;
  employeId?: string;
  etablissementId?: string | null;
  from?: Date;
  to?: Date;
  limit: number;
  offset: number;
}

export async function listerJournal(filtres: FiltresJournal) {
  const where: Prisma.JournalAuditWhereInput = {};

  if (filtres.action) where.action = filtres.action;
  if (filtres.employeId) where.employeId = filtres.employeId;
  // null = vue consolidée d'un administrateur de chaîne : aucun filtre appliqué.
  if (filtres.etablissementId) where.etablissementId = filtres.etablissementId;
  if (filtres.from || filtres.to) {
    where.createdAt = {
      ...(filtres.from && { gte: filtres.from }),
      ...(filtres.to && { lte: filtres.to }),
    };
  }

  const [entrees, total] = await Promise.all([
    prisma.journalAudit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filtres.limit,
      skip: filtres.offset,
    }),
    prisma.journalAudit.count({ where }),
  ]);

  return { entrees, total };
}

// Liste des actions réellement présentes en base, pour alimenter le filtre de
// l'interface sans y coder en dur une liste qui se désynchroniserait.
export async function listerActions(): Promise<string[]> {
  const groupes = await prisma.journalAudit.groupBy({ by: ['action'], orderBy: { action: 'asc' } });
  return groupes.map((g) => g.action);
}
