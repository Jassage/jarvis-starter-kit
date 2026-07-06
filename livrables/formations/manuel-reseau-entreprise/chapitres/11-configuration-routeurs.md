<div class="chapitre-titre-num">CHAPITRE 11</div>

# Configuration des routeurs

## Objectifs pédagogiques

Configurer intégralement deux routeurs cœur redondants (VRRP), le routage dynamique OSPF, le NAT vers Internet, et un tunnel VPN site-à-site complet vers une agence distante — configuration complète de bout en bout, pas de fragments isolés.

## Prérequis

Chapitres 1-10.

## 11.1 Scénario du chapitre

<div class="encadre astuce">
<span class="encadre-titre">💡 Un siège et une agence, entièrement connectés et redondants</span>
Ce chapitre configure deux routeurs cœur au siège (R-CORE-01 actif, R-CORE-02 secours, redondance VRRP sur le VLAN 10), un routage OSPF entre eux et le reste du réseau interne, le partage de connexion Internet (NAT), et un tunnel VPN IPsec site-à-site vers un routeur d'agence (R-AGENCE-01).
</div>

## 11.2 Étape 1 — Premier accès et configuration de base (R-CORE-01)

```
Router> enable
Router# configure terminal
Router(config)# hostname R-CORE-01
R-CORE-01(config)# enable secret MotDePasseAdminSolide2026!
R-CORE-01(config)# service password-encryption
R-CORE-01(config)# ip domain-name entreprise.local
R-CORE-01(config)# crypto key generate rsa modulus 2048
R-CORE-01(config)# line vty 0 15
R-CORE-01(config-line)# transport input ssh
R-CORE-01(config-line)# login local
R-CORE-01(config-line)# exit
R-CORE-01(config)# username admin privilege 15 secret MotDePasseAdminSolide2026!
```

## 11.3 Étape 2 — Interfaces et sous-interfaces VLAN (router-on-a-stick)

```
R-CORE-01(config)# interface gigabitEthernet 0/0
R-CORE-01(config-if)# description Uplink-vers-switch-coeur
R-CORE-01(config-if)# no shutdown
R-CORE-01(config-if)# exit

R-CORE-01(config)# interface gigabitEthernet 0/0.10
R-CORE-01(config-subif)# description VLAN10-Bureautique
R-CORE-01(config-subif)# encapsulation dot1Q 10
R-CORE-01(config-subif)# ip address 10.10.10.2 255.255.255.0
R-CORE-01(config-subif)# exit

R-CORE-01(config)# interface gigabitEthernet 0/0.20
R-CORE-01(config-subif)# description VLAN20-Telephonie
R-CORE-01(config-subif)# encapsulation dot1Q 20
R-CORE-01(config-subif)# ip address 10.10.20.2 255.255.255.0
R-CORE-01(config-subif)# exit

R-CORE-01(config)# interface gigabitEthernet 0/1
R-CORE-01(config-if)# description WAN-Internet
R-CORE-01(config-if)# ip address 203.0.113.2 255.255.255.248
R-CORE-01(config-if)# no shutdown
```

## 11.4 Étape 3 — VRRP (redondance de passerelle)

**Sur R-CORE-01 (priorité haute, actif) :**

```
R-CORE-01(config)# interface gigabitEthernet 0/0.10
R-CORE-01(config-subif)# vrrp 10 ip 10.10.10.1
R-CORE-01(config-subif)# vrrp 10 priority 110
R-CORE-01(config-subif)# vrrp 10 preempt
R-CORE-01(config-subif)# exit
R-CORE-01(config)# interface gigabitEthernet 0/0.20
R-CORE-01(config-subif)# vrrp 20 ip 10.10.20.1
R-CORE-01(config-subif)# vrrp 20 priority 110
R-CORE-01(config-subif)# vrrp 20 preempt
```

**Sur R-CORE-02 (priorité basse, secours) — configuration strictement identique sauf :**

