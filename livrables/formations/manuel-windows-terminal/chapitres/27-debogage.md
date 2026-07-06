<div class="chapitre-titre-num">CHAPITRE 27</div>

# Débogage de scripts PowerShell

## Objectifs pédagogiques

Utiliser le débogueur intégré de PowerShell (points d'arrêt, exécution pas à pas), gérer les erreurs avec try/catch, comprendre les flux de sortie (Write-Verbose, Write-Debug), et diagnostiquer les erreurs courantes.

## Prérequis

Chapitres 9-26.

## 27.1 Try/Catch/Finally : gestion structurée des erreurs

```powershell
try {
    $contenu = Get-Content -Path "C:\fichier-inexistant.txt" -ErrorAction Stop
} catch {
    Write-Error "Impossible de lire le fichier : $($_.Exception.Message)"
} finally {
    Write-Output "Tentative de lecture terminee."
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ -ErrorAction Stop est INDISPENSABLE pour que catch intercepte l'erreur</span>
Par défaut, la plupart des cmdlets PowerShell génèrent des erreurs "non-terminantes" — le script continue et `catch` n'est jamais déclenché. `-ErrorAction Stop` transforme l'erreur en exception terminante, seule forme interceptable par un bloc `catch`. C'est l'erreur de débogage la plus fréquente chez les débutants PowerShell.
</div>

## 27.2 Types d'erreurs spécifiques

```powershell
try {
    Get-Item -Path "C:\inexistant.txt" -ErrorAction Stop
} catch [System.Management.Automation.ItemNotFoundException] {
    Write-Output "Le fichier n'existe pas."
} catch {
    Write-Output "Une autre erreur est survenue : $($_.Exception.GetType().Name)"
}
```

## 27.3 $Error : l'historique des erreurs de la session

```powershell
$Error[0]                      # dernière erreur survenue
$Error[0].InvocationInfo.Line  # la ligne de code exacte qui a échoué
$Error.Clear()                  # vider l'historique
```

## 27.4 Write-Verbose, Write-Debug, Write-Information

```powershell
function Copier-Fichiers {
    [CmdletBinding()]
    param([string]$Source, [string]$Destination)

    Write-Verbose "Copie de $Source vers $Destination"
    Copy-Item -Path $Source -Destination $Destination
    Write-Verbose "Copie terminee."
}

Copier-Fichiers -Source "a.txt" -Destination "b.txt" -Verbose
```

<div class="encadre astuce">
<span class="encadre-titre">💡 -Verbose n'affiche rien sans [CmdletBinding()]</span>
`Write-Verbose` reste silencieux par défaut, même avec `-Verbose` passé en paramètre, si la fonction ne déclare pas `[CmdletBinding()]` (rappel du chapitre 14) — cette déclaration active automatiquement les paramètres communs `-Verbose`, `-Debug`, `-ErrorAction` sur toute fonction avancée.
</div>

```powershell
Write-Debug "Valeur de la variable : $maVariable"     # visible seulement avec -Debug
Write-Information "Traitement en cours" -InformationAction Continue
```

## 27.5 Le débogueur intégré : Set-PSBreakpoint

```powershell
Set-PSBreakpoint -Script "C:\Scripts\traitement.ps1" -Line 15

Set-PSBreakpoint -Script "C:\Scripts\traitement.ps1" -Command "Get-Process"

Set-PSBreakpoint -Script "C:\Scripts\traitement.ps1" -Variable "compteur" -Mode Write
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Trois types de points d'arrêt : ligne, commande, variable</span>
Un point d'arrêt sur une **ligne** interrompt à un endroit précis ; sur une **commande** interrompt chaque fois que cette commande est appelée (utile si elle apparaît à plusieurs endroits) ; sur une **variable** interrompt dès qu'elle est lue ou modifiée (`-Mode Write`/`Read`/`ReadWrite`) — utile pour traquer une valeur qui change de façon inattendue.
</div>

```powershell
# Une fois le point d'arrêt atteint, commandes disponibles en mode débogage :
# s (step into), v (step over), o (step out), c (continue), q (quit)
```

## 27.6 Déboguer avec VS Code

<div class="encadre astuce">
<span class="encadre-titre">💡 VS Code + extension PowerShell : débogage visuel avec points d'arrêt cliquables</span>
L'extension officielle "PowerShell" pour VS Code offre un débogueur graphique complet — clic dans la marge pour poser un point d'arrêt, inspection des variables dans un panneau dédié, console interactive au point d'arrêt — bien plus confortable que `Set-PSBreakpoint` en ligne de commande pour un script complexe.
</div>

## 27.7 Mesurer les performances d'un script

```powershell
Measure-Command { Get-ChildItem -Path C:\ -Recurse -ErrorAction SilentlyContinue }

$chrono = [System.Diagnostics.Stopwatch]::StartNew()
# ... traitement ...
$chrono.Stop()
Write-Output "Temps ecoule : $($chrono.Elapsed.TotalSeconds) secondes"
```

## 27.8 Erreurs courantes et diagnostics

| Symptôme | Cause probable |
|---|---|
| `catch` ne s'exécute jamais | Oubli de `-ErrorAction Stop` sur la commande en erreur |
| `-Verbose` n'affiche rien | Fonction sans `[CmdletBinding()]` |
| Variable vide/inattendue | Portée (scope) incorrecte, rappel du chapitre 14 |
| Script "ne fait rien" en tâche planifiée | Chemin relatif utilisé au lieu d'un chemin absolu |
| Erreur "Access is denied" en récursif | Oubli de `-ErrorAction SilentlyContinue` sur des dossiers protégés |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un script fonctionnant en interactif peut échouer en tâche planifiée</span>
Une tâche planifiée (chapitre 15) s'exécute souvent dans un répertoire de travail différent (typiquement `C:\Windows\System32`), rendant invalide tout chemin relatif (`.\donnees.csv`) qui fonctionnait en session interactive — toujours utiliser des chemins absolus, ou `$PSScriptRoot` pour un chemin relatif au script lui-même, dans tout script destiné à l'automatisation.
</div>

## 27.9 Bonnes pratiques

- Toujours `-ErrorAction Stop` sur toute commande dont l'échec doit être intercepté par `catch`.
- Utiliser `$PSScriptRoot` plutôt que des chemins relatifs dans tout script destiné à s'exécuter hors session interactive.
- Ajouter `[CmdletBinding()]` à toute fonction avancée pour bénéficier de `-Verbose`/`-Debug` gratuitement.

## 27.10 Résumé du chapitre

- `try/catch/finally` avec `-ErrorAction Stop` structure la gestion d'erreurs ; `$Error[0]` conserve l'historique de la session.
- `Write-Verbose`/`Write-Debug` (avec `[CmdletBinding()]`) offrent une sortie de diagnostic activable à la demande.
- `Set-PSBreakpoint` (ligne, commande, ou variable) permet un débogage pas à pas natif, complété avantageusement par le débogueur visuel de VS Code.
- Un script fonctionnant en interactif peut échouer en tâche planifiée à cause de chemins relatifs invalides — toujours privilégier `$PSScriptRoot`.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 27.1</span>

Écris une fonction qui tente de lire un fichier et retourne un message d'erreur clair (via try/catch) s'il n'existe pas, plutôt que de laisser remonter l'exception brute.
</div>

**Corrigé :**
```powershell
function Lire-FichierSecurise {
    param([string]$Chemin)
    try {
        Get-Content -Path $Chemin -ErrorAction Stop
    } catch {
        Write-Output "Erreur : le fichier '$Chemin' est introuvable ou inaccessible."
    }
}
```

*Chapitre suivant : les bonnes pratiques d'écriture de scripts PowerShell professionnels.*
