<div class="chapitre-titre-num">CHAPITRE 10</div>

# Configuration des switches

## Objectifs pédagogiques

Configurer intégralement, de zéro à la mise en production, un switch administrable : premier accès, VLAN, trunk, agrégation LACP, Spanning Tree, Port Security et QoS — avec la configuration complète (jamais un simple extrait) en Cisco IOS puis en MikroTik RouterOS.

## Prérequis

Chapitres 1-9.

## 10.1 Scénario du chapitre

<div class="encadre astuce">
<span class="encadre-titre">💡 Un exemple unique et complet, suivi de bout en bout</span>
Plutôt que des fragments de commandes isolés par concept, ce chapitre configure entièrement **un switch d'accès réel** : 3 VLAN (10 Bureautique, 20 Téléphonie IP, 99 Management), relié par un double lien agrégé (LACP) à un switch cœur, avec Spanning Tree, Port Security sur les ports utilisateurs, et QoS pour la voix. Chaque étape s'enchaîne sur la précédente, exactement comme sur un chantier réel.
</div>

## 10.2 Étape 1 — Premier accès au switch

1. Relier un ordinateur portable au **port console** du switch (câble RJ45-vers-USB fourni par le constructeur), jamais un port réseau classique pour ce premier accès.
2. Ouvrir un logiciel d'émulation de terminal (PuTTY sous Windows, ou l'application Terminal sous macOS/Linux).
3. Paramètres de connexion série : **9600 bauds, 8 bits de données, pas de parité, 1 bit d'arrêt, pas de contrôle de flux** — ces valeurs sont quasi universelles sur les équipements Cisco/MikroTik en accès console.
4. Mettre le switch sous tension : les messages de démarrage (bootloader, chargement de l'IOS) défilent dans le terminal.
5. Si le switch n'est pas vierge (déjà configuré par un usage antérieur), le réinitialiser aux réglages d'usine avant de commencer :

```
Switch> enable
Switch# erase startup-config
Switch# reload
```

## 10.3 Étape 2 — Configuration de base (Cisco IOS)

```
Switch> enable
Switch# configure terminal
Switch(config)# hostname SW-ACCES-01
SW-ACCES-01(config)# enable secret MotDePasseAdminSolide2026!
SW-ACCES-01(config)# service password-encryption
SW-ACCES-01(config)# line console 0
SW-ACCES-01(config-line)# password MotDePasseConsole2026!
SW-ACCES-01(config-line)# login
SW-ACCES-01(config-line)# exit
SW-ACCES-01(config)# line vty 0 15
SW-ACCES-01(config-line)# password MotDePasseDistant2026!
SW-ACCES-01(config-line)# login
SW-ACCES-01(config-line)# transport input ssh
SW-ACCES-01(config-line)# exit
SW-ACCES-01(config)# ip domain-name entreprise.local
SW-ACCES-01(config)# crypto key generate rsa modulus 2048
SW-ACCES-01(config)# banner motd # Acces reserve au personnel autorise #
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi générer une clé RSA avant d'autoriser SSH</span>
`transport input ssh` (plutôt que telnet, non chiffré) exige une paire de clés RSA déjà générée sur l'équipement — sans cette étape, la commande échoue silencieusement et l'accès distant reste indisponible.
</div>

## 10.4 Étape 3 — Adresse IP de gestion (VLAN Management)

```
SW-ACCES-01(config)# vlan 99
SW-ACCES-01(config-vlan)# name Management
SW-ACCES-01(config-vlan)# exit
SW-ACCES-01(config)# interface vlan 99
SW-ACCES-01(config-if)# ip address 10.10.99.10 255.255.255.224
SW-ACCES-01(config-if)# no shutdown
SW-ACCES-01(config-if)# exit
SW-ACCES-01(config)# ip default-gateway 10.10.99.1
```

## 10.5 Étape 4 — Création de tous les VLAN du projet

```
SW-ACCES-01(config)# vlan 10
SW-ACCES-01(config-vlan)# name Bureautique
SW-ACCES-01(config-vlan)# exit
SW-ACCES-01(config)# vlan 20
SW-ACCES-01(config-vlan)# name Telephonie-IP
SW-ACCES-01(config-vlan)# exit
```

## 10.6 Étape 5 — Configuration complète des ports d'accès utilisateurs

<div class="encadre astuce">
<span class="encadre-titre">💡 Un poste et son téléphone IP partagent le même port physique</span>
Un téléphone IP de bureau intègre généralement un petit switch interne à 2 ports : le câble mural arrive dans le téléphone (VLAN voix), et le poste de travail se branche ensuite dans le port du téléphone (VLAN data) — un seul câble et un seul port switch suffisent pour les deux usages, grâce au **VLAN voix auxiliaire**.
</div>

```
SW-ACCES-01(config)# interface range gigabitEthernet 1/0/1-20
SW-ACCES-01(config-if-range)# switchport mode access
SW-ACCES-01(config-if-range)# switchport access vlan 10
SW-ACCES-01(config-if-range)# switchport voice vlan 20
SW-ACCES-01(config-if-range)# spanning-tree portfast
SW-ACCES-01(config-if-range)# spanning-tree bpduguard enable
SW-ACCES-01(config-if-range)# exit
```

## 10.7 Étape 6 — Trunk et agrégation LACP vers le switch cœur

```
SW-ACCES-01(config)# interface range gigabitEthernet 1/0/23-24
SW-ACCES-01(config-if-range)# channel-group 1 mode active
SW-ACCES-01(config-if-range)# exit
SW-ACCES-01(config)# interface port-channel 1
SW-ACCES-01(config-if)# switchport mode trunk
SW-ACCES-01(config-if)# switchport trunk allowed vlan 10,20,99
SW-ACCES-01(config-if)# switchport trunk native vlan 999
SW-ACCES-01(config-if)# exit
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le VLAN 999 (natif) doit exister mais n'être utilisé par aucun équipement réel</span>
```
SW-ACCES-01(config)# vlan 999
SW-ACCES-01(config-vlan)# name Native-Non-Utilise
SW-ACCES-01(config-vlan)# exit
```
Cette étape, facile à oublier, est indispensable : sans elle, la commande `switchport trunk native vlan 999` référence un VLAN inexistant.
</div>

## 10.8 Étape 7 — Spanning Tree (RSTP)

```
SW-ACCES-01(config)# spanning-tree mode rapid-pvst
SW-ACCES-01(config)# spanning-tree vlan 10,20,99 priority 32768
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Priorité 32768 : ce switch d'accès ne doit jamais devenir la racine (root)</span>
La priorité par défaut la plus basse (souvent 4096 ou 8192) est réservée au switch cœur, désigné root bridge — un switch d'accès conserve la priorité par défaut (32768) pour ne jamais concurrencer ce rôle.
</div>

## 10.9 Étape 8 — Port Security sur tous les ports utilisateurs

```
SW-ACCES-01(config)# interface range gigabitEthernet 1/0/1-20
SW-ACCES-01(config-if-range)# switchport port-security
SW-ACCES-01(config-if-range)# switchport port-security maximum 2
SW-ACCES-01(config-if-range)# switchport port-security violation restrict
SW-ACCES-01(config-if-range)# switchport port-security mac-address sticky
SW-ACCES-01(config-if-range)# exit
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Maximum 2, pas 1</span>
Le poste ET le téléphone IP partagent le même port (étape 10.6) — fixer la limite à 1 bloquerait systématiquement le second appareil détecté sur le port.
</div>

## 10.10 Étape 9 — QoS pour la voix sur IP

```
SW-ACCES-01(config)# mls qos
SW-ACCES-01(config)# interface range gigabitEthernet 1/0/1-20
SW-ACCES-01(config-if-range)# mls qos trust cos
SW-ACCES-01(config-if-range)# auto qos voip cisco-phone
SW-ACCES-01(config-if-range)# exit
```

## 10.11 Étape 10 — Sauvegarde de la configuration

```
SW-ACCES-01# copy running-config startup-config
SW-ACCES-01# copy running-config tftp://10.10.99.50/backup-SW-ACCES-01.cfg
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ running-config vs startup-config</span>
Toute commande tapée jusqu'ici modifie uniquement la configuration **active** (`running-config`), perdue au prochain redémarrage si elle n'est pas sauvegardée dans la configuration **de démarrage** (`startup-config`) via `copy running-config startup-config` — une coupure électrique avant cette étape effacerait tout le travail réalisé.
</div>

## 10.12 Étape 11 — Vérifications finales

```
SW-ACCES-01# show vlan brief
SW-ACCES-01# show interfaces status
SW-ACCES-01# show etherchannel summary
SW-ACCES-01# show spanning-tree summary
SW-ACCES-01# show port-security
```

## 10.13 Le même switch, entièrement configuré en MikroTik RouterOS

```
/system identity set name=SW-ACCES-01

/interface bridge add name=bridge-lan vlan-filtering=yes protocol-mode=rstp

# VLAN
/interface vlan add name=VLAN99-Management interface=bridge-lan vlan-id=99
/ip address add address=10.10.99.11/27 interface=VLAN99-Management
/ip route add gateway=10.10.99.1

# Ports d'acces (postes + telephones IP, VLAN 10 natif + VLAN voix 20 tague)
/interface bridge port
add bridge=bridge-lan interface=ether1 pvid=10
add bridge=bridge-lan interface=ether2 pvid=10
add bridge=bridge-lan interface=ether20 pvid=10

# Agregation LACP vers le switch coeur
/interface bonding add name=bond1 slaves=ether23,ether24 mode=802.3ad
/interface bridge port add bridge=bridge-lan interface=bond1 frame-types=admit-only-vlan-tagged

/interface bridge vlan
add bridge=bridge-lan vlan-ids=10 tagged=bond1 untagged=ether1,ether2,ether20
add bridge=bridge-lan vlan-ids=20 tagged=bond1,ether1,ether2,ether20
add bridge=bridge-lan vlan-ids=99 tagged=bond1,bridge-lan

# Port security (limite d'adresses MAC apprises par port)
/interface bridge port
set [find interface=ether1] learn=yes horizon=0

/ip services set telnet disabled=yes
/ip services set www disabled=yes
/user set admin password=MotDePasseAdminSolide2026!

/system backup save name=backup-SW-ACCES-01
```

## 10.14 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier `no shutdown` sur une interface VLAN Cisco</span>
Une interface VLAN nouvellement créée sur un switch Cisco reste administrativement désactivée par défaut — sans `no shutdown` (étape 10.4), l'adresse IP de management configurée reste injoignable, un oubli fréquent qui fait perdre du temps en diagnostic.
</div>

## 10.15 Bonnes pratiques

- Toujours sauvegarder (`startup-config` + export externe) immédiatement après toute configuration validée.
- Toujours vérifier `show interfaces status` après le câblage physique pour confirmer que chaque port attendu est bien "connected".
- Ne jamais activer Telnet ou HTTP non chiffré sur un équipement de production.

## 10.16 Résumé du chapitre

Ce chapitre a configuré intégralement un switch d'accès réel, de la première connexion console à la sauvegarde finale : VLAN, ports voix/data partagés, trunk agrégé en LACP, RSTP, Port Security et QoS — en Cisco IOS et en MikroTik RouterOS.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 10.1</span>

Un second switch d'accès (SW-ACCES-02) doit être configuré à l'identique, avec l'adresse de management `10.10.99.12`. Écris la commande Cisco IOS correspondante pour cette seule différence.
</div>

**Corrigé :**
```
SW-ACCES-02(config)# interface vlan 99
SW-ACCES-02(config-if)# ip address 10.10.99.12 255.255.255.224
SW-ACCES-02(config-if)# no shutdown
```

*Chapitre suivant : la configuration complète des routeurs (routage, VRRP, NAT, VPN).*
