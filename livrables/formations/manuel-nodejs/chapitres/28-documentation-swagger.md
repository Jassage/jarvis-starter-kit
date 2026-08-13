<div class="chapitre-titre-num">CHAPITRE 28</div>

# Documentation Swagger/OpenAPI

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Documenter une API de façon standardisée et interactive avec OpenAPI (anciennement Swagger), consultable et testable directement depuis un navigateur. À la fin de ce chapitre, tu sauras produire une documentation exploitable par une équipe frontend externe, sans jamais lui demander de lire ton code source.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Une agence externe est engagée pour développer l'application mobile consommant l'API que tu construis pour un client. Leur développeur te demande : "avez-vous une documentation de l'API, avec les formats de requête/réponse exacts ?" Répondre "regardez le code source" n'est pas envisageable — ils n'y ont pas accès, et même s'ils l'avaient, ce serait un investissement de temps déraisonnable rien que pour découvrir la forme d'un endpoint. Ce chapitre construit exactement la documentation interactive qui répond à cette demande en une URL partagée.
</div>

## 28.1 Pourquoi documenter formellement une API

<div class="encadre astuce">
<span class="encadre-titre">💡 Une documentation à jour, générée depuis le code, plutôt qu'un document séparé</span>
Une documentation d'API dans un fichier Word ou Notion séparé du code devient rapidement **obsolète** dès que l'API évolue, personne ne pensant systématiquement à la mettre à jour. OpenAPI (la spécification standard, dont Swagger est l'outillage historique) définit un format structuré (YAML/JSON) qui peut être écrit près du code, voire généré automatiquement à partir d'annotations, et **exploré interactivement** via Swagger UI.
</div>

## 28.2 Installation et configuration de base

```
$ npm install swagger-jsdoc swagger-ui-express
```

```js
// src/config/swagger.js
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API MediAPI",
      version: "1.0.0",
      description: "API de gestion hospitalière — documentation complète",
    },
    servers: [{ url: "http://localhost:3000/api", description: "Serveur de développement" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"], // fichiers contenant les annotations JSDoc @swagger
};

module.exports = swaggerJsdoc(options);
```

```js
// app.js
const swaggerUi = require("swagger-ui-express");
const specificationSwagger = require("./config/swagger");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specificationSwagger));
```

## 28.3 Documenter une route avec des annotations JSDoc

```js
/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Liste tous les patients
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *     responses:
 *       200:
 *         description: Liste des patients récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
 *       401:
 *         description: Non authentifié
 */
router.get("/patients", authentifier, patientsController.lister);
```

```js
/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 42
 *         nom:
 *           type: string
 *           example: "Jaslin Occius"
 *         dateNaissance:
 *           type: string
 *           format: date
 *           example: "1998-03-15"
 */
```

## 28.4 Documenter un endpoint POST avec corps de requête

```js
/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Crée un nouveau patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, dateNaissance]
 *             properties:
 *               nom:
 *                 type: string
 *               dateNaissance:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Patient créé avec succès
 *       400:
 *         description: Données invalides
 */
router.post("/patients", authentifier, valider(creerPatientSchema), patientsController.creer);
```

## 28.5 Swagger UI : tester l'API directement depuis le navigateur

<div class="encadre astuce">
<span class="encadre-titre">💡 Swagger UI génère une interface interactive à partir de la spécification</span>
Une fois configuré, accéder à `http://localhost:3000/api-docs` affiche une interface listant chaque route, ses paramètres, ses schémas de requête/réponse, et un bouton **"Try it out"** permettant d'exécuter réellement la requête depuis le navigateur (avec authentification via le bouton "Authorize" pour saisir un token Bearer) — extrêmement utile pour un développeur frontend consommant l'API, ou pour tester rapidement sans Postman.
</div>

<div class="encadre capture">
<span class="encadre-titre">📷 Capture d'écran recommandée</span>
La page `/api-docs` ouverte dans un navigateur : le titre de l'API en haut, la liste des tags (groupes de routes, comme "Patients") repliables, une route dépliée montrant ses paramètres et réponses possibles, et le bouton vert "Authorize" en haut à droite permettant de saisir un token Bearer une seule fois pour toute la session de test.
</div>

<div class="encadre capture">
<span class="encadre-titre">📷 Capture d'écran recommandée</span>
Une route dépliée après un clic sur "Try it out" : les champs de paramètres devenus éditables, le bouton "Execute", et la réponse réelle du serveur affichée juste en dessous (code de statut, corps JSON, en-têtes) — la preuve visuelle qu'aucun outil externe (Postman) n'est nécessaire pour un premier test.
</div>

## 28.6 Générer un fichier openapi.json exportable

```js
const fs = require("fs");
const specificationSwagger = require("./config/swagger");

fs.writeFileSync("openapi.json", JSON.stringify(specificationSwagger, null, 2));
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un fichier openapi.json peut être importé dans Postman ou d'autres outils</span>
Ce fichier exporté suit un standard **universel** (OpenAPI), importable directement dans Postman, Insomnia, ou utilisé pour générer automatiquement des clients HTTP typés dans différents langages (via des générateurs de code OpenAPI) — un gain de temps considérable pour les équipes frontend consommant l'API, exactement la demande de l'agence externe de la mise en situation d'ouverture.
</div>

## 28.7 Aller plus loin : générer la documentation depuis les schémas Zod

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le vrai risque des annotations JSDoc manuelles</span>
Les annotations `@swagger` (sections 28.3-28.4) sont écrites **séparément** du schéma de validation Zod (chapitre 18) qui régit réellement le comportement de la route — rien n'empêche les deux de diverger silencieusement après une modification oubliée d'un seul côté.
</div>

```
$ npm install @asteasolutions/zod-to-openapi
```

```js
// Une seule source de vérité : le schéma Zod génère À LA FOIS la validation ET la documentation
const { extendZodWithOpenApi } = require("@asteasolutions/zod-to-openapi");
const { z } = require("zod");
extendZodWithOpenApi(z);

const creerPatientSchema = z.object({
  nom: z.string().min(2).openapi({ example: "Jaslin Occius" }),
  dateNaissance: z.string().date().openapi({ example: "1998-03-15" }),
}).openapi("CreerPatient");

// Ce MÊME schéma sert au middleware de validation (chapitre 18)
router.post("/patients", authentifier, valider(creerPatientSchema), patientsController.creer);

// ET génère automatiquement la section correspondante de la documentation OpenAPI,
// sans jamais avoir à maintenir une annotation JSDoc séparée qui pourrait diverger
```

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Cette approche élimine structurellement le risque de divergence documentation/code (erreur fréquente n°1) : il n'existe plus qu'une seule source de vérité (le schéma Zod), utilisée à la fois pour valider les requêtes réelles et pour générer la documentation qui les décrit. Pour un nouveau projet, cette approche est préférable aux annotations JSDoc manuelles ; ce manuel documente les deux car les annotations JSDoc restent très répandues dans du code existant.
</div>

## Atelier — Documenter une ressource complète

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 28 — Répondre à la demande de l'agence externe</span>

**Objectif** : produire une documentation complète et utilisable, comme celle demandée dans la mise en situation d'ouverture.

**Préparation** : une API avec au moins une ressource CRUD complète (produits, utilisateurs...).

**Étapes détaillées** :
1. Configure Swagger UI selon la section 28.2.
2. Documente les 5 routes CRUD de ta ressource (GET liste, GET un, POST, PUT, DELETE) avec des annotations JSDoc complètes (paramètres, corps de requête, toutes les réponses possibles).
3. Ouvre `/api-docs` dans un navigateur, teste chaque route via "Try it out" avec un token valide.
4. Exporte le fichier `openapi.json` et importe-le dans Postman pour vérifier qu'il génère automatiquement une collection utilisable.

**Validation** : un développeur externe n'ayant jamais vu le code source doit pouvoir comprendre et tester chaque route uniquement à partir de cette documentation.

**Résultat attendu** : exactement le livrable qui répond à la demande de l'agence externe de la mise en situation d'ouverture.

**Dépannage** : si une route n'apparaît pas dans `/api-docs`, vérifie que son fichier est bien inclus dans le tableau `apis` de la configuration Swagger (section 28.2).

**Nettoyage** : aucun, cette documentation reste un livrable permanent du projet.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Documentation qui diverge silencieusement du code réel</span>
Rien n'empêche techniquement une annotation Swagger de décrire un comportement différent de celui réellement implémenté dans le contrôleur — la documentation JSDoc n'est **pas vérifiée automatiquement** contre le code. Une revue de code attentive doit s'assurer que toute modification d'une route s'accompagne d'une mise à jour de son annotation Swagger correspondante ; l'approche Zod (section 28.7) élimine structurellement ce risque.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Exposer /api-docs en production sans protection</span>
La documentation interactive révèle la structure complète de l'API (routes, schémas, paramètres attendus) — potentiellement utile à un attaquant pour cartographier les points d'entrée. Envisager de protéger `/api-docs` par une authentification basique en production, ou de ne l'exposer que sur l'environnement de développement/staging.
</div>

## Débogage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : Swagger UI affiche une page vide ou une erreur de chargement</span>

- **Cause** : erreur de syntaxe YAML dans une annotation `@swagger` (souvent une indentation incorrecte).
- **Diagnostic** : retirer temporairement les annotations une par une pour isoler celle qui provoque l'erreur.
- **Solution** : corriger l'indentation ou la syntaxe YAML de l'annotation fautive.
</div>

## En entreprise

- **Contrat d'API entre équipes** : dans les organisations où frontend et backend sont développés par des équipes séparées (exactement la mise en situation d'ouverture), la spécification OpenAPI sert souvent de "contrat" formel, parfois même défini **avant** l'implémentation (approche "API-first").
- **Génération de clients typés** : certaines équipes génèrent automatiquement un client TypeScript typé à partir du fichier `openapi.json`, éliminant toute divergence manuelle entre les types utilisés côté frontend et la réalité de l'API.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence entre Swagger et OpenAPI ?"**
Réponse attendue : OpenAPI est la spécification standard (format de description d'API) ; Swagger est le nom historique de l'outillage (Swagger UI, Swagger Editor) construit autour de cette spécification, aujourd'hui maintenue par l'OpenAPI Initiative.

**Q2. "Comment garantir que la documentation reste synchronisée avec le code réel ?"**
Réponse attendue : générer la documentation à partir d'une source unique partagée avec la validation (comme des schémas Zod via zod-to-openapi), plutôt que de maintenir des annotations JSDoc entièrement séparées et sujettes à divergence.

**Q3. "Pourquoi protéger /api-docs en production ?"**
Réponse attendue : la documentation interactive expose la structure complète de l'API (routes, schémas), une information utile à un attaquant pour cartographier les points d'entrée potentiels.
</div>

## Optimisation, sécurité et maintenabilité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Restreindre l'accès à `/api-docs` en production (authentification basique, ou réservé à un environnement de staging) plutôt que de l'exposer publiquement sans réflexion.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Privilégier l'approche Zod (section 28.7) pour un nouveau projet, éliminant structurellement le risque de documentation obsolète — un bénéfice qui grandit avec la taille de l'équipe et la fréquence des changements d'API.
</div>

## Résumé du chapitre

- OpenAPI (Swagger) documente une API de façon standardisée, explorable interactivement via Swagger UI.
- Les annotations JSDoc `@swagger` près de chaque route gardent la documentation proche du code qu'elle décrit, mais peuvent diverger silencieusement du comportement réel.
- Générer la documentation depuis les schémas Zod (zod-to-openapi) élimine ce risque de divergence, une seule source de vérité servant à la fois la validation et la documentation.
- Le bouton "Try it out" de Swagger UI permet de tester réellement l'API depuis le navigateur, avec authentification.
- Un fichier `openapi.json` exporté peut être importé dans Postman ou utilisé pour générer des clients typés.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM</span>

1. Quelle est la différence entre Swagger et OpenAPI ?
   - a) Ce sont des synonymes stricts, sans nuance
   - b) OpenAPI est la spécification, Swagger est l'outillage historique autour d'elle
   - c) Swagger est plus récent qu'OpenAPI
   - d) OpenAPI ne fonctionne qu'avec Node.js

2. Que permet le bouton "Try it out" de Swagger UI ?
   - a) De modifier automatiquement le code source
   - b) D'exécuter réellement une requête vers l'API depuis le navigateur
   - c) De générer un fichier PDF de la documentation
   - d) De supprimer une route de l'API

3. Pourquoi générer la documentation depuis des schémas Zod plutôt que des annotations JSDoc séparées ?
   - a) C'est obligatoire avec Express
   - b) Cela élimine le risque de divergence entre documentation et comportement réel
   - c) C'est plus rapide à l'exécution
   - d) Aucune raison particulière

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Une annotation Swagger est automatiquement vérifiée contre le comportement réel du code. — **Faux**.
2. Le fichier openapi.json peut être importé dans Postman. — **Vrai**.
3. /api-docs devrait toujours être exposé publiquement sans restriction en production. — **Faux**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Question ouverte</span>

L'agence externe de la mise en situation d'ouverture développe son application mobile en se basant sur ta documentation Swagger. Trois mois plus tard, tu modifies un champ de réponse sans mettre à jour l'annotation correspondante. Quelles en sont les conséquences, et comment l'approche Zod (section 28.7) les aurait-elle évitées ?

**Corrigé** : l'agence externe continuerait à développer son application en se fiant à une documentation désormais fausse, découvrant l'écart seulement en test (ou pire, en production), avec un coût de correction bien plus élevé à ce stade. Avec l'approche Zod, le schéma qui décrit réellement la réponse est le même qui génère la documentation — toute modification du schéma se répercute automatiquement dans la documentation exposée, rendant une telle divergence structurellement impossible plutôt que dépendante de la vigilance d'un développeur.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 28.1</span>

Documente une route `DELETE /patients/{id}` avec Swagger : paramètre `id` dans le chemin, réponses 204 (succès), 404 (introuvable), 401 (non authentifié).
</div>

**Corrigé :**
```js
/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Supprime un patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Patient supprimé avec succès
 *       404:
 *         description: Patient introuvable
 *       401:
 *         description: Non authentifié
 */
```

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais configurer Swagger UI dans un projet Express.</li>
<li>☐ Je sais documenter une route GET et une route POST avec annotations JSDoc.</li>
<li>☐ Je sais tester une route depuis Swagger UI avec authentification.</li>
<li>☐ Je connais l'approche zod-to-openapi pour éviter la divergence documentation/code.</li>
<li>☐ Je protège /api-docs en production si nécessaire.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il documenter chaque route dès sa création, ou une fois le projet stabilisé ?</dt>
<dd>Dès sa création — documenter après coup un grand nombre de routes déjà en production devient une tâche fastidieuse et souvent repoussée indéfiniment, contrairement à une documentation écrite au fil de l'eau.</dd>

<dt>Peut-on utiliser Swagger avec TypeScript ?</dt>
<dd>Oui, sans changement de principe ; les types TypeScript peuvent même enrichir automatiquement certaines informations de la documentation selon les outils utilisés.</dd>

<dt>Swagger UI ralentit-il l'application en production ?</dt>
<dd>Négligeable pour la grande majorité des projets ; la génération de la spécification se fait au démarrage, pas à chaque requête.</dd>
</dl>

## Références et pour aller plus loin

- Spécification OpenAPI : [https://swagger.io/specification/](https://swagger.io/specification/)
- Documentation swagger-jsdoc : [https://github.com/Surnet/swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- Documentation zod-to-openapi : [https://github.com/asteasolutions/zod-to-openapi](https://github.com/asteasolutions/zod-to-openapi)

*Ceci clôt la Partie 6 (fonctionnalités avancées). Chapitre suivant : les tests unitaires avec Jest, première étape de la Partie 7.*
