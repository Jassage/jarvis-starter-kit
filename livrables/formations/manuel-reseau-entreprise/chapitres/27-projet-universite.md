<div class="chapitre-titre-num">CHAPITRE 27</div>

# Projet complet : Université

## Objectifs pédagogiques

Réaliser, de A à Z, le réseau MAN multi-bâtiments d'un campus universitaire de 8000 étudiants : tirage du backbone fibre, montage des baies, configuration intégrale du cœur redondant, du contrôleur Wi-Fi haute densité Aruba, du cluster de virtualisation Hyper-V, et du VMS de vidéosurveillance — chaque équipement avec sa configuration complète.

## Prérequis

Chapitres 1-26. Ce chapitre applique la méthode déjà détaillée aux chapitres 10 (switches), 11 (routeurs/VRRP/OSPF), 12 (Wi-Fi), 14 (Windows Server/Hyper-V) — il en donne la configuration complète, entièrement adaptée à ce projet.

## 27.1 Contexte, budget et matériel

- 6 bâtiments (Sciences, Lettres, Bibliothèque, Résidences, Amphithéâtres, Administration) sur 15 hectares, 8000 étudiants, 600 personnels.
- Cœur de réseau redondant (2x Cisco Catalyst 9500) au bâtiment Administration, backbone fibre monomode vers les 5 autres bâtiments.
- Contrôleur Aruba Mobility Controller + 250 points d'accès Wi-Fi 6E.
- Cluster Hyper-V 3 hôtes (stockage partagé), VMS logiciel pour 80 caméras.
- Budget : 20 % câblage fibre/Cat6A, 15 % cœur réseau, 25 % Wi-Fi, 15 % vidéosurveillance, 15 % serveurs, 10 % baies/onduleurs.

## 27.2 Étape 1 — Tirage et certification du backbone fibre

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel du chapitre 8 appliqué à l'échelle du campus</span>
Fibre monomode (OS2) entre le bâtiment Administration (cœur) et chacun des 5 autres bâtiments, distances de 120 à 480 m selon le bâtiment. Chaque brin est soudé par fusion aux deux extrémités, puis certifié à l'OTDR (mesure d'atténuation totale du lien, chapitre 8) avant tout raccordement aux équipements actifs.
</div>

| Liaison | Distance | Type de fibre | Atténuation max tolérée |
|---|---|---|---|
| Administration ↔ Sciences | 320 m | OS2 monomode, 12 brins | 0,4 dB/km + 0,3 dB/connecteur |
| Administration ↔ Lettres | 480 m | OS2 monomode, 12 brins | idem |
| Administration ↔ Bibliothèque | 150 m | OS2 monomode, 12 brins | idem |
| Administration ↔ Résidences | 420 m | OS2 monomode, 12 brins | idem |
| Administration ↔ Amphithéâtres | 120 m | OS2 monomode, 12 brins | idem |

## 27.3 Étape 2 — Montage des baies (cœur + 5 distributions)

1. Bâtiment Administration : baie 42U, 2 switches cœur Cisco Catalyst 9500 (redondants), cluster Hyper-V (3 serveurs + stockage partagé), serveur VMS, onduleur on-line double conversion.
2. Chaque bâtiment distant : baie 12-24U avec 1 switch de distribution, panneau de brassage fibre (raccordement des brins du backbone), onduleur line-interactive.

## 27.4 Étape 3 — Configuration complète du cœur redondant (Cisco Catalyst, VRRP + OSPF)

<div class="encadre astuce">
<span class="encadre-titre">💡 Méthode identique au chapitre 11, valeurs adaptées à ce campus</span>
</div>

**CORE-01 (priorité VRRP haute) :**

