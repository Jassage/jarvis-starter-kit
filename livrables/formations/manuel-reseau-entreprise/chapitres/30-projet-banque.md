<div class="chapitre-titre-num">CHAPITRE 30</div>

# Projet complet : Banque

## Objectifs pédagogiques

Réaliser, de A à Z, le réseau à sécurité maximale d'un siège bancaire et de 8 agences : configuration intégrale du VPN IPsec site-à-site vers chaque agence, du double lien WAN avec bascule automatique, et de la vidéosurveillance à valeur probatoire sur les guichets.

## Prérequis

Chapitres 1-29. Ce chapitre applique la méthode des chapitres 11 (VPN IPsec, IP SLA) et 13 (firewall Fortinet) avec la configuration complète propre à ce projet, répliquée sur 8 agences.

## 30.1 Contexte, budget et matériel

- Siège (300 employés) + 8 agences (10-20 employés chacune), reliées en VPN IPsec.
- Core banking, GAB, messagerie SWIFT/équivalent, RTO quasi nul.
- 60 caméras au siège (dont LPR parking), 15 par agence.
- Budget : 15 % réseau cœur, 15 % firewalls HA + VPN, 10 % double WAN, 15 % vidéosurveillance, 20 % serveurs HA, 15 % cybersécurité, 10 % câblage/onduleurs.

## 30.2 Étape 1 — Double lien WAN avec bascule automatique (siège, Cisco IOS)

```
Router(config)# ip sla 1
Router(config-ip-sla)# icmp-echo 8.8.8.8 source-interface GigabitEthernet0/0
Router(config-ip-sla)# frequency 10
Router(config-ip-sla)# threshold 200
Router(config-ip-sla)# timeout 1000
Router(config-ip-sla)# exit
Router(config)# ip sla schedule 1 life forever start-time now

Router(config)# track 1 ip sla 1 reachability
Router(config)# track 1 delay down 10 up 5

Router(config)# ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/0 10 track 1
Router(config)# ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/1 200

Router(config)# interface GigabitEthernet0/0
Router(config-if)# description WAN-Operateur-Principal
Router(config-if)# ip address 203.0.113.2 255.255.255.248
Router(config-if)# exit
Router(config)# interface GigabitEthernet0/1
Router(config-if)# description WAN-Operateur-Secours
Router(config-if)# ip address 198.51.100.2 255.255.255.248
```

<div class="encadre astuce">
<span class="encadre-titre">💡 La route de secours (distance administrative 200) reste invisible tant que la route principale (distance 10) est active</span>
`ip sla` teste en continu la joignabilité via l'opérateur principal ; en cas d'échec détecté par `track 1`, la route principale est retirée de la table de routage et la route de secours (jusque-là masquée par sa distance administrative plus élevée) devient active automatiquement.
</div>

## 30.3 Étape 2 — Configuration complète du cluster FortiGate HA au siège

```
config system interface
    edit "port2.10"
        set interface "port2"
        set vlanid 10
        set ip 10.60.10.1 255.255.255.0
        set alias "Coeur-Bancaire"
    next
    edit "port2.40"
        set interface "port2"
        set vlanid 40
        set ip 10.60.40.1 255.255.254.0
        set alias "Videosurveillance"
    next
    edit "port2.99"
        set interface "port2"
        set vlanid 99
        set ip 10.60.99.1 255.255.255.224
        set alias "Management"
    next
end

config firewall policy
    edit 1
        set name "CoeurBancaire-Interne-Uniquement"
        set srcintf "port2.10"
        set dstintf "port2.10"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set logtraffic all
    next
    edit 2
        set name "Deny-CoeurBancaire-vers-Internet"
        set srcintf "port2.10"
        set dstintf "wan1"
        set action deny
        set logtraffic all
    next
    edit 3
        set name "Deny-All-Final"
        set srcintf "any"
        set dstintf "any"
        set action deny
        set logtraffic all
    next
end

config system ha
    set mode a-p
    set group-id 30
    set group-name "HA-Banque-Siege"
    set password ClusterHaBanque2026!
    set hbdev "port4" 50
    set priority 200
end
```

## 30.4 Étape 3 — VPN IPsec site-à-site vers chacune des 8 agences

**Sur FW-SIEGE-01, un tunnel par agence (exemple Agence 1) :**

