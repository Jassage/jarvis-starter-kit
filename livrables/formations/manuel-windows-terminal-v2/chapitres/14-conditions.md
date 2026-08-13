<div class="chapitre-titre-num">CHAPITRE 14</div>

# Conditions

## 🎯 Objectifs

Maîtriser `if`/`elseif`/`else` et `switch` en PowerShell, avec les opérateurs de comparaison spécifiques au langage.

## Prérequis

Chapitre 13.

## 🧠 Comprendre : faire varier le comportement d'un script

**Le problème.** Un script utile ne fait presque jamais exactement la même chose à chaque exécution : il doit réagir différemment selon l'état du système, une valeur saisie, ou un résultat de commande.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Une condition (`if`) est un aiguillage de voie ferrée : selon un signal (vrai ou faux), le train part vers une voie ou vers une autre. Un `switch` est une gare de triage avec plusieurs voies possibles selon l'étiquette du wagon, plutôt qu'un simple choix binaire.
</div>

## 💻 Démonstration : les opérateurs de comparaison

<div class="encadre attention">
<span class="encadre-titre">⚠️ PowerShell n'utilise PAS ==, <, > pour comparer</span>
Ces symboles sont réservés à d'autres usages (redirection, comparaison de fichiers) — PowerShell utilise des opérateurs textuels préfixés par un tiret.
</div>

| Opérateur | Signification |
|---|---|
| `-eq` | égal à |
| `-ne` | différent de |
| `-gt` | supérieur à |
| `-ge` | supérieur ou égal |
| `-lt` | inférieur à |
| `-le` | inférieur ou égal |
| `-like` | correspond à un motif (wildcards `*`, `?`) |
| `-match` | correspond à une expression régulière (chapitre 22) |
| `-contains` | une collection contient une valeur |
| `-in` | une valeur appartient à une collection |

```powershell
$age = 24
if ($age -ge 18) { Write-Output "Majeur" }
```

## 🔍 Décortiquons

`if ($age -ge 18) { ... }` : la condition entre parenthèses est évaluée en `$true` ou `$false` (chapitre 13) — si `$true`, le bloc entre accolades s'exécute.

```powershell
$nom = "Jaslin Occius"
if ($nom -like "Jaslin*") { Write-Output "Correspond au motif" }

$fruits = @("pomme", "banane")
if ($fruits -contains "pomme") { Write-Output "Il y a une pomme" }
```

## 14.1 if / elseif / else

```powershell
$note = 14

if ($note -ge 16) {
    Write-Output "Mention Très Bien"
} elseif ($note -ge 14) {
    Write-Output "Mention Bien"
} elseif ($note -ge 12) {
    Write-Output "Mention Assez Bien"
} else {
    Write-Output "Sans mention"
}
```

## 14.2 Opérateurs logiques

```powershell
$age = 25
$aPermis = $true

if ($age -ge 18 -and $aPermis) { Write-Output "Peut conduire" }
if ($age -lt 18 -or -not $aPermis) { Write-Output "Ne peut pas conduire" }
```

| Opérateur | Signification |
|---|---|
| `-and` | ET logique |
| `-or` | OU logique |
| `-not` / `!` | NON logique |

## 14.3 switch : plusieurs cas possibles

```powershell
$jour = "Lundi"

switch ($jour) {
    "Samedi" { Write-Output "Week-end" }
    "Dimanche" { Write-Output "Week-end" }
    default { Write-Output "Jour ouvrable" }
}
```

```powershell
# switch avec wildcards
switch -Wildcard ($fichier.Extension) {
    ".txt"  { Write-Output "Fichier texte" }
    ".jpg*" { Write-Output "Image JPEG" }
    default { Write-Output "Type inconnu" }
}

# switch traitant une COLLECTION entiere (pas juste une valeur)
switch (1, 2, 3, 4) {
    { $_ % 2 -eq 0 } { Write-Output "$_ est pair" }
    default { Write-Output "$_ est impair" }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 switch peut traiter directement un tableau, sans boucle explicite</span>
Contrairement à la plupart des langages où `switch` n'évalue qu'une seule valeur, le `switch` de PowerShell accepte directement une **collection** et l'évalue élément par élément — un raccourci pratique par rapport à une boucle `foreach` (chapitre 15) explicite contenant un `if`.
</div>

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Utiliser -eq pour une comparaison de chaînes sensible à la casse</span>
```powershell
"Jaslin" -eq "jaslin"     ← $true ! -eq est insensible a la casse par defaut
"Jaslin" -ceq "jaslin"    ← $false : -ceq (c pour "case-sensitive") force la sensibilite a la casse
```
</div>

## Bonnes pratiques

- Toujours placer la condition la plus **restrictive** en premier dans une chaîne `elseif` (la première condition vraie rencontrée l'emporte).
- Préférer `switch` à une longue chaîne `if`/`elseif` dès qu'il y a plus de 3-4 cas à traiter sur la même valeur.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 14.1</span>

Écris une condition qui affiche "Fichier volumineux" si un fichier dépasse 100 Mo, "Fichier moyen" s'il dépasse 10 Mo, sinon "Petit fichier".
</div>

**✅ Correction.**
```powershell
$fichier = Get-Item C:\Projets\video.mp4
if ($fichier.Length -gt 100MB) {
    Write-Output "Fichier volumineux"
} elseif ($fichier.Length -gt 10MB) {
    Write-Output "Fichier moyen"
} else {
    Write-Output "Petit fichier"
}
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 14.2</span>

Avec un `switch`, classe un code de statut HTTP (200, 404, 500...) en "Succès", "Introuvable", "Erreur serveur" ou "Autre".
</div>

**✅ Correction.**
```powershell
$code = 404
switch ($code) {
    200 { Write-Output "Succès" }
    404 { Write-Output "Introuvable" }
    500 { Write-Output "Erreur serveur" }
    default { Write-Output "Autre" }
}
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 14.3</span>

Sans boucle explicite, utilise `switch` pour afficher, parmi les nombres de 1 à 10, lesquels sont divisibles par 3 ET par 2 à la fois (donc par 6), en une seule structure.
</div>

**✅ Correction du défi.**
```powershell
switch (1..10) {
    { $_ % 6 -eq 0 } { Write-Output "$_ est divisible par 6" }
}
```
Le `switch` sur une plage `1..10` (chapitre 15) traite chaque nombre individuellement, sans boucle `foreach` explicite.

## 🎯 Ce que tu sais maintenant

- Les opérateurs de comparaison PowerShell sont textuels (`-eq`, `-gt`, `-like`...), jamais symboliques.
- `if`/`elseif`/`else` fonctionnent classiquement, combinés à `-and`/`-or`/`-not`.
- `switch` accepte des valeurs exactes, des wildcards (`-Wildcard`), et peut traiter une collection entière directement.

*Chapitre suivant : les boucles (foreach, for, while, do).*
