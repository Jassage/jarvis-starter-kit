<div class="chapitre-titre-num">CHAPITRE 17</div>

# Architecture en couches (repository/DAO)

## Objectifs pédagogiques

Introduire la couche Repository entre Service et base de données, comprendre son intérêt (indépendance vis-à-vis du système de stockage, testabilité), et assembler l'architecture complète à quatre couches de ce manuel.

## 17.1 Le problème résolu par la couche Repository

Rappel du chapitre 15 : le service `UtilisateurService` appelle `UtilisateurRepository.trouverParEmail(...)`. Sans cette couche intermédiaire, le service contiendrait directement des requêtes SQL/Prisma/Mongoose — le mélangeant à la logique métier, et le liant **rigidement** à une technologie de stockage précise.

## 17.2 Le Repository : encapsuler l'accès aux données

```js
// src/repositories/utilisateurs.repository.js — implémentation avec Prisma (chapitre 34)
const prisma = require("../config/prisma");

async function trouverParEmail(email) {
  return prisma.utilisateur.findUnique({ where: { email } });
}

async function trouverParId(id) {
  return prisma.utilisateur.findUnique({ where: { id } });
}

async function creer({ nom, email, motDePasseHash }) {
  return prisma.utilisateur.create({
    data: { nom, email, motDePasseHash },
  });
}

async function listerTous() {
  return prisma.utilisateur.findMany({ orderBy: { nom: "asc" } });
}

module.exports = { trouverParEmail, trouverParId, creer, listerTous };
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le service ne sait pas (et n'a pas besoin de savoir) que Prisma est utilisé derrière</span>
`UtilisateurService.creerUtilisateur(...)` (chapitre 15) appelle `UtilisateurRepository.creer(...)` sans connaître les détails d'implémentation — que ce soit du Prisma, du Mongoose, ou même du SQL brut avec le driver `pg`. Si la technologie de stockage change un jour (migration de MongoDB vers PostgreSQL, par exemple), **seul** le repository doit être réécrit ; service et contrôleur restent totalement inchangés.
</div>

## 17.3 L'architecture complète à quatre couches

```{.uml}
┌─────────────────────────────────┐
│   Route (routes/)                   │  Associe URL + méthode à un contrôleur
├─────────────────────────────────┤
│   Contrôleur (controllers/)         │  Extrait req, appelle le service, formate la réponse HTTP
├─────────────────────────────────┤
│   Service (services/)               │  Logique métier pure : règles, validations métier, orchestration
├─────────────────────────────────┤
│   Repository (repositories/)         │  Accès aux données : requêtes Prisma/Mongoose/SQL
├─────────────────────────────────┤
│   Base de données                    │  PostgreSQL / MySQL / MongoDB
└─────────────────────────────────┘
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Chaque couche ne parle qu'à ses voisines immédiates</span>
Un contrôleur n'appelle **jamais** directement un repository (il passe toujours par le service) ; un repository ne contient **jamais** de logique métier (seulement des requêtes de données). Cette discipline stricte garantit que chaque couche reste remplaçable et testable indépendamment des autres.
</div>

## 17.4 Interface de Repository (pour un couplage encore plus faible)

```js
// Un "contrat" implicite que toute implémentation de repository doit respecter
// (JavaScript n'a pas d'interfaces formelles comme Java/TypeScript, mais la convention reste utile)

// repositories/utilisateurs.repository.prisma.js
module.exports = {
  trouverParEmail: async (email) => { /* ... implémentation Prisma ... */ },
  creer: async (donnees) => { /* ... */ },
};

// repositories/utilisateurs.repository.memoire.js — pour les TESTS (chapitre 29), sans vraie base de données
let utilisateurs = [];
module.exports = {
  trouverParEmail: async (email) => utilisateurs.find((u) => u.email === email) || null,
  creer: async (donnees) => {
    const nouveau = { id: utilisateurs.length + 1, ...donnees };
    utilisateurs.push(nouveau);
    return nouveau;
  },
};
```

