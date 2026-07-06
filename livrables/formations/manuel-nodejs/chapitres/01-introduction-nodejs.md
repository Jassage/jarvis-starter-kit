<div class="chapitre-titre-num">CHAPITRE 1</div>

# Introduction à Node.js

## Objectifs pédagogiques

Comprendre ce qu'est Node.js, pourquoi il a transformé le développement backend, comment fonctionne son moteur d'exécution (V8) et sa boucle d'événements, et dans quels cas il constitue un bon choix technique.

## 1.1 Qu'est-ce que Node.js

**Node.js** n'est ni un langage, ni un framework : c'est un **environnement d'exécution** (*runtime*) qui permet d'exécuter du JavaScript **en dehors d'un navigateur**, côté serveur. Créé par Ryan Dahl en 2009, Node.js repose sur le moteur JavaScript **V8** de Google Chrome, auquel il ajoute des capacités que le JavaScript de navigateur n'a jamais eues nativement : accès au système de fichiers, création de serveurs réseau, gestion de processus système.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Le JavaScript du navigateur, c'est comme un cuisinier qui ne peut travailler que dans une cuisine de démonstration fermée (le "bac à sable" du navigateur, isolé du système pour la sécurité) : il peut manipuler des ingrédients affichés à l'écran (le DOM), mais pas ouvrir le frigo du restaurant (le système de fichiers) ni répondre au téléphone (les connexions réseau brutes). Node.js donne à ce même cuisinier un accès complet à la cuisine réelle : fichiers, réseau, processus.
</div>

## 1.2 Pourquoi Node.js a changé le développement backend

Avant Node.js, le JavaScript vivait exclusivement dans le navigateur ; le backend s'écrivait dans un langage différent (PHP, Java, Python, Ruby...). Node.js a permis d'utiliser **le même langage** des deux côtés (frontend et backend), avec des bénéfices concrets :

