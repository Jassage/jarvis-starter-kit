<div class="chapitre-titre-num">CHAPITRE 23</div>

# Axios et consommation d'API REST

## 23.1 fetch vs Axios

Le navigateur fournit nativement `fetch()` pour faire des requêtes HTTP. **Axios** est une librairie tierce qui reste néanmoins le standard de facto dans l'écosystème React professionnel, pour plusieurs raisons concrètes :

| Critère | fetch (natif) | Axios |
|---|---|---|
| Réponse JSON | Nécessite un `.then(res => res.json())` manuel | `response.data` déjà parsé |
| Erreurs HTTP (404, 500...) | Ne rejette **pas** la promesse ; il faut vérifier `res.ok` manuellement | Rejette automatiquement la promesse pour tout code ≥ 400 |
| Timeout de requête | Non supporté nativement (nécessite `AbortController` manuel) | Option `timeout` intégrée |
| Intercepteurs (ajouter un header à toutes les requêtes) | Non supporté nativement | `axios.interceptors` intégrés |
| Annulation de requête | `AbortController` (verbeux) | `AbortController` supporté, ou `CancelToken` (legacy) |

```
$ npm install axios
```

## 23.2 Une instance Axios centralisée

En pratique, on ne configure jamais Axios à chaque appel : on crée une **instance** centralisée, avec l'URL de base et les headers communs, réutilisée dans toute l'application.

```jsx
// services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ex: "http://localhost:4000/api" (chapitre 2)
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
```

```jsx
// services/produitsService.js
import api from "./api";

export function getProduits() {
  return api.get("/produits");
}

export function getProduitParId(id) {
  return api.get(`/produits/${id}`);
}

export function creerProduit(donnees) {
  return api.post("/produits", donnees);
}

export function supprimerProduit(id) {
  return api.delete(`/produits/${id}`);
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Une couche "services" sépare le HTTP de l'affichage</span>
Grouper les appels API par domaine métier (`produitsService.js`, `authService.js`) dans un dossier `services/` (structure vue au chapitre 3) évite d'éparpiller des URLs et de la configuration Axios dans chaque composant. Les composants n'appellent que des fonctions métier claires (`getProduits()`), sans connaître les détails de l'URL ou des headers.
</div>

## 23.3 Utilisation dans un composant avec useEffect

```jsx
import { useState, useEffect } from "react";
import { getProduits } from "../services/produitsService";

function ListeProduits() {
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    getProduits()
      .then((reponse) => setProduits(reponse.data))
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <p>Chargement...</p>;
  if (erreur) return <p className="erreur">{erreur}</p>;

  return <ul>{produits.map((p) => <li key={p.id}>{p.nom}</li>)}</ul>;
}
```

## 23.4 async/await : une syntaxe plus lisible

```jsx
useEffect(() => {
  async function charger() {
    try {
      setChargement(true);
      const reponse = await getProduits();
      setProduits(reponse.data);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }
  charger();
}, []);
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Passer une fonction async directement à useEffect</span>
```jsx
// ❌ Interdit : useEffect n'accepte pas de fonction async directement
useEffect(async () => {
  const reponse = await getProduits();
}, []);
```
`useEffect` attend que sa fonction retourne soit `undefined`, soit une fonction de nettoyage. Une fonction `async` retourne toujours une **Promise**, ce que React interprète comme un mauvais usage (avertissement dans la console). La solution : définir la fonction `async` **à l'intérieur** de l'effet, puis l'appeler immédiatement (comme en 23.4), sans jamais rendre le callback de `useEffect` lui-même `async`.
</div>

## 23.5 Intercepteurs : ajouter un token à chaque requête

```jsx
// services/api.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // approfondi au chapitre 26 (JWT)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Sans intercepteur, il faudrait rajouter manuellement le header `Authorization` sur **chaque** appel API individuellement — source d'oublis fréquents et de bugs "401 Unauthorized" difficiles à localiser.

## 23.6 Requêtes POST, PUT, DELETE

```jsx
async function creerCompte(donnees) {
  const reponse = await api.post("/comptes", donnees);
  return reponse.data;
}

async function modifierCompte(id, donnees) {
  const reponse = await api.put(`/comptes/${id}`, donnees);
  return reponse.data;
}

async function supprimerCompte(id) {
  await api.delete(`/comptes/${id}`);
}
```

## 23.7 Erreurs fréquentes récapitulées

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier .data</span>
```jsx
// ❌ reponse est l'objet Axios complet (status, headers, data...), pas les données elles-mêmes
setProduits(reponse); 

// ✅ Correct
setProduits(reponse.data);
```
</div>

## 23.8 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 23.1</span>

Crée un service `clientsService.js` avec les fonctions `getClients()`, `creerClient(donnees)`, `supprimerClient(id)`, en réutilisant l'instance `api` centralisée.
</div>

**Corrigé :**
```jsx
import api from "./api";

export function getClients() {
  return api.get("/clients");
}
export function creerClient(donnees) {
  return api.post("/clients", donnees);
}
export function supprimerClient(id) {
  return api.delete(`/clients/${id}`);
}
```

## 23.9 Résumé du chapitre

- Axios reste le standard professionnel : parsing JSON automatique, rejet automatique sur erreur HTTP, intercepteurs intégrés.
- Une instance centralisée (`baseURL`, headers communs) + une couche `services/` par domaine évite la duplication de configuration.
- Une fonction `async` doit être définie **à l'intérieur** de `useEffect`, jamais passée directement en callback.
- Les intercepteurs de requête évitent de dupliquer l'ajout du token d'authentification à chaque appel.

*Chapitre suivant : structurer proprement la gestion des erreurs et des états de chargement à travers l'application.*
