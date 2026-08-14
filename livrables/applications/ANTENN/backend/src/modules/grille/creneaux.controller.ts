import { Request, Response } from 'express';
import * as service from './creneaux.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { logAudit } from '../audit/audit.service';

// Une plage lisible par un humain dans le journal d'audit : « 21/07 18:30 → 19:30 »
// vaut mieux qu'un couple d'ISO 8601 quand il s'agit de retrouver ce qui s'est passé
// à l'antenne un soir donné.
function plage(debut: Date, fin: Date) {
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' };
  return `${debut.toLocaleString('fr-FR', opts)} → ${fin.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

export async function list(req: Request, res: Response) {
  const { from, to } = req.query as { from?: string; to?: string };
  const creneaux = await service.listCreneaux(from, to);
  sendSuccess(res, { creneaux, brouillons: await service.compterBrouillons() });
}

export async function getOne(req: Request, res: Response) {
  const creneau = await service.getCreneau(req.params.id);
  sendSuccess(res, { creneau });
}

export async function create(req: Request, res: Response) {
  const creneau = await service.createCreneau(req.body);
  await logAudit(req, 'CRENEAU_CREE', {
    cible: 'CreneauGrille',
    cibleId: creneau.id,
    details: `${creneau.typeCreneau} programmé ${plage(creneau.dateHeureDebut, creneau.dateHeureFin)}`,
  });
  sendSuccess(res, { creneau }, 'Créneau créé', 201);
}

export async function update(req: Request, res: Response) {
  const creneau = await service.updateCreneau(req.params.id, req.body);
  await logAudit(req, 'CRENEAU_MODIFIE', {
    cible: 'CreneauGrille',
    cibleId: creneau.id,
    details: `${creneau.typeCreneau} déplacé/modifié, désormais ${plage(creneau.dateHeureDebut, creneau.dateHeureFin)} (repassé en brouillon)`,
  });
  sendSuccess(res, { creneau }, 'Créneau mis à jour');
}

export async function remove(req: Request, res: Response) {
  const creneau = await service.getCreneau(req.params.id);
  await service.deleteCreneau(req.params.id);
  await logAudit(req, 'CRENEAU_SUPPRIME', {
    cible: 'CreneauGrille',
    cibleId: req.params.id,
    details: `${creneau.typeCreneau} du ${plage(creneau.dateHeureDebut, creneau.dateHeureFin)} retiré de la grille`,
  });
  sendSuccess(res, null, 'Créneau supprimé');
}

export async function dupliquer(req: Request, res: Response) {
  const nouveauDebut = req.body?.dateHeureDebut;
  if (!nouveauDebut) throw new AppError('dateHeureDebut requis pour la duplication', 400);
  const creneau = await service.dupliquerCreneau(req.params.id, nouveauDebut);
  await logAudit(req, 'CRENEAU_CREE', {
    cible: 'CreneauGrille',
    cibleId: creneau.id,
    details: `${creneau.typeCreneau} dupliqué depuis ${req.params.id}, programmé ${plage(creneau.dateHeureDebut, creneau.dateHeureFin)}`,
  });
  sendSuccess(res, { creneau }, 'Créneau dupliqué', 201);
}

export async function synchroniser(req: Request, res: Response) {
  const creneau = await service.marquerSynchronise(req.params.id);
  await logAudit(req, 'CRENEAU_SYNCHRONISE', {
    cible: 'CreneauGrille',
    cibleId: creneau.id,
    details: `Créneau ${plage(creneau.dateHeureDebut, creneau.dateHeureFin)} déclaré répercuté à l'antenne`,
  });
  sendSuccess(res, { creneau }, 'Créneau marqué comme synchronisé');
}

export async function trous(req: Request, res: Response) {
  const { from, to } = req.query as { from?: string; to?: string };
  const resultat = await service.detecterTrous(from, to);
  sendSuccess(res, resultat);
}
