import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../types';
import { slugify, uniqueBoutiqueSlug } from '../boutiques/boutiques.service';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function register(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  boutiqueName: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError('Un compte existe déjà avec cet email', 409);

  const passwordHash = await bcrypt.hash(input.password, 12);
  const slug = await uniqueBoutiqueSlug(slugify(input.boutiqueName));

  const { user, boutique } = await prisma.$transaction(async (tx) => {
    const boutique = await tx.boutique.create({
      data: {
        name: input.boutiqueName,
        slug,
        // ACTIVE dès l'inscription : SHOPAY est self-service (pas de workflow de modération
        // à l'onboarding) — le statut PENDING_SETUP n'a de sens que s'il existe un moyen de le
        // faire évoluer, or seul un admin plateforme peut changer le statut d'une boutique.
        // SUSPENDED reste la voie de modération a posteriori (cf. admin.routes.ts).
        status: 'ACTIVE',
      },
    });
    await tx.merchantSubscription.create({
      data: { boutiqueId: boutique.id, plan: 'FREE' },
    });
    const user = await tx.user.create({
      data: {
        email: input.email,
        password: passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        role: 'BOUTIQUE_OWNER',
        boutiqueId: boutique.id,
      },
    });
    return { user, boutique };
  });

  return issueSession(user.id, user.email, user.role, user.boutiqueId, {
    id: boutique.id,
    name: boutique.name,
    slug: boutique.slug,
    status: boutique.status,
  });
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw new AppError('Email ou mot de passe incorrect', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Email ou mot de passe incorrect', 401);

  const boutique = user.boutiqueId
    ? await prisma.boutique.findUnique({ where: { id: user.boutiqueId }, select: { id: true, name: true, slug: true, status: true } })
    : null;

  if (boutique?.status === 'SUSPENDED') {
    throw new AppError('Cette boutique a été suspendue. Contactez le support.', 403);
  }

  return issueSession(user.id, user.email, user.role, user.boutiqueId, boutique);
}

async function issueSession(
  userId: string,
  email: string,
  role: 'PLATFORM_SUPER_ADMIN' | 'BOUTIQUE_OWNER' | 'BOUTIQUE_STAFF',
  boutiqueId: string | null,
  boutique: { id: string; name: string; slug: string; status: string } | null | undefined
) {
  const accessToken = signAccessToken({ userId, email, role, boutiqueId });
  const refreshToken = signRefreshToken(userId);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId, expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS) },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: userId, email, role, boutiqueId },
    boutique: boutique ?? null,
  };
}

export async function refresh(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError('Session expirée, reconnectez-vous', 401);
  }

  const { userId } = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) throw new AppError('Compte introuvable ou désactivé', 401);

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role, boutiqueId: user.boutiqueId });
  return { accessToken };
}

export async function logout(refreshToken: string): Promise<string | null> {
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (stored) {
    await prisma.refreshToken.update({ where: { token: refreshToken }, data: { revoked: true } });
  }
  return stored?.userId ?? null;
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      boutiqueId: true,
      boutique: { select: { id: true, name: true, slug: true, status: true, logoUrl: true, themeColor: true } },
    },
  });
  if (!user) throw new AppError('Utilisateur introuvable', 404);
  return user;
}
