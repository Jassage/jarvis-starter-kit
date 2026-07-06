<div class="chapitre-titre-num">CHAPITRE 3</div>

# npm et npx

## Objectifs pédagogiques

Maîtriser npm pour installer, gérer et exécuter des scripts de paquets, et comprendre la différence fondamentale entre `npm` et `npx`.

## 3.1 Qu'est-ce que npm

**npm** (*Node Package Manager*) est à la fois : (1) un **registre en ligne** hébergeant plus d'un million de paquets JavaScript open source, et (2) l'**outil en ligne de commande** installé automatiquement avec Node.js, permettant d'installer, mettre à jour et gérer ces paquets dans un projet.

## 3.2 Initialiser un projet

```
$ mkdir mon-api && cd mon-api
$ npm init -y

Wrote to /home/jaslin/mon-api/package.json:
{
  "name": "mon-api",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

`npm init -y` accepte toutes les valeurs par défaut sans poser de questions ; `npm init` (sans `-y`) pose une série de questions interactives (nom, version, description, auteur...).

## 3.3 Installer des dépendances

```
$ npm install express          # ajoute express aux dependencies (nécessaire en production)
$ npm install --save-dev jest   # ajoute jest aux devDependencies (nécessaire seulement en développement)
$ npm install express@4.18.2   # installe une version PRÉCISE
$ npm install -g nodemon        # installation GLOBALE (disponible dans tout le système, pas juste ce projet)
```

<div class="encadre astuce">
<span class="encadre-titre">💡 dependencies vs devDependencies</span>
`dependencies` : paquets nécessaires pour que l'application **fonctionne réellement en production** (Express, un client de base de données...). `devDependencies` : paquets utiles **seulement pendant le développement** (Jest pour les tests, nodemon pour le rechargement automatique, ESLint pour le linting) — jamais installés en production (`npm install --production` ou `NODE_ENV=production npm install` les ignore).
</div>

## 3.4 Le fichier package.json

```json
{
  "name": "mon-api",
  "version": "1.0.0",
  "description": "API de gestion",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.1.0"
  }
}
```

`package.json` est la **carte d'identité** du projet : nom, version, scripts exécutables, et surtout la liste exacte des dépendances nécessaires pour que quiconque (un collègue, un serveur de production) puisse recréer un environnement identique via `npm install`.

## 3.5 Comprendre le versionnage sémantique (semver)

```
"express": "^4.18.2"
```

Une version semver s'écrit `MAJEUR.MINEUR.CORRECTIF` :

| Partie | Signification | Exemple de changement |
|---|---|---|
| MAJEUR | Changement cassant (breaking change), API incompatible avec la version précédente | `4.x.x` → `5.0.0` |
| MINEUR | Nouvelle fonctionnalité, rétrocompatible | `4.18.x` → `4.19.0` |
| CORRECTIF | Correction de bug, rétrocompatible | `4.18.2` → `4.18.3` |

| Préfixe | Signification |
|---|---|
| `^4.18.2` | Accepte toute mise à jour MINEURE ou CORRECTIF (`4.x.x`, mais jamais `5.0.0`) — le préfixe **par défaut** de npm |
| `~4.18.2` | Accepte seulement les mises à jour de CORRECTIF (`4.18.x`) |
| `4.18.2` (sans préfixe) | Version EXACTE, aucune mise à jour automatique autorisée |

## 3.6 package-lock.json : figer les versions exactes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Sans package-lock.json, deux installations du même projet peuvent différer</span>
`package.json` autorise une **plage** de versions (`^4.18.2`). Sans verrouillage, deux `npm install` exécutés à des moments différents pourraient installer des versions mineures différentes (l'une avec `4.18.2`, l'autre avec `4.19.0` sortie entre-temps) — un risque réel d'incohérence entre l'environnement d'un développeur et celui de production. **`package-lock.json`** fige les versions **exactes** de chaque dépendance (et sous-dépendance) installée, garantissant une reproduction identique de l'arbre de dépendances à chaque `npm install` ultérieur. Ce fichier doit **toujours** être commité dans le dépôt Git, jamais ignoré.
</div>

## 3.7 npm ci : installation reproductible (production/CI)

```
$ npm ci
```

<div class="encadre astuce">
<span class="encadre-titre">💡 npm ci vs npm install</span>
`npm ci` (*clean install*) supprime d'abord `node_modules/` puis installe **exactement** les versions figées dans `package-lock.json`, sans jamais le modifier ni tenter de résoudre de nouvelles versions — plus rapide et strictement reproductible, c'est la commande à utiliser en environnement de production ou d'intégration continue (chapitre 39), jamais `npm install` (qui peut légèrement faire évoluer `package-lock.json`).
</div>

## 3.8 npx : exécuter un paquet sans l'installer globalement

```
$ npx create-react-app mon-projet
$ npx prisma init
$ npx jest --version
```

**npx** exécute un paquet **sans l'installer de façon permanente** sur le système : s'il n'est pas déjà présent localement, npx le télécharge temporairement, l'exécute, puis ne le conserve pas de façon globale — idéal pour des outils utilisés ponctuellement (générateurs de projet, CLI d'outils comme Prisma) sans polluer le système d'installations globales.

<div class="encadre astuce">
<span class="encadre-titre">💡 npx utilise en priorité les paquets déjà installés localement</span>
Si un paquet (comme `jest`) est déjà présent dans `node_modules/.bin` du projet courant (installé via `--save-dev`), `npx jest` l'exécute directement depuis là, sans aucun téléchargement — c'est en réalité l'usage le plus fréquent de npx au quotidien : exécuter les outils de développement du projet sans avoir à écrire le chemin complet `./node_modules/.bin/jest`.
</div>

## 3.9 Scripts npm personnalisés

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js",
  "test": "jest",
  "test:watch": "jest --watch",
  "lint": "eslint src/"
}
```

