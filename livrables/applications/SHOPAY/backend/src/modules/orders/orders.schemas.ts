import { z } from 'zod';

export const checkoutSchema = z.object({
  body: z.object({
    buyerName: z.string().min(1),
    buyerEmail: z.string().email(),
    buyerPhone: z.string().min(1),
    department: z
      .enum(['OUEST', 'NORD', 'NORD_EST', 'NORD_OUEST', 'ARTIBONITE', 'CENTRE', 'SUD', 'SUD_EST', 'NIPPES', 'GRANDE_ANSE'])
      .optional(),
    commune: z.string().optional(),
    landmark: z.string().optional(),
    shippingFee: z.number().min(0).default(0),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  }),
});
