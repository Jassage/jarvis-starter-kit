import crypto from 'crypto';
import prisma from '../utils/prisma';
import { signToken, signRefreshToken, verifyRefreshToken, signTempToken, verifyTempToken } from '../utils/jwt';
import { hashPassword, comparePassword, hashToken } from '../utils/hash';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';
import { sendPasswordResetEmail } from '../utils/email';
// otplib v12 uses package exports not supported by classic node moduleResolution
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { authenticator } = require('otplib') as {
  authenticator: {
    generateSecret(): string;
    keyuri(user: string, service: string, secret: string): string;
    verify(opts: { token: string; secret: string }): boolean;
  };
};
import QRCode from 'qrcode';

function stripSensitive<T extends { motDePasse: string; twoFactorSecret?: string | null }>(
  user: T,
): Omit<T, 'motDePasse' | 'twoFactorSecret'> {
  const { motDePasse: _, twoFactorSecret: __, ...safe } = user;
  return safe as Omit<T, 'motDePasse' | 'twoFactorSecret'>;
}

// Minimum bancaire : 12 chars, majuscule, minuscule, chiffre, caractère spécial
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;
function validateMotDePasse(mdp: string) {
  if (!PASSWORD_REGEX.test(mdp))
    throw new AppError(400, 'Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial');
}

export async function login(email: string, motDePasse: string) {
  const user = await prisma.utilisateur.findUnique({
    where: { email },
    include: { agence: { select: { id: true, code: true, nom: true } } },
  });

  if (!user || !user.actif) throw new AppError(401, 'Identifiants invalides');

  const valid = await comparePassword(motDePasse, user.motDePasse);
  if (!valid) throw new AppError(401, 'Identifiants invalides');

  if (user.twoFactorEnabled) {
    const tempToken = signTempToken(user.id);
    return { requiresTwoFactor: true as const, tempToken };
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role, agenceId: user.agenceId });
  const refreshToken = signRefreshToken(user.id);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: { token: hashToken(refreshToken), utilisateurId: user.id, expiresAt },
  });

  await createAuditLog({ userId: user.id, table: 'utilisateurs', action: 'LOGIN', entiteId: user.id, nouveau: { email: user.email, role: user.role } });

  return { requiresTwoFactor: false as const, token, refreshToken, utilisateur: stripSensitive(user) };
}

export async function verify2FA(tempToken: string, code: string) {
  let userId: string;
  try {
    ({ userId } = verifyTempToken(tempToken));
  } catch {
    throw new AppError(401, 'Session expirée, veuillez vous reconnecter');
  }

  const user = await prisma.utilisateur.findUnique({
    where: { id: userId },
    include: { agence: { select: { id: true, code: true, nom: true } } },
  });
  if (!user || !user.actif) throw new AppError(401, 'Compte invalide');
  if (!user.twoFactorEnabled || !user.twoFactorSecret) throw new AppError(400, '2FA non configurée');

  const isValid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
  if (!isValid) throw new AppError(400, 'Code invalide ou expiré');

  const token = signToken({ userId: user.id, email: user.email, role: user.role, agenceId: user.agenceId });
  const refreshToken = signRefreshToken(user.id);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: { token: hashToken(refreshToken), utilisateurId: user.id, expiresAt },
  });

  await createAuditLog({ userId: user.id, table: 'utilisateurs', action: 'LOGIN_2FA', entiteId: user.id, nouveau: { email: user.email } });

  return { token, refreshToken, utilisateur: stripSensitive(user) };
}

export async function setup2FA(userId: string) {
  const user = await prisma.utilisateur.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'Utilisateur introuvable');
  if (user.twoFactorEnabled) throw new AppError(400, 'La double authentification est déjà activée');

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.email, 'BANKA', secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

  await prisma.utilisateur.update({ where: { id: userId }, data: { twoFactorSecret: secret } });

  return { secret, qrCodeDataUrl };
}

export async function enable2FA(userId: string, code: string) {
  const user = await prisma.utilisateur.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'Utilisateur introuvable');
  if (!user.twoFactorSecret) throw new AppError(400, "Configurez d'abord la double authentification");
  if (user.twoFactorEnabled) throw new AppError(400, 'La double authentification est déjà activée');

  const isValid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
  if (!isValid) throw new AppError(400, "Code invalide. Vérifiez l'heure de votre appareil.");

  await prisma.utilisateur.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
  await createAuditLog({ userId, table: 'utilisateurs', action: 'ENABLE_2FA', entiteId: userId });
}

