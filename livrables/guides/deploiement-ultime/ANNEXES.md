# Annexes — Tableaux de référence rapide

> Ces quatorze annexes sont des tableaux de consultation rapide, pensés pour un usage quotidien une fois le manuel maîtrisé — pas pour l'apprentissage initial, déjà couvert chapitre par chapitre. Chaque entrée renvoie, quand pertinent, au chapitre où elle est expliquée en détail.

---

## Annexe A — Permissions Linux

| Notation | Octal | Lecture (r) | Écriture (w) | Exécution (x) |
|---|---|---|---|---|
| `rwx` | 7 | ✓ | ✓ | ✓ |
| `rw-` | 6 | ✓ | ✓ | ✗ |
| `r-x` | 5 | ✓ | ✗ | ✓ |
| `r--` | 4 | ✓ | ✗ | ✗ |
| `-wx` | 3 | ✗ | ✓ | ✓ |
| `-w-` | 2 | ✗ | ✓ | ✗ |
| `--x` | 1 | ✗ | ✗ | ✓ |
| `---` | 0 | ✗ | ✗ | ✗ |

**Cas spéciaux :**

| Bit spécial | Notation | Effet |
|---|---|---|
| SUID | `chmod u+s` (ex. `4755`) | Le fichier s'exécute avec les droits de son propriétaire, pas de l'utilisateur qui le lance |
| SGID | `chmod g+s` (ex. `2755`) | Sur un dossier : les nouveaux fichiers héritent du groupe du dossier |
| Sticky bit | `chmod +t` (ex. `1777`) | Sur un dossier partagé : seul le propriétaire d'un fichier peut le supprimer, même si d'autres y ont accès en écriture |

**Combinaisons courantes du manuel :** `644` (fichier standard), `600` (secret/clé privée), `755` (script exécutable/dossier), `700` (dossier `~/.ssh`). Voir chapitre 2, section 2.6.

---

## Annexe B — Commandes Linux essentielles

| Commande | Rôle | Chapitre |
|---|---|---|
| `pwd` | Afficher le dossier courant | 2 |
| `ls -lah` | Lister avec détails | 2 |
| `cd` | Se déplacer | 2 |
| `mkdir -p` | Créer un dossier (avec parents) | 2 |
| `cp -r` | Copier | 2 |
| `mv` | Déplacer/renommer | 2 |
| `rm -rf` | Supprimer (irréversible) | 2 |
| `cat` | Afficher un fichier entier | 2 |
| `less` | Lire page par page | 2 |
| `tail -f` | Suivre un fichier en direct | 2 |
| `nano` / `vim` | Éditer un fichier | 2 |
| `grep -rn` | Chercher dans du contenu | 2 |
| `find -name` | Chercher des fichiers | 2 |
| `chmod` / `chown` | Permissions / propriétaire | 2 |
| `sudo` | Élévation ponctuelle | 2 |
| `apt update/install` | Gestionnaire de paquets | 2 |
| `ps aux` | Lister les processus | 2 |
| `htop` | Vue temps réel des processus | 2, 14 |
| `ufw` | Pare-feu simplifié | 2, 4 |
| `ssh` / `scp` / `rsync` | Connexion / transfert distant | 2, 4 |
| `curl` / `wget` | Requêtes / téléchargement réseau | 2 |
| `iostat -x` | Activité disque | 14 |
| `vmstat` | Mémoire virtuelle / swap | 14 |
| `ncdu` | Explorer l'espace disque | 14 |
| `ulimit -n` | Limites système (fichiers ouverts) | 18 |

---

## Annexe C — Commandes Git

| Commande | Rôle | Chapitre |
|---|---|---|
| `git init` | Initialiser un dépôt | 3 |
| `git status` | État actuel | 3 |
| `git add` | Mettre en staging | 3 |
| `git commit -m` | Créer un commit | 3 |
| `git log --oneline` | Historique condensé | 3 |
| `git diff` | Différences non commitées | 3 |
| `git clone` | Copie complète initiale | 3 |
| `git fetch` | Télécharger sans fusionner | 3 |
| `git pull` | Télécharger et fusionner | 3 |
| `git push` | Envoyer vers le remote | 3 |
| `git branch` | Lister/créer des branches | 3 |
| `git switch -c` | Créer et basculer sur une branche | 3 |
| `git merge` | Fusionner une branche | 3 |
| `git tag` | Marquer un commit | 3 |
| `git remote add` | Associer un dépôt distant | 3 |

