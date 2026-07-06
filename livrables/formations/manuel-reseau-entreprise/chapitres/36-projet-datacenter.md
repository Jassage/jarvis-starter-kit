<div class="chapitre-titre-num">CHAPITRE 36</div>

# Projet complet : Centre de données (Datacenter)

## Objectifs pédagogiques

Réaliser, de A à Z, un datacenter d'entreprise complet : configuration intégrale de la fabrique spine-leaf en BGP EVPN, du stockage SAN dédié, de la redondance 2N électrique, et de la vidéosurveillance exhaustive sans angle mort.

## Prérequis

Chapitres 1-35. Ce chapitre applique et étend la méthode des chapitres 9 (redondance électrique), 11 (routage) au niveau d'exigence le plus élevé du manuel.

## 36.1 Contexte, budget et matériel

- 8 baies de production, 2 baies réseau, 1 baie stockage SAN. Redondance N+1 généralisée à 2N.
- Fabrique spine-leaf (2 spines, 4 leafs) Cisco Nexus, BGP EVPN, stockage SAN iSCSI dédié.
- Budget : 20 % réseau spine-leaf, 25 % serveurs/stockage, 15 % climatisation précision, 15 % alimentation 2N, 15 % sécurité physique, 10 % câblage.

## 36.2 Étape 1 — Configuration complète des switches Spine (Cisco Nexus, BGP EVPN)

**SPINE-01 :**

```
feature bgp
feature nv overlay
feature interface-vlan
feature vn-segment-vlan-based

hostname SPINE-01

interface Ethernet1/1
  description Vers-LEAF-01
  no switchport
  ip address 10.120.99.1/30
  no shutdown

interface Ethernet1/2
  description Vers-LEAF-02
  no switchport
  ip address 10.120.99.5/30
  no shutdown

interface Ethernet1/3
  description Vers-LEAF-03
  no switchport
  ip address 10.120.99.9/30
  no shutdown

interface Ethernet1/4
  description Vers-LEAF-04-Stockage
  no switchport
  ip address 10.120.99.13/30
  no shutdown

router bgp 65000
  router-id 1.1.1.1
  neighbor 10.120.99.2 remote-as 65001
    address-family l2vpn evpn
  neighbor 10.120.99.6 remote-as 65002
    address-family l2vpn evpn
  neighbor 10.120.99.10 remote-as 65003
    address-family l2vpn evpn
  neighbor 10.120.99.14 remote-as 65004
    address-family l2vpn evpn
```

**SPINE-02 :** configuration miroir avec `hostname SPINE-02`, `router-id 1.1.1.2`, adressage point-à-point sur un second bloc (`10.120.98.0/30` par lien).

## 36.3 Étape 2 — Configuration complète d'un switch Leaf (exemple LEAF-01, baie de production A)

```
feature bgp
feature nv overlay
feature vn-segment-vlan-based
feature interface-vlan

hostname LEAF-01

vlan 10
  name Production-Serveurs
  vn-segment 10010

vlan 30
  name Management
  vn-segment 10030

interface nve1
  no shutdown
  source-interface loopback1
  member vni 10010
    ingress-replication protocol bgp
  member vni 10030
    ingress-replication protocol bgp

interface loopback1
  ip address 2.2.2.2/32

interface Ethernet1/1
  description Vers-SPINE-01
  no switchport
  ip address 10.120.99.2/30
  no shutdown

interface Ethernet1/2
  description Vers-SPINE-02
  no switchport
  ip address 10.120.98.2/30
  no shutdown

interface Ethernet1/10-1/24
  description Ports-serveurs-baie-A
  switchport
  switchport mode access
  switchport access vlan 10

router bgp 65001
  router-id 2.2.2.2
  neighbor 10.120.99.1 remote-as 65000
    address-family l2vpn evpn
  neighbor 10.120.98.1 remote-as 65000
    address-family l2vpn evpn
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Répéter pour LEAF-02 (baie B), LEAF-03 (baie C), LEAF-04 (baie stockage SAN)</span>
Seuls le hostname, l'adresse loopback (`3.3.3.3`, `4.4.4.4`...), l'AS BGP (65002, 65003...) et les VLAN spécifiques à la baie changent — la structure de configuration reste identique, exactement comme pour les switches d'accès du chapitre 10.
</div>

## 36.4 Étape 3 — Configuration du stockage SAN dédié (iSCSI, VLAN isolé)

```
! Sur LEAF-04 (baie stockage)
vlan 20
  name Stockage-SAN-iSCSI
  vn-segment 10020

interface Ethernet1/10
  description Vers-Baie-SAN-Controleur-A
  switchport
  switchport mode access
  switchport access vlan 20
  mtu 9216

interface Ethernet1/11
  description Vers-Baie-SAN-Controleur-B
  switchport
  switchport mode access
  switchport access vlan 20
  mtu 9216
