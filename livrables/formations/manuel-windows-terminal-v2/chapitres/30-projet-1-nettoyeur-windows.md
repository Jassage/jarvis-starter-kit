<div class="chapitre-titre-num">CHAPITRE 30</div>

# Projet 1 — Nettoyeur Windows

## 🎯 Objectifs

Construire un outil complet et sûr de nettoyage Windows, en suivant un vrai cycle de développement : cahier des charges, conception, développement progressif, tests, gestion d'erreurs, amélioration et documentation.

## Prérequis

Chapitres 11, 17, 23.

## 1. Cahier des charges

Un outil en ligne de commande qui :
- supprime les fichiers temporaires (`%TEMP%`) de plus de N jours ;
- vide la Corbeille ;
- signale (sans les supprimer automatiquement) les gros fichiers oubliés dans les Téléchargements ;
- produit un rapport avant/après (espace libéré) ;
- ne supprime **jamais** un fichier sans que l'utilisateur ait pu le prévoir (mode `-WhatIf` obligatoire).

## 2. Analyse

<div class="encadre astuce">
<span class="encadre-titre">💡 Le vrai risque de ce projet n'est pas technique, il est humain</span>
Techniquement, supprimer des fichiers est trivial (chapitre 11). Le vrai risque est de supprimer **le mauvais fichier** — d'où l'exigence explicite d'un mode simulation (`-WhatIf`) dans le cahier des charges, avant toute suppression réelle.
</div>

## 3. Conception

```{.uml}
Nettoyeur-Windows.ps1
  |
  +-- Get-EspaceLibreAvant     (mesure initiale)
  +-- Clear-FichiersTemporaires (chapitre 23, enrichie)
  +-- Clear-Corbeille
  +-- Find-GrosFichiersOublies  (signale, ne supprime pas)
  +-- Get-EspaceLibreApres      (mesure finale)
  +-- New-RapportNettoyage      (resume avant/apres)
```

## 4. Architecture : paramètres du script

```powershell
param(
    [int]$JoursAnciennete = 7,
    [double]$SeuilGrosFichierMo = 500,
    [switch]$WhatIf,
    [switch]$ViderCorbeille
)
```

## 5. Développement étape par étape

**Étape 1 — mesurer l'espace avant.**
```powershell
function Get-EspaceLibre {
    param([string]$Lettre = "C")
    (Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='${Lettre}:'").FreeSpace
}
$avant = Get-EspaceLibre
```

