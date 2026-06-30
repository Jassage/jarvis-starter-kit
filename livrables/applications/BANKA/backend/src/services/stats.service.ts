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

export async function getTendance(jours: number = 7) {
  // T2: Remplace jours×2 requêtes séquentielles par UNE seule requête sur la période complète
  const fin = new Date();
  fin.setHours(23, 59, 59, 999);
  const debut = new Date();
  debut.setDate(debut.getDate() - (jours - 1));
  debut.setHours(0, 0, 0, 0);

  const transactions = await prisma.transaction.findMany({
    where: {
      statut: 'VALIDEE',
      type: { in: ['DEPOT', 'RETRAIT'] },
      createdAt: { gte: debut, lte: fin },
    },
    select: { type: true, montant: true, createdAt: true },
  });

  // Initialiser tous les jours à 0 (pour les jours sans transaction)
  const slots: Record<string, { depots: number; retraits: number }> = {};
  for (let i = jours - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    slots[d.toISOString().slice(0, 10)] = { depots: 0, retraits: 0 };
  }

  // Agréger côté Node (données déjà filtrées côté DB)
  for (const tx of transactions) {
    const key = tx.createdAt.toISOString().slice(0, 10);
    if (!slots[key]) continue;
    if (tx.type === 'DEPOT')   slots[key].depots   += Number(tx.montant);
    if (tx.type === 'RETRAIT') slots[key].retraits += Number(tx.montant);
  }

  return Object.entries(slots).map(([date, { depots, retraits }]) => ({ date, depots, retraits }));
}

export async function getAlertes() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [txEnAttente, pretsEnRetard, echeancesAujourdhui] = await Promise.all([
    prisma.transaction.count({ where: { statut: 'EN_ATTENTE' } }),
    prisma.pret.count({ where: { statut: 'EN_RETARD' } }),
    prisma.lignePret.count({
      where: { statut: { in: ['EN_ATTENTE', 'PARTIELLEMENT_PAYE'] }, dateEcheance: { gte: today, lt: tomorrow } },
    }),
  ]);

  return { txEnAttente, pretsEnRetard, echeancesAujourdhui, total: txEnAttente + pretsEnRetard + echeancesAujourdhui };
}

export async function getPAR(agenceId?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const seuil30 = new Date(today);
  seuil30.setDate(seuil30.getDate() - 30);
  const seuil90 = new Date(today);
  seuil90.setDate(seuil90.getDate() - 90);

  const pretWhere = agenceId ? { agenceId } : {};

  // Encours total (dénominateur du PAR)
  const encours = await prisma.pret.aggregate({
    where: { ...pretWhere, statut: { in: ['EN_COURS', 'EN_RETARD'] } },
    _sum: { resteARegler: true },
  });
  const totalEncours = Number(encours._sum.resteARegler || 0);

  // PAR correct : un prêt est en PAR30 si sa PREMIÈRE ÉCHÉANCE IMPAYÉE date de plus de 30 jours.
  // On identifie les pretIds ayant une LignePret EN_RETARD avec dateEcheance <= aujourd'hui - 30j.
  const pretIdsPar30 = await prisma.lignePret.findMany({
    where: { statut: { in: ['EN_RETARD', 'PARTIELLEMENT_PAYE'] }, dateEcheance: { lte: seuil30 } },
    select: { pretId: true },
    distinct: ['pretId'],
  });
  const pretIdsPar90 = await prisma.lignePret.findMany({
    where: { statut: { in: ['EN_RETARD', 'PARTIELLEMENT_PAYE'] }, dateEcheance: { lte: seuil90 } },
    select: { pretId: true },
    distinct: ['pretId'],
  });

  const ids30 = pretIdsPar30.map((l) => l.pretId);
  const ids90 = pretIdsPar90.map((l) => l.pretId);

  const [retard30, retard90] = await Promise.all([
    prisma.pret.aggregate({
      where: { ...pretWhere, id: { in: ids30 }, statut: { in: ['EN_COURS', 'EN_RETARD'] } },
      _sum: { resteARegler: true },
      _count: { id: true },
    }),
    prisma.pret.aggregate({
      where: { ...pretWhere, id: { in: ids90 }, statut: { in: ['EN_COURS', 'EN_RETARD'] } },
      _sum: { resteARegler: true },
      _count: { id: true },
    }),
  ]);

  const montantRetard30 = Number(retard30._sum.resteARegler || 0);
  const montantRetard90 = Number(retard90._sum.resteARegler || 0);

  return {
    encoursTotalCredit: totalEncours,
    par30: { montant: montantRetard30, count: retard30._count.id, ratio: totalEncours > 0 ? (montantRetard30 / totalEncours) * 100 : 0 },
    par90: { montant: montantRetard90, count: retard90._count.id, ratio: totalEncours > 0 ? (montantRetard90 / totalEncours) * 100 : 0 },
  };
}

