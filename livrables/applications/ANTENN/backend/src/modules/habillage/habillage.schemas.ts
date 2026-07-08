import { z } from 'zod';

const positionEnum = z.enum(['HAUT_GAUCHE', 'HAUT_DROITE', 'BAS_GAUCHE', 'BAS_DROITE']);

export const createIncrustationSchema = z.object({
  body: z.object({
    creneauId: z.string().optional().nullable(),
    matchId: z.string().optional().nullable(),
    sponsorId: z.string().min(1, 'Sponsor requis'),
    logoUrl: z.string().url('URL de logo invalide'),
    position: positionEnum.default('BAS_DROITE'),
    opacite: z.coerce.number().min(0).max(1).default(0.85),
    actif: z.coerce.boolean().default(true),
  }).refine((d) => Boolean(d.creneauId) || Boolean(d.matchId), {
    message: 'Une incrustation doit être rattachée à un créneau ou à un match',
    path: ['creneauId'],
  }),
});

export const createBandeauSchema = z.object({
  body: z.object({
    creneauId: z.string().optional().nullable(),
    matchId: z.string().optional().nullable(),
    items: z.array(z.object({
      texte: z.string().min(1),
      logoUrl: z.string().url().optional(),
      sponsorId: z.string().optional(),
    })).min(1, 'Au moins un élément de bandeau requis'),
    vitesseDefilement: z.coerce.number().int().min(10).max(300).default(60),
    actif: z.coerce.boolean().default(true),
  }).refine((d) => Boolean(d.creneauId) || Boolean(d.matchId), {
    message: 'Un bandeau doit être rattaché à un créneau ou à un match',
    path: ['creneauId'],
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string() }),
});
