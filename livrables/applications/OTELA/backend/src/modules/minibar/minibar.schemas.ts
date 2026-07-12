import { z } from 'zod';

export const creerArticleSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150),
    prix: z.number().positive(),
    devise: z.enum(['HTG', 'USD']),
  }),
});

export const constaterConsommationSchema = z.object({
  body: z.object({
    chambreId: z.string(),
    articles: z.array(z.object({
      articleMinibarId: z.string(),
      quantite: z.number().int().positive(),
    })).min(1),
  }),
});
