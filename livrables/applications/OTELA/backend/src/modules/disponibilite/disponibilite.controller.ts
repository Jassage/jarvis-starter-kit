import { Request, Response } from 'express';
import * as service from './disponibilite.service';
import { sendSuccess } from '../../utils/response';

export async function search(req: Request, res: Response) {
  const { etablissementId, dateArrivee, dateDepart, nombrePersonnes, devise, typeSejour } = req.query as unknown as {
    etablissementId?: string; dateArrivee: string; dateDepart: string; nombrePersonnes: string; devise: 'HTG' | 'USD'; typeSejour: 'NUITEE' | 'JOUR';
  };
  const resultats = await service.searchDisponibilite({
    etablissementId,
    dateArrivee: new Date(dateArrivee),
    dateDepart: new Date(dateDepart),
    nombrePersonnes: Number(nombrePersonnes),
    devise,
    typeSejour,
  });
  sendSuccess(res, { resultats });
}
