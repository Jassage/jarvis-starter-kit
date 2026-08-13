<div class="chapitre-titre-num">CHAPITRE 30</div>

# Wi-Fi professionnel de A à Z

## Objectifs pédagogiques

Déployer un réseau Wi-Fi professionnel complet, de l'étude de couverture jusqu'aux tests finaux, avec deux SSID mappés à leurs VLAN respectifs, une sécurité adaptée à chacun, et un roaming transparent entre plusieurs bornes.

## Prérequis

Volumes 1-9.

## Scénario du volume

Déploiement de bornes **Ubiquiti UniFi**, gérées par un contrôleur logiciel local (UniFi Network Application, chapitre 15.6), diffusant deux SSID : **"Entreprise-Corporate"** (VLAN 50) et **"Entreprise-Invite"** (VLAN 60).

## OBJECTIF

Une couverture Wi-Fi complète et fiable, deux SSID correctement isolés sur leurs VLAN respectifs, une sécurité robuste sur le réseau corporate et un accès invité isolé et contrôlé, avec un roaming transparent pour un utilisateur qui se déplace entre les zones couvertes par plusieurs bornes.

## ÉTAPE 1 — Réutiliser l'étude et le dimensionnement déjà réalisés

Le nombre de bornes nécessaire (méthode du chapitre 15.1) et leurs emplacements envisagés (étude de site, chapitre 9) sont le point de départ obligatoire — jamais improvisés à l'installation.

## ÉTAPE 2 — Établir un plan de couverture (heatmap)

Avant l'installation physique, un plan de couverture prévisionnel (heatmap), produit par le logiciel du contrôleur à partir du plan du bâtiment importé (image ou PDF à l'échelle) et de l'emplacement prévu de chaque borne, permet de visualiser les zones de recouvrement et les éventuelles zones d'ombre **avant** de percer le premier trou de fixation — une simulation qui reste approximative (elle ne connaît pas la nature exacte de chaque mur) mais qui révèle immédiatement une borne mal positionnée ou un emplacement manquant.

## ÉTAPE 3 — Installer physiquement les bornes

Reprendre les conventions du Volume 6 (fixation, câblage certifié PoE, chapitre 13.3-13.4 pour le budget PoE du switch qui les alimente) — chaque borne au plafond, centrée autant que possible dans sa zone de couverture prévue (chapitre 15.1), jamais dans un angle ou contre un mur porteur épais repéré à l'étude de site.

## ÉTAPE 4 — Adopter les bornes dans le contrôleur

<div class="ou-executer">GUI — UniFi Network Application</div>

```
Devices → (la borne apparaît en attente "Pending Adoption")
  → Cliquer "Adopt"
  → Attendre la mise à jour du firmware si proposee
  → Verifier : statut passe a "Connected" (vert)
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une borne "pending adoption" invisible signale presque toujours un problème de VLAN Management</span>
Si une borne fraîchement installée n'apparaît jamais dans la liste des équipements en attente, la cause la plus fréquente est que son port switch n'est pas correctement rattaché au VLAN Management (chapitre 8.3) par lequel le contrôleur la découvre — vérifier la configuration du port sur le switch d'accès (chapitre 20) avant de suspecter la borne elle-même.
</div>

## ÉTAPE 5 — Créer les SSID et les mapper à leurs VLAN

<div class="ou-executer">GUI — UniFi Network Application</div>

```
Settings → WiFi → Create New WiFi Network
  → Name/SSID : Entreprise-Corporate
  → Network : VLAN 50 (WiFi-Corporate, deja cree au chapitre 26)
  → Enregistrer
```

```
Settings → WiFi → Create New WiFi Network
  → Name/SSID : Entreprise-Invite
  → Network : VLAN 60 (WiFi-Invite)
  → Guest Policy : activee
  → Enregistrer
