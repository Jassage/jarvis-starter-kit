<div class="chapitre-titre-num">CHAPITRE 24</div>

# Modules, manifestes et profil PowerShell

## 🎯 Objectifs

Regrouper des fonctions réutilisables dans un module `.psm1`, le documenter avec un manifeste `.psd1`, installer un module depuis la PowerShell Gallery, et personnaliser sa session avec `$PROFILE`.

## Prérequis

Chapitre 16 (fonctions), 23.

## 🧠 Comprendre : ne pas réécrire ses outils à chaque script

**Le problème.** Les fonctions utiles écrites au fil des chapitres précédents (`Test-EmailValide`, `Get-InventaireMachine`, `Backup-Dossier`...) sont, pour l'instant, coincées dans le script où elles ont été écrites. Il faut un moyen de les rendre disponibles partout, sans copier-coller.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Un **module** est une boîte à outils personnelle que tu emmènes d'un chantier à l'autre : au lieu de fabriquer un nouveau marteau à chaque fois, tu ouvres la boîte et tu réutilises celui déjà là.
</div>

## 💻 Démonstration : créer un module minimal

```powershell
# MonModule.psm1
function Get-SalutationPerso {
    param([string]$Nom)
    Write-Output "Bonjour $Nom, bienvenue dans ton module personnel !"
}

function Get-EspaceDisqueLibre {
    Get-Volume | Select-Object DriveLetter, @{N="LibreGo";E={[math]::Round($_.SizeRemaining/1GB,2)}}
}

Export-ModuleMember -Function Get-SalutationPerso, Get-EspaceDisqueLibre
```

```powershell
Import-Module "C:\Modules\MonModule.psm1"
Get-SalutationPerso -Nom "Jaslin"
```

## 🔍 Décortiquons

Un fichier `.psm1` est un simple script PowerShell, à la différence près qu'il se **charge** via `Import-Module` plutôt que de s'exécuter directement. `Export-ModuleMember -Function ...` liste explicitement quelles fonctions deviennent visibles depuis l'extérieur du module.

<div class="encadre astuce">
<span class="encadre-titre">💡 Export-ModuleMember contrôle ce qui devient public</span>
Sans `Export-ModuleMember`, toutes les fonctions d'un module sont exportées par défaut. En listant explicitement les fonctions à exporter, on peut garder des fonctions "privées" (utilitaires internes au module) totalement invisibles depuis l'extérieur.
</div>

## 24.1 Manifeste de module (.psd1)

```powershell
New-ModuleManifest -Path "C:\Modules\MonModule\MonModule.psd1" `
    -RootModule "MonModule.psm1" `
    -ModuleVersion "1.0.0" `
    -Author "Jaslin Occius" `
    -Description "Fonctions utilitaires personnelles"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le manifeste documente et versionne le module</span>
Un manifeste permet à `Get-Module -ListAvailable` d'afficher la version, l'auteur et la description du module — indispensable dès qu'un module est partagé avec d'autres personnes ou publié (section 24.2).
</div>

## 24.2 Installer un module depuis la PowerShell Gallery

```powershell
Find-Module -Name "Az" -Repository PSGallery
Install-Module -Name "Az" -Scope CurrentUser

Get-InstalledModule
Update-Module -Name "Az"
Uninstall-Module -Name "Az"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 PowerShell Gallery : un registre communautaire de modules</span>
`Install-Module` télécharge et installe un module depuis un registre public communautaire, comme on installerait une bibliothèque logicielle dans d'autres langages. `-Scope CurrentUser` évite de nécessiter des droits administrateur pour un usage personnel.
</div>

## 24.3 Le profil PowerShell : personnaliser sa session

```powershell
$PROFILE                    ← chemin du fichier de profil de la session actuelle
Test-Path $PROFILE          ← existe-t-il deja ?
New-Item -Path $PROFILE -ItemType File -Force
notepad $PROFILE
```

