# Docker de zéro à expert
## Plan éditorial complet

> **Statut : plan en attente de validation.** Aucun chapitre ne sera rédigé tant que ce plan n'est pas validé par Jaslin. Une fois validé, il devient la référence contre laquelle chaque chapitre est écrit.

Ce plan reprend l'intégralité du brief fourni (64 sections), réorganisé en chapitres cohérents. **Deux consolidations ont été faites par rapport au brief d'origine**, signalées ici pour validation explicite :

1. Le brief numérote les mêmes sujets deux fois sous deux systèmes différents (ex. « dockeriser Node.js » apparaît en Module 12 *et* Module 19 ; « application full stack » en Module 18 *et* Module 25 ; les stacks Node/React/MySQL et NestJS/PostgreSQL/Redis apparaissent à la fois en Modules 41-45 *et* dans les Projets complets). Chaque sujet n'a ici **qu'un seul chapitre**, à l'endroit pédagogiquement le plus logique — rien n'est perdu, c'est un dédoublonnage.
2. Quelques modules très courts et étroitement liés sont regroupés dans un même chapitre (healthchecks + `depends_on` ; versioning + mise à jour + rollback ; Docker Hub + registry privé) plutôt que d'avoir un chapitre de deux pages chacun.

Si tu préfères le découpage 1:1 d'origine (un chapitre par module du brief, quitte à répéter), dis-le et je réajuste avant de commencer.

