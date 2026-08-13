<div class="chapitre-titre-num">CHAPITRE 46</div>

# Projet final — Documentation Swagger et tests

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Documenter l'intégralité des routes de MediAPI avec Swagger/OpenAPI (chapitre 28) et construire une suite de tests couvrant la logique critique et les flux complets (chapitres 29-30). À la fin de ce chapitre, MediAPI sera prêt pour une revue de qualité avant le déploiement final du chapitre 47.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le médecin-directeur veut confier à un développeur mobile externe la création d'une application compagnon pour tablette. Ce développeur externe n'a accès ni à ton code source ni à ta documentation Notion — seulement à une URL. En parallèle, tu dois pouvoir garantir, avant chaque évolution du projet, que tu n'as rien cassé dans la machine à états des rendez-vous ou dans le flux d'authentification déjà en production. Ce chapitre construit les deux réponses à ces deux besoins bien réels : une documentation Swagger exploitable par un tiers, et une suite de tests qui protège contre les régressions silencieuses.
</div>

## 46.1 Configuration Swagger de MediAPI

```js
// src/config/swagger.js — repris et complété du chapitre 28
const swaggerJsdoc = require("swagger-jsdoc");

module.exports = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "MediAPI", version: "1.0.0", description: "API de gestion hospitalière" },
    servers: [{ url: "/api" }],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
      schemas: {
        Patient: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            nom: { type: "string", example: "Marie Pierre" },
            dateNaissance: { type: "string", format: "date" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
});
```

## 46.2 Annotations sur les routes principales

```js
/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Liste les patients (paginé, recherche par nom)
 *     tags: [Patients]
 *     parameters:
 *       - in: query
 *         name: recherche
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Liste paginée des patients
 */
router.get("/", autoriser("ADMIN", "MEDECIN", "RECEPTIONNISTE"), patientsController.lister);

/**
 * @swagger
 * /consultations:
 *   post:
 *     summary: Crée une nouvelle consultation
 *     tags: [Consultations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, motif]
 *             properties:
 *               patientId: { type: integer }
 *               motif: { type: string }
 *     responses:
 *       201: { description: Consultation créée }
 *       404: { description: Patient introuvable }
 */
```

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Cette documentation, disponible sur `/api-docs` (rappel du chapitre 28), est exactement ce que tu communiquerais au développeur mobile externe de la mise en situation d'ouverture — une seule URL, sans jamais avoir besoin de partager le code source ni d'organiser une session d'explication technique.
</div>

## 46.3 Tests unitaires : le service RendezVous (machine à états)

```js
// tests/unit/rendezvous.service.test.js
const RendezVousService = require("../../src/services/rendezvous.service");

describe("changerStatut", () => {
  it("autorise PLANIFIE → CONFIRME", async () => {
    const repositoryFactice = {
      trouverParId: jest.fn().mockResolvedValue({ id: 1, statut: "PLANIFIE" }),
      modifierStatut: jest.fn().mockResolvedValue({ id: 1, statut: "CONFIRME" }),
    };

    const resultat = await RendezVousService.changerStatut(1, "CONFIRME", repositoryFactice);
    expect(resultat.statut).toBe("CONFIRME");
  });

  it("refuse ANNULE → TERMINE", async () => {
    const repositoryFactice = {
      trouverParId: jest.fn().mockResolvedValue({ id: 1, statut: "ANNULE" }),
      modifierStatut: jest.fn(),
    };

    await expect(RendezVousService.changerStatut(1, "TERMINE", repositoryFactice))
      .rejects.toThrow("non autorisée");

    expect(repositoryFactice.modifierStatut).not.toHaveBeenCalled();
  });
});
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce test protège exactement contre l'erreur de la réceptionniste du chapitre 43</span>
Ce test unitaire n'est pas un exercice abstrait : il garantit, à chaque exécution future de la suite de tests, que la machine à états continue de rejeter la transition `ANNULE → TERMINE` — même après une modification future du code par un autre développeur qui n'aurait pas connaissance de cette règle métier.
</div>

## 46.4 Tests d'intégration : le flux patient complet

```js
// tests/integration/patients.test.js
const request = require("supertest");
const app = require("../../src/app");

