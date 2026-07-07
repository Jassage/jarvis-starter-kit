import { z } from 'zod';

const domainRegex = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z0-9-]{1,63})+$/i;

export const createDomainSchema = z.object({
  body: z.object({
    nomDomaine: z.string().trim().min(3).max(253).regex(domainRegex, 'Nom de domaine invalide'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const domainIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});
