import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { hashRefreshToken } from '../../utils/crypt';
import { AppError } from '../../types';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
// Verrouillage de compte (Phase 9) : protège un COMPTE précis contre le brute-force même réparti
// sur plusieurs IP, en complément du rate limiting déjà en place sur la route (qui protège une
// IP, pas un compte). Seuil et durée alignés sur le pattern déjà documenté ailleurs dans le
// portefeuille (ACADÉMIE : 5 tentatives, 30 minutes).
const MAX_TENTATIVES = 5;
const DUREE_VERROUILLAGE_MS = 30 * 60 * 1000;

export async function login(email: string, motDePasse: string) {
  const utilisateur = await prisma.utilisateur.findUnique({ where: { email } });
  if (!utilisateur || !utilisateur.actif) {
    throw new AppError(401, 'Email ou mot de passe incorrect');
  }

  if (utilisateur.verrouilleJusqua && utilisateur.verrouilleJusqua > new Date()) {
    const minutesRestantes = Math.ceil((utilisateur.verrouilleJusqua.getTime() - Date.now()) / 60000);
    throw new AppError(423, `Compte temporairement verrouillé suite à plusieurs échecs. Réessayez dans ${minutesRestantes} min.`);
  }

  const valide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
  if (!valide) {
    const tentatives = utilisateur.tentativesEchouees + 1;
    const verrouille = tentatives >= MAX_TENTATIVES;
    await prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: {
        tentativesEchouees: verrouille ? 0 : tentatives,
        verrouilleJusqua: verrouille ? new Date(Date.now() + DUREE_VERROUILLAGE_MS) : null,
      },
    });
    if (verrouille) {
      throw new AppError(423, `Trop de tentatives échouées. Compte verrouillé ${DUREE_VERROUILLAGE_MS / 60000} minutes.`);
    }
    throw new AppError(401, 'Email ou mot de passe incorrect');
  }

  // Connexion réussie : remet le compteur à zéro (un ancien échec ne doit jamais s'accumuler
  // indéfiniment entre deux connexions légitimes).
  if (utilisateur.tentativesEchouees > 0 || utilisateur.verrouilleJusqua) {
    await prisma.utilisateur.update({ where: { id: utilisateur.id }, data: { tentativesEchouees: 0, verrouilleJusqua: null } });
  }

  const accessToken = signAccessToken({
    userId: utilisateur.id,
    email: utilisateur.email,
    role: utilisateur.role,
    pharmacieId: utilisateur.pharmacieId,
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
  const tokenHash = hashRefreshToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { token: tokenHash } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Session expirée, reconnectez-vous');
  }

  const { userId } = verifyRefreshToken(refreshToken);
  const utilisateur = await prisma.utilisateur.findUnique({ where: { id: userId } });
  if (!utilisateur || !utilisateur.actif) throw new AppError(401, 'Compte introuvable ou désactivé');

  // Rotation : l'ancien refresh token est révoqué, un nouveau est émis et persisté.
  const newRefreshToken = signRefreshToken(utilisateur.id);
  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: stored.id } }),
    prisma.refreshToken.create({
      data: {
        token: hashRefreshToken(newRefreshToken),
        userId: utilisateur.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    }),
  ]);

  const accessToken = signAccessToken({
    userId: utilisateur.id,
    email: utilisateur.email,
    role: utilisateur.role,
    pharmacieId: utilisateur.pharmacieId,
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken: string): Promise<string | null> {
  const tokenHash = hashRefreshToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { token: tokenHash } });
  await prisma.refreshToken.deleteMany({ where: { token: tokenHash } });
  return stored?.userId ?? null;
}

export async function getMe(userId: string) {
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id: userId },
    select: { id: true, email: true, nom: true, prenom: true, role: true, telephone: true, pharmacieId: true },
  });
  if (!utilisateur) throw new AppError(404, 'Utilisateur introuvable');
  return utilisateur;
}
