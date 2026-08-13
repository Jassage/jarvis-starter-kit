import prisma from '../../config/database';
import { PeriodePreset, resoudrePeriode, serieJournaliere } from '../../utils/periode';

export async function getStats(pharmacieId: string) {
  const produits = await prisma.produit.findMany({
    where: { actif: true, pharmacieId },
    include: { lots: { where: { quantiteActuelle: { gt: 0 } }, select: { quantiteActuelle: true, prixAchatUnitaire: true, dateExpiration: true } } },
  });

  const dans30Jours = new Date();
  dans30Jours.setDate(dans30Jours.getDate() + 30);

  let valeurStock = 0;
  let produitsEnAlerte = 0;
  let lotsPerimesBientot = 0;

  for (const p of produits) {
    const quantiteTotal = p.lots.reduce((s, l) => s + l.quantiteActuelle, 0);
    valeurStock += p.lots.reduce((s, l) => s + l.quantiteActuelle * Number(l.prixAchatUnitaire), 0);
    if (quantiteTotal <= p.seuilAlerte) produitsEnAlerte += 1;
    lotsPerimesBientot += p.lots.filter((l) => l.dateExpiration <= dans30Jours).length;
  }

  const totalProduits = produits.length;
  const totalFournisseurs = await prisma.fournisseur.count({ where: { actif: true, pharmacieId } });

  const debutAujourdhui = new Date();
  debutAujourdhui.setHours(0, 0, 0, 0);
  const ventesAujourdhui = await prisma.vente.count({
    where: { pharmacieId, statut: 'COMPLETEE', createdAt: { gte: debutAujourdhui } },
  });

  return {
    totalProduits,
    valeurStock,
    produitsEnAlerte,
    lotsPerimesBientot,
    totalFournisseurs,
    ventesAujourdhui,
  };
}

// Phase 6 — tableau de bord enrichi : CA, bénéfice estimé, dépenses, ruptures, top produits et
// répartition des dépenses sur une période choisie, plus une série journalière pour le graphique
// d'évolution du CA.
export async function getStatsPeriode(pharmacieId: string, preset: PeriodePreset, debutStr?: string, finStr?: string) {
  const { debut, fin } = resoudrePeriode(preset, debutStr ? new Date(debutStr) : undefined, finStr ? new Date(finStr) : undefined);

  const ventes = await prisma.vente.findMany({
    where: { pharmacieId, statut: 'COMPLETEE', createdAt: { gte: debut, lte: fin } },
    include: {
      lignes: { include: { lot: { select: { prixAchatUnitaire: true } }, produit: { select: { nom: true, dosage: true } } } },
      paiements: true,
    },
  });

  let ca = 0;
  let coutMarchandise = 0;
  let creditTotal = 0;
  const quantitesParProduit = new Map<string, { nom: string; quantite: number }>();

  for (const v of ventes) {
    ca += Number(v.montantTotal);
    for (const ligne of v.lignes) {
      coutMarchandise += ligne.quantite * Number(ligne.lot.prixAchatUnitaire);
      const cle = `${ligne.produit.nom}${ligne.produit.dosage ? ` ${ligne.produit.dosage}` : ''}`;
      const existant = quantitesParProduit.get(cle);
      quantitesParProduit.set(cle, { nom: cle, quantite: (existant?.quantite || 0) + ligne.quantite });
    }
    for (const p of v.paiements) {
      if (p.mode === 'CREDIT') creditTotal += Number(p.montant);
    }
  }
  // Bénéfice estimé : CA de la période moins le coût d'achat de la marchandise vendue. Ne tient
  // pas compte de la remise par ligne (la remise est globale sur la vente) — approximation
  // assumée, suffisante pour une lecture de tendance, pas un chiffre comptable exact.
  const beneficeEstime = ca - coutMarchandise;

  const depenses = await prisma.depense.findMany({ where: { pharmacieId, createdAt: { gte: debut, lte: fin } } });
  const depensesTotal = depenses.reduce((s, d) => s + Number(d.montant), 0);
  const depensesParCategorieMap = new Map<string, number>();
  for (const d of depenses) depensesParCategorieMap.set(d.categorie, (depensesParCategorieMap.get(d.categorie) || 0) + Number(d.montant));

  const ruptures = await prisma.produit.count({
    where: { pharmacieId, actif: true, lots: { none: { quantiteActuelle: { gt: 0 } } } },
  });

  const serieCA = serieJournaliere(ventes, (v) => v.createdAt, (v) => Number(v.montantTotal), debut, fin);

  const topProduits = [...quantitesParProduit.values()]
    .sort((a, b) => b.quantite - a.quantite)
    .slice(0, 5);

  return {
    periode: { debut: debut.toISOString(), fin: fin.toISOString() },
    ca,
    nombreVentes: ventes.length,
    beneficeEstime,
    depensesTotal,
    creditTotal,
    ruptures,
    serieCA,
    topProduits,
    depensesParCategorie: [...depensesParCategorieMap.entries()].map(([categorie, montant]) => ({ categorie, montant })),
  };
}
