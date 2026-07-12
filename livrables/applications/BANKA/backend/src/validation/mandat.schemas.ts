import { z } from 'zod';

const DROITS = ['CONSULTATION', 'DEPOT', 'RETRAIT', 'VIREMENT', 'SIGNATURE'] as const;

export const createMandatSchema = z.object({
  mandataireId: z.string().cuid('Identifiant mandataire invalide'),
  droits: z.array(z.enum(DROITS)).min(1, 'Au moins un droit doit être accordé'),
  dateFin: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateMandatSchema = z.object({
  droits: z.array(z.enum(DROITS)).min(1, 'Au moins un droit doit être accordé').optional(),
  dateFin: z.string().datetime().nullable().optional(),
  notes: z.string().max(1000).optional(),
});
