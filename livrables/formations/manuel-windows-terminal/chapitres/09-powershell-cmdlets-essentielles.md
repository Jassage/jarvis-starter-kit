<div class="chapitre-titre-num">CHAPITRE 9</div>

# Les cmdlets essentielles

## Objectifs pédagogiques

Maîtriser le noyau de cmdlets utilisées quasi quotidiennement : découverte du système (`Get-Help`, `Get-Command`), information (`Get-Process`, `Get-Service`, `Get-EventLog`), et manipulation de fichiers (`Get-ChildItem`, `Copy-Item`...).

## Prérequis

Chapitre 8.

## 9.1 Get-Command : découvrir les cmdlets disponibles

```powershell
PS> Get-Command                          # liste TOUTES les cmdlets/fonctions/alias disponibles
PS> Get-Command -Verb Get                # toutes les cmdlets commençant par "Get-"
PS> Get-Command -Noun Process            # toutes les cmdlets liées à "Process" (Get-Process, Stop-Process...)
PS> Get-Command -Module Microsoft.PowerShell.Management
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Get-Command : le point de départ pour explorer un domaine inconnu</span>
Face à un besoin nouveau ("comment gérer les services ?"), `Get-Command -Noun Service` révèle immédiatement toutes les cmdlets pertinentes (`Get-Service`, `Start-Service`, `Stop-Service`, `Restart-Service`...) — souvent plus rapide qu'une recherche web.
</div>

## 9.2 Get-Process : lister et filtrer les processus

```powershell
PS> Get-Process
PS> Get-Process -Name notepad
PS> Get-Process | Sort-Object CPU -Descending | Select-Object -First 10
PS> Get-Process | Where-Object { $_.WorkingSet -gt 500MB }
```

## 9.3 Get-Service : lister et filtrer les services Windows

```powershell
PS> Get-Service
PS> Get-Service -Name "wuauserv"                     # service Windows Update
PS> Get-Service | Where-Object { $_.Status -eq "Running" }
PS> Get-Service | Where-Object { $_.StartType -eq "Automatic" -and $_.Status -eq "Stopped" }
```

Cette dernière ligne détecte les services censés démarrer automatiquement mais actuellement arrêtés — un signe potentiel de problème système.

## 9.4 Get-EventLog / Get-WinEvent : le journal des événements

```powershell
PS> Get-EventLog -LogName System -Newest 10
PS> Get-EventLog -LogName Application -EntryType Error -Newest 20

# Get-WinEvent : plus moderne, plus rapide, remplace progressivement Get-EventLog
PS> Get-WinEvent -LogName System -MaxEvents 10
PS> Get-WinEvent -FilterHashtable @{ LogName = "System"; Level = 2 } -MaxEvents 20   # Level 2 = Erreur
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Get-WinEvent est recommandé pour du code neuf</span>
`Get-EventLog` est plus simple à écrire mais plus lent et limité aux journaux "classiques" ; `Get-WinEvent` accède à **tous** les journaux (y compris ceux des applications modernes) et filtre plus efficacement via `-FilterHashtable`, directement au niveau du fournisseur d'événements plutôt qu'après récupération complète.
</div>

## 9.5 Get-ChildItem : lister fichiers et dossiers (équivalent objet de dir)

```powershell
PS> Get-ChildItem
PS> Get-ChildItem -Path C:\Projets -Recurse                  # équivalent de "dir /s"
PS> Get-ChildItem -Path C:\Projets -Filter *.txt
PS> Get-ChildItem -Path C:\Projets -Hidden                    # fichiers cachés
PS> Get-ChildItem -Path C:\Projets | Where-Object { $_.Length -gt 1MB }
```

## 9.6 Set-Location : changer de dossier (équivalent objet de cd)

```powershell
PS> Set-Location C:\Projets
PS> Set-Location ..
PS> Push-Location C:\Temp     # mémorise l'emplacement actuel avant de changer
PS> Pop-Location               # revient à l'emplacement mémorisé par Push-Location
```

## 9.7 Copy-Item, Move-Item, Remove-Item, Rename-Item, New-Item

