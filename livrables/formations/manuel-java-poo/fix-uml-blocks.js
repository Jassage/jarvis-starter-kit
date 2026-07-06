// Transforme les blocs <div class="uml">...<span class="uml-titre">TITRE</span>...</div>
// en blocs de code delimites (```{.uml}) precedes d'un titre en gras.
// Pourquoi : pandoc reflow le contenu des <div> comme du Markdown (les retours a la ligne
// deviennent des espaces), ce qui casse les diagrammes ASCII. Un bloc de code delimite est
// toujours traite verbatim par pandoc, donc fiable en HTML, PDF ET Word.

const fs = require("fs");
const path = require("path");

const chapitresDir = path.join(__dirname, "chapitres");
const fichiers = fs.readdirSync(chapitresDir).filter((f) => f.endsWith(".md"));

const regex = /<div class="uml">\r?\n<span class="uml-titre">(.*?)<\/span>\r?\n([\s\S]*?)\r?\n<\/div>/g;

let totalRemplacements = 0;

for (const fichier of fichiers) {
  const cheminComplet = path.join(chapitresDir, fichier);
  const contenu = fs.readFileSync(cheminComplet, "utf8");

  let compteFichier = 0;
  const nouveauContenu = contenu.replace(regex, (match, titre, corps) => {
    compteFichier++;
    return `**${titre.trim()}**\n\n\`\`\`{.uml}\n${corps}\n\`\`\``;
  });

  if (compteFichier > 0) {
    fs.writeFileSync(cheminComplet, nouveauContenu, "utf8");
    console.log(`${fichier} : ${compteFichier} bloc(s) transforme(s)`);
    totalRemplacements += compteFichier;
  }
}

console.log(`\nTotal : ${totalRemplacements} blocs UML transformes.`);
