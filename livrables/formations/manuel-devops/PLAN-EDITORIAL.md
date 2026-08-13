# DevOps de A à Z
## Plan éditorial complet

> **Statut : plan en attente de validation.** Aucun chapitre ne sera rédigé tant que ce plan n'est pas validé par Jaslin. Une fois validé, il devient la référence contre laquelle chaque chapitre est écrit.

Ce plan reprend l'intégralité du brief fourni (70 sections), réorganisé en chapitres cohérents. Les sections 51-70 du brief ne sont **pas** des chapitres de contenu : ce sont des règles de fabrication (gabarit, style, niveaux de difficulté, checklists, cheat sheet, glossaire, examen final, règle sur les technologies, avertissement sur les commandes destructives). Elles sont reprises ci-dessous comme règles transversales appliquées à *tous* les chapitres, plus quatre annexes dédiées (checklists compilées, cheat sheet, glossaire, examen final).

---

## ⚠️ Trois points à trancher avant de commencer

**1. Chevauchement avec deux manuels déjà terminés.** Le portefeuille contient déjà :
- **Guide Ultime du Déploiement** (28 chapitres, `livrables/guides/deploiement-ultime/`) : Linux, Git, préparation serveur, Docker/Compose, Nginx, SSL, CI/CD, bases de données, monitoring avancé (Prometheus/Grafana/Loki), sécurité, sauvegardes avancées (Restic/Borg), 150 scénarios de dépannage, 10 études de cas de déploiement complètes.
- **Manuel Administration Système** (86 chapitres, `livrables/formations/manuel-administration-systeme/`) : Linux avancé, virtualisation, conteneurs/Kubernetes, Cloud AWS/Azure/GCP, Terraform/Ansible/Jenkins/DevSecOps, supervision Zabbix/Prometheus/Grafana/ELK, réseau avancé, cybersécurité/gouvernance.

Ce nouveau manuel DevOps recoupe une bonne partie de ce terrain (Linux, Docker, CI/CD, Terraform, Kubernetes, Cloud, monitoring). Ce n'est pas forcément un problème : ce manuel a une **colonne vertébrale différente** — un seul fil rouge « code source → production », resserré et pratique, là où les deux autres sont soit un manuel de déploiement mono-serveur, soit un manuel d'infrastructure généraliste. Mais pour éviter de réécrire deux fois le même cours (ex. administration Linux avancée, Terraform, Kubernetes), je propose :

> Sur les sujets où Manuel Administration Système est déjà exhaustif (Linux avancé au-delà des commandes de base, Terraform, Kubernetes au-delà des fondamentaux, Cloud AWS au-delà des services essentiels), **ce manuel traite le niveau "suffisant pour être opérationnel"** et renvoie vers Manuel Administration Système pour l'approfondissement — plutôt que de dupliquer 86 chapitres. Les chapitres qui sont le cœur de métier propre à ce manuel (Git/GitHub, Docker appliqué, pipelines CI/CD, stratégies de déploiement, rollback, gestion des secrets, le fil DevSecOps appliqué à un pipeline) restent, eux, complets et autonomes — c'est la vraie valeur ajoutée de ce manuel.

Dis-moi si tu préfères au contraire une **totale autonomie** (aucun renvoi, chaque chapitre se suffit même si ça répète des passages déjà écrits ailleurs) — c'est plus long à écrire mais utilisable seul sans les deux autres manuels sous la main.

**2. Le manuel Docker existant (`manuel-docker/`) n'a jamais été validé ni commencé** (plan écrit, 0 chapitre rédigé). Ce nouveau manuel DevOps contient déjà 4 chapitres Docker complets (11-14) qui couvrent l'essentiel. Je propose de **mettre le projet `manuel-docker` en pause** (son plan reste sur disque, réactivable plus tard si tu veux un jour un manuel Docker dédié beaucoup plus poussé) plutôt que de mener les deux de front. Confirme si ça te va.

