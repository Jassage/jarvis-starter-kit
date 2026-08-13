<div class="chapitre-titre-num">CHAPITRE 11</div>

# Conception du plan IP

## Objectifs pédagogiques

Généraliser la méthode du chapitre 8 en un gabarit professionnel reproductible sur n'importe quel projet, avec toutes les colonnes qu'un plan IP livrable à un client doit contenir — le document de référence unique que chaque technicien du Volume 7 à 13 devra pouvoir consulter sans ambiguïté.

## Prérequis

Volumes 1-3.

## 11.1 Rappel de la méthode (chapitre 8, généralisée)

1. Recenser les besoins réels par groupe à isoler, avec marge de croissance.
2. Choisir un bloc de départ et sa convention d'adressage.
3. Attribuer des identifiants VLAN espacés (10, 20, 30...), en réservant des trous.
4. Dimensionner chaque VLAN au plus juste avec marge.
5. Vérifier l'absence de chevauchement.
6. Décider de la méthode d'attribution par VLAN (dynamique/réservation/statique).
7. Statuer explicitement sur IPv6.

Ce chapitre ajoute les colonnes manquantes à cette méthode pour produire un plan IP réellement livrable, et les Volumes 5 à 16 s'y référeront systématiquement.

## 11.2 Le tableau professionnel complet

Un plan IP professionnel ne se limite jamais aux seules colonnes "Réseau" et "CIDR" — chaque VLAN doit documenter huit informations.

| Colonne | Rôle |
|---|---|
| VLAN | Identifiant numérique (chapitre 8.4) |
| Nom | Nom lisible, utilisé partout ailleurs (configurations, schémas) |
| Réseau/Masque | L'adresse réseau en notation CIDR |
| Passerelle | L'adresse du routeur/switch L3 pour ce VLAN (chapitre 4.7) |
| DHCP | Oui/Non, et la plage exacte si oui |
| Réservations | Adresses statiques ou réservées DHCP en dehors (ou en début) de la plage dynamique |
| DNS | Le ou les serveurs DNS distribués à ce VLAN |
| Accès autorisés | Renvoi vers le plan VLAN d'accès (chapitre 3.7), qui documente les règles de communication inter-VLAN |

**Exemple appliqué au cas du chapitre 8, complété :**

