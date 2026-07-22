import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import { globalLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';
import { UPLOAD_ROOT } from './middlewares/upload.middleware';

import authRoutes from './modules/auth/auth.routes';
import etablissementsRoutes from './modules/etablissements/etablissements.routes';
import chambresRoutes from './modules/chambres/chambres.routes';
import disponibiliteRoutes from './modules/disponibilite/disponibilite.routes';
import reservationsRoutes from './modules/reservations/reservations.routes';
import clientsRoutes from './modules/clients/clients.routes';
import rapportsRoutes from './modules/rapports/rapports.routes';
import receptionRoutes from './modules/reception/reception.routes';
import menageRoutes from './modules/menage/menage.routes';
import facturesRoutes from './modules/factures/factures.routes';
import foliosRoutes from './modules/folios/folios.routes';
import restaurantRoutes from './modules/restaurant/restaurant.routes';
import spaRoutes from './modules/spa/spa.routes';
import minibarRoutes from './modules/minibar/minibar.routes';
import blanchisserieRoutes from './modules/blanchisserie/blanchisserie.routes';
import conciergerieRoutes from './modules/conciergerie/conciergerie.routes';
import voiturierRoutes from './modules/voiturier/voiturier.routes';
import roomServiceRoutes from './modules/room-service/room-service.routes';
import employesRoutes from './modules/employes/employes.routes';
import auditRoutes from './modules/audit/audit.routes';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// Fichiers envoyés (logos d'établissement, photos de chambres) servis en statique.
// Le Cross-Origin-Resource-Policy est relâché uniquement sur ce chemin — comme le
// module Documents de BANKA — pour que le frontend et le futur site vitrine, servis
// depuis une autre origine, puissent afficher les images sans affaiblir la
// protection du reste de l'API.
app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(UPLOAD_ROOT, { fallthrough: true, index: false })
);

app.use(cors({
  origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

app.use('/api', globalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/etablissements', etablissementsRoutes);
app.use('/api/chambres', chambresRoutes);
app.use('/api/disponibilite', disponibiliteRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/rapports', rapportsRoutes);
app.use('/api/reception', receptionRoutes);
app.use('/api/menage', menageRoutes);
app.use('/api/factures', facturesRoutes);
app.use('/api/folios', foliosRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/spa', spaRoutes);
app.use('/api/minibar', minibarRoutes);
app.use('/api/blanchisserie', blanchisserieRoutes);
app.use('/api/conciergerie', conciergerieRoutes);
app.use('/api/voiturier', voiturierRoutes);
app.use('/api/room-service', roomServiceRoutes);
app.use('/api/employes', employesRoutes);
app.use('/api/audit', auditRoutes);

// Documentation Swagger dérivée des schémas Zod. Servie hors production : la doc
// détaillerait la surface d'attaque d'une API exposée. En dev, /api/docs pour l'UI
// et /api/docs.json pour le document brut.
if (env.NODE_ENV !== 'production') {
  const { genererDocumentOpenApi } = require('./docs/openapi') as typeof import('./docs/openapi');
  const swaggerUi = require('swagger-ui-express') as typeof import('swagger-ui-express');
  const document = genererDocumentOpenApi();
  app.get('/api/docs.json', (_req, res) => res.json(document));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(document, { customSiteTitle: 'OTELA API' }));
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'OTELA API', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
