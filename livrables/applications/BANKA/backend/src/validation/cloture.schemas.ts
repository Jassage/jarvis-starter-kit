import { z } from 'zod';

const periodeRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

export const cloturerPeriodeSchema = z.object({
  periode: z.string().regex(periodeRegex, 'Format attendu : YYYY-MM'),
  forcerMalgreDesequilibre: z.boolean().optional(),
});

export const rouvrirPeriodeSchema = z.object({
  periode: z.string().regex(periodeRegex, 'Format attendu : YYYY-MM'),
});
