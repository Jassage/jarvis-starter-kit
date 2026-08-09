import PDFDocument from 'pdfkit';
import prisma from '../utils/prisma';
import { AppError } from '../types';
import { assertOwnEmplacement } from '../middleware/emplacementScope';

const MODE_LABELS: Record<string, string> = {
  ESPECES: 'Espèces', CHEQUE: 'Chèque', VIREMENT: 'Virement', CREDIT: 'Crédit',
};

function formatMontant(v: unknown): string {
  return new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 2 }).format(Number(v));
}

// Pas de module Paramètres/Entreprise dans GESCOM à ce jour (une seule entreprise cliente) :
// en-tête configurable par variable d'environnement plutôt qu'en dur, sans construire un
// vrai écran de paramètres pour un besoin à ce stade purement cosmétique.
const NOM_ENTREPRISE = process.env.ENTREPRISE_NOM || 'GESCOM';
const ADRESSE_ENTREPRISE = process.env.ENTREPRISE_ADRESSE || '';

export async function genererFacturePDF(
  venteId: string,
  requestingUser?: { role: string; emplacementId?: string | null }
): Promise<{ buffer: Buffer; numero: string }> {
  const vente = await prisma.vente.findUnique({
    where: { id: venteId },
    include: {
      client: true,
      emplacement: true,
      utilisateur: { select: { nom: true, prenom: true } },
      lignes: { include: { produit: { select: { nom: true, reference: true, unite: true } } } },
    },
  });
  if (!vente) throw new AppError(404, 'Vente introuvable');
  assertOwnEmplacement(requestingUser, vente.emplacementId);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  // En-tête
  doc.fontSize(20).font('Helvetica-Bold').text(NOM_ENTREPRISE, 50, 50);
  if (ADRESSE_ENTREPRISE) doc.fontSize(9).font('Helvetica').fillColor('#555').text(ADRESSE_ENTREPRISE, 50, 74);

  doc.fontSize(16).font('Helvetica-Bold').fillColor('#000').text('FACTURE', 400, 50, { width: 145, align: 'right' });
  doc.fontSize(10).font('Helvetica').fillColor('#333')
    .text(`N° ${vente.numero}`, 400, 72, { width: 145, align: 'right' })
    .text(new Date(vente.dateVente).toLocaleDateString('fr-FR'), 400, 86, { width: 145, align: 'right' });

  if (vente.statut === 'ANNULEE') {
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#dc2626').text('VENTE ANNULÉE', 400, 100, { width: 145, align: 'right' });
  }

  doc.moveTo(50, 125).lineTo(545, 125).strokeColor('#ddd').stroke();

  // Client / Emplacement
  doc.fillColor('#000').fontSize(10).font('Helvetica-Bold').text('Client', 50, 140);
  doc.font('Helvetica').text(vente.client?.nom || 'Client comptant', 50, 155);
  if (vente.client?.telephone) doc.text(vente.client.telephone, 50, 170);

  doc.font('Helvetica-Bold').text('Point de vente', 320, 140);
  doc.font('Helvetica').text(vente.emplacement.nom, 320, 155);
  doc.text(`Vendeur : ${vente.utilisateur.prenom} ${vente.utilisateur.nom}`, 320, 170);

  // Tableau des lignes
  let y = 210;
  doc.font('Helvetica-Bold').fontSize(9);
  doc.text('PRODUIT', 50, y);
  doc.text('QTÉ', 300, y, { width: 60, align: 'right' });
  doc.text('PRIX UNIT.', 360, y, { width: 80, align: 'right' });
  doc.text('MONTANT', 450, y, { width: 95, align: 'right' });
  y += 15;
  doc.moveTo(50, y).lineTo(545, y).strokeColor('#ddd').stroke();
  y += 8;

  doc.font('Helvetica').fontSize(9);
  for (const ligne of vente.lignes) {
    doc.text(`${ligne.produit.nom} (${ligne.produit.reference})`, 50, y, { width: 240 });
    doc.text(`${ligne.quantite} ${ligne.produit.unite}`, 300, y, { width: 60, align: 'right' });
    doc.text(`${formatMontant(ligne.prixUnitaire)} HTG`, 360, y, { width: 80, align: 'right' });
    doc.text(`${formatMontant(ligne.montantLigne)} HTG`, 450, y, { width: 95, align: 'right' });
    y += 18;
  }

  y += 10;
  doc.moveTo(320, y).lineTo(545, y).strokeColor('#ddd').stroke();
  y += 10;

  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Total', 360, y, { width: 80, align: 'right' });
  doc.text(`${formatMontant(vente.montantTotal)} HTG`, 450, y, { width: 95, align: 'right' });
  y += 16;

  doc.font('Helvetica').fontSize(9).fillColor('#333');
  doc.text('Payé', 360, y, { width: 80, align: 'right' });
  doc.text(`${formatMontant(vente.montantPaye)} HTG`, 450, y, { width: 95, align: 'right' });
  y += 14;

  const soldeDu = Number(vente.montantTotal) - Number(vente.montantPaye);
  if (soldeDu > 0) {
    doc.fillColor('#dc2626');
    doc.text('Solde dû', 360, y, { width: 80, align: 'right' });
    doc.text(`${formatMontant(soldeDu)} HTG`, 450, y, { width: 95, align: 'right' });
    y += 14;
  }

  doc.fillColor('#333').text(`Mode de paiement : ${MODE_LABELS[vente.modePaiement] || vente.modePaiement}`, 50, y + 6);

  doc.fontSize(8).fillColor('#999').text(
    `Facture générée le ${new Date().toLocaleString('fr-FR')}`,
    50, 780, { width: 495, align: 'center' }
  );

  doc.end();
  const buffer = await done;
  return { buffer, numero: vente.numero };
}
