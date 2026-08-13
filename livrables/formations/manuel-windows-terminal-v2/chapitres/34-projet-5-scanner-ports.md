<div class="chapitre-titre-num">CHAPITRE 34</div>

# Projet 5 — Scanner de ports pédagogique

## 🎯 Objectifs

Construire un scanner de ports simple, pour diagnostiquer **tes propres machines et réseaux** (ou ceux pour lesquels tu as une autorisation explicite), et comprendre son fonctionnement interne.

## Prérequis

Chapitre 20.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Cadre d'usage : administration et diagnostic légitimes uniquement</span>
Scanner les ports d'une machine ou d'un réseau qui ne t'appartient pas, sans autorisation explicite du propriétaire, est illégal dans la plupart des juridictions et contraire à l'éthique professionnelle. Cet outil est conçu pour diagnostiquer **tes propres serveurs**, ceux d'un client dans le cadre d'un mandat clair, ou un environnement de test que tu contrôles — jamais pour sonder une cible tierce sans accord.
</div>

## 1. Cahier des charges

Un outil qui :
- teste une liste de ports sur une ou plusieurs machines ;
- distingue clairement "port ouvert" de "port fermé/filtré" ;
- reste raisonnablement rapide sur une plage de ports, sans saturer le réseau local ;
- produit un résultat exploitable (tableau, export).

## 2. Analyse

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce que ce scanner fait réellement : un test de connexion TCP</span>
Techniquement, ce scanner ne fait rien de mystérieux : pour chaque port, il tente d'ouvrir une connexion TCP (chapitre 20, `Test-NetConnection`). Si la connexion réussit, le port est considéré ouvert. C'est exactement ce que fait un navigateur avant de charger une page HTTPS (port 443) — la seule différence est de le faire systématiquement sur une liste de ports, à but de diagnostic.
</div>

## 3. Conception

```{.uml}
Invoke-ScanPorts -Cible -Ports
  |
  +-- pour chaque port : Test-NetConnection (parallelise)
  +-- classification Ouvert / Ferme
  +-- Format-Table ou Export-Csv
```

## 4. Architecture

Le scan est parallélisé (chapitre 15, `ForEach-Object -Parallel`) pour rester rapide même sur une centaine de ports, avec une limite de concurrence explicite pour ne pas saturer le réseau local.

## 5. Développement étape par étape

**Étape 1 — reprendre et enrichir le scanner du chapitre 20.**
```powershell
function Invoke-ScanPorts {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Cible,

        [int[]]$Ports = @(21, 22, 25, 80, 443, 3306, 3389, 5432, 8080),

        [int]$ThrottleLimit = 10
    )

    $Ports | ForEach-Object -Parallel {
        $resultat = Test-NetConnection -ComputerName $using:Cible -Port $_ -WarningAction SilentlyContinue
        [PSCustomObject]@{
            Cible  = $using:Cible
            Port   = $_
            Statut = if ($resultat.TcpTestSucceeded) { "Ouvert" } else { "Fermé/filtré" }
        }
    } -ThrottleLimit $ThrottleLimit | Sort-Object Port
}
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : $using:</span>
À l'intérieur d'un bloc `ForEach-Object -Parallel`, chaque itération s'exécute dans un contexte **isolé** — une variable définie en dehors du bloc (`$Cible`) n'y est normalement pas visible. `$using:Cible` importe explicitement sa valeur depuis l'extérieur, un mécanisme spécifique à `-Parallel` (et au Remoting, chapitre 25) à ne pas oublier.
</div>

**Étape 2 — associer un nom de service courant à chaque port (pédagogique).**
```powershell
$servicesConnus = @{
    21 = "FTP"; 22 = "SSH"; 25 = "SMTP"; 80 = "HTTP"; 443 = "HTTPS"
    3306 = "MySQL"; 3389 = "RDP"; 5432 = "PostgreSQL"; 8080 = "HTTP alternatif"
}

function Add-NomService {
    param([Parameter(ValueFromPipeline=$true)]$ResultatScan)
    process {
        $ResultatScan | Add-Member -NotePropertyName Service -NotePropertyValue ($servicesConnus[$ResultatScan.Port] ?? "Inconnu") -PassThru
    }
}
```

**Étape 3 — assembler et présenter.**
```powershell
Invoke-ScanPorts -Cible "monserveur.com" | Add-NomService | Format-Table -AutoSize
```

## 6. Tests

```powershell
# Sur ta propre machine (localhost), résultat attendu variable selon les services locaux actifs
Invoke-ScanPorts -Cible "localhost" -Ports 80,443,3389
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérification attendue</span>
Sur `localhost`, un port associé à un service que tu sais actif (par exemple 3389 si le Bureau à distance est activé) doit apparaître "Ouvert" ; un port sans service correspondant doit apparaître "Fermé/filtré". Compare avec `Get-NetTCPConnection -State Listen` (chapitre 20) pour confirmer.
</div>

## 7. Gestion des erreurs

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une cible injoignable ne doit générer ni exception ni blocage</span>
`Test-NetConnection -WarningAction SilentlyContinue` (déjà appliqué) absorbe l'avertissement natif sur un port fermé ; pour une cible totalement injoignable (mauvais nom DNS), envelopper l'appel individuel dans un `try`/`catch` (chapitre 29) évite qu'une seule cible invalide n'interrompe le scan des autres ports.
</div>

## 8. Amélioration

- Limiter le `-ThrottleLimit` automatiquement selon le nombre de ports demandés, pour rester raisonnable sur une grande plage.
- Ajouter une bannière de service (lecture des premiers octets renvoyés par le port ouvert) pour un diagnostic plus poussé — hors périmètre pédagogique de ce chapitre.
- Journaliser chaque scan effectué (qui, quand, sur quelle cible) pour garder une trace d'audit de l'usage de l'outil.

## 9. Documentation

```powershell
<#
.SYNOPSIS
    Scanne une liste de ports TCP sur une cible, a des fins de diagnostic sur des systemes autorises.
.PARAMETER Cible
    Nom d'hote ou adresse IP a tester. Utiliser uniquement sur des systemes dont tu es responsable ou autorise.
.EXAMPLE
    Invoke-ScanPorts -Cible "monserveur-perso.com" -Ports 80,443,22
#>
```

## 🎯 Ce que tu sais maintenant

- Un scanner de ports n'est, techniquement, qu'une série de tests de connexion TCP répétés et parallélisés.
- `$using:` importe une variable externe dans un bloc `ForEach-Object -Parallel`, mécanisme distinct d'une simple fermeture de variable.
- Un outil de diagnostic réseau, aussi utile soit-il, ne doit être utilisé que dans un cadre autorisé — le rappeler dans la documentation de l'outil lui-même est une bonne pratique.

*Chapitre suivant : Projet 6 — un gestionnaire de services complet.*
