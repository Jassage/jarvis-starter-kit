<div class="chapitre-titre-num">CHAPITRE 31</div>

# Projet 2 — Inventaire système

## 🎯 Objectifs

Construire un outil d'inventaire matériel et logiciel complet, exportable en CSV/HTML/JSON, réutilisable sur un parc de machines.

## Prérequis

Chapitres 19, 25.

## 1. Cahier des charges

Un outil qui collecte, pour une machine (locale ou distante) :
- identité (nom, fabricant, modèle) ;
- OS (version, architecture, date d'installation) ;
- CPU (modèle, cœurs) ;
- RAM (totale) ;
- disques (chaque lettre, espace libre/total) ;
- logiciels installés (au moins les mises à jour, `Win32_QuickFixEngineering`) ;
- export dans un format exploitable (CSV pour Excel, JSON pour un autre système, HTML pour un rapport lisible).

## 2. Analyse

<div class="encadre astuce">
<span class="encadre-titre">💡 Un inventaire n'a de valeur que comparé dans le temps</span>
Un inventaire ponctuel dit "ce qui est là aujourd'hui" ; un inventaire **daté et archivé** (un fichier par exécution, horodaté) permet de répondre à "qu'est-ce qui a changé depuis le mois dernier ?" — une question bien plus utile en administration réelle.
</div>

## 3. Conception

```{.uml}
Get-InventaireComplet [-ComputerName]
  |
  +-- Get-InventaireIdentite      (Win32_ComputerSystem, Win32_OperatingSystem)
  +-- Get-InventaireMateriel       (Win32_Processor, Win32_LogicalDisk)
  +-- Get-InventaireLogiciel        (Win32_QuickFixEngineering)
  |
  +-- Export-Inventaire [-Format Csv|Json|Html]
```

## 4. Architecture

L'outil sépare volontairement la **collecte** (fonctions `Get-*`, retournant des objets) de l'**export** (fonction `Export-Inventaire`, agnostique du format) — rappel du principe de responsabilité unique déjà appliqué implicitement à travers ce manuel.

## 5. Développement étape par étape

**Étape 1 — collecte locale, reprise directement du chapitre 19.**
```powershell
function Get-InventaireComplet {
    [CmdletBinding()]
    param([string]$ComputerName = $env:COMPUTERNAME)

    $params = if ($ComputerName -ne $env:COMPUTERNAME) { @{ ComputerName = $ComputerName } } else { @{} }

    $os      = Get-CimInstance Win32_OperatingSystem @params
    $cpu     = Get-CimInstance Win32_Processor @params
    $systeme = Get-CimInstance Win32_ComputerSystem @params
    $disques = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" @params

    [PSCustomObject]@{
        Machine    = $systeme.Name
        Fabricant  = $systeme.Manufacturer
        Modele     = $systeme.Model
        OS         = $os.Caption
        RAM_Go     = [math]::Round($systeme.TotalPhysicalMemory / 1GB, 2)
        CPU        = $cpu.Name
        Coeurs     = $cpu.NumberOfCores
        Disques    = ($disques | ForEach-Object { "$($_.DeviceID):$([math]::Round($_.FreeSpace/1GB,1))/$([math]::Round($_.Size/1GB,1))Go" }) -join " | "
        DateReleve = Get-Date -Format "yyyy-MM-dd HH:mm"
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un seul paramètre -ComputerName rend la fonction utilisable à distance</span>
Rappel du chapitre 25 : `Get-CimInstance` accepte `-ComputerName` nativement. Construire `$params` conditionnellement évite de passer `-ComputerName $env:COMPUTERNAME` inutilement sur la machine locale (ce qui forcerait, dans certains cas, un aller-retour réseau superflu même en local).
</div>

**Étape 2 — export multi-format.**
```powershell
function Export-Inventaire {
    param(
        [Parameter(Mandatory=$true, ValueFromPipeline=$true)]
        [PSCustomObject]$Inventaire,

        [ValidateSet("Csv", "Json", "Html")]
        [string]$Format = "Csv",

        [string]$CheminSortie = "C:\Inventaires\inventaire-$(Get-Date -Format 'yyyy-MM-dd').{0}"
    )

    switch ($Format) {
        "Csv"  { $Inventaire | Export-Csv -Path ($CheminSortie -f "csv") -NoTypeInformation -Encoding UTF8 }
        "Json" { $Inventaire | ConvertTo-Json -Depth 5 | Out-File ($CheminSortie -f "json") }
        "Html" { $Inventaire | ConvertTo-Html -Title "Inventaire système" | Out-File ($CheminSortie -f "html") }
    }
}
```

**Étape 3 — inventaire de plusieurs machines en parallèle (rappel du chapitre 15/25).**
```powershell
function Get-InventaireParc {
    param([string[]]$Machines)
    $Machines | ForEach-Object -Parallel {
        Get-InventaireComplet -ComputerName $_
    } -ThrottleLimit 5
}
```

## 6. Tests

```powershell
Get-InventaireComplet | Export-Inventaire -Format Html
Get-InventaireParc -Machines @("SERVEUR01", "SERVEUR02") | Export-Inventaire -Format Csv
```

## 7. Gestion des erreurs

```powershell
function Get-InventaireComplet {
    [CmdletBinding()]
    param([string]$ComputerName = $env:COMPUTERNAME)

    try {
        # ... collecte, comme ci-dessus ...
    } catch {
        Write-Warning "Impossible d'interroger $ComputerName : $($_.Exception.Message)"
        return $null
    }
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une machine injoignable ne doit pas interrompre tout l'inventaire du parc</span>
Dans `Get-InventaireParc`, une seule machine hors ligne ne doit pas empêcher la collecte des autres — `try`/`catch` retournant `$null` (plutôt que de laisser l'exception se propager) permet à `ForEach-Object -Parallel` de continuer sur les machines suivantes.
</div>

## 8. Amélioration

- Comparer deux inventaires successifs (`Compare-Object`) pour détecter automatiquement les changements.
- Ajouter les logiciels installés via le registre (`Win32_Product` est notoirement lent — une lecture directe du registre `HKLM:\SOFTWARE\...\Uninstall` est plus rapide en pratique).
- Planifier l'inventaire hebdomadaire (chapitre 23) avec archivage automatique.

## 9. Documentation

```powershell
<#
.SYNOPSIS
    Collecte un inventaire materiel/logiciel complet d'une ou plusieurs machines.
.PARAMETER ComputerName
    Nom de la machine a inventorier. Par defaut, la machine locale.
.EXAMPLE
    Get-InventaireComplet -ComputerName "SERVEUR01" | Export-Inventaire -Format Json
#>
```

## 🎯 Ce que tu sais maintenant

- Séparer la collecte de données de son export facilite l'ajout de nouveaux formats sans toucher à la logique de collecte.
- `ForEach-Object -Parallel` avec `try`/`catch` individuel permet d'inventorier un parc de machines sans qu'une seule panne ne bloque tout.
- Un inventaire n'a de vraie valeur qu'archivé et daté, pour permettre la comparaison dans le temps.

*Chapitre suivant : Projet 3 — un outil de surveillance CPU, RAM et disque en continu.*
