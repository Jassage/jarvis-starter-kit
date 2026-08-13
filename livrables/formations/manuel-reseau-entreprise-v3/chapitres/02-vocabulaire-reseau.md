<div class="chapitre-titre-num">CHAPITRE 2</div>

# Le vocabulaire de base du réseau

## Objectifs pédagogiques

Comprendre, avec une analogie et un exemple concret pour chacun, les douze notions qui reviendront dans absolument tous les chapitres de ce manuel : adresse IP, adresse MAC, switch, routeur, firewall, DNS, DHCP, VLAN, Wi-Fi, câble cuivre, fibre optique et PoE.

## Prérequis

Chapitre 1.

## 2.1 L'adresse IP : le numéro de rue de chaque appareil

Une **adresse IP** (Internet Protocol) est un identifiant numérique attribué à chaque appareil connecté à un réseau, qui permet de savoir précisément à qui envoyer une donnée. Sous sa forme la plus courante (IPv4), elle s'écrit en quatre nombres séparés par des points, par exemple `192.168.1.15`.

**Analogie** : c'est l'adresse postale complète d'une maison (numéro, rue, ville). Pour qu'une lettre (une donnée) arrive à destination, il faut une adresse précise et unique dans le quartier (le réseau). Deux maisons ne peuvent pas avoir exactement la même adresse dans la même rue — de la même façon, deux appareils ne peuvent normalement pas avoir la même adresse IP sur le même réseau, sous peine de **conflit d'adresse IP** (les deux appareils deviennent injoignables ou se coupent l'un l'autre par intermittence).

Le calcul et la conception des adresses IP est un sujet si important qu'il occupe entièrement le Volume 2 de ce manuel.

## 2.2 L'adresse MAC : le numéro de série gravé en usine

Une **adresse MAC** (Media Access Control) est un identifiant unique gravé par le fabricant dans la carte réseau de chaque appareil (un PC, un téléphone, une caméra IP...). Elle s'écrit en six paires de caractères hexadécimaux, par exemple `00:1A:2B:3C:4D:5E`.

**Analogie** : si l'adresse IP est l'adresse postale (qui peut changer si tu déménages), l'adresse MAC est le numéro de série du châssis d'une voiture, gravé à la fabrication et qui ne change jamais, même si la voiture change de propriétaire ou de ville. Contrairement à l'adresse IP, l'adresse MAC ne dépend d'aucune configuration réseau : elle identifie la carte réseau elle-même, pas sa position sur un réseau donné.

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi le réseau a besoin des deux</span>
L'adresse MAC sert à faire circuler une donnée **à l'intérieur d'un même réseau local** (c'est le langage que parlent les switches, Volume 7). L'adresse IP sert à faire circuler une donnée **entre différents réseaux**, y compris à travers Internet (c'est le langage que parlent les routeurs, Volume 8). Les deux travaillent ensemble à chaque instant, à des échelles différentes.
</div>

## 2.3 Le switch (commutateur) : le carrefour du réseau local

Un **switch** est un équipement qui relie physiquement plusieurs appareils d'un même réseau local entre eux (par des câbles), et qui aiguille intelligemment chaque donnée reçue directement vers le bon port de destination, en se basant sur l'adresse MAC.

**Analogie** : imagine un standardiste téléphonique à l'ancienne, qui reçoit un appel et le branche directement sur la ligne du bon interlocuteur, sans déranger tous les autres postes. Un switch fait exactement ça avec les données : quand le PC du bureau 101 envoie une donnée au PC du bureau 102, le switch l'envoie uniquement sur le câble qui mène au bureau 102 — pas sur les 22 autres ports.

Le Volume 7 entier est consacré à la configuration professionnelle d'un switch (VLAN, trunk, agrégation, sécurité).

## 2.4 Le routeur : le poste de douane entre deux réseaux

