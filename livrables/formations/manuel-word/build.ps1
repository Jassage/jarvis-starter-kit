# Build du manuel Word : assemble les chapitres Markdown et genere HTML + PDF + DOCX.
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

# --- Pre-rendu des diagrammes Mermaid en PNG (voir render-mermaid.js) ---
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

$htmlOut = Join-Path $exportDir "manuel-word.html"
$docxOut = Join-Path $exportDir "manuel-word.docx"
$pdfOut  = Join-Path $exportDir "manuel-word.pdf"

# Execute pandoc avec un retry unique : sur cette machine, lire un fichier fraichement
# (re)ecrit dans .tmp-mermaid\ echoue parfois au tout premier essai avec une erreur runtime
# Haskell ("<chemin>: withBinaryFile: does not exist"), transitoire (verrou OneDrive/antivirus
# sur un fichier tout juste ecrit) — un second essai immediat reussit systematiquement.
# pandoc etant un exe natif, $ErrorActionPreference="Stop" ne l'arrete pas tout seul : on
# verifie donc $LASTEXITCODE explicitement.
function Invoke-PandocAvecRetry {
  param([string[]]$PandocArgs, [string]$Label)
  & pandoc @PandocArgs
  if ($LASTEXITCODE -ne 0) {
    Write-Output "$Label : premier essai pandoc echoue (erreur transitoire probable), nouvelle tentative..."
    Start-Sleep -Seconds 2
    & pandoc @PandocArgs
    if ($LASTEXITCODE -ne 0) { throw "$Label : echec pandoc apres 2 tentatives" }
  }
}

# --- HTML autonome (couverture injectee AVANT le sommaire auto-genere par pandoc) ---
# "-tex_math_dollars" : desactive l'interpretation des "$" comme delimiteurs de formules LaTeX
$argsHtml = @(
  $cheminsAbsolus
  "--from=markdown+raw_html-tex_math_dollars"
  "--to=html5"
  "--syntax-highlighting=breezedark"
  "--standalone"
  "--toc"
  "--toc-depth=2"
  "--include-before-body=$couvertureFragmentPath"
  "--metadata", "pagetitle=Manuel de reference Microsoft Word"
  "--metadata", "author=Jaslin Occius"
  "--metadata", "toc-title=Table des matieres"
  "--css=$cssPath"
  "--embed-resources"
  "--output=$htmlOut"
)
Invoke-PandocAvecRetry -PandocArgs $argsHtml -Label "HTML"

Write-Output "HTML genere : $htmlOut"

# --- DOCX (Word, table des matieres native Word incluse) ---
$cheminsDocx = @($couverturePath) + $cheminsAbsolus
$argsDocx = @(
  $cheminsDocx
  "--from=markdown+raw_html-tex_math_dollars"
  "--to=docx"
  "--standalone"
  "--toc"
  "--toc-depth=2"
  "--metadata", "title=Manuel de reference Microsoft Word"
  "--metadata", "author=Jaslin Occius"
  "--output=$docxOut"
)
Invoke-PandocAvecRetry -PandocArgs $argsDocx -Label "DOCX"

Write-Output "DOCX genere : $docxOut"

# --- PDF via Edge pilote par Puppeteer (pied de page personnalise, pas d'en-tete date/URL) ---
$nodeScript = Join-Path $root "print-pdf.js"
if (Test-Path $nodeScript) {
  node "$nodeScript" "$htmlOut" "$pdfOut" "Jaslin Occius - Manuel Microsoft Word"
} else {
  Write-Output "print-pdf.js introuvable, PDF non genere."
}
