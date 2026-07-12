const {
  Document, Packer, Paragraph, TextRun,
  Header, Footer, AlignmentType, BorderStyle,
  PageNumber, HeadingLevel, TableOfContents, ShadingType,
  WidthType, Table, TableRow, TableCell, VerticalAlign
} = require('docx');
const fs = require('fs');

const { numbering, W } = require('./helpers');
const { getSections1to5 } = require('./sections1-5');
const { getSections6to10 } = require('./sections6-10');
const { getSections11to15 } = require('./sections11-15');

// Page de garde
function coverPage() {
  return [
    new Paragraph({ spacing: { before: 1200, after: 300 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "MANUEL PROFESSIONNEL COMPLET", size: 60, bold: true, color: "1F4E79", font: "Arial" })] }),
    new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Réseau Informatique & Vidéosurveillance IP", size: 40, bold: true, color: "2E75B6", font: "Arial" })] }),
    new Paragraph({ spacing: { after: 100 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Guide du Débutant — Étape par Étape", size: 30, italics: true, color: "595959", font: "Arial" })] }),
    new Paragraph({ spacing: { after: 600 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "De l'analyse des besoins à la mise en production complète", size: 24, color: "808080", font: "Arial" })] }),
    new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: [W],
      rows: [new TableRow({ children: [new TableCell({
        borders: { top: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6" }, bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6" }, left: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6" }, right: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6" } },
        shading: { fill: "EBF3FB", type: ShadingType.CLEAR },
        margins: { top: 200, bottom: 200, left: 400, right: 400 },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ce manuel couvre :", bold: true, size: 24, color: "1F4E79", font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: "  ✔  Partie 1  — Analyse des besoins client (checklist complète)", size: 22, font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: "  ✔  Partie 2  — Visite technique et site survey", size: 22, font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: "  ✔  Partie 3  — Liste complète du matériel avec prix", size: 22, font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: "  ✔  Partie 4  — Modèle de devis professionnel", size: 22, font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: "  ✔  Partie 5  — Architecture réseau (schémas ASCII)", size: 22, font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: "  ✔  Partie 6  — Plan d'adressage IP complet (8 VLANs)", size: 22, font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: "  ✔  Partie 7  — Installation physique étape par étape", size: 22, font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: "  ✔  Partie 8  — Configuration complète (VLAN, DHCP, VPN, Wi-Fi)", size: 22, font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: "  ✔  Partie 9  — Commandes Cisco, MikroTik, Linux, Windows", size: 22, font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: "  ✔  Partie 10 — Vidéosurveillance IP (caméras, NVR, PoE)", size: 22, font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: "  ✔  Partie 11 — Tests et recette client", size: 22, font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: "  ✔  Partie 12 — Sécurité réseau complète", size: 22, font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: "  ✔  Partie 13 — Documentation finale (inventaire, mots de passe)", size: 22, font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: "  ✔  Partie 14 — Calendrier de maintenance", size: 22, font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text: "  ✔  Partie 15 — Guide de dépannage complet", size: 22, font: "Arial" })] }),
        ]
      })]})],
    }),
    new Paragraph({ spacing: { before: 400, after: 100 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Cisco  ·  MikroTik  ·  Ubiquiti  ·  TP-Link Omada  ·  Hikvision  ·  Dahua", size: 20, color: "808080", font: "Arial" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Version 2.0 — 2025", size: 20, color: "AAAAAA", font: "Arial" })] }),
    new Paragraph({ children: [new TextRun({ text: "", break: 1 })] }),
    new TableOfContents("TABLE DES MATIÈRES", { hyperlink: true, headingStyleRange: "1-3" }),
  ];
}

const allChildren = [
  ...coverPage(),
  ...getSections1to5(),
  ...getSections6to10(),
  ...getSections11to15(),
];

const doc = new Document({
  numbering,
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "FFFFFF" },
        paragraph: { spacing: { before: 0, after: 200 }, outlineLevel: 0,
          shading: { fill: "1F4E79", type: ShadingType.CLEAR } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "1F4E79" },
        paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 1,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "2E75B6" } } } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6" } },
          children: [
            new TextRun({ text: "Manuel Réseau & Vidéosurveillance — Guide Professionnel Complet  ", size: 18, color: "2E75B6", font: "Arial", italics: true }),
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: "2E75B6" } },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", size: 18, color: "808080", font: "Arial" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: "Arial" }),
            new TextRun({ text: " / ", size: 18, color: "808080", font: "Arial" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: "808080", font: "Arial" }),
            new TextRun({ text: "  —  Confidentiel", size: 18, color: "CCCCCC", font: "Arial" }),
          ]
        })]
      })
    },
    children: allChildren
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("Manuel-Reseau-Pro-v2.docx", buf);
  console.log("✅ Manuel-Reseau-Pro-v2.docx généré avec succès !");
  const stats = fs.statSync("Manuel-Reseau-Pro-v2.docx");
  console.log("📄 Taille : " + (stats.size / 1024).toFixed(0) + " KB");
}).catch(err => {
  console.error("ERREUR :", err.message);
  process.exit(1);
});
