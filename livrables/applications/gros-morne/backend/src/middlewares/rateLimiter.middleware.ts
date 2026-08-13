import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requêtes, veuillez réessayer plus tard.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  skipSuccessfulRequests: true,
});

// Phase 2f : formulaires publics sans authentification (contact, newsletter) — un plafond
// nettement plus généreux que l'auth (pas de compte à protéger) mais qui évite un abus trivial
// depuis un même poste, sans dépendance externe (pas de CAPTCHA).
export const formulairePublicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de soumissions. Réessayez dans quelques minutes.' },
});
