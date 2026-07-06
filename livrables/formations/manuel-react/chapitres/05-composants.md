<div class="chapitre-titre-num">CHAPITRE 5</div>

# Les composants

## 5.1 Définition

Un **composant** est une fonction JavaScript qui respecte deux règles :

1. Son nom commence par une **majuscule** (convention obligatoire : React distingue une balise HTML `<div>` d'un composant `<Carte>` uniquement par la casse de la première lettre).
2. Elle retourne du **JSX** (ce qui doit être affiché à l'écran).

```jsx
function BoutonValider() {
  return <button>Valider</button>;
}
```

Ce composant s'utilise ensuite comme une balise JSX à part entière :

```jsx
function Formulaire() {
  return (
    <div>
      <input type="text" />
      <BoutonValider />
    </div>
  );
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Composant en minuscule</span>
```jsx
function boutonValider() { return <button>Valider</button>; }
// <boutonValider /> → React le traite comme une balise HTML inconnue, pas comme ton composant !
```
Toujours nommer ses composants en **PascalCase** (`BoutonValider`, pas `boutonValider`).
</div>

## 5.2 Pourquoi découper en composants : l'analogie du restaurant

Pense à un restaurant. Le menu (l'application) est composé de plats (les pages), eux-mêmes composés d'ingrédients (les composants) : une **entrée**, un **plat principal**, un **dessert**. Chaque ingrédient peut être préparé, testé et modifié **indépendamment**, puis réutilisé dans plusieurs plats.

Une page e-commerce typique se découpe ainsi :

```
Page Produit
├── Header (réutilisé sur toutes les pages)
│   ├── Logo
│   ├── BarreRecherche
│   └── IconePanier
├── GaleriePhotos
├── InfosProduit
│   ├── Titre
│   ├── Prix
│   └── BoutonAjouterAuPanier
├── AvisClients
│   └── AvisItem (répété pour chaque avis)
└── Footer
```

Chaque bloc est un composant. `AvisItem` en particulier illustre la **réutilisation** : le même composant est utilisé plusieurs fois avec des données différentes (voir chapitre 6 sur les props, et chapitre 10 sur les listes).

## 5.3 Composition : assembler des composants entre eux

```jsx
function Titre({ children }) {
  return <h2 className="titre">{children}</h2>;
}

function Carte({ children }) {
  return <div className="carte">{children}</div>;
}

function PageAccueil() {
  return (
    <Carte>
      <Titre>Bienvenue</Titre>
      <p>Contenu de la carte.</p>
    </Carte>
  );
}
```

La prop spéciale `children` (détaillée au chapitre 6) contient tout ce qui est placé **entre** les balises ouvrante et fermante d'un composant. C'est le mécanisme qui permet de construire des composants "enveloppes" génériques (`Carte`, `Modal`, `Layout`) réutilisables avec n'importe quel contenu à l'intérieur.

## 5.4 Un fichier, un composant (convention)

Sur un vrai projet, chaque composant vit dans son propre fichier, exporté puis importé où nécessaire :

```jsx
// components/BoutonValider.jsx
function BoutonValider() {
  return <button className="btn-valider">Valider</button>;
}

export default BoutonValider;
```

```jsx
// pages/Formulaire.jsx
import BoutonValider from "../components/BoutonValider";

function Formulaire() {
  return (
    <div>
      <input type="text" />
      <BoutonValider />
    </div>
  );
}

export default Formulaire;
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Export par défaut vs export nommé</span>
`export default` permet un seul export principal par fichier, importable sous n'importe quel nom (`import Truc from "./BoutonValider"` fonctionnerait aussi, même mal nommé — à éviter par discipline). `export const BoutonValider = () => {...}` (export nommé) impose d'utiliser exactement `import { BoutonValider } from "..."`. Les deux sont valides ; beaucoup d'équipes préfèrent les exports nommés car les erreurs de faute de frappe sont détectées immédiatement par l'éditeur.
</div>

## 5.5 Composants fonction vs composants classe

Avant 2019, React n'offrait que des **composants classe** pour gérer le state :

```jsx
// Ancienne syntaxe (composant classe) — à connaître pour lire du code legacy
import { Component } from "react";

class Compteur extends Component {
  constructor(props) {
    super(props);
    this.state = { valeur: 0 };
  }
  render() {
    return <p>{this.state.valeur}</p>;
  }
}
```

Depuis l'introduction des **Hooks** (React 16.8, 2019), les **composants fonction** permettent de faire exactement la même chose, avec une syntaxe bien plus courte et sans les pièges du mot-clé `this` :

```jsx
import { useState } from "react";

function Compteur() {
  const [valeur, setValeur] = useState(0);
  return <p>{valeur}</p>;
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce manuel</span>
Ce manuel n'utilise **que des composants fonction** avec des hooks, la norme absolue dans tout projet React démarré aujourd'hui. Les composants classe sont mentionnés uniquement pour que tu puisses reconnaître et lire du code plus ancien.
</div>

## 5.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Définir un composant à l'intérieur d'un autre composant</span>
```jsx
// ❌ Mauvaise pratique : ComposantEnfant est recréé à chaque rendu de Parent
function Parent() {
  function ComposantEnfant() {
    return <p>Enfant</p>;
  }
  return <ComposantEnfant />;
}
```
Recréer la fonction du composant à chaque rendu fait perdre son state à chaque fois et nuit aux performances (React considère que c'est un "nouveau" composant à chaque rendu). Toujours définir les composants **au niveau racine du fichier**, jamais imbriqués dans le corps d'un autre composant.
</div>

## 5.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 5.1</span>

Découpe ce composant monolithique en trois composants séparés : `EnTete`, `Contenu`, `PiedDePage`.
```jsx
function Page() {
  return (
    <div>
      <header><h1>Mon Site</h1></header>
      <main><p>Bienvenue sur mon site.</p></main>
      <footer><p>© 2026</p></footer>
    </div>
  );
}
```
</div>

**Corrigé :**
```jsx
function EnTete() {
  return <header><h1>Mon Site</h1></header>;
}
function Contenu() {
  return <main><p>Bienvenue sur mon site.</p></main>;
}
function PiedDePage() {
  return <footer><p>© 2026</p></footer>;
}
function Page() {
  return (
    <div>
      <EnTete />
      <Contenu />
      <PiedDePage />
    </div>
  );
}
```

## 5.8 Résumé du chapitre

- Un composant est une fonction PascalCase qui retourne du JSX.
- On assemble des composants par **composition** (imbrication), avec `children` pour les contenus génériques.
- Convention : un fichier par composant, `export default`.
- Les composants fonction + hooks ont remplacé les composants classe dans tout code moderne.
- Ne jamais définir un composant à l'intérieur du corps d'un autre composant.

*Chapitre suivant : les props, pour faire communiquer un composant parent avec ses enfants.*
