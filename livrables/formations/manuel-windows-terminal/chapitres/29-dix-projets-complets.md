<div class="chapitre-titre-num">CHAPITRE 29</div>

# Dix projets complets

## Objectifs pédagogiques

Mettre en pratique l'ensemble des notions du manuel (CMD, PowerShell, objets, fonctions, réseau, sécurité, CIM, automatisation) à travers dix outils complets et directement réutilisables dans un contexte professionnel réel.

## Prérequis

L'ensemble des chapitres 1 à 28.

<div class="encadre astuce">
<span class="encadre-titre">💡 Comment utiliser ce chapitre</span>
Chaque projet est autonome : script complet, commenté, accompagné d'une explication des choix techniques. Certains projets réutilisent et enrichissent des fonctions déjà écrites dans les chapitres précédents (`Test-PortsOuverts` du chapitre 18, `Get-InventaireMachine` du chapitre 20) — l'objectif est de montrer comment un outil "jouet" d'exercice devient, avec quelques ajouts (paramètres, journalisation, gestion d'erreurs), un vrai outil de production.
</div>

---

## 29.1 Projet 1 : Gestionnaire de sauvegarde automatisé

**Objectif :** sauvegarder un ou plusieurs dossiers vers une destination, avec horodatage, compression, et purge des sauvegardes trop anciennes.

```powershell
<#
.SYNOPSIS
    Sauvegarde des dossiers sources vers une destination, avec purge automatique.
.EXAMPLE
    .\Backup-Dossiers.ps1 -Sources "C:\Projets","C:\Documents" -Destination "D:\Backups" -RetentionJours 30
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string[]]$Sources,

    [Parameter(Mandatory=$true)]
    [string]$Destination,

    [int]$RetentionJours = 30
)

$ErrorActionPreference = "Stop"

function Write-LogSauvegarde {
    param([string]$Message)
    $ligne = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
    Add-Content -Path (Join-Path $Destination "sauvegarde.log") -Value $ligne
    Write-Output $ligne
}

function Backup-UnDossier {
    param([string]$CheminSource)

    if (-not (Test-Path $CheminSource)) {
        Write-LogSauvegarde "IGNORE : $CheminSource introuvable"
        return
    }

    $nomDossier = Split-Path $CheminSource -Leaf
    $horodatage = Get-Date -Format "yyyy-MM-dd_HHmmss"
    $nomArchive = Join-Path $Destination "$nomDossier`_$horodatage.zip"

    Compress-Archive -Path "$CheminSource\*" -DestinationPath $nomArchive
    Write-LogSauvegarde "OK : $CheminSource -> $nomArchive"
}

function Remove-SauvegardesAnciennes {
    $limite = (Get-Date).AddDays(-$RetentionJours)
    Get-ChildItem -Path $Destination -Filter "*.zip" |
        Where-Object { $_.LastWriteTime -lt $limite } |
        ForEach-Object {
            Remove-Item $_.FullName -Force
            Write-LogSauvegarde "PURGE : $($_.Name) (plus vieux que $RetentionJours jours)"
        }
}

