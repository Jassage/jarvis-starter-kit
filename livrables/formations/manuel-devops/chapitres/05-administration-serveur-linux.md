<div class="chapitre-titre-num">CHAPITRE 5 · 🟡 INTERMÉDIAIRE</div>

# Administration d'un serveur Linux

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Aller au-delà des commandes isolées du chapitre 4 pour administrer un serveur Linux comme un vrai poste de travail partagé : créer et gérer des utilisateurs et des groupes, comprendre et durcir les permissions, gérer des services avec systemd (y compris en créer un), protéger le serveur avec un pare-feu, planifier des tâches automatiques avec cron, et gérer proprement les variables d'environnement. À la fin de ce chapitre, ton serveur de laboratoire aura un utilisateur dédié, un pare-feu actif, et une tâche planifiée fonctionnelle.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Jusqu'ici, tu as travaillé sur ton serveur de laboratoire avec un seul compte, souvent celui créé à l'installation, parfois même `root` directement. C'est exactement ce que ne fait jamais un serveur de production : plusieurs comptes distincts, chacun avec des droits précis, un pare-feu qui n'ouvre que les ports strictement nécessaires, et des tâches automatiques qui tournent sans intervention humaine à 3h du matin. Ce chapitre transforme ton laboratoire de "un simple ordinateur Linux" à "un serveur administré comme en production".
</div>

## 5.1 Utilisateurs et groupes

