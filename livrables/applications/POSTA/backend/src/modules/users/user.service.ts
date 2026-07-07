import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import prisma from '../../config/database';
import { AppError } from '../../types';
import { env } from '../../config/env';
import { sendMail } from '../../utils/mailer';
import { createResetToken } from '../auth/auth.service';

const SAFE_SELECT = {
  id: true,
  email: true,
  nom: true,
  prenom: true,
  role: true,
  actif: true,
  createdAt: true,
  _count: { select: { domaines: true } },
} as const;

export async function createUser(email: string, nom: string, prenom: string) {
  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) throw new AppError(409, 'Un compte existe déjà avec cet email');

  // Mot de passe initial aléatoire, jamais communiqué : le client choisit le sien via le
  // lien d'invitation (même mécanisme que "mot de passe oublié"), l'administrateur qui crée
  // le compte ne le connaît jamais.
  const motDePasseHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12);

  const utilisateur = await prisma.utilisateur.create({
    data: {
      email,
      motDePasse: motDePasseHash,
      nom,
      prenom,
      role: 'CLIENT_ADMIN',
      subscription: { create: { plan: 'FREE' } },
    },
    select: SAFE_SELECT,
  });

  const token = await createResetToken(utilisateur.id);
  const lien = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendMail(
    email,
    'Votre compte POSTA a été créé',
    `<p>Bonjour ${prenom},</p>
     <p>Un compte POSTA vient d'être créé pour vous. Cliquez sur ce lien pour choisir votre
     mot de passe (valable 1 heure) :</p>
     <p><a href="${lien}">${lien}</a></p>`
  );

  return utilisateur;
}

export async function listUsers() {
  return prisma.utilisateur.findMany({
    where: { role: 'CLIENT_ADMIN' },
    select: SAFE_SELECT,
    orderBy: { createdAt: 'desc' },
  });
}

export async function setUserActif(id: string, actif: boolean) {
  const utilisateur = await prisma.utilisateur.findUnique({ where: { id } });
  if (!utilisateur || utilisateur.role !== 'CLIENT_ADMIN') {
    throw new AppError(404, 'Utilisateur introuvable');
  }

  const updated = await prisma.utilisateur.update({
    where: { id },
    data: { actif },
    select: SAFE_SELECT,
  });

  // Révocation immédiate des sessions actives à la désactivation (même logique que les autres SaaS du portefeuille).
  if (!actif) {
    await prisma.refreshToken.deleteMany({ where: { userId: id } });
  }

  return updated;
}