try {
    if (-not (Test-Path $Destination)) { New-Item -ItemType Directory -Path $Destination -Force | Out-Null }

    foreach ($source in $Sources) { Backup-UnDossier -CheminSource $source }
    Remove-SauvegardesAnciennes

    Write-LogSauvegarde "Sauvegarde terminee avec succes."
} catch {
    Write-LogSauvegarde "ERREUR CRITIQUE : $($_.Exception.Message)"
    throw
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Choix techniques</span>
`[string[]]$Sources` (chapitre 14) accepte un ou plusieurs dossiers en une seule invocation. La journalisation (chapitre 28) écrit dans le dossier de destination lui-même, la rendant consultable même après suppression du script. La purge (chapitre 17, `Compress-Archive`) s'appuie sur `LastWriteTime`, cohérent avec les critères déjà vus au chapitre 17 pour filtrer des fichiers par date.
</div>

---

## 29.2 Projet 2 : Nettoyeur Windows

**Objectif :** libérer de l'espace disque en supprimant fichiers temporaires, cache, et corbeille, avec un mode simulation (`-WhatIf`) avant suppression réelle.

```powershell
<#
.SYNOPSIS
    Nettoie les fichiers temporaires et la corbeille pour liberer de l'espace disque.
.EXAMPLE
    .\Clear-SystemeWindows.ps1 -WhatIf
    .\Clear-SystemeWindows.ps1
#>
[CmdletBinding(SupportsShouldProcess=$true)]
param()

function Get-TailleDossier {
    param([string]$Chemin)
    if (Test-Path $Chemin) {
        (Get-ChildItem -Path $Chemin -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    } else { 0 }
}

$dossiersACibler = @(
    "$env:TEMP",
    "C:\Windows\Temp",
    "$env:LOCALAPPDATA\Microsoft\Windows\INetCache"
)

$espaceLibereTotal = 0

foreach ($dossier in $dossiersACibler) {
    if (-not (Test-Path $dossier)) { continue }

    $tailleAvant = Get-TailleDossier -Chemin $dossier

    if ($PSCmdlet.ShouldProcess($dossier, "Vider le contenu")) {
        Get-ChildItem -Path $dossier -Recurse -ErrorAction SilentlyContinue |
            Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    }

    $espaceLibereTotal += $tailleAvant
    Write-Output "$dossier : $([math]::Round($tailleAvant/1MB,2)) Mo identifies"
}

if ($PSCmdlet.ShouldProcess("Corbeille", "Vider")) {
    Clear-RecycleBin -Force -ErrorAction SilentlyContinue
}

Write-Output "`nEspace total identifie pour nettoyage : $([math]::Round($espaceLibereTotal/1MB,2)) Mo"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 SupportsShouldProcess : le -WhatIf natif de PowerShell</span>
`[CmdletBinding(SupportsShouldProcess=$true)]` combiné à `$PSCmdlet.ShouldProcess(...)` ajoute gratuitement le support de `-WhatIf` (simule sans agir) et `-Confirm` (demande confirmation ligne par ligne) — un pattern standard pour tout script effectuant des suppressions, permettant de vérifier l'impact avant exécution réelle.
</div>

---

## 29.3 Projet 3 : Gestionnaire de processus interactif

**Objectif :** afficher les processus consommant le plus de ressources et permettre d'en arrêter un de façon interactive et sécurisée.

```powershell
<#
.SYNOPSIS
    Affiche les processus les plus gourmands et permet d'en arreter un.
.EXAMPLE
    .\Manage-Processus.ps1 -Top 10
#>
[CmdletBinding()]
param([int]$Top = 10)

function Show-ProcessusGourmands {
    Get-Process |
        Sort-Object -Property CPU -Descending |
        Select-Object -First $Top -Property Id, ProcessName,
            @{N="CPU_s";E={[math]::Round($_.CPU,1)}},
            @{N="RAM_Mo";E={[math]::Round($_.WorkingSet64/1MB,1)}} |
        Format-Table -AutoSize
}

function Stop-ProcessusInteractif {
    Show-ProcessusGourmands

    $pid_cible = Read-Host "`nEntrez l'ID (PID) du processus a arreter (ou 'annuler')"
    if ($pid_cible -eq "annuler") { return }

    $processus = Get-Process -Id $pid_cible -ErrorAction SilentlyContinue
    if (-not $processus) {
        Write-Warning "Aucun processus avec ce PID."
        return
    }

    $confirmation = Read-Host "Confirmer l'arret de '$($processus.ProcessName)' (PID $pid_cible) ? (oui/non)"
    if ($confirmation -eq "oui") {
        Stop-Process -Id $pid_cible -Force
        Write-Output "Processus $($processus.ProcessName) arrete."
    }
}

Stop-ProcessusInteractif
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Double confirmation avant une action destructive interactive</span>
Contrairement à un script d'automatisation (où `-Force` est acceptable, chapitre 15), un outil interactif utilisé par un humain gagne à demander une confirmation explicite en texte libre (`Read-Host`) avant d'arrêter un processus — évite qu'une faute de frappe sur le PID ne termine le mauvais programme.
</div>

---

## 29.4 Projet 4 : Scanner réseau

**Objectif :** analyser une plage d'adresses IP et une liste de ports pour identifier les machines actives et leurs services ouverts, en enrichissant `Test-PortsOuverts` du chapitre 18.

