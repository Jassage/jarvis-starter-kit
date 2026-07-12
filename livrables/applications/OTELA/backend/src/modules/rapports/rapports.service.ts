import prisma from '../../config/database';

// Revenu et occupation par établissement, jamais mélangés entre devises HTG/USD
// (une conversion à la volée serait fausse — cf. contrainte du prompt PMS).
async function getOccupationEtRevenu(etablissementId: string, from: Date, to: Date) {
  const nbChambres = await prisma.chambre.count({ where: { etablissementId } });

  const reservations = await prisma.reservation.findMany({
    where: {
      etablissementId,
      statut: { in: ['CONFIRMEE', 'TERMINEE'] },
      dateArrivee: { lt: to },
      dateDepart: { gt: from },
    },
    select: { dateArrivee: true, dateDepart: true, devise: true, montantTotal: true, typeSejour: true },
  });

  let nuitsOccupees = 0;
  // Un séjour JOUR arrondirait toujours à 0 nuit (Math.round d'une poignée
  // d'heures) — compté séparément plutôt que silencieusement absorbé dans
  // nuitsOccupees, le revenu (montantTotal) restant lui correct pour les deux types.
  let sejoursJourCount = 0;
  const revenuParDevise: Record<'HTG' | 'USD', number> = { HTG: 0, USD: 0 };

  for (const r of reservations) {
    if (r.typeSejour === 'JOUR') {
      sejoursJourCount += 1;
    } else {
      const debut = r.dateArrivee < from ? from : r.dateArrivee;
      const fin = r.dateDepart > to ? to : r.dateDepart;
      const nuits = Math.max(0, Math.round((fin.getTime() - debut.getTime()) / 86400000));
      nuitsOccupees += nuits;
    }
    revenuParDevise[r.devise] += Number(r.montantTotal);
  }

  const joursPeriode = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000));
  const nuitsDisponibles = nbChambres * joursPeriode;
  const tauxOccupation = nuitsDisponibles > 0 ? nuitsOccupees / nuitsDisponibles : 0;

  const facturation = await getFacturation(etablissementId, from, to);

  return { nbChambres, nuitsOccupees, sejoursJourCount, nuitsDisponibles, tauxOccupation, revenuParDevise, facturation };
}

// Sur la date de FACTURATION (createdAt), pas la date de séjour — un rapport de
// facturation reflète ce qui a été émis/encaissé sur la période, pas les nuitées.
async function getFacturation(etablissementId: string, from: Date, to: Date) {
  const factures = await prisma.facture.findMany({
    where: {
      reservation: { etablissementId },
      createdAt: { gte: from, lt: to },
    },
    select: { devise: true, montantTotal: true, paiements: { select: { montant: true } } },
  });

  const facturationParDevise: Record<'HTG' | 'USD', { facture: number; paye: number; impaye: number }> = {
    HTG: { facture: 0, paye: 0, impaye: 0 },
    USD: { facture: 0, paye: 0, impaye: 0 },
  };

  for (const f of factures) {
    const total = Number(f.montantTotal);
    const paye = f.paiements.reduce((s, p) => s + Number(p.montant), 0);
    facturationParDevise[f.devise].facture += total;
    facturationParDevise[f.devise].paye += paye;
    facturationParDevise[f.devise].impaye += Math.max(0, total - paye);
  }

  return facturationParDevise;
}

export async function getRapportEtablissement(etablissementId: string, from: Date, to: Date) {
  return getOccupationEtRevenu(etablissementId, from, to);
}

export async function getRapportChaine(from: Date, to: Date) {
  const etablissements = await prisma.etablissement.findMany({ where: { actif: true }, orderBy: { nom: 'asc' } });

  const parEtablissement = await Promise.all(
    etablissements.map(async (etab) => ({
      etablissementId: etab.id,
      nom: etab.nom,
      ...(await getOccupationEtRevenu(etab.id, from, to)),
    }))
  );

  const totalParDevise: Record<'HTG' | 'USD', number> = { HTG: 0, USD: 0 };
  const totalFacturationParDevise: Record<'HTG' | 'USD', { facture: number; paye: number; impaye: number }> = {
    HTG: { facture: 0, paye: 0, impaye: 0 },
    USD: { facture: 0, paye: 0, impaye: 0 },
  };
  for (const e of parEtablissement) {
    totalParDevise.HTG += e.revenuParDevise.HTG;
    totalParDevise.USD += e.revenuParDevise.USD;
    for (const d of ['HTG', 'USD'] as const) {
      totalFacturationParDevise[d].facture += e.facturation[d].facture;
      totalFacturationParDevise[d].paye += e.facturation[d].paye;
      totalFacturationParDevise[d].impaye += e.facturation[d].impaye;
    }
  }

  return { parEtablissement, totalParDevise, totalFacturationParDevise };
}
