<div class="chapitre-titre-num">ANNEXE E</div>

# Cheat sheet — 50 commandes d'administration Windows

<div class="encadre astuce">
<span class="encadre-titre">💡 Format de cette annexe</span>
Pour chaque commande : son rôle, puis un exemple. Regroupe processus, services, système, sécurité et automatisation (chapitres 17-23).
</div>

## Processus

- `Get-Process` → liste les processus actifs → `Get-Process`
- `Start-Process` → démarre un programme → `Start-Process notepad.exe`
- `Start-Process -PassThru` → démarre et récupère l'objet processus → `$p = Start-Process notepad.exe -PassThru`
- `Stop-Process` → arrête un processus → `Stop-Process -Name notepad -Force`
- `Wait-Process` → attend la fin d'un processus → `Wait-Process -Name notepad`

## Services

- `Get-Service` → liste les services et leur état → `Get-Service`
- `Start-Service` → démarre un service → `Start-Service -Name Spooler`
- `Stop-Service` → arrête un service → `Stop-Service -Name Spooler -Force`
- `Restart-Service` → redémarre un service → `Restart-Service -Name Spooler`
- `Set-Service` → change le type de démarrage → `Set-Service -Name Spooler -StartupType Automatic`

## Informations système

- `Get-ComputerInfo` → vue d'ensemble de la machine → `Get-ComputerInfo`
- `Get-CimInstance Win32_OperatingSystem` → détails OS → `Get-CimInstance Win32_OperatingSystem`
- `Get-CimInstance Win32_Processor` → détails CPU → `Get-CimInstance Win32_Processor`
- `Get-CimInstance Win32_LogicalDisk` → détails disques → `Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"`
- `Get-CimInstance Win32_BIOS` → détails BIOS → `Get-CimInstance Win32_BIOS`
- `Get-Volume` → volumes et espace disque → `Get-Volume`
- `Get-HotFix` → mises à jour installées → `Get-HotFix \| Sort-Object InstalledOn -Descending`

## Sécurité

- `Get-Acl` → permissions d'un fichier/dossier → `Get-Acl C:\Projets`
- `Set-Acl` → modifie les permissions → `Set-Acl -Path C:\Projets -AclObject $acl`
- `icacls` → permissions NTFS en ligne de commande → `icacls C:\Projets /grant Marie:R`
- `Get-ExecutionPolicy` → politique d'exécution active → `Get-ExecutionPolicy -List`
- `Set-ExecutionPolicy` → change la politique d'exécution → `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
- `Unblock-File` → débloque un fichier téléchargé → `Unblock-File -Path script.ps1`
- `Get-MpComputerStatus` → état de Windows Defender → `Get-MpComputerStatus`
- `Start-MpScan` → lance une analyse antivirus → `Start-MpScan -ScanType QuickScan`
- `Get-NetFirewallRule` → règles de pare-feu → `Get-NetFirewallRule`
- `Set-Secret` / `Get-Secret` → gestion sécurisée de secrets → `Set-Secret -Name "Mdp" -Secret "..."`

## Automatisation et tâches planifiées

- `Register-ScheduledTask` → crée une tâche planifiée → voir chapitre 23
- `Get-ScheduledTask` → liste les tâches planifiées → `Get-ScheduledTask`
- `Start-ScheduledTask` → déclenche une tâche immédiatement → `Start-ScheduledTask -TaskName "Sauvegarde"`
- `Get-ScheduledTaskInfo` → dernier résultat d'exécution → `Get-ScheduledTaskInfo -TaskName "Sauvegarde"`
- `Disable-ScheduledTask` → désactive sans supprimer → `Disable-ScheduledTask -TaskName "Sauvegarde"`
- `Unregister-ScheduledTask` → supprime une tâche → `Unregister-ScheduledTask -TaskName "Sauvegarde" -Confirm:$false`

## Fichiers et disques

- `robocopy` → copie/synchronisation robuste → `robocopy C:\Src D:\Dst /mir`
- `Get-ChildItem -Recurse` → parcours récursif → `Get-ChildItem C:\Projets -Recurse`
- `Compress-Archive` → créer une archive ZIP → `Compress-Archive -Path C:\Projets -DestinationPath archive.zip`
- `Expand-Archive` → extraire une archive ZIP → `Expand-Archive -Path archive.zip -DestinationPath C:\Extrait`
- `Get-FileHash` → empreinte cryptographique d'un fichier → `Get-FileHash fichier.zip -Algorithm SHA256`
- `Clear-RecycleBin` → vider la Corbeille → `Clear-RecycleBin -Confirm:$false`
- `chkdsk` → vérifier un disque → `chkdsk C: /f`
- `sfc /scannow` → réparer les fichiers système protégés → `sfc /scannow`
- `dism /Online /Cleanup-Image /RestoreHealth` → réparer l'image Windows → `dism /Online /Cleanup-Image /RestoreHealth`

## Modules et remoting

- `Import-Module` → charge un module → `Import-Module Az`
- `Install-Module` → installe un module depuis la Gallery → `Install-Module Az -Scope CurrentUser`
- `Invoke-Command` → exécute à distance → `Invoke-Command -ComputerName SRV01 -ScriptBlock { Get-Service }`
- `New-PSSession` → session distante persistante → `New-PSSession -ComputerName SRV01`
- `Enter-PSSession` → session interactive distante → `Enter-PSSession -ComputerName SRV01`

## Journalisation et diagnostic

- `Get-WinEvent` → journaux d'événements modernes → `Get-WinEvent -LogName System -MaxEvents 20`
- `Get-EventLog` → journaux d'événements (historique) → `Get-EventLog -LogName Application -Newest 10`
- `Write-Verbose` → trace de diagnostic activable → `Write-Verbose "Étape terminée" -Verbose`
- `Measure-Command` → mesure le temps d'exécution → `Measure-Command { Get-ChildItem C:\ -Recurse }`
- `Start-Transcript` → enregistre toute une session dans un fichier → `Start-Transcript -Path session.log`

*Annexe suivante : cheat sheet des 50 commandes PowerShell pour développeurs.*
