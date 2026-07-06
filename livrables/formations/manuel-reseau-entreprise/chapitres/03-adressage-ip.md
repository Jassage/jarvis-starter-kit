<div class="chapitre-titre-num">CHAPITRE 3</div>

# Adressage IP

## Objectifs pédagogiques

Maîtriser IPv4 et IPv6, les classes d'adresses historiques, la notation CIDR, le subnetting et le VLSM avec calculs manuels complets, ainsi que DHCP, DNS, NAT et PAT.

## Prérequis

Chapitres 1-2.

## 3.1 IPv4 : structure d'une adresse

Une adresse IPv4 est codée sur 32 bits, représentée en notation décimale pointée : quatre octets séparés par des points, chacun compris entre 0 et 255.

```
192.168.1.10
= 11000000.10101000.00000001.00001010
```

Une adresse IPv4 se compose toujours de deux parties : la **partie réseau** et la **partie hôte**, délimitées par le masque de sous-réseau.

## 3.2 Classes d'adresses IPv4 (historique)

| Classe | Plage du premier octet | Masque par défaut | Usage |
|---|---|---|---|
| A | 1 – 126 | 255.0.0.0 (/8) | Très grands réseaux |
| B | 128 – 191 | 255.255.0.0 (/16) | Réseaux moyens à grands |
| C | 192 – 223 | 255.255.255.0 (/24) | Petits réseaux |
| D | 224 – 239 | — | Multicast (chapitre 21) |
| E | 240 – 255 | — | Réservé, expérimental |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le classful addressing (classes A/B/C) est obsolète depuis 1993</span>
Depuis l'introduction du CIDR (section 3.4), plus aucun réseau moderne ne raisonne strictement "en classes" — un masque /26 est parfaitement valide au sein d'un ancien "réseau de classe C". Ce tableau reste néanmoins indispensable pour comprendre les plages d'adresses privées historiques (section 3.3) et le vocabulaire encore employé sur le terrain.
</div>

## 3.3 Adresses privées et publiques

| Plage privée (RFC 1918) | Masque associé | Usage typique |
|---|---|---|
| 10.0.0.0 – 10.255.255.255 | /8 | Grandes entreprises, WAN internes |
| 172.16.0.0 – 172.31.255.255 | /12 | Entreprises moyennes |
| 192.168.0.0 – 192.168.255.255 | /16 | Petits réseaux, domestique |

Les adresses privées ne sont pas routables sur Internet — elles nécessitent une traduction NAT (section 3.9) pour communiquer avec l'extérieur.

## 3.4 CIDR (Classless Inter-Domain Routing)

<div class="encadre astuce">
<span class="encadre-titre">💡 CIDR : exprimer un masque par un simple nombre de bits</span>
Plutôt que d'écrire `255.255.255.0`, la notation CIDR l'exprime `/24` (24 bits à 1 consécutifs pour la partie réseau). Cette notation compacte est utilisée systématiquement dans les configurations modernes (Cisco IOS, RouterOS, UniFi) et dans ce manuel.
</div>

| Masque décimal | Notation CIDR | Nombre d'hôtes utilisables |
|---|---|---|
| 255.255.255.0 | /24 | 254 |
| 255.255.255.128 | /25 | 126 |
| 255.255.255.192 | /26 | 62 |
| 255.255.255.224 | /27 | 30 |
| 255.255.255.240 | /28 | 14 |
| 255.255.255.248 | /29 | 6 |
| 255.255.255.252 | /30 | 2 |

## 3.5 Subnetting : méthode de calcul manuel

**Énoncé** : découper le réseau `192.168.10.0/24` en 4 sous-réseaux de taille égale.

**Étape 1 — bits nécessaires.** Pour créer 4 sous-réseaux, il faut emprunter 2 bits à la partie hôte (2² = 4). Le nouveau masque est donc `/24 + 2 = /26`.

**Étape 2 — bloc d'incrémentation.** Un /26 laisse 6 bits pour les hôtes (2⁶ = 64 adresses par sous-réseau, dont 62 utilisables).

**Étape 3 — lister les sous-réseaux.**

| Sous-réseau | Adresse réseau | Plage d'hôtes utilisables | Broadcast |
|---|---|---|---|
| 1 | 192.168.10.0/26 | .1 à .62 | 192.168.10.63 |
| 2 | 192.168.10.64/26 | .65 à .126 | 192.168.10.127 |
| 3 | 192.168.10.128/26 | .129 à .190 | 192.168.10.191 |
| 4 | 192.168.10.192/26 | .193 à .254 | 192.168.10.255 |

