import prisma from '../../config/database';
import { AppError } from '../../types';
import { genererNumero } from '../../utils/numero';
import * as stockService from '../stock/stock.service';

const INCLUDE_DEFAUT = {
  creePar: { select: { nom: true, prenom: true } },
  validePar: { select: { nom: true, prenom: true } },
  lignes: {
    include: {
      lot: { select: { numeroLot: true, produit: { select: { id: true, nom: true, dosage: true } } } },
    },
  },
};

interface CreerInventaireInput {
  pharmacieId: string;
  creeParId: string;
  type: 'COMPLET' | 'PARTIEL';
  lotIds?: string[];
}

// Fige la quantité théorique de chaque lot au moment de la création — la comparaison à la
// validation se fait toujours contre cet instantané, jamais contre la quantité live du lot
// (qui peut continuer à bouger le temps du comptage physique).
export async function creer(input: CreerInventaireInput) {
  const lots =
    input.type === 'COMPLET'
      ? await prisma.lotProduit.findMany({ where: { quantiteActuelle: { gt: 0 }, produit: { pharmacieId: input.pharmacieId } } })
      : await prisma.lotProduit.findMany({ where: { id: { in: input.lotIds }, produit: { pharmacieId: input.pharmacieId } } });

  if (lots.length === 0) throw new AppError(400, 'Aucun lot à inventorier');
  if (input.type === 'PARTIEL' && lots.length !== input.lotIds!.length) {
    throw new AppError(404, "Un ou plusieurs lots sélectionnés sont introuvables pour cette pharmacie");
  }

  const dernierNumero = await prisma.inventaire.count({ where: { pharmacieId: input.pharmacieId } });
  const numero = genererNumero('INV', dernierNumero);

  return prisma.inventaire.create({
    data: {
      pharmacieId: input.pharmacieId,
      numero,
      type: input.type,
      creeParId: input.creeParId,
      lignes: {
        create: lots.map((lot) => ({ lotId: lot.id, quantiteTheorique: lot.quantiteActuelle })),
      },
    },
    include: INCLUDE_DEFAUT,
  });
}

export async function list(pharmacieId: string, filters: { limit: number; statut?: string }) {
  return prisma.inventaire.findMany({
    where: { pharmacieId, statut: filters.statut as never },
    include: INCLUDE_DEFAUT,
    orderBy: { createdAt: 'desc' },
    take: filters.limit,
  });
}

export async function getById(pharmacieId: string, id: string) {
  const inventaire = await prisma.inventaire.findFirst({ where: { id, pharmacieId }, include: INCLUDE_DEFAUT });
  if (!inventaire) throw new AppError(404, 'Inventaire introuvable');
  return inventaire;
}

interface LigneSaisieInput {
  itemId: string;
  quantiteReelle: number;
  motif?: string;
}

export async function saisirQuantites(pharmacieId: string, inventaireId: string, lignes: LigneSaisieInput[]) {
  const inventaire = await getById(pharmacieId, inventaireId);
  if (inventaire.statut !== 'EN_COURS') throw new AppError(400, 'Seul un inventaire en cours peut être modifié');

  const idsValides = new Set(inventaire.lignes.map((l) => l.id));
  for (const ligne of lignes) {
    if (!idsValides.has(ligne.itemId)) throw new AppError(404, `Ligne d'inventaire introuvable : ${ligne.itemId}`);
    await prisma.inventaireItem.update({
      where: { id: ligne.itemId },
      data: { quantiteReelle: ligne.quantiteReelle, motif: ligne.motif },
    });
  }

  return getById(pharmacieId, inventaireId);
}

export async function annuler(pharmacieId: string, id: string) {
  const inventaire = await getById(pharmacieId, id);
  if (inventaire.statut !== 'EN_COURS') throw new AppError(400, 'Seul un inventaire en cours peut être annulé');
  return prisma.inventaire.update({ where: { id }, data: { statut: 'ANNULE' }, include: INCLUDE_DEFAUT });
}

// Compare la quantité réelle saisie à la quantité théorique figée à la création et génère les
// AJUSTEMENT_POSITIF/NEGATIF correspondants en réutilisant stock.service.ajuster (même
// compare-and-swap que le reste du portefeuille) — aucune double logique d'ajustement ici.
export async function valider(pharmacieId: string, id: string, utilisateurId: string) {
  const inventaire = await getById(pharmacieId, id);
  if (inventaire.statut !== 'EN_COURS') throw new AppError(400, 'Seul un inventaire en cours peut être validé');

  const nonSaisies = inventaire.lignes.filter((l) => l.quantiteReelle === null);
  if (nonSaisies.length > 0) {
    throw new AppError(400, `${nonSaisies.length} ligne(s) n'ont pas encore de quantité réelle saisie`);
  }

  for (const ligne of inventaire.lignes) {
    const delta = ligne.quantiteReelle! - ligne.quantiteTheorique;
    if (delta === 0) continue;

    await stockService.ajuster({
      pharmacieId,
      lotId: ligne.lotId,
      delta,
      motif: `Inventaire ${inventaire.numero}${ligne.motif ? ` — ${ligne.motif}` : ''}`,
      utilisateurId,
    });
  }

  return prisma.inventaire.update({
    where: { id },
    data: { statut: 'VALIDE', valideParId: utilisateurId, valideLe: new Date() },
    include: INCLUDE_DEFAUT,
  });
}
