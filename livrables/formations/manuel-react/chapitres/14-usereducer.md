<div class="chapitre-titre-num">CHAPITRE 14</div>

# useReducer

## 14.1 Quand useState devient insuffisant

`useState` fonctionne très bien pour des états simples et indépendants. Mais dès qu'un composant gère **une logique de state complexe**, avec plusieurs actions possibles qui modifient plusieurs champs liés selon des règles précises, le code à base de `useState` multiples devient difficile à suivre :

```jsx
// Avec useState multiples : la logique de mise à jour est éparpillée
function Panier() {
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [reduction, setReduction] = useState(0);

  function ajouterArticle(article) {
    const nouveauxArticles = [...articles, article];
    setArticles(nouveauxArticles);
    setTotal(nouveauxArticles.reduce((s, a) => s + a.prix, 0));
    // ... et si on oublie de recalculer la réduction ici ?
  }
  // ... autant de fonctions que d'actions possibles, chacune répétant la logique de recalcul
}
```

**`useReducer`** centralise toute cette logique dans **une seule fonction pure** (le "reducer"), qui reçoit l'état actuel et une "action" décrivant ce qui s'est passé, et retourne le **nouvel** état.

## 14.2 Anatomie de useReducer

```jsx
import { useReducer } from "react";

// 1. Le reducer : une fonction PURE (pas d'effet de bord) qui décrit toutes les transitions possibles
function panierReducer(etat, action) {
  switch (action.type) {
    case "AJOUTER_ARTICLE":
      return { ...etat, articles: [...etat.articles, action.payload] };
    case "RETIRER_ARTICLE":
      return { ...etat, articles: etat.articles.filter((a) => a.id !== action.payload) };
    case "VIDER_PANIER":
      return { ...etat, articles: [] };
    default:
      throw new Error(`Action inconnue : ${action.type}`);
  }
}

const etatInitial = { articles: [] };

function Panier() {
  const [etat, dispatch] = useReducer(panierReducer, etatInitial);

  function ajouter(article) {
    dispatch({ type: "AJOUTER_ARTICLE", payload: article });
  }

  return (
    <div>
      <p>{etat.articles.length} article(s)</p>
      <button onClick={() => ajouter({ id: 1, nom: "Riz", prix: 250 })}>Ajouter du riz</button>
      <button onClick={() => dispatch({ type: "VIDER_PANIER" })}>Vider</button>
    </div>
  );
}
```

