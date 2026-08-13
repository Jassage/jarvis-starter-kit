import { createHash, randomBytes } from 'crypto';

// Refresh tokens : recherchés par égalité exacte, jamais par vérification humaine —
// SHA-256 suffit et reste déterministe pour permettre le lookup par index unique en base.
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateOpaqueToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
