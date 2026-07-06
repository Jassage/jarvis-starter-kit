<div class="chapitre-titre-num">ANNEXE C</div>

# Raccourcis clavier et alias PowerShell

## C.1 Raccourcis Windows Terminal

| Raccourci | Action |
|---|---|
| `Ctrl+Shift+T` | Nouvel onglet |
| `Ctrl+Shift+W` | Fermer l'onglet actif |
| `Ctrl+Tab` | Onglet suivant |
| `Ctrl+Shift+Tab` | Onglet précédent |
| `Alt+Shift+D` | Nouveau volet (division horizontale/verticale automatique) |
| `Alt+Shift+-` | Nouveau volet horizontal |
| `Alt+Shift++` | Nouveau volet vertical |
| `Alt+Flèches` | Naviguer entre les volets |
| `Ctrl+Shift+P` | Ouvrir la palette de commandes |
| `Ctrl+,` | Ouvrir les paramètres |
| `Ctrl+Shift+F` | Rechercher dans le terminal |
| `Ctrl+molette souris` | Zoomer/dézoomer |
| `Ctrl+Shift+1` à `9` | Basculer vers un profil spécifique |

## C.2 Raccourcis d'édition en ligne (CMD et PowerShell)

| Raccourci | Action |
|---|---|
| `Flèche Haut` / `Bas` | Naviguer dans l'historique des commandes |
| `F7` | Afficher l'historique sous forme de menu (CMD) |
| `Tab` | Autocomplétion de fichiers/chemins/cmdlets |
| `Ctrl+C` | Interrompre la commande en cours |
| `Ctrl+L` (PowerShell 7+) | Effacer l'écran (équivalent `cls`/`Clear-Host`) |
| `Ctrl+R` (PowerShell) | Recherche inversée dans l'historique |
| `Home` / `End` | Début/fin de ligne |
| `Ctrl+Flèche gauche/droite` | Se déplacer mot par mot |
| `Ctrl+A` | Sélectionner toute la ligne (selon configuration) |

## C.3 Alias PowerShell les plus utiles

<div class="encadre astuce">
<span class="encadre-titre">💡 Get-Alias : retrouver la cmdlet réelle derrière un alias</span>
```powershell
Get-Alias ls
Get-Alias -Definition Get-ChildItem    # tous les alias pointant vers cette cmdlet
```
Les alias facilitent la frappe interactive, mais un **script** destiné à être partagé ou maintenu doit toujours utiliser le nom complet de la cmdlet (`Get-ChildItem`, pas `ls`) — rappel du principe de lisibilité déjà appliqué tout au long du manuel.
</div>

| Alias | Cmdlet réelle |
|---|---|
| `ls`, `dir`, `gci` | `Get-ChildItem` |
| `cd`, `chdir` | `Set-Location` |
| `pwd` | `Get-Location` |
| `cp`, `copy`, `cpi` | `Copy-Item` |
| `mv`, `move`, `mi` | `Move-Item` |
| `rm`, `del`, `erase`, `ri` | `Remove-Item` |
| `cat`, `type`, `gc` | `Get-Content` |
| `echo`, `write` | `Write-Output` |
| `cls`, `clear` | `Clear-Host` |
| `ps` | `Get-Process` |
| `kill` | `Stop-Process` |
| `where` | `Where-Object` |
| `%` | `ForEach-Object` |
| `?` | `Where-Object` |
| `select` | `Select-Object` |
| `sort` | `Sort-Object` |
| `gm` | `Get-Member` |
| `iwr`, `curl`, `wget` | `Invoke-WebRequest` |
| `irm` | `Invoke-RestMethod` |
| `gcm` | `Get-Command` |
| `gsv` | `Get-Service` |
| `gp` | `Get-ItemProperty` |
| `history` | `Get-History` |
| `man` | `Get-Help` |

## C.4 Créer ses propres alias (dans le profil, chapitre 23)

```powershell
Set-Alias -Name ll -Value Get-ChildItem
Set-Alias -Name grep -Value Select-String

function which { param($nom) (Get-Command $nom).Source }
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ curl et wget sous PowerShell ne sont PAS les vrais outils Unix</span>
Sur un Windows sans les vrais binaires `curl.exe`/`wget.exe` installés, ces noms sont interceptés comme alias vers `Invoke-WebRequest` — dont la syntaxe des paramètres diffère notablement des vrais outils Unix. Vérifier avec `Get-Alias curl` en cas de comportement inattendu en copiant une commande `curl` trouvée en ligne.
</div>

*Annexe suivante : les expressions régulières appliquées à CMD et PowerShell.*
