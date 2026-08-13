<div class="chapitre-titre-num">ANNEXE A</div>

# Checklists professionnelles compilées

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif de cette annexe</span>
Regrouper, en un seul endroit consultable rapidement, les 14 checklists de fin de chapitre les plus opérationnelles de ce manuel — développeur, Git, Docker, serveur, sécurité, CI, CD, déploiement, HTTPS, backup, monitoring, production, incident, rollback. Chaque checklist renvoie au chapitre qui la détaille.
</div>

## Checklist développeur (avant de commiter)

<ul class="checklist">
<li>☐ `.gitignore` vérifié avant le premier commit du projet (chapitre 7, 18)</li>
<li>☐ Aucun secret en clair dans le code ou la configuration (chapitre 25)</li>
<li>☐ Requêtes SQL paramétrées, jamais concaténées (chapitre 50)</li>
<li>☐ Message de commit clair, expliquant le pourquoi (chapitre 7)</li>
<li>☐ Tests écrits pour toute nouvelle fonctionnalité (chapitre 23)</li>
<li>☐ Linter et formateur exécutés localement avant de pousser (chapitre 24)</li>
</ul>

## Checklist Git

<ul class="checklist">
<li>☐ Branche de fonctionnalité courte, jamais des semaines (chapitre 9)</li>
<li>☐ Pull request avec description expliquant le pourquoi, pas seulement le quoi (chapitre 8)</li>
<li>☐ CI verte avant toute fusion (chapitre 8, 19)</li>
<li>☐ Branche `main` protégée, fusion directe impossible (chapitre 8)</li>
<li>☐ Tag de version sur chaque release, format sémantique (chapitre 7, 14)</li>
</ul>

## Checklist Docker

<ul class="checklist">
<li>☐ `.dockerignore` en place, excluant `node_modules`, `.git`, `.env` (chapitre 12)</li>
<li>☐ Instructions ordonnées pour optimiser le cache (dépendances avant code, chapitre 12)</li>
<li>☐ Multi-stage build, image finale minimale (chapitre 12)</li>
<li>☐ Utilisateur non-root explicite (chapitre 12, 36)</li>
<li>☐ HEALTHCHECK défini et testé manuellement (chapitre 12)</li>
<li>☐ Image de base officielle ou vérifiée, version épinglée (chapitre 36)</li>
<li>☐ Image scannée (Docker Scout/Trivy) avant publication (chapitre 36)</li>
</ul>

## Checklist serveur

<ul class="checklist">
<li>☐ Utilisateur dédié créé, accès `sudo`, jamais root en usage courant (chapitre 5, 26)</li>
<li>☐ SSH : mot de passe désactivé, root désactivé, clé dédiée (chapitre 6)</li>
<li>☐ Pare-feu actif, SSH autorisé avant activation (chapitre 5)</li>
<li>☐ Fuseau horaire et synchronisation NTP vérifiés (chapitre 46)</li>
<li>☐ Docker installé, utilisateur ajouté au groupe `docker` (chapitre 3, 26)</li>
</ul>

## Checklist sécurité

<ul class="checklist">
<li>☐ Aucun secret dans Git, une image Docker, ou un canal non sécurisé (chapitre 25)</li>
<li>☐ Scan de secrets (gitleaks) intégré au pipeline (chapitre 35)</li>
<li>☐ Audit des dépendances (`npm audit`) intégré au pipeline (chapitre 35)</li>
<li>☐ Scan d'images intégré au pipeline, bloquant sur vulnérabilité grave (chapitre 36)</li>
<li>☐ Principe du moindre privilège appliqué (Linux, GitHub, IAM/RBAC) partout (chapitres 4, 5, 8, 40, 44)</li>
<li>☐ Rotation des secrets planifiée, pas seulement réactive (chapitre 25)</li>
</ul>

## Checklist CI

<ul class="checklist">
<li>☐ Pipeline générique : checkout → install → lint → test → build (chapitre 19)</li>
<li>☐ Environnement d'exécution toujours neuf, jamais réutilisé (chapitre 19)</li>
<li>☐ `npm ci` plutôt que `npm install` (chapitre 19)</li>
<li>☐ Actions tierces épinglées à une version précise (chapitre 21)</li>
<li>☐ Cache des dépendances activé (chapitre 21)</li>
</ul>

