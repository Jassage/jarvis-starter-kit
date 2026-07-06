<div class="chapitre-titre-num">CHAPITRE 13</div>

# Configuration du firewall

## Objectifs pédagogiques

Configurer intégralement un firewall Fortinet, du premier démarrage à un jeu de règles complet (deny-all + autorisations explicites), NAT, DMZ, IPS, SSL-VPN pour les utilisateurs distants, et haute disponibilité — configuration complète, pas d'extraits isolés.

## Prérequis

Chapitres 1-12.

## 13.1 Scénario du chapitre

<div class="encadre astuce">
<span class="encadre-titre">💡 Un firewall périmétrique complet, en coupure entre Internet et le réseau interne</span>
Ce chapitre configure un FortiGate en coupure entre Internet (port1/wan1), le réseau interne (port2, VLAN 10/20/99 déjà définis aux chapitres 10-11), et une DMZ (port3) hébergeant un serveur web accessible depuis Internet — avec SSL-VPN pour les collaborateurs nomades et un second FortiGate en haute disponibilité.
</div>

## 13.2 Étape 1 — Premier accès au FortiGate

1. Relier un ordinateur portable au port **port1** (ou au port dédié management selon le modèle) via câble Ethernet.
2. Configurer temporairement l'IP de l'ordinateur portable en statique : `192.168.1.2 / 255.255.255.0` (l'IP d'usine du FortiGate est généralement `192.168.1.99`).
3. Ouvrir un navigateur vers `https://192.168.1.99`, accepter le certificat auto-signé (avertissement normal à ce stade).
4. Se connecter avec l'identifiant `admin`, mot de passe vide par défaut.
5. À la première connexion, le système impose immédiatement de définir un nouveau mot de passe administrateur — le faire avec une phrase forte et unique.

## 13.3 Étape 2 — Configuration de base (CLI, via l'onglet Console de l'interface web ou SSH)

```
config system global
    set hostname "FW-SIEGE-01"
    set timezone "Europe/Paris"
end

config system admin
    edit "admin"
        set password NouveauMotDePasseSolide2026!
    next
end
```

## 13.4 Étape 3 — Configuration des interfaces (WAN, LAN, DMZ)

```
config system interface
    edit "wan1"
        set mode static
        set ip 203.0.113.2 255.255.255.248
        set allowaccess ping
    next
    edit "port2"
        set mode static
        set ip 10.10.1.1 255.255.255.0
        set allowaccess ping https ssh
    next
    edit "port3"
        set mode static
        set ip 10.10.70.1 255.255.255.0
        set allowaccess ping
        set alias "DMZ"
    next
end
```

<div class="encadre astuce">
<span class="encadre-titre">💡 port2 relié en trunk aux VLAN internes (sous-interfaces VLAN)</span>
```
config system interface
    edit "port2.10"
        set interface "port2"
        set vlanid 10
        set ip 10.10.10.5 255.255.255.0
    next
    edit "port2.20"
        set interface "port2"
        set vlanid 20
        set ip 10.10.20.5 255.255.255.0
    next
end
```
Ces sous-interfaces VLAN permettent au FortiGate de router directement entre les VLAN internes (10, 20) sans dépendre uniquement des routeurs cœur du chapitre 11 pour cette fonction, si l'architecture retenue place le firewall en position de routage inter-VLAN.
</div>

## 13.5 Étape 4 — Objets adresses et groupes (préalable aux règles)

```
config firewall address
    edit "reseau_bureautique"
        set subnet 10.10.10.0 255.255.255.0
    next
    edit "reseau_telephonie"
        set subnet 10.10.20.0 255.255.255.0
    next
    edit "serveur_web_dmz"
        set subnet 10.10.70.10 255.255.255.255
    next
end
```

## 13.6 Étape 5 — Jeu de règles complet (deny-all + autorisations explicites, dans l'ordre)

```
config firewall policy
    edit 1
        set name "Bureautique-vers-Internet"
        set srcintf "port2.10"
        set dstintf "wan1"
        set srcaddr "reseau_bureautique"
        set dstaddr "all"
        set service "HTTPS" "HTTP" "DNS"
        set nat enable
        set action accept
        set logtraffic all
    next
    edit 2
        set name "Telephonie-vers-Internet-SIP"
        set srcintf "port2.20"
        set dstintf "wan1"
        set srcaddr "reseau_telephonie"
        set dstaddr "all"
        set service "SIP"
        set nat enable
        set action accept
    next
    edit 3
        set name "Internet-vers-DMZ-Web"
        set srcintf "wan1"
        set dstintf "port3"
        set srcaddr "all"
        set dstaddr "serveur_web_dmz"
        set service "HTTPS"
        set action accept
        set logtraffic all
    next
    edit 4
        set name "DMZ-vers-Interne-Interdit"
        set srcintf "port3"
        set dstintf "port2.10" "port2.20"
        set srcaddr "all"
        set dstaddr "all"
        set action deny
        set logtraffic all
    next
    edit 5
        set name "Deny-All-Final"
        set srcintf "any"
        set dstintf "any"
        set srcaddr "all"
        set dstaddr "all"
        set service "ALL"
        set action deny
        set logtraffic all
    next
end
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ L'ordre des règles 1 à 5 est déterminant, comme sur tout firewall</span>
FortiOS évalue les règles dans l'ordre et s'arrête à la première correspondance (rappel du principe déjà vu au chapitre 10 pour le Spanning Tree, et au chapitre 11 pour les ACL) — la règle 4 (interdiction DMZ → interne) doit impérativement précéder toute règle plus permissive, et la règle 5 (deny-all) doit toujours rester en dernière position.
</div>

## 13.7 Étape 6 — NAT (déjà activé règle par règle ci-dessus, vérification globale)

```
config firewall policy
    edit 1
        set nat enable
        set ippool disable
    next
