# Chapitre 7 — Docker, cours complet

**Niveau : Intermédiaire**

---

## Introduction

Depuis le chapitre 4, chaque logiciel a été installé directement sur le système : `apt install`, `nvm`, des fichiers de configuration modifiés en place. Cette approche fonctionne, mais elle a un coût caché : deux projets aux exigences incompatibles (deux versions de Node, deux versions de PHP) s'accumulent difficilement sur le même serveur, et reproduire exactement le même environnement sur une seconde machine demande de refaire, à la main, toute la séquence d'installation. Ce chapitre introduit Docker en partant de zéro, sans rien supposer acquis au-delà de ce que les chapitres précédents ont déjà enseigné.

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras : expliquer le problème que Docker résout et pourquoi il s'est imposé dans l'industrie ; distinguer précisément une image d'un container ; utiliser les commandes Docker de base ; écrire un `Dockerfile` pour n'importe laquelle des applications du chapitre 6 ; construire une image en build multi-étapes, légère et sécurisée ; comprendre et utiliser les volumes pour ne jamais perdre de données ; comprendre le réseau Docker et faire communiquer plusieurs containers entre eux ; appliquer les bonnes pratiques de production (images légères, sécurité, nettoyage).

## 📋 Prérequis

Chapitre 2 (Linux, notamment les notions de processus et de système de fichiers), Chapitre 6 (au moins une application déployée directement, pour comparaison). Docker installé (chapitre 5, section 5.11).

## Pourquoi ce chapitre est important

"Ça marche sur ma machine" est l'une des phrases les plus coûteuses en temps de développement — un bug qui n'apparaît qu'en production, une dépendance système absente découverte au pire moment. Docker élimine structurellement cette classe entière de problèmes en rendant l'environnement d'exécution lui-même partie intégrante du code versionné. Ce n'est pas une option marginale : c'est aujourd'hui un standard de l'industrie, présent dans la quasi-totalité des offres d'emploi backend et DevOps.

---

## Concepts fondamentaux

1. **Image** — un modèle figé, en lecture seule, empilé en couches.
2. **Container** — une instance en cours d'exécution d'une image, isolée mais légère (pas une VM complète).
3. **Dockerfile** — la recette qui décrit la construction d'une image.
4. **Registre** (Docker Hub) — un dépôt centralisé d'images publiques, l'équivalent npm pour les paquets Docker.
5. **Volume** — un espace de stockage survivant au cycle de vie d'un container.
6. **Réseau Docker** — un espace virtuel permettant à des containers de se joindre par leur nom.

---

## Explications détaillées

### 7.1 Le problème que Docker résout

Avant Docker, une phrase résumait le cauchemar de tout administrateur système : **"ça marche sur ma machine"**. Une application testée en local fonctionne, puis casse une fois déployée, à cause d'une version de Node différente, d'une bibliothèque système absente, d'une variable de configuration oubliée.

> 💡 **Analogie** — Un plat cuisiné chez soi, avec les ustensiles et la cuisinière qu'on connaît, peut être difficile à reproduire à l'identique dans la cuisine d'un ami. Docker, c'est **livrer le plat déjà cuisiné, scellé, avec sa propre cuisine miniature intégrée** : peu importe où on l'ouvre, le résultat est rigoureusement identique.

**Ce que Docker apporte concrètement :**
- **Reproductibilité** : une application packagée se comporte identiquement en local, en test, et en production.
- **Isolation** : chaque application tourne dans son propre environnement (deux projets peuvent utiliser deux versions différentes de Node sur le même serveur, sans le jonglage `nvm` du chapitre 5).
- **Portabilité** : un même package fonctionne sur n'importe quelle machine ayant Docker, Linux, Mac, Windows, ou n'importe quel VPS.