Un **routeur** relie deux réseaux différents entre eux (par exemple le LAN de l'entreprise et le WAN/Internet), et décide, pour chaque donnée, quel chemin emprunter pour atteindre sa destination si elle ne se trouve pas sur le réseau local.

**Analogie** : si le switch est le standardiste qui aiguille les appels **à l'intérieur** d'un même bâtiment, le routeur est le poste de douane à la frontière entre deux pays (deux réseaux) : il vérifie où va chaque paquet, choisit la meilleure route, et le laisse passer d'un réseau à l'autre.

## 2.5 Le firewall (pare-feu) : le gardien qui filtre

Un **firewall** est un équipement (ou un logiciel) qui examine chaque donnée qui tente de traverser une frontière réseau, et qui **autorise ou bloque** son passage selon un ensemble de règles de sécurité définies à l'avance.

**Analogie** : reprenons le poste de douane du routeur — le firewall est le douanier posté juste à côté, qui contrôle les papiers de chaque voyageur (chaque connexion) et refuse l'entrée à ceux qui ne sont pas sur la liste autorisée, ou dont le comportement est suspect. Beaucoup d'équipements modernes combinent d'ailleurs routeur ET firewall dans le même boîtier physique (c'est le cas de la plupart des "box" et des appareils étudiés au Volume 9).

## 2.6 Le DNS : l'annuaire qui traduit les noms en adresses

Le **DNS** (Domain Name System) est un service qui traduit un nom lisible par un humain (comme `intranet.entreprise.local` ou `google.com`) en l'adresse IP numérique correspondante, que les équipements réseau utilisent réellement pour communiquer.

**Analogie** : c'est l'annuaire téléphonique. Tu connais le nom d'une personne ("Bureau du directeur"), mais ton téléphone a besoin du numéro exact pour composer l'appel. Le DNS fait cette traduction automatiquement, à chaque fois que tu tapes une adresse web ou que tu accèdes à un serveur par son nom plutôt que par son adresse IP brute.

## 2.7 Le DHCP : le service qui distribue automatiquement les adresses

Le **DHCP** (Dynamic Host Configuration Protocol) est un service qui attribue automatiquement une adresse IP (ainsi que le masque, la passerelle et le DNS) à chaque nouvel appareil qui rejoint le réseau, sans qu'un technicien ait besoin de la configurer manuellement.

**Analogie** : c'est l'agent d'accueil d'un grand hôtel qui, à ton arrivée, te remet automatiquement une clé de chambre libre et te donne le plan de l'établissement — sans DHCP, il faudrait configurer manuellement chaque appareil un par un, comme si chaque client devait négocier lui-même sa chambre avec chaque autre client de l'hôtel pour être sûr de ne pas prendre une chambre déjà occupée.

<div class="encadre attention">
<span class="encadre-titre">⚠️ DHCP attribue, il ne protège pas</span>
Le DHCP résout le problème pratique de la distribution d'adresses, mais n'apporte aucune sécurité par lui-même : n'importe quel appareil branché reçoit une adresse et peut, par défaut, tenter de communiquer avec le reste du réseau. Les VLAN (2.9), le Port Security et le DHCP Snooping (Volume 7) existent précisément pour encadrer cela.
</div>

## 2.8 Le Wi-Fi : le câble invisible

Le **Wi-Fi** est une technologie qui permet de relier un appareil au réseau local **sans câble**, par ondes radio, en utilisant une borne d'accès (Access Point, ou AP) comme relais vers le réseau câblé.

**Analogie** : c'est une radio-conversation à courte portée entre l'appareil et la borne, alors qu'une connexion filaire est une ligne téléphonique dédiée. La conversation radio est pratique et mobile, mais elle est partagée avec tous les autres appareils à portée (contrairement à un câble, qui est un lien privé point-à-point) et sensible aux obstacles physiques et aux interférences — d'où l'importance d'une véritable étude de couverture, traitée au Volume 10.

## 2.9 Le VLAN : des cloisons virtuelles à l'intérieur d'un même réseau physique

