<div class="chapitre-titre-num">CHAPITRE 7</div>

# Le state avec useState

## 7.1 Pourquoi une variable JavaScript classique ne suffit pas

```jsx
function Compteur() {
  let valeur = 0;

  function incrementer() {
    valeur = valeur + 1;
    console.log(valeur); // la valeur change bien en mémoire...
  }

  return (
    <div>
      <p>{valeur}</p>
      <button onClick={incrementer}>+</button>
    </div>
  );
}
```

Si tu cliques sur le bouton, `valeur` change bien en mémoire (le `console.log` le prouve), **mais l'écran n'affiche jamais la nouvelle valeur**. Pourquoi ? Parce qu'une simple variable JavaScript ne déclenche **aucun nouveau rendu** du composant. React ne "sait" pas qu'il doit réafficher `<p>{valeur}</p>`.

C'est exactement le problème que le **state** résout : une variable spéciale qui, quand elle change, **déclenche automatiquement un nouveau rendu** du composant.

## 7.2 useState : le hook de base

```jsx
import { useState } from "react";

function Compteur() {
  const [valeur, setValeur] = useState(0);

  function incrementer() {
    setValeur(valeur + 1);
  }

  return (
    <div>
      <p>{valeur}</p>
      <button onClick={incrementer}>+</button>
    </div>
  );
}
```

`useState(0)` retourne un **tableau de deux éléments**, qu'on déstructure par convention :

- `valeur` : la valeur actuelle du state (ici, initialisée à `0`).
- `setValeur` : la **seule** fonction autorisée à modifier `valeur`. L'appeler déclenche un nouveau rendu du composant avec la nouvelle valeur.

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi un tableau et pas un objet ?</span>
`useState` retourne un tableau `[valeur, setValeur]` justement pour que tu puisses **choisir librement les noms** via la déstructuration positionnelle (`const [age, setAge] = useState(20)`, `const [nom, setNom] = useState("")`...). Avec un objet, les noms des propriétés seraient figés (`{ value, setValue }`) et il faudrait les renommer manuellement à chaque `useState` supplémentaire dans le même composant.
</div>

## 7.3 Chaque instance de composant a son propre state

```jsx
function Boutique() {
  return (
    <div>
      <Compteur />
      <Compteur />
    </div>
  );
}
```

Chaque `<Compteur />` possède son **propre** `valeur`, totalement indépendant de l'autre. Cliquer sur le bouton du premier n'affecte en rien le second. Le state est **local à chaque instance** du composant, pas partagé globalement (pour partager du state entre composants distants, voir Context API au chapitre 13 ou Redux Toolkit au chapitre 21).

## 7.4 Mettre à jour un state en fonction de sa valeur précédente

```jsx
// ⚠️ Piège classique
function incrementerDeuxFois() {
  setValeur(valeur + 1);
  setValeur(valeur + 1);
  // Résultat : valeur n'augmente que de 1, pas de 2 !
}
```

Pourquoi ? Parce que `valeur` dans les deux lignes fait référence à **la même valeur figée** au moment du rendu (avant que le clic ne soit traité). Les deux appels utilisent donc le même `valeur` de départ.

**Solution : la forme "fonction" de l'updater**, qui reçoit toujours la valeur la plus à jour :

```jsx
function incrementerDeuxFois() {
  setValeur((valeurPrecedente) => valeurPrecedente + 1);
  setValeur((valeurPrecedente) => valeurPrecedente + 1);
  // Résultat : valeur augmente bien de 2
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Règle pratique</span>
Dès que la nouvelle valeur du state dépend de son ancienne valeur, utilise **toujours** la forme fonction `setX(prev => ...)` plutôt que `setX(x + 1)`. C'est plus sûr dans tous les cas, même quand ce n'est pas strictement nécessaire.
</div>

## 7.5 State avec des objets et des tableaux : l'immuabilité

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Muter directement un objet ou tableau de state</span>
```jsx
function Profil() {
  const [utilisateur, setUtilisateur] = useState({ nom: "Jaslin", age: 24 });

  function vieillir() {
    utilisateur.age = utilisateur.age + 1; // ❌ mutation directe — React ne détecte pas le changement
    setUtilisateur(utilisateur); // même référence d'objet → aucun nouveau rendu déclenché
  }
}
```
React compare les states par **référence** (pas par valeur profonde) pour décider s'il doit refaire le rendu. Si tu modifies l'objet existant "en place" puis le repasses à `setUtilisateur`, React voit **la même référence** qu'avant et peut ignorer la mise à jour.
</div>

```jsx
// ✅ Correct : créer un NOUVEL objet (spread operator)
function vieillir() {
  setUtilisateur((prev) => ({ ...prev, age: prev.age + 1 }));
}
```

Même règle pour les tableaux :

```jsx
const [taches, setTaches] = useState(["Apprendre React"]);