```mermaid
flowchart LR
    Dev["Machine du développeur"] -->|"identique"| CI["Environnement de test/CI"]
    CI -->|"identique"| Prod["Serveur de production"]
```
**Explication du diagramme :** sans Docker, ces trois environnements divergent presque toujours légèrement (versions, configuration système). Avec Docker, l'image construite une fois est **exactement** celle qui tourne partout — la divergence devient structurellement impossible plutôt que simplement évitée par discipline.

> 📌 **À retenir** — Docker n'est **pas** une machine virtuelle complète (chapitre 1, section 1.3) : il partage le noyau Linux de la machine hôte et isole seulement les processus, fichiers et réseau au niveau applicatif. C'est ce qui le rend nettement plus léger et plus rapide à démarrer qu'une VM classique (quelques secondes contre plusieurs minutes).

### 7.2 Image et container

> 💡 **Analogie** — Une **image**, c'est une recette de cuisine complète et figée. Un **container**, c'est le plat réellement cuisiné à partir de cette recette. On peut cuisiner **plusieurs plats identiques** (containers) à partir de la **même recette** (une seule image).

```mermaid
flowchart LR
    D["Dockerfile<br/>(recette)"] -->|"docker build"| I["Image<br/>(plat préparé, prêt à servir)"]
    I -->|"docker run"| C["Container<br/>(plat servi, en cours d'exécution)"]
```

- **Une image** est un modèle en lecture seule, empilé en couches (chaque instruction du `Dockerfile`, section 7.4, ajoute une couche).
- **Un container** est une instance en cours d'exécution d'une image — un processus isolé, avec son propre système de fichiers (basé sur l'image, plus une fine couche modifiable), son propre réseau virtuel, sa propre vue des processus.

> ✅ **Bonne pratique** — Un container doit être considéré comme **jetable** : le supprimer et en recréer un neuf depuis la même image doit toujours être possible sans perte de données importantes. Les données qui doivent survivre à cette suppression vivent dans un **volume** (section 7.6), jamais uniquement dans le container.

### 7.3 Commandes de base

#### `docker run`
**Description :** crée et démarre un container à partir d'une image, la téléchargeant depuis Docker Hub si elle n'est pas déjà présente localement.
**Syntaxe :** `docker run [options] image [commande]`
**Décomposition mot par mot :** *run* — exécuter.
**Options principales :**

| Option | Effet |
|---|---|
| `-d` | *detached*, tourne en arrière-plan |
| `--name` | Nom lisible pour le container |
| `-p hôte:container` | Publie un port |
| `-v` | Monte un volume ou un bind mount |
| `-e` | Définit une variable d'environnement |

**Cas d'utilisation :** démarrer n'importe quel service conteneurisé.
**Exemple :**
```bash
docker run -d --name mon-api -p 4000:4000 mon-image:1.0
```
**Résultat attendu :** un identifiant de container (hash) affiché immédiatement, le terminal rendant la main aussitôt grâce à `-d`.
**Explication du résultat :** sans `-p`, le container ne serait joignable depuis rien d'extérieur à Docker, même s'il tourne correctement.
**Erreurs possibles :** `docker: Error response from daemon: port is already allocated` si le port hôte est déjà utilisé.
**Vérification :** `docker ps` montre le container avec le statut "Up".
**Cas pratiques :** lancement de chaque service conteneurisé de ce manuel.

#### `docker ps`
**Description :** liste les containers.
**Syntaxe :** `docker ps [-a]`
**Options :** `-a` (tous les containers, y compris arrêtés).
**Cas d'utilisation :** vérifier l'état des containers actifs.
**Exemple :** `docker ps`
**Résultat attendu :** un tableau avec l'ID, l'image, les ports, le statut de chaque container.
**Explication du résultat :** un statut "Up X minutes" confirme un container actif ; "Exited" en indique un arrêté (visible seulement avec `-a`).
**Erreurs possibles :** aucune ; une liste vide signifie simplement l'absence de container correspondant.
**Vérification :** le container attendu apparaît avec le bon statut.
**Cas pratiques :** premier réflexe de diagnostic Docker.

#### `docker stop` / `docker rm`
**Description :** arrête (`stop`) ou supprime définitivement (`rm`) un container.
**Syntaxe :** `docker stop nom` · `docker rm nom`
**Cas d'utilisation :** arrêter temporairement un service, ou le supprimer avant d'en relancer une version différente.
**Exemple :**
```bash
docker stop mon-api
docker rm mon-api
```
**Résultat attendu :** le nom ou l'ID du container affiché en confirmation.
**Explication du résultat :** `stop` laisse le container présent (visible avec `docker ps -a`, redémarrable avec `docker start`) ; `rm` le supprime définitivement — mais jamais l'image, qui reste disponible.
**Erreurs possibles :** `docker rm` refuse de supprimer un container encore actif sans `-f`.
**Vérification :** `docker ps -a` confirme l'état final.
**Cas pratiques :** cycle classique avant un redéploiement manuel (`stop` puis `rm` puis nouveau `run`).

> ❌ **Erreur fréquente** — Confondre `docker stop` et `docker rm`, en particulier croire qu'un `docker rm` supprime aussi l'image sous-jacente — ce n'est jamais le cas.

**Logs et exécution dans un container en cours :**
```bash
docker logs -f mon-api          # logs en temps réel, comme tail -f (chapitre 2)
docker exec -it mon-api sh      # ouvre un shell interactif à l'intérieur
```
`-i` (interactif) garde l'entrée standard ouverte, `-t` alloue un pseudo-terminal utilisable ; `sh` fonctionne presque partout (`bash` si l'image le contient).

