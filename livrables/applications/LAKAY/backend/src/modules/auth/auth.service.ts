import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { sendEmail, emailVerificationTemplate, passwordResetTemplate } from '../../utils/email';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { env } from '../../config/env';

const SALT_ROUNDS = 12;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('Cet email est déjà utilisé', 409);

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: (data.role as 'AGENCY' | 'OWNER' | 'INDIVIDUAL') || 'INDIVIDUAL',
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    // Créer l'abonnement FREE par défaut
    await tx.subscription.create({
      data: { userId: newUser.id, plan: 'FREE' },
    });

    return newUser;
  });

  // Envoyer email de vérification
  await sendVerificationEmail(user.id, user.email, user.firstName);

  return user;
}

export async function sendVerificationEmail(userId: string, email: string, firstName: string) {
  const token = uuidv4();
  const tokenHash = hashToken(token);

  await prisma.emailVerificationToken.upsert({
    where: { userId },
    create: { tokenHash, userId, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    update: { tokenHash, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });

  await sendEmail({
    to: email,
    subject: 'Vérifiez votre email — LAKAY',
    html: emailVerificationTemplate(firstName, token),
  });
}

export async function verifyEmail(token: string) {
  const tokenHash = hashToken(token);

  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
  if (!record || record.expiresAt < new Date()) {
    throw new AppError('Lien de vérification invalide ou expiré', 400);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { isVerified: true, emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.delete({ where: { tokenHash } }),
  ]);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, password: true, firstName: true, lastName: true, role: true, isActive: true, isVerified: true },
  });

  if (!user) throw new AppError('Email ou mot de passe incorrect', 401);
  if (!user.isActive) throw new AppError('Compte désactivé. Contactez le support.', 403);

  const passwordOk = await bcrypt.compare(password, user.password);
  if (!passwordOk) throw new AppError('Email ou mot de passe incorrect', 401);

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return await generateTokens(user);
}

async function generateTokens(user: { id: string; email: string; role: string; firstName: string; lastName: string }) {
  const tokenId = uuidv4();

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role as 'SUPER_ADMIN' | 'ADMIN' | 'AGENCY' | 'AGENT' | 'OWNER' | 'INDIVIDUAL',
  });

  const refreshToken = signRefreshToken({ userId: user.id, tokenId });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
}

export async function refresh(refreshTokenValue: string) {
  const payload = verifyRefreshToken(refreshTokenValue);

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
    include: { user: { select: { id: true, email: true, role: true, firstName: true, lastName: true, isActive: true } } },
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

  // Rotation : supprimer l'ancien, créer le nouveau
  await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

  return await generateTokens(tokenRecord.user);
}

export async function logout(refreshTokenValue: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshTokenValue } });
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, firstName: true },
  });

  // Toujours retourner 200 (pas d'énumération d'email)
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
    },
  });

  await sendEmail({
    to: email,
    subject: 'Réinitialisation de mot de passe — LAKAY',
    html: passwordResetTemplate(user.firstName, token),
  });
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashToken(token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.expiresAt < new Date() || record.usedAt) {
    throw new AppError('Lien de réinitialisation invalide ou expiré', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    }),
    // Révoquer tous les refresh tokens
    prisma.refreshToken.deleteMany({ where: { userId: record.userId } }),
  ]);
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

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      whatsapp: true,
      avatar: true,
      role: true,
      isActive: true,
      isVerified: true,
      bio: true,
      createdAt: true,
      agency: { select: { id: true, name: true, logo: true, isVerified: true } },
      agencyMembership: { include: { agency: { select: { id: true, name: true, logo: true } } } },
      subscription: { select: { plan: true, endDate: true, isActive: true } },
      _count: { select: { listings: true, favorites: true } },
    },
  });
  if (!user) throw new AppError('Utilisateur non trouvé', 404);
  return user;
}

export async function updateProfile(userId: string, data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  whatsapp?: string;
  bio?: string;
}) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, firstName: true, lastName: true, phone: true, whatsapp: true, bio: true, avatar: true },
  });
}