```

**Explication** : le champ "Network" est celui qui réalise concrètement le mappage SSID → VLAN (chapitre 15.5) — sans cette association, tout le trafic Wi-Fi tomberait par défaut sur un seul VLAN, annulant tout le cloisonnement conçu depuis le chapitre 11. L'option "Guest Policy" isole automatiquement chaque client du SSID invité des autres clients invités (jamais deux visiteurs ne doivent pouvoir se voir mutuellement sur le réseau Wi-Fi invité).

## ÉTAPE 6 — Sécuriser le SSID corporate (WPA2/3-Enterprise)

<div class="ou-executer">GUI — UniFi Network Application</div>

```
Settings → WiFi → Entreprise-Corporate → Security
  → Security Protocol : WPA2/WPA3 Enterprise
  → RADIUS Profile : (creer un profil pointant vers le serveur RADIUS, Volume 11)
  → Enregistrer
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Enterprise plutôt qu'une simple clé partagée (PSK), pourquoi</span>
WPA2/3-**Personal** (PSK) utilise une seule et même clé pour tous les appareils du SSID — un employé qui quitte l'entreprise emporte potentiellement cette clé, obligeant à la changer pour **tous** les appareils simultanément pour la révoquer. WPA2/3-**Enterprise**, adossé à un serveur RADIUS qui authentifie chaque utilisateur individuellement (souvent via son compte Active Directory, Volume 11), permet de révoquer l'accès d'une seule personne sans toucher aux autres — le choix professionnel recommandé pour tout SSID corporate de ce manuel, une simple clé PSK restant acceptable uniquement pour un très petit projet sans annuaire centralisé (Volume 16, Projet 1).
</div>

## ÉTAPE 7 — Sécuriser le SSID invité (portail captif)

<div class="ou-executer">GUI — UniFi Network Application</div>

```
Settings → WiFi → Entreprise-Invite → Guest Control
  → Portal : activee
  → Portal Authentication : simple (acceptation des conditions d'utilisation)
  → Bande passante : limitee (ex. 10 Mbit/s par client)
  → Enregistrer
```

**Explication** : le portail captif affiche une page de conditions d'utilisation avant tout accès réseau — une trace minimale d'usage, sans authentification forte inutile pour un simple accès invité, avec une limite de bande passante par client pour éviter qu'un seul visiteur n'accapare toute la capacité du lien Internet (chapitre 14.2).

## ÉTAPE 8 — Optimiser le roaming entre bornes

<div class="ou-executer">GUI — UniFi Network Application</div>

```
Settings → WiFi → Entreprise-Corporate → RF Optimization avancee
  → Minimum RSSI : -75 dBm
  → Band Steering : activee (favorise la bande 5 GHz quand disponible)
  → Fast Roaming (802.11r) : activee
  → Enregistrer
```

**Explication** : `Minimum RSSI` déconnecte activement un client dont le signal descend sous ce seuil, le forçant à se ré-associer à la borne la plus proche plutôt que de s'accrocher inutilement à une borne éloignée avec un signal dégradé — le mécanisme technique concret qui rend le roaming réellement transparent pour un utilisateur qui se déplace, plutôt que de compter sur l'appareil client pour décider seul (et souvent tardivement) de changer de borne. `802.11r` accélère la ré-association lors d'un changement de borne, particulièrement sensible pour un appareil en communication active (appel vocal sur une application, chapitre 2.9 rappel du besoin de qualité de service).

## VÉRIFICATION

<div class="ou-executer">GUI — UniFi Network Application</div>

```
Devices → (chaque borne) → Verifier le statut "Connected" et le nombre de clients associes
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
Toutes les bornes affichent "Connected", chaque SSID diffuse correctement (visible depuis un smartphone de test à proximité de chaque borne), et la page `Clients` du contrôleur confirme que les clients du SSID corporate reçoivent bien une adresse dans `10.10.50.0/24` et ceux du SSID invité dans `10.10.60.0/26`.
</div>

## TEST

1. **Test de connexion** : se connecter successivement aux deux SSID depuis un smartphone, confirmer l'obtention d'une adresse IP dans le bon VLAN.
2. **Test d'isolation invité** : connecter deux appareils au SSID invité et confirmer qu'ils ne peuvent pas se voir ou communiquer directement entre eux.
3. **Test de roaming** : se déplacer physiquement d'une zone couverte par une borne vers une zone couverte par une autre borne, en observant en continu (`Clients → détail de l'appareil`) le changement de borne associée — la bascule doit être imperceptible pour un appel ou un streaming en cours.

## DÉPANNAGE

### Si un client reste accroché à une borne éloignée malgré un signal faible

Vérifier `Minimum RSSI` (étape 8) — une valeur trop basse (ex. -85 dBm) laisse un client s'accrocher à une borne bien après que le signal soit devenu inutilisable ; une valeur trop haute (ex. -60 dBm) peut au contraire déconnecter des clients prématurément dans des zones de couverture normale — un compromis à ajuster après un test réel sur site, jamais une valeur générique appliquée sans vérification.

