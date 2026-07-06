<div class="chapitre-titre-num">CHAPITRE 4</div>

# JSX en profondeur

## 4.1 Qu'est-ce que JSX ?

**JSX** (JavaScript XML) est une extension de syntaxe qui permet d'écrire une structure ressemblant à du HTML directement dans du code JavaScript.

```jsx
const element = <h1>Bonjour Jaslin</h1>;
```

Ceci **n'est pas du HTML interprété par le navigateur**. C'est du **sucre syntaxique** que des outils comme Vite (via Babel/esbuild) transforment, avant exécution, en appels de fonction JavaScript classiques :

```jsx
// Ce que tu écris
const element = <h1 className="titre">Bonjour</h1>;
```

```js
// Ce que JSX devient réellement après transformation (simplifié)
const element = React.createElement("h1", { className: "titre" }, "Bonjour");
```

`React.createElement` retourne un simple objet JavaScript (le fameux **Virtual DOM** vu au chapitre 1) : `{ type: "h1", props: { className: "titre", children: "Bonjour" } }`. JSX n'est donc qu'une façon plus lisible d'écrire ces appels.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
JSX, c'est comme écrire une recette de cuisine en langage courant ("2 œufs, 200g de farine") plutôt qu'en instructions machine pures ("prendre_objet(œuf, quantité=2)"). Le résultat final exécuté est identique, mais la lecture humaine est bien plus simple.
</div>

## 4.2 Les règles strictes de JSX

### Règle 1 — Un seul élément racine

```jsx
// ❌ Erreur : deux éléments frères au niveau racine
function Profil() {
  return (
    <h1>Jaslin</h1>
    <p>Développeur</p>
  );
}
```

```jsx
// ✅ Correct : englobés dans un seul élément parent
function Profil() {
  return (
    <div>
      <h1>Jaslin</h1>
      <p>Développeur</p>
    </div>
  );
}
```

Si tu ne veux pas ajouter de `<div>` superflu dans le DOM final (par exemple pour ne pas casser un style CSS basé sur `:first-child`), utilise un **Fragment**, qui ne produit aucun élément dans le HTML final :

```jsx
import { Fragment } from "react";

function Profil() {
  return (
    <Fragment>
      <h1>Jaslin</h1>
      <p>Développeur</p>
    </Fragment>
  );
}

// Syntaxe raccourcie équivalente, très utilisée en pratique :
function ProfilCourt() {
  return (
    <>
      <h1>Jaslin</h1>
      <p>Développeur</p>
    </>
  );
}
```

### Règle 2 — Toutes les balises doivent être fermées

```jsx
// ❌ Erreur (valide en HTML, invalide en JSX)
<img src="photo.jpg">
<br>
<input type="text">
```

```jsx
// ✅ Correct : auto-fermeture obligatoire pour les balises sans enfant
<img src="photo.jpg" />
<br />
<input type="text" />
```

### Règle 3 — `className` au lieu de `class`, `htmlFor` au lieu de `for`

`class` et `for` sont des **mots réservés en JavaScript** (`class` pour les classes JS, `for` pour les boucles). JSX étant compilé en JavaScript, on utilise donc leurs équivalents :

```jsx
// ❌
<label class="label" for="email">Email</label>

// ✅
<label className="label" htmlFor="email">Email</label>
```

### Règle 4 — Les attributs sont en camelCase

```jsx
// HTML : onclick, tabindex
// JSX  : onClick, tabIndex
<button onClick={() => alert("clic")} tabIndex={0}>Valider</button>
```

## 4.3 Insérer du JavaScript dans le JSX avec les accolades `{}`

N'importe quelle **expression** JavaScript (pas une instruction complète comme `if` ou une boucle `for`) peut être insérée entre accolades :

