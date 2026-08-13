<div class="chapitre-titre-num">CHAPITRE 7</div>

# IPv6 essentiel

## Objectifs pédagogiques

Comprendre pourquoi IPv6 existe, savoir lire et compresser correctement une adresse IPv6, distinguer ses grandes catégories d'adresses, et comprendre la différence entre SLAAC et DHCPv6 — un socle suffisant pour reconnaître et interpréter de l'IPv6 sur le terrain, même si les projets de ce manuel restent, comme la grande majorité des PME haïtiennes actuellement, construits en IPv4 pur.

## Prérequis

Chapitres 4-6.

## 7.1 Pourquoi IPv6 existe

IPv4 (chapitre 4) utilise des adresses de 32 bits, ce qui plafonne le nombre total d'adresses possibles à environ 4,3 milliards — un nombre qui semblait immense dans les années 1980, mais totalement insuffisant face à la croissance d'Internet, des smartphones et des objets connectés. **IPv6** résout ce problème en portant l'adresse à **128 bits**, offrant un nombre d'adresses si gigantesque (environ 340 undécillions, soit 340 suivi de 36 zéros) qu'il rend l'épuisement d'adresses pratiquement impensable, y compris avec un usage massif du NAT devenu inutile.

<div class="encadre astuce">
<span class="encadre-titre">💡 Situation réaliste sur le terrain en Haïti</span>
À la date de rédaction de ce manuel, la très grande majorité des PME haïtiennes, de leurs fournisseurs d'accès locaux et des équipements déployés sur le marché fonctionnent en IPv4 pur, avec adressage privé + NAT (chapitre 4.2, détaillé au Volume 9). Ce chapitre construit les bases nécessaires pour reconnaître et dépanner de l'IPv6 quand il apparaît (souvent activé par défaut sur certains équipements ou services cloud), sans que ce manuel ne bâtisse ses six projets complets (Volume 16) sur de l'IPv6 — un choix pragmatique documenté, à revoir si un projet client l'exige explicitement.
</div>

## 7.2 Structure d'une adresse IPv6

Une adresse IPv6 est un nombre de 128 bits, écrit en **huit groupes de quatre chiffres hexadécimaux**, séparés par des deux-points :

```
2001:0db8:0000:0042:0000:0000:0000:0329
```

Deux règles de simplification s'appliquent systématiquement pour l'écriture courante :

1. **Les zéros de tête de chaque groupe peuvent être omis.** `0db8` devient `db8`, `0042` devient `42`.
2. **Une seule séquence continue de groupes entièrement à zéro peut être remplacée par `::`** (double deux-points), une seule fois dans toute l'adresse — jamais deux fois, car cela rendrait le nombre de groupes omis ambigu.

En appliquant ces deux règles à l'adresse ci-dessus :

