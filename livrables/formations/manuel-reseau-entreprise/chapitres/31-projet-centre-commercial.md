<div class="chapitre-titre-num">CHAPITRE 31</div>

# Projet complet : Centre commercial

## Objectifs pédagogiques

Réaliser, de A à Z, le réseau d'un centre commercial de 80 boutiques : configuration intégrale de l'isolation multi-locataires, du Wi-Fi visiteurs haute densité, et du système LPR de parking intégré au paiement automatique.

## Prérequis

Chapitres 1-30. Ce chapitre applique la méthode des chapitres 10 (VLAN), 12 (Wi-Fi), 13 (firewall) avec la configuration complète propre à ce projet.

## 31.1 Contexte, budget et matériel

- 80 boutiques, 3 niveaux, parking souterrain 800 places, food court.
- Wi-Fi visiteurs jusqu'à 15 000 visiteurs/jour, réseau GTB/GTC séparé, 200 caméras (dont LPR parking).
- Budget : 15 % câblage, 15 % cœur réseau, 20 % Wi-Fi visiteurs, 20 % vidéosurveillance, 15 % firewall multi-locataires, 10 % GTB/GTC, 5 % baies.

## 31.2 Étape 1 — Configuration complète du firewall Fortinet (isolation multi-locataires)

```
config system interface
    edit "port2.20"
        set interface "port2"
        set vlanid 20
        set ip 10.70.20.1 255.255.240.0
        set alias "Wifi-Visiteurs"
    next
    edit "port2.100"
        set interface "port2"
        set vlanid 100
        set ip 10.70.100.1 255.255.255.240
        set alias "Boutique-01"
    next
    edit "port2.101"
        set interface "port2"
        set vlanid 101
        set ip 10.70.101.1 255.255.255.240
        set alias "Boutique-02"
    next
end
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Répéter la sous-interface port2.1XX pour chacune des 80 boutiques</span>
Chaque boutique reçoit un identifiant VLAN séquentiel (100 à 179) et un bloc `/28` dédié (`10.70.[100+n].0/28`, 14 adresses utiles) — largement suffisant pour une caisse enregistreuse et un terminal de paiement par boutique. Cette numérotation systématique facilite la création en masse (script) plutôt que la saisie manuelle une à une.
</div>

```
config firewall policy
    edit 100
        set name "Boutiques-vers-Internet-Uniquement"
        set srcintf "port2.100" "port2.101"
        set dstintf "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set service "HTTPS" "HTTP" "DNS"
        set nat enable
        set action accept
    next
    edit 101
        set name "Deny-Inter-Boutiques"
        set srcintf "port2.100" "port2.101"
        set dstintf "port2.100" "port2.101"
        set action deny
        set logtraffic all
    next
    edit 102
        set name "Deny-GTB-vers-Reste"
        set srcintf "port2.50"
        set dstintf "any"
        set action deny
        set logtraffic all
    next
    edit 103
        set name "Deny-All-Final"
        set srcintf "any"
        set dstintf "any"
        set action deny
    next
end
```

## 31.3 Étape 2 — Wi-Fi visiteurs haute densité (Ubiquiti UniFi, 150+ AP)

1. Adopter les AP par lot (import CSV), les regrouper par niveau (RDC, Niveau 1, Niveau 2, Parking).
2. Créer le réseau `VLAN20-WifiVisiteurs`, sous-réseau `10.70.20.0/20` (4096 adresses).
3. Créer le SSID :

```
Nom du reseau (SSID) : CentreCommercial-Visiteurs
VLAN : 20
Securite : Portail captif (acceptation CGU + email facultatif, marketing)
Limite de bande passante : 8 Mbps descendant / 2 Mbps montant par appareil
Isolation des clients : ACTIVEE
Analytique de frequentation : ACTIVEE (comptage anonymise, verifier conformite reglementaire locale)
```

4. Réglages RF par zone : puissance moyenne dans les galeries (forte densité d'AP rapprochés), puissance plus élevée dans le parking souterrain (AP plus espacés).

## 31.4 Étape 3 — Configuration du switch cœur et distribution par niveau (Cisco IOS)

```
Switch(config)# hostname CORE-CC
CORE-CC(config)# vlan 20
CORE-CC(config-vlan)# name Wifi-Visiteurs
CORE-CC(config-vlan)# exit
CORE-CC(config)# vlan 40
CORE-CC(config-vlan)# name Videosurveillance
CORE-CC(config-vlan)# exit
CORE-CC(config)# vlan 50
CORE-CC(config-vlan)# name GTB-GTC
CORE-CC(config-vlan)# exit

CORE-CC(config)# interface range gigabitEthernet 1/0/1-3
CORE-CC(config-if-range)# description Vers-distribution-par-niveau
CORE-CC(config-if-range)# switchport mode trunk
CORE-CC(config-if-range)# switchport trunk allowed vlan 20,40,50,99,100-179
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Trunk allowed vlan avec une plage (100-179) plutôt que 80 lignes individuelles</span>
Cisco IOS accepte une plage continue de VLAN dans une seule commande `switchport trunk allowed vlan` — utile pour éviter 80 ajouts individuels lorsque les VLAN boutiques sont numérotés consécutivement (rappel étape 31.2).
</div>

## 31.5 Étape 4 — Déploiement des 200 caméras et du système LPR parking

1. Adressage : `10.70.40.10` à `10.70.40.209` (200 adresses), sous-réseau `10.70.40.0/22`.
2. Galeries : dômes, niveau Reconnaissance (125 px/m). Food court : caméras fisheye 360°, niveau Détection (25 px/m, grand espace ouvert). Parking : bullet + caméras LPR dédiées aux voies d'entrée/sortie.
3. Configuration LPR (exemple, interface web de la caméra dédiée) :

```
Mode : Reconnaissance de plaque (ANPR)
Zone de detection : voie unique, ligne virtuelle au niveau de la barriere
Integration : API vers le systeme de paiement du parking (calcul automatique de duree)
Action a la sortie : lecture de plaque -> calcul du montant du a payer -> ouverture barriere apres paiement confirme
```

4. VMS avec module de comptage de personnes (food court, entrées) pour l'analytique de fréquentation (chapitre 23), corrélée à l'analytique Wi-Fi de l'étape 31.3.

## 31.6 Étape 5 — Tests de validation

<div class="encadre astuce">
<span class="encadre-titre">💡 Checklist de recette</span>

1. Depuis le VLAN d'une boutique, tenter un ping vers le VLAN d'une autre boutique : doit échouer systématiquement.
2. Test de charge Wi-Fi visiteurs (simulation de forte affluence, plusieurs centaines de connexions simultanées).
3. Test du système LPR : passage d'un véhicule test, vérification du calcul de durée et de l'ouverture de barrière après paiement simulé.
4. Vérifier l'isolation complète du réseau GTB/GTC vis-à-vis de tous les autres VLAN.
5. Vérifier la couverture vidéo du food court (fisheye) sans angle mort.
</div>

## 31.7 Documentation finale et résumé

Dossier standard (chapitre 25) avec le plan d'attribution des VLAN boutiques (mis à jour à chaque changement de locataire) et la documentation d'intégration du système de paiement LPR. Ce chapitre a démontré la configuration intégrale d'un réseau multi-locataires à forte affluence publique, avec isolation stricte par boutique et vidéosurveillance à grande échelle.

*Chapitre suivant : projet complet Aéroport — infrastructure critique à très haute disponibilité et sûreté renforcée.*
