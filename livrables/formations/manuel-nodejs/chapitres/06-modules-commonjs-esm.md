<div class="chapitre-titre-num">CHAPITRE 6</div>

# Modules CommonJS et ES Modules

## Objectifs pédagogiques

Comprendre les deux systèmes de modules coexistant en Node.js (CommonJS historique, ES Modules standard moderne), savoir les utiliser correctement, et connaître leurs différences pratiques.

## 6.1 Pourquoi des modules

Sans système de modules, tout le code d'une application vivrait dans un espace global unique, avec des risques constants de collision de noms de variables/fonctions. Un **module** encapsule du code dans son propre espace, n'exposant que ce qu'il choisit explicitement d'exporter.

## 6.2 CommonJS : le système historique de Node.js

```js
// math.js — définit un module
function additionner(a, b) {
  return a + b;
}

function soustraire(a, b) {
  return a - b;
}

module.exports = { additionner, soustraire };
```

```js
// index.js — utilise le module
const { additionner, soustraire } = require("./math");

console.log(additionner(2, 3)); // 5
```

```js
// Export unique (par défaut)
module.exports = function additionner(a, b) {
  return a + b;
};

// Utilisation
const additionner = require("./math");
```

**CommonJS** (`require`/`module.exports`) est le système de modules **originel** de Node.js, présent depuis sa création, bien avant que JavaScript ne dispose de son propre système standard.

## 6.3 ES Modules : le système standard du langage JavaScript

```js
// math.mjs (ou math.js avec "type": "module" dans package.json)
export function additionner(a, b) {
  return a + b;
}

export function soustraire(a, b) {
  return a - b;
}

export default function multiplier(a, b) {
  return a * b;
}
```

```js
// index.mjs
import multiplier, { additionner, soustraire } from "./math.mjs";

console.log(additionner(2, 3)); // 5
console.log(multiplier(2, 3));  // 6
```

**ES Modules** (ESM, `import`/`export`) est le système de modules **standardisé** du langage JavaScript lui-même (introduit en 2015 avec ES6), utilisé aussi bien dans le navigateur que côté Node.js depuis les versions récentes.

## 6.4 Activer ES Modules dans un projet Node.js

```json
// package.json
{
  "type": "module"
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ "type": "module" change le comportement de TOUS les fichiers .js du projet</span>
Une fois `"type": "module"` défini, **tous** les fichiers `.js` du projet sont interprétés comme des ES Modules — `require()` n'y fonctionne plus, il faut utiliser `import`. Pour mélanger les deux dans un même projet, il faut nommer explicitement les fichiers `.cjs` (CommonJS) ou `.mjs` (ES Modules), indépendamment du réglage `"type"` du `package.json`.
</div>

## 6.5 Différences pratiques essentielles

| Critère | CommonJS | ES Modules |
|---|---|---|
| Syntaxe | `require()` / `module.exports` | `import` / `export` |
| Chargement | Synchrone | Asynchrone (mais l'écriture reste simple grâce au support natif) |
| Résolution | Dynamique, `require()` peut être appelé conditionnellement | Statique, `import` doit être au niveau racine du fichier (analysé avant exécution) |
| Extension de fichier par défaut | `.js` (sauf si `"type": "module"`) | `.mjs`, ou `.js` avec `"type": "module"` |
| `__dirname`/`__filename` | Disponibles nativement | Absents (nécessitent `import.meta.url` + un calcul manuel) |
| Écosystème npm | Historiquement dominant, toujours largement supporté | De plus en plus répandu, notamment pour du code neuf |

## 6.6 import dynamique (import())

```js
// Import CONDITIONNEL, possible même en ES Modules (contrairement à `import` statique)
async function chargerModuleSelonEnv() {
  if (process.env.NODE_ENV === "production") {
    const module = await import("./config.production.js");
    return module.default;
  } else {
    const module = await import("./config.development.js");
    return module.default;
  }
}
```

`import()` (fonction, contrairement au mot-clé `import` statique) retourne une Promise (chapitre 9) et peut être appelé n'importe où dans le code, y compris conditionnellement — comblant la limitation de `import` statique évoquée dans le tableau ci-dessus.

## 6.7 __dirname en ES Modules

```js
// CommonJS : __dirname disponible nativement
console.log(__dirname); // /home/jaslin/mon-api/src

// ES Modules : __dirname n'existe pas, il faut le recalculer
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log(__dirname);
```

## 6.8 Lequel choisir pour un nouveau projet

<div class="encadre astuce">
<span class="encadre-titre">💡 Recommandation pour ce manuel et les projets neufs</span>
Ce manuel utilise principalement **CommonJS** dans ses exemples de code (encore extrêmement répandu dans l'écosystème Express et la majorité des tutoriels/documentations existants), tout en signalant les équivalents ES Modules quand c'est pertinent. Pour un **nouveau** projet démarré aujourd'hui sans contrainte de compatibilité avec du code legacy, **ES Modules** est la direction recommandée par l'évolution du langage — mais CommonJS reste parfaitement valide et largement utilisé en production.
</div>

## 6.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Mélanger require() et import dans le même fichier</span>
```js
const express = require("express"); // CommonJS
import cors from "cors";             // ❌ Erreur : ne peut pas cohabiter dans le même fichier
```
Un fichier donné doit être **cohérent** : soit entièrement CommonJS, soit entièrement ES Modules — jamais un mélange des deux syntaxes dans le même fichier.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier l'extension de fichier dans un import ES Modules</span>
```js
import { additionner } from "./math"; // ❌ Erreur en ES Modules natif Node.js : extension manquante
import { additionner } from "./math.js"; // ✅ l'extension est OBLIGATOIRE en ESM natif Node.js
```
Contrairement à CommonJS (qui résout automatiquement l'extension `.js` manquante) et contrairement à certains bundlers frontend (Webpack, Vite), Node.js en ES Modules natif **exige** l'extension complète du fichier importé.
</div>

## 6.10 Résumé du chapitre

- **CommonJS** (`require`/`module.exports`) est le système historique, encore dominant dans l'écosystème Express.
- **ES Modules** (`import`/`export`) est le système standardisé du langage, activé via `"type": "module"` dans `package.json`.
- `import()` dynamique permet un chargement conditionnel, même en ES Modules.
- `__dirname`/`__filename` n'existent pas nativement en ES Modules ; il faut les recalculer via `import.meta.url`.
- Un fichier ne peut jamais mélanger les deux syntaxes ; les imports ES Modules natifs exigent l'extension complète du fichier.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 6.1</span>

Convertis ce module CommonJS en ES Modules :
```js
function formaterPrix(montant) {
  return montant.toFixed(2) + " HTG";
}
module.exports = { formaterPrix };
```
</div>

**Corrigé :**
```js
export function formaterPrix(montant) {
  return montant.toFixed(2) + " HTG";
}
```
Et dans `package.json`, ajouter `"type": "module"` (ou nommer le fichier `.mjs`).

*Ceci clôt la Partie 1 (fondamentaux Node.js). Chapitre suivant : le JavaScript moderne (ES6+), première étape de la Partie 2.*
