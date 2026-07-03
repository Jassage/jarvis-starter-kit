import prisma from "../utils/prisma";
import { AppError } from "../types";
import { createAuditLog } from "../utils/audit";

// ─── Plan comptable ─────────────────────────────────────────────

export async function getPlanComptable() {
  return prisma.compteComptable.findMany({ orderBy: { numero: "asc" } });
}

// ─── Journal (saisie manuelle + consultation) ──────────────────

export async function getJournal(opts: {
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}) {
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
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: {
        compteDebit: { select: { numero: true, intitule: true } },
        compteCredit: { select: { numero: true, intitule: true } },
        utilisateur: { select: { nom: true, prenom: true } },
      },
    }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function createEcriture(
  data: {
    compteDebitId: string;
    compteCreditId: string;
    montant: number;
    libelle: string;
    date?: string;
  },
  userId: string,
) {
  if (data.compteDebitId === data.compteCreditId)
    throw new AppError(400, "Débit et crédit doivent être différents");
  if (data.montant <= 0) throw new AppError(400, "Montant invalide");

  const [debit, credit] = await Promise.all([
    prisma.compteComptable.findUnique({ where: { id: data.compteDebitId } }),
    prisma.compteComptable.findUnique({ where: { id: data.compteCreditId } }),
  ]);
  if (!debit) throw new AppError(404, "Compte débit introuvable");
  if (!credit) throw new AppError(404, "Compte crédit introuvable");

  const date = data.date ? new Date(data.date) : new Date();
  if (data.date && Number.isNaN(date.getTime()))
    throw new AppError(400, "Date invalide");

  const ecriture = await prisma.ecritureComptable.create({
    data: {
      compteDebitId: data.compteDebitId,
      compteCreditId: data.compteCreditId,
      montant: data.montant,
      libelle: data.libelle,
      date,
      userId,
      referenceType: "MANUELLE",
    },
    include: {
      compteDebit: { select: { numero: true, intitule: true } },
      compteCredit: { select: { numero: true, intitule: true } },
    },
  });
  await createAuditLog({
    userId,
    table: "ecritures_comptables",
    action: "CREATE",
    entiteId: ecriture.id,
    nouveau: { libelle: data.libelle, montant: data.montant },
  });
  return ecriture;
}

// ─── Grand livre ─────────────────────────────────────────────────

