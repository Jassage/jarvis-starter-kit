import { CategorieMenuItem, Devise, MethodePaiement, TypePointDeVente } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { ajouterLigneFolio, getFolioOuvertParNumeroChambre } from '../folios/folios.service';

const INCLUDE_COMMANDE = {
  table: { include: { pointDeVente: true } },
  lignes: { include: { menuItem: true } },
};

// ─────────────────────────────────────────
// Admin établissement : points de vente / tables / menu
// ─────────────────────────────────────────

export async function listPointsDeVente(etablissementId: string) {
  return prisma.pointDeVente.findMany({ where: { etablissementId }, orderBy: { nom: 'asc' } });
}

export async function creerPointDeVente(etablissementId: string, data: { nom: string; type: TypePointDeVente }) {
  return prisma.pointDeVente.create({ data: { etablissementId, ...data } });
}

export async function listTables(etablissementId: string) {
  return prisma.table.findMany({
    where: { pointDeVente: { etablissementId } },
    include: {
      pointDeVente: true,
      commandes: { where: { statut: { not: 'PAYEE' } }, orderBy: { dateHeure: 'desc' }, take: 1 },
    },
    orderBy: { numero: 'asc' },
  });
}

export async function creerTable(etablissementId: string, data: { pointDeVenteId: string; numero: string; capacite: number }) {
  const pdv = await prisma.pointDeVente.findUnique({ where: { id: data.pointDeVenteId } });
  if (!pdv || pdv.etablissementId !== etablissementId) throw new AppError('Point de vente introuvable', 404);
  return prisma.table.create({ data });
}

export async function listMenu(etablissementId: string) {
  return prisma.menuItem.findMany({ where: { pointDeVente: { etablissementId } }, include: { pointDeVente: true }, orderBy: { nom: 'asc' } });
}

export async function creerMenuItem(etablissementId: string, data: { pointDeVenteId: string; nom: string; prix: number; devise: Devise; categorie: CategorieMenuItem }) {
  const pdv = await prisma.pointDeVente.findUnique({ where: { id: data.pointDeVenteId } });
  if (!pdv || pdv.etablissementId !== etablissementId) throw new AppError('Point de vente introuvable', 404);
  return prisma.menuItem.create({ data });
}

export async function updateMenuItem(id: string, etablissementId: string, data: Partial<{ nom: string; prix: number; categorie: CategorieMenuItem; disponible: boolean }>) {
  const item = await prisma.menuItem.findUnique({ where: { id }, include: { pointDeVente: true } });
  if (!item || item.pointDeVente.etablissementId !== etablissementId) throw new AppError('Item de menu introuvable', 404);
  return prisma.menuItem.update({ where: { id }, data });
}

// ─────────────────────────────────────────
// Serveur : commandes
// ─────────────────────────────────────────

async function trouverCommande(commandeId: string, etablissementId: string) {
  const commande = await prisma.commande.findUnique({ where: { id: commandeId }, include: INCLUDE_COMMANDE });
  if (!commande || commande.table.pointDeVente.etablissementId !== etablissementId) {
    throw new AppError('Commande introuvable', 404);
  }
  return commande;
}

export async function ouvrirCommande(etablissementId: string, tableId: string, employeId?: string) {
  const table = await prisma.table.findUnique({ where: { id: tableId }, include: { pointDeVente: true } });
  if (!table || table.pointDeVente.etablissementId !== etablissementId) throw new AppError('Table introuvable', 404);

  return prisma.$transaction(async (tx) => {
    // CAS : LIBRE ou RESERVEE peuvent accueillir une nouvelle commande, jamais OCCUPEE.
    const upd = await tx.table.updateMany({
      where: { id: tableId, statut: { in: ['LIBRE', 'RESERVEE'] } },
      data: { statut: 'OCCUPEE' },
    });
    if (upd.count === 0) throw new AppError('Cette table est déjà occupée', 409);

    return tx.commande.create({ data: { tableId, employeId }, include: INCLUDE_COMMANDE });
  });
}

export async function getCommande(commandeId: string, etablissementId: string) {
  return trouverCommande(commandeId, etablissementId);
}

