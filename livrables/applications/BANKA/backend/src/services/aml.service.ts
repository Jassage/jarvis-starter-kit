import prisma from '../utils/prisma';
import { getConfig } from './configuration.service';

const SEUIL_DEFAUT_HTG = 500_000;
const SEUIL_DEFAUT_USD = 10_000;
const FENETRE_STRUCTURATION_H = 24;
const SEUIL_VELOCITE = 10;

async function getSeuilAML(devise: string): Promise<number> {
  const key = devise === 'USD' ? 'AML_SEUIL_USD' : 'AML_SEUIL_HTG';
  const val = await getConfig(key);
  return parseFloat(val || (devise === 'USD' ? String(SEUIL_DEFAUT_USD) : String(SEUIL_DEFAUT_HTG)));
}

async function creerAlerte(data: {
  type: string;
  compteId?: string;
  clientId?: string;
  transactionId?: string;
  montantTotal?: number;
  details: string;
}) {
  await prisma.alerteAML.create({ data: data as any });
}

// Vérifie si une transaction dépasse le seuil réglementaire BRH
export async function verifierSeuilDeclare(opts: {
  compteId: string;
  clientId: string;
  transactionId: string;
  montant: number;
  devise: string;
}): Promise<void> {
  const seuil = await getSeuilAML(opts.devise);
  if (opts.montant >= seuil) {
    await creerAlerte({
      type: 'SEUIL_DECLARE',
      compteId: opts.compteId,
      clientId: opts.clientId,
      transactionId: opts.transactionId,
      montantTotal: opts.montant,
      details: `Transaction de ${opts.montant} ${opts.devise} dépasse le seuil déclarable BRH de ${seuil} ${opts.devise}`,
    });
  }
}

// Détection structuration (smurfing) : plusieurs transactions sous le seuil en 24h qui cumulent > seuil
export async function verifierStructuration(opts: {
  compteId: string;
  clientId: string;
  transactionId: string;
  montant: number;
  devise: string;
}): Promise<void> {
  const seuil = await getSeuilAML(opts.devise);
  if (opts.montant >= seuil) return; // Déjà géré par verifierSeuilDeclare

  const depuis = new Date(Date.now() - FENETRE_STRUCTURATION_H * 3600 * 1000);
  const cumul = await prisma.transaction.aggregate({
    where: {
      compteDebitId: opts.compteId,
      type: { in: ['DEPOT', 'RETRAIT', 'VIREMENT_DEBIT'] as any },
      statut: 'VALIDEE',
      createdAt: { gte: depuis },
    },
    _sum: { montant: true },
    _count: true,
  });

  const total = Number(cumul._sum.montant || 0) + opts.montant;
  if (total >= seuil && cumul._count >= 3) {
    await creerAlerte({
      type: 'STRUCTURATION',
      compteId: opts.compteId,
      clientId: opts.clientId,
      transactionId: opts.transactionId,
      montantTotal: total,
      details: `Structuration suspectée : ${cumul._count + 1} transactions = ${total} ${opts.devise} en ${FENETRE_STRUCTURATION_H}h (seuil ${seuil} ${opts.devise})`,
    });
  }
}

// Détection vélocité : nombre de transactions anormalement élevé sur 1h
export async function verifierVelocite(opts: {
  compteId: string;
  clientId: string;
  transactionId: string;
  devise: string;
}): Promise<void> {
  const depuis = new Date(Date.now() - 3600 * 1000);
  const count = await prisma.transaction.count({
    where: {
      OR: [{ compteDebitId: opts.compteId }, { compteCreditId: opts.compteId }],
      statut: 'VALIDEE',
      createdAt: { gte: depuis },
    },
  });

  if (count >= SEUIL_VELOCITE) {
    await creerAlerte({
      type: 'VELOCITE_ELEVEE',
      compteId: opts.compteId,
      clientId: opts.clientId,
      transactionId: opts.transactionId,
      details: `Vélocité anormale : ${count} transactions validées en 1h sur le compte`,
    });
  }
}

// Vérification mandataire blacklisté lors d'un virement
export async function verifierMandataireBlacklist(opts: {
  compteSourceId: string;
  compteDestId: string;
  transactionId: string;
}): Promise<void> {
  const compteSource = await prisma.compte.findUnique({
    where: { id: opts.compteSourceId },
    include: { client: { select: { id: true, statut: true } } },
  });
  const compteDest = await prisma.compte.findUnique({
    where: { id: opts.compteDestId },
    include: { client: { select: { id: true, statut: true } } },
  });

  if (compteSource?.client?.statut === 'BLACKLISTE' || compteDest?.client?.statut === 'BLACKLISTE') {
    const clientBlacklist = compteSource?.client?.statut === 'BLACKLISTE' ? compteSource.client : compteDest!.client;
    await creerAlerte({
      type: 'MANDATAIRE_BLACKLIST',
      compteId: opts.compteSourceId,
      clientId: clientBlacklist?.id,
      transactionId: opts.transactionId,
      details: `Virement impliquant un client blacklisté (ID: ${clientBlacklist?.id})`,
    });
  }
}

// Point d'entrée unique appelé après chaque transaction validée
export async function analyserTransactionAML(opts: {
  compteId: string;
  clientId: string;
  transactionId: string;
  montant: number;
  devise: string;
  compteDestId?: string;
}): Promise<void> {
  const checks: Promise<void>[] = [
    verifierSeuilDeclare(opts),
    verifierStructuration(opts),
    verifierVelocite(opts),
  ];

  if (opts.compteDestId) {
    checks.push(verifierMandataireBlacklist({
      compteSourceId: opts.compteId,
      compteDestId: opts.compteDestId,
      transactionId: opts.transactionId,
    }));
  }

  await Promise.allSettled(checks);
}

// API : lister les alertes AML (pour les auditeurs)
export async function listAlertesAML(opts: { statut?: string; page?: number; limit?: number }) {
  const { statut, page = 1, limit = 50 } = opts;
  const skip = (page - 1) * limit;
  const where: any = {};
  if (statut) where.statut = statut;

  const [total, alertes] = await Promise.all([
    prisma.alerteAML.count({ where }),
    prisma.alerteAML.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
  ]);

  return { alertes, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function traiterAlerteAML(id: string, userId: string) {
  return prisma.alerteAML.update({
    where: { id },
    data: { statut: 'TRAITEE', traitePar: userId, traiteAt: new Date() },
  });
}
