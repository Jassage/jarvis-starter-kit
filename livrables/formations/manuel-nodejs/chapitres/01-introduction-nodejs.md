<div class="chapitre-titre-num">CHAPITRE 1</div>

# Introduction à Node.js

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre ce qu'est Node.js, pourquoi il a transformé le développement backend, comment fonctionne son moteur d'exécution (V8) et sa boucle d'événements (*event loop*), et dans quels cas il constitue un bon choix technique — ou non. À la fin de ce chapitre, tu sauras expliquer avec tes propres mots pourquoi une API Node.js peut gérer des milliers de requêtes simultanées sans "bloquer", et tu seras capable de justifier, avec des arguments techniques et non une intuition, si Node.js convient à un projet donné.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Imagine que tu rejoins une jeune entreprise haïtienne qui développe une application de gestion pour des cliniques privées. L'équipe est petite : deux développeurs, un designer, et toi. Le CTO t'explique que le frontend est déjà en React, et qu'il souhaite que le backend soit "dans le même langage, pour que tout le monde puisse toucher à tout si besoin." Il te pose une question directe : <em>"Est-ce qu'on part sur Node.js, ou est-ce qu'on prend quelque chose de plus 'sérieux' comme Java ou Django ?"</em> Il attend de toi une réponse argumentée, pas une préférence personnelle. Ce chapitre te donne exactement les arguments techniques nécessaires pour répondre à cette question — une question que tu retrouveras, sous une forme ou une autre, dans presque toutes tes missions freelance et dans la plupart de tes entretiens techniques.
</div>

## 1.1 Qu'est-ce que Node.js

