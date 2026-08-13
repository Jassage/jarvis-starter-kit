<div class="chapitre-titre-num">CHAPITRE 37</div>

# Projet 8 — Administration de plusieurs machines

## 🎯 Objectifs

Construire un outil qui exécute une vérification standardisée sur un parc de machines, avec gestion propre des machines injoignables et rapport consolidé.

## Prérequis

Chapitres 18, 19, 25, 31.

## 1. Cahier des charges

Un outil qui, pour une liste de machines :
- vérifie qu'elles sont joignables avant toute tentative de commande à distance ;
- exécute un même ensemble de vérifications (services critiques, espace disque) sur chacune ;
- produit un rapport consolidé unique, avec les machines injoignables clairement identifiées séparément.

## 2. Analyse

<div class="encadre astuce">
<span class="encadre-titre">💡 La difficulté n'est pas d'exécuter une commande à distance, mais d'échouer proprement</span>
`Invoke-Command` sur une machine injoignable (chapitre 25) lève une exception — sur 50 machines, si une seule est éteinte, un script naïf s'arrête net et ne rapporte rien sur les 49 autres. Ce projet traite explicitement ce cas comme un résultat normal, pas une erreur fatale.
</div>

## 3. Conception

```{.uml}
Invoke-VerificationParc -Machines []
  |
  +-- pour chaque machine (parallele) :
  |     Test-WSMan -> joignable ?
  |       oui -> Invoke-Command { verifications } -> resultat
  |       non -> resultat "INJOIGNABLE"
  |
  +-- consolidation : rapport global + liste des injoignables
```

## 4. Architecture

Chaque machine est traitée indépendamment dans `ForEach-Object -Parallel` (chapitre 15/25), avec son propre `try`/`catch` — aucune machine ne peut faire échouer les autres.

## 5. Développement étape par étape

**Étape 1 — vérification à exécuter sur chaque machine distante.**
```powershell
$scriptVerification = {
    $services = Get-Service | Where-Object { $_.StartType -eq "Automatic" -and $_.Status -ne "Running" }
    $disques  = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | Where-Object {
        (($_.FreeSpace / $_.Size) * 100) -lt 15
    }

    [PSCustomObject]@{
        ServicesEnPanne = $services.Count
        DisquesCritiques = $disques.Count
        Machine         = $env:COMPUTERNAME
    }
}
```

**Étape 2 — orchestrateur parc, avec machines injoignables isolées.**
```powershell
function Invoke-VerificationParc {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string[]]$Machines,

        [int]$ThrottleLimit = 10
    )

    $resultats = $Machines | ForEach-Object -Parallel {
        $script = $using:scriptVerification

        if (-not (Test-WSMan -ComputerName $_ -ErrorAction SilentlyContinue)) {
            [PSCustomObject]@{ Machine = $_; Statut = "INJOIGNABLE"; ServicesEnPanne = $null; DisquesCritiques = $null }
            return
        }

        try {
            $r = Invoke-Command -ComputerName $_ -ScriptBlock $script -ErrorAction Stop
            [PSCustomObject]@{ Machine = $_; Statut = "OK"; ServicesEnPanne = $r.ServicesEnPanne; DisquesCritiques = $r.DisquesCritiques }
        } catch {
            [PSCustomObject]@{ Machine = $_; Statut = "ERREUR: $($_.Exception.Message)"; ServicesEnPanne = $null; DisquesCritiques = $null }
        }
    } -ThrottleLimit $ThrottleLimit

    $resultats
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ $using: pour un scriptblock complet, pas seulement une valeur simple</span>
Rappel du chapitre 34 : `$using:scriptVerification` importe le bloc de script défini en dehors de `-Parallel` — sans cela, PowerShell chercherait une variable `$scriptVerification` locale au contexte parallèle isolé, inexistante, et lèverait une erreur.
</div>

**Étape 3 — rapport consolidé.**
```powershell
function New-RapportParc {
    param([Parameter(ValueFromPipeline=$true)]$Resultats)
    begin { $tous = @() }
    process { $tous += $Resultats }
    end {
        $injoignables = $tous | Where-Object Statut -eq "INJOIGNABLE"
        $problematiques = $tous | Where-Object { $_.ServicesEnPanne -gt 0 -or $_.DisquesCritiques -gt 0 }

        Write-Output "=== Rapport de vérification du parc ($($tous.Count) machines) ==="
        Write-Output "$($injoignables.Count) machine(s) injoignable(s) : $($injoignables.Machine -join ', ')"
        Write-Output "$($problematiques.Count) machine(s) avec au moins un problème :"
        $problematiques | Format-Table Machine, ServicesEnPanne, DisquesCritiques -AutoSize
    }
}
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : begin/process/end</span>
Ces trois blocs, dans une fonction avancée, séparent l'initialisation (`begin`, une seule fois), le traitement (`process`, une fois par élément reçu du pipeline), et la finalisation (`end`, une seule fois) — un pattern utile dès qu'une fonction doit accumuler des résultats reçus via `|` avant de les résumer.
</div>

## 6. Tests

```powershell
Invoke-VerificationParc -Machines @("SERVEUR01", "SERVEUR02", "MACHINE-ETEINTE") | New-RapportParc
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérification attendue</span>
Avec une machine volontairement injoignable dans la liste, le rapport final doit clairement l'identifier dans la section "injoignables", sans interrompre ni fausser les résultats des deux autres machines.
</div>

## 7. Gestion des erreurs

Trois niveaux de protection, du plus externe au plus interne : `Test-WSMan` filtre les machines injoignables avant même de tenter une commande ; `try`/`catch` autour de `Invoke-Command` capture toute erreur restante (droits insuffisants, timeout) ; `ForEach-Object -Parallel` isole chaque machine des autres.

## 8. Amélioration

- Ajouter un délai d'expiration explicite (`-ScriptBlockTimeoutSec`) pour éviter qu'une machine lente ne ralentisse tout le parc.
- Exporter le rapport consolidé en HTML (rappel du chapitre 31) pour diffusion par email.
- Regrouper les machines par site/département pour des rapports segmentés plutôt qu'un parc unique.

## 9. Documentation

```powershell
<#
.SYNOPSIS
    Verifie services critiques et espace disque sur un parc de machines, en parallele.
.PARAMETER Machines
    Liste des noms d'hote a verifier.
.EXAMPLE
    Invoke-VerificationParc -Machines (Get-Content machines.txt) | New-RapportParc
#>
```

## 🎯 Ce que tu sais maintenant

- Traiter systématiquement le cas "machine injoignable" comme un résultat normal, pas une exception fatale, est indispensable dès qu'on administre plus d'une machine.
- `begin`/`process`/`end` permettent d'accumuler puis résumer des résultats reçus via le pipeline.
- Trois niveaux de protection (test de joignabilité, `try`/`catch`, parallélisation isolée) rendent un outil multi-machines réellement robuste.

*Chapitre suivant : Projet 9 — regrouper tous les outils de ce manuel dans un module PowerShell personnel.*
