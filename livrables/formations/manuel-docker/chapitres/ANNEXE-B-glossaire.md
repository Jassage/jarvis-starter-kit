# Annexe B — Glossaire général

> Compilation alphabétique de tous les glossaires de chapitre. Chaque entrée renvoie au chapitre où le terme est expliqué en contexte.

---

**API Gateway**
Le point d'entrée unique qui route les requêtes vers le bon microservice.
Voir : Chapitre 37.

**AOF (Append Only File)**
Mécanisme de persistance Redis qui journalise chaque écriture, minimisant la perte possible en cas de crash.
Voir : Chapitre 18.

**Bind mount**
Un dossier précis de la machine hôte, monté directement dans un conteneur, avec synchronisation immédiate dans les deux sens.
Voir : Chapitre 10.

**Build multi-étapes (multi-stage build)**
Un Dockerfile avec plusieurs `FROM`, où seul le résultat choisi d'une étape est copié dans la suivante via `COPY --from=`.
Voir : Chapitres 6, 15, 25.

**cAdvisor**
L'outil qui collecte les métriques de ressources (CPU/RAM/réseau/disque) de chaque conteneur d'un hôte.
Voir : Chapitre 34.

**Cache-aside**
Le patron consistant à vérifier le cache avant la source de vérité, et à le mettre à jour après une lecture, avec invalidation à l'écriture.
Voir : Chapitres 18, 20.

**Cache de build**
La réutilisation d'une couche déjà construite par Docker, tant que rien n'a changé pour elle (instruction et contenu de fichier identiques).
Voir : Chapitre 7.

**Capability (Linux)**
Un privilège précis et granulaire du noyau Linux, plus fin que la distinction binaire "root ou pas root".
Voir : Chapitre 26.

**Cible de build nommée (`AS nom`, `--target`)**
Une étape identifiée d'un Dockerfile multi-étapes, constructible indépendamment des autres.
Voir : Chapitres 15, 28.

**Cluster**
Un groupe de machines coordonnées, gérées collectivement pour répartir charge et résilience.
Voir : Chapitre 2.

**collectstatic**
La commande Django qui rassemble tous les fichiers statiques du projet dans un seul dossier prêt à être servi.
Voir : Chapitre 40.

**Compose (`compose.yaml`)**
Le fichier déclaratif qui décrit l'ensemble des conteneurs d'une application Docker et leur orchestration.
Voir : Chapitre 12.

**`compose.override.yaml`**
Un fichier Compose fusionné **automatiquement** avec `compose.yaml`, par convention réservé aux ajustements de développement.
Voir : Chapitre 28.

**Conteneur**
Une instance en cours d'exécution d'une image, avec une couche inscriptible éphémère ajoutée par-dessus ses couches en lecture seule.
Voir : Chapitre 1.

**Connection pooling**
La mutualisation d'un grand nombre de connexions applicatives vers un petit nombre de connexions réelles à une base de données.
Voir : Chapitre 36.

**CVE (Common Vulnerabilities and Exposures)**
Un identifiant standardisé désignant une vulnérabilité de sécurité connue et publiquement documentée.
Voir : Chapitre 26.

**Database-per-service**
Le principe selon lequel chaque microservice possède exclusivement sa propre base de données.
Voir : Chapitre 37.

**Défi webroot (webroot challenge)**
La méthode par laquelle Let's Encrypt vérifie la propriété d'un domaine, via un fichier temporaire servi en HTTP.
Voir : Chapitre 30.

**Digest**
L'identifiant cryptographique exact et immuable d'une image précise, plus strict qu'un tag.
Voir : Chapitre 25.

**Distroless**
Une image de base sans shell ni gestionnaire de paquets, réduite au strict runtime nécessaire, minimisant la surface d'attaque.
Voir : Chapitre 25.

**`.dockerignore`**
Le fichier qui exclut certains fichiers/dossiers du contexte envoyé au démon Docker lors d'un `docker build`.
Voir : Chapitre 7.

**Docker CLI**
L'interface en ligne de commande (`docker`) qui traduit les commandes tapées en requêtes envoyées à l'API du Docker daemon.
Voir : Chapitre 1.

