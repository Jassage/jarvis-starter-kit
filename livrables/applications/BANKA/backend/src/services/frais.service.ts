import prisma from '../utils/prisma';
import { generateReferenceTransaction } from '../utils/reference';
import { creerEcritureAuto } from './compta.service';
import { getConfig } from './configuration.service';
import { AppError } from '../types';

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
            agenceExecutionId: compte.agenceId,
            creeParId: 'SYSTEM',
            valideParId: 'SYSTEM',
          } as any,
        });
        // Compare-and-swap : le solde a pu bouger entre la sélection des comptes éligibles et ce
        // prélèvement (retrait concurrent) — on revérifie et décrémente en une seule requête SQL
        const cas = await tx.compte.updateMany({
          where: { id: compte.id, solde: { gte: montant } },
          data: { solde: { decrement: montant } },
        });
        if (cas.count === 0) throw new Error('Solde devenu insuffisant entre la sélection et le prélèvement');
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

  const compte = await opts.tx.compte.findUnique({ where: { id: opts.compteId }, select: { solde: true, agenceId: true } });
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
      agenceExecutionId: compte?.agenceId,
      creeParId: opts.userId,
      valideParId: opts.userId,
    } as any,
  });

  // Compare-and-swap : garantit que le prélèvement ne fait jamais passer le solde sous zéro
  const cas = await opts.tx.compte.updateMany({
    where: { id: opts.compteId, solde: { gte: montant } },
    data: { solde: { decrement: montant } },
  });
  if (cas.count === 0) throw new AppError(400, 'Solde insuffisant pour prélever les frais de dossier');

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
  soldeMinimum?: number;
}): Promise<number> {
  const tauxConfig = await getConfig('FRAIS_VIREMENT_TAUX');
  const taux = parseFloat(tauxConfig || '0');
  if (taux <= 0) return 0;

  const montantFrais = Math.round(opts.montant * (taux / 100) * 100) / 100;
  if (montantFrais <= 0) return 0;

  const soldeMinimum = opts.soldeMinimum ?? 0;
  const compte = await opts.tx.compte.findUnique({ where: { id: opts.compteSourceId }, select: { solde: true, agenceId: true } });
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
      agenceExecutionId: compte?.agenceId,
      creeParId: opts.userId,
      valideParId: opts.userId,
    } as any,
  });

  // Compare-and-swap : le débit du virement lui-même vient d'être posé juste avant ce prélèvement —
  // le frais ne doit pas faire passer le compte sous son solde minimum
  const cas = await opts.tx.compte.updateMany({
    where: { id: opts.compteSourceId, solde: { gte: soldeMinimum + montantFrais } },
    data: { solde: { decrement: montantFrais } },
  });
  if (cas.count === 0) throw new AppError(400, 'Solde insuffisant pour prélever les frais de virement');

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
