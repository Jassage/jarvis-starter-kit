<div class="chapitre-titre-num">CHAPITRE 28</div>

# Firewall : interfaces, zones, NAT, règles

## Objectifs pédagogiques

Configurer un firewall périmétrique complet (interfaces, zones, NAT, objets, services, règles de sécurité) qui applique concrètement, sous forme de politiques explicites, le plan VLAN d'accès défini au chapitre 11.2.

## Prérequis

Volume 8.

## Scénario du volume

Ce volume configure **FW-01** (FortiGate, FortiOS 7.x — la syntaxe exacte peut varier légèrement selon la version, à vérifier sur la documentation du modèle réellement déployé, principe du chapitre 55), qui **remplace RTR-BORDURE-01** à la frontière WAN/LAN du projet : le choix par défaut de ce manuel pour la majorité des projets (chapitre 14.1) combine routage et sécurité périmétrique dans un seul boîtier. RTR-BORDURE-01 (Volume 8) restait un exemple pédagogique isolant proprement les concepts de routage purs, avant d'y ajouter ici la couche sécurité — FW-01 reprend exactement le même adressage (`203.0.113.2/30` côté WAN, `10.10.99.1/30` côté interne, chapitre 25), de sorte qu'**aucune reconfiguration de SW-COEUR n'est nécessaire** : sa route par défaut, déjà pointée vers `10.10.99.1`, continue de fonctionner à l'identique.

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi le firewall n'a besoin d'aucun VLAN pour appliquer une politique par VLAN</span>
FW-01 ne voit jamais de trafic tagué 802.1Q (chapitre 12.2) : SW-COEUR a déjà routé (et donc dé-tagué) le trafic de chaque VLAN avant qu'il n'atteigne FW-01. Grâce au plan IP du chapitre 11 (un sous-réseau **unique et dédié par VLAN**), FW-01 peut malgré tout appliquer une politique différenciée par VLAN, simplement en filtrant sur l'**adresse IP source** — `10.10.60.0/26` identifie sans ambiguïté le Wi-Fi Invité, `10.10.80.0/26` le CCTV, exactement comme un VLAN le ferait, sans qu'aucune configuration VLAN ne soit nécessaire sur le firewall lui-même.
</div>

## OBJECTIF

FW-01 termine le WAN, effectue la traduction d'adresse (NAT) pour tout le trafic sortant du réseau interne, et applique explicitement — jamais par défaut — les règles d'accès du plan VLAN du chapitre 11.2.

## ÉTAPE 1 — Configurer les interfaces

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI (SSH)</div>

```
config system interface
    edit "wan1"
        set ip 203.0.113.2 255.255.255.252
        set allowaccess ping
    next
    edit "internal1"
        set ip 10.10.99.1 255.255.255.252
        set allowaccess ping https ssh
    next
end
```

**Explication** : `allowaccess` liste les protocoles de management autorisés directement sur chaque interface — volontairement réduit à `ping` sur l'interface WAN (aucun accès d'administration exposé directement sur Internet, chapitre 40), et à `https ssh` sur l'interface interne uniquement.

<div class="ou-executer">GUI — Network → Interfaces</div>

```
Network → Interfaces → wan1
  → IP/Netmask : 203.0.113.2/255.255.255.252
  → Access : PING uniquement
  → Enregistrer (OK)
  → Verifier : statut "Up" affiche en vert sur la liste des interfaces
```

## ÉTAPE 2 — Créer les zones

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI</div>

```
config system zone
    edit "zone-wan"
        set interface "wan1"
    next
    edit "zone-lan"
        set interface "internal1"
    next
end
```

**Explication** : une **zone** regroupe une ou plusieurs interfaces sous un même nom logique, référencé ensuite dans les règles (étape 5) — sur ce projet à seulement deux interfaces physiques, chaque zone n'en contient qu'une seule, mais le principe devient précieux dès qu'un firewall dispose de plusieurs interfaces internes à traiter de façon homogène (plusieurs liaisons redondantes vers différents switches cœur, par exemple).

## ÉTAPE 3 — Créer les objets d'adresse (un par VLAN concerné)

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI</div>

