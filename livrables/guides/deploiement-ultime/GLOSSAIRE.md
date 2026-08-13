# Glossaire complet

> Compilation alphabétique de tous les termes définis chapitre par chapitre. Chaque entrée : définition simple, définition technique, exemple concret, renvoi au chapitre d'origine.

---

**ACME (Automatic Certificate Management Environment)**
Simple : le protocole automatisé qui permet d'obtenir un certificat SSL sans intervention humaine.
Technique : protocole standardisé (RFC 8555) définissant l'échange de défis de vérification de domaine entre un client (Certbot) et une autorité de certification.
Exemple : le défi HTTP-01 utilisé par `certbot --nginx`.
Voir : Chapitre 10.

**Adresse IP**
Simple : l'adresse d'une machine sur Internet.
Technique : identifiant numérique unique (IPv4 32 bits ou IPv6 128 bits) attribué à une interface réseau.
Exemple : `38.242.137.71`.
Voir : Chapitre 1.

**Artefact**
Simple : le résultat figé d'une compilation, prêt à être déployé.
Technique : fichier binaire ou packagé (`.jar`, `.dll`), produit par un build, indépendant du code source qui l'a généré.
Exemple : `mon-app.jar` compilé en CI.
Voir : Chapitre 24.

**Autorité de certification (CA)**
Simple : une entité de confiance qui délivre des certificats après vérification d'identité.
Technique : organisation dont la clé publique racine est intégrée aux navigateurs, base de la chaîne de confiance TLS.
Exemple : Let's Encrypt.
Voir : Chapitre 10.

**Bench**
Simple : l'outil en ligne de commande de Frappe pour administrer sites et applications ERPNext.
Technique : utilitaire CLI Python gérant le cycle de vie des sites Frappe (création, sauvegarde, restauration).
Exemple : `bench new-site`.
Voir : Chapitre 27.

**Branche (Git)**
Simple : une ligne de développement indépendante.
Technique : pointeur mobile référençant le dernier commit d'une ligne de développement.
Exemple : `feature-paiement`.
Voir : Chapitre 3.

**Cache-aside**
Simple : vérifier le cache avant un calcul coûteux, y stocker le résultat pour la prochaine fois.
Technique : motif où l'application gère explicitement lecture, calcul de repli, et écriture dans le cache.
Exemple : vérifier Redis avant d'interroger la base pour un rapport agrégé.
Voir : Chapitre 14.

**Chemin absolu / relatif**
Simple : l'adresse complète d'un fichier depuis la racine, ou depuis l'endroit courant.
Technique : séquence de noms de dossiers séparés par `/`, débutant à la racine (absolu) ou au dossier courant (relatif).
Exemple : `/home/jaslin/app` vs `app`.
Voir : Chapitre 2.

**Client Prisma généré**
Simple : le code qui permet à l'application de parler à la base de données, propre à son schéma.
Technique : module généré par `prisma generate`, à recopier explicitement dans un build Docker multi-étapes.
Voir : Chapitre 21.

**Commit**
Simple : un instantané nommé et daté du projet.
Technique : objet Git immuable identifié par un hash, référençant un arbre de fichiers et un ou plusieurs parents.
Exemple : `a1b2c3d Ajouter la validation du formulaire`.
Voir : Chapitre 3.

**Conflit de fusion**
Simple : une situation où Git ne peut pas décider seul quelle version garder.
Technique : état survenant quand deux branches modifient différemment les mêmes lignes, nécessitant une résolution manuelle.
Exemple : balises `<<<<<<<`/`=======`/`>>>>>>>`.
Voir : Chapitre 3.

**Container**
Simple : une instance en cours d'exécution d'une image Docker.
Technique : processus isolé (namespace, cgroups) partageant le noyau de l'hôte, avec son propre système de fichiers et réseau.
Exemple : `docker run -d --name mon-api mon-api:1.0`.
Voir : Chapitre 7.

