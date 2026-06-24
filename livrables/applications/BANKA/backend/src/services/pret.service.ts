import prisma from '../utils/prisma';
import { generateReferencePret, generateReferenceTransaction } from '../utils/reference';
import { AppError } from '../types';
import { TypeAmortissement, Devise } from '@prisma/client';
import { calculerTableau } from '../utils/amortissement';
import { createAuditLog } from '../utils/audit';
import { getConfig } from './configuration.service';

export async function listPrets(opts: {
  clientId?: string;
  agenceId?: string;
  statut?: string;
  page?: number;
  limit?: number;
}) {
  const { clientId, agenceId, statut, page = 1, limit = 20 } = opts;
  const skip = (page - 1) * limit;
  const where: any = {};
  if (clientId) where.clientId = clientId;
  if (agenceId) where.agenceId = agenceId;
  if (statut) where.statut = statut;

  const [total, items] = await Promise.all([
    prisma.pret.count({ where }),
    prisma.pret.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, numeroClient: true, nom: true, prenom: true, raisonSociale: true, type: true } },
        agence: { select: { id: true, code: true, nom: true } },
        agentCredit: { select: { nom: true, prenom: true } },
      },
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getPret(id: string) {
  const pret = await prisma.pret.findUnique({
    where: { id },
    include: {
      client: true,
      agence: true,
      agentCredit: { select: { nom: true, prenom: true, role: true } },
      validateur: { select: { nom: true, prenom: true, role: true } },
      lignes: { orderBy: { numeroEcheance: 'asc' } },
      remboursements: {
        orderBy: { date: 'desc' },
        include: { creePar: { select: { nom: true, prenom: true } } },
      },
    },
  });
  if (!pret) throw new AppError(404, 'Prêt introuvable');
  return pret;
}

export async function creerPret(data: {
  clientId: string;
  agenceId: string;
  montant: number;
  tauxMensuel: number;
  dureeMois: number;
  typeAmortissement?: TypeAmortissement;
  devise?: Devise;
  objet?: string;
  notes?: string;
  userId: string;
}) {
  const { clientId, agenceId, montant, tauxMensuel, dureeMois, typeAmortissement = 'DEGRESSIF', devise = 'HTG', objet, notes, userId } = data;

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.statut !== 'ACTIF') throw new AppError(400, 'Client inactif ou introuvable');

  const reference = await generateReferencePret();

  const datePremierRdv = new Date();
  datePremierRdv.setMonth(datePremierRdv.getMonth() + 1);
  datePremierRdv.setDate(1);

  const lignes = calculerTableau(montant, tauxMensuel / 100, dureeMois, typeAmortissement, datePremierRdv);
  const montantTotal = lignes.reduce((s, l) => s + l.mensualite, 0);
  const dateDernierRdv = lignes[lignes.length - 1].dateEcheance;

  const pret = await prisma.pret.create({
    data: {
      reference,
      clientId,
      agenceId,
      montant,
      tauxMensuel: tauxMensuel / 100,
      dureeMois,
      typeAmortissement,
      devise,
      objet,
      notes,
      statut: 'EN_ATTENTE',
      montantTotal: Math.round(montantTotal * 100) / 100,
      resteARegler: Math.round(montantTotal * 100) / 100,
      agentCreditId: userId,
      datePremierRdv,
      dateDernierRdv,
      lignes: {
        create: lignes.map((l) => ({
          numeroEcheance: l.numeroEcheance,
          dateEcheance: l.dateEcheance,
          capital: l.capital,
          interet: l.interet,
          mensualite: l.mensualite,
          capitalRestant: l.capitalRestant,
        })),
      },
    },
    include: {
      client: { select: { nom: true, prenom: true, raisonSociale: true } },
      lignes: { orderBy: { numeroEcheance: 'asc' } },
    },
  });
  await createAuditLog({ userId, table: 'prets', action: 'CREATE', entiteId: pret.id, nouveau: { reference, montant, dureeMois, devise } });
  return pret;
}

export async function approuverPret(id: string, userId: string) {
  const existing = await prisma.pret.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Prêt introuvable');
  if (existing.statut !== 'EN_ATTENTE') throw new AppError(400, 'Prêt ne peut pas être approuvé dans son état actuel');

  const pret = await prisma.pret.update({
    where: { id },
    data: { statut: 'APPROUVE', validateurId: userId, dateApprobation: new Date() },
  });
  await createAuditLog({ userId, table: 'prets', action: 'APPROBATION', entiteId: id, ancien: { statut: 'EN_ATTENTE' }, nouveau: { statut: 'APPROUVE' } });
  return pret;
}

