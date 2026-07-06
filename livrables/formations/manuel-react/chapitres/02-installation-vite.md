<div class="chapitre-titre-num">CHAPITRE 2</div>

# Installation et environnement avec Vite

## 2.1 Ce dont tu as besoin avant de commencer

Avant d'écrire une seule ligne de React, il faut préparer l'atelier. Trois outils sont indispensables :

- **Node.js** : l'environnement qui exécute JavaScript en dehors du navigateur. C'est lui qui fait tourner les outils de build (Vite), le gestionnaire de paquets (npm) et plus tard ton serveur backend.
- **npm** (ou un équivalent : **pnpm**, **yarn**) : le gestionnaire de paquets qui installe les librairies dont ton projet a besoin.
- **Un éditeur de code** : VS Code est recommandé (extensions ESLint, Prettier, ES7+ React Snippets).

Vérifie que Node.js est installé :

```
$ node --version
v20.11.0

$ npm --version
10.2.4
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention aux versions trop anciennes</span>
Les outils modernes de l'écosystème React (Vite, dernières versions de React) exigent Node.js 18 ou supérieur. Si ta version affiche moins que ça, mets à jour Node.js avant de continuer — beaucoup d'erreurs d'installation mystérieuses viennent d'une version de Node trop ancienne.
</div>

## 2.2 Pourquoi Vite et pas Create React App

Pendant des années, l'outil standard pour démarrer un projet React était **Create React App (CRA)**. Il est aujourd'hui **déprécié** (l'équipe React elle-même ne le recommande plus depuis 2023) au profit de **Vite**, pour deux raisons concrètes :

| Critère | Create React App (obsolète) | Vite |
|---|---|---|
| Démarrage du serveur de dev | Lent (empaquette tout avant de démarrer) | Quasi instantané (sert les fichiers à la demande via modules ES natifs) |
| Rechargement à chaud (HMR) | Parfois lent sur gros projets | Très rapide, même sur de gros projets |
| Configuration | Cachée, difficile à personnaliser ("eject" risqué) | `vite.config.js` simple et transparent |
| Maintenance | Non maintenu activement | Activement maintenu, standard de facto en 2026 |

**Vite** (prononcé "vitt", du français "vite") mise sur les modules ES natifs du navigateur pour ne compiler que ce qui est réellement demandé, au lieu de tout empaqueter avant de démarrer.

## 2.3 Créer un premier projet

```
$ npm create vite@latest mon-premier-projet -- --template react

Scaffolding project in /home/jaslin/mon-premier-projet...

Done. Now run:

  cd mon-premier-projet
  npm install
  npm run dev
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Avec TypeScript dès le départ</span>
Puisque ce manuel couvre TypeScript (chapitre 18), et que c'est la pratique recommandée en environnement professionnel, tu peux directement démarrer avec le template TypeScript :

```
$ npm create vite@latest mon-premier-projet -- --template react-ts
```

Tout le reste du manuel fonctionne à l'identique ; les exemples de code seront en JavaScript jusqu'au chapitre 18, puis basculeront progressivement vers TypeScript.
</div>

On installe ensuite les dépendances et on démarre le serveur de développement :

```
$ cd mon-premier-projet
$ npm install

added 150 packages in 4s

$ npm run dev

  VITE v5.2.0  ready in 320 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Ouvre `http://localhost:5173/` dans ton navigateur : tu verras la page par défaut de Vite + React, avec un compteur cliquable.

## 2.4 Le rechargement à chaud (Hot Module Replacement)

Modifie un texte dans `src/App.jsx`, enregistre le fichier : le navigateur se met à jour **instantanément, sans recharger la page entière** et **sans perdre le state actuel** de ton application (ex : un formulaire à moitié rempli reste rempli). C'est le **HMR** (Hot Module Replacement), l'un des plus gros gains de productivité de Vite.

## 2.5 Les scripts npm essentiels

Dans `package.json`, Vite génère automatiquement ces scripts :

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

- `npm run dev` : démarre le serveur de développement local (HMR actif).
- `npm run build` : génère la version **de production**, optimisée et minifiée, dans le dossier `dist/`.
- `npm run preview` : sert localement le contenu de `dist/` pour vérifier le build de production avant déploiement (chapitre 46).
- `npm run lint` : vérifie la qualité du code avec ESLint.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur fréquente : déployer le mauvais dossier</span>
Un débutant déploie parfois directement le dossier source (`src/`) au lieu du résultat du build (`dist/`). En production, c'est toujours le contenu de `dist/`, généré par `npm run build`, qu'il faut déployer (voir chapitre 46).
</div>

## 2.6 Variables d'environnement avec Vite

Vite gère les variables d'environnement via des fichiers `.env` à la racine du projet, avec une règle de sécurité stricte : **seules les variables préfixées par `VITE_` sont exposées au code du navigateur.**

```
# .env
VITE_API_URL=http://localhost:4000/api
DATABASE_PASSWORD=secret123
```

```js
console.log(import.meta.env.VITE_API_URL); // "http://localhost:4000/api"
console.log(import.meta.env.DATABASE_PASSWORD); // undefined — bloqué intentionnellement
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une variable VITE_ n'est jamais un secret</span>
Tout ce qui commence par `VITE_` finit **dans le code JavaScript envoyé au navigateur**, donc visible par n'importe qui via les outils développeur. Ne mets jamais de clé secrète, de mot de passe ou de token d'API privé derrière `VITE_`. Les vrais secrets restent côté serveur (backend), jamais côté React.
</div>

## 2.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 2.1</span>

Crée un nouveau projet Vite + React nommé `boutique-demo`, démarre le serveur de développement, puis modifie le titre affiché sur la page d'accueil. Observe le comportement du navigateur : la page recharge-t-elle entièrement ?
</div>

**Corrigé :** Après `npm create vite@latest boutique-demo -- --template react`, `cd boutique-demo`, `npm install`, `npm run dev`, la modification du JSX dans `App.jsx` doit se répercuter **sans rechargement complet de la page** (HMR), et sans perte du state du compteur par défaut si tu avais cliqué dessus avant de modifier le fichier.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 2.2</span>

Ajoute une variable `VITE_APP_NAME=Boutique Démo` dans un fichier `.env`, puis affiche-la dans `App.jsx`. Ensuite, essaie d'ajouter une variable `SECRET_KEY=abc123` (sans préfixe `VITE_`) et vérifie si elle est accessible depuis le code.
</div>

**Corrigé :**
```jsx
function App() {
  return <h1>{import.meta.env.VITE_APP_NAME}</h1>; // "Boutique Démo"
}
```
`import.meta.env.SECRET_KEY` renverra `undefined` : c'est le comportement attendu et voulu par Vite pour éviter les fuites de secrets.

## 2.8 Résumé du chapitre

- Node.js 18+ et npm sont les prérequis de base.
- **Vite** remplace Create React App : démarrage quasi instantané, HMR rapide, configuration transparente.
- `npm run dev` (développement), `npm run build` (production dans `dist/`), `npm run preview` (vérifier le build).
- Les variables d'environnement `VITE_*` sont exposées au navigateur : jamais de secret dedans.

*Chapitre suivant : la structure d'un projet React généré par Vite, dossier par dossier.*