export async function disable2FA(userId: string, motDePasse: string, code: string) {
  const user = await prisma.utilisateur.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'Utilisateur introuvable');
  if (!user.twoFactorEnabled) throw new AppError(400, "La double authentification n'est pas activée");

  const validPwd = await comparePassword(motDePasse, user.motDePasse);
  if (!validPwd) throw new AppError(400, 'Mot de passe incorrect');

  const isValid = authenticator.verify({ token: code, secret: user.twoFactorSecret! });
  if (!isValid) throw new AppError(400, 'Code invalide');

  await prisma.utilisateur.update({ where: { id: userId }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
  await createAuditLog({ userId, table: 'utilisateurs', action: 'DISABLE_2FA', entiteId: userId });
}

export async function refresh(refreshToken: string) {
  try {
    verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'Refresh token invalide ou expiré');
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: hashToken(refreshToken) },
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
    prisma.refreshToken.create({ data: { token: hashToken(newRefreshToken), utilisateurId: user.id, expiresAt } }),
  ]);

  const token = signToken({ userId: user.id, email: user.email, role: user.role, agenceId: user.agenceId });
  return { token, refreshToken: newRefreshToken };
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { token: hashToken(refreshToken) },
    data: { revoked: true },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.utilisateur.findUnique({
    where: { id: userId },
    include: { agence: { select: { id: true, code: true, nom: true } } },
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

export async function demanderResetMotDePasse(email: string) {
  const user = await prisma.utilisateur.findUnique({ where: { email } });
  // Réponse identique que l'email existe ou non — évite l'énumération
  if (!user || !user.actif) return;

  // Invalider les tokens précédents non utilisés
  await prisma.passwordResetToken.updateMany({
    where: { utilisateurId: user.id, used: false },
    data: { used: true },
  });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

  await prisma.passwordResetToken.create({
    data: { token: hashToken(token), utilisateurId: user.id, expiresAt },
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  // Best-effort : le token est déjà en base et reste valide même si l'envoi échoue (SMTP en panne
  // par ex.) — la réponse au client doit rester identique dans tous les cas pour ne pas révéler
  // si l'email existe, et un email en panne ne doit jamais faire échouer la requête
  try {
    await sendPasswordResetEmail({ to: user.email, nom: user.prenom, resetUrl });
  } catch (err) {
    console.error('[RESET_PASSWORD] Échec envoi email :', err instanceof Error ? err.message : err);
  }
  await createAuditLog({ userId: user.id, table: 'utilisateurs', action: 'RESET_PASSWORD_REQUEST', entiteId: user.id });
}

export async function reinitialiserMotDePasse(token: string, nouveauMdp: string) {
  validateMotDePasse(nouveauMdp);

  const record = await prisma.passwordResetToken.findUnique({ where: { token: hashToken(token) } });
  if (!record || record.used || record.expiresAt < new Date()) {
    throw new AppError(400, 'Lien de réinitialisation invalide ou expiré');
  }

  const hash = await hashPassword(nouveauMdp);

  await prisma.$transaction([
    prisma.utilisateur.update({ where: { id: record.utilisateurId }, data: { motDePasse: hash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
    // Révoquer toutes les sessions actives — changement de mdp = déconnexion globale
    prisma.refreshToken.updateMany({ where: { utilisateurId: record.utilisateurId }, data: { revoked: true } }),
  ]);

  await createAuditLog({ userId: record.utilisateurId, table: 'utilisateurs', action: 'RESET_PASSWORD_CONFIRM', entiteId: record.utilisateurId });
}

export async function listUtilisateurs(agenceId?: string) {
  const where = agenceId ? { agenceId } : {};
  const users = await prisma.utilisateur.findMany({
    where,
    include: { agence: { select: { id: true, code: true, nom: true } } },
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
  agenceId?: string;
  telephone?: string;
}, createdBy?: string) {
  validateMotDePasse(data.motDePasse);
  const hash = await hashPassword(data.motDePasse);
  const user = await prisma.utilisateur.create({
    data: { ...data, motDePasse: hash, role: data.role as any },
    include: { agence: { select: { id: true, code: true, nom: true } } },
  });
  if (createdBy) await createAuditLog({ userId: createdBy, table: 'utilisateurs', action: 'CREATE', entiteId: user.id, nouveau: { email: user.email, role: user.role } });
  return stripSensitive(user);
}

export async function updateUtilisateur(id: string, data: Partial<{ nom: string; prenom: string; telephone: string; role: string; agenceId: string; actif: boolean }>, updatedBy?: string) {
  const user = await prisma.utilisateur.update({
    where: { id },
    data: data as any,
    include: { agence: { select: { id: true, code: true, nom: true } } },
  });

  // Révocation immédiate de tous les tokens si le compte est désactivé
  if (data.actif === false) {
    await prisma.refreshToken.updateMany({ where: { utilisateurId: id, revoked: false }, data: { revoked: true } });
  }

  if (updatedBy) await createAuditLog({ userId: updatedBy, table: 'utilisateurs', action: 'UPDATE', entiteId: id, nouveau: data });
  return stripSensitive(user);
}