end
```

## 13.8 Étape 7 — IPS (Intrusion Prevention System)

```
config ips sensor
    edit "protection-standard"
        set comment "Profil IPS applique au trafic entrant"
        config entries
            edit 1
                set severity medium,high,critical
                set action block
            next
        end
    next
end

config firewall policy
    edit 3
        set ips-sensor "protection-standard"
        set utm-status enable
    next
end
```

## 13.9 Étape 8 — SSL-VPN pour les collaborateurs nomades

```
config vpn ssl settings
    set servercert "Fortinet_Factory"
    set tunnel-ip-pools "SSLVPN_TUNNEL_ADDR1"
    set port 443
    set source-interface "wan1"
end

config vpn ssl web portal
    edit "acces-complet"
        set tunnel-mode enable
        set ip-pools "SSLVPN_TUNNEL_ADDR1"
        set split-tunneling disable
    next
end

config user local
    edit "jaslin.occius"
        set type password
        set passwd MotDePasseVpnUtilisateur2026!
    next
end

config user group
    edit "Groupe-VPN-Nomades"
        set member "jaslin.occius"
    next
end

config firewall policy
    edit 6
        set name "SSLVPN-vers-Interne"
        set srcintf "ssl.root"
        set dstintf "port2.10"
        set srcaddr "all"
        set dstaddr "reseau_bureautique"
        set service "ALL"
        set action accept
        set groups "Groupe-VPN-Nomades"
    next
end
```

## 13.10 Étape 9 — Haute disponibilité (second FortiGate FW-SIEGE-02)

**Sur FW-SIEGE-01 :**

```
config system ha
    set mode a-p
    set group-id 10
    set group-name "HA-Siege"
    set password ClusterHaSecrete2026!
    set hbdev "port4" 50
    set priority 200
end
```

**Sur FW-SIEGE-02 (configuration miroir, seule la priorité change) :**

```
config system ha
    set mode a-p
    set group-id 10
    set group-name "HA-Siege"
    set password ClusterHaSecrete2026!
    set hbdev "port4" 50
    set priority 100
end
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le mot de passe de cluster HA doit être rigoureusement identique</span>
Comme pour le VPN (chapitre 11) et le RADIUS (chapitre 12), toute négociation entre deux équipements distincts échoue silencieusement au moindre caractère différent dans un secret partagé — vérifier ce mot de passe avec la plus grande attention avant de relier les deux FortiGate par le câble de heartbeat (port4).
</div>

## 13.11 Étape 10 — Sauvegarde et vérifications

```
execute backup config flash

diagnose sys ha status
get system ha status
diagnose vpn ike gateway list
diagnose vpn tunnel list
```

## 13.12 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Créer une règle temporaire trop permissive "pour tester", jamais retirée</span>
Rappel du chapitre 13 théorique : toute règle de test doit porter une date de retrait documentée — vérifier périodiquement (`show firewall policy`) qu'aucune règle temporaire oubliée ne subsiste en production.
</div>

## 13.13 Bonnes pratiques

- Toujours créer les objets adresses (étape 13.5) avant d'écrire les règles qui les référencent.
- Vérifier l'ordre exact des règles après chaque ajout, jamais seulement leur présence individuelle.
- Tester le basculement HA (débrancher physiquement le FortiGate actif) avant la mise en production définitive.

## 13.14 Résumé du chapitre

Ce chapitre a configuré intégralement un firewall Fortinet en production : interfaces et VLAN, jeu de règles complet deny-all, IPS, SSL-VPN pour les nomades, et haute disponibilité avec un second boîtier — de la première connexion à la vérification finale du cluster.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 13.1</span>

Un nouveau VLAN 60 (IoT, `10.10.60.0/24`, rappel de l'exercice du chapitre 12) doit être strictement bloqué vers Internet et vers tous les autres VLAN internes. Écris la règle FortiOS correspondante, à la bonne position dans le jeu de règles existant.
</div>

**Corrigé :**
```
config firewall policy
    edit 0
        set name "Deny-IoT-Total"
        set srcintf "port2.60"
        set dstintf "wan1" "port2.10" "port2.20"
        set srcaddr "all"
        set dstaddr "all"
        set action deny
        set logtraffic all
    next
end
```
Cette règle doit être positionnée **avant** la règle 5 (Deny-All-Final) mais peut être ajoutée à tout moment dans l'ordre, une règle de refus explicite ne créant jamais de conflit avec une autre règle de refus.

*Chapitre suivant : les serveurs Windows Server (Active Directory, DNS, DHCP, GPO, Hyper-V).*
