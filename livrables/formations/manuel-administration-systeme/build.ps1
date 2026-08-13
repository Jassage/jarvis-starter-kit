# Build du manuel Administration Systeme : assemble les chapitres Markdown et genere HTML + PDF + DOCX.
# Usage : powershell -File build.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root
$chapitresDir = Join-Path $root "chapitres"
$exportDir = Join-Path $root "export"
$diagramsDir = Join-Path $root "assets\diagrams"
$chapitresRendusDir = Join-Path $root ".tmp-mermaid\chapitres"

# pandoc --embed-resources interprete un chemin ABSOLU avec lettre de lecteur ("C:/Users/...")
# comme une URI dont "C" serait le schema, et echoue silencieusement ("C: withBinaryFile: does
# not exist"). Tous les chemins passes a pandoc sont donc RELATIFS a la racine du projet (d'ou
# le Set-Location ci-dessus), en slashs.
$cssPath = "assets/style.css"
$couverturePath = "assets/couverture.md"
$couvertureFragmentPath = "assets/cover-fragment.html"

# --- Pre-rendu des diagrammes Mermaid en SVG (voir render-mermaid.js) ---
# Ni pandoc ni le PDF (Puppeteer sur un HTML deja fige) n'executent de JavaScript : un <script>
# mermaid.js resterait invisible en DOCX et ne serait fiable qu'en HTML. On rend donc chaque
# diagramme en image AVANT pandoc, pour un rendu identique dans les 3 exports. Les fichiers
# sources dans chapitres/ ne sont jamais modifies par cette etape.
Write-Output "Rendu des diagrammes Mermaid..."
node (Join-Path $root "render-mermaid.js") "$chapitresDir" "$chapitresRendusDir" "$diagramsDir"
if ($LASTEXITCODE -ne 0) { throw "Echec du rendu Mermaid (render-mermaid.js)" }

New-Item -ItemType Directory -Force -Path $exportDir | Out-Null

$fichiers = @(Get-ChildItem $chapitresRendusDir -Filter "*.md" | Sort-Object Name)
Write-Output "Chapitres assembles ($($fichiers.Count)) :"
$fichiers | ForEach-Object { Write-Output " - $($_.Name)" }

# Chemins RELATIFS pour pandoc (voir remarque plus haut sur --embed-resources) : $root/.tmp-mermaid/...
# est toujours sous la racine du projet, donc "chapitres/../.tmp-mermaid/chapitres/xxx.md" en
# repartant de $root suffit une fois qu'on connait le nom du fichier.
# @(...) est OBLIGATOIRE ici : avec un seul chapitre, "... | ForEach-Object {...}" renvoie une
# simple chaine (pas un tableau a 1 element) — le splat "@cheminsAbsolus" sur une chaine eclate
# alors CHAQUE CARACTERE en argument separe pour pandoc (bug reel rencontre sur ce chapitre pilote,
# invisible des qu'un manuel a plusieurs chapitres).
$cheminsAbsolus = @($fichiers | ForEach-Object { ".tmp-mermaid/chapitres/$($_.Name)" })

# $htmlOut/$docxOut/$pdfOut (absolus, a antislash) restent utilises pour Node (print-pdf.js) et
# les messages affiches ; $htmlOutPandoc/$docxOutPandoc (relatifs) sont ceux passes a pandoc.
$htmlOut = Join-Path $exportDir "manuel-administration-systeme.html"
$docxOut = Join-Path $exportDir "manuel-administration-systeme.docx"
$pdfOut  = Join-Path $exportDir "manuel-administration-systeme.pdf"
$htmlOutPandoc = "export/manuel-administration-systeme.html"
$docxOutPandoc = "export/manuel-administration-systeme.docx"

# --- HTML autonome (couverture injectee AVANT le sommaire auto-genere par pandoc) ---
# "-tex_math_dollars" : desactive l'interpretation des "$" comme delimiteurs de formules LaTeX
# (sinon des operateurs MongoDB comme `$gt`/`$ne`/`$where` sont pris a tort pour des maths)
pandoc @cheminsAbsolus `
  --from=markdown+raw_html-tex_math_dollars `
  --to=html5 `
  --syntax-highlighting=breezedark `
  --standalone `
  --toc `
  --toc-depth=2 `
  --include-before-body="$couvertureFragmentPath" `
  --metadata pagetitle="Manuel professionnel d'Administration Systeme et Infrastructure" `
  --metadata author="Jaslin Occius" `
  --metadata toc-title="Table des matieres" `
  --css="$cssPath" `
  --embed-resources `
  --output="$htmlOutPandoc"
if ($LASTEXITCODE -ne 0) { throw "Echec de la generation HTML (pandoc)" }

Write-Output "HTML genere : $htmlOut"

# --- DOCX (Word, table des matieres native Word incluse) ---
$cheminsDocx = @($couverturePath) + $cheminsAbsolus
pandoc @cheminsDocx `
  --from=markdown+raw_html-tex_math_dollars `
  --to=docx `
  --standalone `
  --toc `
  --toc-depth=2 `
  --metadata title="Manuel professionnel d'Administration Systeme et Infrastructure" `
  --metadata author="Jaslin Occius" `
  --output="$docxOutPandoc"
if ($LASTEXITCODE -ne 0) { throw "Echec de la generation DOCX (pandoc)" }

Write-Output "DOCX genere : $docxOut"

# --- PDF via Edge pilote par Puppeteer (pied de page personnalise, pas d'en-tete date/URL) ---
$nodeScript = Join-Path $root "print-pdf.js"
if (Test-Path $nodeScript) {
  node "$nodeScript" "$htmlOut" "$pdfOut" "Jaslin Occius - Manuel Administration Systeme"
} else {
  Write-Output "print-pdf.js introuvable, PDF non genere."
}
