<div class="chapitre-titre-num">ANNEXE C</div>

# Glossaire

**API REST** — Interface applicative suivant les principes du transfert d'état représentationnel, exposant des ressources via des méthodes HTTP standard. Chapitre 13.

**Access token** — Jeton d'authentification à durée de vie courte, transmis à chaque requête API. Chapitre 23.

**bcrypt** — Algorithme de hachage volontairement lent, spécifiquement conçu pour les mots de passe. Chapitre 22.

**Callback** — Fonction passée en argument à une autre, rappelée plus tard, typiquement à la fin d'une opération asynchrone. Chapitre 8.

**CommonJS** — Système de modules historique de Node.js (`require`/`module.exports`). Chapitre 6.

**CORS** — *Cross-Origin Resource Sharing*, mécanisme du navigateur autorisant des requêtes entre origines différentes. Chapitre 25.

**Docker** — Plateforme de conteneurisation empaquetant une application avec son environnement d'exécution. Chapitre 37.

**Docker Compose** — Outil orchestrant plusieurs conteneurs liés via un fichier YAML unique. Chapitre 38.

**Event loop** — Boucle d'événements gérant les opérations non bloquantes sur le thread unique de Node.js. Chapitre 1.

**ES Modules** — Système de modules standardisé du langage JavaScript (`import`/`export`). Chapitre 6.

**Helmet** — Middleware Express configurant automatiquement des en-têtes HTTP de sécurité. Chapitre 25.

**JWT** — *JSON Web Token*, jeton encodé (non chiffré) transportant des informations d'authentification signées. Chapitre 23.

**Middleware** — Fonction Express avec accès à `req`, `res` et `next()`, formant une chaîne de traitement d'une requête. Chapitre 14.

**MongoDB** — Base de données NoSQL orientée documents. Chapitre 33.

**Mongoose** — ODM imposant un schéma structuré et validé pour MongoDB. Chapitre 36.

**MVC** — Modèle-Vue-Contrôleur, pattern de répartition des responsabilités (sans "vue" classique dans une API REST). Chapitre 16.

**Node.js** — Environnement d'exécution JavaScript côté serveur, basé sur le moteur V8. Chapitre 1.

**npm** — *Node Package Manager*, registre et outil de gestion de paquets de Node.js. Chapitre 3.

**ORM/ODM** — *Object-Relational/Document Mapping*, outil automatisant la correspondance entre objets et données persistées. Chapitres 34-36.

**Pool de connexions** — Ensemble de connexions de base de données réutilisées entre requêtes, évitant d'en ouvrir une nouvelle à chaque fois. Chapitre 31.

**Prisma** — ORM moderne générant un client typé à partir d'un schéma déclaratif. Chapitre 34.

**Promise** — Objet représentant une valeur disponible plus tard (ou une erreur), dans l'un de trois états (pending, fulfilled, rejected). Chapitre 9.

**RBAC** — *Role-Based Access Control*, contrôle d'accès basé sur les rôles utilisateur. Chapitre 24.

**Refresh token** — Jeton longue durée, vérifié en base de données et révocable, permettant d'obtenir un nouvel access token. Chapitre 23.

**Repository** — Couche encapsulant l'accès aux données, isolant le service de la technologie de stockage précise. Chapitre 17.

**Sequelize** — ORM orienté classes pour bases de données relationnelles. Chapitre 35.

**Service** — Couche portant la logique métier pure, indépendante de HTTP et de la persistance directe. Chapitre 15.

**Stream** — Mécanisme de traitement de données par morceaux, sans tout charger en mémoire. Chapitre 11.

**Swagger/OpenAPI** — Spécification standard de documentation d'API, explorable interactivement via Swagger UI. Chapitre 28.

**Transaction** — Ensemble d'opérations devant réussir ou échouer intégralement ensemble (commit/rollback). Chapitres 31, 34.

**V8** — Moteur JavaScript de Google (aussi utilisé dans Chrome), utilisant la compilation JIT. Chapitre 1.

**Zod** — Librairie de validation de schéma déclarative, avec typage TypeScript automatique. Chapitre 18.
