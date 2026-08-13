import { Response } from 'express';
import * as service from './newsletter.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';

export async function subscribe(req: AuthRequest, res: Response) {
  await service.subscribe(req.body.email);
  sendSuccess(res, null, 'Merci de votre inscription !', 201);
}

export async function list(_req: AuthRequest, res: Response) {
  const abonnes = await service.list();
  sendSuccess(res, { abonnes });
}

export async function remove(req: AuthRequest, res: Response) {
  await service.remove(req.params.id);
  sendSuccess(res, null, 'Abonné supprimé');
}

export async function envoyerCampagne(req: AuthRequest, res: Response) {
  const { sujet, message } = req.body;
  const resultat = await service.envoyerCampagne(sujet, message);
  const texte = resultat.envoyeReellement
    ? `Envoyé à ${resultat.destinatairesTouches} abonné(s).`
    : `SMTP non configuré : le message a été journalisé côté serveur (${resultat.destinatairesTouches} destinataire(s)), pas réellement envoyé.`;
  sendSuccess(res, resultat, texte);
}

// Export CSV simple (colonnes email/actif/date d'inscription), pas de dépendance externe.
export async function exportCsv(_req: AuthRequest, res: Response) {
  const abonnes = await service.list();
  const lignes = [
    'email,actif,date_inscription',
    ...abonnes.map((a) => `${a.email},${a.actif ? 'oui' : 'non'},${a.createdAt.toISOString()}`),
  ];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="newsletter-abonnes.csv"');
  res.send(lignes.join('\n'));
}