```
Router> enable
Router# configure terminal
Router(config)# hostname CORE-01
CORE-01(config)# ip domain-name universite.local
CORE-01(config)# crypto key generate rsa modulus 2048
CORE-01(config)# vlan 100
CORE-01(config-vlan)# name Administration
CORE-01(config-vlan)# exit
CORE-01(config)# vlan 200
CORE-01(config-vlan)# name Wifi-Etudiants
CORE-01(config-vlan)# exit
CORE-01(config)# vlan 210
CORE-01(config-vlan)# name Wifi-Personnel
CORE-01(config-vlan)# exit
CORE-01(config)# vlan 300
CORE-01(config-vlan)# name Salles-Informatiques
CORE-01(config-vlan)# exit
CORE-01(config)# vlan 400
CORE-01(config-vlan)# name Videosurveillance
CORE-01(config-vlan)# exit
CORE-01(config)# vlan 999
CORE-01(config-vlan)# name Management
CORE-01(config-vlan)# exit

CORE-01(config)# interface vlan 100
CORE-01(config-if)# ip address 10.30.100.2 255.255.255.0
CORE-01(config-if)# vrrp 100 ip 10.30.100.1
CORE-01(config-if)# vrrp 100 priority 110
CORE-01(config-if)# vrrp 100 preempt
CORE-01(config-if)# exit

CORE-01(config)# interface vlan 200
CORE-01(config-if)# ip address 10.30.200.2 255.255.248.0
CORE-01(config-if)# vrrp 200 ip 10.30.200.1
CORE-01(config-if)# vrrp 200 priority 110
CORE-01(config-if)# vrrp 200 preempt
CORE-01(config-if)# exit

CORE-01(config)# interface vlan 210
CORE-01(config-if)# ip address 10.30.210.2 255.255.254.0
CORE-01(config-if)# vrrp 210 ip 10.30.210.1
CORE-01(config-if)# vrrp 210 priority 110
CORE-01(config-if)# vrrp 210 preempt
CORE-01(config-if)# exit

CORE-01(config)# interface vlan 300
CORE-01(config-if)# ip address 10.30.30.2 255.255.254.0
CORE-01(config-if)# vrrp 300 ip 10.30.30.1
CORE-01(config-if)# vrrp 300 priority 110
CORE-01(config-if)# vrrp 300 preempt
CORE-01(config-if)# exit

CORE-01(config)# interface vlan 400
CORE-01(config-if)# ip address 10.30.40.2 255.255.252.0
CORE-01(config-if)# vrrp 400 ip 10.30.40.1
CORE-01(config-if)# vrrp 400 priority 110
CORE-01(config-if)# vrrp 400 preempt
CORE-01(config-if)# exit

CORE-01(config)# interface vlan 999
CORE-01(config-if)# ip address 10.30.254.2 255.255.255.0
CORE-01(config-if)# exit

CORE-01(config)# router ospf 1
CORE-01(config-router)# router-id 10.30.254.2
CORE-01(config-router)# network 10.30.0.0 0.0.255.255 area 0
CORE-01(config-router)# exit

CORE-01(config)# interface range tengigabitEthernet 1/0/1-5
CORE-01(config-if-range)# switchport mode trunk
CORE-01(config-if-range)# switchport trunk allowed vlan 100,200,210,300,400,999
CORE-01(config-if-range)# description Fibre-vers-batiments-distants
CORE-01(config-if-range)# exit

CORE-01(config)# copy running-config startup-config
```

**CORE-02 (priorité VRRP basse, configuration miroir) :** identique avec `10.30.X.3` sur chaque interface VLAN et `priority 100` sans `preempt`, rappel exact de la méthode du chapitre 11.

## 27.5 Étape 4 — Configuration complète d'un switch de distribution (exemple : bâtiment Sciences)

```
Switch> enable
Switch# configure terminal
Switch(config)# hostname DIST-SCIENCES
DIST-SCIENCES(config)# ip domain-name universite.local
DIST-SCIENCES(config)# crypto key generate rsa modulus 2048

DIST-SCIENCES(config)# interface tengigabitEthernet 1/0/1
DIST-SCIENCES(config-if)# description Fibre-vers-Coeur
DIST-SCIENCES(config-if)# switchport mode trunk
DIST-SCIENCES(config-if)# switchport trunk allowed vlan 200,210,300,400,999
DIST-SCIENCES(config-if)# exit

DIST-SCIENCES(config)# interface range gigabitEthernet 1/0/1-24
DIST-SCIENCES(config-if-range)# switchport mode access
DIST-SCIENCES(config-if-range)# switchport access vlan 300
DIST-SCIENCES(config-if-range)# spanning-tree portfast
DIST-SCIENCES(config-if-range)# spanning-tree bpduguard enable
DIST-SCIENCES(config-if-range)# switchport port-security
DIST-SCIENCES(config-if-range)# switchport port-security maximum 2
DIST-SCIENCES(config-if-range)# switchport port-security violation restrict
DIST-SCIENCES(config-if-range)# switchport port-security mac-address sticky
DIST-SCIENCES(config-if-range)# exit

DIST-SCIENCES(config)# interface vlan 999
DIST-SCIENCES(config-if)# ip address 10.30.254.10 255.255.255.0
DIST-SCIENCES(config-if)# exit
DIST-SCIENCES(config)# ip default-gateway 10.30.254.1

DIST-SCIENCES(config)# copy running-config startup-config
```

Répéter à l'identique pour `DIST-LETTRES` (.11), `DIST-BIBLIOTHEQUE` (.12), `DIST-RESIDENCES` (.13), `DIST-AMPHITHEATRES` (.14), en adaptant uniquement le nom d'hôte et l'IP de management.

## 27.6 Étape 5 — Déploiement du contrôleur Wi-Fi Aruba (haute densité)

1. Installer le **Mobility Controller** Aruba en baie Administration, l'alimenter et le raccorder au VLAN 999 (management).
2. Accéder à l'interface web `https://<IP-controleur>`, assistant de première configuration : nom du site, fuseau horaire, mot de passe administrateur.
3. Créer les réseaux (VLAN) correspondants :

```
Reseau "Campus-Etudiants" -> VLAN 200, sous-reseau 10.30.200.0/21
Reseau "Campus-Personnel" -> VLAN 210, sous-reseau 10.30.210.0/23
```

