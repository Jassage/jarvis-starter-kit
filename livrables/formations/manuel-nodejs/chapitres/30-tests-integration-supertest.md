<div class="chapitre-titre-num">CHAPITRE 30</div>

# Tests d'intégration (Supertest)

## Objectifs pédagogiques

Tester une API Express de bout en bout (requête HTTP réelle, middlewares, base de données de test), avec Supertest, en complément des tests unitaires du chapitre 29.

## 30.1 Test unitaire vs test d'intégration

<div class="encadre astuce">
<span class="encadre-titre">💡 Deux niveaux complémentaires, pas concurrents</span>
Un **test unitaire** (chapitre 29) isole une fonction/service de ses dépendances (mockées). Un **test d'intégration** vérifie que **plusieurs parties assemblées** fonctionnent correctement ensemble : la route, les middlewares (authentification, validation), le contrôleur, le service, et une vraie base de données (généralement une base de test dédiée). Les deux niveaux se complètent : rapide et ciblé (unitaire) vs réaliste et englobant (intégration).
</div>

## 30.2 Pourquoi séparer app.js et server.js redevient essentiel ici

Rappel du chapitre 5 : `app.js` exporte l'application Express **sans** appeler `.listen()`. Supertest peut alors envoyer des requêtes directement à cet objet `app`, **sans ouvrir de vrai port réseau**.

```
$ npm install --save-dev supertest
```

```js
// tests/integration/utilisateurs.test.js
const request = require("supertest");
const app = require("../../src/app");

describe("API Utilisateurs", () => {
  it("GET /api/utilisateurs retourne un tableau", async () => {
    const reponse = await request(app).get("/api/utilisateurs");

    expect(reponse.status).toBe(200);
    expect(Array.isArray(reponse.body)).toBe(true);
  });
});
```

## 30.3 Tester une création (POST) avec corps de requête

```js
describe("POST /api/utilisateurs", () => {
  it("crée un utilisateur avec des données valides", async () => {
    const reponse = await request(app)
      .post("/api/utilisateurs")
      .send({ nom: "Jaslin", email: "jaslin@test.com", motDePasse: "motdepasse123" });

    expect(reponse.status).toBe(201);
    expect(reponse.body.email).toBe("jaslin@test.com");
    expect(reponse.body.motDePasseHash).toBeUndefined(); // vérifie que le hash n'est JAMAIS exposé au client
  });

  it("rejette une création avec un email invalide", async () => {
    const reponse = await request(app)
      .post("/api/utilisateurs")
      .send({ nom: "Jaslin", email: "pas-un-email", motDePasse: "motdepasse123" });

    expect(reponse.status).toBe(400);
  });
});
```

## 30.4 Tester une route protégée par authentification

```js
describe("GET /api/utilisateurs/profil (protégée)", () => {
  it("refuse l'accès sans token", async () => {
    const reponse = await request(app).get("/api/utilisateurs/profil");
    expect(reponse.status).toBe(401);
  });

  it("autorise l'accès avec un token valide", async () => {
    // 1. Se connecter d'abord pour obtenir un vrai token
    const connexion = await request(app)
      .post("/api/auth/login")
      .send({ email: "jaslin@test.com", motDePasse: "motdepasse123" });

    const token = connexion.body.accessToken;

    // 2. Utiliser ce token pour accéder à la route protégée
    const reponse = await request(app)
      .get("/api/utilisateurs/profil")
      .set("Authorization", `Bearer ${token}`);

    expect(reponse.status).toBe(200);
    expect(reponse.body.email).toBe("jaslin@test.com");
  });
});
```

## 30.5 Base de données de test dédiée

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais faire tourner les tests d'intégration sur la base de données de production/développement</span>
Les tests d'intégration créent, modifient et suppriment réellement des données. Les exécuter sur la base de développement personnelle risquerait de la polluer avec des données de test ; sur la base de production, ce serait catastrophique. Une base de données **dédiée aux tests** (souvent nommée `nomapp_test`), configurée via une variable d'environnement séparée (`DATABASE_URL` différente en environnement `test`), est indispensable.
</div>