| VLAN | Nom | Réseau | Passerelle | DHCP | Réservations | DNS | Accès autorisés |
|---|---|---|---|---|---|---|---|
| 10 | Management | 10.10.10.0/27 | 10.10.10.1 | Non (statique) | .2-.30 par équipement | 10.10.30.10 (interne) | Tous les VLAN (administratif) |
| 20 | Utilisateurs | 10.10.20.0/25 | 10.10.20.1 | Oui, .10-.120 | .2-.9 (postes fixes critiques) | 10.10.30.10, repli 8.8.8.8 | Serveurs (applicatif), Internet |
| 25 | Comptabilité | 10.10.25.0/27 | 10.10.25.1 | Oui, .10-.25 | — | 10.10.30.10 | Serveurs (fichiers finance uniquement), Internet |
| 30 | Serveurs | 10.10.30.0/27 | 10.10.30.1 | Non (statique) | .2-.15 par serveur | 10.10.30.10 (lui-même), repli 8.8.8.8 | — (VLAN de destination, pas d'initiation sortante sauf mises à jour) |
| 40 | VoIP | 10.10.40.0/25 | 10.10.40.1 | Réservation par MAC | Toute la plage, par téléphone | 10.10.30.10 | Serveur de téléphonie uniquement |
| 50 | Wi-Fi Corporate | 10.10.50.0/24 | 10.10.50.1 | Oui, .10-.240 | — | 10.10.30.10, repli 8.8.8.8 | Serveurs (applicatif), Internet |
| 60 | Wi-Fi Invité | 10.10.60.0/26 | 10.10.60.1 | Oui, .10-.60 | — | 8.8.8.8 (public uniquement) | Internet uniquement |
| 80 | CCTV | 10.10.80.0/26 | 10.10.80.1 | Réservation par MAC | Toute la plage, par caméra | Aucun (pas de résolution nécessaire) | NVR uniquement (même VLAN) |
| 90 | Sécurité | 10.10.90.0/28 | 10.10.90.1 | Non (statique) | .2-.14 | Aucun | Serveur de contrôle d'accès uniquement |

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi le Wi-Fi Invité ne reçoit jamais le DNS interne</span>
Distribuer un serveur DNS interne (`10.10.30.10`) au VLAN Invité permettrait à un visiteur de résoudre les noms internes de l'entreprise (`nvr.entreprise.local`, `intranet.entreprise.local`...) — une fuite d'information inutile pour un réseau qui n'a de toute façon accès qu'à Internet (dernière colonne du tableau). Ce VLAN reçoit donc uniquement un DNS public (`8.8.8.8` ou équivalent), cohérent avec le principe du split DNS déjà posé au chapitre 6.7.
</div>

## 11.3 Choisir les bons serveurs DNS à distribuer

Trois options existent pour la valeur DNS distribuée par VLAN :

1. **Le serveur DNS interne de l'entreprise** — indispensable pour tout VLAN qui doit résoudre des noms internes (serveurs, NVR, applications métier) ;
2. **Un serveur DNS public** (comme `8.8.8.8`, `1.1.1.1`) — pour les VLAN sans besoin de résolution interne, ou en **repli** (second serveur DNS de la liste) si le serveur interne tombe en panne ;
3. **Le DNS du fournisseur d'accès** — rarement utilisé volontairement en entreprise (moins de contrôle, parfois moins fiable), sauf absence totale d'alternative.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Toujours prévoir un DNS de repli, sauf raison de sécurité explicite</span>
Un VLAN qui ne reçoit **que** le serveur DNS interne devient totalement incapable de résoudre le moindre nom si ce serveur tombe en panne — y compris les noms publics. Prévoir systématiquement un second DNS de repli (souvent public) évite cette panne totale, sauf pour un VLAN où l'isolement stricte est volontairement recherché (le VLAN CCTV du tableau ci-dessus, par exemple, n'a besoin d'aucune résolution DNS : les caméras et le NVR se joignent par adresse IP fixe entre eux).
</div>

## 11.4 Anticiper une éventuelle croissance multi-site

Même sur un projet mono-site, une bonne pratique consiste à réserver, dès la conception, un identifiant de site dans le plan d'adressage — pour éviter un chevauchement d'adresses si l'entreprise ouvre un jour une seconde agence reliée par VPN (Volume 16, Projet 5).

<div class="encadre astuce">
<span class="encadre-titre">💡 Exemple de convention anticipée</span>
Dans la convention "troisième octet = VLAN" du chapitre 8.3 (`10.10.<VLAN>.0`), le **deuxième octet** (`10` dans tous les exemples de ce manuel) peut être réservé comme identifiant de site : le siège reste `10.10.x.x`, une future agence deviendrait `10.20.x.x`, une deuxième `10.30.x.x` — sans jamais toucher au troisième octet (VLAN), déjà cohérent partout. Cette anticipation coûte zéro effort supplémentaire aujourd'hui et évite une reconception complète de l'adressage le jour où un second site apparaît réellement (cas traité en détail au Volume 16, Projet 5).
</div>

## 11.5 Laboratoire — compléter un plan IP incomplet

Un collègue a commencé un plan IP mais a laissé plusieurs colonnes vides :

| VLAN | Nom | Réseau | Passerelle | DHCP | DNS | Accès autorisés |
|---|---|---|---|---|---|---|
| 20 | Utilisateurs | 10.20.20.0/25 | ? | Oui, .10-.120 | ? | ? |
| 80 | CCTV | 10.20.80.0/26 | ? | ? | ? | ? |

Complète chaque cellule manquante, en justifiant tes choix à partir des principes de ce chapitre (convention de passerelle du chapitre 4.7, choix DNS de la section 11.3, accès autorisés cohérents avec le rôle de chaque VLAN vu au chapitre 2.9).

## Résumé du chapitre

Un plan IP professionnel documente huit informations par VLAN : identifiant, nom, réseau/masque, passerelle, DHCP (et sa plage), réservations, serveurs DNS, et accès autorisés. Le choix des DNS distribués dépend du besoin réel de résolution de chaque VLAN (interne, public, ou aucun). Réserver dès la conception un identifiant de site dans le plan d'adressage anticipe sans coût une éventuelle croissance multi-site future.

*Chapitre suivant : la conception des VLAN, approfondie — le mécanisme technique du tagging 802.1Q, les ports access et trunk, le VLAN natif, et les grands principes du routage inter-VLAN.*
