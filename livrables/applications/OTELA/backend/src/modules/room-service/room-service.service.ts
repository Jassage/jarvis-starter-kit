import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { getFolioOuvertParChambreId, ajouterLigneFolio } from '../folios/folios.service';

const INCLUDE_COMMANDE = {
  chambre: true,
  lignes: { include: { menuItem: true } },
};

async function trouverCommande(commandeId: string, etablissementId: string) {
  const commande = await prisma.commandeRoomService.findUnique({ where: { id: commandeId }, include: INCLUDE_COMMANDE });
  if (!commande || commande.chambre.etablissementId !== etablissementId) throw new AppError('Commande introuvable', 404);
  return commande;
}

export async function ouvrirCommande(etablissementId: string, chambreId: string, employeId?: string) {
  const chambre = await prisma.chambre.findUnique({ where: { id: chambreId } });
  if (!chambre || chambre.etablissementId !== etablissementId) throw new AppError('Chambre introuvable', 404);
  return prisma.commandeRoomService.create({ data: { chambreId, employeId }, include: INCLUDE_COMMANDE });
}

export async function getCommande(commandeId: string, etablissementId: string) {
  return trouverCommande(commandeId, etablissementId);
}

export async function ajouterLigne(commandeId: string, etablissementId: string, data: { menuItemId: string; quantite: number; notes?: string }) {
  const commande = await trouverCommande(commandeId, etablissementId);
  if (commande.statut !== 'EN_COURS') throw new AppError('Cette commande ne peut plus être modifiée', 409);

  const menuItem = await prisma.menuItem.findUnique({ where: { id: data.menuItemId } });
  if (!menuItem || !menuItem.disponible) throw new AppError('Cet item de menu est indisponible', 409);

  await prisma.ligneCommandeRoomService.create({
    data: { commandeRoomServiceId: commandeId, menuItemId: data.menuItemId, quantite: data.quantite, notes: data.notes },
  });
  return trouverCommande(commandeId, etablissementId);
}

export async function envoyerEnCuisine(commandeId: string, etablissementId: string) {
  const commande = await trouverCommande(commandeId, etablissementId);
  if (commande.lignes.length === 0) throw new AppError('Impossible d\'envoyer une commande vide en cuisine', 400);

  const upd = await prisma.commandeRoomService.updateMany({ where: { id: commandeId, statut: 'EN_COURS' }, data: { statut: 'ENVOYEE_CUISINE' } });
  if (upd.count === 0) throw new AppError('Commande déjà envoyée en cuisine ou traitée', 409);
  return trouverCommande(commandeId, etablissementId);
}

export async function marquerLivree(commandeId: string, etablissementId: string) {
  await trouverCommande(commandeId, etablissementId);
  const upd = await prisma.commandeRoomService.updateMany({ where: { id: commandeId, statut: 'ENVOYEE_CUISINE' }, data: { statut: 'SERVIE' } });
  if (upd.count === 0) throw new AppError('Commande pas encore envoyée en cuisine, ou déjà livrée', 409);
  return trouverCommande(commandeId, etablissementId);
}

export async function listCommandesCuisine(etablissementId: string) {
  return prisma.commandeRoomService.findMany({
    where: { statut: 'ENVOYEE_CUISINE', chambre: { etablissementId } },
    include: INCLUDE_COMMANDE,
    orderBy: { dateHeure: 'asc' },
  });
}

// Toujours au folio — jamais de paiement direct, le client est forcément résident
// (exigence explicite du document, contrairement à Restaurant/Bar).
export async function cloturerCommande(commandeId: string, etablissementId: string, employeId?: string) {
  const commande = await trouverCommande(commandeId, etablissementId);
  if (commande.statut === 'PAYEE') throw new AppError('Commande déjà clôturée', 409);
  if (commande.lignes.length === 0) throw new AppError('Impossible de clôturer une commande vide', 400);

  const total = commande.lignes.reduce((s, l) => s + Number(l.menuItem.prix) * l.quantite, 0);
  const nbArticles = commande.lignes.reduce((s, l) => s + l.quantite, 0);
  const description = `Room service (${nbArticles} article${nbArticles > 1 ? 's' : ''})`;

  const folio = await getFolioOuvertParChambreId(commande.chambreId, etablissementId);
  return prisma.$transaction(async (tx) => {
    await ajouterLigneFolio(tx, folio.id, {
      departementSource: 'ROOM_SERVICE',
      description,
      montant: total,
      employeId,
    });
    await tx.commandeRoomService.update({ where: { id: commandeId }, data: { statut: 'PAYEE', folioId: folio.id } });
    return tx.commandeRoomService.findUnique({ where: { id: commandeId }, include: INCLUDE_COMMANDE });
  });
}
