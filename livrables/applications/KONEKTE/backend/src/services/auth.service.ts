import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { sendVerificationEmail, sendResetPasswordEmail } from "./email.service";

export const registerService = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Cet email est déjà utilisé");

  const passwordHash = await bcrypt.hash(data.password, 12);
  const emailVerifyToken = crypto.randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      emailVerifyToken,
      profile: {
        create: {
          firstName: data.firstName,
          birthDate: new Date(data.birthDate),
          gender: data.gender as "HOMME" | "FEMME" | "AUTRE",
          city: data.city,
        },
      },
    },
    include: { profile: true },
  });

  const token = generateAccessToken(user.id, user.email, user.subscriptionPlan);
  const refreshToken = await generateRefreshToken(user.id);

  sendVerificationEmail(user.email, emailVerifyToken).catch(() => {});

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.profile?.firstName,
      isEmailVerified: user.isEmailVerified,
      subscriptionPlan: user.subscriptionPlan,
    },
  };
};

export const loginService = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { profile: true, photos: { where: { isMain: true } } },
  });

  if (!user) throw new Error("Email ou mot de passe incorrect");
  if (user.isBanned) throw new Error("Ce compte a été suspendu");
  if (!user.isActive) throw new Error("Ce compte est désactivé");

  const isValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValid) throw new Error("Email ou mot de passe incorrect");

  await prisma.user.update({
    where: { id: user.id },
    data: { lastSeenAt: new Date() },
  });

  const token = generateAccessToken(user.id, user.email, user.subscriptionPlan);
  const refreshToken = await generateRefreshToken(user.id);

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.profile?.firstName,
      city: user.profile?.city,
      mainPhoto: user.photos[0]?.url ?? null,
      isEmailVerified: user.isEmailVerified,
      subscriptionPlan: user.subscriptionPlan,
      profileComplete: user.profile?.profileComplete ?? 0,
    },
  };
};

export const verifyEmailService = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token },
  });

  if (!user) throw new Error("Token invalide ou expiré");

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailVerifyToken: null },
  });
};

export const getMeService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      photos: { orderBy: { order: "asc" } },
    },
  });

  if (!user) throw new Error("Utilisateur introuvable");

  return {
    id: user.id,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    subscriptionPlan: user.subscriptionPlan,
    boostsRemaining: user.boostsRemaining,
    lastSeenAt: user.lastSeenAt,
    isAdmin: user.isAdmin,
    profile: user.profile,
    photos: user.photos,
  };
};

export const requestPasswordResetService = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetPasswordToken: token, resetPasswordExpiry: expiry },
  });

  sendResetPasswordEmail(email, token).catch(() => {});
};

export const resetPasswordService = async (token: string, newPassword: string) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpiry: { gt: new Date() },
    },
  });

  if (!user) throw new Error("Token invalide ou expiré");

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetPasswordToken: null, resetPasswordExpiry: null },
  });
};

export const changePasswordService = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Utilisateur introuvable");

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) throw new Error("Mot de passe actuel incorrect");

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await revokeAllRefreshTokens(userId);
};

export const deleteAccountService = async (userId: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Utilisateur introuvable");

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new Error("Mot de passe incorrect");

  await prisma.user.update({ where: { id: userId }, data: { isActive: false, email: `deleted_${Date.now()}_${user.email}` } });
  await revokeAllRefreshTokens(userId);
};

// ─── Jetons ───────────────────────────────────────────────────────────────────
// Access token : court (JWT stateless, envoyé dans l'en-tête Authorization).
// Refresh token : long (opaque, en cookie httpOnly, tracé en base pour pouvoir
// être révoqué — contrairement à un JWT seul qui reste valide jusqu'à expiration).

const generateAccessToken = (userId: string, email: string, plan: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET non configuré");

  return jwt.sign({ userId, email, plan }, secret, {
    expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ?? "15m",
  });
};

const hashToken = (raw: string) => crypto.createHash("sha256").update(raw).digest("hex");

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const generateRefreshToken = async (userId: string) => {
  const raw = crypto.randomBytes(48).toString("hex");
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });
  return raw;
};

export const refreshTokenService = async (rawToken: string) => {
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(rawToken) } });
  if (!record || record.revokedAt || record.expiresAt < new Date()) {
    throw new Error("Session expirée, reconnecte-toi");
  }

  const user = await prisma.user.findUnique({ where: { id: record.userId }, include: { profile: true } });
  if (!user || !user.isActive || user.isBanned) throw new Error("Compte inactif");

  // Rotation : l'ancien refresh token est révoqué dès qu'il sert une fois.
  await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });

  const token = generateAccessToken(user.id, user.email, user.subscriptionPlan);
  const refreshToken = await generateRefreshToken(user.id);

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.profile?.firstName,
      city: user.profile?.city,
      isEmailVerified: user.isEmailVerified,
      subscriptionPlan: user.subscriptionPlan,
      profileComplete: user.profile?.profileComplete ?? 0,
    },
  };
};

export const logoutService = async (rawToken?: string) => {
  if (!rawToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const revokeAllRefreshTokens = async (userId: string) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};
