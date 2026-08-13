<div class="chapitre-titre-num">CHAPITRE 5</div>

# Subnetting et VLSM

## Objectifs pédagogiques

Diviser un réseau en sous-réseaux de taille égale (subnetting classique) puis de tailles différentes adaptées à chaque besoin réel (VLSM), sans gaspiller d'adresses ni créer de chevauchement — la compétence de calcul la plus utilisée de tout ce manuel, réemployée dans les Volumes 4 et 16.

## Prérequis

Chapitre 4.

## 5.1 Pourquoi découper un réseau en sous-réseaux

Un réseau non découpé (un seul grand bloc plat, par exemple `192.168.0.0/16`, soit plus de 65 000 adresses) pose trois problèmes concrets sur un réseau d'entreprise :

1. **Sécurité** : sans découpage, tous les appareils peuvent en théorie communiquer directement entre eux — un poste utilisateur compromis pourrait tenter de joindre directement un serveur financier ou une caméra.
2. **Performance** : un très grand réseau plat partage un seul domaine de broadcast (chapitre 4.6) — chaque broadcast (une requête DHCP, une annonce ARP...) est reçu et traité par **tous** les appareils du réseau, ce qui devient inefficace au-delà de quelques centaines d'appareils.
3. **Organisation** : un plan IP non découpé ne reflète aucune structure logique de l'entreprise (utilisateurs, serveurs, caméras...), rendant le dépannage et la documentation beaucoup plus difficiles.

Découper en sous-réseaux — un par VLAN, comme vu au chapitre 2.9 — résout ces trois problèmes à la fois : c'est pour cela que ce chapitre est un prérequis direct du Volume 4 (conception du plan IP et des VLAN).

## 5.2 Subnetting à taille fixe : diviser en blocs égaux

La méthode la plus simple consiste à diviser un bloc de départ en plusieurs sous-réseaux de **taille identique**. C'est la bonne méthode quand tous les besoins sont similaires.

**Exemple** : un bâtiment de 4 étages, chacun nécessitant un sous-réseau capable d'héberger jusqu'à 60 appareils, à partir du bloc `192.168.20.0/24`.

**Étape 1 — Choisir le CIDR adapté.** Il faut au moins 60 adresses utilisables. Le tableau du chapitre 4.4 montre qu'un `/26` (62 adresses utilisables) convient, alors qu'un `/27` (30 utilisables) serait insuffisant.

**Étape 2 — Découper le bloc de départ en tranches de `/26`.** Un `/24` (256 adresses) divisé en blocs de 64 adresses (`/26`) donne exactement 4 sous-réseaux :

| Sous-réseau | Adresse réseau | Plage utilisable | Broadcast |
|---|---|---|---|
| Étage 1 | 192.168.20.0/26 | .1 à .62 | 192.168.20.63 |
| Étage 2 | 192.168.20.64/26 | .65 à .126 | 192.168.20.127 |
| Étage 3 | 192.168.20.128/26 | .129 à .190 | 192.168.20.191 |
| Étage 4 | 192.168.20.192/26 | .193 à .254 | 192.168.20.255 |

<div class="encadre astuce">
<span class="encadre-titre">💡 Le réflexe : chaque bloc commence à un multiple de sa propre taille</span>
Un bloc `/26` (taille 64) commence toujours à un multiple de 64 dans le dernier octet concerné (0, 64, 128, 192 — jamais 50 ou 100). C'est la règle d'alignement qui garantit qu'aucun sous-réseau ne chevauche un autre, et elle reste vraie quelle que soit la taille du bloc — nous la réutilisons directement en VLSM (5.4).
</div>

## 5.3 Table de référence des tailles de sous-réseau

| CIDR | Taille du bloc | Hôtes utilisables | Cas d'usage typique |
|---|---|---|---|
| /24 | 256 | 254 | Un VLAN utilisateurs de taille moyenne |
| /25 | 128 | 126 | Un VLAN utilisateurs plus restreint, ou la moitié d'un /24 |
| /26 | 64 | 62 | Un étage, un petit service |
| /27 | 32 | 30 | Un petit bureau, une salle de serveurs |
| /28 | 16 | 14 | Une petite équipe, un VLAN de management |
| /29 | 8 | 6 | Une poignée d'équipements réseau |
| /30 | 4 | 2 | Une liaison point-à-point classique |
| /31 | 2 | 2 | Une liaison point-à-point économe (RFC 3021) |

## 5.4 VLSM : allouer à chaque besoin exactement la taille qu'il lui faut

Le **VLSM** (Variable Length Subnet Masking, masque de sous-réseau à longueur variable) va plus loin que le subnetting à taille fixe : il permet de découper un même bloc de départ en sous-réseaux de **tailles différentes**, chacune adaptée précisément au besoin réel — ce qui est la situation normale d'un vrai projet, où un VLAN Serveurs n'a presque jamais besoin de la même taille qu'un VLAN Utilisateurs.

### La méthode, en 4 étapes

1. **Recenser tous les besoins** en nombre d'hôtes, un par VLAN/segment.
2. **Trier les besoins du plus grand au plus petit.**
3. **Allouer un bloc à chaque besoin, dans cet ordre, en choisissant à chaque fois le plus petit CIDR qui suffit**, et en démarrant chaque nouveau bloc sur la première frontière disponible qui respecte la règle d'alignement (5.2).
4. **Documenter le résultat dans un tableau** (le futur plan IP, chapitre 3.6).

