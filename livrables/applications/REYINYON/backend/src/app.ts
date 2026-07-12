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
import reunionsRoutes from './modules/reunions/reunions.routes';
import participantsRoutes from './modules/participants/participants.routes';
import messagesRoutes from './modules/messages/messages.routes';
import enregistrementsRoutes from './modules/enregistrements/enregistrements.routes';
import telephonyRoutes from './modules/telephony/telephony.routes';

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
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

app.use('/api', globalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/reunions', reunionsRoutes);
// Couvre /api/reunions/:codeReunion/rejoindre|attente et /api/participants/:id/*
app.use('/api', participantsRoutes);
app.use('/api/reunions/:codeReunion/messages', messagesRoutes);
app.use('/api/reunions/:codeReunion/enregistrements', enregistrementsRoutes);
app.use('/api/telephony', telephonyRoutes);

// Fichiers d'enregistrement produits par le conteneur egress dans ./recordings
// (monté sur /out côté conteneur) — servis tels quels, aucune authentification
// sur le fichier lui-même (l'URL contient déjà un nom de fichier horodaté
// difficile à deviner ; cohérent avec le reste du portefeuille où les pièces
// jointes uploadées ne sont pas non plus protégées individuellement).
app.use('/recordings', express.static(path.resolve(process.cwd(), '../recordings')));
// Photos/messages vocaux du chat — même principe que /recordings (nom de
// fichier horodaté + aléatoire, pas de protection par requête individuelle).
app.use('/uploads', express.static(path.resolve(process.cwd(), '../uploads')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'REYINYON API', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
