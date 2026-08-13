import prisma from '../../config/database';

const LIMITE = 5;

// Recherche globale sur les trois contenus les plus narratifs du site (personnalités,
// actualités publiées, lieux touristiques publiés). Les répertoires métier (entreprises,
// hôtels...) ont déjà leur propre recherche/filtre dédié sur `/annuaire` — non dupliqués ici.
export async function rechercher(q: string) {
  const [personnalites, articles, lieux] = await Promise.all([
    prisma.personnalite.findMany({
      where: {
        OR: [
          { nom: { contains: q, mode: 'insensitive' } },
          { traductions: { some: { domaine: { contains: q, mode: 'insensitive' } } } },
        ],
      },
      include: { traductions: true },
      take: LIMITE,
    }),
    prisma.article.findMany({
      where: {
        statutPublication: 'PUBLIE',
        OR: [
          { titre: { contains: q, mode: 'insensitive' } },
          { traductions: { some: { resume: { contains: q, mode: 'insensitive' } } } },
        ],
      },
      include: { traductions: true },
      take: LIMITE,
    }),
    prisma.tourismPlace.findMany({
      where: {
        statutPublication: 'PUBLIE',
        OR: [
          { nom: { contains: q, mode: 'insensitive' } },
          { traductions: { some: { description: { contains: q, mode: 'insensitive' } } } },
        ],
      },
      include: { traductions: true },
      take: LIMITE,
    }),
  ]);

  return { personnalites, articles, lieux };
}
