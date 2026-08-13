<div class="chapitre-titre-num">CHAPITRE 32</div>

# Ubuntu Server de A à Z

## Objectifs pédagogiques

Installer et configurer entièrement un serveur Ubuntu Server : adresse IP statique, accès SSH durci, gestion des utilisateurs et de sudo, firewall, mises à jour, gestion des services systemd, un site Nginx et un conteneur Docker.

## Prérequis

Chapitre 31.

## Scénario du volume

**SRV-02** (Ubuntu Server 22.04 LTS), adresse statique `10.10.30.11` (VLAN 30, Serveurs), hébergeant l'intranet de l'entreprise (Nginx) et une application conteneurisée (Docker).

## OBJECTIF

Un serveur Linux durci (SSH par clé, firewall actif, mises à jour automatiques), servant un site Nginx et capable d'exécuter des conteneurs Docker, avec une sauvegarde planifiée.

## ÉTAPE 1 — Installation de base

1. Démarrer sur le support d'installation Ubuntu Server 22.04 LTS, choisir la langue et la disposition clavier.
2. Configuration réseau : laisser le DHCP répondre pendant l'installation (une adresse statique définitive sera posée à l'étape 2, après installation).
3. Partitionnement du disque : accepter le partitionnement guidé par défaut (LVM), suffisant pour la majorité des projets de ce manuel.
4. **Cocher explicitement "Install OpenSSH server"** lors de l'étape correspondante de l'installateur — omettre cette case obligerait à un accès physique/console pour installer SSH après coup, une contrainte évitable.
5. Créer l'utilisateur initial (nom, mot de passe fort, chapitre 40) et terminer l'installation.

## ÉTAPE 2 — Adresse IP statique (Netplan)

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux (Ubuntu Server)</div>

```bash
sudo nano /etc/netplan/00-installer-config.yaml
```

Contenu du fichier :

```yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses:
        - 10.10.30.11/27
      routes:
        - to: default
          via: 10.10.30.1
      nameservers:
        addresses: [10.10.30.10, 8.8.8.8]
```

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
sudo netplan apply
```

**Explication** : Ubuntu Server (depuis la version 18.04) configure son réseau via **Netplan**, une couche de configuration au format YAML au-dessus de `systemd-networkd` — `dhcp4: no` désactive l'attribution automatique, remplacée par l'adresse statique déclarée, cohérente avec le plan IP du chapitre 11.2 (VLAN 30, `/27`).

<div class="encadre attention">
<span class="encadre-titre">⚠️ L'indentation YAML est stricte — un mauvais espacement casse silencieusement la configuration</span>
Contrairement à de nombreux formats de configuration, YAML est strictement sensible à l'indentation (espaces uniquement, jamais de tabulation) — une erreur d'indentation dans ce fichier ne produit généralement pas un message d'erreur clair, mais un réseau qui refuse simplement de s'appliquer correctement après `netplan apply`. Toujours vérifier avec `sudo netplan try` (qui revient automatiquement en arrière après 120 secondes si la nouvelle configuration coupe l'accès réseau) avant `apply` sur un serveur accédé à distance.
</div>

## ÉTAPE 3 — Renommer le serveur

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
sudo hostnamectl set-hostname srv-02
```

## ÉTAPE 4 — Durcir l'accès SSH

<div class="ou-executer">À EXÉCUTER SUR WINDOWS — PowerShell (générer une paire de clés côté client, si pas déjà fait)</div>

```powershell
ssh-keygen -t ed25519 -C "admin@entreprise.local"
ssh-copy-id admin@10.10.30.11
```

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
sudo nano /etc/ssh/sshd_config
```

Modifications à apporter :

```
PermitRootLogin no
PasswordAuthentication no
```

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
sudo systemctl restart sshd
```

