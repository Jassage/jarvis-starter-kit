# Build du manuel Node.js : assemble les chapitres Markdown et genere HTML + PDF + DOCX.
# Usage : powershell -File build.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$chapitresDir = Join-Path $root "chapitres"
$exportDir = Join-Path $root "export"
$cssPath = Join-Path $root "assets\style.css"
$couverturePath = Join-Path $root "assets\couverture.md"
$couvertureFragmentPath = Join-Path $root "assets\cover-fragment.html"
$diagramsDir = Join-Path $root "assets\diagrams"
$chapitresRendusDir = Join-Path $root ".tmp-mermaid\chapitres"

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

$cheminsAbsolus = $fichiers | ForEach-Object { $_.FullName }

$htmlOut = Join-Path $exportDir "manuel-nodejs.html"
$docxOut = Join-Path $exportDir "manuel-nodejs.docx"
$pdfOut  = Join-Path $exportDir "manuel-nodejs.pdf"

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
  --metadata pagetitle="Manuel complet Node.js et Express" `
  --metadata author="Jaslin Occius" `
  --metadata toc-title="Table des matieres" `
  --css="$cssPath" `
  --embed-resources `
  --output="$htmlOut"

Write-Output "HTML genere : $htmlOut"

# --- DOCX (Word, table des matieres native Word incluse) ---
$cheminsDocx = @($couverturePath) + $cheminsAbsolus
pandoc @cheminsDocx `
  --from=markdown+raw_html-tex_math_dollars `
  --to=docx `
  --standalone `
  --toc `
  --toc-depth=2 `
  --metadata title="Manuel complet Node.js et Express" `
  --metadata author="Jaslin Occius" `
  --output="$docxOut"

Write-Output "DOCX genere : $docxOut"

# --- PDF via Edge pilote par Puppeteer (pied de page personnalise, pas d'en-tete date/URL) ---
$nodeScript = Join-Path $root "print-pdf.js"
if (Test-Path $nodeScript) {
  node "$nodeScript" "$htmlOut" "$pdfOut" "Jaslin Occius - Manuel Node.js"
} else {
  Write-Output "print-pdf.js introuvable, PDF non genere."
}
