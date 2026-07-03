import prisma from "../utils/prisma";

function isoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function defaultPeriode(from?: Date, to?: Date): { from: Date; to: Date } {
  const toDate = to ?? new Date();
  const fromDate =
    from ?? new Date(toDate.getTime() - 29 * 24 * 60 * 60 * 1000);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);
  return { from: fromDate, to: toDate };
}

export async function getRapportVentes(params: {
  from?: Date;
  to?: Date;
  emplacementId?: string;
}) {
  const { from, to } = defaultPeriode(params.from, params.to);
  const whereVente: any = {
    statut: "VALIDEE",
    dateVente: { gte: from, lte: to },
  };
  if (params.emplacementId) whereVente.emplacementId = params.emplacementId;

  const [ventes, lignes, parModePaiement] = await Promise.all([
    prisma.vente.findMany({
      where: whereVente,
      select: {
        montantTotal: true,
        dateVente: true,
        clientId: true,
        client: { select: { id: true, nom: true, type: true } },
      },
    }),
    prisma.ligneVente.findMany({
      where: { vente: whereVente },
      select: {
        quantite: true,
        montantLigne: true,
        prixUnitaire: true,
        produit: {
          select: {
            id: true,
            nom: true,
            reference: true,
            unite: true,
            prixAchatMoyen: true,
          },
        },
      },
    }),
    prisma.vente.groupBy({
      by: ["modePaiement"],
      where: whereVente,
      _sum: { montantTotal: true },
      _count: true,
    }),
  ]);

  const caTotal = ventes.reduce((sum, v) => sum + Number(v.montantTotal), 0);
  const nombreVentes = ventes.length;
  const panierMoyen = nombreVentes > 0 ? caTotal / nombreVentes : 0;

  // Évolution quotidienne (jours sans vente = 0, pas d'absence)
  const buckets = new Map<string, { montant: number; count: number }>();
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    buckets.set(isoDate(d), { montant: 0, count: 0 });
  }
  for (const v of ventes) {
    const bucket = buckets.get(isoDate(v.dateVente));
    if (bucket) {
      bucket.montant += Number(v.montantTotal);
      bucket.count += 1;
    }
  }
  const evolution = Array.from(buckets.entries()).map(([date, v]) => ({
    date,
    montant: v.montant,
    count: v.count,
  }));

  // Top produits + marge estimée sur le prix d'achat moyen courant (pas d'historique de coût stocké)
  const parProduit = new Map<
    string,
    {
      nom: string;
      reference: string;
      unite: string;
      quantiteVendue: number;
      montantVendu: number;
      margeEstimee: number;
    }
  >();
  for (const l of lignes) {
    const entry = parProduit.get(l.produit.id) ?? {
      nom: l.produit.nom,
      reference: l.produit.reference,
      unite: l.produit.unite,
      quantiteVendue: 0,
      montantVendu: 0,
      margeEstimee: 0,
    };
    entry.quantiteVendue += l.quantite;
    entry.montantVendu += Number(l.montantLigne);
    entry.margeEstimee +=
      l.quantite * (Number(l.prixUnitaire) - Number(l.produit.prixAchatMoyen));
    parProduit.set(l.produit.id, entry);
  }
  const topProduits = Array.from(parProduit.entries())
    .map(([produitId, v]) => ({ produitId, ...v }))
    .sort((a, b) => b.montantVendu - a.montantVendu)
    .slice(0, 10);
  const margeTotaleEstimee = Array.from(parProduit.values()).reduce(
    (sum, v) => sum + v.margeEstimee,
    0,
  );

  // Top clients
  const parClient = new Map<
    string,
    { nom: string; type: string; montantAchete: number; nombreAchats: number }
  >();
  for (const v of ventes) {
    if (!v.client) continue;
    const entry = parClient.get(v.client.id) ?? {
      nom: v.client.nom,
      type: v.client.type,
      montantAchete: 0,
      nombreAchats: 0,
    };
    entry.montantAchete += Number(v.montantTotal);
    entry.nombreAchats += 1;
    parClient.set(v.client.id, entry);
  }
  const topClients = Array.from(parClient.entries())
    .map(([clientId, v]) => ({ clientId, ...v }))
    .sort((a, b) => b.montantAchete - a.montantAchete)
    .slice(0, 10);

  const ventilationModePaiement = parModePaiement.map((g) => ({
    modePaiement: g.modePaiement,
    montant: Number(g._sum.montantTotal ?? 0),
    count: g._count,
  }));

  return {
    periode: { from: isoDate(from), to: isoDate(to) },
    caTotal,
    nombreVentes,
    panierMoyen,
    margeTotaleEstimee,
    evolution,
    topProduits,
    topClients,
    ventilationModePaiement,
  };
}

