<div class="chapitre-titre-num">ANNEXE D</div>

# Ressources pour aller plus loin

## Documentation officielle

- **Node.js** — nodejs.org/docs : documentation officielle de l'API native (fs, http, path, worker_threads...). À consulter dès qu'un module natif (chapitres 1, 11, 12) se comporte différemment de ce qui est attendu, plutôt que de se fier à un tutoriel tiers potentiellement obsolète.
- **Express.js** — expressjs.com : guide officiel, référence complète de l'API. Utile pour vérifier le comportement exact d'un middleware natif ou d'une méthode `res.*` peu courante (chapitres 13-14).
- **npm** — docs.npmjs.com : référence des commandes (`npm ci`, `npm audit`, workspaces) et des champs de `package.json`, notamment pour clarifier `dependencies` vs `devDependencies` (chapitres 3-4).

## Bases de données et ORM

- **PostgreSQL** — postgresql.org/docs : référence complète du SQL, des types et des index PostgreSQL, à consulter pour toute requête avancée non couverte par les chapitres 31-32.
- **MongoDB** — mongodb.com/docs : référence des opérateurs de requête et d'agrégation MongoDB, utile au-delà des opérations CRUD de base du chapitre 33.
- **Prisma** — prisma.io/docs : documentation particulièrement soignée, avec un guide interactif — la meilleure ressource pour approfondir les relations, migrations et transactions au-delà du chapitre 34.
- **Sequelize** — sequelize.org/docs : référence des associations et hooks Sequelize, en complément des transactions et modèles vus au chapitre 35.
- **Mongoose** — mongoosejs.com/docs : détail des options de schéma (validateurs, middlewares Mongoose, `populate` avancé) au-delà du chapitre 36.

## Sécurité

- **OWASP Top 10** — owasp.org/www-project-top-ten : référence des vulnérabilités web les plus critiques, essentielle pour tout développeur backend — à parcourir intégralement une fois le chapitre 25 terminé, pour situer les sujets couverts (injection, IDOR) dans un panorama plus large.
- **Helmet** — helmetjs.github.io : détail de chaque en-tête de sécurité configuré automatiquement par Helmet, pour ajuster finement la configuration par défaut du chapitre 25 selon les besoins réels d'un projet.
- **jsonwebtoken** — github.com/auth0/node-jsonwebtoken : référence complète des options de `sign`/`verify` (algorithmes, `expiresIn`, `audience`), au-delà de l'usage de base du chapitre 23.

## Tests

- **Jest** — jestjs.io/docs : référence des matchers d'assertion et des mocks Jest, pour aller au-delà des tests unitaires de base du chapitre 29.
- **Supertest** — github.com/ladjs/supertest : référence de l'API de requêtes chaînées utilisée pour les tests d'intégration du chapitre 30.

## Documentation d'API

- **OpenAPI Specification** — spec.openapis.org : spécification formelle complète du format utilisé par Swagger, utile pour documenter des cas avancés (schémas polymorphes, sécurité multiple) non couverts au chapitre 28.
- **Swagger UI** — swagger.io/tools/swagger-ui : options de personnalisation de l'interface interactive générée à partir de la documentation OpenAPI du chapitre 28.

## Conteneurisation et déploiement

- **Docker** — docs.docker.com : référence complète des instructions Dockerfile et des commandes CLI, au-delà des bases des chapitres 37 et 47.
- **Docker Compose** — docs.docker.com/compose : référence des options `docker-compose.yml` (réseaux, dépendances, healthchecks) utilisées dans les chapitres 38 et 47.
- **Railway** — docs.railway.app : plateforme de déploiement simplifié avec bases de données managées, une option concrète pour héberger un projet comme MediAPI sans gérer soi-même un serveur.

## Performance et supervision

- **PM2** — pm2.keymetrics.io/docs : gestionnaire de processus Node.js en production (redémarrage automatique, mode cluster, monitoring), une alternative/complément à Docker pour la partie 9 selon le contexte d'hébergement.
- **Winston** — github.com/winstonjs/winston : référence des transports et formats de journalisation avancés, en complément des bases de journalisation du chapitre 20.

## Écosystème plus large (pour approfondir après ce manuel)

- **TypeScript avec Node.js** — typescriptlang.org/docs : pour un typage statique complet, en complément du JavaScript pur de ce manuel — la suite logique naturelle une fois l'architecture en couches (partie 3) bien maîtrisée.
- **NestJS** — nestjs.com : framework Node.js plus structuré qu'Express, inspiré d'Angular, pour des projets à grande échelle — pertinent quand une équipe grandit et a besoin de conventions imposées plutôt que choisies manuellement comme dans ce manuel.
- **GraphQL** — graphql.org : alternative à REST pour certains besoins d'API, notamment quand le client doit contrôler précisément les champs retournés — à envisager si le sur-fetching devient un problème réel de performance mesuré, pas par principe.

## Communautés et veille

- **Node.js Weekly** (newsletter) — nodeweekly.com : résumé hebdomadaire de l'actualité et des nouvelles librairies de l'écosystème Node.js, utile pour rester à jour sans veille active quotidienne.
- **Stack Overflow** (tags `node.js`, `express`, `prisma`) : premier réflexe face à un message d'erreur précis déjà rencontré par d'autres — souvent plus rapide que l'annexe B pour un cas très spécifique.
- **r/node** (Reddit) : discussions communautaires sur les choix d'architecture et les nouveautés de l'écosystème, utile pour prendre du recul au-delà de la documentation strictement technique.

<div class="encadre astuce">
<span class="encadre-titre">💡 Une dernière recommandation</span>
Comme pour les manuels React et Java de ce même auteur, la meilleure ressource reste la pratique sur de vrais projets : reprends MediAPI (chapitres 41-47) et fais-le évoluer (nouvelle ressource, notifications temps réel via Socket.io, migration progressive vers TypeScript) — c'est en confrontant ces notions à des problèmes concrets, corrigés et améliorés au fil du temps, que la maîtrise réelle du développement backend s'installe.
</div>

---

*Fin du manuel.*
