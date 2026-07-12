const {
  Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, HeadingLevel, LevelFormat, PageBreak
} = require('docx');

const W = 9026;
const BORDERS_NONE = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};
const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: true,
    spacing: { before: 0, after: 200 },
    children: [new TextRun({ text, bold: true, size: 36, color: "FFFFFF", font: "Arial" })]
  });
}

function h1NoPB(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, bold: true, size: 36, color: "FFFFFF", font: "Arial" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, color: "1F4E79", font: "Arial" })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 100 },
    children: [new TextRun({ text, bold: true, size: 24, color: "2E75B6", font: "Arial" })]
  });
}

function h4(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: "▶ " + text, bold: true, size: 22, color: "C55A11", font: "Arial" })]
  });
}

function p(text) {
  return new Paragraph({
    spacing: { after: 140 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

function pb() { return new Paragraph({ children: [new PageBreak()] }); }

function sp() { return new Paragraph({ spacing: { after: 80 }, children: [] }); }

// Boîte colorée générique
function callout(icon, label, text, fillColor, borderColor, textColor = "000000") {
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    rows: [new TableRow({
      children: [new TableCell({
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
          left: { style: BorderStyle.SINGLE, size: 12, color: borderColor },
          right: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
        },
        shading: { fill: fillColor, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 180, right: 180 },
        children: [
          new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: icon + " " + label, bold: true, size: 21, color: borderColor, font: "Arial" })] }),
          new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text, size: 21, color: textColor, font: "Arial" })] }),
        ]
      })]
    })]
  });
}

function tip(text) { return callout("💡", "ASTUCE", text, "EBF5E9", "2D7D32"); }
function warning(text) { return callout("⚠", "ATTENTION", text, "FFF3E0", "E65100"); }
function danger(text) { return callout("🚫", "IMPORTANT", text, "FDECEA", "C62828"); }
function info(text) { return callout("ℹ", "À SAVOIR", text, "E3F2FD", "1565C0"); }
function check(text) { return callout("✅", "RÉSULTAT ATTENDU", text, "E8F5E9", "1B5E20"); }

// Boîte multi-lignes
function calloutLines(icon, label, lines, fillColor, borderColor) {
  const lineParas = lines.map((l, i) => new Paragraph({
    spacing: { after: i === lines.length - 1 ? 0 : 60 },
    children: [new TextRun({ text: "  • " + l, size: 21, font: "Arial" })]
  }));
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    rows: [new TableRow({
      children: [new TableCell({
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
          left: { style: BorderStyle.SINGLE, size: 12, color: borderColor },
          right: { style: BorderStyle.SINGLE, size: 4, color: borderColor },
        },
        shading: { fill: fillColor, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 180, right: 180 },
        children: [
          new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: icon + " " + label, bold: true, size: 21, color: borderColor, font: "Arial" })] }),
          ...lineParas,
        ]
      })]
    })]
  });
}

function tipLines(label, lines) { return calloutLines("💡", label, lines, "EBF5E9", "2D7D32"); }
function warnLines(label, lines) { return calloutLines("⚠", label, lines, "FFF3E0", "E65100"); }
function infoLines(label, lines) { return calloutLines("ℹ", label, lines, "E3F2FD", "1565C0"); }
function checkLines(label, lines) { return calloutLines("✅", label, lines, "E8F5E9", "1B5E20"); }

// Étape numérotée
function step(num, title, desc) {
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [800, W - 800],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: BORDERS_NONE,
          shading: { fill: "1F4E79", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ÉTAPE\n" + num, bold: true, size: 22, color: "FFFFFF", font: "Arial" })] })]
        }),
        new TableCell({
          borders: { top: BORDER, bottom: BORDER, right: BORDER, left: { style: BorderStyle.NONE, size: 0 } },
          shading: { fill: "EBF3FB", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 180, right: 120 },
          children: [
            new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: title, bold: true, size: 22, color: "1F4E79", font: "Arial" })] }),
            new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: desc, size: 21, font: "Arial" })] }),
          ]
        }),
      ]
    })]
  });
}

// Bloc code
function code(text) {
  return new Paragraph({
    spacing: { after: 40 },
    indent: { left: 360 },
    shading: { fill: "1E1E1E", type: ShadingType.CLEAR },
    children: [new TextRun({ text, font: "Courier New", size: 19, color: "D4D4D4" })]
  });
}

function codeTitle(text) {
  return new Paragraph({
    spacing: { after: 0 },
    indent: { left: 360 },
    shading: { fill: "2D2D2D", type: ShadingType.CLEAR },
    children: [new TextRun({ text: "# " + text, font: "Courier New", size: 18, bold: true, color: "569CD6" })]
  });
}

function li(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

function ni(text) {
  return new Paragraph({
    numbering: { reference: "numbered", level: 0 },
    spacing: { after: 100 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

// Tableau standard
function tHeader(cols, widths) {
  return new TableRow({
    tableHeader: true,
    children: cols.map((c, i) => new TableCell({
      borders: BORDERS,
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: "1F4E79", type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: c, bold: true, color: "FFFFFF", size: 20, font: "Arial" })] })]
    }))
  });
}

function tRow(cells, widths, shade = false) {
  return new TableRow({
    children: cells.map((c, i) => new TableCell({
      borders: BORDERS,
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: shade ? "DEEAF1" : "FFFFFF", type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: c, size: 20, font: "Arial" })] })]
    }))
  });
}

function makeTable(headers, rows, widths) {
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [tHeader(headers, widths), ...rows.map((r, i) => tRow(r, widths, i % 2 === 0))]
  });
}

// Séparateur visuel
function divider() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6" } },
    children: []
  });
}

// ASCII dans un bloc stylé
function ascii(lines) {
  const rows = lines.map(l => new Paragraph({
    spacing: { after: 20 },
    shading: { fill: "0D1117", type: ShadingType.CLEAR },
    indent: { left: 240, right: 240 },
    children: [new TextRun({ text: l, font: "Courier New", size: 18, color: "58A6FF" })]
  }));
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    rows: [new TableRow({
      children: [new TableCell({
        borders: { top: { style: BorderStyle.SINGLE, size: 6, color: "58A6FF" }, bottom: { style: BorderStyle.SINGLE, size: 6, color: "58A6FF" }, left: { style: BorderStyle.SINGLE, size: 6, color: "58A6FF" }, right: { style: BorderStyle.SINGLE, size: 6, color: "58A6FF" } },
        shading: { fill: "0D1117", type: ShadingType.CLEAR },
        margins: { top: 140, bottom: 140, left: 200, right: 200 },
        children: rows
      })]
    })]
  });
}

// Définition / Lexique
function def(term, definition) {
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [2000, W - 2000],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: BORDERS,
          shading: { fill: "2E75B6", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: term, bold: true, color: "FFFFFF", size: 21, font: "Arial" })] })]
        }),
        new TableCell({
          borders: BORDERS,
          shading: { fill: "F5F9FF", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 140, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: definition, size: 21, font: "Arial" })] })]
        }),
      ]
    })]
  });
}

const numbering = {
  config: [
    { reference: "bullets", levels: [
      { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
      { level: 2, format: LevelFormat.BULLET, text: "▪", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
    ]},
    { reference: "numbered", levels: [
      { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
    ]},
  ]
};

module.exports = { h1, h1NoPB, h2, h3, h4, p, pb, sp, tip, warning, danger, info, check, tipLines, warnLines, infoLines, checkLines, step, code, codeTitle, li, ni, makeTable, divider, ascii, def, numbering, W, BORDERS };
