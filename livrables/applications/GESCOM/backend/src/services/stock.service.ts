import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';

export async function listStock(emplacementId?: string) {
  const where = emplacementId ? { emplacementId } : {};
  return prisma.stockEmplacement.findMany({
    where,
    include: {
      produit: { select: { id: true, reference: true, nom: true, unite: true, seuilAlerte: true, prixAchatMoyen: true, prixVenteDetail: true, actif: true } },
      emplacement: { select: { id: true, nom: true, type: true } },
    },
    orderBy: [{ produit: { nom: 'asc' } }],
  });
}

export async function listMouvements(params: { produitId?: string; emplacementId?: string; limit?: number }) {
  const where: any = {};
  if (params.produitId) where.produitId = params.produitId;
  if (params.emplacementId) where.emplacementId = params.emplacementId;

  return prisma.mouvementStock.findMany({
    where,
    include: {
      produit: { select: { nom: true, reference: true } },
      emplacement: { select: { nom: true } },
      utilisateur: { select: { nom: true, prenom: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: params.limit ?? 50,
  });
}

export async function listAlertes() {
  const stocks = await prisma.stockEmplacement.findMany({
    where: { produit: { actif: true } },
    include: { produit: true, emplacement: { select: { id: true, nom: true, type: true } } },
  });

  return stocks
    .filter((s) => s.quantite <= s.produit.seuilAlerte)
    .map((s) => ({
      produitId: s.produit.id,
      reference: s.produit.reference,
      nom: s.produit.nom,
      emplacement: s.emplacement,
      quantite: s.quantite,
      seuilAlerte: s.produit.seuilAlerte,
    }));
}

export async function ajusterStock(
  data: { produitId: string; emplacementId: string; quantite: number; type: 'ENTREE' | 'AJUSTEMENT'; raison?: string },
  userId: string
) {
  const stock = await prisma.stockEmplacement.findUnique({
    where: { produitId_emplacementId: { produitId: data.produitId, emplacementId: data.emplacementId } },
  });
  if (!stock) throw new AppError(404, 'Stock introuvable pour ce produit et cet emplacement');

  const delta = data.type === 'ENTREE' ? Math.abs(data.quantite) : data.quantite;

  const updated = await prisma.$transaction(async (tx) => {
    let stockMaj;
    if (delta >= 0) {
      stockMaj = await tx.stockEmplacement.update({ where: { id: stock.id }, data: { quantite: { increment: delta } } });
    } else {
      // Compare-and-swap : empêche un ajustement négatif concurrent de faire passer le stock sous zéro
      const maj = await tx.stockEmplacement.updateMany({
        where: { id: stock.id, quantite: { gte: -delta } },
        data: { quantite: { decrement: -delta } },
      });
      if (maj.count === 0) {
        throw new AppError(400, 'La quantité résultante ne peut pas être négative (stock modifié entre-temps, réessayez)');
      }
      stockMaj = await tx.stockEmplacement.findUniqueOrThrow({ where: { id: stock.id } });
    }

    await tx.mouvementStock.create({
      data: {
        produitId: data.produitId,
        emplacementId: data.emplacementId,
        userId,
        type: data.type,
        quantite: delta,
        raison: data.raison,
      },
    });

    return stockMaj;
  });

  await createAuditLog({ userId, table: 'stocks_emplacement', action: data.type, entiteId: stock.id, nouveau: { quantite: updated.quantite } });
  return updated;
}
