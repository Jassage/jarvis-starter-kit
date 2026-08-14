import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import { globalLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';

import authRoutes from './modules/auth/auth.routes';
import creneauxRoutes from './modules/grille/creneaux.routes';
import matchsRoutes from './modules/matchs/matchs.routes';
import contenusRoutes from './modules/contenus/contenus.routes';
import sponsorsRoutes from './modules/sponsors/sponsors.routes';
import habillageRoutes from './modules/habillage/habillage.routes';
import rapportsRoutes from './modules/rapports/rapports.routes';
import epgRoutes from './modules/epg/epg.routes';
import configRoutes from './modules/config/config.routes';
import replayRoutes from './modules/replay/replay.routes';
import audienceRoutes from './modules/audience/audience.routes';
import auditRoutes from './modules/audit/audit.routes';
import utilisateursRoutes from './modules/utilisateurs/utilisateurs.routes';
import moniteurRoutes from './modules/moniteur/moniteur.routes';

const app = express();

// En production, l'API tourne derrière un reverse proxy : sans cela `req.ip` vaut
// l'adresse du proxy, ce qui fausserait à la fois le rate limiting (tout le trafic
// compté sur une seule IP) et l'adresse enregistrée au journal d'audit.
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Le heartbeat d'audience a son propre plafond (cf. rateLimiter.middleware) : le
// compter aussi dans le limiteur global reviendrait à lui réimposer les 300 requêtes
// générales et à perdre l'audience derrière une IP partagée.
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/audience/ping')) return next();
  return globalLimiter(req, res, next);
});

// Logos sponsors uploadés (stockage disque local, cf. middlewares/upload.middleware.ts)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/creneaux', creneauxRoutes);
app.use('/api/matchs', matchsRoutes);
app.use('/api/contenus', contenusRoutes);
app.use('/api/sponsors', sponsorsRoutes);
app.use('/api/habillage', habillageRoutes);
app.use('/api/rapports', rapportsRoutes);
app.use('/api/epg', epgRoutes);
app.use('/api/config', configRoutes);
app.use('/api/replay', replayRoutes);
app.use('/api/audience', audienceRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/utilisateurs', utilisateursRoutes);
app.use('/api/moniteur', moniteurRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ANTENN API', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
