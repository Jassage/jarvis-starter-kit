import express from 'express';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { env } from './config/env';
import { globalLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';
import { swaggerSpec } from './config/swagger';
import { notificationQueue, emailQueue, maintenanceQueue } from './queues';

// Routes
import authRoutes from './modules/auth/auth.routes';
import listingsRoutes from './modules/listings/listings.routes';
import searchRoutes from './modules/search/search.routes';
import messagesRoutes from './modules/messages/messages.routes';
import agenciesRoutes from './modules/agencies/agencies.routes';
import favoritesRoutes from './modules/favorites/favorites.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import reviewsRoutes from './modules/reviews/reviews.routes';
import reportsRoutes from './modules/reports/reports.routes';
import paymentsRoutes, { stripeWebhookHandler } from './modules/payments/payments.routes';
import adminRoutes from './modules/admin/admin.routes';
import aiRoutes from './modules/ai/ai.routes';
import visitsRoutes from './modules/visits/visits.routes';
import prisma from './config/database';
import { asyncHandler } from './utils/asyncHandler';
import { sendSuccess } from './utils/response';

const app = express();

// ─── Sécurité ───
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: env.CORS_ORIGINS.split(',').map(o => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Webhook Stripe : body brut, doit être monté AVANT express.json() ───
// (la vérification de signature Stripe exige les octets exacts reçus)
app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), asyncHandler(stripeWebhookHandler));

// ─── Middlewares de base ───
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Rate limiting global
app.use('/api', globalLimiter);

// ─── Swagger ───
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { background-color: #FF6B35; }',
  customSiteTitle: 'LAKAY API Documentation',
}));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// ─── Bull Board (monitoring queues — protégé par Basic Auth) ───
// Dashboard HTML servi au navigateur : le Bearer token du localStorage ne peut
// pas transiter, on utilise donc une Basic Auth par identifiants d'environnement.
// Fail-closed : sans identifiants configurés, l'accès est refusé.
function bullBoardAuth(req: Request, res: Response, next: NextFunction) {
  if (!env.BULL_BOARD_USER || !env.BULL_BOARD_PASSWORD) {
    return res.status(503).json({ success: false, message: 'Monitoring non configuré' });
  }
  const header = req.headers.authorization || '';
  if (header.startsWith('Basic ')) {
    const decoded = Buffer.from(header.slice(6), 'base64').toString();
    const idx = decoded.indexOf(':');
    const user = decoded.slice(0, idx);
    const pass = decoded.slice(idx + 1);
    // Comparaison à temps constant, avec garde de longueur (timingSafeEqual exige des tailles égales)
    const safeEqual = (a: string, b: string) =>
      a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    if (safeEqual(user, env.BULL_BOARD_USER) && safeEqual(pass, env.BULL_BOARD_PASSWORD)) {
      return next();
    }
  }
  res.set('WWW-Authenticate', 'Basic realm="LAKAY Queues"');
  return res.status(401).json({ success: false, message: 'Authentification requise' });
}

const bullBoardAdapter = new ExpressAdapter();
bullBoardAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [
    new BullMQAdapter(notificationQueue),
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(maintenanceQueue),
  ],
  serverAdapter: bullBoardAdapter,
});
app.use('/admin/queues', bullBoardAuth, bullBoardAdapter.getRouter());

// ─── Routes API ───
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/agencies', agenciesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/visits', visitsRoutes);

// ─── Stats publiques ───
app.get('/api/stats', asyncHandler(async (_req, res) => {
  const [activeListings, totalAgencies, verifiedAgencies, deptStats] = await Promise.all([
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.agency.count(),
    prisma.agency.count({ where: { isVerified: true } }),
    prisma.listing.groupBy({
      by: ['department'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
  ]);

  const departmentCounts = Object.fromEntries(
    deptStats.map((d) => [d.department, d._count.id]),
  );

  sendSuccess(res, {
    activeListings,
    agencies: verifiedAgencies || totalAgencies,
    departments: 10,
    departmentCounts,
  });
}));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'LAKAY API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Gestion des erreurs ───
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
