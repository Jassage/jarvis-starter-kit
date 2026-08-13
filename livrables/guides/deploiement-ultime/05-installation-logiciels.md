# Chapitre 5 — Installation des logiciels

**Niveau : Intermédiaire**

---

## Introduction

Le serveur préparé au chapitre 4 est sûr, mais vide : aucun langage, aucune base de données, aucun outil capable de faire tourner une application. Ce chapitre installe, un par un, tous les logiciels que les chapitres suivants pourront utiliser. Il fonctionne comme un catalogue de référence plutôt que comme une séquence linéaire obligatoire — tu n'installeras presque jamais tout ce qui suit sur un même serveur, seulement ce dont ton projet a réellement besoin.

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras installer et vérifier : Node.js (via nvm), npm, pnpm, Bun ; Python avec ses environnements virtuels ; PHP et php-fpm ; Java (JRE vs JDK) ; MySQL et PostgreSQL, avec leur sécurisation de base ; Redis ; MongoDB ; Docker ; Nginx et Apache ; PM2. Pour chaque logiciel, tu sauras expliquer ce que l'installation modifie réellement sur le système, et comment vérifier qu'elle a réussi autrement qu'en espérant que "ça a dû marcher".

## 📋 Prérequis

Chapitre 4 complété : un VPS Ubuntu LTS sécurisé (utilisateur non-root, clé SSH, pare-feu, Fail2ban).

## Pourquoi ce chapitre est important

Une installation bâclée se paie plus tard, souvent au pire moment : un MySQL jamais sécurisé expose un mot de passe root par défaut ; un Redis sans authentification devient une porte d'entrée pour un attaquant ; un Node installé via le paquet Ubuntu générique se retrouve bloqué sur une version obsolète incompatible avec un framework récent. Ce chapitre installe chaque logiciel **correctement dès la première fois**, avec sa sécurisation de base incluse, pas comme une étape à rattraper plus tard.

---

## Concepts fondamentaux

1. **Gestionnaire de version de runtime** (nvm) — permet plusieurs versions coexistantes d'un même langage.
2. **Environnement virtuel** (Python) — isole les dépendances d'un projet des autres.
3. **Processus applicatif vs serveur web** — PHP a besoin de `php-fpm` pour être exécuté par nginx, contrairement à Node qui embarque son propre serveur.
4. **Compte administrateur d'une base de données** — toujours distinct du compte applicatif qui s'y connectera.
5. **Sécurisation par défaut absente** — Redis et MongoDB, en particulier, n'ont aucune protection tant qu'on ne l'ajoute pas explicitement.
6. **Dépôt tiers** — certains logiciels (MongoDB, Docker) ne sont pas dans les dépôts Ubuntu standards et nécessitent l'ajout d'une source externe signée.

---

## Explications détaillées

### 5.1 Node.js — via nvm (Node Version Manager)

> 💡 **Pourquoi pas `apt install nodejs` directement ?** Le paquet Ubuntu est souvent en retard de plusieurs versions, et un serveur héberge parfois plusieurs projets nécessitant des versions Node différentes. `nvm` permet d'installer et de basculer entre plusieurs versions sans conflit.

