import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { AppError } from '../../types';

const SELECT_SANS_MOT_DE_PASSE = {
  id: true,
  email: true,
  nom: true,
  prenom: true,
  telephone: true,
  role: true,
  actif: true,
  createdAt: true,
} as const;

interface CreerUtilisateurInput {
  pharmacieId: string;
  email: string;
  motDePasse: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role: string;
  createParRole: string;
}

// Seul un SUPER_ADMIN peut créer/promouvoir un autre SUPER_ADMIN — un GERANT ne peut pas
// s'octroyer (ni octroyer à un tiers) les droits techniques complets. Même garde anti-escalade
// de privilèges que OTELA (ADMINISTRATEUR_ETABLISSEMENT → ADMINISTRATEUR_CHAINE).
function verifierEscaladePrivileges(roleCible: string, roleActeur: string) {
  if (roleCible === 'SUPER_ADMIN' && roleActeur !== 'SUPER_ADMIN') {
    throw new AppError(403, 'Seul un SUPER_ADMIN peut créer ou promouvoir un compte SUPER_ADMIN');
  }
}

export async function list(pharmacieId: string) {
  return prisma.utilisateur.findMany({
    where: { pharmacieId },
    select: SELECT_SANS_MOT_DE_PASSE,
    orderBy: [{ actif: 'desc' }, { nom: 'asc' }],
  });
}

// Mot de passe initial fixé directement par l'admin à la création (pas d'infrastructure
// d'invitation par email — REMED n'a pas de SMTP configuré, même choix qu'OTELA pour son module
// Employés). Le nouvel utilisateur devra le changer lui-même ensuite s'il le souhaite (hors
// scope : aucune page "changer mon mot de passe" n'existe encore côté self-service).
export async function creer(input: CreerUtilisateurInput) {
  verifierEscaladePrivileges(input.role, input.createParRole);

  const existant = await prisma.utilisateur.findUnique({ where: { email: input.email } });
  if (existant) throw new AppError(409, 'Un compte existe déjà avec cet email');

  const motDePasseHache = await bcrypt.hash(input.motDePasse, 12);

  return prisma.utilisateur.create({
    data: {
      pharmacieId: input.pharmacieId,
      email: input.email,
      motDePasse: motDePasseHache,
      nom: input.nom,
      prenom: input.prenom,
      telephone: input.telephone,
      role: input.role as never,
    },
    select: SELECT_SANS_MOT_DE_PASSE,
  });
}

interface UpdateUtilisateurInput {
  nom?: string;
  prenom?: string;
  telephone?: string;
  role?: string;
  actif?: boolean;
}

export async function update(
  pharmacieId: string,
  id: string,
  data: UpdateUtilisateurInput,
  acteurId: string,
  roleActeur: string
) {
  const cible = await prisma.utilisateur.findFirst({ where: { id, pharmacieId } });
  if (!cible) throw new AppError(404, 'Utilisateur introuvable');

  // Anti-auto-verrouillage : un compte ne peut pas modifier son propre rôle ni se désactiver
  // lui-même (même garde que NEXORA/OTELA — sinon un admin unique pourrait se bloquer par erreur).
  if (id === acteurId) {
    if (data.role !== undefined && data.role !== cible.role) {
      throw new AppError(400, 'Vous ne pouvez pas modifier votre propre rôle');
    }
    if (data.actif === false) {
      throw new AppError(400, 'Vous ne pouvez pas désactiver votre propre compte');
    }
  }

  if (data.role) verifierEscaladePrivileges(data.role, roleActeur);

  // Garde du dernier SUPER_ADMIN : désactiver ou rétrograder le seul SUPER_ADMIN restant
  // bloquerait toute administration technique future de la pharmacie.
  if ((data.actif === false || (data.role && data.role !== 'SUPER_ADMIN')) && cible.role === 'SUPER_ADMIN') {
    const autresAdminsActifs = await prisma.utilisateur.count({
      where: { pharmacieId, role: 'SUPER_ADMIN', actif: true, id: { not: id } },
    });
    if (autresAdminsActifs === 0) {
      throw new AppError(400, 'Impossible : ce compte est le seul SUPER_ADMIN encore actif de la pharmacie');
    }
  }

  const utilisateur = await prisma.utilisateur.update({
    where: { id },
    data: {
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
      role: data.role as never,
      actif: data.actif,
    },
    select: SELECT_SANS_MOT_DE_PASSE,
  });

  // Désactivation = révocation immédiate des sessions actives, pas seulement un blocage au
  // prochain login (même pattern qu'OTELA::changePassword / ACADÉMIE).
  if (data.actif === false) {
    await prisma.refreshToken.deleteMany({ where: { userId: id } });
  }

  return utilisateur;
}

// Réinitialisation par un admin, distincte d'un futur changement de mot de passe self-service :
// révoque les sessions actives de la cible et remet le compteur d'échecs de connexion à zéro
// (un compte verrouillé par brute-force redevient immédiatement utilisable avec le nouveau mot
// de passe, sans attendre les 30 minutes du verrouillage).
export async function resetPassword(pharmacieId: string, id: string, nouveauMotDePasse: string) {
  const cible = await prisma.utilisateur.findFirst({ where: { id, pharmacieId } });
  if (!cible) throw new AppError(404, 'Utilisateur introuvable');

  const motDePasseHache = await bcrypt.hash(nouveauMotDePasse, 12);

  await prisma.$transaction([
    prisma.utilisateur.update({
      where: { id },
      data: { motDePasse: motDePasseHache, tentativesEchouees: 0, verrouilleJusqua: null },
    }),
    prisma.refreshToken.deleteMany({ where: { userId: id } }),
  ]);
}
