import prisma from '../utils/prisma';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

async function run(): Promise<void> {
  const { count } = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revoked: true },
      ],
    },
  });
  if (count > 0) {
    console.log(`[cleanupTokens] ${count} token(s) expiré(s)/révoqué(s) supprimé(s)`);
  }
}

export function startCleanupJob(): void {
  // Premier nettoyage immédiat au démarrage
  run().catch((err) => console.error('[cleanupTokens] erreur:', err));
  // Puis toutes les semaines
  setInterval(() => {
    run().catch((err) => console.error('[cleanupTokens] erreur:', err));
  }, SEVEN_DAYS_MS);
}
