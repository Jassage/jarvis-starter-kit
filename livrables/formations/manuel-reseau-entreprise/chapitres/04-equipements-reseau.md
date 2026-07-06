<div class="chapitre-titre-num">CHAPITRE 4</div>

# Les équipements réseau

## Objectifs pédagogiques

Connaître le rôle de chaque équipement d'une infrastructure réseau d'entreprise, et comparer objectivement les principaux constructeurs (Cisco, MikroTik, Ubiquiti, Aruba, Juniper, Fortinet, Sophos, Dell, HPE, Huawei) selon le contexte projet.

## Prérequis

Chapitres 1-3.

## 4.1 Routeurs

Un routeur assure l'interconnexion entre réseaux IP distincts (couche 3) et choisit le meilleur chemin pour acheminer un paquet vers sa destination (chapitre 11 : routage statique, OSPF, EIGRP, BGP).

## 4.2 Switches administrables

<div class="encadre astuce">
<span class="encadre-titre">💡 Switch non administrable vs administrable : la différence qui justifie le coût</span>
Un switch non administrable (souvent appelé "switch plug-and-play") ne fait que commuter des trames sans aucune configuration possible — suffisant pour un réseau domestique. Un switch **administrable** (managed switch) permet VLAN, trunking, agrégation de liens (LACP), QoS et Port Security (chapitre 10), indispensable dès qu'un réseau dépasse quelques postes ou nécessite une segmentation.
</div>

### 4.2.1 Switches PoE (Power over Ethernet)

