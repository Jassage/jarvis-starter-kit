import { PrioriteTicket, StatutChambre, StatutTicketMaintenance } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';

const INCLUDE_TICKET = {
  chambre: { include: { typeChambre: true } },
  signalant: { select: { id: true, nom: true } },
  employeAssigne: { select: { id: true, nom: true } },
} satisfies import('@prisma/client').Prisma.TicketMaintenanceInclude;

export async function listTickets(etablissementId: string, statut?: StatutTicketMaintenance) {
  return prisma.ticketMaintenance.findMany({
    where: { etablissementId, ...(statut ? { statut } : {}) },
    include: INCLUDE_TICKET,
    orderBy: [{ priorite: 'desc' }, { dateSignalement: 'desc' }],
  });
}

export async function listEmployesMaintenance(etablissementId: string) {
  return prisma.employe.findMany({
    where: { etablissementId, role: 'MAINTENANCE', isActive: true },
    select: { id: true, nom: true },
    orderBy: { nom: 'asc' },
  });
}

interface CreerTicketInput {
  chambreId?: string;
  zone?: string;
  titre: string;
  description?: string;
  priorite?: PrioriteTicket;
  bloqueChambre?: boolean;
}

// Signaler un problème ne doit jamais échouer parce que la chambre est occupée : si
// bloqueChambre est demandé mais que la chambre n'est pas DISPONIBLE, le ticket est
// quand même créé, seul le flag est ramené à false (documenté ici plutôt que rejeté).
export async function creerTicket(etablissementId: string | null | undefined, signalantId: string, data: CreerTicketInput) {
  if (!etablissementId) throw new AppError('etablissementId requis', 400);

  if (data.chambreId) {
    const chambre = await prisma.chambre.findUnique({ where: { id: data.chambreId } });
    if (!chambre) throw new AppError('Chambre non trouvée', 404);
    if (chambre.etablissementId !== etablissementId) {
      throw new AppError('Cette chambre n\'appartient pas à votre établissement', 403);
    }

    const veutBloquer = data.bloqueChambre === true;
    const peutBloquer = veutBloquer && chambre.statut === StatutChambre.DISPONIBLE;

    if (peutBloquer) {
      return prisma.$transaction(async (tx) => {
        const ticket = await tx.ticketMaintenance.create({
          data: {
            etablissementId,
            chambreId: data.chambreId,
            titre: data.titre,
            description: data.description,
            priorite: data.priorite ?? PrioriteTicket.NORMALE,
            signalantId,
            bloqueChambre: true,
          },
        });
        // CAS : ne bascule que si la chambre est toujours disponible au moment
        // d'écrire (deux signalements simultanés ne doivent pas se marcher dessus).
        const bascule = await tx.chambre.updateMany({
          where: { id: data.chambreId, statut: StatutChambre.DISPONIBLE },
          data: { statut: StatutChambre.MAINTENANCE },
        });
        if (bascule.count === 0) {
          // Perdu la course : le ticket reste créé, mais sans avoir mis la chambre hors
          // service (quelqu'un d'autre l'a changée entre-temps).
          await tx.ticketMaintenance.update({ where: { id: ticket.id }, data: { bloqueChambre: false } });
        }
        return tx.ticketMaintenance.findUnique({ where: { id: ticket.id }, include: INCLUDE_TICKET });
      });
    }
  }

  return prisma.ticketMaintenance.create({
    data: {
      etablissementId,
      chambreId: data.chambreId,
      zone: data.zone,
      titre: data.titre,
      description: data.description,
      priorite: data.priorite ?? PrioriteTicket.NORMALE,
      signalantId,
      bloqueChambre: false,
    },
    include: INCLUDE_TICKET,
  });
}

interface UpdateTicketInput {
  statut?: StatutTicketMaintenance;
  employeAssigneId?: string | null;
  priorite?: PrioriteTicket;
  notesResolution?: string;
}

export async function updateTicket(id: string, etablissementId: string | null | undefined, data: UpdateTicketInput) {
  const ticket = await prisma.ticketMaintenance.findUnique({ where: { id } });
  if (!ticket) throw new AppError('Ticket non trouvé', 404);
  if (etablissementId && ticket.etablissementId !== etablissementId) {
    throw new AppError('Ce ticket n\'appartient pas à votre établissement', 403);
  }

  if (data.statut === StatutTicketMaintenance.RESOLU) {
    return prisma.$transaction(async (tx) => {
      const majTicket = await tx.ticketMaintenance.updateMany({
        where: { id, statut: { not: StatutTicketMaintenance.RESOLU } },
        data: { ...data, dateResolution: new Date() },
      });
      if (majTicket.count === 0) throw new AppError('Ce ticket est déjà résolu', 409);

      if (ticket.bloqueChambre && ticket.chambreId) {
        // Ne restaure la disponibilité que si aucun AUTRE ticket encore ouvert ne
        // bloque la même chambre — sinon on écraserait un second problème en cours.
        const autreTicketBloquant = await tx.ticketMaintenance.findFirst({
          where: {
            chambreId: ticket.chambreId,
            id: { not: id },
            bloqueChambre: true,
            statut: { not: StatutTicketMaintenance.RESOLU },
          },
        });
        if (!autreTicketBloquant) {
          await tx.chambre.updateMany({
            where: { id: ticket.chambreId, statut: StatutChambre.MAINTENANCE },
            data: { statut: StatutChambre.DISPONIBLE },
          });
        }
      }

      return tx.ticketMaintenance.findUnique({ where: { id }, include: INCLUDE_TICKET });
    });
  }

  await prisma.ticketMaintenance.update({ where: { id }, data });
  return prisma.ticketMaintenance.findUnique({ where: { id }, include: INCLUDE_TICKET });
}