**Cron**
Simple : le planificateur de tâches automatiques de Linux.
Technique : daemon exécutant des commandes à des horaires définis dans des fichiers `crontab`.
Exemple : une sauvegarde lancée chaque nuit à 2h.
Voir : Chapitre 1.

**Daemon / Service**
Simple : un programme qui tourne en arrière-plan en continu.
Technique : processus détaché d'un terminal, généralement démarré au boot et supervisé par systemd.
Exemple : le service `nginx`.
Voir : Chapitre 1.

**dbfilter (Odoo)**
Simple : un réglage qui limite les bases de données visibles selon le domaine d'accès.
Technique : expression régulière appliquée au nom d'hôte, filtrant la liste des bases Odoo proposées.
Voir : Chapitre 28.

**Déduplication**
Simple : ne stocker qu'une seule fois une donnée identique, même répétée.
Technique : technique identifiant des blocs de données identiques par empreinte cryptographique, n'en conservant qu'une copie physique.
Exemple : deux sauvegardes Restic consécutives d'une base peu modifiée.
Voir : Chapitre 16.

**Défense en profondeur**
Simple : plusieurs couches de sécurité indépendantes, jamais une seule supposée suffisante.
Technique : stratégie redondante où chaque couche protège contre une classe différente de menace.
Exemple : pare-feu + Fail2ban + SSH par clé + droits sudo minimaux.
Voir : Chapitre 15.

**Dépôt (repository, Git)**
Simple : un projet suivi par Git, avec tout son historique.
Technique : structure `.git/` contenant l'ensemble des objets représentant l'historique du projet.
Voir : Chapitre 3.

**Dépôt (repository, Restic/Borg)**
Simple : l'espace de stockage structuré des sauvegardes chiffrées et dédupliquées.
Technique : structure de données propriétaire à l'outil, indépendante du support physique.
Exemple : `s3:https://s3.us-west-002.backblazeb2.com/bucket`.
Voir : Chapitre 16.

**Deploy Key**
Simple : une clé d'accès dédiée à un serveur, limitée à un seul dépôt.
Technique : clé SSH publique enregistrée au niveau d'un dépôt précis, généralement en lecture seule.
Voir : Chapitre 3.

**Dérive de privilèges**
Simple : l'accumulation progressive et oubliée de droits accordés au fil du temps.
Technique : écart croissant entre droits nécessaires et droits réellement accordés, non corrigé faute d'audit périodique.
Exemple : un compte sudo de stagiaire jamais désactivé.
Voir : Chapitre 15.

**Environnement virtuel (Python)**
Simple : une boîte à outils Python isolée, propre à un projet.
Technique : dossier contenant une copie de l'interpréteur et un `site-packages` local, créé par `venv`.
Voir : Chapitre 5.

**Exporter (Prometheus)**
Simple : un petit programme qui traduit l'état d'un système en métriques lisibles par Prometheus.
Technique : service HTTP exposant des métriques au format texte sur `/metrics`, scrapé périodiquement.
Exemple : `node_exporter`.
Voir : Chapitre 13.

**Fail2ban**
Simple : un logiciel qui bannit automatiquement les IP échouant trop souvent à se connecter.
Technique : service surveillant les logs pour détecter des motifs d'échec répétés, appliquant un bannissement via le pare-feu.
Voir : Chapitre 4.

**FastCGI**
Simple : le protocole qui permet à nginx de déléguer l'exécution du code PHP à php-fpm.
Technique : protocole de communication entre un serveur web et un processus applicatif.
Voir : Chapitre 22.

**Faux positif de résolution**
Simple : un symptôme qui disparaît sans que la cause ait été traitée.
Technique : action (souvent un redémarrage) réinitialisant un état défaillant sans corriger son mécanisme producteur.
Voir : Chapitre 18.

**Firewall (pare-feu)**
Simple : le filtre qui bloque tout trafic réseau non autorisé.
Technique : dispositif appliquant des règles de filtrage de paquets selon des critères (port, IP, protocole).
Exemple : `ufw`.
Voir : Chapitre 1.

