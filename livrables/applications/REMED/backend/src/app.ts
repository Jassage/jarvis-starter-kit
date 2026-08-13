import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { apiRateLimit } from './middlewares/rateLimiter.middleware';

import authRoutes from './modules/auth/auth.routes';
import produitRoutes from './modules/produits/produit.routes';
import categorieRoutes from './modules/produits/categorie.routes';
import stockRoutes from './modules/stock/stock.routes';
import fournisseurRoutes from './modules/fournisseurs/fournisseur.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import clientRoutes from './modules/clients/client.routes';
import caisseRoutes from './modules/caisse/caisse.routes';
import venteRoutes from './modules/ventes/vente.routes';
import achatRoutes from './modules/achats/achat.routes';
import depenseRoutes from './modules/depenses/depense.routes';
import retourRoutes from './modules/retours/retour.routes';
import inventaireRoutes from './modules/inventaire/inventaire.routes';
import ordonnanceRoutes from './modules/ordonnances/ordonnance.routes';
import rapportRoutes from './modules/rapports/rapport.routes';
import utilisateurRoutes from './modules/utilisateurs/utilisateur.routes';
import notificationRoutes from './modules/notifications/notification.routes';

const app = express();

const origins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

app.use(helmet());
app.use(cors({ origin: origins, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use('/api', apiRateLimit);

// Pièces jointes d'ordonnances, servies statiquement (stockage disque local, hors de src/).
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'remed-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/categories', categorieRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/fournisseurs', fournisseurRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/caisse', caisseRoutes);
app.use('/api/ventes', venteRoutes);
app.use('/api/achats', achatRoutes);
app.use('/api/depenses', depenseRoutes);
app.use('/api/retours', retourRoutes);
app.use('/api/inventaire', inventaireRoutes);
app.use('/api/ordonnances', ordonnanceRoutes);
app.use('/api/rapports', rapportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);

app.use(errorHandler);

export default app;
