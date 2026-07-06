<div class="chapitre-titre-num">CHAPITRE 25</div>

# Sécurité (Helmet, CORS, Rate Limiting, injections)

## Objectifs pédagogiques

Durcir une API Express contre les vulnérabilités les plus courantes : en-têtes HTTP manquants, requêtes cross-origin mal configurées, abus par volume de requêtes, et injections (SQL/NoSQL).

## 25.1 Helmet : sécuriser les en-têtes HTTP par défaut

```
$ npm install helmet
```

```js
const helmet = require("helmet");
app.use(helmet());
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce que Helmet fait concrètement</span>
Helmet configure automatiquement une douzaine d'en-têtes HTTP de sécurité en une seule ligne : désactive `X-Powered-By: Express` (évite de révéler la technologie utilisée aux attaquants), force certaines protections contre le détournement de clic (*clickjacking*, via `X-Frame-Options`), empêche le navigateur de deviner incorrectement un type de contenu (`X-Content-Type-Options`), et bien d'autres protections dont la configuration manuelle serait fastidieuse et source d'oublis.
</div>

## 25.2 CORS : autoriser précisément les origines nécessaires

```
$ npm install cors
```

```js
// ❌ Configuration par défaut : autorise TOUTES les origines, souvent trop permissif en production
app.use(cors());
```

```js
// ✅ Configuration explicite : n'autorise QUE les origines de confiance
const cors = require("cors");

