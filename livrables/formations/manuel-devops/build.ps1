# Build du manuel DevOps : assemble les chapitres Markdown et genere HTML + PDF + DOCX.
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

# --- Pre-rendu des diagrammes Mermaid en PNG (voir render-mermaid.js) ---
Write-Output "Rendu des diagrammes Mermaid..."
node (Join-Path $root "render-mermaid.js") "$chapitresDir" "$chapitresRendusDir" "$diagramsDir"
if ($LASTEXITCODE -ne 0) { throw "Echec du rendu Mermaid (render-mermaid.js)" }

New-Item -ItemType Directory -Force -Path $exportDir | Out-Null

$fichiers = @(Get-ChildItem $chapitresRendusDir -Filter "*.md" | Sort-Object Name)
Write-Output "Chapitres assembles ($($fichiers.Count)) :"
$fichiers | ForEach-Object { Write-Output " - $($_.Name)" }

$cheminsAbsolus = @($fichiers | ForEach-Object { ".tmp-mermaid/chapitres/$($_.Name)" })

$htmlOut = Join-Path $exportDir "manuel-devops.html"
$docxOut = Join-Path $exportDir "manuel-devops.docx"
$pdfOut  = Join-Path $exportDir "manuel-devops.pdf"
$htmlOutPandoc = "export/manuel-devops.html"
$docxOutPandoc = "export/manuel-devops.docx"

# --- HTML autonome (couverture injectee AVANT le sommaire auto-genere par pandoc) ---
# "-tex_math_dollars" : desactive l'interpretation des "$" comme delimiteurs de formules LaTeX
# (sinon des variables shell comme "$HOME"/"$PATH" seraient prises a tort pour des maths).
pandoc @cheminsAbsolus `
  --from=markdown+raw_html-tex_math_dollars `
  --to=html5 `
  --syntax-highlighting=breezedark `
  --standalone `
  --toc `
  --toc-depth=2 `
  --include-before-body="$couvertureFragmentPath" `
  --metadata pagetitle="DevOps de A a Z" `
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
  --metadata title="DevOps de A a Z" `
  --metadata author="Jaslin Occius" `
  --output="$docxOutPandoc"
if ($LASTEXITCODE -ne 0) { throw "Echec de la generation DOCX (pandoc)" }

Write-Output "DOCX genere : $docxOut"

# --- PDF via Edge pilote par Puppeteer (pied de page personnalise, pas d'en-tete date/URL) ---
$nodeScript = Join-Path $root "print-pdf.js"
if (Test-Path $nodeScript) {
  node "$nodeScript" "$htmlOut" "$pdfOut" "Jaslin Occius - DevOps de A a Z"
} else {
  Write-Output "print-pdf.js introuvable, PDF non genere."
}
