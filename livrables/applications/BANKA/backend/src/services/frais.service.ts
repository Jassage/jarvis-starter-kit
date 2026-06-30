import prisma from '../utils/prisma';
import { generateReferenceTransaction } from '../utils/reference';
import { creerEcritureAuto } from './compta.service';
import { getConfig } from './configuration.service';

// ─── Frais de tenue de compte (job mensuel) ───────────────────────────────────

export async function preleverFraisTenueCompte(): Promise<{ traites: number; erreurs: number }> {
  const montantConfig = await getConfig('FRAIS_TENUE_COMPTE_MENSUEL');
  const montant = parseFloat(montantConfig || '0');
  if (montant <= 0) return { traites: 0, erreurs: 0 };

  const now = new Date();
  const mois = now.toLocaleDateString('fr-HT', { month: 'long', year: 'numeric' });

  // On ne prélève que les comptes courants et épargne actifs avec solde suffisant
  const comptes = await prisma.compte.findMany({
    where: {
      type: { in: ['COURANT', 'EPARGNE', 'MICRO_EPARGNE'] as any },
      statut: 'ACTIF',
      solde: { gte: montant },
    },
  });

  let traites = 0;
  let erreurs = 0;

  for (const compte of comptes) {
    try {
      const reference = await generateReferenceTransaction('FRAIS');
      const soldeAvant = Number(compte.solde);
      const libelle = `Frais de tenue de compte ${mois} — ${compte.numeroCompte}`;

      await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            reference,
            type: 'FRAIS',
            montant,
            devise: compte.devise,
            soldeAvant,
            soldeApres: soldeAvant - montant,
            motif: libelle,
            statut: 'VALIDEE',
            compteDebitId: compte.id,
            creeParId: 'SYSTEM',
            valideParId: 'SYSTEM',
          } as any,
        });
        await tx.compte.update({ where: { id: compte.id }, data: { solde: { decrement: montant } } });
        await creerEcritureAuto(tx, {
          debitNumero:  '2600',
          creditNumero: '7020',
          montant,
          libelle,
          date: now,
          userId: 'SYSTEM',
          transactionId: transaction.id,
        });
      });
      traites++;
    } catch { erreurs++; }
  }

  console.log(`[FRAIS] Tenue de compte : ${traites} compte(s), ${erreurs} erreur(s)`);
  return { traites, erreurs };
}

// ─── Frais de dossier prêt (prélevés au décaissement) ────────────────────────

export async function preleverFraisDossierPret(opts: {
  pretId: string;
  compteId: string;
  montantPret: number;
  devise: string;
  userId: string;
  tx: any;
}): Promise<number> {
  const tauxConfig = await getConfig('FRAIS_DOSSIER_PRET_TAUX');
  const taux = parseFloat(tauxConfig || '0');
  if (taux <= 0) return 0;

  const montant = Math.round(opts.montantPret * (taux / 100) * 100) / 100;
  if (montant <= 0) return 0;

  const compte = await opts.tx.compte.findUnique({ where: { id: opts.compteId }, select: { solde: true } });
  const soldeAvant = Number(compte?.solde || 0);
  const reference = await generateReferenceTransaction('FRAIS');
  const libelle = `Frais de dossier prêt — ${taux}%`;

  const transaction = await opts.tx.transaction.create({
    data: {
      reference,
      type: 'FRAIS',
      montant,
      devise: opts.devise as any,
      soldeAvant,
      soldeApres: soldeAvant - montant,
      motif: libelle,
      statut: 'VALIDEE',
      compteDebitId: opts.compteId,
      creeParId: opts.userId,
      valideParId: opts.userId,
    } as any,
  });

  await opts.tx.compte.update({ where: { id: opts.compteId }, data: { solde: { decrement: montant } } });

  await creerEcritureAuto(opts.tx, {
    debitNumero:  '2600',
    creditNumero: '7020',
    montant,
    libelle,
    date: new Date(),
    userId: opts.userId,
    transactionId: transaction.id,
  });

  return montant;
}

// ─── Frais de virement (prélevés à l'opération) ──────────────────────────────

export async function preleverFraisVirement(opts: {
  compteSourceId: string;
  montant: number;
  devise: string;
  userId: string;
  tx: any;
}): Promise<number> {
  const tauxConfig = await getConfig('FRAIS_VIREMENT_TAUX');
  const taux = parseFloat(tauxConfig || '0');
  if (taux <= 0) return 0;

  const montantFrais = Math.round(opts.montant * (taux / 100) * 100) / 100;
  if (montantFrais <= 0) return 0;

  const compte = await opts.tx.compte.findUnique({ where: { id: opts.compteSourceId }, select: { solde: true } });
  const soldeAvant = Number(compte?.solde || 0);
  const reference = await generateReferenceTransaction('FRAIS');
  const libelle = `Frais de virement — ${taux}%`;

  const transaction = await opts.tx.transaction.create({
    data: {
      reference,
      type: 'FRAIS',
      montant: montantFrais,
      devise: opts.devise as any,
      soldeAvant,
      soldeApres: soldeAvant - montantFrais,
      motif: libelle,
      statut: 'VALIDEE',
      compteDebitId: opts.compteSourceId,
      creeParId: opts.userId,
      valideParId: opts.userId,
    } as any,
  });

  await opts.tx.compte.update({ where: { id: opts.compteSourceId }, data: { solde: { decrement: montantFrais } } });

  await creerEcritureAuto(opts.tx, {
    debitNumero:  '2600',
    creditNumero: '7020',
    montant: montantFrais,
    libelle,
    date: new Date(),
    userId: opts.userId,
    transactionId: transaction.id,
  });

  return montantFrais;
}
