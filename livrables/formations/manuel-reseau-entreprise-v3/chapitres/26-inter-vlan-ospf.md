<div class="chapitre-titre-num">CHAPITRE 26</div>

# Routage inter-VLAN et OSPF

## Objectifs pédagogiques

Configurer réellement le routage inter-VLAN sur SW-COEUR (une interface virtuelle — SVI — par VLAN, chapitre 12.5), puis remplacer les routes statiques du chapitre 25 par OSPF lorsque le réseau grandit au point où les maintenir manuellement devient impraticable.

## Prérequis

Chapitre 25.

## OBJECTIF

Tous les VLAN du plan IP (chapitre 11) sont routables entre eux via SW-COEUR, et RTR-BORDURE-01 + SW-COEUR apprennent leurs routes dynamiquement via OSPF plutôt que par une liste de routes statiques à maintenir à la main.

## ÉTAPE 1 — Activer le routage et créer une SVI par VLAN sur SW-COEUR

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-COEUR)</div>

```
SW-COEUR(config)# ip routing
SW-COEUR(config)# interface vlan 10
SW-COEUR(config-if)# ip address 10.10.10.1 255.255.255.224
SW-COEUR(config-if)# no shutdown
SW-COEUR(config-if)# exit
SW-COEUR(config)# interface vlan 20
SW-COEUR(config-if)# ip address 10.10.20.1 255.255.255.128
SW-COEUR(config-if)# no shutdown
SW-COEUR(config-if)# exit
SW-COEUR(config)# interface vlan 25
SW-COEUR(config-if)# ip address 10.10.25.1 255.255.255.224
SW-COEUR(config-if)# no shutdown
SW-COEUR(config-if)# exit
SW-COEUR(config)# interface vlan 30
SW-COEUR(config-if)# ip address 10.10.30.1 255.255.255.224
SW-COEUR(config-if)# no shutdown
SW-COEUR(config-if)# exit
SW-COEUR(config)# interface vlan 40
SW-COEUR(config-if)# ip address 10.10.40.1 255.255.255.128
SW-COEUR(config-if)# no shutdown
SW-COEUR(config-if)# exit
SW-COEUR(config)# interface vlan 50
SW-COEUR(config-if)# ip address 10.10.50.1 255.255.255.0
SW-COEUR(config-if)# no shutdown
SW-COEUR(config-if)# exit
SW-COEUR(config)# interface vlan 60
SW-COEUR(config-if)# ip address 10.10.60.1 255.255.255.192
SW-COEUR(config-if)# no shutdown
SW-COEUR(config-if)# exit
SW-COEUR(config)# interface vlan 80
SW-COEUR(config-if)# ip address 10.10.80.1 255.255.255.192
SW-COEUR(config-if)# no shutdown
SW-COEUR(config-if)# exit
SW-COEUR(config)# interface vlan 90
SW-COEUR(config-if)# ip address 10.10.90.1 255.255.255.240
SW-COEUR(config-if)# no shutdown
SW-COEUR(config-if)# exit
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Ces adresses ne sont pas improvisées : elles reprennent exactement le plan IP du chapitre 11</span>
Chaque adresse de passerelle configurée ici correspond exactement à la colonne "Passerelle" du tableau professionnel du chapitre 11.2 — c'est précisément l'intérêt d'avoir documenté ce plan IP en amont (Volume 4) avant d'ouvrir la moindre session de configuration : chaque commande de ce chapitre se contente de **transcrire** une décision déjà prise et validée, jamais de l'improviser au clavier.
</div>

`ip routing` (première ligne) est la commande qui active globalement la capacité de routage du switch — sans elle, même avec toutes les SVI créées et actives, aucun trafic ne circulerait réellement entre les VLAN.

## ÉTAPE 2 — Appliquer une ACL de restriction sur la SVI CCTV

Conformément au plan VLAN d'accès du chapitre 11.2 ("CCTV → NVR uniquement"), et à la logique de filtrage posée au chapitre 12.6 :

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-COEUR)</div>

```
SW-COEUR(config)# ip access-list extended ACL-CCTV-SORTANT
SW-COEUR(config-ext-nacl)# permit ip 10.10.80.0 0.0.0.63 host 10.10.80.5
SW-COEUR(config-ext-nacl)# deny ip 10.10.80.0 0.0.0.63 any log
SW-COEUR(config-ext-nacl)# exit
SW-COEUR(config)# interface vlan 80
SW-COEUR(config-if)# ip access-group ACL-CCTV-SORTANT out
SW-COEUR(config-if)# exit
```

**Explication** : `10.10.80.5` est l'adresse du NVR (statique, chapitre 11.2) — la première ligne autorise explicitement tout le trafic du VLAN CCTV vers cette seule adresse, la seconde **refuse et journalise** (`log`) tout le reste. L'ACL est appliquée en sortie (`out`) de la SVI 80, contrôlant ainsi tout trafic qui tenterait de quitter le VLAN CCTV vers n'importe quelle autre destination que le NVR.

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-COEUR# show ip route connected
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
Une ligne `C` pour chacun des 9 réseaux VLAN configurés à l'étape 1, confirmant que SW-COEUR les connaît tous et peut router entre eux.
</div>

## 26.1 Pourquoi le routage statique du chapitre 25 ne suffit plus à grande échelle

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le problème que résout OSPF</span>
Le routage statique du chapitre 25 fonctionne parfaitement avec un seul routeur de bordure et un seul switch cœur. Mais dès qu'un second équipement de routage rejoint le réseau — un second switch cœur redondant (chapitre 27), un routeur d'agence distante (Volume 16, Projet 5) — chaque route statique doit être **répliquée manuellement** sur chaque équipement concerné, et **mise à jour manuellement** à chaque changement du plan IP. Sur un réseau à plusieurs routeurs, l'oubli d'une seule route statique sur un seul équipement devient une source de panne difficile à diagnostiquer. **OSPF** (Open Shortest Path First) résout ce problème : chaque routeur annonce dynamiquement les réseaux qu'il connaît à ses voisins, qui les apprennent et les propagent automatiquement, sans configuration manuelle répétée.
</div>

## ÉTAPE 3 — Configurer OSPF sur SW-COEUR

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-COEUR)</div>

```
SW-COEUR(config)# router ospf 1
SW-COEUR(config-router)# router-id 10.10.99.2
SW-COEUR(config-router)# network 10.10.10.0 0.0.0.31 area 0
SW-COEUR(config-router)# network 10.10.20.0 0.0.0.127 area 0
SW-COEUR(config-router)# network 10.10.25.0 0.0.0.31 area 0
SW-COEUR(config-router)# network 10.10.30.0 0.0.0.31 area 0
SW-COEUR(config-router)# network 10.10.40.0 0.0.0.127 area 0
SW-COEUR(config-router)# network 10.10.50.0 0.0.0.255 area 0
SW-COEUR(config-router)# network 10.10.60.0 0.0.0.63 area 0
SW-COEUR(config-router)# network 10.10.80.0 0.0.0.63 area 0
SW-COEUR(config-router)# network 10.10.90.0 0.0.0.15 area 0
SW-COEUR(config-router)# network 10.10.99.0 0.0.0.3 area 0
SW-COEUR(config-router)# exit
```

**Explication** : `router-id` identifie explicitement ce routeur dans le domaine OSPF (bonne pratique : toujours le fixer explicitement plutôt que de laisser OSPF le déduire automatiquement de la plus haute adresse IP configurée, qui pourrait changer de façon imprévisible). Chaque commande `network` déclare un réseau à annoncer dans OSPF, avec un **masque générique** (wildcard mask, l'inverse bit à bit du masque de sous-réseau — `0.0.0.31` pour un `/27`, `0.0.0.127` pour un `/25`) et l'**area 0** (l'aire OSPF centrale de référence, utilisée par défaut sur tout projet de ce manuel n'ayant pas de besoin de topologie hiérarchique multi-aires).

## ÉTAPE 4 — Configurer OSPF sur RTR-BORDURE-01

<div class="ou-executer">À EXÉCUTER SUR LE ROUTEUR — Cisco IOS (RTR-BORDURE-01)</div>

```
RTR-BORDURE-01(config)# router ospf 1
RTR-BORDURE-01(config-router)# router-id 10.10.99.1
RTR-BORDURE-01(config-router)# network 10.10.99.0 0.0.0.3 area 0
RTR-BORDURE-01(config-router)# default-information originate
RTR-BORDURE-01(config-router)# exit
RTR-BORDURE-01(config)# no ip route 10.10.0.0 255.255.0.0 10.10.99.2
```

**Explication** : seule la liaison point-à-point vers SW-COEUR (`10.10.99.0/30`) est annoncée dans OSPF — le réseau `203.0.113.0/30` (WAN) ne l'est jamais (chapitre 40, ne jamais exposer le routage interne vers l'extérieur). `default-information originate` propage la route par défaut (chapitre 25, restée statique et volontairement non OSPF puisqu'elle pointe vers l'extérieur du domaine de routage interne) vers SW-COEUR via OSPF — la dernière ligne supprime la route statique de retour du chapitre 25, désormais apprise dynamiquement.

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR LE ROUTEUR — Cisco IOS</div>

```
RTR-BORDURE-01# show ip ospf neighbor
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>