---

## Annexe D — Commandes Docker

| Commande | Rôle | Chapitre |
|---|---|---|
| `docker run -d -p -v` | Lancer un container | 7 |
| `docker ps -a` | Lister les containers | 7 |
| `docker stop` / `start` / `rm` | Cycle de vie d'un container | 7 |
| `docker logs -f` | Logs en direct | 7 |
| `docker exec -it ... sh` | Shell dans un container actif | 7 |
| `docker build -t` | Construire une image | 7 |
| `docker images` / `rmi` | Gérer les images | 7 |
| `docker volume create/ls/rm` | Gérer les volumes | 7 |
| `docker network create` | Créer un réseau | 7 |
| `docker system prune` | Nettoyer | 7 |
| `docker compose up -d --build` | Démarrer une stack | 8 |
| `docker compose down [-v]` | Arrêter une stack | 8 |
| `docker compose exec` | Exécuter dans un service actif | 8 |
| `docker compose logs -f` | Logs d'un service | 8 |

---

## Annexe E — Commandes `systemctl`

| Commande | Rôle |
|---|---|
| `systemctl status nom` | État d'un service |
| `systemctl start/stop/restart nom` | Contrôler un service |
| `systemctl reload nom` | Recharger sans interruption (si supporté) |
| `systemctl enable/disable nom` | Activer/désactiver au démarrage |
| `systemctl enable --now nom` | Activer et démarrer en une commande |
| `systemctl daemon-reload` | Recharger après modification d'un fichier `.service` |
| `systemctl list-timers` | Lister les timers actifs (ex. Certbot) |

Voir chapitres 2, 4, 6.

---

## Annexe F — Commandes `journalctl`

| Commande | Rôle |
|---|---|
| `journalctl -u nom` | Logs d'un service précis |
| `journalctl -u nom -f` | Logs en direct |
| `journalctl -p err` | Filtrer par gravité |
| `journalctl --since today` | Filtrer par période |
| `journalctl --vacuum-time=30d` | Purger au-delà de 30 jours |
| `journalctl --vacuum-size=500M` | Purger au-delà d'une taille |
| `journalctl _COMM=sudo` | Journal des commandes sudo |

Voir chapitres 2, 17.

---

## Annexe G — Nginx : directives essentielles

| Directive | Rôle | Chapitre |
|---|---|---|
| `listen` | Port d'écoute | 9 |
| `server_name` | Domaine(s) associé(s) | 9 |
| `root` / `index` | Racine des fichiers statiques | 9 |
| `location` | Règle par chemin | 9 |
| `try_files` | Repli (essentiel pour les SPA) | 6, 9 |
| `proxy_pass` | Reverse proxy vers un backend | 9 |
| `proxy_set_header` | En-têtes transmis au backend | 9 |
| `return 301` | Redirection permanente | 9 |
| `gzip` / `brotli` | Compression | 9, 14 |
| `expires` / `Cache-Control` | Cache navigateur | 9 |
| `proxy_cache` | Cache serveur | 9 |
| `limit_req_zone` / `limit_req` | Limitation de débit | 9 |
| `add_header ... always` | En-tête HTTP personnalisé | 9 |
| `ssl_certificate` | Certificat HTTPS | 10 |
| `http2 on` | Activer HTTP/2 | 9 |

**Commandes associées :** `nginx -t` (valider), `nginx -T` (config complète), `systemctl reload nginx`.

---

## Annexe H — Commandes PostgreSQL

| Commande | Rôle | Chapitre |
|---|---|---|
| `sudo -u postgres psql` | Connexion administrateur | 5 |
| `CREATE DATABASE` / `CREATE USER` | Provisionnement | 5 |
| `GRANT ... ON DATABASE ... TO` | Droits | 5, 12 |
| `psql -U user -d base -h localhost -W` | Connexion applicative | 5 |
| `pg_dump -F c -f fichier.dump` | Sauvegarde (format custom) | 12 |
| `pg_restore --clean` | Restauration | 12 |
| `pg_dumpall` | Sauvegarde de tout le serveur | 12 |
| `\copy ... TO/FROM ... CSV HEADER` | Export/import CSV | 12 |
| `EXPLAIN ANALYZE` | Plan d'exécution d'une requête | 14 |

