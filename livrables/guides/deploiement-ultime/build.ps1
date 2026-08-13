# Build du Guide Ultime du Deploiement : assemble les parties Markdown et genere HTML + PDF + DOCX.
# Usage : powershell -File build.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$cssPath = Join-Path $root "assets\style.css"
$couverturePath = Join-Path $root "assets\couverture.md"
$couvertureFragmentPath = Join-Path $root "assets\cover-fragment.html"
$partiesRenduesDir = Join-Path $root ".tmp-encadres\parties"
$exportDir = Join-Path $root "export"

# --- Pre-rendu des encadres pedagogiques (blockquote -> <div class="encadre">), voir render-encadres.js ---
# Meme principe que render-mermaid.js du manuel Node.js : les fichiers sources (00-*.md a 12-*.md)
# ne sont jamais modifies, une copie prete pour pandoc est ecrite dans .tmp-encadres/parties.
Write-Output "Rendu des encadres pedagogiques..."
node (Join-Path $root "render-encadres.js") "$root" "$partiesRenduesDir"
if ($LASTEXITCODE -ne 0) { throw "Echec du rendu des encadres (render-encadres.js)" }

New-Item -ItemType Directory -Force -Path $exportDir | Out-Null

# Seules les parties numerotees (00-avant-propos.md a 12-etudes-de-cas.md) composent le livre —
# README.md (sommaire du depot) en est volontairement exclu.
# Note : Get-ChildItem -Filter ne supporte pas fiablement les classes [0-9], d'ou le Where-Object.
$fichiers = @(Get-ChildItem $partiesRenduesDir -Filter "*.md" | Where-Object { $_.Name -match '^\d{2}-' } | Sort-Object Name)
Write-Output "Parties assemblees ($($fichiers.Count)) :"
$fichiers | ForEach-Object { Write-Output " - $($_.Name)" }

$cheminsAbsolus = $fichiers | ForEach-Object { $_.FullName }

$htmlOut = Join-Path $exportDir "guide-ultime-deploiement.html"
$docxOut = Join-Path $exportDir "guide-ultime-deploiement.docx"
$pdfOut  = Join-Path $exportDir "guide-ultime-deploiement.pdf"

# --- HTML autonome (couverture injectee AVANT le sommaire auto-genere par pandoc) ---
pandoc @cheminsAbsolus `
  --from=markdown+raw_html-tex_math_dollars `
  --to=html5 `
  --syntax-highlighting=breezedark `
  --standalone `
  --toc `
  --toc-depth=2 `
  --include-before-body="$couvertureFragmentPath" `
  --metadata pagetitle="Le Guide Ultime du Deploiement" `
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
  --metadata title="Le Guide Ultime du Deploiement" `
  --metadata author="Jaslin Occius" `
  --output="$docxOut"

Write-Output "DOCX genere : $docxOut"

# --- PDF via Edge pilote par Puppeteer (pied de page personnalise, pas d'en-tete date/URL) ---
$nodeScript = Join-Path $root "print-pdf.js"
if (Test-Path $nodeScript) {
  node "$nodeScript" "$htmlOut" "$pdfOut" "Jaslin Occius - Le Guide Ultime du Deploiement"
} else {
  Write-Output "print-pdf.js introuvable, PDF non genere."
}
