import prisma from '../../config/database';
import { PeriodePreset, resoudrePeriode, serieJournaliere } from '../../utils/periode';

// ─────────────────────────────────────────────────────────────
// Rapport Ventes
// ─────────────────────────────────────────────────────────────

export async function rapportVentes(pharmacieId: string, preset: PeriodePreset, debutStr?: string, finStr?: string) {
  const { debut, fin } = resoudrePeriode(preset, debutStr ? new Date(debutStr) : undefined, finStr ? new Date(finStr) : undefined);

  const ventes = await prisma.vente.findMany({
    where: { pharmacieId, statut: 'COMPLETEE', createdAt: { gte: debut, lte: fin } },
    include: {
      caissier: { select: { nom: true, prenom: true } },
      lignes: { include: { produit: { select: { nom: true, dosage: true, categorie: { select: { nom: true } } } } } },
    },
  });

  const parJour = serieJournaliere(ventes, (v) => v.createdAt, (v) => Number(v.montantTotal), debut, fin);

  const parCaissierMap = new Map<string, { nom: string; ca: number; nombreVentes: number }>();
  const parProduitMap = new Map<string, { nom: string; quantite: number; ca: number }>();
  const parCategorieMap = new Map<string, number>();

  let totalCA = 0;
  for (const v of ventes) {
    totalCA += Number(v.montantTotal);
    const cleCaissier = `${v.caissier.prenom} ${v.caissier.nom}`;
    const c = parCaissierMap.get(cleCaissier) || { nom: cleCaissier, ca: 0, nombreVentes: 0 };
    c.ca += Number(v.montantTotal);
    c.nombreVentes += 1;
    parCaissierMap.set(cleCaissier, c);

    for (const ligne of v.lignes) {
      const cleProduit = `${ligne.produit.nom}${ligne.produit.dosage ? ` ${ligne.produit.dosage}` : ''}`;
      const p = parProduitMap.get(cleProduit) || { nom: cleProduit, quantite: 0, ca: 0 };
      p.quantite += ligne.quantite;
      p.ca += ligne.quantite * Number(ligne.prixUnitaire);
      parProduitMap.set(cleProduit, p);

      const categorie = ligne.produit.categorie?.nom || 'Sans catégorie';
      parCategorieMap.set(categorie, (parCategorieMap.get(categorie) || 0) + ligne.quantite * Number(ligne.prixUnitaire));
    }
  }

  return {
    periode: { debut: debut.toISOString(), fin: fin.toISOString() },
    totalCA,
    totalVentes: ventes.length,
    parJour,
    parCaissier: [...parCaissierMap.values()].sort((a, b) => b.ca - a.ca),
    parProduit: [...parProduitMap.values()].sort((a, b) => b.quantite - a.quantite),
    parCategorie: [...parCategorieMap.entries()].map(([categorie, ca]) => ({ categorie, ca })).sort((a, b) => b.ca - a.ca),
    ventes: ventes.map((v) => ({
      numero: v.numero,
      date: v.createdAt,
      caissier: `${v.caissier.prenom} ${v.caissier.nom}`,
      montantTotal: Number(v.montantTotal),
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// Rapport Stock
// ─────────────────────────────────────────────────────────────

export async function rapportStock(pharmacieId: string) {
  const produits = await prisma.produit.findMany({
    where: { pharmacieId, actif: true },
    include: { lots: { where: { quantiteActuelle: { gt: 0 } } } },
    orderBy: { nom: 'asc' },
  });

  const lignes = produits.map((p) => {
    const quantiteTotal = p.lots.reduce((s, l) => s + l.quantiteActuelle, 0);
    const valeur = p.lots.reduce((s, l) => s + l.quantiteActuelle * Number(l.prixAchatUnitaire), 0);
    return {
      nom: `${p.nom}${p.dosage ? ` ${p.dosage}` : ''}`,
      quantiteTotal,
      seuilAlerte: p.seuilAlerte,
      valeur,
      statut: quantiteTotal === 0 ? 'RUPTURE' : quantiteTotal <= p.seuilAlerte ? 'BAS' : 'OK',
    };
  });

  const dans90Jours = new Date();
  dans90Jours.setDate(dans90Jours.getDate() + 90);
  const lotsPeremption = await prisma.lotProduit.findMany({
    where: { quantiteActuelle: { gt: 0 }, dateExpiration: { lte: dans90Jours }, produit: { pharmacieId } },
    include: { produit: { select: { nom: true, dosage: true } } },
    orderBy: { dateExpiration: 'asc' },
  });

  const mouvements = await prisma.mouvementStock.findMany({
    where: { produit: { pharmacieId } },
    include: { produit: { select: { nom: true } }, lot: { select: { numeroLot: true } }, utilisateur: { select: { nom: true, prenom: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return {
    valeurTotale: lignes.reduce((s, l) => s + l.valeur, 0),
    ruptures: lignes.filter((l) => l.statut === 'RUPTURE').length,
    stockBas: lignes.filter((l) => l.statut === 'BAS').length,
    lignes,
    lotsPeremption: lotsPeremption.map((l) => ({
      produit: `${l.produit.nom}${l.produit.dosage ? ` ${l.produit.dosage}` : ''}`,
      numeroLot: l.numeroLot,
      dateExpiration: l.dateExpiration,
      quantite: l.quantiteActuelle,
    })),
    mouvementsRecents: mouvements.map((m) => ({
      date: m.createdAt,
      produit: m.produit.nom,
      lot: m.lot?.numeroLot || '—',
      type: m.type,
      quantite: m.quantite,
      utilisateur: `${m.utilisateur.prenom} ${m.utilisateur.nom}`,
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// Rapport Achats
// ─────────────────────────────────────────────────────────────

export async function rapportAchats(pharmacieId: string, preset: PeriodePreset, debutStr?: string, finStr?: string) {
  const { debut, fin } = resoudrePeriode(preset, debutStr ? new Date(debutStr) : undefined, finStr ? new Date(finStr) : undefined);

  const commandes = await prisma.commandeAchat.findMany({
    where: { pharmacieId, createdAt: { gte: debut, lte: fin } },
    include: { fournisseur: { select: { nom: true } }, lignes: true },
    orderBy: { createdAt: 'desc' },
  });

  const parFournisseurMap = new Map<string, { nom: string; montantCommande: number; montantRecu: number; nombreCommandes: number }>();
  let montantTotalCommande = 0;
  let montantTotalRecu = 0;

  for (const c of commandes) {
    const montantCommande = c.lignes.reduce((s, l) => s + l.quantiteCommandee * Number(l.prixUnitaire), 0);
    const montantRecu = c.lignes.reduce((s, l) => s + l.quantiteRecue * Number(l.prixUnitaire), 0);
    montantTotalCommande += montantCommande;
    montantTotalRecu += montantRecu;

    const f = parFournisseurMap.get(c.fournisseur.nom) || { nom: c.fournisseur.nom, montantCommande: 0, montantRecu: 0, nombreCommandes: 0 };
    f.montantCommande += montantCommande;
    f.montantRecu += montantRecu;
    f.nombreCommandes += 1;
    parFournisseurMap.set(c.fournisseur.nom, f);
  }

  return {
    periode: { debut: debut.toISOString(), fin: fin.toISOString() },
    montantTotalCommande,
    montantTotalRecu,
    nombreCommandes: commandes.length,
    parFournisseur: [...parFournisseurMap.values()].sort((a, b) => b.montantCommande - a.montantCommande),
    commandes: commandes.map((c) => ({
      numero: c.numero,
      fournisseur: c.fournisseur.nom,
      statut: c.statut,
      date: c.createdAt,
      montant: c.lignes.reduce((s, l) => s + l.quantiteCommandee * Number(l.prixUnitaire), 0),
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// Rapport Finance
// ─────────────────────────────────────────────────────────────

export async function rapportFinance(pharmacieId: string, preset: PeriodePreset, debutStr?: string, finStr?: string) {
  const { debut, fin } = resoudrePeriode(preset, debutStr ? new Date(debutStr) : undefined, finStr ? new Date(finStr) : undefined);

  const ventes = await prisma.vente.findMany({
    where: { pharmacieId, statut: 'COMPLETEE', createdAt: { gte: debut, lte: fin } },
    include: { lignes: { include: { lot: { select: { prixAchatUnitaire: true } } } } },
  });
  const depenses = await prisma.depense.findMany({ where: { pharmacieId, createdAt: { gte: debut, lte: fin } } });
  const caisseSessions = await prisma.caisseSession.findMany({
    where: { pharmacieId, ouverteLe: { gte: debut, lte: fin } },
    include: { ouvertePar: { select: { nom: true, prenom: true } }, fermeePar: { select: { nom: true, prenom: true } } },
    orderBy: { ouverteLe: 'desc' },
  });

  const ca = ventes.reduce((s, v) => s + Number(v.montantTotal), 0);
  const coutMarchandise = ventes.reduce((s, v) => s + v.lignes.reduce((s2, l) => s2 + l.quantite * Number(l.lot.prixAchatUnitaire), 0), 0);
  const depensesTotal = depenses.reduce((s, d) => s + Number(d.montant), 0);

  return {
    periode: { debut: debut.toISOString(), fin: fin.toISOString() },
    ca,
    depensesTotal,
    beneficeEstime: ca - coutMarchandise - depensesTotal,
    caisseSessions: caisseSessions.map((s) => ({
      ouverteLe: s.ouverteLe,
      fermeeLe: s.fermeeLe,
      statut: s.statut,
      montantOuverture: Number(s.montantOuverture),
      montantFermeture: s.montantFermeture ? Number(s.montantFermeture) : null,
      soldeTheorique: s.soldeTheorique ? Number(s.soldeTheorique) : null,
      ecart: s.ecart ? Number(s.ecart) : null,
      ouvertePar: `${s.ouvertePar.prenom} ${s.ouvertePar.nom}`,
    })),
  };
}