**Goulot d'étranglement**
Simple : la ressource la plus contrainte, celle qui limite réellement la performance globale.
Technique : composant dont la capacité maximale est atteinte en premier, plafonnant le débit de l'ensemble.
Voir : Chapitre 14.

**Hardening index**
Simple : un score mesurant objectivement le niveau de durcissement d'un système.
Technique : indice calculé par Lynis à partir des tests réussis, avertissements et suggestions.
Voir : Chapitre 15.

**Healthcheck (Docker Compose)**
Simple : un test périodique confirmant qu'un service est réellement opérationnel.
Technique : commande exécutée à intervalle régulier dans un container, dont le résultat détermine l'état "healthy"/"unhealthy".
Exemple : `mysqladmin ping`.
Voir : Chapitre 8.

**HSTS (HTTP Strict Transport Security)**
Simple : un engagement durable à n'utiliser que HTTPS pour un domaine.
Technique : en-tête HTTP indiquant au navigateur de refuser toute connexion HTTP non chiffrée pendant une durée définie.
Exemple : `max-age=31536000; includeSubDomains`.
Voir : Chapitre 10.

**HTTPS / TLS / SSL**
Simple : la version chiffrée de HTTP.
Technique : HTTP transporté sur une connexion chiffrée par TLS, garantissant confidentialité et intégrité.
Voir : Chapitre 1.

**Hyperviseur**
Simple : le logiciel qui découpe une machine physique en plusieurs machines virtuelles.
Technique : couche logicielle (KVM, Xen) virtualisant le matériel et isolant plusieurs systèmes invités.
Voir : Chapitre 1.

**Image (Docker)**
Simple : un modèle figé contenant tout le nécessaire pour faire tourner une application.
Technique : ensemble de couches en lecture seule, empilées selon un Dockerfile.
Exemple : `mon-api:1.0`.
Voir : Chapitre 7.

**Isolation (diagnostic)**
Simple : réduire un problème à sa plus petite reproduction possible.
Technique : démarche testant chaque composant indépendamment pour localiser un dysfonctionnement.
Voir : Chapitre 18.

**Kestrel**
Simple : le serveur web intégré à ASP.NET Core.
Technique : serveur HTTP multiplateforme léger, conçu pour tourner derrière un reverse proxy.
Voir : Chapitre 6, 25.

**Longpolling**
Simple : une technique simulant des mises à jour en temps réel sans WebSocket natif.
Technique : le client maintient une requête HTTP ouverte jusqu'à ce que le serveur ait une donnée à transmettre.
Voir : Chapitre 28.

**LTS (Long Term Support)**
Simple : une version d'Ubuntu recevant des mises à jour de sécurité pendant plusieurs années.
Technique : cycle de publication à support étendu (5 ans), contrairement aux versions intermédiaires (9 mois).
Exemple : Ubuntu 24.04 LTS.
Voir : Chapitre 4.

**Mise à jour de sécurité vs majeure**
Simple : un correctif ciblé sans risque de casse vs une nouvelle version pouvant changer un comportement.
Technique : la première corrige une vulnérabilité sans modifier de fonctionnalité ; la seconde change potentiellement API/dépendances.
Voir : Chapitre 17.

**Module (NestJS)**
Simple : un regroupement organisé de fonctionnalités liées.
Technique : classe décorée `@Module()` regroupant contrôleurs, services et fournisseurs d'un même domaine.
Voir : Chapitre 20.

**Monitoring synthétique**
Simple : une vérification simulée depuis l'extérieur, comme le ferait un vrai visiteur.
Technique : requête HTTP périodique émise depuis un emplacement externe, mesurant disponibilité et temps de réponse.
Exemple : Uptime Kuma.
Voir : Chapitre 13.

**Override (Docker Compose)**
Simple : un fichier d'ajustements fusionné automatiquement avec la configuration de base.
Technique : `docker-compose.override.yml`, chargé par défaut en plus de `docker-compose.yml`.
Voir : Chapitre 8.

**Paquet**
Simple : une unité de logiciel installable en une commande.
Technique : archive `.deb` contenant un programme, ses métadonnées et dépendances, distribuée via un dépôt APT.
Voir : Chapitre 2.

