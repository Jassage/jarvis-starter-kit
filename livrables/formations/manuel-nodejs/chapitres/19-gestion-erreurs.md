<div class="chapitre-titre-num">CHAPITRE 19</div>

# Gestion centralisée des erreurs

## Objectifs pédagogiques

Comprendre le middleware d'erreur spécial d'Express, créer des classes d'erreurs métier personnalisées, et éviter le piège des erreurs asynchrones non capturées.

## 19.1 Le problème : gestion d'erreur dupliquée partout

```js
// ❌ Chaque contrôleur répète sa propre logique de traduction erreur → réponse HTTP
async function creer(req, res) {
  try {
    const utilisateur = await UtilisateurService.creerUtilisateur(req.body);
    res.status(201).json(utilisateur);
  } catch (erreur) {
    if (erreur.message === "Email déjà utilisé") {
      res.status(409).json({ message: erreur.message });
    } else {
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
}
```

Répéter ce `catch` avec sa logique de traduction dans **chaque** contrôleur devient vite source d'incohérences (un contrôleur oublie un cas, un autre renvoie un format d'erreur différent).

## 19.2 Le middleware d'erreur spécial d'Express

<div class="encadre astuce">
<span class="encadre-titre">💡 Un middleware à QUATRE paramètres est traité différemment par Express</span>
Express reconnaît un middleware de gestion d'erreurs à sa signature particulière : **quatre** paramètres `(err, req, res, next)`, au lieu des trois habituels. Ce middleware doit être déclaré en **dernier**, après toutes les routes.
</div>

```js
// src/middlewares/erreur.middleware.js
function gestionnaireErreurs(err, req, res, next) {
  console.error(err); // toujours journaliser l'erreur complète côté serveur (chapitre 20)

  const statut = err.statut || 500;
  const message = err.statut ? err.message : "Une erreur interne est survenue";

  res.status(statut).json({ message });
}

module.exports = gestionnaireErreurs;
```

```js
// app.js
// ... toutes les routes déclarées AVANT ...
app.use(gestionnaireErreurs); // TOUJOURS en dernier
```

## 19.3 Classes d'erreurs métier personnalisées

```js
// src/errors/index.js
class ErreurApplicative extends Error {
  constructor(message, statut) {
    super(message);
    this.statut = statut;
    this.name = this.constructor.name;
  }
}

class NonTrouveError extends ErreurApplicative {
  constructor(message = "Ressource introuvable") {
    super(message, 404);
  }
}

class ConflitError extends ErreurApplicative {
  constructor(message = "Conflit avec une ressource existante") {
    super(message, 409);
  }
}

class ValidationError extends ErreurApplicative {
  constructor(message = "Données invalides") {
    super(message, 400);
  }
}

class NonAutoriseError extends ErreurApplicative {
  constructor(message = "Authentification requise") {
    super(message, 401);
  }
}

class AccesRefuseError extends ErreurApplicative {
  constructor(message = "Accès refusé") {
    super(message, 403);
  }
}

module.exports = { ErreurApplicative, NonTrouveError, ConflitError, ValidationError, NonAutoriseError, AccesRefuseError };
```

```js
// services/utilisateurs.service.js
const { ConflitError } = require("../errors");

async function creerUtilisateur({ nom, email, motDePasse }) {
  const existant = await UtilisateurRepository.trouverParEmail(email);
  if (existant) {
    throw new ConflitError("Cet email est déjà utilisé"); // porte SON PROPRE code de statut HTTP
  }
  // ...
}
```

Avec ces classes, le middleware d'erreur centralisé (section 19.2) fonctionne **sans modification** pour n'importe quelle nouvelle erreur métier : `err.statut` est déjà correctement défini par la classe elle-même.

## 19.4 Le piège des erreurs asynchrones non capturées (avant Express 5)

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une erreur dans un contrôleur async sans try/catch n'atteint PAS le middleware d'erreur (Express 4)</span>
```js
// ❌ Avec Express 4 : une erreur ici ne sera JAMAIS transmise au middleware d'erreurs !
async function creer(req, res) {
  const utilisateur = await UtilisateurService.creerUtilisateur(req.body); // si ça lève une erreur...
  res.status(201).json(utilisateur); // ... cette ligne n'est jamais atteinte, et Express 4 ne sait pas quoi en faire
}
```
Express 4 (toujours largement utilisé) ne capture **pas** automatiquement les rejets de Promise dans les gestionnaires de route — une erreur async non entourée de `try/catch` (ou sans `next(erreur)` explicite) reste silencieuse côté client, qui n'obtient jamais de réponse (la requête reste bloquée jusqu'au timeout). **Express 5** (plus récent) corrige ce comportement nativement, mais tant qu'un projet reste sur Express 4, la vigilance manuelle reste nécessaire.
</div>

