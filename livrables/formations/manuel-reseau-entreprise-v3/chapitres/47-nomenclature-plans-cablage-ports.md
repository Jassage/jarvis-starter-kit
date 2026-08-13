<div class="chapitre-titre-num">CHAPITRE 47</div>

# Nomenclature, plan de câblage, plan de ports

## Objectifs pédagogiques

Produire les trois documents de référence qui accompagnent tout projet professionnel : la nomenclature matérielle (quoi acheter, avec quelles caractéristiques minimales), le plan de câblage (système d'identifiant unique par prise) et le plan de ports (quel port de quel switch dessert quel appareil).

## Prérequis

Volumes 1-14.

## 47.1 La nomenclature matérielle

Une nomenclature professionnelle liste chaque équipement avec une **référence interne**, sa fonction, sa quantité, et ses **caractéristiques minimales** — jamais une marque imposée d'emblée (chapitre 35, principe déjà appliqué systématiquement au Volume 5).

**Exemple appliqué au switch d'accès du projet fil rouge (chapitre 13) :**

```
Reference : SW-01
Equipement : Switch manageable d'acces
Quantite : 1
Fonction : Dessert les VLAN Utilisateurs (20), Comptabilite (25), VoIP (40)
Caracteristiques minimales :
  - 24 ports 1 Gbit/s
  - PoE+ (802.3at) sur les 24 ports
  - Budget PoE total >= 230 W (chapitre 13.4)
  - 2 uplinks SFP+ dedies
  - Support VLAN 802.1Q (4094 VLAN)
  - Support RSTP, LACP, Port Security, DHCP Snooping
  - Management SSH/HTTPS
```

**Nomenclature complète du projet fil rouge** (extrait représentatif) :

| Référence | Équipement | Quantité | Fonction |
|---|---|---|---|
| SW-01 | Switch d'accès 24 ports PoE+ | 1 | VLAN Utilisateurs/Comptabilité/VoIP, étage 1 |
| SW-COEUR-01/02 | Switch cœur L3, 10G | 2 | Routage inter-VLAN, redondance VRRP |
| SW-CCTV-01 | Switch PoE+ dédié 24 ports | 1 | VLAN CCTV |
| FW-01 | Firewall UTM | 1 | WAN, NAT, sécurité périmétrique, VPN |
| AP-01 à AP-05 | Borne Wi-Fi 6 | 5 | SSID Corporate/Invité |
| SRV-01 | Serveur rack 1U | 1 | AD, DNS, DHCP, fichiers |
| SRV-02 | Serveur rack 1U | 1 | Intranet, applications conteneurisées |
| SRV-03 | Serveur rack 1U | 1 | Supervision |
| NVR-01 | NVR 32 canaux, RAID | 1 | Enregistrement vidéosurveillance |
| CAM-01 à CAM-21 | Caméra IP 4 MP | 21 | Vidéosurveillance (types variables selon emplacement, chapitre 33) |
| UPS-01 | Onduleur rack | 1 | Alimentation de secours de la baie |

## 47.2 Le plan de câblage : système d'identifiant unique par prise

Chaque prise murale du projet reçoit un identifiant unique, construit selon un système cohérent et documenté :

```
B01-2F-P015
 │   │   │
 │   │   └── Prise n°015
 │   └────── 2e etage (Floor)
 └────────── Batiment 01
```

**Explication du système de nommage** : `B01` identifie le bâtiment (utile dès qu'un projet comporte plusieurs bâtiments, Volume 16 Projet 4), `2F` l'étage, `P015` un numéro de prise séquentiel propre à cet étage — un identifiant unique, lisible par n'importe quel technicien sans ambiguïté, y compris des années après l'installation initiale.

**Extrait du plan de câblage du projet fil rouge :**

| Identifiant prise | Zone | Câble certifié (chapitre 17.12) | Port patch panel |
|---|---|---|---|
| B01-1F-P001 | Bureau 101 | Oui, PASS | PP1-01 |
| B01-1F-P002 | Bureau 101 | Oui, PASS | PP1-02 |
| B01-1F-P020 | Entrée principale (caméra) | Oui, PASS | PP1-20 |

## 47.3 Le plan de ports

Le plan de ports relie enfin l'identifiant de prise (47.2) au port switch réel et au VLAN attribué (chapitre 20) — le document qu'un technicien consulte en priorité pour comprendre "que dessert ce port ?" sans avoir à relire l'intégralité de la configuration du switch.

| Switch | Port | VLAN | Appareil | Localisation (identifiant prise) |
|---|---|---|---|---|
| SW-01 | Gi1/0/1 | 20 | PC | B01-1F-P001 |
| SW-01 | Gi1/0/2 | 20 | PC | B01-1F-P002 |
| SW-01 | Gi1/0/19 | 25 | PC (Comptabilité) | B01-1F-P019 |
| SW-01 | Gi1/0/23-24 | TRUNK | Port-channel vers SW-COEUR | Baie technique |
| SW-CCTV-01 | Gi1/0/1 | 80 | Caméra entrée principale | B01-1F-P020 |

<div class="encadre astuce">
<span class="encadre-titre">💡 Ces trois documents forment un seul dossier cohérent, jamais isolés les uns des autres</span>
La nomenclature répond à "qu'a-t-on acheté et pourquoi", le plan de câblage répond à "où mène physiquement chaque câble", le plan de ports répond à "que dessert chaque port et sur quel VLAN". Associés au plan IP (chapitre 11) déjà produit, ces quatre documents forment ensemble le socle documentaire complet de tout projet — repris intégralement dans la documentation finale remise au client (chapitre 49).
</div>

## Résumé du chapitre

La nomenclature matérielle liste chaque équipement avec ses caractéristiques minimales, jamais une marque imposée d'emblée. Le plan de câblage attribue un identifiant unique et cohérent à chaque prise (bâtiment-étage-numéro). Le plan de ports relie cet identifiant au port switch réel et à son VLAN. Ces trois documents, associés au plan IP du chapitre 11, forment le socle documentaire complet de tout projet professionnel.

*Chapitre suivant : la mise en production, les tests et la recette — comment livrer un projet sans interruption de service, et comment le valider formellement avec le client.*