```jsx
function CarteProduit() {
  const nom = "Riz local";
  const prix = 250;
  const enPromo = true;

  return (
    <div>
      <h2>{nom}</h2>
      <p>{prix} HTG</p>
      <p>Année : {new Date().getFullYear()}</p>
      <p>Statut : {enPromo ? "En promotion" : "Prix normal"}</p>
      <p>{prix > 200 ? "Prix élevé" : "Prix abordable"}</p>
    </div>
  );
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur fréquente : mettre une instruction dans les accolades</span>
```jsx
// ❌ Erreur : if est une instruction, pas une expression
<p>{ if (enPromo) { "Promo" } }</p>
```
Une instruction `if` classique ne "retourne" rien qu'on puisse afficher. Il faut soit utiliser l'opérateur ternaire `condition ? a : b` (vu ci-dessus), soit calculer la valeur **avant** le `return` (voir chapitre 9 sur le rendu conditionnel).
</div>

## 4.4 Le style inline en JSX : un objet, pas une chaîne

```jsx
// ❌ Erreur : en JSX, style n'accepte pas une chaîne comme en HTML
<div style="color: red; font-size: 20px;">Texte</div>

// ✅ Correct : un objet JavaScript, propriétés en camelCase
<div style={{ color: "red", fontSize: "20px" }}>Texte</div>
```

La double accolade `{{ }}` surprend souvent les débutants : la première accolade **ouvre l'expression JavaScript**, la seconde est celle **de l'objet littéral** `{ color: "red" }` lui-même.

## 4.5 Commentaires en JSX

```jsx
function Exemple() {
  return (
    <div>
      {/* Ceci est un commentaire visible uniquement dans le code source */}
      <p>Contenu visible</p>
    </div>
  );
}
```

Les commentaires JSX s'écrivent aussi entre accolades, car ce sont en réalité des commentaires JavaScript classiques `/* ... */` placés dans une expression.

## 4.6 Erreurs fréquentes récapitulées

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier la clé sur une liste</span>
Traitée en détail au chapitre 10, mais mentionnée ici car elle apparaît dès qu'on mélange JSX et `.map()` : chaque élément généré dynamiquement doit avoir une prop `key` unique.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Confondre attribut HTML et prop React</span>
`value` sur un `<input>` non contrôlé sans `onChange` génère un avertissement React ("a component is changing an uncontrolled input"). Ce sujet est détaillé au chapitre 11 (formulaires).
</div>

## 4.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 4.1</span>

Corrige ce code JSX invalide :
```jsx
function Carte() {
  return (
    <div class="carte">
      <h2>Titre</h2>
      <p>Description</p>
    <img src="photo.jpg">
  );
}
```
</div>

**Corrigé :**
```jsx
function Carte() {
  return (
    <div className="carte">
      <h2>Titre</h2>
      <p>Description</p>
      <img src="photo.jpg" />
    </div>
  );
}
```
Trois erreurs corrigées : `class` → `className`, balise `<img>` auto-fermée, et `<div>` racine correctement refermé (il manquait sa balise fermante).

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 4.2</span>

Écris un composant `PrixAffiche` qui reçoit une variable locale `montant = 1500` et qui affiche le texte en rouge et en gras si `montant > 1000`, sinon en noir normal (utilise un style inline conditionnel).
</div>

**Corrigé :**
```jsx
function PrixAffiche() {
  const montant = 1500;
  const styleMontant = {
    color: montant > 1000 ? "red" : "black",
    fontWeight: montant > 1000 ? "bold" : "normal",
  };

  return <p style={styleMontant}>{montant} HTG</p>;
}
```

## 4.8 Résumé du chapitre

- JSX est du sucre syntaxique compilé en appels `React.createElement(...)`.
- Un seul élément racine par `return` (ou un Fragment `<>...</>`).
- Toutes les balises se ferment, `className`/`htmlFor` remplacent `class`/`for`, attributs en camelCase.
- Les accolades `{}` insèrent des **expressions** JavaScript, pas des instructions.
- Le style inline est un objet JS (`style={{ ... }}`), pas une chaîne.

*Chapitre suivant : les composants, unité de base de toute application React.*
