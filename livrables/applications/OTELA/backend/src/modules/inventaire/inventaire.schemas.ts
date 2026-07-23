import { z } from 'zod';

export const creerArticleSchema = z.object({
  body: z.object({
    nom: z.string().min(1),
    categorie: z.enum(['LINGE', 'CONSOMMABLE', 'PRODUIT_ENTRETIEN', 'AUTRE']).optional(),
    unite: z.string().min(1).optional(),
    seuilAlerte: z.number().int().min(0).optional(),
  }),
});

export const updateArticleSchema = z.object({
  body: z.object({
    nom: z.string().min(1).optional(),
    categorie: z.enum(['LINGE', 'CONSOMMABLE', 'PRODUIT_ENTRETIEN', 'AUTRE']).optional(),
    unite: z.string().min(1).optional(),
    seuilAlerte: z.number().int().min(0).optional(),
    actif: z.boolean().optional(),
  }),
});

export const enregistrerMouvementSchema = z.object({
  body: z.object({
    type: z.enum(['ENTREE', 'SORTIE', 'AJUSTEMENT']),
    // ENTREE/SORTIE : quantité du mouvement (toujours positive). AJUSTEMENT : valeur
    // ABSOLUE du nouveau stock (pas un delta) — cf. inventaire.service.ts.
    quantite: z.number().int().min(0),
    motif: z.string().optional(),
  }),
});
