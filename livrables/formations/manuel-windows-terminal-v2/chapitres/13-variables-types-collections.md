<div class="chapitre-titre-num">CHAPITRE 13</div>

# Variables, types et collections

## 🎯 Objectifs

Déclarer et typer des variables PowerShell, manipuler des tableaux et des hashtables, et construire de vrais objets avec `[PSCustomObject]`.

## Prérequis

Chapitres 9-12.

## 🧠 Comprendre : donner un nom à une valeur

**Le problème.** Répéter la même valeur (un chemin, un nom, un résultat de calcul) à plusieurs endroits d'un script est source d'erreurs si elle change — il faut un endroit unique pour la stocker.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Une **variable** est une étiquette collée sur une boîte : `$nom` est le nom écrit sur l'étiquette, "Jaslin" est ce qu'il y a dans la boîte. Un **tableau** (`@(...)`) est une étagère de boîtes numérotées. Une **hashtable** (`@{...}`) est une étagère où chaque boîte porte, à la place d'un numéro, une étiquette personnalisée (une clé).
</div>

## 💻 Démonstration : déclarer une variable

```powershell
$nom = "Jaslin"
$age = 24
$estActif = $true

Write-Output "Bonjour $nom, tu as $age ans"    ← interpolation directe dans une chaine double-quote
```

## 🔍 Décortiquons

`$nom` porte toujours le préfixe `$` en PowerShell (contrairement au `%nom%` de CMD, chapitre 7). À l'intérieur d'une chaîne entre guillemets **doubles**, `$nom` est automatiquement remplacé par sa valeur — c'est l'**interpolation**.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Guillemets simples vs doubles : l'interpolation ne fonctionne QUE dans les doubles</span>
```powershell
Write-Output "Bonjour $nom"    ← ✅ affiche "Bonjour Jaslin"
Write-Output 'Bonjour $nom'    ← ❌ affiche litteralement "Bonjour $nom" (pas d'interpolation)
```
</div>

## 13.1 Typage explicite

```powershell
[int]$age = 24
[string]$nom = "Jaslin"
[bool]$estActif = $true
[datetime]$dateInscription = Get-Date

$age = "vingt-quatre"    ← ❌ erreur : impossible de convertir "vingt-quatre" en [int]
```

<div class="encadre astuce">
<span class="encadre-titre">💡 PowerShell est typé dynamiquement par défaut, mais permet un typage strict optionnel</span>
Sans annotation `[type]`, une variable accepte n'importe quel type et peut même changer de type en cours de script. Ajouter `[int]`/`[string]`/etc. devant la déclaration **verrouille** le type, provoquant une erreur immédiate si une valeur incompatible est assignée — une pratique recommandée dans des scripts destinés à durer ou à être partagés.
</div>

| Type | Exemple |
|---|---|
| `[string]` | `"Bonjour"` |
| `[int]` | `42` |
| `[double]` | `3.14` |
| `[bool]` | `$true`, `$false` |
| `[datetime]` | `Get-Date` |
| `[array]` | `@(1, 2, 3)` |
| `[hashtable]` | `@{ cle = "valeur" }` |

## 13.2 Tableaux (arrays)

```powershell
$fruits = @("pomme", "banane", "mangue")
$fruits[0]              ← "pomme"
$fruits[-1]              ← "mangue" (dernier element, index negatif)
$fruits.Count            ← 3

$fruits += "orange"       ← ajoute un element (cree en realite un NOUVEAU tableau en coulisses)

foreach ($fruit in $fruits) {
    Write-Output $fruit
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un tableau PowerShell classique a une taille fixe ; += recrée tout le tableau</span>
`$fruits += "orange"` fonctionne, mais PowerShell recrée **entièrement** le tableau en mémoire à chaque `+=` (les tableaux .NET classiques ont une taille fixe dès leur création) — sur une boucle avec des milliers d'ajouts, cette approche devient très lente. Pour ce cas, une `[System.Collections.Generic.List[object]]` (avec sa méthode `.Add()`, qui ne recrée pas toute la structure) est bien plus performante.
</div>

```powershell
$listePerformante = [System.Collections.Generic.List[string]]::new()
$listePerformante.Add("pomme")
$listePerformante.Add("banane")
```

## 13.3 Hashtables (tables de hachage)

```powershell
$utilisateur = @{
    Nom   = "Jaslin"
    Email = "jaslin@mail.com"
    Age   = 24
}

$utilisateur["Nom"]        ← "Jaslin"
$utilisateur.Nom            ← syntaxe equivalente, plus lisible
$utilisateur["Role"] = "Admin"   ← ajoute une nouvelle cle

