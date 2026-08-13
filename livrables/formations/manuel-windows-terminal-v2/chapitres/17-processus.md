<div class="chapitre-titre-num">CHAPITRE 17</div>

# Processus

## 🎯 Objectifs

Lister, démarrer et arrêter des processus avec PowerShell, et construire un petit outil de surveillance des processus les plus gourmands.

## Prérequis

Chapitres 1 (notion de processus) et 9-16 (PowerShell).

## 🧠 Comprendre : administrer sans la souris

**Le problème.** Le Gestionnaire des tâches permet de voir et d'arrêter des processus à la main, un par un. Mais surveiller automatiquement, à intervalle régulier, ou arrêter tous les processus correspondant à un critère précis, exige de le faire par script.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
`Get-Process` est une prise de photo instantanée de la cuisine (chapitre 1) : qui cuisine quoi, en ce moment, avec quelle intensité. `Stop-Process` est l'ordre donné à un chef de tout arrêter immédiatement.
</div>

## 💻 Démonstration

```powershell
Get-Process
Get-Process -Name notepad
```

## 🔍 Décortiquons

Sans paramètre, `Get-Process` liste tous les processus actifs (rappel du chapitre 1, section 1.6). `-Name` filtre par nom de programme — pratique, mais attention : plusieurs processus peuvent partager le même nom (deux fenêtres du Bloc-notes ouvertes, par exemple).

## 17.1 Démarrer un processus

```powershell
Start-Process notepad.exe
Start-Process -FilePath "notepad.exe" -ArgumentList "C:\notes.txt"
```

## 17.2 Arrêter un processus

```powershell
Stop-Process -Name notepad -Force
Stop-Process -Id 15234
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Stop-Process -Force termine brutalement, sans sauvegarde des données ouvertes</span>
`-Force` équivaut à un "fin de tâche" forcé (comme depuis le Gestionnaire des tâches) — tout travail non sauvegardé dans l'application ciblée est perdu. À réserver aux processus réellement bloqués, jamais en usage systématique.
</div>

## 17.3 Démarrer un processus et attendre sa fin

```powershell
$processus = Start-Process -FilePath "notepad.exe" -PassThru
$processus.WaitForExit()
Write-Output "Notepad a été fermé."
```

<div class="encadre astuce">
<span class="encadre-titre">💡 -PassThru : récupérer l'objet processus créé</span>
Par défaut, `Start-Process` ne retourne rien. `-PassThru` retourne l'objet `Process` (chapitre 12), permettant d'accéder à son PID, d'attendre sa fin via `.WaitForExit()`, ou de récupérer son code de sortie via `.ExitCode` une fois terminé.
</div>

## 17.4 Un mini outil de surveillance

```powershell
function Watch-ProcessusGourmands {
    param(
        [double]$SeuilCpu = 50,
        [double]$SeuilMemoireMo = 500
    )

    Get-Process |
        Where-Object { $_.CPU -gt $SeuilCpu -or ($_.WorkingSet64 / 1MB) -gt $SeuilMemoireMo } |
        Select-Object Name, Id, CPU, @{Name="MemoireMo";Expression={[math]::Round($_.WorkingSet64/1MB,1)}} |
        Sort-Object CPU -Descending
}

Watch-ProcessusGourmands
```

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Stop-Process -Name sur un nom qui correspond à plusieurs processus</span>
`Stop-Process -Name notepad` arrête **tous** les processus nommés `notepad`, sans distinction — si tu voulais n'en arrêter qu'un précis, utilise `-Id` avec le PID exact (visible via `Get-Process | Select-Object Id, Name`).
</div>

## Bonnes pratiques

- Toujours utiliser `-PassThru` avec `Start-Process` si le résultat (PID, code de sortie) doit être exploité ensuite.
- Préférer `-Id` à `-Name` pour cibler précisément un seul processus parmi plusieurs homonymes.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 17.1</span>

Liste les 5 processus consommant le plus de mémoire, avec leur consommation en Mo arrondie.
</div>

**✅ Correction.**
```powershell
Get-Process |
    Select-Object Name, @{Name="MemoireMo";Expression={[math]::Round($_.WorkingSet64/1MB,1)}} |
    Sort-Object MemoireMo -Descending |
    Select-Object -First 5
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 17.2</span>

Démarre le Bloc-notes, attends que l'utilisateur le ferme manuellement, puis affiche un message de confirmation avec le temps écoulé.
</div>

**✅ Correction.**
```powershell
$debut = Get-Date
$processus = Start-Process notepad.exe -PassThru
$processus.WaitForExit()
$duree = (Get-Date) - $debut
Write-Output "Notepad a été ouvert pendant $([math]::Round($duree.TotalSeconds,1)) secondes."
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 17.3</span>

Écris une fonction `Stop-ProcessusParNom` qui prend un nom en paramètre obligatoire, affiche le nombre de processus trouvés avant de les arrêter, et ne fait rien (sans erreur) si aucun processus ne correspond.
</div>

**✅ Correction du défi.**
```powershell
function Stop-ProcessusParNom {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Nom
    )
    $processus = Get-Process -Name $Nom -ErrorAction SilentlyContinue
    if (-not $processus) {
        Write-Output "Aucun processus nommé '$Nom' trouvé."
        return
    }
    Write-Output "$($processus.Count) processus trouvé(s), arrêt en cours..."
    $processus | Stop-Process -Force
}
```
`-ErrorAction SilentlyContinue` (approfondi au chapitre 29) évite qu'une absence de résultat ne génère une erreur bruyante — un comportement à choisir consciemment, jamais par défaut sur tout un script.

## 🎯 Ce que tu sais maintenant

- `Get-Process`, `Start-Process`, `Stop-Process` couvrent le cycle de vie complet d'un processus.
- `-PassThru` récupère l'objet processus créé par `Start-Process`, permettant d'attendre sa fin (`.WaitForExit()`).
- `-Force` sur `Stop-Process` termine brutalement, sans sauvegarde — à réserver aux processus bloqués.

*Chapitre suivant : les services Windows.*
