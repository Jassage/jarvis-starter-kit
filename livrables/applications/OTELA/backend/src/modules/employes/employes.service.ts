import bcrypt from 'bcryptjs';
import { RoleEmploye } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';

const SALT_ROUNDS = 12;

// Jamais le champ password — même vigilance que sur menage.service.ts où une fuite
// de hash avait déjà été trouvée et corrigée en Phase 2.
const SELECT_SAFE = { id: true, nom: true, email: true, role: true, etablissementId: true, isActive: true, createdAt: true };

export interface Requester {
  id: string;
  role: RoleEmploye;
  etablissementId: string | null;
}

function estChaine(requester: Requester) {
  return requester.role === 'ADMINISTRATEUR_CHAINE';
}

export async function listEmployes(requester: Requester, filtreEtablissementId?: string) {
  if (estChaine(requester)) {
    return prisma.employe.findMany({
      where: filtreEtablissementId ? { etablissementId: filtreEtablissementId } : {},
      select: SELECT_SAFE,
      orderBy: { nom: 'asc' },
    });
  }
  // Admin établissement : jamais les employés d'un autre établissement — même
  // cloisonnement que resolveEtablissement utilisé partout ailleurs.
  return prisma.employe.findMany({
    where: { etablissementId: requester.etablissementId },
    select: SELECT_SAFE,
    orderBy: { nom: 'asc' },
  });
}

// Prévention d'escalade de privilèges : un admin établissement ne peut jamais créer
// de compte ADMINISTRATEUR_CHAINE, et son etablissementId est toujours forcé au sien
// (jamais accepté depuis le payload client).
export async function creerEmploye(
  requester: Requester,
  data: { nom: string; email: string; password: string; role: RoleEmploye; etablissementId?: string | null }
) {
  let etablissementId: string | null;

  if (estChaine(requester)) {
    if (data.role === 'ADMINISTRATEUR_CHAINE') {
      etablissementId = null;
    } else {
      if (!data.etablissementId) throw new AppError('etablissementId requis pour ce rôle', 400);
      etablissementId = data.etablissementId;
    }
  } else {
    if (data.role === 'ADMINISTRATEUR_CHAINE') {
      throw new AppError('Vous ne pouvez pas créer de compte administrateur chaîne', 403);
    }
    etablissementId = requester.etablissementId;
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  return prisma.employe.create({
    data: { nom: data.nom, email: data.email, password: hashedPassword, role: data.role, etablissementId },
    select: SELECT_SAFE,
  });
}

async function trouverEmployeGere(requester: Requester, id: string) {
  const employe = await prisma.employe.findUnique({ where: { id }, select: SELECT_SAFE });
  if (!employe) throw new AppError('Employé non trouvé', 404);
  if (!estChaine(requester) && employe.etablissementId !== requester.etablissementId) {
    throw new AppError('Cet employé n\'appartient pas à votre établissement', 403);
  }
  return employe;
}

export async function updateEmploye(
  requester: Requester,
  id: string,
  data: { nom?: string; role?: RoleEmploye; isActive?: boolean }
) {
  await trouverEmployeGere(requester, id);

  if (data.role === 'ADMINISTRATEUR_CHAINE' && !estChaine(requester)) {
    throw new AppError('Vous ne pouvez pas promouvoir un compte en administrateur chaîne', 403);
  }
  // Anti-auto-verrouillage : un admin ne peut pas désactiver son propre compte,
  // au risque de laisser un établissement sans aucun admin actif.
  if (data.isActive === false && id === requester.id) {
    throw new AppError('Vous ne pouvez pas désactiver votre propre compte', 400);
  }

  return prisma.employe.update({ where: { id }, data, select: SELECT_SAFE });
}

// Distincte de auth.service.ts::changePassword (qui exige de connaître l'ancien mot
// de passe) — un admin fixe un nouveau mot de passe pour un employé qui a oublié le
// sien, ce qui révoque aussi ses sessions actives (même pattern que changePassword,
// qui supprime déjà les RefreshToken à chaque changement).
export async function reinitialiserMotDePasse(requester: Requester, id: string, nouveauMotDePasse: string) {
  await trouverEmployeGere(requester, id);

  const hashedPassword = await bcrypt.hash(nouveauMotDePasse, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.employe.update({ where: { id }, data: { password: hashedPassword } }),
    prisma.refreshToken.deleteMany({ where: { employeId: id } }),
  ]);
}