```powershell
# Contenu type d'un profil personnel
Set-Alias -Name ll -Value Get-ChildItem
function prompt {
    "PS [$(Get-Date -Format 'HH:mm')] $(Get-Location) > "
}
Import-Module MonModule
Write-Host "Session PowerShell chargée pour Jaslin." -ForegroundColor Green
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le profil se recharge automatiquement à chaque nouvelle session</span>
Tout ce qui est placé dans `$PROFILE` (alias, fonctions, personnalisation du prompt, modules importés) devient disponible **automatiquement** dans chaque nouvelle fenêtre PowerShell — pas besoin de le retaper à chaque ouverture.
</div>

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier Export-ModuleMember : les fonctions du module restent invisibles</span>
Sans `Export-ModuleMember -Function ...` en fin de fichier `.psm1`, la visibilité des fonctions peut devenir ambiguë selon la configuration — expliciter systématiquement les fonctions exportées évite toute ambiguïté et documente clairement l'API publique du module.
</div>

## Bonnes pratiques

- Toujours inclure un manifeste (`.psd1`) pour tout module destiné à être réutilisé ou partagé.
- Documenter clairement les fonctions exportées via `Export-ModuleMember`, plutôt que de tout exposer implicitement.
- Regrouper dans `$PROFILE` uniquement des personnalisations légères — un module séparé reste préférable pour de la vraie logique métier.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 24.1</span>

Crée un module contenant une fonction `Get-InfoSysteme` qui affiche le nom de la machine, la version de l'OS et l'espace disque libre du lecteur `C:`.
</div>

**✅ Correction.**
```powershell
function Get-InfoSysteme {
    $os = Get-CimInstance Win32_OperatingSystem
    $disque = Get-Volume -DriveLetter C
    [PSCustomObject]@{
        Machine  = $env:COMPUTERNAME
        OS       = $os.Caption
        LibreGoC = [math]::Round($disque.SizeRemaining / 1GB, 2)
    }
}
Export-ModuleMember -Function Get-InfoSysteme
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 24.2</span>

Ajoute à ton profil PowerShell un alias `backup` pointant vers ta fonction `Backup-Dossier` du chapitre 23, et un message de bienvenue affiché à chaque ouverture de session.
</div>

**✅ Correction.**
```powershell
# Dans $PROFILE
Import-Module "C:\Modules\Outils.psm1"
Set-Alias -Name backup -Value Backup-Dossier
Write-Host "Bienvenue Jaslin — outils personnels chargés." -ForegroundColor Cyan
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 24.3</span>

Regroupe les fonctions des chapitres 17 à 23 (`Watch-ProcessusGourmands`, `Test-ServicesCritiques`, `Get-InventaireMachine`, `Backup-Dossier`, `Clear-FichiersTemporaires`, `Watch-EspaceDisque`) dans un seul module `AdminToolkit.psm1`, avec un manifeste.
</div>

**✅ Correction du défi.**
```powershell
# AdminToolkit.psm1 : coller les six fonctions ici, puis :
Export-ModuleMember -Function Watch-ProcessusGourmands, Test-ServicesCritiques, Get-InventaireMachine, `
    Backup-Dossier, Clear-FichiersTemporaires, Watch-EspaceDisque
```
```powershell
New-ModuleManifest -Path "C:\Modules\AdminToolkit\AdminToolkit.psd1" `
    -RootModule "AdminToolkit.psm1" -ModuleVersion "1.0.0" -Author "Jaslin Occius" `
    -Description "Boîte à outils d'administration Windows personnelle"
```
Ce module devient la base directe du chapitre 38 (Projet 9 — Module PowerShell personnel), qui l'enrichira encore.

## 🎯 Ce que tu sais maintenant

- Un module PowerShell (`.psm1` + `.psd1`) regroupe des fonctions réutilisables, installable localement ou publiable sur la PowerShell Gallery.
- `Export-ModuleMember` contrôle précisément quelles fonctions deviennent publiques.
- Le profil PowerShell (`$PROFILE`) personnalise automatiquement chaque nouvelle session (alias, fonctions, prompt, modules importés).

*Chapitre suivant : administrer une machine à distance avec PowerShell Remoting.*
