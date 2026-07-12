import prisma from '../utils/prisma';
import { generateReferencePret, generateReferenceTransaction } from '../utils/reference';
import { AppError } from '../types';
import { TypeAmortissement, Devise } from '@prisma/client';
import { calculerTableau } from '../utils/amortissement';
import { createAuditLog } from '../utils/audit';
import { getConfig } from './configuration.service';
import { creerEcritureAuto } from './compta.service';
import { preleverFraisDossierPret } from './frais.service';

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
  agentAgenceId?: string | null;
}) {
  const { clientId, agenceId, montant, tauxMensuel, dureeMois, typeAmortissement = 'DEGRESSIF', devise = 'HTG', objet, notes, userId, agentAgenceId } = data;

  if (!montant || montant <= 0) throw new AppError(400, 'Le montant du prêt doit être positif');
  if (tauxMensuel <= 0 || tauxMensuel > 30) throw new AppError(400, 'Le taux mensuel doit être entre 0 et 30%');
  if (!Number.isInteger(dureeMois) || dureeMois < 1 || dureeMois > 360) throw new AppError(400, 'La durée doit être entre 1 et 360 mois');
  // Un agent lié à une agence ne peut créer un prêt que pour sa propre agence
  if (agentAgenceId && agentAgenceId !== agenceId) throw new AppError(403, 'Vous ne pouvez créer un prêt que pour votre propre agence');

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
  agenceId?: string | null;
}) {
  const { pretId, compteDestinationId, sessionId, userId, agenceId } = data;

  const pret = await prisma.pret.findUnique({ where: { id: pretId } });
  if (!pret) throw new AppError(404, 'Prêt introuvable');
  if (pret.statut !== 'APPROUVE') throw new AppError(400, 'Prêt doit être approuvé avant décaissement');
  // Un agent lié à une agence ne peut décaisser que les prêts de sa propre agence
  if (agenceId && pret.agenceId !== agenceId) throw new AppError(403, 'Ce prêt n\'appartient pas à votre agence');

  const compte = await prisma.compte.findUnique({ where: { id: compteDestinationId } });
  if (!compte || compte.clientId !== pret.clientId) throw new AppError(400, 'Compte destination invalide');
  if (compte.statut !== 'ACTIF') throw new AppError(400, 'Le compte destination doit être actif');

  const montant = Number(pret.montant);
  const reference = await generateReferenceTransaction('DECAISSEMENT_PRET');
  const soldeAvant = Number(compte.solde);

  return prisma.$transaction(async (tx) => {
    // Verrou logique : seul un prêt encore APPROUVE peut être décaissé — empêche un double décaissement
    // en cas de double-clic ou de requêtes concurrentes (compare-and-swap au niveau SQL)
    const cas = await tx.pret.updateMany({
      where: { id: pretId, statut: 'APPROUVE' },
      data: { statut: 'DECAISSE', dateDecaissement: new Date() },
    });
    if (cas.count === 0) {
      throw new AppError(409, 'Ce prêt a déjà été décaissé ou son statut ne permet plus le décaissement');
    }

    const txDecaissement = await tx.transaction.create({
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
        agenceExecutionId: agenceId ?? pret.agenceId,
        creeParId: userId,
        valideParId: userId,
      },
    });

    await tx.compte.update({ where: { id: compteDestinationId }, data: { solde: { increment: montant } } });
    await preleverFraisDossierPret({ pretId, compteId: compteDestinationId, montantPret: montant, devise: pret.devise as string, userId, tx });

    // Écriture comptable du décaissement liée à sa transaction — Débit 2000 / Crédit 2600
    await creerEcritureAuto(tx, {
      debitNumero:  '2000',
      creditNumero: '2600',
      montant,
      libelle: `Décaissement prêt ${pret.reference}`,
      date: new Date(),
      userId,
      transactionId: txDecaissement.id,
    });

    await createAuditLog({ userId, table: 'prets', action: 'DECAISSEMENT', entiteId: pretId, nouveau: { statut: 'EN_COURS', compteDestinationId, montant } });
    return tx.pret.findUniqueOrThrow({ where: { id: pretId } });
  });
}

