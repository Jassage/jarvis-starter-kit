import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimit } from './middleware/rateLimiter';

import authRoutes from './routes/auth.routes';
import produitRoutes from './routes/produit.routes';
import stockRoutes from './routes/stock.routes';
import dashboardRoutes from './routes/dashboard.routes';
import emplacementRoutes from './routes/emplacement.routes';
import clientRoutes from './routes/client.routes';
import venteRoutes from './routes/vente.routes';
import fournisseurRoutes from './routes/fournisseur.routes';
import achatRoutes from './routes/achat.routes';
import transfertRoutes from './routes/transfert.routes';

const app = express();

const origins = (process.env.CORS_ORIGINS || 'http://localhost:3003').split(',').map((o) => o.trim());

app.use(helmet());
app.use(cors({ origin: origins, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// Brute-force sur le login : 10 tentatives / 15 min par IP
app.use(
  '/api/auth/login',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, error: 'Trop de tentatives de connexion' } })
);

// Rate limit général par utilisateur sur tout le reste de l'API
app.use('/api', apiRateLimit);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'gescom-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/emplacements', emplacementRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/ventes', venteRoutes);
app.use('/api/fournisseurs', fournisseurRoutes);
app.use('/api/achats', achatRoutes);
app.use('/api/transferts', transfertRoutes);

app.use(errorHandler);

export default app;
