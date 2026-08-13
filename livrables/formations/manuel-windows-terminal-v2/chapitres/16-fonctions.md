<div class="chapitre-titre-num">CHAPITRE 16</div>

# Fonctions

## 🎯 Objectifs

Écrire des fonctions PowerShell avec paramètres typés et validés, valeurs par défaut, retourner des valeurs proprement, et exécuter de vrais scripts `.ps1`.

## Prérequis

Chapitres 13-15.

## 🧠 Comprendre : donner un nom à une suite d'instructions

**Le problème.** Une même séquence de commandes (calculer quelque chose, formater un résultat) peut être nécessaire à plusieurs endroits d'un script, voire dans plusieurs scripts différents. La copier-coller à chaque fois rend toute correction future fastidieuse et risquée.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Une **fonction** est une fiche recette réutilisable : au lieu de réexpliquer "comment faire une omelette" à chaque fois, tu la nommes une fois ("Faire-Omelette"), et tu la rappelles ensuite en donnant juste les ingrédients (les **paramètres**) qui changent d'une fois sur l'autre.
</div>

## 💻 Démonstration : une fonction simple

```powershell
function Saluer {
    param(
        [string]$Nom
    )
    Write-Output "Bonjour $Nom !"
}

Saluer -Nom "Jaslin"
Saluer "Jaslin"    ← le nom du parametre est optionnel si l'ordre est respecte
```

## 🔍 Décortiquons

`function Saluer { ... }` définit la fonction. `param(...)` liste ses paramètres, ici un seul, `$Nom`, typé `[string]` (rappel du chapitre 13). À l'intérieur du corps, `$Nom` se comporte comme n'importe quelle variable.

## 16.1 Paramètres avancés : obligatoires, valeurs par défaut, validation

```powershell
function New-Utilisateur {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Nom,

        [Parameter(Mandatory=$true)]
        [ValidatePattern("^[^@]+@[^@]+\.[^@]+$")]
        [string]$Email,

        [ValidateRange(18, 120)]
        [int]$Age = 18,

        [ValidateSet("Utilisateur", "Admin", "Moderateur")]
        [string]$Role = "Utilisateur"
    )

    [PSCustomObject]@{
        Nom   = $Nom
        Email = $Email
        Age   = $Age
        Role  = $Role
    }
}

New-Utilisateur -Nom "Jaslin" -Email "jaslin@mail.com" -Age 24 -Role "Admin"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 La validation intégrée évite d'écrire des if manuels</span>
`[Parameter(Mandatory=$true)]` rend un paramètre obligatoire (PowerShell le redemandera interactivement s'il manque) ; `[ValidateRange]`, `[ValidatePattern]`, `[ValidateSet]` rejettent automatiquement une valeur invalide **avant même** que le corps de la fonction ne s'exécute — remplaçant avantageusement des validations manuelles écrites à la main.
</div>

## 16.2 Valeur de retour

```powershell
function Get-Carre {
    param([int]$Nombre)
    return $Nombre * $Nombre
}

$resultat = Get-Carre -Nombre 5
Write-Output $resultat   ← 25
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ TOUT ce qui n'est pas capturé/redirigé dans une fonction fait partie de la valeur de retour</span>
```powershell
function Get-CarreBogue {
    param([int]$Nombre)
    Write-Output "Calcul en cours..."   ← ⚠️ ceci fait AUSSI partie du retour de la fonction !
    return $Nombre * $Nombre
}

$resultat = Get-CarreBogue -Nombre 5
$resultat.Count   ← 2 ! $resultat contient EN REALITE un tableau : ("Calcul en cours...", 25)
```
Contrairement à la plupart des langages où seul `return` compte, PowerShell considère que **toute sortie non capturée** dans le corps de la fonction (y compris un `Write-Output` "de débogage" oublié) fait partie du résultat retourné — une source de bugs subtils très fréquente. Utiliser `Write-Verbose`/`Write-Debug` pour un affichage de progression qui ne pollue pas la valeur de retour.
</div>

## 16.3 Fonctions avancées : CmdletBinding

```powershell
function Backup-Dossier {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Source,

        [Parameter(Mandatory=$true)]
        [string]$Destination
    )

    Write-Verbose "Sauvegarde de $Source vers $Destination"
    Copy-Item -Path $Source -Destination $Destination -Recurse -Force
}

Backup-Dossier -Source "C:\Projets" -Destination "D:\Sauvegarde" -Verbose
```

