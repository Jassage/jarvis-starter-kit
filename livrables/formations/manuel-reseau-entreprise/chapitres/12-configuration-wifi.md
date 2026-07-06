<div class="chapitre-titre-num">CHAPITRE 12</div>

# Configuration Wi-Fi

## Objectifs pédagogiques

Déployer intégralement un contrôleur Wi-Fi Ubiquiti UniFi, du premier démarrage à deux réseaux Wi-Fi complets et fonctionnels (employés en WPA2/WPA3-Enterprise via RADIUS, invités avec portail captif isolé), avec réglages de roaming.

## Prérequis

Chapitres 1-11.

## 12.1 Scénario du chapitre

<div class="encadre astuce">
<span class="encadre-titre">💡 Deux réseaux Wi-Fi, deux usages, deux niveaux de sécurité</span>
Ce chapitre déploie un contrôleur UniFi gérant 4 points d'accès, avec un SSID **Entreprise-Employés** (VLAN 20, authentification individuelle 802.1X via un serveur RADIUS hébergé sur Windows Server) et un SSID **Entreprise-Invités** (VLAN 50, isolé, portail captif).
</div>

## 12.2 Étape 1 — Installation du contrôleur UniFi

1. Installer le logiciel **UniFi Network Application** sur un serveur ou un poste dédié toujours allumé (ou utiliser un boîtier Cloud Key UniFi physique, recommandé en production).
2. Ouvrir un navigateur vers l'adresse du contrôleur (`https://<IP-du-controleur>:8443`).
3. Suivre l'assistant de première configuration : créer un compte administrateur UniFi (identifiant + mot de passe fort), nommer le site (`Entreprise-Siège`).
4. Une fois l'assistant terminé, l'interface principale UniFi Network s'affiche, actuellement sans aucun appareil adopté.

## 12.3 Étape 2 — Adoption des points d'accès

1. Brancher chaque point d'accès sur son port PoE (rappel chapitres 4, 9).
2. Dans l'interface UniFi, aller dans **Appareils** : chaque AP apparaît sous 2-3 minutes avec le statut **En attente d'adoption**.
3. Cliquer sur **Adopter** pour chacun des 4 AP. Le statut passe à **Mise à jour du firmware** puis **Connecté** après quelques minutes.
4. Renommer chaque AP selon son emplacement physique (ex. `AP-RDC-Hall`, `AP-E1-Couloir`) pour faciliter la supervision future (chapitre 24).

## 12.4 Étape 3 — Créer le VLAN réseau côté UniFi (avant le SSID)

1. Aller dans **Paramètres** → **Réseaux** → **Créer un réseau**.
2. Renseigner :

```
Nom : VLAN20-WifiEmployes
Objectif : Corporate (reseau standard)
VLAN ID : 20
Sous-reseau du reseau : 10.10.20.0/24 (doit correspondre exactement au VLAN configure au chapitre 11 sur le routeur)
```

3. Répéter l'opération pour le réseau invités :

```
Nom : VLAN50-WifiInvites
Objectif : Guest (isole automatiquement du reste du reseau par UniFi)
VLAN ID : 50
Sous-reseau du reseau : 10.10.50.0/24
```

## 12.5 Étape 4 — Configurer le serveur RADIUS sur Windows Server (préalable au SSID employés)

<div class="encadre astuce">
<span class="encadre-titre">💡 NPS (Network Policy Server) : le rôle RADIUS natif de Windows Server</span>
WPA2/WPA3-Enterprise (802.1X) nécessite un serveur RADIUS qui vérifie chaque identifiant contre Active Directory (chapitre 14) — Windows Server intègre ce rôle nativement sous le nom NPS.
</div>

```powershell
Install-WindowsFeature -Name NPAS -IncludeManagementTools

# Enregistrer le serveur NPS dans Active Directory
netsh nps add registeredserver

# Ajouter le controleur UniFi comme client RADIUS autorise
Import-Module NPS
New-NpsRadiusClient -Name "Controleur-UniFi" -Address 10.10.99.20 -SharedSecret "CleRadiusPartagee2026!"
```

Puis, dans la console **NPS (Network Policy Server)** :

1. **Stratégies réseau** → **Nouveau** → nommer `WiFi-Employes-8021X`.
2. Type d'accès réseau : **Accès sans fil (IEEE 802.11)**.
3. Conditions : groupe Active Directory `ECOLE\Wifi-Employes-Autorises` (à créer au préalable dans AD, chapitre 14).
4. Méthode d'authentification : **PEAP (Protected EAP)**, sélectionner le certificat du serveur.
5. Valider et activer la stratégie.