```
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.10.99.2        1   FULL/BDR        00:00:38    10.10.99.2      GigabitEthernet0/1
```

**Interprétation** : `FULL` confirme que la relation de voisinage OSPF est complètement établie et que les deux routeurs échangent bien leur base de données de routage — tout autre état (`INIT`, `2-WAY`, `EXSTART` bloqué) indique un problème de formation de voisinage (voir DÉPANNAGE).
</div>

```
RTR-BORDURE-01# show ip route ospf
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
Une ligne `O` pour chacun des 9 réseaux VLAN, apprise automatiquement depuis SW-COEUR — sans qu'aucune route statique individuelle n'ait été saisie manuellement sur RTR-BORDURE-01 pour ces réseaux.
</div>

## DÉPANNAGE

### Si le voisinage OSPF reste bloqué en état `INIT`

Le routeur local reçoit les paquets Hello du voisin mais ne se voit pas lui-même dans leur liste de voisins détectés — cause la plus fréquente : une **incohérence de sous-réseau** entre les deux extrémités (vérifier que les deux interfaces appartiennent bien au même `10.10.99.0/30`).

### Si le voisinage OSPF reste bloqué en état `EXSTART` ou `EXCHANGE`

Cause la plus fréquente : une **taille de MTU différente** entre les deux interfaces, empêchant l'échange complet de la base de données de routage — vérifier la MTU configurée sur chaque interface (`show interfaces` et comparer).

### Si aucun voisinage ne se forme du tout

Vérifier que la commande `network` de chaque côté couvre bien l'interface concernée (masque générique correct, area identique des deux côtés — un mismatch d'area empêche toute formation de voisinage, contrairement à un mismatch de hello/dead timer qui ne fait qu'échouer silencieusement sans se rétablir automatiquement).

## SAUVEGARDE

```
SW-COEUR# copy running-config startup-config
RTR-BORDURE-01# copy running-config startup-config
```

## 26.2 Le même résultat, entièrement en MikroTik RouterOS

<div class="ou-executer">À EXÉCUTER SUR LE ROUTEUR — MikroTik RouterOS (RTR-BORDURE-01)</div>

```
/routing ospf instance set [find default=yes] router-id=10.10.99.1
/routing ospf area add name=area0 area-id=0.0.0.0
/routing ospf interface-template add interfaces=ether2 area=area0
/ip route add dst-address=0.0.0.0/0 gateway=203.0.113.1
```

**Explication** : `interface-template` associe l'interface `ether2` (vers SW-COEUR) à l'aire `0.0.0.0` (équivalent RouterOS de l'area 0 Cisco) ; la route par défaut vers Internet reste statique, exactement comme côté Cisco (`ip route` seule, sans `default-information originate` puisque cette propagation se règle par ailleurs dans les paramètres de redistribution de l'instance OSPF si nécessaire).

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu (vérification)</span>

```
[admin@RTR-BORDURE-01] > /routing ospf neighbor print
 #   ADDRESS        ROUTER-ID    STATE     
 0   10.10.99.2     10.10.99.2   Full/Backup
```
</div>

## Résumé du chapitre

Le routage inter-VLAN se réalise concrètement en créant une SVI par VLAN sur SW-COEUR, avec l'adresse exacte du plan IP du chapitre 11, après avoir activé `ip routing` globalement. Une ACL peut restreindre le trafic sortant d'un VLAN sensible (CCTV) à une seule destination autorisée. OSPF remplace avantageusement les routes statiques dès qu'un réseau comporte plusieurs équipements de routage : chaque routeur annonce ses réseaux, les voisinages se forment automatiquement (état `FULL` attendu), et toute route apprise dynamiquement s'actualise sans intervention manuelle en cas de changement.

*Chapitre suivant : la redondance (VRRP/HSRP) — ajouter un second switch cœur pour qu'une panne matérielle unique ne coupe jamais le routage du réseau entier.*
