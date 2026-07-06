<div class="chapitre-titre-num">CHAPITRE 20</div>

# WMI et CIM

## Objectifs pédagogiques

Comprendre ce qu'est WMI (Windows Management Instrumentation), utiliser les cmdlets CIM modernes pour interroger le matériel et le système en profondeur, et écrire des requêtes WQL simples.

## Prérequis

Chapitres 9-19.

## 20.1 Qu'est-ce que WMI/CIM ?

<div class="encadre astuce">
<span class="encadre-titre">💡 WMI : une base de données du système, interrogeable comme du SQL</span>
WMI (Windows Management Instrumentation) expose des milliers d'informations sur le matériel, le système d'exploitation et les applications sous forme de **classes** interrogeables — le BIOS, le processeur, les disques, les imprimantes, les mises à jour installées, etc. CIM (Common Information Model) est le standard sous-jacent moderne ; les cmdlets `*-CimInstance` (introduites avec PowerShell 3.0) remplacent progressivement les anciennes cmdlets `*-WmiObject`, plus rapides et reposant sur WinRM plutôt que DCOM.
</div>

```powershell
Get-CimClass -ClassName Win32_*Disk*     # explorer les classes disponibles
```

## 20.2 Get-CimInstance : la cmdlet centrale

```powershell
Get-CimInstance -ClassName Win32_OperatingSystem
Get-CimInstance -ClassName Win32_Processor
Get-CimInstance -ClassName Win32_BIOS
Get-CimInstance -ClassName Win32_ComputerSystem
```

```powershell
# Extraire seulement les informations utiles
Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, OSArchitecture, LastBootUpTime
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Get-CimInstance vs les cmdlets spécialisées (Get-Volume, Get-NetAdapter...)</span>
De nombreuses cmdlets modernes (`Get-Volume`, `Get-NetAdapter`) sont en réalité des enveloppes conviviales autour de classes CIM sous-jacentes. `Get-CimInstance` reste indispensable pour accéder à des informations pour lesquelles **aucune** cmdlet dédiée n'existe (modèle du BIOS, numéro de série de la carte mère, imprimantes installées...).
</div>

## 20.3 Classes CIM courantes

| Classe | Contenu |
|---|---|
| `Win32_OperatingSystem` | Version de Windows, date de démarrage, mémoire totale |
| `Win32_Processor` | Modèle CPU, nombre de cœurs, vitesse |
| `Win32_LogicalDisk` | Disques logiques (lettres, espace libre) |
| `Win32_BIOS` | Fabricant, version, date du BIOS |
| `Win32_ComputerSystem` | Fabricant, modèle, mémoire physique installée |
| `Win32_NetworkAdapterConfiguration` | Configuration IP détaillée par carte réseau |
| `Win32_Product` | Logiciels installés via Windows Installer (MSI) |
| `Win32_QuickFixEngineering` | Mises à jour (patches) installées |

```powershell
Get-CimInstance Win32_LogicalDisk | Select-Object DeviceID, @{N="EspaceLibreGo";E={[math]::Round($_.FreeSpace/1GB,2)}}

Get-CimInstance Win32_QuickFixEngineering | Sort-Object InstalledOn -Descending | Select-Object -First 5
```

## 20.4 Filtrer avec WQL (WMI Query Language)

```powershell
Get-CimInstance -Query "SELECT * FROM Win32_Process WHERE Name = 'notepad.exe'"

Get-CimInstance -Query "SELECT Caption, FreeSpace FROM Win32_LogicalDisk WHERE FreeSpace < 10000000000"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 WQL ressemble à SQL, mais reste optionnel</span>
Le même résultat peut presque toujours être obtenu en combinant `Get-CimInstance -ClassName X | Where-Object {...}` — WQL (`-Query`) devient surtout utile pour filtrer **côté serveur distant**, réduisant la quantité de données transférées sur le réseau lors d'une requête à distance (section 20.5).
</div>

## 20.5 Interroger une machine distante

