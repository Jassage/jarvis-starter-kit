<div class="chapitre-titre-num">CHAPITRE 24</div>

# Autorisation basée sur les rôles (RBAC)

## Objectifs pédagogiques

Distinguer authentification et autorisation, implémenter un middleware de vérification de rôle, et concevoir un système de permissions plus fin qu'une simple liste de rôles.

## 24.1 Authentification vs autorisation

- **Authentification** (chapitre 23) : *qui es-tu ?*
- **Autorisation** (ce chapitre) : *qu'as-tu le droit de faire, une fois identifié ?*

Le **RBAC** (*Role-Based Access Control*) est le modèle le plus répandu : chaque utilisateur a un rôle (`UTILISATEUR`, `EMPLOYE`, `ADMIN`), et chaque rôle donne accès à un ensemble précis d'actions.

## 24.2 Middleware de vérification de rôle

```js
// src/middlewares/autoriser.middleware.js
const { AccesRefuseError } = require("../errors");

function autoriser(...rolesAutorises) {
  return function (req, res, next) {
    // req.utilisateur a été attaché par le middleware authentifier (chapitre 23), qui doit TOUJOURS précéder celui-ci
    if (!rolesAutorises.includes(req.utilisateur.role)) {
      return next(new AccesRefuseError("Tu n'as pas les droits nécessaires pour cette action"));
    }
    next();
  };
}

module.exports = autoriser;
```

```js
// routes/admin.routes.js
const authentifier = require("../middlewares/authentifier.middleware");
const autoriser = require("../middlewares/autoriser.middleware");

router.get(
  "/utilisateurs",
  authentifier,               // 1. Vérifie l'identité
  autoriser("ADMIN"),          // 2. Vérifie le rôle
  adminController.listerUtilisateurs
);

router.get(
  "/rapports",
  authentifier,
  autoriser("ADMIN", "EMPLOYE"), // plusieurs rôles autorisés pour cette route
  rapportsController.obtenir
);
```

<div class="encadre astuce">
<span class="encadre-titre">💡 L'ordre des middlewares est essentiel : authentifier AVANT autoriser</span>
`autoriser(...)` lit `req.utilisateur.role`, une propriété que **seul** le middleware `authentifier` (chapitre 23) attache à la requête. Inverser l'ordre (`autoriser` avant `authentifier`) provoquerait une erreur (`req.utilisateur` serait `undefined`).
</div>

## 24.3 RBAC hiérarchique

```js
const NIVEAU_ROLE = {
  UTILISATEUR: 1,
  EMPLOYE: 2,
  ADMIN: 3,
};

function autoriserNiveauMinimum(roleMinimum) {
  return function (req, res, next) {
    const niveauUtilisateur = NIVEAU_ROLE[req.utilisateur.role] || 0;
    const niveauRequis = NIVEAU_ROLE[roleMinimum];

    if (niveauUtilisateur < niveauRequis) {
      return next(new AccesRefuseError("Niveau d'accès insuffisant"));
    }
    next();
  };
}

router.get("/rapports", authentifier, autoriserNiveauMinimum("EMPLOYE"), rapportsController.obtenir);
// Un ADMIN (niveau 3) satisfait automatiquement cette exigence, sans avoir à lister explicitement chaque rôle supérieur
```

## 24.4 Permissions fines : au-delà des rôles simples

<div class="encadre astuce">
<span class="encadre-titre">💡 Quand le RBAC simple devient insuffisant</span>
Un système avec de nombreuses fonctionnalités distinctes bénéficie souvent d'un modèle de **permissions** plus granulaire qu'une simple hiérarchie de rôles — chaque rôle associé à un ensemble précis de permissions nommées, plutôt qu'à un simple niveau numérique.
</div>

