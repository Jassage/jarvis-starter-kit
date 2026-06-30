import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';
import { generateReferenceTransaction } from '../utils/reference';
import { creerEcritureAuto } from './compta.service';

// ─── CRUD taux de change ───────────────────────────────────────────────────────

export async function getTauxActif(devise: string) {
  const taux = await (prisma as any).tauxChange.findFirst({
    where: { devise: devise.toUpperCase(), actif: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!taux) throw new AppError(404, `Aucun taux de change actif pour ${devise}`);
  return taux;
}

export async function listTaux() {
  return (prisma as any).tauxChange.findMany({ orderBy: [{ devise: 'asc' }, { createdAt: 'desc' }] });
}

export async function setTaux(data: { devise: string; tauxAchat: number; tauxVente: number; userId: string }) {
  const taux = await prisma.$transaction(async (tx) => {
    await tx.tauxChange.updateMany({
      where: { devise: data.devise.toUpperCase(), actif: true },
      data: { actif: false },
    });
    return tx.tauxChange.create({
      data: { devise: data.devise.toUpperCase(), tauxAchat: data.tauxAchat, tauxVente: data.tauxVente, actif: true, creeParId: data.userId },
    });
  });
  await createAuditLog({ userId: data.userId, table: 'taux_change', action: 'MISE_A_JOUR', entiteId: taux.id, nouveau: data });
  return taux;
}

// ─── Virement cross-devise HTG <-> USD ─────────────────────────────────────────
// La banque achète les USD du client (client vend USD -> reçoit HTG) ou vend des USD (client achète USD, paye en HTG)
// Sens : compteSource -> compteDestination ; devises différentes -> taux de change appliqué

export async function effectuerVirementCross(data: {
  compteSourceId: string;
  compteDestinationId: string;
  montant: number;
  userId: string;
  sessionId?: string;
}) {
  const { compteSourceId, compteDestinationId, montant, userId, sessionId } = data;

  const [source, dest] = await Promise.all([
    prisma.compte.findUnique({ where: { id: compteSourceId } }),
    prisma.compte.findUnique({ where: { id: compteDestinationId } }),
  ]);

  if (!source) throw new AppError(404, 'Compte source introuvable');
  if (!dest) throw new AppError(404, 'Compte destination introuvable');
  if (source.statut !== 'ACTIF') throw new AppError(400, 'Compte source inactif');
  if (dest.statut !== 'ACTIF') throw new AppError(400, 'Compte destination inactif');
  if (source.devise === dest.devise) throw new AppError(400, 'Utilisez le virement standard pour les comptes de même devise');

  // Déterminer le sens : source HTG / dest USD => client achète USD (banque vend USD, applique tauxVente)
  //                      source USD / dest HTG => client vend USD (banque achète USD, applique tauxAchat)
  const deviseEtrangere = source.devise === 'HTG' ? String(dest.devise) : String(source.devise);
  const taux = await getTauxActif(deviseEtrangere);

  let montantConverti: number;
  if (source.devise === 'HTG') {
    // Client paie en HTG, reçoit devise étrangère (banque vend)
    montantConverti = Math.round((montant / Number(taux.tauxVente)) * 100) / 100;
  } else {
    // Client paie en devise étrangère, reçoit HTG (banque achète)
    montantConverti = Math.round(montant * Number(taux.tauxAchat) * 100) / 100;
  }

  const referenceDebit = await generateReferenceTransaction('VIREMENT_CHANGE');

  return prisma.$transaction(async (tx) => {
    const [sourceInTx, destInTx] = await Promise.all([
      tx.compte.findUnique({ where: { id: compteSourceId }, select: { solde: true, soldeMinimum: true } }),
      tx.compte.findUnique({ where: { id: compteDestinationId }, select: { solde: true } }),
    ]);

    const soldeSource = Number(sourceInTx!.solde);
    const soldeDest = Number(destInTx!.solde);
    const soldeMinSource = Number(sourceInTx!.soldeMinimum);

    const upd = await tx.compte.updateMany({
      where: { id: compteSourceId, solde: { gte: soldeMinSource + montant } },
      data: { solde: { decrement: montant } },
    });
    if (upd.count === 0) throw new AppError(400, `Solde insuffisant sur le compte source (${soldeSource - soldeMinSource} ${source.devise} disponibles)`);

    await tx.compte.update({ where: { id: compteDestinationId }, data: { solde: { increment: montantConverti } } });

    const txDebit = await tx.transaction.create({
      data: {
        reference: referenceDebit,
        type: 'VIREMENT_DEBIT',
        montant,
        devise: source.devise,
        soldeAvant: soldeSource,
        soldeApres: soldeSource - montant,
        motif: `Change ${deviseEtrangere} — taux ${source.devise === 'HTG' ? taux.tauxVente : taux.tauxAchat}`,
        statut: 'VALIDEE',
        compteDebitId: compteSourceId,
        compteCreditId: compteDestinationId,
        sessionId,
        creeParId: userId,
        valideParId: userId,
      },
    });

    await tx.transaction.create({
      data: {
        reference: `${referenceDebit}-CR`,
        type: 'VIREMENT_CREDIT',
        montant: montantConverti,
        devise: dest.devise,
        soldeAvant: soldeDest,
        soldeApres: soldeDest + montantConverti,
        motif: `Change ${deviseEtrangere} — taux ${source.devise === 'HTG' ? taux.tauxVente : taux.tauxAchat}`,
        statut: 'VALIDEE',
        compteDebitId: compteSourceId,
        compteCreditId: compteDestinationId,
        sessionId,
        creeParId: userId,
        valideParId: userId,
      },
    });

    // Écriture comptable : passage par compte de change interne (5800)
    await creerEcritureAuto(tx, {
      debitNumero: '5800',
      creditNumero: '2600',
      montant,
      libelle: `Virement change ${source.devise}->${dest.devise} ref ${referenceDebit}`,
      date: new Date(),
      userId,
      transactionId: txDebit.id,
    });

    await createAuditLog({ userId, table: 'transactions', action: 'VIREMENT_CHANGE', entiteId: txDebit.id, nouveau: { montant, montantConverti, deviseSource: source.devise, deviseDest: dest.devise, tauxId: taux.id } });

    return { transaction: txDebit, montantConverti, taux: { achat: Number(taux.tauxAchat), vente: Number(taux.tauxVente) }, devise: deviseEtrangere };
  });
}
