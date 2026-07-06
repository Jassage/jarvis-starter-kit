<div class="chapitre-titre-num">CHAPITRE 12</div>

# Conditions

## Objectifs pédagogiques

Maîtriser `if`/`elseif`/`else` et `switch` en PowerShell, avec les opérateurs de comparaison spécifiques au langage.

## Prérequis

Chapitre 11.

## 12.1 Les opérateurs de comparaison PowerShell

<div class="encadre attention">
<span class="encadre-titre">⚠️ PowerShell n'utilise PAS ==, <, > pour comparer (contrairement à la plupart des langages)</span>
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
| `-match` | correspond à une expression régulière (chapitre 17) |
| `-contains` | une collection contient une valeur |
| `-in` | une valeur appartient à une collection |

```powershell
$age = 24
if ($age -ge 18) { Write-Output "Majeur" }

$nom = "Jaslin Occius"
if ($nom -like "Jaslin*") { Write-Output "Correspond au motif" }

$fruits = @("pomme", "banane")
if ($fruits -contains "pomme") { Write-Output "Il y a une pomme" }
```

## 12.2 if / elseif / else

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

## 12.3 Opérateurs logiques

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

## 12.4 switch : plusieurs cas possibles

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

# switch traitant une COLLECTION entière (pas juste une valeur)
switch (1, 2, 3, 4) {
    { $_ % 2 -eq 0 } { Write-Output "$_ est pair" }
    default { Write-Output "$_ est impair" }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 switch peut traiter directement un tableau, sans boucle explicite</span>
Contrairement à la plupart des langages où `switch` n'évalue qu'une seule valeur, le `switch` de PowerShell accepte directement une **collection** et l'évalue élément par élément — un raccourci pratique par rapport à une boucle `foreach` explicite contenant un `if`.
</div>

## 12.5 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Utiliser -eq pour une comparaison de chaînes sensible à la casse</span>
```powershell
"Jaslin" -eq "jaslin"     # $true ! -eq est insensible à la casse par défaut
"Jaslin" -ceq "jaslin"    # $false : -ceq (c pour "case-sensitive") force la sensibilité à la casse
```
</div>

## 12.6 Bonnes pratiques

- Toujours placer la condition la plus **restrictive** en premier dans une chaîne `elseif` (rappel de la logique du chapitre 12.2 : la première condition vraie rencontrée l'emporte).
- Préférer `switch` à une longue chaîne `if`/`elseif` dès qu'il y a plus de 3-4 cas à traiter sur la même valeur.

## 12.7 Résumé du chapitre

- Les opérateurs de comparaison PowerShell sont textuels (`-eq`, `-gt`, `-like`...), jamais symboliques.
- `if`/`elseif`/`else` fonctionnent classiquement, combinés à `-and`/`-or`/`-not`.
- `switch` accepte des valeurs exactes, des wildcards (`-Wildcard`), et peut traiter une collection entière directement.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 12.1</span>

Écris une condition qui affiche "Fichier volumineux" si un fichier dépasse 100 Mo, "Fichier moyen" s'il dépasse 10 Mo, sinon "Petit fichier".
</div>

**Corrigé :**
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

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 12.2 (défi pratique)</span>

Avec un `switch`, classe un code de statut HTTP (200, 404, 500...) en "Succès", "Introuvable", "Erreur serveur" ou "Autre".
</div>

**Corrigé :**
```powershell
$code = 404
switch ($code) {
    200 { Write-Output "Succès" }
    404 { Write-Output "Introuvable" }
    500 { Write-Output "Erreur serveur" }
    default { Write-Output "Autre" }
}
```

*Chapitre suivant : les boucles (foreach, for, while, do while, do until).*
