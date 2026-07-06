<div class="chapitre-titre-num">CHAPITRE 34</div>

# ORM Prisma

## Objectifs pédagogiques

Comprendre ce qu'un ORM automatise par rapport au SQL brut des chapitres 31-32, configurer Prisma, définir un schéma, gérer les migrations, et effectuer des opérations CRUD avec relations.

## 34.1 Ce qu'un ORM automatise

Rappel des chapitres 31-32 : le mapping manuel `resultat.rows[0]` → objet JavaScript, écrit à la main pour chaque requête, devient répétitif. Un **ORM** (*Object-Relational Mapping*) génère ce mapping automatiquement, à partir d'un schéma déclaré une seule fois.

<div class="encadre astuce">
<span class="encadre-titre">💡 Prisma : l'ORM moderne de référence pour Node.js/TypeScript</span>
Contrairement à Sequelize (chapitre 35, plus ancien, orienté classes), **Prisma** génère un client entièrement typé à partir d'un schéma déclaratif dédié (`schema.prisma`), avec une syntaxe de requêtes moderne et une gestion de migrations intégrée — devenu le choix par défaut pour un nouveau projet Node.js relationnel.
</div>

## 34.2 Installation et initialisation

```
$ npm install prisma --save-dev
$ npm install @prisma/client
$ npx prisma init
```

```
Création de :
  prisma/schema.prisma   ← définit le schéma de données
  .env                    ← contient DATABASE_URL
```

## 34.3 Le schéma Prisma

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // ou "mysql", "mongodb"...
  url      = env("DATABASE_URL")
}

model Utilisateur {
  id             Int      @id @default(autoincrement())
  nom            String
  email          String   @unique
  motDePasseHash String
  role           Role     @default(UTILISATEUR)
  commandes      Commande[] // relation "un-à-plusieurs" : un utilisateur a plusieurs commandes
  createdAt      DateTime @default(now())
}

model Commande {
  id            Int         @id @default(autoincrement())
  utilisateur   Utilisateur @relation(fields: [utilisateurId], references: [id])
  utilisateurId Int
  total         Decimal
  createdAt     DateTime    @default(now())
}

