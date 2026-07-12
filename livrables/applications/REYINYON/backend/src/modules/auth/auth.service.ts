import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@prisma/client';
import prisma from '../../config/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middlewares/errorHandler.middleware';

const SALT_ROUNDS = 12;

async function generateTokens(user: Pick<User, 'id' | 'email' | 'nom'>) {
  const tokenId = uuidv4();

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, tokenId });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, nom: user.nom },
  };
}

export async function register(nom: string, email: string, password: string, telephone?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Un compte existe déjà avec cet email', 409);

  const motDePasseHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({ data: { nom, email, motDePasseHash, telephone } });
  return generateTokens(user);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Email ou mot de passe incorrect', 401);

  const passwordOk = await bcrypt.compare(password, user.motDePasseHash);
  if (!passwordOk) throw new AppError('Email ou mot de passe incorrect', 401);

  return generateTokens(user);
}

export async function refresh(refreshTokenValue: string) {
  const payload = verifyRefreshToken(refreshTokenValue);

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
    include: { user: true },
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    throw new AppError('Refresh token invalide ou expiré', 401);
  }
  if (tokenRecord.userId !== payload.userId) {
    throw new AppError('Refresh token invalide', 401);
  }

  // Rotation : l'ancien refresh token est supprimé, un nouveau est émis.
  await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

  return generateTokens(tokenRecord.user);
}

export async function logout(refreshTokenValue: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshTokenValue } });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, nom: true, telephone: true, createdAt: true },
  });
  if (!user) throw new AppError('Utilisateur non trouvé', 404);
  return user;
}