// ─── Rapport prudentiel BRH ────────────────────────────────────────────────────
// Normes indicatives pour IMF en Haïti (BRH circulaire 112-1) :
//   Ratio de liquidité    : actifs liquides / dépôts à vue >= 20%
//   Ratio de solvabilité  : fonds propres / total actifs >= 8%
//   Grande exposition     : un seul emprunteur >= 10% des fonds propres
export async function getRapportBRH() {
  const [
    caisseSoldes,
    depotVue,
    encoursPrets,
    capitauxPropres,
    [creditClass1, debitClass1],
    grandEmprunteur,
  ] = await Promise.all([
    prisma.compte.aggregate({ where: { type: { in: ['COURANT', 'EPARGNE'] as any }, statut: 'ACTIF' }, _sum: { solde: true } }),
    prisma.compte.aggregate({ where: { type: { in: ['COURANT', 'EPARGNE', 'MICRO_EPARGNE'] as any }, statut: 'ACTIF' }, _sum: { solde: true } }),
    prisma.pret.aggregate({ where: { statut: { in: ['DECAISSE', 'EN_COURS', 'EN_RETARD'] } }, _sum: { resteARegler: true } }),
    prisma.compteComptable.findMany({ where: { numero: { startsWith: '1' }, actif: true }, select: { numero: true, intitule: true } }),
    // Fonds propres = solde net des écritures sur comptes de capitaux propres (classe 1 SYSCOHADA)
    Promise.all([
      prisma.ecritureComptable.aggregate({ _sum: { montant: true }, where: { compteCredit: { numero: { startsWith: '1' } } } }),
      prisma.ecritureComptable.aggregate({ _sum: { montant: true }, where: { compteDebit:  { numero: { startsWith: '1' } } } }),
    ]),
    prisma.pret.groupBy({
      by: ['clientId'],
      where: { statut: { in: ['DECAISSE', 'EN_COURS', 'EN_RETARD'] } },
      _sum: { resteARegler: true },
      orderBy: { _sum: { resteARegler: 'desc' } },
      take: 5,
    }),
  ]);

  const liquidites = Number(caisseSoldes._sum.solde || 0);
  const depots = Number(depotVue._sum.solde || 0);
  const encours = Number(encoursPrets._sum.resteARegler || 0);
  const totalActifEstime = encours + liquidites;
  const fondsPropresSolde = Number(creditClass1._sum.montant || 0) - Number(debitClass1._sum.montant || 0);

  const ratioLiquidite = depots > 0 ? (liquidites / depots) * 100 : null;
  const ratioSolvabilite = totalActifEstime > 0 ? (fondsPropresSolde / totalActifEstime) * 100 : null;

  // Clients des plus grands emprunteurs en un seul appel — élimination du N+1
  const clientIds = grandEmprunteur.map((g) => g.clientId);
  const clientsMap = new Map(
    (await prisma.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, nom: true, prenom: true, raisonSociale: true, type: true },
    })).map((c) => [c.id, c])
  );

  const grandesExpositions = grandEmprunteur.map((g) => {
    const client = clientsMap.get(g.clientId);
    const montant = Number(g._sum.resteARegler || 0);
    return {
      clientId: g.clientId,
      nomClient: client?.type === 'ENTREPRISE' ? client.raisonSociale : `${client?.prenom || ''} ${client?.nom || ''}`.trim(),
      montantExpose: montant,
      pourcentageEncours: encours > 0 ? (montant / encours) * 100 : 0,
    };
  });

  return {
    dateRapport: new Date(),
    indicateurs: { liquidites, depots, encours, totalActifEstime, fondsPropresSolde },
    ratios: {
      liquidite:    { valeur: ratioLiquidite,    seuilBRH: 20, conforme: ratioLiquidite    !== null ? ratioLiquidite    >= 20 : null },
      solvabilite:  { valeur: ratioSolvabilite,  seuilBRH:  8, conforme: ratioSolvabilite  !== null ? ratioSolvabilite  >=  8 : null },
    },
    grandesExpositions,
    comptesCapitaux: capitauxPropres,
  };
}
