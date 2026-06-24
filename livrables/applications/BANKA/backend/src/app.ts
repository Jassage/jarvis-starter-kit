import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import compteRoutes from './routes/compte.routes';
import transactionRoutes from './routes/transaction.routes';
import caisseRoutes from './routes/caisse.routes';
import pretRoutes from './routes/pret.routes';
import statsRoutes from './routes/stats.routes';
import auditRoutes from './routes/audit.routes';
import agenceRoutes from './routes/agence.routes';
import configurationRoutes from './routes/configuration.routes';

const app = express();

const origins = (process.env.CORS_ORIGINS || 'http://localhost:3001').split(',').map((o) => o.trim());

app.use(helmet());
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use(
  '/api/auth/login',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Trop de tentatives de connexion' })
);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'banka-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/comptes', compteRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/caisse', caisseRoutes);
app.use('/api/prets', pretRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/agences', agenceRoutes);
app.use('/api/configurations', configurationRoutes);

app.use(errorHandler);

export default app;
