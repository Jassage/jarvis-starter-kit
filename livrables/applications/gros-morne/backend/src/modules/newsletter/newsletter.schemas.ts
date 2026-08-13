import { z } from 'zod';

export const subscribeNewsletterSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide').max(200),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const listAbonnesNewsletterSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const removeAbonneNewsletterSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const envoyerCampagneSchema = z.object({
  body: z.object({
    sujet: z.string().min(1, 'Sujet requis').max(200),
    message: z.string().min(1, 'Message requis').max(10000),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
