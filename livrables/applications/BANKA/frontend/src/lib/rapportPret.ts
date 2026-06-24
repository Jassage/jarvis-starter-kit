import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatMontant, formatDate, formatDatetime, nomClient } from './utils';

const NAVY:  [number, number, number] = [30, 58, 138];
const BLUE:  [number, number, number] = [37, 99, 235];
const GRAY:  [number, number, number] = [139, 148, 176];
const DARK:  [number, number, number] = [11, 23, 51];
const WHITE: [number, number, number] = [255, 255, 255];
const GREEN: [number, number, number] = [4, 120, 87];
const RED:   [number, number, number] = [185, 28, 28];
const AMBER: [number, number, number] = [180, 83, 9];
const LIGHT: [number, number, number] = [247, 248, 252];

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente', APPROUVE: 'Approuvé', DECAISSE: 'Décaissé',
  EN_COURS: 'En cours', EN_RETARD: 'En retard', SOLDE: 'Soldé', REJETE: 'Rejeté', ANNULE: 'Annulé',
};

const AMORT_LABELS: Record<string, string> = {
  DEGRESSIF: 'Amortissement dégressif',
  CONSTANT: 'Amortissement constant',
  IN_FINE: 'In Fine',
};

const LIGNE_STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'À venir',
  PAYE: 'Payé',
  EN_RETARD: 'En retard',
  PARTIELLEMENT_PAYE: 'Partiel',
};

const REMBOURS_TYPE_LABELS: Record<string, string> = {
  MENSUALITE: 'Mensualité',
  ANTICIPEE: 'Anticipé',
  PARTIELLE: 'Partiel',
};