```powershell
<#
.SYNOPSIS
    Scanne une plage d'adresses IP et une liste de ports.
.EXAMPLE
    .\Scan-Reseau.ps1 -Prefixe "192.168.1" -Debut 1 -Fin 254 -Ports 80,443,22,3389
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$Prefixe,

    [int]$Debut = 1,
    [int]$Fin = 254,

    [int[]]$Ports = @(80, 443, 22, 3389, 445)
)

function Test-MachineActive {
    param([string]$Ip)
    Test-Connection -ComputerName $Ip -Count 1 -Quiet -ErrorAction SilentlyContinue
}

function Test-PortsOuverts {
    param([string]$Ip, [int[]]$Ports)
    foreach ($port in $Ports) {
        $resultat = Test-NetConnection -ComputerName $Ip -Port $port -WarningAction SilentlyContinue
        if ($resultat.TcpTestSucceeded) {
            [PSCustomObject]@{ IP = $Ip; Port = $port; Etat = "Ouvert" }
        }
    }
}

$resultats = @()

for ($i = $Debut; $i -le $Fin; $i++) {
    $ip = "$Prefixe.$i"
    Write-Progress -Activity "Scan reseau" -Status $ip -PercentComplete ((($i - $Debut) / ($Fin - $Debut)) * 100)

    if (Test-MachineActive -Ip $ip) {
        Write-Output "Machine active : $ip"
        $resultats += Test-PortsOuverts -Ip $ip -Ports $Ports
    }
}

Write-Progress -Activity "Scan reseau" -Completed
$resultats | Format-Table -AutoSize
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Write-Progress : une barre de progression native pour un scan long</span>
Balayer 254 adresses IP peut prendre plusieurs minutes ; `Write-Progress` affiche une barre de progression native dans la console, rassurant l'utilisateur que le script n'est pas figé — un ajout simple mais déterminant pour l'expérience d'un outil long à exécuter.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un scan de ports sur un réseau qui ne vous appartient pas est illégal</span>
Ce script ne doit être exécuté que sur des réseaux dont vous avez l'autorisation explicite d'analyse (votre propre réseau domestique, un réseau d'entreprise avec accord IT) — scanner un réseau tiers sans autorisation constitue une intrusion informatique dans la plupart des juridictions.
</div>

---

## 29.5 Projet 5 : Surveillance de serveur

**Objectif :** surveiller en continu CPU, RAM, disque et services critiques, avec alerte si un seuil est dépassé.

```powershell
<#
.SYNOPSIS
    Surveille CPU, RAM, disque et services critiques, avec alerte sur seuil.
.EXAMPLE
    .\Watch-Serveur.ps1 -ServicesCritiques "Spooler","W32Time" -SeuilCpu 90 -SeuilDisque 10
#>
[CmdletBinding()]
param(
    [string[]]$ServicesCritiques = @(),
    [int]$SeuilCpu = 90,
    [int]$SeuilDisqueLibrePourcent = 10,
    [int]$IntervalleSecondes = 30
)

function Write-Alerte {
    param([string]$Message)
    Write-Warning $Message
    Add-Content -Path "C:\Logs\alertes-serveur.log" -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ALERTE : $Message"
}

