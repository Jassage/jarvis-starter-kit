<div class="chapitre-titre-num">CHAPITRE 17</div>

# Créer ses propres hooks personnalisés

## 17.1 Le problème : logique dupliquée entre composants

Imagine deux composants qui ont tous les deux besoin de connaître la largeur de la fenêtre du navigateur :

```jsx
// Composant A
function Header() {
  const [largeur, setLargeur] = useState(window.innerWidth);
  useEffect(() => {
    function gerer() { setLargeur(window.innerWidth); }
    window.addEventListener("resize", gerer);
    return () => window.removeEventListener("resize", gerer);
  }, []);
  // ... utilise largeur
}

// Composant B — EXACTEMENT LA MÊME LOGIQUE COPIÉE-COLLÉE
function Sidebar() {
  const [largeur, setLargeur] = useState(window.innerWidth);
  useEffect(() => {
    function gerer() { setLargeur(window.innerWidth); }
    window.addEventListener("resize", gerer);
    return () => window.removeEventListener("resize", gerer);
  }, []);
  // ... utilise largeur
}
```

Un **hook personnalisé** permet d'extraire cette logique dans une fonction réutilisable, tout en gardant la magie des hooks (state, effets) qui ne fonctionne normalement qu'à l'intérieur d'un composant.

## 17.2 Règle de nommage : toujours préfixer par `use`

C'est une convention **obligatoire**, respectée par React lui-même (et par l'ESLint `eslint-plugin-react-hooks`) pour distinguer un hook personnalisé d'une fonction JavaScript classique — le préfixe `use` signale à React (et au linter) "cette fonction peut appeler d'autres hooks à l'intérieur, applique-lui les règles des Hooks".

```jsx
// hooks/useLargeurFenetre.js
import { useState, useEffect } from "react";

export function useLargeurFenetre() {
  const [largeur, setLargeur] = useState(window.innerWidth);

  useEffect(() => {
    function gererRedimensionnement() {
      setLargeur(window.innerWidth);
    }
    window.addEventListener("resize", gererRedimensionnement);
    return () => window.removeEventListener("resize", gererRedimensionnement);
  }, []);

  return largeur;
}
```

```jsx
// Utilisation : toute la logique est réduite à une seule ligne, dans chaque composant
function Header() {
  const largeur = useLargeurFenetre();
  return <p>Largeur actuelle : {largeur}px</p>;
}

function Sidebar() {
  const largeur = useLargeurFenetre();
  return largeur < 768 ? <MenuMobile /> : <MenuDesktop />;
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un hook personnalisé, ce n'est "que" une fonction</span>
Un hook personnalisé n'a **aucune magie particulière** au-delà de la convention de nommage : c'est une fonction JavaScript normale qui, par convention, appelle d'autres hooks (`useState`, `useEffect`, etc.) et retourne ce dont les composants ont besoin. Chaque composant qui l'appelle obtient sa **propre** instance de state indépendante (exactement comme si le code avait été copié-collé, mais sans duplication réelle).
</div>

## 17.3 Exemple très utilisé : useFetch (chargement de données)

```jsx
// hooks/useFetch.js
import { useState, useEffect } from "react";

export function useFetch(url) {
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let annule = false; // protection contre une mise à jour après démontage (voir section 17.5)

    setChargement(true);
    setErreur(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!annule) setDonnees(json);
      })
      .catch((err) => {
        if (!annule) setErreur(err.message);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => {
      annule = true;
    };
  }, [url]);

  return { donnees, chargement, erreur };
}
```

```jsx
// Utilisation : la complexité du chargement disparaît complètement de la vue du composant
function ListeProduits() {
  const { donnees, chargement, erreur } = useFetch("/api/produits");

  if (chargement) return <p>Chargement...</p>;
  if (erreur) return <p className="erreur">{erreur}</p>;

  return (
    <ul>
      {donnees.map((p) => <li key={p.id}>{p.nom}</li>)}
    </ul>
  );
}
```

Ce hook préfigure directement ce que fait Axios avec un hook similaire (chapitre 23), et ce que des librairies comme TanStack Query automatisent encore davantage (mise en cache, revalidation) — comprendre `useFetch` "à la main" ici rend ces librairies bien plus faciles à appréhender ensuite.

## 17.4 Un hook personnalisé peut utiliser d'autres hooks personnalisés

```jsx
// hooks/useAuth.js (vu au chapitre 13, basé sur Context)
// hooks/useEstAdmin.js — combine useAuth avec une logique métier propre
import { useAuth } from "../context/AuthContext";

export function useEstAdmin() {
  const { utilisateur } = useAuth();
  return utilisateur?.role === "ADMIN";
}
```

```jsx
function BoutonAdmin() {
  const estAdmin = useEstAdmin();
  if (!estAdmin) return null;
  return <button>Panneau d'administration</button>;
}
```

## 17.5 Le piège classique : mise à jour après démontage

<div class="encadre attention">
<span class="encadre-titre">⚠️ "Can't perform a React state update on an unmounted component"</span>
Si une requête réseau se termine **après** que le composant qui l'a lancée a été démonté (l'utilisateur a changé de page avant la fin du chargement), appeler `setDonnees(...)` sur un composant démonté déclenche un avertissement. C'est exactement le rôle de la variable `annule` dans `useFetch` (section 17.3) : elle empêche d'appeler les setters si le nettoyage de l'effet s'est déjà exécuté.
</div>

## 17.6 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 17.1</span>

Crée un hook personnalisé `useLocalStorage(cle, valeurInitiale)` qui se comporte comme `useState`, mais persiste automatiquement la valeur dans le `localStorage` du navigateur (utile pour se préparer au chapitre 28).
</div>

**Corrigé :**
```jsx
function useLocalStorage(cle, valeurInitiale) {
  const [valeur, setValeur] = useState(() => {
    const stocke = localStorage.getItem(cle);
    return stocke !== null ? JSON.parse(stocke) : valeurInitiale;
  });

  useEffect(() => {
    localStorage.setItem(cle, JSON.stringify(valeur));
  }, [cle, valeur]);

  return [valeur, setValeur];
}

// Utilisation
function Preferences() {
  const [theme, setTheme] = useLocalStorage("theme", "clair");
  return (
    <button onClick={() => setTheme(theme === "clair" ? "sombre" : "clair")}>
      Thème : {theme}
    </button>
  );
}
```

## 17.7 Résumé du chapitre

- Un hook personnalisé extrait une logique à base de hooks React dans une fonction réutilisable, toujours préfixée `use`.
- Chaque composant qui l'utilise obtient sa propre instance indépendante de state/effets.
- Les hooks personnalisés se composent entre eux (`useEstAdmin` utilisant `useAuth`).
- Toujours protéger contre les mises à jour après démontage lors d'opérations asynchrones (variable "annule" ou `AbortController`).

*Chapitre suivant : introduire TypeScript dans un projet React, pour typer props, state, hooks et événements.*