export async function rejeterPret(id: string, userId: string, notes?: string) {
  const existing = await prisma.pret.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Prêt introuvable');
  if (!['EN_ATTENTE', 'APPROUVE'].includes(existing.statut)) throw new AppError(400, 'Prêt ne peut pas être rejeté');

  const pret = await prisma.pret.update({
    where: { id },
    data: { statut: 'REJETE', notes, validateurId: userId },
  });
  await createAuditLog({ userId, table: 'prets', action: 'REJET', entiteId: id, nouveau: { statut: 'REJETE', notes } });
  return pret;
}

export async function decaisserPret(data: {
  pretId: string;
  compteDestinationId: string;
  sessionId?: string;
  userId: string;
}) {
  const { pretId, compteDestinationId, sessionId, userId } = data;

  const pret = await prisma.pret.findUnique({ where: { id: pretId } });
  if (!pret) throw new AppError(404, 'Prêt introuvable');
  if (pret.statut !== 'APPROUVE') throw new AppError(400, 'Prêt doit être approuvé avant décaissement');

  const compte = await prisma.compte.findUnique({ where: { id: compteDestinationId } });
  if (!compte || compte.clientId !== pret.clientId) throw new AppError(400, 'Compte destination invalide');

  const montant = Number(pret.montant);
  const reference = await generateReferenceTransaction('DECAISSEMENT_PRET');
  const soldeAvant = Number(compte.solde);

  return prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        reference,
        type: 'DECAISSEMENT_PRET',
        montant,
        devise: pret.devise,
        soldeAvant,
        soldeApres: soldeAvant + montant,
        motif: `Décaissement prêt ${pret.reference}`,
        statut: 'VALIDEE',
        compteCreditId: compteDestinationId,
        sessionId,
        creeParId: userId,
        valideParId: userId,
      },
    });

    await tx.compte.update({ where: { id: compteDestinationId }, data: { solde: { increment: montant } } });

    const pretUpdated = await tx.pret.update({
      where: { id: pretId },
      data: { statut: 'EN_COURS', dateDecaissement: new Date() },
    });
    await createAuditLog({ userId, table: 'prets', action: 'DECAISSEMENT', entiteId: pretId, nouveau: { statut: 'EN_COURS', compteDestinationId, montant } });
    return pretUpdated;
  });
}

