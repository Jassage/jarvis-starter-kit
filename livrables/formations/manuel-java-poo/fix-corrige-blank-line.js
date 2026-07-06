// Insere une ligne vide entre "**Corrigé :**" et un titre en gras qui le suit
// immediatement (sinon ils fusionnent dans le meme paragraphe Markdown).
const fs = require("fs");
const path = require("path");

const chapitresDir = path.join(__dirname, "chapitres");
const fichiers = fs.readdirSync(chapitresDir).filter((f) => f.endsWith(".md"));

const regex = /(\*\*Corrigé\s?:\*\*)\r?\n(\*\*)/g;

let total = 0;
for (const fichier of fichiers) {
  const p = path.join(chapitresDir, fichier);
  const contenu = fs.readFileSync(p, "utf8");
  let compte = 0;
  const nouveau = contenu.replace(regex, (m, a, b) => {
    compte++;
    return `${a}\n\n${b}`;
  });
  if (compte > 0) {
    fs.writeFileSync(p, nouveau, "utf8");
    console.log(`${fichier} : ${compte} correction(s)`);
    total += compte;
  }
}
console.log(`Total : ${total}`);
