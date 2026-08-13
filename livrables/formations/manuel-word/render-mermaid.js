// Pre-rend les diagrammes Mermaid (```mermaid ... ```) des chapitres en PNG, AVANT l'assemblage
// pandoc, pour un rendu identique et fiable dans les 3 exports (HTML/PDF/DOCX) — aucun des trois
// n'execute de JavaScript au moment de la conversion, un vrai <script> mermaid.js serait donc
// invisible en DOCX et en PDF. Reutilise le meme Edge headless (puppeteer-core) que print-pdf.js.
//
// PNG plutot que SVG : pandoc sait embarquer un PNG tel quel dans un .docx, mais doit rasteriser
// un SVG via l'outil externe "rsvg-convert" (non installe sur cette machine) — capturer directement
// une capture d'ecran PNG de l'element rendu evite cette dependance supplementaire.
//
// Usage : node render-mermaid.js <dossierChapitresSource> <dossierChapitresRendus> <dossierDiagrammes>
//
// - Les fichiers sources (chapitres/*.md) ne sont jamais modifies : ce script lit chapitres/*.md
//   et ecrit des COPIES transformees dans <dossierChapitresRendus>, que pandoc consomme ensuite.
// - Chaque bloc ```mermaid``` est remplace par une image ![Diagramme](<chemin absolu du .png>).
// - En cas d'erreur de syntaxe Mermaid, le script s'arrete immediatement (echec explicite plutot
//   qu'un diagramme silencieusement manquant dans le livre publie).

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const MERMAID_BUNDLE = path.join(__dirname, "node_modules", "mermaid", "dist", "mermaid.min.js");

// Palette alignee sur assets/style.css (bleu de marque Word + neutres du manuel).
const THEME_VARIABLES = {
  primaryColor: "#eaf1fb",
  primaryBorderColor: "#2b579a",
  primaryTextColor: "#1f2430",
  lineColor: "#5b6472",
  secondaryColor: "#eef1ff",
  secondaryBorderColor: "#5b6ee1",
  tertiaryColor: "#fff4e5",
  tertiaryBorderColor: "#f0a93a",
  fontFamily: "Segoe UI, Arial, sans-serif",
  fontSize: "15px",
};

async function main() {
  const [, , inputDir, outputDir, diagramsDir] = process.argv;
  if (!inputDir || !outputDir || !diagramsDir) {
    console.error("Usage: node render-mermaid.js <dossierChapitresSource> <dossierChapitresRendus> <dossierDiagrammes>");
    process.exit(1);
  }
  if (!fs.existsSync(MERMAID_BUNDLE)) {
    console.error("Bundle mermaid introuvable : " + MERMAID_BUNDLE + " (npm install mermaid manquant ?)");
    process.exit(1);
  }

  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(diagramsDir, { recursive: true });

  const mermaidSrc = fs.readFileSync(MERMAID_BUNDLE, "utf8");
  const browser = await puppeteer.launch({ executablePath: EDGE_PATH, headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });
  await page.setContent(
    "<!doctype html><html><body style=\"margin:0;background:#ffffff;\"></body></html>",
    { waitUntil: "load" }
  );
  await page.addScriptTag({ content: mermaidSrc });
  await page.evaluate((themeVariables) => {
    window.mermaid.initialize({ startOnLoad: false, theme: "base", themeVariables, securityLevel: "loose" });
  }, THEME_VARIABLES);

  const fichiers = fs.readdirSync(inputDir).filter((f) => f.endsWith(".md")).sort();
  let totalDiagrammes = 0;

  for (const fichier of fichiers) {
    const contenu = fs.readFileSync(path.join(inputDir, fichier), "utf8");
    const base = path.basename(fichier, ".md");
    const regex = /```mermaid\n([\s\S]*?)```/g;
    const matches = [...contenu.matchAll(regex)];

    let sortie = "";
    let curseur = 0;
    let index = 0;

    for (const m of matches) {
      index += 1;
      const code = m[1];
      // Prefixe "d-" obligatoire : un id commencant par un chiffre (les chapitres sont numerotes
      // "02-...", "13-...") est un selecteur CSS invalide, ce qui fait silencieusement echouer
      // le scoping de style de Mermaid et retombe sur le fill noir par defaut du SVG.
      const idBrut = `d-${base}-diagramme-${index}`.replace(/[^a-zA-Z0-9_-]/g, "_");

      let pngBuffer;
      try {
        await page.evaluate(async (code, idBrut) => {
          const { svg } = await window.mermaid.render(idBrut, code);
          document.body.innerHTML =
            '<div id="mermaid-render-container" style="display:inline-block;padding:16px;background:#ffffff;">' +
            svg +
            "</div>";
        }, code, idBrut);
        const conteneur = await page.$("#mermaid-render-container");
        pngBuffer = await conteneur.screenshot({ type: "png" });
      } catch (err) {
        console.error(`Echec de rendu Mermaid dans ${fichier} (diagramme #${index}) :`);
        console.error(err.message || err);
        await browser.close();
        process.exit(1);
      }

      const pngPath = path.join(diagramsDir, `${idBrut}.png`);
      fs.writeFileSync(pngPath, pngBuffer);
      totalDiagrammes += 1;

      sortie += contenu.slice(curseur, m.index);
      sortie += `![Diagramme](${path.resolve(pngPath).replace(/\\/g, "/")})`;
      curseur = m.index + m[0].length;
    }
    sortie += contenu.slice(curseur);

    fs.writeFileSync(path.join(outputDir, fichier), sortie, "utf8");
  }

  await browser.close();
  console.log(`Diagrammes Mermaid rendus : ${totalDiagrammes} (dans ${diagramsDir})`);
  console.log(`Chapitres transformes ecrits dans : ${outputDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
