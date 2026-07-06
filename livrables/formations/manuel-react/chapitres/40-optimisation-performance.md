<div class="chapitre-titre-num">CHAPITRE 40</div>

# Optimisation des performances et re-rendus

## 40.1 Mesurer avant d'optimiser

<div class="encadre attention">
<span class="encadre-titre">⚠️ Règle absolue, déjà répétée au chapitre 15 : ne jamais optimiser sans mesurer</span>
La règle la plus importante de ce chapitre n'est pas une technique, c'est une discipline : **ne jamais** appliquer une optimisation de performance sans avoir d'abord identifié, mesuré et confirmé un vrai problème. Optimiser à l'aveugle ajoute de la complexité, rend le code plus difficile à maintenir, et parfois **dégrade** les performances réelles.
</div>

## 40.2 Le React DevTools Profiler

L'extension navigateur **React DevTools** inclut un onglet **Profiler** qui enregistre les rendus d'une session d'utilisation réelle de l'application, et affiche :

- Quels composants se sont re-rendus, et combien de fois.
- Le temps passé à rendre chaque composant.
- **Pourquoi** un composant s'est re-rendu (option "Why did this render?").

```
1. Ouvrir les DevTools du navigateur → onglet "Profiler" (React DevTools)
2. Cliquer sur le bouton d'enregistrement (cercle rouge)
3. Interagir avec l'application (cliquer, taper, naviguer)
4. Arrêter l'enregistrement
5. Analyser le "flame graph" : les composants les plus larges/colorés ont pris le plus de temps
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Toujours commencer par là, pas par l'intuition</span>
Une intuition sur "ce qui doit être lent" est souvent fausse. Le Profiler révèle parfois qu'un composant qu'on pensait anodin se re-rend 40 fois par seconde à cause d'un effet mal configuré (chapitre 12), pendant qu'un composant qu'on pensait "lourd" ne pose en réalité aucun problème réel.
</div>

## 40.3 Pourquoi un composant se re-rend : les 3 causes

1. **Son state a changé** (`useState`/`useReducer`, chapitres 7 et 14).
2. **Son parent s'est re-rendu**, et le composant n'est pas mémoïsé (`React.memo`, chapitre 15).
3. **Un Context qu'il consomme a changé** (chapitre 13).

## 40.4 React.memo, useMemo, useCallback : le trio récapitulé

Ces trois outils, déjà présentés en détail au chapitre 15, se combinent ainsi dans un cas concret de liste optimisée :

```jsx
import { memo, useMemo, useCallback, useState } from "react";

const LigneProduit = memo(function LigneProduit({ produit, onSupprimer }) {
  console.log("Rendu de", produit.nom); // à surveiller dans la console pendant le test
  return (
    <tr>
      <td>{produit.nom}</td>
      <td>{produit.prix} HTG</td>
      <td><button onClick={() => onSupprimer(produit.id)}>Supprimer</button></td>
    </tr>
  );
});

function TableauProduits({ produits }) {
  const [recherche, setRecherche] = useState("");

  const produitsFiltres = useMemo(
    () => produits.filter((p) => p.nom.toLowerCase().includes(recherche.toLowerCase())),
    [produits, recherche]
  );

  const gererSuppression = useCallback((id) => {
    console.log("Suppression", id);
  }, []);

  return (
    <div>
      <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher..." />
      <table>
        <tbody>
          {produitsFiltres.map((p) => (
            <LigneProduit key={p.id} produit={p} onSupprimer={gererSuppression} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

Sans `memo` + `useCallback` combinés, taper dans le champ de recherche re-rendrait **toutes** les lignes du tableau à chaque frappe, même celles dont le contenu affiché n'a pas changé.

## 40.5 Virtualisation de listes très longues

Sur une liste de plusieurs milliers d'éléments (un historique de transactions bancaires, par exemple, comme sur BANKA), même une liste bien optimisée avec `memo` reste coûteuse si **tous** les éléments sont réellement présents dans le DOM. La **virtualisation** ne rend que les éléments visibles à l'écran, plus une petite marge :

```
$ npm install @tanstack/react-virtual
```

```jsx
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

function ListeTransactionsVirtualisee({ transactions }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // hauteur estimée d'une ligne, en pixels
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div
            key={item.key}
            style={{ position: "absolute", top: 0, transform: `translateY(${item.start}px)`, height: item.size }}
          >
            {transactions[item.index].description}
          </div>
        ))}
      </div>
    </div>
  );
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un compromis de complexité, réservé aux vraies listes massives</span>
La virtualisation ajoute une vraie complexité (calcul de position, gestion du scroll). Elle ne se justifie que pour des listes de plusieurs centaines/milliers d'éléments affichés simultanément. Pour une liste paginée (10-50 éléments par page), elle est presque toujours inutile.
</div>

## 40.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Objet ou tableau littéral créé en ligne comme prop</span>
```jsx
// ❌ { couleur: "rouge" } est un NOUVEL objet à chaque rendu, casse React.memo sur EnfantMemo
<EnfantMemo style={{ couleur: "rouge" }} />
```
Un objet ou tableau littéral écrit directement dans le JSX (`style={{ ... }}`, `options={[...]}`) crée une **nouvelle référence** à chaque rendu du parent, ce qui annule l'effet d'un `React.memo` sur le composant enfant qui la reçoit — exactement le même piège que les fonctions vu au chapitre 15, mais pour les objets/tableaux. Solution : extraire la valeur dans une constante hors du composant (si elle est statique) ou dans un `useMemo` (si elle dépend de props/state).
</div>

## 40.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 40.1</span>

Utilise le React DevTools Profiler sur une application de ton choix (un de tes projets, ou l'exercice du chapitre 10) : enregistre une interaction (frappe dans un champ de recherche, clic sur un bouton) et identifie si des composants se re-rendent sans que leur affichage change réellement.
</div>

**Corrigé (démarche attendue) :** Ouvrir l'onglet Profiler, démarrer l'enregistrement, interagir, arrêter, puis observer le flame graph : tout composant apparaissant en couleur (rendu) alors que son contenu affiché à l'écran est resté visuellement identique est un candidat pour `React.memo` (avec `useCallback`/`useMemo` sur les props qu'il reçoit).

## 40.8 Résumé du chapitre

- Toujours mesurer avec le React DevTools Profiler avant d'optimiser quoi que ce soit.
- Un composant se re-rend pour 3 raisons : son propre state change, son parent se re-rend (sans `memo`), ou un Context consommé change.
- `React.memo` + `useCallback`/`useMemo` fonctionnent ensemble, jamais isolément.
- La virtualisation (`@tanstack/react-virtual`) ne se justifie que pour des listes massives, pas pour des listes paginées classiques.
- Les objets/tableaux littéraux créés en ligne dans le JSX cassent `React.memo`, exactement comme les fonctions.

*Chapitre suivant : Lazy Loading et Suspense, pour charger du code seulement quand il est réellement nécessaire.*