```
config vpn ipsec phase1-interface
    edit "Agence1-VPN"
        set interface "wan1"
        set ike-version 2
        set peertype any
        set proposal aes256-sha256
        set dpd enable
        set remote-gw 198.51.100.10
        set psksecret VpnAgence1SecretPartage2026!
    next
end

config vpn ipsec phase2-interface
    edit "Agence1-VPN-P2"
        set phase1name "Agence1-VPN"
        set proposal aes256-sha256
        set src-subnet 10.60.0.0 255.255.0.0
        set dst-subnet 10.61.0.0 255.255.0.0
    next
end

config router static
    edit 1
        set dst 10.61.0.0 255.255.0.0
        set device "Agence1-VPN"
    next
end

config firewall policy
    edit 10
        set name "Siege-vers-Agence1"
        set srcintf "port2.10"
        set dstintf "Agence1-VPN"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set logtraffic all
    next
    edit 11
        set name "Agence1-vers-Siege"
        set srcintf "Agence1-VPN"
        set dstintf "port2.10"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set logtraffic all
    next
end
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Répéter à l'identique pour les 7 autres agences</span>
Chaque tunnel supplémentaire (Agence2-VPN, Agence3-VPN, ..., Agence8-VPN) reprend exactement cette structure en 4 blocs (phase1, phase2, route statique, 2 règles de pare-feu), en changeant uniquement l'IP publique distante (`remote-gw`), le secret partagé, et le sous-réseau distant (`10.62.0.0/16`, `10.63.0.0/16`, etc., rappel du plan d'adressage par agence).
</div>

## 30.5 Étape 4 — Configuration du FortiGate d'agence (exemple Agence 1)

```
config system global
    set hostname "FW-AGENCE1"
end

config system interface
    edit "wan1"
        set mode static
        set ip 198.51.100.10 255.255.255.248
    next
    edit "port2.10"
        set interface "port2"
        set vlanid 10
        set ip 10.61.10.1 255.255.255.192
        set alias "Postes-Agence"
    next
    edit "port2.40"
        set interface "port2"
        set vlanid 40
        set ip 10.61.40.1 255.255.255.224
        set alias "Videosurveillance-Agence"
    next
end

config vpn ipsec phase1-interface
    edit "Siege-VPN"
        set interface "wan1"
        set ike-version 2
        set proposal aes256-sha256
        set remote-gw 203.0.113.2
        set psksecret VpnAgence1SecretPartage2026!
    next
end

config vpn ipsec phase2-interface
    edit "Siege-VPN-P2"
        set phase1name "Siege-VPN"
        set proposal aes256-sha256
        set src-subnet 10.61.0.0 255.255.0.0
        set dst-subnet 10.60.0.0 255.255.0.0
    next
end

config router static
    edit 1
        set dst 10.60.0.0 255.255.0.0
        set device "Siege-VPN"
    next
end
```

## 30.6 Étape 5 — Vidéosurveillance à valeur probatoire (guichets et GAB)

1. Adressage siège : `10.60.40.10` à `10.60.40.69` (60 caméras), sous-réseau `10.60.40.0/23`.
2. Chaque guichet reçoit une caméra dédiée, montée à 2,3-2,5 m, niveau **Identification** (250 px/m), éclairage contrôlé sans contre-jour (rappel chapitre 20).
3. Caméra LPR au parking sécurisé : adresse `10.60.40.70`, intégrée à la barrière automatique (chapitre 23).
4. Politique de rétention : 90 jours sur les zones guichet/coffre (à ajuster selon l'exigence réglementaire bancaire locale), 30 jours ailleurs.
5. Réplication du stockage vidéo entre le siège et un site de secours distant (VMS avec réplication).

## 30.7 Étape 6 — Tests de validation

<div class="encadre astuce">
<span class="encadre-titre">💡 Checklist de recette</span>

1. Débrancher le lien WAN principal du siège : vérifier la bascule automatique vers le lien de secours (`show ip route`, `show track 1`).
2. Vérifier l'établissement du tunnel VPN de chacune des 8 agences (`diagnose vpn tunnel list` sur chaque FortiGate).
3. Débrancher FW-SIEGE-01 : vérifier la bascule HA vers FW-SIEGE-02 sans coupure des tunnels VPN agences.
4. Vérifier le niveau Identification effectif à chaque guichet (mesure de densité de pixels réelle, rappel chapitre 19).
5. Tester le système LPR du parking (reconnaissance, ouverture de barrière).
</div>

## 30.8 Documentation finale et résumé

Dossier complet (chapitre 25) incluant le registre de conformité réglementaire sectorielle et les 8 configurations d'agences exportées individuellement. Ce chapitre a démontré la configuration intégrale d'un réseau bancaire multi-sites à sécurité maximale, avec VPN site-à-site répliqué sur 8 agences et double lien WAN redondant.

*Chapitre suivant : projet complet Centre commercial — forte affluence publique et vidéosurveillance à grande échelle.*
