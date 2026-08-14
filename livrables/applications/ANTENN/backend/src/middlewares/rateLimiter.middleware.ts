import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Heartbeat des players. Volontairement large et séparé du limiteur global : en Haïti
// une même IP publique couvre couramment tout un quartier ou un cybercafé (NAT), et
// plafonner l'audience à quelques viewers par IP fausserait directement le rapport
// sponsor. Un player émet 30 pings par quart d'heure : ce seuil laisse passer une
// soixantaine de viewers simultanés derrière une même sortie.
export const audienceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requêtes.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de tentatives, réessayez plus tard.' },
});
