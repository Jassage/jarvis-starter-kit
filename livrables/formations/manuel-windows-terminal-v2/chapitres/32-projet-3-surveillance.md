<div class="chapitre-titre-num">CHAPITRE 32</div>

# Projet 3 — Surveillance CPU, RAM et disque

## 🎯 Objectifs

Construire un outil de surveillance continue qui alerte (console, puis fichier de log) quand un seuil de charge est franchi, sans inonder l'administrateur d'alertes répétées.

## Prérequis

Chapitres 17, 19, 23.

## 1. Cahier des charges

Un outil qui, à intervalle régulier :
- mesure l'utilisation CPU globale, la RAM disponible, et l'espace disque libre ;
- déclenche une alerte si un seuil configurable est dépassé ;
- **n'alerte qu'une seule fois** par dépassement (pas à chaque cycle tant que le problème persiste) ;
- journalise chaque mesure, alerte ou non.

## 2. Analyse

<div class="encadre astuce">
<span class="encadre-titre">💡 Le vrai défi n'est pas de mesurer, mais de ne pas spammer</span>
Techniquement, mesurer le CPU toutes les 10 secondes est trivial (chapitre 17). Le vrai problème d'ingénierie est d'éviter qu'un problème persistant (CPU bloqué à 95% pendant une heure) ne génère 360 alertes identiques — un piège fréquent des outils de surveillance mal conçus.
</div>

## 3. Conception

```{.uml}
Watch-Systeme (boucle -Duree)
  |
  +-- Get-UtilisationCPU
  +-- Get-MemoireDisponible
  +-- Get-EspaceDisqueCritique
  |
  +-- Test-SeuilDepasse (avec etat "deja alerte" par metrique)
  +-- Write-Alerte / Write-Log
```

## 4. Architecture : état conservé entre les cycles

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : état (state)</span>
Contrairement aux outils des chapitres précédents (sans mémoire d'une exécution à l'autre), ce projet doit **se souvenir** s'il a déjà alerté sur un problème en cours, pour ne pas répéter l'alerte à chaque cycle — une hashtable `$etatAlertes` (chapitre 13) portée par la boucle principale sert cette mémoire.
</div>

## 5. Développement étape par étape

**Étape 1 — mesures individuelles.**
```powershell
function Get-UtilisationCPU {
    (Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
}

function Get-MemoireDisponibleGo {
    $os = Get-CimInstance Win32_OperatingSystem
    [math]::Round($os.FreePhysicalMemory / 1MB, 2)   ← FreePhysicalMemory est deja en Ko
}

function Get-EspaceDisqueCritique {
    param([double]$SeuilPourcent = 15)
    Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | Where-Object {
        (($_.FreeSpace / $_.Size) * 100) -lt $SeuilPourcent
    }
}
```

**Étape 2 — état d'alerte, pour éviter le spam.**
```powershell
$etatAlertes = @{}

function Test-SeuilDepasse {
    param([string]$Metrique, [bool]$EstDepasse)

    if ($EstDepasse -and -not $etatAlertes[$Metrique]) {
        $etatAlertes[$Metrique] = $true
        return $true    ← nouvelle alerte, a signaler
    }
    if (-not $EstDepasse -and $etatAlertes[$Metrique]) {
        $etatAlertes[$Metrique] = $false
        Write-Output "$Metrique revenu à la normale."
    }
    return $false
}
```

**Étape 3 — boucle de surveillance.**
```powershell
function Watch-Systeme {
    [CmdletBinding()]
    param(
        [int]$IntervalleSecondes = 10,
        [int]$DureeMinutes = 60,
        [double]$SeuilCpu = 85,
        [double]$SeuilDisquePourcent = 15,
        [string]$LogPath = "C:\Logs\surveillance.log"
    )

    $fin = (Get-Date).AddMinutes($DureeMinutes)

    while ((Get-Date) -lt $fin) {
        $cpu = Get-UtilisationCPU
        $disques = Get-EspaceDisqueCritique -SeuilPourcent $SeuilDisquePourcent

        $ligne = "$(Get-Date -Format 'HH:mm:ss') CPU=$cpu% Disques_critiques=$($disques.Count)"
        Add-Content -Path $LogPath -Value $ligne

        if (Test-SeuilDepasse -Metrique "CPU" -EstDepasse ($cpu -gt $SeuilCpu)) {
            Write-Warning "ALERTE : CPU à $cpu% (seuil $SeuilCpu%)"
        }
        if (Test-SeuilDepasse -Metrique "Disque" -EstDepasse ($disques.Count -gt 0)) {
            Write-Warning "ALERTE : $($disques.Count) disque(s) sous le seuil de $SeuilDisquePourcent%"
        }

        Start-Sleep -Seconds $IntervalleSecondes
    }
}
```

## 6. Tests

```powershell
Watch-Systeme -IntervalleSecondes 5 -DureeMinutes 2 -SeuilCpu 20 -Verbose
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérification attendue</span>
Avec un seuil CPU volontairement bas (`20`), l'alerte doit apparaître **une seule fois** dans les premières secondes, puis ne plus se répéter tant que le CPU reste au-dessus de 20% — confirmant le comportement anti-spam de la section 2.
</div>

## 7. Gestion des erreurs

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une boucle de surveillance ne doit jamais planter sur une erreur ponctuelle</span>
```powershell
while ((Get-Date) -lt $fin) {
    try {
        # ... mesures et alertes ...
    } catch {
        Write-Warning "Erreur de mesure ignorée : $($_.Exception.Message)"
    }
    Start-Sleep -Seconds $IntervalleSecondes
}
```
Un outil censé tourner en continu (parfois des heures) doit survivre à une erreur ponctuelle (un appel CIM qui échoue une fois) plutôt que de s'arrêter entièrement — rappel du chapitre 29 sur la robustesse des scripts d'automatisation.
</div>

## 8. Amélioration

- Envoyer les alertes par webhook (rappel du chapitre 28, `Send-NotificationDeploiement`) plutôt que seulement à l'écran.
- Enregistrer les mesures dans un format exploitable pour un graphique (CSV horodaté, chapitre 31).
- Adapter la fréquence de mesure automatiquement (plus rapprochée quand un seuil est proche d'être dépassé).

## 9. Documentation

```powershell
<#
.SYNOPSIS
    Surveille CPU, memoire et espace disque en continu, avec alertes anti-spam.
.PARAMETER SeuilCpu
    Pourcentage CPU au-dela duquel une alerte est declenchee. Defaut : 85.
.EXAMPLE
    Watch-Systeme -DureeMinutes 480 -SeuilCpu 90
#>
```

## 🎯 Ce que tu sais maintenant

- Un outil de surveillance robuste maintient un **état** entre les cycles pour éviter de répéter la même alerte indéfiniment.
- `try`/`catch` à l'intérieur même d'une boucle longue durée protège l'outil entier d'une erreur de mesure isolée.
- Journaliser chaque mesure (pas seulement les alertes) permet une analyse a posteriori, même sans incident.

*Chapitre suivant : Projet 4 — un vérificateur réseau complet.*