```
config firewall address
    edit "RESEAU-Utilisateurs"
        set subnet 10.10.20.0 255.255.255.128
    next
    edit "RESEAU-Comptabilite"
        set subnet 10.10.25.0 255.255.255.224
    next
    edit "RESEAU-WiFi-Corporate"
        set subnet 10.10.50.0 255.255.255.0
    next
    edit "RESEAU-WiFi-Invite"
        set subnet 10.10.60.0 255.255.255.192
    next
    edit "RESEAU-CCTV"
        set subnet 10.10.80.0 255.255.255.192
    next
end
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Toujours nommer un objet, jamais réutiliser une adresse brute dans une règle</span>
Nommer chaque objet (`RESEAU-Utilisateurs` plutôt que `10.10.20.0/25` répété dans chaque règle) rend la politique de sécurité lisible par un humain sans devoir mémoriser le plan IP par cœur, et surtout permet de modifier une seule fois l'objet si le plan IP évolue, sans devoir retrouver et corriger chaque règle qui l'utilise individuellement.
</div>

## ÉTAPE 4 — Configurer le NAT source (trafic sortant)

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI</div>

```
config firewall policy
    edit 1
        set name "NAT-Sortie-Internet"
        set srcintf "internal1"
        set dstintf "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
        set utm-status enable
        set av-profile "default"
        set webfilter-profile "default"
    next
end
```

**Explication** : `set nat enable` active la traduction d'adresse — tout le trafic sortant conservant une adresse source privée (`10.10.0.0/16`) est traduit vers l'adresse publique de l'interface WAN (`203.0.113.2`), rendant possible son routage sur Internet (le point resté en suspens au chapitre 25.6). `utm-status`, `av-profile` et `webfilter-profile` activent l'inspection de sécurité (chapitre 14.5) sur ce trafic.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une politique unique "tout autoriser" n'est qu'un point de départ, jamais une politique de sécurité finale</span>
La règle ci-dessus autorise **tout** le trafic interne à sortir vers Internet — un point de départ fonctionnel, mais qui ne reflète encore aucune des restrictions du plan VLAN d'accès (chapitre 11.2, ex. "CCTV → aucun accès Internet"). L'étape suivante affine cette politique en règles plus spécifiques, insérées **avant** cette règle générale (FortiOS évalue les règles dans l'ordre, la première correspondance l'emporte).
</div>

## ÉTAPE 5 — Affiner la politique : refuser explicitement ce qui doit l'être

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI</div>

```
config firewall policy
    edit 2
        set name "BLOQUE-CCTV-Internet"
        set srcintf "internal1"
        set dstintf "wan1"
        set srcaddr "RESEAU-CCTV"
        set dstaddr "all"
        set action deny
        set schedule "always"
        set service "ALL"
        set logtraffic all
    next
end
move 2 before 1
```

**Explication** : cette règle, insérée **avant** la règle générale de l'étape 4 (`move 2 before 1`), refuse explicitement tout trafic du VLAN CCTV vers Internet, avec journalisation (`logtraffic all`) — une seconde couche de défense en profondeur, en plus de l'ACL déjà posée sur SW-COEUR au chapitre 26.2, cohérente avec le plan VLAN d'accès du chapitre 11.2.

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI</div>

```
FW-01 # get firewall policy
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
La règle 2 (`BLOQUE-CCTV-Internet`) apparaît **avant** la règle 1 (`NAT-Sortie-Internet`) dans l'ordre d'évaluation — un ordre inversé laisserait la règle générale autoriser le trafic CCTV avant même que la règle de blocage ne soit jamais atteinte, un piège de configuration fréquent avec les firewalls à évaluation séquentielle.
</div>

## TEST

Depuis un poste du VLAN Utilisateurs (10.10.20.x), confirmer un accès Internet fonctionnel (navigation web). Depuis un appareil simulé sur le VLAN CCTV (adresse `10.10.80.x` configurée temporairement sur un poste de test), confirmer qu'aucune requête vers Internet n'aboutit — et retrouver la tentative bloquée dans les journaux du firewall (`FortiView → Firewall Policy`, chapitre 29 pour l'exploitation complète des journaux).

## DÉPANNAGE

### Si le trafic Internet ne fonctionne pour aucun VLAN

Vérifier `set nat enable` sur la règle générale (étape 4) — sans cette ligne, le trafic n'est jamais traduit et ne peut techniquement pas être routé sur Internet public (rappel du chapitre 4.2), même avec une règle d'autorisation par ailleurs correcte.

### Si le VLAN CCTV accède malgré tout à Internet

Vérifier l'ordre des règles (`get firewall policy`, VÉRIFICATION ci-dessus) — une règle de blocage placée après la règle générale d'autorisation ne sera jamais évaluée.

## SAUVEGARDE

```
FW-01 # execute backup config tftp backup-FW-01-2026.conf 10.10.30.20
```

## CHECKLIST DE FIN

- [ ] Interfaces WAN et interne configurées avec un accès de management restreint
- [ ] Zones créées
- [ ] Objets d'adresse créés pour chaque VLAN concerné par une règle spécifique
- [ ] NAT source actif sur la règle de sortie Internet générale
- [ ] Règles spécifiques (comme le blocage CCTV) positionnées avant la règle générale
- [ ] Test réel de connectivité et de blocage effectué
- [ ] Configuration sauvegardée

*Chapitre suivant : firewall — VPN, journaux et politique de sécurité complète.*
