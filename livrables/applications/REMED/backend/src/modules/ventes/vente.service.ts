import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';
import { genererNumero } from '../../utils/numero';

type Tx = Prisma.TransactionClient;

interface LigneInput {
  produitId: string;
  quantite: number;
}

interface PaiementInput {
  mode: string;
  montant: number;
}

interface OrdonnanceInput {
  medecinNom: string;
  patientNom: string;
  patientTelephone?: string;
  dateEmission: Date;
}

interface CreerVenteInput {
  pharmacieId: string;
  caissierId: string;
  clientId?: string;
  lignes: LigneInput[];
  remise: number;
  paiements: PaiementInput[];
  // Deux façons mutuellement exclusives de couvrir une vente nécessitant ordonnance (Phase 3) :
  // référencer une ordonnance déjà enregistrée (service partiel possible sur plusieurs visites),
  // ou en créer une nouvelle à la volée, entièrement servie dans la foulée (cas le plus courant
  // au comptoir, UX inchangée depuis la Phase 1).
  ordonnanceId?: string;
  ordonnance?: OrdonnanceInput;
}

const EPSILON = 0.01;

// Consomme un lot en FEFO (First-Expired-First-Out) pour un produit et une quantité donnés.
// Peut produire plusieurs lignes de vente si la quantité dépasse un seul lot — chaque lot
// consommé est protégé par compare-and-swap, même pattern que stock.service.ajuster.
async function consommerFefo(
  tx: Tx,
  produitId: string,
  quantiteDemandee: number,
  prixUnitaire: Prisma.Decimal | number,
  utilisateurId: string
): Promise<{ lotId: string; quantite: number; prixUnitaire: Prisma.Decimal | number }[]> {
  const lots = await tx.lotProduit.findMany({
    where: { produitId, quantiteActuelle: { gt: 0 } },
    orderBy: { dateExpiration: 'asc' },
  });

  let restant = quantiteDemandee;
  const consommations: { lotId: string; quantite: number; prixUnitaire: Prisma.Decimal | number }[] = [];

  for (const lot of lots) {
    if (restant <= 0) break;
    const pris = Math.min(restant, lot.quantiteActuelle);
    const nouvelleQuantite = lot.quantiteActuelle - pris;

    const resultat = await tx.lotProduit.updateMany({
      where: { id: lot.id, quantiteActuelle: lot.quantiteActuelle },
      data: { quantiteActuelle: nouvelleQuantite },
    });
    if (resultat.count === 0) {
      // Le lot a été modifié entre-temps par une vente concurrente : on relit et retente au tour suivant.
      continue;
    }

    await tx.mouvementStock.create({
      data: {
        produitId,
        lotId: lot.id,
        type: 'SORTIE_VENTE',
        quantite: pris,
        quantiteAvant: lot.quantiteActuelle,
        quantiteApres: nouvelleQuantite,
        utilisateurId,
      },
    });

    consommations.push({ lotId: lot.id, quantite: pris, prixUnitaire });
    restant -= pris;
  }

  if (restant > 0) {
    throw new AppError(409, 'Stock insuffisant');
  }

  return consommations;
}

