import { z } from 'zod';

export const updateBoutiqueSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().max(2000).optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().optional(),
    themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    department: z
      .enum(['OUEST', 'NORD', 'NORD_EST', 'NORD_OUEST', 'ARTIBONITE', 'CENTRE', 'SUD', 'SUD_EST', 'NIPPES', 'GRANDE_ANSE'])
      .optional(),
    commune: z.string().optional(),
    landmark: z.string().optional(),
  }),
});
