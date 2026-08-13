<div class="chapitre-titre-num">PARTIE II · CHAPITRE 8</div>

# Adressage IPv4 et calcul de sous-réseaux

## Rôle de l'adressage IPv4

Une adresse IPv4 identifie de façon unique une interface réseau sur un réseau IP, au moyen de 32 bits représentés en notation décimale à quatre octets (par exemple `192.168.10.25`). Maîtriser le découpage en sous-réseaux (subnetting) est la compétence la plus structurante de ce chapitre : c'est elle qui permet de dimensionner un réseau ni trop large (gaspillage d'adresses, domaine de broadcast trop grand) ni trop étroit (croissance impossible sans re-découpage).

## Fonctionnement : classes historiques et CIDR

Le découpage historique en classes A/B/C est aujourd'hui obsolète en pratique, remplacé par le CIDR (Classless Inter-Domain Routing), mais reste indispensable à connaître pour comprendre les plages réservées.

| Classe | Plage réseau | Masque par défaut | Hôtes max | Usage historique |
|---|---|---|---|---|
| A | 1.0.0.0 – 126.0.0.0 | /8 (255.0.0.0) | ~16,7 millions | Très grands réseaux |
| B | 128.0.0.0 – 191.255.0.0 | /16 (255.255.0.0) | ~65 000 | Réseaux moyens |
| C | 192.0.0.0 – 223.255.255.0 | /24 (255.255.255.0) | 254 | Petits réseaux |

### Plages privées (RFC 1918), non routées sur Internet public

| Plage | Notation CIDR | Usage typique |
|---|---|---|
| 10.0.0.0 – 10.255.255.255 | 10.0.0.0/8 | Grands réseaux d'entreprise |
| 172.16.0.0 – 172.31.255.255 | 172.16.0.0/12 | Réseaux moyens, souvent conteneurs/Docker |
| 192.168.0.0 – 192.168.255.255 | 192.168.0.0/16 | Petits réseaux, PME, domicile |

## Prérequis : le calcul binaire de base

Chaque octet d'une adresse IPv4 vaut de 0 à 255 (8 bits). Un masque de sous-réseau détermine quelle partie de l'adresse identifie le réseau et quelle partie identifie l'hôte. Le CIDR note ce masque par le nombre de bits à 1 (par exemple `/24` = 24 bits de réseau, 8 bits d'hôte).

| CIDR | Masque décimal | Hôtes utilisables | Usage typique |
|---|---|---|---|
| /30 | 255.255.255.252 | 2 | Liaison point à point (routeur-routeur) |
| /29 | 255.255.255.248 | 6 | Très petit segment |
| /28 | 255.255.255.240 | 14 | Petit VLAN de service |
| /27 | 255.255.255.224 | 30 | Petit VLAN départemental |
| /26 | 255.255.255.192 | 62 | VLAN départemental moyen |
| /25 | 255.255.255.128 | 126 | VLAN de taille moyenne |
| /24 | 255.255.255.0 | 254 | VLAN standard PME |

<div class="encadre astuce">
<span class="encadre-titre">💡 Calcul rapide du nombre d'hôtes</span>
Nombre d'hôtes utilisables = 2^(bits d'hôte) − 2. Les « −2 » correspondent à l'adresse réseau (tous les bits d'hôte à 0) et à l'adresse de broadcast (tous les bits d'hôte à 1), toutes deux réservées et non attribuables à un équipement.
</div>

## Mise en place d'un plan d'adressage VLSM

Le VLSM (Variable Length Subnet Mask) permet de découper un réseau en sous-réseaux de tailles différentes selon le besoin réel de chaque segment, plutôt que d'imposer partout le même masque.

1. **Recenser le besoin réel de chaque segment** — Nombre d'hôtes actuels, plus une marge de croissance raisonnable (généralement 30 à 50 %).
2. **Trier les segments du plus grand au plus petit besoin** — Allouer d'abord les plus gros blocs évite la fragmentation de l'espace d'adressage.
3. **Attribuer un bloc CIDR à chaque segment** — Choisir le plus petit CIDR qui couvre le besoin plus la marge.
4. **Documenter le plan** — Réseau, masque, passerelle, plage DHCP, adresses statiques réservées (voir tableau modèle ci-dessous).
5. **Réserver systématiquement les 10 à 20 premières adresses** — Pour les équipements à IP fixe (passerelle, switches, serveurs), avant la plage DHCP dynamique.

## Modèle de plan d'adressage

