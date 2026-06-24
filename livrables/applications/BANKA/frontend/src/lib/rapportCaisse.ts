import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatMontant, formatDatetime, TYPE_TRANSACTION_LABELS } from './utils';

const NAVY:  [number, number, number] = [30, 58, 138];
const BLUE:  [number, number, number] = [37, 99, 235];
const GRAY:  [number, number, number] = [139, 148, 176];
const DARK:  [number, number, number] = [11, 23, 51];
const WHITE: [number, number, number] = [255, 255, 255];
const GREEN: [number, number, number] = [4, 120, 87];
const RED:   [number, number, number] = [185, 28, 28];
const LIGHT: [number, number, number] = [247, 248, 252];

export function generateRapportCaisse(session: any, agenceNom: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const now = new Date();

  // ── HEADER ──────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 32, 'F');

  // Logo placeholder (square)
  doc.setFillColor(...BLUE);
  doc.roundedRect(14, 8, 16, 16, 3, 3, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('B', 22, 18.5, { align: 'center' });

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BANKA', 34, 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 195, 230);
  doc.text('Système de gestion bancaire', 34, 20);

  // Right side
  doc.setTextColor(...WHITE);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RAPPORT DE CAISSE', W - 14, 14, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 195, 230);
  doc.text(`Édité le ${formatDatetime(now.toISOString())}`, W - 14, 20, { align: 'right' });
  doc.text(agenceNom, W - 14, 26, { align: 'right' });

  let y = 42;

  // ── SESSION INFO ────────────────────────────────────────────────
  doc.setFillColor(...LIGHT);
  doc.roundedRect(14, y, W - 28, 36, 3, 3, 'F');

  const col1 = 20, col2 = W / 2 + 4;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY);
  doc.text('SESSION', col1, y + 7);
  doc.text('CAISSIER', col2, y + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(session.id?.slice(-8).toUpperCase() || '—', col1, y + 14);
  const caissier = session.ouvertPar ? `${session.ouvertPar.prenom} ${session.ouvertPar.nom}` : '—';
  doc.text(caissier, col2, y + 14);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text('OUVERTURE', col1, y + 22);
  doc.text('FERMETURE', col2, y + 22);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK);
  doc.text(formatDatetime(session.createdAt), col1, y + 28);
  doc.text(session.fermeAt ? formatDatetime(session.fermeAt) : 'Session en cours', col2, y + 28);

  y += 44;

  // ── RECAP KPIs ───────────────────────────────────────────────────
  const totalDepots   = session.transactions?.filter((t: any) => t.type === 'DEPOT').reduce((s: number, t: any) => s + Number(t.montant), 0) || 0;
  const totalRetraits = session.transactions?.filter((t: any) => t.type === 'RETRAIT').reduce((s: number, t: any) => s + Number(t.montant), 0) || 0;
  const soldeTheo     = Number(session.soldeOuverture) + totalDepots - totalRetraits;
  const soldeFerm     = session.soldeFermeture ? Number(session.soldeFermeture) : null;
  const ecart         = soldeFerm !== null ? soldeFerm - soldeTheo : null;

  const kpis = [
    { label: 'Solde ouverture',  value: formatMontant(session.soldeOuverture, 'HTG'),  color: DARK  },
    { label: 'Total dépôts',     value: `+${formatMontant(totalDepots, 'HTG')}`,        color: GREEN },
    { label: 'Total retraits',   value: `-${formatMontant(totalRetraits, 'HTG')}`,      color: RED   },
    { label: 'Solde théorique',  value: formatMontant(soldeTheo, 'HTG'),               color: NAVY  },
    ...(soldeFerm !== null ? [
      { label: 'Solde fermeture', value: formatMontant(soldeFerm, 'HTG'),                color: DARK  },
      { label: 'Écart de caisse', value: (ecart! >= 0 ? '+' : '') + formatMontant(ecart!, 'HTG'), color: ecart! === 0 ? GREEN : RED },
    ] : []),
  ];

  const kpiW = (W - 28 - (kpis.length - 1) * 3) / kpis.length;
  kpis.forEach((kpi, i) => {
    const x = 14 + i * (kpiW + 3);
    doc.setFillColor(...WHITE);
    doc.roundedRect(x, y, kpiW, 20, 2, 2, 'F');
    doc.setDrawColor(231, 234, 243);
    doc.roundedRect(x, y, kpiW, 20, 2, 2, 'S');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text(kpi.label.toUpperCase(), x + kpiW / 2, y + 7, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...kpi.color);
    doc.text(kpi.value, x + kpiW / 2, y + 14.5, { align: 'center' });
  });

  y += 28;

  // ── OPERATIONS TABLE ─────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('Détail des opérations', 14, y);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(`${session.transactions?.length || 0} opération(s)`, 14, y + 6);
  y += 10;

  const rows = (session.transactions || []).map((tx: any) => {
    const isDebit = ['RETRAIT', 'VIREMENT_DEBIT'].includes(tx.type);
    return [
      tx.reference || '—',
      TYPE_TRANSACTION_LABELS[tx.type] || tx.type,
      formatDatetime(tx.createdAt),
      tx.compteCredit?.numeroCompte || tx.compteDebit?.numeroCompte || '—',
      isDebit ? '' : formatMontant(tx.montant, tx.devise),
      isDebit ? formatMontant(tx.montant, tx.devise) : '',
      tx.statut || '—',
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Référence', 'Type', 'Date/Heure', 'Compte', 'Crédit', 'Débit', 'Statut']],
    body: rows.length > 0 ? rows : [['—', 'Aucune opération', '', '', '', '', '']],
    theme: 'plain',
    styles: { fontSize: 7.5, cellPadding: 3, textColor: [...DARK] },
    headStyles: { fillColor: [...NAVY], textColor: [...WHITE], fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: [...LIGHT] },
    columnStyles: {
      0: { font: 'courier', cellWidth: 28 },
      2: { cellWidth: 32 },
      4: { halign: 'right', textColor: [...GREEN] },
      5: { halign: 'right', textColor: [...RED] },
      6: { halign: 'center', cellWidth: 22 },
    },
    margin: { left: 14, right: 14 },
  });

  // ── FOOTER ───────────────────────────────────────────────────────
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

  // ── DOWNLOAD ─────────────────────────────────────────────────────
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const sessionRef = session.id?.slice(-8).toUpperCase() || 'SESSION';
  doc.save(`BANKA_Rapport_Caisse_${dateStr}_${sessionRef}.pdf`);
}