**3. Ampleur du projet Final (section 54-55 du brief).** Le brief décrit 19 phases pour le projet final. Je les ai réparties en 7 chapitres (50-56) plutôt qu'un seul chapitre de 19 sections illisible. Dis-moi si tu préfères un découpage différent.

---

## Gabarit obligatoire par chapitre

Identique dans l'esprit aux deux manuels précédents, adapté aux exigences précises du brief (section 64) :

**En-tête** : badge de niveau (🟢 Débutant / 🟡 Intermédiaire / 🟠 Avancé / 🔴 Professionnel) + Objectifs pédagogiques + Prérequis.

**Corps** : Problème → Concept → Explication simple → Analogie → Architecture (schéma Mermaid) → Installation/Configuration → Commandes (chaque commande étiquetée par son environnement : Windows PowerShell / Windows CMD / Linux Ubuntu / macOS / Serveur VPS / Conteneur Docker / GitHub) → Explication de chaque commande mot par mot → Résultat attendu → Test de vérification → Erreurs fréquentes → Dépannage → Exercice → Corrigé.

**Fin** : Bonnes pratiques → Ce qu'il ne faut pas faire → Checklist → À retenir → Glossaire du chapitre → Références officielles → transition vers le chapitre suivant.

**Règles transversales appliquées partout** (brief 59-62) : jamais un outil présenté comme obligatoire sans expliquer le problème qu'il résout, ses alternatives et quand *ne pas* l'utiliser (ex. « Kubernetes n'est pas nécessaire pour toutes les applications ») ; toute commande destructive (`rm -rf`, `docker system prune`, `terraform destroy`, `git push --force`...) avertie explicitement avant d'être montrée, avec une alternative sûre proposée ; version logicielle précisée dès qu'une syntaxe en dépend, avec renvoi à la doc officielle si un doute existe plutôt qu'une invention.

**QCM/exercices de fin de partie** (brief 66) : à la fin de chaque partie (pas de chaque chapitre), un bloc évaluation (QCM + questions ouvertes + mini-projet) avec corrigé séparé.

---

## Vue d'ensemble des parties

| Partie | Titre | Chapitres | Niveau |
|---|---|---|---|
| I | Culture et fondations DevOps | 1 – 3 | Débutant absolu |
| II | Linux et administration serveur | 4 – 6 | Débutant → Intermédiaire |
| III | Git et collaboration | 7 – 9 | Débutant → Intermédiaire |
| IV | Automatisation et scripting | 10 | Intermédiaire |
| V | Conteneurisation avec Docker | 11 – 14 | Intermédiaire |
| VI | Serveur web, réseau et environnements | 15 – 18 | Intermédiaire |
| VII | Intégration continue | 19 – 24 | Intermédiaire |
| VIII | Secrets et déploiement en production | 25 – 29 | Intermédiaire → Avancé |
| IX | Données et sauvegardes | 30 – 31 | Intermédiaire |
| X | Observabilité | 32 – 34 | Avancé |
| XI | Sécurité DevSecOps | 35 – 36 | Avancé |
| XII | Infrastructure as Code et Cloud | 37 – 40 | Avancé |
| XIII | Kubernetes | 41 – 44 | Avancé |
| XIV | Architecture, performance et fiabilité | 45 – 49 | Avancé → Professionnel |
| XV | Projet final fil rouge | 50 – 56 | Professionnel |
| — | Annexes | A – E | — |

**56 chapitres + 5 annexes.**

---

## PARTIE I — CULTURE ET FONDATIONS DEVOPS

### Chapitre 1 — Comprendre DevOps
🟢 · *(Brief : module 5)* Qu'est-ce que DevOps, origine du mouvement, Dev vs Ops, le cycle Plan→Code→Build→Test→Release→Deploy→Operate→Monitor→Feedback expliqué étape par étape.

### Chapitre 2 — Culture DevOps
🟢 · *(Brief : module 6)* Collaboration, automatisation, responsabilité partagée, petits changements fréquents, feedback rapide. Pourquoi DevOps n'est pas « juste utiliser Docker ».

### Chapitre 3 — Construire son environnement de travail
🟢 · *(Brief : module 7)* Installation VS Code, Git, Docker, Docker Compose, terminal, SSH. Constitution d'un laboratoire reproductible (VM ou VPS de test) utilisé dans tout le reste du manuel.

---

## PARTIE II — LINUX ET ADMINISTRATION SERVEUR

### Chapitre 4 — Linux pour DevOps : les commandes essentielles
🟢 · *(Brief : module 8)* `pwd` à `unzip` (liste complète du brief), chacune avec syntaxe/exemple/résultat/cas pratique/erreurs fréquentes.

### Chapitre 5 — Administration d'un serveur Linux
🟡 · *(Brief : module 9)* Utilisateurs, groupes, permissions, services (systemd), processus, firewall (ufw), packages (apt), logs (journalctl), cron, variables d'environnement. Renvoi vers Manuel Administration Système ch. 14-21 pour l'administration Linux avancée (LVM, SELinux/AppArmor, tuning noyau).

### Chapitre 6 — SSH
🟡 · *(Brief : module 10)* Clé privée/publique, génération, installation sur le serveur, connexion, durcissement (désactivation mot de passe, port, `fail2ban` en aperçu).

---

## PARTIE III — GIT ET COLLABORATION

### Chapitre 7 — Git de zéro
🟢 · *(Brief : module 11)* `init` à `tag`, plus le fonctionnement interne (objets, commits, arbre, index) en schéma.

### Chapitre 8 — GitHub
🟡 · *(Brief : module 12)* Repository, branches, pull requests, issues, releases, tags, secrets, environments, permissions. Workflow professionnel type (fork/branche/PR/review/merge).

### Chapitre 9 — Stratégies de branches
🟡 · *(Brief : module 13)* Git Flow vs GitHub Flow vs trunk-based development, comparatif et critères de choix selon la taille d'équipe.

---

## PARTIE IV — AUTOMATISATION ET SCRIPTING

### Chapitre 10 — Automatisation avec des scripts
🟡 · *(Brief : module 14)* Pourquoi automatiser. Bash et PowerShell : variables, conditions, boucles, codes de retour, gestion d'erreurs. Quatre scripts construits pas à pas : `backup.sh`, `deploy.sh`, `healthcheck.sh`, `cleanup.sh`.

---

## PARTIE V — CONTENEURISATION AVEC DOCKER

### Chapitre 11 — Docker : images, conteneurs, volumes, réseaux
🟡 · *(Brief : module 15)* Concepts fondamentaux + premiers laboratoires pratiques.

### Chapitre 12 — Dockerfile professionnel
🟠 · *(Brief : module 16)* Multi-stage build, cache, `.dockerignore`, images minimales, utilisateur non-root, healthcheck. Dockerfiles construits pour Node.js, React, NestJS, Python/Django, Java/Spring Boot.

### Chapitre 13 — Docker Compose
🟡 · *(Brief : module 17)* Architecture React+Node+PostgreSQL, puis React+NestJS+PostgreSQL+Redis+Nginx, construites de A à Z.

### Chapitre 14 — Registries
🟡 · *(Brief : module 18)* Docker Hub, registre privé, tags, versions, push/pull.

---

## PARTIE VI — SERVEUR WEB, RÉSEAU ET ENVIRONNEMENTS

### Chapitre 15 — Nginx
🟡 · *(Brief : module 19)* Serveur web, reverse proxy, load balancing, headers, compression, cache, fichiers statiques. Architecture Internet→Nginx→App→DB.

### Chapitre 16 — HTTPS et TLS
🟡 · *(Brief : module 20)* HTTP vs HTTPS, TLS, certificats, Let's Encrypt/Certbot, procédure complète pour une application déjà déployée.

### Chapitre 17 — DNS
🟢 · *(Brief : module 21)* Domaine, enregistrements A/AAAA/CNAME/MX/TXT, TTL. Exemple complet domaine→DNS→IP VPS→Nginx→Docker.

### Chapitre 18 — Gérer ses environnements
🟡 · *(Brief : module 22)* development/testing/staging/production, fichiers `.env`, différences de configuration. Pose les bases reprises en détail au chapitre 25 (secrets).

---

## PARTIE VII — INTÉGRATION ET DÉPLOIEMENT CONTINU

### Chapitre 19 — Comprendre l'intégration continue (CI)
🟡 · *(Brief : module 23)* Définition, pipeline générique push→checkout→install→lint→test→build.

### Chapitre 20 — Comprendre le déploiement continu (CD)
🟡 · *(Brief : module 24)* Continuous Delivery vs Continuous Deployment, pipeline GitHub→Tests→Build→Image→Registry→Serveur→Deploy.

### Chapitre 21 — GitHub Actions
🟠 · *(Brief : module 25)* Workflow, event, job, step, runner, action, secrets, artifacts, environments. Plusieurs workflows construits.

### Chapitre 22 — Premier pipeline CI/CD complet
🟠 · *(Brief : module 26)* Application Node.js réelle, pipeline Push→Tests→Build→Docker Build→Docker Push→Deploy, tous les fichiers fournis.

### Chapitre 23 — Tests automatisés
🟡 · *(Brief : module 27)* Unitaires, intégration, API, end-to-end. Intégration dans le pipeline CI du chapitre 22.

### Chapitre 24 — Qualité du code
🟡 · *(Brief : module 28)* Linting, formatting, analyse statique, couverture de tests, intégration pipeline.

---

## PARTIE VIII — SECRETS ET DÉPLOIEMENT EN PRODUCTION

### Chapitre 25 — Gestion des secrets
🟠 · *(Brief : module 29)* Ce qu'il ne faut jamais faire (secret dans Git/code/Dockerfile) + solutions : GitHub Secrets, variables d'environnement, Docker secrets, secret managers.

### Chapitre 26 — Déploiement sur VPS, guide complet
🟠 · *(Brief : module 30)* Créer VPS→SSH→utilisateur→sécurisation→firewall→Git→Docker→clone→secrets→build→deploy→Nginx→DNS→HTTPS→monitoring. Chaque étape expliquée, aucune implicite.

### Chapitre 27 — Déploiement automatique de bout en bout
🟠 · *(Brief : module 31)* Developer→push→GitHub Actions→Tests→Build→Registry→VPS→Deploy, connecte les chapitres 21-22 et 26.

### Chapitre 28 — Stratégies de déploiement
🟠 · *(Brief : module 32)* Recreate, Rolling, Blue/Green, Canary — schémas, avantages/limites de chacune.

### Chapitre 29 — Rollback
🟠 · *(Brief : module 33)* Procédure complète nouvelle version→problème→détection→rollback→analyse, gestion des versions d'image Docker.

---

## PARTIE IX — DONNÉES ET SAUVEGARDES

### Chapitre 30 — Les bases de données en DevOps
🟡 · *(Brief : module 34)* Migrations, backups, données persistantes, changement de schéma, compatibilité entre versions. Pipeline avec PostgreSQL.

### Chapitre 31 — Backup et restauration
🟠 · *(Brief : module 35)* Stratégie réelle (application/DB/volumes/config/secrets), fréquence, rétention, stockage, test de restauration. Renvoi vers Manuel Administration Système ch. 27-32 (PRA/PCA) pour le niveau entreprise.

---

## PARTIE X — OBSERVABILITÉ

### Chapitre 32 — Monitoring
🟠 · *(Brief : module 36)* Métriques, logs, traces, alertes, disponibilité. Docker Stats, Prometheus, Grafana — laboratoire.

### Chapitre 33 — Gestion des logs
🟡 · *(Brief : module 37)* Logs applicatifs/Nginx/Docker, rotation, centralisation.

### Chapitre 34 — Observabilité
🟠 · *(Brief : module 38)* Les trois piliers (logs/metrics/traces), introduction progressive à OpenTelemetry.

---

## PARTIE XI — SÉCURITÉ DEVSECOPS

### Chapitre 35 — Sécurité DevOps / DevSecOps
🟠 · *(Brief : module 39)* Sécurité du code aux secrets en passant par les dépendances, images, réseau, CI/CD, supply chain. Pipeline DevSecOps complet.

### Chapitre 36 — Sécurité des images Docker
🟠 · *(Brief : module 40)* Vulnérabilités, images officielles, scan, non-root, packages inutiles.

---

## PARTIE XII — INFRASTRUCTURE AS CODE ET CLOUD

### Chapitre 37 — Infrastructure as Code
🟠 · *(Brief : module 41)* Pourquoi éviter la configuration manuelle. Introduction à Terraform (config déclarative, variables, state, modules).

### Chapitre 38 — Terraform en pratique
🟠 · *(Brief : module 42)* `init`/`plan`/`apply`/`destroy` avec avertissement explicite sur `destroy`. Niveau : suffisant pour provisionner une infra simple — renvoi vers Manuel Administration Système ch. 53 pour l'usage avancé (modules réutilisables, remote state, workspaces).

### Chapitre 39 — Comprendre le Cloud
🟡 · *(Brief : module 43)* IaaS/PaaS/SaaS, régions, zones, réseau, stockage, compute — concepts génériques avant tout outillage.

### Chapitre 40 — AWS pour DevOps
🟠 · *(Brief : module 44)* EC2, VPC, Security Groups, IAM, EBS, S3, RDS, CloudWatch, Load Balancer, Route 53 — une architecture réaliste construite pas à pas. Renvoi vers Manuel Administration Système ch. 45-50 pour Azure/GCP et le FinOps.

---

## PARTIE XIII — KUBERNETES

### Chapitre 41 — Pourquoi Kubernetes
🟠 · *(Brief : module 45)* Le problème que Kubernetes résout avant le vocabulaire : cluster, node, pod, deployment, service, ingress, configmap, secret, namespace, volume.

### Chapitre 42 — Premier projet Kubernetes
🟠 · *(Brief : module 46)* React+API+PostgreSQL déployé progressivement, chaque YAML expliqué ligne par ligne.

### Chapitre 43 — Helm
🟠 · *(Brief : module 47)* Chart, values, templates, release — exemple construit sur le projet du chapitre 42.

### Chapitre 44 — CI/CD vers Kubernetes
🔴 · *(Brief : module 48)* GitHub→CI→Docker Build→Registry→Kubernetes→Deployment, connecte les chapitres 21-22 et 41-43.

---

## PARTIE XIV — ARCHITECTURE, PERFORMANCE ET FIABILITÉ

### Chapitre 45 — Concevoir une infrastructure réelle
🔴 · *(Brief : module 49)* Internet→DNS→HTTPS→Load Balancer→Frontend/API→Database/Redis, chaque composant justifié.

### Chapitre 46 — Incidents et dépannage : 60 scénarios réels
🔴 · *(Brief : module 50)* Organisé par catégorie (serveur/SSH, disque/RAM, Docker, réseau/Nginx/502, certificat/DNS, base de données/migration, CI/CD/image, secrets/permissions, Kubernetes CrashLoopBackOff...). Chaque scénario : Symptôme→Hypothèses→Diagnostic→Analyse→Correction→Vérification→Prévention. Arbres de décision Mermaid pour les pannes les plus fréquentes (502 Nginx, pod CrashLoopBackOff, pipeline rouge).

### Chapitre 47 — Performance
🟠 · *(Brief : module 51)* CPU/RAM/disque/réseau/latence/temps de réponse/concurrence. Identifier un goulot d'étranglement.

### Chapitre 48 — Scalabilité
🟠 · *(Brief : module 52)* Vertical vs horizontal, load balancing, application stateless, cache, scaling de base de données.

### Chapitre 49 — Haute disponibilité
🔴 · *(Brief : module 53)* Single point of failure, réplication, redondance, health checks, failover — architecture HA construite.

---

## PARTIE XV — PROJET FINAL FIL ROUGE

*(Brief : sections 54-55, 19 phases réparties en 7 chapitres. Application support : à définir avec toi — proposition par défaut une API Node/Express + React, cohérente avec le reste du portefeuille.)*

### Chapitre 50 — Projet final : cadrage, Git et développement
🔴 · Phases 1-4 : créer le projet, Git/GitHub, développer l'application, ajouter les tests.

### Chapitre 51 — Projet final : conteneurisation
🔴 · Phases 5-6 : Dockerfile, Docker Compose.

### Chapitre 52 — Projet final : premier déploiement manuel
🔴 · Phases 7-11 : serveur, déploiement manuel, Nginx, DNS, HTTPS.

### Chapitre 53 — Projet final : pipeline CI/CD
🔴 · Phases 12-13 : CI, CD automatisés.

### Chapitre 54 — Projet final : monitoring et sauvegardes
🔴 · Phases 14-15.

### Chapitre 55 — Projet final : sécurisation
🔴 · Phase 16.

### Chapitre 56 — Projet final : panne, rollback et documentation
🔴 · Phases 17-19 : provoquer une panne réelle, effectuer un rollback, documenter l'infrastructure produite.

---

## ANNEXES

### Annexe A — Checklists professionnelles compilées
*(Brief : section 56, 14 checklists)* Développeur, Git, Docker, serveur, sécurité, CI, CD, déploiement, HTTPS, backup, monitoring, production, incident, rollback.

### Annexe B — Cheat sheet géant
*(Brief : section 57)* Linux, SSH, Git, Docker, Docker Compose, Nginx, systemctl, journalctl, curl, réseau, Terraform, AWS CLI, Kubernetes/kubectl, Helm — tableau Commande→Rôle→Exemple pour chacune.

### Annexe C — Neuf architectures comparées
*(Brief : section 58)* De « application unique » à « infrastructure complète » (les 9 architectures listées dans le brief), diagramme + composants + flux + avantages/limites + coût/complexité + cas d'usage pour chacune, en un seul tableau récapitulatif.

### Annexe D — Glossaire complet
*(Brief : section 68)* Les 32 termes listés dans le brief, définitions accessibles à un débutant, alimenté au fil de la rédaction comme les glossaires de chapitre.

### Annexe E — Examen final pratique
*(Brief : section 67)* « Voici une application qui fonctionne en local, mettez-la en production » — 15 étapes notées, barème détaillé par étape, corrigé de référence.

---

## Notes de production

- **Rythme de validation : un chapitre à la fois**, jamais le suivant sans autorisation explicite — même règle que pour les trois manuels précédents.
- **Tooling déjà en place** (copié et adapté de `manuel-docker`) : `package.json`, `build.ps1` (assemble `chapitres/*.md` → HTML + DOCX + PDF via pandoc), `render-mermaid.js` (pré-rendu Mermaid en PNG), `print-pdf.js` (export PDF via Edge headless), `assets/style.css`, `assets/couverture.md`, `assets/cover-fragment.html` — titres et sortie déjà renommés `manuel-devops`.
- **Renvois inter-manuels** : sur les sujets où Manuel Administration Système est déjà exhaustif (voir point 1 ci-dessus), ce manuel reste au niveau opérationnel et renvoie explicitement plutôt que de dupliquer.
- **Sécurité des exemples** : jamais de secret réel dans un exemple, toujours un environnement de laboratoire fictif ou jetable.
