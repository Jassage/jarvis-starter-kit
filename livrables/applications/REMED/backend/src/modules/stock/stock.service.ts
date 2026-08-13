import prisma from '../../config/database';
import { AppError } from '../../types';

interface EntreeStockInput {
  pharmacieId: string;
  produitId: string;
  numeroLot: string;
  dateExpiration: Date;
  quantite: number;
  prixAchatUnitaire: number;
  fournisseurId?: string;
  utilisateurId: string;
}

// Une entrée en stock crée (ou complète, si le même numéro de lot existe déjà pour ce
// produit) un lot, trace le mouvement, et met à jour le dernier prix d'achat connu du produit.
export async function entree(input: EntreeStockInput) {
  const produit = await prisma.produit.findFirst({ where: { id: input.produitId, pharmacieId: input.pharmacieId } });
  if (!produit) throw new AppError(404, 'Produit introuvable');

  return prisma.$transaction(async (tx) => {
    const lot = await tx.lotProduit.upsert({
      where: { produitId_numeroLot: { produitId: input.produitId, numeroLot: input.numeroLot } },
      create: {
        produitId: input.produitId,
        numeroLot: input.numeroLot,
        dateExpiration: input.dateExpiration,
        quantiteInitiale: input.quantite,
        quantiteActuelle: input.quantite,
        prixAchatUnitaire: input.prixAchatUnitaire,
        fournisseurId: input.fournisseurId || null,
      },
      update: {
        quantiteInitiale: { increment: input.quantite },
        quantiteActuelle: { increment: input.quantite },
      },
    });

    const quantiteAvant = lot.quantiteActuelle - input.quantite;

    await tx.mouvementStock.create({
      data: {
        produitId: input.produitId,
        lotId: lot.id,
        type: 'ENTREE_ACHAT',
        quantite: input.quantite,
        quantiteAvant,
        quantiteApres: lot.quantiteActuelle,
        utilisateurId: input.utilisateurId,
      },
    });

    await tx.produit.update({ where: { id: input.produitId }, data: { prixAchat: input.prixAchatUnitaire } });

    return lot;
  });
}

interface AjustementInput {
  pharmacieId: string;
  lotId: string;
  delta: number;
  motif: string;
  utilisateurId: string;
}

// Compare-and-swap : la condition `quantiteActuelle: lot.quantiteActuelle` dans le where
// garantit qu'aucun autre ajustement/vente concurrent n'a modifié le lot entre la lecture
// et l'écriture (même pattern que BANKA/GESCOM pour éviter une survente de stock).
export async function ajuster(input: AjustementInput) {
  return prisma.$transaction(async (tx) => {
    const lot = await tx.lotProduit.findFirst({
      where: { id: input.lotId, produit: { pharmacieId: input.pharmacieId } },
    });
    if (!lot) throw new AppError(404, 'Lot introuvable');

    const nouvelleQuantite = lot.quantiteActuelle + input.delta;
    if (nouvelleQuantite < 0) throw new AppError(400, 'Quantité insuffisante dans ce lot');

    const resultat = await tx.lotProduit.updateMany({
      where: { id: input.lotId, quantiteActuelle: lot.quantiteActuelle },
      data: { quantiteActuelle: nouvelleQuantite },
    });
    if (resultat.count === 0) {
      throw new AppError(409, 'Le lot a été modifié entre-temps, réessayez');
    }

    await tx.mouvementStock.create({
      data: {
        produitId: lot.produitId,
        lotId: lot.id,
        type: input.delta > 0 ? 'AJUSTEMENT_POSITIF' : 'AJUSTEMENT_NEGATIF',
        quantite: Math.abs(input.delta),
        quantiteAvant: lot.quantiteActuelle,
        quantiteApres: nouvelleQuantite,
        motif: input.motif,
        utilisateurId: input.utilisateurId,
      },
    });

    return tx.lotProduit.findUnique({ where: { id: input.lotId } });
  });
}

export async function listLots(pharmacieId: string, produitId: string | undefined) {
  return prisma.lotProduit.findMany({
    where: { produitId, quantiteActuelle: { gt: 0 }, produit: { pharmacieId } },
    include: { produit: { select: { nom: true } } },
    orderBy: { dateExpiration: 'asc' },
  });
}

export async function listMouvements(pharmacieId: string, produitId: string | undefined, limit: number) {
  return prisma.mouvementStock.findMany({
    where: { produitId, produit: { pharmacieId } },
    include: {
      produit: { select: { nom: true } },
      lot: { select: { numeroLot: true } },
      utilisateur: { select: { nom: true, prenom: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function alertesPeremption(pharmacieId: string, joursSeuil: number) {
  const dateLimite = new Date();
  dateLimite.setDate(dateLimite.getDate() + joursSeuil);

  const lots = await prisma.lotProduit.findMany({
    where: { quantiteActuelle: { gt: 0 }, dateExpiration: { lte: dateLimite }, produit: { pharmacieId } },
    include: { produit: { select: { nom: true, dosage: true } } },
    orderBy: { dateExpiration: 'asc' },
  });

  const maintenant = new Date();
  return lots.map((lot) => ({ ...lot, expire: lot.dateExpiration < maintenant }));
}

export async function alertesStockBas(pharmacieId: string) {
  const produits = await prisma.produit.findMany({
    where: { actif: true, pharmacieId },
    include: { lots: { where: { quantiteActuelle: { gt: 0 } }, select: { quantiteActuelle: true } } },
  });

  return produits
    .map((p) => ({
      id: p.id,
      nom: p.nom,
      dosage: p.dosage,
      seuilAlerte: p.seuilAlerte,
      quantiteTotal: p.lots.reduce((s, l) => s + l.quantiteActuelle, 0),
    }))
    .filter((p) => p.quantiteTotal <= p.seuilAlerte);
}
