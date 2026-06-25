import jsPDF from 'jspdf';
import { formatMontant } from './utils';

const NAVY:   [number, number, number] = [30, 58, 138];
const BLUE:   [number, number, number] = [37, 99, 235];
const GRAY:   [number, number, number] = [139, 148, 176];
const DARK:   [number, number, number] = [11, 23, 51];
const WHITE:  [number, number, number] = [255, 255, 255];
const LIGHT:  [number, number, number] = [247, 248, 252];
const BODY:   [number, number, number] = [60, 72, 100];
const BORDER: [number, number, number] = [231, 234, 243];

export interface ContratPDFData {
  reference: string;
  type: string;
  dateDebut: string;
  dateFin?: string;
  salaireBrut: number;
  notes?: string;
  employe: { nom: string; prenom: string; matricule: string };
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    CDI:        'À DURÉE INDÉTERMINÉE',
    CDD:        'À DURÉE DÉTERMINÉE',
    STAGE:      'DE STAGE',
    CONSULTANT: 'DE CONSULTANT',
  };
  return labels[type] ?? type;
}

function buildArticles(c: ContratPDFData, institution: string): { title: string; body: string }[] {
  const nom = `${c.employe.prenom} ${c.employe.nom}`;
  const debut = fmtDate(c.dateDebut);
  const fin   = c.dateFin ? fmtDate(c.dateFin) : null;
  const salaire = formatMontant(c.salaireBrut, 'HTG');

  let duree = '';
  if (c.type === 'CDI') {
    duree = `Le présent contrat est conclu pour une durée indéterminée. Il prend effet à compter du ${debut}. Chacune des parties peut y mettre fin sous réserve du respect du délai de préavis prévu par la législation haïtienne.`;
  } else if (c.type === 'CDD') {
    duree = `Le présent contrat est conclu pour une durée déterminée. Il prend effet le ${debut}${fin ? ` et prendra fin le ${fin}` : ''}. À l'issue de cette période, le contrat ne se poursuivra que par accord exprès et écrit des deux parties.`;
  } else if (c.type === 'STAGE') {
    duree = `Le présent contrat de stage prend effet le ${debut}${fin ? ` et se termine le ${fin}` : ''}. La période de stage n'est pas considérée comme une période d'engagement ferme et peut être interrompue par l'une ou l'autre des parties avec un préavis raisonnable.`;
  } else {
    duree = `La présente convention de consultant prend effet le ${debut}${fin ? ` et prendra fin le ${fin}` : ''}. Les prestations sont effectuées de façon indépendante selon les termes convenus entre les parties.`;
  }

  return [
    {
      title: 'Article 1 — Engagement',
      body:  `L'Employeur engage Monsieur / Madame ${nom} en qualité d'employé(e) au sein de ${institution}, conformément aux dispositions du Code du Travail en vigueur en République d'Haïti et aux règlements internes de l'institution.`,
    },
    {
      title: 'Article 2 — Poste et Fonctions',
      body:  `L'Employé(e) exercera les fonctions et responsabilités inhérentes à son poste ainsi que toutes les tâches connexes qui pourront lui être confiées par sa hiérarchie, dans le cadre normal de ses attributions professionnelles.`,
    },
    {
      title: 'Article 3 — Durée du Contrat',
      body:  duree,
    },
    {
      title: 'Article 4 — Rémunération',
      body:  `L'Employé(e) percevra une rémunération mensuelle brute de ${salaire} (gourdes haïtiennes), payable selon les modalités et échéances en vigueur au sein de l'institution. Les retenues légales obligatoires (cotisations sociales, impôts) seront opérées conformément à la réglementation en vigueur.`,
    },
    {
      title: 'Article 5 — Horaires de Travail',
      body:  `L'Employé(e) travaillera selon les horaires en vigueur au sein de ${institution}, dans le respect des dispositions légales relatives à la durée et à l'organisation du travail. Tout dépassement des heures réglementaires sera traité conformément aux dispositions du Code du Travail haïtien.`,
    },
    {
      title: 'Article 6 — Lieu de Travail',
      body:  `Le lieu de travail habituel de l'Employé(e) est le siège de ${institution}. L'Employé(e) pourra être amené(e) à effectuer des déplacements professionnels dans le cadre de ses fonctions, après accord préalable de sa hiérarchie.`,
    },
    {
      title: 'Article 7 — Confidentialité',
      body:  `L'Employé(e) s'engage, pendant toute la durée du contrat et après sa cessation, à observer une stricte confidentialité concernant toutes les informations, données, documents et procédés dont il / elle aura connaissance dans l'exercice de ses fonctions. Toute violation de cette obligation pourra entraîner des sanctions disciplinaires ou des poursuites judiciaires.`,
    },
    {
      title: 'Article 8 — Résiliation',
      body:  `Le présent contrat pourra être résilié dans les conditions prévues par le Code du Travail de la République d'Haïti, notamment en cas de faute grave de l'une des parties, de force majeure, de cessation d'activité de l'établissement ou d'accord mutuel. En cas de résiliation à l'initiative de l'une des parties, le délai de préavis légal devra être strictement respecté.`,
    },
  ];
}

