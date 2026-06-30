import { randomBytes } from 'crypto';
import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';
import { creerEcritureAuto } from './compta.service';
import { hashPassword } from '../utils/hash';

// T5: Utiliser randomBytes pour garantir l'unicité (Date.now().slice(-6) peut se répéter à la milliseconde)
function genMatricule(): string {
  return 'EMP-' + randomBytes(4).toString('hex').toUpperCase();
}

function genRefContrat(): string {
  return 'CTR-' + randomBytes(5).toString('hex').toUpperCase();
}

function genRefPaie(matricule: string, periode: string): string {
  return `PAY-${matricule}-${periode}`;
}

function genRefAvance(): string {
  return 'AVA-' + randomBytes(5).toString('hex').toUpperCase();
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
  return prisma.poste.findMany({
    orderBy: { intitule: 'asc' },
    include: { _count: { select: { employes: true } } },
  });
}

export async function createPoste(data: { code: string; intitule: string; departement?: string; salaireMin?: number; salaireMax?: number }) {
  const existing = await prisma.poste.findUnique({ where: { code: data.code } });
  if (existing) throw new AppError(400, `Le code ${data.code} existe déjà`);
  if (data.salaireMin !== undefined && data.salaireMax !== undefined && data.salaireMin > data.salaireMax) {
    throw new AppError(400, 'Le salaire minimum ne peut pas dépasser le salaire maximum');
  }
  return prisma.poste.create({ data });
}

export async function updatePoste(id: string, data: { intitule?: string; departement?: string; salaireMin?: number; salaireMax?: number; actif?: boolean }) {
  const poste = await prisma.poste.findUnique({ where: { id } });
  if (!poste) throw new AppError(404, 'Poste introuvable');
  const min = data.salaireMin ?? poste.salaireMin;
  const max = data.salaireMax ?? poste.salaireMax;
  if (min !== null && max !== null && min !== undefined && max !== undefined && min > max) {
    throw new AppError(400, 'Le salaire minimum ne peut pas dépasser le salaire maximum');
  }
  return prisma.poste.update({ where: { id }, data, include: { _count: { select: { employes: true } } } });
}

export async function deletePoste(id: string) {
  const poste = await prisma.poste.findUnique({ where: { id }, include: { _count: { select: { employes: true } } } });
  if (!poste) throw new AppError(404, 'Poste introuvable');
  if (poste._count.employes > 0) throw new AppError(400, `Ce poste est assigné à ${poste._count.employes} employé(s) — désactivez-le plutôt`);
  return prisma.poste.delete({ where: { id } });
}

// ─── Employés ─────────────────────────────────────────────────────────────────

