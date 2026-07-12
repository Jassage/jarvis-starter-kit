import { Devise, TypeSejour } from '@prisma/client';
import prisma from '../../config/database';
import { differenceEnNuits } from '../reservations/reservations.utils';

export interface RechercheDisponibiliteParams {
  etablissementId?: string;
  dateArrivee: Date;
  dateDepart: Date;
  nombrePersonnes: number;
  devise: Devise;
  typeSejour?: TypeSejour;
}

// Utilisée à la fois par le site public et par la recherche back-office lors d'une
// création manuelle de réservation — même logique de calcul de disponibilité partout.
export async function searchDisponibilite(params: RechercheDisponibiliteParams) {
  const typeSejour = params.typeSejour ?? 'NUITEE';
  const nuits = differenceEnNuits(params.dateArrivee, params.dateDepart);

  const typesChambres = await prisma.typeChambre.findMany({
    where: {
      capaciteMax: { gte: params.nombrePersonnes },
      etablissement: {
        actif: true,
        ...(params.etablissementId ? { id: params.etablissementId } : {}),
        devisesAcceptees: { has: params.devise },
      },
    },
    include: {
      etablissement: true,
      tarifs: {
        where: {
          devise: params.devise,
          typeSejour,
          dateDebutSaison: { lte: params.dateArrivee },
          dateFinSaison: { gte: params.dateArrivee },
        },
        orderBy: { dateDebutSaison: 'desc' },
        take: 1,
      },
    },
  });

  const resultats = [];

  for (const type of typesChambres) {
    const tarif = type.tarifs[0];
    if (!tarif) continue; // pas de tarif défini pour ces dates/devise → pas proposé

    const chambresDisponibles = await prisma.chambre.count({
      where: {
        typeChambreId: type.id,
        // OCCUPEE n'exclut PAS une chambre pour des dates futures (le chevauchement
        // de réservation ci-dessous suffit) — seuls MAINTENANCE et NETTOYAGE_EN_COURS
        // sont des indisponibilités qui ne dépendent pas des dates demandées.
        statut: { notIn: ['MAINTENANCE', 'NETTOYAGE_EN_COURS'] },
        reservations: {
          none: {
            statut: { in: ['CONFIRMEE', 'EN_ATTENTE'] },
            dateArrivee: { lt: params.dateDepart },
            dateDepart: { gt: params.dateArrivee },
          },
        },
      },
    });

    if (chambresDisponibles === 0) continue;

    resultats.push({
      typeChambreId: type.id,
      nom: type.nom,
      description: type.description,
      capaciteMax: type.capaciteMax,
      etablissement: { id: type.etablissement.id, nom: type.etablissement.nom, commune: type.etablissement.commune, departement: type.etablissement.departement },
      devise: params.devise,
      typeSejour,
      tarifParNuit: tarif.montant,
      nombreNuits: nuits,
      // JOUR : montant forfaitaire tel quel — le frontend doit se brancher sur
      // typeSejour, jamais deviner depuis nombreNuits.
      montantTotal: typeSejour === 'JOUR' ? Number(tarif.montant) : Number(tarif.montant) * nuits,
      chambresDisponibles,
    });
  }

  return resultats;
}
