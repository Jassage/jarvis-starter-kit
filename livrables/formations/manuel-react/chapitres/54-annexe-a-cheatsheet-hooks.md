<div class="chapitre-titre-num">ANNEXE A</div>

# Aide-mémoire des hooks

## useState

```jsx
const [valeur, setValeur] = useState(valeurInitiale);
setValeur(nouvelleValeur);
setValeur((prev) => prev + 1); // forme fonction, si dépend de la valeur précédente
```
Déclenche un nouveau rendu. Chapitre 7.

## useEffect

```jsx
useEffect(() => {
  // effet
  return () => { /* nettoyage */ };
}, [dependances]);
```
`[]` = au montage seulement. Sans tableau = à chaque rendu. `[a, b]` = au montage + si a ou b change. Chapitre 12.

## useContext

```jsx
const MonContext = createContext(null);
<MonContext.Provider value={valeur}>{children}</MonContext.Provider>
const valeur = useContext(MonContext);
```
Résout le prop drilling. Chapitre 13.

## useReducer

```jsx
const [etat, dispatch] = useReducer(reducer, etatInitial);
dispatch({ type: "ACTION", payload: donnees });
```
Pour une logique de state complexe à plusieurs actions. Chapitre 14.

## useMemo

```jsx
const valeurCalculee = useMemo(() => calcul(a, b), [a, b]);
```
Met en cache un **résultat**. Chapitre 15.

## useCallback

```jsx
const fonctionStable = useCallback(() => { /* ... */ }, [dependances]);
```
Met en cache une **fonction**. Utile avec `React.memo`. Chapitre 15.

## useRef

```jsx
const maRef = useRef(valeurInitiale);
<input ref={maRef} />
maRef.current // accès direct, ne déclenche jamais de rendu
```
Référence DOM ou valeur mutable sans rendu. Chapitre 16.

## Règles des Hooks (à ne jamais enfreindre)

1. Toujours appeler les Hooks au **niveau racine** d'un composant ou d'un autre Hook — jamais dans un `if`, une boucle, ou après un `return`.
2. Toujours appeler les Hooks dans le **même ordre** à chaque rendu.
3. N'appeler les Hooks que depuis un composant React ou un hook personnalisé (préfixé `use`) — jamais depuis une fonction JavaScript classique.

## Tableau récapitulatif : quel hook pour quel besoin

| Besoin | Hook |
|---|---|
| Une donnée qui change et doit s'afficher | `useState` |
| Synchroniser avec une API, un timer, un événement DOM | `useEffect` |
| Partager une donnée à travers l'arbre sans prop drilling | `useContext` |
| Logique de state complexe à plusieurs actions | `useReducer` |
| Éviter un recalcul coûteux répété inutilement | `useMemo` |
| Stabiliser une fonction passée en prop à un composant `memo` | `useCallback` |
| Accéder à un élément DOM, ou garder une valeur technique sans rendu | `useRef` |
| Réutiliser une logique à base de hooks entre composants | Hook personnalisé (`useXxx`) |
