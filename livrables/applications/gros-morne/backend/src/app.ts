import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { globalLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';
import { UPLOAD_DIR } from './middlewares/upload.middleware';
import { activityLogger } from './middlewares/activityLog.middleware';

import authRoutes from './modules/auth/auth.routes';
import contenuRoutes from './modules/contenu/contenu.routes';
import mediaRoutes from './modules/media/media.routes';
import sectionsCommunalesRoutes from './modules/sections-communales/sections-communales.routes';
import personnalitesRoutes from './modules/personnalites/personnalites.routes';
import tourismeRoutes from './modules/tourisme/tourisme.routes';
import actualitesRoutes from './modules/actualites/actualites.routes';
import agendaRoutes from './modules/agenda/agenda.routes';
import galerieRoutes from './modules/galerie/galerie.routes';
import videosRoutes from './modules/videos/videos.routes';
import entreprisesRoutes from './modules/entreprises/entreprises.routes';
import hotelsRoutes from './modules/hotels/hotels.routes';
import restaurantsRoutes from './modules/restaurants/restaurants.routes';
import ecolesRoutes from './modules/ecoles/ecoles.routes';
import santeRoutes from './modules/sante/sante.routes';
import associationsRoutes from './modules/associations/associations.routes';
import servicesMunicipauxRoutes from './modules/services-municipaux/services-municipaux.routes';
import annuaireRoutes from './modules/annuaire/annuaire.routes';
import heroImagesRoutes from './modules/hero-images/hero-images.routes';
import rechercheRoutes from './modules/recherche/recherche.routes';
import temoignagesRoutes from './modules/temoignages/temoignages.routes';
import partenairesRoutes from './modules/partenaires/partenaires.routes';
import contactRoutes from './modules/contact/contact.routes';
import newsletterRoutes from './modules/newsletter/newsletter.routes';
import faqsRoutes from './modules/faqs/faqs.routes';
import siteSettingsRoutes from './modules/site-settings/site-settings.routes';
import activityLogRoutes from './modules/activity-log/activity-log.routes';
import documentsRoutes from './modules/documents/documents.routes';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.use('/api', globalLimiter);
// Doit être monté avant les routes : voir le commentaire du middleware pour l'explication
// du `res.on('finish')` qui rend l'ordre de montage non déterminant pour `req.user`.
app.use(activityLogger);

app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/api/auth', authRoutes);
app.use('/api/contenu', contenuRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/sections-communales', sectionsCommunalesRoutes);
app.use('/api/personnalites', personnalitesRoutes);
app.use('/api/tourisme', tourismeRoutes);
app.use('/api/actualites', actualitesRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/galerie', galerieRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/entreprises', entreprisesRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/restaurants', restaurantsRoutes);
app.use('/api/ecoles', ecolesRoutes);
app.use('/api/sante', santeRoutes);
app.use('/api/associations', associationsRoutes);
app.use('/api/services-municipaux', servicesMunicipauxRoutes);
app.use('/api/annuaire', annuaireRoutes);
app.use('/api/hero-images', heroImagesRoutes);
app.use('/api/recherche', rechercheRoutes);
app.use('/api/temoignages', temoignagesRoutes);
app.use('/api/partenaires', partenairesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/faqs', faqsRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/activity-log', activityLogRoutes);
app.use('/api/documents', documentsRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gros-morne API', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
