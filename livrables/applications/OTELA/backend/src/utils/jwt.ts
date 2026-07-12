import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { RoleEmploye } from '@prisma/client';

export interface JwtPayload {
  employeId: string;
  email: string;
  role: RoleEmploye;
  etablissementId: string | null;
}

export interface RefreshPayload {
  employeId: string;
  tokenId: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: 'otela-api',
    audience: 'otela-client',
  });
}

export function signRefreshToken(payload: RefreshPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: 'otela-api',
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'otela-api',
    audience: 'otela-client',
  }) as JwtPayload;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'otela-api',
  }) as RefreshPayload;
}
