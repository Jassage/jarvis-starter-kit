<div class="chapitre-titre-num">CHAPITRE 29</div>

# Projet complet : Hôtel

## Objectifs pédagogiques

Réaliser, de A à Z, le réseau d'un hôtel de 120 chambres : configuration intégrale du firewall Fortinet, des switches par étage, du portail captif Wi-Fi client avec code de chambre, et de la vidéosurveillance périmétrique intégrée au contrôle d'accès.

## Prérequis

Chapitres 1-28. Ce chapitre applique la méthode des chapitres 10 (switches), 12 (Wi-Fi/portail captif), 13 (firewall) avec la configuration complète propre à ce projet.

## 29.1 Contexte, budget et matériel

- 120 chambres sur 8 étages, restaurant, spa, salles de conférence, parking souterrain.
- Équipe IT réduite (1 technicien) : priorité Ubiquiti UniFi pour la simplicité de gestion centralisée.
- 45 caméras, PMS (Property Management System) back-office.
- Budget : 20 % câblage, 12 % switches, 20 % Wi-Fi, 20 % vidéosurveillance, 10 % firewall, 12 % PMS/serveur, 6 % baie/onduleur.

## 29.2 Étape 1 — Câblage et brassage par étage

Une prise Cat6 par chambre, colonne montante en cage d'escalier technique reliant les 8 panneaux de brassage d'étage au local technique RDC. Convention d'étiquetage : `E[n°étage]-CH[n°chambre]`, par exemple `E3-CH312`.

### Tableau de brassage — Switch SW-E3 (exemple représentatif de chaque étage, 15 chambres/étage)

| Ports | Affectation | VLAN (accès) |
|---|---|---|
| 1-15 | Chambres 301 à 315 | 20 |
| 16 | Point d'accès Wi-Fi couloir (AP-E3) | 20 |
| 17 | Caméra couloir (CAM-E3) | 40 |
| 24 | Uplink trunk vers routeur/firewall | Trunk 20,40,99 |

## 29.3 Étape 2 — Configuration complète du firewall Fortinet (entrée de gamme)

```
config system global
    set hostname "FW-HOTEL-01"
end

config system interface
    edit "wan1"
        set mode dhcp
    next
    edit "port2.10"
        set interface "port2"
        set vlanid 10
        set ip 10.50.10.1 255.255.255.128
        set alias "Back-Office"
    next
    edit "port2.20"
        set interface "port2"
        set vlanid 20
        set ip 10.50.20.1 255.255.252.0
        set alias "Wifi-Clients"
    next
    edit "port2.30"
        set interface "port2"
        set vlanid 30
        set ip 10.50.30.1 255.255.255.0
        set alias "Wifi-Conference"
    next
    edit "port2.40"
        set interface "port2"
        set vlanid 40
        set ip 10.50.40.1 255.255.255.128
        set alias "Videosurveillance"
    next
end

config firewall shaper traffic-shaper
    edit "Conference-Priorite"
        set maximum-bandwidth 50000
        set guaranteed-bandwidth 20000
        set priority high
    next
end

config firewall policy
    edit 1
        set name "BackOffice-vers-Internet"
        set srcintf "port2.10"
        set dstintf "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set service "HTTPS" "HTTP" "DNS"
        set nat enable
        set action accept
    next
    edit 2
        set name "WifiClients-vers-Internet"
        set srcintf "port2.20"
        set dstintf "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set service "HTTPS" "HTTP" "DNS"
        set nat enable
        set action accept
        set logtraffic all
    next
    edit 3
        set name "WifiConference-vers-Internet-Priorite"
        set srcintf "port2.30"
        set dstintf "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set service "HTTPS" "HTTP" "DNS"
        set nat enable
        set traffic-shaper "Conference-Priorite"
        set action accept
    next
    edit 4
        set name "Deny-Wifi-vers-BackOffice"
        set srcintf "port2.20" "port2.30"
        set dstintf "port2.10"
        set action deny
        set logtraffic all
    next
    edit 5
        set name "Deny-All-Final"
        set srcintf "any"
        set dstintf "any"
        set action deny
    next
end

config vpn ssl settings
    set servercert "Fortinet_Factory"
    set tunnel-ip-pools "SSLVPN_TUNNEL_ADDR1"
    set source-interface "wan1"
end
```