app.use(cors({
  origin: ["https://monapp.com", "https://admin.monapp.com"],
  credentials: true, // nécessaire si des cookies (refresh token httpOnly, chapitre 23) sont échangés
}));
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ CORS protège le NAVIGATEUR, pas ton API directement</span>
CORS (*Cross-Origin Resource Sharing*) est un mécanisme appliqué par le **navigateur** de l'utilisateur, empêchant un site web malveillant d'effectuer des requêtes vers ton API au nom de l'utilisateur à son insu. Un outil comme curl ou Postman n'est **jamais** bloqué par CORS (ce n'est pas un navigateur) — CORS n'est donc **pas** une protection contre un attaquant appelant directement ton API, seulement contre un scénario spécifique d'attaque via navigateur (comme le CSRF, en partie).
</div>

## 25.3 Rate Limiting : limiter le nombre de requêtes

```
$ npm install express-rate-limit
```

```js
const rateLimit = require("express-rate-limit");

const limiteurGlobal = rateLimit({
  windowMs: 15 * 60 * 1000, // fenêtre de 15 minutes
  max: 100,                  // 100 requêtes maximum par IP dans cette fenêtre
  message: { message: "Trop de requêtes, réessaie plus tard" },
});

app.use(limiteurGlobal); // appliqué à TOUTE l'API
```

```js
// Un limiteur PLUS STRICT spécifiquement sur les routes sensibles (login, inscription)
const limiteurAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // seulement 5 tentatives de connexion par IP toutes les 15 minutes
  message: { message: "Trop de tentatives de connexion, réessaie plus tard" },
});

router.post("/auth/login", limiteurAuth, authController.connecter);
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi une limite plus stricte sur les routes d'authentification</span>
Les routes de connexion sont la cible privilégiée des attaques par force brute (essayer de nombreux mots de passe pour un même compte). Une limite de fréquence spécifique et plus restrictive sur ces routes précises réduit considérablement l'efficacité de ce type d'attaque, sans pénaliser l'usage normal du reste de l'API.
</div>

## 25.4 Prévention des injections SQL (rappel appliqué à Node.js)

```js
// ❌ DANGEREUX : concaténation directe de l'entrée utilisateur dans la requête SQL
const resultat = await db.query(`SELECT * FROM utilisateurs WHERE email = '${req.body.email}'`);
// Un email comme "x' OR '1'='1" modifierait le SENS de la requête (rappel détaillé dans le manuel Java de ce même auteur)
```

```js
// ✅ Requête PARAMÉTRÉE : la valeur est envoyée séparément, jamais interprétée comme du SQL
const resultat = await db.query("SELECT * FROM utilisateurs WHERE email = $1", [req.body.email]);
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Les ORM (Prisma, Sequelize) paramètrent automatiquement leurs requêtes</span>
`prisma.utilisateur.findUnique({ where: { email } })` (chapitre 34) et les méthodes équivalentes de Sequelize/Mongoose génèrent en interne des requêtes **paramétrées**, protégeant automatiquement contre l'injection SQL — un avantage de sécurité non négligeable par rapport à des requêtes SQL écrites manuellement par concaténation.
</div>

## 25.5 Prévention des injections NoSQL (spécifique à MongoDB)

```js
// ❌ DANGEREUX avec MongoDB/Mongoose : un objet peut contourner une comparaison stricte attendue
// Si req.body.motDePasse = { "$gt": "" }, cette "requête" devient toujours vraie !
const utilisateur = await Utilisateur.findOne({ email: req.body.email, motDePasse: req.body.motDePasse });
```

```
$ npm install express-mongo-sanitize
```

```js
const mongoSanitize = require("express-mongo-sanitize");
app.use(mongoSanitize()); // retire automatiquement toute clé commençant par "$" ou contenant "." des entrées
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ L'injection NoSQL exploite les opérateurs MongoDB ($gt, $ne, $where...)</span>
Contrairement à l'injection SQL (qui exploite une syntaxe textuelle), l'injection NoSQL sur MongoDB exploite le fait que les requêtes sont des **objets JavaScript** — un attaquant peut injecter des opérateurs MongoDB (`$gt`, `$ne`, `$where`) directement dans un champ JSON si celui-ci n'est pas validé (chapitre 18) et sanitisé avant d'être utilisé dans une requête.
</div>

## 25.6 Content Security Policy et XSS côté API

<div class="encadre astuce">
<span class="encadre-titre">💡 Le XSS est surtout un sujet frontend, mais l'API a un rôle à jouer</span>
Le manuel React de ce même auteur détaille en profondeur la protection XSS côté frontend (React échappe automatiquement le JSX). Côté API, le rôle principal consiste à ne **jamais** renvoyer du contenu utilisateur non filtré destiné à être injecté comme HTML brut ailleurs, et à s'assurer que les en-têtes de réponse (`Content-Type: application/json`) sont corrects — Helmet (section 25.1) configure déjà une partie de ces protections par défaut.
</div>

## 25.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Désactiver CORS ou Helmet "temporairement" pour déboguer, puis oublier de les réactiver</span>
Une pratique risquée fréquente : commenter `app.use(helmet())` ou configurer `cors({ origin: "*" })` pour résoudre rapidement un problème de développement, puis oublier de restaurer une configuration stricte avant le déploiement en production.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un rate limiting uniquement en mémoire ne fonctionne pas sur plusieurs instances</span>
La configuration `express-rate-limit` par défaut (section 25.3) stocke les compteurs **en mémoire locale du processus** — sur un déploiement avec plusieurs instances (chapitre 39, Docker Compose, load balancer), chaque instance aurait son **propre** compteur indépendant, rendant la limite globale réellement bien plus élevée que prévu. Une solution partagée (Redis, via `rate-limit-redis`) est nécessaire pour un rate limiting cohérent à travers plusieurs instances.
</div>

## 25.8 Résumé du chapitre

- **Helmet** configure automatiquement une série d'en-têtes HTTP de sécurité, en une seule ligne.
- **CORS** protège contre un scénario d'attaque spécifique via navigateur, pas contre un appel direct à l'API — toujours restreindre aux origines de confiance en production.
- **Rate Limiting** limite les abus par volume ; une limite plus stricte sur les routes d'authentification réduit l'efficacité du brute-force.
- Les requêtes **paramétrées** (ou un ORM) préviennent l'injection SQL ; `express-mongo-sanitize` prévient l'injection NoSQL sur MongoDB.
- Le rate limiting en mémoire ne fonctionne pas correctement sur plusieurs instances sans un stockage partagé (Redis).

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 25.1</span>

Configure un rate limiter spécifique sur la route `POST /auth/login`, limitant à 5 tentatives par IP toutes les 10 minutes, avec un message d'erreur personnalisé.
</div>

**Corrigé :**
```js
const limiteurLogin = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { message: "Trop de tentatives de connexion. Réessaie dans 10 minutes." },
});

router.post("/auth/login", limiteurLogin, authController.connecter);
```

*Ceci clôt la Partie 5 (sécurité et authentification). Chapitre suivant : le téléversement de fichiers avec Multer, première étape de la Partie 6 (fonctionnalités avancées).*