foreach ($cle in $utilisateur.Keys) {
    Write-Output "$cle : $($utilisateur[$cle])"
}
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : hashtable vs objet PowerShell</span>
Une hashtable est une simple association clé-valeur (rapide, flexible). Un `[PSCustomObject]` (section 13.4) se comporte comme un **vrai objet** avec des propriétés nommées, mieux adapté quand on veut produire un résultat structuré destiné à être affiché en tableau ou réutilisé dans un pipeline comme les objets natifs vus au chapitre 12.
</div>

## 13.4 Créer ses propres objets avec PSCustomObject

```powershell
$rapport = [PSCustomObject]@{
    Nom        = "Jaslin"
    Score      = 92
    Statut     = "Validé"
}

$rapport.Nom          ← "Jaslin", comme une vraie propriete d'objet
$rapport | Get-Member  ← revele un vrai objet PSCustomObject, exploitable dans un pipeline
```

```powershell
# Construire une COLLECTION d'objets personnalises, exploitable comme un vrai resultat de cmdlet
$rapports = @()
$rapports += [PSCustomObject]@{ Nom = "Jaslin"; Score = 92 }
$rapports += [PSCustomObject]@{ Nom = "Marie"; Score = 78 }

$rapports | Sort-Object Score -Descending | Format-Table
```

## 13.5 Portée des variables (scope)

```powershell
function Demonstration {
    $variableLocale = "Je n'existe QUE dans cette fonction"
}
Demonstration
Write-Output $variableLocale     ← rien : $variableLocale n'existe pas en dehors de la fonction

$global:variableGlobale = "Visible partout"
```

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre @() (tableau) et @{} (hashtable)</span>
```powershell
$mauvais = @{ "pomme", "banane" }   ← ❌ syntaxe de hashtable invalide pour une simple liste
$bon = @("pomme", "banane")         ← ✅ tableau
$bonHash = @{ fruit = "pomme" }     ← ✅ hashtable (paires cle=valeur)
```
</div>

## Bonnes pratiques

- Typer explicitement (`[int]`, `[string]`) les variables de scripts destinés à durer ou être partagés.
- Préférer `[PSCustomObject]` à une hashtable dès qu'un résultat structuré doit être affiché en tableau ou réutilisé dans un pipeline.
- Utiliser une `List[T]` plutôt que `+=` sur un tableau classique dans une boucle à fort volume.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 13.1</span>

Crée une hashtable représentant un produit (nom, prix, stock), puis affiche chacune de ses clés et valeurs.
</div>

**✅ Correction.**
```powershell
$produit = @{ Nom = "Riz"; Prix = 250; Stock = 100 }
foreach ($cle in $produit.Keys) {
    Write-Output "$cle : $($produit[$cle])"
}
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 13.2</span>

Construis une collection de 3 objets `[PSCustomObject]` représentant des étudiants (Nom, Note), puis affiche-les triés par note décroissante, avec seulement les colonnes Nom et Note.
</div>

**✅ Correction.**
```powershell
$etudiants = @(
    [PSCustomObject]@{ Nom = "Jaslin"; Note = 16.5 }
    [PSCustomObject]@{ Nom = "Marie"; Note = 14.0 }
    [PSCustomObject]@{ Nom = "Paul"; Note = 18.2 }
)

$etudiants | Sort-Object Note -Descending | Select-Object Nom, Note | Format-Table
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 13.3</span>

Un script ajoute 5000 éléments à un tableau classique avec `+=` dans une boucle, et met visiblement plus de temps que prévu. Explique la cause exacte, et corrige avec la structure adaptée.
</div>

**✅ Correction du défi.** Chaque `+=` recrée l'intégralité du tableau en mémoire (section 13.2) : sur 5000 itérations, cela représente des milliers de copies complètes, un coût qui croît avec la taille du tableau. La correction :
```powershell
$resultats = [System.Collections.Generic.List[object]]::new()
for ($i = 1; $i -le 5000; $i++) {
    $resultats.Add([PSCustomObject]@{ Index = $i })
}
```
`.Add()` insère un élément sans jamais recréer toute la structure.

## 🎯 Ce que tu sais maintenant

- Les variables PowerShell (`$nom`) sont typées dynamiquement par défaut, avec un typage strict optionnel (`[int]$age`).
- Les tableaux (`@(...)`) et hashtables (`@{...}`) sont les deux collections de base, aux usages différents.
- `[PSCustomObject]` construit de vrais objets exploitables en pipeline, préférable à une hashtable pour un résultat structuré.
- `+=` sur un tableau classique recrée toute la structure — coûteux en boucle à fort volume, préférer une `List[T]`.

*Chapitre suivant : les conditions (if/elseif/else/switch) en PowerShell.*