#### Installer nvm
**Description :** télécharge et exécute le script d'installation officiel de nvm.
**Syntaxe :**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
```
**Décomposition mot par mot :** `curl -o-` télécharge le script et l'affiche sur la sortie standard (`-o -`) plutôt que de le sauvegarder ; `| bash` envoie directement ce flux à l'interpréteur bash pour exécution ; `source ~/.bashrc` recharge la configuration du shell modifiée par le script, sans nécessiter de déconnexion.
**Options :** aucune, le script gère lui-même la détection du système.
**Cas d'utilisation :** première installation de Node.js sur un serveur neuf.
**Exemple :** voir syntaxe ci-dessus.
**Résultat attendu :** un dossier `~/.nvm` créé, quelques lignes ajoutées à `~/.bashrc`.
**Explication du résultat :** nvm est désormais disponible comme fonction shell, chargée automatiquement à chaque nouvelle session.
**Erreurs possibles :** `command not found: nvm` immédiatement après installation sans avoir fait `source ~/.bashrc`.
**Vérification :** `nvm --version`.
**Cas pratiques :** base de toute installation Node de ce manuel.

> ⚠️ **Attention** — Vérifier toujours le numéro de version du script d'installation (`v0.40.1` ci-dessus) sur la page officielle ([github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)) avant de l'exécuter — ne jamais enchaîner à l'aveugle un script téléchargé directement à `bash` sans savoir ce qu'il contient, en particulier depuis une source moins établie que le dépôt officiel.

```bash
nvm install --lts
nvm use --lts
nvm alias default lts/*
node -v
npm -v
```
**Résultat attendu :**
```
v22.x.x
10.x.x
```
> ❌ **Erreur fréquente** — `node: command not found` dans une **nouvelle** session SSH après installation : `nvm use --lts` ne fixe la version que pour la session courante. `nvm alias default lts/*` la rend permanente.

### 5.2 pnpm

Un gestionnaire de paquets alternatif à npm, plus rapide et plus économe en espace disque (cache global partagé entre projets plutôt que duplication complète de `node_modules`).

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```
**Explication :** `corepack`, fourni avec Node depuis sa version 16+, gère proprement les gestionnaires de paquets alternatifs sans installation globale séparée à maintenir manuellement.

### 5.3 Bun

Un runtime JavaScript tout-en-un (exécution, gestionnaire de paquets, bundler), plus récent que Node, réputé pour sa rapidité.

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun -v
```
> 📌 **À retenir** — Bun est compatible avec une grande partie de l'écosystème Node, mais pas à 100 %. Pour un projet déjà écrit et testé sous Node, ne pas migrer vers Bun uniquement "pour la performance" sans avoir vérifié la compatibilité réelle du projet.

### 5.4 Python et environnements virtuels

```bash
sudo apt install python3 python3-pip python3-venv -y
python3 --version
```
`python3-pip` est le gestionnaire de paquets Python ; `python3-venv` permet de créer des **environnements virtuels**.

#### `python3 -m venv`
**Description :** crée un environnement Python isolé, avec ses propres dépendances, indépendant du système global.
**Syntaxe :** `python3 -m venv nom-dossier`
**Décomposition mot par mot :** `-m venv` exécute le module `venv` de la bibliothèque standard Python.
**Cas d'utilisation :** isoler les dépendances d'un projet Django/Gunicorn (chapitre 6) du reste du système.
**Exemple :**
```bash
cd ~/monprojet
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
```
**Résultat attendu :** le prompt affiche `(venv)` une fois activé, confirmant l'environnement isolé actif.
**Explication du résultat :** `pip install` installe désormais les paquets **dans ce dossier `venv/`**, jamais dans les paquets système globaux.
**Erreurs possibles :** oublier `source venv/bin/activate` avant `pip install` — les paquets s'installent alors globalement par erreur.
**Vérification :** `which python` doit pointer vers `venv/bin/python`, pas `/usr/bin/python3`, une fois activé.
**Cas pratiques :** un environnement virtuel distinct par projet Python hébergé sur le même serveur.

> ⚠️ **Attention** — Ne jamais faire `sudo pip install ...` directement sur le système : ça installe des paquets globalement et peut entrer en conflit avec des outils système qui dépendent eux-mêmes de Python.

### 5.5 PHP

```bash
sudo apt install php php-fpm php-mysql php-pgsql php-cli php-curl php-mbstring php-xml -y
php -v
```
- `php-fpm` (*FastCGI Process Manager*) : le composant qui permet à nginx de déléguer l'exécution du code PHP — nginx ne sait pas exécuter du PHP lui-même, contrairement à un serveur Node qui embarque directement son propre serveur (détaillé au chapitre 9).
- Les extensions (`php-mysql`, `php-mbstring`...) s'ajoutent selon les besoins réels du framework utilisé (Laravel, étudié au chapitre 22, en nécessite plusieurs).

**Vérifier que php-fpm tourne :**
```bash
sudo systemctl status php8.3-fpm
```

### 5.6 Java

```bash
sudo apt install openjdk-21-jre-headless -y    # pour EXÉCUTER une application déjà compilée (.jar)
sudo apt install openjdk-21-jdk -y             # pour COMPILER du code Java sur le serveur
java -version
```
> 📌 **À retenir** — `jre` (Java Runtime Environment) suffit pour exécuter un `.jar` déjà compilé ailleurs (en CI, par exemple) ; `jdk` (Java Development Kit) n'est nécessaire que pour compiler directement sur le serveur, rarement la meilleure pratique en production (chapitre 24, Spring Boot).

### 5.7 MySQL

```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

#### `mysql_secure_installation`
**Description :** un script interactif qui applique les réglages de sécurité de base indispensables sur une installation MySQL neuve.
**Syntaxe :** `sudo mysql_secure_installation`
**Cas d'utilisation :** immédiatement après toute installation de MySQL, sans exception.
**Exemple :** voir syntaxe.
**Résultat attendu :** une série de questions successives : configurer un plugin de validation de mot de passe (oui) ; définir un mot de passe root MySQL fort (**oui, obligatoire**) ; supprimer les utilisateurs anonymes (oui) ; interdire la connexion root à distance (oui) ; supprimer la base de test (oui) ; recharger les tables de privilèges (oui).
**Explication du résultat :** chaque "oui" ferme une faille par défaut de l'installation neuve — l'exécution complète du script est requise, jamais une étape "sautée pour aller plus vite".
**Erreurs possibles :** mot de passe root oublié après coup, sans aucun moyen simple de le retrouver (une réinitialisation complète est nécessaire).
**Vérification :** `mysql -u root -p` demande désormais bien un mot de passe.
**Cas pratiques :** l'incident déjà documenté sur ce type de projet — un mot de passe MySQL resté à sa valeur d'exemple découvert bien après la mise en production — est précisément ce que cette étape prévient.

**Créer un utilisateur applicatif dédié** (jamais faire tourner une application avec le compte root MySQL) :
```bash
sudo mysql -u root -p
```
```sql
CREATE DATABASE nomapp;
CREATE USER 'nomapp_user'@'localhost' IDENTIFIED BY 'mot-de-passe-fort';
GRANT ALL PRIVILEGES ON nomapp.* TO 'nomapp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
**Explication :** `'nomapp_user'@'localhost'` ne peut se connecter que depuis le serveur lui-même, jamais depuis l'extérieur — cohérent avec la règle du pare-feu (chapitre 4) qui n'expose jamais le port 3306 publiquement. `GRANT ALL PRIVILEGES ON nomapp.*` limite les droits à cette seule base, pas à l'ensemble du serveur.

**Vérifier :**
```bash
mysql -u nomapp_user -p nomapp -e "SELECT 1;"
```

> ❌ **Erreur fréquente** — Utiliser le compte `root` MySQL directement dans le `DATABASE_URL` d'une application. Si l'application est un jour compromise, l'attaquant hérite alors de droits illimités sur l'ensemble du serveur MySQL, pas seulement sur la base de ce projet.

### 5.8 PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl status postgresql
```
PostgreSQL crée automatiquement un utilisateur système `postgres`, l'administrateur de la base.

```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE nomapp;
CREATE USER nomapp_user WITH ENCRYPTED PASSWORD 'mot-de-passe-fort';
GRANT ALL PRIVILEGES ON DATABASE nomapp TO nomapp_user;
\q
```

> 📌 **À retenir — différence d'authentification avec MySQL.** PostgreSQL utilise souvent l'authentification **peer** en local (basée sur l'utilisateur système Linux, pas un mot de passe) pour les connexions via `sudo -u postgres`. Pour qu'une application se connecte avec `nomapp_user` et un mot de passe classique, la méthode `md5` ou `scram-sha-256` doit être vérifiée dans `pg_hba.conf` — approfondi au chapitre 12.

**Vérifier :**
```bash
psql -U nomapp_user -d nomapp -h localhost -W
```

### 5.9 Redis

Une base de données **en mémoire**, typiquement cache ou file de tâches.

```bash
sudo apt install redis-server -y
sudo nano /etc/redis/redis.conf
```
Régler :
```
bind 127.0.0.1 -::1
requirepass mot-de-passe-tres-fort
```

#### `redis-cli`
**Description :** client en ligne de commande interactif pour interroger et administrer Redis.
**Syntaxe :** `redis-cli`
**Cas d'utilisation :** vérifier qu'un mot de passe est bien exigé après configuration.
**Exemple :**
```bash
sudo systemctl restart redis-server
redis-cli
AUTH mot-de-passe-tres-fort
PING
```
**Résultat attendu :** `PONG`.
**Explication du résultat :** la commande `PING` ne réussit qu'après une authentification (`AUTH`) réussie — la preuve que le mot de passe est bien exigé.
**Erreurs possibles :** `NOAUTH Authentication required` si `PING` est tenté avant `AUTH` — comportement voulu, pas une erreur de configuration.
**Vérification :** tenter `PING` **sans** `AUTH` au préalable doit échouer.
**Cas pratiques :** vérification systématique après toute modification de `redis.conf`.

> ⚠️ **Attention** — Un Redis exposé sur Internet sans mot de passe est une faille critique et fréquemment exploitée automatiquement par des robots scannant le port 6379 — vérifier `bind` et `requirepass` immédiatement après l'installation, jamais "plus tard".

### 5.10 MongoDB

```bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install mongodb-org -y
sudo systemctl enable --now mongod
```
**Ce que fait ce bloc :** MongoDB n'étant pas dans les dépôts Ubuntu par défaut, ces commandes ajoutent le dépôt officiel (avec sa clé de signature, garantissant l'authenticité des paquets) avant l'installation via `apt`.

#### `mongosh`
**Description :** shell interactif officiel de MongoDB.
**Syntaxe :** `mongosh`
**Cas d'utilisation :** créer le premier compte administrateur et activer l'authentification.
**Exemple :**
```bash
mongosh
```
```javascript
use admin
db.createUser({ user: "admin", pwd: "mot-de-passe-fort", roles: ["root"] })
exit
```
**Résultat attendu :** confirmation de création de l'utilisateur.
**Explication du résultat :** cet utilisateur `admin` deviendra obligatoire pour toute opération une fois l'authentification activée ci-dessous.
**Erreurs possibles :** oublier cette étape avant d'activer `authorization: enabled` rendrait la base inaccessible, y compris à l'administrateur.
**Vérification :** `mongosh -u admin -p` doit désormais demander le mot de passe.
**Cas pratiques :** première étape de sécurisation, systématique après installation.

```yaml
# /etc/mongod.conf
security:
  authorization: enabled
```
```bash
sudo systemctl restart mongod
```

### 5.11 Docker

#### Script d'installation officiel
**Description :** détecte automatiquement la distribution Linux et installe Docker Engine ainsi que le plugin Docker Compose.
**Syntaxe :**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```
**Cas d'utilisation :** installation initiale de Docker sur un serveur neuf.
**Résultat attendu :** un journal détaillé de l'installation des paquets Docker, se terminant sans erreur.
**Explication du résultat :** Docker Engine et le plugin `docker compose` (sans tiret, intégré depuis les versions récentes) sont tous deux installés en une seule opération.
**Erreurs possibles :** conflit si une ancienne version de Docker (`docker.io`, paquet Ubuntu générique) est déjà installée — la désinstaller au préalable.
**Vérification :** `docker --version` et `docker compose version`.
**Cas pratiques :** base de tout le chapitre 7 (Docker) et 8 (Docker Compose).

**Autoriser l'utilisateur courant à utiliser Docker sans `sudo` :**
```bash
sudo usermod -aG docker $USER
```
> ⚠️ **Attention** — Cette commande nécessite de **se déconnecter et se reconnecter** pour que le nouveau groupe soit pris en compte — un simple redémarrage de terminal ne suffit pas toujours.

**Vérifier :**
```bash
docker run hello-world
```
Cette commande télécharge une petite image de test et l'exécute — un message de bienvenue confirme que Docker fonctionne de bout en bout.

### 5.12 Git

```bash
sudo apt install git -y
git --version
```
> 📌 **À retenir** — L'authentification vers un dépôt privé (Deploy Key) et la configuration de `user.name`/`user.email` ont déjà été couvertes en détail au chapitre 3 — cette section ne concerne que l'installation du paquet lui-même sur le serveur, identique à n'importe quelle autre machine.

### 5.13 Nginx

```bash
sudo apt install nginx -y
sudo systemctl status nginx
```
**Vérifier immédiatement depuis un navigateur :** ouvrir `http://ADRESSE_IP_DU_SERVEUR` — la page d'accueil par défaut "Welcome to nginx!" doit s'afficher, première preuve visuelle que le serveur répond correctement. La configuration complète (reverse proxy, plusieurs sites, HTTPS) fait l'objet du chapitre 9.

### 5.14 Apache

Alternative à nginx, encore dominante dans certains écosystèmes PHP historiques (`.htaccess`, WordPress — chapitre 26).

```bash
sudo apt install apache2 -y
sudo systemctl status apache2
```
> 📌 **À retenir** — Nginx et Apache **ne doivent jamais tourner en même temps sur le même port** (80/443). Nginx est privilégié dans ce manuel pour sa légèreté en reverse proxy ; Apache reste pertinent pour un projet déjà pensé autour de lui.

### 5.15 PM2

```bash
npm install -g pm2
pm2 -v
```
PM2 gère les process Node.js applicatifs en production — déjà présenté en théorie au chapitre 1 (section 1.8) en comparaison avec systemd.

#### `pm2 startup`
**Description :** enregistre PM2 lui-même comme un service systemd démarré automatiquement au boot du serveur.
**Syntaxe :** `pm2 startup`
**Cas d'utilisation :** garantir qu'une application redémarre automatiquement après un redémarrage serveur.
**Exemple :**
```bash
pm2 startup
```
**Résultat attendu :** une ligne de commande générée (contenant un `sudo` avec des chemins spécifiques à la machine), à copier-coller et exécuter.
**Explication du résultat :** cette commande générée, une fois exécutée, crée l'intégration systemd nécessaire — `pm2 startup` seul ne suffit pas, il faut exécuter la ligne qu'il affiche.
**Erreurs possibles :** oublier d'exécuter la ligne générée, laissant croire que `pm2 startup` seul suffit.
**Vérification :** `sudo reboot`, puis reconnexion et `pm2 list` confirmant que les applications précédemment actives ont bien redémarré.
**Cas pratiques :** essentiel pour tout déploiement réel (chapitre 6), sans quoi un simple redémarrage serveur suffirait à mettre l'application hors ligne.

---

## Analogies clés de ce chapitre

| Notion | Analogie |
|---|---|
| nvm | Un porte-clés à plusieurs versions du même outil |
| Environnement virtuel Python | Une boîte à outils dédiée à un seul chantier, jamais mélangée aux autres |
| Deploy Key vs clé personnelle | Un badge d'accès à une seule pièce vs le passe-partout complet |
| `mysql_secure_installation` | Verrouiller toutes les portes restées ouvertes après la construction d'une maison neuve |

---

## Étude de cas

**Contexte.** Un serveur hébergeant plusieurs projets d'un même portefeuille — une pratique fréquente chez un développeur freelance gérant plusieurs clients sur une infrastructure limitée. L'un des projets nécessite Node 18 (contrainte héritée d'une dépendance ancienne), un autre Node 22.

**Sans nvm**, cette cohabitation serait impossible avec le paquet Ubuntu générique, figé sur une seule version système. **Avec nvm**, chaque session shell peut basculer (`nvm use 18` ou `nvm use 22`) selon le projet actif, et chaque application lancée via PM2 conserve la version avec laquelle elle a été démarrée. C'est exactement ce type de scénario — plusieurs projets, plusieurs contraintes de version — qui justifie le choix de nvm plutôt que `apt install nodejs` fait dès la section 5.1.

---

## Bonnes pratiques (récapitulatif du chapitre)

- N'installer que ce dont le projet a réellement besoin, jamais "tout le catalogue par précaution".
- Toujours `mysql_secure_installation` immédiatement après l'installation de MySQL, sans exception.
- Toujours sécuriser Redis et MongoDB (mot de passe, liaison locale) avant toute autre configuration.
- Un utilisateur applicatif dédié par base de données, jamais le compte administrateur dans une chaîne de connexion.
- `pm2 startup` doit être suivi de l'exécution réelle de la commande générée, pas seulement de son affichage.

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Pourquoi elle arrive | Conséquence |
|---|---|---|
| `apt install nodejs` au lieu de nvm | Semble plus simple | Version figée, obsolète, conflits entre projets |
| Sauter `mysql_secure_installation` | Pressé de passer à la suite | Mot de passe root faible ou absent, base de test exposée |
| Redis/MongoDB sans mot de passe | Oublié "pour l'instant" | Faille critique exploitable en quelques minutes sur Internet |
| `pip install` hors environnement virtuel | Réflexe non pris | Conflits avec les paquets Python système |
| `pm2 startup` sans exécuter la commande générée | Étape jugée optionnelle | Application hors ligne après le moindre redémarrage serveur |

---

## Captures d'écran à réaliser

> 📸 **Capture 7**
> **Logiciel :** navigateur web
> **Pourquoi cette capture est utile :** confirmer visuellement, pour un débutant, que nginx répond correctement — la toute première preuve tangible que le serveur fonctionne comme serveur web.
> **Page/écran concerné :** page affichée en visitant `http://ADRESSE_IP_DU_SERVEUR`
> **Niveau de zoom conseillé :** 100 %
> **Montrer :** le message "Welcome to nginx!" complet
> **Entourer :** rien de particulier, la page entière fait foi
> **Flouter/masquer :** l'adresse IP visible dans la barre d'adresse du navigateur

---

## Laboratoire pratique n°1 — Installer une stack Node complète

**Objectifs :** installer et vérifier Node.js, pnpm et PM2 sur le VPS.
**Prérequis :** chapitre 4 complété.
**Matériel nécessaire :** le VPS sécurisé.

**Étapes :**
1. Installe nvm, puis Node LTS (section 5.1).
2. Active pnpm via corepack (section 5.2).
3. Installe PM2 globalement, exécute `pm2 startup` **et** la commande générée.
4. Redémarre le serveur (`sudo reboot`), reconnecte-toi, confirme que `node -v`, `pnpm -v` et `pm2 -v` répondent toujours correctement.

**Résultat attendu :** les trois outils fonctionnels après un redémarrage complet du serveur, pas seulement dans la session d'installation.
**Vérifications :** `pm2 list` après reboot, même vide, confirme que PM2 est bien démarré comme service.
**Erreurs fréquentes :** `node: command not found` après reboot si `nvm alias default` a été oublié.
**Solutions :** relancer `nvm alias default lts/*` puis se reconnecter.

## Laboratoire pratique n°2 — Installer et sécuriser une base de données

**Objectifs :** installer MySQL **ou** PostgreSQL, le sécuriser, créer un utilisateur applicatif, et confirmer la connexion.
**Prérequis :** chapitre 4 complété.
**Matériel nécessaire :** le VPS sécurisé.

**Étapes :**
1. Installe MySQL ou PostgreSQL (sections 5.7 ou 5.8).
2. Complète intégralement `mysql_secure_installation` (si MySQL) — ne saute aucune question.
3. Crée une base `labo` et un utilisateur applicatif dédié `labo_user`.
4. Vérifie la connexion applicative avec ce compte, jamais avec le compte administrateur.
5. Confirme, via `sudo ufw status`, que le port de la base (3306 ou 5432) n'est **pas** dans la liste des ports autorisés.

**Résultat attendu :** connexion réussie avec `labo_user`, port de la base absent de `ufw status`.
**Vérifications :** tenter une connexion depuis une machine externe (si disponible) doit échouer — la base n'est accessible que localement.
**Erreurs fréquentes :** créer l'utilisateur avec `'labo_user'@'%'` (MySQL) au lieu de `'labo_user'@'localhost'`, autorisant par erreur les connexions depuis n'importe quelle origine réseau.
**Solutions :** toujours vérifier l'hôte associé à l'utilisateur créé (`SELECT user, host FROM mysql.user;` en MySQL).

## Laboratoire pratique n°3 — Vérifier l'ensemble des installations avec une checklist croisée

**Objectifs :** consolider l'ensemble du chapitre en une vérification unique et systématique.
**Prérequis :** Laboratoires 1 et 2 complétés, Docker et nginx également installés.
**Matériel nécessaire :** le VPS avec l'ensemble des logiciels installés.

**Étapes :**
1. Établis une liste de toutes les commandes de vérification de ce chapitre (`node -v`, `pnpm -v`, `pm2 -v`, `docker --version`, `docker compose version`, `nginx -v`, connexion base de données, `redis-cli PING` si installé).
2. Exécute-les toutes à la suite, en notant le résultat de chacune.
3. Vérifie `sudo ufw status` une dernière fois : seuls 22/80/443 doivent apparaître, malgré toutes ces installations.

**Résultat attendu :** un tableau personnel de vérifications, toutes positives, pare-feu inchangé.
**Vérifications :** toute commande sans réponse claire doit être réinstallée ou re-diagnostiquée avant de continuer au chapitre 6.
**Erreurs fréquentes :** un logiciel installé mais dont le service n'a jamais été démarré (`systemctl status` affichant "inactive").
**Solutions :** `sudo systemctl enable --now nom-service` pour les services qui devraient tourner en continu.

---

## Exercices

1. Pourquoi installer Node.js via nvm plutôt que via `apt install nodejs`, en particulier sur un serveur destiné à héberger plusieurs projets ?
2. Explique la différence entre JRE et JDK, et donne un exemple de contexte où chacun est le bon choix.
3. Un développeur te dit avoir sauté `mysql_secure_installation` "pour aller plus vite, je le ferai après". Explique-lui le risque concret de cette décision.
4. Pourquoi Redis et MongoDB nécessitent-ils une attention particulière à la sécurité, contrairement à MySQL/PostgreSQL déjà sécurisés par leur script d'installation respectif ?
5. Pourquoi `pm2 startup` affiche-t-il une commande à exécuter séparément, plutôt que de tout faire en une seule étape ?

---

## Quiz

**Question 1.** Pourquoi préférer nvm à `apt install nodejs` ?
a) nvm est plus rapide à installer
b) nvm permet plusieurs versions coexistantes et évite un paquet système obsolète
c) apt ne peut pas installer Node.js du tout
d) Il n'y a aucune différence pratique

**Question 2.** Que fait `mysql_secure_installation` ?
a) Sauvegarde automatiquement la base de données
b) Applique les réglages de sécurité de base indispensables (mot de passe root, suppression des comptes anonymes...)
c) Installe MySQL
d) Crée automatiquement toutes les bases nécessaires à un projet

**Question 3.** Par défaut, Redis et MongoDB fraîchement installés :
a) Exigent un mot de passe fort automatiquement
b) N'ont aucune authentification, à sécuriser manuellement
c) Sont inaccessibles tant qu'on ne les configure pas
d) Chiffrent automatiquement toutes les données

**Question 4.** Un environnement virtuel Python (`venv`) sert à :
a) Accélérer l'exécution du code Python
b) Isoler les dépendances d'un projet du reste du système
c) Remplacer complètement `pip`
d) Compiler du code Python en exécutable natif

**Question 5.** Pourquoi `pm2 startup` seul ne suffit-il pas ?
a) Il faut aussi exécuter la commande générée qu'il affiche
b) PM2 ne fonctionne jamais au démarrage
c) C'est une commande obsolète
d) Il faut redémarrer immédiatement le serveur avant toute chose

> 🔑 **Corrigé** — 1: b · 2: b · 3: b · 4: b · 5: a

---

## 📝 Résumé du chapitre

- Node.js s'installe via `nvm` pour permettre plusieurs versions coexistantes ; pnpm et Bun sont des alternatives plus rapides.
- Python (avec `venv` systématique) et PHP (avec `php-fpm`) s'installent via `apt` ; Java selon le besoin réel (JRE pour exécuter, JDK pour compiler).
- MySQL et PostgreSQL exigent une sécurisation initiale et un utilisateur applicatif dédié, jamais le compte administrateur.
- Redis et MongoDB n'ont **aucune authentification par défaut** — la sécuriser est obligatoire, pas optionnelle.
- Docker s'installe via son script officiel ; Git s'installe simplement, son authentification ayant déjà été couverte au chapitre 3.
- Nginx et Apache ne cohabitent jamais sur les mêmes ports ; PM2 nécessite `pm2 startup` **suivi** de l'exécution de la commande générée.

## ✅ Checklist avant de passer au chapitre 6

- [ ] `node -v`, `pnpm -v` répondent correctement depuis une **nouvelle** session SSH.
- [ ] Une base de données existe, avec un utilisateur applicatif dédié et une connexion testée.
- [ ] Si Redis/MongoDB installés : un mot de passe est exigé, testé avec succès.
- [ ] `docker run hello-world` fonctionne sans `sudo`.
- [ ] La page d'accueil par défaut de nginx s'affiche depuis un navigateur externe.
- [ ] `pm2 startup` a été suivi de l'exécution réelle de la commande générée, vérifiée après un reboot.
- [ ] `sudo ufw status` montre toujours uniquement 22/80/443.

---

## Glossaire du chapitre

**nvm (Node Version Manager)**
Définition simple : un outil permettant d'installer et de basculer entre plusieurs versions de Node.js.
Définition technique : un gestionnaire de versions installé au niveau utilisateur (pas système), modifiant le `PATH` shell pour pointer vers la version active.
Exemple concret : `nvm use 18` puis `nvm use 22` sur le même serveur.
Voir : Chapitre 5, section 5.1.

**Environnement virtuel (Python)**
Définition simple : une boîte à outils Python isolée, propre à un seul projet.
Définition technique : un dossier contenant une copie de l'interpréteur Python et un `site-packages` local, créé par le module `venv`, activé via un script qui modifie temporairement le `PATH`.
Exemple concret : `venv/bin/activate`.
Voir : Chapitre 5, section 5.4.

**php-fpm**
Définition simple : le composant qui permet à nginx d'exécuter du code PHP.
Définition technique : *FastCGI Process Manager*, un gestionnaire de processus PHP communiquant avec nginx via le protocole FastCGI.
Exemple concret : `php8.3-fpm.sock`, utilisé dans la configuration nginx du chapitre 9.
Voir : Chapitre 5, section 5.5.

---

## ❓ FAQ

**Dois-je installer MySQL ET PostgreSQL sur le même serveur ?**
Rarement utile. Choisis celui qu'utilise réellement ton projet — n'installe l'autre que si un second projet distinct sur le même serveur en a spécifiquement besoin.

**Pourquoi ne pas tout mettre dans Docker plutôt que d'installer chaque logiciel individuellement ?**
Approche tout à fait valable, développée aux chapitres 7 et 8 — isolation plus propre, versions figées. Ce manuel présente d'abord l'installation directe, plus simple à comprendre pour un débutant, avant d'ajouter la couche d'abstraction Docker.

**J'ai un message "Permission denied" en essayant `docker run` malgré `usermod -aG docker`, pourquoi ?**
Le nouveau groupe n'est appliqué qu'aux nouvelles sessions. Il faut se déconnecter complètement (`exit`) et se reconnecter, pas seulement ouvrir un nouvel onglet de terminal.

---

## Références officielles

- nvm — [github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)
- MySQL 8.0 Reference Manual — [dev.mysql.com/doc/refman/8.0/en](https://dev.mysql.com/doc/refman/8.0/en/)
- PostgreSQL Documentation — [postgresql.org/docs](https://www.postgresql.org/docs/)
- Redis Documentation — [redis.io/docs](https://redis.io/docs/)
- MongoDB Manual — [mongodb.com/docs/manual](https://www.mongodb.com/docs/manual/)
- Docker Engine Install — [docs.docker.com/engine/install](https://docs.docker.com/engine/install/)
- PM2 Documentation — [pm2.keymetrics.io/docs](https://pm2.keymetrics.io/docs/usage/quick-start/)

---

## Conclusion

Le serveur dispose désormais de tout l'outillage nécessaire — langages, bases de données, serveur web, gestionnaire de processus — chacun installé et sécurisé correctement dès le départ. Le chapitre 6 va enfin y faire tourner une vraie application, du code source jusqu'à une première URL accessible.

---

⬅️ [Chapitre 4 — Préparer un serveur](04-preparer-un-serveur.md) · ➡️ **Suite : [Chapitre 6 — Déployer différents types d'applications](06-deployer-applications.md)**
