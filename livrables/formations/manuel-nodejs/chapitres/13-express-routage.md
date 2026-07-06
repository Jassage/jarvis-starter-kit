<div class="chapitre-titre-num">CHAPITRE 13</div>

# Introduction à Express.js et routage

## Objectifs pédagogiques

Comprendre le rôle d'Express.js, créer une première API, et maîtriser le routage (paramètres, query strings, groupement de routes).

## 13.1 Pourquoi Express.js plutôt que le module http natif

```js
// Avec le module "http" natif : très verbeux pour la moindre logique de routage
const http = require("http");

const serveur = http.createServer((req, res) => {
  if (req.url === "/utilisateurs" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify([{ id: 1, nom: "Jaslin" }]));
  } else if (req.url === "/produits" && req.method === "GET") {
    // ... répéter cette logique pour CHAQUE route ...
  } else {
    res.writeHead(404);
    res.end("Non trouvé");
  }
});

serveur.listen(3000);
```

```js
// Avec Express.js : déclaratif, lisible, extensible
const express = require("express");
const app = express();

app.get("/utilisateurs", (req, res) => {
  res.json([{ id: 1, nom: "Jaslin" }]);
});

app.listen(3000);
```

**Express.js** est un framework web minimaliste construit au-dessus du module `http` natif de Node.js, ajoutant un système de routage, des middlewares (chapitre 14), et des méthodes pratiques (`res.json()`, `res.status()`) qui simplifient considérablement l'écriture d'une API.

## 13.2 Premier serveur Express

```
$ npm install express
```

```js
const express = require("express");
const app = express();

app.use(express.json()); // middleware permettant de lire un corps de requête JSON (chapitre 14)

app.get("/", (req, res) => {
  res.send("API en ligne");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
```

## 13.3 Les méthodes HTTP et leur usage RESTful

| Méthode | Usage conventionnel | Exemple |
|---|---|---|
| `GET` | Lire une ressource, sans effet de bord | `GET /utilisateurs`, `GET /utilisateurs/42` |
| `POST` | Créer une nouvelle ressource | `POST /utilisateurs` |
| `PUT` | Remplacer entièrement une ressource existante | `PUT /utilisateurs/42` |
| `PATCH` | Modifier partiellement une ressource | `PATCH /utilisateurs/42` |
| `DELETE` | Supprimer une ressource | `DELETE /utilisateurs/42` |

```js
app.get("/utilisateurs", listerUtilisateurs);
app.post("/utilisateurs", creerUtilisateur);
app.get("/utilisateurs/:id", obtenirUtilisateur);
app.put("/utilisateurs/:id", remplacerUtilisateur);
app.patch("/utilisateurs/:id", modifierUtilisateur);
app.delete("/utilisateurs/:id", supprimerUtilisateur);
```

## 13.4 Paramètres de route

```js
app.get("/utilisateurs/:id", (req, res) => {
  const { id } = req.params; // req.params contient TOUS les segments dynamiques (":...") de l'URL
  res.json({ message: `Utilisateur demandé : ${id}` });
});

// Plusieurs paramètres
app.get("/utilisateurs/:utilisateurId/commandes/:commandeId", (req, res) => {
  const { utilisateurId, commandeId } = req.params;
  res.json({ utilisateurId, commandeId });
});
```

## 13.5 Query strings (paramètres de requête)

```js
// GET /produits?categorie=alimentaire&prixMax=300
app.get("/produits", (req, res) => {
  const { categorie, prixMax } = req.query; // req.query contient les paramètres APRÈS le "?"
  res.json({ categorie, prixMax });
});
```

<div class="encadre astuce">
<span class="encadre-titre">💡 req.params vs req.query : quand utiliser lequel</span>
`req.params` identifie **une ressource précise** dans le chemin de l'URL (`/utilisateurs/:id` — l'id fait partie de l'identité de la ressource). `req.query` sert aux options de la requête (filtres, tri, pagination — chapitre 21) qui ne changent pas la nature de la ressource demandée, seulement la façon de la présenter.
</div>

## 13.6 Router : organiser les routes par domaine

```js
// src/routes/utilisateurs.routes.js
const express = require("express");
const router = express.Router();
const utilisateursController = require("../controllers/utilisateurs.controller");

router.get("/", utilisateursController.lister);
router.post("/", utilisateursController.creer);
router.get("/:id", utilisateursController.obtenir);
router.put("/:id", utilisateursController.modifier);
router.delete("/:id", utilisateursController.supprimer);

module.exports = router;
```

