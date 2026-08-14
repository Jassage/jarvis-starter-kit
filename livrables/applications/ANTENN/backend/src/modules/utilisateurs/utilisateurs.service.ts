import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { Role } from '@prisma/client';

const SALT_ROUNDS = 12;

// Durée de vie d'un lien de réinitialisation. Court, parce que le lien circule par un
// canal que la régie ne maîtrise pas (WhatsApp, SMS) : aucun SMTP n'est configuré sur
// ce déploiement, l'administrateur transmet donc le lien lui-même.
const RESET_TOKEN_TTL_MINUTES = 60;

const SELECT = {
  id: true,
  email: true,
  nom: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listUtilisateurs() {
  return prisma.user.findMany({ select: SELECT, orderBy: { createdAt: 'asc' } });
}

export async function getUtilisateur(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: SELECT });
  if (!user) throw new AppError('Utilisateur non trouvé', 404);
  return user;
}

interface CreateInput {
  email: string;
  nom: string;
  password: string;
  role: Role;
}

export async function createUtilisateur(data: CreateInput) {
  const existant = await prisma.user.findUnique({ where: { email: data.email } });
  if (existant) throw new AppError('Un compte existe déjà avec cet email', 409);

  return prisma.user.create({
    data: {
      email: data.email,
      nom: data.nom,
      password: await bcrypt.hash(data.password, SALT_ROUNDS),
      role: data.role,
    },
    select: SELECT,
  });
}

interface UpdateInput {
  nom?: string;
  role?: Role;
  isActive?: boolean;
}

// Deux gardes, toutes deux vérifiées côté service (l'UI ne suffit pas) :
//  1. anti auto-verrouillage — un administrateur ne peut ni se rétrograder ni se
//     désactiver lui-même, sinon il perd l'accès à la seule interface qui permet de
//     revenir en arrière ;
//  2. dernier administrateur actif — la chaîne doit toujours conserver quelqu'un
//     capable de gérer les contrats sponsors et les comptes.
export async function updateUtilisateur(id: string, data: UpdateInput, auteurId: string) {
  const cible = await prisma.user.findUnique({ where: { id } });
  if (!cible) throw new AppError('Utilisateur non trouvé', 404);

  if (id === auteurId) {
    if (data.role !== undefined && data.role !== cible.role) {
      throw new AppError('Vous ne pouvez pas modifier votre propre rôle', 400);
    }
    if (data.isActive === false) {
      throw new AppError('Vous ne pouvez pas désactiver votre propre compte', 400);
    }
  }

  const perdSonRoleAdmin =
    cible.role === Role.ADMINISTRATEUR &&
    ((data.role !== undefined && data.role !== Role.ADMINISTRATEUR) || data.isActive === false);

  if (perdSonRoleAdmin) {
    const autresAdmins = await prisma.user.count({
      where: { role: Role.ADMINISTRATEUR, isActive: true, id: { not: id } },
    });
    if (autresAdmins === 0) {
      throw new AppError('Impossible : ce compte est le dernier administrateur actif de la régie', 409);
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.role !== undefined && { role: data.role }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    select: SELECT,
  });

  // Désactiver un compte doit couper l'accès tout de suite, pas au bout des 15 min de
  // validité de l'access token en cours.
  if (data.isActive === false) {
    await prisma.refreshToken.deleteMany({ where: { userId: id } });
  }

  return user;
}

// Génère un lien de réinitialisation à usage unique. L'administrateur ne connaît
// jamais le nouveau mot de passe : il transmet le lien, l'intéressé choisit son mot de
// passe. Le jeton n'est stocké qu'en empreinte SHA-256 (même traitement que les
// refresh tokens) : un dump de base ne permet pas de rejouer un lien.
export async function genererLienReinitialisation(id: string) {
  const cible = await prisma.user.findUnique({ where: { id } });
  if (!cible) throw new AppError('Utilisateur non trouvé', 404);

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.$transaction([
    // Un seul lien valide à la fois : générer un nouveau lien invalide les précédents.
    prisma.passwordResetToken.deleteMany({ where: { userId: id, usedAt: null } }),
    prisma.passwordResetToken.create({
      data: { token: hashToken(token), userId: id, expiresAt },
    }),
  ]);

  return { token, expiresAt, utilisateur: { id: cible.id, email: cible.email, nom: cible.nom } };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Consommation du lien : usage unique, non expiré, compte toujours actif. Toutes les
// sessions en cours sont révoquées — si le mot de passe a été réinitialisé, c'est
// souvent que quelqu'un d'autre y avait accès.
export async function consommerLienReinitialisation(token: string, nouveauMotDePasse: string) {
  const enregistrement = await prisma.passwordResetToken.findUnique({
    where: { token: hashToken(token) },
    include: { user: { select: { id: true, isActive: true, email: true, nom: true } } },
  });

  if (!enregistrement || enregistrement.usedAt || enregistrement.expiresAt < new Date()) {
    throw new AppError('Lien de réinitialisation invalide ou expiré', 400);
  }
  if (!enregistrement.user.isActive) {
    throw new AppError('Compte désactivé', 403);
  }

  const hash = await bcrypt.hash(nouveauMotDePasse, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({ where: { id: enregistrement.userId }, data: { password: hash } }),
    prisma.passwordResetToken.update({ where: { id: enregistrement.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.deleteMany({ where: { userId: enregistrement.userId } }),
  ]);

  return enregistrement.user;
}
