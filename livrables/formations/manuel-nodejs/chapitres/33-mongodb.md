<div class="chapitre-titre-num">CHAPITRE 33</div>

# Connexion à MongoDB

## Objectifs pédagogiques

Se connecter à MongoDB avec le driver natif, comprendre le modèle de données orienté documents, et savoir quand ce modèle convient mieux qu'une base relationnelle.

## 33.1 Rappel : relationnel vs NoSQL orienté documents

Contrairement à PostgreSQL/MySQL (chapitres 31-32), MongoDB stocke des **documents** (structures proches du JSON), regroupés en **collections** (l'équivalent approximatif d'une table), sans schéma rigide imposé par la base elle-même.

```json
// Un document MongoDB typique
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "nom": "Jaslin",
  "email": "jaslin@mail.com",
  "adresse": {
    "ville": "Pignon",
    "pays": "Haïti"
  },
  "commandesRecentes": [
    { "produit": "Riz", "quantite": 2 },
    { "produit": "Savon", "quantite": 1 }
  ]
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 L'avantage principal : des données imbriquées naturellement</span>
Contrairement au modèle relationnel qui nécessiterait des tables séparées (`commandes`, `lignes_commande`) reliées par des clés étrangères et des jointures, MongoDB permet de stocker des données **imbriquées** directement dans un seul document — pratique pour des structures naturellement hiérarchiques, lues ensemble la plupart du temps.
</div>

## 33.2 Installer le driver MongoDB

```
$ npm install mongodb
```

```js
// src/config/db.js
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function connecter() {
  await client.connect();
  db = client.db(process.env.MONGODB_DB_NAME);
  console.log("Connecté à MongoDB");
  return db;
}

function obtenirDb() {
  if (!db) throw new Error("La base de données n'est pas encore connectée");
  return db;
}

module.exports = { connecter, obtenirDb };
```

```js
// server.js
const { connecter } = require("./src/config/db");

async function demarrer() {
  await connecter(); // se connecter AVANT de démarrer le serveur HTTP
  const app = require("./src/app");
  app.listen(process.env.PORT, () => console.log("Serveur démarré"));
}

demarrer();
```

## 33.3 Opérations CRUD avec le driver natif

```js
const { obtenirDb } = require("../config/db");
const { ObjectId } = require("mongodb"); // nécessaire pour convertir une chaîne d'id en vrai ObjectId MongoDB

async function creer(utilisateur) {
  const resultat = await obtenirDb().collection("utilisateurs").insertOne(utilisateur);
  return { _id: resultat.insertedId, ...utilisateur };
}

async function trouverParId(id) {
  return obtenirDb().collection("utilisateurs").findOne({ _id: new ObjectId(id) });
}

async function trouverParEmail(email) {
  return obtenirDb().collection("utilisateurs").findOne({ email });
}

async function listerTous() {
  return obtenirDb().collection("utilisateurs").find().toArray(); // .find() retourne un CURSEUR, .toArray() le matérialise
}

async function modifier(id, donnees) {
  const resultat = await obtenirDb().collection("utilisateurs").updateOne(
    { _id: new ObjectId(id) },
    { $set: donnees } // $set : ne modifie QUE les champs fournis, laisse les autres intacts
  );
  return resultat.modifiedCount > 0;
}

