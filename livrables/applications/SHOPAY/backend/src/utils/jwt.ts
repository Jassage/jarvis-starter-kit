import jwt from 'jsonwebtoken';
import { PlatformRole } from '@prisma/client';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: PlatformRole;
  boutiqueId?: string | null;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: 'shopay-api',
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET, { issuer: 'shopay-api' }) as JwtPayload;
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: 'shopay-api',
  });
}

export function verifyRefreshToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, { issuer: 'shopay-api' }) as jwt.JwtPayload;
  if (decoded.type !== 'refresh') throw new Error('Type de token invalide');
  return { userId: decoded.userId as string };
}
