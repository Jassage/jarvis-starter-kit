import prisma from '../../config/database';
import { AppError } from '../../types';
import { envoyerNewsletter } from '../../utils/mailer';

// Upsert plutôt qu'un simple create : un email qui s'était désabonné (actif=false) et qui
// se réinscrit doit être réactivé, pas rejeté sur la contrainte unique ni dupliqué.
export async function subscribe(email: string) {
  return prisma.abonneNewsletter.upsert({
    where: { email },
    create: { email },
    update: { actif: true },
  });
}

export async function list() {
  return prisma.abonneNewsletter.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function remove(id: string) {
  const existing = await prisma.abonneNewsletter.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Abonné introuvable');
  await prisma.abonneNewsletter.delete({ where: { id } });
}

// Envoi ponctuel (pas de campagne persistée/planifiée, décision assumée en Phase 2f, cf.
// PLAN.md — Phase 4 se limite à rendre l'envoi réellement possible, pas à construire un
// moteur de campagnes). L'action elle-même est déjà journalisée automatiquement par le
// middleware d'activité générique (POST authentifié), aucun modèle dédié nécessaire.
export async function envoyerCampagne(sujet: string, message: string) {
  const abonnes = await prisma.abonneNewsletter.findMany({ where: { actif: true }, select: { email: true } });
  if (abonnes.length === 0) throw new AppError(400, 'Aucun abonné actif à qui envoyer');
  return envoyerNewsletter({ destinataires: abonnes.map((a) => a.email), sujet, texte: message });
}
