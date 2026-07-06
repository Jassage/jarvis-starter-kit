<div class="chapitre-titre-num">CHAPITRE 34</div>

# Projet complet : Siège social multi-sites

## Objectifs pédagogiques

Réaliser, de A à Z, le réseau SD-WAN d'un siège social et de 12 sites régionaux : configuration intégrale du SD-WAN Fortinet, du kit standardisé reproductible par site, et de la supervision centralisée multi-sites via FortiManager.

## Prérequis

Chapitres 1-33. Ce chapitre applique la méthode du chapitre 13 (Fortinet) étendue au SD-WAN et à la gestion centralisée multi-sites.

## 34.1 Contexte, budget et matériel

- Siège (200 employés) + 12 sites régionaux (15-40 employés), applications centralisées au siège.
- Kit standardisé par site : 1 FortiGate SD-WAN, 1-2 switches PoE, 2-4 AP, 4-8 caméras.
- Budget : 20 % SD-WAN, 15 % cœur siège, 30 % kits sites régionaux, 15 % vidéosurveillance centralisée, 10 % supervision, 10 % câblage/onduleurs.

## 34.2 Étape 1 — Configuration complète du SD-WAN au siège (FortiGate)

```
config system sd-wan
    set status enable
    config zone
        edit "virtual-wan-link"
        next
    end
    config members
        edit 1
            set interface "wan1"
            set gateway 203.0.113.1
            set cost 0
        next
        edit 2
            set interface "lte1"
            set gateway 198.51.100.1
            set cost 10
        next
    end
    config health-check
        edit "check-siege"
            set server "8.8.8.8" "1.1.1.1"
            set members 1 2
            set interval 500
            set failtime 3
        next
    end
    config service
        edit 1
            set name "Visioconference-Priorite"
            set dst "all"
            set src "all"
            set internet-service enable
            set health-check "check-siege"
            set priority-members 1 2
        next
    end
end
```

## 34.3 Étape 2 — Kit standardisé pour un site régional (exemple Site Régional 1)

**FortiGate du site (SD-WAN client vers le siège) :**

```
config system global
    set hostname "FW-SITE-REGIONAL-01"
end

config system interface
    edit "wan1"
        set mode dhcp
    next
    edit "port2.10"
        set interface "port2"
        set vlanid 10
        set ip 10.101.10.1 255.255.255.128
        set alias "Bureautique"
    next
    edit "port2.40"
        set interface "port2"
        set vlanid 40
        set ip 10.101.40.1 255.255.255.192
        set alias "Videosurveillance"
    next
end

config vpn ipsec phase1-interface
    edit "Vers-Siege"
        set interface "wan1"
        set ike-version 2
        set proposal aes256-sha256
        set remote-gw 203.0.113.2
        set psksecret VpnSiteRegional1Secret2026!
    next
end

config vpn ipsec phase2-interface
    edit "Vers-Siege-P2"
        set phase1name "Vers-Siege"
        set proposal aes256-sha256
        set src-subnet 10.101.0.0 255.255.0.0
        set dst-subnet 10.100.0.0 255.255.0.0
    next
end

config router static
    edit 1
        set dst 10.100.0.0 255.255.0.0
        set device "Vers-Siege"
    next
end

config firewall policy
    edit 1
        set name "Bureautique-vers-Internet"
        set srcintf "port2.10"
        set dstintf "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set service "HTTPS" "HTTP" "DNS"
        set nat enable
        set action accept
    next
    edit 2
        set name "Vers-Siege"
        set srcintf "port2.10"
        set dstintf "Vers-Siege"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
    next
end
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Répéter à l'identique pour les 12 sites régionaux</span>
Seuls le nom d'hôte, le 2e octet du plan d'adressage (`10.10[N].x.x`, rappel du chapitre 34 théorique) et le secret VPN changent d'un site à l'autre — l'ensemble du reste de cette configuration est un copier-coller strict, condition même du concept de kit standardisé.
</div>

## 34.4 Étape 3 — Gestion centralisée via FortiManager

1. Installer FortiManager au siège, l'enregistrer comme gestionnaire central de tous les FortiGate (siège + 12 sites).
2. Créer un **modèle de politique** (policy package) unique reprenant le jeu de règles standard du kit (étape 34.3).
3. Assigner ce modèle à chacun des 12 FortiGate de site : toute modification future de la politique de sécurité se pousse automatiquement à l'ensemble des sites en une seule opération.
4. Créer des comptes de délégation locale limitée (redémarrage d'équipement, changement de mot de passe Wi-Fi local uniquement — jamais de modification des règles de sécurité).

## 34.5 Étape 4 — Switches et Wi-Fi du kit (exemple Site Régional 1, MikroTik + Ubiquiti)

```
/system identity set name=SW-SITE-REGIONAL-01
/interface bridge add name=bridge-lan vlan-filtering=yes
/interface bridge port add bridge=bridge-lan interface=ether1 pvid=10
/interface bridge port add bridge=bridge-lan interface=ether24 frame-types=admit-only-vlan-tagged
/interface bridge vlan add bridge=bridge-lan vlan-ids=10 tagged=ether24 untagged=ether1
/ip address add address=10.101.99.10/28 interface=bridge-lan
```

SSID UniFi standardisé, identique sur chaque site (VLAN adapté au plan d'adressage local) :

```
Nom du reseau (SSID) : Entreprise-SiteRegional
VLAN : 10 (adapte localement)
Securite : WPA2-Enterprise (RADIUS centralise au siege via VPN)
```

## 34.6 Étape 5 — Vidéosurveillance centralisée multi-sites

1. Chaque site dispose d'un enregistrement local tampon (buffer 48h) garantissant la continuité en cas de coupure WAN.
2. Synchronisation différée vers le VMS central du siège dès rétablissement du lien (file d'attente de synchronisation).
3. Adressage caméras par site : `10.10[N].40.10` à `10.10[N].40.17` (8 caméras max par kit).

## 34.7 Étape 6 — Tests de validation

<div class="encadre astuce">
<span class="encadre-titre">💡 Checklist de recette</span>

1. Sur chaque site, débrancher le lien WAN principal : vérifier le basculement SD-WAN vers le lien LTE de secours.
2. Déployer le kit sur un site pilote et mesurer le temps réel de déploiement (objectif de réduction par rapport à une conception ad hoc).
3. Vérifier la synchronisation vidéo différée après une coupure WAN simulée d'un site.
4. Pousser une modification de règle de sécurité depuis FortiManager et vérifier son application sur l'ensemble des 12 sites.
5. Vérifier que les référents locaux ne peuvent pas modifier les règles de sécurité (test de délégation limitée).
</div>

## 34.8 Documentation finale et résumé

Dossier standard (chapitre 25) enrichi du document de référence du kit type (section 34.3), reproductible sur tout nouveau site futur, et du plan d'adressage national complet. Ce chapitre a démontré la configuration intégrale d'une architecture SD-WAN multi-sites standardisée et centralement gouvernée.

*Chapitre suivant : projet complet Campus d'entreprise — mobilité et authentification 802.1X dynamique.*