- `useReducer(reducer, etatInitial)` retourne `[etat, dispatch]`, où `etat` est l'état actuel et `dispatch` est la fonction qu'on appelle pour déclencher une transition.
- Une **action** est un simple objet décrivant "ce qui s'est passé" (convention : un champ `type`, souvent un champ `payload` pour les données associées).
- Le **reducer** est une fonction pure : à état et action identiques, il doit **toujours** retourner le même résultat, sans jamais modifier `etat` directement (mêmes règles d'immuabilité qu'au chapitre 7).

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie : le reducer est un distributeur automatique</span>
Tu insères une pièce précise (l'action) dans une machine (le reducer) qui, selon la pièce reçue et ce qu'il y avait déjà dedans (l'état actuel), produit toujours le même résultat prévisible. La machine ne "décide" jamais de faire autre chose que ce que sa logique interne prévoit — c'est la définition même d'une fonction pure.
</div>

## 14.3 useState vs useReducer : comment choisir

| Critère | useState | useReducer |
|---|---|---|
| Nombre de valeurs liées | 1 ou 2 valeurs indépendantes | Plusieurs valeurs qui évoluent ensemble selon des règles |
| Nombre d'actions possibles | 1 ou 2 (incrémenter, changer) | Beaucoup (ajouter, retirer, modifier, réinitialiser...) |
| Logique de mise à jour | Simple, une ligne | Complexe, avec plusieurs cas |
| Testabilité | Difficile à tester isolément | Le reducer est une fonction pure, testable indépendamment de React |

<div class="encadre astuce">
<span class="encadre-titre">💡 Ne pas sur-ingénierer</span>
N'utilise pas `useReducer` "parce que c'est plus professionnel" sur un simple compteur ou un simple champ de texte : ce serait ajouter de la complexité pour rien. Réserve-le aux cas où plusieurs actions modifient un state structuré selon des règles qui commencent à devenir difficiles à suivre avec `useState`.
</div>

## 14.4 useReducer + useContext : un mini-Redux "maison"

Une combinaison très utilisée avant d'avoir besoin de Redux Toolkit (chapitre 21) : partager un `useReducer` via le Context API pour obtenir un state global structuré, sans dépendance externe.

```jsx
// context/PanierContext.jsx
import { createContext, useContext, useReducer } from "react";

const PanierContext = createContext(null);

function panierReducer(etat, action) {
  switch (action.type) {
    case "AJOUTER_ARTICLE":
      return { ...etat, articles: [...etat.articles, action.payload] };
    case "VIDER_PANIER":
      return { ...etat, articles: [] };
    default:
      return etat;
  }
}

export function PanierProvider({ children }) {
  const [etat, dispatch] = useReducer(panierReducer, { articles: [] });
  return (
    <PanierContext.Provider value={{ etat, dispatch }}>
      {children}
    </PanierContext.Provider>
  );
}

export function usePanier() {
  const contexte = useContext(PanierContext);
  if (!contexte) throw new Error("usePanier doit être utilisé dans un PanierProvider");
  return contexte;
}
```

N'importe quel composant peut désormais lire `etat.articles` et appeler `dispatch({ type: "AJOUTER_ARTICLE", payload })`, sans prop drilling, avec une logique de mise à jour centralisée et testable.

## 14.5 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Muter l'état directement dans le reducer</span>
```jsx
// ❌ Mutation directe : viole la pureté du reducer, React peut ne pas détecter le changement
function reducer(etat, action) {
  if (action.type === "AJOUTER_ARTICLE") {
    etat.articles.push(action.payload); // interdit
    return etat; // même référence qu'avant !
  }
}
```
```jsx
// ✅ Toujours retourner un NOUVEL objet
function reducer(etat, action) {
  if (action.type === "AJOUTER_ARTICLE") {
    return { ...etat, articles: [...etat.articles, action.payload] };
  }
  return etat;
}
```
</div>

## 14.6 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 14.1</span>

Écris un reducer `compteurReducer` gérant trois actions : `INCREMENTER`, `DECREMENTER`, `REINITIALISER` (retour à 0), utilisé dans un composant `Compteur`.
</div>

**Corrigé :**
```jsx
function compteurReducer(etat, action) {
  switch (action.type) {
    case "INCREMENTER":
      return { valeur: etat.valeur + 1 };
    case "DECREMENTER":
      return { valeur: etat.valeur - 1 };
    case "REINITIALISER":
      return { valeur: 0 };
    default:
      return etat;
  }
}

function Compteur() {
  const [etat, dispatch] = useReducer(compteurReducer, { valeur: 0 });
  return (
    <div>
      <p>{etat.valeur}</p>
      <button onClick={() => dispatch({ type: "INCREMENTER" })}>+</button>
      <button onClick={() => dispatch({ type: "DECREMENTER" })}>-</button>
      <button onClick={() => dispatch({ type: "REINITIALISER" })}>Réinitialiser</button>
    </div>
  );
}
```

## 14.7 Résumé du chapitre

- `useReducer` centralise une logique de state complexe dans une fonction pure (le reducer), appelée via `dispatch(action)`.
- Préférable à plusieurs `useState` quand plusieurs valeurs liées évoluent selon de nombreuses actions.
- Le reducer doit rester **pur** : jamais de mutation directe, toujours un nouvel objet retourné.
- Combiné à `useContext`, `useReducer` forme un state global structuré sans dépendance externe — une étape naturelle avant Redux Toolkit si le besoin grandit encore.

*Chapitre suivant : useMemo et useCallback, pour optimiser les calculs coûteux et éviter des re-rendus inutiles.*
