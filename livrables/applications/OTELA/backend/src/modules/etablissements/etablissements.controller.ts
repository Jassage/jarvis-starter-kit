import { Request, Response } from 'express';
import * as service from './etablissements.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { journaliser } from '../audit/audit.service';
import { urlPublique, supprimerFichierDepuisUrl } from '../../middlewares/upload.middleware';
import { RoleEmploye } from '@prisma/client';

// Un directeur ne peut agir que sur son propre établissement ; l'administrateur de
// chaîne sur n'importe lequel. Empêche un directeur de modifier la fiche d'un autre
// hôtel en forçant l'id dans l'URL.
function assertPeutModifier(req: Request, etablissementId: string) {
  const employe = req.employe;
  if (!employe) throw new AppError('Non authentifié', 401);
  if (employe.role === RoleEmploye.ADMINISTRATEUR_CHAINE) return;
  if (employe.role === RoleEmploye.ADMINISTRATEUR_ETABLISSEMENT && employe.etablissementId === etablissementId) return;
  throw new AppError('Vous ne pouvez modifier que votre établissement', 403);
}

export async function list(req: Request, res: Response) {
  const actifOnly = req.query.actifOnly !== 'false';
  const etablissements = await service.listEtablissements(actifOnly);
  sendSuccess(res, { etablissements });
}

export async function getOne(req: Request, res: Response) {
  const etablissement = await service.getEtablissement(req.params.id);
  sendSuccess(res, { etablissement });
}

export async function getVitrine(req: Request, res: Response) {
  const etablissement = await service.getEtablissementVitrine(req.params.id);
  sendSuccess(res, { etablissement });
}

export async function create(req: Request, res: Response) {
  const etablissement = await service.createEtablissement(req.body);
  sendSuccess(res, { etablissement }, 'Établissement créé', 201);
}

export async function update(req: Request, res: Response) {
  assertPeutModifier(req, req.params.id);
  const etablissement = await service.updateEtablissement(req.params.id, req.body);

  await journaliser(
    {
      action: 'ETABLISSEMENT_MODIFIE',
      entite: 'Etablissement',
      entiteId: etablissement.id,
      etablissementId: etablissement.id,
      details: { champs: Object.keys(req.body) },
    },
    req
  );

  sendSuccess(res, { etablissement }, 'Établissement mis à jour');
}

// Upload du logo : le nouveau fichier est enregistré, l'ancien est retiré du disque
// pour ne pas accumuler des orphelins à chaque changement.
export async function uploadLogo(req: Request, res: Response) {
  assertPeutModifier(req, req.params.id);
  if (!req.file) throw new AppError('Aucun fichier reçu (champ "logo" attendu)', 400);

  const ancien = await service.getEtablissement(req.params.id);
  const url = urlPublique('logos', req.file.filename);
  const etablissement = await service.updateEtablissement(req.params.id, { logoUrl: url });

  if (ancien.logoUrl) supprimerFichierDepuisUrl(ancien.logoUrl);

  await journaliser(
    { action: 'LOGO_MODIFIE', entite: 'Etablissement', entiteId: etablissement.id, etablissementId: etablissement.id },
    req
  );

  sendSuccess(res, { etablissement }, 'Logo mis à jour');
}
