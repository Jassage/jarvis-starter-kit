<div class="chapitre-titre-num">CHAPITRE 4</div>

# IPv4, masques et notation CIDR

## Objectifs pédagogiques

Comprendre la structure exacte d'une adresse IPv4, calculer à la main l'adresse réseau et l'adresse de broadcast d'un sous-réseau à partir d'une adresse IP et d'un masque, et lire couramment la notation CIDR (`/24`, `/26`...) sans avoir besoin d'une calculatrice en ligne.

## Prérequis

Volume 1.

## 4.1 La structure d'une adresse IPv4

Une adresse IPv4 est un nombre de **32 bits**, presque toujours écrit sous forme de quatre nombres décimaux séparés par des points (la "notation décimale pointée"), chaque nombre représentant un groupe de 8 bits (un **octet**), donc compris entre 0 et 255.

```
192   .   168   .   1    .   25
11000000.10101000.00000001.00011001
   8 bits    8 bits    8 bits    8 bits   =  32 bits au total
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi 255 est la valeur maximale d'un octet</span>
Un octet de 8 bits peut représenter 2⁸ = 256 valeurs différentes, de 0 à 255 (jamais 256). C'est pour cette raison qu'une adresse IPv4 valide ne contient jamais un nombre supérieur à 255 dans l'un de ses quatre groupes — `192.168.1.300` n'est tout simplement pas une adresse IP possible.
</div>

## 4.2 Adresses privées et adresses publiques

Toutes les adresses IPv4 ne peuvent pas être utilisées librement : certaines plages sont réservées par convention internationale (RFC 1918) à un usage **privé**, à l'intérieur d'un réseau local, et ne sont jamais routées sur Internet.

| Plage privée | Notation CIDR | Usage typique |
|---|---|---|
| 10.0.0.0 – 10.255.255.255 | 10.0.0.0/8 | Grandes entreprises, permet énormément d'adresses |
| 172.16.0.0 – 172.31.255.255 | 172.16.0.0/12 | Entreprises moyennes |
| 192.168.0.0 – 192.168.255.255 | 192.168.0.0/16 | Petits réseaux, box grand public |

Toute adresse en dehors de ces trois plages (et de quelques plages spéciales ci-dessous) est une **adresse publique**, potentiellement routable sur Internet, et doit être attribuée par un fournisseur d'accès — jamais choisie arbitrairement.

Deux plages spéciales à connaître :

- **127.0.0.0/8** — la plage de **boucle locale (loopback)** : `127.0.0.1` désigne toujours "cette machine elle-même", utilisée pour tester qu'une pile réseau fonctionne sans passer par une vraie carte réseau.
- **169.254.0.0/16** — la plage **APIPA** (Automatic Private IP Addressing) : une machine se l'attribue elle-même automatiquement quand elle ne parvient à joindre **aucun** serveur DHCP. Une adresse commençant par `169.254.` sur un poste est donc toujours le signe d'une panne DHCP, jamais une configuration normale voulue (sujet détaillé en dépannage, chapitre 42).

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ce manuel utilise systématiquement des adresses privées dans ses exemples</span>
Sauf mention contraire explicite (typiquement, l'interface WAN d'un routeur face à Internet), toutes les adresses IP utilisées dans ce manuel — plans IP, configurations, projets — appartiennent aux plages privées ci-dessus. C'est la pratique professionnelle standard : le réseau interne d'une entreprise utilise des adresses privées, et un mécanisme de traduction d'adresse (**NAT**, détaillé au Volume 9) les convertit en une ou plusieurs adresses publiques uniquement au moment de sortir vers Internet.
</div>

## 4.3 Le masque de sous-réseau : séparer la partie réseau de la partie hôte

Une adresse IP seule ne dit pas où s'arrête le réseau et où commence l'identifiant de l'appareil. C'est le rôle du **masque de sous-réseau** : un second nombre de 32 bits, associé à chaque adresse IP, qui indique combien de bits (en partant de la gauche) désignent le **réseau**, et combien de bits restants (à droite) désignent l'**hôte** (l'appareil précis à l'intérieur de ce réseau).

Un masque s'écrit avec des `1` binaires consécutifs pour la partie réseau, suivis de `0` binaires consécutifs pour la partie hôte — jamais de `1` et de `0` mélangés de façon désordonnée.

```
Masque /24 :  11111111.11111111.11111111.00000000  =  255.255.255.0
              └──────────── réseau ────────────┘└─ hôte ─┘
                  24 bits à 1                      8 bits à 0
