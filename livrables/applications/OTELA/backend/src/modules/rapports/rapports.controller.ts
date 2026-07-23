import { Request, Response } from 'express';
import * as service from './rapports.service';
import * as exportService from './rapports.export';
import { getEtablissement } from '../etablissements/etablissements.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler.middleware';

function resoudrePeriode(req: Request) {
  const { from, to } = req.query as Record<string, string | undefined>;
  const dTo = to ? new Date(to) : new Date();
  const dFrom = from ? new Date(from) : new Date(dTo.getTime() - 30 * 86400000);
  return { from: dFrom, to: dTo };
}

export async function getRapportEtablissement(req: Request, res: Response) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  const { from, to } = resoudrePeriode(req);
  const rapport = await service.getRapportEtablissement(req.etablissementId, from, to);
  sendSuccess(res, { rapport, periode: { from, to } });
}

export async function getRapportChaine(req: Request, res: Response) {
  const { from, to } = resoudrePeriode(req);
  const rapport = await service.getRapportChaine(from, to);
  sendSuccess(res, { rapport, periode: { from, to } });
}

export async function getSerieJournaliere(req: Request, res: Response) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  const { from, to } = resoudrePeriode(req);
  const serie = await service.getSerieJournaliere(req.etablissementId, from, to);
  sendSuccess(res, { ...serie, periode: { from, to } });
}

function envoyerXlsx(res: Response, buffer: Buffer, nomFichier: string) {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Length', buffer.length);
  res.setHeader('Content-Disposition', `attachment; filename="${nomFichier}"`);
  res.end(buffer);
}

// Content-Disposition n'accepte que de l'ASCII sans encodage RFC 5987 — un nom
// d'établissement accentué ("Pétion-Ville") produirait un en-tête invalide s'il était
// utilisé tel quel dans le filename.
function nomFichierAscii(texte: string): string {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').toLowerCase();
}

export async function exportEtablissement(req: Request, res: Response) {
  if (!req.etablissementId) throw new AppError('etablissementId requis', 400);
  const { from, to } = resoudrePeriode(req);
  const etablissement = await getEtablissement(req.etablissementId);
  const buffer = await exportService.genererExportEtablissement(req.etablissementId, etablissement.nom, from, to);
  envoyerXlsx(res, buffer, `rapport-${nomFichierAscii(etablissement.nom)}.xlsx`);
}

export async function exportChaine(req: Request, res: Response) {
  const { from, to } = resoudrePeriode(req);
  const buffer = await exportService.genererExportChaine(from, to);
  envoyerXlsx(res, buffer, 'rapport-chaine.xlsx');
}
