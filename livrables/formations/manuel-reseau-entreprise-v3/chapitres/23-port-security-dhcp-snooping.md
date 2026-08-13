<div class="chapitre-titre-num">CHAPITRE 23</div>

# Port Security, DHCP Snooping et durcissement

## Objectifs pédagogiques

Limiter le nombre d'adresses MAC autorisées par port utilisateur, bloquer tout serveur DHCP non autorisé branché par erreur ou malveillance, et fermer systématiquement tout port physique inutilisé — trois mesures de durcissement de base appliquées à SW-ACCES-01 avant sa mise en production.

## Prérequis

Chapitre 22.

## OBJECTIF

Empêcher qu'un appareil non autorisé branché sur un port utilisateur puisse librement rejoindre le réseau, qu'un serveur DHCP parasite (volontaire ou accidentel, chapitre 6.1) ne perturbe l'attribution d'adresses IP, et qu'un port physique inutilisé ne reste une porte d'entrée ouverte.

## ÉTAPE 1 — Port Security sur les ports utilisateurs

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-ACCES-01)</div>

```
SW-ACCES-01(config)# interface range gigabitEthernet 1/0/1-22
SW-ACCES-01(config-if-range)# switchport port-security
SW-ACCES-01(config-if-range)# switchport port-security maximum 2
SW-ACCES-01(config-if-range)# switchport port-security violation restrict
SW-ACCES-01(config-if-range)# switchport port-security mac-address sticky
SW-ACCES-01(config-if-range)# exit
```

**Explication ligne par ligne :**

- `switchport port-security` → active la fonctionnalité sur le port ;
- `maximum 2` → autorise au plus 2 adresses MAC simultanées (le poste **et** son téléphone IP, chapitre 20 — jamais 1, qui bloquerait systématiquement le second appareil détecté) ;
- `violation restrict` → en cas de dépassement, le trafic du surplus est bloqué et un log est généré, **sans** désactiver le port entier (l'alternative `shutdown` couperait tout le port, y compris les 2 appareils légitimes déjà appris, pour un incident souvent bénin) ;
- `mac-address sticky` → les adresses MAC apprises dynamiquement sont automatiquement mémorisées dans la configuration, évitant une saisie manuelle adresse par adresse.

## ÉTAPE 2 — DHCP Snooping : bloquer tout serveur DHCP non autorisé

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-ACCES-01)</div>

```
SW-ACCES-01(config)# ip dhcp snooping
SW-ACCES-01(config)# ip dhcp snooping vlan 20,25,40,50,60
SW-ACCES-01(config)# interface port-channel 1
SW-ACCES-01(config-if)# ip dhcp snooping trust
SW-ACCES-01(config-if)# exit
```

**Explication** : `ip dhcp snooping` active la fonctionnalité globalement, puis `vlan 20,25,40,50,60` la restreint aux VLAN où un DHCP légitime doit fonctionner (le VLAN Management et le VLAN Serveurs, en adressage statique, n'ont pas besoin de cette protection). Chaque port est, par défaut, considéré **non fiable (untrusted)** dès que le DHCP Snooping est actif — un serveur DHCP répondant depuis un port utilisateur (jamais censé en héberger un) est automatiquement bloqué. Seul le port-channel 1 (vers SW-COEUR, où se trouve le vrai serveur DHCP, Volume 8) est explicitement déclaré `trust`.

<div class="encadre astuce">
<span class="encadre-titre">💡 Cette commande résout directement le scénario du chapitre 6.1</span>
Le chapitre 6.1 décrivait le risque d'un second serveur DHCP allumé par erreur sur le réseau, source de conflits d'adresses. DHCP Snooping est la réponse technique concrète à ce risque précis : toute réponse DHCP (`DHCPOFFER`, `DHCPACK`) reçue sur un port `untrusted` est automatiquement rejetée par le switch, quelle que soit son origine.
</div>

## ÉTAPE 3 — Fermer systématiquement les ports inutilisés

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-ACCES-01)</div>

```
SW-ACCES-01(config)# interface range gigabitEthernet 1/0/23-24
SW-ACCES-01(config)# interface range gigabitEthernet 1/0/1-22
SW-ACCES-01(config)# vlan 998
SW-ACCES-01(config-vlan)# name Ports-Non-Utilises
SW-ACCES-01(config-vlan)# exit
```

En pratique, sur ce switch précis, tous les ports sont déjà attribués (22 ports utilisateurs + 2 en port-channel) — la procédure générale à appliquer sur tout switch comportant des ports physiquement libres est la suivante, systématiquement :

