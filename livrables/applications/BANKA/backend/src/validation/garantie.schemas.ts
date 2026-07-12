import { z } from 'zod';

export const createGarantieSchema = z.object({
  type: z.enum(['HYPOTHEQUE', 'NANTISSEMENT', 'CAUTION', 'GAGE', 'AUTRE']),
  description: z.string().min(1, 'Description requise').max(1000),
  valeurEstimee: z.number().min(0).optional(),
  dateConstit: z.coerce.date().optional(),
  notes: z.string().max(1000).optional(),
});

// Whitelist stricte : pretId est volontairement exclu — une garantie ne change pas de prêt
export const updateGarantieSchema = z.object({
  statut: z.enum(['ACTIVE', 'LEVEE', 'SAISIE']).optional(),
  description: z.string().min(1).max(1000).optional(),
  valeurEstimee: z.number().min(0).optional(),
  dateLevee: z.coerce.date().optional(),
  notes: z.string().max(1000).optional(),
});