4. Créer le SSID étudiants avec paramètres de haute densité (amphithéâtres) :

```
SSID : Campus-Etudiants
VLAN : 200
Securite : WPA2-Enterprise (802.1X, RADIUS NPS sur le cluster Hyper-V, meme methode que chapitre 12)
Bandes actives : 5 GHz et 6 GHz prioritaires, 2,4 GHz limitee
Puissance d'emission : Moyenne
802.11r/k/v : ACTIVES
Limite de bande passante par client : 5 Mbps en heures de pointe (amphitheatres)
```

5. Créer le groupe d'AP dédié aux amphithéâtres avec un profil radio renforcé (davantage de canaux non superposés en 5/6 GHz, puissance réduite pour limiter le chevauchement en environnement dense).
6. Adopter les 250 AP par lot (import CSV des adresses MAC/emplacements), les répartir en groupes par bâtiment.

## 27.7 Étape 6 — Cluster Hyper-V (3 hôtes, stockage partagé)

```powershell
# Sur chacun des 3 hotes physiques
Install-WindowsFeature -Name Hyper-V, Failover-Clustering -IncludeManagementTools -Restart

# Depuis un hote, une fois les 3 redemarres
New-Cluster -Name "CLUSTER-HYPERV-UNIV" -Node "HOTE-01","HOTE-02","HOTE-03" -StaticAddress 10.30.100.20

# Validation du cluster (obligatoire avant mise en production)
Test-Cluster -Node "HOTE-01","HOTE-02","HOTE-03"

# Creation des machines virtuelles critiques sur le stockage partage (CSV)
New-VM -Name "SRV-AD-01" -MemoryStartupBytes 8GB -Generation 2 -Path "C:\ClusterStorage\Volume1\SRV-AD-01" -NewVHDPath "C:\ClusterStorage\Volume1\SRV-AD-01\disque.vhdx" -NewVHDSizeBytes 80GB
Add-ClusterVirtualMachineRole -VMName "SRV-AD-01"

New-VM -Name "SRV-VMS-01" -MemoryStartupBytes 16GB -Generation 2 -Path "C:\ClusterStorage\Volume1\SRV-VMS-01" -NewVHDPath "C:\ClusterStorage\Volume1\SRV-VMS-01\disque.vhdx" -NewVHDSizeBytes 500GB
Add-ClusterVirtualMachineRole -VMName "SRV-VMS-01"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Add-ClusterVirtualMachineRole : la clé de la haute disponibilité Hyper-V</span>
Cette commande inscrit la VM comme ressource du cluster de basculement — en cas de panne de l'hôte physique qui l'exécute, le cluster la redémarre automatiquement sur un hôte survivant, exploitant le stockage partagé (CSV) accessible depuis les 3 hôtes simultanément.
</div>

## 27.8 Étape 7 — Déploiement du VMS logiciel pour 80 caméras

1. Sur la VM `SRV-VMS-01`, installer le logiciel VMS (ex. Milestone XProtect ou équivalent compatible ONVIF).
2. Adressage IP statique des caméras : plage `10.30.40.10` à `10.30.40.89` (80 adresses), sous-réseau `10.30.40.0/22`.
3. Dans le VMS, **Ajouter des caméras** → scan réseau ONVIF sur `10.30.40.0/22` → sélectionner les 80 caméras détectées → renseigner les identifiants (changés dès l'installation physique, rappel du chapitre 20).
4. Configurer le plan d'enregistrement : continu sur les entrées de bâtiments (niveau Reconnaissance, 125 px/m), détection de mouvement sur les grands parkings extérieurs (niveau Détection, 25 px/m).
5. Politique de rétention : 21 jours, stockage sur volume RAID 6 dédié du cluster (rappel chapitre 22).

## 27.9 Étape 8 — Tests de validation

<div class="encadre astuce">
<span class="encadre-titre">💡 Checklist de recette</span>

1. Débrancher CORE-01 : vérifier la bascule VRRP vers CORE-02 sans interruption perceptible pour les postes.
2. Se connecter au SSID `Campus-Etudiants` dans un amphithéâtre plein, vérifier l'absence de saturation (test de charge, rappel chapitre 27 théorique).
3. Se déplacer entre deux bâtiments pendant un appel Wi-Fi actif, vérifier le roaming sans coupure.
4. Simuler la panne d'un hôte Hyper-V : vérifier le redémarrage automatique des VM critiques sur un hôte survivant.
5. Vérifier la remontée des 80 caméras dans le VMS, de jour comme de nuit.
</div>

## 27.10 Documentation finale et résumé

Dossier complet (chapitre 25) incluant le plan de brassage fibre inter-bâtiments, les configurations exportées des 2 cœurs et 5 distributions, la configuration Aruba, et le script de création du cluster Hyper-V. Ce chapitre a démontré la configuration intégrale d'un réseau MAN universitaire à forte densité Wi-Fi et haute disponibilité de virtualisation.

*Chapitre suivant : projet complet Hôpital — haute disponibilité et cybersécurité renforcée.*
