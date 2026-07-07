import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { globalLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';
import { asyncHandler } from './utils/asyncHandler';

import authRoutes from './modules/auth/auth.routes';
import domainRoutes from './modules/domains/domain.routes';
import userRoutes from './modules/users/user.routes';
import auditRoutes from './modules/audit/audit.routes';
import billingRoutes from './modules/billing/billing.routes';
import * as billingController from './modules/billing/billing.controller';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  })
);
app.use(compression());

// Le webhook Stripe doit vérifier une signature sur le corps brut de la requête : il est
// monté AVANT express.json() (qui consommerait/reformaterait le corps) et exclu du parsing JSON global.
app.post(
  '/api/billing/stripe/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(billingController.stripeWebhook)
);

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.use('/api', globalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/billing', billingRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'POSTA API', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