Un switch PoE alimente électriquement les équipements terminaux (téléphones IP, points d'accès Wi-Fi, caméras IP) directement via le câble Ethernet, évitant un câblage électrique dédié — central pour le déploiement de la vidéosurveillance (chapitre 21).

| Norme | Puissance max par port | Usage typique |
|---|---|---|
| 802.3af (PoE) | 15,4 W | Téléphones IP, points d'accès basiques |
| 802.3at (PoE+) | 30 W | Caméras PTZ, points d'accès Wi-Fi 6 |
| 802.3bt (PoE++/UPoE) | 60-100 W | Bornes Wi-Fi haute puissance, écrans, thin clients |

## 4.3 Firewalls

Équipement de sécurité périmétrique filtrant le trafic entrant/sortant selon des règles, assurant NAT, VPN, et souvent IPS/IDS (chapitre 13).

## 4.4 Contrôleurs Wi-Fi et points d'accès

Un contrôleur Wi-Fi centralise la configuration et supervise plusieurs points d'accès (AP) répartis dans un bâtiment, assurant une itinérance (roaming) transparente entre eux (chapitre 12).

## 4.5 Serveurs

Équipements dédiés hébergeant des services partagés : annuaire (Active Directory), fichiers, applications métier, virtualisation (chapitres 14-15).

## 4.6 NAS (Network Attached Storage)

Système de stockage en réseau dédié, souvent utilisé comme cible de sauvegarde ou serveur de fichiers léger, distinct d'un SAN (chapitre 1) par son protocole (fichiers via SMB/NFS plutôt que blocs bruts).

## 4.7 Baies de brassage, racks et infrastructure physique

- **Baie de brassage (patch panel)** : point de terminaison fixe du câblage horizontal, jamais directement relié aux équipements actifs (chapitre 8).
- **Rack** : structure normalisée (généralement 19 pouces) accueillant équipements actifs et passifs (chapitre 7).
- **Onduleur (UPS)** : alimentation de secours protégeant contre les coupures électriques et micro-coupures (chapitre 9).

## 4.8 Câblage et fibre optique

- **Cuivre (Cat5e à Cat8)** : détaillé au chapitre 8.
- **Fibre optique monomode/multimode** : détaillée au chapitre 8.
- **Convertisseurs fibre (media converters)** : transforment un signal cuivre Ethernet en signal optique et inversement, utiles pour étendre une liaison au-delà de 100 mètres.
- **Modules SFP/SFP+** : transceivers enfichables sur les ports dédiés des switches/routeurs, permettant de choisir le type de liaison (cuivre, fibre courte ou longue distance) sans changer l'équipement lui-même.

## 4.9 Comparatif des principaux constructeurs

<div class="encadre astuce">
<span class="encadre-titre">💡 Comment lire ce tableau</span>
Aucun constructeur n'est "meilleur" dans l'absolu — le choix dépend du budget client, de la taille du projet, du niveau d'expertise interne disponible pour l'exploitation, et des exigences de support. Ce tableau sert de grille de décision, appliquée concrètement aux onze projets de la Partie 11.
</div>

| Constructeur | Positionnement | Points forts | Points de vigilance | Projets typiques (Partie 11) |
|---|---|---|---|---|
| **Cisco** | Entreprise, référence historique | Écosystème complet, fiabilité, certification (CCNA/CCIE) reconnue, support mondial | Coût élevé, licences complexes | Banque, Hôpital, Datacenter |
| **MikroTik** | Excellent rapport prix/fonctionnalités | RouterOS très flexible, coût très bas, communauté active | Interface moins intuitive, support officiel limité, moins présent en très grande entreprise | École, PME, liaisons WAN économiques |
| **Ubiquiti (UniFi)** | Simplicité de gestion centralisée | Interface UniFi Controller unifiée, bon rapport qualité/prix, Wi-Fi performant | Moins de profondeur en fonctionnalités avancées (routage complexe, sécurité niveau entreprise) | Hôtel, Centre commercial, Campus |
| **Aruba (HPE)** | Spécialiste Wi-Fi et mobilité entreprise | Wi-Fi 6/6E très performant, gestion centralisée cloud (Aruba Central), sécurité intégrée | Coût élevé sur le haut de gamme | Université, Aéroport |
| **Juniper** | Datacenter et cœur de réseau opérateur | Performance et fiabilité au cœur de réseau, JunOS cohérent sur toute la gamme | Moins répandu en périphérie/PME, courbe d'apprentissage JunOS | Datacenter, Siège multi-sites |
| **Fortinet** | Sécurité périmétrique (firewall NGFW) | FortiOS complet (firewall, VPN, IPS, SD-WAN), Security Fabric intégrée | Complexité de licence selon les modules activés | Banque, Hôpital, tout projet à exigence de sécurité forte |
| **Sophos** | Sécurité PME accessible | Interface simple, bon rapport prix/fonctionnalités de sécurité | Moins présent en très grande entreprise | École, PME |
| **Dell (PowerEdge, PowerSwitch)** | Serveurs et infrastructure datacenter | Bon rapport prix/performance serveurs, intégration avec solutions de virtualisation | Le réseau (switching) moins spécialisé que Cisco/Juniper | Datacenter, Siège social |
| **HPE (Aruba + serveurs ProLiant)** | Infrastructure complète (réseau + serveurs) | Cohérence de gamme, HPE iLO pour l'administration serveur à distance | Coût global | Datacenter, Hôpital |
| **Huawei** | Rapport prix/performance agressif | Gamme très complète, prix compétitifs | Restrictions géopolitiques/commerciales dans certains pays, support variable selon la région | Contexte dépendant des contraintes locales |

## 4.10 Choisir un constructeur selon le contexte projet

<div class="encadre astuce">
<span class="encadre-titre">💡 Grille de décision simplifiée</span>
- **Budget très contraint, PME/école** → MikroTik pour le routage, Ubiquiti pour le Wi-Fi et la simplicité de gestion.
- **Exigence de sécurité forte (banque, hôpital)** → Fortinet en périphérie, Cisco au cœur de réseau.
- **Datacenter ou cœur de réseau à très haute performance** → Juniper ou Cisco Nexus, Dell/HPE pour les serveurs.
- **Grand campus avec forte densité Wi-Fi** → Aruba, pour sa gestion de la mobilité et de l'itinérance.
</div>

## 4.11 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Mélanger des constructeurs sans vérifier l'interopérabilité des standards</span>
Les protocoles standardisés (802.1Q, 802.1X, OSPF, LACP) fonctionnent entre constructeurs différents, mais certaines fonctionnalités propriétaires (EtherChannel Cisco vs implémentations tierces, par exemple) nécessitent une vérification de compatibilité avant de mixer les équipements sur un même lien critique.
</div>

## 4.12 Bonnes pratiques

- Toujours documenter le choix constructeur dans le dossier d'architecture (chapitre 25), avec la justification technique et budgétaire.
- Privilégier la cohérence constructeur au sein d'une même fonction critique (ex : tous les switches cœur du même constructeur), tout en acceptant un mix pertinent entre fonctions (Wi-Fi, sécurité, cœur de réseau).
- Vérifier la disponibilité du support et des pièces de rechange dans la région d'exploitation avant de s'engager sur un constructeur.

## 4.13 Résumé du chapitre

- Chaque équipement (routeur, switch, firewall, contrôleur Wi-Fi, serveur, NAS) a un rôle précis et complémentaire dans l'architecture globale.
- Le PoE simplifie considérablement le déploiement des équipements terminaux (téléphones, AP, caméras).
- Le choix constructeur doit se faire selon le budget, l'exigence de sécurité, et la taille du projet — jamais par habitude ou par défaut.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 4.1</span>

Une école avec un budget limité souhaite déployer 15 points d'accès Wi-Fi et un routage Internet basique. Quels constructeurs recommanderiez-vous, et pourquoi ?
</div>

**Corrigé :**
MikroTik pour le routeur/pare-feu (excellent rapport prix/fonctionnalités pour un routage basique) et Ubiquiti UniFi pour les points d'accès (gestion centralisée simple, bon rapport qualité/prix, adapté à une équipe IT réduite) — cohérent avec le budget contraint typique d'un projet scolaire (chapitre 26).

*Chapitre suivant : l'analyse des besoins, première étape de tout projet réseau.*
