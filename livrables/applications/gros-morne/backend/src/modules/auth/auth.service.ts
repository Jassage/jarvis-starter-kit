import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { hashRefreshToken } from '../../utils/crypt';
import { AppError } from '../../types';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function login(email: string, motDePasse: string) {
  const adminUser = await prisma.adminUser.findUnique({ where: { email } });
  if (!adminUser || !adminUser.actif) {
    throw new AppError(401, 'Email ou mot de passe incorrect');
  }

  const valide = await bcrypt.compare(motDePasse, adminUser.passwordHash);
  if (!valide) throw new AppError(401, 'Email ou mot de passe incorrect');

  const accessToken = signAccessToken({
    userId: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
  });
  const refreshToken = signRefreshToken(adminUser.id);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashRefreshToken(refreshToken),
      adminUserId: adminUser.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return {
    accessToken,
    refreshToken,
    adminUser: {
      id: adminUser.id,
      email: adminUser.email,
      nom: adminUser.nom,
      role: adminUser.role,
    },
  };
}

export async function refresh(refreshToken: string) {
  const tokenHash = hashRefreshToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Session expirée, reconnectez-vous');
  }

  const { userId } = verifyRefreshToken(refreshToken);
  const adminUser = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!adminUser || !adminUser.actif) {
    throw new AppError(401, 'Compte introuvable ou désactivé');
  }

  const accessToken = signAccessToken({
    userId: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
  });

  return {
    accessToken,
    adminUser: {
      id: adminUser.id,
      email: adminUser.email,
      nom: adminUser.nom,
      role: adminUser.role,
    },
  };
}

export async function logout(refreshToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(refreshToken);
  await prisma.refreshToken.deleteMany({ where: { tokenHash } });
}

export async function getMe(userId: string) {
  const adminUser = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: { id: true, email: true, nom: true, role: true },
  });
  if (!adminUser) throw new AppError(404, 'Utilisateur introuvable');
  return adminUser;
}
