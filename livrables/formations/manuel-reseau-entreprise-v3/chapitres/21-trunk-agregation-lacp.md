<div class="chapitre-titre-num">CHAPITRE 21</div>

# Trunk et agrégation LACP

## Objectifs pédagogiques

Relier SW-ACCES-01 au switch cœur SW-COEUR par un lien agrégé (deux câbles combinés en un seul lien logique via LACP) configuré en trunk, transportant l'ensemble des VLAN du projet avec un VLAN natif dédié et non utilisé.

## Prérequis

Chapitre 20.

## OBJECTIF

Un lien logique unique de 2 Gbit/s (2 × 1 Gbit/s agrégés), tolérant la panne d'un des deux câbles sans coupure de service, transportant tous les VLAN entre SW-ACCES-01 et SW-COEUR.

## MATÉRIEL NÉCESSAIRE

Deux câbles réseau certifiés (chapitre 17) entre SW-ACCES-01 et SW-COEUR.

## TOPOLOGIE

```{.uml}
[ SW-ACCES-01 ]  Gi1/0/23 ─┐
                            ├── Port-channel 1 (LACP, trunk tous VLAN)
                 Gi1/0/24 ─┘
                            │
[ SW-COEUR ]     Gi1/0/1 ─┐
                            ├── Port-channel 1 (LACP, trunk tous VLAN)
                 Gi1/0/2 ─┘
```

## ÉTAPE 1 — Configurer l'agrégation LACP côté SW-ACCES-01

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-ACCES-01)</div>

```
SW-ACCES-01(config)# interface range gigabitEthernet 1/0/23-24
SW-ACCES-01(config-if-range)# channel-group 1 mode active
SW-ACCES-01(config-if-range)# exit
```

**Explication** : `channel-group 1 mode active` place les deux ports physiques dans le groupe d'agrégation 1, en mode **active** — ce mode signifie que le switch initie activement la négociation LACP avec son voisin (l'alternative `passive` attend que l'autre extrémité initie ; au moins l'un des deux côtés d'une liaison doit être en mode `active`, jamais les deux en `passive` — sinon aucune négociation ne démarre jamais).

## ÉTAPE 2 — Configurer le trunk sur l'interface de port-channel

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-ACCES-01)</div>

```
SW-ACCES-01(config)# interface port-channel 1
SW-ACCES-01(config-if)# switchport mode trunk
SW-ACCES-01(config-if)# switchport trunk allowed vlan 10,20,25,30,40,50,60,80,90
SW-ACCES-01(config-if)# switchport trunk native vlan 999
SW-ACCES-01(config-if)# exit
```

**Explication** : la configuration trunk s'applique **une seule fois**, sur l'interface logique `port-channel 1` — jamais séparément sur chacun des deux ports physiques, qui héritent automatiquement de la configuration du groupe. `switchport trunk allowed vlan` liste explicitement chaque VLAN autorisé à traverser ce lien (jamais un simple "tous les VLAN" implicite en production — un trunk sans restriction explicite laisserait passer un VLAN futur créé par erreur). `switchport trunk native vlan 999` applique la règle de sécurité du chapitre 12.4.

## ÉTAPE 3 — Répéter la configuration miroir côté SW-COEUR

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-COEUR)</div>

```
SW-COEUR(config)# interface range gigabitEthernet 1/0/1-2
SW-COEUR(config-if-range)# channel-group 1 mode active
SW-COEUR(config-if-range)# exit
SW-COEUR(config)# interface port-channel 1
SW-COEUR(config-if)# switchport mode trunk
SW-COEUR(config-if)# switchport trunk allowed vlan 10,20,25,30,40,50,60,80,90
SW-COEUR(config-if)# switchport trunk native vlan 999
SW-COEUR(config-if)# exit
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Les deux extrémités doivent être configurées de façon strictement cohérente</span>
Une liste de VLAN autorisés différente entre les deux côtés du trunk (un VLAN oublié d'un côté) ne provoque généralement **aucune erreur visible immédiatement** — seul ce VLAN précis ne circule simplement plus sur le lien, souvent découvert bien plus tard sous forme d'un symptôme confus ("les caméras de cet étage ne remontent plus"). Toujours vérifier les deux extrémités côte à côte après configuration (VÉRIFICATION ci-dessous), jamais une seule.
</div>

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-ACCES-01# show etherchannel summary
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>

```
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SU)        LACP       Gi1/0/23(P)  Gi1/0/24(P)
```

**Interprétation** : le `(SU)` après `Po1` signifie "Layer2, in Use" (le port-channel est actif et utilisé) ; le `(P)` après chaque port physique signifie "Bundled in port-channel" (le port participe activement à l'agrégation). Un port affichant `(I)` (Independent, indépendant) au lieu de `(P)` indique une négociation LACP échouée — voir DÉPANNAGE.
</div>

```
SW-ACCES-01# show interfaces trunk
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
La commande liste `Po1` en mode trunk, avec le VLAN natif 999 et la liste complète des VLAN autorisés (`10,20,25,30,40,50,60,80,90`) — comparer cette sortie, ligne pour ligne, avec celle de SW-COEUR.
</div>

