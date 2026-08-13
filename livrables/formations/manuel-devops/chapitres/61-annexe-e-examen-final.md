<div class="chapitre-titre-num">ANNEXE E</div>

# Examen final pratique

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif de cette annexe</span>
Un examen pratique complet et noté sur 100 points, indépendant du projet fil rouge GestionTâches (Partie XV) — pour vérifier, sur une application différente, que les compétences de ce manuel sont réellement acquises et transférables, pas seulement répétées sur un exemple déjà connu.
</div>

## Énoncé

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mission</span>
Voici une application qui fonctionne en local : un petit blog avec un backend Express/Node.js exposant une API REST (articles, commentaires) et une base de données PostgreSQL, sans frontend fourni (une interface minimale ou l'usage direct de l'API via `curl`/Postman suffit pour cet examen). <strong>Ta mission : la mettre en production, de bout en bout, avec la même rigueur que le projet fil rouge de la Partie XV.</strong> Tu disposes de l'intégralité de ce manuel comme référence.
</div>

## Les 15 étapes notées

| # | Étape | Points | Critère de réussite |
|---|---|---|---|
| 1 | Utiliser Git | 5 | Dépôt initialisé, `.gitignore` vérifié avant le premier commit, historique avec des messages clairs (chapitre 7) |
| 2 | Créer un Dockerfile | 10 | Multi-stage, cache optimisé, utilisateur non-root, HEALTHCHECK fonctionnel (chapitre 12) |
| 3 | Créer un Docker Compose | 10 | API + PostgreSQL orchestrés, `depends_on` avec `condition: service_healthy`, seul le nécessaire exposé (chapitre 13) |
| 4 | Créer le serveur | 10 | VPS provisionné, utilisateur dédié, SSH durci, pare-feu configuré (chapitres 5-6, 26) |
| 5 | Configurer Nginx | 8 | Reverse proxy fonctionnel, en-têtes `proxy_set_header` corrects, `nginx -t` avant chaque reload (chapitre 15) |
| 6 | Configurer le DNS | 5 | Enregistrement A vérifié avec `dig` avant de continuer (chapitre 17) |
| 7 | Mettre HTTPS | 8 | Certificat valide, redirection HTTP→HTTPS, renouvellement automatique vérifié (`--dry-run`) (chapitre 16) |
| 8 | Créer un pipeline CI/CD | 12 | Tests, build, publication d'image versionnée par SHA, déploiement automatisé (chapitres 19-22, 27) |
| 9 | Déployer | 8 | Application accessible sur le domaine public réel, vérifiée en HTTPS (chapitres 26-27) |
| 10 | Ajouter du monitoring | 8 | Au moins une métrique exposée, un tableau de bord, une alerte avec seuil de persistance (chapitre 32) |
| 11 | Créer un backup | 7 | Sauvegarde automatisée, politique de rétention, **restauration réellement testée** (chapitre 31) |
| 12 | Provoquer une panne | 3 | Une panne réelle introduite via le processus normal (pas une modification manuelle de production) (chapitre 46) |
| 13 | Diagnostiquer | 4 | Méthode suivie (restreindre, hypothèse, vérifier) plutôt qu'une correction à l'aveugle (chapitre 46) |
| 14 | Restaurer le service | 4 | Service revenu à un état fonctionnel, vérifié par une requête réelle (chapitre 46) |
| 15 | Effectuer un rollback | 8 | Rollback réel vers une version antérieure connue, chronométré (chapitre 29) |

**Total : 110 points, ramenés sur 100.** *(La marge de 10 points au-delà de 100 laisse une tolérance pour des imperfections mineures sans pénaliser injustement un travail par ailleurs solide.)*

## Barème de notation par tranche

| Score | Interprétation |
|---|---|
| 90-100 | Maîtrise complète, prêt pour un déploiement client réel |
| 75-89 | Solide, quelques lacunes mineures à combler |
| 60-74 | Fondamentaux acquis, révision recommandée sur les étapes les plus faibles |
| Moins de 60 | Reprendre les chapitres correspondant aux étapes les moins réussies avant de retenter |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Chaque étape doit être vérifiée en conditions réelles, jamais supposée</span>
Un point n'est accordé que si l'étape est <strong>démontrée</strong> — une commande exécutée avec un résultat observé, pas une affirmation ("ça devrait marcher"). C'est le principe même de la compétence <em>verification-before-completion</em> appliqué à travers tout ce manuel : jamais de succès annoncé sans preuve.
</div>

## Corrigé de référence

<div class="encadre exercice">
<span class="encadre-titre">📝 Corrigé attendu, étape par étape</span>

**1-3 (Git, Dockerfile, Compose)** : reprendre exactement la structure des chapitres 50-51 (fil rouge GestionTâches), appliquée à ce nouveau projet de blog — la même méthode, un contenu différent.

**4-7 (Serveur, Nginx, DNS, HTTPS)** : dérouler sans raccourci les 15 étapes du chapitre 26, dans l'ordre exact — jamais HTTPS avant une propagation DNS vérifiée.

**8-9 (Pipeline, déploiement)** : reprendre le pipeline à quatre jobs du chapitre 53 (qualité/tests, build-and-push, migration si le blog a des migrations, déploiement), avec vérification finale sur le domaine public réel, jamais seulement `localhost`.

**10-11 (Monitoring, backup)** : au minimum, un healthcheck exposé en métrique Prometheus et un tableau de bord Grafana basique (chapitre 32) ; un script de sauvegarde quotidienne avec rétention (chapitre 31), et surtout une restauration **réellement exécutée** sur une base séparée, avec des données de test vérifiées après coup — le point le plus souvent négligé, et donc le plus révélateur de la rigueur du candidat.

**12-14 (Panne, diagnostic, restauration)** : une panne introduite via un vrai commit poussé sur `main` (jamais une modification directe du serveur), diagnostiquée avec la méthode du chapitre 46 (restreindre, hypothèse, vérifier avant de corriger), résolue et vérifiée par une requête réelle sur l'application.

**15 (Rollback)** : un rollback réel vers le SHA du dernier commit fonctionnel, chronométré du début à la fin — la preuve, comme au chapitre 56, que la capacité de récupération n'est pas seulement théorique.
</div>

## Auto-évaluation

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Comment utiliser cet examen en autoformation</span>

1. Ne consulte le corrigé qu'après avoir tenté chaque étape, jamais avant.
2. Note ton score honnêtement selon le barème — l'objectif est de révéler tes lacunes réelles, pas de te flatter.
3. Pour chaque étape en dessous de son plein score, identifie précisément le chapitre correspondant et relis-le avant de retenter.
4. Considère cet examen comme répétable — refais-le sur un troisième projet différent si le score de la première tentative reste insuffisant, jusqu'à une maîtrise réellement stable et transférable, pas seulement mémorisée sur un seul exemple.
</div>

*Fin des annexes. Fin de "DevOps de A à Z" — de la première commande Linux au déploiement, à l'automatisation et à la maintenance d'applications en production.*
