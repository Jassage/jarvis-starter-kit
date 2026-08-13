import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface ListParams {
  recherche?: string;
  categorieId?: string;
  alerteStock?: boolean;
  tous?: boolean;
}

// La quantité en stock d'un produit n'est jamais stockée : elle est toujours recalculée
// comme la somme des lots actifs (quantiteActuelle > 0), pour ne jamais pouvoir diverger
// du détail par lot (péremption, traçabilité).
function withQuantiteTotal<T extends { lots: { quantiteActuelle: number }[] }>(produit: T) {
  const quantiteTotal = produit.lots.reduce((somme, lot) => somme + lot.quantiteActuelle, 0);
  return { ...produit, quantiteTotal };
}

export async function list(pharmacieId: string, params: ListParams) {
  const where: Prisma.ProduitWhereInput = {
    pharmacieId,
    actif: params.tous ? undefined : true,
    categorieId: params.categorieId || undefined,
    ...(params.recherche
      ? {
          OR: [
            { nom: { contains: params.recherche, mode: 'insensitive' } },
            { dci: { contains: params.recherche, mode: 'insensitive' } },
            { codeBarres: { contains: params.recherche, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const produits = await prisma.produit.findMany({
    where,
    include: {
      categorie: true,
      lots: { where: { quantiteActuelle: { gt: 0 } }, select: { quantiteActuelle: true, dateExpiration: true } },
    },
    orderBy: { nom: 'asc' },
  });

  const avecQuantite = produits.map(withQuantiteTotal);

  if (params.alerteStock) {
    return avecQuantite.filter((p) => p.quantiteTotal <= p.seuilAlerte);
  }
  return avecQuantite;
}

export async function getById(pharmacieId: string, id: string) {
  const produit = await prisma.produit.findFirst({
    where: { id, pharmacieId },
    include: {
      categorie: true,
      lots: { orderBy: { dateExpiration: 'asc' } },
    },
  });
  if (!produit) throw new AppError(404, 'Produit introuvable');
  return withQuantiteTotal(produit);
}

interface CreateProduitInput {
  nom: string;
  dci?: string;
  dosage?: string;
  formePharmaceutique: string;
  codeBarres?: string;
  categorieId?: string;
  prixAchat: number;
  prixVente: number;
  seuilAlerte: number;
  necessiteOrdonnance: boolean;
  substanceControlee: boolean;
}

export async function create(pharmacieId: string, data: CreateProduitInput) {
  return prisma.produit.create({
    data: {
      ...data,
      pharmacieId,
      formePharmaceutique: data.formePharmaceutique as never,
      codeBarres: data.codeBarres || null,
      categorieId: data.categorieId || null,
    },
    include: { categorie: true },
  });
}

export async function update(pharmacieId: string, id: string, data: Partial<CreateProduitInput> & { actif?: boolean }) {
  await getById(pharmacieId, id);
  return prisma.produit.update({
    where: { id },
    data: {
      ...data,
      formePharmaceutique: data.formePharmaceutique as never,
    },
    include: { categorie: true },
  });
}