export async function ajouterLigneCommande(commandeId: string, etablissementId: string, data: { menuItemId: string; quantite: number; notes?: string }) {
  const commande = await trouverCommande(commandeId, etablissementId);
  if (commande.statut !== 'EN_COURS') throw new AppError('Cette commande ne peut plus être modifiée', 409);

  const menuItem = await prisma.menuItem.findUnique({ where: { id: data.menuItemId } });
  if (!menuItem || !menuItem.disponible) throw new AppError('Cet item de menu est indisponible', 409);

  await prisma.ligneCommande.create({ data: { commandeId, menuItemId: data.menuItemId, quantite: data.quantite, notes: data.notes } });
  return trouverCommande(commandeId, etablissementId);
}

export async function envoyerEnCuisine(commandeId: string, etablissementId: string) {
  const commande = await trouverCommande(commandeId, etablissementId);
  if (commande.lignes.length === 0) throw new AppError('Impossible d\'envoyer une commande vide en cuisine', 400);

  const upd = await prisma.commande.updateMany({ where: { id: commandeId, statut: 'EN_COURS' }, data: { statut: 'ENVOYEE_CUISINE' } });
  if (upd.count === 0) throw new AppError('Commande déjà envoyée en cuisine ou traitée', 409);
  return trouverCommande(commandeId, etablissementId);
}

export async function marquerServie(commandeId: string, etablissementId: string) {
  await trouverCommande(commandeId, etablissementId);
  const upd = await prisma.commande.updateMany({ where: { id: commandeId, statut: 'ENVOYEE_CUISINE' }, data: { statut: 'SERVIE' } });
  if (upd.count === 0) throw new AppError('Commande pas encore envoyée en cuisine, ou déjà servie', 409);
  return trouverCommande(commandeId, etablissementId);
}

export async function listCommandesCuisine(etablissementId: string) {
  return prisma.commande.findMany({
    where: { statut: 'ENVOYEE_CUISINE', table: { pointDeVente: { etablissementId } } },
    include: INCLUDE_COMMANDE,
    orderBy: { dateHeure: 'asc' },
  });
}

// Clôture : "ajouter au folio chambre X" (résident) ou paiement direct (client de
// passage) — jamais de facturation isolée, cf. décision du plan.
export async function cloturerCommande(
  commandeId: string,
  etablissementId: string,
  data: { chambreNumero?: string; methodePaiement?: MethodePaiement },
  employeId?: string
) {
  const commande = await trouverCommande(commandeId, etablissementId);
  if (commande.statut === 'PAYEE') throw new AppError('Commande déjà clôturée', 409);
  if (commande.lignes.length === 0) throw new AppError('Impossible de clôturer une commande vide', 400);

  const total = commande.lignes.reduce((s, l) => s + Number(l.menuItem.prix) * l.quantite, 0);
  const nbArticles = commande.lignes.reduce((s, l) => s + l.quantite, 0);
  const description = `${commande.table.pointDeVente.nom} — table ${commande.table.numero} (${nbArticles} article${nbArticles > 1 ? 's' : ''})`;

  if (data.chambreNumero) {
    const folio = await getFolioOuvertParNumeroChambre(data.chambreNumero, etablissementId);
    return prisma.$transaction(async (tx) => {
      await ajouterLigneFolio(tx, folio.id, {
        departementSource: commande.table.pointDeVente.type === 'BAR' ? 'BAR' : 'RESTAURANT',
        description,
        montant: total,
        employeId,
      });
      await tx.commande.update({ where: { id: commandeId }, data: { statut: 'PAYEE', folioId: folio.id } });
      await tx.table.update({ where: { id: commande.tableId }, data: { statut: 'LIBRE' } });
      return tx.commande.findUnique({ where: { id: commandeId }, include: INCLUDE_COMMANDE });
    });
  }

  if (!data.methodePaiement) throw new AppError('methodePaiement requis pour un client non-résident', 400);

  return prisma.$transaction(async (tx) => {
    await tx.commande.update({ where: { id: commandeId }, data: { statut: 'PAYEE', methodePaiement: data.methodePaiement } });
    await tx.table.update({ where: { id: commande.tableId }, data: { statut: 'LIBRE' } });
    return tx.commande.findUnique({ where: { id: commandeId }, include: INCLUDE_COMMANDE });
  });
}