| VLAN | Nom | Réseau/CIDR | Passerelle | Plage DHCP | Hôtes max |
|---|---|---|---|---|---|
| 10 | Administration | 192.168.10.0/24 | 192.168.10.1 | .50 – .200 | 251 |
| 20 | Serveurs | 192.168.20.0/25 | 192.168.20.1 | Statique uniquement | 126 |
| 30 | Wi-Fi employés | 192.168.30.0/24 | 192.168.30.1 | .50 – .240 | 251 |
| 40 | Invités | 192.168.40.0/26 | 192.168.40.1 | .10 – .60 | 62 |
| 99 | Gestion (switches, AP) | 192.168.99.0/27 | 192.168.99.1 | Statique uniquement | 30 |

## Administration courante

- Tenir à jour le tableau des adresses statiques réservées (Partie I, Chapitre 5 — inventaire)
- Vérifier périodiquement le taux d'occupation de chaque plage DHCP, signal d'alerte avant saturation
- Documenter tout changement de plan d'adressage dans le registre des changements (Partie X)

## Outils et commandes de calcul et de diagnostic

```
# Linux — afficher les interfaces et adresses
ip addr show

# Linux — calculer un sous-réseau (paquet ipcalc)
ipcalc 192.168.10.0/26

# Windows PowerShell — afficher la configuration IP
Get-NetIPConfiguration
Get-NetIPAddress -AddressFamily IPv4

# Windows — configuration IP classique
ipconfig /all
```

<div class="encadre info">
<span class="encadre-titre">ℹ️ À savoir</span>
Des calculatrices de sous-réseaux en ligne ou des outils comme `ipcalc` (Linux) évitent les erreurs de calcul manuel, en particulier sur des masques non standards (/27, /29). Cela reste utile de savoir calculer à la main pour comprendre ce que l'outil produit et détecter une incohérence.
</div>

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Toujours prévoir une marge de croissance de 30 à 50 % lors du dimensionnement d'un sous-réseau, jamais piler au plus juste
- Réserver une plage cohérente et documentée pour les adresses statiques, distincte de la plage DHCP
- Éviter les chevauchements de plages entre sites, en particulier avant tout projet d'interconnexion VPN site-à-site (Partie III)
- Utiliser des VLAN de gestion dédiés (99 dans l'exemple ci-dessus) pour l'administration des équipements réseau eux-mêmes
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Dimensionner un sous-réseau exactement à la taille actuelle sans aucune marge, forçant un re-découpage douloureux dès la première croissance
- Utiliser le même plan d'adressage 192.168.1.0/24 par défaut sur tous les sites d'une organisation multi-site, rendant toute interconnexion VPN impossible sans renumérotation complète
- Oublier de soustraire l'adresse réseau et l'adresse de broadcast dans le calcul du nombre d'hôtes utilisables
- Placer un serveur critique dans la plage DHCP dynamique plutôt qu'en adresse statique documentée
</div>

## Dépannage des problèmes d'adressage

| Symptôme | Cause probable | Vérification |
|---|---|---|
| Le poste reçoit une adresse 169.254.x.x (APIPA) | Aucun serveur DHCP accessible | Vérifier le service DHCP (Partie III), le VLAN du port |
| Deux équipements ont la même adresse IP (conflit) | Adresse statique mal réservée ou hors de la plage DHCP exclue | Vérifier la réservation dans le plan d'adressage |
| Un site ne peut pas joindre un autre site en VPN | Chevauchement de plages d'adressage entre les deux sites | Comparer les plans d'adressage, renuméroter si besoin |

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Un plan d'adressage structuré par fonction (administration, serveurs, invités, gestion des équipements) est un prérequis direct à la segmentation de sécurité par VLAN (Chapitre 12) : impossible d'appliquer une politique de pare-feu cohérente (« les invités ne peuvent joindre que Internet ») sans que les invités disposent déjà d'un sous-réseau clairement isolé des autres usages.
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
Le manuel de formation réseau déjà produit pour Jaslin (`livrables/formations/manuel-reseau-entreprise/`) documente un plan d'adressage VLSM complet à huit VLAN pour une PME type, avec la même logique que ce chapitre : réserver les adresses basses aux équipements statiques, dimensionner chaque VLAN selon son usage réel (caméras en `/24` statique, invités en plage DHCP dédiée). Ce même plan, transposé à l'infrastructure interne de Haitech Solutions, constitue un point de départ directement réutilisable plutôt qu'à reconcevoir de zéro.
</div>

## Résumé du chapitre

- Le CIDR remplace en pratique les classes A/B/C historiques pour un découpage flexible en sous-réseaux.
- Le nombre d'hôtes utilisables se calcule par 2^(bits d'hôte) − 2.
- Un plan d'adressage VLSM documenté, avec marge de croissance, évite les re-découpages d'urgence.
- Un plan d'adressage structuré par fonction est le prérequis direct de la segmentation VLAN (Chapitre 12).

*Chapitre suivant : IPv6, structure et coexistence avec IPv4.*
