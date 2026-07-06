<div class="chapitre-titre-num">CHAPITRE 5</div>

# Analyse des besoins

## Objectifs pédagogiques

Structurer une visite technique et un audit d'existant, réaliser un inventaire complet, et estimer une croissance future avant toute conception technique.

## Prérequis

Chapitres 1-4.

## 5.1 Pourquoi l'analyse des besoins conditionne tout le reste

<div class="encadre astuce">
<span class="encadre-titre">💡 Le principe fondamental de tout projet d'intégration réseau</span>
Aucune conception technique (Partie 3), aucun choix de matériel (chapitre 4) ne devrait précéder une analyse rigoureuse des besoins réels du client. Un réseau surdimensionné gaspille le budget ; un réseau sous-dimensionné échoue en production et coûte plus cher à corriger après coup qu'à bien concevoir dès le départ.
</div>

## 5.2 La visite technique

Objectifs d'une visite technique sur site :

1. Relever les dimensions et l'agencement réel des locaux (souvent différents des plans théoriques fournis).
2. Identifier les contraintes physiques : présence de faux plafonds, gaines techniques existantes, matériaux (béton armé atténuant le Wi-Fi, cloisons amovibles).
3. Localiser l'arrivée de la fibre/ADSL du fournisseur d'accès Internet.
4. Repérer les zones à risque (humidité, poussière industrielle en usine, chapitre 33) influençant le choix des équipements (indices IP/IK, chapitre 20).
5. Photographier systématiquement chaque local technique, chaque cheminement de câbles existant.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais concevoir uniquement à partir de plans fournis par le client</span>
Les plans architecturaux datent souvent de la construction du bâtiment et ne reflètent pas les cloisons ajoutées, les faux plafonds abaissés, ou les zones désormais inaccessibles — une visite technique physique reste indispensable, même lorsque des plans numériques détaillés sont disponibles.
</div>

## 5.3 L'audit de l'existant

Lorsqu'un réseau existant doit être repris ou étendu, l'audit doit couvrir :

- **Inventaire des équipements actifs** : marque, modèle, âge, fin de vie/support constructeur (EOL/EOS).
- **Câblage existant** : catégorie, état, résultats de certification si disponibles (chapitre 8).
- **Plan d'adressage actuel** : VLAN existants, chevauchements éventuels, adresses statiques non documentées.
- **Politiques de sécurité en place** : règles firewall, accès Wi-Fi, comptes administrateurs partagés (souvent un point faible identifié dès l'audit, approfondi au chapitre 16).
- **Performance actuelle mesurée** : taux d'utilisation de la bande passante, latence, taux d'erreurs sur les liens.

## 5.4 Inventaire quantitatif du besoin

<div class="encadre astuce">
<span class="encadre-titre">💡 Chaque chiffre de cet inventaire alimente directement la conception (Partie 3)</span>
Le nombre d'utilisateurs détermine le nombre de ports switch nécessaires ; le nombre de bâtiments détermine la topologie WAN/MAN ; le nombre de caméras détermine le dimensionnement du réseau vidéosurveillance (chapitre 21) et du stockage NVR (chapitre 22).
</div>

Grille type d'inventaire à faire remplir ou constater sur site :

| Élément | Quantité actuelle | Quantité prévue (croissance) |
|---|---|---|
| Utilisateurs (postes de travail) | | |
| Bâtiments / sites | | |
| Imprimantes réseau | | |
| Téléphones IP | | |
| Caméras de vidéosurveillance | | |
| Serveurs physiques | | |
| Postes en Wi-Fi (mobilité) | | |
| Salles de réunion équipées (visioconférence) | | |

## 5.5 Prévision de croissance

<div class="encadre astuce">
<span class="encadre-titre">💡 Règle de dimensionnement standard en intégration réseau</span>
Une marge de croissance de 20 à 30 % sur trois à cinq ans est une pratique courante pour le nombre de ports switch, la capacité Wi-Fi, et l'espace d'adressage IP (rappel du VLSM, chapitre 3) — évite une refonte prématurée coûteuse, sans pour autant sur-investir sur un horizon trop lointain et incertain.
</div>

Facteurs à interroger auprès du client :

- Croissance prévue des effectifs sur 3 à 5 ans.
- Projets d'extension ou de nouveaux bâtiments déjà planifiés.
- Évolutions technologiques anticipées (passage à la téléphonie IP, extension de la vidéosurveillance, migration cloud).

## 5.6 Livrable de ce chapitre : la fiche de collecte

Chaque projet de la Partie 11 s'appuie sur une fiche de collecte structurée de ce type, remplie en amont de la conception :

```
FICHE DE COLLECTE - ANALYSE DES BESOINS
========================================
Client : ___________________
Type d'etablissement : ___________________
Nombre de batiments : ___
Nombre d'etages par batiment : ___
Nombre d'utilisateurs actuels / prevus : ___ / ___
Nombre de postes fixes : ___
Nombre de postes mobiles (Wi-Fi) : ___
Nombre de telephones IP : ___
Nombre de cameras de videosurveillance : ___
Nombre de serveurs physiques/virtuels : ___
Applications metier critiques : ___________________
Contraintes horaires (24/7, horaires de bureau) : ___________________
Budget indicatif : ___________________
Delai souhaite : ___________________
Contraintes reglementaires (banque, sante...) : ___________________
```

## 5.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Se fier uniquement aux chiffres donnés par le client sans vérification terrain</span>
Un client annonce souvent un effectif "administratif" sans compter les postes partagés, les imprimantes réseau, les bornes Wi-Fi invités ou les équipements de vidéosurveillance déjà en projet séparé — croiser systématiquement les chiffres annoncés avec un comptage physique lors de la visite technique.
</div>

## 5.8 Bonnes pratiques

- Toujours documenter la visite technique par des photos datées et un plan annoté, archivés avec le dossier d'architecture (chapitre 25).
- Faire valider par écrit la fiche de collecte par le client avant de passer à la conception — elle engage les deux parties sur le périmètre du projet.
- Anticiper systématiquement une marge de croissance de 20 à 30 % plutôt que de dimensionner au plus juste.

## 5.9 Résumé du chapitre

- L'analyse des besoins précède toujours la conception technique, jamais l'inverse.
- La visite technique et l'audit de l'existant révèlent des contraintes invisibles sur plan.
- L'inventaire quantitatif chiffré et la prévision de croissance alimentent directement le dimensionnement des chapitres suivants.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 5.1</span>

Un client annonce 150 employés actuels avec un projet de croissance à 200 employés sous 3 ans. Combien de ports switch faudrait-il prévoir au minimum, en tenant compte d'une marge de croissance de 25 % sur le chiffre final prévu, et en ajoutant 10 % de ports pour imprimantes/téléphones IP/bornes Wi-Fi ?
</div>

**Corrigé :**
200 employés × 1,25 (marge de croissance) = 250 ports pour les postes. + 10 % pour équipements annexes (25 ports) = **275 ports minimum** à prévoir, à répartir sur plusieurs switches empilables (chapitre 10).

*Chapitre suivant : la conception logique du réseau (VLAN, plan IP, QoS, ACL, haute disponibilité).*
