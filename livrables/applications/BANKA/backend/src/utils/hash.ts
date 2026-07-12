import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Pour les tokens opaques haute-entropie (refresh, reset password) : un hash rapide non salé
// suffit (contrairement aux mots de passe) car le token lui-même a assez d'entropie pour résister
// au brute-force. Empêche qu'une fuite de la base/backup rende directement les tokens utilisables.
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
