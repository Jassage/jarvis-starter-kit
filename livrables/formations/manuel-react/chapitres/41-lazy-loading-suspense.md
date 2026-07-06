<div class="chapitre-titre-num">CHAPITRE 41</div>

# Lazy Loading et Suspense

## 41.1 Le problème : un bundle JavaScript qui grossit avec le projet

Par défaut, `npm run build` (chapitre 2) regroupe **tout** le code JavaScript de l'application en un (ou quelques) fichiers, téléchargés intégralement au premier chargement de la page — y compris le code des pages que l'utilisateur ne visitera peut-être jamais (un panneau d'administration, une page de paramètres avancés rarement ouverte).

**Analogie :** c'est comme télécharger l'intégralité d'un livre de 500 pages avant de pouvoir lire la première ligne, alors qu'on ne veut peut-être lire que le premier chapitre aujourd'hui. Le **lazy loading** ne télécharge chaque "chapitre" (morceau de code) qu'au moment où l'utilisateur en a réellement besoin.

## 41.2 React.lazy : charger un composant à la demande

```jsx
import { lazy, Suspense } from "react";

// Au lieu d'un import classique statique...
// import PanneauAdmin from "./pages/PanneauAdmin";

// ...un import PARESSEUX : le code de PanneauAdmin n'est téléchargé qu'au moment du premier rendu
const PanneauAdmin = lazy(() => import("./pages/PanneauAdmin"));

function App() {
  return (
    <Suspense fallback={<p>Chargement de la page...</p>}>
      <PanneauAdmin />
    </Suspense>
  );
}
```

`lazy(() => import("..."))` retourne un composant qui, à son premier rendu, **télécharge** le fichier JavaScript correspondant (généré séparément par Vite au moment du build), puis l'affiche.

`<Suspense fallback={...}>` est **obligatoire** autour d'un composant chargé en lazy : il affiche le contenu de `fallback` **pendant** le téléchargement, puis le composant réel une fois prêt.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un composant lazy sans Suspense englobant plante l'application</span>
```jsx
// ❌ Erreur : "A component suspended while responding to synchronous input"
function App() {
  return <PanneauAdmin />; // pas de <Suspense> autour !
}
```
`Suspense` est le mécanisme que React utilise pour "mettre en pause" le rendu pendant qu'une ressource asynchrone (ici, le téléchargement du code) n'est pas encore prête. Sans lui, React ne sait pas quoi afficher pendant ce chargement.
</div>

## 41.3 Cas d'usage le plus courant : découper par route

```jsx
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const Accueil = lazy(() => import("./pages/Accueil"));
const Produits = lazy(() => import("./pages/Produits"));
const PanneauAdmin = lazy(() => import("./pages/PanneauAdmin"));

function App() {
  return (
    <Suspense fallback={<ChargementPage />}>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/produits" element={<Produits />} />
        <Route path="/admin" element={<PanneauAdmin />} />
      </Routes>
    </Suspense>
  );
}
```

Un seul `<Suspense>` englobant toutes les `<Routes>` suffit : chaque page devient un fichier JavaScript séparé (un "chunk"), téléchargé uniquement quand l'utilisateur navigue vers cette route précise. Un visiteur qui ne visite jamais `/admin` ne télécharge **jamais** le code de `PanneauAdmin`.

## 41.4 Suspense multiples et granularité

```jsx
function TableauDeBord() {
  return (
    <div className="dashboard">
      <Suspense fallback={<SquelettChargement />}>
        <WidgetVentes />
      </Suspense>
      <Suspense fallback={<SquelettChargement />}>
        <WidgetNotifications />
      </Suspense>
    </div>
  );
}
```

Encapsuler chaque widget dans son **propre** `Suspense` permet à chacun d'afficher son propre indicateur de chargement, indépendamment des autres — un widget lent à charger n'empêche pas les autres de s'afficher dès qu'ils sont prêts.

## 41.5 Composants "squelette" (skeleton) plutôt qu'un simple spinner

```jsx
function SquelettChargement() {
  return (
    <div className="squelette">
      <div className="squelette-ligne" style={{ width: "60%" }} />
      <div className="squelette-ligne" style={{ width: "80%" }} />
      <div className="squelette-ligne" style={{ width: "40%" }} />
    </div>
  );
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un squelette qui imite la mise en page finale réduit la sensation d'attente</span>
Un simple texte "Chargement..." ou un spinner générique donne une impression de latence plus marquée qu'un squelette qui préfigure déjà la structure du contenu à venir (technique largement utilisée par LinkedIn, Facebook, YouTube). Ce n'est pas une optimisation technique de vitesse réelle, mais une optimisation de **vitesse perçue**, tout aussi importante pour l'expérience utilisateur.
</div>

## 41.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ lazy() sur un composant utilisé immédiatement au premier écran</span>
```jsx
// ❌ Contre-productif : Header s'affiche sur CHAQUE page, dès le premier chargement
const Header = lazy(() => import("./components/Header"));
```
Appliquer `lazy()` à un composant systématiquement affiché dès le premier écran **ajoute** une étape de chargement asynchrone inutile, sans aucun bénéfice (le code aurait de toute façon dû être téléchargé immédiatement). Réserve le lazy loading aux parties de l'application réellement **conditionnelles** dans le temps : routes différentes, modales rarement ouvertes, fonctionnalités avancées peu utilisées.
</div>

## 41.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 41.1</span>

Convertis ces trois routes en chargement paresseux, avec un seul `Suspense` englobant et un composant de fallback `ChargementPage` affichant "Chargement...".
```jsx
import Accueil from "./pages/Accueil";
import Profil from "./pages/Profil";
import Parametres from "./pages/Parametres";
```
</div>

**Corrigé :**
```jsx
import { lazy, Suspense } from "react";

const Accueil = lazy(() => import("./pages/Accueil"));
const Profil = lazy(() => import("./pages/Profil"));
const Parametres = lazy(() => import("./pages/Parametres"));

function ChargementPage() {
  return <p>Chargement...</p>;
}

function App() {
  return (
    <Suspense fallback={<ChargementPage />}>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/parametres" element={<Parametres />} />
      </Routes>
    </Suspense>
  );
}
```

## 41.8 Résumé du chapitre

- `React.lazy(() => import(...))` télécharge le code d'un composant seulement au moment où il est réellement rendu pour la première fois.
- `<Suspense fallback={...}>` est obligatoire autour d'un composant lazy, et affiche un contenu de repli pendant le chargement.
- Le découpage par route est le cas d'usage le plus courant et le plus rentable.
- Plusieurs `Suspense` indépendants permettent un chargement granulaire, widget par widget.
- Ne jamais appliquer `lazy()` à un composant affiché systématiquement dès le premier écran.

*Chapitre suivant : le Code Splitting, pour comprendre comment Vite découpe réellement le bundle final en coulisses.*
