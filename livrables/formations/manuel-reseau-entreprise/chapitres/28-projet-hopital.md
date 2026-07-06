<div class="chapitre-titre-num">CHAPITRE 28</div>

# Projet complet : Hôpital

## Objectifs pédagogiques

Réaliser, de A à Z, le réseau à très haute disponibilité d'un hôpital de 400 lits : configuration intégrale du cluster de firewalls Fortinet HA, segmentation stricte des équipements médicaux connectés, cluster Hyper-V avec stockage répliqué, et intégration complète de la vidéosurveillance sur les zones sensibles.

## Prérequis

Chapitres 1-27. Ce chapitre applique la méthode des chapitres 13 (firewall/HA), 14 (Hyper-V), 16 (Zero Trust) avec la configuration complète propre à ce projet.

## 28.1 Contexte, budget et matériel

- 400 lits, 5 bâtiments reliés (urgences, blocs opératoires, hospitalisation, consultations, administration).
- DPI (dossier patient informatisé) et PACS (imagerie) critiques, RTO 15 minutes.
- Cluster FortiGate HA A-P, cluster Hyper-V 4 hôtes avec stockage SAN répliqué entre 2 salles serveur, 150 caméras.
- Budget : 20 % réseau cœur, 15 % firewall HA, 15 % vidéosurveillance, 20 % serveurs/virtualisation, 15 % câblage, 15 % onduleurs/groupe électrogène.

## 28.2 Étape 1 — Câblage et deux chemins fibre indépendants

<div class="encadre attention">
<span class="encadre-titre">⚠️ Rappel impératif du chapitre 28 théorique</span>
Les deux liaisons fibre entre Urgences ↔ Salle serveur A et Urgences ↔ Salle serveur B doivent emprunter des chemins de câbles **physiquement distincts** (gaines techniques différentes, jamais la même colonne montante) — vérifier ce point sur le plan de câblage avant le tirage, pas après.
</div>

Cat6A intégral (aucune concession budgétaire), fibre monomode redondante entre les 5 bâtiments et les 2 salles serveur.

## 28.3 Étape 2 — Configuration complète du cluster FortiGate HA (segmentation DPI/équipements médicaux)

**FW-HOPITAL-01 (membre HA principal) :**

```
config system global
    set hostname "FW-HOPITAL-01"
end

config system interface
    edit "wan1"
        set mode static
        set ip 203.0.113.10 255.255.255.248
    next
    edit "port2.10"
        set interface "port2"
        set vlanid 10
        set ip 10.40.10.2 255.255.254.0
        set alias "DPI-PACS"
    next
    edit "port2.20"
        set interface "port2"
        set vlanid 20
        set ip 10.40.20.2 255.255.255.0
        set alias "Equipements-Medicaux"
    next
    edit "port2.30"
        set interface "port2"
        set vlanid 30
        set ip 10.40.30.2 255.255.255.0
        set alias "Administration"
    next
    edit "port2.40"
        set interface "port2"
        set vlanid 40
        set ip 10.40.40.2 255.255.252.0
        set alias "Videosurveillance"
    next
    edit "port2.50"
        set interface "port2"
        set vlanid 50
        set ip 10.40.50.2 255.255.255.0
        set alias "Wifi-Visiteurs"
    next
end

config firewall address
    edit "postes_medicaux_autorises"
        set subnet 10.40.20.0 255.255.255.0
    next
    edit "serveurs_dpi"
        set subnet 10.40.10.0 255.255.254.0
    next
end

config firewall policy
    edit 1
        set name "Postes-medicaux-vers-DPI"
        set srcintf "port2.20"
        set dstintf "port2.10"
        set srcaddr "postes_medicaux_autorises"
        set dstaddr "serveurs_dpi"
        set service "HTTPS"
        set action accept
        set logtraffic all
    next
    edit 2
        set name "Deny-Medical-vers-Internet"
        set srcintf "port2.20"
        set dstintf "wan1"
        set action deny
        set logtraffic all
    next
    edit 3
        set name "Administration-vers-Internet"
        set srcintf "port2.30"
        set dstintf "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set service "HTTPS" "HTTP" "DNS"
        set nat enable
        set action accept
    next
    edit 4
        set name "Wifi-Visiteurs-Internet-Uniquement"
        set srcintf "port2.50"
        set dstintf "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set service "HTTPS" "HTTP" "DNS"
        set nat enable
        set action accept
    next
    edit 5
        set name "Deny-All-Final"
        set srcintf "any"
        set dstintf "any"
        set action deny
        set logtraffic all
    next
end

config system ha
    set mode a-p
    set group-id 20
    set group-name "HA-Hopital"
    set password ClusterHaHopital2026!
    set hbdev "port4" 50
    set priority 200
end
```

