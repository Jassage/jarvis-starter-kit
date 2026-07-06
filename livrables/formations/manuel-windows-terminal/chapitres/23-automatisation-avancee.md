<div class="chapitre-titre-num">CHAPITRE 23</div>

# Automatisation avancée : modules, profils et remoting

## Objectifs pédagogiques

Créer ses propres modules PowerShell réutilisables, personnaliser l'environnement via le profil PowerShell, et exécuter des commandes sur des machines distantes avec PowerShell Remoting.

## Prérequis

Chapitres 9-22.

## 23.1 Créer un module PowerShell personnel

<div class="encadre astuce">
<span class="encadre-titre">💡 Un module, c'est simplement un fichier .psm1 contenant des fonctions exportées</span>
Exactement comme un module Node.js exporte des fonctions via `module.exports` (rappel du manuel Node.js de cette même collection), un module PowerShell regroupe des fonctions réutilisables dans un fichier `.psm1`, importable depuis n'importe quel script ou session.
</div>

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

## 23.2 Manifeste de module (.psd1)

```powershell
New-ModuleManifest -Path "C:\Modules\MonModule\MonModule.psd1" `
    -RootModule "MonModule.psm1" `
    -ModuleVersion "1.0.0" `
    -Author "Jaslin Occius" `
    -Description "Fonctions utilitaires personnelles"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le manifeste (.psd1) documente et versionne le module</span>
Un manifeste permet à `Get-Module -ListAvailable` d'afficher la version, l'auteur et la description du module — indispensable dès qu'un module est partagé avec d'autres personnes ou publié (section 23.3).
</div>

## 23.3 Installer un module depuis la PowerShell Gallery

```powershell
Find-Module -Name "Az" -Repository PSGallery
Install-Module -Name "Az" -Scope CurrentUser

Get-InstalledModule
Update-Module -Name "Az"
Uninstall-Module -Name "Az"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 PowerShell Gallery : l'équivalent npm/PyPI pour PowerShell</span>
Rappel direct de `npm install` (manuel Node.js) : `Install-Module` télécharge et installe un module depuis un registre public communautaire, `-Scope CurrentUser` évitant de nécessiter des droits administrateur pour un usage personnel.
</div>

## 23.4 Le profil PowerShell : personnaliser sa session

```powershell
$PROFILE                    # chemin du fichier de profil de la session actuelle
Test-Path $PROFILE          # existe-t-il déjà ?
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
Tout ce qui est placé dans `$PROFILE` (alias, fonctions, personnalisation du prompt, modules importés) devient disponible **automatiquement** dans chaque nouvelle fenêtre PowerShell — l'équivalent du `.bashrc`/`.zshrc` du monde Unix.
</div>

## 23.5 PowerShell Remoting : exécuter des commandes à distance

```powershell
Enable-PSRemoting -Force     # à exécuter SUR la machine distante, une seule fois

Test-WSMan -ComputerName "SERVEUR01"    # vérifie que le remoting est actif
```

```powershell
Invoke-Command -ComputerName "SERVEUR01" -ScriptBlock { Get-Service | Where-Object Status -eq "Running" }

Invoke-Command -ComputerName "SERVEUR01", "SERVEUR02" -ScriptBlock { Get-CimInstance Win32_OperatingSystem } -Credential (Get-Credential)
```

## 23.6 Sessions persistantes (PSSession)

```powershell
$session = New-PSSession -ComputerName "SERVEUR01"

Invoke-Command -Session $session -ScriptBlock { $global:compteur = 0 }
Invoke-Command -Session $session -ScriptBlock { $global:compteur++; $global:compteur }   # état conservé entre appels !

Enter-PSSession -Session $session    # bascule en mode interactif, comme un SSH
Exit-PSSession

Remove-PSSession $session
```

<div class="encadre astuce">
<span class="encadre-titre">💡 New-PSSession vs Invoke-Command direct : état conservé ou non</span>
`Invoke-Command -ComputerName X` ouvre et ferme une connexion à **chaque appel** (pas de mémoire entre deux commandes). `New-PSSession` maintient une connexion persistante, dans laquelle des variables ou modules chargés restent disponibles d'un appel à l'autre — utile pour un script complexe en plusieurs étapes sur la même machine distante.
</div>

## 23.7 Exécuter sur plusieurs machines en parallèle

```powershell
$machines = @("SERVEUR01", "SERVEUR02", "SERVEUR03")

Invoke-Command -ComputerName $machines -ScriptBlock {
    Get-CimInstance Win32_OperatingSystem | Select-Object Caption
} -ThrottleLimit 10
```

## 23.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier Export-ModuleMember : les fonctions du module restent invisibles</span>
Sans `Export-ModuleMember -Function ...` en fin de fichier `.psm1`, PowerShell 5.1 peut ne rendre visible qu'un sous-ensemble des fonctions (ou toutes, selon la configuration) — expliciter systématiquement les fonctions exportées évite toute ambiguïté et documente clairement l'API publique du module.
</div>

## 23.9 Bonnes pratiques

- Toujours inclure un manifeste (`.psd1`) pour tout module destiné à être réutilisé ou partagé.
- Documenter clairement les fonctions exportées via `Export-ModuleMember`, plutôt que de tout exposer implicitement.
- Fermer proprement (`Remove-PSSession`) toute session distante persistante en fin de script.

## 23.10 Résumé du chapitre

- Un module PowerShell (`.psm1` + `.psd1`) regroupe des fonctions réutilisables, installable localement ou publiable sur PowerShell Gallery.
- Le profil PowerShell (`$PROFILE`) personnalise automatiquement chaque nouvelle session (alias, fonctions, prompt).
- `Invoke-Command`/`New-PSSession` exécutent des commandes sur une ou plusieurs machines distantes via WinRM.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 23.1</span>

Crée un module contenant une fonction `Get-InfoSysteme` qui affiche le nom de la machine, la version de l'OS et l'espace disque libre du lecteur C:.
</div>

**Corrigé :**
```powershell
function Get-InfoSysteme {
    $os = Get-CimInstance Win32_OperatingSystem
    $disque = Get-Volume -DriveLetter C
    [PSCustomObject]@{
        Machine    = $env:COMPUTERNAME
        OS         = $os.Caption
        LibreGoC   = [math]::Round($disque.SizeRemaining / 1GB, 2)
    }
}
Export-ModuleMember -Function Get-InfoSysteme
```

*Chapitre suivant : PowerShell et le cloud, avec une introduction pratique à Azure.*
