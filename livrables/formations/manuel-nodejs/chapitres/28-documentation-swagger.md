<div class="chapitre-titre-num">CHAPITRE 28</div>

# Documentation Swagger/OpenAPI

## Objectifs pédagogiques

Documenter une API de façon standardisée et interactive avec OpenAPI (anciennement Swagger), consultable et testable directement depuis un navigateur.

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

## 28.6 Générer un fichier openapi.json exportable

```js
const fs = require("fs");
const specificationSwagger = require("./config/swagger");

fs.writeFileSync("openapi.json", JSON.stringify(specificationSwagger, null, 2));
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un fichier openapi.json peut être importé dans Postman ou d'autres outils</span>
Ce fichier exporté suit un standard **universel** (OpenAPI), importable directement dans Postman, Insomnia, ou utilisé pour générer automatiquement des clients HTTP typés dans différents langages (via des générateurs de code OpenAPI) — un gain de temps considérable pour les équipes frontend consommant l'API.
</div>

## 28.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Documentation qui diverge silencieusement du code réel</span>
Rien n'empêche techniquement une annotation Swagger de décrire un comportement différent de celui réellement implémenté dans le contrôleur — la documentation JSDoc n'est **pas vérifiée automatiquement** contre le code. Une revue de code attentive doit s'assurer que toute modification d'une route s'accompagne d'une mise à jour de son annotation Swagger correspondante.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Exposer /api-docs en production sans protection</span>
La documentation interactive révèle la structure complète de l'API (routes, schémas, paramètres attendus) — potentiellement utile à un attaquant pour cartographier les points d'entrée. Envisager de protéger `/api-docs` par une authentification basique en production, ou de ne l'exposer que sur l'environnement de développement/staging.
</div>

## 28.8 Résumé du chapitre

- OpenAPI (Swagger) documente une API de façon standardisée, explorable interactivement via Swagger UI.
- Les annotations JSDoc `@swagger` près de chaque route gardent la documentation proche du code qu'elle décrit.
- Le bouton "Try it out" de Swagger UI permet de tester réellement l'API depuis le navigateur, avec authentification.
- Un fichier `openapi.json` exporté peut être importé dans Postman ou utilisé pour générer des clients typés.
- La documentation doit être maintenue manuellement à jour ; rien ne la vérifie automatiquement contre le comportement réel du code.

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

*Ceci clôt la Partie 6 (fonctionnalités avancées). Chapitre suivant : les tests unitaires avec Jest, première étape de la Partie 7.*
