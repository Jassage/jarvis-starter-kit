<div class="chapitre-titre-num">CHAPITRE 5</div>

# Architecture d'un projet professionnel

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Adopter dès le départ une organisation de dossiers cohérente, reprise et approfondie tout au long de ce manuel (architecture MVC au chapitre 16, architecture en couches au chapitre 17). À la fin de ce chapitre, tu sauras structurer un nouveau projet Express dès sa création, et tu comprendras pourquoi séparer `app.js` et `server.js` facilite considérablement les tests automatisés.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Tu récupères un projet Node.js en cours de développement chez un client. Un seul fichier, `index.js`, fait 2400 lignes : les routes, la logique métier, les requêtes SQL brutes et la configuration du serveur y sont toutes mélangées, dans l'ordre où elles ont été écrites au fil des mois. Le client te demande d'ajouter une fonctionnalité simple — un nouvel endpoint de recherche — mais tu passes plus de temps à comprendre où intervenir qu'à écrire le code lui-même. Ce chapitre pose la structure qui évite exactement ce piège, dès le premier jour d'un projet.
</div>

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

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Un projet sans organisation, c'est un atelier où outils, pièces détachées et commandes clients sont empilés pêle-mêle sur la même table. Retrouver la bonne pièce prend de plus en plus de temps à mesure que la pile grandit — pas parce que le travail est plus difficile, mais parce que rien n'a de place dédiée.
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

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique</span>
Créer cette arborescence de dossiers **dès le premier commit** d'un projet, même vide (un simple `.gitkeep` dans chaque dossier encore inutilisé suffit). Il est nettement plus coûteux de réorganiser un projet déjà mélangé que de partir avec une structure claire.
</div>

<div class="encadre mauvaise-pratique">
<span class="encadre-titre">❌ Mauvaise pratique</span>
Se dire "je rangerai plus tard, là je dois juste livrer vite" — exactement comment le fichier `index.js` de 2400 lignes de la mise en situation d'ouverture a fini par exister. Le rangement "plus tard" arrive rarement de lui-même.
</div>

## 5.3 Le flux d'une requête à travers cette architecture

