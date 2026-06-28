import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';

// ─── Comptes de base & écritures automatiques ─────────────────────────────────

const COMPTES_BASE = [
  { numero: '5700', intitule: 'Caisse / Espèces',           type: 'ACTIF'    },
  { numero: '2600', intitule: 'Dépôts clients',              type: 'PASSIF'   },
  { numero: '2000', intitule: 'Prêts accordés',              type: 'ACTIF'    },
  { numero: '7100', intitule: "Produits d'intérêts",         type: 'PRODUIT'  },
  { numero: '7020', intitule: 'Frais et commissions',        type: 'PRODUIT'  },
  { numero: '6400', intitule: 'Charges de personnel',        type: 'CHARGE'   },
  { numero: '4600', intitule: 'Salaires nets à payer',       type: 'PASSIF'   },
  { numero: '4700', intitule: 'Cotisations sociales dues',   type: 'PASSIF'   },
];

export async function ensureComptesBase(): Promise<void> {
  for (const c of COMPTES_BASE) {
    await prisma.compteComptable.upsert({
      where: { numero: c.numero },
      update: {},
      create: { numero: c.numero, intitule: c.intitule, type: c.type as any },
    });
  }
}

// T3: Cache supprimé — il ne s'invalidait jamais en cas de suppression/recréation d'un compte comptable
async function resolveCompteId(client: any, numero: string): Promise<string | null> {
  const c = await client.compteComptable.findUnique({ where: { numero } });
  return c?.id ?? null;
}

export async function creerEcritureAuto(
  client: any,
  data: {
    debitNumero: string;
    creditNumero: string;
    montant: number;
    libelle: string;
    date?: Date;
    userId: string;
    transactionId?: string;
  }
): Promise<void> {
  try {
    if (data.debitNumero === data.creditNumero) return;
    if (!data.montant || data.montant <= 0) return;
    const [debitId, creditId] = await Promise.all([
      resolveCompteId(client, data.debitNumero),
      resolveCompteId(client, data.creditNumero),
    ]);
    if (!debitId || !creditId) return;
    await client.ecritureComptable.create({
      data: {
        compteDebitId:  debitId,
        compteCreditId: creditId,
        montant:   data.montant,
        libelle:   data.libelle,
        date:      data.date || new Date(),
        creeParId: data.userId,
        transactionId: data.transactionId ?? null,
      } as any,
    });
  } catch {
    // Ne jamais bloquer une opération bancaire à cause d'une erreur comptable
  }
}

// ─── Plan comptable ────────────────────────────────────────────────────────────

export async function getPlanComptable() {
  return prisma.compteComptable.findMany({ orderBy: { numero: 'asc' } });
}

export async function createCompteComptable(data: { numero: string; intitule: string; type: string }, userId: string) {
  const existing = await prisma.compteComptable.findUnique({ where: { numero: data.numero } });
  if (existing) throw new AppError(400, `Le numéro ${data.numero} existe déjà`);
  const compte = await prisma.compteComptable.create({ data: { numero: data.numero, intitule: data.intitule, type: data.type as any } });
  await createAuditLog({ userId, table: 'comptes_comptables', action: 'CREATE', entiteId: compte.id, nouveau: data });
  return compte;
}

export async function updateCompteComptable(id: string, data: { intitule?: string; actif?: boolean }, userId: string) {
  const compte = await prisma.compteComptable.findUnique({ where: { id } });
  if (!compte) throw new AppError(404, 'Compte introuvable');
  const updated = await prisma.compteComptable.update({ where: { id }, data });
  await createAuditLog({ userId, table: 'comptes_comptables', action: 'UPDATE', entiteId: id, nouveau: data });
  return updated;
}

export async function deleteCompteComptable(id: string, userId: string) {
  const compte = await prisma.compteComptable.findUnique({
    where: { id },
    include: { _count: { select: { ecrituresDebit: true, ecrituresCredit: true } } },
  });
  if (!compte) throw new AppError(404, 'Compte introuvable');
  const total = (compte as any)._count.ecrituresDebit + (compte as any)._count.ecrituresCredit;
  if (total > 0) throw new AppError(400, `Ce compte a ${total} écriture(s) — désactivez-le plutôt`);
  await createAuditLog({ userId, table: 'comptes_comptables', action: 'DELETE', entiteId: id, nouveau: { numero: compte.numero } });
  return prisma.compteComptable.delete({ where: { id } });
}

// ─── Journal ──────────────────────────────────────────────────────────────────