**Gérer les images :**
```bash
docker images              # lister les images locales
docker rmi nom-image        # supprimer une image locale
```

### 7.4 Le Dockerfile

Un `Dockerfile` est un fichier texte qui décrit, étape par étape, comment construire une image.

**Exemple pour une API Express (reprise du chapitre 6, section 6.7) :**
```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

EXPOSE 4000

USER node

CMD ["node", "dist/server.js"]
```

**Décomposition ligne par ligne :**
- `FROM node:22-alpine` : l'image de base — Node 22 sur Alpine (Linux minimal, environ 5 Mo contre plusieurs centaines pour une image Ubuntu complète). Toute image Docker part obligatoirement d'une image de base.
- `WORKDIR /app` : le dossier de travail pour toutes les instructions suivantes — équivalent d'un `cd /app` appliqué au reste du fichier.
- `COPY package*.json ./` : copie uniquement les fichiers de dépendances **avant** le reste du code — optimisation cruciale expliquée ci-dessous.
- `RUN npm ci --omit=dev` : exécutée **au moment du build**, pas au lancement — installe les dépendances de production.
- `COPY . .` : copie ensuite tout le reste du code source.
- `RUN npm run build` : compile l'application.
- `EXPOSE 4000` : documente (sans l'ouvrir automatiquement) le port utilisé à l'intérieur du container.
- `USER node` : bonne pratique de sécurité (section 7.7) — n'exécute pas l'application en `root` dans le container.
- `CMD [...]` : la commande exécutée quand un container démarre (à ne pas confondre avec `RUN`, exécutée seulement pendant le *build*).

> 💡 **Pourquoi copier `package*.json` avant le reste du code ?** Docker met en cache chaque couche et ne la reconstruit que si elle a changé. Si le code source change souvent mais les dépendances rarement, séparer les deux `COPY` permet de **réutiliser le cache de `npm ci`** (l'étape la plus lente) à chaque nouveau build tant que `package.json` n'a pas changé.

**Build multi-étapes**, pour garder les images de production légères :
```dockerfile
# Étape 1 : build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : image finale, allégée
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 4000
USER node
CMD ["node", "dist/server.js"]
```
`COPY --from=builder` récupère uniquement le dossier `dist/` généré par la première étape — le code source non compilé, les dépendances de développement, les outils de build : rien de tout cela ne finit dans l'image finale.

**`.dockerignore`**, comme `.gitignore` (chapitre 3) :
```
node_modules
.env
.git
dist
*.log
```
> ⚠️ **Attention** — Sans `.dockerignore`, un `.env` local contenant de vrais secrets pourrait se retrouver copié dans une image, potentiellement partagée — même piège que committer un `.env` dans Git, transposé à Docker.

### 7.5 Construire une image

#### `docker build`
**Description :** construit une image à partir d'un `Dockerfile`.
**Syntaxe :** `docker build -t nom:tag .`
**Décomposition mot par mot :** `-t` = *tag* (nom et version lisibles) ; `.` = le **contexte de build**, le dossier envoyé au moteur Docker.
**Cas d'utilisation :** produire une image à partir du code source local.
**Exemple :**
```bash
docker build -t mon-api:1.0 .
```
**Résultat attendu :** un journal détaillé de chaque étape (`FROM`, `WORKDIR`, `COPY`, `RUN`...), se terminant par la confirmation de l'image créée.
**Explication du résultat :** chaque étape correspond à une ligne du `Dockerfile`, dans l'ordre exact.
**Erreurs possibles :** `failed to solve` avec le détail de l'instruction qui a échoué — lire attentivement le message, presque toujours explicite.
**Vérification :**
```bash
docker images | grep mon-api
docker run -d --name test-api -p 4000:4000 mon-api:1.0
curl http://localhost:4000
```
**Cas pratiques :** chaque nouvelle version d'une application avant redéploiement.

> ✅ **Bonne pratique** — Toujours taguer une image avec une **version explicite** (`1.0`, une date, ou un hash de commit Git) plutôt que de dépendre uniquement du tag `latest` par défaut. `latest` change de sens à chaque build, rendant impossible de savoir précisément quelle version tourne réellement, ou de revenir en arrière avec certitude.

### 7.6 Volumes : faire persister des données

Le système de fichiers d'un container est éphémère par défaut — supprimer le container efface tout ce qui a été écrit dedans. Un **volume** existe **en dehors** du cycle de vie du container.

> 💡 **Analogie** — Le container, c'est une pièce d'hôtel : à ton départ, tout ce que tu y as laissé disparaît. Un volume, c'est un coffre-fort externe, dans lequel tu ranges ce qui doit vraiment survivre.

```mermaid
flowchart LR
    C1["Container (v1)"] --> V[("Volume nommé<br/>mysql-data")]
    C1 -.->|"supprimé"| X["✗"]
    C2["Container (v2, recréé)"] --> V
```
**Explication du diagramme :** le container v1 est supprimé, mais le volume `mysql-data` persiste indépendamment ; un nouveau container v2 s'y reconnecte et retrouve exactement les mêmes données.

**Volume nommé** (géré par Docker, recommandé pour la plupart des cas) :
```bash
docker volume create mysql-data
docker run -d --name mysql -v mysql-data:/var/lib/mysql mysql:8
```
**Bind mount** (relie un dossier de la machine hôte à un dossier du container) :
```bash
docker run -d --name mon-api -v /home/jaslin/app/uploads:/app/uploads mon-api:1.0
```
```bash
docker volume ls
docker volume inspect mysql-data
docker volume rm mysql-data
```

> ⚠️ **Attention** — `docker rm` seul ne touche jamais aux volumes. `docker volume rm` supprime réellement et définitivement les données — même degré de prudence requis qu'avec `rm -rf` (chapitre 2).

### 7.7 Le réseau Docker

Par défaut, Docker crée un réseau virtuel isolé, sur lequel les containers communiquent **par leur nom**, sans jamais passer par Internet.

```bash
docker network create mon-reseau
docker run -d --name db --network mon-reseau mysql:8
docker run -d --name api --network mon-reseau -p 4000:4000 mon-api:1.0
```
Depuis le container `api`, le code se connecte à la base via le nom `db` (`DATABASE_URL=mysql://user:pass@db:3306/nomapp`) — Docker résout ce nom automatiquement, sans configuration DNS manuelle.

> 📌 **À retenir** — Même principe de sécurité que le chapitre 4 : seul le port de l'API est publié vers l'extérieur avec `-p` ; la base de données reste accessible uniquement à l'intérieur du réseau Docker, invisible depuis Internet.

### 7.8 Bonnes pratiques de production

> ✅ **Images légères** — Base `alpine` (ou `-slim`), toujours un **multi-stage build** pour ne jamais embarquer les outils de compilation dans l'image finale.

> ✅ **Ne jamais exécuter en root dans le container** — Par défaut, un process Docker tourne en `root` sauf indication contraire (`USER node`). Un container compromis avec un utilisateur non-root limite l'impact d'une faille applicative.

> ✅ **Secrets jamais dans l'image** — Jamais en dur dans un `Dockerfile` (même en `ENV`, visible via `docker history`). Toujours fournis au lancement (`-e`, ou `environment:` en Compose, chapitre 8).

> ✅ **Tags versionnés, jamais `latest` en production.**

> ✅ **Nettoyer régulièrement :**
```bash
docker system df
docker system prune
docker system prune -a --volumes   # plus agressif, à utiliser avec prudence
```
> ⚠️ **Attention** — `docker system prune -a --volumes` peut supprimer des données auxquelles on tenait. Toujours vérifier `docker volume ls` avant.

---

## Analogies clés de ce chapitre

| Notion | Analogie |
|---|---|
| Docker vs machine locale non isolée | Un plat livré déjà cuisiné et scellé vs recuisiner sur une cuisinière différente |
| Image / container | Une recette / le plat réellement cuisiné à partir d'elle |
| Volume | Un coffre-fort externe à la chambre d'hôtel |
| Multi-stage build | Ne garder que le plat fini, jamais les ustensiles de cuisine dans la boîte à emporter |

---

## Étude de cas

**Contexte.** Une équipe de deux développeurs travaille sur une API Node avec PostgreSQL. L'un développe sous Windows, l'autre sous Mac, et le serveur de production tourne sous Ubuntu. Sans Docker, chacun doit installer et maintenir individuellement Node, PostgreSQL, et s'assurer que les versions restent cohérentes entre les trois environnements — une source récurrente de "ça marche chez moi, pas chez toi".

**Avec Docker :** un seul `Dockerfile` et un seul `docker-compose.yml` (chapitre 8) définissent l'environnement complet. Chaque développeur, quel que soit son système d'exploitation, lance `docker compose up` et obtient exactement le même environnement que ses collègues et que la production — la classe de bug "différence d'environnement" disparaît structurellement, pas seulement par discipline d'équipe.

---

## Bonnes pratiques (récapitulatif du chapitre)

- Toujours un multi-stage build en production.
- Toujours `USER` non-root dans le Dockerfile.
- Toujours un `.dockerignore` couvrant `.env`, `.git`, `node_modules`.
- Toujours un volume nommé pour toute donnée devant survivre à la suppression d'un container.
- Toujours un tag de version explicite, jamais uniquement `latest`.

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Pourquoi elle arrive | Conséquence |
|---|---|---|
| Confondre `docker stop` et `docker rm` | Vocabulaire proche | Perte de temps à rechercher un container "disparu" alors qu'il est juste arrêté |
| Copier tout le code avant `npm ci` | Ordre non compris | Cache Docker inutilisé, builds lents |
| Oublier `.dockerignore` | Habitude Git non transposée | Secrets ou `node_modules` copiés dans l'image |
| Base de données sans volume nommé | Oubli | Perte totale des données à la suppression du container |
| `docker system prune -a --volumes` sans vérifier | Envie de "tout nettoyer" | Perte de données encore nécessaires |

---

## Captures d'écran à réaliser

> 📸 **Capture 9**
> **Logiciel :** terminal
> **Pourquoi cette capture est utile :** montrer la sortie complète et rassurante de `docker run hello-world`, souvent le tout premier contact avec Docker pour un débutant.
> **Page/écran concerné :** terminal après exécution de `docker run hello-world`
> **Niveau de zoom conseillé :** 100 %
> **Montrer :** le message de bienvenue complet de Docker
> **Entourer :** la phrase confirmant le bon fonctionnement ("This message shows that your installation appears to be working correctly")
> **Flouter/masquer :** rien de sensible sur cet écran

---

## Laboratoire pratique n°1 — Construire sa première image et son premier container

**Objectifs :** écrire un `Dockerfile` multi-étapes pour une application réelle, construire l'image, la lancer.
**Prérequis :** Docker installé (chapitre 5), une application Node du chapitre 6 disponible.
**Matériel nécessaire :** le VPS ou une machine locale avec Docker.

**Étapes :**
1. Écris un `Dockerfile` multi-étapes (section 7.4) pour une application Express existante.
2. Ajoute un `.dockerignore`.
3. Construis l'image : `docker build -t mon-api:1.0 .`
4. Lance-la : `docker run -d --name test-api -p 4000:4000 mon-api:1.0`.
5. Vérifie : `curl http://localhost:4000` et `docker logs test-api`.

**Résultat attendu :** l'API répond correctement depuis le container.
**Vérifications :** `docker images` montre l'image taguée `1.0` ; `docker ps` montre le container "Up".
**Erreurs fréquentes :** oubli de `EXPOSE`/`-p`, rendant le container inaccessible malgré un démarrage réussi.
**Solutions :** vérifier la correspondance exacte entre le port interne de l'application et celui publié avec `-p`.

## Laboratoire pratique n°2 — Faire persister des données avec un volume

**Objectifs :** confirmer qu'un volume nommé survit à la suppression d'un container.
**Prérequis :** Laboratoire 1 complété.
**Matériel nécessaire :** Docker.

**Étapes :**
1. `docker volume create test-data`.
2. `docker run -d --name test-mysql -v test-data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=test mysql:8`.
3. Attends le démarrage complet (`docker logs -f test-mysql` jusqu'à voir "ready for connections"), puis crée une base de test via `docker exec -it test-mysql mysql -uroot -ptest -e "CREATE DATABASE labo;"`.
4. Supprime le container : `docker rm -f test-mysql`.
5. Relance un **nouveau** container avec le **même** volume : `docker run -d --name test-mysql-2 -v test-data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=test mysql:8`.
6. Vérifie que la base `labo` existe toujours : `docker exec -it test-mysql-2 mysql -uroot -ptest -e "SHOW DATABASES;"`.

**Résultat attendu :** la base `labo` apparaît toujours dans le nouveau container.
**Vérifications :** `docker volume inspect test-data` confirme un seul volume utilisé par les deux containers successifs.
**Erreurs fréquentes :** utiliser un bind mount à la place d'un volume nommé sans en comprendre la différence de portabilité.
**Solutions :** relire la section 7.6 sur la distinction volume nommé / bind mount.

## Laboratoire pratique n°3 — Faire communiquer deux containers par le réseau Docker

**Objectifs :** connecter une API à une base de données via le réseau Docker, sans exposer la base publiquement.
**Prérequis :** Laboratoires 1 et 2 complétés.
**Matériel nécessaire :** l'image `mon-api:1.0` du Laboratoire 1.

**Étapes :**
1. `docker network create labo-reseau`.
2. Lance la base sur ce réseau, sans `-p` (pas d'exposition publique) : `docker run -d --name labo-db --network labo-reseau -e MYSQL_ROOT_PASSWORD=test -e MYSQL_DATABASE=labo mysql:8`.
3. Lance l'API sur le même réseau, avec `DATABASE_URL` pointant vers `labo-db` comme hôte : `docker run -d --name labo-api --network labo-reseau -p 4000:4000 -e DATABASE_URL=mysql://root:test@labo-db:3306/labo mon-api:1.0`.
4. Vérifie que l'API se connecte correctement à la base (`docker logs labo-api`).

**Résultat attendu :** l'API démarre sans erreur de connexion à la base, malgré l'absence totale d'exposition publique du port 3306.
**Vérifications :** `docker port labo-db` ne montre aucun port publié ; `sudo ss -tulpn | grep 3306` (chapitre 10) ne montre rien depuis l'extérieur de Docker.
**Erreurs fréquentes :** utiliser `localhost` au lieu du nom du container (`labo-db`) dans `DATABASE_URL` — `localhost`, à l'intérieur d'un container, désigne le container lui-même, pas un autre container du même réseau.
**Solutions :** toujours utiliser le nom du service/container comme "hôte" dans les chaînes de connexion entre containers.

---

## Exercices

1. Explique la différence entre une image et un container avec tes propres mots, sans utiliser l'analogie du chapitre.
2. Pourquoi séparer `COPY package*.json ./` de `COPY . .` accélère-t-il les builds répétés ?
3. Un collègue supprime un container de base de données avec `docker rm -f`, pensant que ses données seront perdues. Corrige son erreur de compréhension.
4. Pourquoi ne faut-il jamais écrire un mot de passe directement dans un `Dockerfile`, même via une instruction `ENV` ?
5. Explique pourquoi `localhost`, utilisé depuis un container pour joindre un autre container, ne fonctionne jamais comme attendu.

---

## Quiz

**Question 1.** Une image Docker est :
a) Une instance en cours d'exécution
b) Un modèle figé, en lecture seule, à partir duquel des containers sont créés
c) Un fichier de configuration réseau
d) Un type de volume

