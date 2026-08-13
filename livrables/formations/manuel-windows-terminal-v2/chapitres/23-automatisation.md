<div class="chapitre-titre-num">CHAPITRE 23</div>

# Automatiser ses tâches

## 🎯 Objectifs

Planifier l'exécution automatique d'un script avec le Planificateur de tâches Windows, et construire des scripts réutilisables de sauvegarde, nettoyage, rapport et surveillance.

## Prérequis

Chapitres 11, 17-22.

## 🧠 Comprendre : exécuter un script sans être devant l'écran

**Le problème.** Un script de sauvegarde n'a de valeur que s'il s'exécute **même quand personne n'y pense** — chaque nuit, par exemple. Il faut un mécanisme pour déclencher un script automatiquement, à une heure précise ou selon un événement.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Le **Planificateur de tâches** est un réveil programmable pour la machine : "à 2h du matin, exécute cette recette", sans qu'un humain n'ait besoin d'être présent pour appuyer sur "démarrer".
</div>

## 💻 Démonstration : une tâche planifiée minimale

```powershell
$action = New-ScheduledTaskAction -Execute "pwsh.exe" -Argument "-File C:\Scripts\sauvegarde.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName "SauvegardeQuotidienne" -Action $action -Trigger $trigger -Principal $principal
```

## 🔍 Décortiquons

<div class="encadre astuce">
<span class="encadre-titre">💡 Trois briques pour définir une tâche planifiée</span>
`New-ScheduledTaskAction` définit **quoi** exécuter ; `New-ScheduledTaskTrigger` définit **quand** (quotidien, au démarrage, à la connexion...) ; `New-ScheduledTaskPrincipal` définit **avec quel compte/niveau de droits** (rappel du chapitre 22, principe du moindre privilège — n'utiliser `SYSTEM`/`Highest` que si réellement nécessaire). `-RunLevel Highest` exécute la tâche avec des droits administrateur.
</div>

```powershell
Get-ScheduledTask -TaskName "SauvegardeQuotidienne"
Start-ScheduledTask -TaskName "SauvegardeQuotidienne"     ← declenche IMMEDIATEMENT, sans attendre le trigger
Disable-ScheduledTask -TaskName "SauvegardeQuotidienne"
Unregister-ScheduledTask -TaskName "SauvegardeQuotidienne" -Confirm:$false
```

## 23.1 Autres déclencheurs courants

```powershell
New-ScheduledTaskTrigger -AtStartup                        ← au demarrage de Windows
New-ScheduledTaskTrigger -AtLogOn                            ← a la connexion de l'utilisateur
New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At "09:00"
New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(10) ← une seule fois, dans 10 minutes
```

## 23.2 Script de sauvegarde réutilisable

```powershell
function Backup-Dossier {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$Source,
        [Parameter(Mandatory=$true)][string]$Destination,
        [string]$LogPath = "C:\Logs\sauvegarde.log"
    )

    $horodatage = Get-Date -Format "yyyy-MM-dd_HH-mm"
    $dossierCible = Join-Path $Destination "Backup_$horodatage"

    robocopy $Source $dossierCible /mir /r:3 /w:5 /log:$LogPath | Out-Null

    if ($LASTEXITCODE -ge 8) {
        Write-Warning "Sauvegarde échouée (code $LASTEXITCODE), voir $LogPath"
    } else {
        Write-Output "Sauvegarde réussie vers $dossierCible"
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 $LASTEXITCODE après un robocopy en PowerShell</span>
Rappel du chapitre 6/8 (codes de sortie robocopy) : `$LASTEXITCODE` reprend, en PowerShell, exactement le même code que `%ERRORLEVEL%` en CMD après un programme externe. `-ge 8` détecte une vraie erreur, jamais un simple succès partiel.
</div>

## 23.3 Script de nettoyage

```powershell
function Clear-FichiersTemporaires {
    [CmdletBinding()]
    param(
        [int]$JoursAnciennete = 7
    )

    $seuil = (Get-Date).AddDays(-$JoursAnciennete)
    $fichiers = Get-ChildItem -Path $env:TEMP -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -lt $seuil }

    Write-Output "$($fichiers.Count) fichier(s) temporaire(s) de plus de $JoursAnciennete jours trouvés."
    $fichiers | Remove-Item -Force -ErrorAction SilentlyContinue
}
```

## 23.4 Script de rapport

```powershell
function New-RapportSysteme {
    [CmdletBinding()]
    param([string]$CheminSortie = "C:\Rapports\rapport-$(Get-Date -Format 'yyyy-MM-dd').html")

    $disques = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" |
        Select-Object DeviceID, @{N="LibreGo";E={[math]::Round($_.FreeSpace/1GB,2)}}

    $services = Get-Service | Where-Object { $_.StartType -eq "Automatic" -and $_.Status -ne "Running" }

    $disques | ConvertTo-Html -Property DeviceID, LibreGo -Title "Rapport système" |
        Out-File $CheminSortie

    Write-Output "Rapport généré : $CheminSortie ($($services.Count) service(s) à vérifier)"
}
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : ConvertTo-Html</span>
`ConvertTo-Html` transforme une collection d'objets PowerShell en page HTML basique, exploitable pour un rapport lisible dans un navigateur — un pont direct entre le monde des objets (chapitre 12) et un format de présentation.
</div>