```
R-CORE-02(config)# interface gigabitEthernet 0/0.10
R-CORE-02(config-subif)# ip address 10.10.10.3 255.255.255.0
R-CORE-02(config-subif)# vrrp 10 ip 10.10.10.1
R-CORE-02(config-subif)# vrrp 10 priority 100
R-CORE-02(config-subif)# exit
R-CORE-02(config)# interface gigabitEthernet 0/0.20
R-CORE-02(config-subif)# ip address 10.10.20.3 255.255.255.0
R-CORE-02(config-subif)# vrrp 20 ip 10.10.20.1
R-CORE-02(config-subif)# vrrp 20 priority 100
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ preempt uniquement sur le routeur destiné à rester actif en priorité</span>
Rappel du chapitre 11 théorique : sans `preempt` sur R-CORE-01, celui-ci ne reprendrait pas automatiquement son rôle actif après une panne suivie d'un retour en service — vérifier cette option sur les deux routeurs si un rebasculement automatique est souhaité des deux côtés.
</div>

## 11.5 Étape 4 — OSPF (identique sur les deux routeurs cœur)

```
R-CORE-01(config)# router ospf 1
R-CORE-01(config-router)# router-id 1.1.1.1
R-CORE-01(config-router)# network 10.10.0.0 0.0.255.255 area 0
R-CORE-01(config-router)# passive-interface gigabitEthernet 0/0.10
R-CORE-01(config-router)# passive-interface gigabitEthernet 0/0.20
R-CORE-01(config-router)# exit
```

<div class="encadre astuce">
<span class="encadre-titre">💡 passive-interface : annoncer le réseau sans envoyer d'annonces OSPF inutiles vers les postes</span>
Les VLAN utilisateurs (10, 20) doivent être connus du routage (`network`), mais aucun poste de travail ne doit recevoir de paquets OSPF — `passive-interface` publie la route sans émettre le protocole sur ces interfaces terminales.
</div>

## 11.6 Étape 5 — NAT vers Internet

```
R-CORE-01(config)# access-list 1 permit 10.10.0.0 0.0.255.255
R-CORE-01(config)# interface gigabitEthernet 0/1
R-CORE-01(config-if)# ip nat outside
R-CORE-01(config-if)# exit
R-CORE-01(config)# interface gigabitEthernet 0/0.10
R-CORE-01(config-subif)# ip nat inside
R-CORE-01(config-subif)# exit
R-CORE-01(config)# interface gigabitEthernet 0/0.20
R-CORE-01(config-subif)# ip nat inside
R-CORE-01(config-subif)# exit
R-CORE-01(config)# ip nat inside source list 1 interface gigabitEthernet 0/1 overload
R-CORE-01(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
```

## 11.7 Étape 6 — VPN IPsec site-à-site vers l'agence (R-AGENCE-01)

**Sur R-CORE-01 (siège) :**

```
R-CORE-01(config)# crypto isakmp policy 10
R-CORE-01(config-isakmp)# encryption aes 256
R-CORE-01(config-isakmp)# authentication pre-share
R-CORE-01(config-isakmp)# group 14
R-CORE-01(config-isakmp)# hash sha256
R-CORE-01(config-isakmp)# exit
R-CORE-01(config)# crypto isakmp key CleVpnPartagee2026! address 198.51.100.10

R-CORE-01(config)# crypto ipsec transform-set TSET esp-aes 256 esp-sha256-hmac
R-CORE-01(config)# crypto ipsec security-association lifetime seconds 3600

R-CORE-01(config)# access-list 110 permit ip 10.10.0.0 0.0.255.255 10.20.0.0 0.0.255.255

R-CORE-01(config)# crypto map VPN-AGENCE 10 ipsec-isakmp
R-CORE-01(config-crypto-map)# set peer 198.51.100.10
R-CORE-01(config-crypto-map)# set transform-set TSET
R-CORE-01(config-crypto-map)# match address 110
R-CORE-01(config-crypto-map)# exit

R-CORE-01(config)# interface gigabitEthernet 0/1
R-CORE-01(config-if)# crypto map VPN-AGENCE
```

**Sur R-AGENCE-01 (agence, configuration miroir) :**

```
R-AGENCE-01(config)# crypto isakmp policy 10
R-AGENCE-01(config-isakmp)# encryption aes 256
R-AGENCE-01(config-isakmp)# authentication pre-share
R-AGENCE-01(config-isakmp)# group 14
R-AGENCE-01(config-isakmp)# hash sha256
R-AGENCE-01(config-isakmp)# exit
R-AGENCE-01(config)# crypto isakmp key CleVpnPartagee2026! address 203.0.113.2

R-AGENCE-01(config)# crypto ipsec transform-set TSET esp-aes 256 esp-sha256-hmac

R-AGENCE-01(config)# access-list 110 permit ip 10.20.0.0 0.0.255.255 10.10.0.0 0.0.255.255

R-AGENCE-01(config)# crypto map VPN-SIEGE 10 ipsec-isakmp
R-AGENCE-01(config-crypto-map)# set peer 203.0.113.2
R-AGENCE-01(config-crypto-map)# set transform-set TSET
R-AGENCE-01(config-crypto-map)# match address 110
R-AGENCE-01(config-crypto-map)# exit

R-AGENCE-01(config)# interface gigabitEthernet 0/1
R-AGENCE-01(config-if)# crypto map VPN-SIEGE
```

## 11.8 Étape 7 — Sauvegarde et vérifications

```
R-CORE-01# copy running-config startup-config
R-CORE-01# show vrrp brief
R-CORE-01# show ip ospf neighbor
R-CORE-01# show ip nat translations
R-CORE-01# show crypto isakmp sa
R-CORE-01# show crypto ipsec sa
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le tunnel VPN ne s'établit qu'au premier trafic intéressant</span>
`show crypto isakmp sa` peut afficher une table vide juste après la configuration : le tunnel IPsec ne se négocie qu'au moment où un paquet correspondant à l'`access-list 110` traverse réellement l'interface — générer un `ping` depuis un poste du VLAN 10 vers un poste du VLAN 20 de l'agence pour déclencher l'établissement du tunnel avant de revérifier.
</div>

## 11.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une clé pré-partagée différente entre les deux extrémités</span>
La clé `crypto isakmp key` doit être **rigoureusement identique** des deux côtés du tunnel — une seule différence de caractère (majuscule, espace) empêche silencieusement la négociation IKE Phase 1, sans message d'erreur explicite au niveau applicatif.
</div>

## 11.10 Bonnes pratiques

- Toujours tester le VRRP en débranchant physiquement le routeur actif, pas seulement en simulant la commande.
- Vérifier la correspondance exacte des `access-list` de chiffrement (110) entre les deux extrémités du VPN — elles doivent être des miroirs symétriques.
- Sauvegarder la configuration de chaque routeur immédiatement après validation.

## 11.11 Résumé du chapitre

Ce chapitre a configuré intégralement deux routeurs cœur redondants (VRRP), le routage OSPF, le NAT vers Internet, et un tunnel VPN IPsec site-à-site complet entre un siège et une agence — de la première connexion à la vérification finale.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 11.1</span>

Le siège doit ajouter un VLAN 30 (Vidéosurveillance, `10.10.30.0/24`) à la redondance VRRP existante. Écris la configuration complète à ajouter sur R-CORE-01 et R-CORE-02.
</div>

**Corrigé (R-CORE-01) :**
```
R-CORE-01(config)# interface gigabitEthernet 0/0.30
R-CORE-01(config-subif)# encapsulation dot1Q 30
R-CORE-01(config-subif)# ip address 10.10.30.2 255.255.255.0
R-CORE-01(config-subif)# vrrp 30 ip 10.10.30.1
R-CORE-01(config-subif)# vrrp 30 priority 110
R-CORE-01(config-subif)# vrrp 30 preempt
```
**Corrigé (R-CORE-02) :** identique avec `ip address 10.10.30.3` et `priority 100`, sans `preempt`.

*Chapitre suivant : la configuration Wi-Fi complète, du premier accès au portail captif.*
