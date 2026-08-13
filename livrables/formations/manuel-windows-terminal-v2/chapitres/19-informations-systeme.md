<div class="chapitre-titre-num">CHAPITRE 19</div>

# Informations système

## 🎯 Objectifs

Récupérer en PowerShell toutes les informations essentielles sur une machine : CPU, RAM, disque, BIOS, système d'exploitation, carte réseau, utilisateur, nom de machine — avec `Get-ComputerInfo` et `Get-CimInstance`.

## Prérequis

Chapitres 1, 17-18.

## 🧠 Comprendre : interroger la machine comme une base de données

**Le problème.** Le chapitre 1 a présenté processeur, RAM, disque et système d'exploitation de façon conceptuelle. Il faut maintenant pouvoir interroger ces informations, précisément, en script.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Windows tient, en coulisses, une immense fiche d'inventaire de tout ce qui compose la machine — modèle du BIOS, version exacte du processeur, espace libre sur chaque disque. `Get-CimInstance` est la requête que tu adresses à ce registre d'inventaire, un peu comme une requête SQL adressée à une base de données.
</div>

## 💻 Démonstration : Get-ComputerInfo

```powershell
Get-ComputerInfo
```

## 🔍 Décortiquons

`Get-ComputerInfo` (sans aucun paramètre) renvoie un **unique objet géant**, avec des dizaines de propriétés : version de Windows, fabricant, mémoire totale, date d'installation... Trop pour être lu tel quel — on le combine presque toujours avec `Select-Object` :

```powershell
Get-ComputerInfo | Select-Object CsName, OsName, OsVersion, CsProcessors, OsTotalVisibleMemorySize
```

## 19.1 WMI et CIM : la source de la plupart des informations système

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : WMI / CIM</span>
**WMI** (*Windows Management Instrumentation*) expose des milliers d'informations sur le matériel et le système sous forme de **classes** interrogeables. **CIM** (*Common Information Model*) est le standard moderne sous-jacent ; les cmdlets `*-CimInstance` (introduites avec PowerShell 3.0) remplacent les anciennes `*-WmiObject`, plus rapides et reposant sur WinRM (chapitre 25) plutôt que sur l'ancien protocole DCOM.
</div>

```powershell
Get-CimInstance -ClassName Win32_OperatingSystem
Get-CimInstance -ClassName Win32_Processor
Get-CimInstance -ClassName Win32_BIOS
Get-CimInstance -ClassName Win32_ComputerSystem
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Get-WmiObject est obsolète, ne jamais l'utiliser dans du code neuf</span>
`Get-WmiObject` a été retiré de PowerShell 7+ (Core) — seul `Get-CimInstance` fonctionne sur les deux versions (5.1 et 7), plus rapide et compatible avec l'administration distante sécurisée.
</div>

## 19.2 Classes CIM courantes

| Classe | Contenu |
|---|---|
| `Win32_OperatingSystem` | Version de Windows, date de démarrage, mémoire totale |
| `Win32_Processor` | Modèle CPU, nombre de cœurs, vitesse |
| `Win32_LogicalDisk` | Disques logiques (lettres, espace libre) |
| `Win32_BIOS` | Fabricant, version, date du BIOS |
| `Win32_ComputerSystem` | Fabricant, modèle, mémoire physique installée |
| `Win32_NetworkAdapterConfiguration` | Configuration IP détaillée par carte réseau |
| `Win32_QuickFixEngineering` | Mises à jour (patches) installées |

```powershell
Get-CimInstance Win32_LogicalDisk | Select-Object DeviceID, @{N="EspaceLibreGo";E={[math]::Round($_.FreeSpace/1GB,2)}}

Get-CimInstance Win32_QuickFixEngineering | Sort-Object InstalledOn -Descending | Select-Object -First 5
```

## 19.3 CPU, RAM, disque, réseau, utilisateur, machine : le tour complet

```powershell
# CPU
Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, MaxClockSpeed

# RAM (totale, via Win32_ComputerSystem)
$systeme = Get-CimInstance Win32_ComputerSystem
[math]::Round($systeme.TotalPhysicalMemory / 1GB, 2)

# Disque
Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" |
    Select-Object DeviceID, @{N="LibreGo";E={[math]::Round($_.FreeSpace/1GB,2)}}, @{N="TotalGo";E={[math]::Round($_.Size/1GB,2)}}

