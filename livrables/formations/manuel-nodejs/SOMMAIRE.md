# Manuel complet Node.js et Express — Sommaire

## Partie 1 — Fondamentaux Node.js
1. Introduction à Node.js
2. Installation de Node.js
3. npm et npx
4. Gestion des packages (package.json, semver)
5. Architecture d'un projet professionnel
6. Modules CommonJS et ES Modules

## Partie 2 — JavaScript moderne et programmation asynchrone
7. JavaScript moderne (ES6+)
8. Callbacks
9. Promises
10. Async/await
11. Gestion des fichiers (fs, streams)
12. Variables d'environnement (.env)

## Partie 3 — Express.js et architecture
13. Introduction à Express.js et routage
14. Middlewares
15. Contrôleurs et services
16. Architecture MVC
17. Architecture en couches (repository/DAO)
18. Validation des données

## Partie 4 — Robustesse d'une API
19. Gestion centralisée des erreurs
20. Journalisation (Winston/Morgan)
21. Pagination, recherche, tri et filtrage

## Partie 5 — Sécurité et authentification
22. Hachage des mots de passe (bcrypt)
23. Authentification JWT
24. Autorisation basée sur les rôles (RBAC)
25. Sécurité (Helmet, CORS, Rate Limiting, injections)

## Partie 6 — Fonctionnalités avancées
26. Téléversement de fichiers (Multer)
27. Envoi d'e-mails (Nodemailer)
28. Documentation Swagger/OpenAPI

## Partie 7 — Tests
29. Tests unitaires (Jest)
30. Tests d'intégration (Supertest)

## Partie 8 — Bases de données et ORM
31. Connexion à PostgreSQL
32. Connexion à MySQL
33. Connexion à MongoDB
34. ORM Prisma
35. Sequelize
36. Mongoose

## Partie 9 — Conteneurisation et déploiement
37. Docker
38. Docker Compose
39. Déploiement
40. Bonnes pratiques et optimisation des performances

## Partie 10 — Projet final : MediAPI (gestion hospitalière)
41. Cahier des charges et architecture
42. Authentification et gestion des utilisateurs/rôles
43. CRUD complets (patients, consultations, rendez-vous)
44. Base de données avec Prisma + PostgreSQL
45. Upload de fichiers et génération de rapports
46. Documentation Swagger et tests
47. Déploiement Docker

## Annexes
A. Aide-mémoire syntaxe Node.js/Express
B. Erreurs fréquentes récapitulées
C. Glossaire
D. Ressources pour aller plus loin

---

**Décisions techniques** (mêmes leçons que les manuels React et Java) :
- Couverture injectée via `--include-before-body` (toujours avant le sommaire auto-généré).
- Schémas d'architecture en blocs de code `{.uml}` (texte/ASCII), jamais en `<div>` brut, pour rester fiables en HTML/PDF/Word.
- PDF généré via script Puppeteer dédié (pied de page personnalisé, pas d'en-tête date/URL).
- Saut de page sur le badge "CHAPITRE X", pas sur le `<h1>`.
- Projet final : **MediAPI**, une API de gestion hospitalière (patients, consultations, rendez-vous), avec Prisma + PostgreSQL.
