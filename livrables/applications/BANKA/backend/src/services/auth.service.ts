import prisma from '../utils/prisma';
import { signToken, signRefreshToken, verifyToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/hash';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';

export async function login(email: string, motDePasse: string) {
  const user = await prisma.utilisateur.findUnique({
    where: { email },
    include: { agence: { select: { id: true, code: true, nom: true } } },
  });

  if (!user || !user.actif) throw new AppError(401, 'Identifiants invalides');

  const valid = await comparePassword(motDePasse, user.motDePasse);
  if (!valid) throw new AppError(401, 'Identifiants invalides');

  const token = signToken({ userId: user.id, email: user.email, role: user.role, agenceId: user.agenceId });
  const refreshToken = signRefreshToken(user.id);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: { token: refreshToken, utilisateurId: user.id, expiresAt },
  });

  await createAuditLog({ userId: user.id, table: 'utilisateurs', action: 'LOGIN', entiteId: user.id, nouveau: { email: user.email, role: user.role } });

  const { motDePasse: _, ...userSafe } = user;
  return { token, refreshToken, utilisateur: userSafe };
}

export async function refresh(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { utilisateur: true },
  });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh token invalide ou expiré');
  }

  const user = stored.utilisateur;
  if (!user.actif) throw new AppError(401, 'Compte désactivé');

  const token = signToken({ userId: user.id, email: user.email, role: user.role, agenceId: user.agenceId });
  return { token };
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revoked: true },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.utilisateur.findUnique({
    where: { id: userId },
    include: { agence: { select: { id: true, code: true, nom: true } } },
  });
  if (!user) throw new AppError(404, 'Utilisateur introuvable');
  const { motDePasse: _, ...userSafe } = user;
  return userSafe;
}

export async function changePassword(userId: string, ancienMdp: string, nouveauMdp: string) {
  const user = await prisma.utilisateur.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'Utilisateur introuvable');

  const valid = await comparePassword(ancienMdp, user.motDePasse);
  if (!valid) throw new AppError(400, 'Ancien mot de passe incorrect');

  const hash = await hashPassword(nouveauMdp);
  await prisma.utilisateur.update({ where: { id: userId }, data: { motDePasse: hash } });
  await createAuditLog({ userId, table: 'utilisateurs', action: 'CHANGE_PASSWORD', entiteId: userId });
}

export async function listUtilisateurs(agenceId?: string) {
  const where = agenceId ? { agenceId } : {};
  const users = await prisma.utilisateur.findMany({
    where,
    include: { agence: { select: { id: true, code: true, nom: true } } },
    orderBy: { nom: 'asc' },
  });
  return users.map(({ motDePasse: _, ...u }) => u);
}

export async function createUtilisateur(data: {
  email: string;
  motDePasse: string;
  nom: string;
  prenom: string;
  role: string;
  agenceId?: string;
  telephone?: string;
}, createdBy?: string) {
  const hash = await hashPassword(data.motDePasse);
  const user = await prisma.utilisateur.create({
    data: { ...data, motDePasse: hash, role: data.role as any },
    include: { agence: { select: { id: true, code: true, nom: true } } },
  });
  const { motDePasse: _, ...userSafe } = user;
  if (createdBy) await createAuditLog({ userId: createdBy, table: 'utilisateurs', action: 'CREATE', entiteId: user.id, nouveau: { email: user.email, role: user.role } });
  return userSafe;
}

export async function updateUtilisateur(id: string, data: Partial<{ nom: string; prenom: string; telephone: string; role: string; agenceId: string; actif: boolean }>, updatedBy?: string) {
  const user = await prisma.utilisateur.update({
    where: { id },
    data: data as any,
    include: { agence: { select: { id: true, code: true, nom: true } } },
  });
  const { motDePasse: _, ...userSafe } = user;
  if (updatedBy) await createAuditLog({ userId: updatedBy, table: 'utilisateurs', action: 'UPDATE', entiteId: id, nouveau: data });
  return userSafe;
}
