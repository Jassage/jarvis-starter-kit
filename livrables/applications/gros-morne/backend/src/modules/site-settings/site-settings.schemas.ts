import { z } from 'zod';

export const updateSiteSettingsSchema = z.object({
  body: z.object({
    adresse: z.string().max(300).nullable().optional(),
    telephone: z.string().max(50).nullable().optional(),
    email: z.string().email().max(200).nullable().optional(),
    horaires: z.string().max(200).nullable().optional(),
    facebookUrl: z.string().max(300).nullable().optional(),
    instagramUrl: z.string().max(300).nullable().optional(),
    whatsappUrl: z.string().max(300).nullable().optional(),
    siteWebUrl: z.string().max(300).nullable().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