## 29.4 Étape 3 — Configuration complète des switches d'étage (identique aux 8 étages, MikroTik)

```
/system identity set name=SW-E3-HOTEL
/interface bridge add name=bridge-lan vlan-filtering=yes

/interface bridge port
add bridge=bridge-lan interface=ether1 pvid=20
add bridge=bridge-lan interface=ether2 pvid=20
add bridge=bridge-lan interface=ether15 pvid=20
add bridge=bridge-lan interface=ether16 pvid=20
add bridge=bridge-lan interface=ether17 pvid=40
add bridge=bridge-lan interface=ether24 frame-types=admit-only-vlan-tagged

/interface bridge vlan
add bridge=bridge-lan vlan-ids=20 tagged=ether24 untagged=ether1,ether2,ether15,ether16
add bridge=bridge-lan vlan-ids=40 tagged=ether24 untagged=ether17
add bridge=bridge-lan vlan-ids=99 tagged=ether24,bridge-lan

/ip address add address=10.50.99.13/28 interface=bridge-lan
/ip route add gateway=10.50.99.1
/user set admin password=HotelAdmin2026!Secure
```

Répéter à l'identique pour les 7 autres étages, seule l'adresse `10.50.99.1X` change (`.14` à `.20`).

## 29.5 Étape 4 — Portail captif Wi-Fi client complet (Ubiquiti UniFi)

1. Adopter les 8 AP (1 par étage) dans le contrôleur UniFi.
2. Créer le réseau `VLAN20-WifiClients`, sous-réseau `10.50.20.0/22`.
3. Créer le SSID :

```
Nom du reseau (SSID) : Hotel-Clients
VLAN : 20
Securite : Portail captif (Guest Portal), pas de mot de passe Wi-Fi direct
Authentification : Code d'acces (numero de chambre + nom de famille)
Duree de session : jusqu'a 03h00 du lendemain (checkout standard)
Limite de bande passante par appareil : 20 Mbps descendant / 5 Mbps montant
Isolation des clients : ACTIVEE
```

4. Créer un second SSID `Hotel-Conference` sur VLAN 30, sans portail captif (mot de passe remis à l'accueil pour les événements professionnels), avec la QoS `Conference-Priorite` définie côté firewall (étape 29.3).
5. Générer les codes d'accès clients : dans **Portail invité** → **Codes d'accès**, générer un code unique par réservation (intégration manuelle ou via API PMS si disponible).

## 29.6 Étape 5 — Déploiement des 45 caméras et NVR

1. Adressage : `10.50.40.10` à `10.50.40.54` (45 adresses), sous-réseau `10.50.40.0/25`.
2. Niveau Identification (250 px/m) à la réception et aux entrées, Reconnaissance (125 px/m) dans les couloirs et ascenseurs.
3. NVR 64 canaux, RAID 5, rétention 30 jours (standard hôtelier, à vérifier selon réglementation locale).
4. Intégration au système de serrures électroniques des chambres : chaque ouverture de porte d'étage (couloir commun) génère un enregistrement horodaté consultable en cas d'incident.

## 29.7 Étape 6 — Tests de validation

<div class="encadre astuce">
<span class="encadre-titre">💡 Checklist de recette</span>

1. Générer un code d'accès test, se connecter au SSID `Hotel-Clients`, vérifier la redirection vers le portail et l'obtention d'une IP `10.50.20.x`.
2. Vérifier que deux appareils clients connectés ne peuvent pas se voir (isolation).
3. Lancer un test de débit simultané sur plusieurs appareils pour simuler une forte occupation.
4. Vérifier la bande passante garantie du SSID `Hotel-Conference` pendant un test de charge.
5. Vérifier toutes les caméras extérieures de nuit (parking, entrées).
</div>

## 29.8 Documentation finale et résumé

Dossier standard (chapitre 25) avec une procédure d'exploitation quotidienne rédigée pour le technicien unique (génération de codes Wi-Fi, consultation NVR), utilisable même en son absence. Ce chapitre a démontré la configuration intégrale d'un réseau hôtelier conciliant expérience client et simplicité d'exploitation.

*Chapitre suivant : projet complet Banque — sécurité maximale et conformité réglementaire stricte.*
