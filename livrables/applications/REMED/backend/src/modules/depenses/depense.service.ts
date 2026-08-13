import prisma from '../../config/database';
import { AppError } from '../../types';

interface CreerDepenseInput {
  pharmacieId: string;
  utilisateurId: string;
  categorie: string;
  montant: number;
  description?: string;
  modePaiement: string;
}

// Une dépense en ESPECES exige une session de caisse ouverte (même garde que les ventes) et
// crée automatiquement une CaisseTransaction SORTIE_MANUELLE — le solde théorique calculé par
// caisse.service.fermer reste la seule source de vérité, pas de double comptabilité ici.
// Les autres modes de paiement (virement, chèque...) n'affectent jamais le tiroir-caisse.
export async function creer(input: CreerDepenseInput) {
  return prisma.$transaction(async (tx) => {
    let caisseSessionId: string | null = null;

    if (input.modePaiement === 'ESPECES') {
      const caisse = await tx.caisseSession.findFirst({ where: { pharmacieId: input.pharmacieId, statut: 'OUVERTE' } });
      if (!caisse) throw new AppError(400, 'Aucune session de caisse ouverte. Ouvrez la caisse avant d\'enregistrer une dépense en espèces.');
      caisseSessionId = caisse.id;

      await tx.caisseTransaction.create({
        data: {
          caisseSessionId: caisse.id,
          type: 'SORTIE_MANUELLE',
          montant: input.montant,
          motif: `Dépense : ${input.categorie}${input.description ? ` — ${input.description}` : ''}`,
          utilisateurId: input.utilisateurId,
        },
      });
    }

    return tx.depense.create({
      data: {
        pharmacieId: input.pharmacieId,
        categorie: input.categorie as never,
        montant: input.montant,
        description: input.description,
        modePaiement: input.modePaiement as never,
        caisseSessionId,
        utilisateurId: input.utilisateurId,
      },
      include: { utilisateur: { select: { nom: true, prenom: true } } },
    });
  });
}

export async function list(pharmacieId: string, filters: { limit: number; categorie?: string }) {
  return prisma.depense.findMany({
    where: { pharmacieId, categorie: filters.categorie as never },
    include: { utilisateur: { select: { nom: true, prenom: true } } },
    orderBy: { createdAt: 'desc' },
    take: filters.limit,
  });
}

export async function totalParCategorie(pharmacieId: string, depuis: Date) {
  const depenses = await prisma.depense.findMany({
    where: { pharmacieId, createdAt: { gte: depuis } },
    select: { categorie: true, montant: true },
  });
  const totaux: Record<string, number> = {};
  for (const d of depenses) totaux[d.categorie] = (totaux[d.categorie] || 0) + Number(d.montant);
  return totaux;
}
