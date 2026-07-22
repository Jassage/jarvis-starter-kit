import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { generateOpaqueToken, hashOpaqueToken, hashRefreshToken } from '../../utils/crypt';
import { sendMail } from '../../utils/mailer';
import { env } from '../../config/env';
import { AppError } from '../../types';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export async function login(email: string, motDePasse: string) {
  const utilisateur = await prisma.utilisateur.findUnique({ where: { email } });
  if (!utilisateur || !utilisateur.actif) {
    throw new AppError(401, 'Email ou mot de passe incorrect');
  }

  const valide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
  if (!valide) throw new AppError(401, 'Email ou mot de passe incorrect');

  const accessToken = signAccessToken({
    userId: utilisateur.id,
    email: utilisateur.email,
    role: utilisateur.role,
  });
  const refreshToken = signRefreshToken(utilisateur.id);

  await prisma.refreshToken.create({
    data: {
      token: hashRefreshToken(refreshToken),
      userId: utilisateur.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return {
    accessToken,
    refreshToken,
    utilisateur: {
      id: utilisateur.id,
      email: utilisateur.email,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      role: utilisateur.role,
    },
  };
}

export async function refresh(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: hashRefreshToken(refreshToken) },
  });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Session expirée, reconnectez-vous');
  }

  const { userId } = verifyRefreshToken(refreshToken);
  const utilisateur = await prisma.utilisateur.findUnique({ where: { id: userId } });
  if (!utilisateur || !utilisateur.actif) throw new AppError(401, 'Compte introuvable ou désactivé');

  const accessToken = signAccessToken({
    userId: utilisateur.id,
    email: utilisateur.email,
    role: utilisateur.role,
  });

  return { accessToken };
}

export async function logout(refreshToken: string): Promise<string | null> {
  const tokenHash = hashRefreshToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { token: tokenHash } });
  await prisma.refreshToken.deleteMany({ where: { token: tokenHash } });
  return stored?.userId ?? null;
}

// Jeton en clair renvoyé à l'appelant (jamais persisté) : utilisé aussi bien pour le
// "mot de passe oublié" que pour l'email d'invitation envoyé à la création d'un compte client.
export async function createResetToken(userId: string): Promise<string> {
  const token = generateOpaqueToken();
  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashOpaqueToken(token),
      userId,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });
  return token;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const utilisateur = await prisma.utilisateur.findUnique({ where: { email } });
  if (!utilisateur || !utilisateur.actif) return; // ne jamais révéler si le compte existe

  const token = await createResetToken(utilisateur.id);
  const lien = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendMail(
    utilisateur.email,
    'Réinitialisation de votre mot de passe POSTA',
    `<p>Bonjour ${utilisateur.prenom},</p>
     <p>Cliquez sur ce lien pour choisir un nouveau mot de passe (valable 1 heure) :</p>
     <p><a href="${lien}">${lien}</a></p>
     <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`
  );
}

export async function resetPassword(token: string, motDePasse: string): Promise<string> {
  const tokenHash = hashOpaqueToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw new AppError(400, 'Lien de réinitialisation invalide ou expiré');
  }

  const motDePasseHash = await bcrypt.hash(motDePasse, 12);

  await prisma.$transaction([
    prisma.utilisateur.update({
      where: { id: resetToken.userId },
      data: { motDePasse: motDePasseHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    // Le changement de mot de passe révoque toutes les sessions actives, y compris
    // celle d'un éventuel attaquant qui aurait volé l'ancien mot de passe.
    prisma.refreshToken.deleteMany({ where: { userId: resetToken.userId } }),
  ]);

  return resetToken.userId;
}

export async function getMe(userId: string) {
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id: userId },
    select: { id: true, email: true, nom: true, prenom: true, role: true },
  });
  if (!utilisateur) throw new AppError(404, 'Utilisateur introuvable');
  return utilisateur;
}