```
SW-ACCES-01(config)# interface range gigabitEthernet 1/0/25-48
SW-ACCES-01(config-if-range)# switchport mode access
SW-ACCES-01(config-if-range)# switchport access vlan 998
SW-ACCES-01(config-if-range)# shutdown
SW-ACCES-01(config-if-range)# exit
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un port inutilisé mais actif et sur le VLAN de production est une porte ouverte</span>
Un port physique libre, laissé actif et attribué au VLAN Utilisateurs "au cas où", permet à quiconque a un accès physique bref au local (visiteur, prestataire, intrus) de brancher directement un appareil sur le réseau interne. Placer systématiquement chaque port inutilisé sur un VLAN dédié sans aucune route utile (VLAN 998, distinct du VLAN natif 999) **et** le désactiver (`shutdown`) offre une double protection — même une réactivation accidentelle du port ne donnerait accès à rien d'exploitable.
</div>

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-ACCES-01# show port-security interface gigabitEthernet 1/0/1
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>

```
Port Security              : Enabled
Port Status                : Secure-up
Violation Mode              : Restrict
Maximum MAC Addresses       : 2
Total MAC Addresses         : 2
```
</div>

```
SW-ACCES-01# show ip dhcp snooping binding
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
Une table listant chaque bail DHCP actif appris sur les ports non fiables, avec l'adresse MAC, l'adresse IP attribuée, le VLAN et le port concerné — cette table constitue elle-même la base d'une protection complémentaire (Dynamic ARP Inspection), hors du périmètre strict de ce chapitre mais mentionnée pour référence au chapitre 40.
</div>

## DÉPANNAGE

### Si un port légitime passe en `err-disabled` après le branchement d'un troisième appareil

Comportement attendu si `violation shutdown` avait été choisi au lieu de `restrict` (étape 1) — avec `restrict` comme configuré ici, le port reste actif pour les 2 appareils déjà appris, seul le troisième est bloqué silencieusement (visible dans les logs, pas de coupure de service pour les appareils légitimes).

### Si un poste ne reçoit plus d'adresse IP après l'activation de DHCP Snooping

Vérifier que le port-channel vers SW-COEUR est bien marqué `trust` (étape 2) — un oubli de cette commande fait rejeter **toutes** les réponses DHCP légitimes, pas seulement celles d'un éventuel serveur non autorisé, un scénario detaillé au chapitre 42 ("DHCP inaccessible").

## SAUVEGARDE

```
SW-ACCES-01# copy running-config startup-config
```

## CHECKLIST DE FIN

- [ ] Port Security actif sur tous les ports utilisateurs, maximum 2 adresses MAC, violation en mode restrict
- [ ] DHCP Snooping actif sur les VLAN concernés, port-channel vers le cœur marqué trust
- [ ] Tous les ports physiquement inutilisés placés sur un VLAN dédié sans route utile et désactivés
- [ ] Configuration sauvegardée

## 23.1 Le même résultat, entièrement en MikroTik RouterOS

<div class="encadre attention">
<span class="encadre-titre">⚠️ RouterOS n'a pas d'équivalent direct nommé "DHCP Snooping"</span>
Contrairement à Cisco IOS, RouterOS ne propose pas une fonctionnalité unique portant ce nom — la protection équivalente s'obtient par une combinaison de règles de filtrage de bridge bloquant explicitement le trafic DHCP serveur (ports UDP 67) entrant depuis les ports non autorisés, une différence de conception entre constructeurs à documenter clairement plutôt que de supposer une fonctionnalité identique partout (principe du chapitre 55).
</div>

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — MikroTik RouterOS</div>

```
/interface bridge port
set [find interface=ether1] learn=yes
set [find interface=ether1] fast-leave=yes

/interface bridge filter
add chain=forward action=drop protocol=udp dst-port=67 in-interface=ether1 comment="Bloque un serveur DHCP non autorise sur ce port"
add chain=forward action=drop protocol=udp dst-port=67 in-interface=ether2 comment="Bloque un serveur DHCP non autorise sur ce port"

/interface bridge port
set [find interface=ether1] auto-isolate=no
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu (vérification)</span>

```
[admin@SW-ACCES-01] > /interface bridge filter print
 0   chain=forward action=drop protocol=udp dst-port=67 in-interface=ether1
```
</div>

## Résumé du chapitre

Port Security limite le nombre d'adresses MAC autorisées par port (2, pour le poste et son téléphone IP), en mode `restrict` pour ne jamais couper les appareils déjà légitimement connectés. DHCP Snooping bloque toute réponse DHCP provenant d'un port non explicitement déclaré fiable, résolvant directement le risque de serveur DHCP parasite. Chaque port physique inutilisé est placé sur un VLAN dédié sans route utile et désactivé, plutôt que laissé actif "au cas où".

*Chapitre suivant : sauvegarde, vérification et dépannage du switch — clôturer la configuration de SW-ACCES-01 et vérifier l'ensemble du Volume 7.*
