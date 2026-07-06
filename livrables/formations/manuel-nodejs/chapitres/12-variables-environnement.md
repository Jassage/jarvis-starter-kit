<div class="chapitre-titre-num">CHAPITRE 12</div>

# Variables d'environnement (.env)

## Objectifs pédagogiques

Comprendre pourquoi la configuration ne doit jamais être codée en dur, utiliser `dotenv`, et valider la présence des variables attendues au démarrage.

## 12.1 Le problème de la configuration codée en dur

```js
// ❌ Configuration en dur : change selon l'environnement, expose des secrets dans le code source
const connexion = new Client({
  host: "localhost",
  port: 5432,
  password: "motdepasse123", // 💥 visible dans le code, versionné dans Git !
});
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un secret codé en dur finit tôt ou tard dans l'historique Git</span>
Même supprimé plus tard, un secret commité une seule fois reste visible dans **l'historique** du dépôt Git (`git log`), sauf réécriture complète de l'historique (opération risquée et rarement effectuée). La règle absolue : **aucun** secret (mot de passe, clé API, token) ne doit jamais apparaître dans le code source versionné.
</div>

## 12.2 Le fichier .env

```
# .env (JAMAIS commité, listé dans .gitignore)
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/mabase
JWT_SECRET=un-secret-tres-long-et-aleatoire
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

## 12.3 dotenv : charger le fichier .env dans process.env

```
$ npm install dotenv
```

```js
// server.js — TOUJOURS en tout premier, avant tout autre import qui utiliserait une variable d'env
require("dotenv").config();

const app = require("./src/app");
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} (env: ${process.env.NODE_ENV})`);
});
```

`dotenv` lit le fichier `.env` à la racine du projet et injecte chacune de ses variables dans `process.env`, l'objet global où Node.js expose toutes les variables d'environnement (qu'elles viennent du système ou de `.env`).

<div class="encadre astuce">
<span class="encadre-titre">💡 Depuis Node.js 20.6+, --env-file est une alternative native sans dépendance</span>
```
$ node --env-file=.env server.js
```
Les versions récentes de Node.js supportent nativement le chargement d'un fichier `.env` via l'option `--env-file`, sans nécessiter le paquet `dotenv`. Ce manuel utilise `dotenv` car il reste, à ce jour, plus universellement compatible avec toutes les versions de Node.js encore en production.
</div>

## 12.4 Toutes les variables process.env sont des chaînes de caractères

```
# .env
PORT=3000
DEBUG=true
```

```js
console.log(typeof process.env.PORT);  // "string", PAS "number" !
console.log(process.env.PORT === 3000); // false : compare une string "3000" à un number 3000

console.log(typeof process.env.DEBUG); // "string"
if (process.env.DEBUG) {
  // ⚠️ Ce bloc s'exécute même si DEBUG="false", car "false" est une CHAÎNE NON VIDE, donc "truthy" !
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Piège très fréquent : DEBUG="false" reste "truthy"</span>
```js
// ❌ Toujours vrai, quelle que soit la valeur textuelle de DEBUG (tant qu'elle n'est pas vide)
if (process.env.DEBUG) { ... }

// ✅ Comparaison explicite à la chaîne attendue
if (process.env.DEBUG === "true") { ... }
```
Toute variable d'environnement est une **chaîne de caractères**, jamais un booléen ou un nombre natif — il faut toujours convertir explicitement (`Number(process.env.PORT)`, comparaison stricte à `"true"`/`"false"`) avant de l'utiliser comme tel.
</div>

## 12.5 Valider les variables d'environnement au démarrage

```js
// src/config/env.js
const variablesRequises = ["PORT", "DATABASE_URL", "JWT_SECRET"];

function validerVariablesEnvironnement() {
  const manquantes = variablesRequises.filter((nom) => !process.env[nom]);
  if (manquantes.length > 0) {
    console.error("Variables d'environnement manquantes :", manquantes.join(", "));
    process.exit(1); // arrête l'application IMMÉDIATEMENT, plutôt qu'un plantage confus plus tard
  }
}

module.exports = { validerVariablesEnvironnement };
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Échouer vite et clairement (fail fast) plutôt que plus tard, confusément</span>
Sans cette validation, une variable manquante (par exemple `JWT_SECRET` oubliée) ne provoquerait une erreur que bien plus tard, au moment précis où le code tenterait de l'utiliser (souvent lors de la toute première tentative de connexion d'un utilisateur) — un message d'erreur confus et tardif. Valider **toutes** les variables requises dès le démarrage échoue immédiatement, avec un message clair, avant même d'accepter la première requête.
</div>

## 12.6 Variables d'environnement par environnement (.env.development, .env.production)

```
.env.development
.env.test
.env.production
.env.example       (commité, documente les variables SANS valeurs réelles — rappel du chapitre 5)
```

```js
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});
```

## 12.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier .env dans .gitignore</span>
```
# .gitignore
node_modules/
.env
.env.*.local
```
Une simple omission dans `.gitignore` suffit à exposer publiquement tous les secrets d'un projet si le dépôt est poussé sur une plateforme publique (GitHub, GitLab) — toujours vérifier ce fichier dès la création du projet, avant le tout premier commit.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Charger dotenv APRÈS avoir importé des modules qui en dépendent</span>
```js
// ❌ ConfigDB lit process.env.DATABASE_URL AVANT que dotenv ne l'ait chargé !
const ConfigDB = require("./config/db");
require("dotenv").config();
```
```js
// ✅ dotenv.config() doit être la TOUTE PREMIÈRE ligne exécutée du programme
require("dotenv").config();
const ConfigDB = require("./config/db");
```
</div>

## 12.8 Résumé du chapitre

- Aucun secret ne doit jamais être codé en dur dans le code source ; `.env` (jamais commité) centralise la configuration sensible.
- `dotenv` charge `.env` dans `process.env` — doit être appelé en tout premier, avant tout autre import en dépendant.
- Toute variable de `process.env` est une **chaîne de caractères** : conversion et comparaison explicites nécessaires.
- Valider la présence des variables requises au démarrage échoue vite et clairement, plutôt que plus tard de façon confuse.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 12.1</span>

Écris une fonction `obtenirPort()` qui lit `process.env.PORT`, le convertit en nombre, et retourne `3000` par défaut si la variable est absente ou invalide (pas un nombre).
</div>

**Corrigé :**
```js
function obtenirPort() {
  const port = Number(process.env.PORT);
  return Number.isInteger(port) && port > 0 ? port : 3000;
}
```

*Ceci clôt la Partie 2 (JavaScript moderne et asynchrone). Chapitre suivant : Express.js, le framework central de ce manuel.*
