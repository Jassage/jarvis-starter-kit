<div class="chapitre-titre-num">CHAPITRE 18</div>

# Services

## 🎯 Objectifs

Lister, démarrer, arrêter et redémarrer des services Windows avec PowerShell, et construire un script de vérification des services critiques.

## Prérequis

Chapitres 1 (notion de service) et 17.

## 🧠 Comprendre : gérer les employés de l'ombre

**Le problème.** Un service (chapitre 1, section 1.7) doit parfois être redémarré (après une mise à jour de configuration), arrêté temporairement, ou surveillé pour vérifier qu'il tourne toujours comme prévu — sans jamais passer par une fenêtre visible.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Si un processus visible est un cuisinier en salle, un service est un employé de maintenance qui travaille dans les coulisses, jour et nuit. `Get-Service` consulte le registre du personnel de coulisses ; `Restart-Service` équivaut à demander à cet employé de faire une courte pause puis de reprendre son poste, sans fermer l'établissement.
</div>

## 💻 Démonstration

```powershell
Get-Service
Get-Service -Name "wuauserv"
```

## 🔍 Décortiquons

`wuauserv` est le nom **interne** (pas toujours lisible) du service Windows Update — chaque service a un nom court technique et un nom "affiché" (`DisplayName`) plus explicite, tous deux visibles dans le résultat de `Get-Service`.

## 18.1 Démarrer, arrêter, redémarrer, configurer

```powershell
Start-Service -Name "wuauserv"
Stop-Service -Name "wuauserv" -Force
Restart-Service -Name "wuauserv"
Set-Service -Name "wuauserv" -StartupType Manual
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier -Force sur Stop-Service pour un service avec des dépendances</span>
Certains services ont d'autres services **dépendants** — `Stop-Service` seul échoue silencieusement (ou avec une erreur) si des services dépendants tournent encore ; `-Force` les arrête en cascade. Vérifier `Get-Service -Name X -RequiredServices`/`-DependentServices` avant d'arrêter un service critique en production.
</div>

## 18.2 Détecter les services qui devraient tourner mais sont arrêtés

```powershell
Get-Service | Where-Object { $_.StartType -eq "Automatic" -and $_.Status -ne "Running" }
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un signal fort de problème système</span>
Un service configuré en démarrage `Automatic` mais actuellement arrêté n'est presque jamais une situation normale — soit il vient de planter, soit une dépendance a échoué à son propre démarrage. C'est le point de départ du script de vérification ci-dessous.
</div>

## 18.3 Script de vérification des services critiques

```powershell
function Test-ServicesCritiques {
    param(
        [string[]]$Services = @("wuauserv", "Dnscache", "Dhcp", "EventLog")
    )

    foreach ($nom in $Services) {
        $service = Get-Service -Name $nom -ErrorAction SilentlyContinue
        if (-not $service) {
            [PSCustomObject]@{ Service = $nom; Statut = "INTROUVABLE"; OK = $false }
            continue
        }
        [PSCustomObject]@{
            Service = $service.DisplayName
            Statut  = $service.Status
            OK      = ($service.Status -eq "Running")
        }
    }
}

Test-ServicesCritiques | Format-Table -AutoSize
```

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre le nom court et le nom affiché d'un service</span>
```powershell
Get-Service -Name "Windows Update"        ← ❌ echoue, ce n'est pas le nom court
Get-Service -DisplayName "*Update*"        ← ✅ recherche par nom affiche, avec wildcard
Get-Service -Name "wuauserv"               ← ✅ nom court exact
```
</div>

## Bonnes pratiques

- Vérifier les dépendances (`-RequiredServices`/`-DependentServices`) avant d'arrêter un service en production.
- Utiliser `-ErrorAction SilentlyContinue` avec discernement quand un service peut légitimement être absent (chapitre 29).
- Documenter la liste des services jugés "critiques" pour un système donné, plutôt que de la deviner à chaque script.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 18.1</span>

Liste tous les services actuellement en cours d'exécution (`Running`), triés par nom affiché.
</div>

**✅ Correction.**
```powershell
Get-Service | Where-Object { $_.Status -eq "Running" } | Sort-Object DisplayName
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 18.2</span>

Redémarre le service du spouleur d'impression (`Spooler`), puis vérifie et affiche son nouveau statut.
</div>

**✅ Correction.**
```powershell
Restart-Service -Name "Spooler"
Get-Service -Name "Spooler" | Select-Object DisplayName, Status
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 18.3</span>

Améliore le script `Test-ServicesCritiques` de la section 18.3 pour qu'il retourne un code de sortie distinct (via `exit`, notion approfondie au chapitre 28) selon que tous les services sont `OK` ou non, utilisable ensuite dans une tâche planifiée d'alerte.
</div>

**✅ Correction du défi.**
```powershell
$resultats = Test-ServicesCritiques
$resultats | Format-Table -AutoSize

if ($resultats | Where-Object { -not $_.OK }) {
    Write-Warning "Au moins un service critique n'est pas en cours d'exécution."
    exit 1
} else {
    Write-Output "Tous les services critiques sont opérationnels."
    exit 0
}
```

## 🎯 Ce que tu sais maintenant

- `Get-Service`, `Start-Service`, `Stop-Service`, `Restart-Service`, `Set-Service` couvrent la gestion complète des services Windows.
- Un service `Automatic` mais arrêté est un signal de problème quasi systématique.
- `-Name` cible le nom court technique, `-DisplayName` le nom lisible affiché à l'utilisateur.

*Chapitre suivant : récupérer les informations système (CPU, RAM, disque, BIOS, réseau) avec Get-ComputerInfo et Get-CimInstance.*
