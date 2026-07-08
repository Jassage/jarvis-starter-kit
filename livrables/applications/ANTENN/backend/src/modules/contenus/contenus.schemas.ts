import { z } from 'zod';

const typeContenuEnum = z.enum(['VIDEO_BOUCLE', 'SPOT_PUBLICITAIRE', 'HABILLAGE_LOGO']);

export const createContenuSchema = z.object({
  body: z.object({
    titre: z.string().min(2, 'Titre requis'),
    typeContenu: typeContenuEnum,
    // URL déjà hébergée (CDN/stockage existant) — pas d'upload/transcodage vidéo ici
    urlFichier: z.string().url('URL de fichier invalide'),
    dureeSecondes: z.coerce.number().int().min(0),
    sponsorId: z.string().optional().nullable(),
  }),
});

export const updateContenuSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    titre: z.string().min(2).optional(),
    typeContenu: typeContenuEnum.optional(),
    urlFichier: z.string().url().optional(),
    dureeSecondes: z.coerce.number().int().min(0).optional(),
    sponsorId: z.string().optional().nullable(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string() }),
});
