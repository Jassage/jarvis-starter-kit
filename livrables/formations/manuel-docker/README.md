# Docker de zéro à expert — Manuel de formation professionnelle

> Comprendre, développer, conteneuriser, déployer, sécuriser et administrer des applications avec Docker : conteneurs, images, Dockerfile, Docker Compose, réseaux, volumes, Nginx, sécurité, registries, VPS, HTTPS, CI/CD, monitoring, sauvegardes — avec des projets complets et un catalogue de 50 pannes réelles.

Ce manuel est écrit pour une personne qui n'a **jamais** utilisé Docker, ni Linux. Chaque notion est expliquée avant d'être utilisée, chaque commande est décortiquée ligne par ligne, chaque piège (`EXPOSE` qui ne publie rien, `depends_on` qui ne garantit pas la disponibilité réelle, le slash final de `proxy_pass`...) est démontré en laboratoire avant d'être corrigé — jamais simplement affirmé.

**Rapport avec le Guide Ultime du Déploiement (`../../guides/deploiement-ultime/`)** : ce manuel-ci se concentre exclusivement sur Docker. Les fondations Linux/SSH/VPS pures (chapitres 29 notamment) renvoient explicitement à ce dernier plutôt que de les réexpliquer — les deux manuels sont complémentaires, pas redondants.

---

## Sommaire — 48 chapitres + 3 annexes

