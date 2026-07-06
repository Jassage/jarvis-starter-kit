<div class="chapitre-titre-num">CHAPITRE 26</div>

# Projet complet : École

## Objectifs pédagogiques

Réaliser, de A à Z, le réseau complet d'une école de 300 élèves : déballage du matériel, montage physique, configuration intégrale de chaque équipement (routeur, switches, Wi-Fi, caméras/NVR, serveur), et tests de validation. Ce chapitre suppose zéro connaissance préalable — chaque étape est décrite dans l'ordre exact où elle doit être exécutée sur le terrain, avec la configuration complète (jamais un simple extrait) de chaque appareil.

<div class="encadre astuce">
<span class="encadre-titre">💡 Comment utiliser ce chapitre si tu es débutant</span>
Suis les étapes dans l'ordre, sans en sauter. Chaque étape indique précisément quoi brancher, quoi taper, et à quoi t'attendre à l'écran. Si un terme technique n'est pas réexpliqué ici, il l'a été dans un chapitre antérieur — le numéro de chapitre est rappelé entre parenthèses à chaque fois pour que tu puisses y revenir si besoin.
</div>

## 26.1 Contexte et analyse des besoins

- Bâtiment unique, 3 niveaux : Rez-de-chaussée (RDC), Étage 1, Étage 2.
- RDC : Administration (5 bureaux), Bibliothèque (3 postes), Accueil (1 poste), Cantine (1 poste caisse).
- Étage 1 : 13 salles de classe (1 prise réseau par salle, pour poste enseignant/vidéoprojecteur).
- Étage 2 : 12 salles de classe + Salle informatique dédiée (25 postes élèves + 1 poste enseignant).
- 300 élèves, 25 enseignants, 5 personnels administratifs. Wi-Fi pédagogique pour tablettes (150 appareils potentiels).
- Vidéosurveillance : entrées, cour de récréation, couloirs principaux, cantine — 12 caméras.
- Budget serré : priorité au rapport qualité/prix (rappel du chapitre 4). Croissance prévue : 400 élèves sous 3 ans.

## 26.2 Budget estimatif

| Poste | Estimation |
|---|---|
| Câblage cuivre Cat6 (~95 prises) + certification | 15 % du budget |
| Switches PoE+ MikroTik (x4) | 12 % |
| Routeur/Firewall MikroTik | 5 % |
| Points d'accès Wi-Fi 6 (Ubiquiti UniFi, x6) | 15 % |
| Caméras IP + NVR (12 caméras) | 18 % |
| Serveur Windows Server (AD/DNS/DHCP/fichiers) | 15 % |
| Baie, onduleur, installation/main d'œuvre | 20 % |

## 26.3 Liste complète du matériel

| Réf. | Équipement | Quantité | Emplacement |
|---|---|---|---|
| RT-01 | Routeur/Firewall MikroTik RB4011iGS+ | 1 | Baie technique RDC |
| SW-RDC | Switch PoE+ 24 ports MikroTik CRS326-24G-2S+ | 1 | Baie technique RDC |
| SW-E1 | Switch PoE+ 24 ports MikroTik CRS326-24G-2S+ | 1 | Local technique Étage 1 |
| SW-E2C | Switch PoE+ 24 ports MikroTik CRS326-24G-2S+ | 1 | Local technique Étage 2 (classes) |
| SW-E2I | Switch PoE+ 24 ports MikroTik CRS326-24G-2S+ | 1 | Local technique Étage 2 (salle info) |
| AP-01 à AP-06 | Point d'accès Ubiquiti UniFi U6-Lite | 6 | 2 par niveau |
| CAM-01 à CAM-08 | Caméra dôme IP (intérieur) | 8 | Couloirs, bibliothèque, cantine |
| CAM-09 à CAM-12 | Caméra bullet IP (extérieur, IP66) | 4 | Entrées, cour |
| NVR-01 | NVR 16 canaux, 2 baies disque | 1 | Baie technique RDC |
| DD-01/02 | Disque 1 To (RAID 1 dans le NVR) | 2 | Dans NVR-01 |
| SRV-01 | Serveur Windows Server 2022 (tour ou rack) | 1 | Baie technique RDC |
| UPS-01 | Onduleur line-interactive 1500 VA | 1 | Baie technique RDC |
| RACK-01 | Baie 12U murale | 1 | Local technique RDC |

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi 4 switches et non 3</span>
La salle informatique (25 postes + 1 enseignant = 26 prises) sature à elle seule un switch 24 ports — elle reçoit donc son propre switch dédié (SW-E2I), distinct du switch desservant les 12 salles de classe du même étage (SW-E2C). Ne jamais forcer plus de connexions qu'un switch n'a de ports physiques disponibles.
</div>

