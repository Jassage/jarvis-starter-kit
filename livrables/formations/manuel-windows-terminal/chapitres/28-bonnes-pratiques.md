<div class="chapitre-titre-num">CHAPITRE 28</div>

# Bonnes pratiques d'écriture de scripts professionnels

## Objectifs pédagogiques

Synthétiser les conventions de nommage, de structure et de style qui distinguent un script PowerShell amateur d'un script professionnel maintenable, avant d'aborder les projets complets du chapitre 29.

## Prérequis

Chapitres 1-27 (chapitre de synthèse).

## 28.1 Convention de nommage Verb-Noun

<div class="encadre astuce">
<span class="encadre-titre">💡 Toujours utiliser un verbe approuvé par Microsoft</span>
```powershell
Get-Verb    # affiche la liste complète des verbes approuvés (Get, Set, New, Remove, Test, Invoke...)
```
Une fonction nommée `Verifier-Utilisateur` (verbe français non approuvé) fonctionne techniquement, mais génère un avertissement lors du chargement en module et brise la cohérence de l'écosystème PowerShell — préférer `Test-Utilisateur`, cohérent avec `Test-Connection`, `Test-Path`, etc.
</div>

## 28.2 Structure standard d'un script professionnel

```powershell
<#
.SYNOPSIS
    Sauvegarde les fichiers d'un dossier vers une destination avec horodatage.
.DESCRIPTION
    Ce script compresse le contenu d'un dossier source et l'archive
    dans le dossier de destination, avec un nom de fichier horodaté.
.PARAMETER Source
    Chemin du dossier a sauvegarder.
.PARAMETER Destination
    Chemin du dossier ou stocker l'archive.
.EXAMPLE
    .\Sauvegarde.ps1 -Source "C:\Projets" -Destination "D:\Backups"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [ValidateScript({ Test-Path $_ })]
    [string]$Source,

    [Parameter(Mandatory=$true)]
    [string]$Destination
)

$ErrorActionPreference = "Stop"

function Backup-Dossier {
    param([string]$Source, [string]$Destination)

    $horodatage = Get-Date -Format "yyyy-MM-dd_HHmmss"
    $nomArchive = Join-Path $Destination "sauvegarde_$horodatage.zip"

    Compress-Archive -Path "$Source\*" -DestinationPath $nomArchive
    Write-Output "Sauvegarde creee : $nomArchive"
}

try {
    Backup-Dossier -Source $Source -Destination $Destination
} catch {
    Write-Error "Echec de la sauvegarde : $($_.Exception.Message)"
    exit 1
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le bloc d'aide comment-based (&lt;# .SYNOPSIS ... #&gt;) alimente Get-Help</span>
```powershell
Get-Help .\Sauvegarde.ps1 -Full
```
Ce bloc, placé en tête de script, rend `Get-Help` immédiatement fonctionnel sur le script lui-même — exactement comme pour une cmdlet native, sans documentation externe séparée à maintenir.
</div>

## 28.3 $ErrorActionPreference = "Stop" en tête de script

<div class="encadre astuce">
<span class="encadre-titre">💡 Éviter de répéter -ErrorAction Stop sur chaque commande</span>
Définir `$ErrorActionPreference = "Stop"` une seule fois en tête de script fait que **toutes** les erreurs deviennent terminantes par défaut, interceptables par `try/catch` (rappel du chapitre 27) — plus sûr qu'un oubli ponctuel de `-ErrorAction Stop` sur une commande isolée.
</div>

## 28.4 Validation systématique des entrées

```powershell
param(
    [Parameter(Mandatory=$true)]
    [ValidateScript({ Test-Path $_ -PathType Container })]
    [string]$DossierSource,

    [ValidateRange(1, 365)]
    [int]$JoursRetention = 30,

    [ValidateSet("Quotidien", "Hebdomadaire", "Mensuel")]
    [string]$Frequence = "Quotidien"
)
```

## 28.5 Éviter les valeurs codées en dur

```powershell
# Éviter
Copy-Item "C:\Users\Jaslin\Documents\rapport.docx" "D:\Backup\"    # ❌ chemin propre à une machine

