// Convertit un fichier HTML local en capture d'ecran PNG pleine page, via Edge (CDP/puppeteer-core).
// Usage : node screenshot-html.js <cheminHtml> <cheminPng>
const puppeteer = require("puppeteer-core");
const path = require("path");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function main() {
  const [, , cheminHtml, cheminPng] = process.argv;
  if (!cheminHtml || !cheminPng) {
    console.error("Usage: node screenshot-html.js <cheminHtml> <cheminPng>");
    process.exit(1);
  }

  const urlHtml = "file:///" + path.resolve(cheminHtml).replace(/\\/g, "/");

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    protocolTimeout: 180000,
    timeout: 90000,
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(120000);
    page.setDefaultNavigationTimeout(120000);
    await page.setViewport({ width: 900, height: 600, deviceScaleFactor: 2 });
    await page.goto(urlHtml, { waitUntil: "load" });

    await page.screenshot({
      path: cheminPng,
      fullPage: true,
    });

    console.log("PNG genere : " + cheminPng);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
