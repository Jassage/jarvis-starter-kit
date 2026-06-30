import prisma from '../utils/prisma';
import { generateReferenceTransaction } from '../utils/reference';
import { createAuditLog } from '../utils/audit';
import { creerEcritureAuto } from './compta.service';

const TYPES_INTERETS = ['EPARGNE', 'TERME', 'RETRAITE', 'JEUNESSE', 'MICRO_EPARGNE', 'TONTINE'] as const;

export async function crediterInteretsMensuels(): Promise<{ traites: number; erreurs: number; details: string[] }> {
  const now = new Date();
  // Nombre de jours du mois en cours pour le calcul pro-rata
  const joursAnnee = 365;
  const jours = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const comptes = await prisma.compte.findMany({
    where: {
      type: { in: TYPES_INTERETS as any },
      statut: 'ACTIF',
      tauxInteret: { not: null, gt: 0 },
      solde: { gt: 0 },
    },
    include: { client: { select: { nom: true, prenom: true, raisonSociale: true } } },
  });

  let traites = 0;
  let erreurs = 0;
  const details: string[] = [];

  for (const compte of comptes) {
    try {
      const solde = Number(compte.solde);
      const taux = Number(compte.tauxInteret);
      // Intérêt mensuel = solde × taux annuel × (jours du mois / jours de l'année)
      const montantInteret = Math.round(solde * taux * (jours / joursAnnee) * 100) / 100;
      if (montantInteret <= 0) continue;

      const reference = await generateReferenceTransaction('INTERET');
      const soldeAvant = solde;
      const soldeApres = solde + montantInteret;
      const libelle = `Intérêts ${now.toLocaleDateString('fr-HT', { month: 'long', year: 'numeric' })} — ${compte.numeroCompte}`;

      await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            reference,
            type: 'INTERET',
            montant: montantInteret,
            devise: compte.devise,
            soldeAvant,
            soldeApres,
            motif: libelle,
            statut: 'VALIDEE',
            compteCreditId: compte.id,
            creeParId: 'SYSTEM',
            valideParId: 'SYSTEM',
          } as any,
        });

        await tx.compte.update({
          where: { id: compte.id },
          data: { solde: { increment: montantInteret } },
        });

        await creerEcritureAuto(tx, {
          debitNumero:  '7100',
          creditNumero: '2600',
          montant: montantInteret,
          libelle,
          date: now,
          userId: 'SYSTEM',
          transactionId: transaction.id,
        });
      });

      traites++;
    } catch (err) {
      erreurs++;
      details.push(`Compte ${compte.numeroCompte} : ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (traites > 0 || erreurs > 0) {
    console.log(`[INTÉRÊTS] ${traites} compte(s) crédité(s), ${erreurs} erreur(s)`);
  }
  return { traites, erreurs, details };
}

export async function getHistoriqueInterets(compteId: string, opts: { from?: Date; to?: Date; page?: number; limit?: number }) {
  const { from, to, page = 1, limit = 30 } = opts;
  const skip = (page - 1) * limit;
  const where: any = {
    compteCreditId: compteId,
    type: 'INTERET',
    statut: 'VALIDEE',
  };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }
  const [total, items] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}
