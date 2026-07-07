import prisma from '../../config/database';
import { AppError } from '../../types';

export async function listBoutiques() {
  return prisma.boutique.findMany({
    include: { merchantSubscription: true, _count: { select: { products: true, orders: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateBoutiqueStatus(boutiqueId: string, status: 'ACTIVE' | 'SUSPENDED') {
  const boutique = await prisma.boutique.findUnique({ where: { id: boutiqueId } });
  if (!boutique) throw new AppError('Boutique introuvable', 404);
  return prisma.boutique.update({ where: { id: boutiqueId }, data: { status } });
}

export async function getPlatformStats() {
  const [boutiquesCount, activeBoutiques, ordersCount, paidOrders, pendingProofs] = await Promise.all([
    prisma.boutique.count(),
    prisma.boutique.count({ where: { status: 'ACTIVE' } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } } }),
    prisma.payment.count({ where: { status: 'PENDING', method: 'MANUAL_PROOF' } }),
  ]);

  const revenueByPlan = await prisma.merchantSubscription.groupBy({
    by: ['plan'],
    where: { isActive: true },
    _count: { plan: true },
  });

  return { boutiquesCount, activeBoutiques, ordersCount, paidOrders, pendingProofs, revenueByPlan };
}
