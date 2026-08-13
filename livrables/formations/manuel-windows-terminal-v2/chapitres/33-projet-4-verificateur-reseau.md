<div class="chapitre-titre-num">CHAPITRE 33</div>

# Projet 4 — Vérificateur réseau

## 🎯 Objectifs

Construire un outil qui applique automatiquement la chaîne de diagnostic réseau du chapitre 20 (carte → IP → passerelle → DNS → route → port → service) et produit un rapport clair de l'étage où le problème se situe.

## Prérequis

Chapitre 20, 29.

## 1. Cahier des charges

Un outil qui, pour une cible donnée (par défaut, la connectivité générale) :
- teste chaque étage de la chaîne réseau, dans l'ordre ;
- s'arrête au premier étage en échec (inutile de tester le DNS si la carte réseau est down) ;
- indique précisément quel étage a échoué, en langage clair, pas juste un code d'erreur.

## 2. Analyse

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce projet est une implémentation directe du schéma du chapitre 20</span>
Ce n'est pas un hasard : ce projet transforme littéralement le schéma "Ordinateur → Carte réseau → IP → Passerelle → DNS → Route → Port → Service" en code exécutable, étage par étage.
</div>

## 3. Conception

```{.uml}
Test-ChaineReseau -Cible "monsite.com" -Port 443
  |
  +-- Test-EtageCarteReseau
  +-- Test-EtageAdresseIP
  +-- Test-EtagePasserelle
  +-- Test-EtageDNS       -Cible
  +-- Test-EtageRoute
  +-- Test-EtagePort       -Cible -Port
  |
  +-- arret au premier echec, rapport clair
```

## 4. Architecture

Chaque étage est une fonction indépendante retournant un objet `{ Etage, OK, Detail }` — l'orchestrateur `Test-ChaineReseau` les appelle **dans l'ordre**, et s'arrête dès qu'un étage échoue (inutile de continuer, rappel du raisonnement du chapitre 20).

## 5. Développement étape par étape

**Étape 1 — les étages, un par un.**
```powershell
function Test-EtageCarteReseau {
    $actif = Get-NetAdapter | Where-Object Status -eq "Up"
    [PSCustomObject]@{ Etage = "Carte réseau"; OK = [bool]$actif; Detail = if ($actif) { $actif[0].Name } else { "Aucune carte active" } }
}

function Test-EtageAdresseIP {
    $ip = (Get-NetIPConfiguration | Where-Object { $_.NetAdapter.Status -eq "Up" }).IPv4Address.IPAddress
    $valide = $ip -and $ip -notlike "169.254.*"
    [PSCustomObject]@{ Etage = "Adresse IP"; OK = [bool]$valide; Detail = if ($ip) { $ip } else { "Aucune adresse" } }
}

function Test-EtagePasserelle {
    $passerelle = (Get-NetRoute -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue | Select-Object -First 1).NextHop
    $ok = $passerelle -and (Test-Connection -ComputerName $passerelle -Count 1 -Quiet)
    [PSCustomObject]@{ Etage = "Passerelle"; OK = [bool]$ok; Detail = $passerelle }
}

function Test-EtageDNS {
    param([string]$Cible)
    try {
        $resultat = Resolve-DnsName -Name $Cible -ErrorAction Stop
        [PSCustomObject]@{ Etage = "DNS"; OK = $true; Detail = $resultat[0].IPAddress }
    } catch {
        [PSCustomObject]@{ Etage = "DNS"; OK = $false; Detail = $_.Exception.Message }
    }
}

function Test-EtagePort {
    param([string]$Cible, [int]$Port)
    $resultat = Test-NetConnection -ComputerName $Cible -Port $Port -WarningAction SilentlyContinue
    [PSCustomObject]@{ Etage = "Port $Port"; OK = $resultat.TcpTestSucceeded; Detail = "$Cible`:$Port" }
}
```

**Étape 2 — orchestrateur, arrêt au premier échec.**
```powershell
function Test-ChaineReseau {
    [CmdletBinding()]
    param(
        [string]$Cible = "google.com",
        [int]$Port = 443
    )

    $etapes = @(
        { Test-EtageCarteReseau }
        { Test-EtageAdresseIP }
        { Test-EtagePasserelle }
        { Test-EtageDNS -Cible $Cible }
        { Test-EtagePort -Cible $Cible -Port $Port }
    )

    foreach ($etape in $etapes) {
        $resultat = & $etape
        $statut = if ($resultat.OK) { "✅" } else { "❌" }
        Write-Output "$statut $($resultat.Etage) : $($resultat.Detail)"

        if (-not $resultat.OK) {
            Write-Warning "Diagnostic arrêté à l'étage '$($resultat.Etage)' — c'est probablement là qu'est le problème."
            return
        }
    }
    Write-Output "`nTous les étages sont fonctionnels. La connectivité vers $Cible`:$Port est confirmée."
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un tableau de blocs de script ({...}), exécutés avec &</span>
`$etapes` est un tableau de **blocs de script** (`{ ... }`), pas encore exécutés — `& $etape` (chapitre 27, opérateur d'appel) les déclenche un par un, dans l'ordre, permettant de sortir de la boucle avec `return` dès le premier échec sans complexité supplémentaire.
</div>

## 6. Tests

```powershell
Test-ChaineReseau -Cible "google.com" -Port 443     # devrait tout réussir sur une connexion normale
Test-ChaineReseau -Cible "domaine-inexistant-xyz.com" -Port 443   # devrait s'arrêter à l'étage DNS
```

## 7. Gestion des erreurs

Chaque fonction d'étage encapsule déjà ses erreurs potentielles (`try`/`catch` sur `Test-EtageDNS`, `-ErrorAction SilentlyContinue` ailleurs) — aucune erreur individuelle ne doit faire planter l'orchestrateur, cohérent avec le chapitre 29.

## 8. Amélioration

- Ajouter un mode `-Json` pour intégrer ce diagnostic dans un autre outil de supervision.
- Ajouter un étage "traceroute" (`Test-NetConnection -TraceRoute`) en option, pour un diagnostic plus poussé.
- Historiser les résultats pour détecter une dégradation progressive (latence qui augmente sans franc échec).

## 9. Documentation

```powershell
<#
.SYNOPSIS
    Diagnostique la connectivite reseau etage par etage, et s'arrete au premier probleme trouve.
.PARAMETER Cible
    Nom d'hote ou adresse a tester. Defaut : google.com.
.EXAMPLE
    Test-ChaineReseau -Cible "api.monentreprise.com" -Port 443
#>
```

## 🎯 Ce que tu sais maintenant

- Transformer un raisonnement de diagnostic (chapitre 20) en une suite ordonnée de fonctions testables reproduit fidèlement une méthode de dépannage humaine.
- Un tableau de blocs de script exécutés avec `&` permet un enchaînement d'étapes lisible, qui s'arrête proprement au premier échec.
- Le rapport final doit toujours désigner **l'étage précis** du problème, jamais un simple "ça ne marche pas".

*Chapitre suivant : Projet 5 — un scanner de ports pédagogique.*
