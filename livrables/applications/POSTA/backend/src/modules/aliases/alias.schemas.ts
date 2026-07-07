import { z } from 'zod';

export const createAliasSchema = z.object({
  body: z.object({
    source: z.string().trim().min(1).max(254),
    destination: z.string().trim().min(1).max(1000),
  }),
  query: z.object({}).optional(),
  params: z.object({ domainId: z.string().min(1) }),
});

export const updateAliasSchema = z.object({
  body: z.object({
    destination: z.string().trim().min(1).max(1000).optional(),
    actif: z.boolean().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({ domainId: z.string().min(1), id: z.string().min(1) }),
});

export const aliasIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ domainId: z.string().min(1), id: z.string().min(1) }),
});

export const domainScopeParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ domainId: z.string().min(1) }),
});