describe("API Patients", () => {
  let tokenAdmin;

  beforeAll(async () => {
    const connexion = await request(app)
      .post("/api/auth/connexion")
      .send({ email: "admin@mediapi.ht", motDePasse: "motdepasse123" });
    tokenAdmin = connexion.body.accessToken;
  });

  it("un ADMIN peut créer un patient", async () => {
    const reponse = await request(app)
      .post("/api/patients")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ nom: "Test Patient", dateNaissance: "1995-01-01" });

    expect(reponse.status).toBe(201);
    expect(reponse.body.nom).toBe("Test Patient");
  });

  it("refuse la création sans authentification", async () => {
    const reponse = await request(app)
      .post("/api/patients")
      .send({ nom: "Sans Auth", dateNaissance: "1995-01-01" });

    expect(reponse.status).toBe(401);
  });

  it("retourne 404 pour un patient inexistant", async () => {
    const reponse = await request(app)
      .get("/api/patients/999999")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(reponse.status).toBe(404);
  });
});
```

## 46.5 Test d'intégration du flux complet consultation

```js
describe("Flux complet : créer un patient puis une consultation", () => {
  it("crée un patient puis lui associe une consultation", async () => {
    const patient = await request(app)
      .post("/api/patients")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ nom: "Flux Test", dateNaissance: "1988-03-20" });

    const consultation = await request(app)
      .post("/api/consultations")
      .set("Authorization", `Bearer ${tokenMedecin}`)
      .send({ patientId: patient.body.id, motif: "Contrôle annuel" });

    expect(consultation.status).toBe(201);
    expect(consultation.body.patientId).toBe(patient.body.id);
  });
});
```

## Atelier — Construire la suite de tests de non-régression

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 46 — Vérifier que rien n'est cassé après une modification</span>

**Objectif** : vérifier concrètement la valeur d'une suite de tests face à une régression, comme dans la seconde partie de la mise en situation d'ouverture.

**Préparation** : MediAPI avec la suite de tests de ce chapitre en place, tous passants.

**Étapes détaillées** :
1. Lance la suite complète (`npm test` et `npm run test:integration`), confirme que tout passe.
2. Modifie volontairement `TRANSITIONS_AUTORISEES` (chapitre 43) pour autoriser par erreur `ANNULE → TERMINE`.
3. Relance les tests unitaires : le test "refuse ANNULE → TERMINE" doit maintenant échouer, révélant immédiatement la régression.
4. Annule la modification, confirme que les tests repassent.
5. Ajoute Swagger et documente une nouvelle route que tu inventes (par exemple, `GET /patients/:id/consultations`), vérifie-la sur `/api-docs`.

**Validation** : la régression introduite à l'étape 2 doit être détectée immédiatement par la suite de tests, sans avoir eu besoin de tester manuellement l'application.

**Résultat attendu** : la preuve concrète que cette suite de tests protège réellement le projet, exactement le second besoin exprimé dans la mise en situation d'ouverture.

**Dépannage** : si la régression n'est pas détectée, vérifie que le test couvre bien le cas précis modifié — un signe que la couverture de test doit être étendue.

**Nettoyage** : aucun, cette suite de tests doit rester active en permanence sur le projet.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Documentation Swagger incomplète, seulement sur quelques routes</span>
Une documentation partielle oblige le développeur externe de la mise en situation d'ouverture à deviner le comportement des routes non documentées, ou à revenir vers toi pour chaque question — annulant une grande partie du bénéfice recherché.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Ne tester que le chemin heureux, jamais les cas d'erreur (401, 404)</span>
Rappel du chapitre 30 — les cas d'erreur (comme "refuse la création sans authentification" en section 46.4) sont souvent ceux qui révèlent les vraies failles de robustesse d'une API, pas seulement son bon fonctionnement nominal.
</div>

## Débogage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un test d'intégration échoue de façon incohérente selon l'ordre d'exécution</span>

- **Cause probable** : dépendance entre tests via des données partagées non nettoyées (rappel du chapitre 30, section sur l'indépendance des tests).
- **Solution** : ajouter un nettoyage systématique (`afterEach`/`beforeEach`) entre les tests concernés.
</div>

## En entreprise

- **Documentation Swagger comme contrat d'intégration avec des tiers** : exactement le scénario de la mise en situation d'ouverture — une équipe mobile externe, une agence partenaire, ou même un futur toi dans 6 mois s'appuient sur cette documentation plutôt que sur le code source.
- **Tests de non-régression avant chaque livraison** : dans la quasi-totalité des équipes professionnelles, aucune fonctionnalité n'est considérée "terminée" sans les tests correspondants, précisément pour permettre des évolutions futures sans crainte de casser silencieusement l'existant.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Comment documenterais-tu une API pour une équipe externe sans accès au code source ?"**
Réponse attendue : une documentation Swagger/OpenAPI complète et interactive, exposée via une URL dédiée (`/api-docs`), permettant d'explorer et tester chaque route sans jamais avoir besoin du code source.

**Q2. "Comment structurerais-tu la suite de tests d'un projet comme MediAPI ?"**
Réponse attendue : des tests unitaires sur la logique métier critique (comme la machine à états des rendez-vous), et des tests d'intégration couvrant les flux complets incluant l'authentification et les cas d'erreur, pas seulement le chemin heureux.

**Q3. "Pourquoi tester spécifiquement la machine à états des rendez-vous plutôt que de faire confiance au code déjà relu ?"**
Réponse attendue : une relecture humaine ne garantit rien contre une régression future introduite par un autre développeur qui n'aurait pas connaissance de cette règle métier — un test automatisé, lui, la protège durablement et objectivement.
</div>

## Optimisation, sécurité et maintenabilité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Protéger `/api-docs` en production (rappel du chapitre 28) reste pertinent même pour MediAPI, une application manipulant des données médicales sensibles — la documentation révèle la structure complète de l'API.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Prioriser les tests sur la logique la plus critique et la plus sujette à régression (comme les machines à états et les règles d'autorisation) plutôt que de viser une couverture à 100% partout — rappel de la nuance du chapitre 29 sur la couverture de code.
</div>

## Résumé du chapitre

- Les annotations Swagger documentent chaque route de MediAPI, exposées via `/api-docs` pour exploration interactive par des tiers externes.
- Les tests unitaires isolent la machine à états des rendez-vous (chapitre 43) via des repositories mockés.
- Les tests d'intégration valident le flux complet (authentification → création patient → création consultation), incluant les cas d'erreur (401, 404).
- Toute la suite de tests s'exécute avant chaque déploiement, dans le pipeline CI/CD (chapitre 39).

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM</span>

1. Pourquoi documenter MediAPI avec Swagger avant de la confier à une équipe externe ?
   - a) Ce n'est pas nécessaire, le code suffit
   - b) Pour permettre l'exploration et le test de l'API sans accès au code source
   - c) Swagger est obligatoire pour Express
   - d) Pour ralentir volontairement le développement

2. Que protège le test "refuse ANNULE → TERMINE" ?
   - a) La performance de l'API
   - b) La règle métier de la machine à états contre une régression future
   - c) La connexion à la base de données
   - d) Rien d'important

3. Pourquoi tester aussi le cas "refuse la création sans authentification" ?
   - a) Ce n'est pas nécessaire, seul le succès compte
   - b) Les cas d'erreur révèlent souvent les vraies failles de robustesse
   - c) Pour ralentir la suite de tests
   - d) Supertest l'exige

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Une documentation Swagger partielle est aussi utile qu'une documentation complète pour un tiers externe. — **Faux**.
2. Les tests unitaires de la machine à états utilisent un vrai repository connecté à la base. — **Faux** (repository mocké).
3. La suite de tests devrait s'exécuter avant chaque déploiement en production. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Question ouverte</span>

Le développeur mobile externe de la mise en situation d'ouverture te signale une incohérence entre la documentation Swagger et le comportement réel d'une route. Comment ce chapitre t'aide-t-il à éviter ce genre de problème à l'avenir ?

**Corrigé** : rappel du chapitre 28 — l'approche recommandée pour un nouveau projet est de générer la documentation depuis les mêmes schémas Zod que la validation elle-même (zod-to-openapi), éliminant structurellement le risque de divergence. Pour MediAPI (qui utilise des annotations JSDoc manuelles dans cet exemple), la discipline de mise à jour systématique de l'annotation à chaque modification de route reste essentielle — et les tests d'intégration de ce chapitre, en validant le comportement réel, servent de garde-fou complémentaire qui révèle rapidement un tel écart s'il survient.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 46.1</span>

Écris un test d'intégration vérifiant qu'un `RECEPTIONNISTE` reçoit une erreur 403 en tentant de supprimer un patient (rôle réservé à `ADMIN`, rappel du chapitre 43).
</div>

**Corrigé :**
```js
it("un RECEPTIONNISTE ne peut pas supprimer un patient", async () => {
  const reponse = await request(app)
    .delete(`/api/patients/${patientTestId}`)
    .set("Authorization", `Bearer ${tokenReceptionniste}`);

  expect(reponse.status).toBe(403);
});
```

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ J'ai documenté l'ensemble des routes principales de MediAPI avec Swagger.</li>
<li>☐ J'ai écrit des tests unitaires pour la machine à états des rendez-vous.</li>
<li>☐ J'ai écrit des tests d'intégration couvrant le chemin heureux ET les cas d'erreur.</li>
<li>☐ J'ai vérifié qu'une régression volontaire est bien détectée par la suite de tests.</li>
<li>☐ /api-docs est accessible et exploitable sans avoir besoin du code source.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il documenter aussi les routes d'authentification, ou seulement les routes métier ?</dt>
<dd>Toutes les routes, y compris l'authentification — un développeur externe (comme celui de la mise en situation d'ouverture) a besoin de savoir comment obtenir un token avant de pouvoir tester quoi que ce soit d'autre.</dd>

<dt>Combien de tests d'intégration sont nécessaires pour un projet comme MediAPI ?</dt>
<dd>Il n'y a pas de nombre absolu — l'objectif est de couvrir chaque flux métier critique (authentification, création de chaque ressource principale, transitions de statut) et leurs cas d'erreur associés, plutôt que d'atteindre un chiffre arbitraire.</dd>

<dt>Les tests ralentissent-ils significativement le développement quotidien ?</dt>
<dd>Une suite de tests unitaires bien conçue s'exécute en quelques secondes (rappel du chapitre 29) — le ralentissement perçu est largement compensé par le temps économisé à ne pas devoir tester manuellement chaque scénario après chaque modification.</dd>
</dl>

## Références et pour aller plus loin

- Rappel des chapitres 28 (Swagger), 29 (tests unitaires) et 30 (tests d'intégration) pour les fondations complètes de ce chapitre.

*Chapitre suivant : la conteneurisation Docker complète de MediAPI, dernière étape du projet et du manuel.*