Un système Linux distingue toujours plusieurs comptes : `root` (l'administrateur absolu, tout-puissant), les comptes utilisateurs "humains", et des comptes **système** créés automatiquement par certains logiciels (comme `www-data` pour Nginx, déjà croisé au chapitre 4).

```bash
# Sur le serveur de laboratoire — créer un nouvel utilisateur
sudo adduser deploiement
```

**Explication de la commande :** `adduser` (plus convivial que la commande bas niveau `useradd`) crée le compte, demande un mot de passe, et pose quelques questions optionnelles (nom complet, etc.) — il crée aussi automatiquement le dossier personnel `/home/deploiement` et un groupe du même nom.

**Résultat attendu** : le compte apparaît dans `/etc/passwd`, vérifiable avec :

```bash
getent passwd deploiement
```

<div class="encadre retenir">
<span class="encadre-titre">📌 Trois fichiers à connaître</span>
<code>/etc/passwd</code> liste tous les comptes (nom, UID, dossier personnel, shell) mais ne contient <strong>jamais</strong> de mot de passe en clair. <code>/etc/shadow</code>, lisible uniquement par root, contient les mots de passe hachés. <code>/etc/group</code> liste les groupes et leurs membres. Ces trois fichiers texte, lisibles avec <code>cat</code> ou <code>less</code> (chapitre 4), suffisent à comprendre l'intégralité du système de comptes Linux — pas de base de données opaque cachée derrière.
</div>

**Ajouter un utilisateur à un groupe** (déjà vu au chapitre 3 avec le groupe `docker`) :

```bash
sudo usermod -aG sudo deploiement
groups deploiement
```

**Explication :** `-a` (append, ajouter) est **essentiel** — sans lui, `-G` remplace tous les groupes existants de l'utilisateur par le seul groupe indiqué, un piège classique. Ajouter au groupe `sudo` donne à cet utilisateur le droit d'utiliser `sudo` (chapitre 4).

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur fréquente : oublier `-a` dans `usermod -G`</span>
<code>usermod -G docker deploiement</code> (sans <code>-a</code>) retire silencieusement cet utilisateur de tous ses autres groupes (y compris <code>sudo</code> s'il y était) pour ne le laisser que dans <code>docker</code>. Toujours <code>-aG</code>, jamais <code>-G</code> seul, sauf intention explicite de tout remplacer.
</div>

## 5.2 Permissions avancées : umask et permissions spéciales

Le chapitre 4 a couvert `chmod`/`chown`. Deux notions supplémentaires complètent la compréhension des permissions sur un serveur partagé.

**`umask`** définit les permissions **par défaut** appliquées à chaque nouveau fichier ou dossier créé :

```bash
umask
# Résultat typique : 0022
```

**Explication du résultat** : un `umask` de `022` signifie que les permissions maximales par défaut (`777` pour un dossier, `666` pour un fichier) sont réduites en retirant les droits d'écriture au groupe et aux autres (`022` retiré de `666` donne `644` pour un fichier, `755` pour un dossier).

**Permissions spéciales** : au-delà de lecture/écriture/exécution classiques, trois bits spéciaux existent :

| Bit spécial | Effet | Exemple d'usage |
|---|---|---|
| **setuid** | Un exécutable s'exécute avec les droits de son propriétaire, pas de celui qui le lance | `passwd` doit pouvoir modifier `/etc/shadow` (root uniquement) même lancé par un utilisateur normal |
| **setgid** | Un fichier créé dans ce dossier hérite du groupe du dossier, pas de l'utilisateur qui le crée | Un dossier partagé par toute une équipe, où chaque nouveau fichier appartient automatiquement au bon groupe |
| **sticky bit** | Dans un dossier, seul le propriétaire d'un fichier peut le supprimer, même si d'autres ont les droits d'écriture sur le dossier | `/tmp`, où tout le monde peut écrire mais personne ne peut supprimer les fichiers des autres |

```bash
chmod g+s /var/www/partage   # setgid sur un dossier
chmod +t /var/www/partage    # sticky bit
```

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — le setuid, à utiliser avec une extrême prudence</span>
Un exécutable avec le bit setuid appartenant à root et présentant une faille de sécurité peut permettre à n'importe quel utilisateur d'obtenir les privilèges root. Ne jamais poser ce bit sur un script personnel ; il reste réservé à un très petit nombre de binaires système historiques (`passwd`, `sudo` lui-même).
</div>

## 5.3 Services avec systemd : au-delà de `systemctl`

Le chapitre 4 a couvert `systemctl status/start/enable`. Il est temps de comprendre **comment un service est défini**, et d'en créer un pour une application maison.

```bash
sudo nano /etc/systemd/system/monapp.service
```

```ini
[Unit]
Description=Mon application de démonstration
After=network.target

[Service]
Type=simple
User=deploiement
WorkingDirectory=/home/deploiement/monapp
ExecStart=/usr/bin/node index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**Explication ligne par ligne :** `[Unit]` décrit le service (description lisible, `After=network.target` garantit qu'il démarre seulement une fois le réseau disponible) ; `[Service]` définit son comportement réel — `Type=simple` (le processus principal reste au premier plan), `User=` (jamais root sans raison, principe du moindre privilège du chapitre 4), `WorkingDirectory=` et `ExecStart=` (la commande exacte à lancer), `Restart=on-failure` (redémarrage automatique en cas de plantage, un réflexe de fiabilité central en DevOps) ; `[Install]` indique quand ce service doit démarrer automatiquement (`multi-user.target`, le mode de fonctionnement normal du serveur).

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now monapp
sudo systemctl status monapp
```

**Explication :** `daemon-reload` indique à systemd de relire la définition des services (nécessaire après toute modification d'un fichier `.service`) ; `enable --now` combine `enable` (démarrage automatique au boot) et `start` (démarrage immédiat) en une seule commande.

**Test de vérification** : `systemctl status monapp` doit afficher `active (running)` en vert. Si le service échoue, `journalctl -u monapp -n 50` (chapitre 4) affiche la cause exacte.

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — `Restart=on-failure`, un réflexe systématique</span>
Sans cette ligne, un service qui plante reste arrêté jusqu'à intervention manuelle. Avec elle, systemd le relance automatiquement — une forme basique mais réelle de résilience (approfondie à la Partie XIV), qui évite qu'un plantage isolé se transforme en interruption de service prolongée pendant la nuit.
</div>

## 5.4 Pare-feu avec UFW

UFW (*Uncomplicated Firewall*) est une interface simplifiée au-dessus du pare-feu natif de Linux (`iptables`/`nftables`), largement utilisée sur Ubuntu pour sa simplicité.

```bash
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur potentiellement bloquante : activer UFW sans autoriser SSH d'abord</span>
Si tu exécutes <code>ufw enable</code> <strong>avant</strong> <code>ufw allow OpenSSH</code>, ta connexion SSH en cours sera coupée par le pare-feu que tu viens d'activer — et tu perdras l'accès au serveur (sur un VPS distant, cela peut nécessiter une console de secours fournie par l'hébergeur pour t'en sortir). Toujours autoriser SSH (ou le port SSH exact utilisé) <strong>avant</strong> d'activer UFW, sans exception.
</div>

**Explication des commandes :** `allow OpenSSH` autorise le port 22 (défini automatiquement par le profil d'application `OpenSSH`, installé avec le serveur SSH) ; `allow 80/tcp` et `443/tcp` ouvrent respectivement HTTP et HTTPS, nécessaires dès la Partie VI ; `enable` active le pare-feu (avec confirmation) ; `status verbose` affiche l'état détaillé, règle par règle.

**Résultat attendu** :

```text
Status: active
To                         Action      From
--                         ------      ----
22/tcp (OpenSSH)           ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
```

<div class="encadre retenir">
<span class="encadre-titre">📌 Principe par défaut d'UFW</span>
Par défaut, UFW <strong>refuse tout le trafic entrant</strong> et <strong>autorise tout le trafic sortant</strong>, sauf règle explicite d'autorisation (`allow`). C'est le principe du moindre privilège appliqué au réseau : rien n'est ouvert sauf ce qui est explicitement nécessaire.
</div>

## 5.5 Cron : planifier des tâches automatiques

`cron` exécute des commandes automatiquement, à intervalles réguliers, sans intervention humaine — le socle de nombreux scripts d'automatisation du chapitre 10 (sauvegardes, nettoyages, vérifications périodiques).

```bash
crontab -e
```

Cette commande ouvre l'éditeur de tâches planifiées de l'utilisateur courant. Une ligne de cron suit une syntaxe à cinq champs :

```text
┌───────────── minute (0-59)
│ ┌───────────── heure (0-23)
│ │ ┌───────────── jour du mois (1-31)
│ │ │ ┌───────────── mois (1-12)
│ │ │ │ ┌───────────── jour de la semaine (0-6, 0=dimanche)
│ │ │ │ │
* * * * * commande_a_executer
```

**Exemples concrets :**

```bash
# Tous les jours à 2h du matin, exécuter le script de sauvegarde
0 2 * * * /home/deploiement/scripts/backup.sh >> /var/log/backup.log 2>&1

# Toutes les 15 minutes, vérifier que l'application répond
*/15 * * * * curl -sf http://localhost:3000/health || echo "App down" >> /var/log/healthcheck.log
```

**Explication de la première ligne :** `0 2 * * *` signifie "minute 0, heure 2, tous les jours du mois, tous les mois, tous les jours de la semaine" — donc chaque jour à 2h00 précises. `>> /var/log/backup.log 2>&1` redirige à la fois la sortie normale et les erreurs (`2>&1`) vers un fichier de log, en les ajoutant (`>>`) plutôt qu'en écrasant le fichier à chaque exécution.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur fréquente : oublier de rediriger la sortie</span>
Une tâche cron sans redirection explicite envoie sa sortie par email local (souvent jamais consulté) plutôt que nulle part de visible. Sans le `>> fichier.log 2>&1` de l'exemple ci-dessus, une tâche qui échoue silencieusement peut passer inaperçue pendant des semaines — un piège classique découvert uniquement le jour où l'absence de sauvegarde devient critique (Partie IX).
</div>

**Test de vérification** :

```bash
crontab -l
```

**Résultat attendu** : la liste des tâches planifiées de l'utilisateur courant s'affiche, telle qu'enregistrée.

## 5.6 Variables d'environnement

Une variable d'environnement est une valeur accessible par tous les programmes d'une session, utilisée pour la configuration sans modifier le code (principe repris en profondeur au chapitre 18).

```bash
# Définir une variable pour la session courante uniquement
export API_KEY="valeur-temporaire"
echo $API_KEY
```

**Résultat attendu** : `valeur-temporaire` s'affiche. Mais cette variable **disparaît** à la fermeture du terminal — elle n'était que temporaire, propre à cette session.

**Rendre une variable permanente pour un utilisateur** : ajouter une ligne à la fin de `~/.bashrc` (rechargé à chaque nouvelle session de ce compte) :

```bash
echo 'export EDITOR=nano' >> ~/.bashrc
source ~/.bashrc
```

**Explication :** `>> ~/.bashrc` ajoute la ligne à la fin du fichier de configuration du shell (sans écraser le reste) ; `source ~/.bashrc` recharge immédiatement ce fichier dans la session courante, sans attendre une nouvelle connexion.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais mettre un secret réel dans `.bashrc` ou l'historique de commandes</span>
Une variable comme <code>API_KEY</code> définie directement dans <code>~/.bashrc</code> ou tapée en clair dans un terminal (donc conservée dans l'historique <code>~/.bash_history</code>) n'est pas une gestion sûre des secrets. Ce chapitre montre le <strong>mécanisme</strong> des variables d'environnement ; la bonne pratique complète de gestion des secrets est traitée en profondeur au chapitre 25.
</div>

## 5.7 Où s'arrête ce chapitre

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Renvoi vers Manuel Administration Système</span>
Ce chapitre couvre ce qui est <strong>suffisant pour être opérationnel</strong> en DevOps au quotidien. L'administration Linux avancée — gestion de volumes logiques (LVM), sécurité renforcée du noyau (SELinux/AppArmor), tuning fin du noyau et des performances — dépasse le périmètre de ce manuel et est traitée en profondeur dans <em>Manuel Administration Système</em>, chapitres 14 à 21, si tu as besoin d'aller plus loin sur l'administration Linux pure, indépendamment du DevOps.
</div>

## Atelier — Un mini-serveur administré de bout en bout

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 5.1 — Créer un environnement d'exploitation complet</span>

**Objectif** : combiner les six sections de ce chapitre en une seule séquence réaliste.

**Étapes détaillées** :

1. Crée un utilisateur `deploiement` (section 5.1) et ajoute-le au groupe `sudo`.
2. Reconnecte-toi avec ce nouvel utilisateur (`ssh deploiement@adresse_ip`).
3. Configure UFW pour autoriser SSH, HTTP et HTTPS, puis active-le (section 5.4).
4. Crée un fichier `/home/deploiement/scripts/verification.sh` contenant `echo "Vérification à $(date)" >> /home/deploiement/verification.log`, rends-le exécutable (`chmod +x`, chapitre 4).
5. Planifie ce script pour s'exécuter toutes les 5 minutes via `crontab -e` (section 5.5).
6. Attends 5 à 10 minutes, puis vérifie avec `cat /home/deploiement/verification.log` que plusieurs lignes horodatées sont apparues automatiquement, sans aucune intervention manuelle de ta part.

**Résultat attendu** : la preuve concrète qu'une tâche peut s'exécuter de façon autonome sur un serveur correctement configuré — le principe même de l'automatisation qui structure tout le reste de ce manuel.

**Dépannage** : si le fichier de log reste vide après 10 minutes, vérifie que le script est bien exécutable (`ls -l`) et que le chemin dans `crontab -e` est bien **absolu** (`/home/deploiement/scripts/verification.sh`, jamais un chemin relatif — cron n'a pas de notion de "dossier courant").
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Travailler en permanence en tant que root</span>
Se connecter et tout exécuter en tant que `root` par simplicité supprime toute barrière de sécurité : une seule commande mal tapée peut avoir des conséquences maximales. Un compte dédié avec accès `sudo` (section 5.1) offre le même pouvoir final, avec une friction volontaire (retaper son mot de passe) qui réduit les erreurs d'inattention.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Se couper l'accès SSH en activant UFW dans le mauvais ordre</span>
Déjà signalé en section 5.4, mais suffisamment fréquent et coûteux pour être répété : toujours `ufw allow OpenSSH` avant `ufw enable`.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Cron silencieux</span>
Une tâche cron sans redirection de sortie (section 5.5) qui échoue ne le signale nulle part de visible. Systématiser `>> fichier.log 2>&1` sur chaque tâche cron évite ce piège.
</div>

## En entreprise

**Réalité répandue** : la quasi-totalité des entreprises interdisent l'usage direct du compte `root` en production, imposant des comptes nominatifs avec `sudo` — cela permet aussi de savoir précisément **qui** a exécuté quelle commande, via les journaux d'audit (`sudo` journalise chaque commande exécutée).

**Bonne pratique répandue** : les définitions de services systemd et les règles de pare-feu sont de plus en plus gérées par de l'Infrastructure as Code (Partie XII) plutôt qu'éditées manuellement fichier par fichier — ce chapitre enseigne le mécanisme sous-jacent, que ces outils automatisent ensuite.

**Erreur classique observée** : des tâches cron créées à la hâte, jamais documentées, dont plus personne ne sait pourquoi elles existent des années plus tard — un exemple concret du "bus factor" évoqué dans d'autres manuels du portefeuille. Documenter chaque tâche cron (à quoi elle sert, qui l'a créée, pourquoi) dans un commentaire juste au-dessus de la ligne évite ce piège.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Comment créerais-tu un service qui redémarre automatiquement en cas de plantage ?"**
Réponse attendue : un fichier unit systemd avec `Restart=on-failure` dans la section `[Service]` (section 5.3), après `daemon-reload` et `enable --now`.

**Q2. "Quelle est la première règle à poser avant d'activer un pare-feu sur un serveur distant ?"**
Réponse attendue : autoriser explicitement le port SSH (ou son équivalent) avant d'activer le pare-feu, sous peine de perdre l'accès à distance au serveur (section 5.4).

**Q3. "Comment déboguerais-tu une tâche cron qui ne semble jamais s'exécuter ?"**
Réponse attendue : vérifier que le chemin de la commande est absolu (cron n'a pas de dossier courant), vérifier la syntaxe des cinq champs, et surtout vérifier que la sortie est redirigée vers un fichier de log consultable plutôt que perdue (section 5.5).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Le trio compte dédié + `sudo` (jamais root direct) + pare-feu actif avec liste blanche minimale constitue le socle de sécurité de base de tout serveur, avant même d'aborder la sécurité avancée de la Partie XI.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Versionne tes fichiers de service systemd et tes scripts appelés par cron dans un dépôt Git (Partie III), même s'ils ne semblent concerner "que" le serveur — un fichier de configuration modifié à la main, sans trace, est aussi difficile à retracer qu'une modification de code non commitée.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Des tâches cron trop fréquentes (toutes les minutes) pour des vérifications qui n'ont pas besoin de cette fréquence consomment des ressources inutilement. Adapte la fréquence à la réalité du besoin — un healthcheck applicatif toutes les 5 minutes est largement suffisant dans la plupart des cas, sauf exigence de disponibilité particulièrement stricte.
</div>

## Résumé du chapitre

- Un serveur bien administré distingue toujours plusieurs comptes, jamais un usage permanent de `root`.
- `umask` fixe les permissions par défaut ; setuid/setgid/sticky bit couvrent des cas particuliers avancés, à manier avec prudence.
- Un service systemd se définit dans un fichier `.service` (`[Unit]`, `[Service]`, `[Install]`) ; `Restart=on-failure` est un réflexe de fiabilité de base.
- UFW protège le serveur avec une liste blanche de ports — toujours autoriser SSH avant d'activer le pare-feu.
- Cron planifie des tâches automatiques via une syntaxe à cinq champs ; toujours rediriger la sortie vers un fichier de log.
- Les variables d'environnement se définissent temporairement (`export`) ou durablement (`~/.bashrc`) — jamais de secret réel dedans (approfondi au chapitre 25).
- L'administration Linux avancée (LVM, SELinux/AppArmor, tuning noyau) dépasse ce manuel : voir Manuel Administration Système, chapitres 14-21.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. `usermod -G docker deploiement` (sans `-a`) a pour effet de :
   - a) Ajouter l'utilisateur au groupe docker en conservant ses autres groupes
   - b) Remplacer tous les groupes existants de l'utilisateur par le seul groupe docker
   - c) Supprimer l'utilisateur
   - d) N'avoir aucun effet

2. Avant d'activer UFW sur un serveur distant, il faut impérativement :
   - a) Redémarrer le serveur
   - b) Autoriser explicitement le port SSH
   - c) Désinstaller Docker
   - d) Créer une tâche cron

3. Dans une ligne cron `0 2 * * *`, cela signifie :
   - a) Toutes les 2 minutes
   - b) Chaque jour à 2h00
   - c) Le 2 de chaque mois
   - d) Toutes les 2 heures

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. `/etc/passwd` contient les mots de passe en clair de tous les utilisateurs. — **Faux** (les mots de passe hachés sont dans `/etc/shadow`, section 5.1).
2. `Restart=on-failure` dans un fichier systemd relance automatiquement un service qui plante. — **Vrai**.
3. Une variable définie avec `export` dans un terminal reste disponible après avoir fermé ce terminal. — **Faux** (elle est temporaire à la session, section 5.6).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 5.1</span>

Écris la ligne cron qui exécute `/home/deploiement/scripts/nettoyage.sh` tous les dimanches à 3h30 du matin, en redirigeant sortie et erreurs vers `/var/log/nettoyage.log`.
</div>

**Corrigé :** `30 3 * * 0 /home/deploiement/scripts/nettoyage.sh >> /var/log/nettoyage.log 2>&1` — minute 30, heure 3, tous les jours du mois, tous les mois, jour de la semaine 0 (dimanche).

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais créer un utilisateur, l'ajouter à un groupe (avec `-a`), et comprendre `/etc/passwd`/`/etc/shadow`/`/etc/group`.</li>
<li>☐ Je comprends `umask` et les permissions spéciales (setuid, setgid, sticky bit).</li>
<li>☐ Je sais écrire et activer un fichier de service systemd, avec `Restart=on-failure`.</li>
<li>☐ Je sais configurer UFW en autorisant SSH avant de l'activer.</li>
<li>☐ Je sais écrire une ligne cron à cinq champs et rediriger sa sortie vers un log.</li>
<li>☐ Je sais différencier une variable d'environnement temporaire (`export`) et permanente (`~/.bashrc`).</li>
<li>☐ Je sais qu'aucun secret réel ne doit se trouver dans un fichier de configuration shell ou l'historique de commandes.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Dois-je créer un nouvel utilisateur pour chaque application déployée sur le serveur ?</dt>
<dd>C'est une bonne pratique courante pour isoler les applications entre elles (si l'une est compromise, l'attaquant n'a pas automatiquement accès aux autres), particulièrement pertinente à mesure que le nombre d'applications sur un même serveur augmente. Ce manuel y reviendra concrètement avec Docker (Partie V), qui apporte une isolation encore plus forte.</dd>

<dt>UFW et les règles de pare-feu de mon fournisseur cloud (security groups) font-ils doublon ?</dt>
<dd>Non, ils se complètent. Un "security group" cloud (chapitre 40) filtre le trafic avant même qu'il n'atteigne le serveur ; UFW filtre localement, sur le serveur lui-même. Avoir les deux actifs est une bonne pratique de défense en profondeur, pas une redondance inutile.</dd>

<dt>Cron est-il toujours utilisé en 2026, avec tous les outils d'automatisation modernes ?</dt>
<dd>Oui, massivement, en particulier pour des tâches simples et locales à un serveur (rotation de logs, petites vérifications). Pour des automatisations plus complexes ou distribuées, les chapitres suivants introduiront des alternatives (pipelines CI/CD, tâches planifiées Kubernetes) — mais cron reste un outil fondamental à connaître.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle systemd — fichiers unit : [https://www.freedesktop.org/software/systemd/man/systemd.service.html](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- Documentation officielle Ubuntu — UFW : [https://ubuntu.com/server/docs/security-firewall](https://ubuntu.com/server/docs/security-firewall)
- `crontab.guru` — générateur et explicateur interactif de syntaxe cron : [https://crontab.guru](https://crontab.guru)
- Manuel Administration Système, chapitres 14-21 — administration Linux avancée (LVM, SELinux/AppArmor, tuning noyau).

*Chapitre suivant : SSH en profondeur — génération de clés, connexion sans mot de passe, et durcissement complet de l'accès à ton serveur de laboratoire.*