## Checklist CD

<ul class="checklist">
<li>☐ Image taguée avec le SHA du commit, jamais `latest` seul (chapitre 14, 22)</li>
<li>☐ Approche Delivery ou Deployment choisie consciemment (chapitre 20)</li>
<li>☐ Approbation manuelle configurée si Delivery (chapitre 21)</li>
<li>☐ Migrations de base de données séparées et auditables (chapitre 30, 53)</li>
</ul>

## Checklist déploiement

<ul class="checklist">
<li>☐ Les 15 étapes du chapitre 26 suivies sans raccourci pour un premier déploiement</li>
<li>☐ Vérification de santé finale sur le domaine public réel, pas seulement `localhost` (chapitre 22, 27)</li>
<li>☐ Stratégie de déploiement choisie consciemment (Recreate/Rolling/Blue-Green/Canary, chapitre 28)</li>
<li>☐ Notification de succès/échec configurée (chapitre 27)</li>
</ul>

## Checklist HTTPS

<ul class="checklist">
<li>☐ DNS propagé et vérifié (`dig`) avant de lancer Certbot (chapitre 16, 17)</li>
<li>☐ Redirection HTTP → HTTPS systématique (chapitre 16)</li>
<li>☐ Renouvellement automatique vérifié (`--dry-run`) (chapitre 16)</li>
<li>☐ En-têtes de sécurité complémentaires (HSTS, X-Content-Type-Options) (chapitre 16)</li>
</ul>

## Checklist backup

<ul class="checklist">
<li>☐ Application, base de données, volumes, configuration tous couverts (chapitre 31)</li>
<li>☐ Politique de fréquence et rétention explicite et documentée (chapitre 31)</li>
<li>☐ Stockage physiquement séparé du serveur d'origine (chapitre 31)</li>
<li>☐ Restauration réellement testée, pas seulement supposée fonctionnelle (chapitre 31)</li>
<li>☐ Sauvegardes chiffrées si stockées sur un service tiers (chapitre 31)</li>
</ul>

## Checklist monitoring

<ul class="checklist">
<li>☐ Métriques, logs et traces couverts (au moins les deux premiers, chapitre 32-34)</li>
<li>☐ Tableau de bord consulté régulièrement, pas seulement techniquement en place (chapitre 32)</li>
<li>☐ Alertes avec seuil de durée minimale, jamais sur un pic isolé (chapitre 32)</li>
<li>☐ Interfaces de monitoring jamais exposées publiquement (chapitre 32)</li>
<li>☐ Logs Docker limités (`max-size`/`max-file`) (chapitre 33)</li>
</ul>

## Checklist production

<ul class="checklist">
<li>☐ Toutes les checklists précédentes de cette annexe cochées</li>
<li>☐ Schéma d'architecture documenté et à jour (chapitre 45)</li>
<li>☐ Au moins les SPOF les plus critiques identifiés, corrigés ou consciemment acceptés (chapitre 49)</li>
<li>☐ `DEPLOIEMENT.md` complet et relu par une personne extérieure (chapitre 56)</li>
</ul>

## Checklist incident

<ul class="checklist">
<li>☐ Méthode suivie : restreindre, hypothèse, vérifier, corriger, vérifier, documenter (chapitre 46)</li>
<li>☐ Une hypothèse à la fois, jamais plusieurs corrections simultanées à l'aveugle (chapitre 46)</li>
<li>☐ Post-mortem sans blâme rédigé après résolution (chapitre 2, 46)</li>
</ul>

## Checklist rollback

<ul class="checklist">
<li>☐ Procédure de rollback testée avant d'en avoir réellement besoin (chapitre 29)</li>
<li>☐ Image cible identifiée par SHA, toujours disponible sur le registre (chapitre 14, 29)</li>
<li>☐ Impact sur les migrations de base de données évalué avant tout rollback (chapitre 29, 30)</li>
<li>☐ Temps de rétablissement mesuré et comparé aux exécutions précédentes (chapitre 29)</li>
</ul>

*Annexe suivante : B — Cheat sheet des commandes.*
