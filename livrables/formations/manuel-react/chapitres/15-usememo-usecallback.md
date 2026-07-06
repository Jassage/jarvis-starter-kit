<div class="chapitre-titre-num">CHAPITRE 15</div>

# useMemo et useCallback

## 15.0 Avertissement avant de commencer

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne pas optimiser prématurément</span>
`useMemo` et `useCallback` sont des outils de **performance**, pas des réflexes systématiques. Les ajouter partout "par précaution" ajoute de la complexité et parfois même **dégrade** légèrement les performances (le cache lui-même a un coût). La règle professionnelle : écris ton code simplement d'abord, mesure un vrai problème de performance avec le Profiler (chapitre 40), puis applique ces outils **uniquement** là où un ralentissement réel est constaté.
</div>

## 15.1 useMemo : mettre en cache le résultat d'un calcul

`useMemo` mémorise le **résultat** d'un calcul, et ne le recalcule que si l'une de ses dépendances change.

```jsx
import { useMemo } from "react";

function ListeProduitsFiltres({ produits, recherche }) {
  const produitsFiltres = useMemo(() => {
    console.log("Filtrage recalculé..."); // observe quand ce log apparaît réellement
    return produits.filter((p) => p.nom.toLowerCase().includes(recherche.toLowerCase()));
  }, [produits, recherche]); // recalculé seulement si produits OU recherche change

  return (
    <ul>
      {produitsFiltres.map((p) => (
        <li key={p.id}>{p.nom}</li>
      ))}
    </ul>
  );
}
```

Sans `useMemo`, le filtrage s'exécuterait à **chaque rendu** du composant, même pour des rendus déclenchés par autre chose (ex : un autre state du même composant qui n'a rien à voir avec la liste). Avec `useMemo`, le filtrage n'est recalculé que quand `produits` ou `recherche` changent réellement.

## 15.2 useCallback : mettre en cache une fonction

`useCallback` fait la même chose que `useMemo`, mais pour une **fonction** plutôt qu'une valeur calculée. Il retourne **la même référence de fonction** entre deux rendus tant que ses dépendances n'ont pas changé.

```jsx
import { useCallback } from "react";

function ListeTaches({ taches }) {
  const gererSuppression = useCallback((id) => {
    console.log("Suppression de la tâche", id);
  }, []); // aucune dépendance : toujours la MÊME référence de fonction

  return (
    <ul>
      {taches.map((tache) => (
        <TacheItem key={tache.id} tache={tache} onSupprimer={gererSuppression} />
      ))}
    </ul>
  );
}
```

**Pourquoi est-ce utile ?** Parce que sans `useCallback`, `gererSuppression` serait **une nouvelle fonction à chaque rendu** de `ListeTaches` (rappel du chapitre 8). Si `TacheItem` est optimisé avec `React.memo` (section 15.3), cette nouvelle référence de fonction à chaque rendu **casserait** cette optimisation, car `React.memo` compare les props par référence.

## 15.3 Le lien avec React.memo

`React.memo` enveloppe un composant pour qu'il **ne se re-rende que si ses props ont changé** (comparaison superficielle par référence) :

```jsx
import { memo } from "react";

const TacheItem = memo(function TacheItem({ tache, onSupprimer }) {
  console.log("Rendu de", tache.texte);
  return (
    <li>
      {tache.texte}
      <button onClick={() => onSupprimer(tache.id)}>Supprimer</button>
    </li>
  );
});
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ React.memo seul ne suffit pas si tu passes une fonction recréée à chaque fois</span>
Si `ListeTaches` recrée `gererSuppression` à chaque rendu (sans `useCallback`), alors même si `TacheItem` est enveloppé dans `React.memo`, il se re-rendra quand même à chaque rendu du parent : `onSupprimer` est "une nouvelle prop" à chaque fois du point de vue de la comparaison par référence. `React.memo` + `useCallback` fonctionnent **ensemble**, l'un sans l'autre est souvent inutile.
</div>

## 15.4 useMemo vs useCallback : une nuance simple

```jsx
// useMemo met en cache une VALEUR (le résultat de la fonction est exécuté immédiatement)
const valeurCalculee = useMemo(() => calculerQuelqueChose(a, b), [a, b]);

// useCallback met en cache une FONCTION elle-même (pas exécutée, juste stockée)
const fonctionMiseEnCache = useCallback(() => calculerQuelqueChose(a, b), [a, b]);
```

En réalité, `useCallback(fn, deps)` est strictement équivalent à `useMemo(() => fn, deps)` : `useCallback` est juste un raccourci pratique pour le cas spécifique où ce qu'on veut mettre en cache est une fonction.

## 15.5 Un cas d'usage réel : éviter de recalculer un tri coûteux

```jsx
function TableauClients({ clients, colonneTri }) {
  const clientsTries = useMemo(() => {
    return [...clients].sort((a, b) => a[colonneTri].localeCompare(b[colonneTri]));
  }, [clients, colonneTri]);

  return (
    <table>
      <tbody>
        {clientsTries.map((c) => (
          <tr key={c.id}><td>{c.nom}</td></tr>
        ))}
      </tbody>
    </table>
  );
}
```

Sur une liste de quelques dizaines de clients, ce tri est négligeable même sans `useMemo`. Sur une liste de plusieurs milliers d'éléments recalculée à chaque frappe dans un champ de recherche non lié à ce tri, la différence devient mesurable.

## 15.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier une dépendance dans le tableau</span>
```jsx
// ❌ Bug : "recherche" est utilisée dans le calcul mais absente des dépendances
const resultats = useMemo(() => {
  return produits.filter((p) => p.nom.includes(recherche));
}, [produits]); // recherche manquante !
```
Résultat : quand l'utilisateur tape dans le champ de recherche, `resultats` ne se met **pas à jour**, car `useMemo` ne "voit" pas que `recherche` a changé (elle n'est pas dans le tableau de dépendances). L'ESLint `eslint-plugin-react-hooks` détecte ce cas précis et doit toujours être respecté.
</div>

## 15.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 15.1</span>

Explique pourquoi ce code ne bénéficie d'aucune optimisation réelle malgré l'utilisation de `useCallback` :
```jsx
function Parent() {
  const gererClic = useCallback(() => {
    console.log("clic");
  }, []);
  return <EnfantNonMemo onClic={gererClic} />;
}

function EnfantNonMemo({ onClic }) {
  console.log("Rendu de l'enfant");
  return <button onClick={onClic}>Cliquer</button>;
}
```
</div>

**Corrigé :** `EnfantNonMemo` n'est **pas** enveloppé dans `React.memo`. Sans `React.memo`, un composant se re-rend de toute façon à chaque rendu de son parent, quelle que soit la stabilité des props reçues — `useCallback` seul ne sert donc ici strictement à rien. Il faudrait envelopper `EnfantNonMemo` dans `memo(...)` pour que la stabilité de `gererClic` ait un effet mesurable.

## 15.8 Résumé du chapitre

- `useMemo` met en cache le **résultat** d'un calcul ; `useCallback` met en cache une **fonction** (cas particulier de `useMemo`).
- Ces outils n'ont d'effet réel que combinés à `React.memo` sur le composant enfant qui reçoit la valeur/fonction en prop.
- Ne les utilise que pour un problème de performance **mesuré**, pas par réflexe systématique — la mise en cache a elle-même un coût.
- Une dépendance manquante dans le tableau produit un bug silencieux (valeur "figée" qui ne se met plus à jour).

*Chapitre suivant : useRef, pour accéder directement à un élément du DOM ou conserver une valeur qui ne déclenche pas de rendu.*
