<div class="chapitre-titre-num">CHAPITRE 20</div>

# Journalisation (Winston/Morgan)

## Objectifs pédagogiques

Comprendre pourquoi `console.log` est insuffisant en production, et mettre en place une vraie stratégie de journalisation avec Morgan (requêtes HTTP) et Winston (logs applicatifs structurés).

## 20.1 Pourquoi console.log ne suffit pas en production

<div class="encadre attention">
<span class="encadre-titre">⚠️ Les limites de console.log en environnement de production</span>
`console.log` écrit dans la sortie standard, sans niveau de gravité (info, avertissement, erreur), sans horodatage structuré, sans possibilité de filtrer ou de rediriger vers un fichier/service externe, et sans distinction entre environnements. Sur un serveur de production traitant des milliers de requêtes, cela devient vite inutilisable pour diagnostiquer un problème réel.
</div>

## 20.2 Morgan : journaliser les requêtes HTTP

```
$ npm install morgan
```

```js
const morgan = require("morgan");

app.use(morgan("dev")); // format concis et coloré, adapté au développement
// app.use(morgan("combined")); // format détaillé de type Apache, adapté à la production
```

```
GET /api/utilisateurs 200 15.234 ms - 348
POST /api/utilisateurs 201 45.102 ms - 156
GET /api/produits/999 404 3.012 ms - 42
```

Morgan journalise **automatiquement** chaque requête HTTP traitée (méthode, URL, code de statut, temps de réponse), sans avoir à l'écrire manuellement dans chaque contrôleur.

## 20.3 Winston : logs applicatifs structurés

```
$ npm install winston
```

```js
// src/config/logger.js
const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // format JSON structuré, exploitable par des outils d'analyse de logs
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/erreurs.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combine.log" }),
  ],
});

module.exports = logger;
```

```js
const logger = require("./config/logger");

logger.info("Serveur démarré", { port: 3000 });
logger.warn("Tentative de connexion avec un email inexistant", { email: "test@test.com" });
logger.error("Échec de connexion à la base de données", { erreur: err.message });
```

```json
{"level":"info","message":"Serveur démarré","port":3000,"timestamp":"2026-07-05T10:00:00.000Z"}
{"level":"error","message":"Échec de connexion à la base de données","erreur":"ECONNREFUSED","timestamp":"2026-07-05T10:00:05.000Z"}
```

## 20.4 Les niveaux de log

| Niveau | Usage |
|---|---|
| `error` | Une erreur nécessitant une attention (échec de connexion BDD, exception inattendue) |
| `warn` | Une situation anormale mais non bloquante (tentative de connexion échouée, dépréciation) |
| `info` | Événements normaux notables (démarrage du serveur, création d'un utilisateur) |
| `debug` | Détails utiles seulement en développement, jamais activés en production par défaut |

<div class="encadre astuce">
<span class="encadre-titre">💡 Adapter le niveau de log selon l'environnement</span>
En développement, un niveau `debug` (tout afficher) aide à comprendre ce qui se passe. En production, un niveau `info` (ou `warn`) évite de saturer les logs avec des détails inutiles, tout en gardant une trace des événements réellement significatifs.
</div>

## 20.5 Journaliser les erreurs dans le middleware centralisé (lien avec le chapitre 19)

```js
const logger = require("../config/logger");

function gestionnaireErreurs(err, req, res, next) {
  logger.error(err.message, {
    stack: err.stack,
    url: req.originalUrl,
    methode: req.method,
    statut: err.statut || 500,
  });

  res.status(err.statut || 500).json({
    message: err.statut ? err.message : "Une erreur interne est survenue",
  });
}
```

## 20.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Journaliser des données sensibles</span>
```js
logger.info("Connexion réussie", { email: utilisateur.email, motDePasse: req.body.motDePasse }); // ❌ JAMAIS !
```
Ne jamais journaliser un mot de passe (même échoué), un token JWT complet, un numéro de carte bancaire, ou toute autre donnée sensible — les fichiers de logs sont souvent moins protégés que la base de données elle-même, et constituent une cible d'exfiltration fréquente en cas de compromission.
</div>

## 20.7 Résumé du chapitre

- `console.log` est insuffisant en production : pas de niveaux de gravité, pas de structure exploitable, pas de redirection possible.
- **Morgan** journalise automatiquement chaque requête HTTP (méthode, statut, durée) sans code manuel dans les contrôleurs.
- **Winston** structure les logs applicatifs (JSON, niveaux, fichiers séparés par gravité), adaptés à l'analyse et à la supervision en production.
- Ne jamais journaliser de données sensibles (mots de passe, tokens complets, données bancaires).

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 20.1</span>

Configure Winston avec deux transports : la console (niveau `debug` en développement) et un fichier `logs/erreurs.log` (niveau `error` uniquement), puis journalise un message d'erreur de test.
</div>

**Corrigé :** Voir la configuration de la section 20.3 (déjà exactement structurée ainsi) ; `logger.error("Message de test")` écrit à la fois dans la console et dans `logs/erreurs.log`.

*Chapitre suivant : pagination, recherche, tri et filtrage — les fonctionnalités attendues de toute API listant des ressources.*
