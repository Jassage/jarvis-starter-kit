<div class="chapitre-titre-num">CHAPITRE 39</div>

# Projet 10 — Outil complet d'administration Windows

## 🎯 Objectifs

Assembler un outil unique en ligne de commande (avec menu interactif) qui expose tous les projets précédents, comme point d'orgue de ce manuel.

## Prérequis

L'ensemble de la Partie 22, chapitre 38.

## 1. Cahier des charges

Un script `AdminConsole.ps1` qui :
- s'appuie sur le module `AdminToolkit` du chapitre 38 ;
- propose un menu interactif (rappel du chapitre 8, en Batch, transposé en PowerShell) listant les grandes fonctions d'administration du manuel ;
- accepte aussi un mode non interactif (paramètres en ligne de commande), pour une intégration en tâche planifiée ;
- journalise chaque session d'utilisation.

## 2. Analyse

<div class="encadre astuce">
<span class="encadre-titre">💡 Deux publics, deux modes d'utilisation</span>
Un administrateur au clavier préfère un menu guidé ; une tâche planifiée a besoin de paramètres directs, sans aucune interaction. Ce projet sert **les deux usages avec le même script**, plutôt que de dupliquer la logique dans deux fichiers séparés.
</div>

## 3. Conception

```{.uml}
AdminConsole.ps1 [-Action <nom>] [parametres...]
  |
  +-- si -Action fourni : mode non interactif, execute directement
  +-- sinon : Show-MenuPrincipal (boucle)
        |
        +-- 1. Surveillance systeme      -> Watch-Systeme (chapitre 32)
        +-- 2. Verification services      -> Invoke-GestionServices (chapitre 35)
        +-- 3. Inventaire                 -> Get-InventaireComplet (chapitre 31)
        +-- 4. Diagnostic reseau          -> Test-ChaineReseau (chapitre 33)
        +-- 5. Sauvegarde                 -> Invoke-SauvegardeComplete (chapitre 36)
        +-- 6. Nettoyage                  -> Invoke-NettoyageWindows (chapitre 30)
        +-- 0. Quitter
```

## 4. Architecture

Le script importe le module `AdminToolkit` (chapitre 38) en tête, puis se comporte purement comme une **façade** : chaque option du menu appelle une fonction déjà écrite et testée dans un chapitre précédent, sans dupliquer aucune logique.

## 5. Développement étape par étape

**Étape 1 — en-tête et import.**
```powershell
[CmdletBinding()]
param(
    [ValidateSet("Surveillance", "Services", "Inventaire", "Reseau", "Sauvegarde", "Nettoyage")]
    [string]$Action,

    [string]$Cible
)

Import-Module "C:\Modules\AdminToolkit\AdminToolkit.psd1" -Force
```

**Étape 2 — le menu interactif.**
```powershell
function Show-MenuPrincipal {
    do {
        Clear-Host
        Write-Host "=========================================" -ForegroundColor Cyan
        Write-Host "   ADMINCONSOLE - Outil d'administration" -ForegroundColor Cyan
        Write-Host "=========================================" -ForegroundColor Cyan
        Write-Host "1. Surveillance système (2 min)"
        Write-Host "2. Vérification des services critiques"
        Write-Host "3. Inventaire de cette machine"
        Write-Host "4. Diagnostic réseau"
        Write-Host "5. Sauvegarde"
        Write-Host "6. Nettoyage Windows (simulation)"
        Write-Host "0. Quitter"
        $choix = Read-Host "`nChoix"

        switch ($choix) {
            "1" { Watch-Systeme -DureeMinutes 2 -Verbose }
            "2" { Invoke-GestionServices -AutoRestart:$false }
            "3" { Get-InventaireComplet | Format-List }
            "4" { $cible = Read-Host "Cible à tester (ex: google.com)"; Test-ChaineReseau -Cible $cible }
            "5" { Invoke-SauvegardeComplete -Sources "C:\Projets" -DestinationParent "D:\Sauvegardes" }
            "6" { Invoke-NettoyageWindows -WhatIf }
            "0" { Write-Host "Au revoir." }
            default { Write-Warning "Choix invalide." }
        }

        if ($choix -ne "0") { Read-Host "`nAppuie sur Entrée pour continuer" }
    } while ($choix -ne "0")
}
```

**Étape 3 — mode non interactif.**
```powershell
function Invoke-ActionDirecte {
    param([string]$Action, [string]$Cible)

    switch ($Action) {
        "Surveillance" { Watch-Systeme -DureeMinutes 5 }
        "Services"     { Invoke-GestionServices -AutoRestart }
        "Inventaire"   { Get-InventaireComplet | Export-Inventaire -Format Json }
        "Reseau"       { Test-ChaineReseau -Cible $Cible }
        "Sauvegarde"   { Invoke-SauvegardeComplete -Sources "C:\Projets" -DestinationParent "D:\Sauvegardes" }
        "Nettoyage"    { Invoke-NettoyageWindows -JoursAnciennete 7 }
    }
}
```

**Étape 4 — aiguillage final.**
```powershell
Write-JournalAudit -Action "DEMARRAGE_ADMINCONSOLE" -Service "AdminConsole"

if ($Action) {
    Invoke-ActionDirecte -Action $Action -Cible $Cible
} else {
    Show-MenuPrincipal
}
```

## 6. Tests

```powershell
.\AdminConsole.ps1                                  # mode interactif, menu affiché
.\AdminConsole.ps1 -Action Reseau -Cible "google.com"  # mode non interactif
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérification attendue</span>
Le mode non interactif (`-Action`) ne doit produire **aucune** invite bloquante (`Read-Host`) — c'est la condition indispensable pour un usage en tâche planifiée (chapitre 23), qui ne peut jamais répondre à une question interactive.
</div>

## 7. Gestion des erreurs

```powershell
try {
    if ($Action) {
        Invoke-ActionDirecte -Action $Action -Cible $Cible
    } else {
        Show-MenuPrincipal
    }
} catch {
    Write-Error "Erreur inattendue : $($_.Exception.Message)"
    Write-JournalAudit -Action "ERREUR: $($_.Exception.Message)" -Service "AdminConsole"
    exit 1
}
```

## 8. Amélioration

- Ajouter une authentification légère (confirmation du nom d'utilisateur avant les actions destructives comme le nettoyage réel).
- Générer un rapport de session complet (toutes les actions effectuées) exportable en fin d'exécution.
- Empaqueter l'ensemble (module + script) dans un installeur simple pour le déployer sur d'autres postes du parc.

## 9. Documentation

```powershell
<#
.SYNOPSIS
    Console d'administration Windows unifiee : surveillance, services, inventaire, reseau, sauvegarde, nettoyage.
.PARAMETER Action
    Si specifie, execute directement l'action demandee sans menu interactif (usage en tache planifiee).
.EXAMPLE
    .\AdminConsole.ps1
.EXAMPLE
    .\AdminConsole.ps1 -Action Services
#>
```

## 🎯 Ce que tu sais maintenant

- Un outil professionnel sert souvent deux publics (interactif et automatisé) avec le **même** code, en séparant clairement les deux chemins d'entrée.
- Une "façade" qui appelle des fonctions déjà écrites et testées, plutôt que de dupliquer leur logique, est la bonne façon de conclure un ensemble de projets.
- L'ensemble des dix projets de ce manuel forme, assemblé, un véritable outil d'administration Windows de bout en bout.

*Ceci clôt la Partie 22. Chapitre suivant : la feuille de route, dix niveaux du débutant au professionnel.*
