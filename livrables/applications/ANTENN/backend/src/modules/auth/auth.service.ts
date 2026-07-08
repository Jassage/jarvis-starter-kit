import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middlewares/errorHandler.middleware';

const SALT_ROUNDS = 12;

async function generateTokens(user: { id: string; email: string; nom: string; role: 'ADMINISTRATEUR' | 'OPERATEUR_REGIE' }) {
  const tokenId = uuidv4();

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, tokenId });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, nom: user.nom, role: user.role },
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, password: true, nom: true, role: true, isActive: true },
  });

  if (!user) throw new AppError('Email ou mot de passe incorrect', 401);
  if (!user.isActive) throw new AppError('Compte désactivé', 403);

  const passwordOk = await bcrypt.compare(password, user.password);
  if (!passwordOk) throw new AppError('Email ou mot de passe incorrect', 401);

  return generateTokens(user);
}

export async function refresh(refreshTokenValue: string) {
  const payload = verifyRefreshToken(refreshTokenValue);

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
    include: { user: { select: { id: true, email: true, nom: true, role: true, isActive: true } } },
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    throw new AppError('Refresh token invalide ou expiré', 401);
  }
  if (tokenRecord.userId !== payload.userId) {
    throw new AppError('Refresh token invalide', 401);
  }
  if (!tokenRecord.user.isActive) {
    throw new AppError('Compte désactivé', 403);
  }

  // Rotation : l'ancien refresh token est supprimé, un nouveau est émis
  await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

  return generateTokens(tokenRecord.user);
}

export async function logout(refreshTokenValue: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshTokenValue } });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, nom: true, role: true, isActive: true, createdAt: true },
  });
  if (!user) throw new AppError('Utilisateur non trouvé', 404);
  return user;
}

export async function updateMe(userId: string, data: { nom?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, nom: true, role: true },
  });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('Utilisateur non trouvé', 404);

  const passwordOk = await bcrypt.compare(currentPassword, user.password);
  if (!passwordOk) throw new AppError('Mot de passe actuel incorrect', 400);

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);
}
