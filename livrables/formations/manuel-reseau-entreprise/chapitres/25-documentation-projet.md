<div class="chapitre-titre-num">CHAPITRE 25</div>

# Documentation de projet

## Objectifs pédagogiques

Structurer un cahier des charges, un dossier d'architecture complet, un plan d'adressage documenté, et les procédures d'exploitation, de maintenance, de reprise (PRA) et de continuité d'activité (PCA).

## Prérequis

L'ensemble des chapitres 1-24 : ce chapitre synthétise et formalise la documentation à produire pour chaque projet de la Partie 11.

## 25.1 Pourquoi documenter n'est jamais optionnel

<div class="encadre astuce">
<span class="encadre-titre">💡 Une infrastructure non documentée dépend entièrement de la mémoire d'une personne</span>
Un réseau parfaitement fonctionnel mais non documenté devient un risque opérationnel majeur dès que le technicien qui l'a conçu quitte l'entreprise ou n'est simplement pas disponible lors d'un incident — la documentation transforme une connaissance individuelle en un actif d'entreprise transmissible, condition de toute bonne pratique ITIL de gestion des configurations et des changements.
</div>

## 25.2 Cahier des charges

Structure type d'un cahier des charges de projet réseau :

```
CAHIER DES CHARGES - [Nom du projet]
=====================================
1. Contexte et objectifs du projet
2. Perimetre (batiments, sites concernes)
3. Analyse des besoins (renvoi vers la fiche de collecte, chapitre 5)
4. Contraintes (budget, delai, reglementaires)
5. Exigences techniques (performance, disponibilite, securite)
6. Exigences de videosurveillance (le cas echeant)
7. Criteres d'acceptation / tests de recette
8. Livrables attendus
9. Planning previsionnel
10. Responsabilites (client / integrateur)
```

## 25.3 Dossier d'architecture

Contenu minimal attendu pour chaque projet de la Partie 11 :

- **Schéma logique** (VLAN, flux, architecture hiérarchique, chapitre 6-7).
- **Schéma physique** (implantation des baies, cheminements, chapitre 7).
- **Plan d'adressage IP complet** (VLAN, sous-réseau, plage DHCP, passerelle — rappel des chapitres 3 et 6).
- **Inventaire matériel** (marque, modèle, numéro de série, emplacement, date d'installation, garantie).
- **Configurations des équipements** (exports de configuration Cisco IOS/RouterOS/UniFi/FortiOS, archivés et versionnés).
- **Rapports de certification du câblage** (chapitre 8).
- **Dimensionnement vidéosurveillance** (calculs du chapitre 19, politique de rétention du chapitre 22).

<div class="encadre astuce">
<span class="encadre-titre">💡 Versionner la documentation comme du code</span>
Conserver le dossier d'architecture (en particulier les schémas Mermaid, chapitre 7) dans un dépôt versionné (Git) permet de tracer l'historique des modifications, qui a changé quoi et quand — une pratique héritée du développement logiciel, de plus en plus adoptée en infrastructure réseau (Infrastructure as Code).
</div>

## 25.4 Plan d'adressage : tableau maître

| VLAN | Nom | Sous-réseau | Passerelle | Plage DHCP | VRRP/HSRP |
|---|---|---|---|---|---|
| 10 | Direction | 10.10.10.0/24 | 10.10.10.1 | .50-.200 | .2/.3 |
| 20 | Bureautique | 10.10.20.0/23 | 10.10.20.1 | .50-.250 | .2/.3 |
| 40 | Vidéosurveillance | 10.10.40.0/23 | 10.10.40.1 | Statique (caméras) | — |
| 99 | Management | 10.10.99.0/27 | 10.10.99.1 | Statique | — |

## 25.5 Documentation d'exploitation

Contenu attendu, destiné aux équipes d'exploitation quotidienne (distinct du dossier d'architecture de conception) :

- Procédures pas à pas des opérations courantes (ajout d'un utilisateur, ajout d'une caméra, remplacement d'un switch en panne).
- Coordonnées des contacts de support (constructeur, opérateur télécom, intégrateur).
- Procédure d'escalade en cas d'incident majeur.
- Calendrier de maintenance préventive (mises à jour firmware, tests de sauvegarde, tests de bascule HA).

## 25.6 Plan de reprise d'activité (PRA)

<div class="encadre astuce">
<span class="encadre-titre">💡 Le PRA répond à la question : comment reconstruire après une catastrophe ?</span>
Le PRA documente la procédure de reconstruction de l'infrastructure après un sinistre majeur (incendie du local technique, destruction complète d'un site) : matériel de remplacement à commander, procédure de restauration des sauvegardes (chapitre 16), ordre de priorité de remise en service des systèmes (typiquement : réseau de base, authentification/AD, puis applications métier).
</div>