**Question 2.** Pourquoi utiliser un multi-stage build ?
a) Pour accélérer le réseau
b) Pour garder l'image finale légère, sans les outils de compilation
c) C'est obligatoire pour tout Dockerfile
d) Pour éviter d'écrire un `.dockerignore`

**Question 3.** Que se passe-t-il aux données d'un volume nommé quand son container est supprimé (`docker rm`) ?
a) Elles sont perdues définitivement
b) Elles survivent, le volume existant indépendamment du container
c) Elles sont automatiquement sauvegardées ailleurs
d) Le volume est aussi supprimé automatiquement

**Question 4.** Depuis un container, comment joindre un autre container sur le même réseau Docker ?
a) Via `localhost`
b) Via l'adresse IP publique du serveur hôte
c) Via le nom du container, résolu automatiquement par Docker
d) Ce n'est pas possible sans configuration DNS manuelle

**Question 5.** Où doit-on placer un secret (mot de passe, clé API) destiné à un container ?
a) Directement dans le `Dockerfile` via `ENV`
b) Fourni au lancement (`-e` ou variables d'environnement), jamais en dur dans l'image
c) Dans un commentaire du Dockerfile
d) Peu importe, Docker les chiffre automatiquement

> 🔑 **Corrigé** — 1: b · 2: b · 3: b · 4: c · 5: b

