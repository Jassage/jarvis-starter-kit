<div class="chapitre-titre-num">CHAPITRE 27</div>

# Redondance (VRRP/HSRP)

## Objectifs pédagogiques

Ajouter un second switch cœur redondant et configurer VRRP pour qu'une passerelle par défaut reste toujours joignable même si le switch cœur qui la porte tombe en panne — sans qu'aucun poste utilisateur n'ait jamais besoin de changer sa configuration.

## Prérequis

Chapitre 26.

## OBJECTIF

La panne complète d'un des deux switches cœur ne provoque aucune coupure de routage perceptible pour les utilisateurs : la passerelle par défaut de chaque VLAN reste joignable, automatiquement reprise par le second switch cœur.

## 27.1 Pourquoi la redondance de routage

Reprend le critère de décision du chapitre 14.7 : sur un projet où une panne totale de routage interne serait inacceptable pour l'activité du client (Volume 16, Projets 3-6), un unique switch cœur devient un **point de défaillance unique** (single point of failure) — sa panne couperait le routage inter-VLAN pour l'ensemble du réseau, malgré tout le soin apporté à la redondance des liens physiques (chapitre 21, LACP) qui ne protège que contre la panne d'un **câble**, jamais contre la panne du **switch** lui-même.

## 27.2 Le principe VRRP : une adresse virtuelle partagée par deux switches

**VRRP** (Virtual Router Redundancy Protocol) permet à deux (ou plusieurs) switches/routeurs de se partager une seule **adresse IP virtuelle**, qui devient la passerelle réellement configurée sur les postes clients — l'un des deux (le **master**, priorité la plus haute) répond activement à cette adresse, l'autre (le **backup**) surveille en permanence l'état du master et prend automatiquement le relais si celui-ci disparaît, sans qu'aucun appareil du réseau n'ait besoin de savoir lequel des deux répond réellement à un instant donné.

<div class="encadre astuce">
<span class="encadre-titre">💡 VRRP (standard ouvert) plutôt que HSRP (propriétaire Cisco)</span>
**HSRP** (Hot Standby Router Protocol) remplit exactement le même rôle que VRRP, mais reste un protocole propriétaire Cisco, incompatible avec un équipement d'un autre constructeur. Ce manuel utilise **VRRP** par défaut sur l'ensemble de ses projets (Volume 16) — un standard ouvert (RFC 5798) interopérable, y compris entre un switch Cisco et un équipement MikroTik dans un scénario mixte, cohérent avec l'approche multi-constructeur de ce manuel (chapitre 55). HSRP reste une alternative parfaitement valable sur un projet **exclusivement** Cisco, où les fonctionnalités avancées propres à Cisco pourraient s'avérer utiles — un choix à documenter explicitement si retenu.
</div>

## 27.3 Topologie mise à jour

```{.uml}
[ RTR-BORDURE-01 ]
        │  10.10.99.0/30
        │
[ SW-COEUR ] ─── 10.10.99.4/30 (lien inter-coeur) ─── [ SW-COEUR-02 ]
        │                                                    │
        └──────────── VRRP : adresse virtuelle .1 par VLAN ──┘
                       (SW-COEUR = master, SW-COEUR-02 = backup)
        │                                                    │
[ SW-ACCES-01 ] ── (trunk LACP existant, chapitre 21) ── relié aux deux coeurs
```

## PLAN D'ADRESSAGE (exemple sur le VLAN 20, méthode reproduite ensuite pour chaque VLAN)

| Rôle | Adresse |
|---|---|
| Adresse physique de SW-COEUR sur VLAN 20 | 10.10.20.2 |
| Adresse physique de SW-COEUR-02 sur VLAN 20 | 10.10.20.3 |
| Adresse virtuelle VRRP (la vraie passerelle du plan IP, chapitre 11) | 10.10.20.1 |
| Lien inter-cœur | 10.10.99.4/30 (SW-COEUR = .5, SW-COEUR-02 = .6) |

<div class="encadre attention">
<span class="encadre-titre">⚠️ L'adresse de passerelle documentée au chapitre 11 ne change pas — c'est elle qui devient l'adresse virtuelle</span>
Aucun poste client, aucune configuration DHCP (chapitre 6) n'a besoin d'être modifiée par l'introduction de VRRP : `10.10.20.1`, déjà distribuée comme passerelle depuis le chapitre 11, **devient** l'adresse virtuelle VRRP plutôt que l'adresse physique directe de SW-COEUR — les deux switches cœur reçoivent chacun une **nouvelle** adresse physique propre (`.2` et `.3`) sur le même sous-réseau, invisible du point de vue des clients.
</div>

## ÉTAPE 1 — Reconfigurer l'adresse physique de SW-COEUR sur le VLAN 20

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-COEUR)</div>

```
SW-COEUR(config)# interface vlan 20
SW-COEUR(config-if)# ip address 10.10.20.2 255.255.255.128
SW-COEUR(config-if)# exit
```

## ÉTAPE 2 — Configurer le lien inter-cœur et la SVI VLAN 20 sur SW-COEUR-02

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-COEUR-02)</div>