export async function enregistrerRemboursement(data: {
  pretId: string;
  montant: number;
  compteSourceId: string;
  sessionId?: string;
  userId: string;
  type?: string;
  agenceId?: string | null;
}) {
  const { pretId, montant, compteSourceId, sessionId, userId, type = 'MENSUALITE', agenceId } = data;

  if (!montant || montant <= 0) throw new AppError(400, 'Le montant du remboursement doit être positif');

  const pret = await prisma.pret.findUnique({ where: { id: pretId }, include: { lignes: { orderBy: { numeroEcheance: 'asc' } } } });
  if (!pret) throw new AppError(404, 'Prêt introuvable');
  // Un caissier/agent lié à une agence ne peut enregistrer un remboursement que sur un prêt de sa propre agence
  if (agenceId && pret.agenceId !== agenceId) throw new AppError(403, 'Ce prêt n\'appartient pas à votre agence');
  if (!['DECAISSE', 'EN_COURS', 'EN_RETARD'].includes(pret.statut)) throw new AppError(400, 'Prêt non actif');
  if (montant > Number(pret.resteARegler)) throw new AppError(400, `Le montant dépasse le reste à régler (${Number(pret.resteARegler).toFixed(2)} ${pret.devise})`);

  const compte = await prisma.compte.findUnique({ where: { id: compteSourceId } });
  if (!compte || compte.clientId !== pret.clientId) throw new AppError(400, 'Compte source invalide');

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
  return prisma.$transaction(async (tx) => {
    // Décrémentation atomique : la vérification et la mise à jour sont une seule opération SQL
    // Cela évite toute race condition entre deux remboursements simultanés
    const result = await tx.compte.updateMany({
      where: { id: compteSourceId, solde: { gte: montant } },
      data: { solde: { decrement: montant } },
    });
    if (result.count === 0) {
      const current = await tx.compte.findUnique({ where: { id: compteSourceId }, select: { solde: true } });
      throw new AppError(400, `Solde insuffisant. Solde disponible : ${Number(current!.solde)} ${pret.devise}`);
    }

    // Même principe côté prêt : l'incrément/décrément et la vérification du reste à régler sont
    // une seule opération SQL atomique, plutôt que d'écrire une valeur absolue calculée sur un
    // snapshot pris avant la transaction (qui écraserait un remboursement concurrent — lost update)
    const casPret = await tx.pret.updateMany({
      where: { id: pretId, resteARegler: { gte: montant } },
      data: { montantRembourse: { increment: montant }, resteARegler: { decrement: montant } },
    });
    if (casPret.count === 0) {
      throw new AppError(400, `Le montant dépasse le reste à régler actuel du prêt`);
    }
    const pretApres = await tx.pret.findUniqueOrThrow({ where: { id: pretId } });
    const nouveauResteARegler = Number(pretApres.resteARegler);

    const soldeAvant = Number(compte.solde);

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
        agenceExecutionId: agenceId ?? pret.agenceId,
        creeParId: userId,
        valideParId: userId,
        remboursementId: remboursement.id,
      },
    });

    if (prochaineLigne) {
      await tx.lignePret.update({
        where: { id: prochaineLigne.id },
        data: { statut: montant >= Number(prochaineLigne.mensualite) ? 'PAYE' : 'PARTIELLEMENT_PAYE' },
      });
    }

    // Premier remboursement sur un prêt DECAISSE : on passe en EN_COURS. montantRembourse et
    // resteARegler sont déjà à jour (mis à jour atomiquement plus haut) — seul le statut reste à poser.
    const statutCourant = pret.statut === 'DECAISSE' ? 'EN_COURS' : pret.statut;
    const nouveauStatut = nouveauResteARegler <= 0 ? 'SOLDE' : statutCourant;

    await tx.pret.update({
      where: { id: pretId },
      data: { statut: nouveauStatut },
    });

    // Recalcul de l'échéancier sur remboursement anticipé partiel
    if (type === 'ANTICIPEE' && nouveauResteARegler > 0) {
      const lignesRestantes = pret.lignes.filter((l) => l.statut === 'EN_ATTENTE' || l.statut === 'EN_RETARD');
      if (lignesRestantes.length > 0) {
        await tx.lignePret.deleteMany({
          where: { pretId, statut: { in: ['EN_ATTENTE', 'EN_RETARD'] } },
        });
        // tauxMensuel est déjà stocké en décimal (divisé à la création), pas de /100 supplémentaire
        const taux = Number(pret.tauxMensuel);
        const nbMois = lignesRestantes.length;
        const dateBase = new Date(lignesRestantes[0].dateEcheance);
        const nouvellesLignes = calculerTableau(nouveauResteARegler, taux, nbMois, pret.typeAmortissement, dateBase);
        const offsetNum = pret.lignes.filter((l) => l.statut === 'PAYE' || l.statut === 'PARTIELLEMENT_PAYE').length;
        await tx.lignePret.createMany({
          data: nouvellesLignes.map((l, i) => ({
            pretId,
            numeroEcheance: offsetNum + i + 1,
            dateEcheance: l.dateEcheance,
            capital: l.capital,
            interet: l.interet,
            mensualite: l.mensualite,
            capitalRestant: l.capitalRestant,
          })),
        });
      }
    }

    // Écritures comptables du remboursement
    if (capital > 0) {
      await creerEcritureAuto(tx, {
        debitNumero:  '2600',
        creditNumero: '2000',
        montant: capital,
        libelle: `Remboursement prêt ${pret.reference} — capital`,
        date: new Date(),
        userId,
        transactionId: transaction.id,
      });
    }
    if (interet + penaliteEffective > 0) {
      await creerEcritureAuto(tx, {
        debitNumero:  '2600',
        creditNumero: '7100',
        montant: interet + penaliteEffective,
        libelle: `Remboursement prêt ${pret.reference} — intérêts/pénalités`,
        date: new Date(),
        userId,
        transactionId: transaction.id,
      });
    }

    await createAuditLog({ userId, table: 'prets', action: 'REMBOURSEMENT', entiteId: pretId, nouveau: { montant, compteSourceId, nouveauResteARegler } });
    return { remboursement, transaction };
  });
}

