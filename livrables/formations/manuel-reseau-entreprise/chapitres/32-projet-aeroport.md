<div class="chapitre-titre-num">CHAPITRE 32</div>

# Projet complet : Aéroport

## Objectifs pédagogiques

Réaliser, de A à Z, le réseau d'un aéroport régional : configuration intégrale du cœur redondant Juniper, de l'étanchéité stricte entre Wi-Fi passagers et réseau de sûreté, et de l'intégration complète du contrôle d'accès biométrique zone réglementée.

## Prérequis

Chapitres 1-31. Ce chapitre applique la méthode des chapitres 11 (redondance), 13 (firewall/segmentation), 23 (intégration sûreté) avec la configuration complète propre à ce projet.

## 32.1 Contexte, budget et matériel

- Aérogare, zone fret, pistes, parkings. FIDS, tri bagages, contrôle d'accès zone réglementée, 300 caméras.
- Cœur Juniper redondant, contrôleur Wi-Fi Aruba, firewall Fortinet, RTO quasi nul pour FIDS et sûreté.
- Budget : 15 % cœur réseau, 15 % Wi-Fi, 20 % vidéosurveillance, 15 % sûreté/contrôle d'accès, 15 % firewall, 15 % serveurs, 5 % câblage.

## 32.2 Étape 1 — Configuration complète du cœur Juniper redondant (JunOS)

```
set system host-name CORE-AEROPORT-01
set system root-authentication plain-text-password

set interfaces ae0 aggregated-ether-options lacp active
set interfaces ge-0/0/0 gigether-options 802.3ad ae0
set interfaces ge-0/0/1 gigether-options 802.3ad ae0

set vlans VLAN-FIDS vlan-id 10
set vlans VLAN-SURETE vlan-id 20
set vlans VLAN-WIFI-PASSAGERS vlan-id 30
set vlans VLAN-VIDEOSURVEILLANCE vlan-id 40
set vlans VLAN-TRI-BAGAGES vlan-id 50

set interfaces irb unit 10 family inet address 10.80.10.1/25
set interfaces irb unit 20 family inet address 10.80.20.1/24
set interfaces irb unit 30 family inet address 10.80.30.1/21
set interfaces irb unit 40 family inet address 10.80.40.1/21
set interfaces irb unit 50 family inet address 10.80.50.1/25

set vlans VLAN-FIDS l3-interface irb.10
set vlans VLAN-SURETE l3-interface irb.20
set vlans VLAN-WIFI-PASSAGERS l3-interface irb.30
set vlans VLAN-VIDEOSURVEILLANCE l3-interface irb.40
set vlans VLAN-TRI-BAGAGES l3-interface irb.50

set protocols ospf area 0.0.0.0 interface ae0.0
set protocols ospf area 0.0.0.0 interface irb.10 passive
set protocols ospf area 0.0.0.0 interface irb.20 passive
set protocols ospf area 0.0.0.0 interface irb.30 passive
set protocols ospf area 0.0.0.0 interface irb.40 passive
set protocols ospf area 0.0.0.0 interface irb.50 passive

commit
```

**CORE-AEROPORT-02 (redondance)** : configuration miroir avec `set system host-name CORE-AEROPORT-02`, adresses IRB en `.2` au lieu de `.1`, et VRRP JunOS entre les deux :

```
set interfaces irb unit 10 family inet address 10.80.10.2/25 vrrp-group 10 virtual-address 10.80.10.1
set interfaces irb unit 10 family inet address 10.80.10.2/25 vrrp-group 10 priority 100
```

## 32.3 Étape 2 — Firewall Fortinet : isolation stricte Wi-Fi passagers / sûreté

```
config system interface
    edit "port2.20"
        set interface "port2"
        set vlanid 20
        set ip 10.80.20.10 255.255.255.0
        set alias "Surete"
    next
    edit "port2.30"
        set interface "port2"
        set vlanid 30
        set ip 10.80.30.10 255.255.248.0
        set alias "Wifi-Passagers"
    next
end

config firewall policy
    edit 1
        set name "Deny-WifiPassagers-vers-Surete"
        set srcintf "port2.30"
        set dstintf "port2.20"
        set action deny
        set logtraffic all
    next
    edit 2
        set name "Deny-WifiPassagers-vers-TriBagages"
        set srcintf "port2.30"
        set dstintf "port2.50"
        set action deny
        set logtraffic all
    next
    edit 3
        set name "WifiPassagers-vers-Internet"
        set srcintf "port2.30"
        set dstintf "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set service "HTTPS" "HTTP" "DNS"
        set nat enable
        set action accept
    next
    edit 4
        set name "Deny-All-Final"
        set srcintf "any"
        set dstintf "any"
        set action deny
        set logtraffic all
    next
end
```

## 32.4 Étape 3 — Contrôleur Wi-Fi Aruba (haute densité aérogare)

1. Installer le Mobility Controller, créer le réseau `VLAN30-WifiPassagers` (`10.80.30.0/21`).
2. Créer le SSID :

```
Nom du reseau (SSID) : Aeroport-Passagers
VLAN : 30
Securite : Portail captif (acceptation CGU, limite de duree 4h)
Limite de bande passante : 5 Mbps descendant / 1 Mbps montant par appareil
Bandes : 5 GHz et 6 GHz prioritaires (forte densite des salles d'embarquement)
```

3. Groupe d'AP dédié aux salles d'embarquement avec profil haute densité (canaux non superposés, puissance modérée).

## 32.5 Étape 4 — Intégration contrôle d'accès biométrique et vidéosurveillance (300 caméras)

1. Adressage caméras : `10.80.40.10` à `10.80.40.309` (sous-réseau `10.80.40.0/21`).
2. Postes de contrôle sûreté et comptoirs enregistrement : niveau Identification (250 px/m). Halls et embarquement : niveau Reconnaissance. Piste : caméras thermiques et PTZ longue portée.
3. Configuration de l'intégration biométrique (système de contrôle d'accès zone réglementée, exemple de règle) :

```
Regle d'integration :
  Evenement : tentative d'acces badge+biometrie a la zone reglementee
  Action systematique : capture video (-5s / +10s) associee a l'identite badgee
  Si echec d'authentification : alerte immediate au poste de surete + enregistrement marque prioritaire
```

4. VMS avec redondance de stockage (RAID 6 + réplication), rétention 30 jours minimum ou selon exigence réglementaire aéroportuaire applicable.

## 32.6 Étape 5 — Tests de validation

<div class="encadre astuce">
<span class="encadre-titre">💡 Checklist de recette</span>

1. Depuis un appareil connecté au Wi-Fi passagers, tenter d'atteindre le VLAN sûreté (`10.80.20.0/24`) : doit échouer systématiquement, à tester depuis plusieurs points d'accès différents.
2. Débrancher CORE-AEROPORT-01 : vérifier la bascule VRRP JunOS vers CORE-AEROPORT-02.
3. Test de charge Wi-Fi en salle d'embarquement pleine.
4. Vérifier la génération automatique d'un enregistrement vidéo lors d'un test d'accès biométrique (réussi et échoué).
5. Audit complet de la segmentation (aucune règle firewall non documentée entre segments critiques et publics).
</div>

## 32.7 Documentation finale et résumé

Dossier complet (chapitre 25) incluant la documentation de conformité aux standards de sûreté aéroportuaire applicables et le plan de test de segmentation critique. Ce chapitre a démontré la configuration intégrale d'un réseau aéroportuaire au niveau de segmentation le plus strict du manuel.

*Chapitre suivant : projet complet Usine — segmentation IT/OT et environnement industriel exigeant.*
