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
- Schémas d'architecture en blocs de code `{.uml}` (texte/ASCII) pour les diagrammes simples déjà en place avant le 2026-07-23, jamais en `<div>` brut.
- **Diagrammes Mermaid (décision du 2026-07-23, supersede la règle précédente "jamais de Mermaid")** : les nouveaux diagrammes du gabarit enrichi (flowchart, sequence, class, ER, state, architecture) sont écrits en blocs ```` ```mermaid ```` dans les chapitres sources (lisibles, éditables, diffables en Git), puis **pré-rendus en SVG au moment du build** par `render-mermaid.js` (Puppeteer/Edge headless, réutilise le même pattern que `print-pdf.js`, dépendance `mermaid` en devDependency) — ni pandoc ni la génération PDF n'exécutent de JavaScript, un `<script>` mermaid.js serait donc invisible en DOCX et peu fiable en PDF. `build.ps1` exécute cette étape avant l'assemblage pandoc, écrit les copies transformées dans `.tmp-mermaid/chapitres/` (gitignoré, jamais les fichiers sources) et les SVG dans `assets/diagrams/` (commités, ce sont des assets du livre au même titre que `export/`). Palette des diagrammes alignée sur `assets/style.css` (vert de marque). Les anciens schémas ASCII restent en l'état, pas de migration rétroactive systématique — Mermaid est utilisé pour tout nouveau diagramme ajouté par le gabarit enrichi.
- PDF généré via script Puppeteer dédié (pied de page personnalisé, pas d'en-tête date/URL).
- Saut de page sur le badge "CHAPITRE X", pas sur le `<h1>`.
- Projet final : **MediAPI**, une API de gestion hospitalière (patients, consultations, rendez-vous), avec Prisma + PostgreSQL.

**Gabarit de chapitre enrichi (à partir de la refonte du 2026-07-23, appliqué chapitre par chapitre)** — chaque chapitre suit désormais cet ordre, sans jamais retirer de contenu existant :
1. Badge + titre (inchangé).
2. Encadré `objectif` (🎯) : reformulation des objectifs pédagogiques.
3. Encadré `scenario` (🎬) : mise en situation professionnelle réelle en ouverture.
4. Sections numérotées (X.Y) : contenu conceptuel existant, enrichi (analogies `astuce`, encadrés `bonne-pratique`/`mauvaise-pratique`/`securite`/`performance`/`retenir`/`memoriser`, diagrammes ASCII/`{.uml}` supplémentaires, tableaux comparatifs, emplacements `capture` 📷 pour captures d'écran quand une manipulation logicielle est décrite).
5. `## Atelier` : un mini-laboratoire (Objectif / Préparation / Étapes / Résultat attendu / Dépannage).
6. `## Erreurs fréquentes` (renforcée si elle existait déjà).
7. `## Débogage` : symptôme → diagnostic → résolution.
8. `## En entreprise` : usage réel, bonnes pratiques, erreurs classiques observées.
9. `## Entretien technique` : questions fréquentes, réponses attendues, pièges.
10. `## Optimisation, sécurité et maintenabilité` (facultatif si déjà couvert en amont dans le chapitre).
11. `## Résumé du chapitre` (existant, conservé).
12. `## Quiz` : QCM + Vrai/Faux + questions ouvertes, corrigés inclus.
13. `## Exercices` (existant, enrichi si pertinent).
14. `## Checklist de fin de chapitre` (liste `☐`).
15. `## FAQ` (liste `<dl class="faq">`).
16. `## Références et pour aller plus loin`.
17. Phrase de transition finale vers le chapitre suivant (existant, conservé).

Classes CSS ajoutées à `assets/style.css` pour ce gabarit : `.bonne-pratique`, `.mauvaise-pratique`, `.securite`, `.performance`, `.retenir`, `.objectif`, `.memoriser`, `.scenario`, `.capture`, `.checklist`, `.faq` (mêmes conventions que `.astuce`/`.attention`/`.exercice` déjà en place).

**Chapitre 1 refait selon ce gabarit le 2026-07-23** (pilote de validation avant application aux 50 chapitres restants). **Chapitres 2 à 51 : toujours au format d'origine, pas encore repassés dans le nouveau gabarit.**
