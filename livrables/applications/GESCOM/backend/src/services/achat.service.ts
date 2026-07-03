import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';
import { Prisma } from '@prisma/client';

async function genNumeroCommande(): Promise<string> {
  const count = await prisma.commandeFournisseur.count();
  return `CMD-${String(count + 1).padStart(6, '0')}`;
}

export async function createCommande(
  data: {
    fournisseurId: string;
    emplacementId: string;
    notes?: string;
    dateLivraisonPrevue?: string;
    lignes: { produitId: string; quantiteCommandee: number; prixUnitaireAchat: number }[];
  },
  userId: string
) {
  const numero = await genNumeroCommande();
  const commande = await prisma.commandeFournisseur.create({
    data: {
      numero,
      fournisseurId: data.fournisseurId,
      emplacementId: data.emplacementId,
      userId,
      statut: 'BROUILLON',
      notes: data.notes,
      dateLivraisonPrevue: data.dateLivraisonPrevue ? new Date(data.dateLivraisonPrevue) : undefined,
      lignes: {
        create: data.lignes.map((l) => ({
          produitId: l.produitId,
          quantiteCommandee: l.quantiteCommandee,
          quantiteRecue: 0,
          prixUnitaireAchat: new Prisma.Decimal(l.prixUnitaireAchat),
        })),
      },
    },
    include: { lignes: { include: { produit: { select: { nom: true } } } } },
  });
  await createAuditLog({ userId, table: 'commandes_fournisseur', action: 'CREATE', entiteId: commande.id, nouveau: { numero } });
  return commande;
}

export async function listCommandes(params: { emplacementId?: string; statut?: string }) {
  const where: any = {};
  if (params.emplacementId) where.emplacementId = params.emplacementId;
  if (params.statut) where.statut = params.statut;
  return prisma.commandeFournisseur.findMany({
    where,
    include: {
      fournisseur: { select: { id: true, nom: true } },
      emplacement: { select: { id: true, nom: true, type: true } },
      utilisateur: { select: { nom: true, prenom: true } },
      lignes: { include: { produit: { select: { nom: true, reference: true, unite: true } } } },
    },
    orderBy: { dateCommande: 'desc' },
    take: 100,
  });
}

export async function envoyerCommande(id: string, userId: string) {
  const commande = await prisma.commandeFournisseur.findUnique({ where: { id } });
  if (!commande) throw new AppError(404, 'Commande introuvable');
  if (commande.statut !== 'BROUILLON') throw new AppError(400, 'Seule une commande en brouillon peut être envoyée');
  const updated = await prisma.commandeFournisseur.update({ where: { id }, data: { statut: 'ENVOYEE' } });
  await createAuditLog({ userId, table: 'commandes_fournisseur', action: 'ENVOYER', entiteId: id });
  return updated;
}