export async function getRapportStock() {
  const [stocks, mouvements90j] = await Promise.all([
    prisma.stockEmplacement.findMany({
      include: { produit: true, emplacement: true },
    }),
    prisma.mouvementStock.findMany({
      where: {
        type: { in: ["VENTE", "SORTIE"] },
        createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      select: { produitId: true, quantite: true },
    }),
  ]);

  const stocksActifs = stocks.filter((s) => s.produit.actif);
  const valeurStockTotal = stocksActifs.reduce(
    (sum, s) => sum + s.quantite * Number(s.produit.prixAchatMoyen),
    0,
  );

  const parEmplacement = new Map<
    string,
    { nom: string; type: string; quantite: number; valeur: number }
  >();
  for (const s of stocksActifs) {
    const entry = parEmplacement.get(s.emplacementId) ?? {
      nom: s.emplacement.nom,
      type: s.emplacement.type,
      quantite: 0,
      valeur: 0,
    };
    entry.quantite += s.quantite;
    entry.valeur += s.quantite * Number(s.produit.prixAchatMoyen);
    parEmplacement.set(s.emplacementId, entry);
  }
  const valorisationParEmplacement = Array.from(parEmplacement.entries()).map(
    ([id, v]) => ({ id, ...v }),
  );

  const parCategorie = new Map<string, { quantite: number; valeur: number }>();
  for (const s of stocksActifs) {
    const cat = s.produit.categorie ?? "Sans catégorie";
    const entry = parCategorie.get(cat) ?? { quantite: 0, valeur: 0 };
    entry.quantite += s.quantite;
    entry.valeur += s.quantite * Number(s.produit.prixAchatMoyen);
    parCategorie.set(cat, entry);
  }
  const valorisationParCategorie = Array.from(parCategorie.entries()).map(
    ([categorie, v]) => ({ categorie, ...v }),
  );

  // Rotation sur 90 jours : quantité sortie (vente + sortie manuelle) par produit
  const sortiesParProduit = new Map<string, number>();
  for (const m of mouvements90j) {
    sortiesParProduit.set(
      m.produitId,
      (sortiesParProduit.get(m.produitId) ?? 0) + Math.abs(m.quantite),
    );
  }

  const produitVu = new Map<
    string,
    { nom: string; reference: string; quantiteStock: number }
  >();
  for (const s of stocksActifs) {
    const entry = produitVu.get(s.produitId) ?? {
      nom: s.produit.nom,
      reference: s.produit.reference,
      quantiteStock: 0,
    };
    entry.quantiteStock += s.quantite;
    produitVu.set(s.produitId, entry);
  }

  const rotation = Array.from(produitVu.entries()).map(([produitId, v]) => ({
    produitId,
    ...v,
    quantiteSortie90j: sortiesParProduit.get(produitId) ?? 0,
  }));

  const meilleureRotation = rotation
    .filter((r) => r.quantiteSortie90j > 0)
    .sort((a, b) => b.quantiteSortie90j - a.quantiteSortie90j)
    .slice(0, 10);
  const produitsDormants = rotation
    .filter((r) => r.quantiteStock > 0 && r.quantiteSortie90j === 0)
    .sort((a, b) => b.quantiteStock - a.quantiteStock)
    .slice(0, 10);

  const alertesStock = stocksActifs
    .filter((s) => s.quantite <= s.produit.seuilAlerte)
    .map((s) => ({
      produitId: s.produit.id,
      nom: s.produit.nom,
      reference: s.produit.reference,
      emplacement: s.emplacement.nom,
      quantite: s.quantite,
      seuilAlerte: s.produit.seuilAlerte,
    }));

  return {
    valeurStockTotal,
    valorisationParEmplacement,
    valorisationParCategorie,
    meilleureRotation,
    produitsDormants,
    alertesStock,
  };
}

export async function getRapportAchats(params: { from?: Date; to?: Date }) {
  const { from, to } = defaultPeriode(params.from, params.to);
  const maintenant = new Date();

  const commandes = await prisma.commandeFournisseur.findMany({
    where: { dateCommande: { gte: from, lte: to } },
    include: { fournisseur: { select: { id: true, nom: true } }, lignes: true },
  });

  let montantCommande = 0;
  let montantRecu = 0;
  const parFournisseur = new Map<
    string,
    {
      nom: string;
      montantCommande: number;
      montantRecu: number;
      nombreCommandes: number;
    }
  >();

  for (const c of commandes) {
    const totalCommande = c.lignes.reduce(
      (sum, l) => sum + l.quantiteCommandee * Number(l.prixUnitaireAchat),
      0,
    );
    const totalRecu = c.lignes.reduce(
      (sum, l) => sum + l.quantiteRecue * Number(l.prixUnitaireAchat),
      0,
    );
    montantCommande += totalCommande;
    montantRecu += totalRecu;

    const entry = parFournisseur.get(c.fournisseurId) ?? {
      nom: c.fournisseur.nom,
      montantCommande: 0,
      montantRecu: 0,
      nombreCommandes: 0,
    };
    entry.montantCommande += totalCommande;
    entry.montantRecu += totalRecu;
    entry.nombreCommandes += 1;
    parFournisseur.set(c.fournisseurId, entry);
  }

  const topFournisseurs = Array.from(parFournisseur.entries())
    .map(([fournisseurId, v]) => ({ fournisseurId, ...v }))
    .sort((a, b) => b.montantCommande - a.montantCommande)
    .slice(0, 10);

  const commandesEnRetard = commandes
    .filter(
      (c) =>
        ["ENVOYEE", "RECUE_PARTIELLE"].includes(c.statut) &&
        c.dateLivraisonPrevue &&
        c.dateLivraisonPrevue < maintenant,
    )
    .map((c) => ({
      id: c.id,
      numero: c.numero,
      fournisseur: c.fournisseur.nom,
      dateLivraisonPrevue: c.dateLivraisonPrevue,
      statut: c.statut,
    }));

  const ventilationStatut = commandes.reduce<Record<string, number>>(
    (acc, c) => {
      acc[c.statut] = (acc[c.statut] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return {
    periode: { from: isoDate(from), to: isoDate(to) },
    montantCommande,
    montantRecu,
    tauxReception:
      montantCommande > 0
        ? Math.round((montantRecu / montantCommande) * 1000) / 10
        : 0,
    nombreCommandes: commandes.length,
    topFournisseurs,
    commandesEnRetard,
    ventilationStatut,
  };
}

export async function getRapportClients() {
  const [clients, ventes] = await Promise.all([
    prisma.client.findMany({ where: { actif: true } }),
    prisma.vente.findMany({
      where: { statut: "VALIDEE", clientId: { not: null } },
      select: { clientId: true, montantTotal: true },
    }),
  ]);

  const encoursCreditTotal = clients.reduce(
    (sum, c) => sum + Number(c.soldeDu),
    0,
  );

  const parType = new Map<string, { count: number; soldeDu: number }>();
  for (const c of clients) {
    const entry = parType.get(c.type) ?? { count: 0, soldeDu: 0 };
    entry.count += 1;
    entry.soldeDu += Number(c.soldeDu);
    parType.set(c.type, entry);
  }
  const ventilationParType = Array.from(parType.entries()).map(([type, v]) => ({
    type,
    ...v,
  }));

  const topClientsSoldeDu = clients
    .filter((c) => Number(c.soldeDu) > 0)
    .sort((a, b) => Number(b.soldeDu) - Number(a.soldeDu))
    .slice(0, 10)
    .map((c) => ({
      id: c.id,
      nom: c.nom,
      type: c.type,
      soldeDu: Number(c.soldeDu),
    }));

  const achatsParClient = new Map<string, number>();
  for (const v of ventes) {
    if (!v.clientId) continue;
    achatsParClient.set(
      v.clientId,
      (achatsParClient.get(v.clientId) ?? 0) + Number(v.montantTotal),
    );
  }
  const topClientsAcheteurs = clients
    .map((c) => ({
      id: c.id,
      nom: c.nom,
      type: c.type,
      montantAchete: achatsParClient.get(c.id) ?? 0,
    }))
    .filter((c) => c.montantAchete > 0)
    .sort((a, b) => b.montantAchete - a.montantAchete)
    .slice(0, 10);

  return {
    nombreClients: clients.length,
    encoursCreditTotal,
    ventilationParType,
    topClientsSoldeDu,
    topClientsAcheteurs,
  };
}
