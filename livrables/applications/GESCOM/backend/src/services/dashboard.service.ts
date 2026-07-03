import prisma from "../utils/prisma";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getDashboardStats() {
  const maintenant = new Date();
  const debutJour = startOfDay(maintenant);
  const debutHier = new Date(debutJour);
  debutHier.setDate(debutHier.getDate() - 1);
  const debut7Jours = new Date(debutJour);
  debut7Jours.setDate(debut7Jours.getDate() - 6); // fenêtre glissante incluant aujourd'hui

  const [
    produits,
    stocks,
    emplacements,
    mouvementsRecents,
    ventesJour,
    ventesHier,
    ventes7JoursBrut,
    lignesVente7Jours,
    clientsRisqueBrut,
    clientsRisqueCount,
    encoursCredit,
    commandesEnAttenteCount,
    commandesEnRetardCount,
    commandesListeBrut,
  ] = await Promise.all([
    prisma.produit.findMany({ where: { actif: true } }),
    prisma.stockEmplacement.findMany({
      include: { produit: true, emplacement: true },
    }),
    prisma.emplacement.findMany({ where: { actif: true } }),
    prisma.mouvementStock.findMany({
      include: {
        produit: { select: { nom: true, reference: true } },
        emplacement: { select: { nom: true } },
        utilisateur: { select: { nom: true, prenom: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.vente.findMany({
      where: { statut: "VALIDEE", dateVente: { gte: debutJour } },
      select: { montantTotal: true },
    }),
    prisma.vente.findMany({
      where: {
        statut: "VALIDEE",
        dateVente: { gte: debutHier, lt: debutJour },
      },
      select: { montantTotal: true },
    }),
    prisma.vente.findMany({
      where: { statut: "VALIDEE", dateVente: { gte: debut7Jours } },
      select: { dateVente: true, montantTotal: true },
    }),
    prisma.ligneVente.findMany({
      where: { vente: { statut: "VALIDEE", dateVente: { gte: debut7Jours } } },
      select: {
        quantite: true,
        montantLigne: true,
        produit: {
          select: { id: true, nom: true, reference: true, unite: true },
        },
      },
    }),
    prisma.client.findMany({
      where: { actif: true, soldeDu: { gt: 0 } },
      orderBy: { soldeDu: "desc" },
      take: 5,
      select: { id: true, nom: true, type: true, soldeDu: true },
    }),
    prisma.client.count({ where: { actif: true, soldeDu: { gt: 0 } } }),
    prisma.client.aggregate({
      where: { actif: true },
      _sum: { soldeDu: true },
    }),
    prisma.commandeFournisseur.count({
      where: { statut: { in: ["ENVOYEE", "RECUE_PARTIELLE"] } },
    }),
    prisma.commandeFournisseur.count({
      where: {
        statut: { in: ["ENVOYEE", "RECUE_PARTIELLE"] },
        dateLivraisonPrevue: { lt: maintenant },
      },
    }),
    prisma.commandeFournisseur.findMany({
      where: { statut: { in: ["ENVOYEE", "RECUE_PARTIELLE"] } },
      include: { fournisseur: { select: { nom: true } } },
      orderBy: { dateLivraisonPrevue: "asc" },
      take: 5,
    }),
  ]);

  // Stock
  const valeurStockTotal = stocks.reduce(
    (sum, s) => sum + s.quantite * Number(s.produit.prixAchatMoyen),
    0,
  );
  const stocksAlerte = stocks
    .filter((s) => s.produit.actif && s.quantite <= s.produit.seuilAlerte)
    .sort(
      (a, b) =>
        a.quantite -
        a.produit.seuilAlerte -
        (b.quantite - b.produit.seuilAlerte),
    );
  const produitsSousAlerte = stocksAlerte.length;
  const alertesStock = stocksAlerte.slice(0, 5).map((s) => ({
    produitId: s.produit.id,
    reference: s.produit.reference,
    nom: s.produit.nom,
    emplacement: {
      id: s.emplacement.id,
      nom: s.emplacement.nom,
      type: s.emplacement.type,
    },
    quantite: s.quantite,
    seuilAlerte: s.produit.seuilAlerte,
  }));

  const repartitionParEmplacement = emplacements.map((e) => {
    const stocksEmp = stocks.filter((s) => s.emplacementId === e.id);
    return {
      id: e.id,
      nom: e.nom,
      type: e.type,
      quantiteTotale: stocksEmp.reduce((sum, s) => sum + s.quantite, 0),
      valeur: stocksEmp.reduce(
        (sum, s) => sum + s.quantite * Number(s.produit.prixAchatMoyen),
        0,
      ),
    };
  });

  // Ventes / tendance
  const montantJour = ventesJour.reduce(
    (sum, v) => sum + Number(v.montantTotal),
    0,
  );
  const montantHier = ventesHier.reduce(
    (sum, v) => sum + Number(v.montantTotal),
    0,
  );
  const variationPct =
    montantHier > 0
      ? Math.round(((montantJour - montantHier) / montantHier) * 1000) / 10
      : montantJour > 0
        ? 100
        : 0;

  // Ventes 7 jours en buckets quotidiens (jours sans vente = 0, pas d'absence)
  const buckets = new Map<string, { montant: number; count: number }>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(debut7Jours);
    d.setDate(d.getDate() + i);
    buckets.set(isoDate(d), { montant: 0, count: 0 });
  }
  for (const v of ventes7JoursBrut) {
    const key = isoDate(v.dateVente);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.montant += Number(v.montantTotal);
      bucket.count += 1;
    }
  }
  const ventes7Jours = Array.from(buckets.entries()).map(([date, v]) => ({
    date,
    montant: v.montant,
    count: v.count,
  }));

  // Top produits vendus (7 jours)
  const parProduit = new Map<
    string,
    {
      nom: string;
      reference: string;
      unite: string;
      quantiteVendue: number;
      montantVendu: number;
    }
  >();
  for (const l of lignesVente7Jours) {
    const entry = parProduit.get(l.produit.id) ?? {
      nom: l.produit.nom,
      reference: l.produit.reference,
      unite: l.produit.unite,
      quantiteVendue: 0,
      montantVendu: 0,
    };
    entry.quantiteVendue += l.quantite;
    entry.montantVendu += Number(l.montantLigne);
    parProduit.set(l.produit.id, entry);
  }
  const topProduits = Array.from(parProduit.entries())
    .map(([produitId, v]) => ({ produitId, ...v }))
    .sort((a, b) => b.montantVendu - a.montantVendu)
    .slice(0, 5);

  // Clients à risque (solde dû)
  const clientsRisque = clientsRisqueBrut.map((c) => ({
    id: c.id,
    nom: c.nom,
    type: c.type,
    soldeDu: Number(c.soldeDu),
  }));
  const encoursCreditTotal = Number(encoursCredit._sum.soldeDu ?? 0);

  // Commandes fournisseur en attente
  const commandesListe = commandesListeBrut.map((c) => ({
    id: c.id,
    numero: c.numero,
    statut: c.statut,
    fournisseur: { nom: c.fournisseur.nom },
    dateLivraisonPrevue: c.dateLivraisonPrevue,
    enRetard: !!c.dateLivraisonPrevue && c.dateLivraisonPrevue < maintenant,
  }));

  return {
    totalProduits: produits.length,
    valeurStockTotal,
    produitsSousAlerte,
    alertesStock,
    repartitionParEmplacement,
    mouvementsRecents,
    ventesDuJour: { count: ventesJour.length, montant: montantJour },
    tendanceVentes: { montantHier, variationPct },
    ventes7Jours,
    topProduits,
    clientsRisque,
    clientsRisqueCount,
    encoursCreditTotal,
    commandesEnAttente: commandesEnAttenteCount,
    commandesEnRetard: commandesEnRetardCount,
    commandesListe,
  };
}