```
SW-COEUR-02(config)# interface GigabitEthernet1/0/1
SW-COEUR-02(config-if)# description Lien inter-coeur vers SW-COEUR
SW-COEUR-02(config-if)# no switchport
SW-COEUR-02(config-if)# ip address 10.10.99.6 255.255.255.252
SW-COEUR-02(config-if)# no shutdown
SW-COEUR-02(config-if)# exit
SW-COEUR-02(config)# interface vlan 20
SW-COEUR-02(config-if)# ip address 10.10.20.3 255.255.255.128
SW-COEUR-02(config-if)# no shutdown
SW-COEUR-02(config-if)# exit
```

## ÉTAPE 3 — Configurer VRRP sur SW-COEUR (master)

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-COEUR)</div>

```
SW-COEUR(config)# interface vlan 20
SW-COEUR(config-if)# vrrp 20 ip 10.10.20.1
SW-COEUR(config-if)# vrrp 20 priority 110
SW-COEUR(config-if)# vrrp 20 preempt
SW-COEUR(config-if)# vrrp 20 track GigabitEthernet1/0/3
SW-COEUR(config-if)# exit
```

**Explication** : `vrrp 20 ip 10.10.20.1` crée le groupe VRRP 20 (numéro de groupe arbitraire, ici choisi pour correspondre au VLAN par lisibilité) avec l'adresse virtuelle partagée ; `priority 110` (supérieure à la valeur par défaut 100) désigne ce switch comme master ; `preempt` autorise ce switch à **reprendre** automatiquement le rôle de master dès qu'il redevient disponible après une panne, plutôt que de laisser le backup continuer indéfiniment ; `track` surveille l'état de l'interface vers RTR-BORDURE-01 (chapitre 25) — si cette liaison tombe, la priorité du switch est automatiquement abaissée, cédant le rôle de master à SW-COEUR-02 même si SW-COEUR lui-même reste actif (évite un master isolé du reste du réseau qui continuerait pourtant à répondre localement).

## ÉTAPE 4 — Configurer VRRP sur SW-COEUR-02 (backup)

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-COEUR-02)</div>

```
SW-COEUR-02(config)# interface vlan 20
SW-COEUR-02(config-if)# vrrp 20 ip 10.10.20.1
SW-COEUR-02(config-if)# vrrp 20 priority 100
SW-COEUR-02(config-if)# exit
```

Priorité par défaut (100), inférieure à celle de SW-COEUR (110) — SW-COEUR-02 reste backup en fonctionnement normal.

## ÉTAPE 5 — Tableau de reproduction pour les VLAN restants

La même méthode (étapes 1 à 4) s'applique identiquement à chacun des 8 autres VLAN du plan IP, avec les adresses physiques et virtuelles suivantes :

| VLAN | Adresse virtuelle (passerelle, chapitre 11) | SW-COEUR (physique) | SW-COEUR-02 (physique) |
|---|---|---|---|
| 10 | 10.10.10.1 | 10.10.10.2 | 10.10.10.3 |
| 25 | 10.10.25.1 | 10.10.25.2 | 10.10.25.3 |
| 30 | 10.10.30.1 | 10.10.30.2 | 10.10.30.3 |
| 40 | 10.10.40.1 | 10.10.40.2 | 10.10.40.3 |
| 50 | 10.10.50.1 | 10.10.50.2 | 10.10.50.3 |
| 60 | 10.10.60.1 | 10.10.60.2 | 10.10.60.3 |
| 80 | 10.10.80.1 | 10.10.80.2 | 10.10.80.3 |
| 90 | 10.10.90.1 | 10.10.90.2 | 10.10.90.3 |

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-COEUR)</div>

```
SW-COEUR# show vrrp brief
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>

```
Interface   Grp Pri  Time  Own Pre State   Master addr    Group addr
Vlan20      20  110  3609       Y  Master  10.10.20.2     10.10.20.1
```

**Interprétation** : `State: Master` confirme que SW-COEUR répond activement à l'adresse virtuelle. La même commande sur SW-COEUR-02 doit afficher `State: Backup` — si les **deux** switches affichent `Master` simultanément, un problème grave de "split-brain" est en cours (voir DÉPANNAGE).
</div>

## TEST

Débrancher volontairement SW-COEUR (le master) pendant qu'un `ping` continu tourne depuis un poste client vers `10.10.20.1` — quelques secondes de perte de paquets doivent apparaître (le temps de détection de la panne et de bascule VRRP, réglable via les timers VRRP), puis le ping doit reprendre normalement, désormais répondu par SW-COEUR-02 devenu master.

## DÉPANNAGE

### Si les deux switches affichent `State: Master` simultanément (split-brain)

Cause quasi systématique : le lien de communication VRRP entre les deux switches (dans ce scénario, le lien inter-cœur de l'étape 2) est rompu — chacun croit alors, à tort, que l'autre est en panne, et devient master de son côté. Deux switches actifs simultanément sur la même adresse virtuelle créent des conflits d'adresse MAC/IP dans tout le réseau. Vérifier en priorité l'état physique du lien inter-cœur.

### Si SW-COEUR ne reprend pas le rôle de master après son redémarrage

Vérifier que `preempt` (étape 3) est bien configuré — sans cette commande, un switch redevenu disponible reste en `Backup` indéfiniment, même avec une priorité supérieure, jusqu'à la prochaine panne du master actuel.

## SAUVEGARDE

```
SW-COEUR# copy running-config startup-config
SW-COEUR-02# copy running-config startup-config
```

## 27.4 Le même résultat, entièrement en MikroTik RouterOS

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — MikroTik RouterOS (SW-COEUR, master)</div>

```
/interface vrrp add name=vrrp-vlan20 interface=VLAN20-Utilisateurs vrid=20 priority=110 preemption-mode=yes
/ip address add address=10.10.20.1/25 interface=vrrp-vlan20
```

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — MikroTik RouterOS (SW-COEUR-02, backup)</div>

```
/interface vrrp add name=vrrp-vlan20 interface=VLAN20-Utilisateurs vrid=20 priority=100
/ip address add address=10.10.20.1/25 interface=vrrp-vlan20
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu (vérification)</span>

