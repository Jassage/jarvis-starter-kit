import { z } from 'zod';

const variantInput = z.object({
  sku: z.string().optional(),
  optionsJson: z.record(z.string()),
  priceOverride: z.number().positive().optional(),
  stockQty: z.number().int().min(0).default(0),
  imageUrl: z.string().url().optional(),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    categoryId: z.string().optional(),
    description: z.string().optional(),
    basePrice: z.number().positive(),
    currency: z.enum(['HTG', 'USD']).default('HTG'),
    trackStock: z.boolean().default(true),
    stockQty: z.number().int().min(0).default(0),
    status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
    variants: z.array(variantInput).optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    categoryId: z.string().nullable().optional(),
    description: z.string().optional(),
    basePrice: z.number().positive().optional(),
    currency: z.enum(['HTG', 'USD']).optional(),
    trackStock: z.boolean().optional(),
    stockQty: z.number().int().min(0).optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  }),
});
