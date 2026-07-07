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
import boutiquesRoutes from './modules/boutiques/boutiques.routes';
import productsRoutes from './modules/catalog/products.routes';
import categoriesRoutes from './modules/catalog/categories.routes';
import storefrontRoutes from './modules/storefront/storefront.routes';
import ordersRoutes from './modules/orders/orders.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import billingRoutes from './modules/billing/billing.routes';
import adminRoutes from './modules/admin/admin.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import * as paymentsController from './modules/payments/payments.controller';

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
  '/api/payments/stripe/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(paymentsController.stripeWebhookHandler)
);

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.use('/api', globalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/boutiques', boutiquesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/storefront', storefrontRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SHOPAY API', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
