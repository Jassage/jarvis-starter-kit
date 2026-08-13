import prisma from '../config/database';

const UNE_HEURE_MS = 60 * 60 * 1000;

async function purgerTokensExpires(): Promise<void> {
  const { count } = await prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  if (count > 0) console.log(`[cleanup] ${count} refresh token(s) expiré(s) purgé(s)`);
}

export function startCleanupJob(): void {
  purgerTokensExpires().catch((err) => console.error('[cleanup] échec initial:', err));
  setInterval(() => {
    purgerTokensExpires().catch((err) => console.error('[cleanup] échec:', err));
  }, UNE_HEURE_MS);
}