Un **VLAN** (Virtual Local Area Network) est une technique qui permet de diviser un seul réseau physique (les mêmes switches, les mêmes câbles) en **plusieurs réseaux logiquement séparés**, comme s'il s'agissait de réseaux totalement distincts, sans avoir besoin de câbler un jeu de switches différent pour chacun.

**Analogie** : imagine un immeuble de bureaux avec un seul réseau de plomberie et d'électricité (le réseau physique), mais divisé en appartements séparés par des cloisons (les VLAN) : les habitants de l'appartement A ne peuvent pas entrer directement chez ceux de l'appartement B, même s'ils partagent le même bâtiment. De la même façon, un ordinateur du VLAN "Utilisateurs" ne peut normalement pas communiquer directement avec une caméra du VLAN "CCTV", même s'ils sont branchés sur le même switch physique — sauf autorisation explicite via un routeur (le "gardien" qui gère le passage entre appartements, Volume 8).

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi cette cloison est centrale dans ce manuel</span>
Séparer les utilisateurs, les serveurs, la téléphonie, le Wi-Fi invité, les objets connectés (IoT) et la vidéosurveillance en VLAN distincts est la décision de conception la plus importante de tout projet réseau professionnel — elle limite les pannes en cascade (une tempête de trafic sur un VLAN n'affecte pas les autres), et surtout elle limite les dégâts en cas de compromission de sécurité (une caméra piratée, par exemple, ne peut alors pas directement attaquer le serveur de paie). Ce sujet est développé en profondeur au Volume 4.
</div>

## 2.10 Le câble réseau (cuivre) : la voie la plus courante

Le câblage cuivre le plus utilisé en entreprise est le câble **Ethernet en paires torsadées** (catégories 5e, 6, 6A...), terminé par un connecteur RJ45. Il transporte les données sous forme de signaux électriques.

**Analogie** : c'est une route pavée classique — fiable, abordable, standard, mais avec une limite de distance (100 mètres maximum entre deux équipements actifs pour l'Ethernet cuivre standard) et sensible aux interférences électromagnétiques sur de longues distances.

## 2.11 La fibre optique : la voie longue distance et haut débit

La **fibre optique** transporte les données sous forme d'impulsions lumineuses dans un fin brin de verre ou de plastique, ce qui lui permet d'atteindre des débits bien plus élevés et des distances bien plus longues que le cuivre (plusieurs kilomètres sans affaiblissement significatif), sans aucune sensibilité aux interférences électriques.

**Analogie** : si le cuivre est une route pavée, la fibre est une ligne de train à grande vitesse — plus chère à installer, mais indispensable dès qu'il faut relier deux bâtiments éloignés, deux étages d'une tour, ou un datacenter à très haut débit.

## 2.12 Le PoE : faire voyager l'électricité dans le même câble que les données

Le **PoE** (Power over Ethernet) est une technologie qui permet d'alimenter électriquement un équipement (une borne Wi-Fi, une caméra IP, un téléphone IP) directement à travers le même câble réseau qui transporte ses données, sans avoir besoin d'une prise électrique séparée à côté de l'appareil.

**Analogie** : c'est comme un tuyau unique qui apporterait à la fois l'eau potable ET l'électricité jusqu'à un point d'usage, évitant de devoir tirer deux réseaux séparés jusqu'au même endroit. C'est particulièrement précieux pour une caméra installée en hauteur, en façade, ou dans un couloir sans prise électrique à proximité — un seul câble suffit à la fois pour la relier au réseau et pour l'alimenter.

Il existe plusieurs standards, avec des puissances maximales différentes par port (802.3af, 802.3at/PoE+, 802.3bt/PoE++) — le choix du bon standard selon les équipements à alimenter est traité en détail au Volume 5 (choix du matériel) et au Volume 12 (calcul PoE pour la vidéosurveillance).

## 2.13 Tableau récapitulatif

