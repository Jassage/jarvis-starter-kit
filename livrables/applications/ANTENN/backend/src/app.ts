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

const app = express();

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

app.use('/api', globalLimiter);

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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ANTENN API', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
