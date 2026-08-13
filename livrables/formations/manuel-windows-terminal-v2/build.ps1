# Build du manuel Windows Terminal/CMD/PowerShell V2 : assemble les chapitres Markdown et genere HTML + PDF + DOCX.
# Usage : powershell -File build.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$chapitresDir = Join-Path $root "chapitres"
$exportDir = Join-Path $root "export"
$cssPath = Join-Path $root "assets\style.css"
$couverturePath = Join-Path $root "assets\couverture.md"
$couvertureFragmentPath = Join-Path $root "assets\cover-fragment.html"

New-Item -ItemType Directory -Force -Path $exportDir | Out-Null

$fichiers = @(Get-ChildItem $chapitresDir -Filter "*.md" | Sort-Object Name)
Write-Output "Chapitres assembles ($($fichiers.Count)) :"
$fichiers | ForEach-Object { Write-Output " - $($_.Name)" }

$cheminsAbsolus = $fichiers | ForEach-Object { $_.FullName }

$htmlOut = Join-Path $exportDir "manuel-windows-terminal-v2.html"
$docxOut = Join-Path $exportDir "manuel-windows-terminal-v2.docx"
$pdfOut  = Join-Path $exportDir "manuel-windows-terminal-v2.pdf"

# --- HTML autonome (couverture injectee AVANT le sommaire auto-genere par pandoc) ---
# "-tex_math_dollars" : desactive l'interpretation des "$" comme delimiteurs de formules LaTeX
# (indispensable ici : $env:PATH, $_, $PSVersionTable... contiennent des "$" a la pelle en PowerShell)
pandoc @cheminsAbsolus `
  --from=markdown+raw_html-tex_math_dollars `
  --to=html5 `
  --syntax-highlighting=breezedark `
  --standalone `
  --toc `
  --toc-depth=2 `
  --include-before-body="$couvertureFragmentPath" `
  --metadata pagetitle="Windows Terminal et PowerShell - De zero a administrateur (V2)" `
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
  --metadata title="Windows Terminal et PowerShell - De zero a administrateur (V2)" `
  --metadata author="Jaslin Occius" `
  --output="$docxOut"

Write-Output "DOCX genere : $docxOut"

# --- PDF via Edge pilote par Puppeteer (pied de page personnalise, pas d'en-tete date/URL) ---
$nodeScript = Join-Path $root "print-pdf.js"
if (Test-Path $nodeScript) {
  node "$nodeScript" "$htmlOut" "$pdfOut" "Jaslin Occius - Windows Terminal et PowerShell V2"
} else {
  Write-Output "print-pdf.js introuvable, PDF non genere."
}
