<div class="chapitre-titre-num">CHAPITRE 36</div>

# Mongoose

## Objectifs pédagogiques

Structurer l'accès à MongoDB avec Mongoose, l'ODM (*Object-Document Mapping*) standard, qui impose un schéma côté application — résolvant directement le problème de flexibilité excessive du chapitre 33.

## 36.1 Pourquoi Mongoose plutôt que le driver natif

Rappel du chapitre 33 (section 33.6) : MongoDB n'impose aucune structure par défaut, un risque réel d'incohérence entre documents d'une même collection. **Mongoose** résout ce problème en définissant un **schéma** côté application, validé automatiquement à chaque écriture.

```
$ npm install mongoose
```

## 36.2 Connexion avec Mongoose

```js
// src/config/db.js
const mongoose = require("mongoose");

async function connecter() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connecté à MongoDB via Mongoose");
}

module.exports = { connecter };
```

## 36.3 Définir un schéma et un modèle

```js
// src/models/utilisateur.model.js
const mongoose = require("mongoose");

const utilisateurSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, "Le nom est obligatoire"],
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Format d'email invalide"],
  },
  motDePasseHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["UTILISATEUR", "ADMIN"],
    default: "UTILISATEUR",
  },
}, {
  timestamps: true, // ajoute createdAt/updatedAt automatiquement
});

const Utilisateur = mongoose.model("Utilisateur", utilisateurSchema);

module.exports = Utilisateur;
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Cette validation s'exécute AUTOMATIQUEMENT à chaque .save()/.create()</span>
Contrairement au driver natif (chapitre 33) où rien n'empêche d'insérer un document mal formé, Mongoose **refuse** automatiquement un document ne respectant pas le schéma (champ `required` manquant, `enum` avec une valeur non listée, format `match` non respecté) — une validation similaire en esprit à Zod (chapitre 18), mais appliquée spécifiquement au niveau de la couche de persistance.
</div>

## 36.4 CRUD avec Mongoose

```js
const Utilisateur = require("../models/utilisateur.model");

async function creer(donnees) {
  return Utilisateur.create(donnees); // valide AUTOMATIQUEMENT contre le schéma avant l'insertion
}

async function trouverParId(id) {
  return Utilisateur.findById(id);
}

async function trouverParEmail(email) {
  return Utilisateur.findOne({ email });
}

async function listerTous() {
  return Utilisateur.find().sort({ nom: 1 });
}

async function modifier(id, donnees) {
  return Utilisateur.findByIdAndUpdate(id, donnees, { new: true, runValidators: true });
  // "new: true" : retourne le document APRÈS modification (pas avant)
  // "runValidators: true" : réapplique les validations du schéma, même sur un UPDATE
}

async function supprimer(id) {
  return Utilisateur.findByIdAndDelete(id);
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Sans runValidators: true, un UPDATE contourne les validations du schéma</span>
Par défaut, Mongoose applique les validations à la **création** (`create`, `save`), mais **pas automatiquement** aux mises à jour (`findByIdAndUpdate`) — un oubli fréquent qui permettrait d'enregistrer des données invalides via une simple modification.
</div>

## 36.5 Relations avec populate (référence entre documents)

```js
const commandeSchema = new mongoose.Schema({
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur" }, // référence vers un autre document
  total: Number,
});

const Commande = mongoose.model("Commande", commandeSchema);
```

```js
// Sans populate : utilisateur reste juste un ObjectId brut
const commande = await Commande.findById(id);
console.log(commande.utilisateur); // 64f1a2b3c4d5e6f7a8b9c0d1 (juste l'id)

// Avec populate : Mongoose charge AUTOMATIQUEMENT le document référencé
const commandeAvecUtilisateur = await Commande.findById(id).populate("utilisateur");
console.log(commandeAvecUtilisateur.utilisateur.nom); // "Jaslin" — le document complet est chargé
```

## 36.6 Middlewares Mongoose (hooks pre/post)

```js
const bcrypt = require("bcrypt");

utilisateurSchema.pre("save", async function (next) {
  if (!this.isModified("motDePasseHash")) return next(); // ne re-hache PAS si le mot de passe n'a pas changé
  this.motDePasseHash = await bcrypt.hash(this.motDePasseHash, 10);
  next();
});
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un hook pre("save") centralise une transformation systématique</span>
Ce hook garantit que **tout** enregistrement d'un utilisateur (création ou modification) hache automatiquement le mot de passe si celui-ci a changé — évitant d'avoir à s'en souvenir manuellement dans chaque service qui pourrait créer/modifier un utilisateur.
</div>

## 36.7 Méthodes personnalisées sur un modèle

```js
utilisateurSchema.methods.verifierMotDePasse = async function (motDePasseSaisi) {
  return bcrypt.compare(motDePasseSaisi, this.motDePasseHash);
};
```

```js
const utilisateur = await Utilisateur.findOne({ email });
const estValide = await utilisateur.verifierMotDePasse(motDePasseSaisi); // méthode directement sur l'instance
```

## 36.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Comparer directement deux ObjectId avec ===</span>
```js
if (commande.utilisateur === utilisateurConnecteId) { ... } // ❌ souvent FAUX, même si les ids "semblent" identiques
```
```js
if (commande.utilisateur.equals(utilisateurConnecteId)) { ... } // ✅ méthode dédiée d'ObjectId
// ou : if (commande.utilisateur.toString() === utilisateurConnecteId.toString())
```
Deux `ObjectId` représentant la même valeur ne sont **pas égaux** avec `===` (comparaison de référence d'objet) — toujours utiliser `.equals()` ou convertir en chaîne des deux côtés avant de comparer.
</div>

## 36.9 Résumé du chapitre

- Mongoose impose un schéma côté application, validé automatiquement à l'écriture — résolvant la flexibilité excessive du driver natif MongoDB.
- `runValidators: true` est nécessaire pour que les mises à jour (`findByIdAndUpdate`) respectent aussi les validations du schéma.
- `populate()` charge automatiquement un document référencé par `ObjectId`, remplaçant les jointures SQL.
- Les hooks `pre`/`post` centralisent des transformations systématiques (comme le hachage automatique d'un mot de passe modifié).
- Toujours comparer deux `ObjectId` via `.equals()`, jamais avec `===`.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 36.1</span>

Définis un schéma Mongoose `Produit` (nom, prix, stock) avec une méthode d'instance `estDisponible()` retournant `true` si `stock > 0`.
</div>

**Corrigé :**
```js
const produitSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prix: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
});

produitSchema.methods.estDisponible = function () {
  return this.stock > 0;
};

const Produit = mongoose.model("Produit", produitSchema);
```

*Ceci clôt la Partie 8 (bases de données et ORM). Chapitre suivant : Docker, pour conteneuriser l'application et ses dépendances.*
