<div class="chapitre-titre-num">CHAPITRE 16</div>

# Architecture MVC

## Objectifs pédagogiques

Situer le pattern MVC (Modèle-Vue-Contrôleur) dans le contexte spécifique d'une API REST (sans vue serveur classique), et comprendre ses limites qui motivent l'architecture en couches du chapitre 17.

## 16.1 MVC : rappel du principe général

<div class="encadre astuce">
<span class="encadre-titre">💡 Les trois rôles de MVC</span>
- **Modèle (Model)** : les données et leur structure (un schéma Prisma/Mongoose, chapitre 34-36).
- **Vue (View)** : la présentation du résultat à l'utilisateur.
- **Contrôleur (Controller)** : reçoit une requête, orchestre modèle et vue.
</div>

## 16.2 MVC dans une API REST : pas de "vue" traditionnelle

<div class="encadre attention">
<span class="encadre-titre">⚠️ Particularité importante : une API REST n'a pas de "vue" au sens classique</span>
Dans une application web traditionnelle générant du HTML côté serveur (comme un projet PHP ou une application Express avec des templates EJS/Pug), la "Vue" génère une page HTML. Dans une **API REST** (le sujet de ce manuel), il n'y a **aucun rendu HTML côté serveur** — la "vue" se réduit à la sérialisation JSON de la réponse, réalisée directement par le contrôleur via `res.json(...)`. Le client (une application React, mobile, ou un autre service) se charge lui-même de tout affichage.
</div>

```{.uml}
MVC classique (avec rendu serveur)      MVC adapté a une API REST
┌───────────┐                         ┌───────────┐
│  Contrôleur   │                         │  Contrôleur   │
└───────────┘                         └───────────┘
   │        │                              │        │
   ▼        ▼                              ▼        ▼
Modèle    Vue (rend du HTML)          Modèle    res.json(...) (sérialisation)
                                                  (pas de "vue" séparée)
```

## 16.3 Le Modèle dans une API : au-delà du simple schéma

```js
// src/models/utilisateur.model.js — avec Mongoose (chapitre 36), par exemple
const mongoose = require("mongoose");

const utilisateurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  motDePasseHash: { type: String, required: true },
  role: { type: String, enum: ["UTILISATEUR", "ADMIN"], default: "UTILISATEUR" },
}, { timestamps: true });

module.exports = mongoose.model("Utilisateur", utilisateurSchema);
```

Le "Modèle" en contexte Node.js/Express désigne généralement le **schéma de données** (via un ORM/ODM comme Prisma, Sequelize ou Mongoose, chapitres 34-36), définissant la structure et les contraintes des données — pas la logique métier elle-même (qui vit dans les services, chapitre 15).

## 16.4 Pourquoi MVC seul devient insuffisant pour une API complexe

<div class="encadre astuce">
<span class="encadre-titre">💡 Le triangle Modèle-Vue-Contrôleur ne dit rien sur l'organisation interne de la logique métier</span>
MVC répond bien à la question "où va le code qui reçoit une requête et retourne une réponse ?" (Contrôleur), et "où vit la structure des données ?" (Modèle). Mais il ne précise **rien** sur l'organisation de la logique métier elle-même à mesure qu'elle grandit : validation complexe, règles métier à plusieurs étapes, accès à plusieurs sources de données. C'est exactement le vide que comble l'**architecture en couches** du chapitre 17, en introduisant explicitement les couches Service et Repository entre Contrôleur et Modèle.
</div>

## 16.5 MVC "à la Express" en pratique

```
src/
├── controllers/     # "C" de MVC — reçoit la requête, retourne la réponse
├── models/            # "M" de MVC — schémas de données (Prisma/Mongoose/Sequelize)
├── routes/             # associe URL + méthode HTTP à un contrôleur
└── (pas de dossier "views/" pour une API REST pure)
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un contrôleur "MVC" qui contient toute la logique métier n'est pas du MVC bien appliqué</span>
Beaucoup de tutoriels simplifiés placent **toute** la logique (validation, règles métier, accès direct aux données) directement dans le contrôleur, sous prétexte de "faire du MVC". Ce n'est pas une application correcte du pattern — même en MVC classique, le contrôleur ne devrait qu'**orchestrer**, jamais porter lui-même toute la complexité métier. C'est cette dérive fréquente que l'architecture en couches (chapitre 17) corrige explicitement.
</div>

## 16.6 Résumé du chapitre

- MVC répartit responsabilités entre Modèle (données), Vue (présentation), Contrôleur (orchestration).
- Dans une API REST, il n'y a pas de "vue" au sens classique : la sérialisation JSON en tient lieu, directement dans le contrôleur.
- MVC seul ne structure pas suffisamment la logique métier complexe — d'où l'architecture en couches (chapitre 17), qui introduit explicitement Service et Repository.
- Un contrôleur ne devrait jamais porter lui-même la logique métier, même en MVC "classique".

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 16.1</span>

Explique en une phrase pourquoi une API REST pure ne possède pas de "Vue" au sens MVC traditionnel.
</div>

**Corrigé :** Une API REST ne génère aucun rendu visuel côté serveur (pas de template HTML) — elle retourne uniquement des données structurées (JSON), et c'est le client (application frontend, mobile, ou autre service) qui se charge de tout affichage, rendant le rôle de "Vue" côté serveur inexistant, remplacé par une simple sérialisation JSON dans le contrôleur.

*Chapitre suivant : l'architecture en couches, qui structure la logique métier au-delà de ce que MVC formalise.*