<div class="encadre astuce">
<span class="encadre-titre">💡 Astuce de calcul rapide : 256 moins la valeur du dernier octet du masque</span>
Pour un masque `/26` (255.255.255.**192**), le bloc d'incrémentation est `256 - 192 = 64` — chaque sous-réseau commence donc sur un multiple de 64 (0, 64, 128, 192). Cette astuce évite de manipuler le binaire pour la majorité des calculs de terrain.
</div>

## 3.6 VLSM (Variable Length Subnet Masking)

<div class="encadre astuce">
<span class="encadre-titre">💡 VLSM : des sous-réseaux de tailles différentes selon le besoin réel, sans gaspillage d'adresses</span>
Le subnetting classique (section 3.5) découpe en blocs de taille **égale** — inadapté si un service a besoin de 100 hôtes et un autre de seulement 4 (une liaison point-à-point entre deux routeurs, par exemple). VLSM autorise des masques différents par sous-réseau, en respectant une seule règle : chaque bloc doit être une puissance de 2 et ne jamais chevaucher un autre bloc déjà attribué.
</div>

**Énoncé** : à partir de `192.168.20.0/24`, prévoir un sous-réseau pour 100 postes (Ventes), un pour 50 postes (Comptabilité), un pour 20 caméras IP, et une liaison point-à-point entre deux routeurs (2 adresses).

**Méthode : toujours attribuer du plus grand besoin au plus petit.**

| Besoin | Hôtes requis | Masque retenu | Sous-réseau attribué |
|---|---|---|---|
| Ventes | 100 | /25 (126 hôtes) | 192.168.20.0/25 |
| Comptabilité | 50 | /26 (62 hôtes) | 192.168.20.128/26 |
| Caméras IP | 20 | /27 (30 hôtes) | 192.168.20.192/27 |
| Liaison routeurs | 2 | /30 (2 hôtes) | 192.168.20.224/30 |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Toujours vérifier qu'aucun bloc ne chevauche un autre</span>
L'erreur la plus fréquente en VLSM est d'attribuer un bloc qui empiète sur un bloc déjà réservé — additionner systématiquement la taille du bloc précédent à son adresse de départ pour calculer l'adresse de départ du bloc suivant (ici : 128 + 64 = 192, puis 192 + 32 = 224) évite ce chevauchement.
</div>

## 3.7 IPv6 : structure et notation

Une adresse IPv6 est codée sur 128 bits, représentée en huit groupes de 4 chiffres hexadécimaux séparés par `:`.

```
2001:0db8:0000:0000:0000:ff00:0042:8329
```

Règles de simplification :

1. **Omission des zéros initiaux** de chaque groupe : `0db8` devient `db8`.
2. **Compression `::`** : une seule séquence de groupes entièrement à zéro peut être remplacée par `::`, une seule fois par adresse.

```
2001:0db8:0000:0000:0000:ff00:0042:8329
→ 2001:db8::ff00:42:8329
```

| Type d'adresse IPv6 | Préfixe | Équivalent IPv4 |
|---|---|---|
| Unicast global | 2000::/3 | Adresse publique routable |
| Link-local | fe80::/10 | Auto-configurée, non routable (utilisée pour ARP/voisinage) |
| Unique local (ULA) | fc00::/7 | Équivalent des plages privées RFC 1918 |
| Multicast | ff00::/8 | Diffusion à un groupe d'équipements |

