<div class="chapitre-titre-num">CHAPITRE 8</div>

# Appliquer le calcul IP à un vrai projet

## Objectifs pédagogiques

Dérouler la méthode complète de conception d'un plan IP, du recensement des besoins jusqu'au tableau final vérifié — en articulant tout ce qui a été appris dans ce volume (masques, CIDR, VLSM, DHCP) sur un cas concret représentatif d'un vrai projet de PME. Ce chapitre sert de pont direct vers le Volume 4 (conception du plan IP et des VLAN), qui généralisera la méthode.

## Prérequis

Chapitres 4-7.

## 8.1 Le cas d'étude de ce chapitre

**Client** : une entreprise de **80 employés**, répartie sur **2 étages** d'un même bâtiment. Un service **comptabilité** de 10 personnes doit être isolé du reste des utilisateurs pour des raisons de confidentialité financière. L'entreprise utilise la téléphonie sur IP (**VoIP**), un **Wi-Fi corporate** (postes et téléphones du personnel) et un **Wi-Fi invité** pour les visiteurs, **15 caméras** de vidéosurveillance IP, **3 serveurs** (fichiers, applicatif, sauvegarde), et un système de **contrôle d'accès par badge** (5 lecteurs) à l'entrée principale et aux zones sensibles. Une croissance de **30 % sur 3 ans** est anticipée par la direction.

## 8.2 Étape 1 — Recenser les besoins réels en nombre d'hôtes

