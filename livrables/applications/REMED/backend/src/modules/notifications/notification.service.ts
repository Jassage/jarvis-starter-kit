import prisma from '../../config/database';
import { AppError } from '../../types';
import * as stockService from '../stock/stock.service';

// Pas de scheduler dans ce portefeuille (aucun projet n'en a) : la synchronisation se fait
// paresseusement à chaque lecture de la liste plutôt que via un cron. Déduplication sur une
// fenêtre de 24h (pas seulement "non lue") : sans ça, un produit resté sous son seuil pendant
// des semaines verrait sa notification recréée à l'instant même où l'utilisateur clique « tout
// marquer lu » (le prochain appel de synchroniser() la retrouverait « non lue » à nouveau,
// annulant silencieusement l'action) — trouvé et corrigé en vérifiant ce scénario précis.
const FENETRE_DEDUP_MS = 24 * 60 * 60 * 1000;

export async function synchroniser(pharmacieId: string): Promise<void> {
  const [stockBas, peremptions] = await Promise.all([
    stockService.alertesStockBas(pharmacieId),
    stockService.alertesPeremption(pharmacieId, 90),
  ]);
  const depuis = new Date(Date.now() - FENETRE_DEDUP_MS);

  for (const p of stockBas) {
    const existe = await prisma.notification.findFirst({
      where: { pharmacieId, type: 'STOCK_BAS', lienEntite: p.id, createdAt: { gte: depuis } },
    });
    if (!existe) {
      await prisma.notification.create({
        data: {
          pharmacieId,
          type: 'STOCK_BAS',
          titre: 'Stock bas',
          message: `${p.nom}${p.dosage ? ` ${p.dosage}` : ''} : ${p.quantiteTotal} en stock (seuil ${p.seuilAlerte})`,
          lienEntite: p.id,
        },
      });
    }
  }

  for (const lot of peremptions) {
    const existe = await prisma.notification.findFirst({
      where: { pharmacieId, type: 'PEREMPTION_PROCHE', lienEntite: lot.id, createdAt: { gte: depuis } },
    });
    if (!existe) {
      await prisma.notification.create({
        data: {
          pharmacieId,
          type: 'PEREMPTION_PROCHE',
          titre: lot.expire ? 'Lot expiré' : 'Péremption proche',
          message: `${lot.produit.nom}${lot.produit.dosage ? ` ${lot.produit.dosage}` : ''} — Lot ${lot.numeroLot} (${new Date(lot.dateExpiration).toLocaleDateString('fr-FR')})`,
          lienEntite: lot.id,
        },
      });
    }
  }
}

export async function creerNotificationCommandeRecue(pharmacieId: string, numeroCommande: string, fournisseurNom: string) {
  await prisma.notification.create({
    data: {
      pharmacieId,
      type: 'COMMANDE_RECUE',
      titre: 'Commande réceptionnée',
      message: `${numeroCommande} (${fournisseurNom}) réceptionnée`,
    },
  });
}

export async function list(pharmacieId: string, filters: { limit: number; lue?: boolean }) {
  await synchroniser(pharmacieId);
  return prisma.notification.findMany({
    where: { pharmacieId, lue: filters.lue },
    orderBy: { createdAt: 'desc' },
    take: filters.limit,
  });
}

export async function compterNonLues(pharmacieId: string) {
  await synchroniser(pharmacieId);
  return prisma.notification.count({ where: { pharmacieId, lue: false } });
}

export async function marquerLue(pharmacieId: string, id: string) {
  const notification = await prisma.notification.findFirst({ where: { id, pharmacieId } });
  if (!notification) throw new AppError(404, 'Notification introuvable');
  return prisma.notification.update({ where: { id }, data: { lue: true } });
}

export async function toutMarquerLu(pharmacieId: string) {
  await prisma.notification.updateMany({ where: { pharmacieId, lue: false }, data: { lue: true } });
}