## 23.5 Script de surveillance

```powershell
function Watch-EspaceDisque {
    [CmdletBinding()]
    param([double]$SeuilAlertePourcent = 15)

    Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | ForEach-Object {
        $pourcentLibre = [math]::Round(($_.FreeSpace / $_.Size) * 100, 1)
        if ($pourcentLibre -lt $SeuilAlertePourcent) {
            Write-Warning "$($_.DeviceID) : seulement $pourcentLibre% d'espace libre !"
        }
    }
}
```

Ces quatre fonctions constituent la base directe du chapitre 36 (Projet 7 — Système de sauvegarde) et du chapitre 32 (Projet 3 — Surveillance).

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier de tester une tâche planifiée avant d'attendre son déclencheur</span>
Une tâche planifiée créée avec une erreur de chemin ou de droits échouera silencieusement à 2h du matin, sans que personne ne le remarque avant des jours. Toujours la déclencher manuellement (`Start-ScheduledTask`) immédiatement après sa création, et vérifier le résultat.
</div>

## Bonnes pratiques

- Toujours utiliser `-PassThru`/tester manuellement une tâche planifiée immédiatement après sa création.
- Documenter chaque tâche planifiée créée (`-Description` sur `Register-ScheduledTask`), pour qu'un autre administrateur comprenne son rôle des mois plus tard.
- Écrire un journal (`-log:` sur robocopy, ou un fichier de log dédié) pour toute automatisation destinée à tourner sans surveillance.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 23.1</span>

Crée une tâche planifiée qui exécute `C:\Scripts\nettoyage.ps1` chaque lundi à 08h00, avec les droits SYSTEM.
</div>

**✅ Correction.**
```powershell
$action = New-ScheduledTaskAction -Execute "pwsh.exe" -Argument "-File C:\Scripts\nettoyage.ps1"
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At "08:00"
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "NettoyageHebdo" -Action $action -Trigger $trigger -Principal $principal
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 23.2</span>

Utilise la fonction `Clear-FichiersTemporaires` (section 23.3) pour supprimer les fichiers temporaires de plus de 30 jours, puis vérifie combien il en restait avant suppression.
</div>

**✅ Correction.**
```powershell
Clear-FichiersTemporaires -JoursAnciennete 30 -Verbose
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 23.3</span>

Combine `Backup-Dossier` et `Watch-EspaceDisque` en une seule tâche planifiée quotidienne : la sauvegarde ne doit s'exécuter que si l'espace libre du disque de destination dépasse 15 %.
</div>

**✅ Correction du défi.**
```powershell
function Backup-Conditionnel {
    param([string]$Source, [string]$Destination)

    $disque = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='D:'"
    $pourcentLibre = [math]::Round(($disque.FreeSpace / $disque.Size) * 100, 1)

    if ($pourcentLibre -lt 15) {
        Write-Warning "Espace insuffisant sur D: ($pourcentLibre%), sauvegarde annulée."
        return
    }
    Backup-Dossier -Source $Source -Destination $Destination
}
```
Cette combinaison illustre le principe central de ce chapitre : une automatisation robuste **vérifie ses propres conditions préalables**, plutôt que de supposer que tout ira bien.

## 🎯 Ce que tu sais maintenant

- Une tâche planifiée s'assemble en trois briques : Action (quoi), Trigger (quand), Principal (avec quels droits).
- `robocopy` (rappel chapitre 6) reste l'outil de sauvegarde de référence, avec `$LASTEXITCODE` pour vérifier le succès en PowerShell.
- Des fonctions réutilisables (sauvegarde, nettoyage, rapport, surveillance) combinées à une tâche planifiée forment une automatisation complète et autonome.

*Chapitre suivant : construire ses propres modules PowerShell, réutilisables d'un script à l'autre.*
