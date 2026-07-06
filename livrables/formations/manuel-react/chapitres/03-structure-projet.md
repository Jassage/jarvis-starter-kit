<div class="chapitre-titre-num">CHAPITRE 3</div>

# Structure d'un projet React

## 3.1 L'arborescence générée par Vite

```
mon-premier-projet/
├── node_modules/          # Dépendances installées (jamais modifié à la main)
├── public/                # Fichiers statiques servis tels quels (favicon, images fixes)
├── src/                   # Tout ton code source
│   ├── assets/            # Images, polices importées dans le code
│   ├── App.jsx            # Composant racine de l'application
│   ├── App.css            # Styles du composant App
│   ├── main.jsx           # Point d'entrée : montage de React dans le DOM
│   └── index.css          # Styles globaux
├── index.html             # Le seul fichier HTML de toute l'application
├── package.json           # Dépendances et scripts npm
├── vite.config.js         # Configuration de Vite
└── .gitignore
```

## 3.2 Le point d'entrée : index.html + main.jsx

Contrairement à un site multi-pages classique, une application React est une **Single Page Application (SPA)** : un seul fichier HTML, dans lequel React injecte et met à jour tout le contenu dynamiquement.

```html
<!-- index.html -->
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Mon Premier Projet</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- ↑ React va prendre le contrôle de ce div et tout injecter dedans -->
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

```jsx
// src/main.jsx — point d'entrée JavaScript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- `createRoot` : crée une "racine" React attachée à l'élément `#root` du HTML.
- `.render(<App />)` : demande à React d'afficher le composant `App` (et tout ce qu'il contient) à cet endroit.
- `<StrictMode>` : un mode de développement qui aide à détecter des erreurs potentielles (il exécute certains codes deux fois exprès pour révéler des effets de bord mal écrits — voir chapitre 12). Il n'a **aucun effet en production**.

## 3.3 Organiser son dossier `src/` en pratique

Vite ne t'impose **aucune** structure au-delà du strict minimum. Sur un projet réel (comme tes SaaS), voici une organisation qui a fait ses preuves et que tu retrouveras dans le projet final (partie 9) :

```
src/
├── assets/            # images, icônes, polices
├── components/        # composants réutilisables (Button, Card, Modal...)
├── pages/             # composants représentant une page entière (routées)
├── hooks/             # hooks personnalisés (useAuth, useDebounce...)
├── context/           # Contexts React (AuthContext, ThemeContext...)
├── services/          # appels API (authService.js, userService.js...)
├── store/             # Redux Toolkit : slices et configuration du store
├── utils/             # fonctions utilitaires pures (formatDate, validators...)
├── App.jsx
└── main.jsx
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Composant vs Page : quelle différence ?</span>
Un **composant** dans `components/` est générique et réutilisable partout (un bouton, une carte). Une **page** dans `pages/` correspond à une route précise de l'application (`/login`, `/dashboard`) et **assemble** plusieurs composants pour former un écran complet. Cette distinction devient concrète au chapitre 19 (React Router).
</div>

## 3.4 Le dossier `public/` vs `src/assets/`

C'est une confusion fréquente chez les débutants :

| | `public/` | `src/assets/` |
|---|---|---|
| Traité par Vite ? | Non, copié tel quel dans `dist/` | Oui, optimisé (compression, hash de cache-busting) |
| Comment y accéder | Chemin absolu direct : `/logo.png` | Import JavaScript : `import logo from "./assets/logo.png"` |
| Cas d'usage | `favicon.ico`, `robots.txt`, fichiers dont le nom exact doit rester stable | Images utilisées dans les composants |

```jsx
// Une image dans src/assets : on l'importe
import logo from "./assets/logo.png";
function Header() {
  return <img src={logo} alt="Logo" />;
}

// Une image dans public/ : chemin direct, sans import
function Favicon() {
  return <img src="/logo-public.png" alt="Logo public" />;
}
```

## 3.5 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Modifier node_modules directement</span>
`node_modules/` est régénéré à chaque `npm install` : toute modification manuelle y est perdue. Si une librairie a un bug, on ne corrige jamais dans `node_modules`, on cherche un correctif officiel, une version plus récente, ou un "patch" via un outil dédié (`patch-package`).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier .gitignore sur node_modules</span>
`node_modules/` peut peser plusieurs centaines de Mo. Vérifie toujours que `.gitignore` (généré par défaut par Vite) contient bien `node_modules` avant ton premier commit.
</div>

## 3.6 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 3.1</span>

Dans un projet Vite fraîchement créé, crée les dossiers `components/`, `pages/`, `hooks/` dans `src/`. Déplace le contenu visuel de `App.jsx` dans un nouveau composant `pages/Accueil.jsx`, puis fais en sorte que `App.jsx` l'affiche.
</div>

**Corrigé :**
```jsx
// src/pages/Accueil.jsx
function Accueil() {
  return <h1>Bienvenue sur mon site</h1>;
}
export default Accueil;
```
```jsx
// src/App.jsx
import Accueil from "./pages/Accueil";
function App() {
  return <Accueil />;
}
export default App;
```

## 3.7 Résumé du chapitre

- Une application React est une SPA : un seul `index.html`, tout le reste est injecté par JavaScript via `main.jsx`.
- `createRoot(...).render(<App />)` est le point de départ de toute application.
- `public/` = fichiers statiques copiés tels quels ; `src/assets/` = fichiers importés et optimisés par Vite.
- Une organisation par rôle (`components/`, `pages/`, `hooks/`, `services/`, `store/`) facilite la maintenance dès que le projet grandit.

*Chapitre suivant : JSX en profondeur.*