`[CmdletBinding()]` transforme une fonction simple en **fonction avancée**, lui donnant accès à des paramètres communs standard (`-Verbose`, `-Debug`, `-ErrorAction`) exactement comme une vraie cmdlet native.

## 16.4 Scripts .ps1

```powershell
# sauvegarde.ps1
param(
    [string]$Source = "C:\Projets",
    [string]$Destination = "D:\Sauvegarde"
)

Write-Output "Début de la sauvegarde..."
Copy-Item -Path $Source -Destination $Destination -Recurse -Force
Write-Output "Sauvegarde terminée."
```

```powershell
.\sauvegarde.ps1
.\sauvegarde.ps1 -Source "D:\Autre" -Destination "E:\Backup"
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ .\ obligatoire pour exécuter un script du dossier courant</span>
```powershell
sauvegarde.ps1        ← ❌ "n'est pas reconnu comme nom d'applet de commande..."
.\sauvegarde.ps1       ← ✅ le prefixe .\ est OBLIGATOIRE pour un script du dossier courant
```
Contrairement à CMD (qui exécute directement un `.bat` du dossier courant, chapitre 8), PowerShell exige un chemin explicite (même relatif, `.\`) pour exécuter un script — une mesure de sécurité empêchant qu'un fichier malveillant nommé comme une commande système courante ne s'exécute par erreur.
</div>

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Nommer une fonction sans respecter la convention Verbe-Nom</span>
```powershell
function FaireQuelqueChose { ... }   ← ⚠️ fonctionne, mais génère un avertissement et casse la convention PowerShell
function Invoke-QuelqueChose { ... } ← ✅ respecte la convention (rappel du chapitre 9)
```
</div>

## Bonnes pratiques

- Toujours utiliser `[CmdletBinding()]` sur une fonction destinée à être réutilisée par d'autres.
- Valider les paramètres via les attributs `[Validate*]` plutôt que des `if` manuels en début de fonction.
- Respecter la convention Verbe-Nom, même pour des fonctions purement personnelles.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 16.1</span>

Écris une fonction `Test-EmailValide` qui prend un email en paramètre obligatoire et retourne `$true`/`$false` selon un motif simple de validation.
</div>

**✅ Correction.**
```powershell
function Test-EmailValide {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Email
    )
    return $Email -match "^[^@\s]+@[^@\s]+\.[^@\s]+$"
}

Test-EmailValide -Email "jaslin@mail.com"   ← True
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 16.2</span>

Écris une fonction `Get-EspaceDisque` (avec `[CmdletBinding()]`) qui retourne l'espace libre, en Go, de chaque lecteur, sans utiliser `Write-Output` en plus du `return`/de la sortie implicite.
</div>

**✅ Correction.**
```powershell
function Get-EspaceDisque {
    [CmdletBinding()]
    param()
    Get-PSDrive -PSProvider FileSystem |
        Select-Object Name, @{Name="LibreGo";Expression={[math]::Round($_.Free/1GB,2)}}
}

Get-EspaceDisque
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 16.3</span>

Un collègue se plaint que sa fonction `Get-Statistiques` retourne un tableau de 2 éléments au lieu d'un seul nombre attendu. Voici son code — trouve le bug sans l'exécuter :
```powershell
function Get-Statistiques {
    param([int[]]$Nombres)
    Write-Output "Calcul de la moyenne..."
    return ($Nombres | Measure-Object -Average).Average
}
```
</div>

**✅ Correction du défi.** Le `Write-Output "Calcul de la moyenne..."` (section 16.2) fait partie du retour de la fonction, au même titre que le `return` final — l'appelant récupère donc un tableau de deux éléments (le texte, puis la moyenne) au lieu du seul nombre attendu. Correction : remplacer ce `Write-Output` par `Write-Verbose "Calcul de la moyenne..."`, qui ne s'affiche que si `-Verbose` est demandé et ne pollue jamais la valeur de retour.

## 🎯 Ce que tu sais maintenant

- Les fonctions PowerShell utilisent `param()` avec des attributs de validation puissants (`Mandatory`, `ValidateRange`, `ValidateSet`, `ValidatePattern`).
- Toute sortie non capturée dans une fonction fait partie de sa valeur de retour — piège fréquent avec un `Write-Output` de débogage oublié.
- `[CmdletBinding()]` transforme une fonction en fonction avancée, avec accès à `-Verbose`/`-Debug`.
- Un script `.ps1` s'exécute avec `.\` explicite, contrairement à un `.bat` en CMD.

*Ceci clôt la Partie 10 (programmation PowerShell). Chapitre suivant : administrer Windows — la gestion des processus.*
