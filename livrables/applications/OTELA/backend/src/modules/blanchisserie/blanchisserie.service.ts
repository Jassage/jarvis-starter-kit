import { Devise, StatutBlanchisserie } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { getFolioOuvertParChambreId, ajouterLigneFolio } from '../folios/folios.service';

export async function listCommandes(etablissementId: string) {
  return prisma.commandeBlanchisserie.findMany({
    where: { chambre: { etablissementId } },
    include: { chambre: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function creerCommande(etablissementId: string, data: { chambreId: string; articles: string; montant: number; devise: Devise }) {
  const chambre = await prisma.chambre.findUnique({ where: { id: data.chambreId } });
  if (!chambre || chambre.etablissementId !== etablissementId) throw new AppError('Chambre introuvable', 404);
  return prisma.commandeBlanchisserie.create({ data, include: { chambre: true } });
}

async function trouverCommande(id: string, etablissementId: string) {
  const commande = await prisma.commandeBlanchisserie.findUnique({ where: { id }, include: { chambre: true } });
  if (!commande || commande.chambre.etablissementId !== etablissementId) throw new AppError('Commande introuvable', 404);
  return commande;
}

// Facturée au folio automatiquement au passage à LIVREE (service rendu, pas juste
// demandé) — même logique que la clôture d'une commande restaurant/d'un RDV spa.
export async function updateStatut(id: string, etablissementId: string, statut: StatutBlanchisserie, employeId?: string) {
  const commande = await trouverCommande(id, etablissementId);
  if (commande.statut === 'LIVREE') throw new AppError('Cette commande est déjà livrée', 409);

  if (statut === 'LIVREE') {
    const folio = await getFolioOuvertParChambreId(commande.chambreId, etablissementId);
    return prisma.$transaction(async (tx) => {
      await ajouterLigneFolio(tx, folio.id, {
        departementSource: 'BLANCHISSERIE',
        description: commande.articles,
        montant: Number(commande.montant),
        employeId,
      });
      return tx.commandeBlanchisserie.update({ where: { id }, data: { statut, folioId: folio.id }, include: { chambre: true } });
    });
  }

  return prisma.commandeBlanchisserie.update({ where: { id }, data: { statut }, include: { chambre: true } });
}
