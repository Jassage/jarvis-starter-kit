<div class="chapitre-titre-num">PARTIE I · CHAPITRE 3</div>

# Architecture informatique d'entreprise

## Rôle de l'architecture informatique

L'architecture informatique décrit comment les composants d'un système d'information (réseau, serveurs, applications, données) s'assemblent pour servir les besoins métier, aujourd'hui et dans les évolutions prévisibles. Une infrastructure sans architecture explicite fonctionne quand même, jusqu'au jour où elle doit évoluer : ajouter un site, migrer un serveur critique, absorber une charge multipliée par cinq. C'est à ce moment que l'absence de vision d'ensemble se paie le plus cher, sous forme de refontes d'urgence plutôt que d'évolutions planifiées.

## Fonctionnement : les couches d'architecture

| Couche | Contenu | Exemples |
|---|---|---|
| Architecture métier | Processus et besoins de l'organisation | Réservation, facturation, paie, relation client |
| Architecture applicative | Logiciels et services qui supportent les processus métier | ERP, CRM, messagerie, applications métier |
| Architecture des données | Modèles de données, flux, référentiels | Bases de données, entrepôts, référentiel client unique |
| Architecture technique / infrastructure | Serveurs, réseau, stockage, virtualisation, cloud | Objet de la majorité de ce manuel (Parties II à IX) |

Ces couches se lisent de haut en bas pour la conception (le métier détermine les besoins applicatifs, qui déterminent les besoins techniques) et de bas en haut pour l'exploitation quotidienne, où l'administrateur système opère principalement sur la couche technique tout en gardant une vision des couches supérieures pour prioriser correctement.

## Prérequis à une démarche d'architecture

- Inventaire des applications et de leurs interdépendances (quelle application dépend de quelle base de données, de quel serveur)
- Connaissance des flux de données critiques et de leurs volumes
- Compréhension des contraintes de continuité (Partie XII) : quels systèmes ne peuvent tolérer aucune interruption

## Mise en place d'une cartographie d'architecture

1. **Recenser les applications** — Nom, éditeur/développeur, criticité métier, hébergement (on-premise, cloud), responsable.
2. **Recenser l'infrastructure sous-jacente** — Serveurs physiques/virtuels, bases de données, systèmes de stockage associés à chaque application.
3. **Cartographier les flux réseau** — Quel serveur communique avec quel autre, sur quel port, dans quel sens (Partie II).
4. **Documenter les dépendances critiques** — Identifier les points de défaillance unique (SPOF) : un seul serveur dont la panne arrête plusieurs applications.
5. **Formaliser des schémas de référence** — Un schéma d'architecture logique et un schéma d'architecture physique, tenus à jour à chaque changement structurant.

## Modèles d'architecture courants

| Modèle | Description | Cas d'usage typique |
|---|---|---|
| Monolithique centralisé | Une application, une base de données, un serveur (ou une paire pour la HA) | PME avec un seul site, faible complexité applicative |
| Architecture N-tiers | Séparation présentation / logique métier / données sur des serveurs distincts | Applications web métier de taille moyenne |
| Architecture distribuée multi-site | Systèmes répartis sur plusieurs sites avec réplication | Chaînes multi-établissements (cas OTELA multi-hôtel, ANTENN) |
| Architecture cloud hybride | Partie on-premise, partie cloud public, interconnectées | Organisations en transition vers le cloud (Partie XII) |

## Administration courante de l'architecture

- Mettre à jour les schémas à chaque ajout ou retrait de composant significatif
- Revoir l'architecture avant tout projet de croissance (nouveau site, nouvelle application critique)
- Identifier et traiter progressivement les points de défaillance unique restants

## Outils de cartographie

- Outils dédiés : Lucidchart, draw.io (gratuit, fichiers versionnables), Archi (TOGAF, gratuit)
- CMDB pour l'inventaire détaillé et les dépendances (Chapitre 5 et Partie X)
- Diagrammes-as-code pour les schémas versionnés avec le code (Mermaid, PlantUML), pertinent pour les équipes déjà orientées Git (Partie VI)

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Garder les schémas d'architecture à un niveau de détail lisible : un schéma illisible n'est jamais consulté
- Distinguer toujours schéma logique (comment ça fonctionne) et schéma physique (où c'est réellement installé)
- Traiter les SPOF identifiés par ordre de criticité métier, pas par facilité technique de correction
- Impliquer les responsables métier dans la validation de l'architecture des systèmes qui les concernent
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Laisser l'architecture uniquement dans la tête de celui qui l'a construite, sans schéma écrit
- Ajouter des composants sans jamais retirer ceux devenus obsolètes (dette d'architecture silencieuse)
- Concevoir une architecture cible idéale sans jamais planifier de chemin réaliste pour l'atteindre
- Ignorer les contraintes de bande passante et de latence entre sites dans une architecture distribuée
</div>

## Diagnostic des problèmes d'architecture

| Symptôme | Cause d'architecture probable | Piste de correction |
|---|---|---|
| Une panne isolée arrête plusieurs services | Point de défaillance unique non identifié | Cartographier les dépendances, planifier une redondance ciblée (Partie IX) |
| Les performances se dégradent avec la croissance des utilisateurs | Architecture non dimensionnée pour la montée en charge | Étude de capacité, envisager la répartition de charge (Partie III) |
| Chaque évolution applicative nécessite de tout retester | Couplage fort entre composants qui devraient être indépendants | Planifier un découplage progressif, pas une refonte immédiate |

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
L'architecture doit intégrer la sécurité dès la conception (« security by design »), pas en ajout final. La segmentation réseau par zones de confiance (Partie II, VLAN), l'isolement des systèmes exposés publiquement (Partie III, DMZ) et la limitation des flux au strict nécessaire entre couches applicatives sont des décisions d'architecture, pas des options de configuration ajoutables après coup sans refonte.
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
L'architecture multi-tenant d'OTELA illustre un choix d'architecture assumé et documenté : modèle « Silo » avec `resolveEtablissement` garantissant que la donnée d'un établissement ne peut jamais fuiter vers un autre, même en cas de paramètre falsifié côté client. C'est une décision d'architecture des données (isolement par tenant) qui a des conséquences directes sur l'architecture technique (une base partagée avec filtrage systématique plutôt qu'une base par établissement). Documenter ce type de choix — et surtout la raison pour laquelle l'alternative a été écartée — est précisément ce qu'une cartographie d'architecture doit capturer pour rester utile dans deux ou trois ans.
</div>

## Résumé du chapitre

- L'architecture s'organise en quatre couches : métier, applicative, données, technique.
- Une cartographie à jour est le meilleur outil pour anticiper les évolutions et identifier les points de défaillance unique.
- La sécurité se conçoit dès l'architecture, pas en ajout final.
- Documenter le pourquoi d'un choix d'architecture est aussi important que le schéma lui-même.

*Chapitre suivant : documentation technique.*