```mermaid
sequenceDiagram
    participant Client
    participant Route as Route (routes/)
    participant MW as Middleware (auth, validation)
    participant Ctrl as Controleur (controllers/)
    participant Svc as Service (services/)
    participant Repo as Repository (repositories/)
    participant DB as Base de donnees

    Client->>Route: Requete HTTP (ex. POST /utilisateurs)
    Route->>MW: Associe URL + methode a un controleur
    MW->>MW: Authentification, validation (ch. 14, 18, 23)
    MW->>Ctrl: Requete validee
    Ctrl->>Svc: Extrait req.body/req.params, appelle le service
    Svc->>Repo: Logique metier pure (regles, calculs)
    Repo->>DB: Requete (Prisma/Mongoose...)
    DB-->>Repo: Resultat
    Repo-->>Svc: Donnees
    Svc-->>Ctrl: Resultat traite
    Ctrl-->>Client: Reponse HTTP (res.json)
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Explication du schéma</span>
Ce diagramme de séquence montre un principe essentiel : chaque couche ne parle **qu'à ses voisines immédiates**. Le contrôleur ne fait jamais de requête SQL directement, le service ne connaît jamais `req`/`res` (les objets HTTP d'Express), et le repository ignore tout de la logique métier qui l'entoure. C'est précisément cette séparation qui permet de tester un service isolément (chapitre 29) sans avoir à simuler une vraie requête HTTP.
</div>

Ce flux, introduit ici en aperçu, est détaillé et justifié en profondeur aux chapitres 15 à 17.

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Route → Middleware → Contrôleur → Service → Repository → Base de données, et la réponse remonte exactement dans l'ordre inverse. Une couche qui "saute" une étape (un contrôleur qui interroge directement la base de données, par exemple) casse cette architecture et rend le code plus difficile à tester et à faire évoluer.
</div>

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

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Vérifier systématiquement, avant le tout premier commit d'un projet, que `.env` figure bien dans `.gitignore`. Un secret réel (mot de passe de base de données, clé JWT) commité par erreur dans l'historique Git reste récupérable même après suppression du fichier — la rotation complète du secret exposé est alors la seule vraie remédiation.
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

## Atelier — Poser la structure d'un nouveau projet

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 5 — De zéro à une architecture prête à grandir</span>

**Objectif** : créer, en partant de rien, la structure complète de la section 5.2, prête à recevoir le code des chapitres suivants.

**Préparation** : Node.js installé (chapitre 2), un terminal.

**Étapes détaillées** :
1. Crée le dossier du projet et initialise npm : `mkdir mon-api && cd mon-api && npm init -y`.
2. Crée l'arborescence complète de dossiers de la section 5.2 (`src/config`, `src/controllers`, `src/services`, `src/repositories`, `src/models`, `src/routes`, `src/middlewares`, `src/validators`, `src/utils`, `src/errors`, `tests/unit`, `tests/integration`).
3. Installe Express : `npm install express`.
4. Crée `src/app.js` et `server.js` avec le contenu de la section 5.5.
5. Crée `.env.example` avec au moins `PORT=3000`, puis copie-le en `.env`.
6. Vérifie que `.gitignore` contient bien `node_modules/` et `.env`.
7. Lance `node server.js` et confirme dans le terminal que le message de démarrage s'affiche.

**Validation** : la commande `node server.js` doit démarrer sans erreur et afficher le port utilisé.

**Résultat attendu** : un squelette de projet vide mais structuré, dans lequel chaque chapitre suivant du manuel viendra ajouter du contenu au bon endroit, sans jamais avoir à réorganiser quoi que ce soit.

**Dépannage** : si `node server.js` échoue avec "Cannot find module './src/app'", vérifie le chemin relatif exact et l'orthographe du nom de fichier — une erreur fréquente à ce stade.

**Nettoyage** : aucun, ce projet sert de base aux ateliers des chapitres suivants si tu choisis de le poursuivre.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Mélanger logique métier et code HTTP dans les contrôleurs</span>

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

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Démarrer le serveur directement dans app.js</span>
Appeler `.listen()` dans `app.js` au lieu de `server.js` empêche d'importer l'application dans un test (Supertest, chapitre 30) sans ouvrir un vrai port réseau — une source fréquente de tests qui échouent en CI à cause d'un port déjà occupé.
</div>

## Débogage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : "port already in use" (EADDRINUSE) au démarrage</span>

- **Cause** : un processus précédent (souvent une instance de `node server.js` mal arrêtée) occupe déjà le port configuré.
- **Diagnostic** : sur macOS/Linux, `lsof -i :3000` ; sur Windows, `netstat -ano | findstr :3000` identifie le processus fautif.
- **Solution** : arrêter ce processus (`kill <pid>` ou l'équivalent Windows), ou changer temporairement le port via `.env`.
</div>

## En entreprise

- **Convention d'équipe documentée** : la plupart des équipes figent cette structure de dossiers dans un `README.md` ou un guide de contribution, pour qu'un nouveau développeur sache immédiatement où placer chaque type de code.
- **Générateurs de squelette internes** : certaines équipes automatisent la création de cette arborescence via un générateur CLI interne (`npx creer-projet mon-api`), pour garantir une cohérence stricte entre tous les projets de l'organisation.
- **Erreur classique observée** : un projet qui commence "vite fait, on rangera plus tard" (exactement la mise en situation d'ouverture) accumule une dette de réorganisation qui devient un chantier à part entière, généralement repoussé indéfiniment faute de valeur "visible" pour le client.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi séparer app.js et server.js ?"**
Réponse attendue : pour permettre de tester l'application (via Supertest, par exemple) sans démarrer un vrai serveur réseau — l'objet `app` exporté par `app.js` peut être utilisé directement par les tests, en s'affranchissant du port réseau et de sa gestion.

**Q2. "Que mets-tu dans un contrôleur, et que ne dois-tu jamais y mettre ?"**
Réponse attendue : un contrôleur extrait les données de la requête HTTP (`req.body`, `req.params`) et appelle le service adéquat, puis formate la réponse HTTP — il ne doit jamais contenir de requête à la base de données ni de règle métier complexe, qui appartiennent respectivement au repository et au service.

**Q3. "Que fait .env.example que .env ne fait pas ?"**
Réponse attendue : `.env.example` documente, dans Git, la liste des variables attendues sans exposer de vraies valeurs ; `.env` contient les vraies valeurs et n'est jamais commité.
</div>

## Optimisation, sécurité et maintenabilité

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Une architecture en couches bien respectée facilite grandement l'ajout d'une nouvelle fonctionnalité : on sait immédiatement dans quel dossier chaque nouveau fichier doit aller, réduisant le temps d'orientation dans un projet inconnu (exactement le problème vécu dans la mise en situation d'ouverture).
</div>

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
`.env.example` ne doit **jamais** contenir de vraie valeur de secret, même "juste pour tester" — une habitude relâchée sur ce fichier commité finit tôt ou tard par y laisser passer une vraie clé.
</div>

## Résumé du chapitre

- Une architecture organisée (`controllers`, `services`, `repositories`, `routes`, `middlewares`) évite la dégradation d'un projet qui grandit.
- `app.js` (configuration Express) et `server.js` (démarrage réseau) sont séparés pour faciliter les tests.
- `.env.example` documente les variables d'environnement attendues sans exposer de valeurs réelles.
- Le flux requête → route → middleware → contrôleur → service → repository → base de données structure toute la suite du manuel.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM</span>

1. Que contient le dossier `repositories/` ?
   - a) Les routes Express
   - b) L'accès aux données (requêtes vers la base de données)
   - c) La configuration du serveur
   - d) Les tests unitaires

2. Pourquoi séparer app.js et server.js ?
   - a) Pour respecter une mode de l'écosystème Node.js
   - b) Pour permettre de tester l'application sans ouvrir un vrai port réseau
   - c) Parce qu'Express l'exige techniquement
   - d) Il n'y a aucune raison particulière

3. Que doit contenir .env.example ?
   - a) Les vraies valeurs de production
   - b) La liste des variables attendues, sans valeurs réelles
   - c) Rien, ce fichier est optionnel et inutile
   - d) Le code source de l'application

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un contrôleur peut directement exécuter une requête SQL pour aller plus vite. — **Faux** (rôle du repository, pas du contrôleur).
2. `.env` doit être commité pour que l'équipe partage les mêmes valeurs. — **Faux** (jamais commité, `.env.example` documente sans exposer).
3. La structure de dossiers doit être mise en place dès le début du projet, pas ajoutée plus tard. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Question ouverte</span>

Explique pourquoi le contrôleur de l'erreur fréquente n°1 (section précédente) est difficile à tester unitairement, comparé à une version qui déléguerait à un service et un repository séparés.

**Corrigé** : le contrôleur mélangé nécessite de simuler une vraie requête HTTP (`req`/`res`) **et** une vraie connexion à la base de données pour tester la moindre règle métier (ici, la vérification d'email déjà utilisé) — deux dépendances lourdes à simuler ensemble. En séparant la logique dans un service pur (qui reçoit des données déjà extraites, sans `req`/`res`) et un repository (isolé derrière une interface simple), on peut tester la règle métier avec de simples valeurs JavaScript, sans jamais démarrer de serveur ni de vraie base de données (approfondi au chapitre 29).
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 5.1</span>

Crée la structure de dossiers complète d'un nouveau projet `mon-api` (comme en section 5.2), avec un `app.js` minimal exportant une instance Express, et un `server.js` qui l'importe et démarre le serveur sur le port défini par la variable d'environnement `PORT` (ou 3000 par défaut).
</div>

**Corrigé :** Voir le code des sections 5.2 et 5.5 — la structure de dossiers et les deux fichiers `app.js`/`server.js` constituent exactement la réponse attendue.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais créer l'arborescence de dossiers complète d'un projet Express professionnel.</li>
<li>☐ Je comprends pourquoi app.js et server.js sont séparés.</li>
<li>☐ Je sais expliquer le flux route → middleware → contrôleur → service → repository → base de données.</li>
<li>☐ Je sais différencier .env et .env.example.</li>
<li>☐ J'ai créé un projet vide suivant cette structure (atelier 5).</li>
</ul>

## FAQ

<dl class="faq">
<dt>Cette structure de dossiers est-elle obligatoire, ou juste une suggestion ?</dt>
<dd>C'est une convention largement répandue dans l'écosystème Node.js/Express, pas une obligation technique imposée par le framework lui-même. Ce manuel s'y tient de façon cohérente sur les 47 chapitres suivants pour que tu puisses t'y référer sans ambiguïté, mais une équipe peut légitimement adapter les noms de dossiers à ses propres conventions, tant que la séparation des responsabilités reste claire.</dd>

<dt>Faut-il créer tous les dossiers dès le début, même vides ?</dt>
<dd>Oui, c'est recommandé : cela documente immédiatement l'architecture prévue, même avant d'avoir écrit le moindre contrôleur ou service. Un dossier vide avec un `.gitkeep` ne coûte rien et évite d'avoir à se demander plus tard "où est-ce que je range ça".</dd>

<dt>Que faire si mon projet est trop petit pour justifier toute cette structure ?</dt>
<dd>Pour un script ponctuel ou un prototype jetable, cette structure complète serait effectivement disproportionnée. Elle prend tout son sens dès qu'un projet est destiné à durer, évoluer, ou être repris par d'autres développeurs — le cas de la quasi-totalité des projets professionnels couverts par ce manuel.</dd>
</dl>

## Références et pour aller plus loin

- Guide des bonnes pratiques Node.js (communauté open source) : [https://github.com/goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices)
- Documentation Express — structuration d'une application : [https://expressjs.com/en/starter/faq.html](https://expressjs.com/en/starter/faq.html)

*Chapitre suivant : les modules CommonJS et ES Modules, les deux systèmes de modularisation du code en Node.js.*
