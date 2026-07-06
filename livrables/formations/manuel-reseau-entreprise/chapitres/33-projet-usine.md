<div class="chapitre-titre-num">CHAPITRE 33</div>

# Projet complet : Usine

## Objectifs pédagogiques

Réaliser, de A à Z, le réseau industriel d'un site de production : configuration intégrale de la segmentation stricte IT/OT via DMZ industrielle, du câblage durci, et de l'intégration LPR aux quais de chargement.

## Prérequis

Chapitres 1-32. Ce chapitre applique la méthode du chapitre 13 (firewall/DMZ) avec la configuration complète propre à ce projet et à la norme IEC 62443.

## 33.1 Contexte, budget et matériel

- Bâtiment de production (automates, SCADA), entrepôt logistique, bureaux administratifs.
- Réseau OT isolé, DMZ industrielle (serveur historian), 40 caméras dont LPR aux quais.
- Budget : 20 % IT, 20 % OT durci, 15 % segmentation IT/OT, 15 % vidéosurveillance, 20 % câblage industriel, 10 % baies climatisées.

## 33.2 Étape 1 — Câblage industriel durci

Gaine renforcée résistante aux huiles/produits chimiques en zone de production, connecteurs RJ45 industriels IP67, cheminement à distance des moteurs/variateurs de fréquence (perturbation électromagnétique, rappel chapitre 8). Switches industriels durcis (température étendue -20°C à +60°C) dans les armoires électriques de production.

## 33.3 Étape 2 — Configuration complète du firewall Fortinet (DMZ industrielle IT/OT)

```
config system interface
    edit "port2.10"
        set interface "port2"
        set vlanid 10
        set ip 10.90.10.1 255.255.255.0
        set alias "IT-Bureaux"
    next
    edit "port3"
        set ip 10.90.25.1 255.255.255.240
        set alias "DMZ-Industrielle"
    next
    edit "port2.20"
        set interface "port2"
        set vlanid 20
        set ip 10.90.20.1 255.255.255.0
        set alias "OT-Automates-SCADA"
    next
    edit "port2.40"
        set interface "port2"
        set vlanid 40
        set ip 10.90.40.1 255.255.255.128
        set alias "Videosurveillance"
    next
    edit "port2.50"
        set interface "port2"
        set vlanid 50
        set ip 10.90.50.1 255.255.255.0
        set alias "Wifi-Logistique"
    next
end

config firewall address
    edit "serveur_historian"
        set subnet 10.90.25.10 255.255.255.255
    next
end

config firewall policy
    edit 1
        set name "IT-vers-DMZ-Historian-Uniquement"
        set srcintf "port2.10"
        set dstintf "port3"
        set srcaddr "all"
        set dstaddr "serveur_historian"
        set service "HTTPS"
        set action accept
        set logtraffic all
    next
    edit 2
        set name "Deny-IT-vers-OT-Direct"
        set srcintf "port2.10"
        set dstintf "port2.20"
        set action deny
        set logtraffic all
    next
    edit 3
        set name "OT-vers-DMZ-Historian-Uniquement"
        set srcintf "port2.20"
        set dstintf "port3"
        set srcaddr "all"
        set dstaddr "serveur_historian"
        set service "HTTPS"
        set action accept
        set logtraffic all
    next
    edit 4
        set name "Deny-OT-vers-Internet"
        set srcintf "port2.20"
        set dstintf "wan1"
        set action deny
        set logtraffic all
    next
    edit 5
        set name "IT-vers-Internet"
        set srcintf "port2.10"
        set dstintf "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set service "HTTPS" "HTTP" "DNS"
        set nat enable
        set action accept
    next
    edit 6
        set name "Deny-All-Final"
        set srcintf "any"
        set dstintf "any"
        set action deny
        set logtraffic all
    next
end
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Aucune règle ne connecte directement IT et OT</span>
Vérifie l'absence de toute règle 1-vers-1 entre `port2.10` et `port2.20` en dehors des règles 2 (deny explicite) — seul le serveur historian en DMZ (`port3`) fait office d'intermédiaire, dans les deux sens, jamais de flux direct IT↔OT.
</div>

## 33.4 Étape 3 — Configuration des switches industriels durcis (zone de production)

```
/system identity set name=SW-PRODUCTION-01
/interface bridge add name=bridge-ot vlan-filtering=yes

/interface bridge port
add bridge=bridge-ot interface=ether1 pvid=20
add bridge=bridge-ot interface=ether2 pvid=20
add bridge=bridge-ot interface=ether24 frame-types=admit-only-vlan-tagged

/interface bridge vlan
add bridge=bridge-ot vlan-ids=20 tagged=ether24 untagged=ether1,ether2

/ip address add address=10.90.99.10/27 interface=bridge-ot
/ip route add gateway=10.90.99.1
/user set admin password=UsineAdmin2026!Secure
```

## 33.5 Étape 4 — Déploiement des 40 caméras et du LPR quais

1. Adressage : `10.90.40.10` à `10.90.40.49` (sous-réseau `10.90.40.0/25`).
2. Caméras bullet IP66/IK10 en zone de production poussiéreuse et en extérieur (rappel chapitre 20).
3. Caméras LPR aux quais de chargement, intégrées au système de gestion des livraisons :

```
Regle d'integration LPR quais :
  Evenement : plaque reconnue a l'entree du quai
  Verification : plaque presente dans le planning de livraison du jour
  Action si conforme : notification au responsable logistique, ouverture automatique de la barriere
  Action si non conforme : alerte, enregistrement marque prioritaire
```

## 33.6 Étape 5 — Tests de validation

<div class="encadre astuce">
<span class="encadre-titre">💡 Checklist de recette</span>

1. Depuis un poste IT, tenter une connexion directe vers un automate OT : doit échouer systématiquement.
2. Vérifier que le serveur historian peut consulter l'OT ET être consulté par l'IT, sans que l'inverse (IT↔OT direct) ne soit jamais possible.
3. Vérifier le fonctionnement du câblage industriel en conditions réelles (vibrations, température).
4. Tester le système LPR aux quais (reconnaissance, vérification planning, ouverture barrière).
5. Vérifier la résistance des caméras extérieures/production (poussière, intempéries).
</div>

## 33.7 Documentation finale et résumé

Dossier complet (chapitre 25) incluant le schéma de segmentation IT/OT détaillé, sa justification par rapport à la norme IEC 62443, et la procédure de maintenance des automates tenant compte des fenêtres de production. Ce chapitre a démontré la configuration intégrale d'une segmentation IT/OT industrielle avec DMZ comme unique point de passage contrôlé.

*Chapitre suivant : projet complet Siège social multi-sites — WAN, SD-WAN et kit standardisé de déploiement.*
