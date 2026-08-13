import { z } from 'zod';

const categorieEnum = z.enum(['LOYER', 'ELECTRICITE', 'INTERNET', 'TRANSPORT', 'SALAIRES', 'FOURNITURES', 'MAINTENANCE', 'AUTRES']);
const modePaiementEnum = z.enum(['ESPECES', 'CARTE', 'VIREMENT', 'CHEQUE', 'MOBILE_MONEY', 'CREDIT', 'AUTRE']);

export const creerDepenseSchema = z.object({
  body: z.object({
    categorie: categorieEnum,
    montant: z.coerce.number().positive('Le montant doit être positif'),
    description: z.string().optional(),
    modePaiement: modePaiementEnum,
  }),
});

export const listDepensesQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().max(200).default(50),
    categorie: categorieEnum.optional(),
  }),
});
