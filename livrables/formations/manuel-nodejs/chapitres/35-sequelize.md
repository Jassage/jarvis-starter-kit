<div class="chapitre-titre-num">CHAPITRE 35</div>

# Sequelize

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Configurer Sequelize (ORM plus ancien mais très répandu dans du code existant), définir des modèles orientés classes, gérer les associations et les migrations. À la fin de ce chapitre, tu sauras reprendre un projet Node.js existant utilisant Sequelize sans avoir à le migrer entièrement vers Prisma pour être productif.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Un client te confie la maintenance d'une application Node.js vieille de 4 ans, construite avec Sequelize — bien avant que Prisma ne devienne populaire. Le budget ne permet pas une réécriture complète vers un ORM plus moderne, seulement des évolutions ciblées. Tu dois devenir productif sur ce code existant rapidement, sans avoir le luxe de tout réapprendre depuis zéro avec la syntaxe que tu maîtrises déjà (Prisma, chapitre 34). Ce chapitre construit exactement ce pont : les mêmes concepts, une syntaxe différente.
</div>

## 35.1 Sequelize vs Prisma : deux philosophies différentes

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi connaître Sequelize malgré la popularité croissante de Prisma</span>
De nombreux projets Node.js existants (souvent plus anciens) utilisent **Sequelize**, un ORM orienté **classes** (modèles définis comme des classes JavaScript, proche d'une approche Active Record). Bien que Prisma (chapitre 34) soit devenu le choix par défaut pour un nouveau projet, comprendre Sequelize reste précieux pour maintenir ou faire évoluer du code existant — exactement la mission de la mise en situation d'ouverture.
</div>

| Critère | Prisma (chapitre 34) | Sequelize (ce chapitre) |
|---|---|---|
| Style de définition | Fichier `schema.prisma` déclaratif dédié | Classes JavaScript (`sequelize.define`) |
| Typage TypeScript | Généré automatiquement, très strict | Manuel ou via des types additionnels, moins strict nativement |
| Migrations | Générées automatiquement depuis le schéma (`migrate dev`) | Fichiers de migration à écrire/générer séparément (`sequelize-cli`) |
| Transactions | Client unifié `tx` dans le callback | `{ transaction: t }` à passer explicitement à chaque requête |
| Requêtes relations (N+1) | `include`/`select` | `include: [{ model: ... }]` |
| Maturité et ancienneté | Plus récent (2019), écosystème en croissance rapide | Plus ancien (2011), très répandu dans du code existant |
| Cas d'usage typique | Nouveau projet sans contrainte | Maintenance/évolution d'un projet existant déjà sur Sequelize |

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Le choix entre les deux se décide rarement "à froid" pour un nouveau projet (Prisma l'emporte alors presque toujours dans ce manuel) — il est bien plus souvent **imposé** par l'existant, exactement la situation de la mise en situation d'ouverture. Savoir lire et écrire du Sequelize reste une compétence professionnelle réelle, indépendamment de sa préférence personnelle.
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

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Le problème N+1 (chapitre 34) existe exactement de la même façon avec Sequelize : une boucle appelant `Commande.findOne(...)` pour chaque utilisateur reproduit le même piège de performance. `include: [{ model: ... }]` est l'équivalent Sequelize du `include` de Prisma pour le résoudre en une seule requête.
</div>

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
Contrairement à Prisma (`tx.produit.update(...)`, où toutes les requêtes passent naturellement par le client de transaction), Sequelize exige de passer explicitement `{ transaction: t }` en option à **chaque** appel voulant faire partie de la transaction — un oubli sur une seule requête la fait s'exécuter **hors** transaction, silencieusement. Exactement le même risque que le piège du chapitre 31 (`pool.query()` au lieu de `pool.connect()`), sous une forme différente.
</div>

## Atelier — Porter un repository Prisma vers Sequelize

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 35 — Devenir productif sur le projet existant de la mise en situation</span>

**Objectif** : traduire un repository écrit en Prisma (chapitre 34) vers son équivalent Sequelize, consolidant la comparaison des deux syntaxes.

**Préparation** : le repository `utilisateurs.repository.js` en Prisma du chapitre 34.

**Étapes détaillées** :
1. Définis le modèle Sequelize `Utilisateur` équivalent au modèle Prisma (section 35.3).
2. Réécris chaque méthode du repository (`trouverParEmail`, `trouverParId`, `creer`, `listerTous`) avec la syntaxe Sequelize (section 35.5).
3. Réécris la version avec relation chargée (`include`) pour éviter un N+1, en Sequelize.
4. Compare les deux fichiers de repository côte à côte : identifie chaque différence de syntaxe pour un même comportement.

**Validation** : les deux repositories (Prisma et Sequelize) doivent produire un comportement fonctionnellement identique pour les mêmes opérations.

**Résultat attendu** : une référence personnelle de traduction Prisma ↔ Sequelize, directement réutilisable pour la mission de maintenance de la mise en situation d'ouverture.

**Dépannage** : si une méthode Sequelize se comporte différemment de son équivalent Prisma, vérifie en priorité la gestion des valeurs `null`/absentes (`findOne` retourne `null` dans les deux, mais certains détails de comportement peuvent varier).

**Nettoyage** : aucun.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Valider un modèle Sequelize ne remplace pas Zod (chapitre 18)</span>
Les validations intégrées à Sequelize (`validate: { isEmail: true }`) ne s'exécutent qu'au moment de l'écriture en base — un mauvais format serait accepté par le contrôleur/service, transmis jusqu'à la couche modèle, où il échouerait alors avec une erreur Sequelize moins explicite qu'une validation Zod précoce (chapitre 18). Continuer à valider les entrées **avant** d'atteindre la couche de persistance reste la bonne pratique, quel que soit l'ORM utilisé.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Utiliser sync({ alter: true }) sur une base de production</span>
Exactement l'avertissement de la section 35.4 — un risque de perte de données réel si cette commande, pratique en développement rapide, est laissée active par erreur dans un environnement de production.
</div>

## Débogage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : une opération censée être transactionnelle laisse des données incohérentes</span>

- **Cause probable** : une requête de la transaction n'a pas reçu `{ transaction: t }` (erreur fréquente implicite de la section 35.7).
- **Diagnostic** : relire chaque appel Sequelize de la fonction concernée, vérifier la présence systématique de l'option `transaction`.
- **Solution** : ajouter l'option manquante à la requête concernée.
</div>

## En entreprise

- **Cohabitation de plusieurs ORM dans un portefeuille de projets** : une agence ou un freelance travaillant sur plusieurs projets clients rencontre fréquemment cette diversité — certains projets anciens sur Sequelize, d'autres plus récents sur Prisma — exactement le contexte de la mise en situation d'ouverture.
- **Migration progressive Sequelize → Prisma** : certaines équipes migrent progressivement, module par module, plutôt qu'en une seule réécriture risquée — une approche réaliste quand le budget d'une réécriture complète n'est pas disponible.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence principale entre Sequelize et Prisma ?"**
Réponse attendue : Sequelize définit des modèles orientés classes en JavaScript, avec des migrations et transactions gérées séparément ; Prisma utilise un schéma déclaratif dédié générant un client typé automatiquement, avec un client de transaction unifié.

**Q2. "Pourquoi Sequelize exige-t-il de passer transaction à chaque requête, contrairement à Prisma ?"**
Réponse attendue : Sequelize n'a pas de client de transaction unifié comme le `tx` de Prisma — chaque appel de méthode doit explicitement indiquer qu'il fait partie d'une transaction en cours via l'option `transaction`, sous peine de s'exécuter hors de cette transaction.

**Q3. "Recommanderais-tu de migrer un projet existant de Sequelize vers Prisma ?"**
Réponse attendue : dépend du contexte — une migration complète représente un coût et un risque significatifs pour un projet stable ; souvent préférable de rester sur l'ORM existant sauf besoin technique fort justifiant la migration.
</div>

## Optimisation, sécurité et maintenabilité

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Sur un projet Sequelize existant, documenter clairement quelles requêtes appartiennent à une transaction (via des noms de fonction explicites ou des commentaires) — l'absence d'un client unifié rend ces oublis plus faciles qu'avec Prisma.
</div>

## Résumé du chapitre

- Sequelize définit des modèles orientés classes (`sequelize.define`), avec un typage moins strict que Prisma mais une approche plus proche du JavaScript traditionnel.
- `sync({ alter: true })` convient au développement rapide, jamais à la production — les migrations `sequelize-cli` sont indispensables en production.
- Les associations (`hasMany`, `belongsTo`, `belongsToMany`) définissent les relations, chargées via `include`, avec le même risque de N+1 que Prisma en son absence.
- Chaque requête d'une transaction doit recevoir explicitement `{ transaction: t }`, contrairement au modèle `tx` unifié de Prisma.
- Le choix entre les deux ORM est souvent imposé par l'existant d'un projet, plus qu'une préférence technique libre.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM</span>

1. Comment Sequelize définit-il un modèle ?
   - a) Dans un fichier schema.prisma dédié
   - b) Via sequelize.define(), en JavaScript
   - c) Uniquement en SQL brut
   - d) Via un fichier YAML