```
[admin@SW-COEUR] > /interface vrrp print
 0  R  name="vrrp-vlan20" interface=VLAN20-Utilisateurs vrid=20 priority=110 master=yes
```
</div>

## 27.5 Laboratoire complet — GNS3

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi GNS3 plutôt que Packet Tracer pour ce volume</span>
Le routage dynamique (OSPF, chapitre 26) et VRRP exigent un comportement de routeur fidèle à la réalité (temporisateurs, algorithme SPF complet) que Packet Tracer, un simulateur pédagogique simplifié, ne reproduit pas toujours avec exactitude — GNS3 exécute de **vraies images IOS** (Cisco), offrant un comportement identique à du matériel réel.
</div>

**Quoi installer** : GNS3 (application de gestion de topologie) + GNS3 VM (machine virtuelle exécutant les nœuds).
**Où télécharger** : `gns3.com` (GNS3 est gratuit ; l'obtention d'images IOS Cisco nécessite un accès légal à ces images, généralement via un contrat de support Cisco existant ou un laboratoire académique — jamais une image obtenue de source non autorisée).
**Comment installer** : installer GNS3 sur le poste de travail, puis la GNS3 VM dans VirtualBox ou VMware (image OVA fournie par le projet GNS3), et relier les deux selon l'assistant de configuration intégré.
**RAM/CPU (GNS3 VM)** : 8 Go de RAM minimum, 4 cœurs — chaque routeur/switch virtuel émulé consomme des ressources significatives, un routage à 3 nœuds (topologie ci-dessous) reste confortable avec ces ressources.
**Interfaces réseau** : un adaptateur réseau "NAT" ou "Host-only" pour l'accès du poste de travail à la GNS3 VM.

**Topologie à construire** (reproduction simplifiée des chapitres 25-27) :

```{.uml}
[ RTR-BORDURE-01 ]---[ SW-COEUR ]===VRRP===[ SW-COEUR-02 ]
                            |
                      [ SW-ACCES-01 ]---[ PC-Test ]
```

**Adresses IP** : reprendre exactement le plan du chapitre 25 (liaison `10.10.99.0/30`) et du chapitre 27 (VLAN 20, adresse virtuelle `10.10.20.1`, adresses physiques `.2`/`.3`).

**Commandes à exécuter** : reprendre à l'identique les blocs de commandes des chapitres 25 (routes statiques), 26 (OSPF) et 27 (VRRP) — copiables directement dans la console de chaque nœud GNS3.

**Tests à réaliser** :
1. `show ip ospf neighbor` sur RTR-BORDURE-01 — confirmer l'état `FULL` (chapitre 26).
2. `show vrrp brief` sur SW-COEUR et SW-COEUR-02 — confirmer un seul `Master`.
3. Dans GNS3, clic droit sur le lien SW-COEUR↔SW-ACCES-01 → "Stop capture" n'est pas le bon outil ici : utiliser plutôt le menu contextuel du nœud SW-COEUR → "Stop" pour simuler une panne complète, pendant un `ping` continu lancé depuis PC-Test vers `10.10.20.1` — observer la bascule VRRP en temps réel dans la fenêtre de capture ou par l'interruption/reprise du ping.
4. Redémarrer SW-COEUR (`Start` dans GNS3) et confirmer, via `show vrrp brief`, qu'il reprend son rôle de master (`preempt`, chapitre 27.3).

## Résumé du chapitre

VRRP partage une adresse IP virtuelle entre deux switches cœur, l'un master (priorité la plus haute), l'autre backup — la passerelle documentée au chapitre 11 devient cette adresse virtuelle, invisible en tant que telle pour les postes clients. `preempt` permet au master de reprendre son rôle après une panne, `track` abaisse automatiquement sa priorité si son propre lien vers l'extérieur tombe, évitant qu'un master isolé du reste du réseau ne continue de répondre localement sans pouvoir réellement router le trafic.

*Fin du Volume 8. Chapitre suivant : le firewall — interfaces, zones, NAT et règles, premier chapitre du Volume 9.*