export async function listEmployes(opts: { search?: string; statut?: string; agenceId?: string; page?: number; limit?: number }) {
  const { search, statut, agenceId, page = 1, limit = 50 } = opts;
  const skip = (page - 1) * limit;
  const where: any = {};
  if (statut) where.statut = statut;
  if (agenceId) where.agenceId = agenceId;
  if (search) where.OR = [
    { nom: { contains: search, mode: 'insensitive' } },
    { prenom: { contains: search, mode: 'insensitive' } },
    { matricule: { contains: search, mode: 'insensitive' } },
    { email: { contains: search, mode: 'insensitive' } },
  ];
  const now = new Date();
  const [total, items] = await Promise.all([
    prisma.employe.count({ where }),
    prisma.employe.findMany({
      where, skip, take: limit, orderBy: { nom: 'asc' },
      include: {
        poste: { select: { id: true, intitule: true } },
        agence: { select: { id: true, nom: true, code: true } },
        utilisateur: { select: { id: true, email: true, role: true, actif: true, nom: true, prenom: true } },
        compte: { select: { numeroCompte: true, type: true, client: { select: { nom: true, prenom: true, raisonSociale: true } } } },
        conges: {
          where: { statut: 'APPROUVE', dateDebut: { lte: now }, dateFin: { gte: now } },
          select: { id: true, type: true, dateDebut: true, dateFin: true },
          take: 1,
        },
      },
    }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function createEmploye(data: { nom: string; prenom: string; posteId: string; dateEmbauche: string; salaireBrut: number; departement?: string; telephone?: string; email?: string; agenceId?: string }, userId: string) {
  if (!data.salaireBrut || data.salaireBrut <= 0) throw new AppError(400, 'Le salaire brut doit être positif');
  if (!data.dateEmbauche) throw new AppError(400, "Date d'embauche requise");
  const poste = await prisma.poste.findUnique({ where: { id: data.posteId } });
  if (!poste) throw new AppError(404, 'Poste introuvable');
  if (poste.salaireMin && data.salaireBrut < Number(poste.salaireMin)) throw new AppError(400, `Salaire inférieur au minimum du poste (${Number(poste.salaireMin).toLocaleString()} HTG)`);
  if (poste.salaireMax && data.salaireBrut > Number(poste.salaireMax)) throw new AppError(400, `Salaire supérieur au maximum du poste (${Number(poste.salaireMax).toLocaleString()} HTG)`);
  if (data.agenceId) {
    const agence = await prisma.agence.findUnique({ where: { id: data.agenceId } });
    if (!agence) throw new AppError(404, 'Agence introuvable');
    if (!agence.actif) throw new AppError(400, 'Cette agence est inactive');
  }
  const matricule = genMatricule();
  const employe = await prisma.employe.create({
    data: { ...data, matricule, dateEmbauche: new Date(data.dateEmbauche) },
    include: { poste: { select: { intitule: true } }, agence: { select: { nom: true, code: true } } },
  });
  await createAuditLog({ userId, table: 'employes', action: 'CREATE', entiteId: employe.id, nouveau: { matricule, nom: data.nom, prenom: data.prenom, agenceId: data.agenceId } });
  return employe;
}

export async function updateEmploye(id: string, data: { statut?: string; salaireBrut?: number; posteId?: string; departement?: string; telephone?: string; email?: string; adresse?: string; compteId?: string; modeReglement?: string; biometricId?: number | null }, userId: string) {
  if (data.salaireBrut !== undefined && data.salaireBrut <= 0) throw new AppError(400, 'Le salaire brut doit être positif');
  const employe = await prisma.employe.findUnique({ where: { id } });
  if (!employe) throw new AppError(404, 'Employé introuvable');
  if (data.posteId) {
    const poste = await prisma.poste.findUnique({ where: { id: data.posteId } });
    if (!poste) throw new AppError(404, 'Poste introuvable');
    const salaire = data.salaireBrut ?? Number(employe.salaireBrut);
    if (poste.salaireMin && salaire < Number(poste.salaireMin)) throw new AppError(400, `Salaire inférieur au minimum du poste (${Number(poste.salaireMin).toLocaleString()} HTG)`);
    if (poste.salaireMax && salaire > Number(poste.salaireMax)) throw new AppError(400, `Salaire supérieur au maximum du poste (${Number(poste.salaireMax).toLocaleString()} HTG)`);
  }
  const updated = await prisma.employe.update({ where: { id }, data: data as any, include: { poste: { select: { intitule: true } } } });
  await createAuditLog({ userId, table: 'employes', action: 'UPDATE', entiteId: id, ancien: { statut: employe.statut, salaireBrut: employe.salaireBrut }, nouveau: data });
  return updated;
}

export async function transfererEmploye(id: string, agenceId: string | null, userId: string) {
  const employe = await prisma.employe.findUnique({ where: { id }, include: { agence: { select: { nom: true } } } });
  if (!employe) throw new AppError(404, 'Employé introuvable');
  if (agenceId) {
    const agence = await prisma.agence.findUnique({ where: { id: agenceId } });
    if (!agence) throw new AppError(404, 'Agence de destination introuvable');
    if (!agence.actif) throw new AppError(400, 'L\'agence de destination est inactive');
    if (employe.agenceId === agenceId) throw new AppError(400, 'L\'employé est déjà affecté à cette agence');
  }
  const updated = await prisma.employe.update({
    where: { id },
    data: { agenceId },
    include: { poste: { select: { intitule: true } }, agence: { select: { nom: true, code: true } } },
  });
  await createAuditLog({
    userId, table: 'employes', action: 'TRANSFERT', entiteId: id,
    ancien: { agenceId: employe.agenceId, agenceNom: employe.agence?.nom ?? 'Siège' },
    nouveau: { agenceId, agenceNom: updated.agence?.nom ?? 'Siège' },
  });
  return updated;
}

export async function creerCompteSysteme(
  employeId: string,
  data: { email: string; motDePasse: string; role: string },
  userId: string
) {
  const employe = await prisma.employe.findUnique({ where: { id: employeId }, include: { utilisateur: true } });
  if (!employe) throw new AppError(404, 'Employé introuvable');
  if (employe.utilisateurId) throw new AppError(400, 'Cet employé a déjà un compte système');

  const existingEmail = await prisma.utilisateur.findUnique({ where: { email: data.email } });
  if (existingEmail) throw new AppError(400, 'Cette adresse email est déjà utilisée');

  const hash = await hashPassword(data.motDePasse);
  const utilisateur = await prisma.utilisateur.create({
    data: {
      email: data.email,
      motDePasse: hash,
      role: data.role as any,
      nom: employe.nom,
      prenom: employe.prenom,
      telephone: employe.telephone,
      agenceId: employe.agenceId,
    },
  });

  await prisma.employe.update({
    where: { id: employeId },
    data: { utilisateurId: utilisateur.id },
  });

  await createAuditLog({
    userId, table: 'employes', action: 'CREATE_COMPTE_SYSTEME', entiteId: employeId,
    nouveau: { utilisateurId: utilisateur.id, email: data.email, role: data.role },
  });

  return { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role, actif: utilisateur.actif, nom: utilisateur.nom, prenom: utilisateur.prenom };
}

export async function delierCompteSysteme(employeId: string, userId: string) {
  const employe = await prisma.employe.findUnique({ where: { id: employeId } });
  if (!employe) throw new AppError(404, 'Employé introuvable');
  if (!employe.utilisateurId) throw new AppError(400, 'Aucun compte système lié');
  await prisma.employe.update({ where: { id: employeId }, data: { utilisateurId: null } });
  await createAuditLog({ userId, table: 'employes', action: 'DELIER_COMPTE_SYSTEME', entiteId: employeId, nouveau: { ancien: employe.utilisateurId } });
}

// ─── Contrats ─────────────────────────────────────────────────────────────────

// À appeler depuis un cron job ou l'endpoint /api/rh/contrats/expire — pas depuis une lecture
export async function expirerContratsEchus() {
  return prisma.contrat.updateMany({
    where: { statut: 'ACTIF', dateFin: { lt: new Date() } },
    data: { statut: 'EXPIRE' },
  });
}

export async function listContrats(opts: { employeId?: string; statut?: string; page?: number; limit?: number }) {
  const { employeId, statut, page = 1, limit = 50 } = opts;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (employeId) where.employeId = employeId;
  if (statut) where.statut = statut;
  const [total, items] = await Promise.all([
    prisma.contrat.count({ where }),
    prisma.contrat.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { employe: { select: { nom: true, prenom: true, matricule: true } } } }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function createContrat(data: { employeId: string; type: string; dateDebut: string; dateFin?: string; salaireBrut: number; notes?: string }, userId: string) {
  const employe = await prisma.employe.findUnique({ where: { id: data.employeId } });
  if (!employe) throw new AppError(404, 'Employé introuvable');
  if (data.dateFin) {
    const fin = new Date(data.dateFin);
    const debut = new Date(data.dateDebut);
    if (fin <= debut) throw new AppError(400, 'La date de fin doit être postérieure à la date de début');
  }
  const reference = genRefContrat();
  const contrat = await prisma.contrat.create({
    data: { ...data, reference, dateDebut: new Date(data.dateDebut), dateFin: data.dateFin ? new Date(data.dateFin) : undefined } as any,
    include: { employe: { select: { nom: true, prenom: true, matricule: true } } },
  });
  await createAuditLog({ userId, table: 'contrats', action: 'CREATE', entiteId: contrat.id, nouveau: { reference, type: data.type } });
  return contrat;
}

export async function resilierContrat(id: string, userId: string) {
  const contrat = await prisma.contrat.findUnique({ where: { id } });
  if (!contrat) throw new AppError(404, 'Contrat introuvable');
  if (contrat.statut === 'RESILIE') throw new AppError(400, 'Contrat déjà résilié');
  const updated = await prisma.contrat.update({
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
    prisma.conge.count({ where }),
    prisma.conge.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { employe: { select: { nom: true, prenom: true, matricule: true } } } }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function createConge(data: { employeId: string; type: string; dateDebut: string; dateFin: string; motif?: string }, userId: string) {
  const employe = await prisma.employe.findUnique({ where: { id: data.employeId } });
  if (!employe) throw new AppError(404, 'Employé introuvable');
  const debut = new Date(data.dateDebut);
  const fin = new Date(data.dateFin);
  if (fin < debut) throw new AppError(400, 'La date de fin doit être après la date de début');

  const chevauchement = await prisma.conge.findFirst({
    where: {
      employeId: data.employeId,
      statut: { in: ['APPROUVE', 'EN_ATTENTE'] },
      dateDebut: { lte: fin },
      dateFin:   { gte: debut },
    },
  });
  if (chevauchement) throw new AppError(400, `Cet employé a déjà un congé (${chevauchement.type}) sur cette période`);
  const nbJours = nbJoursOuvres(debut, fin);
  const conge = await prisma.conge.create({
    data: { ...data, dateDebut: debut, dateFin: fin, nbJours } as any,
    include: { employe: { select: { nom: true, prenom: true, matricule: true } } },
  });
  return conge;
}

export async function updateStatutConge(id: string, statut: string, userId: string) {
  const conge = await prisma.conge.findUnique({ where: { id } });
  if (!conge) throw new AppError(404, 'Congé introuvable');
  if (!['APPROUVE', 'REFUSE', 'ANNULE'].includes(statut)) throw new AppError(400, 'Statut invalide');
  const updated = await prisma.conge.update({ where: { id }, data: { statut: statut as any } });
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
    prisma.fichePaie.count({ where }),
    prisma.fichePaie.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { employe: { select: { nom: true, prenom: true, matricule: true } } } }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function genererFichesPaie(periode: string, userId: string) {
  const employes = await prisma.employe.findMany({
    where: { statut: 'ACTIF' },
    // B8: Inclure les lignes du prêt actif pour récupérer la prochaine mensualité réelle
    include: { compte: { include: { client: { include: { prets: { where: { statut: 'EN_COURS' }, take: 1, include: { lignes: { where: { statut: { not: 'PAYE' } }, orderBy: { numeroEcheance: 'asc' }, take: 1 } } } } } } } },
  });
  const results = { crees: 0, ignores: 0 };

  const [pYear, pMonth] = periode.split('-').map(Number);
  const periodEnd = new Date(pYear, pMonth, 0);

  const employCandidats = employes.filter((emp) => new Date(emp.dateEmbauche) <= periodEnd);
  results.ignores += employes.length - employCandidats.length;

  if (employCandidats.length === 0) return results;

  const ids = employCandidats.map((e) => e.id);

  // 3 requêtes batch — élimination du N+1 (était 3 requêtes par employé)
  const [fichesDejaCrees, avancesEnAttente, tousElements] = await Promise.all([
    prisma.fichePaie.findMany({ where: { periode, employeId: { in: ids } }, select: { employeId: true } }),
    prisma.avanceSalaire.findMany({ where: { periodeDeduction: periode, statut: 'EN_ATTENTE', employeId: { in: ids } } }),
    prisma.elementVariable.findMany({ where: { periode, employeId: { in: ids } } }),
  ]);

  const ficheSet    = new Set(fichesDejaCrees.map((f) => f.employeId));
  const avancesMap  = new Map(avancesEnAttente.map((a) => [a.employeId, a]));
  const elementsMap = tousElements.reduce<Map<string, typeof tousElements>>((m, e) => {
    if (!m.has(e.employeId)) m.set(e.employeId, []);
    m.get(e.employeId)!.push(e);
    return m;
  }, new Map());

  for (const emp of employCandidats) {
    if (ficheSet.has(emp.id)) { results.ignores++; continue; }

    const brut = Number(emp.salaireBrut);
    const cotisations = Math.round(brut * 0.06 * 100) / 100;

    const avance      = avancesMap.get(emp.id) ?? null;
    const avanceDeduite = avance ? Number(avance.montant) : 0;

    // B8: Mensualité de la prochaine ligne de prêt impayée
    const pretActif = emp.compte?.client?.prets?.[0];
    const prochaineLigne = pretActif?.lignes?.[0];
    const creditDeduit = prochaineLigne ? Math.round(Number(prochaineLigne.mensualite) * 100) / 100 : 0;

    const elements = elementsMap.get(emp.id) ?? [];
    const totalPrimes   = elements.filter((e: any) => e.type !== 'RETENUE').reduce((s: number, e: any) => s + Number(e.montant), 0);
    const totalRetenues = elements.filter((e: any) => e.type === 'RETENUE').reduce((s: number, e: any) => s + Number(e.montant), 0);

    const brutAvecPrimes = brut + totalPrimes;
    const net = Math.round((brutAvecPrimes - cotisations - avanceDeduite - creditDeduit - totalRetenues) * 100) / 100;
    const reference = genRefPaie(emp.matricule, periode);

    await prisma.fichePaie.create({
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
      await prisma.avanceSalaire.update({ where: { id: avance.id }, data: { statut: 'DEDUITE' } });
    }

    // B11: Écriture au BRUT (et non au net) — Débit 6400 / Crédit 4600 = charge totale de personnel
    await creerEcritureAuto(prisma, {
      debitNumero:  '6400',
      creditNumero: '4600',
      montant: brutAvecPrimes,
      libelle: `Salaire ${emp.prenom} ${emp.nom} ${periode}`,
      date: new Date(),
      userId,
    });
    if (cotisations > 0) {
      // Ventilation ONA : prélèvement sur le salaire brut à payer — Débit 4600 / Crédit 4700
      await creerEcritureAuto(prisma, {
        debitNumero:  '4600',
        creditNumero: '4700',
        montant: cotisations,
        libelle: `Cotisations ONA ${emp.prenom} ${emp.nom} ${periode}`,
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
  const fiche = await prisma.fichePaie.findUnique({ where: { id: ficheId } });
  if (!fiche) throw new AppError(404, 'Fiche introuvable');
  if (fiche.statut !== 'BROUILLON') throw new AppError(400, 'Seules les fiches en brouillon peuvent être validées');

  const updated = await prisma.fichePaie.update({
    where: { id: ficheId },
    data: { statut: 'VALIDE', valideParId: userId },
    include: { employe: { select: { nom: true, prenom: true, matricule: true } } },
  });
  await createAuditLog({ userId, table: 'fiches_paie', action: 'VALIDATION', entiteId: ficheId });
  return updated;
}

export async function invaliderFiche(ficheId: string, userId: string) {
  const fiche = await prisma.fichePaie.findUnique({ where: { id: ficheId } });
  if (!fiche) throw new AppError(404, 'Fiche introuvable');
  if (fiche.statut !== 'VALIDE') throw new AppError(400, 'Seules les fiches validées peuvent être invalidées');

  const updated = await prisma.fichePaie.update({
    where: { id: ficheId },
    data: { statut: 'BROUILLON', valideParId: null },
    include: { employe: { select: { nom: true, prenom: true, matricule: true } } },
  });
  await createAuditLog({ userId, table: 'fiches_paie', action: 'INVALIDATION', entiteId: ficheId });
  return updated;
}

export async function payerSalaires(periode: string, userId: string) {
  const fiches = await prisma.fichePaie.findMany({
    where: { periode, statut: 'VALIDE' },
    include: { employe: { include: { compte: true } } },
  });
  if (fiches.length === 0) throw new AppError(400, 'Aucune fiche validée pour cette période. Validez d\'abord les bulletins.');

  let payes = 0, virements = 0, especes = 0, totalNet = 0, totalCotisations = 0;

  // B5: Toutes les opérations de paie dans une seule transaction atomique
  // Un crash partiel ne laissera plus certains employés payés et d'autres non
  await prisma.$transaction(async (tx) => {
    for (const fiche of fiches) {
      const emp = fiche.employe;
      const net = Number(fiche.salaireNet);

      if (fiche.modeReglement === 'VIREMENT_BANKA' && emp.compteId) {
        // Lire le solde dans la transaction pour snapshot cohérent
        const compte = await tx.compte.findUnique({ where: { id: emp.compteId }, select: { solde: true } });
        const soldeAvant = Number(compte?.solde || 0);
        await tx.compte.update({ where: { id: emp.compteId }, data: { solde: { increment: net } } });
        await tx.transaction.create({
          data: {
            reference: `SAL-${emp.matricule}-${periode}`,
            type: 'VIREMENT_CREDIT',
            montant: net,
            devise: 'HTG',
            soldeAvant,
            soldeApres: soldeAvant + net,
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

      if (Number(fiche.creditDeduit) > 0) {
        await creerEcritureAuto(tx, {
          debitNumero:  '2000',
          creditNumero: '4600',
          montant: Number(fiche.creditDeduit),
          libelle: `Remboursement crédit retenu sur salaire ${emp.prenom} ${emp.nom} ${periode}`,
          date: new Date(),
          userId,
        });
      }

      await (tx as any).fichePaie.update({ where: { id: fiche.id }, data: { statut: 'PAYE' } });

      totalNet += net;
      totalCotisations += Number(fiche.cotisations);
      payes++;
    }

    // Écritures globales de décaissement dans la même transaction
    await creerEcritureAuto(tx, {
      debitNumero:  '4600',
      creditNumero: '5700',
      montant: totalNet,
      libelle: `Virement salaires nets ${periode} (${virements} virement(s), ${especes} espèces)`,
      date: new Date(),
      userId,
    });
    if (totalCotisations > 0) {
      await creerEcritureAuto(tx, {
        debitNumero:  '4700',
        creditNumero: '5700',
        montant: totalCotisations,
        libelle: `Paiement cotisations sociales ${periode}`,
        date: new Date(),
        userId,
      });
    }
  });

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
  if (!data.montant || data.montant <= 0) throw new AppError(400, 'Le montant de l\'avance doit être positif');
  const emp = await prisma.employe.findUnique({ where: { id: data.employeId } });
  if (!emp) throw new AppError(404, 'Employé introuvable');
  if (emp.statut !== 'ACTIF') throw new AppError(400, 'Impossible d\'accorder une avance à un employé inactif');

  const dejaAvance = await prisma.avanceSalaire.findFirst({
    where: { employeId: data.employeId, periodeDeduction: data.periodeDeduction, statut: 'EN_ATTENTE' },
  });
  if (dejaAvance) throw new AppError(400, 'Une avance est déjà prévue pour cet employé sur cette période');

  if (data.montant > Number(emp.salaireBrut) * 0.5) {
    throw new AppError(400, 'L\'avance ne peut pas dépasser 50% du salaire brut');
  }

  // B10: Création de l'avance + crédit du compte + écriture comptable dans une seule transaction atomique
  const avance = await prisma.$transaction(async (tx) => {
    const created = await (tx as any).avanceSalaire.create({
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

    if (emp.compteId) {
      await tx.compte.update({ where: { id: emp.compteId }, data: { solde: { increment: data.montant } } });
      await creerEcritureAuto(tx, {
        debitNumero:  '4650',
        creditNumero: '5700',
        montant: data.montant,
        libelle: `Avance sur salaire ${emp.prenom} ${emp.nom} — déduction prévue ${data.periodeDeduction}`,
        date: new Date(),
        userId,
      });
    }

    return created;
  });

  await createAuditLog({ userId, table: 'avances_salaire', action: 'CREATE', entiteId: avance.id, nouveau: data });
  return avance;
}

export async function listAvances(opts: { employeId?: string; periode?: string; statut?: string }) {
  const where: any = {};
  if (opts.employeId) where.employeId = opts.employeId;
  if (opts.periode) where.periodeDeduction = opts.periode;
  if (opts.statut) where.statut = opts.statut;

  return prisma.avanceSalaire.findMany({
    where,
    include: { employe: { select: { nom: true, prenom: true, matricule: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function annulerAvance(avanceId: string, userId: string) {
  const avance = await prisma.avanceSalaire.findUnique({
    where: { id: avanceId },
    include: { employe: true },
  });
  if (!avance) throw new AppError(404, 'Avance introuvable');
  if (avance.statut !== 'EN_ATTENTE') throw new AppError(400, 'Seules les avances en attente peuvent être annulées');

  await prisma.$transaction(async (tx) => {
    if (avance.employe.compteId) {
      await tx.compte.update({ where: { id: avance.employe.compteId }, data: { solde: { decrement: Number(avance.montant) } } });
    }
    await (tx as any).avanceSalaire.update({ where: { id: avanceId }, data: { statut: 'ANNULEE' } });
  });

  await createAuditLog({ userId, table: 'avances_salaire', action: 'ANNULATION', entiteId: avanceId });
}

// ── Éléments variables (primes, bonus, retenues) ────────────────────────────

export async function listElementsVariables(opts: { employeId?: string; periode?: string }) {
  const where: any = {};
  if (opts.employeId) where.employeId = opts.employeId;
  if (opts.periode) where.periode = opts.periode;
  return prisma.elementVariable.findMany({
    where,
    include: { employe: { select: { nom: true, prenom: true, matricule: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

const TYPES_ELEMENT_VALIDES = ['PRIME', 'BONUS', 'INDEMNITE', 'RETENUE', 'HEURE_SUP'];

export async function createElementVariable(
  data: { employeId: string; periode: string; type: string; libelle: string; montant: number; notes?: string },
  userId: string
) {
  if (!TYPES_ELEMENT_VALIDES.includes(data.type)) throw new AppError(400, `Type invalide. Valeurs acceptées : ${TYPES_ELEMENT_VALIDES.join(', ')}`);
  if (!data.libelle?.trim()) throw new AppError(400, 'Le libellé est requis');
  if (!data.montant || data.montant <= 0) throw new AppError(400, 'Le montant doit être positif');
  const emp = await prisma.employe.findUnique({ where: { id: data.employeId } });
  if (!emp) throw new AppError(404, 'Employé introuvable');

  const ficheExistante = await prisma.fichePaie.findUnique({
    where: { employeId_periode: { employeId: data.employeId, periode: data.periode } },
  });
  if (ficheExistante && ficheExistante.statut !== 'BROUILLON') {
    throw new AppError(400, 'Impossible d\'ajouter un élément variable : la fiche de paie est déjà validée ou payée');
  }

  const element = await prisma.elementVariable.create({
    data: {
      employeId: data.employeId,
      periode: data.periode,
      type: data.type as any,
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
  const element = await prisma.elementVariable.findUnique({ where: { id } });
  if (!element) throw new AppError(404, 'Élément introuvable');

  const ficheExistante = await prisma.fichePaie.findUnique({
    where: { employeId_periode: { employeId: element.employeId, periode: element.periode } },
  });
  if (ficheExistante && ficheExistante.statut !== 'BROUILLON') {
    throw new AppError(400, 'Impossible de supprimer : la fiche de paie est déjà validée ou payée');
  }

  await prisma.elementVariable.delete({ where: { id } });
  await createAuditLog({ userId, table: 'elements_variables', action: 'DELETE', entiteId: id });
}
