import jwt from 'jsonwebtoken';
import { RoleUtilisateur } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: RoleUtilisateur;
  emplacementId?: string | null;
}

function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET manquant dans les variables d\'environnement');
  return s;
}

function getRefreshSecret(): string {
  const s = process.env.JWT_REFRESH_SECRET;
  if (!s) throw new Error('JWT_REFRESH_SECRET manquant dans les variables d\'environnement — doit être distinct de JWT_SECRET');
  return s;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '8h' });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, getSecret()) as any;
  if (decoded?.type === 'refresh') {
    throw new Error('Token de type refresh non autorisé comme access token');
  }
  return decoded as JwtPayload;
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, getRefreshSecret(), { expiresIn: '30d' });
}

export function verifyRefreshToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, getRefreshSecret()) as any;
  if (decoded?.type !== 'refresh') throw new Error('Type de token invalide');
  return { userId: decoded.userId };
}