export async function enregistrerRemboursement(data: {
  pretId: string;
  montant: number;
  compteSourceId: string;
  sessionId?: string;
  userId: string;
  type?: string;
}) {
  const { pretId, montant, compteSourceId, sessionId, userId, type = 'MENSUALITE' } = data;

  const pret = await prisma.pret.findUnique({ where: { id: pretId }, include: { lignes: { orderBy: { numeroEcheance: 'asc' } } } });
  if (!pret) throw new AppError(404, 'Prêt introuvable');
  if (!['EN_COURS', 'EN_RETARD'].includes(pret.statut)) throw new AppError(400, 'Prêt non actif');

  const compte = await prisma.compte.findUnique({ where: { id: compteSourceId } });
  if (!compte || compte.clientId !== pret.clientId) throw new AppError(400, 'Compte source invalide');

  const soldeAvant = Number(compte.solde);
  if (soldeAvant < montant) throw new AppError(400, 'Solde insuffisant');

  const prochaineLigne = pret.lignes.find((l) => l.statut === 'EN_ATTENTE' || l.statut === 'EN_RETARD');

  // Calcul des pénalités de retard
  let penalite = 0;
  if (prochaineLigne) {
    const tauxJournalier = parseFloat(await getConfig('TAUX_PENALITE_JOURNALIER') || '0.001');
    const delaiGrace = parseInt(await getConfig('DELAI_GRACE_RETARD') || '5');
    const dateEcheance = new Date(prochaineLigne.dateEcheance);
    const now = new Date();
    if (now > dateEcheance) {
      const joursRetard = Math.floor((now.getTime() - dateEcheance.getTime()) / 86400000);
      const joursFacturables = Math.max(0, joursRetard - delaiGrace);
      if (joursFacturables > 0) {
        penalite = Math.round(Number(prochaineLigne.capitalRestant) * tauxJournalier * joursFacturables * 100) / 100;
      }
    }
  }

  // Ventilation : pénalité d'abord, puis intérêts, puis capital
  const penaliteEffective = Math.min(penalite, montant);
  const resteApresPenalite = montant - penaliteEffective;
  const interet = prochaineLigne
    ? Math.min(Number(prochaineLigne.interet), resteApresPenalite)
    : resteApresPenalite * 0.2;
  const capital = Math.max(0, resteApresPenalite - interet);

  const reference = await generateReferenceTransaction('REMBOURSEMENT_PRET');
  const nouveauMontantRembourse = Number(pret.montantRembourse) + montant;
  const nouveauResteARegler = Math.max(0, Number(pret.resteARegler) - montant);

  return prisma.$transaction(async (tx) => {
    const remboursement = await tx.remboursementPret.create({
      data: {
        pretId,
        type: type as any,
        montant,
        capital,
        interet,
        penalite: penaliteEffective,
        creeParId: userId,
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        reference,
        type: 'REMBOURSEMENT_PRET',
        montant,
        devise: pret.devise,
        soldeAvant,
        soldeApres: soldeAvant - montant,
        motif: `Remboursement prêt ${pret.reference}`,
        statut: 'VALIDEE',
        compteDebitId: compteSourceId,
        sessionId,
        creeParId: userId,
        valideParId: userId,
        remboursementId: remboursement.id,
      },
    });

    await tx.compte.update({ where: { id: compteSourceId }, data: { solde: { decrement: montant } } });

    if (prochaineLigne) {
      await tx.lignePret.update({
        where: { id: prochaineLigne.id },
        data: { statut: montant >= Number(prochaineLigne.mensualite) ? 'PAYE' : 'PARTIELLEMENT_PAYE' },
      });
    }

    const nouveauStatut = nouveauResteARegler <= 0 ? 'SOLDE' : pret.statut;

    await tx.pret.update({
      where: { id: pretId },
      data: {
        montantRembourse: nouveauMontantRembourse,
        resteARegler: nouveauResteARegler,
        statut: nouveauStatut,
      },
    });

    await createAuditLog({ userId, table: 'prets', action: 'REMBOURSEMENT', entiteId: pretId, nouveau: { montant, compteSourceId, nouveauResteARegler } });
    return { remboursement, transaction };
  });
}

export async function calculerPenalite(pretId: string): Promise<{ penalite: number; joursRetard: number; tauxJournalier: number }> {
  const pret = await prisma.pret.findUnique({ where: { id: pretId }, include: { lignes: { orderBy: { numeroEcheance: 'asc' } } } });
  if (!pret) throw new AppError(404, 'Prêt introuvable');

  const prochaineLigne = pret.lignes.find((l) => l.statut === 'EN_ATTENTE' || l.statut === 'EN_RETARD');
  if (!prochaineLigne) return { penalite: 0, joursRetard: 0, tauxJournalier: 0 };

  const tauxJournalier = parseFloat(await getConfig('TAUX_PENALITE_JOURNALIER') || '0.001');
  const delaiGrace = parseInt(await getConfig('DELAI_GRACE_RETARD') || '5');
  const dateEcheance = new Date(prochaineLigne.dateEcheance);
  const now = new Date();

  if (now <= dateEcheance) return { penalite: 0, joursRetard: 0, tauxJournalier };

  const joursRetard = Math.floor((now.getTime() - dateEcheance.getTime()) / 86400000);
  const joursFacturables = Math.max(0, joursRetard - delaiGrace);
  const penalite = joursFacturables > 0
    ? Math.round(Number(prochaineLigne.capitalRestant) * tauxJournalier * joursFacturables * 100) / 100
    : 0;

  return { penalite, joursRetard, tauxJournalier };
}

export async function mettreAJourRetards(): Promise<number> {
  const now = new Date();
  const pretsEnCours = await prisma.pret.findMany({
    where: { statut: 'EN_COURS' },
    include: { lignes: { where: { statut: { in: ['EN_ATTENTE'] }, dateEcheance: { lt: now } } } },
  });

  let updated = 0;
  for (const pret of pretsEnCours) {
    if (pret.lignes.length > 0) {
      await prisma.pret.update({ where: { id: pret.id }, data: { statut: 'EN_RETARD' } });
      await Promise.all(
        pret.lignes.map((l) =>
          prisma.lignePret.update({ where: { id: l.id }, data: { statut: 'EN_RETARD' } })
        )
      );
      updated++;
    }
  }
  return updated;
}
