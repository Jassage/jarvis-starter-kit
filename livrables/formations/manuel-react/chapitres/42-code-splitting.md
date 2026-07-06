<div class="chapitre-titre-num">CHAPITRE 42</div>

# Code Splitting

## 42.1 Le lien avec le chapitre précédent

Le chapitre 41 a montré **comment déclencher** le découpage du code (`React.lazy`). Ce chapitre explique **ce qui se passe réellement** derrière ce mécanisme au moment du build, et comment vérifier/optimiser ce découpage sur un vrai projet.

## 42.2 Ce que produit npm run build sans aucun découpage

```
$ npm run build

dist/assets/index-a1b2c3.js    850.42 kB │ gzip: 245.10 kB
dist/assets/index-d4e5f6.css    12.30 kB │ gzip:   3.20 kB
```

Un seul fichier JavaScript de 850 Ko (avant compression) contient **tout** : React lui-même, toutes les librairies (Axios, React Router, Redux Toolkit...), et tout le code de chaque page de l'application, même celles jamais visitées par la majorité des utilisateurs.

## 42.3 Avec React.lazy : plusieurs "chunks" séparés

```
$ npm run build

dist/assets/index-a1b2c3.js       180.20 kB │ gzip:  62.40 kB   ← code commun (React, layout, routing)
dist/assets/Accueil-b2c3d4.js      15.10 kB │ gzip:   5.80 kB   ← chargé seulement sur "/"
dist/assets/Produits-c3d4e5.js     28.40 kB │ gzip:  10.20 kB   ← chargé seulement sur "/produits"
dist/assets/PanneauAdmin-d4e5f6.js 95.60 kB │ gzip:  32.10 kB   ← chargé seulement sur "/admin"
```

Le fichier principal (`index-*.js`) est désormais bien plus léger : il ne contient que le code **réellement nécessaire** pour afficher la première page, sans le code des pages moins fréquemment visitées.

## 42.4 Tree Shaking : éliminer le code jamais utilisé

Le **tree shaking** (littéralement "secouer l'arbre" pour faire tomber les feuilles mortes) est un mécanisme différent, complémentaire au code splitting : Vite analyse quelles fonctions/composants d'une librairie sont **réellement importés**, et élimine tout le reste du bundle final.

```jsx
// ✅ Tree-shakable : Vite ne garde QUE ce qui est réellement utilisé
import { Button, TextField } from "@mui/material";

// ❌ Empêche le tree shaking : importe littéralement TOUT le module
import * as MUI from "@mui/material";
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel du chapitre 33</span>
C'est exactement la raison de l'avertissement donné au chapitre 33 sur les imports MUI : `import * as MUI` empêche Vite de savoir quelles parties du module sont effectivement utilisées, forçant l'inclusion de la librairie entière dans le bundle final.
</div>

## 42.5 Analyser la composition réelle du bundle

```
$ npm install --save-dev rollup-plugin-visualizer
```

```js
// vite.config.js
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [react(), visualizer({ open: true, gzipSize: true })],
});
```

```
$ npm run build
```

Un fichier `stats.html` s'ouvre automatiquement après le build, affichant une carte visuelle (treemap) de **quelle librairie occupe quel espace** dans le bundle final — souvent révélateur : une librairie utilitaire massive importée pour une seule petite fonction, une image non optimisée incluse par erreur, une dépendance en double.

## 42.6 Découpage manuel avancé (manualChunks)

Sur un projet complexe, on peut contrôler précisément comment les librairies sont regroupées :

```js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["@mui/material", "@emotion/react", "@emotion/styled"],
        },
      },
    },
  },
});
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi séparer les librairies stables dans leur propre chunk</span>
Les librairies comme React changent très rarement d'une mise à jour de l'application à l'autre. En les isolant dans un chunk séparé (`vendor-react`), le navigateur peut **mettre en cache** ce fichier sur une longue durée : une mise à jour du code métier de l'application (dans un autre chunk) n'oblige pas l'utilisateur à retélécharger React à chaque déploiement.
</div>

## 42.7 Vérifier concrètement l'impact avec Lighthouse

```
1. Ouvrir les outils développeur du navigateur → onglet "Lighthouse"
2. Lancer un audit "Performance" en mode Mobile
3. Observer les métriques : First Contentful Paint, Largest Contentful Paint, Total Blocking Time
4. La section "Opportunities" signale explicitement un JavaScript non utilisé trop volumineux
```

## 42.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Optimiser le bundle sans jamais avoir mesuré le résultat réel</span>
Exactement comme au chapitre 40 : configurer `manualChunks` ou ajouter du lazy loading "au hasard" sans vérifier ensuite (via `npm run build` + `visualizer`, ou Lighthouse) que la taille du bundle principal a réellement diminué est un travail fait à l'aveugle. Toujours mesurer **avant** et **après** chaque changement.
</div>

## 42.9 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 42.1</span>

Sur un projet Vite existant, installe `rollup-plugin-visualizer`, lance un build, et identifie la plus grosse dépendance du bundle. Propose une piste d'optimisation (lazy loading d'une route qui l'utilise, import plus précis, ou alternative plus légère).
</div>

**Corrigé (démarche attendue) :** Après `npm run build` avec le visualizer configuré, `stats.html` s'ouvre et affiche une treemap. Si, par exemple, une librairie de graphiques volumineuse n'est utilisée que sur la page `/dashboard`, la piste d'optimisation est de charger cette page en lazy (`React.lazy`, chapitre 41) plutôt que de l'inclure dans le bundle principal chargé dès la page d'accueil.

## 42.10 Résumé du chapitre

- `React.lazy` (chapitre 41) déclenche le découpage du bundle en plusieurs fichiers ("chunks") téléchargés à la demande.
- Le tree shaking élimine le code jamais importé, à condition d'utiliser des imports nommés précis plutôt que `import * as X`.
- `rollup-plugin-visualizer` révèle visuellement la composition réelle du bundle final.
- `manualChunks` permet d'isoler les librairies stables dans un chunk mis en cache longue durée par le navigateur.
- Toujours mesurer avant/après chaque optimisation, jamais optimiser à l'aveugle.

*Ceci clôt la Partie 7 (performance). Chapitre suivant : les tests avec Jest et React Testing Library, première étape de la Partie 8 (qualité et mise en production).*
