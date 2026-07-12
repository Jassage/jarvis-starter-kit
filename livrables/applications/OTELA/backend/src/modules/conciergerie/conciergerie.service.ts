import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { getFolioOuvertParChambreId, ajouterLigneFolio } from '../folios/folios.service';

const INCLUDE = { chambre: true, employeAssigne: { select: { id: true, nom: true } } };

export async function listDemandes(etablissementId: string) {
  return prisma.demandeConciergerie.findMany({
    where: { chambre: { etablissementId } },
    include: INCLUDE,
    orderBy: { dateHeure: 'desc' },
  });
}

export async function creerDemande(etablissementId: string, data: { chambreId: string; description: string }) {
  const chambre = await prisma.chambre.findUnique({ where: { id: data.chambreId } });
  if (!chambre || chambre.etablissementId !== etablissementId) throw new AppError('Chambre introuvable', 404);
  return prisma.demandeConciergerie.create({ data, include: INCLUDE });
}

async function trouverDemande(id: string, etablissementId: string) {
  const demande = await prisma.demandeConciergerie.findUnique({ where: { id }, include: INCLUDE });
  if (!demande || demande.chambre.etablissementId !== etablissementId) throw new AppError('Demande introuvable', 404);
  return demande;
}

export async function assigner(id: string, etablissementId: string, employeAssigneId: string) {
  await trouverDemande(id, etablissementId);
  return prisma.demandeConciergerie.update({
    where: { id },
    data: { employeAssigneId, statut: 'EN_COURS' },
    include: INCLUDE,
  });
}

// Facturation strictement optionnelle : un montant renseigné poste une LigneFolio
// (département AUTRE — pas de valeur dédiée conciergerie dans l'enum), sinon la
// demande se clôture sans rien facturer.
export async function terminer(id: string, etablissementId: string, montant?: number, employeId?: string) {
  const demande = await trouverDemande(id, etablissementId);
  if (demande.statut === 'TERMINEE') throw new AppError('Cette demande est déjà terminée', 409);

  if (montant) {
    const folio = await getFolioOuvertParChambreId(demande.chambreId, etablissementId);
    return prisma.$transaction(async (tx) => {
      await ajouterLigneFolio(tx, folio.id, {
        departementSource: 'AUTRE',
        description: demande.description,
        montant,
        employeId,
      });
      return tx.demandeConciergerie.update({
        where: { id },
        data: { statut: 'TERMINEE', montant, folioId: folio.id },
        include: INCLUDE,
      });
    });
  }

  return prisma.demandeConciergerie.update({ where: { id }, data: { statut: 'TERMINEE' }, include: INCLUDE });
}