**Node.js** n'est ni un langage, ni un framework : c'est un **environnement d'exécution** (*runtime*) qui permet d'exécuter du JavaScript **en dehors d'un navigateur**, côté serveur. Créé par Ryan Dahl en 2009, Node.js repose sur le moteur JavaScript **V8** de Google Chrome, auquel il ajoute des capacités que le JavaScript de navigateur n'a jamais eues nativement : accès au système de fichiers, création de serveurs réseau, gestion de processus système.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Le JavaScript du navigateur, c'est comme un cuisinier qui ne peut travailler que dans une cuisine de démonstration fermée (le "bac à sable" du navigateur, isolé du système pour la sécurité) : il peut manipuler des ingrédients affichés à l'écran (le DOM), mais pas ouvrir le frigo du restaurant (le système de fichiers) ni répondre au téléphone (les connexions réseau brutes). Node.js donne à ce même cuisinier un accès complet à la cuisine réelle : fichiers, réseau, processus.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Node.js = moteur V8 (exécute le JavaScript) + bibliothèque <strong>libuv</strong> (boucle d'événements, opérations non bloquantes, accès système) + un ensemble de modules natifs (<code>fs</code>, <code>http</code>, <code>path</code>...). Rien de plus, rien de moins. Express, que tu découvriras au chapitre 13, n'est qu'une bibliothèque construite <strong>par-dessus</strong> ce socle — pas une brique de Node.js lui-même.
</div>

## 1.2 Pourquoi Node.js a changé le développement backend

Avant Node.js, le JavaScript vivait exclusivement dans le navigateur ; le backend s'écrivait dans un langage différent (PHP, Java, Python, Ruby...). Node.js a permis d'utiliser **le même langage** des deux côtés (frontend et backend), avec des bénéfices concrets :

- **Un seul langage, une seule équipe** : les développeurs peuvent contribuer au frontend et au backend sans changer de paradigme mental.
- **Partage de code** : des fonctions de validation, des types (surtout en TypeScript), des modèles de données peuvent être partagés entre client et serveur.
- **Écosystème npm** : le plus grand registre de paquets open source au monde (plus d'un million de paquets), accélérant considérablement le développement.
- **Performances réseau élevées** : Node.js excelle sur les charges de travail à forte concurrence I/O (beaucoup de requêtes réseau/fichiers simultanées), grâce à son modèle non bloquant (section 1.5).

<div class="encadre mauvaise-pratique">
<span class="encadre-titre">❌ Mauvaise pratique</span>
Croire que "même langage partout" veut dire "même code partout, sans réflexion". Un composant React qui gère un clic utilisateur et une route Express qui traite une requête HTTP obéissent à des contraintes radicalement différentes (sécurité, concurrence, durée de vie du processus). Le langage est partagé ; les réflexes, eux, doivent rester spécifiques à chaque environnement.
</div>

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — les 4 raisons du succès de Node.js</span>
1. Un seul langage frontend/backend (JavaScript).
2. Partage de code et de types possible entre client et serveur.
3. npm, l'écosystème de paquets le plus vaste au monde.
4. Excellentes performances sur les charges I/O concurrentes (le cas de la quasi-totalité des API REST).
</div>

## 1.3 Cas d'usage typiques

<div class="encadre astuce">
<span class="encadre-titre">💡 Bon choix pour...</span>
- Des **API REST** consommées par des applications web ou mobiles (le sujet central de ce manuel).
- Des applications **temps réel** (chat, notifications live, tableaux de bord) via WebSockets.
- Des **microservices** légers et rapides à démarrer.
- Des outils **CLI** et scripts d'automatisation (npm lui-même est écrit en Node.js).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Moins adapté pour...</span>
Les tâches **intensives en calcul pur** (traitement d'image lourd, calcul scientifique, machine learning entraîné en direct) : le modèle mono-thread de Node.js (section 1.5) traite mal ce genre de charge, qui bloquerait la boucle d'événements pour toutes les autres requêtes. Ces besoins sont mieux couverts par des langages compilés (Go, Rust), en déléguant le calcul à un service spécialisé (Python pour le ML, par exemple), ou en utilisant le module natif <code>worker_threads</code> pour sortir le calcul du thread principal — une solution de contournement, pas un remède miracle, abordée au chapitre 40.
</div>

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — une remarque à ce stade</span>
npm étant un registre **ouvert**, n'importe qui peut y publier un paquet. Le corollaire de "l'écosystème le plus vaste au monde" est aussi "l'écosystème le plus exposé aux dépendances malveillantes ou mal maintenues". Ce sujet est traité en détail au chapitre 25 (sécurité), mais retiens dès maintenant ce réflexe : une dépendance ajoutée sans réflexion est une porte que tu ouvres sur ton propre serveur.
</div>

## 1.4 Le moteur V8 et la compilation JIT

**V8** est le moteur JavaScript open source de Google, également utilisé dans Chrome. Contrairement à un langage purement interprété ligne par ligne, V8 utilise la **compilation JIT** (*Just-In-Time*) : il compile le JavaScript en code machine natif **à la volée**, pendant l'exécution, ce qui explique les performances élevées de Node.js malgré la réputation historique de lenteur des langages interprétés.

Concrètement, V8 procède en plusieurs étapes :

1. **Ignition** (l'interpréteur) exécute d'abord le code tel quel, rapidement, sans optimisation.
2. Pendant ce temps, V8 observe quelles fonctions sont appelées **souvent** ("fonctions chaudes") et avec quels types d'arguments.
3. **TurboFan** (le compilateur optimisant) recompile ces fonctions chaudes en code machine hautement optimisé, en supposant que les types observés resteront stables.
4. Si cette hypothèse est violée plus tard (une fonction reçoit soudain un type différent), V8 **désoptimise** silencieusement la fonction et repasse par une version plus lente — un coût de performance invisible dans le code, mais bien réel à l'exécution.

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance — pourquoi la forme d'un objet compte</span>
V8 optimise fortement les objets dont la <strong>forme</strong> (l'ensemble de propriétés, dans un ordre stable) ne change pas après leur création. Créer des objets avec toujours les mêmes propriétés, dans le même ordre, permet à V8 de générer du code machine plus rapide (via des "hidden classes" internes). Ajouter ou supprimer des propriétés dynamiquement après coup sur des objets qui transitent par du code chaud (une boucle exécutée des milliers de fois, par exemple) peut casser cette optimisation. Ce n'est pas un point à sur-optimiser dès le premier projet, mais un réflexe utile à connaître avant d'écrire du code critique en performance (approfondi au chapitre 40).
</div>

## 1.5 Le modèle non bloquant et la boucle d'événements (Event Loop)

C'est **le** concept fondamental à comprendre avant tout le reste de ce manuel. Node.js exécute le JavaScript sur un **seul thread principal**, mais gère les opérations lentes (lecture de fichier, requête réseau, requête base de données) de façon **non bloquante**, déléguées en coulisses puis traitées via une file d'événements.

```{.uml}
Requete arrive
      │
      ▼
Thread principal (Event Loop) execute le code synchrone
      │
      ├──► Operation lente (lecture fichier, requete BDD) ────► déléguée en arrière-plan
      │                                                          (libc / thread pool / OS)
      ▼
Thread principal reste LIBRE, traite d'autres requêtes pendant ce temps
      │
      ◄── Callback rappelé dès que l'opération lente se termine
      │
      ▼
Le résultat est traité, la réponse envoyée
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie : un serveur de restaurant, pas un cuisinier par table</span>
Imagine un restaurant avec **un seul serveur** (le thread principal) mais plusieurs tables (requêtes). Un modèle **bloquant** obligerait le serveur à rester devant une table pendant que la cuisine prépare le plat (opération lente), sans pouvoir s'occuper des autres tables. Le modèle **non bloquant** de Node.js permet au serveur de **prendre la commande**, la transmettre à la cuisine, **puis aller immédiatement s'occuper d'une autre table**, revenant seulement quand la cuisine sonne "plat prêt" (le callback). Un seul serveur peut ainsi gérer énormément de tables, tant que la cuisine (le système d'exploitation, la base de données) fait le vrai travail lourd en parallèle.
</div>

Vue de plus près, la boucle d'événements n'est pas une file unique mais une succession de **phases**, chacune traitant un type précis de tâches en attente avant de passer à la suivante :

```{.uml}
   ┌────────────────────────────┐
   │         timers             │  <- callbacks de setTimeout / setInterval arrivés à echeance
   └──────────────┬─────────────┘
                  ▼
   ┌────────────────────────────┐
   │    pending callbacks       │  <- callbacks systeme differes (ex. erreurs TCP)
   └──────────────┬─────────────┘
                  ▼
   ┌────────────────────────────┐
   │     poll (le coeur)        │  <- recupere les nouveaux evenements I/O, execute leurs callbacks
   └──────────────┬─────────────┘        (lecture fichier, reponse reseau/BDD terminee...)
                  ▼
   ┌────────────────────────────┐
   │         check              │  <- callbacks setImmediate()
   └──────────────┬─────────────┘
                  ▼
   ┌────────────────────────────┐
   │     close callbacks        │  <- ex. socket.on('close', ...)
   └──────────────┬─────────────┘
                  │
                  └──────────► retour a la phase "timers" (nouveau tour de boucle)
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur de compréhension fréquente : "Node.js est multi-thread"</span>
Le code JavaScript **applicatif** s'exécute sur un **seul thread**. Ce qui est parallélisé, c'est le travail **délégué** (I/O disque, réseau, certaines opérations cryptographiques) via la bibliothèque **libuv** et son pool de threads système, invisible au code JavaScript. Écrire du code JavaScript qui bloque ce thread unique (une boucle de calcul très longue, une fonction cryptographique synchrone coûteuse) bloque **toute l'application**, y compris les requêtes des autres utilisateurs — un piège de performance fondamental abordé au chapitre 40.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique</span>
Considère toute opération qui prend "un certain temps" (lire un fichier, interroger une base de données, appeler une API externe, hacher un mot de passe) comme une candidate naturelle à une API **asynchrone**. Les chapitres 8 à 10 couvrent en détail les trois façons de l'écrire (callbacks, promesses, <code>async</code>/<code>await</code>) — retiens pour l'instant seulement le principe : ne jamais faire attendre le thread principal pour rien.
</div>

## 1.6 Node.js vs les alternatives

| Critère | Node.js | Python (Django/Flask) | Java (Spring) | PHP |
|---|---|---|---|---|
| Modèle de concurrence | Non bloquant, mono-thread + event loop | Principalement synchrone (multi-process/thread) | Multi-thread natif | Multi-process (une requête = un process) |
| Performance I/O concurrente | Excellente | Correcte (selon serveur WSGI) | Bonne | Correcte |
| Écosystème de paquets | npm (le plus vaste) | pip | Maven/Gradle | Composer |
| Langage partagé avec le frontend | Oui (JavaScript/TypeScript) | Non | Non | Non |
| Courbe d'apprentissage | Douce si JS déjà connu | Douce | Plus raide (verbosité, JVM) | Douce |

<div class="encadre astuce">
<span class="encadre-titre">💡 Pour aller plus loin — Deno et Bun</span>
Deno (créé par Ryan Dahl lui-même, en réaction à certains choix de conception de Node.js) et Bun (plus récent, écrit en Zig) sont des runtimes JavaScript concurrents, avec une sécurité par permissions plus stricte (Deno) ou une vitesse de démarrage très supérieure (Bun). Ils restent minoritaires en entreprise en 2026 comparés à Node.js, dont l'écosystème npm et la maturité en production restent largement dominants — ce manuel se concentre sur Node.js, le choix le plus sûr pour un premier poste ou une première mission freelance.
</div>

## 1.7 L'écosystème que ce manuel va couvrir

```{.uml}
Manuel complet Node.js et Express
│
├─ Partie 1-2 : Fondamentaux Node.js + JS moderne et asynchrone (ch. 1-12)
│
├─ Partie 3 : Express.js et architecture (MVC, couches)         (ch. 13-18)
│
├─ Partie 4 : Robustesse d'une API (erreurs, logs, pagination)  (ch. 19-21)
│
├─ Partie 5 : Securite et authentification (JWT, RBAC, bcrypt)  (ch. 22-25)
│
├─ Partie 6 : Fonctionnalites avancees (upload, email, Swagger) (ch. 26-28)
│
├─ Partie 7 : Tests (Jest, Supertest)                           (ch. 29-30)
│
├─ Partie 8 : Bases de donnees et ORM (Postgres/MySQL/Mongo)    (ch. 31-36)
│
├─ Partie 9 : Conteneurisation et deploiement (Docker)          (ch. 37-40)
│
└─ Partie 10 : Projet fil rouge MediAPI (de zero a deploye)     (ch. 41-47)
```

- **Express.js** : le framework web minimaliste standard pour construire des API (chapitres 13-18).
- **Sécurité** : JWT, bcrypt, Helmet, RBAC (chapitres 22-25).
- **Bases de données** : PostgreSQL, MySQL, MongoDB, avec Prisma, Sequelize, Mongoose (chapitres 31-36).
- **Tests** : Jest et Supertest (chapitres 29-30).
- **Conteneurisation** : Docker et Docker Compose (chapitres 37-38).
- **Projet fil rouge** : à partir du chapitre 41, tu construiras **MediAPI**, une API complète de gestion hospitalière (patients, consultations, rendez-vous), en réutilisant absolument tout ce que ce manuel t'aura appris.

## Aperçu pratique

<div class="encadre capture">
<span class="encadre-titre">📷 Capture d'écran recommandée</span>
Une fenêtre de terminal (PowerShell sur Windows, Terminal sur macOS/Linux) affichant successivement les commandes <code>node -v</code> et <code>npm -v</code>, avec leurs numéros de version en sortie. Si l'une des deux commandes affiche une erreur du type "commande introuvable", ce sera le point de départ exact du chapitre 2.
</div>

Avant de continuer, un rapide test ne coûte rien : ouvre un terminal et tape `node -v`. Si un numéro de version s'affiche (par exemple `v20.11.0`), Node.js est déjà installé sur ta machine et tu pourras avancer plus vite au chapitre 2. Sinon, ne t'inquiète pas : l'installation complète, avec gestion des versions via nvm, fait l'objet du chapitre suivant.

## Atelier — Reconnaître un bon cas d'usage Node.js

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 1 — Node.js ou pas Node.js ?</span>

**Objectif** : s'entraîner à juger, à partir d'un besoin métier, si Node.js est un choix technique pertinent — la compétence la plus utile de ce chapitre pour un entretien ou une mission freelance.

**Préparation** : aucune installation nécessaire, cet atelier est un exercice d'analyse. Prends une feuille ou un fichier texte.

**Étapes détaillées** :

1. Pour chacun des quatre scénarios suivants, écris une réponse "Oui", "Non" ou "Oui, avec une réserve", puis une justification en une phrase en t'appuyant sur les sections 1.3 et 1.5 :
   - a) Une API qui reçoit des commandes e-commerce et interroge une base de données pour chaque requête.
   - b) Un service qui redimensionne et compresse des milliers de photos haute résolution en continu.
   - c) Un tableau de bord qui affiche en direct les commandes de plusieurs cuisines de restaurant (mises à jour en temps réel).
   - d) Un moteur de calcul scientifique qui simule une trajectoire physique pendant plusieurs minutes en continu.
2. Compare tes réponses à la section "Résultat attendu" ci-dessous.
3. Pour chaque réponse où tu t'es trompé, relis la section correspondante (1.3 ou 1.5) avant de continuer.

**Résultat attendu** :
- a) **Oui** — charge I/O (réseau + base de données), le cas central pour lequel Node.js excelle.
- b) **Non, ou avec réserve** — calcul intensif CPU ; à déléguer à `worker_threads`, à un service écrit dans un langage compilé, ou à une file de tâches externe.
- c) **Oui** — cas d'usage temps réel typique (WebSockets), l'un des points forts historiques de Node.js.
- d) **Non** — calcul CPU pur et prolongé, bloquerait le thread principal ; un langage comme Go, Rust ou Python (avec des bibliothèques compilées) est mieux adapté.