enum Role {
  UTILISATEUR
  ADMIN
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un seul fichier décrit modèles, relations ET base de données ciblée</span>
Contrairement au SQL manuel (chapitres 24-25 du manuel Java de ce même auteur, ou l'écriture manuelle de `CREATE TABLE`), le schéma Prisma décrit la structure de façon **déclarative et lisible**, générant ensuite automatiquement les migrations SQL correspondantes.
</div>

## 34.4 Migrations : appliquer le schéma à la base de données

```
$ npx prisma migrate dev --name init
```

```
Applying migration `20260705120000_init`

The following migration(s) have been created and applied:

migrations/
  └─ 20260705120000_init/
    └─ migration.sql
```

<div class="encadre astuce">
<span class="encadre-titre">💡 prisma migrate dev vs prisma migrate deploy</span>
`migrate dev` (développement) génère un nouveau fichier de migration SQL à partir des changements du schéma, l'applique, et régénère le client Prisma. `migrate deploy` (production, chapitre 39) applique uniquement les migrations **déjà générées et commitées**, sans en créer de nouvelles — jamais utiliser `migrate dev` directement en production.
</div>

## 34.5 Le client Prisma généré

```js
// src/config/prisma.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
```

## 34.6 CRUD avec Prisma

```js
const prisma = require("../config/prisma");

// CREATE
async function creerUtilisateur(donnees) {
  return prisma.utilisateur.create({ data: donnees });
}

// READ
async function trouverParId(id) {
  return prisma.utilisateur.findUnique({ where: { id } });
}

async function listerTous() {
  return prisma.utilisateur.findMany({ orderBy: { nom: "asc" } });
}

// UPDATE
async function modifier(id, donnees) {
  return prisma.utilisateur.update({ where: { id }, data: donnees });
}

// DELETE
async function supprimer(id) {
  return prisma.utilisateur.delete({ where: { id } });
}
```

Remarque : **aucun mapping manuel** n'est nécessaire — `prisma.utilisateur.findUnique(...)` retourne directement un objet JavaScript avec les bons types (`Int` → `number`, `DateTime` → `Date`), automatiquement.

## 34.7 Requêtes avec relations (include)

```js
async function trouverUtilisateurAvecCommandes(id) {
  return prisma.utilisateur.findUnique({
    where: { id },
    include: { commandes: true }, // charge AUSSI les commandes liées, en une seule requête (évite le N+1)
  });
}
```

```js
async function trouverCommandesAvecUtilisateur() {
  return prisma.commande.findMany({
    include: { utilisateur: { select: { nom: true, email: true } } }, // "select" : ne charge QUE les champs utiles
  });
}
```

## 34.8 Filtrage, tri, pagination (rappel du chapitre 21)

```js
async function rechercherProduits({ recherche, prixMin, prixMax, page, limite }) {
  const filtres = {
    ...(recherche && { nom: { contains: recherche, mode: "insensitive" } }),
    ...(prixMin && { prix: { gte: prixMin } }),
    ...(prixMax && { prix: { lte: prixMax } }),
  };

  const [produits, total] = await Promise.all([
    prisma.produit.findMany({
      where: filtres,
      skip: (page - 1) * limite,
      take: limite,
      orderBy: { nom: "asc" },
    }),
    prisma.produit.count({ where: filtres }),
  ]);

  return { produits, total };
}
```

## 34.9 Transactions avec Prisma

```js
// Transaction interactive : plusieurs opérations, tout réussit ou rien n'est appliqué
async function creerVenteAvecDecrementStock(produitId, quantite, clientId) {
  return prisma.$transaction(async (tx) => {
    const produit = await tx.produit.update({
      where: { id: produitId, stock: { gte: quantite } }, // compare-and-swap (rappel chapitre 31)
      data: { stock: { decrement: quantite } },
    }).catch(() => {
      throw new Error("Stock insuffisant");
    });

    return tx.vente.create({
      data: { produitId, quantite, clientId, total: produit.prix * quantite },
    });
  });
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 tx, pas prisma, à l'intérieur d'une transaction</span>
À l'intérieur du callback `$transaction`, il faut utiliser le client de transaction (`tx`) fourni en paramètre, jamais l'instance `prisma` globale — sinon les requêtes s'exécuteraient **hors** de la transaction, perdant toute garantie d'atomicité.
</div>

## 34.10 Prisma Studio : explorer les données visuellement

```
$ npx prisma studio
```

Ouvre une interface web locale (généralement `http://localhost:5555`) permettant de parcourir, filtrer et modifier directement les données de la base — un équivalent visuel très pratique de phpMyAdmin, spécifiquement intégré à Prisma.

## 34.11 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier de régénérer le client après une modification du schéma</span>
```
$ npx prisma migrate dev --name ajout_champ_telephone
```
Cette commande régénère **automatiquement** le client Prisma après une migration. Mais si le schéma est modifié sans passer par `migrate dev` (rare, mais possible en édition manuelle suivie d'un simple redémarrage), `npx prisma generate` doit être appelé explicitement, sinon le client reste basé sur l'ancien schéma, provoquant des erreurs de type incohérentes avec la base réelle.
</div>

## 34.12 Résumé du chapitre

- Prisma génère un client typé à partir d'un schéma déclaratif (`schema.prisma`), éliminant le mapping manuel du SQL brut.
- `migrate dev` (développement, génère et applique) vs `migrate deploy` (production, applique uniquement l'existant).
- `include`/`select` chargent les relations en une seule requête, évitant le problème classique du N+1.
- `$transaction` avec un callback (`tx`) garantit l'atomicité de plusieurs opérations liées — toujours utiliser `tx`, jamais `prisma` directement, à l'intérieur.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 34.1</span>

Ajoute un modèle `Produit` au schéma Prisma (id, nom, prix `Decimal`, stock `Int`), puis écris la fonction `listerProduitsSousSeuil(seuil)` retournant les produits dont le stock est inférieur au seuil donné.
</div>

**Corrigé :**
```prisma
model Produit {
  id    Int     @id @default(autoincrement())
  nom   String
  prix  Decimal
  stock Int     @default(0)
}
```
```js
async function listerProduitsSousSeuil(seuil) {
  return prisma.produit.findMany({ where: { stock: { lt: seuil } } });
}
```

*Chapitre suivant : Sequelize, un ORM plus ancien mais toujours largement utilisé, orienté classes/modèles.*