```js
// ✅ Solution 1 (Express 4 et 5) : try/catch explicite avec next(erreur)
async function creer(req, res, next) {
  try {
    const utilisateur = await UtilisateurService.creerUtilisateur(req.body);
    res.status(201).json(utilisateur);
  } catch (erreur) {
    next(erreur); // transmet explicitement au middleware d'erreur centralisé
  }
}
```

## 19.5 Wrapper asyncHandler : éviter la répétition du try/catch

```js
// src/utils/asyncHandler.js
function asyncHandler(fonctionControleur) {
  return function (req, res, next) {
    Promise.resolve(fonctionControleur(req, res, next)).catch(next); // capture tout rejet et le transmet à next()
  };
}

module.exports = asyncHandler;
```

```js
// controllers/utilisateurs.controller.js
const asyncHandler = require("../utils/asyncHandler");

const creer = asyncHandler(async (req, res) => {
  const utilisateur = await UtilisateurService.creerUtilisateur(req.body);
  res.status(201).json(utilisateur); // plus besoin de try/catch : asyncHandler s'en charge
});

module.exports = { creer };
```

<div class="encadre astuce">
<span class="encadre-titre">💡 asyncHandler élimine la répétition sans changer le comportement</span>
`asyncHandler` enveloppe chaque contrôleur async, transformant automatiquement tout rejet de Promise en appel à `next(erreur)` — évitant de répéter le même bloc `try/catch` dans chaque contrôleur du projet, tout en conservant exactement le même comportement de transmission au middleware d'erreurs centralisé.
</div>

## 19.6 Middleware pour les routes inexistantes (404)

```js
// app.js — juste AVANT le gestionnaire d'erreurs, après TOUTES les routes
app.use((req, res, next) => {
  const { NonTrouveError } = require("./errors");
  next(new NonTrouveError(`Route ${req.method} ${req.originalUrl} introuvable`));
});

app.use(gestionnaireErreurs); // traite cette erreur 404 comme n'importe quelle autre
```

## 19.7 Ne jamais exposer les détails techniques en production

```js
function gestionnaireErreurs(err, req, res, next) {
  console.error(err); // le détail COMPLET (avec stack trace) reste dans les LOGS serveur (chapitre 20)

  const statut = err.statut || 500;
  const message = err.statut
    ? err.message
    : process.env.NODE_ENV === "production"
      ? "Une erreur interne est survenue" // message GÉNÉRIQUE en production pour les erreurs non anticipées
      : err.message; // détail complet en développement, utile pour déboguer

  res.status(statut).json({ message });
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais renvoyer une stack trace au client en production</span>
Une stack trace complète peut révéler la structure interne du code, les chemins de fichiers serveur, voire des fragments de requêtes SQL — des informations précieuses pour un attaquant. En production, seules les erreurs **métier anticipées** (avec un `statut` défini explicitement) devraient exposer leur message réel au client ; toute erreur inattendue (bug, panne) doit renvoyer un message générique, tout en étant journalisée en détail côté serveur.
</div>

## 19.8 Résumé du chapitre

- Le middleware d'erreur Express se reconnaît à sa signature à quatre paramètres `(err, req, res, next)`, déclaré en dernier.
- Des classes d'erreurs métier personnalisées (héritant d'`Error`, portant leur propre `statut` HTTP) centralisent la traduction erreur → réponse HTTP.
- Sur Express 4, une erreur async non capturée par `try/catch` (ou un wrapper `asyncHandler`) n'atteint jamais le middleware d'erreurs — Express 5 corrige ce comportement nativement.
- Ne jamais exposer de détails techniques (stack trace) au client en production ; toujours journaliser le détail complet côté serveur.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 19.1</span>

Crée une classe d'erreur `StockInsuffisantError` (statut 409) et utilise-la dans un service de vente qui vérifie la disponibilité du stock avant de créer une commande.
</div>

**Corrigé :**
```js
class StockInsuffisantError extends ErreurApplicative {
  constructor(produitNom) {
    super(`Stock insuffisant pour le produit : ${produitNom}`, 409);
  }
}

async function creerVente(produitId, quantite) {
  const produit = await ProduitRepository.trouverParId(produitId);
  if (produit.stock < quantite) {
    throw new StockInsuffisantError(produit.nom);
  }
  // ... création de la vente ...
}
```

*Chapitre suivant : la journalisation, pour garder une trace fiable de ce qui se passe réellement en production.*