```

## 4.4 La notation CIDR : compter les bits plutôt qu'écrire le masque entier

La **notation CIDR** (Classless Inter-Domain Routing) simplifie l'écriture d'un masque en indiquant simplement, après un `/`, le **nombre de bits à 1** consécutifs depuis la gauche. `255.255.255.0` s'écrit ainsi `/24`, `255.255.255.192` s'écrit `/26`.

<div class="encadre astuce">
<span class="encadre-titre">💡 Le tableau à mémoriser absolument</span>
Ce tableau doit devenir un réflexe — c'est la base de tout calcul d'adressage professionnel, du Volume 2 aux six projets du Volume 16.
</div>

| CIDR | Masque décimal | Nombre d'adresses | Adresses utilisables |
|---|---|---|---|
| /24 | 255.255.255.0 | 256 | 254 |
| /25 | 255.255.255.128 | 128 | 126 |
| /26 | 255.255.255.192 | 64 | 62 |
| /27 | 255.255.255.224 | 32 | 30 |
| /28 | 255.255.255.240 | 16 | 14 |
| /29 | 255.255.255.248 | 8 | 6 |
| /30 | 255.255.255.252 | 4 | 2 |
| /31 | 255.255.255.254 | 2 | 2 (cas particulier, RFC 3021) |
| /32 | 255.255.255.255 | 1 | 1 (route vers un hôte unique) |

<div class="encadre astuce">
<span class="encadre-titre">💡 Le raccourci mental : 256 moins le dernier octet non nul du masque</span>
Pour retrouver rapidement la taille d'un bloc d'adresses à partir d'un masque comme `255.255.255.224`, calcule `256 - 224 = 32` : c'est la taille du bloc (32 adresses). Cette astuce fonctionne pour n'importe quel octet du masque qui n'est ni 0 ni 255, et sera reprise constamment au chapitre 5.
</div>

## 4.5 Calculer l'adresse réseau : l'opération ET logique

Pour trouver l'**adresse réseau** d'un appareil à partir de son adresse IP et de son masque, on applique un **ET logique** (AND) bit par bit entre l'adresse IP et le masque : chaque bit du résultat vaut `1` uniquement si les deux bits correspondants (de l'IP et du masque) valent `1` tous les deux.

**Exemple complet** : quelle est l'adresse réseau de `192.168.10.130 /26` ?

Seul le dernier octet demande un calcul (les trois premiers octets du masque `/26` valent 255, donc restent inchangés) :

```
Dernier octet de l'IP    :  130  =  10000010
Dernier octet du masque  :  192  =  11000000   (255.255.255.192 = /26)
ET logique bit à bit     :        =  10000000  =  128
```

L'adresse réseau est donc `192.168.10.128`. Comme un `/26` représente un bloc de 64 adresses (256 - 192 = 64, astuce du 4.4), ce bloc s'étend de `192.168.10.128` à `192.168.10.191`.

## 4.6 Adresse réseau, adresse de broadcast et plage utilisable

Dans chaque bloc, deux adresses sont **réservées** et ne peuvent jamais être attribuées à un appareil :

- la **première adresse** du bloc — c'est l'**adresse réseau** elle-même (tous les bits d'hôte à `0`), qui identifie le sous-réseau tout entier, jamais un appareil précis ;
- la **dernière adresse** du bloc — c'est l'**adresse de broadcast** (tous les bits d'hôte à `1`), utilisée pour envoyer une donnée à **tous** les appareils du sous-réseau simultanément.

Pour le bloc `192.168.10.128/26` calculé ci-dessus :

| | Valeur |
|---|---|
| Adresse réseau | 192.168.10.128 |
| Première adresse utilisable | 192.168.10.129 |
| Dernière adresse utilisable | 192.168.10.190 |
| Adresse de broadcast | 192.168.10.191 |

C'est exactement pour cette raison que le nombre d'**adresses utilisables** d'un bloc est toujours `2^(nombre de bits d'hôte) - 2` (on retire l'adresse réseau et l'adresse de broadcast) — sauf le cas particulier `/31`, utilisé uniquement sur les liaisons point-à-point entre deux routeurs (deux appareils seulement, aucun broadcast nécessaire), où les deux adresses du bloc sont utilisables (RFC 3021) — nous nous en servirons au chapitre 5 pour économiser des adresses sur les liaisons inter-routeurs.

## 4.7 La passerelle par défaut

La **passerelle par défaut** (default gateway) est l'adresse IP, à l'intérieur du même sous-réseau, vers laquelle un appareil envoie toute donnée destinée à un réseau différent du sien (typiquement, l'adresse du routeur ou du firewall qui donne accès aux autres VLAN et à Internet). Sans passerelle configurée, un appareil peut communiquer avec les autres appareils de son propre sous-réseau, mais reste incapable de sortir vers l'extérieur.

<div class="encadre astuce">
<span class="encadre-titre">💡 Convention (pas une règle technique obligatoire)</span>
Ce manuel attribue systématiquement, par convention, la **première adresse utilisable** de chaque sous-réseau à sa passerelle (ex. `192.168.10.129/26` dans l'exemple ci-dessus) — c'est la convention la plus répandue en entreprise, qui facilite la lecture d'un plan IP au premier coup d'œil. Rien n'empêche techniquement de choisir la dernière adresse utilisable à la place (autre convention courante, notamment héritée de certains équipementiers) : l'important est d'être **cohérent sur tout le projet**, et de documenter le choix dans le plan IP (chapitre 3.6).
</div>

## 4.8 Laboratoire — calculer le réseau de ta propre machine

Reprends les valeurs relevées au laboratoire du chapitre 2 (`ipconfig /all`) : ton adresse IPv4 et ton masque de sous-réseau.

1. Convertis ton masque décimal en notation CIDR à l'aide du tableau de la section 4.4.
2. Calcule à la main (ET logique) l'adresse réseau de ton propre sous-réseau.
3. Calcule l'adresse de broadcast correspondante.
4. Compare l'adresse de ta passerelle par défaut (visible elle aussi dans `ipconfig /all`) à ta plage utilisable calculée : est-elle bien la première adresse utilisable, la dernière, ou une autre valeur ?

## Résumé du chapitre

Une adresse IPv4 est un nombre de 32 bits en quatre octets. Le masque sépare la partie réseau de la partie hôte ; la notation CIDR compte simplement le nombre de bits de réseau. L'adresse réseau se calcule par un ET logique entre l'IP et le masque ; la première adresse du bloc est l'adresse réseau, la dernière est le broadcast, les deux sont réservées. La passerelle par défaut est l'adresse du routeur local, par convention la première adresse utilisable du sous-réseau dans ce manuel.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 4.1 (facile)</span>
Quelle est la notation CIDR du masque `255.255.255.240` ? Combien d'adresses utilisables contient ce bloc ?
</div>

**Corrigé :** `/28` (voir tableau 4.4) — 16 adresses au total, 14 utilisables (16 - 2).

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 4.2 (intermédiaire)</span>
Calcule l'adresse réseau, l'adresse de broadcast et la plage utilisable de `10.20.5.77 /27`.
</div>

**Corrigé :** `/27` = bloc de 32 adresses (256-224, masque `255.255.255.224`). Le dernier octet de l'IP est 77. Les blocs de 32 dans le 4ᵉ octet commencent à 0, 32, 64, 96... — 77 se situe dans le bloc **64-95**. Adresse réseau : `10.20.5.64`. Broadcast : `10.20.5.95`. Plage utilisable : `10.20.5.65` à `10.20.5.94`.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 4.3 (intermédiaire)</span>
Une liaison directe entre deux routeurs n'a besoin que de deux adresses IP. Quel est le CIDR le plus économe en adresses pour ce cas précis, et combien d'adresses au total gaspille-t-il par rapport à un `/30` classique ?
</div>

**Corrigé :** `/31` (RFC 3021), qui utilise ses 2 adresses en totalité (aucune réservée pour le réseau ou le broadcast sur ce cas particulier) — contre 4 adresses réservées par un `/30` classique (dont seulement 2 utilisables). Un `/31` "gaspille" donc 0 adresse contre 2 pour un `/30`.

*Chapitre suivant : le subnetting et le VLSM — diviser un réseau en sous-réseaux de tailles adaptées à chaque besoin.*
