import prisma from '../../config/database';

interface ListActivityLogParams {
  entite?: string;
  page: number;
  limit: number;
}

export async function list({ entite, page, limit }: ListActivityLogParams) {
  const where = { ...(entite && { entite }) };

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { logs, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

// Liste des entités distinctes déjà journalisées, pour peupler le filtre admin sans deviner
// à l'avance tous les noms de module (ils reflètent le premier segment de chemin API réel).
export async function listEntites() {
  const rows = await prisma.activityLog.findMany({
    distinct: ['entite'],
    select: { entite: true },
    orderBy: { entite: 'asc' },
  });
  return rows.map((r) => r.entite);
}
