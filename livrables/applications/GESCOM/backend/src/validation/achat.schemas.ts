import { z } from 'zod';

export const createFournisseurSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(150),
  telephone: z.string().max(20).optional(),
  adresse: z.string().max(255).optional(),
});

export const updateFournisseurSchema = createFournisseurSchema.partial();

const ligneCommandeSchema = z.object({
  produitId: z.string().min(1, 'Produit requis'),
  quantiteCommandee: z.coerce.number().int().positive('Quantité > 0'),
  prixUnitaireAchat: z.coerce.number().min(0),
});

export const createCommandeSchema = z.object({
  fournisseurId: z.string().min(1, 'Fournisseur requis'),
  emplacementId: z.string().min(1, 'Emplacement de destination requis'),
  notes: z.string().max(500).optional(),
  dateLivraisonPrevue: z.string().optional(),
  lignes: z.array(ligneCommandeSchema).min(1, 'Au moins une ligne requise'),
});

const ligneReceptionSchema = z.object({
  ligneId: z.string().min(1),
  quantiteRecue: z.coerce.number().int().min(0),
});

export const receptionCommandeSchema = z.object({
  lignes: z.array(ligneReceptionSchema).min(1),
});
