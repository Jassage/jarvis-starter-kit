<div class="chapitre-titre-num">CHAPITRE 13</div>

# Comment choisir un switch

## Objectifs pédagogiques

Apprendre à **calculer** les caractéristiques nécessaires d'un switch pour un projet donné — nombre de ports, budget PoE, capacité de commutation, uplinks — plutôt qu'à choisir une référence commerciale au hasard ou par habitude.

## Prérequis

Volumes 1-4.

## 13.1 La méthode générale : caractéristiques avant modèles

Ce chapitre, comme les trois suivants, ne recommande **aucune marque en priorité** : il donne pour chaque critère la méthode de calcul qui produit une **caractéristique minimale exacte**, à partir de laquelle un modèle réel (Cisco, MikroTik, Ubiquiti, Aruba, Netgear, TP-Link, D-Link, selon le budget et l'écosystème du projet) se choisit en toute connaissance de cause — jamais l'inverse.

## 13.2 Nombre de ports : la méthode de calcul

**Méthode** : recenser tous les points à raccorder physiquement à ce switch précis (pas au réseau entier), ajouter une marge de croissance (chapitre 8, généralement 20 à 30 %), puis arrondir **au modèle standard immédiatement supérieur** (les switches se vendent en 8, 16, 24 ou 48 ports — jamais en 19 ou 27 ports).

**Exemple** : un switch d'accès dessert 21 postes de travail + 1 imprimante réseau + 2 bornes Wi-Fi = 24 points. Avec une marge de 20 %, cela donne 28,8, arrondi à 29 — le modèle standard immédiatement supérieur est donc un **switch 32 ports** s'il existe dans la gamme visée, ou plus réalistement un **switch 48 ports** (le palier standard suivant après 24, la plupart des fabricants ne proposant pas de palier à 32 en gamme entreprise).

<div class="encadre astuce">
<span class="encadre-titre">💡 Toujours réserver des ports pour les uplinks dans ce calcul</span>
Le nombre de ports calculé ci-dessus couvre les appareils finaux (postes, AP, imprimantes) — il faut **ajouter** les ports d'uplink nécessaires (13.5) au total avant d'arrondir au modèle standard, sous peine de découvrir sur site qu'il ne reste plus de port libre pour relier le switch au reste du réseau.
</div>

## 13.3 PoE : quand est-il nécessaire, et sous quelle forme

Le PoE (chapitre 2.12) n'est nécessaire que si des appareils alimentés par le câble réseau seront réellement branchés sur ce switch précis — bornes Wi-Fi, caméras IP, téléphones IP, certains contrôleurs d'accès. Trois standards existent, chacun avec une puissance maximale par port différente :

| Standard | Nom courant | Puissance max par port |
|---|---|---|
| 802.3af | PoE | 15,4 W |
| 802.3at | PoE+ | 30 W |
| 802.3bt (type 3/4) | PoE++ / UPOE | 60 à 90 W |

**Méthode de choix du standard** : identifier la consommation maximale du plus gourmand des appareils PoE prévus sur ce switch (une caméra PTZ avec chauffage peut dépasser 30 W, une caméra fixe simple consomme rarement plus de 12-15 W, un téléphone IP standard 5-7 W, une borne Wi-Fi moderne 15-25 W) — le standard retenu doit couvrir cette valeur avec marge.

## 13.4 Le budget PoE total : ne jamais se limiter à la puissance par port

Au-delà de la puissance maximale **par port**, chaque switch PoE a un **budget PoE total** limité (souvent 190 W, 370 W, 740 W selon la gamme) — la somme de ce que tous les ports PoE actifs peuvent consommer **simultanément**.

**Méthode de calcul** :

```
Budget PoE necessaire = somme de la consommation maximale
                         de chaque appareil PoE prevu
                         x marge de securite (generalement 1.2)
```

**Exemple** : un switch alimente 20 caméras IP (8 W chacune en moyenne, pointes à 10 W) + 2 bornes Wi-Fi (20 W chacune). Calcul : (20 × 10) + (2 × 20) = 200 + 40 = 240 W, puis × 1,2 de marge = **288 W minimum de budget PoE** — un switch annoncé à 190 W de budget PoE serait insuffisant, même si chaque port pris individuellement respecte la limite par port.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un switch PoE peut couper certains ports si le budget total est dépassé</span>
Un switch dont le budget PoE total est dépassé ne "partage" pas équitablement la puissance restante entre tous les ports — il coupe purement et simplement l'alimentation des derniers ports activés (ou selon leur priorité configurée), un scénario de dépannage réel couvert au chapitre 43 ("switch PoE surchargé"). Sous-dimensionner le budget PoE au moment de l'achat crée un problème qui n'apparaît souvent qu'après l'ajout d'un appareil supplémentaire, des mois après l'installation initiale.
</div>

## 13.5 Les uplinks : séparer le trafic montant du trafic d'accès

Un **uplink** est le ou les ports dédiés à relier ce switch d'accès vers le switch de distribution ou le switch cœur (chapitre 3.4) — jamais un simple port d'accès utilisé "aussi" pour cet usage. **Méthode** : prévoir au minimum 2 uplinks (pour permettre l'agrégation LACP, chapitre 21, et la redondance), de préférence en **SFP/SFP+** (13.6) plutôt qu'en cuivre, même sur un switch d'accès à port cuivre pour le reste.

## 13.6 SFP et SFP+ : quand utiliser la fibre plutôt que le cuivre

Un **port SFP** (1 Gbit/s) ou **SFP+** (10 Gbit/s) accueille un module optique interchangeable, permettant de choisir la portée exacte nécessaire (multimode courte distance, monomode longue distance) sans changer le switch lui-même. **Méthode de choix** :

- **Cuivre (RJ45)** : suffisant jusqu'à 100 m (chapitre 2.10), le choix par défaut pour tout raccordement standard.
- **SFP (1G) fibre** : nécessaire au-delà de 100 m, ou entre deux bâtiments, sans besoin de débit supérieur à 1 Gbit/s sur ce lien précis.
- **SFP+ (10G) fibre ou cuivre DAC** : nécessaire sur les uplinks vers le switch cœur d'un réseau chargé (nombreux VLAN, beaucoup de trafic vidéosurveillance agrégé, Volume 12), où 1 Gbit/s deviendrait un goulot d'étranglement.

## 13.7 La vitesse des ports d'accès

| Vitesse | Usage typique |
|---|---|
| 100 Mbit/s (Fast Ethernet) | Obsolète pour un nouveau projet — à éviter sauf contrainte budgétaire extrême sur un usage très limité (un vieux contrôle d'accès, par exemple) |
| 1 Gbit/s | Standard actuel pour la quasi-totalité des ports d'accès (postes, AP, caméras) |
| 2,5 Gbit/s (multi-gig) | Bornes Wi-Fi 6/6E récentes dont le débit radio agrégé dépasse 1 Gbit/s |
| 10 Gbit/s | Serveurs, uplinks de switches fortement chargés, jamais nécessaire sur un simple poste de travail bureautique |

## 13.8 La capacité de commutation (switching capacity) : vérifier l'absence de goulot interne

La **capacité de commutation** (souvent annoncée en Gbit/s dans la fiche technique) est le débit total que le circuit interne du switch (le "backplane") peut réellement traiter, tous ports confondus. **Méthode de vérification** : additionner le débit maximal théorique de tous les ports du switch, comparer au chiffre annoncé de capacité de commutation.

**Exemple** : un switch 24 ports à 1 Gbit/s + 4 uplinks SFP+ à 10 Gbit/s a un débit total théorique de (24 × 1) + (4 × 10) = 64 Gbit/s en réception, doublé en bidirectionnel (émission + réception simultanées) = 128 Gbit/s. Un switch annoncé avec une capacité de commutation de seulement 56 Gbit/s serait **oversubscribed** (sous-dimensionné en interne) — un compromis souvent acceptable en pratique (tous les ports n'étant jamais simultanément à pleine charge), mais qui doit être une décision consciente, jamais une découverte après coup.

## 13.9 VLAN, STP et LACP : des fonctionnalités, pas juste des cases à cocher

Vérifier explicitement, avant l'achat, que le switch envisagé supporte réellement les trois fonctionnalités suivantes (jamais supposées présentes, en particulier sur l'entrée de gamme "non manageable" ou "smart") — leur configuration complète est couverte au Volume 7 :

- **VLAN 802.1Q** (chapitre 12) : nombre maximal de VLAN supportés simultanément (souvent 4094 en théorie, mais parfois limité en pratique sur l'entrée de gamme — à vérifier sur la fiche technique) ;
- **Spanning Tree (STP/RSTP)** (chapitre 22) : indispensable dès qu'un réseau comporte plus d'un chemin possible entre deux switches (redondance), pour éviter une boucle réseau ;
- **LACP** (chapitre 21) : nécessaire pour agréger plusieurs liens physiques en un seul lien logique plus large et redondant.

## 13.10 Sécurité : les fonctionnalités à vérifier

- **Port Security** (chapitre 23) : limiter le nombre d'adresses MAC autorisées par port ;
- **DHCP Snooping** (chapitre 23) : bloquer un serveur DHCP non autorisé branché par erreur ou malveillance ;
- **Accès de management sécurisé** : SSH disponible (jamais Telnet en production, chapitre 2.5), idéalement HTTPS plutôt que HTTP pour l'interface web si le switch en propose une.

## 13.11 Managed, smart (web-managed) ou unmanaged : ne jamais confondre les trois

| Catégorie | VLAN | STP | LACP | Sécurité avancée | Usage recommandé dans ce manuel |
|---|---|---|---|---|---|
| **Unmanaged** | Non | Non | Non | Non | Jamais sur un projet professionnel de ce manuel — aucune des fonctionnalités des Volumes 4, 7, 12 et 13 n'est disponible |
| **Smart / web-managed** | Limité | Parfois | Parfois | Limité | Acceptable uniquement sur un très petit projet à budget très contraint, avec des réserves documentées explicitement |
| **Fully managed (CLI + SNMP)** | Oui | Oui | Oui | Oui | Le standard de ce manuel pour tout projet professionnel, du Volume 16 Projet 1 au Projet 6 |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un switch "smart" n'est pas un switch manageable au sens de ce manuel</span>
De nombreux switches d'entrée de gamme grand public affichent "VLAN" sur leur emballage, mais avec des limitations sévères (pas de trunk 802.1Q complet, VLAN par port uniquement sans vraie gestion des tags, pas de CLI, pas de SSH). Toujours vérifier la fiche technique complète — jamais l'appellation marketing seule — avant de retenir un modèle pour un projet qui doit implémenter les Volumes 7, 12 ou 13 de ce manuel.
</div>

## 13.12 Laboratoire — dimensionner un switch d'accès réel

Un étage de bureau doit accueillir : 18 postes de travail, 18 téléphones IP (PoE, 6 W chacun), 1 imprimante réseau, 2 bornes Wi-Fi PoE (20 W chacune). Calcule : (1) le nombre de ports nécessaire avec une marge de 25 %, en réservant 2 ports d'uplink ; (2) le standard PoE minimal requis par port ; (3) le budget PoE total nécessaire avec une marge de sécurité de 1,2.

**Corrigé :**
1. Points à raccorder : 18 + 18 + 1 + 2 = 39, + 2 uplinks = 41. Avec 25 % de marge sur la partie accès (39 × 1,25 ≈ 49) + 2 uplinks ≈ 51 → modèle standard immédiatement supérieur : **switch 48 ports** (en pratique, un second petit switch ou un modèle 48 ports avec un peu de marge consommée dès l'installation — à documenter comme limite acceptée).
2. Le téléphone IP (6 W) et la borne Wi-Fi (20 W) rentrent dans le standard **802.3af (PoE, 15,4 W max)** pour les téléphones, mais la borne à 20 W dépasse ce standard : il faut au minimum du **802.3at (PoE+, 30 W)** sur les ports qui alimentent les bornes.
3. Budget PoE : (18 × 6) + (2 × 20) = 108 + 40 = 148 W, × 1,2 = **177,6 W minimum de budget PoE total**.

## Résumé du chapitre

Le choix d'un switch se calcule, critère par critère, à partir des besoins réels du projet : nombre de ports (recensement + marge, arrondi au palier standard), standard PoE par port et budget PoE total (calcul de la consommation cumulée), uplinks dédiés en SFP/SFP+, capacité de commutation suffisante pour éviter l'oversubscription, support réel (pas seulement marketing) du VLAN 802.1Q, du STP et du LACP, et des fonctionnalités de sécurité de base — un switch "unmanaged" ou "smart" limité n'est jamais retenu pour un projet professionnel de ce manuel.

*Chapitre suivant : comment choisir un routeur et un firewall.*
