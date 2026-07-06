# Build du manuel React : assemble les chapitres Markdown et genere HTML + PDF + DOCX.
# Usage : powershell -File build.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$chapitresDir = Join-Path $root "chapitres"
$exportDir = Join-Path $root "export"
$cssPath = Join-Path $root "assets\style.css"
$couverturePath = Join-Path $root "assets\couverture.md"
$couvertureFragmentPath = Join-Path $root "assets\cover-fragment.html"

New-Item -ItemType Directory -Force -Path $exportDir | Out-Null

# Chapitres numeriques (la couverture vit a part, dans assets/, pour ne pas etre comptee
# dans la table des matieres ni se retrouver apres elle)
$fichiers = @(Get-ChildItem $chapitresDir -Filter "*.md" | Sort-Object Name)
Write-Output "Chapitres assembles ($($fichiers.Count)) :"
$fichiers | ForEach-Object { Write-Output " - $($_.Name)" }

$cheminsAbsolus = $fichiers | ForEach-Object { $_.FullName }

$htmlOut = Join-Path $exportDir "manuel-react.html"
$docxOut = Join-Path $exportDir "manuel-react.docx"
$pdfOut  = Join-Path $exportDir "manuel-react.pdf"

# --- HTML autonome ---
# La couverture est injectee via --include-before-body : elle passe AVANT le titre/sommaire
# auto-genere par pandoc (qui s'insere toujours juste avant le corps du document).
# --metadata pagetitle (au lieu de "title") renseigne l'onglet du navigateur SANS déclencher
# le bandeau de titre visible de pandoc, qui dupliquerait notre couverture.
pandoc @cheminsAbsolus `
  --from=markdown+raw_html `
  --to=html5 `
  --syntax-highlighting=breezedark `
  --standalone `
  --toc `
  --toc-depth=2 `
  --include-before-body="$couvertureFragmentPath" `
  --metadata pagetitle="Manuel complet React" `
  --metadata author="Jaslin Occius" `
  --metadata toc-title="Table des matieres" `
  --css="$cssPath" `
  --embed-resources `
  --output="$htmlOut"

Write-Output "HTML genere : $htmlOut"

# --- DOCX (Word, table des matieres native Word incluse) ---
# La couverture est ici un vrai chapitre Markdown en tete de liste (docx ignore de toute
# facon le style CSS des div, seul le texte structure compte).
$cheminsDocx = @($couverturePath) + $cheminsAbsolus
pandoc @cheminsDocx `
  --from=markdown+raw_html `
  --to=docx `
  --standalone `
  --toc `
  --toc-depth=2 `
  --metadata title="Manuel complet React" `
  --metadata author="Jaslin Occius" `
  --output="$docxOut"

Write-Output "DOCX genere : $docxOut"

# --- PDF via Edge pilote par Puppeteer (pied de page personnalise, pas d'en-tete date/URL) ---
$nodeScript = Join-Path $root "print-pdf.js"
if (Test-Path $nodeScript) {
  node "$nodeScript" "$htmlOut" "$pdfOut" "Jaslin Occius - Manuel React"
} else {
  Write-Output "print-pdf.js introuvable, PDF non genere."
}
