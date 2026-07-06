<div class="chapitre-titre-num">CHAPITRE 11</div>

# Variables, types et collections

## Objectifs pédagogiques

Déclarer et typer des variables PowerShell, manipuler des tableaux et des hashtables, structures de données fondamentales pour tout script au-delà de l'usage interactif simple.

## Prérequis

Chapitres 8-10.

## 11.1 Déclarer une variable

```powershell
$nom = "Jaslin"
$age = 24
$estActif = $true

Write-Output "Bonjour $nom, tu as $age ans"    # interpolation directe dans une chaîne double-quote
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Guillemets simples vs doubles : l'interpolation ne fonctionne QUE dans les doubles</span>
```powershell
Write-Output "Bonjour $nom"    # ✅ affiche "Bonjour Jaslin"
Write-Output 'Bonjour $nom'    # ❌ affiche littéralement "Bonjour $nom" (pas d'interpolation)
```
</div>

## 11.2 Typage explicite

```powershell
[int]$age = 24
[string]$nom = "Jaslin"
[bool]$estActif = $true
[datetime]$dateInscription = Get-Date

$age = "vingt-quatre"    # ❌ erreur : impossible de convertir "vingt-quatre" en [int]
```

<div class="encadre astuce">
<span class="encadre-titre">💡 PowerShell est typé dynamiquement PAR DÉFAUT, mais permet un typage strict optionnel</span>
Sans annotation `[type]`, une variable accepte n'importe quel type et peut même changer de type en cours de script. Ajouter `[int]`/`[string]`/etc. devant la déclaration **verrouille** le type, provoquant une erreur immédiate si une valeur incompatible est assignée — une pratique recommandée dans des scripts destinés à durer ou à être partagés.
</div>

## 11.3 Types courants

| Type | Exemple |
|---|---|
| `[string]` | `"Bonjour"` |
| `[int]` | `42` |
| `[double]` | `3.14` |
| `[bool]` | `$true`, `$false` |
| `[datetime]` | `Get-Date` |
| `[array]` | `@(1, 2, 3)` |
| `[hashtable]` | `@{ cle = "valeur" }` |

## 11.4 Tableaux (arrays)

```powershell
$fruits = @("pomme", "banane", "mangue")
$fruits[0]              # "pomme"
$fruits[-1]              # "mangue" (dernier élément, index négatif)
$fruits.Count            # 3

$fruits += "orange"       # ajoute un élément (crée en réalité un NOUVEAU tableau en coulisses)

foreach ($fruit in $fruits) {
    Write-Output $fruit
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un tableau PowerShell classique a une taille FIXE ; += recrée tout le tableau</span>
`$fruits += "orange"` fonctionne, mais PowerShell recrée **entièrement** le tableau en mémoire à chaque `+=` (les tableaux .NET classiques ont une taille fixe dès leur création) — sur une boucle avec des milliers d'ajouts, cette approche devient très lente. Pour ce cas, une `[System.Collections.Generic.List[object]]` (avec sa méthode `.Add()`, qui ne recrée pas toute la structure) est bien plus performante.
</div>

```powershell
$listePerformante = [System.Collections.Generic.List[string]]::new()
$listePerformante.Add("pomme")
$listePerformante.Add("banane")
```

## 11.5 Hashtables (tables de hachage / dictionnaires)

```powershell
$utilisateur = @{
    Nom   = "Jaslin"
    Email = "jaslin@mail.com"
    Age   = 24
}

$utilisateur["Nom"]        # "Jaslin"
$utilisateur.Nom            # syntaxe équivalente, plus lisible
$utilisateur["Role"] = "Admin"   # ajoute une nouvelle clé

foreach ($cle in $utilisateur.Keys) {
    Write-Output "$cle : $($utilisateur[$cle])"
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Hashtable vs objet PowerShell (PSCustomObject)</span>
Une hashtable est une simple association clé-valeur (rapide, flexible). Un `[PSCustomObject]` (section 11.6) se comporte comme un **vrai objet** avec des propriétés nommées, mieux adapté quand on veut produire un résultat structuré destiné à être affiché en tableau ou réutilisé dans un pipeline comme les objets natifs vus au chapitre 10.
</div>

## 11.6 Créer ses propres objets avec PSCustomObject

```powershell
$rapport = [PSCustomObject]@{
    Nom        = "Jaslin"
    Score      = 92
    Statut     = "Validé"
}

$rapport.Nom          # "Jaslin", comme une vraie propriété d'objet
$rapport | Get-Member  # révèle un vrai objet PSCustomObject, exploitable dans un pipeline
```

```powershell
# Construire une COLLECTION d'objets personnalisés, exploitable comme un vrai résultat de cmdlet
$rapports = @()
$rapports += [PSCustomObject]@{ Nom = "Jaslin"; Score = 92 }
$rapports += [PSCustomObject]@{ Nom = "Marie"; Score = 78 }

$rapports | Sort-Object Score -Descending | Format-Table
```

## 11.7 Portée des variables (scope)

```powershell
function Demonstration {
    $variableLocale = "Je n'existe QUE dans cette fonction"
}
Demonstration
Write-Output $variableLocale     # rien : $variableLocale n'existe pas en dehors de la fonction

$global:variableGlobale = "Visible partout"
```

## 11.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre @() (tableau) et @{} (hashtable)</span>
```powershell
$mauvais = @{ "pomme", "banane" }   # ❌ syntaxe de hashtable invalide pour une simple liste
$bon = @("pomme", "banane")         # ✅ tableau
$bonHash = @{ fruit = "pomme" }     # ✅ hashtable (paires clé=valeur)
```
</div>

## 11.9 Bonnes pratiques

- Typer explicitement (`[int]`, `[string]`) les variables de scripts destinés à durer ou être partagés.
- Préférer `[PSCustomObject]` à une hashtable dès qu'un résultat structuré doit être affiché en tableau ou réutilisé dans un pipeline.
- Utiliser une `List[T]` plutôt que `+=` sur un tableau classique dans une boucle à fort volume.

## 11.10 Résumé du chapitre

- Les variables PowerShell (`$nom`) sont typées dynamiquement par défaut, avec un typage strict optionnel (`[int]$age`).
- Les tableaux (`@(...)`) et hashtables (`@{...}`) sont les deux collections de base, aux usages différents.
- `[PSCustomObject]` construit de vrais objets exploitables en pipeline, préférable à une hashtable pour un résultat structuré.
- `+=` sur un tableau classique recrée toute la structure — coûteux en boucle à fort volume, préférer une `List[T]`.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 11.1</span>

Crée une hashtable représentant un produit (nom, prix, stock), puis affiche chacune de ses clés et valeurs.
</div>

**Corrigé :**
```powershell
$produit = @{ Nom = "Riz"; Prix = 250; Stock = 100 }
foreach ($cle in $produit.Keys) {
    Write-Output "$cle : $($produit[$cle])"
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 11.2 (mini-projet)</span>

Construis une collection de 3 objets `[PSCustomObject]` représentant des étudiants (Nom, Note), puis affiche-les triés par note décroissante, avec seulement les colonnes Nom et Note.
</div>

**Corrigé :**
```powershell
$etudiants = @(
    [PSCustomObject]@{ Nom = "Jaslin"; Note = 16.5 }
    [PSCustomObject]@{ Nom = "Marie"; Note = 14.0 }
    [PSCustomObject]@{ Nom = "Paul"; Note = 18.2 }
)

$etudiants | Sort-Object Note -Descending | Select-Object Nom, Note | Format-Table
```

*Chapitre suivant : les conditions (if/else/switch) en PowerShell.*