```js
// tests/setup.js — exécuté avant/après la suite de tests (configuré via jest.config.js)
const prisma = require("../src/config/prisma");

beforeAll(async () => {
  // S'assurer que la base de test est dans un état propre et connu avant de commencer
  await prisma.$executeRaw`TRUNCATE TABLE "Utilisateur" RESTART IDENTITY CASCADE`;
});

afterAll(async () => {
  await prisma.$disconnect(); // ferme proprement la connexion après tous les tests
});
```

```json
// package.json
"scripts": {
  "test:integration": "NODE_ENV=test jest tests/integration --setupFilesAfterEach=./tests/setup.js"
}
```

## 30.6 Nettoyer les données entre chaque test

```js
afterEach(async () => {
  // Nettoie les tables modifiées par le test précédent, pour que chaque test parte d'un état PROPRE et PRÉVISIBLE
  await prisma.utilisateur.deleteMany({ where: { email: { contains: "@test.com" } } });
});
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Chaque test doit être indépendant des autres</span>
Un test qui dépend de l'ordre d'exécution ou de données laissées par un test précédent devient **fragile** et difficile à déboguer (un test échoue seulement si un autre a été exécuté avant, ou dans un ordre différent). Nettoyer systématiquement l'état entre les tests (ou utiliser des transactions annulées après chaque test) garantit leur indépendance totale.
</div>

## 30.7 Tester les cas d'erreur systématiquement

```js
describe("GET /api/utilisateurs/:id", () => {
  it("retourne 404 pour un id inexistant", async () => {
    const reponse = await request(app).get("/api/utilisateurs/999999");
    expect(reponse.status).toBe(404);
  });

  it("retourne 400 pour un id au format invalide", async () => {
    const reponse = await request(app).get("/api/utilisateurs/pas-un-id");
    expect(reponse.status).toBe(400);
  });
});
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Ne pas tester QUE le "chemin heureux"</span>
Un piège fréquent : ne tester que les cas où tout se passe bien (données valides, ressource existante). Les cas d'erreur (données invalides, ressource inexistante, absence d'authentification) sont **au moins aussi importants** à couvrir, car ce sont souvent eux qui révèlent les vraies failles de robustesse d'une API.
</div>

## 30.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier NODE_ENV=test, exécuter les tests contre la mauvaise base</span>
Sans variable d'environnement distincte activée explicitement pendant les tests, `ConfigDB` (chapitre 12) pourrait se connecter à la base de développement par défaut — toujours vérifier explicitement quelle base de données est ciblée avant de lancer une suite de tests qui modifie des données.
</div>

## 30.9 Résumé du chapitre

- Supertest envoie de vraies requêtes HTTP à l'objet `app` exporté (sans `.listen()`), testant routes, middlewares et contrôleurs ensemble.
- Une base de données de test **dédiée**, nettoyée entre chaque test, garantit des résultats reproductibles et indépendants.
- Tester systématiquement les cas d'erreur (données invalides, ressource inexistante, absence d'authentification), pas seulement le chemin heureux.
- Toujours vérifier explicitement l'environnement ciblé (`NODE_ENV=test`) avant d'exécuter des tests qui modifient des données.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 30.1</span>

Écris un test d'intégration pour `DELETE /api/utilisateurs/:id`, vérifiant qu'un admin peut supprimer un utilisateur (204), mais qu'un utilisateur normal reçoit une erreur 403.
</div>

**Corrigé :**
```js
describe("DELETE /api/utilisateurs/:id", () => {
  it("un ADMIN peut supprimer un utilisateur", async () => {
    const reponse = await request(app)
      .delete(`/api/utilisateurs/${utilisateurTestId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(reponse.status).toBe(204);
  });

  it("un UTILISATEUR normal ne peut pas supprimer un utilisateur", async () => {
    const reponse = await request(app)
      .delete(`/api/utilisateurs/${utilisateurTestId}`)
      .set("Authorization", `Bearer ${tokenUtilisateurNormal}`);
    expect(reponse.status).toBe(403);
  });
});
```

*Ceci clôt la Partie 7 (tests). Chapitre suivant : la connexion à PostgreSQL, première étape de la Partie 8 (bases de données et ORM).*
