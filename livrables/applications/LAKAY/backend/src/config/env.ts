import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4003),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3004'),

  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('LAKAY <noreply@lakay.ht>'),

  MONCASH_CLIENT_ID: z.string().optional(),
  MONCASH_CLIENT_SECRET: z.string().optional(),
  MONCASH_MODE: z.enum(['sandbox', 'live']).default('sandbox'),
  // Secret partagé pour authentifier les webhooks de paiement entrants
  MONCASH_WEBHOOK_SECRET: z.string().optional(),

  NATCASH_CLIENT_ID: z.string().optional(),
  NATCASH_CLIENT_SECRET: z.string().optional(),
  NATCASH_MODE: z.enum(['sandbox', 'live']).default('sandbox'),
  NATCASH_WEBHOOK_SECRET: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  MAX_IMAGES_PER_LISTING: z.coerce.number().default(20),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  CORS_ORIGINS: z.string().default('http://localhost:3004'),
  LOG_LEVEL: z.string().default('debug'),

  // Basic Auth du dashboard Bull Board (monitoring des queues)
  BULL_BOARD_USER: z.string().optional(),
  BULL_BOARD_PASSWORD: z.string().optional(),

  ANTHROPIC_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables d\'environnement invalides:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
