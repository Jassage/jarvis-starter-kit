<div class="chapitre-titre-num">CHAPITRE 21</div>

# Redux Toolkit

## 21.1 Pourquoi Redux, et pourquoi "Toolkit"

**Redux** est une librairie de gestion de state global, plus ancienne que React lui-même dans son principe (inspirée du pattern Flux de Facebook). Son ancienne API (2015-2019) était réputée verbeuse (beaucoup de code répétitif pour la moindre action). **Redux Toolkit (RTK)**, la façon **officiellement recommandée** d'utiliser Redux depuis 2019, résout ce problème avec une API bien plus concise, tout en gardant les mêmes principes fondamentaux.

<div class="encadre astuce">
<span class="encadre-titre">💡 N'apprends jamais le "vieux" Redux en premier</span>
Si tu croises une documentation ou un tutoriel qui utilise `createStore`, des `switch` manuels sur les actions, ou du code très verbeux pour une simple action — c'est de l'ancien Redux, obsolète. Ce chapitre n'enseigne **que** Redux Toolkit, la seule approche pertinente pour un projet démarré aujourd'hui.
</div>

## 21.2 Les concepts clés

- **Store** : le conteneur unique de tout le state global de l'application.
- **Slice** : une "tranche" du store dédiée à un domaine précis (`authSlice`, `panierSlice`, `produitsSlice`...), regroupant son state initial et ses reducers.
- **Action** : un objet décrivant "ce qui s'est passé" (généré automatiquement par RTK à partir des reducers du slice).
- **Dispatch** : la fonction qui envoie une action au store.
- **Selector** : une fonction qui lit une portion précise du state global.

## 21.3 Installation et création d'un slice

```
$ npm install @reduxjs/toolkit react-redux
```

```jsx
// store/panierSlice.js
import { createSlice } from "@reduxjs/toolkit";

const panierSlice = createSlice({
  name: "panier",
  initialState: {
    articles: [],
  },
  reducers: {
    ajouterArticle(state, action) {
      // Redux Toolkit utilise Immer en interne : on peut "muter" state ici en toute sécurité,
      // Immer transforme automatiquement ce code en mise à jour immuable réelle.
      state.articles.push(action.payload);
    },
    retirerArticle(state, action) {
      state.articles = state.articles.filter((a) => a.id !== action.payload);
    },
    viderPanier(state) {
      state.articles = [];
    },
  },
});

export const { ajouterArticle, retirerArticle, viderPanier } = panierSlice.actions;
export default panierSlice.reducer;
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi "muter" state ici ne contredit pas le chapitre 7 et 14</span>
En apparence, `state.articles.push(...)` viole la règle d'immuabilité vue précédemment. En réalité, Redux Toolkit enveloppe chaque reducer avec **Immer**, une librairie qui intercepte ces "mutations" apparentes et produit, en coulisses, un nouvel état immuable réel. C'est une exception **spécifique à Redux Toolkit** : cette syntaxe ne fonctionne **pas** dans un `useState`/`useReducer` classique (chapitres 7 et 14), où l'immuabilité manuelle reste obligatoire.
</div>

## 21.4 Configurer le store

```jsx
// store/store.js
import { configureStore } from "@reduxjs/toolkit";
import panierReducer from "./panierSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    panier: panierReducer,
    auth: authReducer,
  },
});
```

```jsx
// main.jsx
import { Provider } from "react-redux";
import { store } from "./store/store";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

## 21.5 Utiliser le state global dans les composants

```jsx
import { useSelector, useDispatch } from "react-redux";
import { ajouterArticle, viderPanier } from "../store/panierSlice";

function Panier() {
  const articles = useSelector((state) => state.panier.articles); // lecture
  const dispatch = useDispatch(); // écriture

  function ajouter(produit) {
    dispatch(ajouterArticle(produit));
  }

  return (
    <div>
      <p>{articles.length} article(s)</p>
      <button onClick={() => ajouter({ id: 1, nom: "Riz", prix: 250 })}>Ajouter</button>
      <button onClick={() => dispatch(viderPanier())}>Vider</button>
    </div>
  );
}
```

`useSelector` s'abonne automatiquement au store : le composant se re-rend **uniquement** quand la portion de state qu'il lit (`state.panier.articles`) change réellement.

## 21.6 Actions asynchrones avec createAsyncThunk

