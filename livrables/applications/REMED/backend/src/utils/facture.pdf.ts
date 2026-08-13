import PDFDocument from 'pdfkit';
import { Writable } from 'stream';
import { Prisma } from '@prisma/client';

// Ticket de caisse au format thermique 80mm (demande explicite) — largeur fixe, hauteur
// calculée dynamiquement pour coller exactement au contenu (pas de grand vide en bas pour une
// vente à 2 lignes, pas de coupure pour une vente à 20 lignes). PDFKit fixe la taille de page à
// la création du document et ne permet pas de la redimensionner après coup : on dessine donc le
// contenu une première fois dans un document jetable (jamais écrit sur disque, juste mesuré) pour
// connaître la hauteur finale, puis une seconde fois dans le document réel à la bonne taille.
const MM_TO_PT = 2.83464567;
const LARGEUR_PT = 80 * MM_TO_PT; // ~226.77pt
const MARGE_PT = 3 * MM_TO_PT; // ~8.5pt de chaque côté, faible pour ne pas gâcher la largeur déjà étroite
const LARGEUR_UTILE = LARGEUR_PT - 2 * MARGE_PT;

interface VentePourFacture {
  numero: string;
  createdAt: Date;
  sousTotal: Prisma.Decimal | number;
  remise: Prisma.Decimal | number;
  montantTotal: Prisma.Decimal | number;
  caissier: { nom: string; prenom: string };
  client?: { nom: string; prenom?: string | null } | null;
  lignes: {
    quantite: number;
    prixUnitaire: Prisma.Decimal | number;
    produit: { nom: string; dosage?: string | null };
    lot: { numeroLot: string };
  }[];
  paiements: { mode: string; montant: Prisma.Decimal | number }[];
  ordonnance?: { medecinNom: string; patientNom: string } | null;
}

interface PharmaciePourFacture {
  nom: string;
  adresse?: string | null;
  telephone?: string | null;
  nif?: string | null;
  devise: string;
}

const LABELS_MODE_PAIEMENT: Record<string, string> = {
  ESPECES: 'Espèces',
  CARTE: 'Carte',
  VIREMENT: 'Virement',
  CHEQUE: 'Chèque',
  MOBILE_MONEY: 'Mobile Money',
  CREDIT: 'Crédit',
  AUTRE: 'Autre',
};

function formatMontant(v: Prisma.Decimal | number, devise: string): string {
  return `${Number(v).toFixed(2)} ${devise}`;
}

function dessinerContenu(doc: PDFKit.PDFDocument, vente: VentePourFacture, pharmacie: PharmaciePourFacture): void {
  const devise = pharmacie.devise || 'HTG';
  const ligneVide = () => doc.moveDown(0.3);
  const separateur = () => {
    doc.moveDown(0.15);
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .dash(1, { space: 1 })
      .stroke();
    doc.undash();
    doc.moveDown(0.3);
  };

  doc.font('Helvetica-Bold').fontSize(10).text(pharmacie.nom, { align: 'center' });
  doc.font('Helvetica').fontSize(7);
  if (pharmacie.adresse) doc.text(pharmacie.adresse, { align: 'center' });
  if (pharmacie.telephone) doc.text(`Tél: ${pharmacie.telephone}`, { align: 'center' });
  if (pharmacie.nif) doc.text(`NIF: ${pharmacie.nif}`, { align: 'center' });

  separateur();

  doc.font('Helvetica-Bold').fontSize(8).text(`Facture ${vente.numero}`);
  doc
    .font('Helvetica')
    .fontSize(7)
    .text(
      new Date(vente.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
    );
  doc.text(`Caissier: ${vente.caissier.prenom} ${vente.caissier.nom}`);
  if (vente.client) doc.text(`Client: ${vente.client.nom}${vente.client.prenom ? ` ${vente.client.prenom}` : ''}`);

  separateur();

  doc.font('Helvetica').fontSize(7);
  for (const ligne of vente.lignes) {
    const nomComplet = `${ligne.produit.nom}${ligne.produit.dosage ? ` ${ligne.produit.dosage}` : ''}`;
    doc.font('Helvetica').text(nomComplet, { width: LARGEUR_UTILE });
    const totalLigne = Number(ligne.prixUnitaire) * ligne.quantite;
    doc.text(`  ${ligne.quantite} x ${formatMontant(ligne.prixUnitaire, devise)}`, { continued: false, width: LARGEUR_UTILE, align: 'left' });
    doc.text(formatMontant(totalLigne, devise), { align: 'right' });
    doc.moveDown(0.15);
  }

  separateur();

  doc.font('Helvetica').fontSize(7.5);
  doc.text(`Sous-total: ${formatMontant(vente.sousTotal, devise)}`, { align: 'right' });
  if (Number(vente.remise) > 0) doc.text(`Remise: -${formatMontant(vente.remise, devise)}`, { align: 'right' });
  doc.font('Helvetica-Bold').fontSize(9);
  doc.text(`TOTAL: ${formatMontant(vente.montantTotal, devise)}`, { align: 'right' });

  ligneVide();
  doc.font('Helvetica').fontSize(7);
  for (const p of vente.paiements) {
    doc.text(`${LABELS_MODE_PAIEMENT[p.mode] || p.mode}: ${formatMontant(p.montant, devise)}`, { align: 'right' });
  }

  if (vente.ordonnance) {
    separateur();
    doc.font('Helvetica-Bold').fontSize(7).text('Ordonnance');
    doc.font('Helvetica').fontSize(7);
    doc.text(`Médecin: ${vente.ordonnance.medecinNom}`);
    doc.text(`Patient: ${vente.ordonnance.patientNom}`);
  }

  separateur();
  doc.font('Helvetica').fontSize(7).text('Merci de votre visite !', { align: 'center' });
  doc.text('Ce document tient lieu de reçu.', { align: 'center' });
}

// Document jetable : jamais écrit sur disque, sert uniquement à connaître la position finale
// `doc.y` une fois tout le contenu dessiné, pour calculer la hauteur exacte de la vraie page.
class FluxIgnore extends Writable {
  _write(_chunk: unknown, _enc: string, callback: (error?: Error | null) => void): void {
    callback();
  }
}

export async function genererFacture80mm(vente: VentePourFacture, pharmacie: PharmaciePourFacture): Promise<Buffer> {
  const mesure = new PDFDocument({ size: [LARGEUR_PT, 3000], margins: { top: MARGE_PT, bottom: MARGE_PT, left: MARGE_PT, right: MARGE_PT } });
  mesure.pipe(new FluxIgnore());
  dessinerContenu(mesure, vente, pharmacie);
  const hauteurFinale = mesure.y + MARGE_PT;
  mesure.end();

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [LARGEUR_PT, Math.max(hauteurFinale, 100)],
      margins: { top: MARGE_PT, bottom: MARGE_PT, left: MARGE_PT, right: MARGE_PT },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    dessinerContenu(doc, vente, pharmacie);
    doc.end();
  });
}