export async function creer(input: CreerVenteInput) {
  const caisseSession = await prisma.caisseSession.findFirst({
    where: { pharmacieId: input.pharmacieId, statut: 'OUVERTE' },
  });
  if (!caisseSession) throw new AppError(400, 'Aucune session de caisse ouverte. Ouvrez la caisse avant de vendre.');

  if (input.clientId) {
    const client = await prisma.client.findFirst({ where: { id: input.clientId, pharmacieId: input.pharmacieId } });
    if (!client) throw new AppError(404, 'Client introuvable');
  }

  return prisma.$transaction(async (tx) => {
    let sousTotal = 0;
    let ordonnanceRequise = false;
    const lignesACreer: { produitId: string; lotId: string; quantite: number; prixUnitaire: number }[] = [];
    // Quantité totale demandée par produit nécessitant ordonnance, à la granularité du panier
    // (avant l'éventuel éclatement FEFO sur plusieurs lots) — c'est ce qui doit être comparé au
    // reste prescrit, pas les lignes de lot individuelles.
    const produitsOrdonnance: Record<string, { nom: string; quantite: number }> = {};

    for (const ligne of input.lignes) {
      const produit = await tx.produit.findFirst({ where: { id: ligne.produitId, pharmacieId: input.pharmacieId, actif: true } });
      if (!produit) throw new AppError(404, `Produit introuvable`);

      if (produit.necessiteOrdonnance) {
        ordonnanceRequise = true;
        produitsOrdonnance[produit.id] = {
          nom: `${produit.nom}${produit.dosage ? ` ${produit.dosage}` : ''}`,
          quantite: (produitsOrdonnance[produit.id]?.quantite || 0) + ligne.quantite,
        };
      }

      const prixVente = Number(produit.prixVente);
      const consommations = await consommerFefo(tx, produit.id, ligne.quantite, prixVente, input.caissierId);

      for (const c of consommations) {
        lignesACreer.push({ produitId: produit.id, lotId: c.lotId, quantite: c.quantite, prixUnitaire: prixVente });
      }
      sousTotal += ligne.quantite * prixVente;
    }

    if (ordonnanceRequise && !input.ordonnanceId && !input.ordonnance) {
      throw new AppError(400, 'Une ordonnance est requise : au moins un produit de cette vente nécessite une prescription médicale');
    }

    let ordonnanceIdFinal: string | null = null;

    if (ordonnanceRequise && input.ordonnanceId) {
      // Ordonnance déjà enregistrée : vérifie que chaque produit concerné y est bien prescrit et
      // que le reste à servir suffit, avant de rien écrire (pas de délivrance partielle acceptée
      // puis rejetée à mi-chemin).
      const ordonnance = await tx.ordonnance.findFirst({
        where: { id: input.ordonnanceId, pharmacieId: input.pharmacieId },
        include: { items: true },
      });
      if (!ordonnance) throw new AppError(404, 'Ordonnance introuvable');
      if (ordonnance.statut === 'ANNULEE') throw new AppError(400, 'Cette ordonnance est annulée');

      for (const [produitId, { nom, quantite }] of Object.entries(produitsOrdonnance)) {
        const item = ordonnance.items.find((i) => i.produitId === produitId);
        if (!item) throw new AppError(400, `${nom} n'est pas prescrit sur l'ordonnance sélectionnée`);
        const reste = item.quantitePrescrite - item.quantiteServie;
        if (quantite > reste) {
          throw new AppError(400, `Quantité demandée pour ${nom} (${quantite}) supérieure au reste prescrit (${reste})`);
        }
      }

      for (const [produitId, { quantite }] of Object.entries(produitsOrdonnance)) {
        const item = ordonnance.items.find((i) => i.produitId === produitId)!;
        await tx.prescriptionItem.update({ where: { id: item.id }, data: { quantiteServie: { increment: quantite } } });
      }

      const itemsAJour = await tx.prescriptionItem.findMany({ where: { ordonnanceId: ordonnance.id } });
      const complete = itemsAJour.every((i) => i.quantiteServie >= i.quantitePrescrite);
      const partielle = itemsAJour.some((i) => i.quantiteServie > 0);
      await tx.ordonnance.update({
        where: { id: ordonnance.id },
        data: { statut: complete ? 'SERVIE' : partielle ? 'PARTIELLEMENT_SERVIE' : ordonnance.statut },
      });

      ordonnanceIdFinal = ordonnance.id;
    } else if (ordonnanceRequise && input.ordonnance) {
      // Création à la volée, comme en Phase 1 : entièrement servie dans la foulée puisque le
      // patient repart avec ses médicaments immédiatement.
      const dernierNumeroOrdonnance = await tx.ordonnance.count({ where: { pharmacieId: input.pharmacieId } });
      const nouvelleOrdonnance = await tx.ordonnance.create({
        data: {
          pharmacieId: input.pharmacieId,
          numero: genererNumero('ORD', dernierNumeroOrdonnance),
          medecinNom: input.ordonnance.medecinNom,
          patientNom: input.ordonnance.patientNom,
          patientTelephone: input.ordonnance.patientTelephone,
          clientId: input.clientId || null,
          dateEmission: input.ordonnance.dateEmission,
          statut: 'SERVIE',
          items: {
            create: Object.entries(produitsOrdonnance).map(([produitId, { nom, quantite }]) => ({
              produitId,
              medicamentNom: nom,
              quantitePrescrite: quantite,
              quantiteServie: quantite,
            })),
          },
        },
      });
      ordonnanceIdFinal = nouvelleOrdonnance.id;
    }

    if (input.remise > sousTotal) throw new AppError(400, 'La remise ne peut pas dépasser le sous-total');
    const montantTotal = sousTotal - input.remise;

    const totalPaiements = input.paiements.reduce((s, p) => s + p.montant, 0);
    if (Math.abs(totalPaiements - montantTotal) > EPSILON) {
      throw new AppError(400, `Le total des paiements (${totalPaiements}) ne correspond pas au montant de la vente (${montantTotal})`);
    }

    const dernierNumero = await tx.vente.count({ where: { pharmacieId: input.pharmacieId } });
    const numero = genererNumero('VTE', dernierNumero);

    const vente = await tx.vente.create({
      data: {
        pharmacieId: input.pharmacieId,
        numero,
        caisseSessionId: caisseSession.id,
        caissierId: input.caissierId,
        clientId: input.clientId || null,
        ordonnanceId: ordonnanceIdFinal,
        sousTotal,
        remise: input.remise,
        montantTotal,
        lignes: { create: lignesACreer },
        paiements: { create: input.paiements.map((p) => ({ mode: p.mode as never, montant: p.montant })) },
      },
      include: {
        lignes: { include: { produit: true, lot: true } },
        paiements: true,
        client: true,
        ordonnance: { include: { items: true } },
      },
    });

    const montantEspeces = input.paiements.filter((p) => p.mode === 'ESPECES').reduce((s, p) => s + p.montant, 0);
    if (montantEspeces > 0) {
      await tx.caisseTransaction.create({
        data: {
          caisseSessionId: caisseSession.id,
          type: 'VENTE',
          montant: montantEspeces,
          venteId: vente.id,
          utilisateurId: input.caissierId,
        },
      });
    }

    return vente;
  });
}

