import { z } from 'zod';

// Les 24 heros du site : l'accueil + les 23 sous-pages publiques (dossiers de app/).
export const PAGES = [
  'accueil', 'histoire', 'geographie', 'culture', 'personnalites', 'tourisme', 'communaute',
  'actualites', 'agenda', 'annuaire', 'investir', 'diaspora', 'contact', 'a-propos', 'faq',
  'services-municipaux', 'vie-associative', 'education', 'sante', 'economie',
  'mentions-legales', 'confidentialite', 'conditions-utilisation', 'galerie',
] as const;

export const getOneSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ page: z.enum(PAGES) }),
});

export const listAdminSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const upsertSchema = z.object({
  body: z.object({
    mediaId: z.string().min(1, 'Média requis'),
  }),
  query: z.object({}).optional(),
  params: z.object({ page: z.enum(PAGES) }),
});

export const deleteSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ page: z.enum(PAGES) }),
});
