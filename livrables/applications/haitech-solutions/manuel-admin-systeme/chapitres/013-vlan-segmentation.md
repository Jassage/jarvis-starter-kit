<div class="chapitre-titre-num">PARTIE II · CHAPITRE 11</div>

# VLAN et segmentation logique

## Rôle des VLAN

Un VLAN (Virtual LAN) segmente logiquement un réseau physique unique en plusieurs domaines de diffusion (broadcast) distincts, sans câblage supplémentaire. C'est l'outil de segmentation le plus utilisé en entreprise : il isole le trafic par fonction (administration, serveurs, invités, caméras...), réduit la taille de chaque domaine de broadcast (donc améliore la performance) et constitue la première ligne de segmentation de sécurité, complémentaire au pare-feu (Partie III).

## Fonctionnement : ports access et ports trunk

| Type de port | Comportement | Usage |
|---|---|---|
| Access | Appartient à un seul VLAN ; les trames ne portent aucune étiquette (untagged) | Connexion d'un poste, d'une imprimante, d'une caméra |
| Trunk | Transporte plusieurs VLAN simultanément, chaque trame étiquetée (802.1Q tagged) | Liaison entre switches, ou switch vers routeur/pare-feu |

Le standard **802.1Q** insère une étiquette de 4 octets dans la trame Ethernet, contenant l'identifiant de VLAN (VLAN ID, de 1 à 4094). Un port trunk peut restreindre la liste des VLAN autorisés à transiter (« allowed vlan »), une pratique de sécurité recommandée plutôt que d'autoriser tous les VLAN par défaut.

<div class="encadre info">
<span class="encadre-titre">ℹ️ À savoir</span>
La communication entre deux VLAN différents nécessite obligatoirement un équipement de couche 3 (routeur, ou switch « L3 » capable de router) : deux hôtes sur deux VLAN distincts, même connectés au même switch physique, ne peuvent pas communiquer directement sans passer par ce routage inter-VLAN.
</div>

## Prérequis

- Un plan d'adressage IP déjà défini par fonction (Chapitre 8), chaque VLAN correspondant en général à un sous-réseau IP dédié
- Des switches manageables supportant le 802.1Q (la quasi-totalité des switches professionnels actuels)
- Une décision claire sur le VLAN natif (untagged par défaut sur les ports trunk), à sécuriser (voir recommandations de sécurité)

## Mise en place d'une segmentation VLAN

1. **Définir la liste des VLAN nécessaires** — À partir du plan d'adressage déjà établi (Chapitre 8).
2. **Créer les VLAN sur chaque switch manageable** — Numéro et nom cohérents sur l'ensemble de l'infrastructure.
3. **Configurer les ports access** — Un VLAN par port de périphérique final.
4. **Configurer les ports trunk** — Entre switches, et vers le routeur/pare-feu assurant le routage inter-VLAN.
5. **Configurer les interfaces virtuelles (SVI) sur le routeur ou switch L3** — Une passerelle par VLAN.
6. **Appliquer les règles de filtrage inter-VLAN** — Via ACL ou règles de pare-feu (Partie III), selon la politique de sécurité voulue.

## Configuration : exemples de commandes

```
# Cisco IOS — création des VLAN
vlan 10
 name ADMINISTRATION
vlan 40
 name CAMERAS
vlan 99
 name INVITES
exit

# Cisco IOS — port access (poste de travail)
interface GigabitEthernet0/1
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
 no shutdown

# Cisco IOS — port trunk (vers un autre switch ou le routeur)
interface GigabitEthernet0/24
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk allowed vlan 10,20,40,99
 no shutdown

# MikroTik RouterOS — VLAN sur bridge
/interface bridge add name=bridge-lan vlan-filtering=yes
/interface vlan add name=vlan10 vlan-id=10 interface=ether2
/ip address add address=192.168.10.1/24 interface=vlan10

# Linux — création d'une interface VLAN taguée
ip link add link eth0 name eth0.10 type vlan id 10
ip addr add 192.168.10.5/24 dev eth0.10
ip link set eth0.10 up
```

## Administration courante

