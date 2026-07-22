import { Request, Response } from 'express';
import * as service from './chambres.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { journaliser } from '../audit/audit.service';
import { urlPublique } from '../../middlewares/upload.middleware';

export async function listTypes(req: Request, res: Response) {
  const etablissementId = (req.query.etablissementId as string) || req.etablissementId;
  if (!etablissementId) throw new AppError('etablissementId requis', 400);
  const types = await service.listTypesChambres(etablissementId);
  sendSuccess(res, { types });
}

export async function createType(req: Request, res: Response) {
  const type = await service.createTypeChambre(req.etablissementId, req.body);
  sendSuccess(res, { type }, 'Type de chambre créé', 201);
}

export async function updateType(req: Request, res: Response) {
  const type = await service.updateTypeChambre(req.params.id, req.etablissementId, req.body);
  sendSuccess(res, { type }, 'Type de chambre mis à jour');
}

export async function createTarif(req: Request, res: Response) {
  const tarif = await service.createTarif(req.params.typeChambreId, req.etablissementId, req.body);
  sendSuccess(res, { tarif }, 'Tarif créé', 201);
}

export async function updateTarif(req: Request, res: Response) {
  const tarif = await service.updateTarif(req.params.id, req.etablissementId, req.body);
  sendSuccess(res, { tarif }, 'Tarif mis à jour');
}

export async function listChambres(req: Request, res: Response) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  const chambres = await service.listChambres(req.etablissementId);
  sendSuccess(res, { chambres });
}

export async function createChambre(req: Request, res: Response) {
  const chambre = await service.createChambre(req.etablissementId, req.body);
  sendSuccess(res, { chambre }, 'Chambre créée', 201);
}

export async function updateChambre(req: Request, res: Response) {
  const chambre = await service.updateChambre(req.params.id, req.etablissementId, req.body);
  sendSuccess(res, { chambre }, 'Chambre mise à jour');
}

export async function basculerMaintenance(req: Request, res: Response) {
  const chambre = await service.basculerMaintenance(req.params.id, req.etablissementId, req.body.enMaintenance);
  sendSuccess(res, { chambre }, req.body.enMaintenance ? 'Chambre mise en maintenance' : 'Maintenance levée');
}

// ─── Photos ───

export async function ajouterPhotos(req: Request, res: Response) {
  const fichiers = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (fichiers.length === 0) throw new AppError('Aucune photo reçue (champ "photos" attendu)', 400);

  // Les légendes arrivent alignées sur l'ordre des fichiers : une chaîne unique pour
  // une seule photo, un tableau sinon (multipart ne préserve pas les objets).
  const legendesBrutes = req.body.legendes;
  const legendes: (string | null)[] = Array.isArray(legendesBrutes)
    ? legendesBrutes
    : legendesBrutes
      ? [legendesBrutes]
      : [];

  const photos = fichiers.map((f, i) => ({ url: urlPublique('chambres', f.filename), legende: legendes[i] ?? null }));
  const type = await service.ajouterPhotos(req.params.typeChambreId, req.etablissementId, photos);

  await journaliser(
    {
      action: 'PHOTO_AJOUTEE',
      entite: 'TypeChambre',
      entiteId: req.params.typeChambreId,
      etablissementId: req.etablissementId,
      details: { nombre: fichiers.length },
    },
    req
  );

  sendSuccess(res, { type }, `${fichiers.length} photo(s) ajoutée(s)`, 201);
}

export async function modifierPhoto(req: Request, res: Response) {
  const type = await service.modifierPhoto(req.params.id, req.etablissementId, req.body);
  sendSuccess(res, { type }, 'Photo mise à jour');
}

export async function supprimerPhoto(req: Request, res: Response) {
  const type = await service.supprimerPhoto(req.params.id, req.etablissementId);

  await journaliser(
    { action: 'PHOTO_SUPPRIMEE', entite: 'PhotoChambre', entiteId: req.params.id, etablissementId: req.etablissementId },
    req
  );

  sendSuccess(res, { type }, 'Photo supprimée');
}
