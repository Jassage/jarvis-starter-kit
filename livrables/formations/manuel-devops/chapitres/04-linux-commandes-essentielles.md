<div class="chapitre-titre-num">CHAPITRE 4 · 🟢 DÉBUTANT ABSOLU</div>

# Linux pour DevOps : les commandes essentielles

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Maîtriser les 33 commandes Linux qui reviendront, sous une forme ou une autre, dans absolument tous les chapitres suivants de ce manuel : navigation, manipulation de fichiers, lecture et recherche de texte, permissions, gestion de paquets et de services, surveillance de processus et de ressources, réseau, archives. Chaque commande est présentée avec sa syntaxe, un exemple réel exécuté sur ton serveur de laboratoire, le résultat attendu, un cas pratique DevOps et l'erreur la plus fréquente qu'elle provoque chez un débutant.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Toutes les commandes de ce chapitre s'exécutent <strong>sur ton serveur de laboratoire</strong> (chapitre 3), pas sur ta machine locale Windows/macOS. Connecte-toi en SSH (`ssh nom_utilisateur@adresse_ip_du_laboratoire`) avant de commencer, et garde ce terminal ouvert tout au long du chapitre — chaque exemple part du principe que tu peux le reproduire immédiatement, pas seulement le lire.
</div>

## 4.1 Navigation et fichiers