Chaque groupe d'appareils qui doit être isolé (chapitre 2.9) devient une ligne de ce tableau — jamais l'inverse (ne jamais partir d'un découpage IP arbitraire, toujours partir des besoins métier réels).

| Groupe | Effectif actuel | Avec marge de croissance 30 % |
|---|---|---|
| Équipements réseau (management) | ~12 (switches, AP, routeur, firewall, NVR...) | ~16 |
| Utilisateurs (hors comptabilité) | 70 postes | ~91 |
| Comptabilité (isolé) | 10 postes | ~13 |
| Serveurs (+ interfaces de gestion) | 3 serveurs, ~7 interfaces au total (iLO/iDRAC, NAS, hyperviseur) | ~9 |
| VoIP (un téléphone par employé) | 80 téléphones | ~104 |
| Wi-Fi corporate (plusieurs appareils par employé) | ~150 appareils estimés | ~195 |
| Wi-Fi invité | jusqu'à 50 simultanés | inchangé (plafond volontaire) |
| CCTV (caméras + NVR) | 16 | ~21 |
| Contrôle d'accès (badges) | 5 lecteurs + 1 centrale | ~8 |

<div class="encadre astuce">
<span class="encadre-titre">💡 Toujours recenser AVANT de choisir des tailles de bloc</span>
L'erreur de débutant la plus fréquente est d'ouvrir directement une calculatrice de subnetting sans avoir d'abord écrit ce tableau. Sans lui, impossible de justifier pourquoi un VLAN reçoit un `/25` plutôt qu'un `/27` — et impossible de répondre correctement, plus tard, à un client qui demande "pourquoi ce choix ?" (compétence explicitement attendue par ce manuel, §51 du cahier des charges pédagogique).
</div>

## 8.3 Étape 2 — Choisir le bloc de départ et sa convention

Ce manuel adopte, à partir de ce chapitre et pour l'ensemble des projets du Volume 16, une **convention standard** : un bloc privé `10.10.0.0/16` (65 536 adresses), avec le **troisième octet réservé à l'identifiant du VLAN** — chaque VLAN reçoit ainsi un "emplacement" mémorisable de la forme `10.10.<VLAN>.0`.

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi ne pas faire du VLSM serré comme au chapitre 5 ici</span>
Le VLSM serré du chapitre 5 est indispensable quand le bloc de départ est **rare** (un `/24` à répartir entre plusieurs besoins). Ici, le bloc de départ est un `/16` privé — 65 536 adresses pour une entreprise de 80 personnes, aucune rareté à gérer. Dans ce contexte, la **lisibilité humaine** (retrouver instantanément que `10.10.80.x` est forcément une caméra, VLAN 80) l'emporte sur l'économie d'adresses : chaque VLAN se voit réserver un emplacement de type `/24` dans le troisième octet, même si son besoin réel est bien plus petit — le masque réellement appliqué à l'intérieur de cet emplacement reste, lui, dimensionné au plus juste (VLSM au niveau de l'hôte, pas au niveau du VLAN). Sur un projet où l'espace d'adressage privé serait au contraire contraint (rare en pratique, mais possible sur une interconnexion multi-sites complexe, Volume 16 Projet 5), le VLSM serré du chapitre 5 redevient la bonne méthode.
</div>

## 8.4 Étape 3 — Identifiants VLAN : laisser des trous, pas une suite continue

Ce manuel utilise une **numérotation VLAN standard**, reprise sur l'ensemble des projets à venir :

| VLAN | Nom |
|---|---|
| 10 | Management |
| 20 | Utilisateurs |
| 30 | Serveurs |
| 40 | VoIP |
| 50 | Wi-Fi Corporate |
| 60 | Wi-Fi Invité |
| 70 | IoT |
| 80 | CCTV |
| 90 | Sécurité (contrôle d'accès, alarme) |

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi 10, 20, 30... et pas 1, 2, 3...</span>
Espacer les identifiants VLAN de 10 en 10 (plutôt que 1, 2, 3, 4...) laisse la place d'insérer un futur VLAN entre deux existants sans jamais devoir renuméroter ceux déjà en production — un renumérotage de VLAN sur un réseau en exploitation est une opération lourde et risquée (implique de reconfigurer chaque port, chaque trunk, chaque règle de firewall qui le référence). Dans ce projet, le besoin d'isoler la Comptabilité n'était pas prévu dans le schéma standard ci-dessus : il s'insère naturellement en **VLAN 25**, entre Management (10) et Utilisateurs (20)/Serveurs (30), sans toucher à aucun des VLAN déjà définis.
</div>

Ce projet utilise donc **VLAN 25 — Comptabilité**, en plus des neuf VLAN standards ci-dessus (le VLAN 70 IoT restant réservé mais non déployé, faute d'objets connectés dans ce projet — l'emplacement `10.10.70.0/24` reste néanmoins bloqué pour un usage futur, jamais réattribué à autre chose).

## 8.5 Étape 4 — Dimensionner chaque VLAN (VLSM au niveau de l'hôte)

Pour chaque VLAN, on applique la méthode du chapitre 4.4 : choisir le plus petit CIDR qui couvre le besoin avec marge de croissance (colonne 3 du tableau 8.2).

| VLAN | Nom | Besoin (marge incluse) | CIDR choisi | Bloc | Plage utilisable |
|---|---|---|---|---|---|
| 10 | Management | ~16 | /27 (30 dispo) | 10.10.10.0/27 | .1 à .30 |
| 20 | Utilisateurs | ~91 | /25 (126 dispo) | 10.10.20.0/25 | .1 à .126 |
| 25 | Comptabilité | ~13 | /27 (30 dispo) | 10.10.25.0/27 | .1 à .30 |
| 30 | Serveurs | ~9 | /27 (30 dispo) | 10.10.30.0/27 | .1 à .30 |
| 40 | VoIP | ~104 | /25 (126 dispo) | 10.10.40.0/25 | .1 à .126 |
| 50 | Wi-Fi Corporate | ~195 | /24 (254 dispo) | 10.10.50.0/24 | .1 à .254 |
| 60 | Wi-Fi Invité | 50 (plafond) | /26 (62 dispo) | 10.10.60.0/26 | .1 à .62 |
| 70 | IoT (réservé) | 0 (futur) | /24 réservé, non attribué | 10.10.70.0/24 | — |
| 80 | CCTV | ~21 | /26 (62 dispo, large marge caméras futures) | 10.10.80.0/26 | .1 à .62 |
| 90 | Sécurité | ~8 | /28 (14 dispo) | 10.10.90.0/28 | .1 à .14 |

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi CCTV reçoit une marge plus large que ses 21 hôtes ne l'exigent strictement</span>
Un `/27` (30 disponibles) aurait techniquement suffi pour 21 caméras. Le choix d'un `/26` (62 disponibles) anticipe une caractéristique propre à la vidéosurveillance, développée au Volume 12 : le nombre de caméras d'un site tend à augmenter significativement au fil des années (zones initialement jugées "non prioritaires" finissant presque toujours par être couvertes), bien plus que la plupart des autres VLAN de ce tableau.
</div>

## 8.6 Étape 5 — Vérifier l'absence de chevauchement

Grâce à la convention "troisième octet = VLAN" (8.3), la vérification devient triviale : chaque VLAN occupe un troisième octet **différent** (10, 20, 25, 30, 40, 50, 60, 70, 80, 90) — aucun chevauchement possible par construction, contrairement au VLSM serré du chapitre 5 où cette vérification exigeait un calcul explicite plage par plage.

## 8.7 Étape 6 — Décider de la méthode d'attribution par VLAN

En s'appuyant sur la règle du chapitre 6.3 :

| VLAN | Méthode d'attribution |
|---|---|
| Management | Statique (chaque équipement réseau configuré manuellement) |
| Utilisateurs, Comptabilité, Wi-Fi Corporate, Wi-Fi Invité | Dynamique (plage DHCP standard) |
| Serveurs | Statique |
| VoIP | Réservation DHCP (par adresse MAC de chaque téléphone) |
| CCTV | Réservation DHCP (par adresse MAC de chaque caméra) |
| Sécurité | Statique (peu d'équipements, criticité élevée) |

## 8.8 Étape 7 — Décision IPv6

Conformément au choix pragmatique documenté au chapitre 7.1, ce projet reste en **IPv4 pur** : aucun fournisseur d'accès local ni aucun des équipements retenus (Volume 5) n'exige IPv6 pour fonctionner correctement, et l'ajout d'un plan IPv6 parallèle n'apporterait ici aucun bénéfice concret face à la complexité opérationnelle supplémentaire qu'il introduirait. Cette décision est documentée explicitement dans le dossier de projet (Volume 15) plutôt que simplement omise.

## 8.9 Laboratoire — appliquer la méthode à un second cas

Applique la méthode complète (étapes 1 à 7) au cas suivant, et produis ton propre tableau final : une clinique privée de 25 employés sur un seul niveau, avec un service d'imagerie médicale nécessitant un VLAN isolé pour ses 6 postes (confidentialité des dossiers patients), une salle d'attente avec Wi-Fi invité, 8 caméras de surveillance aux entrées et couloirs, 2 serveurs (dossiers patients, facturation), et 10 équipements réseau à gérer. Aucune croissance significative n'est anticipée par la direction sur les 3 prochaines années.

## 8.10 Laboratoire complet — Cisco Packet Tracer

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi Packet Tracer pour ce laboratoire précis</span>
Packet Tracer (Cisco, gratuit) est l'outil recommandé pour ce laboratoire car il simule fidèlement l'attribution d'adresses IP, le calcul de sous-réseau et la connectivité de base — sans nécessiter de matériel réel ni la puissance d'un GNS3/EVE-NG (réservés aux Volumes 8-9, où de vrais processus de routage dynamique et des images de firewall tierces sont nécessaires).
</div>

**Quoi installer** : Cisco Packet Tracer (dernière version stable).
**Où télécharger** : compte gratuit sur la Cisco Networking Academy (`netacad.com`), section "Packet Tracer" — le logiciel est proposé sans frais après inscription.
**Comment installer** : exécuter l'installateur téléchargé, accepter les paramètres par défaut ; aucune configuration système particulière au-delà des prérequis affichés par l'installateur.
**Machine/VM à créer** : aucune VM nécessaire — Packet Tracer s'installe directement sur le poste de travail (Windows, macOS ou Linux).
**RAM/CPU** : 4 Go de RAM et un CPU double cœur suffisent largement pour une topologie de cette taille.

**Topologie à construire** :

```{.uml}
[ PC1 ]---[ Switch2960 ]---[ Routeur 1941 ]
[ PC2 ]---/
[ Serveur-DHCP ]---/
```

**Adresses IP à utiliser** : reprendre le plan du chapitre 8.5 (VLAN 20 Utilisateurs, `10.10.20.0/25`) — attribuer `10.10.20.1` au routeur (passerelle), `10.10.20.10` au serveur DHCP simulé, laisser PC1 et PC2 en obtention automatique.

**Commandes à exécuter** (sur le routeur, en mode simulation Packet Tracer, terminal CLI) :

```
Router> enable
Router# configure terminal
Router(config)# interface gigabitEthernet0/0
Router(config-if)# ip address 10.10.20.1 255.255.255.128
Router(config-if)# no shutdown
```

**Tests à réaliser** : sur chaque PC, ouvrir l'invite de commande simulée et exécuter `ipconfig` — confirmer que l'adresse obtenue appartient bien à `10.10.20.0/25` ; exécuter `ping 10.10.20.1` depuis chaque PC pour confirmer la joignabilité de la passerelle. Utiliser ensuite le mode "Simulation" de Packet Tracer (plutôt que "Temps réel") pour observer, paquet par paquet, le déroulement du processus DORA (chapitre 6.1) entre un PC et le serveur DHCP simulé — une visualisation directe de la théorie du chapitre 6.

## Résumé du chapitre

La méthode complète, réutilisée pour chaque projet du Volume 16 : (1) recenser les besoins réels par groupe à isoler, avec marge de croissance ; (2) choisir un bloc de départ et sa convention (troisième octet = VLAN, si l'espace d'adressage privé est abondant) ; (3) attribuer des identifiants VLAN espacés, en réservant des trous pour l'avenir ; (4) dimensionner chaque VLAN au plus juste avec marge (VLSM au niveau de l'hôte) ; (5) vérifier l'absence de chevauchement ; (6) décider de la méthode d'attribution par VLAN ; (7) statuer explicitement sur IPv6, même si la décision est de ne pas le déployer.

*Fin du Volume 2. Chapitre suivant : l'étude de site professionnelle — la première étape de tout projet réel, avant même de penser à un seul VLAN.*
