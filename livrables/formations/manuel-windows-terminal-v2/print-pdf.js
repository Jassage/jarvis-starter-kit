// Genere un PDF depuis un fichier HTML local via Edge (CDP), avec un pied de page
// personnalise (auteur + numero de page) et sans en-tete (pas de date/heure/URL).
// Usage : node print-pdf.js <cheminHtml> <cheminPdf> "<textePiedDePage>"

const puppeteer = require("puppeteer-core");
const path = require("path");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function main() {
  const [, , cheminHtml, cheminPdf, textePied] = process.argv;
  if (!cheminHtml || !cheminPdf) {
    console.error("Usage: node print-pdf.js <cheminHtml> <cheminPdf> [textePiedDePage]");
    process.exit(1);
  }

  const urlHtml = "file:///" + path.resolve(cheminHtml).replace(/\\/g, "/");
  const pied = textePied || "";

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    protocolTimeout: 120000,
  });

  try {
    const page = await browser.newPage();
    await page.goto(urlHtml, { waitUntil: "load", timeout: 60000 });

    await page.pdf({
      path: cheminPdf,
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `<div></div>`,
      footerTemplate: `
        <div style="width:100%; font-size:8.5px; color:#8a94a3; padding:0 14mm; display:flex; justify-content:space-between; font-family:Segoe UI, Arial, sans-serif;">
          <span>${pied.replace(/</g, "&lt;")}</span>
          <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>`,
      margin: { top: "2.2cm", bottom: "1.6cm", left: "2cm", right: "2cm" },
    });

    console.log("PDF genere avec pied de page personnalise : " + cheminPdf);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