export async function getGrandLivre(
  compteId: string,
  opts: { from?: Date; to?: Date },
) {
  const { from, to } = opts;
  const compte = await prisma.compteComptable.findUnique({
    where: { id: compteId },
  });
  if (!compte) throw new AppError(404, "Compte introuvable");

  const where: any = {
    OR: [{ compteDebitId: compteId }, { compteCreditId: compteId }],
  };
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = from;
    if (to) where.date.lte = to;
  }

  const ecritures = await prisma.ecritureComptable.findMany({
    where,
    orderBy: { date: "asc" },
    select: {
      date: true,
      libelle: true,
      montant: true,
      compteDebitId: true,
      compteCreditId: true,
    },
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

  return {
    ...compte,
    lignes,
    soldeDebit,
    soldeCredit,
    solde: soldeDebit - soldeCredit,
  };
}

// ─── Bilan (actif / passif) ────────────────────────────────────

export async function getBilan(date?: Date) {
  const to = date || new Date();

  const [debits, credits, comptes] = await Promise.all([
    prisma.ecritureComptable.groupBy({
      by: ["compteDebitId"],
      where: { date: { lte: to } },
      _sum: { montant: true },
    }),
    prisma.ecritureComptable.groupBy({
      by: ["compteCreditId"],
      where: { date: { lte: to } },
      _sum: { montant: true },
    }),
    prisma.compteComptable.findMany({ orderBy: { numero: "asc" } }),
  ]);

  const soldes: Record<string, number> = {};
  for (const d of debits)
    soldes[d.compteDebitId] =
      (soldes[d.compteDebitId] || 0) + Number(d._sum.montant || 0);
  for (const c of credits)
    soldes[c.compteCreditId] =
      (soldes[c.compteCreditId] || 0) - Number(c._sum.montant || 0);

  // Convention de signe : solde = débits - crédits.
  // Actif : solde débiteur positif attendu. Passif : solde créditeur → on inverse le signe.
  // Math.abs() cassait l'identité du bilan dès qu'un compte avait un solde de sens anormal
  // (ex. stock négatif après survente) : deux comptes de signe opposé se retrouvaient tous
  // les deux comptés positivement, et Actif ne pouvait plus jamais égaler Passif+Résultat.
  const actifs = comptes
    .filter((c) => c.type === "ACTIF" && (soldes[c.id] || 0) !== 0)
    .map((c) => ({
      numero: c.numero,
      intitule: c.intitule,
      solde: soldes[c.id] || 0,
    }));
  const passifs = comptes
    .filter((c) => c.type === "PASSIF" && (soldes[c.id] || 0) !== 0)
    .map((c) => ({
      numero: c.numero,
      intitule: c.intitule,
      solde: -(soldes[c.id] || 0),
    }));

  const resultat = await getResultat(undefined, to);
  const resultatExercice =
    resultat.resultatNet !== 0
      ? [
          {
            numero: "12",
            intitule: "Résultat de l’exercice",
            solde: resultat.resultatNet,
          },
        ]
      : [];
  const passifsAvecResultat = [...passifs, ...resultatExercice];

  const totalActif = actifs.reduce((s, c) => s + c.solde, 0);
  const totalPassif = passifsAvecResultat.reduce((s, c) => s + c.solde, 0);

  return {
    actifs,
    passifs: passifsAvecResultat,
    totalActif,
    totalPassif,
    equilibre: Math.abs(totalActif - totalPassif) < 0.01,
  };
}

// ─── Compte de résultat (produits / charges) ────────────────────

export async function getResultat(from?: Date, to?: Date) {
  const dateWhere: any = {};
  if (from) dateWhere.gte = from;
  if (to) dateWhere.lte = to;
  const where = Object.keys(dateWhere).length ? { date: dateWhere } : {};

  const [debits, credits, comptes] = await Promise.all([
    prisma.ecritureComptable.groupBy({
      by: ["compteDebitId"],
      where,
      _sum: { montant: true },
    }),
    prisma.ecritureComptable.groupBy({
      by: ["compteCreditId"],
      where,
      _sum: { montant: true },
    }),
    prisma.compteComptable.findMany({ orderBy: { numero: "asc" } }),
  ]);

  const mouv: Record<string, { debit: number; credit: number }> = {};
  for (const d of debits) {
    if (!mouv[d.compteDebitId]) mouv[d.compteDebitId] = { debit: 0, credit: 0 };
    mouv[d.compteDebitId].debit += Number(d._sum.montant || 0);
  }
  for (const c of credits) {
    if (!mouv[c.compteCreditId])
      mouv[c.compteCreditId] = { debit: 0, credit: 0 };
    mouv[c.compteCreditId].credit += Number(c._sum.montant || 0);
  }

  const produits = comptes
    .filter((c) => c.type === "PRODUIT")
    .map((c) => {
      const m = mouv[c.id] || { debit: 0, credit: 0 };
      return {
        numero: c.numero,
        intitule: c.intitule,
        montant: m.credit - m.debit,
      };
    })
    .filter((c) => c.montant !== 0);

  const charges = comptes
    .filter((c) => c.type === "CHARGE")
    .map((c) => {
      const m = mouv[c.id] || { debit: 0, credit: 0 };
      return {
        numero: c.numero,
        intitule: c.intitule,
        montant: m.debit - m.credit,
      };
    })
    .filter((c) => c.montant !== 0);

  const totalProduits = produits.reduce((s, c) => s + c.montant, 0);
  const totalCharges = charges.reduce((s, c) => s + c.montant, 0);
  const resultatNet = totalProduits - totalCharges;
  const marge = totalProduits > 0 ? (resultatNet / totalProduits) * 100 : 0;

  return { produits, charges, totalProduits, totalCharges, resultatNet, marge };
}

// ─── Dashboard comptable ─────────────────────────────────────────

export async function getDashboardCompta() {
  const now = new Date();
  const debut = new Date(now.getFullYear(), now.getMonth(), 1);

  const [bilan, resultat, nbEcritures, nbEchecsNonResolus] = await Promise.all([
    getBilan(),
    getResultat(debut, now),
    prisma.ecritureComptable.count({ where: { date: { gte: debut } } }),
    prisma.ecritureEchec.count({ where: { resolu: false } }),
  ]);

  return {
    totalActif: bilan.totalActif,
    totalPassif: bilan.totalPassif,
    totalProduits: resultat.totalProduits,
    totalCharges: resultat.totalCharges,
    resultatNet: resultat.resultatNet,
    nbEcrituresMois: nbEcritures,
    nbEchecsNonResolus,
    equilibre: bilan.equilibre,
  };
}

// ─── Réconciliation des écritures en échec ──────────────────────

export async function listEcrituresEchec(opts: {
  resolu?: boolean;
  page?: number;
  limit?: number;
}) {
  const { resolu, page = 1, limit = 30 } = opts;
  const skip = (page - 1) * limit;
  const where: any = {};
  if (resolu !== undefined) where.resolu = resolu;
  const [total, items] = await Promise.all([
    prisma.ecritureEchec.count({ where }),
    prisma.ecritureEchec.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function resoudreEcritureEchec(id: string, userId: string) {
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.ecritureEchec.updateMany({
      where: { id, resolu: false },
      data: { resolu: true, resoluAt: new Date(), resoluParId: userId },
    });
    if (result.count === 0) {
      const existing = await tx.ecritureEchec.findUnique({
        where: { id },
        select: { id: true, resolu: true },
      });
      if (!existing) throw new AppError(404, "Écriture en échec introuvable");
      throw new AppError(400, "Écriture déjà résolue");
    }

    const echec = await tx.ecritureEchec.findUnique({ where: { id } });
    if (!echec) throw new AppError(404, "Écriture en échec introuvable");
    return echec;
  });
  await createAuditLog({
    userId,
    table: "ecritures_echec",
    action: "RESOLUTION",
    entiteId: id,
  });
  return updated;
}
