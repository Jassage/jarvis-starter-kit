import { Request, Response } from 'express';
import * as service from './factures.service';
import { sendSuccess } from '../../utils/response';
import { journaliser } from '../audit/audit.service';
import { genererFacturePdf } from './facture.pdf';

export async function getFacture(req: Request, res: Response) {
  const facture = await service.getFactureParReservation(req.params.reservationId, req.etablissementId);
  sendSuccess(res, { facture });
}

// PDF côté back-office (authentifié, cloisonné à l'établissement).
export async function getFacturePdf(req: Request, res: Response) {
  const dossier = await service.getDossierFacture(req.params.reservationId, req.etablissementId);
  const pdf = await genererFacturePdf(dossier);
  envoyerPdf(res, pdf, dossier.reservation.reference);
}

// PDF côté client (public, vérifié par référence + email).
export async function getFacturePdfPublic(req: Request, res: Response) {
  const email = String(req.query.email ?? '');
  const dossier = await service.getDossierPublic(req.params.reference, email);
  const pdf = await genererFacturePdf(dossier);
  envoyerPdf(res, pdf, dossier.reservation.reference);
}

function envoyerPdf(res: Response, pdf: Buffer, reference: string | null) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', pdf.length);
  res.setHeader('Content-Disposition', `attachment; filename="facture-${reference ?? 'otela'}.pdf"`);
  res.end(pdf);
}

export async function enregistrerPaiement(req: Request, res: Response) {
  const facture = await service.enregistrerPaiement(req.params.factureId, req.etablissementId, {
    ...req.body,
    employeId: req.employe?.id,
  });
  // Trace financière : montant, méthode et statut résultant de la facture. C'est le
  // point d'audit le plus sensible du système avec la gestion des comptes.
  await journaliser(
    {
      action: 'PAIEMENT_ENCAISSE',
      entite: 'Facture',
      entiteId: req.params.factureId,
      etablissementId: req.etablissementId,
      details: {
        montant: req.body.montant,
        methode: req.body.methode,
        statutFacture: facture?.statutPaiement ?? null,
      },
    },
    req
  );

  sendSuccess(res, { facture }, 'Paiement enregistré');
}