```js
// src/app.js
const express = require("express");
const app = express();

app.use(express.json());

const utilisateursRoutes = require("./routes/utilisateurs.routes");
const produitsRoutes = require("./routes/produits.routes");

app.use("/api/utilisateurs", utilisateursRoutes); // toutes les routes de ce router préfixées par /api/utilisateurs
app.use("/api/produits", produitsRoutes);

module.exports = app;
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un Router par ressource, jamais toutes les routes dans app.js</span>
Rappel de l'architecture du chapitre 5 : regrouper les routes par domaine métier dans des fichiers séparés (`utilisateurs.routes.js`, `produits.routes.js`) évite un `app.js` de plusieurs centaines de lignes, et rend chaque domaine facile à localiser et à faire évoluer indépendamment.
</div>

## 13.7 Réponses JSON et codes de statut HTTP

```js
app.get("/utilisateurs/:id", async (req, res) => {
  const utilisateur = await UtilisateurService.trouverParId(req.params.id);

  if (!utilisateur) {
    return res.status(404).json({ message: "Utilisateur introuvable" });
  }

  res.status(200).json(utilisateur);
});

app.post("/utilisateurs", async (req, res) => {
  const nouvelUtilisateur = await UtilisateurService.creer(req.body);
  res.status(201).json(nouvelUtilisateur); // 201 Created, pas 200, pour une création réussie
});
```

| Code | Signification | Cas d'usage typique |
|---|---|---|
| 200 | OK | Lecture ou modification réussie |
| 201 | Created | Création réussie (réponse à un POST) |
| 204 | No Content | Suppression réussie, aucun contenu à renvoyer |
| 400 | Bad Request | Données de la requête invalides (chapitre 18) |
| 401 | Unauthorized | Authentification manquante ou invalide (chapitre 23) |
| 403 | Forbidden | Authentifié, mais sans les droits nécessaires (chapitre 24) |
| 404 | Not Found | Ressource inexistante |
| 500 | Internal Server Error | Erreur inattendue côté serveur (chapitre 19) |

## 13.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier express.json() : req.body reste undefined</span>
```js
const app = express();
// ❌ app.use(express.json()); oublié !

app.post("/utilisateurs", (req, res) => {
  console.log(req.body); // undefined, même si le client a bien envoyé un JSON !
});
```
Sans le middleware `express.json()`, Express ne parse **jamais** automatiquement le corps JSON d'une requête — `req.body` reste `undefined`, une des toutes premières confusions rencontrées par les débutants sur Express.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Toujours renvoyer une réponse, sinon la requête reste "en attente" indéfiniment</span>
```js
app.get("/utilisateurs/:id", async (req, res) => {
  const utilisateur = await UtilisateurService.trouverParId(req.params.id);
  if (!utilisateur) {
    console.log("Utilisateur introuvable"); // ❌ pas de res.status(404)... : le client attend indéfiniment !
  }
  res.json(utilisateur); // si utilisateur est undefined, envoie "null" au client sans code d'erreur pertinent
});
```
</div>

## 13.9 Résumé du chapitre

- Express.js simplifie considérablement le routage et la gestion des requêtes par rapport au module `http` natif.
- `req.params` identifie une ressource précise dans l'URL ; `req.query` transporte des options (filtres, tri, pagination).
- `express.Router()` regroupe les routes par domaine métier, montées via `app.use("/prefixe", router)`.
- Les codes de statut HTTP (200, 201, 400, 401, 403, 404, 500) communiquent précisément le résultat d'une requête au client.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 13.1</span>

Crée un Router Express pour une ressource `produits` avec les 5 routes CRUD standard (lister, créer, obtenir un, modifier, supprimer), monté sous le préfixe `/api/produits`.
</div>

**Corrigé :**
```js
// routes/produits.routes.js
const router = require("express").Router();

router.get("/", (req, res) => res.json([]));
router.post("/", (req, res) => res.status(201).json(req.body));
router.get("/:id", (req, res) => res.json({ id: req.params.id }));
router.put("/:id", (req, res) => res.json({ id: req.params.id, ...req.body }));
router.delete("/:id", (req, res) => res.status(204).send());

module.exports = router;
```
```js
app.use("/api/produits", require("./routes/produits.routes"));
```

*Chapitre suivant : les middlewares, le mécanisme central qui rend Express aussi extensible.*