```js
const PERMISSIONS_PAR_ROLE = {
  UTILISATEUR: ["voir_profil", "modifier_profil"],
  EMPLOYE: ["voir_profil", "modifier_profil", "voir_patients", "creer_consultation"],
  ADMIN: ["voir_profil", "modifier_profil", "voir_patients", "creer_consultation", "gerer_utilisateurs", "voir_rapports_financiers"],
};

function autoriserPermission(permissionRequise) {
  return function (req, res, next) {
    const permissions = PERMISSIONS_PAR_ROLE[req.utilisateur.role] || [];
    if (!permissions.includes(permissionRequise)) {
      return next(new AccesRefuseError(`Permission requise : ${permissionRequise}`));
    }
    next();
  };
}

router.post("/consultations", authentifier, autoriserPermission("creer_consultation"), consultationsController.creer);
```

## 24.5 Autorisation sur la ressource elle-même (propriétaire vs autrui)

```js
// Un utilisateur peut modifier SON PROPRE profil, ou un admin peut modifier n'importe quel profil
async function autoriserProprietaireOuAdmin(req, res, next) {
  const idCible = parseInt(req.params.id);
  const estProprietaire = req.utilisateur.id === idCible;
  const estAdmin = req.utilisateur.role === "ADMIN";

  if (!estProprietaire && !estAdmin) {
    return next(new AccesRefuseError("Tu ne peux modifier que ton propre profil"));
  }
  next();
}

router.put("/utilisateurs/:id", authentifier, autoriserProprietaireOuAdmin, utilisateursController.modifier);
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le RBAC seul ne protège pas contre l'IDOR (Insecure Direct Object Reference)</span>
Vérifier **seulement** le rôle (`ADMIN`, `EMPLOYE`) ne suffit pas si la route manipule une ressource identifiée par un id dans l'URL (`/consultations/:id`) — un `EMPLOYE` authentifié pourrait, sans cette vérification supplémentaire, accéder à la consultation d'un **autre** patient en changeant simplement l'id dans l'URL. Toujours vérifier, en plus du rôle, que l'utilisateur a bien le droit d'accéder à **cette ressource précise** (section 24.5), pas seulement qu'il possède le bon rôle en général.
</div>

## 24.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Faire confiance à un rôle envoyé par le client</span>
```js
// ❌ DANGEREUX : accepte le rôle directement depuis le corps de la requête
router.get("/admin/utilisateurs", (req, res) => {
  if (req.body.role === "ADMIN") { ... } // n'importe qui peut envoyer { "role": "ADMIN" } dans sa requête !
});
```
Le rôle de l'utilisateur doit **toujours** provenir du token JWT vérifié (`req.utilisateur.role`, attaché par le middleware `authentifier`), jamais d'une valeur envoyée directement par le client dans le corps ou les paramètres de la requête.
</div>

## 24.7 Résumé du chapitre

- L'autorisation (RBAC) détermine les actions permises **après** authentification réussie.
- Un middleware `autoriser(...roles)` doit toujours être précédé du middleware `authentifier`.
- Une hiérarchie de rôles (niveaux numériques) ou un système de permissions nommées structurent des besoins plus fins qu'une simple liste de rôles.
- Le RBAC seul ne protège pas contre l'IDOR : vérifier aussi que l'utilisateur a le droit d'accéder à **cette ressource précise**, pas seulement qu'il a le bon rôle.
- Le rôle doit toujours provenir du token JWT vérifié, jamais d'une valeur envoyée par le client.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 24.1</span>

Ajoute un rôle `MODERATEUR` au système hiérarchique de la section 24.3, positionné entre `UTILISATEUR` et `EMPLOYE`.
</div>

**Corrigé :**
```js
const NIVEAU_ROLE = {
  UTILISATEUR: 1,
  MODERATEUR: 2,
  EMPLOYE: 3,
  ADMIN: 4,
};
```
Aucun autre fichier n'a besoin d'être modifié : `autoriserNiveauMinimum` fonctionne immédiatement avec ce nouveau rôle.

*Chapitre suivant : la sécurité applicative (Helmet, CORS, Rate Limiting, prévention des injections), pour durcir l'ensemble de l'API.*