## 26.4 Étape 1 — Réception et vérification du matériel

Avant tout déballage définitif :

1. Vérifier que chaque carton correspond à la liste du matériel (section 26.3), par numéro de série noté sur un tableau (base de l'inventaire du chapitre 25).
2. Vérifier visuellement l'absence de dommage de transport sur chaque appareil.
3. Ne PAS jeter les emballages avant la mise en service complète (utile en cas de retour SAV).
4. Prendre en photo chaque numéro de série (traçabilité garantie, chapitre 25).

## 26.5 Étape 2 — Câblage et plan de brassage complet

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel des chapitres 8 et 9</span>
Le câblage doit être entièrement posé, certifié et étiqueté AVANT de brancher le moindre équipement actif. Convention d'étiquetage retenue : `[Niveau]-[Local]-[N° prise]`, par exemple `E1-S03-01` = Étage 1, Salle 03, prise 1.
</div>

### Tableau de brassage — Switch SW-RDC (24 ports)

| Ports | Affectation | VLAN (accès) |
|---|---|---|
| 1-5 | Administration (5 bureaux) | 10 |
| 6-8 | Bibliothèque (3 postes) | 10 |
| 9 | Accueil | 10 |
| 10 | Cantine (poste caisse) | 10 |
| 11-12 | Points d'accès Wi-Fi RDC (AP-01, AP-02) | 30 |
| 13-16 | Caméras RDC (CAM-01 entrée, CAM-02 cantine, CAM-09/10 entrées extérieures) | 40 |
| 17 | Serveur SRV-01 | 10 |
| 18 | NVR-01 | 40 |
| 24 | Uplink (trunk tagué) vers routeur RT-01 | Trunk 10,30,40,99 |

### Tableau de brassage — Switch SW-E1 (24 ports, 13 salles de classe)

| Ports | Affectation | VLAN (accès) |
|---|---|---|
| 1-13 | Salles de classe 1 à 13 (1 prise/salle) | 20 |
| 14-15 | Points d'accès Wi-Fi Étage 1 (AP-03, AP-04) | 30 |
| 16-17 | Caméras couloir Étage 1 (CAM-03, CAM-04) | 40 |
| 24 | Uplink (trunk tagué) vers routeur RT-01 | Trunk 20,30,40,99 |

### Tableau de brassage — Switch SW-E2C (24 ports, 12 salles de classe)

| Ports | Affectation | VLAN (accès) |
|---|---|---|
| 1-12 | Salles de classe 14 à 25 (1 prise/salle) | 20 |
| 13-14 | Points d'accès Wi-Fi Étage 2 (AP-05, AP-06) | 30 |
| 15-16 | Caméras couloir Étage 2 (CAM-05, CAM-06) | 40 |
| 24 | Uplink (trunk tagué) vers routeur RT-01 | Trunk 20,30,40,99 |

### Tableau de brassage — Switch SW-E2I (24 ports, salle informatique)

| Ports | Affectation | VLAN (accès) |
|---|---|---|
| 1-25 | Postes élèves (1-24) + poste enseignant (25) — répartis sur 2 switches physiques si >24, ici arrondi à 24 postes élèves + enseignant sur ports adjacents | 20 |
| 24 | Uplink (trunk tagué) vers routeur RT-01 | Trunk 20,99 |

<div class="encadre attention">
<span class="encadre-titre">⚠️ 26 prises pour 24 ports disponibles</span>
Le calcul exact (25 élèves + 1 enseignant = 26 postes) dépasse de 2 les 24 ports disponibles une fois le port uplink réservé (23 ports utilisables). Solution retenue : 2 postes élèves supplémentaires sont raccordés via un petit switch non administrable 5 ports en cascade sur un des ports de SW-E2I — une pratique acceptable en périphérie (jamais au cœur du réseau), à condition qu'elle reste documentée.
</div>

## 26.6 Étape 3 — Montage de la baie et alimentation

1. Fixer la baie 12U murale dans le local technique RDC (hauteur d'accès confortable, rappel chapitre 7).
2. Monter dans cet ordre du haut vers le bas : panneau de brassage RDC (haut), routeur RT-01, switch SW-RDC, NVR-01, serveur SRV-01, onduleur UPS-01 (bas, le plus lourd).
3. Brancher l'onduleur UPS-01 sur une prise électrique dédiée, puis brancher tous les équipements actifs SUR l'onduleur (jamais directement sur secteur).
4. Vérifier au voltmètre ou via le voyant de l'onduleur que la charge totale reste sous 80 % de sa capacité nominale (1500 VA).

## 26.7 Étape 4 — Premier démarrage et accès au routeur MikroTik

1. Connecter un ordinateur portable directement au port 2 du routeur RT-01 (encore vierge de configuration) via un câble Ethernet.
2. Télécharger et ouvrir **Winbox** (utilitaire gratuit MikroTik) sur l'ordinateur portable.
3. Dans Winbox, cliquer sur l'onglet **Neighbors** : le routeur apparaît avec son adresse MAC (il n'a pas encore d'IP configurée).
4. Double-cliquer sur l'adresse MAC du routeur pour s'y connecter (identifiant `admin`, mot de passe vide par défaut).
5. Une fenêtre de bienvenue RouterOS s'affiche : cliquer sur **Remove Configuration** pour repartir d'une configuration totalement vierge (évite les réglages d'usine parasites).
6. Le routeur redémarre. Se reconnecter via Winbox (Neighbors) après redémarrage.

## 26.8 Étape 5 — Configuration complète du routeur MikroTik

<div class="encadre astuce">
<span class="encadre-titre">💡 Ouvrir un terminal dans Winbox</span>
Dans Winbox, cliquer sur **New Terminal** dans le menu de gauche : une fenêtre de ligne de commande RouterOS s'ouvre, c'est ici que l'intégralité du script ci-dessous doit être collée, bloc par bloc.
</div>

**Bloc 1 — Identité et mot de passe administrateur**

```
/system identity set name=MKT-ECOLE-RT01
/user set admin password=EcoleAdmin2026!Secure
```

**Bloc 2 — Renommage des interfaces physiques (clarté de gestion)**

```
/interface ethernet
set [find default-name=ether1] name=WAN-Internet
set [find default-name=ether2] name=TRUNK-SW-RDC
set [find default-name=ether3] name=TRUNK-SW-E1
set [find default-name=ether4] name=TRUNK-SW-E2C
set [find default-name=ether5] name=TRUNK-SW-E2I
```

**Bloc 3 — Bridge VLAN-aware (cœur de la segmentation)**

```
/interface bridge
add name=bridge-lan vlan-filtering=yes protocol-mode=rstp

/interface bridge port
add bridge=bridge-lan interface=TRUNK-SW-RDC frame-types=admit-only-vlan-tagged
add bridge=bridge-lan interface=TRUNK-SW-E1 frame-types=admit-only-vlan-tagged
add bridge=bridge-lan interface=TRUNK-SW-E2C frame-types=admit-only-vlan-tagged
add bridge=bridge-lan interface=TRUNK-SW-E2I frame-types=admit-only-vlan-tagged

/interface bridge vlan
add bridge=bridge-lan vlan-ids=10 tagged=bridge-lan,TRUNK-SW-RDC
add bridge=bridge-lan vlan-ids=20 tagged=bridge-lan,TRUNK-SW-E1,TRUNK-SW-E2C,TRUNK-SW-E2I
add bridge=bridge-lan vlan-ids=30 tagged=bridge-lan,TRUNK-SW-RDC,TRUNK-SW-E1,TRUNK-SW-E2C
add bridge=bridge-lan vlan-ids=40 tagged=bridge-lan,TRUNK-SW-RDC,TRUNK-SW-E1,TRUNK-SW-E2C
add bridge=bridge-lan vlan-ids=99 tagged=bridge-lan,TRUNK-SW-RDC,TRUNK-SW-E1,TRUNK-SW-E2C,TRUNK-SW-E2I
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi le VLAN 10 n'est tagué que vers TRUNK-SW-RDC</span>
Seul le RDC héberge des postes Administration — inutile d'autoriser ce VLAN sur les trunks des autres étages (rappel de la bonne pratique du chapitre 10 : n'autoriser sur un trunk que les VLAN réellement présents derrière lui). De même, le VLAN 20 (Pédagogique) n'est pas nécessaire sur SW-RDC, qui n'a aucune salle de classe.
</div>

**Bloc 4 — Interfaces VLAN virtuelles et adresses de passerelle**

```
/interface vlan
add name=VLAN10-Administration interface=bridge-lan vlan-id=10
add name=VLAN20-Pedagogique interface=bridge-lan vlan-id=20
add name=VLAN30-WifiPedago interface=bridge-lan vlan-id=30
add name=VLAN40-Videosurveillance interface=bridge-lan vlan-id=40
add name=VLAN99-Management interface=bridge-lan vlan-id=99

/ip address
add address=10.20.10.1/25 interface=VLAN10-Administration
add address=10.20.20.1/24 interface=VLAN20-Pedagogique
add address=10.20.30.1/24 interface=VLAN30-WifiPedago
add address=10.20.40.1/26 interface=VLAN40-Videosurveillance
add address=10.20.99.1/28 interface=VLAN99-Management
```

**Bloc 5 — Connexion Internet (WAN)**

```
/ip dhcp-client add interface=WAN-Internet disabled=no
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Si le fournisseur d'accès impose une IP fixe plutôt que le DHCP</span>
Remplacer le bloc 5 par : `/ip address add address=<IP_fournie>/<masque> interface=WAN-Internet` puis `/ip route add gateway=<passerelle_fournie>` — l'information exacte figure sur le contrat du fournisseur d'accès Internet.
</div>

**Bloc 6 — NAT (partage de la connexion Internet)**

```
/ip firewall nat
add chain=srcnat out-interface=WAN-Internet action=masquerade comment="Partage Internet pour tous les VLAN internes"
```

**Bloc 7 — Pare-feu complet (deny-all par défaut, rappel chapitre 13)**

```
/ip firewall filter
add chain=forward connection-state=established,related action=accept comment="1-Autoriser les reponses aux connexions deja etablies"
add chain=forward connection-state=invalid action=drop comment="2-Bloquer les paquets invalides"
add chain=forward src-address=10.20.30.0/24 dst-address=10.20.0.0/16 action=drop comment="3-Wifi pedagogique isole du reste du reseau interne"
add chain=forward src-address=10.20.40.0/26 dst-address=!10.20.40.0/26 action=drop comment="4-Videosurveillance ne peut jamais initier de connexion sortante"
add chain=forward src-address=10.20.10.0/25 dst-address=10.20.40.0/26 protocol=tcp dst-port=554 action=accept comment="5-Administration peut consulter les flux video (RTSP)"
add chain=forward action=accept comment="6-Autoriser le reste du trafic interne (VLAN 10/20 <-> Internet, etc.)"
add chain=input connection-state=established,related action=accept comment="7-Reponses aux connexions du routeur lui-meme"
add chain=input src-address=10.20.99.0/28 action=accept comment="8-Seul le VLAN Management peut administrer le routeur"
add chain=input protocol=icmp action=accept comment="9-Autoriser le ping pour le diagnostic"
add chain=input action=drop comment="10-Bloquer tout le reste en entree du routeur"
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ L'ordre des règles est déterminant</span>
RouterOS applique les règles de haut en bas et s'arrête à la première correspondance — la règle 6 ("autoriser le reste") doit impérativement rester APRÈS les règles 3, 4 et 5 qui posent les restrictions spécifiques, sinon ces dernières ne seraient jamais atteintes.
</div>

Une fois les 7 blocs collés dans le terminal Winbox, taper `/export` pour vérifier que l'ensemble de la configuration a bien été enregistré, puis débrancher le câble de configuration temporaire et rebrancher le port TRUNK-SW-RDC sur le switch SW-RDC définitif.

## 26.9 Étape 6 — Configuration complète des 4 switches MikroTik (SwOS/RouterOS)

<div class="encadre astuce">
<span class="encadre-titre">💡 Répéter cette étape identiquement pour SW-RDC, SW-E1, SW-E2C, SW-E2I</span>
Seuls les ports et VLAN d'accès changent d'un switch à l'autre (rappel des tableaux de brassage, section 26.5) — la structure de commande reste identique.
</div>

**Exemple complet pour SW-RDC (à adapter selon le tableau de brassage du switch concerné)**

```
/system identity set name=MKT-ECOLE-SW-RDC
/user set admin password=EcoleAdmin2026!Secure

/interface bridge add name=bridge-sw vlan-filtering=yes

# Port 24 = uplink trunk vers le routeur (tague tous les VLAN necessaires)
/interface bridge port add bridge=bridge-sw interface=ether24 frame-types=admit-only-vlan-tagged

# Ports d'acces : chaque port est affecte a UN SEUL VLAN, en mode non tague (untagged)
/interface bridge port add bridge=bridge-sw interface=ether1 pvid=10
/interface bridge port add bridge=bridge-sw interface=ether2 pvid=10
/interface bridge port add bridge=bridge-sw interface=ether3 pvid=10
/interface bridge port add bridge=bridge-sw interface=ether4 pvid=10
/interface bridge port add bridge=bridge-sw interface=ether5 pvid=10
/interface bridge port add bridge=bridge-sw interface=ether6 pvid=10
/interface bridge port add bridge=bridge-sw interface=ether7 pvid=10
/interface bridge port add bridge=bridge-sw interface=ether8 pvid=10
/interface bridge port add bridge=bridge-sw interface=ether9 pvid=10
/interface bridge port add bridge=bridge-sw interface=ether10 pvid=10
/interface bridge port add bridge=bridge-sw interface=ether11 pvid=30
/interface bridge port add bridge=bridge-sw interface=ether12 pvid=30
/interface bridge port add bridge=bridge-sw interface=ether13 pvid=40
/interface bridge port add bridge=bridge-sw interface=ether14 pvid=40
/interface bridge port add bridge=bridge-sw interface=ether15 pvid=40
/interface bridge port add bridge=bridge-sw interface=ether16 pvid=40
/interface bridge port add bridge=bridge-sw interface=ether17 pvid=10
/interface bridge port add bridge=bridge-sw interface=ether18 pvid=40

/interface bridge vlan
add bridge=bridge-sw vlan-ids=10 tagged=ether24 untagged=ether1,ether2,ether3,ether4,ether5,ether6,ether7,ether8,ether9,ether10,ether17
add bridge=bridge-sw vlan-ids=30 tagged=ether24 untagged=ether11,ether12
add bridge=bridge-sw vlan-ids=40 tagged=ether24 untagged=ether13,ether14,ether15,ether16,ether18
add bridge=bridge-sw vlan-ids=99 tagged=ether24,bridge-sw
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Adapter pour SW-E1, SW-E2C, SW-E2I</span>
Pour SW-E1 : remplacer les VLAN d'accès par 20 (salles de classe, ports 1-13), 30 (Wi-Fi, ports 14-15), 40 (caméras, ports 16-17), en gardant le port 24 en trunk tagué 20,30,40,99. Même logique pour SW-E2C (ports 1-12 en VLAN 20) et SW-E2I (ports 1-24 en VLAN 20, uplink tagué 20,99 uniquement, pas de VLAN 30/40 nécessaire dans ce local).
</div>

## 26.10 Étape 7 — Configuration complète du contrôleur Wi-Fi Ubiquiti UniFi

1. Installer le logiciel **UniFi Network Application** sur un poste (ou utiliser un Cloud Key UniFi dédié).
2. Brancher les 6 points d'accès UniFi sur leurs ports PoE respectifs (tableaux de brassage, section 26.5) — ils démarrent et apparaissent automatiquement dans l'interface UniFi sous 2-3 minutes, dans la rubrique **Devices**, avec le statut "En attente d'adoption".
3. Cliquer sur **Adopter** pour chacun des 6 AP.
4. Aller dans **Réseaux Wi-Fi** → **Créer un nouveau réseau Wi-Fi**, et renseigner exactement :

```
Nom du reseau (SSID) : Ecole-Pedagogique
Mot de passe : (WPA2-Personal, phrase forte de 16+ caracteres)
VLAN : 30
Bande : 2,4 GHz et 5 GHz
Isolation des clients (Client Device Isolation) : ACTIVEE
Limite de bande passante par utilisateur : 10 Mbps descendant / 5 Mbps montant
Diffusion planifiee : Toujours active
```

5. Aller dans **Paramètres** → **Réseaux** → vérifier que le réseau/VLAN 30 correspond bien au sous-réseau `10.20.30.0/24` défini au routeur (section 26.8).
6. Dans **Paramètres RF** de chaque AP, régler la puissance d'émission sur **Moyenne** (jamais Maximale, rappel du chapitre 12) pour un roaming propre entre les 2 AP de chaque étage.

## 26.11 Étape 8 — Installation et configuration complète des caméras et du NVR

**Adressage IP statique des caméras (VLAN 40, `10.20.40.0/26`)**

| Caméra | Emplacement | Adresse IP |
|---|---|---|
| CAM-01 | Entrée principale (dôme) | 10.20.40.11 |
| CAM-02 | Cantine (dôme) | 10.20.40.12 |
| CAM-03 | Couloir Étage 1 (dôme) | 10.20.40.13 |
| CAM-04 | Couloir Étage 1, aile B (dôme) | 10.20.40.14 |
| CAM-05 | Couloir Étage 2 (dôme) | 10.20.40.15 |
| CAM-06 | Couloir Étage 2, aile B (dôme) | 10.20.40.16 |
| CAM-07 | Bibliothèque (dôme) | 10.20.40.17 |
| CAM-08 | Accueil (dôme) | 10.20.40.18 |
| CAM-09 | Cour de récréation, angle 1 (bullet) | 10.20.40.19 |
| CAM-10 | Cour de récréation, angle 2 (bullet) | 10.20.40.20 |
| CAM-11 | Entrée parking (bullet) | 10.20.40.21 |
| CAM-12 | Portail arrière (bullet) | 10.20.40.22 |
| NVR-01 | Enregistreur | 10.20.40.2 |

**Étapes de configuration, caméra par caméra :**

1. Connecter la caméra sur son port PoE (tableaux de brassage, section 26.5) — elle démarre automatiquement alimentée.
2. Utiliser l'outil de découverte réseau du fabricant (souvent fourni sur CD ou en téléchargement) pour repérer la caméra sur le réseau (elle démarre en DHCP ou avec une IP d'usine, ex. `192.168.1.108`).
3. Ouvrir l'interface web de la caméra, se connecter avec les identifiants par défaut, **changer immédiatement le mot de passe par défaut** (rappel critique du chapitre 16 — un mot de passe caméra jamais changé est la vulnérabilité la plus fréquente en vidéosurveillance).
4. Aller dans les paramètres réseau de la caméra et fixer l'adresse IP statique correspondant au tableau ci-dessus (masque `255.255.255.192`, passerelle `10.20.40.1`, DNS `10.20.10.10`).
5. Activer **ONVIF** dans les paramètres (rappel du chapitre 17) pour l'interopérabilité avec le NVR.
6. Régler la qualité vidéo : H.265, résolution 4MP pour les caméras d'entrée/cour (niveau Reconnaissance à Identification), 2MP pour les couloirs (niveau Observation, rappel du chapitre 19).

**Configuration du NVR-01 :**

1. Démarrer le NVR, insérer les 2 disques 1 To, configurer le RAID en **RAID 1** via le menu **Stockage** (miroir, tolère la panne d'un disque).
2. Fixer l'adresse IP du NVR : `10.20.40.2 / 255.255.255.192`, passerelle `10.20.40.1`.
3. Dans **Gestion des caméras** → **Ajouter un canal**, ajouter les 12 caméras une par une par leur adresse IP fixe (tableau ci-dessus) et le protocole ONVIF.
4. Configurer le plan d'enregistrement : enregistrement continu 24/7 sur les 12 canaux, avec détection de mouvement activée en superposition pour faciliter la recherche (chapitre 22).
5. Définir la politique de rétention : **15 jours**, avec écrasement automatique des enregistrements les plus anciens (calcul de stockage détaillé ci-dessous).
6. Créer un compte utilisateur **Administration** (accès complet) et un compte **Consultation** (lecture seule, pour l'équipe de direction) — jamais de compte unique partagé.

**Calcul de vérification du stockage (rappel chapitre 22)**

```
12 cameras x 4 Mbps moyen (H.265) x 3600 x 24 / 8 / 1000 = 51,84 Go/jour (les 12 cameras cumulees)
Stockage_15_jours = 51,84 x 15 = 777,6 Go
Marge de securite 20% = 777,6 x 1,2 = 933 Go
```

Les 2 disques 1 To en RAID 1 offrent 1 To utile (capacité d'un seul disque, l'autre étant le miroir) — suffisant avec une marge confortable pour les 933 Go calculés.

## 26.12 Étape 9 — Configuration complète du serveur Windows Server

1. Installer Windows Server 2022 sur SRV-01 (installation standard, sans interface graphique complète si "Server Core" est choisi pour alléger les ressources, ou avec interface complète pour un premier projet — recommandé pour un débutant).
2. Configurer l'adresse IP statique du serveur (Panneau de configuration → Réseau, ou PowerShell) :

```powershell
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 10.20.10.10 -PrefixLength 25 -DefaultGateway 10.20.10.1
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 127.0.0.1
Rename-Computer -NewName "SRV-ECOLE-01" -Restart
```

3. Après redémarrage, installer les rôles Active Directory, DNS, DHCP et Serveur de fichiers :

```powershell
Install-WindowsFeature -Name AD-Domain-Services, DNS, DHCP, FS-FileServer -IncludeManagementTools
Install-ADDSForest -DomainName "ecole.local" -DomainNetbiosName "ECOLE" -InstallDns:$true
```

4. Le serveur redémarre automatiquement en contrôleur de domaine. Se reconnecter avec le compte `ECOLE\Administrateur`.
5. Créer la structure des unités d'organisation (rappel chapitre 14) :

```powershell
New-ADOrganizationalUnit -Name "Administration" -Path "DC=ecole,DC=local"
New-ADOrganizationalUnit -Name "Enseignants" -Path "DC=ecole,DC=local"
New-ADOrganizationalUnit -Name "SalleInformatique" -Path "DC=ecole,DC=local"
```

6. Configurer les 3 étendues DHCP (une par VLAN utilisateur — VLAN 40 et 99 restent en IP statique, jamais en DHCP) :

```powershell
Add-DhcpServerv4Scope -Name "VLAN10-Administration" -StartRange 10.20.10.20 -EndRange 10.20.10.120 -SubnetMask 255.255.255.128 -State Active
Set-DhcpServerv4OptionValue -ScopeId 10.20.10.0 -Router 10.20.10.1 -DnsServer 10.20.10.10

Add-DhcpServerv4Scope -Name "VLAN20-Pedagogique" -StartRange 10.20.20.20 -EndRange 10.20.20.240 -SubnetMask 255.255.255.0 -State Active
Set-DhcpServerv4OptionValue -ScopeId 10.20.20.0 -Router 10.20.20.1 -DnsServer 10.20.10.10

Add-DhcpServerv4Scope -Name "VLAN30-WifiPedago" -StartRange 10.20.30.20 -EndRange 10.20.30.240 -SubnetMask 255.255.255.0 -State Active -LeaseDuration 4:00:00
Set-DhcpServerv4OptionValue -ScopeId 10.20.30.0 -Router 10.20.30.1 -DnsServer 10.20.10.10

Add-DhcpServerv4Authorize -DnsName "SRV-ECOLE-01.ecole.local"
```

7. Créer le partage de fichiers pour l'administration :

```powershell
New-Item -ItemType Directory -Path "D:\Partages\Administration"
New-SmbShare -Name "Administration" -Path "D:\Partages\Administration" -FullAccess "ECOLE\Domain Admins" -ChangeAccess "ECOLE\Administration"
```

8. Définir une politique de mot de passe robuste (rappel chapitre 14/22) :

```powershell
Set-ADDefaultDomainPasswordPolicy -Identity "ecole.local" -MinPasswordLength 10 -ComplexityEnabled $true -LockoutThreshold 5 -LockoutDuration 00:30:00
```

## 26.13 Étape 10 — Tests de validation, dans l'ordre

<div class="encadre astuce">
<span class="encadre-titre">💡 Checklist de recette finale</span>

1. Depuis un poste Administration (VLAN 10), vérifier l'obtention automatique d'une IP dans `10.20.10.20-120` (`ipconfig`).
2. Depuis ce même poste, tenter un `ping 10.20.40.2` (NVR) : doit **échouer** (isolation, sauf si le flux RTSP explicite est testé via un lecteur vidéo, qui doit lui réussir sur le port 554).
3. Depuis une tablette connectée au Wi-Fi `Ecole-Pedagogique`, tenter de joindre un autre appareil connecté au même Wi-Fi : doit **échouer** (isolation client UniFi).
4. Depuis un poste de la salle informatique (VLAN 20), vérifier l'accès Internet fonctionnel.
5. Vérifier sur le NVR que les 12 caméras remontent une image, de jour comme de nuit (revérifier après la tombée de la nuit, rappel chapitre 20).
6. Débrancher le câble électrique principal du local technique : vérifier que l'onduleur UPS-01 prend le relais sans coupure des équipements actifs.
7. Vérifier la certification à 100 % de l'ensemble des prises Cat6 posées (chapitre 8).
8. Se connecter à un poste avec un compte de test créé dans l'OU "Enseignants" et vérifier l'application de la politique de mot de passe.
</div>

## 26.14 Documentation finale

Dossier remis au client : cahier des charges, schémas logique/physique, plan d'adressage (section 26.8), tableaux de brassage complets (section 26.5), inventaire matériel avec numéros de série (section 26.4), export complet des configurations (`/export` sur le routeur et chaque switch), rapport de certification câblage — conforme à la checklist du chapitre 25.

## 26.15 Résumé du chapitre

Ce chapitre a fourni la configuration intégrale et l'ensemble des étapes physiques nécessaires pour construire, sans connaissance préalable, le réseau complet d'une école : du déballage du matériel à la mise en production testée, en passant par la configuration exhaustive du routeur, des 4 switches, du contrôleur Wi-Fi, des 12 caméras/NVR et du serveur Windows Server.

*Chapitre suivant : projet complet Université — un campus MAN multi-bâtiments à forte densité Wi-Fi.*
