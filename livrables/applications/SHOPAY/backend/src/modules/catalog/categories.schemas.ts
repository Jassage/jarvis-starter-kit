import { z } from 'zod';

export const categoryBodySchema = z.object({
  body: z.object({ name: z.string().min(1) }),
});