<div class="encadre astuce">
<span class="encadre-titre">💡 IPv6 élimine le besoin structurel du NAT</span>
L'espace d'adressage IPv6 (2^128 adresses) est si vaste que chaque équipement peut disposer d'une adresse publique unique sans épuisement — le NAT (section 3.9), nécessité historique d'IPv4, devient optionnel en IPv6 (utilisé parfois pour la confidentialité, jamais par pénurie d'adresses).
</div>

## 3.8 DHCP (Dynamic Host Configuration Protocol)

<div class="encadre astuce">
<span class="encadre-titre">💡 DHCP automatise l'attribution d'adresses IP, évitant la configuration manuelle poste par poste</span>
Processus DORA : **D**iscover (le client diffuse une demande), **O**ffer (un serveur DHCP propose une adresse), **R**equest (le client confirme vouloir cette adresse), **A**cknowledge (le serveur valide l'attribution). Ce cycle se répète à chaque connexion ou renouvellement de bail.
</div>

Un serveur DHCP distribue typiquement : adresse IP, masque de sous-réseau, passerelle par défaut, serveurs DNS, et durée du bail. Configuré au niveau du contrôleur de domaine (chapitre 14) ou d'un routeur/firewall (chapitres 11, 13) selon l'architecture retenue.

## 3.9 NAT et PAT

<div class="encadre astuce">
<span class="encadre-titre">💡 NAT (Network Address Translation) : traduire une adresse privée en adresse publique</span>
Un routeur/firewall en bordure de réseau (chapitre 13) réécrit l'adresse IP source privée d'un paquet sortant par son adresse IP publique, permettant à des centaines de postes en adressage privé (192.168.x.x) de partager une seule adresse publique pour accéder à Internet.
</div>

**PAT (Port Address Translation)**, aussi appelé NAT overload, est la forme de NAT la plus courante : elle distingue les connexions simultanées en réutilisant l'unique adresse publique mais en attribuant un **port source différent** à chaque connexion sortante.

```
Poste interne          192.168.1.10:52341  →  NAT/PAT  →  203.0.113.5:40001  →  Internet
Poste interne          192.168.1.11:52341  →  NAT/PAT  →  203.0.113.5:40002  →  Internet
```

## 3.10 DNS (Domain Name System)

<div class="encadre astuce">
<span class="encadre-titre">💡 DNS traduit un nom lisible en adresse IP</span>
Sans DNS, il faudrait mémoriser des adresses IP pour chaque service (`203.0.113.10` plutôt que `intranet.entreprise.local`). Un serveur DNS d'entreprise (chapitre 14, rôle Windows Server) résout les noms internes ; les requêtes externes remontent vers des résolveurs DNS publics ou du fournisseur d'accès.
</div>

## 3.11 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier de soustraire l'adresse réseau et le broadcast du nombre d'hôtes utilisables</span>
Un /24 contient 256 adresses au total, mais seulement **254 hôtes utilisables** — la première adresse (.0) est l'adresse réseau, la dernière (.255) est l'adresse de broadcast, ni l'une ni l'autre n'est assignable à un équipement. Cette erreur de calcul, très fréquente chez les débutants, sous-dimensionne ou sur-dimensionne systématiquement un plan d'adressage.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Superposer par erreur deux sous-réseaux VLSM</span>
Rappel de la section 3.6 : toujours vérifier par addition que l'adresse de départ d'un nouveau bloc ne tombe pas à l'intérieur d'un bloc déjà attribué.
</div>

## 3.12 Bonnes pratiques

- Toujours documenter le plan d'adressage complet (VLAN, plage, masque, passerelle, usage) avant tout déploiement — approfondi au chapitre 25.
- Réserver systématiquement une marge de croissance de 30 à 50 % lors du dimensionnement d'un sous-réseau, plutôt que de calculer au plus juste.
- Prévoir une stratégie IPv6, même en environnement majoritairement IPv4, pour les nouveaux projets (chapitres 26-36).

## 3.13 Résumé du chapitre

- IPv4 (32 bits) reste omniprésent en entreprise, structuré historiquement en classes A/B/C, mais raisonné aujourd'hui en CIDR.
- Le subnetting découpe en blocs égaux ; le VLSM autorise des blocs de tailles variables selon le besoin réel, sans gaspillage d'adresses.
- IPv6 (128 bits) élimine la pénurie d'adresses et le besoin structurel de NAT.
- DHCP automatise l'attribution d'adresses, DNS traduit les noms en adresses, NAT/PAT permettent le partage d'une adresse publique.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 3.1</span>

Découpez `10.0.0.0/24` en 8 sous-réseaux de taille égale. Donnez le masque CIDR résultant et la plage d'hôtes utilisables du 3e sous-réseau.
</div>

**Corrigé :**
8 sous-réseaux nécessitent 3 bits empruntés (2³ = 8) → masque `/27` (32 hôtes par bloc, 30 utilisables). Le 3e sous-réseau (index 2, en comptant depuis 0) : `10.0.0.64/27`, plage utilisable `.65` à `.94`.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 3.2 (VLSM)</span>

À partir de `172.16.0.0/24`, prévoyez en VLSM : un service de 60 postes, un service de 25 postes, et une liaison point-à-point entre deux routeurs.
</div>

**Corrigé :**
- Service 60 postes → `/26` (62 utilisables) → `172.16.0.0/26`
- Service 25 postes → `/27` (30 utilisables) → `172.16.0.64/27`
- Liaison point-à-point → `/30` (2 utilisables) → `172.16.0.96/30`

*Chapitre suivant : les équipements réseau et leur comparatif constructeurs.*
