import { Response } from 'express';
import * as rapportService from './rapport.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { genererCsv } from '../../utils/csv';

function periodeParams(req: AuthRequest) {
  const { preset, debut, fin } = req.query as { preset: string; debut?: string; fin?: string };
  return { preset: preset as never, debut, fin };
}

export const ventes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { preset, debut, fin } = periodeParams(req);
  sendSuccess(res, await rapportService.rapportVentes(req.user!.pharmacieId, preset, debut, fin));
});

export const ventesCsv = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { preset, debut, fin } = periodeParams(req);
  const rapport = await rapportService.rapportVentes(req.user!.pharmacieId, preset, debut, fin);
  const csv = genererCsv(
    [
      { cle: 'numero', label: 'N° vente' },
      { cle: 'date', label: 'Date' },
      { cle: 'caissier', label: 'Caissier' },
      { cle: 'montantTotal', label: 'Montant (HTG)' },
    ],
    rapport.ventes.map((v) => ({ ...v, date: new Date(v.date).toLocaleString('fr-FR') }))
  );
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="rapport-ventes.csv"');
  res.send(csv);
});

export const stock = asyncHandler(async (req: AuthRequest, res: Response) => {
  sendSuccess(res, await rapportService.rapportStock(req.user!.pharmacieId));
});

export const stockCsv = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rapport = await rapportService.rapportStock(req.user!.pharmacieId);
  const csv = genererCsv(
    [
      { cle: 'nom', label: 'Produit' },
      { cle: 'quantiteTotal', label: 'Quantité' },
      { cle: 'seuilAlerte', label: 'Seuil alerte' },
      { cle: 'valeur', label: "Valeur (prix d'achat)" },
      { cle: 'statut', label: 'Statut' },
    ],
    rapport.lignes
  );
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="rapport-stock.csv"');
  res.send(csv);
});

export const achats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { preset, debut, fin } = periodeParams(req);
  sendSuccess(res, await rapportService.rapportAchats(req.user!.pharmacieId, preset, debut, fin));
});

export const achatsCsv = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { preset, debut, fin } = periodeParams(req);
  const rapport = await rapportService.rapportAchats(req.user!.pharmacieId, preset, debut, fin);
  const csv = genererCsv(
    [
      { cle: 'numero', label: 'N° commande' },
      { cle: 'fournisseur', label: 'Fournisseur' },
      { cle: 'statut', label: 'Statut' },
      { cle: 'date', label: 'Date' },
      { cle: 'montant', label: 'Montant (HTG)' },
    ],
    rapport.commandes.map((c) => ({ ...c, date: new Date(c.date).toLocaleString('fr-FR') }))
  );
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="rapport-achats.csv"');
  res.send(csv);
});

export const finance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { preset, debut, fin } = periodeParams(req);
  sendSuccess(res, await rapportService.rapportFinance(req.user!.pharmacieId, preset, debut, fin));
});