**FW-HOPITAL-02 :** configuration miroir strictement identique, seule différence :

```
config system global
    set hostname "FW-HOPITAL-02"
end
config system ha
    set priority 100
end
```

## 28.4 Étape 3 — MFA obligatoire sur l'accès au DPI

```powershell
# Sur le serveur AD/NPS de l'hopital, activation de l'authentification multifacteur
# via Azure MFA ou solution MFA on-premise integree a NPS (extension NPS)
Install-Module -Name AzureADPreview
# Configuration de l'extension NPS pour Azure MFA (etapes du fournisseur MFA retenu)
# Puis, dans la strategie reseau NPS (rappel chapitre 12) :
#   Contraintes -> Methodes d'authentification -> Exiger l'authentification multifacteur
```

## 28.5 Étape 4 — Cluster Hyper-V 4 hôtes avec stockage répliqué entre 2 salles

```powershell
# Sur les 4 hotes (2 dans chaque salle serveur)
Install-WindowsFeature -Name Hyper-V, Failover-Clustering, FS-FileServer -IncludeManagementTools -Restart

New-Cluster -Name "CLUSTER-HYPERV-HOPITAL" -Node "HOTE-A1","HOTE-A2","HOTE-B1","HOTE-B2" -StaticAddress 10.40.30.20

# Storage Replica entre les deux salles (repliquer le volume de la Salle A vers la Salle B)
New-SRPartnership -SourceComputerName "HOTE-A1" -SourceRGName "RG-SalleA" -SourceVolumeName "D:" -SourceLogVolumeName "L:" `
  -DestinationComputerName "HOTE-B1" -DestinationRGName "RG-SalleB" -DestinationVolumeName "D:" -DestinationLogVolumeName "L:"

# VM critique DPI, inscrite au cluster
New-VM -Name "SRV-DPI-01" -MemoryStartupBytes 16GB -Generation 2 -Path "D:\SRV-DPI-01" -NewVHDPath "D:\SRV-DPI-01\disque.vhdx" -NewVHDSizeBytes 200GB
Add-ClusterVirtualMachineRole -VMName "SRV-DPI-01"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Storage Replica : la réplication synchrone entre les deux salles serveur</span>
Cette fonctionnalité native de Windows Server réplique en continu le volume de stockage de la Salle A vers la Salle B — en cas de sinistre total sur la Salle A, les données restent disponibles sur la Salle B avec une perte quasi nulle (RPO proche de zéro), condition nécessaire pour tenir le RTO de 15 minutes exigé (rappel de l'exercice du chapitre 25).
</div>

## 28.6 Étape 5 — Déploiement des 150 caméras (zones à niveau Identification)

1. Adressage IP statique : `10.40.40.10` à `10.40.40.159` (150 adresses, sous-réseau `10.40.40.0/22`).
2. Caméras dédiées pharmacie et coffre à médicaments : niveau **Identification** (250 px/m), montées à 2,5 m avec éclairage contrôlé (rappel chapitre 20).
3. Intégration au contrôle d'accès des zones sensibles (bloc opératoire, pharmacie) : chaque badge génère un événement corrélé à la séquence vidéo (chapitre 23).
4. Politique de rétention : 90 jours sur les zones sensibles (pharmacie, coffre), 30 jours ailleurs — conforme à la réglementation sanitaire applicable, à vérifier localement.

## 28.7 Étape 6 — Tests de validation

<div class="encadre astuce">
<span class="encadre-titre">💡 Checklist de recette</span>

1. Débrancher FW-HOPITAL-01 : vérifier la bascule HA vers FW-HOPITAL-02 sans coupure de l'accès au DPI.
2. Depuis un poste du VLAN Équipements médicaux, tenter un accès Internet direct : doit échouer systématiquement.
3. Simuler la panne de la Salle serveur A : vérifier la reprise du service DPI depuis la Salle B (Storage Replica) dans le délai de 15 minutes.
4. Vérifier le déclenchement MFA sur une tentative de connexion au DPI.
5. Vérifier la couverture Identification effective sur chaque caméra pharmacie (test de jour et de nuit).
</div>

## 28.8 Documentation finale et résumé

Dossier complet (chapitre 25) incluant l'analyse de risque des équipements médicaux connectés, la procédure PCA dégradée papier pour les urgences, et les rapports de test de bascule HA/Storage Replica. Ce chapitre a démontré la configuration intégrale d'un réseau hospitalier à très haute disponibilité, avec segmentation stricte des systèmes critiques.

*Chapitre suivant : projet complet Hôtel — expérience client Wi-Fi et vidéosurveillance périmétrique.*
