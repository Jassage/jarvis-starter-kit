import { z } from 'zod';

// Fenêtre de droits : bornes optionnelles, mais si les deux sont posées la fin doit
// suivre le début (sinon le replay ne serait jamais visible).
const fenetreRefinement = <T extends { disponibleDu?: string | null; disponibleAu?: string | null }>(data: T) =>
  !data.disponibleDu || !data.disponibleAu || new Date(data.disponibleAu) > new Date(data.disponibleDu);
const fenetreMessage = { message: 'La fin de disponibilité doit suivre le début', path: ['disponibleAu'] };

const baseBody = {
  titre: z.string().min(2, 'Titre requis'),
  description: z.string().optional().nullable(),
  // URL déjà hébergée (CDN / enregistrement MediaMTX) — ANTENN n'héberge pas la vidéo
  urlVod: z.string().url('URL VOD invalide'),
  dureeSecondes: z.coerce.number().int().min(0),
  disponibleDu: z.string().datetime().optional().nullable(),
  disponibleAu: z.string().datetime().optional().nullable(),
  matchId: z.string().optional().nullable(),
};

export const createReplaySchema = z.object({
  body: z.object(baseBody).refine(fenetreRefinement, fenetreMessage),
});

// Depuis un créneau : tout est optionnel, le service pré-remplit depuis la grille.
// urlVod reste requis côté service pour un match direct (aucun fichier n'existe).
export const createDepuisCreneauSchema = z.object({
  params: z.object({ creneauId: z.string() }),
  body: z
    .object({
      titre: z.string().min(2).optional(),
      description: z.string().optional().nullable(),
      urlVod: z.string().url('URL VOD invalide').optional(),
      dureeSecondes: z.coerce.number().int().min(0).optional(),
      disponibleDu: z.string().datetime().optional().nullable(),
      disponibleAu: z.string().datetime().optional().nullable(),
    })
    .refine(fenetreRefinement, fenetreMessage),
});

export const updateReplaySchema = z.object({
  params: z.object({ id: z.string() }),
  body: z
    .object({
      titre: z.string().min(2).optional(),
      description: z.string().optional().nullable(),
      urlVod: z.string().url('URL VOD invalide').optional(),
      dureeSecondes: z.coerce.number().int().min(0).optional(),
      disponibleDu: z.string().datetime().optional().nullable(),
      disponibleAu: z.string().datetime().optional().nullable(),
    })
    .refine(fenetreRefinement, fenetreMessage),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string() }),
});

export const catalogueQuerySchema = z.object({
  query: z.object({
    q: z.string().optional(),
    type: z.enum(['MATCH', 'PROGRAMME']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(24),
  }),
});
