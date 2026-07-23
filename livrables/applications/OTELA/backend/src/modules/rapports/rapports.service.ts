import prisma from '../../config/database';
import { differenceEnNuits } from '../reservations/reservations.utils';

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
    select: {
      dateArrivee: true,
      dateDepart: true,
      devise: true,
      montantTotal: true,
      typeSejour: true,
      chambre: { select: { typeChambreId: true, typeChambre: { select: { nom: true } } } },
    },
  });

  let nuitsOccupees = 0;
  // Un séjour JOUR arrondirait toujours à 0 nuit (Math.round d'une poignée
  // d'heures) — compté séparément plutôt que silencieusement absorbé dans
  // nuitsOccupees, le revenu (montantTotal) restant lui correct pour les deux types.
  let sejoursJourCount = 0;
  const revenuParDevise: Record<'HTG' | 'USD', number> = { HTG: 0, USD: 0 };

  // Répartition par type de chambre — même exclusion JOUR pour les nuits, revenu
  // toujours compté (cohérent avec revenuParDevise ci-dessus).
  const parType = new Map<string, { typeChambreId: string; nom: string; nuitsOccupees: number; revenuHTG: number; revenuUSD: number }>();

  for (const r of reservations) {
    const typeId = r.chambre.typeChambreId;
    if (!parType.has(typeId)) {
      parType.set(typeId, { typeChambreId: typeId, nom: r.chambre.typeChambre.nom, nuitsOccupees: 0, revenuHTG: 0, revenuUSD: 0 });
    }
    const entreeType = parType.get(typeId)!;

    if (r.typeSejour === 'JOUR') {
      sejoursJourCount += 1;
    } else {
      const debut = r.dateArrivee < from ? from : r.dateArrivee;
      const fin = r.dateDepart > to ? to : r.dateDepart;
      const nuits = Math.max(0, Math.round((fin.getTime() - debut.getTime()) / 86400000));
      nuitsOccupees += nuits;
      entreeType.nuitsOccupees += nuits;
    }
    revenuParDevise[r.devise] += Number(r.montantTotal);
    if (r.devise === 'HTG') entreeType.revenuHTG += Number(r.montantTotal);
    else entreeType.revenuUSD += Number(r.montantTotal);
  }

  const joursPeriode = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000));
  const nuitsDisponibles = nbChambres * joursPeriode;
  const tauxOccupation = nuitsDisponibles > 0 ? nuitsOccupees / nuitsDisponibles : 0;

  // ADR (revenu / nuit réellement occupée) et RevPAR (revenu / nuit disponible,
  // occupée ou non) — définitions hôtelières standard, jamais mélangées entre devises.
  const adrParDevise: Record<'HTG' | 'USD', number> = {
    HTG: nuitsOccupees > 0 ? revenuParDevise.HTG / nuitsOccupees : 0,
    USD: nuitsOccupees > 0 ? revenuParDevise.USD / nuitsOccupees : 0,
  };
  const revparParDevise: Record<'HTG' | 'USD', number> = {
    HTG: nuitsDisponibles > 0 ? revenuParDevise.HTG / nuitsDisponibles : 0,
    USD: nuitsDisponibles > 0 ? revenuParDevise.USD / nuitsDisponibles : 0,
  };

  const repartitionParType = [...parType.values()].sort((a, b) => b.revenuHTG - a.revenuHTG);

  const facturation = await getFacturation(etablissementId, from, to);

  return {
    nbChambres, nuitsOccupees, sejoursJourCount, nuitsDisponibles, tauxOccupation,
    revenuParDevise, adrParDevise, revparParDevise, repartitionParType, facturation,
  };
}

// Un point par jour calendaire — pour la courbe d'occupation et le revenu quotidien
// du dashboard. Le revenu est réparti au prorata des nuits de chaque réservation
// (montantTotal / nombre de nuits) plutôt qu'attribué en bloc à la date d'arrivée :
// une réservation de 5 nuits doit apparaître comme 5 jours de revenu, pas un pic
// artificiel le jour de l'arrivée — sinon la courbe de revenu ne corrélerait plus
// avec celle de l'occupation. Séjours JOUR exclus (même convention que nuitsOccupees
// ci-dessus — un jour de day-use n'est pas une "nuit").
export async function getSerieJournaliere(etablissementId: string, from: Date, to: Date) {
  const nbChambres = await prisma.chambre.count({ where: { etablissementId } });

  const reservations = await prisma.reservation.findMany({
    where: {
      etablissementId,
      statut: { in: ['CONFIRMEE', 'TERMINEE'] },
      typeSejour: 'NUITEE',
      dateArrivee: { lt: to },
      dateDepart: { gt: from },
    },
    select: { dateArrivee: true, dateDepart: true, devise: true, montantTotal: true },
  });

  const parJour = new Map<string, { nuitsOccupees: number; revenuHTG: number; revenuUSD: number }>();
  const debutJour = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

  for (let jour = debutJour(from); jour < to; jour = new Date(jour.getTime() + 86400000)) {
    parJour.set(jour.toISOString().slice(0, 10), { nuitsOccupees: 0, revenuHTG: 0, revenuUSD: 0 });
  }

  for (const r of reservations) {
    const nuits = differenceEnNuits(r.dateArrivee, r.dateDepart);
    if (nuits <= 0) continue;
    const revenuParNuit = Number(r.montantTotal) / nuits;

    // Borne exclusive = le jour calendaire du départ (jamais l'horodatage brut) : un
    // check-out à 12:00 ne doit jamais compter la nuit de ce jour-là comme occupée,
    // quelle que soit l'heure exacte du départ. Sans ce arrondi, une réservation
    // ajoutait systématiquement une nuit fantôme le jour du check-out (trouvé en
    // vérifiant que la somme de la série correspondait bien à l'agrégat existant).
    const finNuits = debutJour(r.dateDepart);
    for (let nuit = debutJour(r.dateArrivee); nuit < finNuits; nuit = new Date(nuit.getTime() + 86400000)) {
      if (nuit < from || nuit >= to) continue;
      const cle = nuit.toISOString().slice(0, 10);
      const entree = parJour.get(cle);
      if (!entree) continue;
      entree.nuitsOccupees += 1;
      if (r.devise === 'HTG') entree.revenuHTG += revenuParNuit;
      else entree.revenuUSD += revenuParNuit;
    }
  }

  const serie = [...parJour.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));

  return { nbChambres, serie };
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