**Permission**
Simple : ce qu'un utilisateur a le droit de faire sur un fichier.
Technique : ensemble de droits (lecture/écriture/exécution) attribués séparément au propriétaire, au groupe, aux autres.
Voir : Chapitre 2.

**pg_hba.conf**
Simple : le fichier qui décide qui peut se connecter à PostgreSQL, et comment.
Technique : fichier de configuration d'authentification hôte-based de PostgreSQL.
Exemple : `host nomapp user 127.0.0.1/32 scram-sha-256`.
Voir : Chapitre 12.

**Pipeline (CI/CD)**
Simple : la séquence automatisée complète, du push au déploiement.
Technique : ensemble de jobs déclenchés par un événement, exécutés selon un ordre et des dépendances définis.
Exemple : `.github/workflows/ci.yml`.
Voir : Chapitre 11.

**Port**
Simple : le numéro qui indique à quel service une donnée est destinée sur une machine.
Technique : entier de 0 à 65535 identifiant un point de terminaison réseau.
Exemple : 443 pour HTTPS.
Voir : Chapitre 1.

**Processus**
Simple : un programme en cours d'exécution.
Technique : instance d'exécution identifiée par un PID, avec son propre espace mémoire.
Voir : Chapitre 1.

**Registre (Docker Hub)**
Simple : un dépôt centralisé d'images Docker.
Technique : service hébergeant des images taguées, accessible via `docker pull`/`push`.
Exemple : `mysql:8`.
Voir : Chapitre 7.

**Règle 3-2-1**
Simple : 3 copies des données, sur 2 supports différents, dont 1 hors site.
Technique : stratégie de sauvegarde standard, conçue pour survivre à une corruption logique et une destruction physique.
Voir : Chapitre 12, 16.

**Remote (Git)**
Simple : un dépôt distant, référencé par un nom.
Technique : URL enregistrée sous un alias (`origin`) permettant la synchronisation avec un dépôt distant.
Voir : Chapitre 3.

**Reverse proxy**
Simple : le logiciel qui reçoit toutes les requêtes et les redirige vers le bon service interne.
Technique : serveur intermédiaire côté serveur recevant les requêtes pour le compte d'un ou plusieurs backends.
Exemple : Nginx via `proxy_pass`.
Voir : Chapitre 1, 9.

**Root**
Simple : le compte administrateur suprême de Linux, avec tous les droits.
Technique : utilisateur d'UID 0, non soumis aux vérifications de permissions habituelles.
Voir : Chapitre 1.

**Rotation de logs**
Simple : limiter la taille d'un fichier de log en le renouvelant régulièrement.
Technique : mécanisme archivant un log à intervalle régulier ou selon une taille limite, supprimant les archives anciennes.
Exemple : `pm2-logrotate`.
Voir : Chapitre 17.

**Runner (CI/CD)**
Simple : la machine qui exécute réellement un job de pipeline.
Technique : environnement d'exécution (hébergé ou auto-hébergé) sur lequel les étapes d'un job s'exécutent.
Exemple : `runs-on: ubuntu-latest`.
Voir : Chapitre 11.

**Sauvegarde cohérente**
Simple : une sauvegarde qui capture un état stable, même si la base change pendant l'export.
Technique : dump réalisé dans une transaction unique isolée.
Exemple : `mysqldump --single-transaction`.
Voir : Chapitre 12.

**Scraping (Prometheus)**
Simple : le fait, pour Prometheus, d'aller chercher activement les métriques.
Technique : requête HTTP GET périodique vers l'endpoint `/metrics` de chaque cible configurée.
Voir : Chapitre 13.

**Secret protégé (CI/CD)**
Simple : une valeur sensible stockée de façon sécurisée par la plateforme CI.
Technique : variable chiffrée au repos, injectée à l'exécution sans jamais apparaître en clair dans le code.
Exemple : `${{ secrets.DEPLOY_SSH_KEY }}`.
Voir : Chapitre 11.

