import { Devise } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { getFolioOuvertParChambreId, ajouterLigneFolio } from '../folios/folios.service';

export async function listArticles(etablissementId: string) {
  return prisma.articleMinibar.findMany({ where: { etablissementId }, orderBy: { nom: 'asc' } });
}

export async function creerArticle(etablissementId: string, data: { nom: string; prix: number; devise: Devise }) {
  return prisma.articleMinibar.create({ data: { etablissementId, ...data } });
}

export async function listConsommations(etablissementId: string, chambreId?: string) {
  return prisma.consommationMinibar.findMany({
    where: { chambre: { etablissementId }, ...(chambreId ? { chambreId } : {}) },
    include: { articleMinibar: true, chambre: true },
    orderBy: { dateConstat: 'desc' },
  });
}

// Constatée par le ménage lors du contrôle de chambre — postée directement sur le
// folio ouvert (rejet clair si le folio est déjà fermé, cf. plan).
export async function constaterConsommation(
  etablissementId: string,
  chambreId: string,
  articles: { articleMinibarId: string; quantite: number }[],
  employeId?: string
) {
  const chambre = await prisma.chambre.findUnique({ where: { id: chambreId } });
  if (!chambre || chambre.etablissementId !== etablissementId) throw new AppError('Chambre introuvable', 404);

  const folio = await getFolioOuvertParChambreId(chambreId, etablissementId);

  const articlesData = await prisma.articleMinibar.findMany({ where: { id: { in: articles.map((a) => a.articleMinibarId) } } });

  return prisma.$transaction(async (tx) => {
    const consommations = [];
    for (const a of articles) {
      const article = articlesData.find((x) => x.id === a.articleMinibarId);
      if (!article) throw new AppError('Article minibar introuvable', 404);

      const consommation = await tx.consommationMinibar.create({
        data: { chambreId, articleMinibarId: a.articleMinibarId, quantite: a.quantite, folioId: folio.id, employeId },
        include: { articleMinibar: true },
      });
      consommations.push(consommation);

      await ajouterLigneFolio(tx, folio.id, {
        departementSource: 'MINIBAR',
        description: `${article.nom} x${a.quantite}`,
        montant: Number(article.prix) * a.quantite,
        employeId,
      });
    }
    return consommations;
  });
}
