<div class="chapitre-titre-num">CHAPITRE 25</div>

# Configuration de base d'un routeur

## Objectifs pédagogiques

Configurer un routeur de bordure (frontière entre le réseau interne et Internet, chapitre 1.6) avec ses interfaces, une route par défaut vers le fournisseur d'accès, et une route statique de retour vers le réseau interne — le socle du Volume 8.

## Prérequis

Volume 7.

## Scénario du volume

Ce volume configure **RTR-BORDURE-01**, le routeur qui relie le réseau interne (via SW-COEUR) à Internet (chapitre 14.1 — ici traité comme un équipement distinct du firewall, qui fait l'objet du Volume 9 séparément, conformément au critère de décision du chapitre 14.1 pour un projet de taille moyenne à grande). Une liaison point-à-point dédiée relie RTR-BORDURE-01 à SW-COEUR, sur un nouveau segment réservé du plan d'adressage (chapitre 11.4) : **VLAN/segment 99, `10.10.99.0/24`**, découpé en blocs `/30` pour chaque liaison point-à-point du projet (cohérent avec la convention "troisième octet = usage" posée au chapitre 8.3).

## PLAN D'ADRESSAGE

| Liaison | Réseau | RTR-BORDURE-01 | SW-COEUR |
|---|---|---|---|
| Interne (point-à-point) | 10.10.99.0/30 | 10.10.99.1 | 10.10.99.2 |
| WAN (fournisseur d'accès) | 203.0.113.0/30 (adresse de documentation, RFC 5737 — à remplacer par la plage réelle fournie par l'opérateur) | 203.0.113.2 | — (passerelle opérateur : 203.0.113.1) |

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi 203.0.113.0/24 dans les exemples de ce manuel</span>
La plage `203.0.113.0/24` fait partie des plages **réservées à la documentation** par la RFC 5737 (avec `192.0.2.0/24` et `198.51.100.0/24`) — jamais routée sur Internet, jamais attribuable à un vrai client. Ce manuel l'utilise systématiquement pour tout exemple d'adresse publique, exactement comme un formulaire professionnel utilise "Jean Dupont" plutôt qu'une vraie identité. L'adresse publique réelle d'un projet est toujours celle fournie par le fournisseur d'accès au moment de l'installation, jamais inventée.
</div>

## OBJECTIF

RTR-BORDURE-01 route correctement le trafic entre le réseau interne (`10.10.0.0/16`, chapitre 8.3) et Internet, avec SW-COEUR configuré en miroir pour renvoyer tout trafic externe vers RTR-BORDURE-01.

## ÉTAPE 1 — Accès initial et configuration de base

Reprendre exactement la méthode du chapitre 19 (accès console, hostname, mots de passe, SSH) — non répétée ici pour éviter la duplication, seul le résultat final (`RTR-BORDURE-01#`, accès SSH fonctionnel) est supposé acquis pour la suite de ce chapitre.

## ÉTAPE 2 — Configurer l'interface WAN

<div class="ou-executer">À EXÉCUTER SUR LE ROUTEUR — Cisco IOS (RTR-BORDURE-01)</div>

```
RTR-BORDURE-01(config)# interface GigabitEthernet0/0
RTR-BORDURE-01(config-if)# description WAN - Lien operateur
RTR-BORDURE-01(config-if)# ip address 203.0.113.2 255.255.255.252
RTR-BORDURE-01(config-if)# no shutdown
RTR-BORDURE-01(config-if)# exit
```

## ÉTAPE 3 — Configurer l'interface interne (liaison vers SW-COEUR)

<div class="ou-executer">À EXÉCUTER SUR LE ROUTEUR — Cisco IOS (RTR-BORDURE-01)</div>

```
RTR-BORDURE-01(config)# interface GigabitEthernet0/1
RTR-BORDURE-01(config-if)# description Liaison interne vers SW-COEUR
RTR-BORDURE-01(config-if)# ip address 10.10.99.1 255.255.255.252
RTR-BORDURE-01(config-if)# no shutdown
RTR-BORDURE-01(config-if)# exit
```

## ÉTAPE 4 — Configurer la route par défaut (vers Internet)

<div class="ou-executer">À EXÉCUTER SUR LE ROUTEUR — Cisco IOS (RTR-BORDURE-01)</div>

```
RTR-BORDURE-01(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
```

**Explication** : une route par défaut (`0.0.0.0 0.0.0.0`, qui correspond à "toute destination non couverte par une route plus spécifique") dirige tout le trafic sans correspondance plus précise vers la passerelle du fournisseur d'accès — indispensable puisqu'un routeur de bordure ne peut évidemment pas connaître individuellement chacune des adresses de destination possibles sur Internet.

## ÉTAPE 5 — Configurer la route statique de retour (vers le réseau interne)

<div class="ou-executer">À EXÉCUTER SUR LE ROUTEUR — Cisco IOS (RTR-BORDURE-01)</div>

```
RTR-BORDURE-01(config)# ip route 10.10.0.0 255.255.0.0 10.10.99.2
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Une seule route statique suffit pour tout le réseau interne, grâce au plan IP du chapitre 8</span>
Parce que l'intégralité du réseau interne (tous les VLAN 10 à 90) est comprise dans un unique bloc `10.10.0.0/16` (convention posée au chapitre 8.3), une **seule** route statique de retour suffit pour couvrir tous les VLAN d'un coup, plutôt que 9 routes individuelles (une par VLAN) — un bénéfice concret et direct de la convention d'adressage choisie dès la conception.
</div>

## ÉTAPE 6 — Configurer SW-COEUR en miroir

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-COEUR)</div>

```
SW-COEUR(config)# interface GigabitEthernet1/0/3
SW-COEUR(config-if)# description Liaison vers RTR-BORDURE-01
SW-COEUR(config-if)# no switchport
SW-COEUR(config-if)# ip address 10.10.99.2 255.255.255.252
SW-COEUR(config-if)# no shutdown
SW-COEUR(config-if)# exit
SW-COEUR(config)# ip route 0.0.0.0 0.0.0.0 10.10.99.1
```

**Explication** : `no switchport` transforme un port de switch habituellement de couche 2 en une véritable interface routée de couche 3 — nécessaire puisque cette liaison point-à-point n'est pas un VLAN à faire circuler sur un trunk, mais une connexion directe entre deux équipements routeurs. La route par défaut de SW-COEUR dirige tout trafic non local (donc, tout trafic vers Internet) vers RTR-BORDURE-01.

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR LE ROUTEUR — Cisco IOS</div>

```
RTR-BORDURE-01# show ip route
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>

```
Gateway of last resort is 203.0.113.1 to network 0.0.0.0

S*   0.0.0.0/0 [1/0] via 203.0.113.1
S    10.10.0.0/16 [1/0] via 10.10.99.2
C    10.10.99.0/30 is directly connected, GigabitEthernet0/1
C    203.0.113.0/30 is directly connected, GigabitEthernet0/0
```

**Interprétation** : `S*` marque la route par défaut (statique, sélectionnée comme "gateway of last resort") ; `S` marque la route statique vers le réseau interne ; `C` marque les réseaux directement connectés. Les quatre lignes doivent toutes être présentes — l'absence de la ligne `S 10.10.0.0/16` empêcherait tout retour de trafic vers le réseau interne, même si la route par défaut fonctionne correctement dans l'autre sens.
</div>

## TEST

<div class="ou-executer">À EXÉCUTER SUR LE ROUTEUR — Cisco IOS</div>

```
RTR-BORDURE-01# ping 10.10.99.2
RTR-BORDURE-01# ping 203.0.113.1
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
`Success rate is 100 percent` sur les deux commandes — confirme la connectivité de couche 3 vers SW-COEUR d'un côté et vers la passerelle opérateur de l'autre. Un test complet depuis un poste interne réel vers un site Internet public nécessite en plus le NAT (traduction d'adresse privée vers publique), configuré au chapitre 28 — sans NAT, une adresse privée `10.10.20.x` ne peut techniquement pas être routée sur Internet public, quelle que soit la qualité du routage lui-même.
</div>

## DÉPANNAGE

### Si `show ip route` n'affiche pas la route par défaut

Vérifier que la commande de l'étape 4 a bien été saisie sans faute de frappe sur les masques (`0.0.0.0 0.0.0.0`, pas `0.0.0.0 255.255.255.255` qui désignerait une route très différente).

### Si le ping vers SW-COEUR échoue

Vérifier `no shutdown` sur les deux extrémités de la liaison (étapes 3 et 6), et que les deux adresses IP appartiennent bien au même sous-réseau `/30` (`10.10.99.1` et `10.10.99.2`, chapitre 4).

## SAUVEGARDE

```
RTR-BORDURE-01# copy running-config startup-config
SW-COEUR# copy running-config startup-config
```

## 25.1 Le même résultat, entièrement en MikroTik RouterOS

<div class="ou-executer">À EXÉCUTER SUR LE ROUTEUR — MikroTik RouterOS (RTR-BORDURE-01)</div>

```
/interface ethernet set [find default-name=ether1] comment="WAN - Lien operateur"
/ip address add address=203.0.113.2/30 interface=ether1

/interface ethernet set [find default-name=ether2] comment="Liaison interne vers SW-COEUR"
/ip address add address=10.10.99.1/30 interface=ether2

/ip route add dst-address=0.0.0.0/0 gateway=203.0.113.1
/ip route add dst-address=10.10.0.0/16 gateway=10.10.99.2
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu (vérification)</span>

```
[admin@RTR-BORDURE-01] > /ip route print
 #      DST-ADDRESS        GATEWAY         DISTANCE
 0 A S  0.0.0.0/0          203.0.113.1     1
 1 A S  10.10.0.0/16       10.10.99.2      1
 2 A C  10.10.99.0/30      ether2
 3 A C  203.0.113.0/30     ether1
```

`A` signifie "active", `S` signifie "static", `C` signifie "connected" — la même lecture que les marqueurs Cisco de la section VÉRIFICATION.
</div>

## Résumé du chapitre

Un routeur de bordure a besoin, au minimum, d'une interface WAN (côté opérateur), d'une interface interne (vers le switch cœur), d'une route par défaut (tout trafic non reconnu part vers Internet) et d'une route statique de retour vers le réseau interne. Grâce à la convention d'adressage du chapitre 8 (tout le réseau interne dans un seul bloc `/16`), une seule route statique de retour suffit à couvrir l'ensemble des VLAN du projet.

*Chapitre suivant : le routage inter-VLAN et OSPF — comment le trafic circule réellement entre les VLAN via SW-COEUR, et comment plusieurs routeurs peuvent apprendre leurs routes dynamiquement plutôt que par configuration statique.*
