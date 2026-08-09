import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';
import { assertOwnEmplacement } from '../middleware/emplacementScope';
import { genererNumeroSequence } from '../utils/numero';
import { Prisma } from '@prisma/client';

type RequestingUser = { role: string; emplacementId?: string | null };

async function resolveCompteId(numero: string): Promise<string | null> {
  const compte = await prisma.compteComptable.findUnique({ where: { numero } });
  return compte?.id ?? null;
}

export async function createRetour(
  venteId: string,
  data: { motif?: string; lignes: { ligneVenteId: string; quantite: number }[] },
  userId: string,
  requestingUser?: RequestingUser
) {
  if (data.lignes.length === 0) throw new AppError(400, 'Sélectionnez au moins une ligne à retourner');

  const vente = await prisma.vente.findUnique({
    where: { id: venteId },
    include: { lignes: { include: { retours: true } } },
  });
  if (!vente) throw new AppError(404, 'Vente introuvable');
  assertOwnEmplacement(requestingUser, vente.emplacementId);
  if (vente.statut !== 'VALIDEE') throw new AppError(400, 'Seule une vente validée peut faire l\'objet d\'un retour');

  const numero = await genererNumeroSequence('retour_numero_seq', 'AVR');

  const lignesAValider: { ligneVenteId: string; quantite: number; prixUnitaire: number; produitId: string; montantLigne: number }[] = [];

  for (const demande of data.lignes) {
    if (demande.quantite <= 0) throw new AppError(400, 'La quantité retournée doit être positive');
    const ligne = vente.lignes.find((l) => l.id === demande.ligneVenteId);
    if (!ligne) throw new AppError(400, `Ligne de vente introuvable (${demande.ligneVenteId})`);

    const dejaRetourne = ligne.retours.reduce((sum, r) => sum + r.quantite, 0);
    const maxRetournable = ligne.quantite - dejaRetourne;
    if (demande.quantite > maxRetournable) {
      throw new AppError(400, `Quantité retournée (${demande.quantite}) supérieure à la quantité encore retournable (${maxRetournable})`);
    }

    lignesAValider.push({
      ligneVenteId: ligne.id,
      quantite: demande.quantite,
      prixUnitaire: Number(ligne.prixUnitaire),
      produitId: ligne.produitId,
      montantLigne: demande.quantite * Number(ligne.prixUnitaire),
    });
  }

  const montantTotal = lignesAValider.reduce((sum, l) => sum + l.montantLigne, 0);

  const retour = await prisma.$transaction(async (tx) => {
    const retourCree = await tx.retourVente.create({
      data: {
        numero,
        venteId,
        userId,
        motif: data.motif,
        montantTotal: new Prisma.Decimal(montantTotal),
        lignes: {
          create: lignesAValider.map((l) => ({
            ligneVenteId: l.ligneVenteId,
            quantite: l.quantite,
            montantLigne: new Prisma.Decimal(l.montantLigne),
          })),
        },
      },
    });

    // Restitution du stock à l'emplacement de la vente d'origine
    for (const l of lignesAValider) {
      await tx.stockEmplacement.update({
        where: { produitId_emplacementId: { produitId: l.produitId, emplacementId: vente.emplacementId } },
        data: { quantite: { increment: l.quantite } },
      });
      await tx.mouvementStock.create({
        data: {
          produitId: l.produitId,
          emplacementId: vente.emplacementId,
          userId,
          type: 'AJUSTEMENT',
          quantite: l.quantite,
          raison: `Retour ${numero} sur vente ${vente.numero}`,
          referenceType: 'RETOUR_VENTE',
          referenceId: retourCree.id,
        },
      });
    }

    // Réduction du solde dû client si la vente d'origine était à crédit
    if (vente.modePaiement === 'CREDIT' && vente.clientId) {
      const client = await tx.client.findUnique({ where: { id: vente.clientId } });
      if (client) {
        const reduction = Math.min(montantTotal, Number(client.soldeDu));
        if (reduction > 0) {
          await tx.client.update({
            where: { id: vente.clientId },
            data: { soldeDu: { decrement: new Prisma.Decimal(reduction) } },
          });
        }
      }
    }

    // Écriture comptable inverse de la vente d'origine (fire-and-forget, cf. vente.service.ts)
    try {
      const compteVentesId = await resolveCompteId('701');
      const compteContrepartieId = vente.modePaiement === 'CREDIT'
        ? await resolveCompteId('411')
        : await resolveCompteId('571');

      if (compteVentesId && compteContrepartieId) {
        await tx.ecritureComptable.create({
          data: {
            compteDebitId: compteVentesId,
            compteCreditId: compteContrepartieId,
            montant: new Prisma.Decimal(montantTotal),
            libelle: `Retour ${numero} sur vente ${vente.numero}`,
            userId,
            referenceType: 'RETOUR_VENTE',
            referenceId: retourCree.id,
          },
        });
      }
    } catch {
      await tx.ecritureEchec.create({
        data: {
          compteDebitNumero: '701',
          compteCreditNumero: vente.modePaiement === 'CREDIT' ? '411' : '571',
          montant: new Prisma.Decimal(montantTotal),
          libelle: `Retour ${numero} sur vente ${vente.numero}`,
          erreur: 'Compte introuvable',
          referenceType: 'RETOUR_VENTE',
          referenceId: retourCree.id,
        },
      });
    }

    return retourCree;
  });

  await createAuditLog({ userId, table: 'retours_vente', action: 'CREATE', entiteId: retour.id, nouveau: { venteId, numero, montantTotal } });
  return retour;
}

export async function listRetours(venteId: string, requestingUser?: RequestingUser) {
  const vente = await prisma.vente.findUnique({ where: { id: venteId }, select: { emplacementId: true } });
  if (!vente) throw new AppError(404, 'Vente introuvable');
  assertOwnEmplacement(requestingUser, vente.emplacementId);
  return prisma.retourVente.findMany({
    where: { venteId },
    include: {
      utilisateur: { select: { nom: true, prenom: true } },
      lignes: {
        include: { ligneVente: { include: { produit: { select: { nom: true, reference: true, unite: true } } } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
