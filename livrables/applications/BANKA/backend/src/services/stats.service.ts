import prisma from '../utils/prisma';

export async function getDashboardStats(agenceId?: string) {
  const where = agenceId ? { agenceId } : {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalClients,
    totalComptes,
    totalPrets,
    totalPretsEnCours,
    comptesSoldes,
    transactionsAujourdhui,
    transactionsEnAttente,
    pretsEnRetard,
  ] = await Promise.all([
    prisma.client.count({ where: { statut: 'ACTIF' } }),
    prisma.compte.count({ where: { ...where, statut: 'ACTIF' } }),
    prisma.pret.count({ where }),
    prisma.pret.count({ where: { ...where, statut: { in: ['EN_COURS', 'EN_RETARD'] } } }),
    prisma.compte.aggregate({ where: { ...where, statut: 'ACTIF' }, _sum: { solde: true } }),
    prisma.transaction.count({
      where: {
        ...( agenceId ? { OR: [{ compteDebit: { agenceId } }, { compteCredit: { agenceId } }] } : {} ),
        createdAt: { gte: today, lt: tomorrow },
        statut: 'VALIDEE',
      },
    }),
    prisma.transaction.count({
      where: {
        ...( agenceId ? { OR: [{ compteDebit: { agenceId } }, { compteCredit: { agenceId } }] } : {} ),
        statut: 'EN_ATTENTE',
      },
    }),
    prisma.pret.count({ where: { ...where, statut: 'EN_RETARD' } }),
  ]);

  const depotsAujourdhui = await prisma.transaction.aggregate({
    where: {
      type: 'DEPOT',
      statut: 'VALIDEE',
      createdAt: { gte: today, lt: tomorrow },
      ...(agenceId ? { compteCredit: { agenceId } } : {}),
    },
    _sum: { montant: true },
  });

  const retraitsAujourdhui = await prisma.transaction.aggregate({
    where: {
      type: 'RETRAIT',
      statut: 'VALIDEE',
      createdAt: { gte: today, lt: tomorrow },
      ...(agenceId ? { compteDebit: { agenceId } } : {}),
    },
    _sum: { montant: true },
  });

  const encoursPrets = await prisma.pret.aggregate({
    where: { ...where, statut: { in: ['EN_COURS', 'EN_RETARD'] } },
    _sum: { resteARegler: true },
  });

  return {
    totalClients,
    totalComptes,
    totalPrets,
    totalPretsEnCours,
    transactionsAujourdhui,
    transactionsEnAttente,
    pretsEnRetard,
    soldeTotal: Number(comptesSoldes._sum.solde || 0),
    depotsAujourdhui: Number(depotsAujourdhui._sum.montant || 0),
    retraitsAujourdhui: Number(retraitsAujourdhui._sum.montant || 0),
    encoursCredit: Number(encoursPrets._sum.resteARegler || 0),
  };
}

export async function getRapportJournalier(date: Date, agenceId?: string) {
  const debut = new Date(date);
  debut.setHours(0, 0, 0, 0);
  const fin = new Date(date);
  fin.setHours(23, 59, 59, 999);

  const txWhere: any = {
    statut: 'VALIDEE',
    createdAt: { gte: debut, lte: fin },
  };
  if (agenceId) {
    txWhere.OR = [{ compteDebit: { agenceId } }, { compteCredit: { agenceId } }];
  }

  const transactions = await prisma.transaction.groupBy({
    by: ['type', 'devise'],
    where: txWhere,
    _sum: { montant: true },
    _count: { id: true },
  });

  const nouveauxClients = await prisma.client.count({
    where: { createdAt: { gte: debut, lte: fin } },
  });

  const nouveauxComptes = await prisma.compte.count({
    where: { ...(agenceId ? { agenceId } : {}), createdAt: { gte: debut, lte: fin } },
  });

  const nouveauxPrets = await prisma.pret.count({
    where: { ...(agenceId ? { agenceId } : {}), createdAt: { gte: debut, lte: fin } },
  });

  return { date: debut, transactions, nouveauxClients, nouveauxComptes, nouveauxPrets };
}

export async function getPAR(agenceId?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const par30 = new Date(today);
  par30.setDate(par30.getDate() - 30);
  const par90 = new Date(today);
  par90.setDate(par90.getDate() - 90);

  const where = agenceId ? { agenceId } : {};

  const [encours, retard30, retard90] = await Promise.all([
    prisma.pret.aggregate({
      where: { ...where, statut: { in: ['EN_COURS', 'EN_RETARD'] } },
      _sum: { resteARegler: true },
    }),
    prisma.pret.aggregate({
      where: { ...where, statut: 'EN_RETARD', datePremierRdv: { lte: par30 } },
      _sum: { resteARegler: true },
      _count: { id: true },
    }),
    prisma.pret.aggregate({
      where: { ...where, statut: 'EN_RETARD', datePremierRdv: { lte: par90 } },
      _sum: { resteARegler: true },
      _count: { id: true },
    }),
  ]);

  const totalEncours = Number(encours._sum.resteARegler || 0);
  const montantRetard30 = Number(retard30._sum.resteARegler || 0);
  const montantRetard90 = Number(retard90._sum.resteARegler || 0);

  return {
    encoursTotalCredit: totalEncours,
    par30: { montant: montantRetard30, count: retard30._count.id, ratio: totalEncours > 0 ? (montantRetard30 / totalEncours) * 100 : 0 },
    par90: { montant: montantRetard90, count: retard90._count.id, ratio: totalEncours > 0 ? (montantRetard90 / totalEncours) * 100 : 0 },
  };
}
