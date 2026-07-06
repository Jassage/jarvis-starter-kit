<div class="chapitre-titre-num">CHAPITRE 46</div>

# Projet final — Documentation Swagger et tests

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

## 46.6 Résumé du chapitre

- Les annotations Swagger documentent chaque route de MediAPI, exposées via `/api-docs` pour exploration interactive.
- Les tests unitaires isolent la machine à états des rendez-vous (chapitre 43) via des repositories mockés.
- Les tests d'intégration valident le flux complet (authentification → création patient → création consultation), incluant les cas d'erreur (401, 404).
- Toute la suite de tests s'exécute avant chaque déploiement, dans le pipeline CI/CD (chapitre 39).

*Chapitre suivant : la conteneurisation Docker complète de MediAPI, dernière étape du projet et du manuel.*