### Si le SSID invité donne accès aux ressources internes

Vérifier que le VLAN 60 est bien correctement cloisonné côté firewall (chapitre 28 — accès Internet uniquement, aucune route vers les autres VLAN) : le mappage SSID → VLAN (étape 5) place correctement le trafic sur le bon réseau, mais c'est bien le firewall/switch cœur, pas la borne Wi-Fi elle-même, qui applique réellement l'isolation entre VLAN.

## SAUVEGARDE

Le contrôleur UniFi conserve sa configuration localement (chapitre 15.6) — sauvegarder explicitement (`Settings → System → Backup → Download Backup`) et archiver ce fichier au même titre que les configurations des autres équipements du projet.

## CHECKLIST DE FIN

- [ ] Nombre et emplacement des bornes conformes à l'étude (chapitres 9, 15)
- [ ] Plan de couverture prévisionnel vérifié avant installation
- [ ] Toutes les bornes adoptées et connectées
- [ ] SSID corporate mappé au VLAN 50, sécurité Enterprise (RADIUS) ou au minimum PSK forte
- [ ] SSID invité mappé au VLAN 60, portail captif et isolation client actifs
- [ ] Roaming optimisé (Minimum RSSI, Band Steering, 802.11r) et testé physiquement
- [ ] Sauvegarde de la configuration du contrôleur réalisée

## Laboratoire complet — contrôleur UniFi virtualisé

<div class="encadre astuce">
<span class="encadre-titre">💡 Simuler un contrôleur sans posséder de vraies bornes</span>
Le contrôleur UniFi Network Application peut s'installer sur une VM et se piloter entièrement sans borne physique connectée — suffisant pour pratiquer la création de SSID, le mappage VLAN et les réglages de sécurité de ce chapitre ; seuls les tests de roaming réel (étape finale) exigent du matériel physique.
</div>

**Quoi installer** : VirtualBox (hyperviseur) + une VM Ubuntu Server (chapitre 32) + le paquet `UniFi Network Application` (Java + MongoDB, installés via le dépôt officiel Ubiquiti).
**Où télécharger** : `virtualbox.org` pour l'hyperviseur ; `ui.com/download/unifi` pour le paquet, ou le dépôt APT officiel Ubiquiti (`https://www.ui.com/download/unifi/debian/`).
**Comment installer** : créer la VM Ubuntu (méthode chapitre 32, étapes 1-2), ajouter le dépôt APT Ubiquiti, puis `sudo apt install unifi`.
**RAM/CPU (VM)** : 4 Go de RAM, 2 cœurs, 20 Go de disque — suffisant pour un contrôleur gérant un petit nombre de bornes simulées ou réelles.
**Interfaces réseau** : un adaptateur "Bridge" (pas NAT) si des bornes physiques réelles doivent être adoptées depuis ce contrôleur — le VLAN Management (chapitre 30.4) doit être joignable par la VM.

**Topologie** : `VM-Controleur-UniFi (10.10.10.5)` sur le VLAN Management, joignable depuis le VLAN Utilisateurs pour l'administration.

**Commandes à exécuter** : suivre l'assistant web de premier démarrage du contrôleur (`https://<ip-vm>:8443`), puis reproduire à l'identique les étapes 5 à 8 de ce chapitre (création des SSID, sécurité, roaming) depuis l'interface web du contrôleur.

**Tests à réaliser** : si aucune borne physique n'est disponible, confirmer au minimum que le contrôleur démarre sans erreur et que les deux SSID sont bien créés et configurés avec les bons VLAN (`Settings → WiFi`) — un test de connexion réel et un test de roaming (étape finale de ce chapitre) restent à réaliser sur le matériel physique une fois disponible, jamais simulés comme "validés" sans vérification réelle.

## Résumé du chapitre

Le déploiement Wi-Fi réutilise l'étude et le dimensionnement déjà réalisés (Volumes 3 et 5), passe par une simulation de couverture avant toute installation physique, adopte chaque borne dans le contrôleur, crée un SSID par VLAN avec une sécurité adaptée à son usage (Enterprise pour le corporate, portail captif isolé pour l'invité), et optimise le roaming pour qu'un déplacement entre bornes reste imperceptible pour l'utilisateur — chaque étape vérifiée par un test réel, pas seulement une lecture d'écran de configuration.

*Fin du Volume 10. Chapitre suivant : Windows Server de A à Z, premier chapitre du Volume 11 consacré aux serveurs.*