## 12.6 Étape 5 — Créer le SSID employés (WPA2/WPA3-Enterprise)

Dans UniFi, **Paramètres** → **Wi-Fi** → **Créer un réseau Wi-Fi** :

```
Nom du reseau (SSID) : Entreprise-Employes
Reseau (VLAN) : VLAN20-WifiEmployes
Securite : WPA2/WPA3-Enterprise
Serveur RADIUS : 10.10.99.30 (adresse du serveur NPS)
Port RADIUS : 1812
Secret partage RADIUS : CleRadiusPartagee2026! (identique a l'etape 12.5)
Bande : 2,4 GHz et 5 GHz
```

## 12.7 Étape 6 — Créer le SSID invités (portail captif isolé)

```
Nom du reseau (SSID) : Entreprise-Invites
Reseau (VLAN) : VLAN50-WifiInvites
Securite : WPA2-Personal
Mot de passe : (phrase simple, changee mensuellement, affichee a l'accueil)
Isolation des clients : ACTIVEE
Portail invite (Guest Portal) : ACTIVE
  Type d'authentification : Acceptation des conditions d'utilisation
  Redirection apres connexion : page d'accueil de l'entreprise
Limite de bande passante : 10 Mbps descendant / 5 Mbps montant par utilisateur
```

## 12.8 Étape 7 — Réglages de roaming (tous les AP)

Dans **Paramètres** → **Wi-Fi** → **Réseau Entreprise-Employés** → **Options avancées** :

```
Puissance de transmission : Moyenne (jamais Maximale, rappel du chapitre 12 theorique)
Bande minimale RSSI : -75 dBm (force la reconnexion a un AP plus proche)
802.11r (Fast Roaming) : ACTIVE
Bande preferee : 5 GHz (limiter la 2,4 GHz aux appareils incompatibles)
```

## 12.9 Étape 8 — Vérifications finales

1. Depuis un smartphone de test, se connecter à `Entreprise-Invites` : la page de portail captif doit s'afficher avant tout accès Internet.
2. Depuis un poste avec un compte du groupe `Wifi-Employes-Autorises`, se connecter à `Entreprise-Employes` : la connexion doit demander les identifiants Active Directory, puis obtenir une adresse dans `10.10.20.0/24`.
3. Dans UniFi, **Clients** : vérifier que chaque appareil connecté apparaît avec le bon SSID et le bon VLAN.
4. Se déplacer physiquement entre deux zones de couverture d'AP différents pendant un appel VoIP ou une lecture vidéo en continu : vérifier l'absence de coupure (roaming, rappel section 12.8).

## 12.10 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un secret RADIUS différent entre UniFi et NPS</span>
Comme pour le VPN IPsec (chapitre 11), le secret partagé RADIUS doit être identique au caractère près des deux côtés (étapes 12.5 et 12.6) — une erreur ici se traduit par un échec d'authentification 802.1X sans message clair côté client Wi-Fi.
</div>

## 12.11 Bonnes pratiques

- Toujours créer le VLAN/réseau UniFi (étape 12.4) avant de créer le SSID qui s'y rattache.
- Ajouter le contrôleur UniFi comme client RADIUS autorisé (étape 12.5) avant de configurer le SSID employés, sinon la stratégie NPS ne pourra jamais être testée.
- Renommer systématiquement chaque AP adopté selon son emplacement physique réel.

## 12.12 Résumé du chapitre

Ce chapitre a déployé intégralement un contrôleur Wi-Fi UniFi avec deux SSID complets et fonctionnels : un réseau employés sécurisé par authentification individuelle 802.1X/RADIUS, et un réseau invités isolé avec portail captif, incluant les réglages de roaming.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 12.1</span>

Un troisième SSID `Entreprise-IoT` doit être créé pour des équipements connectés (imprimantes Wi-Fi, écrans), sur le VLAN 60 (`10.10.60.0/24`), sans accès à Internet ni au reste du réseau. Décris les paramètres UniFi à définir.
</div>

**Corrigé :**
```
Nom du reseau (SSID) : Entreprise-IoT
Reseau (VLAN) : VLAN60-IoT (a creer prealablement, objectif "Corporate")
Securite : WPA2-Personal (cle forte, dediee, changee periodiquement)
Isolation des clients : ACTIVEE
Regle firewall associee (sur le routeur, chapitre 11) : deny VLAN60 vers Internet et vers tous les autres VLAN
```

*Chapitre suivant : la configuration complète du firewall (règles, NAT, VPN, IPS/IDS, DMZ, haute disponibilité).*