export async function recevoirCommande(
  id: string,
  lignesReception: { ligneId: string; quantiteRecue: number }[],
  userId: string
) {
  const commande = await prisma.commandeFournisseur.findUnique({
    where: { id },
    include: { lignes: { include: { produit: true } } },
  });
  if (!commande) throw new AppError(404, 'Commande introuvable');
  if (['RECUE', 'ANNULEE'].includes(commande.statut)) {
    throw new AppError(400, 'Cette commande est déjà reçue ou annulée');
  }

  await prisma.$transaction(async (tx) => {
    for (const reception of lignesReception) {
      const ligne = commande.lignes.find((l) => l.id === reception.ligneId);
      if (!ligne) continue;
      const maxRecevable = ligne.quantiteCommandee - ligne.quantiteRecue;
      const qteARecevoir = Math.min(reception.quantiteRecue, maxRecevable);
      if (qteARecevoir <= 0) continue;

      // Incrémenter stock
      await tx.stockEmplacement.upsert({
        where: { produitId_emplacementId: { produitId: ligne.produitId, emplacementId: commande.emplacementId } },
        update: { quantite: { increment: qteARecevoir } },
        create: { produitId: ligne.produitId, emplacementId: commande.emplacementId, quantite: qteARecevoir },
      });

      // Créer mouvement ENTREE
      await tx.mouvementStock.create({
        data: {
          produitId: ligne.produitId,
          emplacementId: commande.emplacementId,
          userId,
          type: 'ENTREE',
          quantite: qteARecevoir,
          raison: `Réception commande ${commande.numero}`,
          referenceType: 'COMMANDE',
          referenceId: commande.id,
        },
      });

      // Recalcul CUMP (Coût Unitaire Moyen Pondéré) global par produit
      const stockTotal = await tx.stockEmplacement.aggregate({
        where: { produitId: ligne.produitId },
        _sum: { quantite: true },
      });
      const stockAvant = (stockTotal._sum.quantite ?? 0) - qteARecevoir;
      const ancienCump = Number(ligne.produit.prixAchatMoyen);
      const prixAchat = Number(ligne.prixUnitaireAchat);
      const nouveauCump = stockAvant <= 0
        ? prixAchat
        : (stockAvant * ancienCump + qteARecevoir * prixAchat) / (stockAvant + qteARecevoir);

      await tx.produit.update({
        where: { id: ligne.produitId },
        data: { prixAchatMoyen: new Prisma.Decimal(Math.round(nouveauCump * 100) / 100) },
      });

      // Mettre à jour quantiteRecue sur la ligne
      await tx.ligneCommande.update({
        where: { id: ligne.id },
        data: { quantiteRecue: { increment: qteARecevoir } },
      });
    }

    // Calculer nouveau statut
    const lignesMaj = await tx.ligneCommande.findMany({ where: { commandeId: id } });
    const toutRecu = lignesMaj.every((l) => l.quantiteRecue >= l.quantiteCommandee);
    const partielRecu = lignesMaj.some((l) => l.quantiteRecue > 0);

    const nouveauStatut = toutRecu ? 'RECUE' : partielRecu ? 'RECUE_PARTIELLE' : commande.statut as 'ENVOYEE';
    await tx.commandeFournisseur.update({ where: { id }, data: { statut: nouveauStatut } });

    // Écriture comptable : Débit Stock(355) → Crédit Fournisseurs(401)
    const totalRecu = lignesReception.reduce((sum, r) => {
      const ligne = commande.lignes.find((l) => l.id === r.ligneId);
      return sum + (ligne ? Math.min(r.quantiteRecue, ligne.quantiteCommandee - ligne.quantiteRecue) * Number(ligne.prixUnitaireAchat) : 0);
    }, 0);

    if (totalRecu > 0) {
      try {
        const [compteStock, compteFournisseur] = await Promise.all([
          tx.compteComptable.findUnique({ where: { numero: '355' } }),
          tx.compteComptable.findUnique({ where: { numero: '401' } }),
        ]);
        if (!compteStock || !compteFournisseur) throw new Error('Compte introuvable');
        await tx.ecritureComptable.create({
          data: {
            compteDebitId: compteStock.id,
            compteCreditId: compteFournisseur.id,
            montant: new Prisma.Decimal(totalRecu),
            libelle: `Réception ${commande.numero}`,
            userId,
            referenceType: 'COMMANDE',
            referenceId: id,
          },
        });
      } catch (err) {
        // L'opération d'achat ne doit pas être bloquée par une erreur comptable,
        // mais l'échec est tracé pour réconciliation manuelle par le comptable.
        await tx.ecritureEchec.create({
          data: {
            compteDebitNumero: '355',
            compteCreditNumero: '401',
            montant: new Prisma.Decimal(totalRecu),
            libelle: `Réception ${commande.numero}`,
            erreur: err instanceof Error ? err.message : String(err),
            referenceType: 'COMMANDE',
            referenceId: id,
          },
        });
      }
    }
  });

  await createAuditLog({ userId, table: 'commandes_fournisseur', action: 'RECEPTION', entiteId: id });
}

export async function annulerCommande(id: string, userId: string) {
  const commande = await prisma.commandeFournisseur.findUnique({ where: { id } });
  if (!commande) throw new AppError(404, 'Commande introuvable');
  if (['RECUE', 'ANNULEE'].includes(commande.statut)) {
    throw new AppError(400, 'Impossible d\'annuler une commande reçue ou déjà annulée');
  }
  if (commande.statut === 'RECUE_PARTIELLE') {
    throw new AppError(400, 'Commande partiellement reçue — clôturez la réception avant d\'annuler');
  }
  await prisma.commandeFournisseur.update({ where: { id }, data: { statut: 'ANNULEE' } });
  await createAuditLog({ userId, table: 'commandes_fournisseur', action: 'ANNULER', entiteId: id });
}
