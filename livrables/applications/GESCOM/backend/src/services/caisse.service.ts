import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';
import { assertOwnEmplacement } from '../middleware/emplacementScope';
import { Prisma } from '@prisma/client';

type RequestingUser = { role: string; emplacementId?: string | null };

// Somme des ventes en espèces validées d'une session : seule composante qui affecte le tiroir
// physique (CHEQUE/VIREMENT/CREDIT n'y transitent jamais).
async function sommeVentesEspeces(sessionCaisseId: string): Promise<number> {
  const agg = await prisma.vente.aggregate({
    where: { sessionCaisseId, modePaiement: 'ESPECES', statut: 'VALIDEE' },
    _sum: { montantPaye: true },
  });
  return Number(agg._sum.montantPaye || 0);
}

export async function ouvrirSession(data: { emplacementId: string; soldeOuverture: number; notes?: string }, userId: string) {
  const emplacement = await prisma.emplacement.findUnique({ where: { id: data.emplacementId } });
  if (!emplacement || !emplacement.actif) throw new AppError(404, 'Emplacement introuvable ou inactif');

  const existante = await prisma.sessionCaisse.findFirst({
    where: { emplacementId: data.emplacementId, statut: 'OUVERTE' },
  });
  if (existante) throw new AppError(400, 'Une session de caisse est déjà ouverte pour cet emplacement');

  const session = await prisma.sessionCaisse.create({
    data: {
      emplacementId: data.emplacementId,
      ouvertParId: userId,
      soldeOuverture: new Prisma.Decimal(data.soldeOuverture),
      notes: data.notes,
    },
    include: {
      emplacement: { select: { nom: true, type: true } },
      ouvertPar: { select: { nom: true, prenom: true } },
    },
  });

  await createAuditLog({
    userId,
    table: 'sessions_caisse',
    action: 'OUVERTURE',
    entiteId: session.id,
    nouveau: { emplacementId: data.emplacementId, soldeOuverture: data.soldeOuverture },
  });

  return session;
}

export async function fermerSession(id: string, userId: string, soldeFermeture: number, notes?: string, requestingUser?: RequestingUser) {
  const session = await prisma.sessionCaisse.findUnique({ where: { id } });
  if (!session) throw new AppError(404, 'Session introuvable');
  assertOwnEmplacement(requestingUser, session.emplacementId);
  if (session.statut !== 'OUVERTE') throw new AppError(400, 'Session déjà fermée');

  const totalEspeces = await sommeVentesEspeces(id);
  const soldeTheorique = Number(session.soldeOuverture) + totalEspeces;
  const ecartConstate = Math.round((soldeFermeture - soldeTheorique) * 100) / 100;

  const updated = await prisma.sessionCaisse.update({
    where: { id },
    data: {
      statut: 'FERMEE',
      fermeParId: userId,
      dateFermeture: new Date(),
      soldeTheorique: new Prisma.Decimal(soldeTheorique),
      soldeFermeture: new Prisma.Decimal(soldeFermeture),
      ecartConstate: new Prisma.Decimal(ecartConstate),
      notes: notes ?? session.notes,
    },
    include: {
      emplacement: { select: { nom: true, type: true } },
      ouvertPar: { select: { nom: true, prenom: true } },
      fermePar: { select: { nom: true, prenom: true } },
    },
  });

  await createAuditLog({
    userId,
    table: 'sessions_caisse',
    action: 'FERMETURE',
    entiteId: id,
    nouveau: { soldeTheorique, soldeFermeture, ecartConstate },
  });

  return updated;
}

export async function getSessionActive(emplacementId: string) {
  const session = await prisma.sessionCaisse.findFirst({
    where: { emplacementId, statut: 'OUVERTE' },
    include: {
      emplacement: { select: { nom: true, type: true } },
      ouvertPar: { select: { nom: true, prenom: true } },
      _count: { select: { ventes: true } },
    },
  });
  if (!session) return null;

  const totalEspeces = await sommeVentesEspeces(session.id);
  return { ...session, soldeAttenduActuel: Number(session.soldeOuverture) + totalEspeces };
}

export async function getSession(id: string, requestingUser?: RequestingUser) {
  const session = await prisma.sessionCaisse.findUnique({
    where: { id },
    include: {
      emplacement: { select: { nom: true, type: true } },
      ouvertPar: { select: { nom: true, prenom: true } },
      fermePar: { select: { nom: true, prenom: true } },
      ventes: {
        where: { statut: 'VALIDEE' },
        orderBy: { dateVente: 'asc' },
        select: { id: true, numero: true, modePaiement: true, montantTotal: true, montantPaye: true, dateVente: true },
      },
    },
  });
  if (!session) throw new AppError(404, 'Session introuvable');
  assertOwnEmplacement(requestingUser, session.emplacementId);
  return session;
}

export async function listSessions(params: { emplacementId?: string; page?: number; limit?: number }) {
  const { emplacementId, page = 1, limit = 30 } = params;
  const skip = (page - 1) * limit;
  const where: Prisma.SessionCaisseWhereInput = {};
  if (emplacementId) where.emplacementId = emplacementId;

  const [total, items] = await Promise.all([
    prisma.sessionCaisse.count({ where }),
    prisma.sessionCaisse.findMany({
      where,
      skip,
      take: limit,
      orderBy: { dateOuverture: 'desc' },
      include: {
        emplacement: { select: { nom: true, type: true } },
        ouvertPar: { select: { nom: true, prenom: true } },
        fermePar: { select: { nom: true, prenom: true } },
        _count: { select: { ventes: true } },
      },
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}
