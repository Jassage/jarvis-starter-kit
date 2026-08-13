import prisma from '../../config/database';
import { AppError } from '../../types';
import { genererNumero } from '../../utils/numero';

interface ItemInput {
  produitId?: string;
  medicamentNom: string;
  dosage?: string;
  posologie?: string;
  dureeJours?: number;
  quantitePrescrite: number;
  instructions?: string;
}

interface CreerOrdonnanceInput {
  pharmacieId: string;
  medecinNom: string;
  patientNom: string;
  patientTelephone?: string;
  clientId?: string;
  dateEmission: Date;
  items: ItemInput[];
}

const INCLUDE_DEFAUT = {
  client: { select: { nom: true, prenom: true } },
  items: { include: { produit: { select: { nom: true, dosage: true } } } },
};

// Une ordonnance est désormais enregistrée indépendamment d'une vente (Phase 3) : elle peut être
// créée à l'avance (le patient revient plus tard servir sa prescription) puis sélectionnée au
// POS, en une ou plusieurs fois (service partiel), au lieu d'être systématiquement recréée à
// chaque vente. Statut ENREGISTREE tant qu'aucune ligne n'a été servie.
export async function creer(input: CreerOrdonnanceInput) {
  if (input.clientId) {
    const client = await prisma.client.findFirst({ where: { id: input.clientId, pharmacieId: input.pharmacieId } });
    if (!client) throw new AppError(404, 'Client introuvable');
  }
  for (const item of input.items) {
    if (item.produitId) {
      const produit = await prisma.produit.findFirst({ where: { id: item.produitId, pharmacieId: input.pharmacieId } });
      if (!produit) throw new AppError(404, `Produit introuvable pour la ligne "${item.medicamentNom}"`);
    }
  }

  const dernierNumero = await prisma.ordonnance.count({ where: { pharmacieId: input.pharmacieId } });
  const numero = genererNumero('ORD', dernierNumero);

  return prisma.ordonnance.create({
    data: {
      pharmacieId: input.pharmacieId,
      numero,
      medecinNom: input.medecinNom,
      patientNom: input.patientNom,
      patientTelephone: input.patientTelephone,
      clientId: input.clientId || null,
      dateEmission: input.dateEmission,
      items: {
        create: input.items.map((i) => ({
          produitId: i.produitId || null,
          medicamentNom: i.medicamentNom,
          dosage: i.dosage,
          posologie: i.posologie,
          dureeJours: i.dureeJours,
          quantitePrescrite: i.quantitePrescrite,
          instructions: i.instructions,
        })),
      },
    },
    include: INCLUDE_DEFAUT,
  });
}

export async function list(pharmacieId: string, filters: { limit: number; statut?: string }) {
  return prisma.ordonnance.findMany({
    where: { pharmacieId, statut: filters.statut as never },
    include: INCLUDE_DEFAUT,
    orderBy: { createdAt: 'desc' },
    take: filters.limit,
  });
}

// Ordonnances encore utilisables au POS (non annulées, non entièrement servies) — utilisé par le
// sélecteur "ordonnance existante" de la page Ventes.
export async function listDisponibles(pharmacieId: string) {
  return prisma.ordonnance.findMany({
    where: { pharmacieId, statut: { in: ['ENREGISTREE', 'PARTIELLEMENT_SERVIE'] } },
    include: INCLUDE_DEFAUT,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function getById(pharmacieId: string, id: string) {
  const ordonnance = await prisma.ordonnance.findFirst({ where: { id, pharmacieId }, include: INCLUDE_DEFAUT });
  if (!ordonnance) throw new AppError(404, 'Ordonnance introuvable');
  return ordonnance;
}

// Annulation refusée dès qu'au moins une ligne a été servie : annuler effacerait la trace d'une
// délivrance réelle déjà faite. Une vente déjà passée sur cette ordonnance doit être annulée
// elle-même (vente.service.annuler) si la délivrance doit être défaite.
export async function annuler(pharmacieId: string, id: string) {
  const ordonnance = await getById(pharmacieId, id);
  if (ordonnance.statut === 'ANNULEE') throw new AppError(400, 'Cette ordonnance est déjà annulée');
  if (ordonnance.items.some((i) => i.quantiteServie > 0)) {
    throw new AppError(400, 'Impossible d\'annuler une ordonnance dont au moins une ligne a déjà été servie');
  }
  return prisma.ordonnance.update({ where: { id }, data: { statut: 'ANNULEE' }, include: INCLUDE_DEFAUT });
}

export async function attacherPieceJointe(pharmacieId: string, id: string, url: string) {
  await getById(pharmacieId, id);
  return prisma.ordonnance.update({ where: { id }, data: { pieceJointeUrl: url }, include: INCLUDE_DEFAUT });
}