export function generateDossierCredit(pret: any) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const now = new Date();

  // ── HEADER ──────────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 32, 'F');

  doc.setFillColor(...BLUE);
  doc.roundedRect(14, 8, 16, 16, 3, 3, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('B', 22, 18.5, { align: 'center' });

  doc.setFontSize(16);
  doc.text('BANKA', 34, 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 195, 230);
  doc.text('Système de gestion bancaire', 34, 20);

  doc.setTextColor(...WHITE);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DOSSIER DE CRÉDIT', W - 14, 14, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 195, 230);
  doc.text(`Édité le ${formatDatetime(now.toISOString())}`, W - 14, 20, { align: 'right' });
  doc.text(pret.agence?.nom || '', W - 14, 26, { align: 'right' });

  let y = 42;

  // ── REF + STATUT BAR ────────────────────────────────────────────────────────
  const statutColor: [number, number, number] =
    pret.statut === 'EN_RETARD' ? RED :
    pret.statut === 'SOLDE' ? GREEN :
    pret.statut === 'EN_COURS' ? [14, 116, 144] :
    pret.statut === 'APPROUVE' || pret.statut === 'DECAISSE' ? BLUE : DARK;

  doc.setFillColor(...LIGHT);
  doc.roundedRect(14, y, W - 28, 16, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(`Référence : ${pret.reference}`, 20, y + 6.5);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...statutColor);
  doc.text((STATUT_LABELS[pret.statut] || pret.statut).toUpperCase(), W - 20, y + 6.5, { align: 'right' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(`Demande : ${formatDate(pret.dateDemande)}${pret.objet ? `  —  Objet : ${pret.objet}` : ''}`, 20, y + 12.5);

  y += 22;

  // ── CLIENT + INTERVENANTS ────────────────────────────────────────────────────
  const colW = (W - 28 - 4) / 2;

  // Client card
  doc.setFillColor(...WHITE);
  doc.roundedRect(14, y, colW, 42, 2, 2, 'F');
  doc.setDrawColor(231, 234, 243);
  doc.roundedRect(14, y, colW, 42, 2, 2, 'S');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY);
  doc.text('CLIENT', 20, y + 8);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(nomClient(pret.client), 20, y + 16);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(pret.client?.numeroClient || '', 20, y + 22);
  if (pret.client?.telephone) doc.text(`Tél : ${pret.client.telephone}`, 20, y + 28);
  if (pret.client?.adresse) {
    const adresse = doc.splitTextToSize(pret.client.adresse, colW - 14);
    doc.text(adresse[0], 20, y + 34);
  }

  // Intervenants card
  const rx = 14 + colW + 4;
  doc.setFillColor(...WHITE);
  doc.roundedRect(rx, y, colW, 42, 2, 2, 'F');
  doc.setDrawColor(231, 234, 243);
  doc.roundedRect(rx, y, colW, 42, 2, 2, 'S');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY);
  doc.text('INTERVENANTS', rx + 6, y + 8);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK);
  const agent = pret.agentCredit ? `${pret.agentCredit.prenom} ${pret.agentCredit.nom}` : '—';
  const validateur = pret.validateur ? `${pret.validateur.prenom} ${pret.validateur.nom}` : '—';
  doc.text(`Agent crédit :  ${agent}`, rx + 6, y + 16);
  doc.text(`Validateur :     ${validateur}`, rx + 6, y + 23);
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  if (pret.dateApprobation) doc.text(`Approuvé le : ${formatDate(pret.dateApprobation)}`, rx + 6, y + 30);
  if (pret.dateDecaissement) doc.text(`Décaissé le : ${formatDate(pret.dateDecaissement)}`, rx + 6, y + 36);

  y += 48;

  // ── KPIs ─────────────────────────────────────────────────────────────────────
  const kpis = [
    { label: 'Montant accordé',    value: formatMontant(pret.montant, pret.devise),         color: NAVY  },
    { label: 'Taux mensuel',       value: `${(Number(pret.tauxMensuel) * 100).toFixed(2)}%`, color: DARK  },
    { label: 'Durée',              value: `${pret.dureeMois} mois`,                          color: DARK  },
    { label: 'Total dû',           value: formatMontant(pret.montantTotal, pret.devise),     color: DARK  },
    { label: 'Remboursé',          value: formatMontant(pret.montantRembourse, pret.devise), color: GREEN },
    { label: 'Reste à régler',     value: formatMontant(pret.resteARegler, pret.devise),     color: RED   },
  ];
  const kpiW = (W - 28 - 5 * 3) / 6;
  kpis.forEach((kpi, i) => {
    const x = 14 + i * (kpiW + 3);
    doc.setFillColor(...LIGHT);
    doc.roundedRect(x, y, kpiW, 22, 2, 2, 'F');
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text(kpi.label.toUpperCase(), x + kpiW / 2, y + 7, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...kpi.color);
    doc.text(kpi.value, x + kpiW / 2, y + 15.5, { align: 'center' });
  });

  y += 28;

  // ── TABLEAU D'AMORTISSEMENT ──────────────────────────────────────────────────
  if (pret.lignes?.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text("Tableau d'amortissement", 14, y);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text(`${pret.lignes.length} échéances  —  ${AMORT_LABELS[pret.typeAmortissement] || pret.typeAmortissement}`, 14, y + 6);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['N°', 'Échéance', 'Mensualité', 'Capital', 'Intérêts', 'Cap. restant', 'Statut']],
      body: pret.lignes.map((l: any) => [
        `#${l.numeroEcheance}`,
        formatDate(l.dateEcheance),
        formatMontant(l.mensualite, pret.devise),
        formatMontant(l.capital, pret.devise),
        formatMontant(l.interet, pret.devise),
        formatMontant(l.capitalRestant, pret.devise),
        LIGNE_STATUT_LABELS[l.statut] || l.statut,
      ]),
      theme: 'plain',
      styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [...DARK] },
      headStyles: { fillColor: [...NAVY], textColor: [...WHITE], fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: [...LIGHT] },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 28 },
        2: { halign: 'right', fontStyle: 'bold' },
        3: { halign: 'right' },
        4: { halign: 'right', textColor: [...AMBER] },
        5: { halign: 'right', textColor: [...GRAY] },
        6: { halign: 'center', cellWidth: 22 },
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 6) {
          const statut = pret.lignes[data.row.index]?.statut;
          if (statut === 'PAYE') data.cell.styles.textColor = [...GREEN];
          if (statut === 'EN_RETARD') data.cell.styles.textColor = [...RED];
        }
      },
    });
  }

  // ── HISTORIQUE REMBOURSEMENTS ─────────────────────────────────────────────────
  if (pret.remboursements?.length > 0) {
    const afterAmort = (doc as any).lastAutoTable?.finalY ?? y + 20;
    let ry = afterAmort + 10;
    const pageH = doc.internal.pageSize.getHeight();
    if (ry > pageH - 50) { doc.addPage(); ry = 20; }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('Historique des remboursements', 14, ry);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text(`${pret.remboursements.length} paiement(s) enregistré(s)`, 14, ry + 6);
    ry += 10;

    autoTable(doc, {
      startY: ry,
      head: [['Date', 'Type', 'Montant', 'Capital', 'Intérêts', 'Pénalité', 'Enregistré par']],
      body: pret.remboursements.map((r: any) => [
        formatDate(r.date || r.createdAt),
        REMBOURS_TYPE_LABELS[r.type] || r.type,
        formatMontant(r.montant, pret.devise),
        formatMontant(r.capital, pret.devise),
        formatMontant(r.interet, pret.devise),
        formatMontant(r.penalite, pret.devise),
        r.creePar ? `${r.creePar.prenom} ${r.creePar.nom}` : '—',
      ]),
      theme: 'plain',
      styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [...DARK] },
      headStyles: { fillColor: [...NAVY], textColor: [...WHITE], fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: [...LIGHT] },
      columnStyles: {
        2: { halign: 'right', fontStyle: 'bold' },
        3: { halign: 'right' },
        4: { halign: 'right', textColor: [...AMBER] },
        5: { halign: 'right', textColor: [...RED] },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // ── FOOTER ───────────────────────────────────────────────────────────────────
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setDrawColor(231, 234, 243);
    doc.line(14, pageH - 14, W - 14, pageH - 14);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text('BANKA — Document confidentiel à usage interne', 14, pageH - 8);
    doc.text(`Page ${p} / ${pageCount}`, W - 14, pageH - 8, { align: 'right' });
  }

  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  doc.save(`BANKA_Dossier_Credit_${pret.reference}_${dateStr}.pdf`);
}