```powershell
PS> New-Item -Path C:\Projets\NouveauDossier -ItemType Directory
PS> New-Item -Path C:\Projets\notes.txt -ItemType File

PS> Copy-Item -Path C:\Projets\rapport.docx -Destination D:\Sauvegarde\
PS> Copy-Item -Path C:\Projets -Destination D:\Sauvegarde\Projets -Recurse

PS> Move-Item -Path C:\Projets\ancien.docx -Destination D:\Archives\

PS> Rename-Item -Path C:\Projets\rapport.docx -NewName rapport-2026.docx

PS> Remove-Item -Path C:\Projets\temp.txt
PS> Remove-Item -Path C:\Projets\DossierVide -Recurse -Force
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ -Force ne signifie pas "sois plus agressif", mais "ignore certaines protections"</span>
`-Force` sur `Remove-Item` permet de supprimer des fichiers cachés/lecture-seule sans erreur, mais ne contourne **pas** une protection de sécurité réelle (permissions NTFS insuffisantes, chapitre 22) — un piège fréquent est de croire que `-Force` résout tout problème de suppression, alors qu'il ne couvre qu'un sous-ensemble précis d'obstacles.
</div>

## 9.8 Tableau récapitulatif : équivalences CMD → PowerShell

| CMD | PowerShell (nom complet) | Alias courant |
|---|---|---|
| `dir` | `Get-ChildItem` | `ls`, `gci` |
| `cd` | `Set-Location` | `cd`, `sl` |
| `copy` | `Copy-Item` | `cp`, `copy` |
| `move` | `Move-Item` | `mv`, `move` |
| `del` | `Remove-Item` | `rm`, `del` |
| `ren` | `Rename-Item` | `ren` |
| `md`/`mkdir` | `New-Item -ItemType Directory` | `mkdir`, `md` |
| `type` | `Get-Content` | `cat`, `gc` |
| `cls` | `Clear-Host` | `cls`, `clear` |
| `tasklist` | `Get-Process` | `ps`, `gps` |

## 9.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Remove-Item sur un dossier non vide sans -Recurse</span>
```powershell
Remove-Item C:\Projets\Ancien   # ❌ erreur si le dossier contient des fichiers
Remove-Item C:\Projets\Ancien -Recurse   # ✅ supprime le dossier ET son contenu
```
</div>

## 9.10 Bonnes pratiques

- Préférer `Get-WinEvent` à `Get-EventLog` pour du code neuf.
- Toujours utiliser le nom complet des cmdlets dans les scripts (rappel du chapitre 8).
- Vérifier l'existence d'un chemin (`Test-Path`, vu au chapitre 12) avant une opération destructive.

## 9.11 Résumé du chapitre

- `Get-Command`/`Get-Help` permettent une découverte autonome de n'importe quel domaine de cmdlets.
- `Get-Process`, `Get-Service`, `Get-EventLog`/`Get-WinEvent` couvrent l'observation de base d'un système Windows.
- `Get-ChildItem`, `Set-Location`, `Copy-Item`, `Move-Item`, `Remove-Item`, `Rename-Item`, `New-Item` remplacent l'ensemble des commandes de gestion de fichiers de CMD, avec en plus la richesse du filtrage par objets (`Where-Object` sur de vraies propriétés).

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 9.1</span>

Liste tous les processus consommant plus de 200 Mo de mémoire (`WorkingSet`), triés par consommation décroissante.
</div>

**Corrigé :**
```powershell
Get-Process | Where-Object { $_.WorkingSet -gt 200MB } | Sort-Object WorkingSet -Descending
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 9.2 (mini-projet)</span>

Écris une commande qui liste tous les services arrêtés dont le type de démarrage est "Automatic" (un signe potentiel de problème), et exporte le résultat dans un fichier `services-a-verifier.txt`.
</div>

**Corrigé :**
```powershell
Get-Service | Where-Object { $_.StartType -eq "Automatic" -and $_.Status -eq "Stopped" } |
    Out-File -FilePath services-a-verifier.txt
```

*Chapitre suivant : les objets PowerShell, pour comprendre en profondeur ce qui rend ce pipeline si différent de CMD/Bash.*
