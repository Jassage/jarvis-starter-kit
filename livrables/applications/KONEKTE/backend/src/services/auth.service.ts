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

  const token = generateToken(user.id, user.email, user.subscriptionPlan);

  sendVerificationEmail(user.email, emailVerifyToken).catch(() => {});

  return {
    token,
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

  const token = generateToken(user.id, user.email, user.subscriptionPlan);

  return {
    token,
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
};

export const deleteAccountService = async (userId: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Utilisateur introuvable");

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new Error("Mot de passe incorrect");

  await prisma.user.update({ where: { id: userId }, data: { isActive: false, email: `deleted_${Date.now()}_${user.email}` } });
};

const generateToken = (userId: string, email: string, plan: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET non configuré");

  return jwt.sign({ userId, email, plan }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ?? "7d",
  });
};