| Terme | Rôle en une phrase | Analogie |
|---|---|---|
| Adresse IP | Identifie un appareil sur un réseau | Adresse postale |
| Adresse MAC | Identifie une carte réseau, de façon permanente | Numéro de série gravé en usine |
| Switch | Relie les appareils d'un même réseau local, aiguille par MAC | Standardiste téléphonique interne |
| Routeur | Relie deux réseaux différents, choisit le chemin | Poste de douane à la frontière |
| Firewall | Autorise ou bloque le trafic selon des règles | Douanier qui contrôle les papiers |
| DNS | Traduit un nom en adresse IP | Annuaire téléphonique |
| DHCP | Attribue automatiquement les adresses IP | Accueil d'hôtel qui remet une clé |
| Wi-Fi | Relie sans câble, par ondes radio | Radio-conversation à courte portée |
| VLAN | Sépare logiquement un réseau physique unique | Cloisons d'appartements dans un immeuble |
| Câble cuivre (Ethernet) | Transporte les données par signal électrique | Route pavée |
| Fibre optique | Transporte les données par impulsions lumineuses | Ligne de train à grande vitesse |
| PoE | Fait voyager l'électricité dans le câble réseau | Tuyau unique eau + électricité |

## 2.14 Laboratoire — retrouver ces éléments sur un vrai appareil

1. Sur un PC Windows connecté à un réseau, ouvre une invite de commandes et tape `ipconfig /all` (la commande exacte et son interprétation détaillée sont couvertes au Volume 2 — pour l'instant, contente-toi de repérer les lignes).
2. Repère dans le résultat la ligne "Adresse IPv4" (l'adresse IP de ta machine) et la ligne "Adresse physique" (l'adresse MAC de ta carte réseau).
3. Repère la ligne "Serveur DHCP" (l'appareil qui t'a attribué ton adresse IP automatiquement) et la ligne "Serveurs DNS" (les annuaires que ton PC interroge pour traduire les noms de domaine).
4. Note ces quatre valeurs dans un fichier texte — nous les réutiliserons en exemple au Volume 2.

## Résumé du chapitre

L'adresse IP identifie un appareil sur le réseau (comme une adresse postale), l'adresse MAC identifie sa carte réseau de façon permanente (comme un numéro de série). Le switch aiguille le trafic à l'intérieur d'un même réseau local, le routeur relie deux réseaux différents, le firewall filtre ce qui a le droit de passer. Le DNS traduit les noms en adresses, le DHCP distribue automatiquement les adresses. Le Wi-Fi relie sans câble ; le VLAN cloisonne logiquement un réseau physique unique en plusieurs réseaux séparés ; le câble cuivre et la fibre optique sont les deux grandes familles de câblage physique ; le PoE permet d'alimenter un équipement par son câble réseau.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 2.1</span>
Une caméra IP installée en hauteur, à 40 mètres du local technique, n'a aucune prise électrique à proximité. Quelle technologie du chapitre résout ce problème sans tirer de câble électrique supplémentaire ?
</div>

**Corrigé :** Le PoE (Power over Ethernet) — le câble réseau qui relie déjà la caméra au switch peut aussi l'alimenter électriquement, à condition que le switch (ou un injecteur PoE) le supporte et que la distance reste dans la limite standard de 100 mètres.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 2.2</span>
Un employé change de PC ; le nouveau PC obtient une adresse IP différente de l'ancien lorsqu'il se connecte au réseau. L'adresse MAC de sa carte réseau a-t-elle changé, elle aussi ?
</div>

**Corrigé :** Non — l'adresse MAC est gravée en usine sur la carte réseau du nouveau PC, elle est différente de celle de l'ancien PC (chaque carte réseau a sa propre adresse MAC unique), mais elle ne "change" jamais pour un même appareil au fil de ses connexions, contrairement à l'adresse IP qui peut être réattribuée à chaque connexion selon la configuration DHCP.

*Chapitre suivant : apprendre à lire un réseau — identifier les équipements et lire les schémas physiques, logiques, de baie, IP et VLAN.*