**Dépannage** : si tu hésites entre "Oui" et "Non" pour un scénario, pose-toi une seule question — *"Cette tâche passe-t-elle le plus clair de son temps à attendre (réseau, disque, base de données) ou à calculer (CPU) ?"* Attendre → Node.js brille. Calculer intensément et longtemps → Node.js n'est pas le premier choix.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre Node.js et JavaScript</span>
JavaScript est le **langage** ; Node.js est un **environnement d'exécution** de ce langage. Le JavaScript que tu écris pour Node.js n'a pas accès à `window`, `document` ou aux API du navigateur (elles n'existent pas côté serveur) — mais dispose en échange de modules comme `fs` (fichiers) ou `http` (réseau), absents du navigateur.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Croire que "non bloquant" veut dire "plus rapide dans l'absolu"</span>
Le modèle non bloquant de Node.js excelle sur la **concurrence** (gérer beaucoup d'opérations I/O simultanées), pas nécessairement sur la **vitesse brute** d'un calcul unique. Un calcul purement mathématique intensif s'exécutera à une vitesse comparable (ou parfois inférieure) à d'autres langages compilés — le vrai avantage de Node.js apparaît quand l'application passe le plus clair de son temps à **attendre** des I/O (disque, réseau, base de données), ce qui est le cas de la quasi-totalité des API REST.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Penser que Node.js "ne peut pas" faire du calcul intensif</span>
Node.js le <em>peut</em> techniquement — rien ne l'en empêche syntaxiquement — mais le faire de façon synchrone sur le thread principal **dégrade toute l'application** pendant le calcul. La bonne réponse n'est pas "évite Node.js", mais "sors le calcul du thread principal" (via <code>worker_threads</code>, une file de jobs, ou un service dédié), un sujet approfondi au chapitre 40.
</div>

## Débogage

Même sans avoir encore écrit une ligne de code applicative, deux situations reviennent systématiquement pour un débutant à ce stade :

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : "mon serveur semble figé, plus aucune requête ne répond"</span>

- **Diagnostic** : c'est presque toujours le signe d'une opération **synchrone et longue** exécutée sur le thread principal (une grosse boucle de calcul, une lecture de fichier synchrone sur un fichier volumineux, un appel cryptographique synchrone).
- **Comment vérifier** : si le processus Node.js utilise 100% d'un cœur CPU dans le gestionnaire de tâches pendant que rien ne répond, c'est le symptôme confirmé.
- **Résolution** : remplacer l'opération bloquante par son équivalent asynchrone (couvert en détail aux chapitres 8 à 11), ou la déporter dans un `worker_threads` si le calcul est réellement incompressible.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : "node: command not found" ou "'node' n'est pas reconnu"</span>

- **Diagnostic** : Node.js n'est pas installé, ou son dossier d'installation n'est pas dans la variable d'environnement `PATH` du système.
- **Résolution complète** : traitée en détail au chapitre 2 (installation), avec gestion propre des versions via `nvm`.
</div>

## En entreprise

En contexte professionnel, Node.js est aujourd'hui un choix extrêmement répandu pour les API REST et les services temps réel — utilisé aussi bien par des startups que par de grandes entreprises (Netflix, PayPal, LinkedIn font partie de ses adoptants historiques les plus documentés). Quelques constats qui reviennent en entreprise :

- **Bonne pratique répandue** : verrouiller la version de Node.js utilisée par un projet (fichier `.nvmrc` ou champ `engines` dans `package.json`, voir chapitre 4) pour éviter qu'un comportement diffère entre la machine d'un développeur et le serveur de production.
- **Bonne pratique répandue** : ne jamais choisir Node.js "parce que c'est à la mode", mais parce que le profil de charge (beaucoup d'I/O concurrent) correspond réellement au point fort du runtime — exactement le raisonnement de l'atelier de ce chapitre.
- **Erreur classique observée** : une équipe qui migre un traitement de calcul intensif (génération de rapports PDF volumineux, traitement d'image en masse) directement dans l'API Node.js existante, sans le sortir dans un service ou une file de tâches séparée, provoquant des ralentissements généralisés en production au moment précis où la charge augmente.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Node.js est-il mono-thread ou multi-thread ?"**
Réponse attendue : le code JavaScript applicatif s'exécute sur un seul thread (le thread principal / event loop). Les opérations I/O sont déléguées à un pool de threads système via libuv, invisible au code JavaScript — ce n'est donc "mono-thread" qu'en apparence pour l'exécution du code, pas pour le travail effectué en coulisses.
*Piège fréquent* : répondre simplement "mono-thread" sans nuancer le rôle de libuv laisse penser que le candidat n'a pas compris le mécanisme réel, seulement la formule toute faite.

**Q2. "Pourquoi Node.js est-il performant malgré un seul thread ?"**
Réponse attendue : parce que la quasi-totalité du temps d'une API REST typique est passée à *attendre* des opérations I/O (réseau, disque, base de données), pas à calculer. Le modèle non bloquant permet à ce thread unique de ne jamais rester inactif en attendant : il traite d'autres requêtes pendant que l'I/O se déroule en arrière-plan.

**Q3. "Dans quel cas éviterais-tu Node.js pour un nouveau projet ?"**
Réponse attendue : pour une charge dominée par du calcul CPU intensif et prolongé (traitement d'image en masse, calcul scientifique, entraînement de modèles ML), où le modèle mono-thread devient un handicap plutôt qu'un atout — sauf à déporter ce calcul hors du thread principal.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Ne jamais bloquer le thread principal avec une opération synchrone longue : c'est la règle de performance la plus importante de tout Node.js, et elle sera rappelée à chaque chapitre où elle s'applique concrètement.
</div>

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Choisir des dépendances npm avec discernement dès le premier jour d'un projet (popularité, maintenance active, absence d'alertes de vulnérabilité connues) — un réflexe d'hygiène qui coûte peu et évite beaucoup, détaillé au chapitre 25.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documenter, dès la création d'un projet, la raison du choix de Node.js dans un `README.md` (profil de charge attendu, contraintes d'équipe). Une décision d'architecture non documentée est une décision que la prochaine personne sur le projet devra deviner — ou pire, remettre en question sans contexte.
</div>

## Résumé du chapitre

- Node.js est un environnement d'exécution JavaScript côté serveur, basé sur le moteur V8.
- Son modèle non bloquant (event loop + libuv) permet à un thread unique de gérer un grand nombre d'opérations I/O concurrentes sans les attendre bloquant l'application.
- La boucle d'événements traite les tâches en attente par phases successives (timers, poll, check...), toujours dans le même ordre à chaque tour.
- Bon choix pour les API REST, le temps réel et les microservices ; moins adapté aux calculs intensifs purs, sauf à les sortir du thread principal (`worker_threads`).
- Ce manuel couvre Express.js, la sécurité, les bases de données, les tests, Docker et un projet final complet (API de gestion hospitalière, MediAPI).

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Node.js est :
   - a) Un langage de programmation
   - b) Un framework web
   - c) Un environnement d'exécution JavaScript côté serveur
   - d) Une base de données

2. Le moteur JavaScript utilisé par Node.js est :
   - a) SpiderMonkey
   - b) V8
   - c) Chakra
   - d) JavaScriptCore