async function supprimer(id) {
  const resultat = await obtenirDb().collection("utilisateurs").deleteOne({ _id: new ObjectId(id) });
  return resultat.deletedCount > 0;
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ _id n'est jamais une simple chaîne de caractères, mais un ObjectId</span>
```js
// ❌ Une chaîne brute ne correspondra JAMAIS à un _id stocké (qui est un ObjectId, un type binaire spécifique)
await db.collection("utilisateurs").findOne({ _id: "64f1a2b3c4d5e6f7a8b9c0d1" }); // retourne toujours null !
```
```js
// ✅ Toujours convertir explicitement via new ObjectId(...)
await db.collection("utilisateurs").findOne({ _id: new ObjectId("64f1a2b3c4d5e6f7a8b9c0d1") });
```
</div>

## 33.4 Requêtes avec opérateurs MongoDB

```js
// Trouver tous les produits avec un stock supérieur à 0 ET une catégorie précise
await db.collection("produits").find({
  stock: { $gt: 0 },
  categorie: "alimentaire",
}).toArray();

// Trouver un utilisateur avec l'un OU l'autre email
await db.collection("utilisateurs").find({
  $or: [{ email: "jaslin@mail.com" }, { email: "marie@mail.com" }],
}).toArray();

// Tri et pagination (rappel du chapitre 21)
await db.collection("produits")
  .find({ categorie: "alimentaire" })
  .sort({ prix: -1 }) // -1 : décroissant, 1 : croissant
  .skip(20)
  .limit(10)
  .toArray();
```

## 33.5 Index MongoDB

```js
await db.collection("utilisateurs").createIndex({ email: 1 }, { unique: true });
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Même logique que les index SQL, rappel du manuel Java de ce même auteur</span>
Un index MongoDB accélère les recherches sur le champ indexé, exactement comme un index SQL classique — `{ unique: true }` garantit en plus qu'aucun doublon n'est accepté sur ce champ, imposant une contrainte d'unicité que le schéma flexible de MongoDB n'impose sinon jamais nativement.
</div>

## 33.6 Le piège de l'absence de schéma imposé

<div class="encadre attention">
<span class="encadre-titre">⚠️ MongoDB n'impose AUCUNE structure par défaut, contrairement à SQL</span>
```js
// Ces deux documents peuvent coexister dans la MÊME collection, sans erreur :
await db.collection("utilisateurs").insertOne({ nom: "Jaslin", email: "jaslin@mail.com" });
await db.collection("utilisateurs").insertOne({ nomComplet: "Marie Pierre" }); // structure TOTALEMENT différente !
```
Sans discipline (ou sans un ODM comme Mongoose, chapitre 36, qui impose un schéma **côté application**), rien n'empêche des documents de structures incohérentes de coexister dans la même collection — un risque réel de bugs silencieux si le code suppose une structure uniforme.
</div>

## 33.7 Quand choisir MongoDB plutôt qu'une base relationnelle

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel du chapitre 24 du manuel Java de ce même auteur, appliqué ici</span>
MongoDB convient bien à des données **naturellement hiérarchiques et peu relationnelles** entre elles (profils utilisateurs avec préférences imbriquées, catalogues de contenu, logs d'événements), ou à des besoins de **flexibilité de schéma** (structure évolutive rapidement). Pour des données **fortement relationnelles** avec des contraintes d'intégrité strictes (comptes bancaires, stocks avec contraintes de non-négativité, systèmes de facturation), le modèle relationnel (PostgreSQL/MySQL) reste généralement préférable — exactement le choix fait pour le projet final de ce manuel (chapitre 41), une API de gestion hospitalière aux données fortement structurées et relationnelles.
</div>

## 33.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier .toArray() sur un curseur find()</span>
```js
const resultat = await db.collection("produits").find({}); // ❌ resultat est un CURSEUR, pas un tableau !
console.log(resultat.length); // undefined
```
```js
const produits = await db.collection("produits").find({}).toArray(); // ✅ matérialise le curseur en tableau
```
</div>

## 33.9 Résumé du chapitre

- MongoDB stocke des documents JSON-like en collections, permettant des structures imbriquées naturelles, sans jointures.
- `_id` est un `ObjectId`, jamais une simple chaîne — toujours convertir explicitement via `new ObjectId(...)`.
- `.find()` retourne un curseur ; `.toArray()` le matérialise en tableau JavaScript exploitable.
- Sans discipline ou ODM (Mongoose, chapitre 36), MongoDB n'impose aucune cohérence de structure entre documents d'une même collection.
- Préférer MongoDB pour des données hiérarchiques peu relationnelles ; préférer le relationnel pour des données à fortes contraintes d'intégrité.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 33.1</span>

Écris une fonction `rechercherProduitsParNom(motCle)` utilisant une expression régulière MongoDB pour une recherche partielle insensible à la casse sur le champ `nom`.
</div>

**Corrigé :**
```js
async function rechercherProduitsParNom(motCle) {
  return obtenirDb().collection("produits").find({
    nom: { $regex: motCle, $options: "i" }, // "i" : insensible à la casse
  }).toArray();
}
```

*Chapitre suivant : Prisma, l'ORM moderne qui simplifie considérablement le travail avec PostgreSQL/MySQL.*
