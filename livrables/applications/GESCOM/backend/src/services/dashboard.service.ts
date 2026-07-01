import prisma from '../utils/prisma';

export async function getDashboardStats() {
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);

  const [produits, stocks, emplacements, mouvementsRecents, ventesJour, commandesEnAttente] = await Promise.all([
    prisma.produit.findMany({ where: { actif: true } }),
    prisma.stockEmplacement.findMany({ include: { produit: true, emplacement: true } }),
    prisma.emplacement.findMany({ where: { actif: true } }),
    prisma.mouvementStock.findMany({
      include: {
        produit: { select: { nom: true, reference: true } },
        emplacement: { select: { nom: true } },
        utilisateur: { select: { nom: true, prenom: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.vente.findMany({ where: { statut: 'VALIDEE', dateVente: { gte: debutJour } } }),
    prisma.commandeFournisseur.count({ where: { statut: { in: ['ENVOYEE', 'RECUE_PARTIELLE'] } } }),
  ]);

  const valeurStockTotal = stocks.reduce((sum, s) => sum + s.quantite * Number(s.produit.prixAchatMoyen), 0);
  const produitsSousAlerte = stocks.filter((s) => s.produit.actif && s.quantite <= s.produit.seuilAlerte).length;

  const repartitionParEmplacement = emplacements.map((e) => {
    const stocksEmp = stocks.filter((s) => s.emplacementId === e.id);
    return {
      id: e.id,
      nom: e.nom,
      type: e.type,
      quantiteTotale: stocksEmp.reduce((sum, s) => sum + s.quantite, 0),
      valeur: stocksEmp.reduce((sum, s) => sum + s.quantite * Number(s.produit.prixAchatMoyen), 0),
    };
  });

  return {
    totalProduits: produits.length,
    valeurStockTotal,
    produitsSousAlerte,
    repartitionParEmplacement,
    mouvementsRecents,
    ventesDuJour: {
      count: ventesJour.length,
      montant: ventesJour.reduce((sum, v) => sum + Number(v.montantTotal), 0),
    },
    commandesEnAttente,
  };
}