**Format de chapitre retenu** (s'applique à tous les chapitres, conforme à la section 62 du brief) :
Objectif → Prérequis → Le problème → Explication simple → Concept → Analogie → Exemple → Schéma (Mermaid) → Où exécuter chaque commande (Windows PowerShell / Linux / macOS / dans le conteneur / dans le Dockerfile / dans Compose, selon le cas) → Commandes avec explication ligne par ligne → Résultat attendu → Test de vérification → Erreurs fréquentes → Dépannage → Exercice → Corrigé → Checklist → À retenir → Glossaire du chapitre → Références officielles.

**Diagrammes** : Mermaid, pré-rendus en PNG avant export (`render-mermaid.js`, déjà en place — même pipeline que les deux manuels précédents).

---

## Vue d'ensemble des parties

| Partie | Titre | Chapitres | Niveau |
|---|---|---|---|
| I | Comprendre avant de pratiquer | 1 – 3 | Débutant absolu |
| II | Manipuler conteneurs et images | 4 – 11 | Débutant → Intermédiaire |
| III | Docker Compose | 12 – 13 | Intermédiaire |
| IV | Dockeriser des applications réelles | 14 – 20 | Intermédiaire |
| V | Fiabiliser le démarrage multi-services | 21 | Intermédiaire |
| VI | Exploitation et diagnostic au quotidien | 22 – 24 | Intermédiaire |
| VII | Docker professionnel et sécurité | 25 – 27 | Intermédiaire → Avancé |
| VIII | Production et déploiement | 28 – 37 | Avancé |
| IX | Docker par stack technologique | 38 – 40 | Intermédiaire → Avancé |
| X | Projets complets progressifs | 41 – 46 | Débutant → Avancé (progressif) |
| XI | Projet final fil rouge | 47 | Avancé |
| XII | Dépannage et référence | 48 | Toutes les phases précédentes |
| — | Annexes (cheat sheet, glossaire, checklists) | A – C | Référence |

**48 chapitres + 3 annexes.**

---

## PARTIE I — COMPRENDRE AVANT DE PRATIQUER

### Chapitre 1 — Comprendre les conteneurs : le vocabulaire et les concepts
**Niveau :** Débutant absolu · **Prérequis :** aucun · *(Brief : Module 1)*
Sous-chapitres : application vs serveur · machine virtuelle · conteneur · image · Docker Engine · Docker CLI · Docker Hub · registry · Dockerfile · volume · réseau Docker. Analogies filées tout du long (« une image est un modèle prêt à l'emploi, un conteneur est ce modèle en fonctionnement »).
Exercices : associer chaque terme à sa définition ; schématiser de mémoire le cycle image → conteneur.

### Chapitre 2 — Conteneur vs machine virtuelle vs Kubernetes
**Niveau :** Débutant absolu · **Prérequis :** Chapitre 1 · *(Brief : Module 2)*
Sous-chapitres : tableau comparatif conteneur/VM · partage du kernel vs OS invité · légèreté et vitesse de démarrage · quand choisir Docker seul, une VM, ou Kubernetes (annoncé mais pas traité dans ce manuel — hors périmètre explicite).
Schéma : coupe transversale VM vs conteneurs sur un même hôte.

### Chapitre 3 — Installer Docker
**Niveau :** Débutant absolu · **Prérequis :** Chapitre 1 · *(Brief : Module 3)*
Sous-chapitres : Windows (prérequis, WSL 2, Docker Desktop, vérification) · Linux Ubuntu (repository officiel, Docker Engine, Docker CLI, permissions du groupe `docker`, service et démarrage automatique) · macOS (Docker Desktop). `docker --version`, `docker info`, `docker run hello-world` expliqués ligne par ligne pour les trois OS.
Laboratoire : installer Docker sur son propre poste et faire tourner `hello-world`.

---

## PARTIE II — MANIPULER CONTENEURS ET IMAGES

### Chapitre 4 — Premiers conteneurs : le cycle de vie
**Niveau :** Débutant · **Prérequis :** Chapitre 3 · *(Brief : Module 4)*
Sous-chapitres : `docker run`, `docker ps`, `docker ps -a`, `docker start`, `docker stop`, `docker restart`, `docker rm`. Schéma du cycle Image → run → Running → Stop → Restart → Remove.
Exercices : faire vivre un conteneur nginx du démarrage à la suppression, en observant chaque état avec `docker ps -a`.

### Chapitre 5 — Les images Docker
**Niveau :** Débutant · **Prérequis :** Chapitre 4 · *(Brief : Module 5)*
Sous-chapitres : image, tag, version, layers, registry · `docker images`/`docker image ls`, `docker pull`, `docker rmi`, `docker inspect`, `docker history` · pourquoi éviter `latest` en production.
Exercice : comparer `docker history` de deux images pour repérer les layers volumineux.

### Chapitre 6 — Le Dockerfile en profondeur
**Niveau :** Débutant → Intermédiaire · **Prérequis :** Chapitre 5 · *(Brief : Module 6)*
Sous-chapitres : `FROM`, `WORKDIR`, `COPY`, `ADD` (et pourquoi préférer `COPY`), `RUN`, `ENV`, `ARG`, `EXPOSE`, `USER`, `CMD`, `ENTRYPOINT` (différence CMD/ENTRYPOINT), `HEALTHCHECK`. Plusieurs Dockerfiles commentés ligne par ligne.

### Chapitre 7 — Premier projet : construire et lancer sa première image
**Niveau :** Débutant → Intermédiaire · **Prérequis :** Chapitre 6 · *(Brief : section « Premier projet Dockerfile »)*
Projet `hello-docker/` (arborescence fournie). `docker build -t hello-docker .` expliqué (contexte de build, tag, layers, cache) puis `docker run hello-docker` et vérification.
Laboratoire complet du fichier vide à l'image qui tourne.

### Chapitre 8 — Ports et exposition réseau
**Niveau :** Débutant · **Prérequis :** Chapitre 7 · *(Brief : Module 7)*
Sous-chapitres : `docker run -p 8080:80 nginx` décortiqué · `EXPOSE` vs `-p` · plusieurs conteneurs sur des ports différents.
Exercices : lancer trois conteneurs nginx sur trois ports différents sans conflit.

### Chapitre 9 — Variables d'environnement et secrets
**Niveau :** Débutant → Intermédiaire · **Prérequis :** Chapitre 7 · *(Brief : Module 8)*
Sous-chapitres : `docker run -e`, fichiers `.env`, variables dans Compose, introduction aux secrets Docker · pourquoi un mot de passe ne doit jamais être écrit en dur dans un Dockerfile (renvoi vers le Chapitre 26 pour l'approfondissement sécurité).

### Chapitre 10 — Volumes et persistance des données
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 8 · *(Brief : Module 9)*
Sous-chapitres : le problème (« que se passe-t-il si je supprime le conteneur ? »), volume nommé vs bind mount vs `tmpfs` · `docker volume ls/create/inspect/rm`.
Laboratoire : conteneur MySQL avec et sans volume, comparaison après `docker rm`.

### Chapitre 11 — Réseaux Docker : faire communiquer plusieurs conteneurs
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 10 · *(Brief : Module 10)*
Sous-chapitres : bridge, host, none, réseau personnalisé · `docker network ls/create/inspect/connect/disconnect` · résolution DNS interne entre conteneurs d'un même réseau.
Laboratoire : Frontend → Backend → Database, trois conteneurs qui se voient par leur nom de service.

---

## PARTIE III — DOCKER COMPOSE

### Chapitre 12 — Introduction à Docker Compose
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 11 · *(Brief : Module 11)*
Sous-chapitres : pourquoi Compose (remplace la suite de commandes manuelles des chapitres précédents) · anatomie d'un `compose.yaml` (`services`, `build`, `image`, `ports`, `volumes`, `networks`, `environment`) · `docker compose up/up -d/down/ps/logs/restart`.

### Chapitre 13 — Premier projet Compose : Nginx + Backend + MySQL
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 12 · *(Brief : section « Premier projet Compose »)*
Architecture Utilisateur → Nginx → Backend → MySQL. Arborescence complète, Dockerfiles, `compose.yaml`, `.env`, commandes, tests, dépannage.
Laboratoire de bout en bout, réutilisé comme base des chapitres suivants.

---

## PARTIE IV — DOCKERISER DES APPLICATIONS RÉELLES

### Chapitre 14 — Dockeriser une API Node.js / Express
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 13 · *(Brief : Modules 12/19, fusionnés)*
Application Express réelle minimale, Dockerfile commenté, `.dockerignore`, build et run.

### Chapitre 15 — Dockeriser React en production (multi-stage build)
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 14 · *(Brief : Modules 13/20, fusionnés)*
Pourquoi une image de production React ne doit pas contenir Node ni les node_modules de dev. Dockerfile multi-stage (`FROM node AS build` → `FROM nginx`) expliqué étape par étape.

### Chapitre 16 — Dockeriser MySQL
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 10 · *(Brief : Modules 14/21, fusionnés)*
Image officielle, variables d'environnement, volume, port, réseau, scripts d'initialisation (`/docker-entrypoint-initdb.d`), persistance.

### Chapitre 17 — Dockeriser PostgreSQL
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 16 · *(Brief : Modules 15/22, fusionnés)*
Même structure que MySQL, puis tableau comparatif MySQL vs PostgreSQL (cas d'usage, écosystème Prisma déjà connu du reste du portefeuille de Jaslin).

### Chapitre 18 — Ajouter Redis (cache, session, queue)
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 17 · *(Brief : Modules 16/23, fusionnés)*
Cas d'usage (cache, session, file d'attente), image officielle, persistance optionnelle (AOF/RDB), projet Backend → Redis → MySQL.

### Chapitre 19 — Nginx comme reverse proxy devant plusieurs services
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 15 · *(Brief : Modules 17/24, fusionnés)*
Qu'est-ce qu'un reverse proxy · architecture Internet → Nginx → React/API → MySQL · routes, en-têtes, compression, cache (HTTPS renvoyé au Chapitre 30).

### Chapitre 20 — Assembler une application full stack complète
**Niveau :** Intermédiaire · **Prérequis :** Chapitres 14-19 · *(Brief : Modules 18/25, fusionnés)*
React + Nginx + Node.js/Express + PostgreSQL + Redis, tout fourni : code minimal, Dockerfiles, `compose.yaml`, `.env.example`, réseau, volumes, healthchecks (aperçu, détaillé au chapitre suivant), commandes, tests.

---

## PARTIE V — FIABILISER LE DÉMARRAGE MULTI-SERVICES

### Chapitre 21 — Healthchecks et dépendances entre services
**Niveau :** Intermédiaire → Avancé · **Prérequis :** Chapitre 20 · *(Brief : Modules 19-20/26-27, fusionnés)*
`HEALTHCHECK` en Dockerfile et en Compose · `depends_on` et sa limite réelle (attend le démarrage du conteneur, pas que le service soit prêt) · `depends_on: condition: service_healthy` comme solution.
Laboratoire : backend qui plante au démarrage si la DB n'est pas encore prête, corrigé avec un healthcheck.

---

## PARTIE VI — EXPLOITATION ET DIAGNOSTIC AU QUOTIDIEN

### Chapitre 22 — Consulter et interpréter les logs
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 13 · *(Brief : Module 21/28)*
`docker logs`, `docker compose logs`, `docker logs -f`. Scénarios réels de recherche d'erreur dans un flux de logs.

### Chapitre 23 — Debugging : inspect, exec, top, stats, events
**Niveau :** Intermédiaire → Avancé · **Prérequis :** Chapitre 22 · *(Brief : Module 22/29)*
`docker inspect`, `docker exec -it ... sh`, `docker top`, `docker stats`, `docker events`. Entrer dans un conteneur pour diagnostiquer un problème en direct.

### Chapitre 24 — Nettoyage de l'espace disque
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 23 · *(Brief : Module 23/30)*
`docker system df`, `docker system prune`, `container/image/volume/network prune`. **Chaque commande destructive précédée d'un encadré « ce que ça supprime »** avant la commande elle-même (règle explicite du brief).

---

## PARTIE VII — DOCKER PROFESSIONNEL ET SÉCURITÉ

### Chapitre 25 — Dockerfile professionnel : bonnes pratiques et optimisation
**Niveau :** Avancé · **Prérequis :** Chapitre 15 · *(Brief : Module 24/31)*
Images petites, multi-stage builds (rappel et approfondissement), `.dockerignore`, cache de build, utilisateur non-root, versions explicites (jamais `latest`), `HEALTHCHECK`, réduction de la surface d'attaque.

### Chapitre 26 — Sécurité Docker
**Niveau :** Avancé · **Prérequis :** Chapitre 25 · *(Brief : Module 25/32)*
Root dans le conteneur, utilisateurs et permissions, capabilities Linux, gestion des secrets (repris et approfondi depuis le Chapitre 9), images vulnérables (scan), ports exposés inutilement, isolation, risques du socket Docker monté dans un conteneur, mises à jour de sécurité.

### Chapitre 27 — Registries : Docker Hub et registry privé
**Niveau :** Intermédiaire → Avancé · **Prérequis :** Chapitre 5 · *(Brief : Modules 26-27/33-34, fusionnés)*
`docker login/tag/push/pull`, organisation d'un repository Docker Hub · installer et sécuriser un registry privé pour un environnement de laboratoire (authentification, TLS).

---

## PARTIE VIII — PRODUCTION ET DÉPLOIEMENT

### Chapitre 28 — Environnements dev/test/prod et gestion des `.env`
**Niveau :** Avancé · **Prérequis :** Chapitre 9 · *(Brief : Modules 28-29/35-36, fusionnés)*
`.env.development`/`.env.test`/`.env.production`, Compose override files (`compose.override.yaml`), éviter de mélanger les configurations.

### Chapitre 29 — Déploiement sur VPS, de A à Z
**Niveau :** Avancé · **Prérequis :** Chapitre 28 · *(Brief : Module 30/37)*
Préparer/louer un VPS, connexion SSH, sécurisation de base, installation Docker, installation Git, récupération du projet, configuration `.env`, build, lancement, vérification, logs, pare-feu. (Renvois vers le Guide Ultime du Déploiement pour l'approfondissement Linux/SSH pur, ce chapitre reste centré Docker.)

### Chapitre 30 — Domaine et HTTPS
**Niveau :** Avancé · **Prérequis :** Chapitre 29 · *(Brief : Module 31/38)*
DNS → VPS → Nginx → application conteneurisée · obtention et renouvellement d'un certificat HTTPS devant des conteneurs Docker.

### Chapitre 31 — CI/CD avec Docker
**Niveau :** Avancé · **Prérequis :** Chapitre 30 · *(Brief : Module 32/39)*
Pipeline Développeur → push → GitHub → build → tests → image Docker → registry → serveur → déploiement. Exemple complet avec GitHub Actions.

### Chapitre 32 — Mettre à jour, versionner et revenir en arrière
**Niveau :** Avancé · **Prérequis :** Chapitre 31 · *(Brief : Modules 33-34-35/40-41-42, fusionnés)*
Versioning sémantique des images (`app:1.0.0` plutôt que `latest` en production) · procédure de mise à jour (Backup → Pull → Build → Test → Deploy → Verify → Rollback si nécessaire) · rollback détaillé avec exemple réel.

### Chapitre 33 — Sauvegarder les données Docker
**Niveau :** Avancé · **Prérequis :** Chapitre 10 · *(Brief : Module 36/43)*
Sauvegarder volumes, bases de données, fichiers, configurations, `.env` (avec précautions). Stratégie de backup pour une infrastructure conteneurisée.

### Chapitre 34 — Monitoring
**Niveau :** Avancé · **Prérequis :** Chapitre 23 · *(Brief : Module 37/44)*
`docker stats` comme point de départ, puis Prometheus, Grafana, logs centralisés, alertes. Laboratoire de supervision minimal.

### Chapitre 35 — Performance
**Niveau :** Avancé · **Prérequis :** Chapitre 34 · *(Brief : Module 38/45)*
CPU, RAM, I/O, réseau, limites de ressources (`deploy.resources` en Compose), politiques de redémarrage (`restart policies`).

### Chapitre 36 — Bases de données en production avec Docker
**Niveau :** Avancé · **Prérequis :** Chapitres 16-17, 33 · *(Brief : Module 39/46)*
Persistance, backups, restauration, migrations, disponibilité, sécurité. Insistance explicite : **un volume Docker n'est pas à lui seul une stratégie de sauvegarde**.

### Chapitre 37 — Docker et architecture microservices
**Niveau :** Avancé · **Prérequis :** Chapitre 19 · *(Brief : Module 40/47)*
Pourquoi les microservices existent (et pourquoi ils ne sont pas obligatoires) · API Gateway → services → bases de données, illustré avec Docker Compose.

---

## PARTIE IX — DOCKER PAR STACK TECHNOLOGIQUE

### Chapitre 38 — Tour d'horizon : Docker pour Node.js, React/Vite, NestJS, Python, Java
**Niveau :** Intermédiaire → Avancé · **Prérequis :** Chapitre 20 · *(Brief : Module 41/48, avec Modules 43-44/50-51 fusionnés ici plutôt que dupliqués dans les Projets)*
Un patron Dockerfile + Compose concis par techno : Node.js/Express, React+Vite, NestJS, Python, MySQL, PostgreSQL — chacun renvoyant aux chapitres détaillés déjà écrits (14-18) pour ne rien répéter inutilement.

### Chapitre 39 — Étude de cas : Java Spring Boot + PostgreSQL
**Niveau :** Avancé · **Prérequis :** Chapitre 38 · *(Brief : Modules 42/49, fusionnés)*
Dockerfile multi-stage Maven/Gradle → JRE, Compose avec PostgreSQL.

### Chapitre 40 — Étude de cas : Django + PostgreSQL + Redis + Nginx
**Niveau :** Avancé · **Prérequis :** Chapitre 38 · *(Brief : Module 45/52)*
Dockerfile Python/Django (Gunicorn), fichiers statiques servis par Nginx, Redis pour le cache/sessions, PostgreSQL.

---

## PARTIE X — PROJETS COMPLETS PROGRESSIFS

*(Brief : section 53. Chaque projet réutilise explicitement les chapitres précédents plutôt que de réexpliquer.)*

### Chapitre 41 — Projet 1 : premier contact (Nginx seul)
**Niveau :** Débutant · Objectif : comprendre conteneur/image/port en pratique, en fin de première lecture des Parties I-II.

### Chapitre 42 — Projet 2 : Node.js + MySQL
**Niveau :** Intermédiaire · Réutilise Chapitres 14, 16, 12.

### Chapitre 43 — Projet 3 : full stack (React + Node.js + MySQL + Nginx)
**Niveau :** Intermédiaire · Réutilise Chapitres 14-16, 19.

### Chapitre 44 — Projet 4 : application professionnelle (React + NestJS + PostgreSQL + Redis + Nginx)
**Niveau :** Avancé · Réutilise Chapitres 17-20, 25-27.

### Chapitre 45 — Projet 5 : déploiement en production du Projet 4 sur VPS
**Niveau :** Avancé · Réutilise Chapitres 28-30, 33.

### Chapitre 46 — Projet 6 : automatiser avec CI/CD
**Niveau :** Avancé · GitHub → Build → Docker image → Registry → VPS → Déploiement automatisé. Réutilise Chapitres 27, 31-32.

---

## PARTIE XI — PROJET FINAL FIL ROUGE

### Chapitre 47 — Projet final : système de gestion scolaire, du projet vide à la production
**Niveau :** Avancé · **Prérequis :** l'intégralité des parties précédentes · *(Brief : section 54)*
Architecture : Internet → HTTPS → Nginx → React / API NestJS → PostgreSQL + Redis. Guide pas à pas du dossier vide jusqu'à l'application en production : Dockerfiles, Compose, variables d'environnement, volumes, réseaux, healthchecks, Nginx, HTTPS, sauvegardes, monitoring, CI/CD — tout ce qui a été appris, appliqué une dernière fois de bout en bout.

---

## PARTIE XII — DÉPANNAGE ET RÉFÉRENCE

### Chapitre 48 — Dépannage : catalogue de 50 pannes réelles
**Niveau :** Toutes les phases précédentes · *(Brief : section 55, 50 scénarios exhaustivement repris)*
Organisé par catégorie : installation/Docker Desktop/WSL (1-4), images/conteneurs (5-10), réseau/DNS Docker (11-13), volumes/données (14-15), bases de données (16-18), frontend/API (18-19), Nginx (19-20), configuration/permissions (21-23), build (23-26), healthchecks/dépendances (27-29), HTTPS/DNS/VPS/SSH (30-34), ressources système (35-38), sauvegardes (39-41), CI/CD/registry (42-46), sécurité (47-49), le classique « ça marche en local mais pas en prod » (50).
Chaque scénario : Symptôme → Causes possibles → Commandes de diagnostic → Interprétation → Correction → Vérification → Prévention (format imposé par le brief, respecté à l'identique).

---

## ANNEXES

### Annexe A — Cheat sheet des commandes
*(Brief : section 56)* Images, Containers, Volumes, Networks, Compose, Diagnostic — tableaux prêts à imprimer.

### Annexe B — Glossaire
*(Brief : section 57)* Container, Image, Dockerfile, Registry, Repository, Tag, Layer, Volume, Bind mount, Network, Compose, Service, Build, Runtime, Entrypoint, CMD, Healthcheck, Reverse proxy, CI/CD, Orchestration, Microservice — définitions accessibles à un débutant, alimentées au fil de la rédaction des chapitres comme sur les deux manuels précédents.

### Annexe C — Checklists professionnelles
*(Brief : section 58, 12 checklists)* Installation Docker · Création d'image · Dockerfile · Docker Compose · Développement · Production · Sécurité · Sauvegarde · Déploiement VPS · CI/CD · Mise à jour · Rollback.

---

## Règle de sécurité et de qualité (rappel du brief, sections 59-60)

Tous les exemples sont réalisés dans un environnement contrôlé et fictif — jamais de secrets réels, jamais Docker présenté comme moyen de contourner un contrôle d'un système. Avant chaque chapitre : vérification des commandes, de la syntaxe Dockerfile/YAML, des ports/volumes/réseaux/versions. Toute commande dont la syntaxe diffère entre Windows/Linux/macOS le précise explicitement.

## Notes de production

- **Rythme de validation : un chapitre à la fois**, jamais le suivant sans autorisation explicite — même règle que pour le Guide Ultime du Déploiement et le Manuel Administration Système.
- **Tooling déjà en place** (copié et adapté des deux manuels précédents) : `package.json`, `build.ps1` (assemble `chapitres/*.md` → HTML + DOCX + PDF via pandoc), `render-mermaid.js` (pré-rendu des schémas Mermaid en PNG), `print-pdf.js` (export PDF via Edge headless), `assets/style.css`, `assets/couverture.md`, `assets/cover-fragment.html`.
- **Renvois inter-manuels** : ce manuel se concentre sur Docker. Les sujets Linux/SSH purs, non-Docker, renvoient vers le Guide Ultime du Déploiement plutôt que d'être réexpliqués depuis zéro (évite un chapitre 29 qui redevient un cours Linux complet).
