<div class="chapitre-titre-num">CHAPITRE 41</div>

# Projet final — Cahier des charges et architecture (MediAPI)

## Objectifs pédagogiques

Assembler l'ensemble des 40 chapitres précédents dans un projet complet et cohérent : une API REST de gestion hospitalière, avec authentification, rôles, CRUD complets, base de données relationnelle, upload de fichiers, rapports, documentation et tests.

## 41.1 Présentation : MediAPI

**MediAPI** est une API REST de gestion hospitalière couvrant : authentification et gestion des utilisateurs (rôles ADMIN, MEDECIN, RECEPTIONNISTE), gestion des patients, des consultations, des rendez-vous, upload de documents médicaux, génération de rapports d'activité, documentation Swagger complète et suite de tests.

<div class="encadre astuce">
<span class="encadre-titre">💡 Un domaine délibérément proche d'un projet réel</span>
Ce choix de domaine (gestion hospitalière) reprend la structure d'un système de gestion médicale réel : patients, consultations en plusieurs étapes, rendez-vous, dossiers documentaires — suffisamment riche pour mobiliser l'ensemble des concepts du manuel, sans la complexité d'un système de production complet.
</div>

## 41.2 Cahier des charges fonctionnel

1. **Authentification** : inscription (réservée à l'admin pour créer des comptes staff), connexion, rafraîchissement de session (chapitre 23).
2. **Rôles** : `ADMIN` (gestion complète), `MEDECIN` (patients, consultations), `RECEPTIONNISTE` (patients, rendez-vous) — chapitre 24.
3. **Patients** : CRUD complet, recherche, pagination (chapitre 21).
4. **Consultations** : création liée à un patient et un médecin, historique, diagnostic, prescriptions.
5. **Rendez-vous** : planification, statut (planifié/confirmé/annulé/terminé).
6. **Documents médicaux** : upload de fichiers (résultats d'examens, ordonnances scannées) liés à un patient (chapitre 26).
7. **Rapports** : statistiques d'activité (consultations par période, par médecin) — chapitre 21 combiné aux agrégations Prisma.
8. **Documentation** : Swagger complet sur toutes les routes (chapitre 28).
9. **Tests** : unitaires sur les services critiques, intégration sur les routes principales (chapitres 29-30).

## 41.3 Stack technique retenue

| Couche | Choix | Chapitre de référence |
|---|---|---|
| Runtime | Node.js 20 LTS | 1-2 |
| Framework | Express.js | 13-19 |
| Validation | Zod | 18 |
| Authentification | JWT (access + refresh) | 23 |
| Base de données | PostgreSQL | 31 |
| ORM | Prisma | 34 |
| Upload | Multer (stockage local pour ce projet) | 26 |
| Documentation | Swagger/OpenAPI | 28 |
| Tests | Jest + Supertest | 29-30 |
| Conteneurisation | Docker + Docker Compose | 37-38 |

## 41.4 Architecture des dossiers

```
mediapi/
├── src/
│   ├── config/
│   │   ├── prisma.js
│   │   ├── logger.js
│   │   └── swagger.js
│   ├── modele/                  (schéma Prisma, section 41.6)
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── patients.controller.js
│   │   ├── consultations.controller.js
│   │   ├── rendezvous.controller.js
│   │   ├── documents.controller.js
│   │   └── rapports.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── patients.service.js
│   │   ├── consultations.service.js
│   │   ├── rendezvous.service.js
│   │   └── rapports.service.js
│   ├── repositories/
│   │   ├── utilisateurs.repository.js
│   │   ├── patients.repository.js
│   │   ├── consultations.repository.js
│   │   └── rendezvous.repository.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── patients.routes.js
│   │   ├── consultations.routes.js
│   │   ├── rendezvous.routes.js
│   │   ├── documents.routes.js
│   │   └── rapports.routes.js
│   ├── middlewares/
│   │   ├── authentifier.middleware.js
│   │   ├── autoriser.middleware.js
│   │   ├── valider.middleware.js
│   │   └── erreur.middleware.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── patients.validator.js
│   │   └── consultations.validator.js
│   ├── errors/
│   │   └── index.js
│   ├── utils/
│   │   └── asyncHandler.js
│   └── app.js
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   └── integration/
├── uploads/
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
└── server.js
```

## 41.5 Diagramme d'architecture global

```{.uml}
┌───────────────────────────────────────┐
│  ui externe (Swagger UI, Postman, frontend) │
└───────────────────────────────────────┘
              │ HTTP (JSON)
              ▼
┌───────────────────────────────────────┐
│  routes/ (définition des endpoints)       │
├───────────────────────────────────────┤
│  middlewares/ (authentifier, autoriser,   │
│  valider) — chapitres 14, 18, 23, 24      │
├───────────────────────────────────────┤
│  controllers/ (traduction HTTP)            │
├───────────────────────────────────────┤
│  services/ (logique métier)                │
├───────────────────────────────────────┤
│  repositories/ (accès Prisma)               │
├───────────────────────────────────────┤
│  PostgreSQL                                │
└───────────────────────────────────────┘
```

## 41.6 Modèle de données (aperçu, détaillé au chapitre 44)

```{.uml}
Utilisateur "1"───"0..*" Consultation (medecin)
Patient "1"───"0..*" Consultation
Patient "1"───"0..*" RendezVous
Patient "1"───"0..*" Document
Utilisateur "1"───"0..*" RendezVous (medecin)
```

## 41.7 Découpage des chapitres suivants

- **Chapitre 42** : authentification et gestion des utilisateurs/rôles.
- **Chapitre 43** : CRUD complets (patients, consultations, rendez-vous).
- **Chapitre 44** : schéma Prisma complet et migrations.
- **Chapitre 45** : upload de documents et génération de rapports.
- **Chapitre 46** : documentation Swagger et suite de tests.
- **Chapitre 47** : conteneurisation Docker et déploiement final.

## 41.8 Résumé du chapitre

- MediAPI assemble l'ensemble des concepts des 40 chapitres précédents dans une API de gestion hospitalière cohérente.
- L'architecture en couches (routes → middlewares → contrôleurs → services → repositories → PostgreSQL/Prisma) structure tout le projet.
- Les 6 chapitres suivants construisent MediAPI fonctionnalité par fonctionnalité, jusqu'au déploiement Docker complet.

*Chapitre suivant : authentification et gestion des utilisateurs/rôles, la fondation du projet MediAPI.*
