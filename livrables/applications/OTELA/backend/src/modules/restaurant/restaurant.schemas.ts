import { z } from 'zod';

export const creerPointDeVenteSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(100),
    type: z.enum(['RESTAURANT', 'BAR']),
  }),
});

export const creerTableSchema = z.object({
  body: z.object({
    pointDeVenteId: z.string(),
    numero: z.string().min(1).max(20),
    capacite: z.number().int().positive(),
  }),
});

export const creerMenuItemSchema = z.object({
  body: z.object({
    pointDeVenteId: z.string(),
    nom: z.string().min(1).max(150),
    prix: z.number().positive(),
    devise: z.enum(['HTG', 'USD']),
    categorie: z.enum(['ENTREE', 'PLAT', 'DESSERT', 'BOISSON', 'CARTE_BAR']),
  }),
});

export const updateMenuItemSchema = z.object({
  body: z.object({
    nom: z.string().min(1).max(150).optional(),
    prix: z.number().positive().optional(),
    categorie: z.enum(['ENTREE', 'PLAT', 'DESSERT', 'BOISSON', 'CARTE_BAR']).optional(),
    disponible: z.boolean().optional(),
  }),
});

export const ouvrirCommandeSchema = z.object({
  body: z.object({
    tableId: z.string(),
  }),
});

export const ajouterLigneCommandeSchema = z.object({
  body: z.object({
    menuItemId: z.string(),
    quantite: z.number().int().positive(),
    notes: z.string().max(300).optional(),
  }),
});

export const cloturerCommandeSchema = z.object({
  body: z.object({
    chambreNumero: z.string().min(1).optional(),
    methodePaiement: z.enum(['ESPECES', 'CARTE', 'MONCASH', 'AUTRE']).optional(),
  }).refine((d) => d.chambreNumero || d.methodePaiement, {
    message: 'chambreNumero ou methodePaiement requis',
  }),
});
