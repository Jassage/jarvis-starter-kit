<div class="chapitre-titre-num">CHAPITRE 29</div>

# Firewall : VPN, journaux et politique de sécurité complète

## Objectifs pédagogiques

Configurer un tunnel VPN site-à-site (IPsec) et un accès VPN nomade (SSL-VPN), activer une journalisation exploitable, et consolider l'ensemble des décisions de sécurité du projet dans une politique de sécurité documentée et complète.

## Prérequis

Chapitre 28.

## ÉTAPE 1 — VPN site-à-site (IPsec) vers une future agence

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI (FW-01)</div>

```
config vpn ipsec phase1-interface
    edit "VERS-AGENCE-01"
        set interface "wan1"
        set peertype any
        set proposal aes256-sha256
        set remote-gw 203.0.113.50
        set psksecret ClePartageeSoliDe2026!
    next
end
config vpn ipsec phase2-interface
    edit "VERS-AGENCE-01-P2"
        set phase1name "VERS-AGENCE-01"
        set proposal aes256-sha256
        set src-subnet 10.10.0.0 255.255.0.0
        set dst-subnet 10.20.0.0 255.255.0.0
    next
end
```

**Explication** : la **phase 1** établit le tunnel sécurisé lui-même entre les deux firewalls (adresse publique distante, algorithme de chiffrement, clé pré-partagée) ; la **phase 2** définit précisément quels réseaux internes sont autorisés à communiquer à travers ce tunnel — ici, le réseau du siège (`10.10.0.0/16`) et celui d'une agence future (`10.20.0.0/16`, reprenant la convention d'anticipation multi-site du chapitre 11.4, deuxième octet = identifiant de site). Ce tunnel n'est réellement fonctionnel que le jour où l'agence distante existe et configure la phase 1/2 miroir de son côté — développé en situation réelle au Volume 16, Projet 5.

<div class="encadre attention">
<span class="encadre-titre">⚠️ La clé pré-partagée (PSK) doit être identique des deux côtés, et jamais transmise en clair</span>
Une clé pré-partagée différente d'un seul caractère entre les deux extrémités du tunnel empêche toute négociation IPsec de réussir, sans message d'erreur explicite pour un débutant (voir DÉPANNAGE) — la clé doit être communiquée à l'équipe distante par un canal sécurisé (jamais par email en clair), et documentée dans le gestionnaire d'identifiants du projet, pas dans un simple fichier texte partagé.
</div>

## ÉTAPE 2 — VPN nomade (SSL-VPN) pour les télétravailleurs

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI (FW-01)</div>

```
config vpn ssl settings
    set servercert "Fortinet_Factory"
    set tunnel-ip-pools "SSLVPN-POOL"
    set source-interface "wan1"
    set port 10443
end
config firewall address
    edit "SSLVPN-POOL"
        set type iprange
        set start-ip 10.10.99.100
        set end-ip 10.10.99.126
    next
end
```

**Explication** : le SSL-VPN attribue à chaque télétravailleur connecté une adresse temporaire tirée d'un pool dédié (ici, une portion réservée du segment des liaisons point-à-point, chapitre 25 — un choix pragmatique documenté, une plage dédiée distincte serait préférable sur un projet avec un nombre important d'utilisateurs nomades simultanés, chapitre 14.4). Le port `10443` (plutôt que le port HTTPS standard 443, déjà potentiellement utilisé par d'autres services) est un choix explicite à documenter, pas une valeur arbitraire laissée par défaut sans réflexion.

## ÉTAPE 3 — Activer la journalisation

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI (FW-01)</div>

```
config log setting
    set local-in-allow enable
    set local-in-deny-unicast enable
end
config log disk setting
    set status enable
end
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Les journaux locaux ne suffisent jamais seuls sur un projet sérieux</span>
Le stockage local (`log disk setting`) offre une consultation immédiate depuis l'interface du firewall, mais reste limité en capacité et perdu en cas de panne matérielle du firewall lui-même. L'envoi de ces mêmes journaux vers un système de supervision centralisé (syslog externe) fait l'objet du chapitre 38 (Supervision) — jamais une simple option secondaire, mais une pièce indispensable du dispositif de sécurité global.
</div>

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI</div>

```
FW-01 # diagnose vpn ike gateway list
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
Une fois l'agence distante configurée en miroir, l'état du tunnel doit afficher `status: up` — tant que ce n'est pas le cas (agence non encore déployée), l'absence d'entrée ou un état `down` est normal et attendu à ce stade du projet.
</div>

## DÉPANNAGE

### Si le tunnel IPsec ne monte jamais (phase 1 échoue)

1. Vérifier que la clé pré-partagée est strictement identique des deux côtés (étape 1).
2. Vérifier que les propositions de chiffrement (`proposal aes256-sha256`) correspondent exactement des deux côtés — une négociation IPsec échoue silencieusement si aucun algorithme commun n'est proposé par les deux extrémités.
3. Vérifier qu'aucun équipement intermédiaire (un routeur d'opérateur, par exemple) ne bloque les ports UDP 500 et 4500 (NAT-Traversal) nécessaires à IPsec.

### Si la phase 1 réussit mais aucun trafic ne passe (phase 2 échoue)

Vérifier que les sous-réseaux déclarés en phase 2 (`src-subnet`/`dst-subnet`) correspondent exactement, dans le bon sens, des deux côtés du tunnel — un sous-réseau source et destination inversés d'un seul côté empêche tout trafic de circuler malgré un tunnel apparemment monté.

## SAUVEGARDE

```
FW-01 # execute backup config tftp backup-FW-01-vpn-2026.conf 10.10.30.20
```

## 29.1 La politique de sécurité complète du projet

