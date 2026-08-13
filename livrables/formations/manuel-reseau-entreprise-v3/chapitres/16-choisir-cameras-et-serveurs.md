<div class="chapitre-titre-num">CHAPITRE 16</div>

# Comment choisir des caméras et des serveurs

## Objectifs pédagogiques

Choisir le type et les caractéristiques d'une caméra IP selon son emplacement et son objectif réel, et dimensionner un serveur selon son rôle — deux compétences de sélection matérielle qui préparent respectivement le Volume 12 (vidéosurveillance) et le Volume 11 (serveurs).

## Prérequis

Chapitres 2, 13.

## 16.1 Choisir le type de caméra selon l'emplacement et l'objectif

| Type | Apparence | Cas d'usage |
|---|---|---|
| **Dôme** | Discrète, boîtier arrondi au plafond, angle de vue difficile à deviner de l'extérieur | Intérieur, réception, open space — discrétion recherchée |
| **Bullet (tube)** | Visible, orientée de façon évidente | Extérieur, entrées, parkings — l'effet dissuasif de sa visibilité fait partie de l'objectif |
| **PTZ (Pan-Tilt-Zoom)** | Motorisée, orientable et zoomable à distance | Grande zone nécessitant une surveillance active par un opérateur (parking étendu, entrepôt), jamais pour une simple surveillance passive enregistrée en continu (une zone fixe est mieux couverte par plusieurs caméras fixes à moindre coût) |
| **Fisheye (360°)** | Objectif très grand angle, vue panoramique déformée puis corrigée logiciellement | Grande salle ouverte, plafond central — remplace parfois 3 à 4 caméras fixes classiques |

## 16.2 Choisir la résolution selon l'objectif réel

<div class="encadre astuce">
<span class="encadre-titre">💡 Trois objectifs différents, trois besoins de résolution différents</span>
La résolution nécessaire dépend entièrement de ce que la caméra doit permettre de faire, pas d'une préférence générale pour "la meilleure qualité possible" (qui gonfle inutilement le coût du stockage, chapitre 34) :