# BIOS
Get-CimInstance Win32_BIOS | Select-Object Manufacturer, SMBIOSBIOSVersion, ReleaseDate

# Systeme d'exploitation
Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, OSArchitecture

# Carte reseau (apercu, detaille au chapitre 20)
Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=True" | Select-Object Description, IPAddress

# Utilisateur et machine
$env:USERNAME
$env:COMPUTERNAME
```

## 19.4 Filtrer avec WQL (WMI Query Language)

```powershell
Get-CimInstance -Query "SELECT Caption, FreeSpace FROM Win32_LogicalDisk WHERE FreeSpace < 10000000000"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 WQL ressemble à SQL, mais reste optionnel</span>
Le même résultat peut presque toujours être obtenu en combinant `Get-CimInstance -ClassName X | Where-Object {...}` — WQL (`-Query`) devient surtout utile pour filtrer **côté serveur distant**, réduisant la quantité de données transférées sur le réseau lors d'une requête à distance (chapitre 25, Remoting).
</div>

## 19.5 Assembler un rapport d'inventaire complet

```powershell
function Get-InventaireMachine {
    $os        = Get-CimInstance Win32_OperatingSystem
    $cpu       = Get-CimInstance Win32_Processor
    $systeme   = Get-CimInstance Win32_ComputerSystem
    $disques   = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"

    [PSCustomObject]@{
        Machine   = $systeme.Name
        Fabricant = $systeme.Manufacturer
        Modele    = $systeme.Model
        OS        = $os.Caption
        RAM_Go    = [math]::Round($systeme.TotalPhysicalMemory / 1GB, 2)
        CPU       = $cpu.Name
        Coeurs    = $cpu.NumberOfCores
        Disques   = ($disques | ForEach-Object { "$($_.DeviceID) : $([math]::Round($_.FreeSpace/1GB,1))Go libres / $([math]::Round($_.Size/1GB,1))Go" }) -join " | "
    }
}

Get-InventaireMachine
```

Cette fonction sert de base directe au chapitre 31 (Projet 2 — Inventaire système).

## Bonnes pratiques

- Toujours préférer `Get-CimInstance` à `Get-WmiObject` (obsolète).
- Utiliser `-Filter` ou `-Query` pour réduire la charge, surtout sur une requête distante.
- Toujours convertir les valeurs en octets (`FreeSpace`, `TotalPhysicalMemory`) en Go/Mo lisibles avec `[math]::Round(... / 1GB, 2)`.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 19.1</span>

Affiche le nom, le fabricant et la date de sortie du BIOS de la machine locale.
</div>

**✅ Correction.**
```powershell
Get-CimInstance Win32_BIOS | Select-Object Name, Manufacturer, ReleaseDate
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 19.2</span>

Liste tous les disques logiques dont l'espace libre est inférieur à 15 %, avec le pourcentage exact affiché.
</div>

**✅ Correction.**
```powershell
Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" |
    Select-Object DeviceID, @{N="PourcentLibre";E={[math]::Round(($_.FreeSpace/$_.Size)*100,1)}} |
    Where-Object { $_.PourcentLibre -lt 15 }
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 19.3</span>

Sans documentation, essaie de deviner quelle classe CIM contient la liste des mises à jour Windows installées, puis vérifie et affiche les 3 plus récentes.
</div>

**✅ Correction du défi.**
```powershell
Get-CimInstance Win32_QuickFixEngineering | Sort-Object InstalledOn -Descending | Select-Object -First 3
```
`Win32_QuickFixEngineering` (section 19.2) est le nom historique, peu intuitif, de la classe des correctifs installés — un bon réflexe face à un nom pareil est `Get-CimClass -ClassName Win32_*Fix*` pour le retrouver par mots-clés plutôt que de le mémoriser.

## 🎯 Ce que tu sais maintenant

- `Get-ComputerInfo` donne un aperçu rapide ; `Get-CimInstance` (avec les classes `Win32_*`) donne un accès précis à chaque composant.
- CPU, RAM, disque, BIOS, OS, réseau, utilisateur et nom de machine sont tous accessibles par script, sans jamais ouvrir le Gestionnaire des tâches.
- `Get-WmiObject` est obsolète ; `Get-CimInstance` est la cmdlet moderne de référence.

*Ceci clôt la Partie 11 (administration Windows). Chapitre suivant : le diagnostic réseau, de ipconfig à Test-NetConnection.*