3. Quel type de charge Node.js gère-t-il le mieux ?
   - a) Calcul mathématique intensif et prolongé
   - b) Opérations I/O concurrentes (réseau, disque, base de données)
   - c) Rendu 3D en temps réel
   - d) Compilation de code natif

**Corrigé** : 1-c, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Node.js exécute le code JavaScript applicatif sur plusieurs threads en parallèle. — **Faux** (un seul thread principal ; libuv parallélise le travail délégué, pas le code applicatif).
2. Une opération de lecture de fichier en Node.js bloque toujours le thread principal. — **Faux** (si elle est écrite en version asynchrone, ce qui est la norme recommandée).
3. npm est le gestionnaire de paquets historiquement associé à Node.js. — **Vrai**.
4. Node.js est un mauvais choix pour construire une API REST. — **Faux** (c'est au contraire l'un de ses cas d'usage les plus forts).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique, en tes propres mots, la différence entre "le thread applicatif de Node.js" et "le travail effectué par libuv".
2. Un collègue te dit : "On devrait tout réécrire en Node.js, c'est plus rapide que tout le reste." Que lui réponds-tu ?

**Corrigé 1** : le thread applicatif exécute le code JavaScript écrit par le développeur, un seul à la fois, jamais en parallèle. libuv, en coulisses, délègue les opérations lentes (I/O disque/réseau) à un pool de threads système ou à des mécanismes du système d'exploitation, puis notifie le thread applicatif via la boucle d'événements dès que le résultat est prêt — sans jamais faire attendre ce thread pendant l'opération elle-même.

**Corrigé 2** : "Plus rapide" dépend entièrement du profil de charge. Node.js est excellent sur la concurrence I/O, mais pas nécessairement plus rapide qu'un langage compilé sur un calcul CPU pur. Avant de généraliser, il faut identifier si le service concerné passe son temps à attendre (candidat Node.js) ou à calculer (candidat à un langage compilé, ou à une architecture qui isole le calcul).
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.1</span>

Explique, en tes propres mots, pourquoi une application Node.js qui exécute une boucle de calcul très longue (par exemple, calculer les nombres premiers jusqu'à 100 millions de façon synchrone) ralentit **toutes** les requêtes des utilisateurs connectés, même celles qui n'ont rien à voir avec ce calcul.
</div>

**Corrigé :** Le code JavaScript applicatif s'exécute sur un **seul thread**. Tant que ce thread est occupé à exécuter la boucle de calcul (une opération synchrone et bloquante), il ne peut traiter **aucune autre tâche** — y compris répondre aux requêtes d'autres utilisateurs, qui restent en attente dans la file jusqu'à ce que le thread principal se libère. C'est l'exact opposé d'une opération I/O (lecture de fichier, requête réseau), qui elle est déléguée en arrière-plan et libère immédiatement le thread principal.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.2</span>

Reprends le scénario de la mise en situation en ouverture de ce chapitre (l'application de gestion pour cliniques privées). Rédige, en 4 à 6 phrases, la réponse que tu donnerais réellement au CTO — en t'appuyant sur le profil de charge probable d'une telle application (beaucoup de lectures/écritures en base de données, peu de calcul intensif).
</div>

**Corrigé (exemple de réponse) :** Une application de gestion de cliniques traite principalement des opérations CRUD (créer/lire/modifier des dossiers patients, rendez-vous, consultations) : son profil de charge est dominé par des lectures et écritures en base de données, donc par de l'attente I/O — exactement le terrain où Node.js excelle. Le fait que le frontend soit déjà en React est un argument supplémentaire réel (partage de types, une seule équipe capable de contribuer aux deux côtés). Java/Spring resterait un choix défendable si l'équipe avait déjà une forte expertise Java, mais rien dans le profil de charge décrit ne justifie sa complexité additionnelle ici.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je peux expliquer ce qu'est Node.js sans dire "un langage" ni "un framework".</li>
<li>☐ Je comprends le rôle du moteur V8 et de la compilation JIT.</li>
<li>☐ Je sais expliquer la boucle d'événements (event loop) et ses phases principales.</li>
<li>☐ Je comprends pourquoi "non bloquant" ne veut pas dire "plus rapide dans l'absolu".</li>
<li>☐ Je sais reconnaître un bon cas d'usage pour Node.js face à un mauvais.</li>
<li>☐ Je connais au moins 3 raisons pour lesquelles Node.js a changé le développement backend.</li>
<li>☐ J'ai vérifié si Node.js est déjà installé sur ma machine (<code>node -v</code>).</li>
</ul>

## FAQ

<dl class="faq">
<dt>Node.js va-t-il remplacer complètement PHP, Java ou Python ?</dt>
<dd>Non. Chaque écosystème garde des forces propres et une base installée massive en entreprise. Node.js domine sur les API REST et le temps réel ; d'autres langages restent parfaitement pertinents ailleurs (calcul scientifique en Python, systèmes d'entreprise historiques en Java, etc.).</dd>

<dt>Dois-je apprendre TypeScript avant de commencer ce manuel ?</dt>
<dd>Non, ce manuel utilise du JavaScript moderne (couvert au chapitre 7). TypeScript est une compétence précieuse à ajouter ensuite, mais n'est pas un prérequis pour progresser ici.</dd>

<dt>Est-ce que Node.js convient pour un très gros projet d'entreprise ?</dt>
<dd>Oui, à condition de structurer le code correctement (architecture en couches, chapitre 17) et de sortir les traitements intensifs du thread principal quand ils existent. La taille du projet n'est pas le facteur limitant ; le profil de charge l'est.</dd>

<dt>J'ai déjà utilisé JavaScript côté navigateur : est-ce suffisant pour ce manuel ?</dt>
<dd>C'est un excellent point de départ. Les différences essentielles (pas de DOM, accès système, modèle de modules) sont couvertes progressivement dès les prochains chapitres.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Node.js : [https://nodejs.org/docs](https://nodejs.org/docs)
- Documentation du moteur V8 : [https://v8.dev/docs](https://v8.dev/docs)
- Documentation de libuv : [https://docs.libuv.org](https://docs.libuv.org)
- *Node.js Design Patterns*, Mario Casciaro & Luciano Mammino (Packt) — référence approfondie sur l'architecture de projets Node.js.
- Norme ECMAScript (spécification officielle du langage JavaScript) : [https://tc39.es/ecma262/](https://tc39.es/ecma262/)

*Chapitre suivant : installation de Node.js et gestion des versions.*
