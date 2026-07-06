<div class="chapitre-titre-num">CHAPITRE 15</div>

# Gestion des processus, services et tâches planifiées

## Objectifs pédagogiques

Gérer le cycle de vie complet des processus et services Windows, et créer des tâches planifiées automatisées via PowerShell.

## Prérequis

Chapitres 9-14.

## 15.1 Processus : lister, démarrer, arrêter

```powershell
Get-Process
Get-Process -Name notepad
Start-Process notepad.exe
Start-Process -FilePath "notepad.exe" -ArgumentList "C:\notes.txt"
Stop-Process -Name notepad -Force
Stop-Process -Id 15234
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Stop-Process -Force termine BRUTALEMENT, sans sauvegarde des données ouvertes</span>
`-Force` équivaut à un "fin de tâche" forcé (comme depuis le Gestionnaire des tâches) — tout travail non sauvegardé dans l'application ciblée est perdu. À réserver aux processus réellement bloqués, jamais en usage systématique.
</div>

## 15.2 Démarrer un processus et attendre sa fin

```powershell
$processus = Start-Process -FilePath "notepad.exe" -PassThru
$processus.WaitForExit()
Write-Output "Notepad a été fermé."
```

`-PassThru` retourne l'objet processus (sinon `Start-Process` ne retourne rien par défaut), permettant d'attendre sa fin via `.WaitForExit()`.

## 15.3 Services Windows : consulter et gérer

```powershell
Get-Service
Get-Service -Name "wuauserv"
Start-Service -Name "wuauserv"
Stop-Service -Name "wuauserv" -Force
Restart-Service -Name "wuauserv"
Set-Service -Name "wuauserv" -StartupType Manual
```

```powershell
# Détecter les services arrêtés qui devraient tourner automatiquement (rappel du chapitre 9)
Get-Service | Where-Object { $_.StartType -eq "Automatic" -and $_.Status -ne "Running" }
```

## 15.4 Créer et gérer des tâches planifiées

```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\Scripts\sauvegarde.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName "SauvegardeQuotidienne" -Action $action -Trigger $trigger -Principal $principal
```

```powershell
Get-ScheduledTask -TaskName "SauvegardeQuotidienne"
Start-ScheduledTask -TaskName "SauvegardeQuotidienne"     # déclenche IMMÉDIATEMENT, sans attendre le trigger
Disable-ScheduledTask -TaskName "SauvegardeQuotidienne"
Unregister-ScheduledTask -TaskName "SauvegardeQuotidienne" -Confirm:$false
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Trois briques pour définir une tâche planifiée : Action, Trigger, Principal</span>
`New-ScheduledTaskAction` définit **quoi** exécuter ; `New-ScheduledTaskTrigger` définit **quand** (quotidien, au démarrage, à la connexion...) ; `New-ScheduledTaskPrincipal` définit **avec quel compte/niveau de droits**. `-RunLevel Highest` exécute la tâche avec des droits administrateur, indispensable pour des scripts systèmes.
</div>

## 15.5 Autres déclencheurs de tâches planifiées courants

```powershell
New-ScheduledTaskTrigger -AtStartup                        # au démarrage de Windows
New-ScheduledTaskTrigger -AtLogOn                            # à la connexion de l'utilisateur
New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At "09:00"
New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(10) # une seule fois, dans 10 minutes
```

## 15.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier -Force sur Stop-Service pour un service avec des dépendances</span>
Certains services ont d'autres services **dépendants** — `Stop-Service` seul échoue silencieusement (ou avec une erreur) si des services dépendants tournent encore ; `-Force` les arrête en cascade. Vérifier `Get-Service -Name X -RequiredServices`/`-DependentServices` avant d'arrêter un service critique en production.
</div>

## 15.7 Bonnes pratiques

- Toujours utiliser `-PassThru` avec `Start-Process` si le résultat (PID, code de sortie) doit être exploité ensuite.
- Documenter chaque tâche planifiée créée (description via `-Description` sur `Register-ScheduledTask`), pour qu'un autre administrateur comprenne son rôle des mois plus tard.
- Tester une tâche planifiée avec `Start-ScheduledTask` immédiatement après sa création, plutôt que d'attendre le déclencheur programmé.

## 15.8 Résumé du chapitre

- `Get-Process`/`Start-Process`/`Stop-Process` gèrent le cycle de vie des processus, avec `-PassThru` pour récupérer l'objet processus créé.
- `Get-Service`/`Start-Service`/`Stop-Service`/`Restart-Service`/`Set-Service` gèrent les services Windows.
- Une tâche planifiée s'assemble en trois briques : Action (quoi), Trigger (quand), Principal (avec quels droits).

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 15.1</span>

Crée une tâche planifiée qui exécute `C:\Scripts\nettoyage.ps1` chaque lundi à 08h00, avec les droits SYSTEM.
</div>

**Corrigé :**
```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\Scripts\nettoyage.ps1"
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At "08:00"
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "NettoyageHebdo" -Action $action -Trigger $trigger -Principal $principal
```

*Chapitre suivant : la gestion des utilisateurs, groupes et permissions Windows.*
