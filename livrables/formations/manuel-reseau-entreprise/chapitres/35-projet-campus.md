<div class="chapitre-titre-num">CHAPITRE 35</div>

# Projet complet : Campus d'entreprise

## Objectifs pédagogiques

Réaliser, de A à Z, le réseau d'un campus d'entreprise étendu : configuration intégrale du contrôleur Wi-Fi Aruba centralisé multi-bâtiments pour un roaming parfait, et de l'authentification 802.1X dynamique filaire/Wi-Fi pour le flex office.

## Prérequis

Chapitres 1-34. Ce chapitre applique la méthode des chapitres 10 (802.1X), 12 (Wi-Fi/roaming), 14 (Active Directory/NPS) avec la configuration complète propre à ce projet.

## 35.1 Contexte, budget et matériel

- Campus technologique, 4 bâtiments reliés, 2500 employés, flex office, auditorium, 90 caméras dont multi-capteurs.
- Contrôleur Wi-Fi Aruba unique pour tout le campus, cœur Cisco redondant, authentification 802.1X généralisée.
- Budget : 30 % Wi-Fi haute densité, 15 % cœur réseau, 15 % vidéosurveillance, 15 % câblage fibre inter-bâtiments, 10 % authentification centralisée, 15 % serveurs/baies.

## 35.2 Étape 1 — Configuration complète du serveur RADIUS/NPS (préalable au 802.1X filaire et Wi-Fi)

```powershell
Install-WindowsFeature -Name NPAS -IncludeManagementTools
netsh nps add registeredserver

Import-Module NPS
New-NpsRadiusClient -Name "Switch-Batiment1" -Address 10.110.15.20 -SharedSecret "RadiusCampus2026!"
New-NpsRadiusClient -Name "Switch-Batiment2" -Address 10.110.15.21 -SharedSecret "RadiusCampus2026!"
New-NpsRadiusClient -Name "Controleur-Aruba" -Address 10.110.15.30 -SharedSecret "RadiusCampus2026!"
```

Dans la console NPS : créer la stratégie réseau `Campus-8021X-FlexOffice`, type d'accès **Ethernet câblé et sans fil**, méthode PEAP, avec des règles de mappage VLAN par groupe Active Directory :

```
Groupe AD "Campus-Comptabilite" -> VLAN 11 (Attribut Tunnel-Private-Group-ID = 11)
Groupe AD "Campus-RH" -> VLAN 12
Groupe AD "Campus-IT" -> VLAN 13
Groupe AD par defaut -> VLAN 10 (Bureautique generale)
```

## 35.3 Étape 2 — Configuration complète du 802.1X sur les switches d'accès (flex office)

```
Switch(config)# aaa new-model
Switch(config)# radius server NPS-CAMPUS
Switch(config-radius-server)# address ipv4 10.110.15.10 auth-port 1812 acct-port 1813
Switch(config-radius-server)# key RadiusCampus2026!
Switch(config-radius-server)# exit
Switch(config)# aaa authentication dot1x default group radius
Switch(config)# aaa authorization network default group radius
Switch(config)# dot1x system-auth-control

Switch(config)# interface range gigabitEthernet 1/0/1-48
Switch(config-if-range)# switchport mode access
Switch(config-if-range)# authentication port-control auto
Switch(config-if-range)# authentication periodic
Switch(config-if-range)# dot1x pae authenticator
Switch(config-if-range)# authentication violation restrict
Switch(config-if-range)# spanning-tree portfast
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le VLAN n'est plus fixé au port, mais déterminé dynamiquement à chaque connexion</span>
Rappel du chapitre 35 théorique : chaque poste de flex office se connectant sur n'importe quel port ainsi configuré reçoit automatiquement le VLAN correspondant à l'identité de la personne authentifiée (mapping défini à l'étape 35.2), pas au bureau physiquement occupé.
</div>

## 35.4 Étape 3 — Contrôleur Wi-Fi Aruba unique pour les 4 bâtiments

1. Installer un unique Aruba Mobility Controller au bâtiment central, relié en fibre aux 3 autres bâtiments.
2. Créer les réseaux (VLAN) :

```
Reseau "Campus-Wifi-Employes" -> VLAN 20, sous-reseau 10.110.20.0/21
Reseau "Campus-VoIP-Sans-Fil" -> VLAN 30, sous-reseau 10.110.30.0/24
```

3. Créer le SSID employés avec 802.1X :

```
Nom du reseau (SSID) : Campus-Employes
VLAN : 20
Securite : WPA2/WPA3-Enterprise (meme serveur RADIUS que l'etape 35.2)
802.11r/k/v : ACTIVES (roaming rapide inter-batiments)
Puissance d'emission : Moyenne
```

4. Adopter l'ensemble des AP des 4 bâtiments sur ce contrôleur unique — condition indispensable du roaming inter-bâtiments transparent (rappel chapitre 12).

## 35.5 Étape 4 — Cœur de réseau reliant les 4 bâtiments (Cisco, OSPF)

```
Switch(config)# vlan 20
Switch(config-vlan)# name Wifi-Employes
Switch(config-vlan)# exit
Switch(config)# vlan 30
Switch(config-vlan)# name VoIP-Sans-Fil
Switch(config-vlan)# exit
Switch(config)# vlan 40
Switch(config-vlan)# name Videosurveillance
Switch(config-vlan)# exit

Switch(config)# interface vlan 20
Switch(config-if)# ip address 10.110.20.1 255.255.248.0
Switch(config-if)# exit

Switch(config)# router ospf 1
Switch(config-router)# network 10.110.0.0 0.0.255.255 area 0
```

## 35.6 Étape 5 — Déploiement des 90 caméras (dont multi-capteurs aux intersections)

1. Adressage : `10.110.40.10` à `10.110.40.99` (sous-réseau `10.110.40.0/23`).
2. Caméras multi-capteurs aux intersections entre bâtiments et passerelles couvertes (2-4 capteurs orientables par boîtier, un seul câble PoE, chapitre 18).
3. Niveau Reconnaissance dans les espaces collaboratifs et halls, Détection en périmètre extérieur.

## 35.7 Étape 6 — Tests de validation

<div class="encadre astuce">
<span class="encadre-titre">💡 Checklist de recette</span>

1. Connecter deux utilisateurs différents (groupes AD différents) successivement sur le même port de flex office : vérifier l'attribution VLAN correcte à chaque fois.
2. Se déplacer d'un bâtiment à l'autre pendant un appel VoIP sans fil actif : vérifier l'absence de coupure.
3. Vérifier la couverture multi-capteurs aux intersections (aucun angle mort).
4. Débrancher un lien OSPF inter-bâtiment : vérifier la reconvergence automatique.
5. Tester une tentative de connexion 802.1X avec des identifiants invalides : vérifier le refus et la journalisation NPS.
</div>

## 35.8 Documentation finale et résumé

Dossier standard (chapitre 25) avec la documentation du mapping profils Active Directory → VLAN (étape 35.2), essentielle à la maintenance du mécanisme d'authentification dynamique. Ce chapitre a démontré la configuration intégrale d'un réseau orienté mobilité et flex office, avec 802.1X dynamique filaire et Wi-Fi sur un contrôleur unique multi-bâtiments.

*Chapitre suivant : projet complet Datacenter — architecture spine-leaf et redondance 2N.*