```powershell
Get-CimInstance -ClassName Win32_OperatingSystem -ComputerName "SERVEUR01"

$session = New-CimSession -ComputerName "SERVEUR01" -Credential (Get-Credential)
Get-CimInstance -ClassName Win32_LogicalDisk -CimSession $session
Remove-CimSession $session
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Get-CimInstance à distance nécessite WinRM activé sur la cible</span>
Contrairement à l'ancienne cmdlet `Get-WmiObject` (basée sur DCOM, souvent bloquée par les pare-feux), `Get-CimInstance` utilise WinRM par défaut — la machine distante doit avoir `Enable-PSRemoting` exécuté au préalable (rappel implicite du chapitre 22 sur la sécurité et l'administration distante).
</div>

## 20.6 Invoquer une méthode WMI

```powershell
$service = Get-CimInstance -ClassName Win32_Service -Filter "Name='Spooler'"
Invoke-CimMethod -InputObject $service -MethodName StopService

# Redémarrer l'ordinateur à distance
Invoke-CimMethod -ClassName Win32_OperatingSystem -MethodName Reboot -CimSession $session
```

## 20.7 Créer un rapport d'inventaire matériel

```powershell
function Get-InventaireMachine {
    $os        = Get-CimInstance Win32_OperatingSystem
    $cpu       = Get-CimInstance Win32_Processor
    $systeme   = Get-CimInstance Win32_ComputerSystem
    $disques   = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"

    [PSCustomObject]@{
        Machine        = $systeme.Name
        Fabricant      = $systeme.Manufacturer
        Modele         = $systeme.Model
        OS             = $os.Caption
        RAM_Go         = [math]::Round($systeme.TotalPhysicalMemory / 1GB, 2)
        CPU            = $cpu.Name
        Coeurs         = $cpu.NumberOfCores
        Disques        = ($disques | ForEach-Object { "$($_.DeviceID) : $([math]::Round($_.FreeSpace/1GB,1))Go libres / $([math]::Round($_.Size/1GB,1))Go" }) -join " | "
    }
}

Get-InventaireMachine
```

Cette fonction sert de base directe au projet "inventaire matériel" du chapitre 29.

## 20.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Utiliser Get-WmiObject dans du code nouveau</span>
`Get-WmiObject` est **obsolète** depuis PowerShell 3.0 et absente de PowerShell 7+ (Core) — tout nouveau script doit utiliser `Get-CimInstance`, plus rapide, plus portable, et compatible avec WinRM pour l'accès distant sécurisé.
</div>

## 20.9 Bonnes pratiques

- Toujours préférer `Get-CimInstance`/`Invoke-CimMethod` à `Get-WmiObject`/`Invoke-WmiMethod` (obsolètes).
- Utiliser `-Filter` ou `-Query` pour réduire la charge, surtout sur une requête distante.
- Fermer explicitement une `CimSession` ouverte (`Remove-CimSession`) une fois le travail terminé.

## 20.10 Résumé du chapitre

- WMI/CIM expose le matériel et le système comme des classes interrogeables ; `Get-CimInstance` est la cmdlet moderne pour y accéder.
- WQL (`-Query`) permet un filtrage SQL-like, utile surtout pour réduire le trafic lors de requêtes distantes.
- `Invoke-CimMethod` déclenche des actions (arrêt de service, redémarrage) directement via CIM.
- Une combinaison de classes CIM (`Win32_ComputerSystem`, `Win32_Processor`, `Win32_LogicalDisk`...) permet de construire un inventaire matériel complet.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 20.1</span>

Affiche le nom, le fabricant et la date d'installation du BIOS de la machine locale.
</div>

**Corrigé :**
```powershell
Get-CimInstance Win32_BIOS | Select-Object Name, Manufacturer, ReleaseDate
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 20.2 (mini-projet)</span>

Liste tous les disques logiques dont l'espace libre est inférieur à 15 %, avec le pourcentage exact affiché.
</div>

**Corrigé :**
```powershell
Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" |
    Select-Object DeviceID, @{N="PourcentLibre";E={[math]::Round(($_.FreeSpace/$_.Size)*100,1)}} |
    Where-Object { $_.PourcentLibre -lt 15 }
```

*Chapitre suivant : introduction à Active Directory.*