**Docker daemon (dockerd)**
Le processus serveur qui exécute réellement le travail demandé (construction d'images, cycle de vie des conteneurs), via containerd.
Voir : Chapitre 1.

**Docker Desktop**
L'application graphique qui installe et fait tourner Docker sur Windows et macOS, généralement via une VM Linux légère.
Voir : Chapitre 3.

**Docker Engine**
L'ensemble formé par le Docker CLI, le Docker daemon et containerd.
Voir : Chapitres 1, 3.

**Docker Hub**
Le registry public par défaut de Docker, hébergeant des images officielles et communautaires.
Voir : Chapitre 1.

**docker-entrypoint-initdb.d**
Le dossier dont les scripts sont exécutés une seule fois, à la toute première initialisation d'une base MySQL/PostgreSQL conteneurisée.
Voir : Chapitre 16.

**Driver de logs**
Le mécanisme qui détermine comment et où Docker stocke les logs capturés d'un conteneur (`json-file` par défaut).
Voir : Chapitre 22.

**Dump logique**
Un export texte et portable d'une base de données, produit par un outil dédié comme `pg_dump` ou `mysqldump`.
Voir : Chapitre 33.

**État de santé (starting/healthy/unhealthy)**
Le statut affiché par `docker ps`/`docker compose ps` pour un conteneur doté d'un `HEALTHCHECK`.
Voir : Chapitre 21.

**Évasion de conteneur (container escape)**
Une faille permettant à un processus conteneurisé d'accéder à des ressources de la machine hôte hors de son isolation prévue.
Voir : Chapitre 26.

**Forme shell / forme exec**
Deux syntaxes possibles pour `RUN`/`CMD`/`ENTRYPOINT` : via un interpréteur shell intermédiaire, ou en exécution directe (préférée, meilleure propagation des signaux).
Voir : Chapitre 6.

**GitHub Container Registry (ghcr.io)**
Le registry intégré à GitHub, alternative à Docker Hub.
Voir : Chapitre 31.

**Groupe `docker`**
Le groupe d'utilisateurs Linux autorisé à communiquer avec le Docker daemon sans `sudo`, équivalent en pratique à un accès root.
Voir : Chapitre 3.

**Gunicorn**
Un serveur d'application Python de production, implémentant le standard WSGI.
Voir : Chapitre 38.

**HEALTHCHECK**
Une commande exécutée périodiquement pour juger si un conteneur est réellement opérationnel, pas seulement démarré.
Voir : Chapitres 6, 21.

**Hyperviseur**
Le logiciel qui crée et gère des machines virtuelles en virtualisant le matériel physique.
Voir : Chapitre 2.

**Image**
Un modèle figé, en lecture seule, composé de couches empilées, contenant tout ce qui est nécessaire pour exécuter une application.
Voir : Chapitre 1.

**Image dangling**
Une couche d'image devenue orpheline, sans nom ni tag valide (`<none>:<none>`).
Voir : Chapitre 24.

**Image ID**
L'identifiant unique interne d'une image précise, indépendant du nom ou du tag qui pointent vers elle.
Voir : Chapitre 5.

**Instruction (Dockerfile)**
Une ligne du Dockerfile décrivant une étape de construction (`FROM`, `COPY`, `RUN`...).
Voir : Chapitre 6.

**Interpolation `.env` (Compose)**
Le remplacement automatique de `${VARIABLE}` dans `compose.yaml` par la valeur correspondante d'un fichier `.env`.
Voir : Chapitre 13.

**Invalidation de cache**
La suppression volontaire d'une entrée de cache devenue obsolète après une écriture.
Voir : Chapitre 20.

**JDK / JRE**
Le JDK contient le compilateur et les outils nécessaires pour construire une application Java ; le JRE ne contient que ce qui est nécessaire pour l'exécuter.
Voir : Chapitre 39.

**Job / Step (GitHub Actions)**
Un job est une unité d'exécution sur une machine dédiée ; un step est une action individuelle à l'intérieur d'un job.
Voir : Chapitre 31.

**Kubernetes (K8s)**
Une plateforme d'orchestration de conteneurs à grande échelle, répartis sur plusieurs machines, hors du périmètre pratique de ce manuel.
Voir : Chapitre 2.

**Layer (couche)**
Une strate individuelle qui compose une image, additive et immuable.
Voir : Chapitres 1, 5.

**`limits` / `reservations`**
Un plafond strict (`limits`, jamais dépassable) et un minimum souhaité (`reservations`, une priorité relative) de ressources allouées à un service.
Voir : Chapitre 35.

**Machine virtuelle (VM)**
Un ordinateur complet simulé à l'intérieur d'un autre, avec son propre système d'exploitation invité.
Voir : Chapitre 2.

**Migration (base de données)**
Un changement contrôlé et tracé du schéma d'une base de données déjà en usage, appliqué via un outil dédié, jamais via `docker-entrypoint-initdb.d`.
Voir : Chapitres 16, 36.

**Mode attaché / détaché**
Attaché : le terminal reste connecté au conteneur. Détaché (`-d`) : le conteneur tourne en arrière-plan.
Voir : Chapitre 4.

**Monolithe**
Une application dont toute la logique métier est regroupée dans un seul processus/service.
Voir : Chapitre 37.

**Namespace (registry)**
La partie du nom d'un repository qui identifie son propriétaire (utilisateur ou organisation).
Voir : Chapitre 27.

**Nom de projet (Compose)**
L'identifiant qui préfixe les ressources créées par Compose pour une application donnée, déduit par défaut du nom du dossier.
Voir : Chapitre 12.

**Noyau (kernel)**
La couche logicielle centrale d'un système d'exploitation, gérant processus, mémoire et pilotes matériels, partagée entre tous les conteneurs d'un même hôte.
Voir : Chapitre 2.

**`npm ci`**
La commande d'installation stricte et reproductible de npm, basée sur `package-lock.json`, sans jamais le modifier.
Voir : Chapitre 14.

**`--omit=dev`**
L'option qui exclut les paquets `devDependencies` d'une installation npm, réduisant la taille et la surface d'attaque d'une image de production.
Voir : Chapitre 14.

**OOM killer**
Le mécanisme du noyau Linux qui termine brutalement (code de sortie 137) un processus dépassant sa limite mémoire.
Voir : Chapitre 35.

**Point de défaillance unique (single point of failure)**
Un composant dont la panne interrompt l'ensemble du système, faute de redondance.
Voir : Chapitre 36.

**Port hôte / port conteneur**
Le port hôte est celui tapé depuis l'extérieur ; le port conteneur est celui sur lequel l'application écoute réellement.
Voir : Chapitre 8.

**`PGDATA`**
La variable qui fixe l'emplacement précis des fichiers de données PostgreSQL à l'intérieur du volume monté, par précaution.
Voir : Chapitre 17.

**Publication de port (`-p`)**
La redirection d'un port de la machine hôte vers un port à l'intérieur d'un conteneur.
Voir : Chapitre 8.

**`psycopg2`**
Le pilote PostgreSQL natif le plus utilisé pour Python, nécessitant une compilation à l'installation.
Voir : Chapitre 40.

**Rôle (PostgreSQL)**
L'équivalent PostgreSQL d'un compte utilisateur, pouvant porter des droits précis.
Voir : Chapitre 17.

**Redis**
Un magasin de données clé-valeur en mémoire, rapide, avec persistance optionnelle (RDB/AOF).
Voir : Chapitre 18.

**Registry**
Un service exposant une API standardisée de stockage et de distribution d'images Docker, public (Docker Hub) ou privé.
Voir : Chapitres 1, 27.

**Relaxed binding (Spring)**
La correspondance automatique entre une variable d'environnement et une propriété de configuration Spring, sans code Java additionnel.
Voir : Chapitre 39.

**Repository**
L'espace nommé qui regroupe les versions (tags) d'une même image.
Voir : Chapitres 1, 5.

**Réseau `bridge`**
Le type de réseau virtuel par défaut de Docker ; sa variante par défaut ne fournit pas de résolution DNS entre conteneurs.
Voir : Chapitre 11.

**Réseau personnalisé**
Un réseau créé explicitement par l'utilisateur, avec résolution DNS automatique entre les conteneurs qui y sont rattachés.
Voir : Chapitre 11.

**Réseau Docker**
L'espace de communication virtuel qui permet à plusieurs conteneurs de se joindre entre eux par leur nom.
Voir : Chapitre 1.

**Règle 3-2-1**
3 copies des données, sur 2 supports différents, dont 1 copie hors site.
Voir : Chapitre 33.

**Règle d'alerte**
Une condition, associée à une métrique et un seuil, qui déclenche une notification si elle est remplie.
Voir : Chapitre 34.

**Rollback**
Le retour à une version précédente d'une application, après détection d'un problème sur la version actuelle.
Voir : Chapitre 32.

**`scp`**
La commande de copie sécurisée de fichiers à travers une connexion SSH.
Voir : Chapitre 29.

**Scraping**
La collecte de métriques par interrogation active et régulière d'une cible (mode PULL de Prometheus).
Voir : Chapitre 34.

**Secret BuildKit**
Un secret monté temporairement pendant une seule instruction `RUN`, jamais gravé dans une couche d'image.
Voir : Chapitre 26.

**Service (Compose)**
Un conteneur défini dans `compose.yaml`, sous la clé `services`, dont le nom sert aussi d'identifiant DNS.
Voir : Chapitre 12.

**SPA (Single Page Application)**
Une application web qui charge une seule page HTML puis gère la navigation entièrement en JavaScript côté client.
Voir : Chapitre 15.

**Spring Boot Actuator**
Un module Spring fournissant des routes opérationnelles prêtes à l'emploi, dont une route de santé.
Voir : Chapitre 39.

**stdout / stderr**
Les deux flux de sortie standard d'un programme, seuls capturés automatiquement par Docker pour les logs.
Voir : Chapitre 22.

**Superutilisateur (PostgreSQL)**
Le compte PostgreSQL avec tous les droits, créé par défaut via `POSTGRES_USER`.
Voir : Chapitre 17.

**Tag**
L'étiquette qui précise une version dans un repository (`node:20`).
Voir : Chapitres 1, 5.

**Tag immuable**
Un tag qui, une fois publié, pointe toujours vers exactement la même image, jamais réassigné (contrairement à `:latest`).
Voir : Chapitre 32.

**Test de restauration**
La vérification pratique qu'une sauvegarde peut réellement être reconstituée en données utilisables — la seule garantie fiable qu'elle fonctionne.
Voir : Chapitre 33.

**`tmpfs`**
Un montage qui vit uniquement en mémoire RAM, jamais sur le disque.
Voir : Chapitre 10.

**TTL (Time To Live)**
La durée de vie restante d'une clé Redis avant son expiration automatique.
Voir : Chapitre 18.

**`try_files` (Nginx)**
La directive Nginx qui tente plusieurs chemins dans l'ordre avant un dernier recours, indispensable au routage côté client d'une SPA.
Voir : Chapitre 15.

**URL relative (variable de build)**
Une variable frontend pointant vers un chemin (`/api`) plutôt qu'un domaine complet, résolue par le navigateur par rapport à l'origine de la page.
Voir : Chapitre 20.

**Variable d'environnement**
Une valeur de configuration fournie à un programme depuis l'extérieur de son code.
Voir : Chapitres 6, 9.

**Voisin bruyant (noisy neighbor)**
Un conteneur qui, sans limite de ressources, consomme au point d'affecter les autres conteneurs de la même machine.
Voir : Chapitre 35.

**Volume (nommé)**
Un espace de stockage géré par Docker, indépendant du cycle de vie d'un conteneur précis.
Voir : Chapitres 1, 10.

**VPS (Virtual Private Server)**
Un serveur virtuel loué chez un hébergeur, avec un accès administrateur complet.
Voir : Chapitre 29.

**WSGI**
Le standard d'interface entre un serveur web et une application Python synchrone (comme Flask/Django).
Voir : Chapitre 38.

**WSL 2 (Windows Subsystem for Linux, version 2)**
La couche qui permet à Windows de faire tourner un vrai noyau Linux léger, utilisée par Docker Desktop.
Voir : Chapitre 3.

**Workflow (GitHub Actions)**
Un fichier YAML décrivant une automatisation déclenchée par un événement du dépôt.
Voir : Chapitre 31.

**`X-Forwarded-For` / `X-Real-IP`**
Les en-têtes qui transmettent la vraie adresse IP du client à travers un reverse proxy.
Voir : Chapitre 19.

---

⬅️ [Annexe A — Cheat sheet](ANNEXE-A-cheat-sheet-commandes.md) · ➡️ **Suite : Annexe C — Checklists professionnelles**
