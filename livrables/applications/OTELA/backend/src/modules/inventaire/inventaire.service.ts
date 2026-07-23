import { CategorieInventaire, TypeMouvementInventaire } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';

function requireEtablissementId(etablissementId: string | null | undefined): string {
  if (!etablissementId) throw new AppError('etablissementId requis', 400);
  return etablissementId;
}

export async function listArticles(etablissementId: string) {
  return prisma.articleInventaire.findMany({
    where: { etablissementId },
    orderBy: { nom: 'asc' },
  });
}

async function trouverArticleGere(id: string, etablissementId: string | null | undefined) {
  const article = await prisma.articleInventaire.findUnique({ where: { id } });
  if (!article) throw new AppError('Article non trouvé', 404);
  if (etablissementId && article.etablissementId !== etablissementId) {
    throw new AppError('Cet article n\'appartient pas à votre établissement', 403);
  }
  return article;
}

export async function creerArticle(
  etablissementId: string | null | undefined,
  data: { nom: string; categorie?: CategorieInventaire; unite?: string; seuilAlerte?: number }
) {
  const etabId = requireEtablissementId(etablissementId);
  const existant = await prisma.articleInventaire.findFirst({ where: { etablissementId: etabId, nom: data.nom } });
  if (existant) throw new AppError('Un article porte déjà ce nom dans cet établissement', 409);
  return prisma.articleInventaire.create({ data: { ...data, etablissementId: etabId } });
}

export async function updateArticle(
  id: string,
  etablissementId: string | null | undefined,
  data: Partial<{ nom: string; categorie: CategorieInventaire; unite: string; seuilAlerte: number; actif: boolean }>
) {
  await trouverArticleGere(id, etablissementId);
  return prisma.articleInventaire.update({ where: { id }, data });
}

export async function listMouvements(articleId: string, etablissementId: string | null | undefined) {
  await trouverArticleGere(articleId, etablissementId);
  return prisma.mouvementInventaire.findMany({
    where: { articleId },
    include: { employe: { select: { id: true, nom: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

interface MouvementInput {
  type: TypeMouvementInventaire;
  quantite: number;
  motif?: string;
}

// SORTIE : compare-and-swap sur quantiteStock >= quantite (même pattern que la garde
// de stock GESCOM/SHOPAY) — rejette proprement plutôt que de laisser le stock passer
// en négatif. ENTREE : incrément direct, toujours sûr. AJUSTEMENT : quantite est la
// valeur ABSOLUE du nouveau stock (jamais un delta), utilisée après un inventaire
// physique — évite toute ambiguïté de signe côté formulaire.
export async function enregistrerMouvement(
  articleId: string,
  etablissementId: string | null | undefined,
  employeId: string | null | undefined,
  data: MouvementInput
) {
  return prisma.$transaction(async (tx) => {
    const article = await tx.articleInventaire.findUnique({ where: { id: articleId } });
    if (!article) throw new AppError('Article non trouvé', 404);
    if (etablissementId && article.etablissementId !== etablissementId) {
      throw new AppError('Cet article n\'appartient pas à votre établissement', 403);
    }

    let stockApres: number;

    if (data.type === TypeMouvementInventaire.SORTIE) {
      const bascule = await tx.articleInventaire.updateMany({
        where: { id: articleId, quantiteStock: { gte: data.quantite } },
        data: { quantiteStock: { decrement: data.quantite } },
      });
      if (bascule.count === 0) throw new AppError('Stock insuffisant', 409);
      stockApres = article.quantiteStock - data.quantite;
    } else if (data.type === TypeMouvementInventaire.ENTREE) {
      stockApres = article.quantiteStock + data.quantite;
      await tx.articleInventaire.update({ where: { id: articleId }, data: { quantiteStock: stockApres } });
    } else {
      stockApres = data.quantite;
      await tx.articleInventaire.update({ where: { id: articleId }, data: { quantiteStock: stockApres } });
    }

    return tx.mouvementInventaire.create({
      data: { articleId, type: data.type, quantite: data.quantite, stockApres, motif: data.motif, employeId },
      include: { employe: { select: { id: true, nom: true } } },
    });
  });
}