---

## 📝 Résumé du chapitre

- Docker résout le problème de "ça marche sur ma machine" en empaquetant une application avec tout son environnement, de façon reproductible et isolée, sans la lourdeur d'une VM complète.
- Une image est un modèle figé ; un container est une instance en cours d'exécution de cette image.
- Un `Dockerfile` décrit la construction étape par étape ; l'ordre des instructions et les builds multi-étapes optimisent respectivement la vitesse de build et la taille finale.
- Les volumes font persister des données au-delà de la vie d'un container ; le réseau Docker permet à plusieurs containers de communiquer par leur nom.
- En production : images légères et multi-étapes, jamais root dans le container, jamais de secret en dur, tags versionnés, nettoyage prudent.

## ✅ Checklist avant de passer au chapitre 8

- [ ] Je peux expliquer la différence entre une image et un container sans relire le chapitre.
- [ ] J'ai construit une image multi-étapes et je sais la lancer avec `docker run -p ... -d`.
- [ ] Je comprends pourquoi une base de données Docker doit toujours utiliser un volume nommé.
- [ ] J'ai fait communiquer deux containers par leur nom, sans exposition publique de la base.
- [ ] Je sais où placer les secrets d'un container.
- [ ] J'ai réalisé les trois laboratoires et obtenu au moins 4/5 au quiz.