// Applique la retenue sur salaire (FichePaie.creditDeduit) au prêt correspondant — appelée par
// rh.service.ts::payerSalaires DANS la même transaction que le paiement de la paie. Contrairement à
// enregistrerRemboursement, aucun compte bancaire n'est débité (l'argent ne transite jamais par un
// compte, il est simplement soustrait du salaire brut) et aucune Transaction n'est créée (l'écriture
// comptable 4600/2000 de la retenue est déjà postée par l'appelant) : seul le prêt lui-même est mis à
// jour (resteARegler/montantRembourse/statut/ligne), corrigeant la désynchronisation entre la fiche de
// paie et le prêt qui existait jusqu'ici.
export async function appliquerRetenueSalariale(opts: { pretId: string; montant: number; userId: string; tx: any }): Promise<void> {
  const { pretId, montant, userId, tx } = opts;
  if (!montant || montant <= 0) return;

  const pret = await tx.pret.findUnique({ where: { id: pretId }, include: { lignes: { orderBy: { numeroEcheance: 'asc' } } } });
  if (!pret || !['DECAISSE', 'EN_COURS', 'EN_RETARD'].includes(pret.statut)) return;

  // Même garde compare-and-swap que enregistrerRemboursement : si le prêt a été soldé entre-temps
  // (ex: remboursement anticipé fait entre la génération de la fiche et le paiement), on ne fait rien
  // plutôt que de faire passer resteARegler en négatif.
  const casPret = await tx.pret.updateMany({
    where: { id: pretId, resteARegler: { gte: montant } },
    data: { montantRembourse: { increment: montant }, resteARegler: { decrement: montant } },
  });
  if (casPret.count === 0) return;

  const pretApres = await tx.pret.findUniqueOrThrow({ where: { id: pretId } });
  const nouveauResteARegler = Number(pretApres.resteARegler);

  const prochaineLigne = pret.lignes.find((l: any) => l.statut === 'EN_ATTENTE' || l.statut === 'EN_RETARD');
  if (prochaineLigne) {
    await tx.lignePret.update({
      where: { id: prochaineLigne.id },
      data: { statut: montant >= Number(prochaineLigne.mensualite) ? 'PAYE' : 'PARTIELLEMENT_PAYE' },
    });
  }
  const capital = prochaineLigne ? Number(prochaineLigne.capital) : montant;
  const interet = prochaineLigne ? Number(prochaineLigne.interet) : 0;

  await tx.remboursementPret.create({
    data: { pretId, type: 'RETENUE_SALAIRE', montant, capital, interet, penalite: 0, creeParId: userId },
  });

  // Premier remboursement sur un prêt DECAISSE : passage en EN_COURS, comme enregistrerRemboursement
  const statutCourant = pret.statut === 'DECAISSE' ? 'EN_COURS' : pret.statut;
  const nouveauStatut = nouveauResteARegler <= 0 ? 'SOLDE' : statutCourant;
  await tx.pret.update({ where: { id: pretId }, data: { statut: nouveauStatut } });

  await createAuditLog({ userId, table: 'prets', action: 'RETENUE_SALAIRE', entiteId: pretId, nouveau: { montant, nouveauResteARegler } });
}

export async function annulerPret(id: string, userId: string, notes?: string) {
  const existing = await prisma.pret.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Prêt introuvable');
  if (!['EN_ATTENTE', 'APPROUVE'].includes(existing.statut)) {
    throw new AppError(400, 'Seuls les prêts en attente ou approuvés peuvent être annulés');
  }

  const pret = await prisma.pret.update({
    where: { id },
    data: { statut: 'ANNULE', notes: notes ?? existing.notes ?? undefined },
  });
  await createAuditLog({ userId, table: 'prets', action: 'ANNULATION', entiteId: id, ancien: { statut: existing.statut }, nouveau: { statut: 'ANNULE', notes } });
  return pret;
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
    where: { statut: { in: ['DECAISSE', 'EN_COURS'] } },
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