```
$ npm run dev
$ npm test          # raccourci spécial pour "npm run test"
$ npm start          # raccourci spécial pour "npm run start"
$ npm run test:watch # les autres scripts nécessitent "run"
```

## 3.10 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Commiter node_modules/ dans Git</span>
`node_modules/` peut peser plusieurs centaines de Mo et se régénère entièrement via `npm install`/`npm ci` à partir de `package.json`/`package-lock.json`. Il doit **toujours** figurer dans `.gitignore`, jamais être commité.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Installer une dépendance de développement en dependencies (ou l'inverse)</span>
Installer `jest` sans `--save-dev` le place dans `dependencies`, ce qui l'installera **inutilement en production** (`npm install --production` l'inclurait alors qu'il ne sert jamais en dehors des tests) — toujours vérifier la bonne catégorie au moment de l'installation.
</div>

## 3.11 Résumé du chapitre

- npm gère les dépendances via `package.json` (versions autorisées) et `package-lock.json` (versions exactes figées, toujours commité).
- `dependencies` (nécessaires en production) vs `devDependencies` (développement/tests uniquement).
- `npm ci` (installation stricte et reproductible) doit remplacer `npm install` en production/CI.
- `npx` exécute un paquet sans installation globale permanente, en priorité depuis les paquets déjà locaux au projet.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 3.1</span>

Initialise un nouveau projet npm, installe `express` en dépendance de production et `nodemon` en dépendance de développement, puis ajoute un script `dev` qui lance `nodemon` sur un fichier `src/index.js`.
</div>

**Corrigé :**
```
$ npm init -y
$ npm install express
$ npm install --save-dev nodemon
```
```json
"scripts": {
  "dev": "nodemon src/index.js"
}
```

*Chapitre suivant : approfondir la gestion des packages (organisation des dépendances, audit de sécurité, mises à jour).*