# Préférer
param(
    [string]$CheminSource = (Join-Path $env:USERPROFILE "Documents\rapport.docx"),
    [string]$CheminDestination = "D:\Backup\"
)
```

## 28.6 Journalisation (logging) structurée

```powershell
function Write-Log {
    param(
        [string]$Message,
        [ValidateSet("INFO", "AVERTISSEMENT", "ERREUR")]
        [string]$Niveau = "INFO"
    )
    $ligne = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [$Niveau] $Message"
    Add-Content -Path "C:\Logs\script.log" -Value $ligne
    Write-Output $ligne
}

Write-Log -Message "Debut du traitement" -Niveau INFO
Write-Log -Message "Fichier introuvable, ignore" -Niveau AVERTISSEMENT
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un log persistant est indispensable pour tout script automatisé (tâche planifiée)</span>
Un script lancé interactivement affiche ses erreurs directement à l'écran ; le même script lancé via une tâche planifiée (chapitre 15) à 2h du matin n'a personne pour lire cet écran — un fichier de log persistant est la seule façon de diagnostiquer un échec après coup.
</div>

## 28.7 Découper un script complexe en modules

<div class="encadre astuce">
<span class="encadre-titre">💡 Un script de plus de 100-150 lignes mérite d'être découpé</span>
Rappel du chapitre 23 : extraire les fonctions réutilisables dans un module (`.psm1`) séparé du script principal facilite les tests, la réutilisation dans d'autres scripts, et la lisibilité globale — un script principal devient alors une courte séquence d'appels à des fonctions bien nommées.
</div>

## 28.8 Checklist avant de livrer un script

- [ ] Bloc d'aide comment-based présent (SYNOPSIS, DESCRIPTION, PARAMETER, EXAMPLE).
- [ ] `[CmdletBinding()]` présent, verbes de fonctions approuvés (`Get-Verb`).
- [ ] `$ErrorActionPreference = "Stop"` et gestion `try/catch` des erreurs critiques.
- [ ] Paramètres validés (`ValidateSet`, `ValidateRange`, `ValidateScript`) plutôt que du texte libre non vérifié.
- [ ] Aucun chemin ni identifiant codé en dur.
- [ ] Journalisation en place si le script est destiné à l'automatisation non surveillée.
- [ ] Testé avec des entrées invalides, pas seulement le "chemin heureux".

## 28.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un script qui fonctionne "chez moi" mais pas ailleurs</span>
La cause la plus fréquente : des chemins codés en dur propres à la machine de développement (section 28.5). Un script professionnel doit fonctionner sur n'importe quelle machine respectant ses paramètres déclarés, sans dépendance implicite à un nom d'utilisateur ou une arborescence spécifique.
</div>

## 28.10 Résumé du chapitre

- La convention Verb-Noun (vérifiée via `Get-Verb`) et le bloc d'aide comment-based rendent un script cohérent avec l'écosystème PowerShell natif.
- `$ErrorActionPreference = "Stop"` + `try/catch` structurent une gestion d'erreurs fiable dès l'en-tête du script.
- La validation systématique des paramètres, l'absence de valeurs codées en dur, et une journalisation persistante distinguent un script professionnel d'un script jetable.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 28.1</span>

Reprends la fonction `Get-InventaireMachine` du chapitre 20 et transforme-la en script professionnel complet : bloc d'aide, `[CmdletBinding()]`, gestion d'erreur, journalisation.
</div>

**Corrigé :**
```powershell
<#
.SYNOPSIS
    Genere un inventaire materiel de la machine locale.
.EXAMPLE
    .\Get-Inventaire.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

function Write-Log {
    param([string]$Message)
    Add-Content -Path "C:\Logs\inventaire.log" -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
}

try {
    Write-Log "Debut de la generation d'inventaire"
    $os = Get-CimInstance Win32_OperatingSystem
    $systeme = Get-CimInstance Win32_ComputerSystem
    [PSCustomObject]@{
        Machine = $systeme.Name
        OS      = $os.Caption
        RAM_Go  = [math]::Round($systeme.TotalPhysicalMemory / 1GB, 2)
    }
    Write-Log "Inventaire genere avec succes"
} catch {
    Write-Log "ERREUR : $($_.Exception.Message)"
    throw
}
```

*Chapitre suivant : dix projets complets, mettant en pratique l'ensemble des notions de ce manuel.*