### `pwd` — afficher le répertoire courant
**Syntaxe :** `pwd`
```bash
# Sur le serveur de laboratoire
pwd
```
**Résultat attendu :** `/home/jaslin` (ou l'équivalent selon ton utilisateur).
**Cas pratique DevOps :** vérifier où l'on se trouve avant d'exécuter une commande destructive (`rm`) ou un script de déploiement, pour être certain de ne pas agir dans le mauvais répertoire.
**Erreur fréquente :** confondre le répertoire courant affiché par `pwd` avec celui attendu par un script — toujours vérifier avant un `rm -rf` ou un `docker compose up`.

### `ls` — lister le contenu d'un répertoire
**Syntaxe :** `ls [options] [chemin]`
```bash
ls -lah /var/log
```
**Résultat attendu :** un tableau détaillé (permissions, propriétaire, taille, date) de chaque fichier du dossier `/var/log`.
**Cas pratique DevOps :** `-l` (format long), `-a` (fichiers cachés, ceux commençant par un point), `-h` (tailles lisibles par un humain, "4.2K" plutôt que "4213") — cette combinaison `-lah` est la plus utilisée du manuel pour inspecter rapidement un dossier de configuration ou de logs.
**Erreur fréquente :** oublier `-a` et ne jamais voir les fichiers de configuration cachés (`.env`, `.gitignore`, `.ssh`), pourtant essentiels dans ce manuel.

### `cd` — changer de répertoire
**Syntaxe :** `cd [chemin]`
```bash
cd /etc/nginx
cd ..
cd ~
```
**Résultat attendu :** le prompt du terminal reflète le nouveau répertoire courant.
**Cas pratique DevOps :** `cd ..` remonte d'un niveau, `cd ~` (ou `cd` seul) revient directement au dossier personnel, `cd -` revient au dossier précédent — utile en va-et-vient entre un dossier de projet et un dossier de configuration système.
**Erreur fréquente :** taper `cd nginx` en pensant se déplacer dans `/etc/nginx` alors qu'on ne se trouvait pas déjà dans `/etc` — `cd` sans `/` au début est toujours **relatif** au dossier courant, jamais absolu.

### `mkdir` — créer un répertoire
**Syntaxe :** `mkdir [options] nom_du_dossier`
```bash
mkdir -p projets/api/src
```
**Résultat attendu :** aucune sortie si la commande réussit (silence = succès, un principe Unix qui revient souvent).
**Cas pratique DevOps :** `-p` crée tous les dossiers parents nécessaires en une seule commande (`projets`, puis `api`, puis `src`) plutôt que trois commandes séparées.
**Erreur fréquente :** oublier `-p` et obtenir `mkdir: cannot create directory 'projets/api/src': No such file or directory` parce que `projets/api` n'existait pas encore.

### `touch` — créer un fichier vide (ou mettre à jour sa date)
**Syntaxe :** `touch nom_du_fichier`
```bash
touch .env.example
```
**Résultat attendu :** un fichier vide de 0 octet apparaît (vérifiable avec `ls -lah`).
**Cas pratique DevOps :** créer rapidement un fichier de configuration vide à remplir ensuite, ou déclencher volontairement un rebuild qui dépend de la date de modification d'un fichier.
**Erreur fréquente :** croire que `touch` peut créer un fichier dans un dossier qui n'existe pas — comme `mkdir`, il faut que le dossier parent existe déjà.

### `cp` — copier un fichier ou un dossier
**Syntaxe :** `cp [options] source destination`
```bash
cp .env.example .env
cp -r dossier_source/ dossier_copie/
```
**Résultat attendu :** le fichier ou dossier apparaît à l'emplacement de destination, l'original reste inchangé.
**Cas pratique DevOps :** créer un fichier `.env` réel à partir d'un modèle `.env.example` versionné (pattern utilisé au chapitre 18) ; `-r` (récursif) est obligatoire pour copier un dossier entier, pas seulement un fichier.
**Erreur fréquente :** oublier `-r` sur un dossier → `cp: -r not specified; omitting directory 'dossier_source/'`.

### `mv` — déplacer ou renommer un fichier
**Syntaxe :** `mv source destination`
```bash
mv ancien-nom.txt nouveau-nom.txt
mv fichier.log /var/log/archives/
```
**Résultat attendu :** le fichier disparaît de son emplacement d'origine et apparaît à destination — `mv` sert aussi bien à renommer (même dossier) qu'à déplacer (dossier différent).
**Cas pratique DevOps :** archiver un fichier de log après rotation, ou renommer un fichier de configuration généré automatiquement.
**Erreur fréquente :** écraser silencieusement un fichier existant à destination sans confirmation — `mv -i` (interactif) demande confirmation avant d'écraser, réflexe recommandé sur un serveur de production.

### `rm` — supprimer un fichier ou un dossier
**Syntaxe :** `rm [options] chemin`
```bash
rm fichier-inutile.txt
rm -r dossier-a-supprimer/
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Commande destructive — `rm` ne passe jamais par une corbeille</span>
Contrairement à un système de fichiers graphique, `rm` supprime **immédiatement et définitivement**, sans aucune corbeille de récupération. `rm -rf` (récursif, forcé, sans aucune confirmation) est l'une des commandes les plus redoutées de tout administrateur système — une seule erreur de chemin peut détruire des données irrécupérables. <strong>Toujours</strong> vérifier le chemin exact avec `pwd` et `ls` avant un `rm -rf`, et ne jamais l'exécuter avec un chemin obtenu par copier-coller sans le relire une dernière fois.
</div>

**Résultat attendu :** le fichier ou dossier disparaît sans confirmation ni message de succès.
**Cas pratique DevOps :** nettoyer des fichiers temporaires dans un script d'automatisation (chapitre 10, `cleanup.sh`) — toujours avec un chemin absolu et explicite dans un script, jamais une variable non vérifiée.
**Erreur fréquente :** exécuter `rm -rf $DOSSIER/*` alors que la variable `$DOSSIER` est vide ou mal définie, ce qui revient à exécuter `rm -rf /*` — vérifier systématiquement qu'une variable utilisée avec `rm -rf` dans un script n'est jamais vide.

## 4.2 Lire et rechercher du texte

### `cat` — afficher le contenu complet d'un fichier
**Syntaxe :** `cat chemin_du_fichier`
```bash
cat /etc/os-release
```
**Résultat attendu :** tout le contenu du fichier s'affiche d'un coup dans le terminal.
**Cas pratique DevOps :** inspecter rapidement un petit fichier de configuration (`docker-compose.yml`, `.env`) directement depuis le terminal SSH.
**Erreur fréquente :** utiliser `cat` sur un fichier de plusieurs milliers de lignes (un gros fichier de log) — le terminal se remplit d'un flot illisible ; `less` (ci-dessous) est bien plus adapté.

### `less` — lire un fichier page par page
**Syntaxe :** `less chemin_du_fichier`
```bash
less /var/log/syslog
```
**Résultat attendu :** le fichier s'affiche une page à la fois. Flèches ou `Espace` pour avancer, `b` pour reculer, `/motif` pour chercher, `q` pour quitter.
**Cas pratique DevOps :** parcourir un fichier de log volumineux sans le charger entièrement d'un coup, notamment lors d'un diagnostic (chapitre 46).
**Erreur fréquente :** oublier `q` pour quitter — un débutant reste parfois bloqué dans `less`, pensant le terminal figé.

### `head` — afficher le début d'un fichier
**Syntaxe :** `head [-n nombre] chemin_du_fichier`
```bash
head -n 20 /var/log/nginx/access.log
```
**Résultat attendu :** les 20 premières lignes du fichier.
**Cas pratique DevOps :** vérifier rapidement le format d'un fichier de log ou de données sans l'ouvrir entièrement.
**Erreur fréquente :** confondre `head` (début du fichier) et `tail` (fin du fichier) — dans un fichier de log, les événements les plus récents sont presque toujours à la **fin**, donc `tail`, pas `head`, est la commande la plus utilisée en pratique.

### `tail` — afficher la fin d'un fichier
**Syntaxe :** `tail [-n nombre] [-f] chemin_du_fichier`
```bash
tail -n 50 /var/log/nginx/error.log
tail -f /var/log/nginx/error.log
```
**Résultat attendu :** les 50 dernières lignes ; avec `-f` (*follow*), le terminal reste ouvert et affiche chaque nouvelle ligne ajoutée au fichier en temps réel.
**Cas pratique DevOps :** `tail -f` est la commande de diagnostic la plus utilisée de ce manuel — surveiller en direct les logs d'une application pendant qu'on reproduit un problème.
**Erreur fréquente :** oublier de quitter `tail -f` (`Ctrl+C`) avant de fermer le terminal ou de lancer une autre commande dans la même session.

### `grep` — rechercher du texte dans un fichier
**Syntaxe :** `grep [options] "motif" chemin_du_fichier`
```bash
grep -i "error" /var/log/nginx/error.log
grep -rn "TODO" ./src
```
**Résultat attendu :** chaque ligne contenant le motif recherché s'affiche, avec (`-n`) son numéro de ligne.
**Cas pratique DevOps :** `-i` ignore la casse (majuscules/minuscules), `-r` recherche récursivement dans tout un dossier — combinaison utilisée constamment pour retrouver une erreur précise dans des milliers de lignes de logs.
**Erreur fréquente :** oublier les guillemets autour d'un motif contenant des espaces, ce qui fait interpréter chaque mot comme un argument séparé.

### `find` — rechercher des fichiers selon des critères
**Syntaxe :** `find chemin_de_depart -name "motif" [autres critères]`
```bash
find /var/log -name "*.log" -mtime -1
find . -type f -size +100M
```
**Résultat attendu :** la liste des chemins correspondant aux critères — ici, les fichiers `.log` modifiés dans les dernières 24 heures, puis les fichiers de plus de 100 Mo.
**Cas pratique DevOps :** repérer les gros fichiers qui saturent un disque (chapitre 46, scénario "disque plein"), ou nettoyer automatiquement les fichiers temporaires anciens dans un script.
**Erreur fréquente :** oublier que `find` est **récursif par défaut** dans tout le sous-arbre — lancé par erreur depuis `/`, il peut parcourir tout le système et prendre plusieurs minutes.

### `locate` — rechercher un fichier par son nom, instantanément
**Syntaxe :** `locate motif`
```bash
sudo apt install -y mlocate
sudo updatedb
locate nginx.conf
```
**Résultat attendu :** une liste quasi instantanée de tous les chemins contenant "nginx.conf", provenant d'un index préconstruit.
**Cas pratique DevOps :** retrouver rapidement l'emplacement d'un fichier de configuration dont on ne connaît que le nom, sans attendre un `find` complet.
**Erreur fréquente :** utiliser `locate` juste après avoir créé un fichier et ne rien trouver — l'index (`updatedb`) n'est mis à jour que périodiquement (ou manuellement), contrairement à `find` qui interroge le système de fichiers en temps réel.

## 4.3 Permissions et élévation de privilèges

### `chmod` — modifier les permissions d'un fichier
**Syntaxe :** `chmod [mode] chemin_du_fichier`
```bash
chmod 600 ~/.ssh/id_ed25519
chmod +x deploy.sh
```
**Résultat attendu :** les permissions changent, vérifiables avec `ls -l` (colonne des permissions, par exemple `-rwx------`).
**Cas pratique DevOps :** `chmod 600` (lecture/écriture pour le propriétaire uniquement) est **obligatoire** sur une clé SSH privée (chapitre 6), sous peine de refus de connexion ; `chmod +x` rend un script exécutable (chapitre 10).
**Erreur fréquente :** utiliser `chmod 777` (tous les droits pour tout le monde) pour "faire disparaître" une erreur de permission, sans comprendre la cause réelle — jamais acceptable sur un serveur, même de laboratoire (approfondi au chapitre 35).

### `chown` — changer le propriétaire d'un fichier
**Syntaxe :** `chown [utilisateur]:[groupe] chemin_du_fichier`
```bash
sudo chown -R www-data:www-data /var/www/monsite
```
**Résultat attendu :** le fichier ou dossier (récursivement avec `-R`) appartient désormais à l'utilisateur et au groupe indiqués.
**Cas pratique DevOps :** attribuer au bon utilisateur système (souvent `www-data` pour Nginx) les fichiers qu'un serveur web doit pouvoir lire.
**Erreur fréquente :** confondre `chmod` (quels droits) et `chown` (qui possède le fichier) — deux commandes différentes qui répondent à deux questions différentes.

### `sudo` — exécuter une commande avec les privilèges administrateur
**Syntaxe :** `sudo commande`
```bash
sudo apt update
sudo systemctl restart nginx
```
**Résultat attendu :** la commande s'exécute avec les privilèges root, après confirmation du mot de passe de l'utilisateur courant (pas du mot de passe root).

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — le principe du moindre privilège</span>
N'utilise `sudo` que lorsque c'est réellement nécessaire (installation de paquets, gestion de services système, modification de fichiers appartenant à root) — jamais par réflexe pour "éviter une erreur de permission" sans en comprendre la cause. Une commande qui échoue par manque de droits donne souvent une information utile sur la conception du système ; la masquer avec `sudo` par automatisme peut cacher un vrai problème.
</div>

**Cas pratique DevOps :** quasiment toutes les commandes d'administration système de ce manuel (installation de paquets, gestion de services) nécessitent `sudo`.
**Erreur fréquente :** exécuter en permanence toutes ses commandes avec `sudo`, y compris celles qui n'en ont pas besoin (comme des commandes dans son propre dossier personnel) — un réflexe qui augmente inutilement le risque d'erreur destructive.

## 4.4 Gestion des paquets et des services

### `apt` — installer et gérer des logiciels (Debian/Ubuntu)
**Syntaxe :** `apt [commande] [paquet]`
```bash
sudo apt update
sudo apt install -y curl git
sudo apt remove nginx
```
**Résultat attendu :** `apt update` recharge la liste des paquets disponibles (sans rien installer) ; `apt install` installe réellement un ou plusieurs paquets ; `apt remove` les désinstalle.
**Cas pratique DevOps :** `apt update` est systématiquement exécuté avant tout `apt install` dans ce manuel, pour installer la version la plus récente disponible dans les dépôts configurés.
**Erreur fréquente :** exécuter `apt install` sans avoir fait `apt update` récemment, et installer une version périmée ou introuvable si un dépôt a changé.

### `systemctl` — gérer les services système (systemd)
**Syntaxe :** `systemctl [commande] service`
```bash
sudo systemctl status nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```
**Résultat attendu :** `status` affiche l'état actuel (actif/inactif, PID, dernières lignes de log) ; `start` démarre le service immédiatement ; `enable` le programme pour démarrer automatiquement au prochain redémarrage du serveur — deux actions bien distinctes.
**Cas pratique DevOps :** vérifier qu'un service critique (Nginx, Docker) tourne réellement après une modification de configuration, avant de conclure trop vite à un problème applicatif.
**Erreur fréquente :** confondre `start` (démarrer maintenant) et `enable` (démarrer automatiquement au prochain boot) — un service démarré avec `start` mais jamais `enable` ne survivra pas à un redémarrage du serveur.

### `journalctl` — consulter les journaux système (systemd)
**Syntaxe :** `journalctl [options]`
```bash
journalctl -u nginx -n 50
journalctl -u nginx -f
```
**Résultat attendu :** les 50 dernières lignes de journal du service `nginx` ; avec `-f`, un suivi en temps réel, équivalent de `tail -f` mais pour les journaux systemd.
**Cas pratique DevOps :** diagnostiquer pourquoi un service refuse de démarrer (`systemctl status` indique souvent "voir journalctl pour plus de détails").
**Erreur fréquente :** chercher les logs d'un service dans `/var/log` alors qu'il journalise exclusivement via systemd (`journalctl`) — tous les services ne suivent pas la même convention, il faut vérifier laquelle s'applique.

## 4.5 Processus et ressources système

### `ps` — lister les processus en cours
**Syntaxe :** `ps [options]`
```bash
ps aux | grep node
```
**Résultat attendu :** la liste des processus correspondant, avec leur PID (identifiant), l'utilisateur qui les exécute, leur consommation CPU/RAM.
**Cas pratique DevOps :** retrouver le PID d'un processus qui bloque un port avant de l'arrêter, ou vérifier qu'une application tourne bien après un déploiement.
**Erreur fréquente :** oublier que `ps aux` seul (sans `grep`) affiche potentiellement des centaines de lignes — toujours filtrer avec `grep` sur un nom reconnaissable.

### `top` — surveiller les processus en temps réel
**Syntaxe :** `top`
```bash
top
```
**Résultat attendu :** un tableau qui se rafraîchit automatiquement, trié par défaut par consommation CPU décroissante. `q` pour quitter.
**Cas pratique DevOps :** identifier en direct quel processus sature le CPU ou la RAM lors d'un ralentissement (chapitre 47).
**Erreur fréquente :** lire `top` une seule fois et conclure trop vite — un pic ponctuel n'est pas la même chose qu'une charge soutenue ; observer plusieurs rafraîchissements avant de diagnostiquer.

### `htop` — version améliorée et colorée de `top`
**Syntaxe :** `htop`
```bash
sudo apt install -y htop
htop
```
**Résultat attendu :** une interface similaire à `top` mais plus lisible (couleurs, barres de charge par cœur CPU), navigable à la souris.
**Cas pratique DevOps :** préféré à `top` dès qu'il est disponible, pour un diagnostic de charge plus rapide à interpréter visuellement.
**Erreur fréquente :** `htop` n'est **pas installé par défaut** sur Ubuntu Server, contrairement à `top` — une erreur "command not found" ne signifie pas une panne, juste une installation manquante.

### `df` — afficher l'espace disque disponible
**Syntaxe :** `df [-h] [chemin]`
```bash
df -h
```
**Résultat attendu :** un tableau des systèmes de fichiers montés, avec l'espace total, utilisé, disponible, et le pourcentage d'utilisation — `-h` (*human-readable*) affiche des unités lisibles (Go, Mo) plutôt que des blocs bruts.
**Cas pratique DevOps :** première commande à exécuter face à un scénario "disque plein" (chapitre 46) — identifier quelle partition sature avant de chercher quel dossier en est responsable.
**Erreur fréquente :** confondre `df` (espace disque global par système de fichiers) et `du` (espace utilisé par un dossier précis) — deux commandes complémentaires, pas interchangeables.

### `du` — afficher l'espace utilisé par des fichiers/dossiers
**Syntaxe :** `du [-h] [-s] chemin`
```bash
du -sh /var/log/*
```
**Résultat attendu :** la taille totale de chaque sous-élément de `/var/log`, `-s` résumant chaque dossier en une seule ligne plutôt que de détailler tout son contenu.
**Cas pratique DevOps :** une fois `df` ayant révélé qu'une partition est pleine, `du -sh` permet de descendre dossier par dossier jusqu'à trouver le vrai coupable.
**Erreur fréquente :** oublier `-s` sur un gros dossier et obtenir des milliers de lignes (une par fichier) au lieu d'un résumé exploitable.

### `free` — afficher l'utilisation de la mémoire
**Syntaxe :** `free [-h]`
```bash
free -h
```
**Résultat attendu :** un tableau de la RAM totale, utilisée, libre, et du cache — `-h` en unités lisibles.
**Cas pratique DevOps :** diagnostiquer un scénario "RAM saturée" (chapitre 46), avant de décider s'il faut redémarrer un service, ajouter de la RAM, ou chercher une fuite mémoire applicative.
**Erreur fréquente :** paniquer devant une valeur "libre" très basse — Linux utilise volontairement la RAM disponible comme cache disque ; c'est la colonne "available" (disponible réellement pour de nouveaux programmes), pas "free" au sens strict, qui compte le plus.

## 4.6 Réseau

### `ip` — afficher et configurer les interfaces réseau
**Syntaxe :** `ip [objet] [commande]`
```bash
ip a
ip route
```
**Résultat attendu :** `ip a` liste les interfaces réseau et leurs adresses IP ; `ip route` affiche la table de routage (par où passe le trafic).
**Cas pratique DevOps :** confirmer l'adresse IP réelle d'un serveur de laboratoire (utile avec l'option B du chapitre 3, VM locale), ou diagnostiquer un problème de connectivité réseau.
**Erreur fréquente :** chercher l'ancienne commande `ifconfig`, dépréciée sur les distributions Linux modernes au profit de `ip`.

### `ss` — afficher les connexions réseau et les ports en écoute
**Syntaxe :** `ss [options]`
```bash
sudo ss -tulpn
```
**Résultat attendu :** la liste des ports en écoute (`-l`), TCP (`-t`) et UDP (`-u`), avec le processus associé (`-p`) et les ports en format numérique (`-n`).
**Cas pratique DevOps :** diagnostiquer un scénario "port occupé" (chapitre 46) — identifier quel processus utilise déjà le port 80 ou 443 avant de démarrer Nginx.
**Erreur fréquente :** chercher l'ancienne commande `netstat`, également dépréciée au profit de `ss` sur les systèmes modernes (les deux existent encore, mais `ss` est désormais la référence).

### `curl` — effectuer des requêtes réseau en ligne de commande
**Syntaxe :** `curl [options] url`
```bash
curl -I https://example.com
curl -s http://localhost:3000/api/health
```
**Résultat attendu :** `-I` affiche uniquement les en-têtes HTTP de la réponse (utile pour vérifier un code de statut sans télécharger le contenu) ; sans option, le corps complet de la réponse s'affiche.
**Cas pratique DevOps :** commande de vérification la plus utilisée de tout ce manuel — tester qu'une API répond, qu'un endpoint de santé (`healthcheck`) fonctionne, ou qu'un certificat HTTPS est valide.
**Erreur fréquente :** oublier `-I` ou `-s` et se retrouver avec un flot HTML illisible dans le terminal pour une simple vérification de statut.

### `wget` — télécharger un fichier depuis une URL
**Syntaxe :** `wget url`
```bash
wget https://example.com/fichier.tar.gz
```
**Résultat attendu :** le fichier se télécharge dans le dossier courant, avec une barre de progression.
**Cas pratique DevOps :** télécharger une archive, un script d'installation officiel, ou une image ISO directement sur le serveur de laboratoire, sans passer par une machine locale.
**Erreur fréquente :** confondre `curl` (pensé pour interroger des API, afficher le résultat) et `wget` (pensé pour télécharger et sauvegarder un fichier) — les deux se recoupent partiellement, mais chacun a son usage naturel.

## 4.7 Archives et compression

### `tar` — regrouper (et compresser) des fichiers en une archive
**Syntaxe :** `tar [options] -f archive.tar fichiers`
```bash
tar -czvf sauvegarde.tar.gz /var/www/monsite
tar -xzvf sauvegarde.tar.gz
```
**Résultat attendu :** la première commande crée (`-c`) une archive compressée en gzip (`-z`) et affiche chaque fichier traité (`-v`, verbeux) ; la seconde extrait (`-x`) cette même archive.
**Cas pratique DevOps :** format standard pour les sauvegardes (Partie IX) et pour transférer un lot de fichiers d'un serveur à un autre.
**Erreur fréquente :** oublier `-z` en créant l'archive mais l'utiliser en extrayant (ou l'inverse) — `tar` peut être capricieux si les options de compression ne correspondent pas entre création et extraction ; utiliser systématiquement `-czvf` / `-xzvf` en miroir évite ce piège.

### `zip` — créer une archive au format ZIP
**Syntaxe :** `zip -r archive.zip dossier/`
```bash
zip -r site.zip ./dist
```
**Résultat attendu :** une archive `.zip` contenant tout le contenu du dossier `dist`, `-r` étant nécessaire pour inclure récursivement les sous-dossiers.
**Cas pratique DevOps :** format préféré quand l'archive doit être ouverte facilement sur Windows sans outil supplémentaire (contrairement à `.tar.gz`, natif sur Linux/macOS).
**Erreur fréquente :** oublier `-r` et obtenir une archive contenant uniquement les fichiers de premier niveau, sans les sous-dossiers.

### `unzip` — extraire une archive ZIP
**Syntaxe :** `unzip archive.zip [-d dossier_destination]`
```bash
unzip site.zip -d /var/www/monsite
```
**Résultat attendu :** le contenu de l'archive est extrait dans le dossier de destination indiqué (créé si nécessaire dans certains cas, sinon à créer au préalable avec `mkdir -p`).
**Cas pratique DevOps :** extraire une archive téléchargée avec `wget` ou reçue par un autre moyen, directement sur le serveur.
**Erreur fréquente :** `unzip: command not found` sur une installation Ubuntu Server minimale — `unzip` n'est pas installé par défaut, contrairement à `tar` ; `sudo apt install -y unzip` corrige immédiatement.

## Atelier — Diagnostic express avec les commandes du chapitre

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 4.1 — Radiographie d'un serveur en cinq commandes</span>

**Objectif** : combiner plusieurs commandes de ce chapitre pour dresser un état des lieux rapide de ton serveur de laboratoire — l'équivalent d'un premier réflexe de diagnostic (repris et approfondi au chapitre 46).

**Étapes détaillées**, à exécuter dans l'ordre sur ton serveur de laboratoire :

1. `df -h` — l'espace disque est-il sain (moins de 80 % utilisé) ?
2. `free -h` — combien de RAM est réellement disponible ?
3. `ps aux --sort=-%cpu | head -n 6` — quels sont les cinq processus qui consomment le plus de CPU en ce moment ?
4. `ss -tulpn` — quels ports sont actuellement en écoute sur ce serveur ?
5. `journalctl -p err -n 20` — les 20 dernières erreurs journalisées par le système, tous services confondus (`-p err` filtre par niveau de gravité "erreur").

**Résultat attendu** : une vue d'ensemble en moins de deux minutes, sans interface graphique, de l'état de santé général du serveur — exactement le réflexe qu'un administrateur système ou un ingénieur DevOps applique en premier face à un serveur inconnu ou suspect.

**Dépannage** : si `journalctl -p err` ne renvoie rien, c'est bon signe (aucune erreur récente) — ne pas confondre "aucun résultat" avec "commande cassée".
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Exécuter une commande destructive sans vérifier le chemin</span>
Comme signalé en section 4.1 (`rm`), la cause la plus fréquente de catastrophe chez un débutant Linux est d'exécuter une commande destructive (`rm -rf`, mais aussi parfois `mv` qui écrase silencieusement) sans avoir vérifié, juste avant, le résultat de `pwd` et `ls`.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Confondre des commandes qui se ressemblent</span>
Ce chapitre contient plusieurs paires trompeuses pour un débutant : `head`/`tail`, `df`/`du`, `chmod`/`chown`, `curl`/`wget`. Relis la section correspondante en cas de doute plutôt que de deviner — une commande mal choisie ne provoque pas toujours une erreur visible, parfois juste un résultat silencieusement incorrect.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Ne pas vérifier qu'une commande est bien installée</span>
Ubuntu Server, dans son installation minimale, n'inclut pas tout : `htop`, `unzip`, et d'autres outils de ce chapitre nécessitent un `apt install` explicite. Un message "command not found" n'est presque jamais une panne du système, seulement un outil manquant.
</div>

## En entreprise

**Réalité répandue** : la maîtrise de ces 33 commandes de base est quasiment un prérequis silencieux pour tout poste touchant à l'exploitation d'un serveur Linux — rarement testée formellement en entretien de façon exhaustive, mais immédiatement visible dans la façon dont un candidat diagnostique un problème concret en pratique.

**Bonne pratique répandue** : les administrateurs expérimentés combinent ces commandes avec des pipes (`|`) plutôt que de les exécuter isolément — `ps aux | grep node`, `journalctl -u nginx | grep -i error` — une compétence qui se construit avec la pratique, pas par mémorisation isolée de chaque commande.

**Erreur classique observée** : des scripts d'automatisation (chapitre 10) qui utilisent `rm -rf` sur des chemins construits dynamiquement à partir de variables, sans jamais vérifier que ces variables ne sont pas vides — cause régulière d'incidents graves, y compris dans des entreprises établies.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Comment identifierais-tu quel processus sature le CPU d'un serveur ?"**
Réponse attendue : `top` ou `htop` pour une vue en temps réel triée par consommation, ou `ps aux --sort=-%cpu` pour un instantané en ligne de commande, en observant plusieurs rafraîchissements avant de conclure à un problème soutenu plutôt qu'un pic ponctuel (section 4.5).

**Q2. "Quelle est la différence entre `df` et `du` ?"**
Réponse attendue : `df` montre l'espace disque global par système de fichiers monté ; `du` montre l'espace utilisé par un dossier ou fichier précis. On utilise typiquement `df` pour détecter un problème, puis `du` pour en trouver la cause précise (section 4.5).

**Q3. "Pourquoi `chmod 777` est-il généralement une mauvaise pratique ?"**
Réponse attendue : il donne les droits complets (lecture, écriture, exécution) à tout le monde, y compris des utilisateurs ou processus qui n'en ont aucun besoin — une violation directe du principe du moindre privilège (section 4.3), qui masque souvent la vraie cause d'un problème de permission plutôt que de la corriger.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
`chmod 600` sur toute clé privée ou fichier de secret (section 4.3), et `sudo` utilisé avec discernement plutôt que par réflexe systématique, sont les deux réflexes de sécurité les plus immédiatement applicables de ce chapitre.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Prends l'habitude d'utiliser les options longues et explicites d'une commande (`--all` plutôt que `-a` quand la lisibilité compte) dans un script destiné à être relu par d'autres — un script d'automatisation (chapitre 10) se relit bien plus souvent qu'il ne s'écrit.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
`tail -f` et `journalctl -f` consomment très peu de ressources même laissés ouverts longtemps — n'hésite pas à garder un terminal de suivi de logs ouvert pendant que tu travailles dans un autre, un réflexe qui accélère énormément le diagnostic (approfondi au chapitre 46).
</div>

## Résumé du chapitre

- Sept familles de commandes couvrent l'essentiel de l'usage quotidien Linux en DevOps : navigation/fichiers, lecture/recherche de texte, permissions, paquets/services, processus/ressources, réseau, archives.
- `rm -rf` est la commande la plus dangereuse de ce chapitre : toujours vérifier le chemin avec `pwd`/`ls` avant de l'exécuter, et ne jamais l'utiliser sur une variable non vérifiée dans un script.
- `df` (espace disque global) et `du` (espace utilisé par un dossier précis) sont complémentaires, pas interchangeables — de même pour `chmod`/`chown` et `curl`/`wget`.
- `systemctl start` (maintenant) et `systemctl enable` (au prochain démarrage) sont deux actions distinctes, souvent confondues.
- Ubuntu Server minimal n'inclut pas tout par défaut (`htop`, `unzip`) — un "command not found" n'est presque jamais une panne, juste un `apt install` manquant.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Pour surveiller en temps réel les nouvelles lignes ajoutées à un fichier de log, on utilise :
   - a) `head -f`
   - b) `tail -f`
   - c) `cat -f`
   - d) `less -f`

2. Quelle commande affiche l'espace disque disponible par système de fichiers monté ?
   - a) `du -h`
   - b) `free -h`
   - c) `df -h`
   - d) `ps aux`

3. `systemctl enable nginx` seul (sans `start`) a pour effet de :
   - a) Démarrer Nginx immédiatement
   - b) Programmer le démarrage automatique de Nginx au prochain redémarrage du serveur, sans le démarrer maintenant
   - c) Désinstaller Nginx
   - d) Afficher les logs de Nginx

**Corrigé** : 1-b, 2-c, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. `rm` déplace les fichiers supprimés vers une corbeille récupérable. — **Faux** (suppression immédiate et définitive, section 4.1).
2. `htop` est installé par défaut sur Ubuntu Server. — **Faux** (nécessite `apt install htop`, section 4.5).
3. `curl -I` affiche uniquement les en-têtes HTTP d'une réponse, sans télécharger le corps complet. — **Vrai**.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 4.1</span>

Sur ton serveur de laboratoire, crée un dossier `test-chapitre4/sous-dossier` en une seule commande, crée-y un fichier vide `notes.txt`, écris-y du texte avec `echo "Premier test" > notes.txt`, puis affiche son contenu avec deux commandes différentes de ce chapitre.
</div>

**Corrigé :** `mkdir -p test-chapitre4/sous-dossier` (section 4.1) ; `cd test-chapitre4/sous-dossier && touch notes.txt` ; `echo "Premier test" > notes.txt` (redirige la sortie de `echo` vers le fichier, en l'écrasant) ; puis `cat notes.txt` et `less notes.txt` (section 4.2) affichent toutes deux le contenu, la seconde étant plus adaptée à un fichier volumineux.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais naviguer et manipuler des fichiers/dossiers (pwd, ls, cd, mkdir, touch, cp, mv, rm) sans hésitation.</li>
<li>☐ Je sais lire et rechercher dans des fichiers texte (cat, less, head, tail, grep, find, locate).</li>
<li>☐ Je sais gérer les permissions et élever mes privilèges quand nécessaire (chmod, chown, sudo), en comprenant le principe du moindre privilège.</li>
<li>☐ Je sais installer un paquet et gérer un service (apt, systemctl, journalctl).</li>
<li>☐ Je sais diagnostiquer l'état d'un serveur (ps, top/htop, df, du, free) sans interface graphique.</li>
<li>☐ Je sais inspecter le réseau d'un serveur (ip, ss, curl, wget).</li>
<li>☐ Je sais créer et extraire des archives (tar, zip, unzip).</li>
<li>☐ Je réagis correctement avant toute commande destructive : vérifier `pwd` et `ls` en premier.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il mémoriser toutes les options de chaque commande ?</dt>
<dd>Non. Chaque commande dispose d'une aide intégrée (`man commande` pour le manuel complet, ou `commande --help` pour un résumé rapide) — la compétence recherchée est de savoir *où chercher*, pas de tout mémoriser par cœur.</dd>

<dt>Ces commandes fonctionnent-elles à l'identique sur macOS ?</dt>
<dd>La plupart, oui (`ls`, `cd`, `grep`, `find`...), macOS étant basé sur Unix. Quelques différences existent (`apt` n'existe pas sur macOS, remplacé par `brew` ; certaines options de `find`/`sed` diffèrent légèrement, la variante BSD de macOS n'étant pas strictement identique à la variante GNU de Linux). Ce manuel utilise systématiquement la variante Linux/Ubuntu, celle de ton serveur de laboratoire.</dd>

<dt>Que faire si je tape une commande dangereuse par erreur mais que je ne l'ai pas encore validée ?</dt>
<dd>Tant que tu n'as pas appuyé sur Entrée, `Ctrl+C` annule la ligne en cours sans rien exécuter — un réflexe à avoir si tu remarques une erreur dans une commande destructive avant de valider.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Ubuntu Server — introduction à la ligne de commande : [https://ubuntu.com/tutorials/command-line-for-beginners](https://ubuntu.com/tutorials/command-line-for-beginners)
- `explainshell.com` — colle n'importe quelle commande complexe pour obtenir une explication option par option : [https://explainshell.com](https://explainshell.com)
- `man7.org` — pages de manuel Linux consultables en ligne : [https://man7.org/linux/man-pages/](https://man7.org/linux/man-pages/)

*Chapitre suivant : l'administration d'un serveur Linux — utilisateurs, groupes, permissions avancées, services, firewall, cron et variables d'environnement, qui s'appuient tous sur les commandes de ce chapitre.*
