import { Prisma } from '@prisma/client';

/**
 * Réessaie automatiquement en cas de deadlock PostgreSQL (P2034).
 * Backoff exponentiel avec jitter pour éviter le thundering herd.
 */
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      const isDeadlock =
        e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2034';

      if (!isDeadlock) throw e;

      lastError = e;
      // 50ms, 100ms, 200ms avec ±20% de jitter
      const base = 50 * Math.pow(2, attempt);
      const delay = Math.round(base * (0.8 + Math.random() * 0.4));
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}