Ce tableau consolide, en un seul document de référence, l'ensemble des décisions de sécurité prises sur ce projet depuis le chapitre 11 — le livrable central de sécurité remis au client (chapitre 49), qui doit toujours pouvoir être relu et compris sans avoir à retrouver chaque décision éparpillée dans les chapitres précédents.

| Domaine | Décision | Chapitre de référence |
|---|---|---|
| Cloisonnement réseau | 9 VLAN, chacun avec un rôle et un accès défini | 11-12 |
| Adressage | Convention troisième octet = VLAN, sous-réseau dédié par usage | 8 |
| Accès administratif | SSH uniquement, Telnet désactivé partout, mots de passe forts | 19, 40 |
| VLAN natif | VLAN 999 dédié, jamais VLAN 1 | 12.4, 21 |
| Boucles réseau | RSTP actif partout, Root Guard sur le cœur | 22 |
| Accès physique aux ports | Port Security (max 2 MAC), ports inutilisés fermés | 23 |
| Serveur DHCP non autorisé | DHCP Snooping actif sur les VLAN concernés | 23 |
| Accès inter-VLAN | ACL sur SW-COEUR (exemple CCTV → NVR uniquement) | 26 |
| Accès Internet | NAT + règles explicites par VLAN, refus CCTV documenté en double couche (ACL switch + règle firewall) | 28 |
| Inspection de sécurité | Antivirus de flux et filtrage web actifs sur le trafic sortant | 28 |
| Accès distant site-à-site | VPN IPsec, clé pré-partagée gérée en gestionnaire d'identifiants | 29 |
| Accès distant nomade | SSL-VPN, pool d'adresses dédié | 29 |
| Journalisation | Journaux locaux + envoi vers supervision centralisée | 29, 38 |

## 29.2 Laboratoire complet — EVE-NG avec une image FortiGate VM

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi EVE-NG plutôt que GNS3 pour ce volume précis</span>
Contrairement aux routeurs et switches Cisco (chapitres 8, 27), Packet Tracer et GNS3 ne simulent pas nativement un firewall FortiGate. **EVE-NG** (Emulated Virtual Environment - Next Generation) supporte l'import d'images constructeur tierces (dont une image FortiGate VM officielle, disponible en version d'évaluation limitée dans le temps auprès de Fortinet) — le seul moyen réaliste de pratiquer la syntaxe FortiOS exacte de ce volume sans matériel physique.
</div>

**Quoi installer** : EVE-NG Community Edition (hyperviseur de topologie) + une image FortiGate VM (`.qcow2`, obtenue via un compte Fortinet — la version d'évaluation gratuite convient pour ce laboratoire, limitée en durée d'utilisation).
**Où télécharger** : `eve-ng.net` pour la plateforme ; le portail support Fortinet (nécessite un compte, gratuit pour l'évaluation) pour l'image FortiGate VM.
**Comment installer** : EVE-NG s'installe comme une VM complète (image OVA) dans VMware/VirtualBox/Proxmox — c'est un système entier, pas un simple logiciel ; importer ensuite l'image FortiGate VM via l'interface web d'administration d'EVE-NG (menu gestion des images).
**RAM/CPU (VM EVE-NG)** : 8 Go de RAM minimum, 4 cœurs, 50 Go de disque — une image FortiGate VM à elle seule consomme environ 2 Go de RAM une fois démarrée.
**Interfaces réseau** : une interface "Cloud" EVE-NG reliée à la carte réseau de l'hôte, pour accéder à l'interface web du FortiGate simulé depuis un navigateur du poste de travail.

**Topologie à construire** :

```{.uml}
[ Nuage EVE-NG (reseau hote) ]---[ FortiGate VM - wan1 ]
                                  [ FortiGate VM - internal1 ]---[ Switch virtuel ]---[ PC-Test (Linux leger) ]
```

**Adresses IP** : reprendre le plan du chapitre 28 (`wan1` en `203.0.113.2/30`, `internal1` en `10.10.99.1/30`) pour la partie routage/NAT, puis celui de ce chapitre pour le VPN.

**Commandes à exécuter** : la configuration initiale par défaut d'une image FortiGate VM d'évaluation passe par son interface web (`https://<ip>:443`, identifiants par défaut à changer immédiatement, chapitre 35.1 — la même règle absolue s'applique à un firewall) ; la CLI est ensuite accessible via la console EVE-NG ou SSH, où l'ensemble des blocs de commandes des chapitres 28-29 s'exécute à l'identique.

**Tests à réaliser** :
1. Accéder à l'interface web du FortiGate simulé depuis le navigateur de l'hôte, confirmer le changement de mot de passe par défaut.
2. Reproduire la règle NAT de sortie (chapitre 28, étape 4) et confirmer qu'un `PC-Test` (une image Linux légère comme Alpine, ajoutée à la topologie) obtient un accès Internet simulé si le nuage EVE-NG est relié à un réseau avec accès réel.
3. Reproduire la configuration VPN SSL de ce chapitre (étape 2) et se connecter au portail SSL-VPN depuis un navigateur de l'hôte.

## Résumé du chapitre

Un tunnel VPN site-à-site (IPsec, phase 1 + phase 2) relie le siège à une future agence sur des sous-réseaux distincts par site ; un SSL-VPN permet un accès nomade sécurisé aux télétravailleurs. La journalisation locale doit toujours être complétée par un envoi vers une supervision centralisée. La politique de sécurité complète du projet consolide, en un seul tableau de référence, l'ensemble des décisions prises depuis le début du manuel — jamais dispersées sans synthèse.

*Fin du Volume 9. Chapitre suivant : le Wi-Fi professionnel de A à Z, premier et unique chapitre du Volume 10.*
