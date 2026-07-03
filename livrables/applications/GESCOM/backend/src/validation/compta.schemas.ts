import { z } from 'zod';

export const createEcritureSchema = z.object({
  compteDebitId: z.string().min(1, 'Compte débit requis'),
  compteCreditId: z.string().min(1, 'Compte crédit requis'),
  montant: z.coerce.number().positive('Montant > 0'),
  libelle: z.string().min(1, 'Libellé requis').max(255),
  date: z.string().optional(),
});
