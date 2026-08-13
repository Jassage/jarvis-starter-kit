import { z } from 'zod';

const formePharmaceutiqueEnum = z.enum([
  'COMPRIME',
  'GELULE',
  'SIROP',
  'INJECTABLE',
  'POMMADE_CREME',
  'SUPPOSITOIRE',
  'SACHET',
  'GOUTTE',
  'SOLUTE',
  'AUTRE',
]);

export const createProduitSchema = z.object({
  body: z.object({
    nom: z.string().min(1, 'Le nom est requis'),
    dci: z.string().optional(),
    dosage: z.string().optional(),
    formePharmaceutique: formePharmaceutiqueEnum.default('AUTRE'),
    codeBarres: z.string().optional(),
    categorieId: z.string().optional(),
    prixAchat: z.coerce.number().nonnegative('Le prix d\'achat doit être positif'),
    prixVente: z.coerce.number().nonnegative('Le prix de vente doit être positif'),
    seuilAlerte: z.coerce.number().int().nonnegative().default(10),
    necessiteOrdonnance: z.coerce.boolean().default(false),
    substanceControlee: z.coerce.boolean().default(false),
  }),
});

export const updateProduitSchema = z.object({
  body: createProduitSchema.shape.body.partial().extend({
    actif: z.coerce.boolean().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const listProduitsQuerySchema = z.object({
  query: z.object({
    recherche: z.string().optional(),
    categorieId: z.string().optional(),
    alerteStock: z.coerce.boolean().optional(),
    tous: z.coerce.boolean().optional(),
  }),
});

export const createCategorieSchema = z.object({
  body: z.object({
    nom: z.string().min(1, 'Le nom est requis'),
    description: z.string().optional(),
  }),
});
