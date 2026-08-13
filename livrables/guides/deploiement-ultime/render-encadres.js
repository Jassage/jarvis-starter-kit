// Convertit les encadres pedagogiques ecrits en blockquote Markdown
// (ex: "> ⚠️ **Attention** — texte...") en <div class="encadre ...">
// stylees, sur le meme principe que render-mermaid.js du manuel Node.js :
// les fichiers sources dans les parties/ ne sont jamais modifies, seule
// une copie prete pour pandoc est ecrite dans le dossier de sortie.
//
// Usage : node render-encadres.js <dossierSource> <dossierSortie>

const fs = require("fs");
const path = require("path");

const EMOJI_CLASS = [
  ["🎯", "objectif"],
  ["💡", "analogie"],
  ["📌", "retenir"],
  ["✅", "bonne-pratique"],
  ["⚠️", "attention"],
  ["❌", "erreur"],
];

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Convertit une inline Markdown simple (code, gras, liens) en HTML,
// en supposant que le texte est deja echappe (escapeHtml applique avant).
function inlineMarkdownToHtml(escaped) {
  escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");
  escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return escaped;
}

function detecterEmoji(texte) {
  for (const [emoji, classe] of EMOJI_CLASS) {
    if (texte.startsWith(emoji)) return { emoji, classe };
  }
  return null;
}

function transformerFichier(srcPath, destPath) {
  const lignes = fs.readFileSync(srcPath, "utf8").split("\n");
  const sortie = [];
  let i = 0;

  while (i < lignes.length) {
    const ligne = lignes[i];

    if (/^> /.test(ligne) || ligne === ">") {
      const groupe = [];
      while (i < lignes.length && (/^> /.test(lignes[i]) || lignes[i] === ">")) {
        groupe.push(lignes[i].replace(/^> ?/, ""));
        i++;
      }
      const joint = groupe.join(" ").trim();
      const detection = detecterEmoji(joint);

      if (detection) {
        const reste = joint.slice(detection.emoji.length).trim();
        const m = reste.match(/^\*\*(.+?)\*\*\s*(?:—\s*)?(.*)$/);
        if (m) {
          const titre = escapeHtml(m[1]);
          const contenuBrut = (m[2] || "").trim();
          const contenu = inlineMarkdownToHtml(escapeHtml(contenuBrut));

          sortie.push(`<div class="encadre ${detection.classe}">`);
          sortie.push(`<span class="encadre-titre">${detection.emoji} ${titre}</span>`);
          if (contenu) sortie.push(contenu);
          sortie.push(`</div>`);
          continue;
        }
      }

      // Pas un encadre reconnu : on restitue le blockquote tel quel
      groupe.forEach((l) => sortie.push("> " + l));
      continue;
    }

    sortie.push(ligne);
    i++;
  }

  fs.writeFileSync(destPath, sortie.join("\n"), "utf8");
}

function main() {
  const [, , srcDir, destDir] = process.argv;
  if (!srcDir || !destDir) {
    console.error("Usage: node render-encadres.js <dossierSource> <dossierSortie>");
    process.exit(1);
  }

  fs.mkdirSync(destDir, { recursive: true });
  const fichiers = fs.readdirSync(srcDir).filter((f) => f.endsWith(".md"));

  fichiers.forEach((f) => {
    transformerFichier(path.join(srcDir, f), path.join(destDir, f));
    console.log("Encadres rendus : " + f);
  });
}

main();