**Étape 2 — nettoyer les fichiers temporaires (reprend le chapitre 23), avec simulation.**
```powershell
function Clear-FichiersTemporaires {
    param([int]$JoursAnciennete = 7, [switch]$WhatIf)

    $seuil = (Get-Date).AddDays(-$JoursAnciennete)
    $fichiers = Get-ChildItem -Path $env:TEMP -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -lt $seuil }

    if ($WhatIf) {
        Write-Output "[SIMULATION] $($fichiers.Count) fichier(s) seraient supprimés."
        return
    }
    $fichiers | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Output "$($fichiers.Count) fichier(s) supprimés."
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Réutiliser -WhatIf, le même nom que les vraies cmdlets PowerShell</span>
De nombreuses cmdlets natives (`Remove-Item -WhatIf`, `Stop-Service -WhatIf`) proposent déjà ce paramètre en natif (via `[CmdletBinding(SupportsShouldProcess)]`). Nommer son propre paramètre `-WhatIf` respecte cette convention déjà connue de tout administrateur PowerShell.
</div>

**Étape 3 — vider la Corbeille (optionnel, explicite).**
```powershell
function Clear-Corbeille {
    param([switch]$WhatIf)
    if ($WhatIf) {
        Write-Output "[SIMULATION] La Corbeille serait vidée."
        return
    }
    Clear-RecycleBin -Confirm:$false -ErrorAction SilentlyContinue
}
```

**Étape 4 — signaler les gros fichiers, sans y toucher.**
```powershell
function Find-GrosFichiersOublies {
    param([double]$SeuilMo = 500)
    Get-ChildItem -Path "$env:USERPROFILE\Downloads" -File -ErrorAction SilentlyContinue |
        Where-Object { ($_.Length / 1MB) -gt $SeuilMo } |
        Select-Object Name, @{N="TailleMo";E={[math]::Round($_.Length/1MB,1)}}, LastWriteTime
}
```

**Étape 5 — assembler et rapporter.**
```powershell
function Invoke-NettoyageWindows {
    [CmdletBinding()]
    param(
        [int]$JoursAnciennete = 7,
        [double]$SeuilGrosFichierMo = 500,
        [switch]$WhatIf,
        [switch]$ViderCorbeille
    )

    $avant = Get-EspaceLibre
    Clear-FichiersTemporaires -JoursAnciennete $JoursAnciennete -WhatIf:$WhatIf
    if ($ViderCorbeille) { Clear-Corbeille -WhatIf:$WhatIf }

    $gros = Find-GrosFichiersOublies -SeuilMo $SeuilGrosFichierMo
    if ($gros) {
        Write-Output "`nFichiers volumineux à examiner manuellement dans Téléchargements :"
        $gros | Format-Table -AutoSize
    }

    if (-not $WhatIf) {
        $apres = Get-EspaceLibre
        $libere = [math]::Round(($apres - $avant) / 1MB, 1)
        Write-Output "`nEspace libéré : $libere Mo"
    }
}
```

## 6. Tests

```powershell
Invoke-NettoyageWindows -WhatIf                          # simulation, aucune suppression reelle
Invoke-NettoyageWindows -JoursAnciennete 30 -Verbose      # nettoyage reel, fichiers > 30 jours
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérification attendue</span>
En mode `-WhatIf`, aucune modification du système ne doit avoir lieu — vérifiable en comparant `Get-EspaceLibre` avant et après l'exécution simulée : la valeur doit être strictement identique.
</div>

## 7. Gestion des erreurs

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais laisser une erreur de permission interrompre tout le nettoyage</span>
`-ErrorAction SilentlyContinue` sur `Get-ChildItem`/`Remove-Item` (rappel du chapitre 29) évite qu'un seul fichier verrouillé par un autre programme ne stoppe l'intégralité du script — un nettoyeur doit continuer sur les fichiers accessibles plutôt que tout annuler pour un seul obstacle.
</div>

## 8. Amélioration (pistes non implémentées)

- Journaliser chaque exécution dans un fichier de log daté (rappel du chapitre 23).
- Ajouter un mode `-Planifie` qui s'enregistre lui-même comme tâche planifiée hebdomadaire (chapitre 23).
- Étendre `Find-GrosFichiersOublies` à d'autres dossiers connus (Bureau, Documents).

## 9. Documentation

```powershell
<#
.SYNOPSIS
    Nettoie les fichiers temporaires et la Corbeille, signale les gros fichiers oublies.
.PARAMETER JoursAnciennete
    Age minimal (en jours) d'un fichier temporaire pour etre supprime. Defaut : 7.
.PARAMETER WhatIf
    Simule l'execution sans rien supprimer reellement.
.EXAMPLE
    Invoke-NettoyageWindows -WhatIf
#>
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le commentaire d'aide alimente directement Get-Help</span>
Un bloc `<# .SYNOPSIS ... #>` placé juste avant une fonction (ou en tête de script) est automatiquement reconnu par `Get-Help Invoke-NettoyageWindows -Full` (chapitre 10) — la documentation devient interrogeable comme celle d'une vraie cmdlet native.
</div>

## 🎯 Ce que tu sais maintenant

- Un outil d'administration robuste inclut toujours un mode simulation (`-WhatIf`) avant toute action destructive.
- Assembler des fonctions déjà écrites dans les chapitres précédents (chapitre 23) en un outil cohérent et documenté est l'essence du travail d'administrateur système.
- La documentation intégrée (`.SYNOPSIS`, `.PARAMETER`, `.EXAMPLE`) rend un script utilisable par quelqu'un d'autre que son auteur.

*Chapitre suivant : Projet 2 — un inventaire système complet et exportable.*