function Test-Ressources {
    $cpu = (Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
    if ($cpu -gt $SeuilCpu) { Write-Alerte "CPU a $cpu% (seuil : $SeuilCpu%)" }

    Get-Volume | Where-Object { $_.DriveLetter } | ForEach-Object {
        $pourcentLibre = ($_.SizeRemaining / $_.Size) * 100
        if ($pourcentLibre -lt $SeuilDisqueLibrePourcent) {
            Write-Alerte "Disque $($_.DriveLetter): seulement $([math]::Round($pourcentLibre,1))% libre"
        }
    }

    foreach ($nomService in $ServicesCritiques) {
        $service = Get-Service -Name $nomService -ErrorAction SilentlyContinue
        if ($service -and $service.Status -ne "Running") {
            Write-Alerte "Service critique '$nomService' est a l'etat '$($service.Status)'"
        }
    }
}

Write-Output "Surveillance demarree (Ctrl+C pour arreter)..."
while ($true) {
    Test-Ressources
    Start-Sleep -Seconds $IntervalleSecondes
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 En production, préférer une tâche planifiée récurrente à une boucle infinie</span>
Cette boucle `while ($true)` est pédagogiquement simple, mais une vraie infrastructure préfère une tâche planifiée (chapitre 15) exécutée toutes les 5 minutes — plus résiliente (redémarre automatiquement après un crash du script), et ne monopolise pas indéfiniment une session PowerShell ouverte.
</div>

---

## 29.6 Projet 6 : Inventaire matériel et logiciel complet

**Objectif :** générer un rapport CSV complet (matériel, OS, logiciels installés) sur une ou plusieurs machines, en enrichissant `Get-InventaireMachine` du chapitre 20.

```powershell
<#
.SYNOPSIS
    Genere un rapport d'inventaire materiel et logiciel au format CSV.
.EXAMPLE
    .\Get-InventaireComplet.ps1 -ComputerName "PC01","PC02" -CheminRapport "C:\Rapports\inventaire.csv"
#>
[CmdletBinding()]
param(
    [string[]]$ComputerName = @($env:COMPUTERNAME),
    [string]$CheminRapport = "inventaire.csv"
)

function Get-InventaireUneMachine {
    param([string]$Machine)

    try {
        $params = @{ ComputerName = $Machine; ErrorAction = "Stop" }
        $os      = Get-CimInstance Win32_OperatingSystem @params
        $cpu     = Get-CimInstance Win32_Processor @params
        $systeme = Get-CimInstance Win32_ComputerSystem @params
        $disques = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" @params
        $logiciels = Get-CimInstance Win32_Product @params

        [PSCustomObject]@{
            Machine       = $Machine
            Fabricant     = $systeme.Manufacturer
            Modele        = $systeme.Model
            OS            = $os.Caption
            RAM_Go        = [math]::Round($systeme.TotalPhysicalMemory / 1GB, 2)
            CPU           = $cpu.Name
            DisqueLibreGo = ($disques | Measure-Object -Property FreeSpace -Sum).Sum / 1GB
            NbLogiciels   = $logiciels.Count
        }
    } catch {
        Write-Warning "Impossible d'interroger $Machine : $($_.Exception.Message)"
        [PSCustomObject]@{ Machine = $Machine; Fabricant = "ERREUR"; Modele = $_.Exception.Message }
    }
}

$rapport = $ComputerName | ForEach-Object { Get-InventaireUneMachine -Machine $_ }
$rapport | Export-Csv -Path $CheminRapport -NoTypeInformation -Encoding UTF8

Write-Output "Rapport genere : $CheminRapport ($($rapport.Count) machine(s))"
$rapport | Format-Table -AutoSize
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Export-Csv : le format universel pour un rapport consultable dans Excel</span>
`-NoTypeInformation` évite qu'Export-Csv n'ajoute une ligne d'en-tête technique (`#TYPE System.Management...`) qui perturberait l'ouverture directe dans Excel — un ajustement mineur mais qui distingue un rapport professionnel d'un export brut.
</div>

---

## 29.7 Projet 7 : Gestionnaire d'utilisateurs en masse

**Objectif :** créer plusieurs comptes utilisateurs locaux depuis un fichier CSV, avec mot de passe généré aléatoirement et export sécurisé des identifiants.

```powershell
<#
.SYNOPSIS
    Cree des comptes utilisateurs locaux en masse depuis un fichier CSV.
.EXAMPLE
    .\New-UtilisateursEnMasse.ps1 -CheminCsv "nouveaux_employes.csv"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [ValidateScript({ Test-Path $_ })]
    [string]$CheminCsv
)

function New-MotDePasseAleatoire {
    $caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
    -join (1..14 | ForEach-Object { $caracteres[(Get-Random -Maximum $caracteres.Length)] })
}

$employes = Import-Csv -Path $CheminCsv    # colonnes attendues : NomComplet, NomUtilisateur, Departement
$resultats = @()

foreach ($employe in $employes) {
    $motDePasse = New-MotDePasseAleatoire

    try {
        New-LocalUser -Name $employe.NomUtilisateur `
            -Password (ConvertTo-SecureString $motDePasse -AsPlainText -Force) `
            -FullName $employe.NomComplet `
            -Description $employe.Departement `
            -ErrorAction Stop

        $resultats += [PSCustomObject]@{
            NomUtilisateur = $employe.NomUtilisateur
            MotDePasse     = $motDePasse
            Statut         = "Cree"
        }
    } catch {
        $resultats += [PSCustomObject]@{
            NomUtilisateur = $employe.NomUtilisateur
            MotDePasse     = "N/A"
            Statut         = "ECHEC : $($_.Exception.Message)"
        }
    }
}

$resultats | Export-Csv -Path "identifiants_generes.csv" -NoTypeInformation -Encoding UTF8
Write-Output "Traitement termine. Identifiants exportes dans identifiants_generes.csv"
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le fichier d'identifiants généré contient des mots de passe en clair</span>
`identifiants_generes.csv` doit être transmis de façon sécurisée (jamais par email non chiffré) puis **supprimé immédiatement** après transmission — rappel direct du chapitre 22 sur la gestion des secrets, appliqué ici à un cas concret de provisioning en masse.
</div>

---

## 29.8 Projet 8 : Outil de déploiement automatique

**Objectif :** déployer une application (copie de fichiers, configuration, redémarrage de service) sur une ou plusieurs machines distantes.

```powershell
<#
.SYNOPSIS
    Deploie une application sur une ou plusieurs machines distantes.
.EXAMPLE
    .\Deploy-Application.ps1 -Machines "SERVEUR01","SERVEUR02" -SourceLocale "C:\Build\app" -CheminDistant "C:\Applications\monapp" -NomService "MonAppService"
#>
[CmdletBinding(SupportsShouldProcess=$true)]
param(
    [Parameter(Mandatory=$true)]
    [string[]]$Machines,

    [Parameter(Mandatory=$true)]
    [string]$SourceLocale,

    [Parameter(Mandatory=$true)]
    [string]$CheminDistant,

    [string]$NomService
)

function Deploy-UneMachine {
    param([string]$Machine)

    Write-Output "`n=== Deploiement sur $Machine ==="

    try {
        if ($NomService) {
            Invoke-Command -ComputerName $Machine -ScriptBlock {
                param($svc)
                if (Get-Service -Name $svc -ErrorAction SilentlyContinue) {
                    Stop-Service -Name $svc -Force
                }
            } -ArgumentList $NomService
        }

        $cheminPartage = "\\$Machine\$($CheminDistant -replace ':','$')"
        if ($PSCmdlet.ShouldProcess($cheminPartage, "Copier les fichiers")) {
            Copy-Item -Path "$SourceLocale\*" -Destination $cheminPartage -Recurse -Force
        }

        if ($NomService) {
            Invoke-Command -ComputerName $Machine -ScriptBlock {
                param($svc)
                Start-Service -Name $svc
            } -ArgumentList $NomService
        }

        Write-Output "Deploiement reussi sur $Machine."
        return [PSCustomObject]@{ Machine = $Machine; Statut = "Succes" }
    } catch {
        Write-Warning "Echec du deploiement sur $Machine : $($_.Exception.Message)"
        return [PSCustomObject]@{ Machine = $Machine; Statut = "Echec : $($_.Exception.Message)" }
    }
}

$resultats = $Machines | ForEach-Object { Deploy-UneMachine -Machine $_ }
$resultats | Format-Table -AutoSize
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Arrêter le service avant de copier les fichiers évite un fichier verrouillé</span>
Un exécutable ou une DLL en cours d'utilisation par un service actif ne peut pas être remplacé (fichier verrouillé par le système) — arrêter le service, copier, puis redémarrer est la séquence standard d'un déploiement in-place, rappel implicite du chapitre 15 (gestion des services) combiné au chapitre 23 (remoting).
</div>

---

## 29.9 Projet 9 : Outil d'administration Windows tout-en-un (menu interactif)

**Objectif :** regrouper les tâches d'administration courantes (chapitres 15, 16, 19) derrière un menu interactif simple.

```powershell
<#
.SYNOPSIS
    Menu interactif regroupant les taches d'administration Windows courantes.
.EXAMPLE
    .\AdminTool.ps1
#>
[CmdletBinding()]
param()

function Show-Menu {
    Write-Output @"

===== Outil d'administration Windows =====
1. Lister les services arretes (demarrage automatique)
2. Lister les comptes utilisateurs locaux
3. Verifier l'espace disque
4. Lister les 5 processus les plus gourmands en CPU
5. Quitter
============================================
"@
}

function Invoke-ChoixMenu {
    param([string]$Choix)

    switch ($Choix) {
        "1" { Get-Service | Where-Object { $_.StartType -eq "Automatic" -and $_.Status -ne "Running" } | Format-Table -AutoSize }
        "2" { Get-LocalUser | Select-Object Name, Enabled, LastLogon | Format-Table -AutoSize }
        "3" { Get-Volume | Where-Object DriveLetter | Select-Object DriveLetter, @{N="LibreGo";E={[math]::Round($_.SizeRemaining/1GB,2)}}, @{N="TotalGo";E={[math]::Round($_.Size/1GB,2)}} | Format-Table -AutoSize }
        "4" { Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 ProcessName, Id, CPU | Format-Table -AutoSize }
        default { Write-Warning "Choix invalide." }
    }
}

$continuer = $true
while ($continuer) {
    Show-Menu
    $choix = Read-Host "Votre choix"
    if ($choix -eq "5") { $continuer = $false } else { Invoke-ChoixMenu -Choix $choix }
}

Write-Output "Fermeture de l'outil d'administration."
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un menu interactif simple rend un script accessible à un collègue non-développeur</span>
Ce pattern (boucle `while` + `switch` + `Read-Host`) transforme une collection de commandes PowerShell éparses en un vrai outil utilisable par un technicien support qui ne connaît pas PowerShell en détail — un investissement de structuration rentable dès que l'outil est partagé avec une équipe.
</div>

---

## 29.10 Projet 10 : Outil de maintenance informatique planifiée

**Objectif :** combiner nettoyage, vérification de mises à jour, et rapport de santé, à exécuter automatiquement via une tâche planifiée hebdomadaire (chapitre 15).

```powershell
<#
.SYNOPSIS
    Effectue une maintenance hebdomadaire complete : nettoyage, verification MAJ, rapport de sante.
.EXAMPLE
    .\Invoke-MaintenanceHebdomadaire.ps1
#>
[CmdletBinding()]
param([string]$CheminRapport = "C:\Logs\maintenance_$(Get-Date -Format 'yyyy-MM-dd').txt")

$ErrorActionPreference = "Continue"
$rapport = [System.Collections.Generic.List[string]]::new()

function Add-Rapport { param([string]$Texte) $rapport.Add($Texte); Write-Output $Texte }

Add-Rapport "=== Maintenance du $(Get-Date -Format 'dd/MM/yyyy HH:mm') ==="

Add-Rapport "`n-- Nettoyage --"
$tempAvant = (Get-ChildItem $env:TEMP -Recurse -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
Get-ChildItem $env:TEMP -Recurse -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Add-Rapport "Fichiers temporaires nettoyes : $([math]::Round($tempAvant/1MB,2)) Mo liberes"

Add-Rapport "`n-- Mises a jour Windows en attente --"
$sessionMaj = New-Object -ComObject Microsoft.Update.Session
$recherche = $sessionMaj.CreateUpdateSearcher()
$resultat = $recherche.Search("IsInstalled=0")
Add-Rapport "$($resultat.Updates.Count) mise(s) a jour en attente"

Add-Rapport "`n-- Sante du disque systeme --"
$disqueC = Get-Volume -DriveLetter C
$pourcentLibre = [math]::Round(($disqueC.SizeRemaining / $disqueC.Size) * 100, 1)
Add-Rapport "Disque C: $pourcentLibre% libre"
if ($pourcentLibre -lt 15) { Add-Rapport "ALERTE : espace disque faible" }

Add-Rapport "`n-- Services critiques --"
Get-Service | Where-Object { $_.StartType -eq "Automatic" -and $_.Status -ne "Running" } | ForEach-Object {
    Add-Rapport "ATTENTION : service '$($_.Name)' devrait tourner mais est '$($_.Status)'"
}

$rapport | Out-File -FilePath $CheminRapport -Encoding UTF8
Add-Rapport "`nRapport complet enregistre : $CheminRapport"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Enregistrement de ce script comme tâche planifiée hebdomadaire</span>
```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\Scripts\Invoke-MaintenanceHebdomadaire.ps1"
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "03:00"
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "MaintenanceHebdomadaire" -Action $action -Trigger $trigger -Principal $principal
```
Ce projet ferme la boucle du manuel : il combine des notions du chapitre 15 (tâches planifiées), 17 (nettoyage), 19 (services), et 28 (structure professionnelle) en un seul outil autonome et réellement déployable.
</div>

## 29.11 Résumé du chapitre

Ces dix projets démontrent comment les briques individuelles enseignées tout au long de ce manuel (objets, fonctions, CIM, réseau, sécurité, remoting) s'assemblent en outils complets, robustes et directement utilisables en environnement professionnel réel — du script personnel de nettoyage à l'outil de déploiement multi-machines.

*Chapitre suivant : les annexes de référence (commandes CMD, cmdlets PowerShell, raccourcis, expressions régulières, erreurs fréquentes, bonnes pratiques, ressources officielles).*
