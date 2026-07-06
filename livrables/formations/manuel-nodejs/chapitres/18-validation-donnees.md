<div class="chapitre-titre-num">CHAPITRE 18</div>

# Validation des données

## Objectifs pédagogiques

Comprendre pourquoi valider les entrées est non négociable pour une API, et maîtriser Zod comme solution de validation moderne, avec un aperçu de Joi et express-validator.

## 18.1 Pourquoi valider systématiquement les entrées

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais faire confiance aux données venant du client</span>
Toute donnée provenant d'une requête HTTP (`req.body`, `req.params`, `req.query`) doit être considérée comme **potentiellement malveillante ou incorrecte**, quel que soit le frontend censé l'envoyer correctement — un client mal codé, un outil comme Postman/curl, ou une tentative délibérée d'exploitation peuvent tous envoyer des données arbitraires directement à l'API, en contournant totalement le frontend.
</div>

## 18.2 Validation manuelle (le point de départ, et ses limites)

```js
function validerCreationUtilisateur(req, res, next) {
  const { nom, email, motDePasse } = req.body;

  if (!nom || typeof nom !== "string" || nom.length < 2) {
    return res.status(400).json({ message: "Le nom doit contenir au moins 2 caractères" });
  }
  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Email invalide" });
  }
  if (!motDePasse || motDePasse.length < 8) {
    return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
  }

  next();
}
```

Cette approche devient vite répétitive et fragile sur des objets complexes (champs imbriqués, tableaux, règles croisées) — exactement le problème que Zod (section 18.3) résout avec une syntaxe déclarative et réutilisable.

## 18.3 Zod : validation déclarative avec schémas

```
$ npm install zod
```

```js
// src/validators/utilisateurs.validator.js
const { z } = require("zod");

const creerUtilisateurSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  email: z.string().email("Format d'email invalide"),
  motDePasse: z.string().min(8, "8 caractères minimum"),
  age: z.number().int().min(18, "Doit être majeur").optional(),
});

module.exports = { creerUtilisateurSchema };
```

## 18.4 Middleware de validation générique avec Zod

```js
// src/middlewares/valider.middleware.js
function valider(schema) {
  return (req, res, next) => {
    const resultat = schema.safeParse(req.body);

    if (!resultat.success) {
      const erreurs = resultat.error.issues.map((issue) => ({
        champ: issue.path.join("."),
        message: issue.message,
      }));
      return res.status(400).json({ message: "Données invalides", erreurs });
    }

    req.body = resultat.data; // remplace req.body par la version VALIDÉE ET TYPÉE (valeurs coercées si nécessaire)
    next();
  };
}

module.exports = { valider };
```

```js
// routes/utilisateurs.routes.js
const { valider } = require("../middlewares/valider.middleware");
const { creerUtilisateurSchema } = require("../validators/utilisateurs.validator");

router.post("/", valider(creerUtilisateurSchema), utilisateursController.creer);
```

<div class="encadre astuce">
<span class="encadre-titre">💡 safeParse plutôt que parse dans un middleware</span>
`schema.parse(data)` lève une exception si la validation échoue (nécessitant un `try/catch`) ; `schema.safeParse(data)` retourne toujours un objet `{ success, data ou error }`, sans jamais lever d'exception — plus adapté à un contrôle de flux explicite dans un middleware, exactement comme vu pour Zod dans le manuel React de ce même auteur.
</div>

## 18.5 Validation des paramètres d'URL et de la query string

```js
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "L'id doit être un nombre").transform(Number),
});

function validerParams(schema) {
  return (req, res, next) => {
    const resultat = schema.safeParse(req.params);
    if (!resultat.success) {
      return res.status(400).json({ message: "Paramètres invalides" });
    }
    req.params = resultat.data;
    next();
  };
}

router.get("/:id", validerParams(idParamSchema), utilisateursController.obtenir);
```

## 18.6 Validation conditionnelle et règles croisées

