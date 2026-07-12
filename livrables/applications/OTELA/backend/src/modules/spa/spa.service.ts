import { Devise, MethodePaiement, Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { findOrCreateClient } from '../clients/clients.service';
import { getFolioOuvertParNumeroChambre, ajouterLigneFolio } from '../folios/folios.service';

const INCLUDE_RDV = { serviceSpa: true, praticien: true, client: true };

// ─────────────────────────────────────────
// Admin établissement : services / praticiens
// ─────────────────────────────────────────

export async function listServices(etablissementId: string) {
  return prisma.serviceSpa.findMany({ where: { etablissementId }, orderBy: { nom: 'asc' } });
}

export async function creerService(etablissementId: string, data: { nom: string; dureeMinutes: number; prix: number; devise: Devise }) {
  return prisma.serviceSpa.create({ data: { etablissementId, ...data } });
}

export async function updateService(id: string, etablissementId: string, data: Partial<{ nom: string; dureeMinutes: number; prix: number; actif: boolean }>) {
  const service = await prisma.serviceSpa.findUnique({ where: { id } });
  if (!service || service.etablissementId !== etablissementId) throw new AppError('Service introuvable', 404);
  return prisma.serviceSpa.update({ where: { id }, data });
}

export async function listPraticiens(etablissementId: string) {
  return prisma.praticien.findMany({ where: { etablissementId }, orderBy: { nom: 'asc' } });
}

export async function creerPraticien(etablissementId: string, data: { nom: string; specialites?: string }) {
  return prisma.praticien.create({ data: { etablissementId, ...data } });
}

export async function updatePraticien(id: string, etablissementId: string, data: Partial<{ nom: string; specialites: string; actif: boolean }>) {
  const praticien = await prisma.praticien.findUnique({ where: { id } });
  if (!praticien || praticien.etablissementId !== etablissementId) throw new AppError('Praticien introuvable', 404);
  return prisma.praticien.update({ where: { id }, data });
}

// ─────────────────────────────────────────
// Rendez-vous
// ─────────────────────────────────────────

export async function listRendezVous(etablissementId: string, date?: Date) {
  const where: Prisma.RendezVousSpaWhereInput = { serviceSpa: { etablissementId } };
  if (date) {
    const debut = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const fin = new Date(debut.getTime() + 24 * 60 * 60 * 1000);
    where.dateHeure = { gte: debut, lt: fin };
  }
  return prisma.rendezVousSpa.findMany({ where, include: INCLUDE_RDV, orderBy: { dateHeure: 'asc' } });
}

export async function creerRendezVous(
  etablissementId: string,
  data: { serviceSpaId: string; praticienId: string; dateHeure: Date; client: { nom: string; telephone: string; email: string } }
) {
  const service = await prisma.serviceSpa.findUnique({ where: { id: data.serviceSpaId } });
  if (!service || service.etablissementId !== etablissementId) throw new AppError('Service introuvable', 404);
  const praticien = await prisma.praticien.findUnique({ where: { id: data.praticienId } });
  if (!praticien || praticien.etablissementId !== etablissementId) throw new AppError('Praticien introuvable', 404);

  const debut = data.dateHeure;
  const fin = new Date(debut.getTime() + service.dureeMinutes * 60000);

  // Chevauchement vérifié en application (pas de contrainte d'exclusion Postgres
  // ici, enjeu bien moindre qu'une double réservation de chambre) sur les RDV
  // confirmés du même praticien ce jour-là.
  const jourDebut = new Date(Date.UTC(debut.getUTCFullYear(), debut.getUTCMonth(), debut.getUTCDate()));
  const jourFin = new Date(jourDebut.getTime() + 24 * 60 * 60 * 1000);
  const rdvExistants = await prisma.rendezVousSpa.findMany({
    where: { praticienId: data.praticienId, statut: 'CONFIRME', dateHeure: { gte: jourDebut, lt: jourFin } },
    include: { serviceSpa: true },
  });
  const chevauche = rdvExistants.some((r) => {
    const rDebut = r.dateHeure;
    const rFin = new Date(rDebut.getTime() + r.serviceSpa.dureeMinutes * 60000);
    return debut < rFin && fin > rDebut;
  });
  if (chevauche) throw new AppError('Ce praticien a déjà un rendez-vous sur ce créneau', 409);

  const client = await findOrCreateClient(data.client);

  return prisma.rendezVousSpa.create({
    data: { serviceSpaId: data.serviceSpaId, praticienId: data.praticienId, clientId: client.id, dateHeure: data.dateHeure },
    include: INCLUDE_RDV,
  });
}

async function trouverRendezVous(id: string, etablissementId: string) {
  const rdv = await prisma.rendezVousSpa.findUnique({ where: { id }, include: INCLUDE_RDV });
  if (!rdv || rdv.serviceSpa.etablissementId !== etablissementId) throw new AppError('Rendez-vous introuvable', 404);
  return rdv;
}

export async function annulerRendezVous(id: string, etablissementId: string) {
  await trouverRendezVous(id, etablissementId);
  const upd = await prisma.rendezVousSpa.updateMany({ where: { id, statut: 'CONFIRME' }, data: { statut: 'ANNULE' } });
  if (upd.count === 0) throw new AppError('Ce rendez-vous ne peut plus être annulé', 409);
  return trouverRendezVous(id, etablissementId);
}

// Clôture : "ajouter au folio chambre X" (résident) ou paiement direct (client de
// passage) — même pattern que restaurant.service.ts::cloturerCommande().
export async function terminerRendezVous(
  id: string,
  etablissementId: string,
  data: { chambreNumero?: string; methodePaiement?: MethodePaiement },
  employeId?: string
) {
  const rdv = await trouverRendezVous(id, etablissementId);
  if (rdv.statut !== 'CONFIRME') throw new AppError('Ce rendez-vous ne peut plus être clôturé', 409);

  const description = `${rdv.serviceSpa.nom} — ${rdv.praticien.nom}`;

  if (data.chambreNumero) {
    const folio = await getFolioOuvertParNumeroChambre(data.chambreNumero, etablissementId);
    return prisma.$transaction(async (tx) => {
      await ajouterLigneFolio(tx, folio.id, {
        departementSource: 'SPA',
        description,
        montant: Number(rdv.serviceSpa.prix),
        employeId,
      });
      await tx.rendezVousSpa.update({ where: { id }, data: { statut: 'TERMINE', folioId: folio.id } });
      return tx.rendezVousSpa.findUnique({ where: { id }, include: INCLUDE_RDV });
    });
  }

  if (!data.methodePaiement) throw new AppError('methodePaiement requis pour un client non-résident', 400);

  return prisma.rendezVousSpa.update({
    where: { id },
    data: { statut: 'TERMINE', methodePaiement: data.methodePaiement },
    include: INCLUDE_RDV,
  });
}
