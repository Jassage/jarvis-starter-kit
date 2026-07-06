<div class="chapitre-titre-num">CHAPITRE 13</div>

# Context API et useContext

## 13.1 Le problème résolu : le prop drilling

Rappel du chapitre 6 : quand une donnée doit traverser plusieurs niveaux de composants intermédiaires qui n'en ont pas besoin eux-mêmes, on parle de **prop drilling**. Le **Context API** permet à n'importe quel composant descendant d'accéder directement à une donnée, sans que les composants intermédiaires aient à la retransmettre.

**Analogie :** le prop drilling, c'est comme faire passer un message de bouche à oreille à travers toute une file de personnes pour qu'il arrive à la dernière. Le Context, c'est une annonce diffusée par haut-parleur : tout le monde dans la zone de diffusion l'entend directement, sans relais humain.

## 13.2 Créer et fournir un Context

Trois étapes : créer le Context, l'utiliser dans un `Provider` qui enveloppe les composants concernés, puis le lire avec `useContext`.

```jsx
// context/ThemeContext.jsx
import { createContext } from "react";

export const ThemeContext = createContext(null);
```

```jsx
// App.jsx
import { useState } from "react";
import { ThemeContext } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";

function App() {
  const [theme, setTheme] = useState("clair");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Sidebar />
    </ThemeContext.Provider>
  );
}
```

```jsx
// components/Sidebar.jsx — ne connaît même pas ThemeContext, retransmet juste
function Sidebar() {
  return <ProfilMini />;
}
```

```jsx
// components/ProfilMini.jsx — lit directement le contexte, sans passer par Sidebar
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function ProfilMini() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <div>
      <p>Thème actuel : {theme}</p>
      <button onClick={() => setTheme(theme === "clair" ? "sombre" : "clair")}>
        Changer de thème
      </button>
    </div>
  );
}
```

`Sidebar` n'a **jamais** besoin de connaître `theme` : `ProfilMini` accède directement à la valeur fournie par `App`, plusieurs niveaux plus haut.

## 13.3 Pattern professionnel : encapsuler dans un Provider + hook personnalisé

En pratique, on n'utilise presque jamais `useContext` directement dans les composants métier. On encapsule la logique dans un composant `Provider` dédié et un hook personnalisé (préparant le terrain pour le chapitre 17) :

```jsx
// context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);

  function connecter(donnees) {
    setUtilisateur(donnees);
  }
  function deconnecter() {
    setUtilisateur(null);
  }

  const valeur = { utilisateur, connecter, deconnecter };

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

// Hook personnalisé : évite de répéter useContext(AuthContext) partout,
// et centralise la vérification d'usage hors Provider
export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return contexte;
}
```

```jsx
// main.jsx
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
```

```jsx
// N'importe où dans l'arbre, sans prop drilling
import { useAuth } from "../context/AuthContext";

function BoutonDeconnexion() {
  const { utilisateur, deconnecter } = useAuth();
  if (!utilisateur) return null;
  return <button onClick={deconnecter}>Déconnexion ({utilisateur.nom})</button>;
}
```

Ce pattern exact (`XxxProvider` + `useXxx`) est celui qu'on retrouvera pour l'authentification JWT au chapitre 26.

## 13.4 Le piège de performance : chaque changement de valeur re-rend tous les consommateurs

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un Context change → TOUS les composants qui le consomment se re-rendent</span>
Contrairement à une prop classique (qui ne re-rend que le composant qui la reçoit), **tout** composant appelant `useContext(MonContext)` se re-rend dès que la `value` du `Provider` change — même si ce composant n'utilise qu'une petite partie de cette valeur.
</div>

```jsx
// ⚠️ Attention : mettre TOUT l'état applicatif dans un seul gros Context
<AppContext.Provider value={{ utilisateur, notifications, panier, theme, langue }}>
```

Si `notifications` change très souvent (ex : toutes les 5 secondes via polling), **tous** les composants consommant `AppContext` se re-rendent à chaque fois, même ceux qui n'utilisent que `theme`. La solution : **séparer les Contexts par domaine** (`AuthContext`, `NotificationContext`, `ThemeContext` séparés), pour que seuls les composants réellement concernés par un changement se re-rendent.

## 13.5 Quand utiliser Context, et quand ne pas l'utiliser

<div class="encadre astuce">
<span class="encadre-titre">💡 Bons cas d'usage pour Context API</span>
Données globales qui changent **rarement** : utilisateur connecté, thème (clair/sombre), langue de l'interface, informations de configuration. Le chapitre 22 compare en détail Context API et Redux Toolkit pour les cas de state global qui change **fréquemment**.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Mauvais cas d'usage</span>
Ne mets pas dans un Context une donnée locale à un seul composant (ex : la valeur d'un champ de formulaire) — un simple `useState` local suffit très largement, et évite les re-rendus inutiles ailleurs dans l'application.
</div>

## 13.6 Erreurs fréquentes récapitulées

<div class="encadre attention">
<span class="encadre-titre">⚠️ Utiliser useContext sans Provider englobant</span>
```jsx
// ❌ Si aucun <AuthContext.Provider> n'englobe ce composant, contexte vaut null
const contexte = useContext(AuthContext); // null
contexte.utilisateur; // 💥 TypeError: Cannot read properties of null
```
C'est exactement pour détecter ce cas que le hook personnalisé `useAuth` (section 13.3) lance une erreur explicite ("doit être utilisé à l'intérieur d'un AuthProvider") plutôt que de laisser un `TypeError` cryptique se produire plus loin dans le code.
</div>

## 13.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 13.1</span>

Crée un `LangueContext` avec un `Provider` gérant une langue actuelle (`"fr"` par défaut) et une fonction pour la changer, puis un composant `SelecteurLangue` qui l'utilise via un hook personnalisé `useLangue`.
</div>

**Corrigé :**
```jsx
// context/LangueContext.jsx
import { createContext, useContext, useState } from "react";

const LangueContext = createContext(null);

export function LangueProvider({ children }) {
  const [langue, setLangue] = useState("fr");
  return (
    <LangueContext.Provider value={{ langue, setLangue }}>
      {children}
    </LangueContext.Provider>
  );
}

export function useLangue() {
  const contexte = useContext(LangueContext);
  if (!contexte) throw new Error("useLangue doit être utilisé dans un LangueProvider");
  return contexte;
}
```
```jsx
// components/SelecteurLangue.jsx
import { useLangue } from "../context/LangueContext";

function SelecteurLangue() {
  const { langue, setLangue } = useLangue();
  return (
    <select value={langue} onChange={(e) => setLangue(e.target.value)}>
      <option value="fr">Français</option>
      <option value="en">English</option>
      <option value="ht">Kreyòl</option>
    </select>
  );
}
```

## 13.8 Résumé du chapitre

- Le Context API résout le prop drilling : `createContext` → `<Provider value={...}>` → `useContext(MonContext)`.
- Le pattern professionnel encapsule la logique dans un `XxxProvider` + un hook `useXxx` qui valide la présence du Provider.
- Un changement de valeur re-rend **tous** les consommateurs du Context : séparer les Contexts par domaine évite les re-rendus inutiles.
- Réservé aux données globales qui changent rarement ; pour du state global fréquent, voir Redux Toolkit (chapitres 21-22).

*Chapitre suivant : useReducer, pour gérer une logique de state plus complexe qu'un simple useState.*
