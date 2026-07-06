<div class="chapitre-titre-num">CHAPITRE 5</div>

# Architecture d'un projet professionnel

## Objectifs pédagogiques

Adopter dès le départ une organisation de dossiers cohérente, reprise et approfondie tout au long de ce manuel (architecture MVC au chapitre 16, architecture en couches au chapitre 17).

## 5.1 Le problème d'un projet sans organisation

```
mon-api/
├── index.js          # 2000 lignes : routes, logique métier, connexion DB, tout mélangé
├── package.json
└── node_modules/
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le piège du "tout dans un seul fichier"</span>
Un projet qui grandit sans organisation devient rapidement impossible à naviguer, à tester isolément, ou à faire évoluer sans risquer de casser une fonctionnalité sans rapport. Cette structure fonctionne pour un script de démonstration de 50 lignes, jamais pour une API destinée à durer et évoluer.
</div>

## 5.2 Structure de dossiers recommandée

```
mon-api/
├── src/
│   ├── config/           # configuration (base de données, variables d'environnement)
│   ├── controllers/      # reçoivent la requête HTTP, appellent les services (chapitre 15)
│   ├── services/         # logique métier pure, indépendante du HTTP
│   ├── repositories/      # accès aux données (équivalent DAO, chapitre 17)
│   ├── models/            # schémas/modèles de données (Prisma, Mongoose...)
│   ├── routes/            # définition des routes Express (chapitre 13)
│   ├── middlewares/        # fonctions middleware (auth, validation, erreurs, chapitre 14)
│   ├── validators/         # schémas de validation (chapitre 18)
│   ├── utils/               # fonctions utilitaires réutilisables
│   ├── errors/               # classes d'erreurs personnalisées (chapitre 19)
│   └── app.js                # configuration de l'application Express (middlewares globaux, routes)
├── tests/
│   ├── unit/                  # tests unitaires (chapitre 29)
│   └── integration/           # tests d'intégration (chapitre 30)
├── prisma/                     # schéma et migrations Prisma (chapitre 34)
├── .env                        # variables d'environnement (jamais commité)
├── .env.example                # modèle documentant les variables attendues (commité, sans valeurs réelles)
├── .gitignore
├── package.json
└── server.js                   # point d'entrée : démarre le serveur HTTP (importe app.js)
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi séparer app.js et server.js</span>
`app.js` configure l'application Express (middlewares, routes) **sans jamais démarrer de serveur réseau réel** ; `server.js` importe cette configuration et appelle `.listen()`. Cette séparation permet de **tester** l'application (chapitre 30, avec Supertest) sans avoir à ouvrir un vrai port réseau — Supertest peut interagir directement avec l'objet `app` exporté, sans passer par `server.listen()`.
</div>

## 5.3 Le flux d'une requête à travers cette architecture

```{.uml}
Requete HTTP
      │
      ▼
  Route (routes/)          ── associe une URL + méthode HTTP à un contrôleur
      │
      ▼
  Middleware(s)             ── authentification, validation (chapitres 14, 18, 23)
      │
      ▼
  Contrôleur (controllers/) ── extrait req.body/req.params, appelle le service
      │
      ▼
  Service (services/)       ── logique métier pure (règles, calculs, orchestration)
      │
      ▼
  Repository (repositories/)── accès aux données (requêtes Prisma/Mongoose...)
      │
      ▼
  Base de données
      │
      ▼ (le résultat remonte dans l'autre sens)
  Contrôleur renvoie la réponse HTTP (res.json(...))
```

Ce flux, introduit ici en aperçu, est détaillé et justifié en profondeur aux chapitres 15 à 17.

## 5.4 Fichier .env.example : documenter sans exposer de secrets

```
# .env.example (commité dans Git — sert de modèle, sans vraies valeurs)
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mabase
JWT_SECRET=change-moi
SMTP_HOST=smtp.example.com
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi ce fichier est précieux en équipe</span>
`.env` (contenant les vraies valeurs, jamais commité — chapitre 12) diffère de `.env.example` (commité, documentant **quelles variables** sont attendues, sans leurs valeurs réelles). Un nouveau développeur rejoignant le projet copie simplement `.env.example` vers `.env` et remplit les vraies valeurs, sans avoir à deviner quelles variables sont nécessaires.
</div>

## 5.5 Point d'entrée minimal (aperçu, détaillé au chapitre 13)

```js
// src/app.js — configuration de l'application, SANS démarrer de serveur
const express = require("express");
const app = express();

app.use(express.json());
// ... middlewares et routes ajoutés ici (chapitres suivants) ...

module.exports = app;
```

```js
// server.js — point d'entrée réel, démarre le serveur
const app = require("./src/app");
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
```

## 5.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Mélanger logique métier et code HTTP dans les contrôleurs</span>
```js
// ❌ Le contrôleur contient directement la logique métier ET l'accès aux données
app.post("/utilisateurs", async (req, res) => {
  const utilisateurExistant = await db.query("SELECT * FROM utilisateurs WHERE email = $1", [req.body.email]);
  if (utilisateurExistant.rows.length > 0) {
    return res.status(409).json({ message: "Email déjà utilisé" });
  }
  // ... 30 lignes de plus mélangeant validation, hash de mot de passe, insertion SQL ...
});
```
Cette approche fonctionne sur un petit script, mais devient vite intestable et difficile à faire évoluer. Les chapitres 15 à 17 montrent comment répartir cette responsabilité entre contrôleur (HTTP), service (règles métier) et repository (accès aux données).
</div>

## 5.7 Résumé du chapitre

- Une architecture organisée (`controllers`, `services`, `repositories`, `routes`, `middlewares`) évite la dégradation d'un projet qui grandit.
- `app.js` (configuration Express) et `server.js` (démarrage réseau) sont séparés pour faciliter les tests.
- `.env.example` documente les variables d'environnement attendues sans exposer de valeurs réelles.
- Le flux requête → route → middleware → contrôleur → service → repository → base de données structure toute la suite du manuel.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 5.1</span>

Crée la structure de dossiers complète d'un nouveau projet `mon-api` (comme en section 5.2), avec un `app.js` minimal exportant une instance Express, et un `server.js` qui l'importe et démarre le serveur sur le port défini par la variable d'environnement `PORT` (ou 3000 par défaut).
</div>

**Corrigé :** Voir le code des sections 5.2 et 5.5 — la structure de dossiers et les deux fichiers `app.js`/`server.js` constituent exactement la réponse attendue.

*Chapitre suivant : les modules CommonJS et ES Modules, les deux systèmes de modularisation du code en Node.js.*