function buildContratDoc(contrat: ContratPDFData, institutionNom: string): jsPDF {
  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W    = doc.internal.pageSize.getWidth();
  const H    = doc.internal.pageSize.getHeight();
  const ML   = 20;
  const MR   = 20;
  const CW   = W - ML - MR;
  const BMAX = H - 18;
  const BLKW = (CW - 10) / 2;
  const empX = ML + BLKW + 10;
  const now  = new Date();

  let y = 0;

  function checkPage(needed = 10) {
    if (y + needed > BMAX) {
      doc.addPage();
      y = 18;
    }
  }

  // ── HEADER ──────────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 32, 'F');

  doc.setFillColor(...BLUE);
  doc.roundedRect(ML, 8, 16, 16, 3, 3, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('B', ML + 8, 18.5, { align: 'center' });

  doc.setFontSize(16);
  doc.text('BANKA', ML + 20, 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 195, 230);
  doc.text('Système de gestion bancaire', ML + 20, 20);

  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTRAT DE TRAVAIL', W - MR, 14, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 195, 230);
  doc.text(institutionNom.length > 35 ? institutionNom.slice(0, 33) + '…' : institutionNom, W - MR, 20, { align: 'right' });
  doc.text(`Réf. : ${contrat.reference}`, W - MR, 26, { align: 'right' });

  y = 42;

  // ── TITLE ───────────────────────────────────────────────────────────────────
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('CONTRAT DE TRAVAIL', W / 2, y, { align: 'center' });
  y += 7;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...NAVY);
  doc.text(typeLabel(contrat.type), W / 2, y, { align: 'center' });
  y += 4;

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 45, y, W / 2 + 45, y);
  doc.setLineWidth(0.2);
  y += 7;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(
    `Établi le ${now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    W / 2, y, { align: 'center' },
  );
  y += 10;

  // ── SEPARATOR ───────────────────────────────────────────────────────────────
  doc.setDrawColor(...BORDER);
  doc.line(ML, y, W - MR, y);
  y += 10;

  // ── PARTIES ─────────────────────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY);
  doc.text('ENTRE LES SOUSSIGNÉS :', ML, y);
  y += 8;

  // Left block — Employeur
  doc.setFillColor(...LIGHT);
  doc.roundedRect(ML, y, BLKW, 30, 2, 2, 'F');
  doc.setDrawColor(...BORDER);
  doc.roundedRect(ML, y, BLKW, 30, 2, 2, 'S');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY);
  doc.text("L'EMPLOYEUR", ML + 5, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  const instLabel = institutionNom.length > 28 ? institutionNom.slice(0, 26) + '…' : institutionNom;
  doc.text(instLabel, ML + 5, y + 17);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text("Ci-après dénommé « l'Employeur »", ML + 5, y + 24);

  // Right block — Employé
  doc.setFillColor(...LIGHT);
  doc.roundedRect(empX, y, BLKW, 30, 2, 2, 'F');
  doc.setDrawColor(...BORDER);
  doc.roundedRect(empX, y, BLKW, 30, 2, 2, 'S');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY);
  doc.text("L'EMPLOYÉ(E)", empX + 5, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  const nomLabel = `${contrat.employe.prenom} ${contrat.employe.nom}`;
  doc.text(nomLabel.length > 28 ? nomLabel.slice(0, 26) + '…' : nomLabel, empX + 5, y + 17);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(`Matricule : ${contrat.employe.matricule}`, empX + 5, y + 24);

  y += 38;

  // ── INTRO ARTICLES ──────────────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY);
  doc.text('IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :', ML, y);
  y += 5;
  doc.setDrawColor(...BORDER);
  doc.line(ML, y, W - MR, y);
  y += 10;

  // ── ARTICLES ────────────────────────────────────────────────────────────────
  const articles = buildArticles(contrat, institutionNom);

  for (const art of articles) {
    checkPage(22);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text(art.title, ML, y);
    y += 5.5;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BODY);
    const lines = doc.splitTextToSize(art.body, CW) as string[];
    for (const line of lines) {
      checkPage(5);
      doc.text(line, ML, y);
      y += 5;
    }
    y += 5;
  }

  // ── NOTES (if any) ──────────────────────────────────────────────────────────
  if (contrat.notes?.trim()) {
    checkPage(25);
    doc.setDrawColor(...BORDER);
    doc.line(ML, y, W - MR, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('Conditions particulières', ML, y);
    y += 6;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BODY);
    const noteLines = doc.splitTextToSize(contrat.notes.trim(), CW) as string[];
    for (const line of noteLines) {
      checkPage(5);
      doc.text(line, ML, y);
      y += 5;
    }
    y += 6;
  }

  // ── SIGNATURES ──────────────────────────────────────────────────────────────
  checkPage(65);

  doc.setDrawColor(...BORDER);
  doc.line(ML, y, W - MR, y);
  y += 10;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  const luText = 'Fait en deux (2) exemplaires originaux, à _________________________, le _________________________.';
  doc.text(doc.splitTextToSize(luText, CW), ML, y);
  y += 14;

  // Signature headers
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text("POUR L'EMPLOYEUR", ML, y);
  doc.text("L'EMPLOYÉ(E)", empX, y);
  y += 5;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(instLabel, ML, y);
  doc.text(nomLabel.length > 28 ? nomLabel.slice(0, 26) + '…' : nomLabel, empX, y);
  y += 4;
  doc.text(`Réf. contrat : ${contrat.reference}`, ML, y);
  doc.text(`Matricule : ${contrat.employe.matricule}`, empX, y);
  y += 18;

  // Signature boxes
  doc.setFillColor(250, 251, 254);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(ML, y, BLKW, 28, 2, 2, 'FD');
  doc.roundedRect(empX, y, BLKW, 28, 2, 2, 'FD');
  y += 32;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text('Signature et cachet de l\'institution', ML + BLKW / 2, y, { align: 'center' });
  doc.text('Signature précédée de « Lu et approuvé »', empX + BLKW / 2, y, { align: 'center' });

  // ── FOOTERS ─────────────────────────────────────────────────────────────────
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...BORDER);
    doc.line(ML, H - 13, W - MR, H - 13);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text(`${institutionNom} — Document confidentiel à usage interne`, ML, H - 7);
    doc.text(`Page ${p} / ${totalPages}`, W - MR, H - 7, { align: 'right' });
  }

  return doc;
}

export function generateContratTravail(contrat: ContratPDFData, institutionNom: string): void {
  const doc = buildContratDoc(contrat, institutionNom);
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const refSafe = contrat.reference.replace(/[^A-Z0-9]/gi, '_');
  doc.save(`BANKA_Contrat_${refSafe}_${dateStr}.pdf`);
}

export function openContratTravail(contrat: ContratPDFData, institutionNom: string): void {
  const doc = buildContratDoc(contrat, institutionNom);
  const url = doc.output('bloburl') as unknown as string;
  window.open(url, '_blank');
}