export async function list(pharmacieId: string, filters: { limit: number; clientId?: string; statut?: string }) {
  return prisma.vente.findMany({
    where: { pharmacieId, clientId: filters.clientId, statut: filters.statut as never },
    include: {
      caissier: { select: { nom: true, prenom: true } },
      client: { select: { nom: true, prenom: true } },
      lignes: { include: { produit: { select: { nom: true } } } },
      paiements: true,
      ordonnance: { include: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: filters.limit,
  });
}

export async function getById(pharmacieId: string, id: string) {
  const vente = await prisma.vente.findFirst({
    where: { id, pharmacieId },
    include: {
      caissier: { select: { nom: true, prenom: true } },
      client: true,
      lignes: { include: { produit: true, lot: true } },
      paiements: true,
      ordonnance: { include: { items: true } },
    },
  });
  if (!vente) throw new AppError(404, 'Vente introuvable');
  return vente;
}

export async function annuler(pharmacieId: string, id: string, utilisateurId: string, motif: string) {
  return prisma.$transaction(async (tx) => {
    const vente = await tx.vente.findFirst({
      where: { id, pharmacieId },
      include: { lignes: true, paiements: true },
    });
    if (!vente) throw new AppError(404, 'Vente introuvable');
    if (vente.statut === 'ANNULEE') throw new AppError(400, 'Cette vente est déjà annulée');

    for (const ligne of vente.lignes) {
      const lot = await tx.lotProduit.update({
        where: { id: ligne.lotId },
        data: { quantiteActuelle: { increment: ligne.quantite } },
      });

      await tx.mouvementStock.create({
        data: {
          produitId: ligne.produitId,
          lotId: ligne.lotId,
          type: 'ANNULATION_VENTE',
          quantite: ligne.quantite,
          quantiteAvant: lot.quantiteActuelle - ligne.quantite,
          quantiteApres: lot.quantiteActuelle,
          motif: `Annulation vente ${vente.numero} : ${motif}`,
          utilisateurId,
        },
      });
    }

    // Si la vente était rattachée à une ordonnance, la délivrance est défaite symétriquement :
    // sinon l'ordonnance resterait marquée SERVIE/PARTIELLEMENT_SERVIE alors que les médicaments
    // viennent de retourner en stock, bloquant à tort un futur service légitime.
    if (vente.ordonnanceId) {
      const ordonnance = await tx.ordonnance.findUnique({ where: { id: vente.ordonnanceId }, include: { items: true } });
      if (ordonnance) {
        const quantitesParProduit: Record<string, number> = {};
        for (const ligne of vente.lignes) {
          quantitesParProduit[ligne.produitId] = (quantitesParProduit[ligne.produitId] || 0) + ligne.quantite;
        }
        for (const [produitId, quantite] of Object.entries(quantitesParProduit)) {
          const item = ordonnance.items.find((i) => i.produitId === produitId);
          if (item) {
            await tx.prescriptionItem.update({
              where: { id: item.id },
              data: { quantiteServie: { decrement: Math.min(quantite, item.quantiteServie) } },
            });
          }
        }
        const itemsAJour = await tx.prescriptionItem.findMany({ where: { ordonnanceId: ordonnance.id } });
        const complete = itemsAJour.every((i) => i.quantiteServie >= i.quantitePrescrite);
        const partielle = itemsAJour.some((i) => i.quantiteServie > 0);
        await tx.ordonnance.update({
          where: { id: ordonnance.id },
          data: { statut: complete ? 'SERVIE' : partielle ? 'PARTIELLEMENT_SERVIE' : 'ENREGISTREE' },
        });
      }
    }

    const montantEspeces = vente.paiements.filter((p) => p.mode === 'ESPECES').reduce((s, p) => s + Number(p.montant), 0);
    if (montantEspeces > 0) {
      await tx.caisseTransaction.create({
        data: {
          caisseSessionId: vente.caisseSessionId,
          type: 'SORTIE_MANUELLE',
          montant: montantEspeces,
          motif: `Remboursement annulation vente ${vente.numero}`,
          venteId: vente.id,
          utilisateurId,
        },
      });
    }

    return tx.vente.update({
      where: { id },
      data: { statut: 'ANNULEE', annuleeParId: utilisateurId, annuleeLe: new Date(), motifAnnulation: motif },
    });
  });
}