```

<div class="encadre astuce">
<span class="encadre-titre">💡 mtu 9216 : trames jumbo pour le trafic de stockage</span>
Le trafic iSCSI bénéficie de trames étendues (jumbo frames) réduisant la surcharge de traitement par paquet — à activer de façon cohérente sur l'ensemble du chemin réseau dédié au stockage (switch ET contrôleurs SAN ET interfaces réseau des serveurs), jamais partiellement.
</div>

## 36.5 Étape 4 — Cluster de virtualisation avec stockage partagé (exemple Hyper-V)

```powershell
# Configuration de l'initiateur iSCSI sur chaque hote de virtualisation
Set-Service -Name MSiSCSI -StartupType Automatic
Start-Service MSiSCSI
New-IscsiTargetPortal -TargetPortalAddress 10.120.20.10
Get-IscsiTarget | Connect-IscsiTarget -IsPersistent $true -IsMultipathEnabled $true

# Formation du cluster de basculement sur le stockage SAN partage
New-Cluster -Name "CLUSTER-DATACENTER" -Node "HOTE-01","HOTE-02","HOTE-03","HOTE-04" -StaticAddress 10.120.30.20
Test-Cluster -Node "HOTE-01","HOTE-02","HOTE-03","HOTE-04"
```

## 36.6 Étape 5 — Redondance électrique 2N

<div class="encadre astuce">
<span class="encadre-titre">💡 Câblage électrique complet en 2N</span>
Chaque serveur/switch dispose de 2 blocs d'alimentation, chacun raccordé à une **chaîne électrique totalement indépendante** :
</div>

```
Chaine A : Arrivee electrique A -> Onduleur on-line A (100% de la charge) -> PDU rack A -> Bloc d'alimentation 1 de chaque equipement
Chaine B : Arrivee electrique B -> Onduleur on-line B (100% de la charge) -> PDU rack B -> Bloc d'alimentation 2 de chaque equipement
```

Vérification de conformité : chaque équipement critique (spine, leaf, serveur, baie SAN) doit apparaître deux fois dans l'inventaire des chaînes électriques (une fois chaîne A, une fois chaîne B), jamais une seule.

## 36.7 Étape 6 — Vidéosurveillance exhaustive sans angle mort

1. Adressage : `10.120.40.10` à `10.120.40.73` (sous-réseau `10.120.40.0/26`).
2. Une caméra par allée (froide et chaude) de chaque rangée de baies, niveau **Identification** (250 px/m) systématique, plus une caméra par accès/sas de sécurité.
3. Intégration au contrôle d'accès biométrique multi-facteurs : chaque ouverture de baie individuelle génère un événement corrélé à la séquence vidéo (chapitre 23).
4. Audit de couverture : faire le tour physique complet de la salle caméra par caméra, confirmer visuellement l'absence de zone non couverte entre deux champs de vision adjacents.

## 36.8 Étape 7 — Tests de validation

<div class="encadre astuce">
<span class="encadre-titre">💡 Checklist de recette</span>

1. Débrancher un spine : vérifier la redistribution automatique du trafic via les leafs restants (ECMP), sans coupure de service.
2. Débrancher une chaîne électrique complète (A ou B) : vérifier la continuité totale de tous les équipements (test 2N réel, pas seulement documenté).
3. Simuler la panne d'une unité de climatisation : vérifier que les unités N+1 restantes maintiennent la température dans les seuils.
4. Simuler la panne d'un hôte du cluster : vérifier la migration automatique des VM critiques.
5. Vérifier l'absence d'angle mort vidéo sur l'ensemble des baies (audit physique complet).
</div>

## 36.9 Documentation finale et résumé

Dossier complet (chapitre 25) incluant le schéma détaillé de la fabrique spine-leaf, la cartographie complète de la redondance 2N (chaque équipement et son doublon associé sur les deux chaînes électriques), et les rapports de tests de bascule semestriels.

Ce dernier chapitre a démontré la configuration intégrale du niveau d'exigence technique le plus élevé du manuel : fabrique spine-leaf BGP EVPN, stockage SAN dédié, cluster de virtualisation hautement disponible, redondance 2N généralisée, et sécurité physique exhaustive.

## Conclusion du manuel

Ce manuel a parcouru l'intégralité du cycle de vie d'un projet réseau d'entreprise, avec pour chaque brique technique la configuration complète permettant, sans connaissance préalable, de construire réellement le réseau décrit : des fondamentaux théoriques (Parties 1-2) à la conception et l'installation (Parties 3-4), la configuration multi-constructeurs intégrale (Partie 5), les serveurs (Partie 6), la cybersécurité (Partie 7), l'intégration complète de la vidéosurveillance IP (Partie 8), la supervision (Partie 9), la documentation professionnelle (Partie 10), jusqu'à onze projets d'infrastructure entièrement configurés de A à Z (Partie 11). La maîtrise durable de ces compétences se construit par la pratique répétée sur des projets réels, la veille technologique constante, et le respect rigoureux des normes et bonnes pratiques présentées tout au long de cet ouvrage.
