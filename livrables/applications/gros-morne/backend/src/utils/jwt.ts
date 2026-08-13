import jwt from 'jsonwebtoken';
import { AdminRole } from '@prisma/client';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: AdminRole;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: 'gros-morne-api',
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET, { issuer: 'gros-morne-api' }) as JwtPayload;
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: 'gros-morne-api',
  });
}

export function verifyRefreshToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'gros-morne-api',
  }) as jwt.JwtPayload;
  if (decoded.type !== 'refresh') throw new Error('Type de token invalide');
  return { userId: decoded.userId as string };
}