## TEST

Débrancher **un seul** des deux câbles de l'agrégation pendant un transfert réseau continu (ex. un `ping` en continu entre les deux switches sur leurs adresses de management) — le trafic doit continuer à circuler sans interruption perceptible sur le câble restant, confirmant la redondance effective de l'agrégation.

## DÉPANNAGE

### Si `show etherchannel summary` affiche des ports en `(I)` au lieu de `(P)`

1. Vérifier que **les deux côtés** du lien sont en mode `active` (ou au moins un `active` et l'autre `passive`, jamais les deux `passive`, étape 1).
2. Vérifier que les deux ports physiques d'un même groupe ont une vitesse et un duplex identiques (`show interfaces status`) — LACP refuse de regrouper des ports aux caractéristiques différentes.
3. Vérifier qu'aucun des deux ports n'est resté configuré en mode access par erreur avant la mise en place du trunk.

### Si le lien fonctionne mais un VLAN précis ne passe pas

Comparer la liste `switchport trunk allowed vlan` des deux côtés (étapes 2 et 3) — un oubli d'un seul VLAN d'un seul côté suffit à l'expliquer (voir l'encadré d'attention ci-dessus). Scénario détaillé au chapitre 43 ("VLAN incorrect").

## SAUVEGARDE

```
SW-ACCES-01# copy running-config startup-config
SW-COEUR# copy running-config startup-config
```

## 21.1 Le même résultat, entièrement en MikroTik RouterOS

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — MikroTik RouterOS</div>

```
/interface bonding add name=bond1 slaves=ether23,ether24 mode=802.3ad transmit-hash-policy=layer-2-and-3
/interface bridge port add bridge=bridge-lan interface=bond1 frame-types=admit-only-vlan-tagged

/interface bridge vlan
add bridge=bridge-lan vlan-ids=10 tagged=bond1,bridge-lan
add bridge=bridge-lan vlan-ids=20 tagged=bond1
add bridge=bridge-lan vlan-ids=25 tagged=bond1
add bridge=bridge-lan vlan-ids=30 tagged=bond1
add bridge=bridge-lan vlan-ids=40 tagged=bond1
add bridge=bridge-lan vlan-ids=50 tagged=bond1
add bridge=bridge-lan vlan-ids=60 tagged=bond1
add bridge=bridge-lan vlan-ids=80 tagged=bond1
add bridge=bridge-lan vlan-ids=90 tagged=bond1
```

**Explication** : `mode=802.3ad` est l'équivalent RouterOS du LACP Cisco ; `frame-types=admit-only-vlan-tagged` force le port à ne recevoir que du trafic déjà tagué — l'équivalent RouterOS d'un port trunk strict.

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu (vérification)</span>

```
[admin@SW-ACCES-01] > /interface bonding monitor bond1
  status: active
  active-ports: ether23,ether24
```
</div>

## Résumé du chapitre

L'agrégation LACP combine deux liens physiques en un seul lien logique redondant (`channel-group ... mode active` côté Cisco, `bonding mode=802.3ad` côté MikroTik), configuré une seule fois au niveau de l'interface logique. Le trunk qui s'y superpose transporte explicitement tous les VLAN du projet avec un VLAN natif dédié — jamais de liste de VLAN implicite, et toujours une configuration strictement identique des deux côtés du lien.

*Chapitre suivant : Spanning Tree et haute disponibilité de couche 2 — protéger le réseau contre les boucles tout en profitant de liens redondants entre switches.*
