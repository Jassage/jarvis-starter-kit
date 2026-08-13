<div class="chapitre-titre-num">CHAPITRE 35</div>

# Projet 6 — Gestionnaire de services

## 🎯 Objectifs

Construire un outil interactif de gestion de services, avec surveillance des services critiques, redémarrage automatique optionnel, et journal d'audit des actions effectuées.

## Prérequis

Chapitre 18, 22.

## 1. Cahier des charges

Un outil qui :
- affiche l'état d'une liste de services critiques (configurable) ;
- propose un redémarrage automatique optionnel (`-AutoRestart`) pour tout service `Automatic` mais arrêté ;
- journalise chaque action (qui, quand, quel service, quelle action) — un vrai journal d'audit, pas juste une trace console.

## 2. Analyse

<div class="encadre astuce">
<span class="encadre-titre">💡 Auto-redémarrer un service est une décision, pas un réflexe</span>
Redémarrer automatiquement un service arrêté peut masquer un problème plus profond (le service crashe en boucle pour une vraie raison) au lieu de le révéler. Le cahier des charges rend ce comportement **optionnel et explicite** (`-AutoRestart`), jamais activé par défaut.
</div>

## 3. Conception

```{.uml}
Invoke-GestionServices -Services [] -AutoRestart
  |
  +-- Test-ServicesCritiques (chapitre 18)
  +-- si -AutoRestart et service Automatic+Arrete :
  |     Restart-Service + Write-JournalAudit
  +-- rapport final
```

## 4. Architecture : le journal d'audit

```powershell
function Write-JournalAudit {
    param([string]$Action, [string]$Service, [string]$LogPath = "C:\Logs\audit-services.log")
    $ligne = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | $env:USERNAME | $Action | $Service"
    Add-Content -Path $LogPath -Value $ligne
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un journal d'audit inclut toujours "qui"</span>
Contrairement à un simple log de débogage, un journal d'**audit** doit toujours pouvoir répondre à "qui a fait quoi, quand" — `$env:USERNAME` (chapitre 7) est indispensable ici, même sur une machine à un seul utilisateur habituel : les habitudes changent, les journaux doivent rester fiables.
</div>

## 5. Développement étape par étape

**Étape 1 — la fonction de vérification, reprise du chapitre 18.**
```powershell
function Test-ServicesCritiques {
    param([string[]]$Services = @("wuauserv", "Dnscache", "Dhcp", "EventLog"))
    foreach ($nom in $Services) {
        $service = Get-Service -Name $nom -ErrorAction SilentlyContinue
        if (-not $service) {
            [PSCustomObject]@{ Service = $nom; NomAffiche = $nom; Statut = "INTROUVABLE"; TypeDemarrage = "?"; OK = $false }
            continue
        }
        [PSCustomObject]@{
            Service       = $service.Name
            NomAffiche    = $service.DisplayName
            Statut        = $service.Status
            TypeDemarrage = $service.StartType
            OK            = ($service.Status -eq "Running")
        }
    }
}
```

**Étape 2 — l'orchestrateur avec redémarrage optionnel.**
```powershell
function Invoke-GestionServices {
    [CmdletBinding()]
    param(
        [string[]]$Services = @("wuauserv", "Dnscache", "Dhcp", "EventLog"),
        [switch]$AutoRestart
    )

    $resultats = Test-ServicesCritiques -Services $Services

    foreach ($r in $resultats) {
        if (-not $r.OK -and $r.TypeDemarrage -eq "Automatic" -and $AutoRestart) {
            try {
                Restart-Service -Name $r.Service -ErrorAction Stop
                Write-JournalAudit -Action "REDEMARRAGE_AUTO" -Service $r.Service
                Write-Output "$($r.NomAffiche) redémarré automatiquement."
            } catch {
                Write-JournalAudit -Action "ECHEC_REDEMARRAGE" -Service $r.Service
                Write-Warning "Échec du redémarrage de $($r.NomAffiche) : $($_.Exception.Message)"
            }
        }
    }

    Test-ServicesCritiques -Services $Services | Format-Table -AutoSize
}
```

## 6. Tests

```powershell
Invoke-GestionServices -Services @("Spooler", "wuauserv")
Invoke-GestionServices -Services @("Spooler") -AutoRestart -Verbose
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérification attendue</span>
Après un arrêt manuel volontaire d'un service de test (`Stop-Service -Name Spooler`), `Invoke-GestionServices -Services @("Spooler") -AutoRestart` doit le redémarrer et écrire une ligne `REDEMARRAGE_AUTO` dans `C:\Logs\audit-services.log`.
</div>

## 7. Gestion des erreurs

Chaque redémarrage est protégé par un `try`/`catch` individuel (étape 2) — l'échec du redémarrage d'un service ne doit jamais empêcher la vérification des suivants, ni faire planter l'outil entier (rappel du chapitre 29).

## 8. Amélioration

- Ajouter une limite de tentatives (ne pas redémarrer indéfiniment un service qui crashe en boucle — un signe qu'il faut alerter un humain plutôt que continuer).
- Envoyer une notification (chapitre 28) en cas de redémarrage automatique, plutôt que de laisser le journal comme seule trace.
- Rendre la liste de services critiques configurable via un fichier JSON externe plutôt que codée en dur.

## 9. Documentation

```powershell
<#
.SYNOPSIS
    Verifie l'etat de services critiques, avec redemarrage automatique optionnel et journal d'audit.
.PARAMETER AutoRestart
    Si specifie, redemarre automatiquement tout service Automatic actuellement arrete.
.EXAMPLE
    Invoke-GestionServices -Services @("wuauserv","Spooler") -AutoRestart
#>
```

## 🎯 Ce que tu sais maintenant

- Un comportement automatique risqué (redémarrer un service) doit toujours être **optionnel et explicite**, jamais activé par défaut.
- Un vrai journal d'audit inclut systématiquement qui, quoi, quand — pas seulement un message de log générique.
- Isoler chaque action risquée dans son propre `try`/`catch` permet à l'outil de continuer sur les éléments suivants malgré un échec isolé.

*Chapitre suivant : Projet 7 — un système de sauvegarde complet.*
