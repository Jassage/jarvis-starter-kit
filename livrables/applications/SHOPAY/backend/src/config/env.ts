import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4005),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3006'),
  CORS_ORIGINS: z.string().default('http://localhost:3006'),

  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  LOG_LEVEL: z.string().default('debug'),

  SEED_SUPER_ADMIN_EMAIL: z.string().optional(),
  SEED_SUPER_ADMIN_PASSWORD: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default('"SHOPAY" <no-reply@shopay.ht>'),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  MONCASH_CLIENT_ID: z.string().optional(),
  MONCASH_CLIENT_SECRET: z.string().optional(),
  MONCASH_WEBHOOK_SECRET: z.string().optional(),

  PAYMENT_MONCASH_NUMBER: z.string().default('+509 0000-0000'),
  PAYMENT_MONCASH_NAME: z.string().default('SHOPAY'),

  REDIS_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables d\'environnement invalides:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
