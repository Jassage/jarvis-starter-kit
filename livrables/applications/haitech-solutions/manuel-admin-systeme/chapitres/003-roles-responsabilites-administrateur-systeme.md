<div class="chapitre-titre-num">PARTIE I · CHAPITRE 2</div>

# Rôles et responsabilités de l'administrateur système

## Rôle de la fonction

L'administrateur système est responsable de la disponibilité, de la performance, de la sécurité et de l'intégrité des systèmes informatiques d'une organisation. Ce rôle se situe à l'intersection de plusieurs disciplines : réseau, systèmes d'exploitation, sécurité, sauvegarde, et de plus en plus, automatisation et cloud. Contrairement à une idée reçue, la valeur de ce rôle ne se mesure pas au nombre de systèmes maîtrisés techniquement, mais à la fiabilité perçue par les utilisateurs métier : un bon administrateur système est largement invisible quand tout fonctionne, et extrêmement visible — et jugé — au moment d'un incident.

## Fonctionnement : la matrice de responsabilités

Dans une petite structure, une seule personne peut cumuler tous les rôles ci-dessous. Dans une structure plus grande, ils se répartissent entre plusieurs profils. Formaliser cette matrice — même à une seule personne — évite les zones d'ombre où « personne ne savait que c'était à faire ».

| Domaine | Responsable (R) | Accountable (A) | Consulté (C) | Informé (I) |
|---|---|---|---|---|
| Disponibilité des serveurs | Administrateur système | DSI / RSI | Éditeurs, hébergeur | Direction |
| Sauvegardes et restauration | Administrateur système | DSI / RSI | — | Direction, utilisateurs concernés |
| Sécurité périmétrique (pare-feu, VPN) | Administrateur système / réseau | RSSI ou DSI | Prestataire sécurité externe | Direction |
| Gestion des comptes utilisateurs | Administrateur système | RH (création/départ) | Manager du salarié | — |
| Continuité d'activité (PCA/PRA) | Administrateur système | Direction générale | Métiers critiques | Tout le personnel |

<div class="encadre info">
<span class="encadre-titre">ℹ️ À savoir</span>
Cette matrice RACI (Responsible, Accountable, Consulted, Informed) est l'outil central de ce chapitre : R exécute, A rend des comptes et valide, C est consulté avant décision, I est informé après. Un même domaine ne doit jamais avoir deux « A » : cela crée systématiquement des conflits d'arbitrage.
</div>

## Prérequis pour exercer la fonction

- Connaissances techniques transverses : réseau, systèmes Windows/Linux, virtualisation, sécurité de base
- Capacité à documenter et à transmettre (Chapitre 4) : la compétence individuelle ne suffit pas si elle n'est pas transmissible
- Rigueur procédurale, en particulier sur les changements en production
- Compréhension a minima des enjeux métier de l'organisation, pour prioriser correctement en cas d'incident

## Mise en place du rôle dans une nouvelle structure

1. **Réaliser un état des lieux** — Inventaire des systèmes existants, des accès, des mots de passe hérités (Chapitre 5).
2. **Sécuriser les accès administrateur** — Reprendre le contrôle exclusif des comptes à privilèges avant toute autre action (Partie XI).
3. **Établir la matrice RACI** — Même minimale, formaliser qui décide de quoi dès les premières semaines.
4. **Définir le périmètre d'astreinte** — Horaires couverts, procédure d'escalade, seuils de criticité déclenchant une intervention hors heures ouvrées.
5. **Mettre en place les outils de base** — Système de tickets, dépôt de documentation, gestionnaire de mots de passe partagé.

## Profils et niveaux de séniorité

| Niveau | Périmètre typique | Autonomie de décision |
|---|---|---|
| Junior / Support N1 | Assistance utilisateurs, tickets simples, exécution de procédures documentées | Faible : escalade systématique au-delà du connu |
| Administrateur système confirmé | Exploitation quotidienne, changements standards, diagnostic de niveau 2 | Moyenne : décide seul dans le cadre validé |
| Administrateur système senior / Lead | Architecture, changements majeurs, astreinte de dernier niveau | Élevée : arbitre les cas non couverts par les procédures |
| Responsable infrastructure / DSI | Stratégie, budget, gouvernance (Chapitre 1) | Décisionnelle sur les investissements |

## Administration courante du rôle

- Revue hebdomadaire des tickets ouverts et des incidents récurrents
- Suivi des correctifs de sécurité en attente d'application (Partie XI)
- Vérification périodique des sauvegardes (test de restauration, pas seulement contrôle de la tâche planifiée)
- Mise à jour continue de la documentation à chaque changement effectué

## Outils du quotidien

- Système de tickets (Jira Service Management, GLPI, Zendesk selon la taille)
- Gestionnaire de mots de passe d'équipe (Bitwarden, KeePass partagé, Vault)
- Dépôt de documentation versionné (wiki interne, ou dépôt Git pour les runbooks, Partie VI)
- Registre des changements (Partie X)

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Ne jamais être le seul détenteur d'un accès critique : toujours prévoir un accès de secours documenté et sécurisé
- Documenter au moment de l'action, pas a posteriori de mémoire
- Séparer clairement compte personnel et compte à privilèges administratifs (Parties IV et XI)
- Formaliser par écrit toute dérogation exceptionnelle à une procédure, avec sa justification
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Le syndrome du « bus factor 1 » : toute la connaissance de l'infrastructure dans une seule tête, jamais documentée
- Confondre urgence perçue et urgence réelle, au détriment de la priorisation par criticité métier
- Accepter des changements en production hors procédure « juste cette fois », qui deviennent la norme
- Négliger la relation avec les métiers, réduisant l'IT à une fonction perçue comme uniquement technique
</div>

## Résolution des tensions de rôle

Les conflits les plus fréquents entre administrateur système et reste de l'organisation portent sur la vitesse perçue (« pourquoi ça prend du temps ») et sur le risque perçu (« pourquoi refuser ce changement »). La matrice RACI et un registre des risques visibles (Chapitre 1) sont les deux meilleurs outils de désamorçage : ils rendent explicite ce qui, sinon, reste de l'ordre du jugement personnel non justifié.

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Le compte de l'administrateur système est la cible n°1 de toute attaque ciblée (Partie XI, PKI et Zero Trust). Appliquer systématiquement le principe du moindre privilège même à ce rôle : compte nominal pour les tâches quotidiennes, élévation temporaire tracée pour les tâches à privilèges, jamais de compte administrateur partagé entre plusieurs personnes.
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
Sur OTELA, le modèle RBAC (contrôle d'accès par rôle) distingue Réception, Ménage, Administrateur d'établissement et Administrateur de chaîne, avec un cloisonnement testé et vérifié empêchant un administrateur d'établissement de créer un compte de niveau chaîne, même en forçant les paramètres de la requête. C'est exactement la même logique que la matrice RACI de ce chapitre, appliquée au niveau applicatif plutôt qu'organisationnel : définir précisément qui peut faire quoi, et vérifier que la limite tient réellement, pas seulement dans l'interface.
</div>

## Résumé du chapitre

- La matrice RACI formalise qui exécute, qui rend des comptes, qui est consulté et qui est informé sur chaque domaine.
- Un même domaine ne doit jamais avoir deux « Accountable ».
- Le principe du moindre privilège s'applique aussi au compte de l'administrateur système lui-même.
- La documentation (Chapitre 4) est ce qui transforme une compétence individuelle en actif transmissible.

*Chapitre suivant : architecture informatique d'entreprise.*