**Serveur**
Simple : un ordinateur allumé en permanence qui répond à des demandes venues d'Internet.
Technique : machine exécutant un ou plusieurs programmes écoutant des connexions réseau entrantes.
Voir : Chapitre 1.

**Service (Docker Compose)**
Simple : un composant de l'application décrit dans `docker-compose.yml`.
Technique : entrée sous la clé `services:`, définissant l'image, les variables, les ports, les dépendances d'un container.
Voir : Chapitre 8.

**Shell**
Simple : le programme qui interprète les commandes tapées dans un terminal.
Technique : interpréteur de commandes (bash, zsh) offrant un langage de script.
Voir : Chapitre 2.

**Site (Frappe)**
Simple : une installation ERPNext isolée, avec ses propres données.
Technique : unité multi-tenant native au framework Frappe, chacune avec sa propre base de données.
Voir : Chapitre 27.

**Snapshot (Restic/Borg)**
Simple : un instantané nommé et daté d'une sauvegarde.
Technique : référence immuable vers un ensemble de blocs de données à un instant précis.
Voir : Chapitre 16.

**SPA (Single Page Application)**
Simple : une application web dont le routage se fait côté navigateur.
Technique : le serveur renvoie toujours le même point d'entrée HTML, le JavaScript gère le rendu des vues.
Voir : Chapitre 6.

**Stack**
Simple : l'ensemble des technologies utilisées ensemble pour une application.
Technique : combinaison précise de langages, frameworks, bases de données et outils d'infrastructure d'un projet.
Voir : Chapitre 19.

**Swap**
Simple : un espace disque utilisé comme mémoire de secours quand la RAM est pleine.
Technique : fichier ou partition utilisé par le noyau pour décharger des pages mémoire inactives.
Voir : Chapitre 4.

**Symptôme**
Simple : ce qui est visible, pas nécessairement l'endroit où corriger.
Technique : manifestation observable d'un dysfonctionnement, potentiellement éloignée de sa cause racine.
Voir : Chapitre 18.

**systemd**
Simple : le gestionnaire de services du système Linux.
Technique : système d'init standard des distributions modernes, gérant démarrage et supervision via des unités `.service`.
Voir : Chapitre 1.

**Rate limiting**
Simple : une limite du nombre de requêtes autorisées dans un temps donné.
Technique : mécanisme de limitation de débit via `limit_req_zone`/`limit_req`, basé sur une clé (souvent l'IP).
Voir : Chapitre 9.

**TTL (Time To Live)**
Simple : la durée pendant laquelle une donnée en cache reste valide.
Technique : délai d'expiration associé à une clé de cache.
Exemple : `redis.set(cle, valeur, 'EX', 300)`.
Voir : Chapitre 14.

**Variable d'environnement**
Simple : une valeur de configuration fournie à un programme sans toucher au code.
Technique : paire clé-valeur du contexte d'exécution, accessible via l'API du langage.
Exemple : `DATABASE_URL`.
Voir : Chapitre 1.

**Virtual host**
Simple : un site hébergé sur un serveur partagé, identifié par son domaine.
Technique : bloc `server` nginx associé à un `server_name`, sélectionné selon l'en-tête `Host`.
Voir : Chapitre 9.

**Volume (Docker)**
Simple : un espace de stockage qui survit à la suppression d'un container.
Technique : mécanisme de persistance géré par Docker, indépendant du cycle de vie des containers.
Exemple : `mysql-data:/var/lib/mysql`.
Voir : Chapitre 7.

**VPS (Virtual Private Server)**
Simple : une portion isolée d'un serveur physique, avec accès administrateur complet.
Technique : machine virtuelle créée par un hyperviseur, disposant de ressources allouées et d'un accès root indépendant.
Voir : Chapitre 1.

**WSGI**
Simple : le pont standard entre un serveur et une application Python.
Technique : Web Server Gateway Interface, spécification de l'interface serveur/application Python.
Exemple : `gunicorn monprojet.wsgi:application`.
Voir : Chapitre 6, 23.

---

⬅️ [Sommaire](README.md)