export async function getJournal(opts: { from?: Date; to?: Date; page?: number; limit?: number }) {
  const { from, to, page = 1, limit = 30 } = opts;
  const skip = (page - 1) * limit;
  const where: any = {};
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = from;
    if (to) where.date.lte = to;
  }
  const [total, items] = await Promise.all([
    prisma.ecritureComptable.count({ where }),
    prisma.ecritureComptable.findMany({
      where, skip, take: limit,
      orderBy: { date: 'desc' },
      include: {
        compteDebit:  { select: { numero: true, intitule: true } },
        compteCredit: { select: { numero: true, intitule: true } },
        creePar:      { select: { nom: true, prenom: true } },
        transaction:  { select: { reference: true, type: true } },
      },
    }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function createEcriture(data: { compteDebitId: string; compteCreditId: string; montant: number; libelle: string; date?: string }, userId: string) {
  if (data.compteDebitId === data.compteCreditId) throw new AppError(400, 'Débit et crédit doivent être différents');
  if (data.montant <= 0) throw new AppError(400, 'Montant invalide');

  const [debit, credit] = await Promise.all([
    prisma.compteComptable.findUnique({ where: { id: data.compteDebitId } }),
    prisma.compteComptable.findUnique({ where: { id: data.compteCreditId } }),
  ]);
  if (!debit) throw new AppError(404, 'Compte débit introuvable');
  if (!credit) throw new AppError(404, 'Compte crédit introuvable');

  const ecriture = await prisma.ecritureComptable.create({
    data: {
      compteDebitId: data.compteDebitId,
      compteCreditId: data.compteCreditId,
      montant: data.montant,
      libelle: data.libelle,
      date: data.date ? new Date(data.date) : new Date(),
      creeParId: userId,
      transactionId: undefined as any,
    } as any,
    include: {
      compteDebit:  { select: { numero: true, intitule: true } },
      compteCredit: { select: { numero: true, intitule: true } },
    },
  });
  return ecriture;
}

export async function deleteEcriture(id: string, userId: string) {
  const ecriture = await prisma.ecritureComptable.findUnique({ where: { id } });
  if (!ecriture) throw new AppError(404, 'Écriture introuvable');
  if ((ecriture as any).transactionId) throw new AppError(400, 'Les écritures liées à une transaction bancaire ne peuvent pas être supprimées');
  await createAuditLog({ userId, table: 'ecritures_comptables', action: 'DELETE', entiteId: id, nouveau: { libelle: (ecriture as any).libelle } });
  return prisma.ecritureComptable.delete({ where: { id } });
}

// ─── Grand livre ──────────────────────────────────────────────────────────────

export async function getGrandLivre(compteId: string, opts: { from?: Date; to?: Date }) {
  const { from, to } = opts;
  const compte = await prisma.compteComptable.findUnique({ where: { id: compteId } });
  if (!compte) throw new AppError(404, 'Compte introuvable');

  const where: any = { OR: [{ compteDebitId: compteId }, { compteCreditId: compteId }] };
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = from;
    if (to) where.date.lte = to;
  }

  const ecritures = await prisma.ecritureComptable.findMany({
    where,
    orderBy: { date: 'asc' },
    select: { date: true, libelle: true, montant: true, compteDebitId: true, compteCreditId: true },
  });

  let solde = 0;
  const lignes = ecritures.map((e) => {
    const isDebit = e.compteDebitId === compteId;
    const debit = isDebit ? Number(e.montant) : 0;
    const credit = !isDebit ? Number(e.montant) : 0;
    solde += debit - credit;
    return { date: e.date, libelle: e.libelle, debit, credit, solde };
  });

  const soldeDebit = lignes.reduce((s, l) => s + l.debit, 0);
  const soldeCredit = lignes.reduce((s, l) => s + l.credit, 0);

  return { ...compte, lignes, soldeDebit, soldeCredit, solde: soldeDebit - soldeCredit };
}

// ─── Bilan ────────────────────────────────────────────────────────────────────

export async function getBilan(date?: Date) {
  const to = date || new Date();

  // T1: Utiliser groupBy+_sum au lieu de charger toutes les écritures en mémoire
  const [debits, credits, comptes] = await Promise.all([
    prisma.ecritureComptable.groupBy({
      by: ['compteDebitId'],
      where: { date: { lte: to } },
      _sum: { montant: true },
    }),
    prisma.ecritureComptable.groupBy({
      by: ['compteCreditId'],
      where: { date: { lte: to } },
      _sum: { montant: true },
    }),
    prisma.compteComptable.findMany({ orderBy: { numero: 'asc' } }),
  ]);

  const soldes: Record<string, number> = {};
  for (const d of debits)  soldes[d.compteDebitId]  = (soldes[d.compteDebitId]  || 0) + Number(d._sum.montant || 0);
  for (const c of credits) soldes[c.compteCreditId] = (soldes[c.compteCreditId] || 0) - Number(c._sum.montant || 0);

  const actifs    = comptes.filter((c) => c.type === 'ACTIF'    && (soldes[c.id] || 0) !== 0).map((c) => ({ numero: c.numero, intitule: c.intitule, solde: Math.abs(soldes[c.id] || 0) }));
  const passifs   = comptes.filter((c) => c.type === 'PASSIF'   && (soldes[c.id] || 0) !== 0).map((c) => ({ numero: c.numero, intitule: c.intitule, solde: Math.abs(soldes[c.id] || 0) }));
  const capitaux  = comptes.filter((c) => c.type === 'CAPITAUX' && (soldes[c.id] || 0) !== 0).map((c) => ({ numero: c.numero, intitule: c.intitule, solde: Math.abs(soldes[c.id] || 0) }));

  const totalActif    = actifs.reduce((s, c) => s + c.solde, 0);
  const totalPassif   = passifs.reduce((s, c) => s + c.solde, 0);
  const totalCapitaux = capitaux.reduce((s, c) => s + c.solde, 0);

  return {
    actifs, passifs, capitaux,
    totalActif, totalPassif, totalCapitaux,
    equilibre: Math.abs(totalActif - (totalPassif + totalCapitaux)) < 0.01,
  };
}

// ─── Compte de résultat ───────────────────────────────────────────────────────

export async function getResultat(from?: Date, to?: Date) {
  const dateWhere: any = {};
  if (from) dateWhere.gte = from;
  if (to)   dateWhere.lte = to;
  const where = Object.keys(dateWhere).length ? { date: dateWhere } : {};

  // T1: Utiliser groupBy+_sum au lieu de charger toutes les écritures en mémoire
  const [debits, credits, comptes] = await Promise.all([
    prisma.ecritureComptable.groupBy({
      by: ['compteDebitId'],
      where,
      _sum: { montant: true },
    }),
    prisma.ecritureComptable.groupBy({
      by: ['compteCreditId'],
      where,
      _sum: { montant: true },
    }),
    prisma.compteComptable.findMany({ orderBy: { numero: 'asc' } }),
  ]);

  const mouv: Record<string, { debit: number; credit: number }> = {};
  for (const d of debits)  { if (!mouv[d.compteDebitId])  mouv[d.compteDebitId]  = { debit: 0, credit: 0 }; mouv[d.compteDebitId].debit   += Number(d._sum.montant || 0); }
  for (const c of credits) { if (!mouv[c.compteCreditId]) mouv[c.compteCreditId] = { debit: 0, credit: 0 }; mouv[c.compteCreditId].credit += Number(c._sum.montant || 0); }

  const produits = comptes.filter((c) => c.type === 'PRODUIT').map((c) => {
    const m = mouv[c.id] || { debit: 0, credit: 0 };
    return { numero: c.numero, intitule: c.intitule, montant: m.credit - m.debit };
  }).filter((c) => c.montant !== 0);

  const charges = comptes.filter((c) => c.type === 'CHARGE').map((c) => {
    const m = mouv[c.id] || { debit: 0, credit: 0 };
    return { numero: c.numero, intitule: c.intitule, montant: m.debit - m.credit };
  }).filter((c) => c.montant !== 0);

  const totalProduits = produits.reduce((s, c) => s + c.montant, 0);
  const totalCharges  = charges.reduce((s, c) => s + c.montant, 0);
  const resultatNet   = totalProduits - totalCharges;
  const marge         = totalProduits > 0 ? (resultatNet / totalProduits) * 100 : 0;

  return { produits, charges, totalProduits, totalCharges, resultatNet, marge };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboard() {
  const now = new Date();
  const debut = new Date(now.getFullYear(), now.getMonth(), 1);

  const [bilan, resultat, nbEcritures] = await Promise.all([
    getBilan(),
    getResultat(debut, now),
    prisma.ecritureComptable.count({ where: { date: { gte: debut } } }),
  ]);

  return {
    totalActif:    bilan.totalActif,
    totalPassif:   bilan.totalPassif,
    totalProduits: resultat.totalProduits,
    totalCharges:  resultat.totalCharges,
    resultatNet:   resultat.resultatNet,
    nbEcrituresMois: nbEcritures,
    equilibre:     bilan.equilibre,
  };
}
