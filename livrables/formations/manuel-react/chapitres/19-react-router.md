<div class="chapitre-titre-num">CHAPITRE 19</div>

# React Router

## 19.1 Le problème : une SPA a besoin de "fausses" pages

Rappel du chapitre 3 : une application React est une **Single Page Application**, un seul `index.html`. Pourtant, l'utilisateur s'attend à une URL différente par écran (`/login`, `/produits/42`, `/dashboard`), à pouvoir utiliser le bouton "précédent" du navigateur, et à pouvoir partager un lien direct vers une page précise.

**React Router** est la librairie standard qui simule cette navigation multi-pages **sans jamais recharger le HTML** : il intercepte les changements d'URL et affiche le composant correspondant, en modifiant l'historique du navigateur via l'API `History`.

## 19.2 Installation et configuration de base

```
$ npm install react-router-dom
```

```jsx
// main.jsx
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

```jsx
// App.jsx
import { Routes, Route } from "react-router-dom";
import Accueil from "./pages/Accueil";
import Produits from "./pages/Produits";
import Contact from "./pages/Contact";
import PageIntrouvable from "./pages/PageIntrouvable";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/produits" element={<Produits />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="*" element={<PageIntrouvable />} /> {/* route "catch-all" : doit être en dernier */}
    </Routes>
  );
}
```

- `<BrowserRouter>` : englobe toute l'application, active la navigation basée sur l'URL.
- `<Routes>` : conteneur qui n'affiche **qu'une seule** `<Route>` à la fois, celle qui correspond à l'URL actuelle.
- `<Route path="..." element={...} />` : associe un chemin d'URL à un composant.

## 19.3 Naviguer avec Link (jamais avec `<a>`)

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais utiliser une balise &lt;a&gt; classique pour naviguer en interne</span>
```jsx
// ❌ Provoque un RECHARGEMENT COMPLET de la page, comme un site classique
<a href="/produits">Voir les produits</a>
```
Une balise `<a>` classique déclenche le comportement natif du navigateur : rechargement complet du HTML, perte de tout le state React en mémoire. Toujours utiliser le composant `<Link>` de React Router pour la navigation interne :
```jsx
// ✅ Navigation interne SANS rechargement de page
import { Link } from "react-router-dom";
<Link to="/produits">Voir les produits</Link>
```
</div>

Pour styliser un lien différemment quand il correspond à la page active (ex : menu de navigation), on utilise `NavLink` :

```jsx
import { NavLink } from "react-router-dom";

function Menu() {
  return (
    <nav>
      <NavLink to="/" className={({ isActive }) => (isActive ? "lien-actif" : "")} end>
        Accueil
      </NavLink>
      <NavLink to="/produits" className={({ isActive }) => (isActive ? "lien-actif" : "")}>
        Produits
      </NavLink>
    </nav>
  );
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 La prop end sur la route "/"</span>
Sans `end`, `NavLink to="/"` serait considéré "actif" sur **toutes** les routes (car `/produits` commence bien par `/`). `end` restreint la correspondance à une égalité exacte avec l'URL.
</div>

## 19.4 Paramètres d'URL dynamiques

```jsx
// App.jsx
<Route path="/produits/:id" element={<DetailProduit />} />
```

```jsx
// pages/DetailProduit.jsx
import { useParams } from "react-router-dom";

function DetailProduit() {
  const { id } = useParams(); // extrait "42" depuis l'URL /produits/42

  const { donnees: produit } = useFetch(`/api/produits/${id}`); // hook du chapitre 17

  if (!produit) return <p>Chargement...</p>;
  return <h1>{produit.nom}</h1>;
}
```

## 19.5 Navigation programmatique

Pour naviguer suite à une action (après soumission d'un formulaire, par exemple), plutôt qu'un clic sur un `<Link>` :

```jsx
import { useNavigate } from "react-router-dom";

function FormulaireConnexion() {
  const navigate = useNavigate();

  async function gererSoumission(e) {
    e.preventDefault();
    // ... logique de connexion ...
    navigate("/dashboard"); // redirection après succès
  }

  return <form onSubmit={gererSoumission}>{/* ... */}</form>;
}
```

```jsx
// Rediriger en remplaçant l'entrée d'historique (pas d'ajout, utile après une connexion)
navigate("/dashboard", { replace: true });

// Revenir en arrière, comme le bouton "précédent" du navigateur
navigate(-1);
```

## 19.6 Routes imbriquées et layouts partagés

Un pattern très courant : un layout commun (header, sidebar) partagé par plusieurs pages, via `<Outlet />` :

```jsx
// layouts/LayoutDashboard.jsx
import { Outlet } from "react-router-dom";

function LayoutDashboard() {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>
        <Outlet /> {/* le composant de la route enfant s'affiche ici */}
      </main>
    </div>
  );
}
```

```jsx
// App.jsx
<Routes>
  <Route path="/dashboard" element={<LayoutDashboard />}>
    <Route index element={<Accueil />} /> {/* /dashboard */}
    <Route path="profil" element={<Profil />} /> {/* /dashboard/profil */}
    <Route path="parametres" element={<Parametres />} /> {/* /dashboard/parametres */}
  </Route>
</Routes>
```

## 19.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Route catch-all (*) placée trop tôt</span>
```jsx
// ❌ La route * capture TOUT, aucune route suivante n'est jamais atteinte
<Routes>
  <Route path="*" element={<PageIntrouvable />} />
  <Route path="/produits" element={<Produits />} /> {/* jamais atteinte ! */}
</Routes>
```
`<Routes>` évalue les routes dans l'ordre et s'arrête à la première correspondance. La route `*` (catch-all, page 404) doit **toujours** être déclarée en dernier.
</div>

## 19.8 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 19.1</span>

Mets en place les routes `/`, `/blog`, `/blog/:slug` (article de blog identifié par un slug texte) et une page 404 pour toute autre URL.
</div>

**Corrigé :**
```jsx
<Routes>
  <Route path="/" element={<Accueil />} />
  <Route path="/blog" element={<ListeArticles />} />
  <Route path="/blog/:slug" element={<DetailArticle />} />
  <Route path="*" element={<PageIntrouvable />} />
</Routes>
```
```jsx
function DetailArticle() {
  const { slug } = useParams();
  return <h1>Article : {slug}</h1>;
}
```

## 19.9 Résumé du chapitre

- React Router simule la navigation multi-pages dans une SPA, sans jamais recharger le HTML.
- `<Link>`/`<NavLink>` pour la navigation déclarative ; `<a>` classique casse l'application (rechargement complet).
- `useParams()` lit les paramètres dynamiques d'URL ; `useNavigate()` redirige de façon programmatique.
- `<Outlet />` permet des layouts partagés via des routes imbriquées.
- La route catch-all `*` doit toujours être déclarée en dernier.

*Chapitre suivant : sécuriser certaines routes selon l'état de connexion et le rôle de l'utilisateur.*
