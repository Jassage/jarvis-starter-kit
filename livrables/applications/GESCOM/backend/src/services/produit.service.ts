import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';

// page/limit optionnels et rétrocompatibles : sans eux, comportement identique à avant (tableau
// complet, tel qu'attendu par le frontend actuel) — à activer explicitement quand le catalogue
// grossira, sans casser les écrans existants qui ne connaissent que la forme "tableau".
export async function listProduits(params: { search?: string; categorie?: string; actif?: boolean; page?: number; limit?: number }) {
  const where: any = {};
  if (params.actif !== undefined) where.actif = params.actif;
  if (params.categorie) where.categorie = params.categorie;
  if (params.search) {
    where.OR = [
      { nom: { contains: params.search, mode: 'insensitive' } },
      { reference: { contains: params.search, mode: 'insensitive' } },
      { codeBarres: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const pagine = params.page !== undefined || params.limit !== undefined;
  const page = params.page ?? 1;
  const limit = params.limit ?? 50;

  const [produits, total] = await Promise.all([
    prisma.produit.findMany({
      where,
      include: { stocks: { include: { emplacement: { select: { id: true, nom: true, type: true } } } } },
      orderBy: { nom: 'asc' },
      ...(pagine ? { skip: (page - 1) * limit, take: limit } : {}),
    }),
    pagine ? prisma.produit.count({ where }) : Promise.resolve(0),
  ]);

  const enrichis = produits.map((p) => ({
    ...p,
    stockTotal: p.stocks.reduce((sum, s) => sum + s.quantite, 0),
  }));

  if (!pagine) return enrichis;
  return { items: enrichis, total, page, limit, pages: Math.ceil(total / limit) };
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
