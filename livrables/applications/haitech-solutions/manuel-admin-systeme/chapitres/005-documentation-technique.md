<div class="chapitre-titre-num">PARTIE I · CHAPITRE 4</div>

# Documentation technique

## Rôle de la documentation

La documentation technique est ce qui transforme une compétence individuelle en actif d'organisation. Un système parfaitement administré mais jamais documenté représente un risque opérationnel majeur : en cas d'absence, de départ ou d'incident touchant l'administrateur système lui-même, personne d'autre ne peut intervenir efficacement. La documentation n'est pas un livrable secondaire produit « quand on a le temps » : c'est une partie intégrante du travail d'administration, au même titre que la configuration elle-même.

## Fonctionnement : les types de documentation

| Type | Objectif | Fréquence de mise à jour | Exemple |
|---|---|---|---|
| Documentation d'architecture | Vue d'ensemble durable du système | À chaque changement structurant | Schémas réseau, cartographie applicative (Chapitre 3) |
| Procédures opérationnelles (runbooks) | Exécuter une tâche récurrente de façon fiable et reproductible | À chaque évolution de la procédure | Procédure de sauvegarde, de bascule de secours |
| Documentation de dépannage | Résoudre rapidement un incident connu | Après chaque incident significatif | Base de connaissance des pannes récurrentes |
| Journal des changements | Tracer qui a changé quoi et pourquoi | À chaque changement | Registre des changements (Partie X) |
| Documentation d'onboarding | Permettre à un nouvel arrivant de devenir autonome | Semestrielle ou après refonte majeure | Guide de prise en main de l'infrastructure |

## Prérequis

- Un espace de stockage unique et accessible à toute l'équipe technique (pas de documentation éparpillée entre emails, fichiers locaux et mémoire individuelle)
- Une convention de nommage et de structure minimale, pour que deux documents traitant de sujets voisins se ressemblent
- Un mécanisme de contrôle de version, même simple (historique de wiki, dépôt Git)

## Mise en place d'un système de documentation

1. **Choisir un outil unique** — Wiki interne (Confluence, Wiki.js, BookStack) ou dépôt Git avec fichiers Markdown, selon la maturité technique de l'équipe.
2. **Définir un squelette de document standard** — Objectif, prérequis, procédure pas à pas, points de vérification, contacts en cas de blocage.
3. **Documenter en priorité le plus critique** — Commencer par les procédures dont l'absence causerait le plus de dommage en cas d'indisponibilité de l'administrateur habituel.
4. **Intégrer la documentation au processus de changement** — Aucun changement significatif n'est considéré terminé tant que sa documentation n'est pas mise à jour (Partie X, gestion des changements).
5. **Auditer périodiquement l'exactitude** — Faire exécuter une procédure documentée par une personne qui ne l'a pas écrite, pour vérifier qu'elle est réellement suivable.

## Structure recommandée d'un runbook

| Section | Contenu |
|---|---|
| Objectif | Une phrase expliquant ce que fait la procédure et dans quel contexte l'utiliser |
| Prérequis | Accès, outils, informations nécessaires avant de commencer |
| Étapes | Actions numérotées, chacune vérifiable indépendamment |
| Vérification | Comment confirmer que la procédure a réussi |
| Rollback | Comment revenir en arrière si la procédure échoue en cours de route |
| Contact | Qui contacter en cas de blocage imprévu |

## Administration courante

- Revue de la documentation à chaque changement (voir étape 4 ci-dessus)
- Nettoyage périodique des documents obsolètes plutôt que leur accumulation indéfinie
- Formation des nouveaux arrivants directement via la documentation existante, pour en tester la qualité en conditions réelles

## Outils recommandés

| Outil | Type | Points forts |
|---|---|---|
| Wiki.js / BookStack | Wiki auto-hébergé | Gratuit, structuration hiérarchique, recherche intégrée |
| Confluence | Wiki d'entreprise (Atlassian) | Intégration native avec Jira, très répandu en entreprise |
| Dépôt Git + Markdown | Documentation as code | Versionné avec le code, historique complet, revue par pull request |
| Notion | Espace de travail documentaire | Flexible, bonne prise en main, adapté aux petites équipes |

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Écrire la documentation immédiatement après avoir résolu un problème, pendant que le contexte est encore frais
- Préférer des captures d'écran ou des exemples de commandes réels à des descriptions purement théoriques
- Dater et signer chaque mise à jour significative de document
- Écrire pour un lecteur qui ne connaît pas déjà le contexte, pas pour soi-même six mois plus tard
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Documenter une fois puis ne jamais mettre à jour, laissant la documentation dériver silencieusement de la réalité
- Une documentation trop théorique, sans étapes concrètes exécutables
- Multiplier les emplacements de stockage (email, disque local, wiki) sans source de vérité unique
- Documenter des mots de passe ou secrets en clair dans un wiki non chiffré (Partie XI, gestion des secrets)
</div>

## Dépannage d'une documentation défaillante

Une documentation qui n'est jamais consultée est souvent un symptôme, pas une cause : elle indique généralement qu'elle est trop difficile à trouver, trop longue, ou perçue comme non fiable suite à des expériences passées où elle s'est révélée obsolète. La correction passe rarement par « écrire plus », mais par restructurer l'existant (le rendre plus court, plus cherchable, daté) et par restaurer la confiance via un premier audit de fiabilité.

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
La documentation technique décrit souvent, en creux, l'architecture de sécurité d'un système. Elle doit donc être protégée avec un niveau d'accès cohérent avec sa sensibilité : accessible à toute l'équipe technique pour les procédures opérationnelles, mais restreinte pour les schémas d'architecture de sécurité détaillés ou tout document contenant des éléments d'authentification. Ne jamais publier de documentation technique sensible sur un espace public ou insuffisamment protégé.
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
Le module Documents/KYC de BANKA et la documentation `docs/MAIL_SERVER_SETUP.md` de POSTA (configuration Postfix/Dovecot/OpenDKIM prête à déployer, rédigée avant même que le serveur ne soit provisionné) illustrent la bonne pratique centrale de ce chapitre : documenter une procédure avant ou pendant sa mise en œuvre, pas après coup de mémoire. Ce même réflexe — documenter le pourquoi d'une décision technique au moment où elle est prise plutôt que de compter sur la mémoire de l'équipe — est ce qui permet, des mois plus tard, de reprendre un chantier interrompu sans tout redécouvrir à partir de zéro.
</div>

## Résumé du chapitre

- La documentation transforme une compétence individuelle en actif transmissible à l'organisation.
- Cinq types de documentation couvrent l'essentiel : architecture, runbooks, dépannage, changements, onboarding.
- Documenter au moment de l'action est plus fiable que documenter de mémoire après coup.
- Une documentation jamais consultée est un symptôme à corriger, pas une fatalité.

*Chapitre suivant : gestion des actifs informatiques et inventaire.*