---

## Annexe I — Commandes MySQL

| Commande | Rôle | Chapitre |
|---|---|---|
| `mysql_secure_installation` | Sécurisation initiale | 5 |
| `CREATE DATABASE` / `CREATE USER` / `GRANT` | Provisionnement | 5 |
| `mysqldump -u -p --single-transaction` | Sauvegarde cohérente | 12 |
| `mysql -u -p base < fichier.sql` | Restauration | 12 |
| `SHOW ENGINE INNODB STATUS` | Diagnostic de deadlock | 18 |
| `SHOW VARIABLES LIKE 'character_set%'` | Vérifier l'encodage | 18 |
| `EXPLAIN` | Plan d'exécution | 14 |

---

## Annexe J — Ports TCP/UDP courants

| Port | Service | Exposition publique recommandée |
|---|---|---|
| 22 | SSH | Oui (protégé par clé + Fail2ban) |
| 80 | HTTP | Oui (redirige vers 443) |
| 443 | HTTPS | Oui |
| 3306 | MySQL | Jamais |
| 5432 | PostgreSQL | Jamais |
| 6379 | Redis | Jamais |
| 9090 | Prometheus | Jamais (tunnel SSH) |
| 3000 | Grafana / Node par défaut | Jamais directement |
| 19999 | Netdata | Jamais (tunnel SSH) |
| 8069 / 8072 | Odoo (HTTP / longpolling) | Jamais directement (via nginx) |

---

## Annexe K — Codes de statut HTTP les plus rencontrés dans ce manuel

| Code | Signification | Rencontré au |
|---|---|---|
| 200 | Succès | Partout |
| 301 | Redirection permanente | Chapitre 9 |
| 400 | Requête invalide | Chapitre 18 |
| 401 | Non authentifié | — |
| 403 | Interdit | Chapitre 18 |
| 404 | Introuvable | Chapitre 6, 9 |
| 413 | Corps de requête trop volumineux | Chapitre 18 |
| 429 | Trop de requêtes (rate limit) | Chapitre 9 |
| 500 | Erreur serveur générique | — |
| 502 | Bad Gateway (backend injoignable) | Chapitre 18 |
| 503 | Service indisponible | Chapitre 9 |
| 504 | Gateway Timeout | Chapitre 18 |

---

## Annexe L — Certificats SSL : fichiers et formats

| Fichier | Contenu | Sensibilité |
|---|---|---|
| `privkey.pem` | Clé privée | Jamais partagée |
| `cert.pem` | Certificat seul | Public |
| `chain.pem` | Chaîne intermédiaire seule | Public |
| `fullchain.pem` | Certificat + chaîne complète (à utiliser dans nginx) | Public |

Voir chapitre 10, section 10.4.

---

## Annexe M — Référence rapide `chmod`

| Usage | Commande | Résultat |
|---|---|---|
| Fichier standard | `chmod 644 fichier` | rw-r--r-- |
| Script exécutable | `chmod 755 script.sh` | rwxr-xr-x |
| Secret/clé privée | `chmod 600 cle` | rw------- |
| Dossier `~/.ssh` | `chmod 700 ~/.ssh` | rwx------ |
| Rendre exécutable | `chmod +x fichier` | ajoute x pour tous |
| Récursif | `chmod -R 755 dossier/` | applique à tout le contenu |

---

## Annexe N — Services Linux courants du manuel

| Service | Rôle | Chapitre |
|---|---|---|
| `ssh` | Accès administrateur distant | 2, 4 |
| `nginx` | Reverse proxy / serveur web | 9 |
| `mysql` / `postgresql` | Base de données | 5, 12 |
| `redis-server` | Cache / files d'attente | 5 |
| `fail2ban` | Bannissement automatique | 4, 15 |
| `docker` | Moteur de conteneurisation | 7 |
| `crowdsec` | Protection collaborative | 15 |
| `systemd-timesyncd` | Synchronisation NTP | 4 |
| `unattended-upgrades` | Mises à jour de sécurité automatiques | 17 |
| `certbot.timer` | Renouvellement SSL planifié | 10 |

---

⬅️ [Sommaire](README.md)
