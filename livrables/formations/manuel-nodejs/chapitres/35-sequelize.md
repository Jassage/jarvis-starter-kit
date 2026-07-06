<div class="chapitre-titre-num">CHAPITRE 35</div>

# Sequelize

## Objectifs pédagogiques

Configurer Sequelize (ORM plus ancien mais très répandu dans du code existant), définir des modèles orientés classes, gérer les associations et les migrations.

## 35.1 Sequelize vs Prisma : deux philosophies différentes

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi connaître Sequelize malgré la popularité croissante de Prisma</span>
De nombreux projets Node.js existants (souvent plus anciens) utilisent **Sequelize**, un ORM orienté **classes** (modèles définis comme des classes JavaScript, proche d'une approche Active Record). Bien que Prisma (chapitre 34) soit devenu le choix par défaut pour un nouveau projet, comprendre Sequelize reste précieux pour maintenir ou faire évoluer du code existant.
</div>

## 35.2 Installation et connexion

```
$ npm install sequelize pg pg-hstore
$ # (ou mysql2 pour MySQL, sqlite3 pour SQLite)
```

```js
// src/config/sequelize.js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
});

module.exports = sequelize;
```

## 35.3 Définir un modèle

```js
// src/models/utilisateur.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Utilisateur = sequelize.define("Utilisateur", {
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  motDePasseHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("UTILISATEUR", "ADMIN"),
    defaultValue: "UTILISATEUR",
  },
}, {
  tableName: "utilisateurs",
  timestamps: true, // ajoute automatiquement createdAt/updatedAt
});

module.exports = Utilisateur;
```

## 35.4 Synchronisation et migrations

```js
// Synchronisation SIMPLE (développement uniquement, jamais en production)
await sequelize.sync({ alter: true }); // adapte automatiquement les tables au modèle défini
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ sequelize.sync() ne doit JAMAIS être utilisé en production</span>
`sync({ alter: true })`, pratique en développement, peut appliquer des changements de schéma **non maîtrisés** et potentiellement destructeurs en production (rappel de la même mise en garde faite pour `hibernate.hbm2ddl.auto=update` dans le manuel Java de ce même auteur). En production, utiliser le système de **migrations** dédié de Sequelize (`sequelize-cli`), avec des fichiers de migration explicites et versionnés.
</div>

```
$ npx sequelize-cli migration:generate --name creer-table-utilisateurs
$ npx sequelize-cli db:migrate
```

## 35.5 CRUD avec Sequelize

```js
const Utilisateur = require("../models/utilisateur.model");

async function creer(donnees) {
  return Utilisateur.create(donnees);
}

async function trouverParId(id) {
  return Utilisateur.findByPk(id); // findByPk : find By Primary Key
}

async function trouverParEmail(email) {
  return Utilisateur.findOne({ where: { email } });
}

async function listerTous() {
  return Utilisateur.findAll({ order: [["nom", "ASC"]] });
}

async function modifier(id, donnees) {
  const [nombreLignesAffectees] = await Utilisateur.update(donnees, { where: { id } });
  return nombreLignesAffectees > 0;
}

async function supprimer(id) {
  const nombreLignesSupprimees = await Utilisateur.destroy({ where: { id } });
  return nombreLignesSupprimees > 0;
}
```

## 35.6 Associations entre modèles

```js
// models/index.js — définit les relations ENTRE modèles
const Utilisateur = require("./utilisateur.model");
const Commande = require("./commande.model");

Utilisateur.hasMany(Commande, { foreignKey: "utilisateurId" });
Commande.belongsTo(Utilisateur, { foreignKey: "utilisateurId" });

module.exports = { Utilisateur, Commande };
```

```js
// Requête avec relation chargée (équivalent du "include" de Prisma)
const utilisateur = await Utilisateur.findByPk(id, {
  include: [{ model: Commande }],
});
```

| Type de relation | Méthode Sequelize |
|---|---|
| Un-à-plusieurs | `hasMany` / `belongsTo` |
| Un-à-un | `hasOne` / `belongsTo` |
| Plusieurs-à-plusieurs | `belongsToMany` (avec table de jointure) |

## 35.7 Transactions avec Sequelize

```js
async function transfererFonds(compteSourceId, compteDestId, montant) {
  const t = await sequelize.transaction();

  try {
    await Compte.decrement("solde", { by: montant, where: { id: compteSourceId }, transaction: t });
    await Compte.increment("solde", { by: montant, where: { id: compteDestId }, transaction: t });

    await t.commit();
  } catch (erreur) {
    await t.rollback();
    throw erreur;
  }
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier de passer { transaction: t } à CHAQUE requête de la transaction</span>
Contrairement à Prisma (`tx.produit.update(...)`, où toutes les requêtes passent naturellement par le client de transaction), Sequelize exige de passer explicitement `{ transaction: t }` en option à **chaque** appel voulant faire partie de la transaction — un oubli sur une seule requête la fait s'exécuter **hors** transaction, silencieusement.
</div>

## 35.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Valider un modèle Sequelize ne remplace pas Zod (chapitre 18)</span>
Les validations intégrées à Sequelize (`validate: { isEmail: true }`) ne s'exécutent qu'au moment de l'écriture en base — un mauvais format serait accepté par le contrôleur/service, transmis jusqu'à la couche modèle, où il échouerait alors avec une erreur Sequelize moins explicite qu'une validation Zod précoce (chapitre 18). Continuer à valider les entrées **avant** d'atteindre la couche de persistance reste la bonne pratique, quel que soit l'ORM utilisé.
</div>

## 35.9 Résumé du chapitre

- Sequelize définit des modèles orientés classes (`sequelize.define`), avec un typage moins strict que Prisma mais une approche plus proche du JavaScript traditionnel.
- `sync({ alter: true })` convient au développement rapide, jamais à la production — les migrations `sequelize-cli` sont indispensables en production.
- Les associations (`hasMany`, `belongsTo`, `belongsToMany`) définissent les relations, chargées via `include`.
- Chaque requête d'une transaction doit recevoir explicitement `{ transaction: t }`, contrairement au modèle `tx` unifié de Prisma.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 35.1</span>

Définis un modèle Sequelize `Produit` (nom, prix `DECIMAL`, stock `INTEGER`), puis écris une fonction `decrementerStock(produitId, quantite)` utilisant `Produit.decrement(...)`.
</div>

**Corrigé :**
```js
const Produit = sequelize.define("Produit", {
  nom: { type: DataTypes.STRING, allowNull: false },
  prix: { type: DataTypes.DECIMAL, allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
});

async function decrementerStock(produitId, quantite) {
  await Produit.decrement("stock", { by: quantite, where: { id: produitId } });
}
```

*Chapitre suivant : Mongoose, l'ODM standard pour travailler avec MongoDB de façon structurée.*