Pour les appels API (chargement de données distantes), RTK fournit `createAsyncThunk`, qui gère automatiquement les trois états d'une requête (en cours, réussie, échouée) :

```jsx
// store/produitsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const chargerProduits = createAsyncThunk("produits/charger", async () => {
  const reponse = await axios.get("/api/produits");
  return reponse.data;
});

const produitsSlice = createSlice({
  name: "produits",
  initialState: { liste: [], statut: "inactif", erreur: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(chargerProduits.pending, (state) => {
        state.statut = "chargement";
      })
      .addCase(chargerProduits.fulfilled, (state, action) => {
        state.statut = "reussi";
        state.liste = action.payload;
      })
      .addCase(chargerProduits.rejected, (state, action) => {
        state.statut = "echec";
        state.erreur = action.error.message;
      });
  },
});

export default produitsSlice.reducer;
```

```jsx
function ListeProduits() {
  const dispatch = useDispatch();
  const { liste, statut, erreur } = useSelector((state) => state.produits);

  useEffect(() => {
    dispatch(chargerProduits());
  }, [dispatch]);

  if (statut === "chargement") return <p>Chargement...</p>;
  if (statut === "echec") return <p className="erreur">{erreur}</p>;

  return <ul>{liste.map((p) => <li key={p.id}>{p.nom}</li>)}</ul>;
}
```

## 21.7 RTK Query en bref

RTK inclut aussi **RTK Query**, un outil qui va encore plus loin que `createAsyncThunk` en gérant automatiquement le cache, la revalidation et l'invalidation des données côté serveur (comparable à TanStack Query). Sur un projet neuf, RTK Query élimine souvent le besoin d'écrire des thunks manuels pour du simple CRUD :

```jsx
// store/api.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getProduits: builder.query({ query: () => "/produits" }),
  }),
});

export const { useGetProduitsQuery } = api;
```

```jsx
function ListeProduits() {
  const { data: produits, isLoading, error } = useGetProduitsQuery();
  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur</p>;
  return <ul>{produits.map((p) => <li key={p.id}>{p.nom}</li>)}</ul>;
}
```

Ce sujet est approfondi en pratique au chapitre 23 (Axios) et dans le projet final (partie 9), où le choix entre thunks manuels et RTK Query est discuté selon les besoins réels du projet.

## 21.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Modifier le state en dehors d'un reducer de slice</span>
```jsx
// ❌ Interdit : le state Redux ne se modifie JAMAIS directement depuis un composant
const articles = useSelector((state) => state.panier.articles);
articles.push(nouveauProduit); // mutation directe hors reducer — comportement indéfini
```
Toute modification du state Redux doit **impérativement** passer par `dispatch(uneAction(...))`, jamais par une manipulation directe de la valeur retournée par `useSelector`.
</div>

## 21.9 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 21.1</span>

Crée un `compteurSlice` avec un state `{ valeur: 0 }` et trois reducers : `incrementer`, `decrementer`, `ajouterMontant` (reçoit un nombre en `action.payload`).
</div>

**Corrigé :**
```jsx
import { createSlice } from "@reduxjs/toolkit";

const compteurSlice = createSlice({
  name: "compteur",
  initialState: { valeur: 0 },
  reducers: {
    incrementer(state) { state.valeur += 1; },
    decrementer(state) { state.valeur -= 1; },
    ajouterMontant(state, action) { state.valeur += action.payload; },
  },
});

export const { incrementer, decrementer, ajouterMontant } = compteurSlice.actions;
export default compteurSlice.reducer;
```

## 21.10 Résumé du chapitre

- Redux Toolkit est la façon officiellement recommandée d'utiliser Redux ; ignore l'ancienne API verbeuse.
- Un `slice` regroupe state initial + reducers pour un domaine ; RTK utilise Immer, permettant une syntaxe "mutable" en apparence.
- `useSelector` lit le state global (re-rendu ciblé), `useDispatch` envoie des actions.
- `createAsyncThunk` gère les 3 états d'une requête asynchrone ; RTK Query va plus loin avec cache et revalidation automatiques.
- Toute modification du state passe obligatoirement par `dispatch`, jamais par une mutation directe côté composant.

*Chapitre suivant : comment choisir entre Context API et Redux Toolkit selon les besoins réels d'un projet.*