**Explication** : `PermitRootLogin no` interdit toute connexion SSH directe avec le compte root (un attaquant doit alors deviner à la fois un nom d'utilisateur **et** un mot de passe, plutôt qu'un nom connu à l'avance) ; `PasswordAuthentication no` désactive complètement l'authentification par mot de passe au profit de la clé SSH configurée ci-dessus — une paire de clés étant infiniment plus résistante à une attaque par force brute qu'un mot de passe, aussi robuste soit-il.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Tester la connexion par clé AVANT de fermer la session actuelle</span>
Désactiver `PasswordAuthentication` avant d'avoir confirmé qu'une connexion par clé fonctionne réellement peut verrouiller définitivement l'accès à un serveur distant sans console physique — toujours ouvrir un **second** terminal, confirmer la connexion par clé fonctionnelle, avant de fermer la session utilisée pour faire les modifications.
</div>

## ÉTAPE 5 — Gérer les utilisateurs et sudo

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
sudo adduser mmarcelin
sudo usermod -aG sudo mmarcelin
```

**Explication** : `adduser` crée le compte (avec son répertoire personnel, contrairement à la commande bas niveau `useradd`) ; `usermod -aG sudo` ajoute l'utilisateur au groupe `sudo`, l'autorisant à exécuter des commandes administratives via `sudo` — jamais en travaillant directement connecté en root au quotidien (principe du moindre privilège, chapitre 40).

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux (connecté en tant que mmarcelin)</div>

```bash
sudo whoami
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
`root` — confirme que l'utilisateur peut effectivement élever ses privilèges via sudo après saisie de son propre mot de passe.
</div>

## ÉTAPE 6 — Configurer le firewall (UFW)

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

**Explication** : `default deny incoming` établit le principe de sécurité de base (chapitre 2.5) — tout est refusé sauf ce qui est explicitement autorisé ensuite (SSH, HTTP, HTTPS pour ce serveur précis) ; `default allow outgoing` laisse le serveur lui-même initier librement des connexions sortantes (mises à jour, appels API...).

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
sudo ufw status verbose
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>

```
Status: active
To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```
</div>

## ÉTAPE 7 — Mises à jour

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

**Explication** : `apt update` rafraîchit la liste des paquets disponibles (ne met rien à jour lui-même), `apt upgrade` installe réellement les mises à jour disponibles ; `unattended-upgrades` automatise ensuite l'installation des correctifs de sécurité critiques sans intervention manuelle — un compromis recommandé sur un serveur de production entre sécurité (correctifs appliqués rapidement) et stabilité (les mises à jour non critiques restent, elles, appliquées manuellement et de façon planifiée).

## ÉTAPE 8 — Gérer les services avec systemd

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
sudo systemctl status ssh
sudo systemctl enable ssh
sudo systemctl restart ssh
```

**Explication** : `status` affiche l'état actuel d'un service (actif, en échec, arrêté) ; `enable` programme son démarrage automatique à chaque redémarrage du serveur (indispensable pour tout service de production, jamais laissé en démarrage manuel par oubli) ; `restart` relance le service pour appliquer une configuration modifiée.

## ÉTAPE 9 — Installer et configurer Nginx

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo nano /etc/nginx/sites-available/intranet
```

Contenu du fichier :

```nginx
server {
    listen 80;
    server_name intranet.entreprise.local;
    root /var/www/intranet;
    index index.html;
}
```

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
sudo ln -s /etc/nginx/sites-available/intranet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Interprétation** : `nginx -t` (test) doit **toujours** être exécuté avant `reload` — recharger une configuration syntaxiquement invalide interromprait le service, alors que `nginx -t` détecte l'erreur sans jamais toucher au service actif.
</div>

## ÉTAPE 10 — Installer Docker

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker mmarcelin
```

**Explication** : le script officiel Docker ajoute le dépôt et installe la dernière version stable ; ajouter l'utilisateur au groupe `docker` évite d'avoir à préfixer chaque commande Docker par `sudo` — un confort qui a une implication de sécurité à connaître (l'appartenance au groupe `docker` équivaut de fait à un accès root, Docker manipulant le noyau avec des privilèges élevés).

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
docker run hello-world
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
Un message `Hello from Docker!` confirmant que le moteur Docker télécharge, exécute et rend compte correctement d'un conteneur de test.
</div>

## ÉTAPE 11 — Sauvegarde planifiée (cron)

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
sudo crontab -e
```

Ligne à ajouter :

```cron
0 2 * * * tar -czf /backup/intranet-$(date +\%Y\%m\%d).tar.gz /var/www/intranet
```

Sauvegarde quotidienne à 2h du matin du contenu de l'intranet — méthode complète de politique de sauvegarde (rétention, sauvegarde externe, test de restauration) au chapitre 39.

## DÉPANNAGE

### Si `netplan apply` coupe l'accès SSH au serveur

Utiliser systématiquement `sudo netplan try` plutôt que `apply` en direct sur une session distante (encadré de l'étape 2) — sinon, un accès console physique (ou une console d'hyperviseur si le serveur est virtualisé) reste la seule voie de récupération.

### Si Nginx refuse de démarrer après une modification de configuration

Toujours lancer `sudo nginx -t` avant tout `reload`/`restart` — le message d'erreur affiché indique précisément la ligne et le fichier en cause, bien plus rapide à corriger qu'un service en échec sans indication.

### Si un utilisateur ajouté au groupe `docker` ne peut toujours pas exécuter Docker sans `sudo`

L'appartenance à un groupe Linux n'est prise en compte qu'à la **prochaine connexion** de l'utilisateur — se déconnecter et se reconnecter (ou exécuter `newgrp docker` dans la session en cours) après `usermod -aG docker`.

## SAUVEGARDE

Confirmée à l'étape 11 — méthode complète au chapitre 39.

## CHECKLIST DE FIN

- [ ] OpenSSH installé dès l'installation initiale
- [ ] Adresse IP statique via Netplan, testée avec `netplan try` avant `apply`
- [ ] SSH durci : `PermitRootLogin no`, `PasswordAuthentication no`, connexion par clé testée avant fermeture de la session initiale
- [ ] Utilisateur nommé créé, ajouté au groupe sudo, jamais de travail quotidien en root
- [ ] UFW actif, refus par défaut en entrée, seuls les ports nécessaires ouverts
- [ ] Mises à jour de sécurité automatiques configurées
- [ ] Nginx installé, testé (`nginx -t`) avant chaque rechargement
- [ ] Docker installé et vérifié (`docker run hello-world`)
- [ ] Sauvegarde planifiée configurée

## Laboratoire complet — VirtualBox, Windows Server et Ubuntu Server côte à côte

**Quoi installer** : Oracle VirtualBox + une image ISO Windows Server 2022 (évaluation gratuite 180 jours) + une image ISO Ubuntu Server 22.04 LTS.
**Où télécharger** : `virtualbox.org` ; `microsoft.com/evalcenter` pour l'ISO d'évaluation Windows Server ; `ubuntu.com/download/server` pour Ubuntu Server (gratuit, sans limite de temps).
**Comment installer** : créer deux machines virtuelles distinctes dans VirtualBox, démarrer chacune sur son ISO respectif, suivre les installateurs (méthode chapitre 31 étape 1 pour Windows Server, chapitre 32 étape 1 pour Ubuntu).

| VM | RAM | CPU | Disque |
|---|---|---|---|
| SRV-01 (Windows Server) | 4 Go minimum (8 Go recommandé pour AD DS) | 2 cœurs | 60 Go |
| SRV-02 (Ubuntu Server) | 2 Go | 2 cœurs | 20 Go |

**Interfaces réseau** : configurer les deux VM en mode **"Réseau interne"** VirtualBox (un réseau virtuel isolé, nommé par exemple `LAN-Labo`) plutôt qu'en NAT ou Bridge — les deux VM peuvent alors communiquer entre elles exactement comme sur le VLAN Serveurs réel (chapitre 11.2), sans jamais exposer le laboratoire sur le réseau physique de l'ordinateur hôte.

**Adresses IP** : reprendre le plan du chapitre 11.2 (`10.10.30.10` pour SRV-01, `10.10.30.11` pour SRV-02, masque `/27`).

**Commandes à exécuter** : l'intégralité des chapitres 31 (Windows Server — promotion AD, DNS, DHCP, GPO, partage) et 32 (Ubuntu Server — Netplan, SSH, UFW, Nginx, Docker) s'exécute à l'identique dans ces deux VM.

**Tests à réaliser** :
1. Depuis SRV-02, `ping 10.10.30.10` — confirmer la communication entre les deux VM sur le réseau interne.
2. Depuis SRV-02, `nslookup srv-01.entreprise.local 10.10.30.10` — confirmer que le DNS de SRV-01 (chapitre 31) résout correctement un nom pour un client Linux, pas seulement pour un client Windows.
3. Prendre un **snapshot** VirtualBox de chaque VM une fois la configuration de base terminée (`Machine → Prendre un instantané`) — permet de revenir à un état propre avant de pratiquer un scénario de dépannage du Volume 14 sans devoir tout réinstaller.

## Résumé du chapitre

Un serveur Ubuntu se configure dans un ordre précis : SSH installé dès l'installateur, adresse statique via Netplan (toujours testée avant application définitive sur une session distante), durcissement SSH par clé, gestion des utilisateurs via sudo plutôt qu'un usage quotidien du compte root, firewall UFW en refus par défaut, mises à jour de sécurité automatisées, services gérés via systemd, Nginx (toujours testé avant rechargement) et Docker, puis une sauvegarde planifiée.

*Fin du Volume 11. Chapitre suivant : la vidéosurveillance IP — la procédure complète en 18 étapes, premier chapitre du Volume 12.*
