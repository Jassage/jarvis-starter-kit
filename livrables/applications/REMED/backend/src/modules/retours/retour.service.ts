import prisma from '../../config/database';
import { AppError } from '../../types';
import { genererNumero } from '../../utils/numero';

interface LigneRetourInput {
  produitId: string;
  lotId: string;
  quantite: number;
}

interface CreerRetourInput {
  pharmacieId: string;
  utilisateurId: string;
  type: 'RETOUR_CLIENT' | 'RETOUR_FOURNISSEUR' | 'PRODUIT_ENDOMMAGE' | 'PRODUIT_EXPIRE' | 'ERREUR_VENTE';
  venteId?: string;
  fournisseurId?: string;
  motif?: string;
  lignes: LigneRetourInput[];
}

// Le sens du mouvement de stock est dérivé du type, jamais saisi par le client. RETOUR_CLIENT
// et ERREUR_VENTE remettent du stock en rayon (le client rapporte un produit, ou une vente
// erronée est corrigée sans annuler toute la transaction) ; les trois autres en retirent.
const TYPES_STOCK_POSITIF = new Set(['RETOUR_CLIENT', 'ERREUR_VENTE']);

function mouvementPour(type: string): 'RETOUR_CLIENT' | 'RETOUR_FOURNISSEUR' | 'AJUSTEMENT_NEGATIF' | 'PEREMPTION' {
  switch (type) {
    case 'RETOUR_CLIENT':
    case 'ERREUR_VENTE':
      return 'RETOUR_CLIENT';
    case 'RETOUR_FOURNISSEUR':
      return 'RETOUR_FOURNISSEUR';
    case 'PRODUIT_EXPIRE':
      return 'PEREMPTION';
    default:
      return 'AJUSTEMENT_NEGATIF';
  }
}

export async function creer(input: CreerRetourInput) {
  if (input.venteId) {
    const vente = await prisma.vente.findFirst({ where: { id: input.venteId, pharmacieId: input.pharmacieId } });
    if (!vente) throw new AppError(404, 'Vente introuvable');
  }
  if (input.fournisseurId) {
    const fournisseur = await prisma.fournisseur.findFirst({ where: { id: input.fournisseurId, pharmacieId: input.pharmacieId } });
    if (!fournisseur) throw new AppError(404, 'Fournisseur introuvable');
  }

  const stockPositif = TYPES_STOCK_POSITIF.has(input.type);
  const typeMouvement = mouvementPour(input.type);

  return prisma.$transaction(async (tx) => {
    for (const ligne of input.lignes) {
      const lot = await tx.lotProduit.findFirst({ where: { id: ligne.lotId, produitId: ligne.produitId, produit: { pharmacieId: input.pharmacieId } } });
      if (!lot) throw new AppError(404, `Lot introuvable pour ce produit`);

      if (stockPositif) {
        // Simple incrément : pas de risque de concurrence négative, même principe que
        // vente.service.annuler pour la restitution de stock.
        const majore = await tx.lotProduit.update({ where: { id: lot.id }, data: { quantiteActuelle: { increment: ligne.quantite } } });
        await tx.mouvementStock.create({
          data: {
            produitId: ligne.produitId,
            lotId: lot.id,
            type: typeMouvement,
            quantite: ligne.quantite,
            quantiteAvant: majore.quantiteActuelle - ligne.quantite,
            quantiteApres: majore.quantiteActuelle,
            motif: input.motif,
            utilisateurId: input.utilisateurId,
          },
        });
      } else {
        // Compare-and-swap : même garde que stock.service.ajuster pour ne jamais faire
        // passer un lot en négatif sous concurrence.
        const nouvelleQuantite = lot.quantiteActuelle - ligne.quantite;
        if (nouvelleQuantite < 0) throw new AppError(400, `Quantité insuffisante dans le lot ${lot.numeroLot}`);

        const resultat = await tx.lotProduit.updateMany({
          where: { id: lot.id, quantiteActuelle: lot.quantiteActuelle },
          data: { quantiteActuelle: nouvelleQuantite },
        });
        if (resultat.count === 0) throw new AppError(409, 'Le lot a été modifié entre-temps, réessayez');

        await tx.mouvementStock.create({
          data: {
            produitId: ligne.produitId,
            lotId: lot.id,
            type: typeMouvement,
            quantite: ligne.quantite,
            quantiteAvant: lot.quantiteActuelle,
            quantiteApres: nouvelleQuantite,
            motif: input.motif,
            utilisateurId: input.utilisateurId,
          },
        });
      }
    }

    const dernierNumero = await tx.retour.count({ where: { pharmacieId: input.pharmacieId } });
    const numero = genererNumero('RET', dernierNumero);

    return tx.retour.create({
      data: {
        pharmacieId: input.pharmacieId,
        numero,
        type: input.type,
        venteId: input.venteId || null,
        fournisseurId: input.fournisseurId || null,
        motif: input.motif,
        utilisateurId: input.utilisateurId,
        lignes: { create: input.lignes },
      },
      include: {
        lignes: { include: { produit: { select: { nom: true, dosage: true } }, lot: { select: { numeroLot: true } } } },
        fournisseur: { select: { nom: true } },
        vente: { select: { numero: true } },
        utilisateur: { select: { nom: true, prenom: true } },
      },
    });
  });
}

export async function list(pharmacieId: string, filters: { limit: number; type?: string }) {
  return prisma.retour.findMany({
    where: { pharmacieId, type: filters.type as never },
    include: {
      lignes: { include: { produit: { select: { nom: true } } } },
      fournisseur: { select: { nom: true } },
      vente: { select: { numero: true } },
      utilisateur: { select: { nom: true, prenom: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: filters.limit,
  });
}
