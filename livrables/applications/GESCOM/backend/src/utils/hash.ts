import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Refresh tokens : recherchés par égalité exacte (pas de vérification de mot de passe humain),
// SHA-256 suffit et reste déterministe pour permettre le lookup par valeur en base — contrairement
// aux mots de passe, un salage façon bcrypt casserait la recherche par index unique.
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
