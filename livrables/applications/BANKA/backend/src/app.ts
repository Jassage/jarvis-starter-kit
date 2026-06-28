import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimit } from './middleware/rateLimiter';

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
import epargneProgrammeRoutes from './routes/epargne-programme.routes';
import comptaRoutes from './routes/compta.routes';
import rhRoutes from './routes/rh.routes';
import pointageRoutes from './routes/pointage.routes';
import deviceRoutes from './routes/device.routes';
import iclockRoutes from './routes/iclock.routes';
import { ensureComptesBase } from './services/compta.service';

const app = express();

const origins = (process.env.CORS_ORIGINS || 'http://localhost:3001').split(',').map((o) => o.trim());

app.use(helmet());
app.use(cors({ origin: origins, credentials: true }));
// Limite à 1 Mo — une API bancaire ne reçoit jamais de payloads volumineux
app.use(express.json({ limit: '1mb' }));

// Brute-force sur le login : 10 tentatives / 15 min par IP
app.use(
  '/api/auth/login',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, error: 'Trop de tentatives de connexion' } })
);

// Rate limit général par utilisateur sur tout le reste de l'API
app.use('/api', apiRateLimit);

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
app.use('/api/epargnes-programmees', epargneProgrammeRoutes);
app.use('/api/compta', comptaRoutes);
app.use('/api/rh', rhRoutes);
app.use('/api/rh/pointage', pointageRoutes);
app.use('/api/rh/pointage/devices', deviceRoutes);
// ZKTeco ADMS — monté à la racine, pas sous /api (protocole propriétaire)
app.use('/iclock', iclockRoutes);

app.use(errorHandler);

ensureComptesBase().catch((e: Error) => console.warn('[BANKA] Init comptes comptables:', e.message));

export default app;
