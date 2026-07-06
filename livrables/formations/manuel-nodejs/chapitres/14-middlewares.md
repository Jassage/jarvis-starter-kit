<div class="chapitre-titre-num">CHAPITRE 14</div>

# Middlewares

## Objectifs pédagogiques

Comprendre le concept central des middlewares Express, savoir en écrire des personnalisés, et connaître les middlewares les plus utilisés en production.

## 14.1 Qu'est-ce qu'un middleware

Un **middleware** est une fonction qui a accès à la requête (`req`), la réponse (`res`), et une fonction `next()` permettant de passer la main au middleware **suivant** dans la chaîne. C'est le mécanisme fondamental qui rend Express extensible : chaque middleware peut inspecter, modifier, ou interrompre le traitement d'une requête.

```{.uml}
Requete
   │
   ▼
Middleware 1 (ex: journalisation)  ── appelle next()
   │
   ▼
Middleware 2 (ex: authentification) ── appelle next() OU interrompt (res.status(401)...)
   │
   ▼
Middleware 3 (ex: validation)        ── appelle next()
   │
   ▼
Contrôleur (gestionnaire de route final) ── envoie la réponse
```

## 14.2 Anatomie d'un middleware

```js
function monMiddleware(req, res, next) {
  console.log(`${req.method} ${req.url}`); // inspecte la requête
  next(); // OBLIGATOIRE : passe la main au middleware/contrôleur suivant
}

app.use(monMiddleware); // appliqué à TOUTES les routes qui suivent cette ligne
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier next() bloque la requête indéfiniment</span>
```js
function middlewareCasse(req, res, next) {
  console.log("Ce middleware s'exécute...");
  // ❌ next() jamais appelé : la requête reste bloquée ici pour toujours, le client n'obtient jamais de réponse
}
```
Sauf si le middleware envoie lui-même une réponse (`res.send()`, `res.json()`, `res.status(...).end()`), il **doit** appeler `next()` pour que la chaîne continue. Un middleware qui ne fait ni l'un ni l'autre bloque silencieusement la requête jusqu'au timeout du client.
</div>

## 14.3 Middlewares appliqués globalement vs à une route précise

```js
// Global : s'applique à TOUTES les routes déclarées APRÈS cette ligne
app.use(express.json());
app.use(journalisation);

// Sur une route précise : s'applique UNIQUEMENT à cette route
app.get("/admin/utilisateurs", authentifier, verifierRoleAdmin, listerUtilisateurs);

// Sur un groupe de routes (Router), avec un préfixe
app.use("/api/admin", authentifier, verifierRoleAdmin, adminRoutes);
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Plusieurs middlewares s'enchaînent dans l'ordre de déclaration</span>
`app.get("/route", middleware1, middleware2, controleur)` exécute `middleware1`, puis (si `next()` est appelé) `middleware2`, puis (si `next()` est appelé de nouveau) le contrôleur final — un enchaînement linéaire et prévisible.
</div>

## 14.4 Middleware personnalisé : journalisation simple

```js
function journalisation(req, res, next) {
  const debut = Date.now();
  console.log(`→ ${req.method} ${req.originalUrl}`);

  res.on("finish", () => { // événement déclenché quand la réponse est ENVOYÉE
    const duree = Date.now() - debut;
    console.log(`← ${req.method} ${req.originalUrl} ${res.statusCode} (${duree}ms)`);
  });

  next();
}
```

## 14.5 Middleware personnalisé : vérifier un en-tête d'API Key

```js
function verifierApiKey(req, res, next) {
  const cle = req.headers["x-api-key"];

  if (!cle || cle !== process.env.API_KEY) {
    return res.status(401).json({ message: "Clé API invalide ou manquante" });
  }

  next(); // clé valide : la requête peut continuer
}

app.use("/api/externe", verifierApiKey, externeRoutes);
```

## 14.6 Middlewares intégrés et tiers courants

```js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

app.use(helmet());              // sécurise les en-têtes HTTP (chapitre 25)
app.use(cors());                // autorise les requêtes cross-origin (chapitre 25)
app.use(morgan("combined"));    // journalisation des requêtes HTTP (chapitre 20)
app.use(express.json());        // parse le corps JSON des requêtes
app.use(express.urlencoded({ extended: true })); // parse les corps de formulaires classiques
app.use(express.static("public")); // sert des fichiers statiques (images, CSS...) depuis le dossier "public"
```

## 14.7 Middleware avec paramètres (factory de middleware)

```js
// Une FONCTION qui RETOURNE un middleware, permettant de le paramétrer
function limiterTaille(tailleMaxOctets) {
  return function (req, res, next) {
    const taille = parseInt(req.headers["content-length"] || "0", 10);
    if (taille > tailleMaxOctets) {
      return res.status(413).json({ message: "Corps de requête trop volumineux" });
    }
    next();
  };
}

app.post("/upload", limiterTaille(5 * 1024 * 1024), gererUpload); // limite personnalisée : 5 Mo
```

## 14.8 L'ordre des middlewares compte

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un middleware placé trop tard n'a aucun effet sur les routes précédentes</span>
```js
app.get("/utilisateurs", listerUtilisateurs); // ❌ déclarée AVANT le middleware d'authentification !
app.use(authentifier); // n'affecte que les routes déclarées APRÈS cette ligne
```
Express traite les middlewares et routes **dans l'ordre exact de leur déclaration** dans le code. Un middleware de sécurité (authentification, validation) doit toujours être déclaré **avant** les routes qu'il doit protéger.
</div>

## 14.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Appeler next() ET envoyer une réponse dans le même middleware</span>
```js
function middlewareBogue(req, res, next) {
  res.json({ message: "Traité" });
  next(); // ❌ Erreur : "Cannot set headers after they are sent to the client" si un middleware suivant répond aussi
}
```
Un middleware doit soit **répondre** (et s'arrêter là, sans appeler `next()`), soit **passer la main** via `next()` (sans avoir déjà répondu) — jamais les deux à la fois.
</div>

## 14.10 Résumé du chapitre

- Un middleware inspecte/modifie la requête ou la réponse, puis appelle `next()` pour continuer la chaîne, ou répond directement pour l'interrompre.
- Les middlewares s'appliquent globalement (`app.use`), sur une route précise, ou sur un groupe de routes (Router avec préfixe).
- L'ordre de déclaration détermine l'ordre d'exécution : un middleware de sécurité doit toujours précéder les routes qu'il protège.
- Une "factory" de middleware (fonction retournant un middleware) permet de le paramétrer.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 14.1</span>

Écris un middleware `limiterFrequence(maxRequetes, fenetreMs)` (factory) qui autorise au maximum `maxRequetes` requêtes par IP dans une fenêtre de `fenetreMs` millisecondes, en utilisant une simple `Map` en mémoire pour compter les requêtes par IP.
</div>

**Corrigé :**
```js
function limiterFrequence(maxRequetes, fenetreMs) {
  const compteurs = new Map();

  return function (req, res, next) {
    const ip = req.ip;
    const maintenant = Date.now();
    const entree = compteurs.get(ip) || { compte: 0, debut: maintenant };

    if (maintenant - entree.debut > fenetreMs) {
      entree.compte = 0;
      entree.debut = maintenant;
    }

    entree.compte++;
    compteurs.set(ip, entree);

    if (entree.compte > maxRequetes) {
      return res.status(429).json({ message: "Trop de requêtes, réessaie plus tard" });
    }
    next();
  };
}
```

*Chapitre suivant : contrôleurs et services, pour bien répartir les responsabilités d'une route.*
