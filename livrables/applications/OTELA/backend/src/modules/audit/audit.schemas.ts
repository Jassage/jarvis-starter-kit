import { z } from 'zod';

export const listJournalQuerySchema = z.object({
  query: z.object({
    action: z.string().optional(),
    employeId: z.string().optional(),
    etablissementId: z.string().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    limit: z.coerce.number().int().min(1).max(200).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  }),
});