- **Un seul langage, une seule équipe** : les développeurs peuvent contribuer au frontend et au backend sans changer de paradigme mental.
- **Partage de code** : des fonctions de validation, des types (surtout en TypeScript), des modèles de données peuvent être partagés entre client et serveur.
- **Écosystème npm** : le plus grand registre de paquets open source au monde (plus d'un million de paquets), accélérant considérablement le développement.
- **Performances réseau élevées** : Node.js excelle sur les charges de travail à forte concurrence I/O (beaucoup de requêtes réseau/fichiers simultanées), grâce à son modèle non bloquant (section 1.4).

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
Les tâches **intensives en calcul pur** (traitement d'image lourd, calcul scientifique, machine learning entraîné en direct) : le modèle mono-thread de Node.js (section 1.4) traite mal ce genre de charge, qui bloquerait la boucle d'événements pour toutes les autres requêtes. Ces besoins sont mieux couverts par des langages compilés (Go, Rust) ou en déléguant le calcul à un service spécialisé (Python pour le ML, par exemple).
</div>

## 1.4 Le moteur V8 et la compilation JIT

**V8** est le moteur JavaScript open source de Google, également utilisé dans Chrome. Contrairement à un langage purement interprété ligne par ligne, V8 utilise la **compilation JIT** (*Just-In-Time*) : il compile le JavaScript en code machine natif **à la volée**, pendant l'exécution, ce qui explique les performances élevées de Node.js malgré la réputation historique de lenteur des langages interprétés.

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

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur de compréhension fréquente : "Node.js est multi-thread"</span>
Le code JavaScript **applicatif** s'exécute sur un **seul thread**. Ce qui est parallélisé, c'est le travail **délégué** (I/O disque, réseau, certaines opérations cryptographiques) via la bibliothèque **libuv** et son pool de threads système, invisible au code JavaScript. Écrire du code JavaScript qui bloque ce thread unique (une boucle de calcul très longue, une fonction cryptographique synchrone coûteuse) bloque **toute l'application**, y compris les requêtes des autres utilisateurs — un piège de performance fondamental abordé au chapitre 40.
</div>

## 1.6 Node.js vs les alternatives

| Critère | Node.js | Python (Django/Flask) | Java (Spring) | PHP |
|---|---|---|---|---|
| Modèle de concurrence | Non bloquant, mono-thread + event loop | Principalement synchrone (multi-process/thread) | Multi-thread natif | Multi-process (une requête = un process) |
| Performance I/O concurrente | Excellente | Correcte (selon serveur WSGI) | Bonne | Correcte |
| Écosystème de paquets | npm (le plus vaste) | pip | Maven/Gradle | Composer |
| Langage partagé avec le frontend | Oui (JavaScript/TypeScript) | Non | Non | Non |
| Courbe d'apprentissage | Douce si JS déjà connu | Douce | Plus raide (verbosité, JVM) | Douce |

## 1.7 L'écosystème que ce manuel va couvrir

- **Express.js** : le framework web minimaliste standard pour construire des API (chapitres 13-18).
- **Sécurité** : JWT, bcrypt, Helmet, RBAC (chapitres 22-25).
- **Bases de données** : PostgreSQL, MySQL, MongoDB, avec Prisma, Sequelize, Mongoose (chapitres 31-36).
- **Tests** : Jest et Supertest (chapitres 29-30).
- **Conteneurisation** : Docker et Docker Compose (chapitres 37-38).

## 1.8 Erreurs fréquentes à ce stade

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre Node.js et JavaScript</span>
JavaScript est le **langage** ; Node.js est un **environnement d'exécution** de ce langage. Le JavaScript que tu écris pour Node.js n'a pas accès à `window`, `document` ou aux API du navigateur (elles n'existent pas côté serveur) — mais dispose en échange de modules comme `fs` (fichiers) ou `http` (réseau), absents du navigateur.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Croire que "non bloquant" veut dire "plus rapide dans l'absolu"</span>
Le modèle non bloquant de Node.js excelle sur la **concurrence** (gérer beaucoup d'opérations I/O simultanées), pas nécessairement sur la **vitesse brute** d'un calcul unique. Un calcul purement mathématique intensif s'exécutera à une vitesse comparable (ou parfois inférieure) à d'autres langages compilés — le vrai avantage de Node.js apparaît quand l'application passe le plus clair de son temps à **attendre** des I/O (disque, réseau, base de données), ce qui est le cas de la quasi-totalité des API REST.
</div>

## 1.9 Résumé du chapitre

- Node.js est un environnement d'exécution JavaScript côté serveur, basé sur le moteur V8.
- Son modèle non bloquant (event loop + libuv) permet à un thread unique de gérer un grand nombre d'opérations I/O concurrentes sans les attendre bloquant l'application.
- Bon choix pour les API REST, le temps réel et les microservices ; moins adapté aux calculs intensifs purs.
- Ce manuel couvre Express.js, la sécurité, les bases de données, les tests, Docker et un projet final complet (API de gestion hospitalière).

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.1</span>

Explique, en tes propres mots, pourquoi une application Node.js qui exécute une boucle de calcul très longue (par exemple, calculer les nombres premiers jusqu'à 100 millions de façon synchrone) ralentit **toutes** les requêtes des utilisateurs connectés, même celles qui n'ont rien à voir avec ce calcul.
</div>

**Corrigé :** Le code JavaScript applicatif s'exécute sur un **seul thread**. Tant que ce thread est occupé à exécuter la boucle de calcul (une opération synchrone et bloquante), il ne peut traiter **aucune autre tâche** — y compris répondre aux requêtes d'autres utilisateurs, qui restent en attente dans la file jusqu'à ce que le thread principal se libère. C'est l'exact opposé d'une opération I/O (lecture de fichier, requête réseau), qui elle est déléguée en arrière-plan et libère immédiatement le thread principal.

*Chapitre suivant : installation de Node.js et gestion des versions.*