2. Que faut-il passer à chaque requête Sequelize faisant partie d'une transaction ?
   - a) Rien de spécial
   - b) L'option { transaction: t }
   - c) Le mot-clé BEGIN
   - d) Un ObjectId

3. sync({ alter: true }) est-il recommandé en production ?
   - a) Oui, toujours
   - b) Non, jamais — utiliser les migrations sequelize-cli
   - c) Seulement le weekend
   - d) Seulement pour les petites tables

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Sequelize est plus récent que Prisma. — **Faux** (Sequelize est plus ancien).
2. Une requête Sequelize sans l'option transaction s'exécute automatiquement dans la transaction en cours. — **Faux**.
3. Le problème N+1 existe aussi avec Sequelize, pas seulement avec Prisma. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Question ouverte</span>

Pourquoi la mission de la mise en situation d'ouverture ne justifie-t-elle probablement pas une migration complète vers Prisma avant de commencer les évolutions demandées ?

**Corrigé** : une réécriture complète de l'ORM représente un coût et un risque de régression significatifs sur un projet stable en production depuis 4 ans, sans bénéfice immédiat pour le client qui demande des évolutions ciblées, pas une refonte technique. Le bon réflexe professionnel est de devenir productif sur l'existant (l'objectif de ce chapitre), et de ne considérer une migration que si un besoin technique concret la justifie clairement plus tard — jamais comme une préférence personnelle imposée au client sans qu'il l'ait demandée.
</div>

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

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais définir un modèle Sequelize avec sequelize.define().</li>
<li>☐ Je sais réaliser les opérations CRUD de base avec Sequelize.</li>
<li>☐ Je sais définir des associations entre modèles (hasMany, belongsTo).</li>
<li>☐ Je sais gérer une transaction Sequelize sans oublier { transaction: t }.</li>
<li>☐ Je sais comparer Sequelize et Prisma pour choisir consciemment entre eux.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Peut-on utiliser Sequelize avec TypeScript ?</dt>
<dd>Oui, avec des décorateurs ou des types additionnels (`sequelize-typescript`), mais l'expérience reste moins intégrée nativement que Prisma, dont le typage est généré automatiquement depuis le schéma.</dd>

<dt>Sequelize supporte-t-il MongoDB ?</dt>
<dd>Non, Sequelize est spécifiquement conçu pour les bases relationnelles (PostgreSQL, MySQL, SQLite, MSSQL) — pour MongoDB, voir Mongoose (chapitre 36).</dd>

<dt>Comment savoir si un projet existant utilise Sequelize ou Prisma sans l'ouvrir en détail ?</dt>
<dd>Un fichier `prisma/schema.prisma` signale Prisma ; un dossier `models/` avec des fichiers `sequelize.define(...)` et éventuellement un dossier `migrations/` avec des fichiers JavaScript numérotés signale Sequelize.</dd>
</dl>

## Références et pour aller plus loin

- Documentation Sequelize : [https://sequelize.org](https://sequelize.org)
- Documentation Sequelize sur les associations : [https://sequelize.org/docs/v6/core-concepts/assocs/](https://sequelize.org/docs/v6/core-concepts/assocs/)

*Chapitre suivant : Mongoose, l'ODM standard pour travailler avec MongoDB de façon structurée.*
