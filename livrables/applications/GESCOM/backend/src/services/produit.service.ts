import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';

export async function listProduits(params: { search?: string; categorie?: string; actif?: boolean }) {
  const where: any = {};
  if (params.actif !== undefined) where.actif = params.actif;
  if (params.categorie) where.categorie = params.categorie;
  if (params.search) {
    where.OR = [
      { nom: { contains: params.search, mode: 'insensitive' } },
      { reference: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const produits = await prisma.produit.findMany({
    where,
    include: { stocks: { include: { emplacement: { select: { id: true, nom: true, type: true } } } } },
    orderBy: { nom: 'asc' },
  });

  return produits.map((p) => ({
    ...p,
    stockTotal: p.stocks.reduce((sum, s) => sum + s.quantite, 0),
  }));
}

export async function getProduit(id: string) {
  const produit = await prisma.produit.findUnique({
    where: { id },
    include: { stocks: { include: { emplacement: { select: { id: true, nom: true, type: true } } } } },
  });
  if (!produit) throw new AppError(404, 'Produit introuvable');
  return produit;
}

export async function createProduit(data: any, userId: string) {
  const emplacements = await prisma.emplacement.findMany({ where: { actif: true } });

  const produit = await prisma.$transaction(async (tx) => {
    const created = await tx.produit.create({ data });
    if (emplacements.length > 0) {
      await tx.stockEmplacement.createMany({
        data: emplacements.map((e) => ({ produitId: created.id, emplacementId: e.id, quantite: 0 })),
      });
    }
    return created;
  });

  await createAuditLog({ userId, table: 'produits', action: 'CREATE', entiteId: produit.id, nouveau: data });
  return produit;
}

export async function updateProduit(id: string, data: any, userId: string) {
  const produit = await prisma.produit.update({ where: { id }, data });
  await createAuditLog({ userId, table: 'produits', action: 'UPDATE', entiteId: id, nouveau: data });
  return produit;
}

export async function archiveProduit(id: string, userId: string) {
  const produit = await prisma.produit.update({ where: { id }, data: { actif: false } });
  await createAuditLog({ userId, table: 'produits', action: 'ARCHIVE', entiteId: id });
  return produit;
}
