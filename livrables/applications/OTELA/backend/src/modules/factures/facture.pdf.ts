import PDFDocument from 'pdfkit';
import { Prisma } from '@prisma/client';
import { qrPngBuffer } from '../../utils/qr';

// Dossier complet nécessaire au PDF : facture + réservation + client + établissement
// + paiements. Typé depuis le résultat Prisma pour rester synchronisé avec le schéma.
export type DossierFacture = Prisma.FactureGetPayload<{
  include: {
    reservation: { include: { client: true; etablissement: true; chambre: { include: { typeChambre: true } } } };
    paiements: { include: { employe: { select: { nom: true } } } };
  };
}>;

const NOTE_BAS = 'Le PDF est généré à la demande, jamais stocké — il reflète toujours l\'état courant de la facture.';

// toLocaleString('fr-FR') sépare les milliers par une espace fine insécable (U+202F)
// que la police Helvetica de pdfkit rend comme un « / » parasite. On normalise tous
// les espaces insécables (U+202F, U+00A0) en espace ordinaire pour le rendu PDF.
function fmt(montant: Prisma.Decimal | number, devise: string): string {
  const nombre = Number(montant)
    .toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/[  ]/g, ' ');
  return `${nombre} ${devise}`;
}

const STATUT_LABEL: Record<string, string> = { IMPAYE: 'Impayée', PARTIEL: 'Partiellement payée', PAYE: 'Payée' };
const METHODE_LABEL: Record<string, string> = { ESPECES: 'Espèces', CARTE: 'Carte', MONCASH: 'MonCash', AUTRE: 'Autre' };

// Génère le PDF de la facture et le renvoie sous forme de Buffer. On bufferise
// plutôt que de streamer directement dans la réponse pour pouvoir poser un
// Content-Length correct et réutiliser la fonction (email, consultation publique).
export async function genererFacturePdf(dossier: DossierFacture): Promise<Buffer> {
  const { reservation } = dossier;
  const etab = reservation.etablissement;
  const client = reservation.client;
  const devise = dossier.devise;

  const qr = reservation.reference ? await qrPngBuffer(reservation.reference).catch(() => null) : null;

  const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: `Facture ${reservation.reference ?? ''}` } });
  const chunks: Buffer[] = [];
  doc.on('data', (c) => chunks.push(c as Buffer));
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  const or = '#b8860b';
  const encre = '#1a2340';

  // En-tête établissement
  doc.fillColor(encre).fontSize(22).font('Helvetica-Bold').text(etab.nom, 50, 50);
  doc.fontSize(9).font('Helvetica').fillColor('#555');
  doc.text(`${etab.adresse}, ${etab.commune}, ${etab.departement}`);
  if (etab.telephone) doc.text(`Tél : ${etab.telephone}`);
  if (etab.email) doc.text(etab.email);

  // Bloc FACTURE + référence
  doc.fillColor(or).fontSize(26).font('Helvetica-Bold').text('FACTURE', 400, 50, { align: 'right' });
  doc.fillColor(encre).fontSize(11).font('Helvetica').text(reservation.reference ?? '—', 400, 82, { align: 'right' });
  doc.fontSize(9).fillColor('#555').text(`Émise le ${dossier.createdAt.toLocaleDateString('fr-FR')}`, 400, 100, { align: 'right' });

  doc.moveTo(50, 135).lineTo(545, 135).strokeColor('#e5e5e5').stroke();

  // Client + séjour
  let y = 155;
  doc.fillColor('#999').fontSize(8).font('Helvetica-Bold').text('FACTURÉ À', 50, y);
  doc.fillColor(encre).fontSize(11).font('Helvetica').text(client.nom, 50, y + 14);
  doc.fontSize(9).fillColor('#555').text(client.email, 50, y + 30);
  if (client.telephone) doc.text(client.telephone, 50, y + 44);

  doc.fillColor('#999').fontSize(8).font('Helvetica-Bold').text('SÉJOUR', 320, y);
  doc.fillColor('#555').fontSize(9).font('Helvetica');
  doc.text(`Chambre ${reservation.chambre.numero} — ${reservation.chambre.typeChambre.nom}`, 320, y + 14);
  doc.text(`Arrivée : ${reservation.dateArrivee.toLocaleDateString('fr-FR')}`, 320, y + 28);
  doc.text(`Départ : ${reservation.dateDepart.toLocaleDateString('fr-FR')}`, 320, y + 42);
  doc.text(`${reservation.nombreAdultes} adulte(s), ${reservation.nombreEnfants} enfant(s)`, 320, y + 56);

  // Tableau des montants
  y = 250;
  doc.rect(50, y, 495, 24).fill('#f5f3ee');
  doc.fillColor(encre).fontSize(9).font('Helvetica-Bold');
  doc.text('DÉSIGNATION', 60, y + 8);
  doc.text('MONTANT', 400, y + 8, { width: 135, align: 'right' });

  y += 32;
  const ligne = (label: string, montant: Prisma.Decimal | number, gras = false) => {
    doc.font(gras ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).fillColor(gras ? encre : '#333');
    doc.text(label, 60, y);
    doc.text(fmt(montant, devise), 400, y, { width: 135, align: 'right' });
    y += 22;
  };
  ligne('Hébergement (hors taxes)', dossier.montantHT);
  ligne(`Taxes (${Number(etab.tauxTaxe)}%)`, dossier.taxes);
  doc.moveTo(50, y).lineTo(545, y).strokeColor('#e5e5e5').stroke();
  y += 8;
  ligne('TOTAL', dossier.montantTotal, true);

  // Statut de paiement
  const totalPaye = dossier.paiements.reduce((s, p) => s + Number(p.montant), 0);
  const solde = Number(dossier.montantTotal) - totalPaye;
  y += 6;
  doc.fontSize(10).font('Helvetica').fillColor('#555');
  doc.text(`Statut : ${STATUT_LABEL[dossier.statutPaiement] ?? dossier.statutPaiement}`, 60, y);
  doc.text(`Payé : ${fmt(totalPaye, devise)}`, 60, y + 16);
  if (solde > 0.001) doc.fillColor('#b00').text(`Solde dû : ${fmt(solde, devise)}`, 60, y + 32);

  // Historique des paiements
  if (dossier.paiements.length > 0) {
    y += 60;
    doc.fillColor('#999').fontSize(8).font('Helvetica-Bold').text('PAIEMENTS', 60, y);
    y += 14;
    dossier.paiements.forEach((p) => {
      doc.fillColor('#555').fontSize(9).font('Helvetica')
        .text(`${p.datePaiement.toLocaleDateString('fr-FR')} — ${METHODE_LABEL[p.methode] ?? p.methode}${p.employe ? ` (${p.employe.nom})` : ''}`, 60, y);
      doc.text(fmt(p.montant, devise), 400, y, { width: 135, align: 'right' });
      y += 16;
    });
  }

  // QR de la réservation — position fixe en bas de page (au-dessus de la marge
  // basse à 792pt sur A4) pour ne jamais déborder sur une seconde page.
  if (qr) {
    doc.image(qr, 60, 660, { width: 90 });
    doc.fillColor('#999').fontSize(8).font('Helvetica').text('Consultez votre réservation en ligne', 160, 690);
    doc.fillColor(encre).fontSize(10).font('Helvetica-Bold').text(reservation.reference ?? '', 160, 704);
  }

  doc.fillColor('#bbb').fontSize(7).font('Helvetica').text(NOTE_BAS, 50, 770, { align: 'center', width: 495 });

  doc.end();
  return done;
}