- **Surveillance générale** (constater qu'un événement a eu lieu, sans devoir identifier un visage) : résolution modeste suffisante (2 mégapixels / 1080p).
- **Détection** (repérer qu'une personne ou un véhicule est présent dans la zone) : résolution intermédiaire (4 mégapixels).
- **Identification** (reconnaître un visage ou lire une plaque d'immatriculation) : résolution élevée nécessaire (8 mégapixels ou plus), avec une méthode de calcul précise par densité de pixels détaillée au chapitre 34.
</div>

## 16.3 Objectif fixe ou varifocal

Un **objectif fixe** a un champ de vision et un grossissement déterminés à l'achat, non modifiables — le moins cher, adapté quand la distance et l'angle sont connus avec certitude dès l'étude de site (chapitre 9). Un **objectif varifocal** permet d'ajuster le grossissement et l'angle de vue au moment de l'installation, sans changer de caméra — recommandé chaque fois qu'une incertitude subsiste sur la distance exacte de la scène à couvrir, ou pour une caméra dont le rôle pourrait évoluer.

## 16.4 Vision nocturne, WDR et robustesse

- **Infrarouge (IR)** : indispensable pour toute zone sans éclairage garanti la nuit — vérifier la **portée IR annoncée** (souvent 20-30 m en entrée de gamme, jusqu'à 50 m et plus pour du matériel professionnel longue portée) par rapport à la distance réelle mesurée lors de l'étude de site.
- **WDR (Wide Dynamic Range)** : indispensable pour toute entrée avec un fort contraste lumineux (une porte vitrée en plein soleil, avec l'intérieur plus sombre) — sans WDR, l'image est soit surexposée côté extérieur, soit totalement noire côté intérieur.
- **Indice de protection (IP) et résistance aux impacts (IK)** : toute caméra extérieure doit afficher au minimum IP66 (poussière et jets d'eau puissants) ; une caméra dans une zone accessible au public ou à risque de vandalisme doit ajouter une résistance aux impacts (IK10, la plus élevée de l'échelle).

## 16.5 Budget PoE de la caméra

Reprendre la méthode du chapitre 13.3-13.4 : une caméra fixe simple consomme rarement plus de 8-12 W, une caméra avec chauffage intégré (climats froids, non représentatif du contexte haïtien mais à connaître) ou une PTZ motorisée peut dépasser 25-30 W et nécessiter du PoE+ voire PoE++.

## 16.6 Choisir un serveur selon son rôle

**Méthode** : ne jamais choisir un serveur "générique" — dimensionner le processeur, la mémoire vive et le stockage selon le rôle précis qu'il jouera (Volume 11), puis seulement choisir le facteur de forme.

| Rôle | Facteur dimensionnant principal |
|---|---|
| Serveur de fichiers | Capacité de stockage et débit réseau (souvent 1-10 Gbit/s selon le nombre d'utilisateurs simultanés) |
| Contrôleur de domaine (Active Directory) | Charge légère en CPU/RAM, mais disponibilité critique — souvent le premier candidat à une redondance (deux contrôleurs de domaine) |
| Serveur applicatif métier | Dépend entièrement des exigences de l'éditeur du logiciel métier (à toujours vérifier auprès du fournisseur de l'application, jamais deviné) |
| Hyperviseur (virtualisation de plusieurs serveurs sur une seule machine physique) | CPU (nombre de cœurs) et RAM dimensionnés sur la somme des besoins de toutes les machines virtuelles prévues, plus une marge |
| NVR logiciel (VMS, Volume 12) | CPU dimensionné sur le nombre de flux vidéo à décoder simultanément à l'affichage, stockage dimensionné selon le calcul du chapitre 34 |

## 16.7 Le stockage : RAID et redondance

Un serveur professionnel n'utilise (presque) jamais un disque unique — un **RAID** (Redundant Array of Independent Disks) répartit les données sur plusieurs disques pour tolérer la panne d'un ou plusieurs d'entre eux sans perte de données.

| Niveau RAID | Principe | Tolère la panne de | Cas d'usage |
|---|---|---|---|
| RAID 0 | Répartition sans redondance (débit maximal) | Aucun disque — un seul disque en panne perd toutes les données | Jamais recommandé pour des données de production dans ce manuel |
| RAID 1 | Duplication intégrale (mirroring) sur 2 disques | 1 disque | Petits serveurs, contrôleurs de domaine |
| RAID 5 | Répartition avec parité sur 3 disques ou plus | 1 disque | Bon compromis capacité/redondance pour un serveur de fichiers |
| RAID 10 | Combinaison de mirroring et répartition (4 disques minimum) | Jusqu'à 1 disque par paire, avec de meilleures performances que le RAID 5 | Serveurs à charge intensive (bases de données, hyperviseurs) |

<div class="encadre attention">
<span class="encadre-titre">⚠️ RAID n'est jamais une sauvegarde</span>
Un RAID protège contre la panne **matérielle** d'un disque, jamais contre une suppression accidentelle, un ransomware, ou une erreur humaine (qui se répliquent instantanément sur tous les disques du RAID). La politique de sauvegarde complète, distincte et indispensable même avec du RAID en place, fait l'objet du chapitre 39.
</div>

## 16.8 Alimentation redondante et facteur de forme

Sur tout serveur jugé critique (chapitre 14.7, même logique que la haute disponibilité du firewall), une **double alimentation** (deux blocs d'alimentation, chacun capable de fournir seul l'énergie nécessaire, idéalement reliés à deux circuits électriques distincts) évite qu'une panne d'alimentation unique n'interrompe le service. Le facteur de forme (rack 1U/2U ou tour) se choisit selon l'existence ou non d'une baie (Volume 6) — jamais l'inverse.

## 16.9 Laboratoire — choisir le matériel d'un scénario réel

Une entreprise veut équiper l'entrée principale de son entrepôt (identification des plaques des véhicules qui entrent, de nuit comme de jour, distance de la caméra à la barrière : 15 m) et son serveur de fichiers doit tolérer la panne d'un disque sans interruption de service, avec 4 disques disponibles. Détermine : (1) le type de caméra et les caractéristiques minimales requises (résolution, objectif, IR/WDR, IP) ; (2) le niveau de RAID à recommander pour le serveur de fichiers, et pourquoi pas un autre niveau.

**Corrigé :** (1) Caméra **bullet** extérieure, objectif **varifocal** (ajustable à la distance exacte de 15 m au moment de l'installation), résolution **identification** (8 MP minimum, pour lire une plaque), **IR** avec portée supérieure à 15 m, **WDR** (contraste jour/nuit à une entrée extérieure), indice **IP66** minimum. (2) **RAID 10** plutôt que RAID 5 : avec exactement 4 disques disponibles, le RAID 10 offre de meilleures performances en écriture (pertinent pour un serveur de fichiers à forte activité) tout en tolérant la panne d'un disque — un choix supérieur au RAID 5 dans ce cas précis, à condition que la capacité utile réduite du RAID 10 (50 % de la capacité brute, contre environ 75 % en RAID 5 à 4 disques) reste compatible avec le besoin de stockage réel.

## Résumé du chapitre

Le choix d'une caméra dépend de son emplacement (dôme discret en intérieur, bullet dissuasive en extérieur, PTZ pour une zone à surveiller activement) et de son objectif réel (surveillance générale, détection ou identification, chacun avec sa résolution minimale) — jamais d'une préférence générale pour "la meilleure qualité". Le choix d'un serveur se dimensionne sur son rôle précis (fichiers, contrôleur de domaine, applicatif, hyperviseur, NVR logiciel), avec un niveau de RAID adapté au compromis capacité/performance/tolérance de panne recherché — le RAID n'étant jamais un substitut à une vraie politique de sauvegarde.

*Fin du Volume 5. Chapitre suivant : le câblage structuré de A à Z, la première étape concrète d'installation physique.*