### Exemple complet, appliqué à un petit projet

Bloc de départ disponible : `192.168.1.0/24`. Besoins recensés :

- VLAN Utilisateurs : jusqu'à 100 postes
- VLAN CCTV : jusqu'à 40 caméras
- VLAN Serveurs : jusqu'à 20 serveurs
- Liaison point-à-point entre le routeur principal et le firewall : 2 adresses

**Tri décroissant** : Utilisateurs (100) → CCTV (40) → Serveurs (20) → Liaison (2).

**Allocation pas à pas :**

| Ordre | Besoin | CIDR choisi | Bloc alloué | Plage utilisable |
|---|---|---|---|---|
| 1 | Utilisateurs (100) | /25 (126 dispo) | 192.168.1.0/25 | .1 à .126 |
| 2 | CCTV (40) | /26 (62 dispo) | 192.168.1.128/26 | .129 à .190 |
| 3 | Serveurs (20) | /27 (30 dispo) | 192.168.1.192/27 | .193 à .222 |
| 4 | Liaison (2) | /30 (2 dispo) | 192.168.1.224/30 | .225 à .226 |

Il reste `192.168.1.228` à `192.168.1.255` (28 adresses) totalement inutilisées, réservées pour une croissance future — un bloc de départ correctement dimensionné laisse toujours une marge, jamais pile la taille exacte des besoins du jour.

<div class="encadre attention">
<span class="encadre-titre">⚠️ L'erreur la plus fréquente en VLSM : allouer dans le désordre</span>
Si l'on avait alloué la liaison point-à-point (2 adresses) **avant** le VLAN CCTV (40 adresses), le petit bloc `/30` de la liaison aurait "cassé" l'alignement nécessaire pour placer ensuite un `/26` propre juste derrière — obligeant soit à sauter des adresses inutilement, soit à recalculer tout le plan. Toujours allouer **du plus grand besoin au plus petit** évite ce problème par construction.
</div>

## 5.5 Vérifier l'absence de chevauchement

Avant de valider un plan VLSM, une vérification systématique s'impose : la **plage complète** de chaque bloc (adresse réseau à adresse de broadcast incluses) ne doit chevaucher celle d'**aucun** autre bloc du même plan.

Méthode rapide : lister les plages dans l'ordre croissant et vérifier que la fin de chaque plage précède strictement le début de la suivante.

```
192.168.1.0   → 192.168.1.127   (Utilisateurs)
192.168.1.128 → 192.168.1.191   (CCTV)          ← commence juste après .127 ✓
192.168.1.192 → 192.168.1.223   (Serveurs)      ← commence juste après .191 ✓
192.168.1.224 → 192.168.1.227   (Liaison)       ← commence juste après .223 ✓
```

## 5.6 Laboratoire — construire un plan VLSM complet

À partir du bloc `10.10.0.0/22` (1024 adresses), construis un plan VLSM pour les besoins suivants, en respectant la méthode des 4 étapes : VLAN Utilisateurs (300 postes), VLAN Wi-Fi Corporate (150 appareils), VLAN CCTV (80 caméras), VLAN Serveurs (25 machines), VLAN Management (10 équipements réseau), et 3 liaisons point-à-point entre routeurs (2 adresses chacune). Produis un tableau complet (CIDR, bloc, plage utilisable) puis vérifie l'absence de chevauchement selon la méthode 5.5.

## Résumé du chapitre

Le subnetting à taille fixe divise un bloc en sous-réseaux égaux, adapté quand tous les besoins sont similaires. Le VLSM alloue à chaque besoin exactement la taille qui lui suffit : recenser les besoins, les trier du plus grand au plus petit, allouer dans cet ordre en respectant la règle d'alignement (chaque bloc commence à un multiple de sa propre taille), puis vérifier l'absence de chevauchement.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 5.1 (facile)</span>
Un `/23` (512 adresses) doit être divisé en 2 sous-réseaux égaux. Quel CIDR obtient-on pour chacun, et quelle est la taille de chaque bloc ?
</div>

**Corrigé :** `/24` chacun (256 adresses), puisque diviser par 2 revient à ajouter 1 bit de préfixe (23 + 1 = 24).

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 5.2 (avancé)</span>
En reprenant l'exemple complet de la section 5.4, un cinquième besoin apparaît après coup : un second VLAN CCTV de 15 caméras pour un bâtiment annexe. Où ce nouveau bloc doit-il être placé dans le plan existant, et quel CIDR faut-il lui attribuer ?
</div>

**Corrigé :** Un `/28` suffit (14 utilisables — insuffisant pour 15 caméras, il faut donc un `/27`, 30 utilisables, par sécurité de marge). Le plan existant se termine à `192.168.1.227` (fin de la liaison point-à-point) ; le prochain bloc `/27` disponible en respectant l'alignement (multiple de 32) est `192.168.1.224` — déjà occupé par la liaison. Le prochain multiple de 32 libre est donc `192.168.1.256`... qui dépasse le `/24` de départ (`192.168.1.0/24` s'arrête à `.255`) : **il n'y a plus de place dans ce bloc de départ**, ce qui illustre concrètement pourquoi un plan IP professionnel réserve toujours une marge de croissance dès la conception (Volume 4) plutôt que de dimensionner un bloc de départ au plus juste.

*Chapitre suivant : DHCP et DNS en détail — le processus DORA, les réservations, les options DHCP, les types d'enregistrements DNS.*
