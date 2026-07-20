import { z } from 'zod';

const positionEnum = z.enum(['HAUT_GAUCHE', 'HAUT_DROITE', 'BAS_GAUCHE', 'BAS_DROITE']);

export const updateConfigSchema = z.object({
  body: z.object({
    nomChaine: z.string().min(1, 'Nom de chaîne requis').max(60).optional(),
    logoPosition: positionEnum.optional(),
    logoOpacite: z.coerce.number().min(0).max(1).optional(),
    logoActif: z.coerce.boolean().optional(),
  }),
});