```js
const creerCompteSchema = z
  .object({
    typeCompte: z.enum(["COURANT", "EPARGNE"]),
    soldeInitial: z.number().min(0),
    tauxInteret: z.number().min(0).max(1).optional(),
  })
  .refine(
    (donnees) => donnees.typeCompte !== "EPARGNE" || donnees.tauxInteret !== undefined,
    { message: "Le taux d'intérêt est obligatoire pour un compte épargne", path: ["tauxInteret"] }
  );
```

## 18.7 Alternatives : Joi et express-validator (aperçu)

```js
// Joi : syntaxe déclarative similaire à Zod, très répandue historiquement dans l'écosystème Express
const Joi = require("joi");

const schema = Joi.object({
  nom: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  motDePasse: Joi.string().min(8).required(),
});

const { error, value } = schema.validate(req.body);
```

```js
// express-validator : validation directement au niveau des middlewares de route, style "chaîné"
const { body, validationResult } = require("express-validator");

router.post(
  "/utilisateurs",
  body("email").isEmail().withMessage("Email invalide"),
  body("motDePasse").isLength({ min: 8 }).withMessage("8 caractères minimum"),
  (req, res, next) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({ erreurs: erreurs.array() });
    }
    next();
  }
);
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi ce manuel privilégie Zod</span>
Zod combine une syntaxe concise, un typage TypeScript automatique si le projet l'adopte plus tard (avantage détaillé dans le manuel React de ce même auteur), et une popularité croissante qui en fait un choix pérenne pour un nouveau projet. Joi reste parfaitement valide (très répandu dans du code existant) ; express-validator convient bien à des validations simples directement au niveau de la route, sans schéma séparé.
</div>

## 18.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Valider uniquement côté frontend, jamais côté API</span>
Rappel du principe déjà énoncé dans le manuel React de ce même auteur : la validation frontend améliore l'expérience utilisateur (retour immédiat), mais n'empêche **jamais** un client malveillant d'envoyer une requête directement à l'API en contournant totalement l'interface. La validation côté serveur (ce chapitre) est la **seule** qui compte réellement pour la sécurité et l'intégrité des données.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Valider après avoir déjà utilisé les données</span>
```js
async function creer(req, res, next) {
  const utilisateur = await UtilisateurService.creer(req.body); // ❌ utilisé AVANT toute validation !
  // ...
}
```
La validation doit **toujours** intervenir dans un middleware exécuté **avant** le contrôleur, jamais après coup dans la logique métier — sinon des données invalides peuvent déjà avoir causé des effets de bord (écriture en base, appel externe) avant d'être détectées comme invalides.
</div>

## 18.9 Résumé du chapitre

- Aucune donnée reçue du client ne doit être utilisée sans validation préalable côté serveur — la validation frontend n'est qu'un confort d'UX.
- Zod définit des schémas déclaratifs, réutilisables, avec `safeParse` pour un contrôle de flux explicite dans un middleware.
- `req.params` et `req.query` doivent être validés au même titre que `req.body`.
- Joi et express-validator restent des alternatives valables, selon les préférences d'équipe ou le code existant.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 18.1</span>

Écris un schéma Zod pour la création d'un produit (`nom`: string 3-100 caractères, `prix`: nombre positif, `categorie`: une valeur parmi `"alimentaire"`, `"hygiene"`, `"autre"`), puis le middleware de validation correspondant appliqué à la route `POST /produits`.
</div>

**Corrigé :**
```js
const creerProduitSchema = z.object({
  nom: z.string().min(3).max(100),
  prix: z.number().positive("Le prix doit être positif"),
  categorie: z.enum(["alimentaire", "hygiene", "autre"]),
});

router.post("/", valider(creerProduitSchema), produitsController.creer);
```

*Ceci clôt la Partie 3 (Express.js et architecture). Chapitre suivant : la gestion centralisée des erreurs, première étape de la Partie 4 (robustesse d'une API).*