---

## Glossaire du chapitre

**Image**
Définition simple : un modèle figé contenant tout le nécessaire pour faire tourner une application.
Définition technique : un ensemble de couches en lecture seule, empilées selon les instructions d'un Dockerfile, identifié par un nom et un tag.
Exemple concret : `mon-api:1.0`.
Voir : Chapitre 7, section 7.2.

**Container**
Définition simple : une instance en cours d'exécution d'une image.
Définition technique : un processus isolé (namespace, cgroups) partageant le noyau de l'hôte, avec son propre système de fichiers, réseau et vue des processus.
Exemple concret : `docker run -d --name mon-api mon-api:1.0`.
Voir : Chapitre 7, section 7.2.

**Registre (Docker Hub)**
Définition simple : un dépôt centralisé où trouver et publier des images Docker.
Définition technique : un service hébergeant des images taguées, accessible via `docker pull`/`docker push`.
Exemple concret : `mysql:8`, téléchargée automatiquement depuis Docker Hub.
Voir : Chapitre 7, section 7.1.

**Volume**
Définition simple : un espace de stockage qui survit à la suppression d'un container.
Définition technique : un mécanisme de persistance géré par Docker, monté dans le système de fichiers d'un ou plusieurs containers, indépendant de leur cycle de vie.
Exemple concret : `mysql-data:/var/lib/mysql`.
Voir : Chapitre 7, section 7.6.

