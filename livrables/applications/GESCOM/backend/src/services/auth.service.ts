import prisma from '../utils/prisma';
import { signToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/hash';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';

function stripSensitive<T extends { motDePasse: string }>(user: T): Omit<T, 'motDePasse'> {
  const { motDePasse: _, ...safe } = user;
  return safe as Omit<T, 'motDePasse'>;
}

function validateMotDePasse(mdp: string) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!regex.test(mdp))
    throw new AppError(400, 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre');
}

async function emettreSession(user: { id: string; email: string; role: any; emplacementId: string | null }) {
  const token = signToken({ userId: user.id, email: user.email, role: user.role, emplacementId: user.emplacementId });
  const refreshToken = signRefreshToken(user.id);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: { token: refreshToken, utilisateurId: user.id, expiresAt },
  });

  return { token, refreshToken };
}

export async function login(email: string, motDePasse: string) {
  const user = await prisma.utilisateur.findUnique({
    where: { email },
    include: { emplacement: { select: { id: true, nom: true, type: true } } },
  });

  if (!user || !user.actif) throw new AppError(401, 'Identifiants invalides');

  const valid = await comparePassword(motDePasse, user.motDePasse);
  if (!valid) throw new AppError(401, 'Identifiants invalides');

  const { token, refreshToken } = await emettreSession(user);

  await createAuditLog({ userId: user.id, table: 'utilisateurs', action: 'LOGIN', entiteId: user.id, nouveau: { email: user.email, role: user.role } });

  return { token, refreshToken, utilisateur: stripSensitive(user) };
}

export async function refresh(refreshToken: string) {
  try {
    verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'Refresh token invalide ou expiré');
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { utilisateur: true },
  });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh token invalide ou expiré');
  }

  const user = stored.utilisateur;
  if (!user.actif) throw new AppError(401, 'Compte désactivé');

  // Rotation : on révoque l'ancien token et on émet un nouveau pour éviter la réutilisation
  const newRefreshToken = signRefreshToken(user.id);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.$transaction([
    prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } }),
    prisma.refreshToken.create({ data: { token: newRefreshToken, utilisateurId: user.id, expiresAt } }),
  ]);

  const token = signToken({ userId: user.id, email: user.email, role: user.role, emplacementId: user.emplacementId });
  return { token, refreshToken: newRefreshToken };
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
    include: { emplacement: { select: { id: true, nom: true, type: true } } },
  });
  if (!user) throw new AppError(404, 'Utilisateur introuvable');
  return stripSensitive(user);
}

export async function changePassword(userId: string, ancienMdp: string, nouveauMdp: string) {
  const user = await prisma.utilisateur.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'Utilisateur introuvable');

  const valid = await comparePassword(ancienMdp, user.motDePasse);
  if (!valid) throw new AppError(400, 'Ancien mot de passe incorrect');

  validateMotDePasse(nouveauMdp);

  const hash = await hashPassword(nouveauMdp);

  await prisma.$transaction([
    prisma.utilisateur.update({ where: { id: userId }, data: { motDePasse: hash } }),
    prisma.refreshToken.updateMany({ where: { utilisateurId: userId }, data: { revoked: true } }),
  ]);

  await createAuditLog({ userId, table: 'utilisateurs', action: 'CHANGE_PASSWORD', entiteId: userId });
}

export async function listUtilisateurs(emplacementId?: string) {
  const where = emplacementId ? { emplacementId } : {};
  const users = await prisma.utilisateur.findMany({
    where,
    include: { emplacement: { select: { id: true, nom: true, type: true } } },
    orderBy: { nom: 'asc' },
  });
  return users.map(stripSensitive);
}

export async function createUtilisateur(data: {
  email: string;
  motDePasse: string;
  nom: string;
  prenom: string;
  role: string;
  emplacementId?: string;
  telephone?: string;
}, createdBy?: string) {
  validateMotDePasse(data.motDePasse);
  const hash = await hashPassword(data.motDePasse);
  const user = await prisma.utilisateur.create({
    data: { ...data, motDePasse: hash, role: data.role as any },
    include: { emplacement: { select: { id: true, nom: true, type: true } } },
  });
  if (createdBy) await createAuditLog({ userId: createdBy, table: 'utilisateurs', action: 'CREATE', entiteId: user.id, nouveau: { email: user.email, role: user.role } });
  return stripSensitive(user);
}

export async function updateUtilisateur(id: string, data: Partial<{ nom: string; prenom: string; telephone: string; role: string; emplacementId: string; actif: boolean }>, updatedBy?: string) {
  const user = await prisma.utilisateur.update({
    where: { id },
    data: data as any,
    include: { emplacement: { select: { id: true, nom: true, type: true } } },
  });

  // Révocation immédiate de tous les tokens si le compte est désactivé
  if (data.actif === false) {
    await prisma.refreshToken.updateMany({ where: { utilisateurId: id, revoked: false }, data: { revoked: true } });
  }

  if (updatedBy) await createAuditLog({ userId: updatedBy, table: 'utilisateurs', action: 'UPDATE', entiteId: id, nouveau: data });
  return stripSensitive(user);
}
