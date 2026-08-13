// Convertit tous les HTML de solutions_html/ en PNG dans solutions_png/,
// en reutilisant un seul navigateur pour les 10 fichiers (plus fiable
// qu'un lancement de navigateur separe par fichier).
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const HTML_DIR = path.join(__dirname, "solutions_html");
const PNG_DIR = path.join(__dirname, "solutions_png");

async function main() {
  const files = fs.readdirSync(HTML_DIR).filter(f => f.endsWith(".html")).sort();

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    protocolTimeout: 180000,
    timeout: 90000,
  });

  try {
    for (const file of files) {
      const htmlPath = path.join(HTML_DIR, file);
      const pngName = file.replace(/\.html$/, ".png");
      const pngPath = path.join(PNG_DIR, pngName);
      const url = "file:///" + htmlPath.replace(/\\/g, "/");

      const page = await browser.newPage();
      page.setDefaultTimeout(60000);
      page.setDefaultNavigationTimeout(60000);
      await page.setViewport({ width: 900, height: 600, deviceScaleFactor: 2 });
      await page.goto(url, { waitUntil: "load" });
      await page.screenshot({ path: pngPath, fullPage: true });
      await page.close();
      console.log("OK : " + pngName);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