```
2001:0db8:0000:0042:0000:0000:0000:0329
        ↓ (suppression des zéros de tête)
2001:db8:0:42:0:0:0:329
        ↓ (compression de la plus longue séquence de zéros, ici les 3 groupes centraux)
2001:db8:0:42::329
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Piège classique : plusieurs séquences de zéros possibles</span>
Si une adresse contient deux séquences de zéros séparées (ex. `2001:0:0:42:0:0:0:329`), seule la **plus longue** des deux peut être compressée par `::` — ici la séquence de 3 groupes (positions 5-6-7), pas celle de 2 groupes (positions 2-3) : le résultat correct est `2001:0:0:42::329` (la première séquence, plus courte, reste écrite avec des zéros explicites), et non l'inverse.
</div>

## 7.3 Les grandes catégories d'adresses IPv6

| Catégorie | Préfixe | Portée | Équivalent conceptuel en IPv4 |
|---|---|---|---|
| **Unicast global** | 2000::/3 | Routable sur Internet | Adresse publique |
| **Link-local** | fe80::/10 | Un seul segment local, jamais routée | — (n'a pas vraiment d'équivalent IPv4 direct ; toujours présente automatiquement sur chaque interface) |
| **Unique local (ULA)** | fc00::/7 (en pratique fd00::/8) | Privée, interne à une organisation, non routée sur Internet | Adresse privée RFC 1918 |
| **Multicast** | ff00::/8 | Un groupe d'appareils abonnés | Broadcast IPv4 (IPv6 n'a d'ailleurs plus du tout de broadcast, remplacé entièrement par le multicast) |
| **Loopback** | ::1 | Cette machine elle-même | 127.0.0.1 |

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi une adresse link-local existe toujours, même sans aucune configuration</span>
Dès qu'une interface réseau IPv6 s'active, elle se génère automatiquement une adresse link-local (`fe80::/10`) — sans DHCP, sans configuration manuelle. C'est ce qui permet à deux appareils IPv6 sur un même segment de se découvrir et de communiquer localement (notamment pour les protocoles de découverte de voisinage) même en l'absence de tout serveur ou routeur IPv6 configuré.
</div>

## 7.4 Le préfixe standard d'un réseau local : /64

Contrairement à IPv4 où la taille d'un sous-réseau varie énormément selon le besoin (chapitre 5), la quasi-totalité des réseaux locaux IPv6 utilisent un préfixe fixe de **/64** — les 64 bits restants (la "partie hôte") permettent à chaque appareil de se construire lui-même une adresse unique (SLAAC, section suivante), avec une marge si gigantesque qu'un découpage fin façon VLSM n'a plus aucun intérêt pratique au niveau d'un segment local.

## 7.5 SLAAC et DHCPv6

Deux mécanismes, non exclusifs, permettent à un appareil d'obtenir une adresse IPv6 :

- **SLAAC** (StateLess Address AutoConfiguration) : le routeur local diffuse périodiquement des annonces contenant le préfixe du réseau (`/64`) ; chaque appareil complète lui-même ce préfixe avec un identifiant d'interface (calculé à partir de son adresse MAC, méthode EUI-64, ou d'une valeur aléatoire pour préserver la confidentialité — les systèmes d'exploitation modernes utilisent cette seconde option par défaut) — aucun serveur central ne "distribue" une adresse précise, contrairement au DHCP IPv4.
- **DHCPv6** : un vrai serveur DHCP, comme en IPv4, distribue des adresses et/ou des options complémentaires (comme les serveurs DNS) — utilisé en complément de SLAAC (**DHCPv6 sans état**, uniquement pour les options) ou à la place de SLAAC (**DHCPv6 avec état**, pour un contrôle centralisé complet, plus proche du fonctionnement DHCP IPv4 habituel).

## 7.6 Coexistence avec IPv4 : le dual-stack

La méthode de transition la plus répandue et la plus simple à comprendre est le **dual-stack** : chaque appareil et chaque équipement réseau dispose **simultanément** d'une adresse IPv4 et d'une adresse IPv6, et choisit dynamiquement laquelle utiliser selon ce que le service distant supporte — c'est exactement ce que fait déjà, par défaut, la plupart des systèmes d'exploitation modernes et des sites web.

## Résumé du chapitre

IPv6 utilise des adresses de 128 bits en huit groupes hexadécimaux, avec deux règles de compression (zéros de tête omis, une seule séquence de zéros remplacée par `::`). Quatre grandes catégories : unicast global (public), link-local (locale automatique), unique local/ULA (privée), multicast (groupes, remplace le broadcast). Le préfixe standard d'un LAN est `/64`. SLAAC laisse chaque appareil se configurer lui-même à partir du préfixe annoncé par le routeur ; DHCPv6 centralise l'attribution comme en IPv4. Le dual-stack fait coexister IPv4 et IPv6 sur les mêmes équipements.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 7.1</span>
Compresse l'adresse suivante selon les règles de la section 7.2 : `fd00:0000:0000:0001:0000:0000:0000:00a1`.
</div>

**Corrigé :** `fd00:0:0:1::a1` — suppression des zéros de tête de chaque groupe, puis compression de la plus longue séquence de groupes à zéro (les 3 groupes en positions 5-6-7).

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 7.2</span>
Une adresse commençant par `fe80::` apparaît sur l'interface réseau d'un serveur, alors qu'aucun routeur IPv6 n'a jamais été configuré sur ce réseau. Est-ce une anomalie ?
</div>

**Corrigé :** Non — une adresse link-local (`fe80::/10`) se génère automatiquement dès qu'IPv6 est actif sur l'interface, indépendamment de toute configuration de routeur ou de serveur DHCPv6 (section 7.3).

*Fin du Volume 2 (partie théorique). Chapitre suivant : appliquer le calcul IP à un vrai projet — la méthode complète, du recensement des besoins au tableau final.*
