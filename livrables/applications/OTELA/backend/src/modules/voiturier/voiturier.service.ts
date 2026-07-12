import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { getFolioOuvertParChambreId, ajouterLigneFolio } from '../folios/folios.service';

export async function listVehicules(etablissementId: string) {
  return prisma.vehicule.findMany({
    where: { chambre: { etablissementId } },
    include: { chambre: true },
    orderBy: { dateArrivee: 'desc' },
  });
}

export async function enregistrerVehicule(etablissementId: string, data: { chambreId: string; plaqueImmatriculation: string; emplacement: string }) {
  const chambre = await prisma.chambre.findUnique({ where: { id: data.chambreId } });
  if (!chambre || chambre.etablissementId !== etablissementId) throw new AppError('Chambre introuvable', 404);
  return prisma.vehicule.create({ data, include: { chambre: true } });
}

// Suivi simple, pas de facturation dans la plupart des hôtels — sauf si le client
// veut un supplément payant (montant optionnel au départ), même logique que
// conciergerie.service.ts::terminer().
export async function marquerDepart(id: string, etablissementId: string, montant?: number, employeId?: string) {
  const vehicule = await prisma.vehicule.findUnique({ where: { id }, include: { chambre: true } });
  if (!vehicule || vehicule.chambre.etablissementId !== etablissementId) throw new AppError('Véhicule introuvable', 404);
  if (vehicule.dateDepart) throw new AppError('Ce véhicule a déjà quitté', 409);

  if (montant) {
    const folio = await getFolioOuvertParChambreId(vehicule.chambreId, etablissementId);
    return prisma.$transaction(async (tx) => {
      await ajouterLigneFolio(tx, folio.id, {
        departementSource: 'VOITURIER',
        description: `Stationnement — ${vehicule.plaqueImmatriculation}`,
        montant,
        employeId,
      });
      return tx.vehicule.update({ where: { id }, data: { dateDepart: new Date(), montant, folioId: folio.id }, include: { chambre: true } });
    });
  }

  return prisma.vehicule.update({ where: { id }, data: { dateDepart: new Date() }, include: { chambre: true } });
}
