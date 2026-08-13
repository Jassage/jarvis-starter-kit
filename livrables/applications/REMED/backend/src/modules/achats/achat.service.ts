import prisma from '../../config/database';
import { AppError } from '../../types';
import { genererNumero } from '../../utils/numero';
import * as stockService from '../stock/stock.service';
import * as notificationService from '../notifications/notification.service';

interface LigneCommandeInput {
  produitId: string;
  quantiteCommandee: number;
  prixUnitaire: number;
}

interface CreerCommandeInput {
  pharmacieId: string;
  fournisseurId: string;
  creeParId: string;
  lignes: LigneCommandeInput[];
}

const INCLUDE_DEFAUT = {
  fournisseur: { select: { nom: true } },
  creePar: { select: { nom: true, prenom: true } },
  lignes: { include: { produit: { select: { nom: true, dosage: true } } } },
};

export async function creer(input: CreerCommandeInput) {
  const fournisseur = await prisma.fournisseur.findFirst({ where: { id: input.fournisseurId, pharmacieId: input.pharmacieId } });
  if (!fournisseur) throw new AppError(404, 'Fournisseur introuvable');

  for (const ligne of input.lignes) {
    const produit = await prisma.produit.findFirst({ where: { id: ligne.produitId, pharmacieId: input.pharmacieId } });
    if (!produit) throw new AppError(404, `Produit introuvable`);
  }

  const dernierNumero = await prisma.commandeAchat.count({ where: { pharmacieId: input.pharmacieId } });
  const numero = genererNumero('CMD', dernierNumero);

  return prisma.commandeAchat.create({
    data: {
      pharmacieId: input.pharmacieId,
      numero,
      fournisseurId: input.fournisseurId,
      creeParId: input.creeParId,
      lignes: {
        create: input.lignes.map((l) => ({
          produitId: l.produitId,
          quantiteCommandee: l.quantiteCommandee,
          prixUnitaire: l.prixUnitaire,
        })),
      },
    },
    include: INCLUDE_DEFAUT,
  });
}

export async function list(pharmacieId: string, filters: { limit: number; statut?: string; fournisseurId?: string }) {
  return prisma.commandeAchat.findMany({
    where: { pharmacieId, statut: filters.statut as never, fournisseurId: filters.fournisseurId },
    include: INCLUDE_DEFAUT,
    orderBy: { createdAt: 'desc' },
    take: filters.limit,
  });
}

export async function getById(pharmacieId: string, id: string) {
  const commande = await prisma.commandeAchat.findFirst({ where: { id, pharmacieId }, include: INCLUDE_DEFAUT });
  if (!commande) throw new AppError(404, 'Commande introuvable');
  return commande;
}

export async function envoyer(pharmacieId: string, id: string) {
  const commande = await getById(pharmacieId, id);
  if (commande.statut !== 'BROUILLON') throw new AppError(400, 'Seule une commande en brouillon peut être envoyée');
  return prisma.commandeAchat.update({ where: { id }, data: { statut: 'ENVOYEE' }, include: INCLUDE_DEFAUT });
}

export async function annuler(pharmacieId: string, id: string) {
  const commande = await getById(pharmacieId, id);
  if (commande.statut === 'RECUE_COMPLETE' || commande.statut === 'RECUE_PARTIELLE') {
    throw new AppError(400, "Une commande déjà réceptionnée (même partiellement) ne peut plus être annulée : la marchandise a déjà été enregistrée en stock");
  }
  if (commande.statut === 'ANNULEE') throw new AppError(400, 'Cette commande est déjà annulée');
  return prisma.commandeAchat.update({ where: { id }, data: { statut: 'ANNULEE' }, include: INCLUDE_DEFAUT });
}

interface LigneReceptionInput {
  ligneId: string;
  quantiteRecue: number;
  numeroLot: string;
  dateExpiration: Date;
  prixAchatUnitaire?: number;
}

// Réception ligne par ligne : réutilise stock.service.entree (même mécanisme que toute entrée
// de stock — un lot par numéro de lot, mouvement ENTREE_ACHAT tracé, prix d'achat du produit
// mis à jour). Le statut de la commande est recalculé après coup à partir des quantités reçues
// cumulées, jamais fourni par le client.
export async function recevoir(pharmacieId: string, commandeId: string, utilisateurId: string, lignes: LigneReceptionInput[]) {
  const commande = await prisma.commandeAchat.findFirst({
    where: { id: commandeId, pharmacieId },
    include: { lignes: true },
  });
  if (!commande) throw new AppError(404, 'Commande introuvable');
  if (commande.statut === 'ANNULEE') throw new AppError(400, 'Cette commande est annulée');
  if (commande.statut === 'RECUE_COMPLETE') throw new AppError(400, 'Cette commande est déjà entièrement réceptionnée');

  for (const entree of lignes) {
    const ligne = commande.lignes.find((l) => l.id === entree.ligneId);
    if (!ligne) throw new AppError(404, `Ligne de commande introuvable : ${entree.ligneId}`);

    const resteACevoir = ligne.quantiteCommandee - ligne.quantiteRecue;
    if (entree.quantiteRecue > resteACevoir) {
      throw new AppError(400, `Quantité reçue (${entree.quantiteRecue}) supérieure au reste à recevoir (${resteACevoir}) pour cette ligne`);
    }

    await stockService.entree({
      pharmacieId,
      produitId: ligne.produitId,
      numeroLot: entree.numeroLot,
      dateExpiration: entree.dateExpiration,
      quantite: entree.quantiteRecue,
      prixAchatUnitaire: entree.prixAchatUnitaire ?? Number(ligne.prixUnitaire),
      fournisseurId: commande.fournisseurId,
      utilisateurId,
    });

    await prisma.ligneCommandeAchat.update({
      where: { id: ligne.id },
      data: { quantiteRecue: { increment: entree.quantiteRecue } },
    });
  }

  const lignesAJour = await prisma.ligneCommandeAchat.findMany({ where: { commandeId } });
  const complete = lignesAJour.every((l) => l.quantiteRecue >= l.quantiteCommandee);
  const partielle = lignesAJour.some((l) => l.quantiteRecue > 0);
  const nouveauStatut = complete ? 'RECUE_COMPLETE' : partielle ? 'RECUE_PARTIELLE' : commande.statut;

  const resultat = await prisma.commandeAchat.update({
    where: { id: commandeId },
    data: { statut: nouveauStatut },
    include: INCLUDE_DEFAUT,
  });

  if (complete) {
    await notificationService.creerNotificationCommandeRecue(pharmacieId, resultat.numero, resultat.fournisseur.nom);
  }

  return resultat;
}