// ❌ Mutation directe
function ajouterTache(nouvelle) {
  taches.push(nouvelle); // interdit
  setTaches(taches);
}

// ✅ Nouveau tableau
function ajouterTache(nouvelle) {
  setTaches((prev) => [...prev, nouvelle]);
}

// ✅ Suppression sans mutation (filter retourne un nouveau tableau)
function supprimerTache(index) {
  setTaches((prev) => prev.filter((_, i) => i !== index));
}
```

## 7.6 Plusieurs états indépendants dans un même composant

```jsx
function FormulaireInscription() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [chargement, setChargement] = useState(false);

  // Chaque useState gère une donnée indépendante avec son propre setter.
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un seul gros objet de state ou plusieurs useState ?</span>
Pour des données **logiquement liées et modifiées ensemble**, un seul `useState({ email, motDePasse })` peut avoir du sens. Pour des données **indépendantes** (comme ici), plusieurs `useState` séparés sont plus simples à lire et à mettre à jour (pas besoin de spread à chaque fois).
</div>

## 7.7 Erreurs fréquentes récapitulées

<div class="encadre attention">
<span class="encadre-titre">⚠️ Appeler un Hook de façon conditionnelle</span>
```jsx
// ❌ Interdit : un Hook ne doit JAMAIS être dans un if, une boucle, ou après un return
function Composant({ estVisible }) {
  if (estVisible) {
    const [valeur, setValeur] = useState(0); // ERREUR
  }
}
```
React identifie chaque `useState` par son **ordre d'appel** dans le composant, pas par son nom. Un Hook conditionnel casse cet ordre d'un rendu à l'autre et provoque des bugs difficiles à diagnostiquer. Règle stricte : tous les Hooks s'appellent **au niveau racine** du composant, dans le même ordre à chaque rendu, jamais dans une condition, une boucle ou une fonction imbriquée.
</div>

## 7.8 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 7.1</span>

Corrige ce composant qui n'incrémente jamais correctement de 3 en un seul clic :
```jsx
function Compteur() {
  const [valeur, setValeur] = useState(0);
  function ajouterTrois() {
    setValeur(valeur + 1);
    setValeur(valeur + 1);
    setValeur(valeur + 1);
  }
  return <button onClick={ajouterTrois}>{valeur}</button>;
}
```
</div>

**Corrigé :**
```jsx
function Compteur() {
  const [valeur, setValeur] = useState(0);
  function ajouterTrois() {
    setValeur((prev) => prev + 1);
    setValeur((prev) => prev + 1);
    setValeur((prev) => prev + 1);
  }
  return <button onClick={ajouterTrois}>{valeur}</button>;
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 7.2</span>

Crée un composant `ListeCourses` avec un state `articles` (tableau de chaînes) et deux boutons : un qui ajoute `"Nouvel article"` à la liste, un autre qui vide la liste (sans jamais muter le tableau directement).
</div>

**Corrigé :**
```jsx
function ListeCourses() {
  const [articles, setArticles] = useState([]);

  function ajouter() {
    setArticles((prev) => [...prev, "Nouvel article"]);
  }
  function vider() {
    setArticles([]);
  }

  return (
    <div>
      <ul>
        {articles.map((article, index) => (
          <li key={index}>{article}</li>
        ))}
      </ul>
      <button onClick={ajouter}>Ajouter</button>
      <button onClick={vider}>Vider</button>
    </div>
  );
}
```

## 7.9 Résumé du chapitre

- Une variable JavaScript classique ne déclenche pas de nouveau rendu ; le **state** (`useState`) le fait.
- `const [valeur, setValeur] = useState(initial)` : `valeur` est en lecture, `setValeur` est la seule façon de la modifier.
- Utilise `setValeur(prev => ...)` dès que la nouvelle valeur dépend de l'ancienne.
- Les objets et tableaux de state doivent être **remplacés par de nouvelles copies**, jamais mutés en place.
- Les Hooks (dont `useState`) s'appellent toujours au niveau racine du composant, jamais conditionnellement.

*Chapitre suivant : les événements en React (clics, saisie clavier, soumission de formulaire...).*
