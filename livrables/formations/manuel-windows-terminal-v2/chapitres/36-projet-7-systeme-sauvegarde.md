<div class="chapitre-titre-num">CHAPITRE 36</div>

# Projet 7 — Système de sauvegarde

## 🎯 Objectifs

Construire un système de sauvegarde complet : miroir robocopy, rotation des anciennes sauvegardes, vérification post-sauvegarde, et intégration en tâche planifiée.

## Prérequis

Chapitres 6, 8, 23.

## 1. Cahier des charges

Un outil qui :
- sauvegarde un ou plusieurs dossiers sources vers une destination, en miroir ;
- conserve un historique daté, avec **rotation** (ne garde que les N dernières sauvegardes, pour ne pas remplir le disque) ;
- vérifie que la sauvegarde a réellement réussi (pas seulement "la commande s'est terminée") ;
- s'intègre à une tâche planifiée quotidienne.

## 2. Analyse

<div class="encadre astuce">
<span class="encadre-titre">💡 Une sauvegarde non vérifiée n'est pas une sauvegarde</span>
Le piège classique : un script de sauvegarde qui tourne "sans erreur visible" depuis des mois, mais dont personne n'a jamais vérifié qu'une restauration réelle fonctionnait. Ce projet inclut une étape de vérification explicite (comptage de fichiers, taille totale) après chaque sauvegarde, pas seulement le code de sortie de robocopy.
</div>

## 3. Conception

```{.uml}
Invoke-SauvegardeComplete -Sources -Destination -NombreVersions
  |
  +-- pour chaque source : robocopy /mir vers dossier date
  +-- Test-SauvegardeReussie (comparaison nombre de fichiers)
  +-- Remove-AnciennesSauvegardes (rotation)
  +-- rapport final + log
```

## 4. Architecture : la rotation

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : rotation de sauvegardes</span>
La **rotation** consiste à ne conserver qu'un nombre fixe de sauvegardes récentes, en supprimant automatiquement les plus anciennes — indispensable pour qu'une sauvegarde quotidienne ne finisse pas par remplir tout le disque de destination au bout de quelques mois (rappel du scénario "disque presque plein", chapitre 29).
</div>

## 5. Développement étape par étape

**Étape 1 — sauvegarde d'une source, avec journal robocopy.**
```powershell
function Backup-Source {
    param(
        [Parameter(Mandatory=$true)][string]$Source,
        [Parameter(Mandatory=$true)][string]$DossierCible
    )

    $logRobocopy = Join-Path $DossierCible "robocopy.log"
    robocopy $Source $DossierCible /mir /r:3 /w:5 /log:$logRobocopy | Out-Null

    [PSCustomObject]@{
        Source       = $Source
        Cible        = $DossierCible
        CodeRetour   = $LASTEXITCODE
        Reussi       = ($LASTEXITCODE -lt 8)
    }
}
```