Deux métriques centrales du PRA :

- **RTO (Recovery Time Objective)** : délai maximal acceptable avant rétablissement du service.
- **RPO (Recovery Point Objective)** : perte de données maximale acceptable, déterminant la fréquence de sauvegarde nécessaire (chapitre 16).

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un RTO/RPO ambitieux non testé reste une promesse non tenue</span>
Annoncer un RTO de 4 heures sans jamais avoir testé une reconstruction complète en conditions réelles est un pari risqué — un exercice de PRA grandeur nature (au moins annuel) sur les sites critiques (chapitre 30, 36) est indispensable pour valider que les délais annoncés sont réellement atteignables.
</div>

## 25.7 Plan de continuité d'activité (PCA)

<div class="encadre astuce">
<span class="encadre-titre">💡 Le PCA répond à la question : comment continuer à fonctionner PENDANT l'incident ?</span>
Contrairement au PRA (reconstruction après incident), le PCA définit les mécanismes de continuité immédiate pendant l'incident lui-même : basculement automatique vers un site de secours, procédures dégradées manuelles temporaires (accueil physique sans système informatique disponible, par exemple), priorisation des fonctions vitales à maintenir coûte que coûte (urgences d'un hôpital, chapitre 28 ; transactions bancaires critiques, chapitre 30).
</div>

## 25.8 Alignement avec les bonnes pratiques ITIL

<div class="encadre astuce">
<span class="encadre-titre">💡 ITIL structure la gestion des changements, incidents et configurations</span>
Sans reproduire l'intégralité du référentiel ITIL, ce manuel retient trois pratiques directement applicables à un projet réseau : la **gestion des configurations** (dossier d'architecture à jour, section 25.3), la **gestion des changements** (toute modification significative documentée et validée avant application, jamais en production directe sans traçabilité), et la **gestion des incidents** (procédure d'escalade documentée, section 25.5, alimentée par la supervision du chapitre 24).
</div>

## 25.9 Checklist documentaire finale par projet

<div class="encadre astuce">
<span class="encadre-titre">💡 Checklist de clôture documentaire, appliquée à chacun des onze projets de la Partie 11</span>

- [ ] Cahier des charges validé et archivé.
- [ ] Schémas logique et physique à jour (Mermaid/Visio/Draw.io).
- [ ] Plan d'adressage complet documenté.
- [ ] Inventaire matériel complet avec numéros de série et garanties.
- [ ] Configurations des équipements exportées et versionnées.
- [ ] Rapports de certification du câblage archivés.
- [ ] Documentation d'exploitation rédigée et transmise à l'équipe concernée.
- [ ] PRA/PCA rédigés, avec RTO/RPO définis et testés au moins une fois.
</div>

## 25.10 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Documenter uniquement l'état initial, sans mise à jour lors des évolutions ultérieures</span>
Un dossier d'architecture figé au jour de la livraison, jamais mis à jour lors d'évolutions ultérieures (ajout de VLAN, changement d'équipement), devient rapidement trompeur et dangereux — il induit en erreur lors d'une intervention future basée sur une documentation obsolète. La mise à jour documentaire doit faire partie intégrante de chaque changement, pas une tâche différée "à faire plus tard".
</div>

## 25.11 Bonnes pratiques

- Documenter au fur et à mesure du projet, jamais entièrement a posteriori en fin de chantier.
- Tester réellement le PRA (reconstruction) et le PCA (continuité) au moins annuellement sur les sites critiques.
- Verser le dossier d'architecture dans un dépôt versionné, pour tracer l'historique des évolutions.

## 25.12 Résumé du chapitre

- Le cahier des charges cadre le projet en amont ; le dossier d'architecture documente la solution technique complète.
- Le PRA répond à "comment reconstruire après sinistre", le PCA à "comment continuer pendant l'incident" — deux documents complémentaires et distincts.
- Les bonnes pratiques ITIL (gestion des configurations, des changements, des incidents) structurent la documentation d'exploitation courante.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 25.1</span>

Un hôpital (chapitre 28) définit un RTO de 15 minutes pour son système d'urgence informatisé. Quelles implications concrètes cela a-t-il sur l'architecture technique et les sauvegardes ?
</div>

**Corrigé :**
Un RTO de 15 minutes exclut une restauration manuelle classique depuis une sauvegarde froide — il impose une **haute disponibilité active** (redondance de serveurs, chapitre 14 ; VRRP/HSRP réseau, chapitre 11) avec basculement automatique quasi instantané, plutôt qu'un simple PRA de reconstruction, qui prendrait objectivement plus de 15 minutes dans la quasi-totalité des scénarios réels.

*Chapitre suivant : les onze projets complets, mettant en pratique l'ensemble des notions du manuel.*
