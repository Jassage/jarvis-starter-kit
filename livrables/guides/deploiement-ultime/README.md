# Le Guide Ultime du Déploiement — Manuel de formation professionnelle

> De zéro à autonome : préparer, sécuriser, déployer, maintenir et dépanner une application sur un serveur Linux (Ubuntu Server LTS), sans connaissance préalable.

Ce manuel est écrit pour une personne qui n'a **jamais** administré de serveur. Chaque notion est expliquée avant d'être utilisée, chaque commande est décortiquée ligne par ligne, chaque étape explique le pourquoi avant le comment.

**Rapport avec l'autre guide du dossier** (`../deploiement-serveur.md`) : ce fichier-là est un aide-mémoire opérationnel rapide, pensé pour quelqu'un qui sait déjà déployer et veut une checklist. **Ce manuel-ci est le cours complet** qui permet d'arriver à ce niveau de compréhension en partant de zéro. Une fois ce manuel terminé, l'aide-mémoire redevient l'outil du quotidien.

---

## Sommaire — Édition 2 (28 chapitres)

> Format approfondi par chapitre (23 sections : Introduction, Objectifs, Prérequis, Pourquoi important, Concepts fondamentaux, Explications détaillées, Schémas Mermaid, Analogies, Étude de cas, Bonnes pratiques, Erreurs fréquentes, Captures d'écran, 2-3 Laboratoires, Exercices, Quiz corrigé, Résumé, Checklist, Glossaire, FAQ, Références, Conclusion). Rédaction chapitre par chapitre, avec validation avant de passer au suivant.

| # | Chapitre | Statut |
|---|--------|--------|
| 00 | [Avant-propos](00-avant-propos.md) | Format d'origine |
| 01 | [Comprendre un serveur](01-comprendre-un-serveur.md) | ✅ Conforme au gabarit complet |
| 02 | [Les bases de Linux](02-bases-linux.md) | ✅ Conforme au gabarit complet |
| 03 | [Git et le contrôle de version](03-git.md) | ✅ Conforme au gabarit complet |
| 04 | [Préparer un serveur](04-preparer-un-serveur.md) | ✅ Conforme au gabarit complet |
| 05 | [Installation des logiciels](05-installation-logiciels.md) | ✅ Conforme au gabarit complet |
| 06 | [Déployer différents types d'applications](06-deployer-applications.md) | ✅ Conforme au gabarit complet |
| 07 | [Docker, cours complet](07-docker.md) | ✅ Conforme au gabarit complet |
| 08 | [Docker Compose](08-docker-compose.md) | ✅ Conforme au gabarit complet |
| 09 | [Configuration de Nginx](09-nginx.md) | ✅ Conforme au gabarit complet |
| 10 | [SSL / HTTPS](10-ssl.md) | ✅ Conforme au gabarit complet |
| 11 | [CI/CD](11-cicd.md) | ✅ Conforme au gabarit complet |
| 12 | [Bases de données](12-bases-de-donnees.md) | ✅ Conforme au gabarit complet |
| 13 | [Monitoring](13-monitoring.md) | ✅ Conforme au gabarit complet |
| 14 | [Performance](14-performance.md) | ✅ Conforme au gabarit complet |
| 15 | [Sécurité avancée](15-securite-avancee.md) | ✅ Conforme au gabarit complet |
| 16 | [Sauvegardes avancées](16-sauvegardes-avancees.md) | ✅ Conforme au gabarit complet |
| 17 | [Maintenance générale](17-maintenance.md) | ✅ Conforme au gabarit complet |
| 18 | [Méthodologie professionnelle de diagnostic](18-methodologie-diagnostic.md) | ✅ 150 scénarios + 4 arbres de décision |
| 19 | [Étude de cas : React + Express + PostgreSQL](19-etude-de-cas-react-express-postgresql.md) | ✅ Rédigé |
| 20 | [Étude de cas : React + NestJS](20-etude-de-cas-react-nestjs.md) | ✅ Rédigé |
| 21 | [Étude de cas : Next.js + Prisma + Docker](21-etude-de-cas-nextjs-prisma-docker.md) | ✅ Rédigé |
| 22 | [Étude de cas : Laravel + Docker](22-etude-de-cas-laravel-docker.md) | ✅ Rédigé |
| 23 | [Étude de cas : Django + Gunicorn](23-etude-de-cas-django-gunicorn.md) | ✅ Rédigé |
| 24 | [Étude de cas : Spring Boot](24-etude-de-cas-spring-boot.md) | ✅ Rédigé |
| 25 | [Étude de cas : ASP.NET](25-etude-de-cas-aspnet.md) | ✅ Rédigé |
| 26 | [Étude de cas : WordPress](26-etude-de-cas-wordpress.md) | ✅ Rédigé |
| 27 | [Étude de cas : ERPNext](27-etude-de-cas-erpnext.md) | ✅ Rédigé |
| 28 | [Étude de cas : Odoo](28-etude-de-cas-odoo.md) | ✅ Rédigé |
| — | [Annexes (14 tableaux de référence)](ANNEXES.md) | ✅ Rédigé |
| — | [Glossaire complet](GLOSSAIRE.md) | ✅ Rédigé |
| — | [Index](INDEX.md) | ✅ Rédigé |

**Manuel complet : 28 chapitres + Annexes + Glossaire + Index, ~120 600 mots (35 fichiers).**

---

## Comment lire ce manuel

1. **Dans l'ordre.** Chaque chapitre suppose les précédents acquis — le chapitre 6 (déployer une app) suppose les chapitres 2 (Linux) et 4 (préparer un serveur) déjà compris ; les études de cas (19-28) mobilisent l'intégralité des chapitres 1-18.
2. **Fais les laboratoires.** Chaque chapitre se termine par 2-3 exercices pratiques. Ne les saute pas : lire une commande et l'avoir tapée soi-même sur un vrai serveur sont deux compétences différentes.
3. **Un vrai serveur en parallèle.** Ce manuel devient concret seulement si tu as un VPS Ubuntu ouvert dans un terminal à côté (le chapitre 4 explique comment en obtenir un, y compris des offres à quelques dollars par mois suffisantes pour s'entraîner).
4. **Référence rapide une fois le manuel terminé.** Les [Annexes](ANNEXES.md), le [Glossaire](GLOSSAIRE.md) et l'[Index](INDEX.md) sont pensés pour un usage quotidien après une première lecture complète — comme l'aide-mémoire `../deploiement-serveur.md` du même dossier.