---

## ❓ FAQ

**Docker remplace-t-il PM2 ou systemd ?**
`restart: unless-stopped` (Docker) joue un rôle équivalent à PM2/systemd **pour un container**, mais quelqu'un doit s'assurer que le moteur Docker lui-même démarre au boot (généralement automatique à l'installation). Une fois qu'une application tourne dans Docker, PM2 devient inutile pour elle.

**Faut-il tout dockeriser, même un simple site statique ?**
Rarement nécessaire. Un site purement statique servi par nginx n'a aucun des problèmes que Docker résout — le dockeriser ajoute de la complexité sans bénéfice réel dans ce cas précis.

**Quelle est la différence entre `docker-compose` (avec tiret) et `docker compose` (sans tiret) ?**
`docker-compose` est l'ancien outil autonome (Python), `docker compose` le plugin moderne intégré à Docker Engine (chapitre 5) — c'est celui utilisé dans ce manuel, développé en détail au chapitre 8.

---

## Références officielles

- Docker Documentation — [docs.docker.com](https://docs.docker.com)
- Dockerfile Reference — [docs.docker.com/reference/dockerfile](https://docs.docker.com/reference/dockerfile/)
- Docker Hub — [hub.docker.com](https://hub.docker.com)
- Best practices for writing Dockerfiles — [docs.docker.com/build/building/best-practices](https://docs.docker.com/build/building/best-practices/)

---

## Conclusion

Tu sais désormais empaqueter n'importe quelle application dans une image reproductible, la faire tourner en container, lui faire persister des données, et la connecter à d'autres services par le réseau. Le chapitre 8 va assembler ces briques individuelles en un seul fichier déclaratif, capable de démarrer une application multi-services complète — API, base de données, cache — en une seule commande.

---

⬅️ [Chapitre 6 — Déployer différents types d'applications](06-deployer-applications.md) · ➡️ **Suite : Chapitre 8 — Docker Compose**
