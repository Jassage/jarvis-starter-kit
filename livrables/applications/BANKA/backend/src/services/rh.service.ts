import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';
import { creerEcritureAuto } from './compta.service';

function genMatricule(): string {
  return 'EMP-' + Date.now().toString().slice(-6);
}

function genRefContrat(): string {
  return 'CTR-' + Date.now().toString().slice(-8);
}

function genRefPaie(matricule: string, periode: string): string {
  return `PAY-${matricule}-${periode}`;
}

function genRefAvance(): string {
  return 'AVA-' + Date.now().toString().slice(-8);
}

function nbJoursOuvres(debut: Date, fin: Date): number {
  let count = 0;
  const d = new Date(debut);
  while (d <= fin) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

// ─── Postes ───────────────────────────────────────────────────────────────────

export async function listPostes() {
  return (prisma as any).poste.findMany({
    orderBy: { intitule: 'asc' },
    include: { _count: { select: { employes: true } } },
  });
}

export async function createPoste(data: { code: string; intitule: string; departement?: string; salaireMin?: number; salaireMax?: number }) {
  const existing = await (prisma as any).poste.findUnique({ where: { code: data.code } });
  if (existing) throw new AppError(400, `Le code ${data.code} existe déjà`);
  return (prisma as any).poste.create({ data });
}

export async function updatePoste(id: string, data: { intitule?: string; departement?: string; salaireMin?: number; salaireMax?: number; actif?: boolean }) {
  const poste = await (prisma as any).poste.findUnique({ where: { id } });
  if (!poste) throw new AppError(404, 'Poste introuvable');
  return (prisma as any).poste.update({ where: { id }, data, include: { _count: { select: { employes: true } } } });
}

export async function deletePoste(id: string) {
  const poste = await (prisma as any).poste.findUnique({ where: { id }, include: { _count: { select: { employes: true } } } });
  if (!poste) throw new AppError(404, 'Poste introuvable');
  if (poste._count.employes > 0) throw new AppError(400, `Ce poste est assigné à ${poste._count.employes} employé(s) — désactivez-le plutôt`);
  return (prisma as any).poste.delete({ where: { id } });
}

// ─── Employés ─────────────────────────────────────────────────────────────────

export async function listEmployes(opts: { search?: string; statut?: string; page?: number; limit?: number }) {
  const { search, statut, page = 1, limit = 50 } = opts;
  const skip = (page - 1) * limit;
  const where: any = {};
  if (statut) where.statut = statut;
  if (search) where.OR = [
    { nom: { contains: search, mode: 'insensitive' } },
    { prenom: { contains: search, mode: 'insensitive' } },
    { matricule: { contains: search, mode: 'insensitive' } },
    { email: { contains: search, mode: 'insensitive' } },
  ];
  const [total, items] = await Promise.all([
    (prisma as any).employe.count({ where }),
    (prisma as any).employe.findMany({ where, skip, take: limit, orderBy: { nom: 'asc' }, include: { poste: { select: { id: true, intitule: true } }, compte: { select: { numeroCompte: true, type: true, client: { select: { nom: true, prenom: true, raisonSociale: true } } } } } }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function createEmploye(data: { nom: string; prenom: string; posteId: string; dateEmbauche: string; salaireBrut: number; departement?: string; telephone?: string; email?: string }, userId: string) {
  const poste = await (prisma as any).poste.findUnique({ where: { id: data.posteId } });
  if (!poste) throw new AppError(404, 'Poste introuvable');
  const matricule = genMatricule();
  const employe = await (prisma as any).employe.create({
    data: { ...data, matricule, dateEmbauche: new Date(data.dateEmbauche) },
    include: { poste: { select: { intitule: true } } },
  });
  await createAuditLog({ userId, table: 'employes', action: 'CREATE', entiteId: employe.id, nouveau: { matricule, nom: data.nom, prenom: data.prenom } });
  return employe;
}

export async function updateEmploye(id: string, data: { statut?: string; salaireBrut?: number; posteId?: string; departement?: string; telephone?: string; email?: string; adresse?: string; compteId?: string; modeReglement?: string }, userId: string) {
  const employe = await (prisma as any).employe.findUnique({ where: { id } });
  if (!employe) throw new AppError(404, 'Employé introuvable');
  if (data.posteId) {
    const poste = await (prisma as any).poste.findUnique({ where: { id: data.posteId } });
    if (!poste) throw new AppError(404, 'Poste introuvable');
  }
  const updated = await (prisma as any).employe.update({ where: { id }, data, include: { poste: { select: { intitule: true } } } });
  await createAuditLog({ userId, table: 'employes', action: 'UPDATE', entiteId: id, ancien: { statut: employe.statut, salaireBrut: employe.salaireBrut }, nouveau: data });
  return updated;
}

// ─── Contrats ─────────────────────────────────────────────────────────────────

export async function listContrats(opts: { employeId?: string; statut?: string; page?: number; limit?: number }) {
  const { employeId, statut, page = 1, limit = 50 } = opts;
  const skip = (page - 1) * limit;
  const where: any = {};
  if (employeId) where.employeId = employeId;
  if (statut) where.statut = statut;
  const [total, items] = await Promise.all([
    (prisma as any).contrat.count({ where }),
    (prisma as any).contrat.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { employe: { select: { nom: true, prenom: true, matricule: true } } } }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function createContrat(data: { employeId: string; type: string; dateDebut: string; dateFin?: string; salaireBrut: number; notes?: string }, userId: string) {
  const employe = await (prisma as any).employe.findUnique({ where: { id: data.employeId } });
  if (!employe) throw new AppError(404, 'Employé introuvable');
  const reference = genRefContrat();
  const contrat = await (prisma as any).contrat.create({
    data: { ...data, reference, dateDebut: new Date(data.dateDebut), dateFin: data.dateFin ? new Date(data.dateFin) : undefined },
    include: { employe: { select: { nom: true, prenom: true, matricule: true } } },
  });
  await createAuditLog({ userId, table: 'contrats', action: 'CREATE', entiteId: contrat.id, nouveau: { reference, type: data.type } });
  return contrat;
}

export async function resilierContrat(id: string, userId: string) {
  const contrat = await (prisma as any).contrat.findUnique({ where: { id } });
  if (!contrat) throw new AppError(404, 'Contrat introuvable');
  if (contrat.statut === 'RESILIE') throw new AppError(400, 'Contrat déjà résilié');
  const updated = await (prisma as any).contrat.update({
    where: { id }, data: { statut: 'RESILIE' },
    include: { employe: { select: { nom: true, prenom: true, matricule: true } } },
  });
  await createAuditLog({ userId, table: 'contrats', action: 'RESILIATION', entiteId: id, nouveau: { statut: 'RESILIE' } });
  return updated;
}

// ─── Congés ───────────────────────────────────────────────────────────────────

export async function listConges(opts: { employeId?: string; statut?: string; page?: number; limit?: number }) {
  const { employeId, statut, page = 1, limit = 50 } = opts;
  const skip = (page - 1) * limit;
  const where: any = {};
  if (employeId) where.employeId = employeId;
  if (statut) where.statut = statut;
  const [total, items] = await Promise.all([
    (prisma as any).conge.count({ where }),
    (prisma as any).conge.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { employe: { select: { nom: true, prenom: true, matricule: true } } } }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function createConge(data: { employeId: string; type: string; dateDebut: string; dateFin: string; motif?: string }, userId: string) {
  const employe = await (prisma as any).employe.findUnique({ where: { id: data.employeId } });
  if (!employe) throw new AppError(404, 'Employé introuvable');
  const debut = new Date(data.dateDebut);
  const fin = new Date(data.dateFin);
  if (fin < debut) throw new AppError(400, 'La date de fin doit être après la date de début');
  const nbJours = nbJoursOuvres(debut, fin);
  const conge = await (prisma as any).conge.create({
    data: { ...data, dateDebut: debut, dateFin: fin, nbJours },
    include: { employe: { select: { nom: true, prenom: true, matricule: true } } },
  });
  return conge;
}

export async function updateStatutConge(id: string, statut: string, userId: string) {
  const conge = await (prisma as any).conge.findUnique({ where: { id } });
  if (!conge) throw new AppError(404, 'Congé introuvable');
  if (!['APPROUVE', 'REFUSE', 'ANNULE'].includes(statut)) throw new AppError(400, 'Statut invalide');
  const updated = await (prisma as any).conge.update({ where: { id }, data: { statut } });
  await createAuditLog({ userId, table: 'conges', action: 'STATUT', entiteId: id, nouveau: { statut } });
  return updated;
}

// ─── Paie ─────────────────────────────────────────────────────────────────────

export async function listFichesPaie(opts: { periode?: string; employeId?: string; page?: number; limit?: number }) {
  const { periode, employeId, page = 1, limit = 50 } = opts;
  const skip = (page - 1) * limit;
  const where: any = {};
  if (periode) where.periode = periode;
  if (employeId) where.employeId = employeId;
  const [total, items] = await Promise.all([
    (prisma as any).fichePaie.count({ where }),
    (prisma as any).fichePaie.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { employe: { select: { nom: true, prenom: true, matricule: true } } } }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function genererFichesPaie(periode: string, userId: string) {
  const employes = await (prisma as any).employe.findMany({
    where: { statut: 'ACTIF' },
    include: { compte: { include: { client: { include: { prets: { where: { statut: 'EN_COURS' } } } } } } },
  });
  const results = { crees: 0, ignores: 0 };

  for (const emp of employes) {
    const existing = await (prisma as any).fichePaie.findUnique({ where: { employeId_periode: { employeId: emp.id, periode } } });
    if (existing) { results.ignores++; continue; }

    const brut = Number(emp.salaireBrut);
    const cotisations = Math.round(brut * 0.06 * 100) / 100;

    // Avance à déduire sur cette période
    const avance = await (prisma as any).avanceSalaire.findFirst({
      where: { employeId: emp.id, periodeDeduction: periode, statut: 'EN_ATTENTE' },
    });
    const avanceDeduite = avance ? Number(avance.montant) : 0;

    // Remboursement crédit actif (mensualité du prêt en cours)
    const pretActif = emp.compte?.client?.prets?.[0];
    const creditDeduit = pretActif ? Math.round(Number(pretActif.mensualite) * 100) / 100 : 0;

    // Éléments variables du mois (primes, bonus, retenues)
    const elements = await (prisma as any).elementVariable.findMany({
      where: { employeId: emp.id, periode },
    });
    const totalPrimes   = elements.filter((e: any) => e.type !== 'RETENUE').reduce((s: number, e: any) => s + Number(e.montant), 0);
    const totalRetenues = elements.filter((e: any) => e.type === 'RETENUE').reduce((s: number, e: any) => s + Number(e.montant), 0);

    const brutAvecPrimes = brut + totalPrimes;
    const net = Math.round((brutAvecPrimes - cotisations - avanceDeduite - creditDeduit - totalRetenues) * 100) / 100;
    const reference = genRefPaie(emp.matricule, periode);

    await (prisma as any).fichePaie.create({
      data: {
        reference,
        employeId: emp.id,
        periode,
        salaireBrut: brutAvecPrimes,
        cotisations,
        avanceDeduite,
        creditDeduit,
        salaireNet: Math.max(net, 0),
        modeReglement: emp.modeReglement,
        details: {
          taux_cotisation: 0.06,
          salaire_base: brut,
          primes: elements.filter((e: any) => e.type !== 'RETENUE').map((e: any) => ({ type: e.type, libelle: e.libelle, montant: Number(e.montant) })),
          retenues_extra: elements.filter((e: any) => e.type === 'RETENUE').map((e: any) => ({ libelle: e.libelle, montant: Number(e.montant) })),
        },
      },
    });

    // Marquer l'avance comme déduite
    if (avance) {
      await (prisma as any).avanceSalaire.update({ where: { id: avance.id }, data: { statut: 'DEDUITE' } });
    }

    // Écriture comptable charge brute
    await creerEcritureAuto(prisma, {
      debitNumero:  '6400',
      creditNumero: '4600',
      montant: Math.max(net, 0),
      libelle: `Salaire ${emp.prenom} ${emp.nom} ${periode}`,
      date: new Date(),
      userId,
    });
    if (cotisations > 0) {
      await creerEcritureAuto(prisma, {
        debitNumero:  '6400',
        creditNumero: '4700',
        montant: cotisations,
        libelle: `Cotisations ${emp.prenom} ${emp.nom} ${periode}`,
        date: new Date(),
        userId,
      });
    }

    results.crees++;
  }

  await createAuditLog({ userId, table: 'fiches_paie', action: 'GENERATION', entiteId: periode, nouveau: results });
  return results;
}

export async function validerFiche(ficheId: string, userId: string) {
  const fiche = await (prisma as any).fichePaie.findUnique({ where: { id: ficheId } });
  if (!fiche) throw new AppError(404, 'Fiche introuvable');
  if (fiche.statut !== 'BROUILLON') throw new AppError(400, 'Seules les fiches en brouillon peuvent être validées');

  const updated = await (prisma as any).fichePaie.update({
    where: { id: ficheId },
    data: { statut: 'VALIDE', valideParId: userId },
    include: { employe: { select: { nom: true, prenom: true, matricule: true } } },
  });
  await createAuditLog({ userId, table: 'fiches_paie', action: 'VALIDATION', entiteId: ficheId });
  return updated;
}

export async function payerSalaires(periode: string, userId: string) {
  const fiches = await (prisma as any).fichePaie.findMany({
    where: { periode, statut: 'VALIDE' },
    include: {
      employe: {
        include: { compte: true },
      },
    },
  });
  if (fiches.length === 0) throw new AppError(400, 'Aucune fiche validée pour cette période. Validez d\'abord les bulletins.');

  const compteDepense = await prisma.compteComptable.findFirst({ where: { numero: '5700' } });

  let payes = 0;
  let virements = 0;
  let especes = 0;
  let totalNet = 0;
  let totalCotisations = 0;

  for (const fiche of fiches) {
    const emp = fiche.employe;
    const net = Number(fiche.salaireNet);

    // Virement interne si l'employé a un compte BANKA
    if (fiche.modeReglement === 'VIREMENT_BANKA' && emp.compteId) {
      const soldeAvant = Number(emp.compte?.solde || 0);
      const soldeApres = soldeAvant + net;
      await prisma.compte.update({ where: { id: emp.compteId }, data: { solde: { increment: net } } });
      await prisma.transaction.create({
        data: {
          reference: `SAL-${emp.matricule}-${periode}`,
          type: 'VIREMENT_CREDIT',
          montant: net,
          devise: 'HTG',
          soldeAvant,
          soldeApres,
          motif: `Salaire net ${periode}`,
          statut: 'VALIDEE',
          compteCreditId: emp.compteId,
          creeParId: userId,
        },
      });
      virements++;
    } else {
      especes++;
    }

    // Remboursement crédit: créer transaction de type REMBOURSEMENT_PRET si creditDeduit > 0
    if (Number(fiche.creditDeduit) > 0 && emp.compteId) {
      await creerEcritureAuto(prisma, {
        debitNumero:  '2000',
        creditNumero: '4600',
        montant: Number(fiche.creditDeduit),
        libelle: `Remboursement crédit retenu sur salaire ${emp.prenom} ${emp.nom} ${periode}`,
        date: new Date(),
        userId,
      });
    }

    await (prisma as any).fichePaie.update({
      where: { id: fiche.id },
      data: { statut: 'PAYE' },
    });

    totalNet += net;
    totalCotisations += Number(fiche.cotisations);
    payes++;
  }

  // Écriture globale décaissement
  await creerEcritureAuto(prisma, {
    debitNumero:  '4600',
    creditNumero: '5700',
    montant: totalNet,
    libelle: `Virement salaires nets ${periode} (${virements} virement(s), ${especes} espèces)`,
    date: new Date(),
    userId,
  });
  if (totalCotisations > 0) {
    await creerEcritureAuto(prisma, {
      debitNumero:  '4700',
      creditNumero: '5700',
      montant: totalCotisations,
      libelle: `Paiement cotisations sociales ${periode}`,
      date: new Date(),
      userId,
    });
  }

  await createAuditLog({ userId, table: 'fiches_paie', action: 'PAIEMENT', entiteId: periode, nouveau: { totalNet, totalCotisations, payes, virements, especes } });
  return { payes, totalNet, totalCotisations, virements, especes };
}

// ── Avances sur salaire ─────────────────────────────────────────────────────

export async function creerAvance(data: {
  employeId: string;
  montant: number;
  periodeDeduction: string;
  notes?: string;
}, userId: string) {
  const emp = await (prisma as any).employe.findUnique({ where: { id: data.employeId } });
  if (!emp) throw new AppError(404, 'Employé introuvable');
  if (emp.statut !== 'ACTIF') throw new AppError(400, 'Impossible d\'accorder une avance à un employé inactif');

  const dejaAvance = await (prisma as any).avanceSalaire.findFirst({
    where: { employeId: data.employeId, periodeDeduction: data.periodeDeduction, statut: 'EN_ATTENTE' },
  });
  if (dejaAvance) throw new AppError(400, 'Une avance est déjà prévue pour cet employé sur cette période');

  if (data.montant > Number(emp.salaireBrut) * 0.5) {
    throw new AppError(400, 'L\'avance ne peut pas dépasser 50% du salaire brut');
  }

  const avance = await (prisma as any).avanceSalaire.create({
    data: {
      reference: genRefAvance(),
      employeId: data.employeId,
      montant: data.montant,
      periodeDeduction: data.periodeDeduction,
      notes: data.notes,
      creeParId: userId,
    },
    include: { employe: { select: { nom: true, prenom: true, matricule: true } } },
  });

  // Si l'employé a un compte, créditer immédiatement son compte
  if (emp.compteId) {
    await prisma.compte.update({ where: { id: emp.compteId }, data: { solde: { increment: data.montant } } });
    await creerEcritureAuto(prisma, {
      debitNumero:  '4650',
      creditNumero: '5700',
      montant: data.montant,
      libelle: `Avance sur salaire ${emp.prenom} ${emp.nom} — déduction prévue ${data.periodeDeduction}`,
      date: new Date(),
      userId,
    });
  }

  await createAuditLog({ userId, table: 'avances_salaire', action: 'CREATE', entiteId: avance.id, nouveau: data });
  return avance;
}

export async function listAvances(opts: { employeId?: string; periode?: string; statut?: string }) {
  const where: any = {};
  if (opts.employeId) where.employeId = opts.employeId;
  if (opts.periode) where.periodeDeduction = opts.periode;
  if (opts.statut) where.statut = opts.statut;

  return (prisma as any).avanceSalaire.findMany({
    where,
    include: { employe: { select: { nom: true, prenom: true, matricule: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function annulerAvance(avanceId: string, userId: string) {
  const avance = await (prisma as any).avanceSalaire.findUnique({
    where: { id: avanceId },
    include: { employe: true },
  });
  if (!avance) throw new AppError(404, 'Avance introuvable');
  if (avance.statut !== 'EN_ATTENTE') throw new AppError(400, 'Seules les avances en attente peuvent être annulées');

  // Rembourser le compte si le paiement avait été fait
  if (avance.employe.compteId) {
    await prisma.compte.update({ where: { id: avance.employe.compteId }, data: { solde: { decrement: Number(avance.montant) } } });
  }

  await (prisma as any).avanceSalaire.update({ where: { id: avanceId }, data: { statut: 'ANNULEE' } });
  await createAuditLog({ userId, table: 'avances_salaire', action: 'ANNULATION', entiteId: avanceId });
}

// ── Éléments variables (primes, bonus, retenues) ────────────────────────────

export async function listElementsVariables(opts: { employeId?: string; periode?: string }) {
  const where: any = {};
  if (opts.employeId) where.employeId = opts.employeId;
  if (opts.periode) where.periode = opts.periode;
  return (prisma as any).elementVariable.findMany({
    where,
    include: { employe: { select: { nom: true, prenom: true, matricule: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createElementVariable(
  data: { employeId: string; periode: string; type: string; libelle: string; montant: number; notes?: string },
  userId: string
) {
  const emp = await (prisma as any).employe.findUnique({ where: { id: data.employeId } });
  if (!emp) throw new AppError(404, 'Employé introuvable');

  const ficheExistante = await (prisma as any).fichePaie.findUnique({
    where: { employeId_periode: { employeId: data.employeId, periode: data.periode } },
  });
  if (ficheExistante && ficheExistante.statut !== 'BROUILLON') {
    throw new AppError(400, 'Impossible d\'ajouter un élément variable : la fiche de paie est déjà validée ou payée');
  }

  const element = await (prisma as any).elementVariable.create({
    data: {
      employeId: data.employeId,
      periode: data.periode,
      type: data.type,
      libelle: data.libelle,
      montant: data.montant,
      notes: data.notes,
      creeParId: userId,
    },
    include: { employe: { select: { nom: true, prenom: true, matricule: true } } },
  });

  await createAuditLog({ userId, table: 'elements_variables', action: 'CREATE', entiteId: element.id, nouveau: data });
  return element;
}

export async function deleteElementVariable(id: string, userId: string) {
  const element = await (prisma as any).elementVariable.findUnique({ where: { id } });
  if (!element) throw new AppError(404, 'Élément introuvable');

  const ficheExistante = await (prisma as any).fichePaie.findUnique({
    where: { employeId_periode: { employeId: element.employeId, periode: element.periode } },
  });
  if (ficheExistante && ficheExistante.statut !== 'BROUILLON') {
    throw new AppError(400, 'Impossible de supprimer : la fiche de paie est déjà validée ou payée');
  }

  await (prisma as any).elementVariable.delete({ where: { id } });
  await createAuditLog({ userId, table: 'elements_variables', action: 'DELETE', entiteId: id });
}