**Étape 2 — vérification post-sauvegarde.**
```powershell
function Test-SauvegardeReussie {
    param([string]$Source, [string]$Cible)

    $nbSource = (Get-ChildItem -Path $Source -Recurse -File -ErrorAction SilentlyContinue).Count
    $nbCible  = (Get-ChildItem -Path $Cible -Recurse -File -ErrorAction SilentlyContinue).Count

    [PSCustomObject]@{
        FichiersSource = $nbSource
        FichiersCible  = $nbCible
        Coherent       = ($nbSource -eq $nbCible)
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi ne pas se fier qu'au code de sortie robocopy</span>
Le code de sortie de robocopy (rappel des chapitres 6/8/23) confirme que la commande s'est bien déroulée, mais pas que le **résultat final** est cohérent avec la source (un fichier verrouillé, ignoré silencieusement en pratique par certaines configurations, peut échapper au comptage d'erreurs). Comparer le nombre de fichiers source/cible est une vérification complémentaire, indépendante du code de sortie.
</div>

**Étape 3 — rotation des anciennes sauvegardes.**
```powershell
function Remove-AnciennesSauvegardes {
    param([string]$DossierParent, [int]$NombreAConserver = 7)

    $sauvegardes = Get-ChildItem -Path $DossierParent -Directory |
        Where-Object { $_.Name -match "^Backup_\d{4}-\d{2}-\d{2}" } |
        Sort-Object Name -Descending

    $aSupprimer = $sauvegardes | Select-Object -Skip $NombreAConserver
    $aSupprimer | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

    Write-Output "$($aSupprimer.Count) ancienne(s) sauvegarde(s) supprimée(s), $NombreAConserver conservée(s)."
}
```

**Étape 4 — orchestrateur complet.**
```powershell
function Invoke-SauvegardeComplete {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string[]]$Sources,
        [Parameter(Mandatory=$true)][string]$DestinationParent,
        [int]$NombreVersions = 7
    )

    $horodatage = Get-Date -Format "yyyy-MM-dd_HH-mm"
    $dossierVersion = Join-Path $DestinationParent "Backup_$horodatage"

    foreach ($source in $Sources) {
        $nomDossier = Split-Path $source -Leaf
        $cible = Join-Path $dossierVersion $nomDossier

        $resultat = Backup-Source -Source $source -DossierCible $cible
        $verification = Test-SauvegardeReussie -Source $source -Cible $cible

        if (-not $resultat.Reussi -or -not $verification.Coherent) {
            Write-Warning "Sauvegarde de $source suspecte (code $($resultat.CodeRetour), fichiers $($verification.FichiersSource) vs $($verification.FichiersCible))"
        } else {
            Write-Output "$source sauvegardé avec succès ($($verification.FichiersSource) fichiers)."
        }
    }

    Remove-AnciennesSauvegardes -DossierParent $DestinationParent -NombreAConserver $NombreVersions
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ foreach ($x in $liste), jamais "of" comme dans d'autres langages</span>
Rappel du chapitre 15 : PowerShell utilise systématiquement `in`, jamais `of` (JavaScript) ni `:` (Java) — un réflexe à corriger si tu passes régulièrement d'un langage à l'autre.
</div>

## 6. Tests

```powershell
Invoke-SauvegardeComplete -Sources @("C:\Projets", "C:\Documents") -DestinationParent "D:\Sauvegardes" -NombreVersions 5
```

## 7. Gestion des erreurs

Chaque étape (`Backup-Source`, `Test-SauvegardeReussie`) retourne un objet exploitable plutôt que de lever une exception bloquante — l'orchestrateur décide, ligne par ligne, ce qui constitue un échec réel (`Reussi = $false` OU `Coherent = $false`), pattern déjà appliqué au chapitre 33.

## 8. Amélioration

- Chiffrer les sauvegardes sensibles (rappel du DPAPI, chapitre 22) avant transfert vers un support externe.
- Ajouter une sauvegarde incrémentielle (uniquement les fichiers modifiés) pour les très gros volumes, en complément du miroir complet.
- Tester une restauration réelle périodiquement (pas seulement la sauvegarde), la seule vérification qui compte vraiment en cas de sinistre réel.

## 9. Documentation

```powershell
<#
.SYNOPSIS
    Sauvegarde une ou plusieurs sources en miroir, avec verification et rotation automatique.
.PARAMETER NombreVersions
    Nombre de sauvegardes horodatees a conserver. Defaut : 7.
.EXAMPLE
    Invoke-SauvegardeComplete -Sources "C:\Projets" -DestinationParent "D:\Sauvegardes" -NombreVersions 14
#>
```

## 🎯 Ce que tu sais maintenant

- Une sauvegarde fiable inclut toujours une étape de vérification indépendante du simple code de sortie de l'outil de copie.
- La rotation évite qu'un système de sauvegarde automatisé ne finisse par saturer son propre disque de destination.
- Retourner des objets structurés (plutôt que lever des exceptions) à chaque étape facilite l'agrégation d'un rapport final clair.

*Chapitre suivant : Projet 8 — administrer plusieurs machines à la fois.*
