# Le Guide Ultime du Déploiement d'Applications sur Linux
## Plan éditorial complet

> ✅ **Statut : manuel achevé.** Les 28 chapitres, les Annexes, le Glossaire et l'Index sont rédigés (~120 600 mots, 35 fichiers). Ce document reste la référence de structure — voir [README.md](README.md) pour le sommaire à jour et l'état réel de chaque chapitre.

> Ce document est le plan directeur de l'ouvrage : parties, chapitres, sous-chapitres, laboratoires, études de cas, annexes, glossaire et index. Aucun chapitre ne sera rédigé au nouveau format tant que ce plan n'est pas validé. Une fois validé, il devient la référence contre laquelle chaque chapitre est écrit — et sera mis à jour si un ajustement s'avère nécessaire en cours de route.

**Format de chapitre retenu** (rappel, s'applique à tous les chapitres 1 à 28) :
Introduction → Objectifs pédagogiques → Prérequis → Pourquoi ce chapitre est important → Concepts fondamentaux → Explications détaillées → Schémas/Diagrammes (Mermaid) → Analogies → Étude de cas courte → Bonnes pratiques → Erreurs fréquentes → Captures d'écran à réaliser → Laboratoire pratique n°1 → Laboratoire pratique n°2 (+ n°3 si le chapitre le justifie) → Exercices → Quiz corrigé → Résumé → Checklist → Glossaire du chapitre → FAQ → Références officielles → Conclusion.

**Diagrammes** : rendus en Mermaid (```mermaid), pré-rendus en SVG avant export — même pipeline que le manuel Node.js (`render-mermaid.js`), adapté à ce dossier au moment de la génération des exports.

---

## Vue d'ensemble des parties

| Partie | Titre | Chapitres | Niveau global |
|---|---|---|---|
| I | Fondations | 1 – 3 | Débutant |
| II | Le serveur | 4 – 5 | Débutant → Intermédiaire |
| III | Déploiement d'applications | 6 – 8 | Intermédiaire |
| IV | Exposition réseau et chiffrement | 9 – 10 | Intermédiaire |
| V | Automatisation | 11 | Intermédiaire → Avancé |
| VI | Données | 12 | Intermédiaire |
| VII | Observabilité et performance | 13 – 14 | Avancé |
| VIII | Sécurité et résilience | 15 – 16 | Avancé |
| IX | Exploitation au quotidien | 17 – 18 | Intermédiaire → Avancé |
| X | Études de cas professionnelles | 19 – 28 | Intermédiaire → Avancé |
| — | Annexes, Glossaire, Index | — | Référence |

**28 chapitres au total**, plus l'avant-propos (chapitre 0) déjà existant.

---

## PARTIE I — FONDATIONS

### Chapitre 1 — Comprendre un serveur
**Niveau :** Débutant · **Prérequis :** aucun · **Statut :** ✅ déjà rédigé au nouveau format (à revoir légèrement pour ajouter Mermaid et compléter le gabarit : Introduction dédiée, Étude de cas courte, Glossaire du chapitre, Références officielles, Conclusion)
**Compétences acquises :** vocabulaire fondamental (serveur, VPS, réseau, processus, permissions) permettant de comprendre tout le reste du manuel.
Sous-chapitres : Qu'est-ce qu'un serveur · PC vs serveur · Familles d'hébergement · CPU/RAM/disque · Réseau (IP, ports, DNS) · Modèle client-serveur et reverse proxy · Sécurité réseau de base · Processus/services/daemons · Logs · Variables d'environnement · Permissions Linux.
Laboratoires : (1) Observer le DNS en action · (2) Observer un échange client-serveur réel · (3) Cartographier une application connue.

### Chapitre 2 — Les bases de Linux
**Niveau :** Débutant · **Prérequis :** Chapitre 1
**Compétences acquises :** autonomie complète en terminal Linux (navigation, fichiers, permissions, processus, services, réseau de base).
Sous-chapitres : Le terminal et le shell · Anatomie d'une commande · Arborescence Linux · Navigation et gestion de fichiers · Lecture et édition de fichiers · Permissions (`chmod`, `chown`, `sudo`) · Installer des logiciels (`apt`) · Processus (`ps`, `top`, `htop`) · Services et logs (`systemctl`, `journalctl`) · Réseau et sécurité (`ufw`, `ssh`, `scp`, `rsync`, `curl`, `wget`).
Laboratoires : (1) Manipulation de fichiers et permissions · (2) Observation de processus et services · (3) Transfert de fichiers entre deux machines.

### Chapitre 3 — Git et le contrôle de version *(nouveau)*
**Niveau :** Débutant · **Prérequis :** Chapitre 2 (terminal)
**Compétences acquises :** utiliser Git en autonomie pour versionner un projet et le déployer depuis un dépôt distant privé, sans jamais exposer de secret.
Sous-chapitres : Pourquoi le contrôle de version · Git en local (init, add, commit, log, diff) · Dépôts distants (GitHub, GitLab) · Authentification SSH vers GitHub/GitLab · Dépôt privé et Deploy Keys · Cloner, pull, fetch (différence essentielle) · Branches et stratégie de branches · Merge et résolution de conflits · Tags et Releases · `.gitignore` et secrets jamais versionnés.
Laboratoires : (1) Créer un dépôt local et le pousser sur GitHub · (2) Configurer une Deploy Key et cloner un dépôt privé sur un serveur · (3) Simuler et résoudre un conflit de merge.

---

## PARTIE II — LE SERVEUR

### Chapitre 4 — Préparer un serveur
**Niveau :** Débutant → Intermédiaire · **Prérequis :** Chapitres 1-3
**Compétences acquises :** obtenir un VPS chez un hébergeur réel, le sécuriser entièrement (SSH, pare-feu, Fail2ban) avant d'y déployer quoi que ce soit.
Sous-chapitres : Choisir un hébergeur (tableau comparatif Contabo/OVH/Hetzner/DigitalOcean/Vultr/AWS/Azure/GCP) · Créer un VPS Ubuntu LTS · Première connexion SSH · Mise à jour système · Utilisateur non-root et sudo · Clés SSH · Durcissement SSH · Pare-feu (`ufw`) · Fail2ban · Fuseau horaire, locale, swap, NTP.
Laboratoires : (1) Louer un VPS et s'y connecter la première fois · (2) Créer un utilisateur sécurisé avec clé SSH · (3) Configurer le pare-feu et Fail2ban.
Captures d'écran prévues : panel hébergeur (création VPS), écran des identifiants générés (IP/mot de passe, à flouter).

### Chapitre 5 — Installation des logiciels
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 4
**Compétences acquises :** installer et vérifier tout runtime/base de données/outil nécessaire à un projet réel, en comprenant ce que chaque installation modifie sur le système.
Sous-chapitres : Node.js via nvm, pnpm, Bun · Python et environnements virtuels · PHP et php-fpm · Java (JRE vs JDK) · MySQL · PostgreSQL · Redis · MongoDB · Docker (installation) · Git · Nginx · Apache · PM2.
Laboratoires : (1) Installer une stack Node complète · (2) Installer et sécuriser une base de données · (3) Vérifier l'ensemble des installations avec une checklist croisée.

---

## PARTIE III — DÉPLOIEMENT D'APPLICATIONS

### Chapitre 6 — Déployer différents types d'applications
**Niveau :** Intermédiaire · **Prérequis :** Chapitres 4-5
**Compétences acquises :** déployer n'importe laquelle des familles d'applications courantes (statique ou process continu) jusqu'à une URL accessible.
Sous-chapitres : Le modèle mental statique vs process · HTML/CSS pur · React (Vite) · Vue · Angular · Next.js · Nuxt · Express · NestJS · Laravel · Django · Spring Boot · ASP.NET.
Laboratoires : (1) Déployer une application statique · (2) Déployer une application "process" avec PM2 · (3) Déployer un service géré par systemd (non-Node).

### Chapitre 7 — Docker, cours complet
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 2, Chapitre 6
**Compétences acquises :** comprendre et utiliser Docker en profondeur (images, containers, réseau, volumes) sans rien supposer d'acquis.
Sous-chapitres : Le problème que Docker résout · Image vs container · Commandes de base · Le Dockerfile ligne par ligne · Multi-stage builds · `.dockerignore` · Construire une image · Volumes · Réseau Docker · Bonnes pratiques de production et sécurité.
Laboratoires : (1) Construire sa première image et son premier container · (2) Faire persister des données avec un volume · (3) Faire communiquer deux containers par le réseau Docker.

### Chapitre 8 — Docker Compose *(nouveau, dédié)*
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 7
**Compétences acquises :** orchestrer une application multi-services (API + base + cache) avec un seul fichier déclaratif, en production comme en développement.
Sous-chapitres : Pourquoi Compose · Anatomie d'un `docker-compose.yml` · Services, réseaux, volumes automatiques · Variables d'environnement et fichier `.env` · Dépendances entre services (`depends_on` et ses limites) · Logs et cycle de vie (`up`, `down`, `logs`, `exec`) · Redéploiement d'une nouvelle version · Compose en production vs développement.
Laboratoires : (1) Écrire un Compose complet API + base de données · (2) Ajouter un cache Redis au Compose existant · (3) Simuler un redéploiement de nouvelle version sans perte de données.

---

## PARTIE IV — EXPOSITION RÉSEAU ET CHIFFREMENT

### Chapitre 9 — Configuration de Nginx
**Niveau :** Intermédiaire · **Prérequis :** Chapitres 6-8
**Compétences acquises :** configurer Nginx comme reverse proxy robuste et sécurisé pour plusieurs domaines/applications sur un même serveur.
Sous-chapitres : Anatomie d'un fichier de configuration · Virtual hosts · Reverse proxy en détail · HTTP/2 · Compression · Cache navigateur et cache serveur · Sécurité (en-têtes, rate limiting) · Redirections · Organisation multi-domaines.
Laboratoires : (1) Héberger deux sites sur un même serveur · (2) Mettre en place un reverse proxy complet avec en-têtes corrects · (3) Configurer cache et compression et mesurer l'impact.

### Chapitre 10 — SSL / HTTPS
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 9
**Compétences acquises :** obtenir, configurer, renouveler et auditer un certificat HTTPS de production.
Sous-chapitres : Comment un certificat établit la confiance (ACME) · Installer Certbot · Obtenir un premier certificat · Ce que Certbot modifie réellement · Multi-domaines et wildcard · Renouvellement automatique et son test · Audit qualité (SSL Labs, HSTS) · Dépannage SSL.
Laboratoires : (1) Obtenir un certificat réel sur un domaine · (2) Tester le renouvellement automatique · (3) Auditer et améliorer la note SSL Labs.

---

## PARTIE V — AUTOMATISATION

### Chapitre 11 — CI/CD *(nouveau)*
**Niveau :** Intermédiaire → Avancé · **Prérequis :** Chapitre 3 (Git), Chapitres 6-8
**Compétences acquises :** automatiser entièrement le déploiement d'une application à chaque push, avec rollback fiable en cas de problème.
Sous-chapitres : Pourquoi automatiser un déploiement · Anatomie d'un pipeline · GitHub Actions (workflows, jobs, étapes) · GitLab CI (`.gitlab-ci.yml`) · Secrets et variables protégées · Déploiement automatique vers un VPS (SSH depuis la CI) · Stratégies de rollback · Tests automatisés dans le pipeline · Notifications d'échec.
Laboratoires : (1) Écrire un premier workflow GitHub Actions (build + test) · (2) Déployer automatiquement sur le VPS à chaque push sur `main` · (3) Simuler un déploiement raté et effectuer un rollback.

---

## PARTIE VI — DONNÉES

### Chapitre 12 — Bases de données : sécurisation, sauvegarde, restauration
**Niveau :** Intermédiaire · **Prérequis :** Chapitre 5
**Compétences acquises :** durcir, sauvegarder et restaurer une base de données en conditions réelles, pas seulement en théorie.
Sous-chapitres : Sécurisation MySQL au-delà de l'installation · `pg_hba.conf` en détail · ACL Redis · Sauvegarder MySQL (`mysqldump`) · Restaurer MySQL · Sauvegarder PostgreSQL (`pg_dump`/`pg_restore`) · Import/export ciblés · Sauvegarder Redis · La règle 3-2-1 · Automatisation par cron.
Laboratoires : (1) Durcir une base fraîchement installée · (2) Sauvegarder puis restaurer sur une base de test · (3) Automatiser la sauvegarde avec vérification réelle.

---

## PARTIE VII — OBSERVABILITÉ ET PERFORMANCE

### Chapitre 13 — Monitoring *(nouveau)*
**Niveau :** Avancé · **Prérequis :** Chapitres 4-5, Chapitre 12
**Compétences acquises :** mettre en place une supervision complète (métriques, dashboards, alertes) d'un serveur et de ses applications.
Sous-chapitres : Pourquoi monitorer, que mesurer · Netdata (installation, dashboard temps réel) · Prometheus (modèle de métriques, scraping) · Grafana (dashboards, sources de données) · Loki (centralisation des logs) · Uptime Kuma (surveillance externe) · Alertmanager (règles d'alerte, notifications) · Construire un tableau de bord de référence.
Laboratoires : (1) Installer Netdata et lire ses métriques · (2) Monter une stack Prometheus + Grafana minimale · (3) Configurer une alerte réelle (Alertmanager ou Uptime Kuma) et la déclencher volontairement.
Captures d'écran prévues : dashboard Netdata, dashboard Grafana, écran de configuration d'une alerte.

### Chapitre 14 — Performance *(nouveau, dédié)*
**Niveau :** Avancé · **Prérequis :** Chapitre 13
**Compétences acquises :** diagnostiquer et corriger méthodiquement un problème de performance, sans deviner.
Sous-chapitres : Méthode d'identification d'un goulot d'étranglement · `htop` en profondeur · `iostat` et l'activité disque · `vmstat` et la mémoire virtuelle · `ncdu` et l'espace disque · `free`/`df`/`du` réexaminés · Optimisation Nginx (workers, buffers) · Cache applicatif avec Redis · Compression Brotli vs Gzip · PM2 en mode cluster · Index de base de données.
Laboratoires : (1) Diagnostiquer un goulot d'étranglement provoqué volontairement · (2) Mettre en cache une route coûteuse avec Redis · (3) Comparer Gzip et Brotli sur un cas réel.

---

## PARTIE VIII — SÉCURITÉ ET RÉSILIENCE

### Chapitre 15 — Sécurité avancée *(nouveau)*
**Niveau :** Avancé · **Prérequis :** Chapitre 4, Chapitre 13
**Compétences acquises :** auditer et durcir un serveur en production au-delà des bases, avec des outils professionnels reconnus.
Sous-chapitres : CrowdSec (protection collaborative) · Fail2ban avancé (jails personnalisées) · Lynis (audit de durcissement) · Audit SSH approfondi · Audit des comptes utilisateurs · Audit des droits `sudo` · Pare-feu avancé (`nftables`, règles fines) · Scan de vulnérabilités (dépendances, système).
Laboratoires : (1) Faire un audit Lynis complet et corriger les points signalés · (2) Configurer CrowdSec · (3) Réaliser un audit manuel des comptes et des droits sudo.

### Chapitre 16 — Sauvegardes avancées *(nouveau)*
**Niveau :** Avancé · **Prérequis :** Chapitre 12
**Compétences acquises :** mettre en place une stratégie de sauvegarde professionnelle, chiffrée, incrémentale et testée.
Sous-chapitres : Limites des sauvegardes simples (rappel chapitre 12) · Restic (dépôts, snapshots, chiffrement) · BorgBackup (déduplication) · Destinations distantes : Backblaze B2, Wasabi, AWS S3 · Stratégie 3-2-1 approfondie · Sauvegardes incrémentales vs complètes · Politique de rétention · Tests de restauration automatisés.
Laboratoires : (1) Mettre en place Restic vers un stockage distant · (2) Comparer Restic et BorgBackup sur un même jeu de données · (3) Automatiser un test de restauration mensuel.

---

## PARTIE IX — EXPLOITATION AU QUOTIDIEN

### Chapitre 17 — Maintenance générale
**Niveau :** Intermédiaire · **Prérequis :** Chapitres 13-16
**Compétences acquises :** entretenir un serveur en production dans la durée, avec une routine claire.
Sous-chapitres : Rotation des logs (`logrotate`, `journalctl --vacuum`) · Mises à jour de sécurité automatiques · Mises à jour majeures (planification, tests) · Nettoyage régulier (paquets, Docker, logs, sauvegardes) · Checklist de sécurité périodique · Routine hebdomadaire/mensuelle/trimestrielle recommandée.
Laboratoires : (1) Mettre en place `unattended-upgrades` · (2) Construire sa propre routine de nettoyage automatisée · (3) Exécuter une checklist de sécurité mensuelle complète.

### Chapitre 18 — Méthodologie professionnelle de diagnostic
**Niveau :** Avancé · **Prérequis :** tous les chapitres précédents
**Compétences acquises :** diagnostiquer méthodiquement n'importe quelle panne, comme un administrateur système professionnel, via des arbres de décision et un catalogue de 150 scénarios réels.
Sous-chapitres : La méthode générale (lire l'erreur, logs, isoler, hypothèse) · Arbre de décision — site inaccessible · Arbre de décision — lenteur applicative · Arbre de décision — échec de déploiement · Arbre de décision — panne de base de données · 150 scénarios organisés par catégorie (SSH, Linux, réseau/DNS, Nginx, SSL, applications/PM2/systemd, bases de données, Docker, Git/CI/CD, performance, monitoring, sécurité).
Laboratoires : (1) Provoquer et diagnostiquer trois pannes volontaires sans regarder la solution · (2) Construire son propre arbre de décision pour un scénario non couvert · (3) Simulation chronométrée de diagnostic sous pression.

---

## PARTIE X — ÉTUDES DE CAS PROFESSIONNELLES

Chaque étude de cas part d'un **serveur Ubuntu vierge** et va jusqu'à une **mise en production sécurisée** (HTTPS, sauvegardes, monitoring de base), en réutilisant explicitement les chapitres précédents plutôt qu'en réexpliquant les notions déjà vues.

| Chapitre | Étude de cas | Illustre principalement |
|---|---|---|
| 19 | React + Express + PostgreSQL | Déploiement direct, chapitres 6, 9, 10, 12 |
| 20 | React + NestJS | Variante backend structurée, chapitres 6, 9, 12 |
| 21 | Next.js + Prisma + Docker | Rendu serveur + conteneurisation, chapitres 6, 7, 8 |
| 22 | Laravel + Docker | Stack PHP conteneurisée, chapitres 6, 7, 8 |
| 23 | Django + Gunicorn | Stack Python + WSGI + systemd, chapitres 6, 17 |
| 24 | Spring Boot | Stack Java + systemd, chapitre 6 |
| 25 | ASP.NET | Stack .NET + Kestrel + systemd, chapitre 6 |
| 26 | WordPress | CMS PHP classique, LEMP, sécurisation spécifique |
| 27 | ERPNext | Application Python/Frappe complexe, multi-services |
| 28 | Odoo | ERP Python multi-modules, PostgreSQL avancé |

**Niveau :** Intermédiaire à Avancé selon le cas · **Prérequis :** l'intégralité des Parties I à IX.
**Compétences acquises (ensemble) :** transférer la méthode du manuel à n'importe quelle stack réelle, y compris des logiciels tiers non développés sur mesure (WordPress, ERPNext, Odoo).

Chaque étude de cas suit la même structure que les précédentes du manuel (préparation serveur → logiciels → déploiement → Nginx → SSL → base de données → sauvegardes → vérification finale), avec une checklist de mise en production dédiée.

---

## ANNEXES

| Annexe | Contenu |
|---|---|
| A | Tableau complet des permissions Linux (lecture/écriture/exécution, notation octale et symbolique, cas spéciaux SUID/SGID/sticky bit) |
| B | Tableau des commandes Linux essentielles (toutes celles du manuel, syntaxe et rappel d'usage) |
| C | Tableau des commandes Git |
| D | Tableau des commandes Docker |
| E | Tableau des commandes `systemctl` |
| F | Tableau des commandes `journalctl` |
| G | Tableau des commandes et directives Nginx |
| H | Tableau des commandes PostgreSQL (`psql`, administration) |
| I | Tableau des commandes MySQL |
| J | Tableau des ports TCP/UDP courants |
| K | Tableau des codes de statut HTTP |
| L | Tableau des types/formats de certificats SSL |
| M | Tableau de référence rapide `chmod` (octal ↔ symbolique ↔ effet) |
| N | Tableau des services Linux courants et leur rôle |

---

## GLOSSAIRE

Alphabétique, un terme par entrée, structure fixe :
```
**Terme**
Définition simple : (une phrase, accessible à un débutant)
Définition technique : (précise, pour référence)
Exemple concret : (tiré d'un projet réel du manuel)
Voir : Chapitre X, section Y
```
Alimenté au fil de la rédaction des chapitres (chaque chapitre nourrit sa propre section "Glossaire du chapitre", compilée ici en fin d'ouvrage).

---

## INDEX

Alphabétique, références aux numéros de chapitre/section. Catégories couvertes : commandes Linux, logiciels et outils (Nginx, Docker, PM2, Certbot...), protocoles (HTTP, HTTPS, SSH, DNS, TCP/UDP), acronymes (VPS, CI/CD, TLS, RBAC...), concepts (reverse proxy, idempotence, rollback...), laboratoires (renvoi direct au numéro de labo).

---

## Notes de production

- **Renumérotation des fichiers existants** : l'insertion du chapitre Git en position 3 décale tous les chapitres suivants. Les fichiers seront renommés progressivement à mesure que chaque chapitre est retravaillé (pas de renommage en masse prématuré tant que le contenu n'est pas encore au nouveau format).
- **Mermaid** : chaque nouveau schéma sera écrit en Mermaid plutôt qu'en ASCII pur. Le pipeline d'export (`build.ps1`) sera complété avec une étape de pré-rendu Mermaid → SVG, sur le modèle de `render-mermaid.js` du manuel Node.js, avant la prochaine génération HTML/DOCX/PDF.
- **Rythme de validation** : un chapitre à la fois, jamais le suivant sans autorisation explicite, avec une proposition d'amélioration à la fin de chaque chapitre comme demandé.