- Vérifier régulièrement l'état des ports trunk (`show interfaces trunk` sur Cisco) et l'absence de VLAN non autorisé qui y transiterait
- Auditer la liste des VLAN configurés contre le plan d'adressage documenté (Partie I, Chapitre 3), pour détecter les dérives
- Surveiller les tempêtes de broadcast, souvent révélatrices d'une boucle réseau (voir Spanning Tree Protocol ci-dessous)

## Le Spanning Tree Protocol (STP) : prévenir les boucles

Le STP empêche les boucles réseau qui surviendraient si deux switches étaient reliés par plusieurs chemins redondants (une configuration pourtant recommandée pour la résilience, Partie IX). Sans STP, une boucle provoque une tempête de broadcast qui sature le réseau en quelques secondes. Le PortFast (activé uniquement sur les ports access connectés à un poste final, jamais sur un port trunk) accélère la mise en service du port en évitant les états intermédiaires du STP inutiles pour un simple poste de travail.

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Restreindre systématiquement la liste des VLAN autorisés sur chaque port trunk au strict nécessaire (`switchport trunk allowed vlan`)
- Changer le VLAN natif par défaut (VLAN 1) vers un VLAN dédié inutilisé, jamais laissé à sa valeur d'usine
- Nommer les VLAN de façon explicite et cohérente sur toute l'infrastructure (ADMINISTRATION, SERVEURS, INVITES...)
- Activer PortFast uniquement sur les ports access, jamais sur les ports trunk
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Laisser tous les VLAN autorisés par défaut sur un port trunk (« allowed vlan all »), élargissant inutilement la surface d'attaque en cas de compromission d'un switch
- Oublier de configurer le routage inter-VLAN alors qu'une communication entre deux VLAN est attendue
- Créer un VLAN uniquement sur certains switches de l'infrastructure, provoquant des incohérences difficiles à diagnostiquer
- Négliger le VLAN natif, souvent oublié dans l'étiquetage 802.1Q et exploitable pour une attaque de VLAN hopping (Partie XI)
</div>

## Dépannage

| Symptôme | Cause probable | Vérification |
|---|---|---|
| Un poste ne reçoit aucune adresse IP | Port mal configuré, mauvais VLAN access | Vérifier `show interfaces status`, la configuration du port |
| Deux VLAN qui devraient communiquer ne le peuvent pas | Absence de routage inter-VLAN ou règle de pare-feu bloquante | Vérifier les interfaces SVI et les règles de filtrage (Partie III) |
| Ralentissements généralisés, tempête de broadcast | Boucle réseau, STP mal configuré ou désactivé | Vérifier `show spanning-tree`, rechercher un câblage en boucle |

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Le VLAN hopping est une technique d'attaque qui exploite un VLAN natif mal sécurisé ou un port mal configuré en mode trunk automatique (DTP sur Cisco) pour accéder à un VLAN normalement inaccessible depuis un simple poste utilisateur. Désactiver la négociation automatique de trunk sur les ports access (`switchport nonegotiate`), changer le VLAN natif par défaut, et restreindre strictement les VLAN autorisés par trunk sont les trois mesures de base contre cette classe d'attaque.
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
Le plan d'adressage à huit VLAN documenté dans `livrables/reseau/` (Administration, Comptabilité, Direction, Caméras, Wi-Fi employés, Serveurs, Téléphonie IP, Invités) illustre exactement la méthode de ce chapitre appliquée à une mission client réelle : chaque fonction métier reçoit son propre VLAN et son propre sous-réseau, avec un VLAN Invités explicitement isolé du reste par des règles de pare-feu dédiées (Partie III). C'est le même schéma que Haitech Solutions peut répliquer pour son propre réseau interne, en adaptant simplement la liste des fonctions aux besoins réels de l'organisation.
</div>

## Résumé du chapitre

- Un VLAN segmente logiquement un réseau physique unique en domaines de diffusion distincts, sans câblage supplémentaire.
- Les ports access portent un seul VLAN non étiqueté ; les ports trunk transportent plusieurs VLAN étiquetés (802.1Q).
- La communication inter-VLAN exige un équipement de couche 3 (routeur ou switch L3).
- Restreindre les VLAN autorisés par trunk et sécuriser le VLAN natif sont deux mesures de sécurité de base.

*Chapitre suivant : le routage, statique et dynamique.*