```js
// Le service reçoit son repository en paramètre (injection de dépendance)
function creerUtilisateurService(utilisateurRepository) {
  return async function creerUtilisateur({ nom, email, motDePasse }) {
    const existant = await utilisateurRepository.trouverParEmail(email);
    // ...
  };
}

// En production
const UtilisateurService = creerUtilisateurService(require("./repositories/utilisateurs.repository.prisma"));

// Dans un test (chapitre 29), sans base de données réelle
const UtilisateurServiceTest = creerUtilisateurService(require("./repositories/utilisateurs.repository.memoire"));
```

## 17.5 TypeScript rend ce contrat explicite (aperçu)

<div class="encadre astuce">
<span class="encadre-titre">💡 Sans TypeScript, le contrat de repository reste une simple convention</span>
En JavaScript pur, rien n'empêche techniquement une implémentation de repository d'oublier une méthode attendue — l'erreur ne se manifesterait qu'à l'exécution. En **TypeScript**, une véritable interface (`interface UtilisateurRepository { trouverParEmail(email: string): Promise<Utilisateur | null>; ... }`) ferait détecter cette omission **à la compilation**. Ce manuel reste centré sur le JavaScript pur pour rester accessible, mais cette limitation est bonne à connaître avant d'adopter TypeScript sur un projet Node.js plus ambitieux.
</div>

## 17.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un contrôleur qui appelle directement un repository, en sautant le service</span>
```js
// ❌ Le contrôleur contourne le service, appelle directement le repository
async function lister(req, res) {
  const utilisateurs = await UtilisateurRepository.listerTous(); // ⚠️ aucune règle métier appliquée (filtrage des mots de passe, etc.)
  res.json(utilisateurs);
}
```
Ce raccourci semble anodin sur une lecture simple, mais **casse la garantie** que toute donnée sortant de la base passe par les règles métier du service (filtrage des champs sensibles, transformation, autorisation fine) — toujours passer par le service, même pour une simple lecture.
</div>

## 17.7 Résumé du chapitre

- Le **Repository** encapsule l'accès aux données, isolant le service de la technologie de stockage précise (Prisma, Mongoose, SQL brut).
- L'architecture complète à quatre couches (Route → Contrôleur → Service → Repository → BDD) garantit que chaque couche ne communique qu'avec ses voisines immédiates.
- Une implémentation de repository "en mémoire" facilite grandement les tests unitaires du service, sans dépendre d'une vraie base de données.
- Un contrôleur ne doit jamais appeler directement un repository, même pour une simple lecture — toujours passer par le service.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 17.1</span>

Crée un repository `produits.repository.js` (avec une implémentation en mémoire simple, un tableau JavaScript) exposant `listerTous()`, `trouverParId(id)`, `creer(donnees)`, puis un service `produits.service.js` qui l'utilise pour exposer `listerProduitsDisponibles()` (ne retournant que les produits avec `stock > 0`).
</div>

**Corrigé :**
```js
// repositories/produits.repository.js
let produits = [
  { id: 1, nom: "Riz", stock: 10 },
  { id: 2, nom: "Savon", stock: 0 },
];

module.exports = {
  listerTous: async () => produits,
  trouverParId: async (id) => produits.find((p) => p.id === id) || null,
  creer: async (donnees) => {
    const nouveau = { id: produits.length + 1, ...donnees };
    produits.push(nouveau);
    return nouveau;
  },
};
```
```js
// services/produits.service.js
const ProduitRepository = require("../repositories/produits.repository");

async function listerProduitsDisponibles() {
  const produits = await ProduitRepository.listerTous();
  return produits.filter((p) => p.stock > 0);
}

module.exports = { listerProduitsDisponibles };
```

*Chapitre suivant : la validation des données, pour garantir qu'aucune donnée invalide n'atteigne la logique métier.*
