import { Prisma } from '@prisma/client';
import { AppError } from '../../middlewares/errorHandler.middleware';

export function differenceEnNuits(dateArrivee: Date, dateDepart: Date): number {
  const ms = dateDepart.getTime() - dateArrivee.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

// Même convention UTC que debutAujourdhui dans reservations.service.ts et
// bornesAujourdhui dans reception.service.ts — un séjour day-use doit tenir dans
// un seul jour calendaire UTC, jamais comparé en heure locale serveur.
export function estMemeJourCalendaireUTC(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

// Un séjour déjà terminé (départ passé) est un historique figé — jamais modifiable
// ni annulable, quel que soit le rôle. Même garde que ANTENN::assertModifiable.
export function assertModifiable(dateDepart: Date): void {
  if (dateDepart < new Date()) {
    throw new AppError('Ce séjour est déjà terminé : la réservation ne peut plus être modifiée', 409);
  }
}

// La contrainte d'exclusion PostgreSQL (migration exclude_overlap_reservation) n'est
// pas répertoriée dans les codes connus de Prisma — elle remonte en erreur "unknown"
// avec le message brut du driver, d'où la détection par code SQLSTATE/texte plutôt
// que par err.code strictement typé.
export function isExclusionViolation(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientUnknownRequestError || err instanceof Prisma.PrismaClientKnownRequestError) {
    return err.message.includes('23P01') || err.message.toLowerCase().includes('exclusion constraint');
  }
  return false;
}
