import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RoleEmploye } from '@prisma/client';
import prisma from '../../config/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middlewares/errorHandler.middleware';

const SALT_ROUNDS = 12;

async function generateTokens(employe: { id: string; email: string; nom: string; role: RoleEmploye; etablissementId: string | null }) {
  const tokenId = uuidv4();

  const accessToken = signAccessToken({ employeId: employe.id, email: employe.email, role: employe.role, etablissementId: employe.etablissementId });
  const refreshToken = signRefreshToken({ employeId: employe.id, tokenId });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: { token: refreshToken, employeId: employe.id, expiresAt },
  });

  return {
    accessToken,
    refreshToken,
    employe: { id: employe.id, email: employe.email, nom: employe.nom, role: employe.role, etablissementId: employe.etablissementId },
  };
}

export async function login(email: string, password: string) {
  const employe = await prisma.employe.findUnique({
    where: { email },
    select: { id: true, email: true, password: true, nom: true, role: true, etablissementId: true, isActive: true },
  });

  if (!employe) throw new AppError('Email ou mot de passe incorrect', 401);
  if (!employe.isActive) throw new AppError('Compte désactivé', 403);

  const passwordOk = await bcrypt.compare(password, employe.password);
  if (!passwordOk) throw new AppError('Email ou mot de passe incorrect', 401);

  return generateTokens(employe);
}

export async function refresh(refreshTokenValue: string) {
  const payload = verifyRefreshToken(refreshTokenValue);

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
    include: { employe: { select: { id: true, email: true, nom: true, role: true, etablissementId: true, isActive: true } } },
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    throw new AppError('Refresh token invalide ou expiré', 401);
  }
  if (tokenRecord.employeId !== payload.employeId) {
    throw new AppError('Refresh token invalide', 401);
  }
  if (!tokenRecord.employe.isActive) {
    throw new AppError('Compte désactivé', 403);
  }

  // Rotation : l'ancien refresh token est supprimé, un nouveau est émis
  await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

  return generateTokens(tokenRecord.employe);
}

export async function logout(refreshTokenValue: string) {
  // L'employé est lu AVANT la suppression pour permettre au contrôleur de tracer la
  // déconnexion : /logout n'exige pas d'access token valide (on doit pouvoir se
  // déconnecter après expiration), donc req.employe n'y est jamais renseigné.
  const enregistrement = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
    select: { employe: { select: { id: true, nom: true, role: true, etablissementId: true } } },
  });

  await prisma.refreshToken.deleteMany({ where: { token: refreshTokenValue } });

  return enregistrement?.employe ?? null;
}

export async function getMe(employeId: string) {
  const employe = await prisma.employe.findUnique({
    where: { id: employeId },
    select: { id: true, email: true, nom: true, role: true, etablissementId: true, isActive: true, createdAt: true },
  });
  if (!employe) throw new AppError('Employé non trouvé', 404);
  return employe;
}

export async function changePassword(employeId: string, currentPassword: string, newPassword: string) {
  const employe = await prisma.employe.findUnique({ where: { id: employeId } });
  if (!employe) throw new AppError('Employé non trouvé', 404);

  const passwordOk = await bcrypt.compare(currentPassword, employe.password);
  if (!passwordOk) throw new AppError('Mot de passe actuel incorrect', 400);

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.employe.update({ where: { id: employeId }, data: { password: hashedPassword } }),
    prisma.refreshToken.deleteMany({ where: { employeId } }),
  ]);
}