| # | Chapitre |
|---|---|
| **Partie I — Comprendre avant de pratiquer** | |
| 01 | [Comprendre les conteneurs : le vocabulaire et les concepts](chapitres/01-comprendre-les-conteneurs.md) |
| 02 | [Conteneur vs machine virtuelle vs Kubernetes](chapitres/02-conteneur-vs-machine-virtuelle-vs-kubernetes.md) |
| 03 | [Installer Docker](chapitres/03-installer-docker.md) |
| **Partie II — Manipuler conteneurs et images** | |
| 04 | [Premiers conteneurs : le cycle de vie](chapitres/04-premiers-conteneurs-cycle-de-vie.md) |
| 05 | [Les images Docker](chapitres/05-les-images-docker.md) |
| 06 | [Le Dockerfile en profondeur](chapitres/06-le-dockerfile-en-profondeur.md) |
| 07 | [Premier projet : construire et lancer sa première image](chapitres/07-premier-projet-dockerfile.md) |
| 08 | [Ports et exposition réseau](chapitres/08-ports-et-exposition-reseau.md) |
| 09 | [Variables d'environnement et secrets](chapitres/09-variables-environnement-et-secrets.md) |
| 10 | [Volumes et persistance des données](chapitres/10-volumes-et-persistance-des-donnees.md) |
| 11 | [Réseaux Docker](chapitres/11-reseaux-docker.md) |
| **Partie III — Docker Compose** | |
| 12 | [Introduction à Docker Compose](chapitres/12-introduction-a-docker-compose.md) |
| 13 | [Premier projet Compose : Nginx + Backend + MySQL](chapitres/13-premier-projet-compose.md) |
| **Partie IV — Dockeriser des applications réelles** | |
| 14 | [Dockeriser une API Node.js / Express](chapitres/14-dockeriser-nodejs-express.md) |
| 15 | [Dockeriser React en production (multi-stage build)](chapitres/15-dockeriser-react-multi-stage.md) |
| 16 | [Dockeriser MySQL](chapitres/16-dockeriser-mysql.md) |
| 17 | [Dockeriser PostgreSQL](chapitres/17-dockeriser-postgresql.md) |
| 18 | [Ajouter Redis (cache, session, file d'attente)](chapitres/18-redis-avec-docker.md) |
| 19 | [Nginx comme reverse proxy devant plusieurs services](chapitres/19-nginx-reverse-proxy.md) |
| 20 | [Assembler une application full stack complète](chapitres/20-application-full-stack-complete.md) |
| **Partie V — Fiabiliser le démarrage multi-services** | |
| 21 | [Healthchecks et dépendances entre services](chapitres/21-healthchecks-et-dependances.md) |
| **Partie VI — Exploitation et diagnostic au quotidien** | |
| 22 | [Consulter et interpréter les logs](chapitres/22-consulter-et-interpreter-les-logs.md) |
| 23 | [Debugging : inspect, exec, top, stats, events](chapitres/23-debugging-inspect-exec-top-stats-events.md) |
| 24 | [Nettoyage de l'espace disque](chapitres/24-nettoyage-de-lespace-disque.md) |
| **Partie VII — Docker professionnel et sécurité** | |
| 25 | [Dockerfile professionnel : bonnes pratiques et optimisation](chapitres/25-dockerfile-professionnel.md) |
| 26 | [Sécurité Docker](chapitres/26-securite-docker.md) |
| 27 | [Registries : Docker Hub et registry privé](chapitres/27-registries-docker-hub-et-prive.md) |
| **Partie VIII — Production et déploiement** | |
| 28 | [Environnements dev/test/prod et gestion des `.env`](chapitres/28-environnements-dev-test-prod.md) |
| 29 | [Déploiement sur VPS, de A à Z](chapitres/29-deploiement-vps-de-a-a-z.md) |
| 30 | [Domaine et HTTPS](chapitres/30-domaine-et-https.md) |
| 31 | [CI/CD avec Docker](chapitres/31-cicd-avec-docker.md) |
| 32 | [Mettre à jour, versionner et revenir en arrière](chapitres/32-versioning-mise-a-jour-rollback.md) |
| 33 | [Sauvegarder les données Docker](chapitres/33-sauvegarder-les-donnees-docker.md) |
| 34 | [Monitoring](chapitres/34-monitoring.md) |
| 35 | [Performance : CPU, RAM, I/O et limites de ressources](chapitres/35-performance.md) |
| 36 | [Bases de données en production avec Docker](chapitres/36-bases-de-donnees-en-production.md) |
| 37 | [Docker et architecture microservices](chapitres/37-architecture-microservices.md) |
| **Partie IX — Docker par stack technologique** | |
| 38 | [Tour d'horizon : Node.js, React/Vite, NestJS, Python, Java](chapitres/38-tour-dhorizon-par-stack.md) |
| 39 | [Étude de cas : Java Spring Boot + PostgreSQL](chapitres/39-etude-de-cas-java-spring-boot.md) |
| 40 | [Étude de cas : Django + PostgreSQL + Redis + Nginx](chapitres/40-etude-de-cas-django.md) |
| **Partie X — Projets complets progressifs** | |
| 41 | [Projet 1 : premier contact (Nginx seul)](chapitres/41-projet-1-nginx-seul.md) |
| 42 | [Projet 2 : Node.js + MySQL](chapitres/42-projet-2-nodejs-mysql.md) |
| 43 | [Projet 3 : full stack (React + Node.js + MySQL + Nginx)](chapitres/43-projet-3-full-stack.md) |
| 44 | [Projet 4 : application professionnelle](chapitres/44-projet-4-application-professionnelle.md) |
| 45 | [Projet 5 : déploiement en production du Projet 4](chapitres/45-projet-5-deploiement-vps.md) |
| 46 | [Projet 6 : automatiser avec CI/CD](chapitres/46-projet-6-cicd-complet.md) |
| **Partie XI — Projet final fil rouge** | |
| 47 | [Projet final : système de gestion scolaire, du projet vide à la production](chapitres/47-projet-final-fil-rouge.md) |
| **Partie XII — Dépannage et référence** | |
| 48 | [Dépannage : catalogue de 50 pannes réelles](chapitres/48-depannage-50-pannes-reelles.md) |
| — | [Annexe A — Cheat sheet des commandes](chapitres/ANNEXE-A-cheat-sheet-commandes.md) |
| — | [Annexe B — Glossaire général](chapitres/ANNEXE-B-glossaire.md) |
| — | [Annexe C — Checklists professionnelles](chapitres/ANNEXE-C-checklists-professionnelles.md) |

**Manuel complet : 48 chapitres + 3 annexes, ~130 300 mots (51 fichiers).**

---

## Comment lire ce manuel

1. **Dans l'ordre.** Chaque chapitre s'appuie explicitement sur les précédents par des rappels ciblés (« rappel du chapitre X, section Y ») plutôt que de tout réexpliquer — sauter un chapitre casse ces renvois.
2. **Fais les laboratoires.** Chaque chapitre en contient trois, souvent construits pour faire échouer une commande *avant* de la corriger (le port non publié du chapitre 6, la perte de données du chapitre 10, l'OOM killer du chapitre 35) — l'échec provoqué et compris vaut plus qu'une explication seule.
3. **Un vrai Docker installé en parallèle.** Ce manuel devient concret uniquement si chaque commande est réellement tapée, pas seulement lue.
4. **La Partie X est le test de transfert.** Les chapitres 41 à 46 réutilisent délibérément les chapitres précédents sans réexpliquer — s'ils semblent difficiles à suivre, c'est le signal qu'il faut revenir sur la partie concernée avant de continuer.
5. **Référence rapide une fois le manuel terminé.** Le chapitre 48 et les trois annexes sont pensés pour un usage quotidien après une première lecture complète.

## Générer les exports (HTML / DOCX / PDF)

```powershell
# [PowerShell, depuis ce dossier]
npm install
powershell -File build.ps1
```

Produit `export/manuel-docker.html`, `.docx` et `.pdf` — voir `build.ps1` pour le détail du pipeline (rendu Mermaid → pandoc → Puppeteer).
