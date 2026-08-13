<div class="chapitre-titre-num">CHAPITRE 44</div>

# Scénarios 21-30 : routage, firewall et Wi-Fi

## Objectifs pédagogiques

Dix scénarios de dépannage couvrant le firewall, le VPN, l'accès administratif distant, le Wi-Fi, et la perte d'équipements redondants.

## Prérequis

Chapitre 43.

### Scénario 21 — Firewall bloque le trafic

**Symptôme :** Un flux légitime (par exemple, un poste du VLAN Utilisateurs vers un serveur applicatif) est bloqué de façon inattendue.
**Causes possibles :** Règle de blocage mal positionnée (avant une règle d'autorisation), objet d'adresse mal défini.
**Test 1 :** `get firewall policy` sur FW-01 (chapitre 28) → **Résultat :** Une règle de blocage générale apparaît avant la règle d'autorisation attendue.
**Test 2 :** Consulter les journaux (`FortiView → Firewall Policy`) au moment du test → **Résultat :** Confirme quelle règle précise a traité la connexion refusée.
**Diagnostic :** Ordre d'évaluation des règles incorrect (chapitre 28, piège déjà documenté).
**Correction :** Réordonner les règles (`move` en FortiOS) pour que l'autorisation précède le blocage général, ou affiner l'objet d'adresse en cause.
**Vérification :** Le flux fonctionne, confirmé dans les journaux comme traité par la bonne règle.
**Prévention :** Toujours vérifier l'ordre des règles après toute modification (chapitre 28, VÉRIFICATION).

### Scénario 22 — Wi-Fi lent

**Symptôme :** Les utilisateurs signalent un Wi-Fi lent à certaines heures ou dans certaines zones.
**Causes possibles :** Trop d'appareils sur une seule borne (dépassement de la capacité recommandée, chapitre 15.1), interférence sur le canal utilisé, bande 2,4 GHz saturée.
**Test 1 :** Contrôleur UniFi → `Clients` par borne → **Résultat :** Une borne dépasse significativement les 30-35 clients recommandés (chapitre 15.1).
**Test 2 :** Analyse de spectre (souvent intégrée au contrôleur) → **Résultat :** Canal fortement utilisé par des réseaux voisins.
**Diagnostic :** Selon le résultat — soit une sous-couverture (trop de clients par borne), soit une interférence de canal.
**Correction :** Ajouter une borne supplémentaire (recalcul selon la méthode du chapitre 15.1) si sous-couverture confirmée ; changer de canal (souvent automatisé, DFS/auto-channel) si interférence confirmée.
**Vérification :** Débit mesuré normal, nombre de clients par borne redescendu sous le seuil recommandé.
**Prévention :** Revoir périodiquement le nombre de clients par borne à mesure que le parc d'appareils de l'entreprise grandit — le dimensionnement initial (chapitre 15) n'est jamais figé définitivement.

### Scénario 23 — AP non adopté

**Symptôme :** Une borne fraîchement installée n'apparaît jamais dans le contrôleur (chapitre 30.4).
**Causes possibles :** Port switch non rattaché au VLAN Management, absence d'alimentation PoE, borne défectueuse.
**Test 1 :** Vérifier les voyants LED de la borne → **Résultat :** Aucun voyant allumé, confirmant une absence d'alimentation.
**Test 2 :** `show power inline` sur le switch → **Résultat :** Port PoE désactivé ou budget dépassé (renvoi scénario 20).
**Diagnostic :** Absence d'alimentation PoE.
**Correction :** Activer le port PoE ou résoudre le dépassement de budget (scénario 20).
**Vérification :** Les voyants de la borne s'allument, elle apparaît en "Pending Adoption" puis "Connected" après adoption (chapitre 30.4).
**Prévention :** Toujours vérifier `show power inline` avant de suspecter la borne elle-même.

### Scénario 24 — VPN ne fonctionne pas

**Symptôme :** Un télétravailleur ne parvient pas à établir sa connexion SSL-VPN.
**Causes possibles :** Port SSL-VPN bloqué par le réseau du télétravailleur (souvent un firewall d'hôtel ou d'entreprise tierce restrictif), identifiants incorrects, pool d'adresses VPN épuisé.
**Test 1 :** Tenter la connexion depuis un réseau différent (par exemple, le partage de connexion d'un smartphone) → **Résultat :** Succès depuis ce second réseau.
**Test 2 :** Si l'échec persiste sur tout réseau, vérifier le pool d'adresses SSL-VPN (chapitre 29.2) → **Résultat :** Pool épuisé (toutes les adresses déjà attribuées à des sessions actives ou fantômes).
**Diagnostic :** Selon le résultat — soit un blocage réseau local au télétravailleur (hors du contrôle du projet), soit un pool épuisé.
**Correction :** Élargir le pool d'adresses VPN si épuisement confirmé ; documenter la contrainte de réseau restrictif si c'est la cause, sans action corrective possible côté projet.
**Vérification :** Connexion SSL-VPN réussie, adresse attribuée dans le pool.
**Prévention :** Dimensionner le pool VPN avec une marge sur le nombre réel de télétravailleurs simultanés (chapitre 14.4).

### Scénario 25 — SSH inaccessible

**Symptôme :** Impossible de se connecter en SSH à un équipement pourtant joignable en ping.
**Causes possibles :** Service SSH non démarré, ACL de management restrictive, clé RSA non générée (chapitre 19.4).
**Test 1 :** `Test-NetConnection <ip> -Port 22` → **Résultat :** `TcpTestSucceeded : False`.
**Test 2 :** Accès console physique, `show ip ssh` → **Résultat :** `SSH Disabled - version 1.99` ou message équivalent d'absence de clé.
**Diagnostic :** Clé RSA jamais générée (chapitre 19.4, l'étape souvent oubliée).
**Correction :** `crypto key generate rsa modulus 2048` après avoir confirmé `ip domain-name` configuré.
**Vérification :** `Test-NetConnection` réussit, connexion SSH établie.
**Prévention :** Toujours vérifier `show ip ssh` immédiatement après la configuration initiale (chapitre 19), pas seulement supposer son succès.

### Scénario 26 — Firewall indisponible

**Symptôme :** Coupure totale d'Internet et de l'accès VPN pour tout le réseau.
**Causes possibles :** Panne matérielle de FW-01, redémarrage inattendu, surcharge (chapitre 14.2).
**Test 1 :** Ping vers l'interface interne de FW-01 (`10.10.99.1`) → **Résultat :** Échec total, y compris en local.
**Test 2 :** Accès console physique à FW-01 → **Résultat :** Équipement éteint ou en boucle de redémarrage.
**Diagnostic :** Panne matérielle ou logicielle complète du firewall.
**Correction :** Redémarrage contrôlé, ou remplacement matériel avec restauration de la configuration sauvegardée (chapitre 28, SAUVEGARDE).
**Vérification :** Firewall à nouveau joignable, trafic Internet et VPN rétabli.
**Prévention :** Sur un projet où cette interruption est jugée inacceptable, envisager un cluster de firewalls en haute disponibilité (chapitre 14.7).

### Scénario 27 — Perte d'un lien

**Symptôme :** Un lien réseau tombe (câble, fibre, ou panne d'un port), mais le service continue.
**Causes possibles :** Fonctionnement normal d'une redondance (LACP, chapitre 21).
**Test 1 :** `show etherchannel summary` → **Résultat :** Un seul port du groupe reste `(P)`, l'autre absent ou en échec.
**Test 2 :** Vérifier l'impact utilisateur réel → **Résultat :** Aucune interruption perceptible, confirmant que la redondance a fonctionné comme prévu.
**Diagnostic :** Panne d'un lien physique, absorbée par la conception redondante du chapitre 21 — pas une urgence immédiate, mais une réparation à planifier.
**Correction :** Identifier et réparer le lien en panne (câble, port) en dehors des heures critiques, sans urgence puisque le service n'est pas interrompu.
**Vérification :** `show etherchannel summary` affiche à nouveau les deux ports `(P)`.
**Prévention :** Ce scénario illustre précisément pourquoi la redondance de liens (chapitre 21) est appliquée systématiquement dans ce manuel — la "prévention" ici est déjà en place par conception.

### Scénario 28 — Perte d'un switch

**Symptôme :** Un switch cœur tombe complètement en panne.
**Causes possibles :** Panne matérielle.
**Test 1 :** Vérifier l'état du second switch cœur (VRRP, chapitre 27) → **Résultat :** `show vrrp brief` affiche désormais `State: Master` sur SW-COEUR-02.
**Test 2 :** Vérifier l'impact utilisateur → **Résultat :** Quelques secondes de coupure au moment de la bascule (chapitre 27, TEST), puis service normal.
**Diagnostic :** Panne matérielle de SW-COEUR, absorbée par la redondance VRRP configurée au chapitre 27.
**Correction :** Réparer ou remplacer SW-COEUR, restaurer sa configuration sauvegardée (chapitre 24), le réintégrer — `preempt` (chapitre 27.3) lui rendra automatiquement son rôle de master.
**Vérification :** `show vrrp brief` confirme SW-COEUR redevenu `State: Master` après réintégration.
**Prévention :** Ce scénario est la raison d'être du chapitre 27 — la redondance de switch cœur n'est jamais un luxe sur un projet où une panne de routage complète serait inacceptable (chapitre 14.7, même critère appliqué au firewall).

### Scénario 29 — Perte d'un AP

**Symptôme :** Une zone perd sa couverture Wi-Fi, les zones voisines restent normales.
**Causes possibles :** Panne matérielle de la borne, coupure PoE.
**Test 1 :** Contrôleur UniFi → statut de la borne → **Résultat :** "Disconnected".
**Test 2 :** `show power inline` sur le switch qui l'alimente → **Résultat :** Port PoE toujours actif et fournissant de la puissance, éliminant une cause d'alimentation.
**Diagnostic :** Panne matérielle probable de la borne elle-même (alimentation confirmée normale au test 2).
**Correction :** Remplacer la borne, réadopter dans le contrôleur (chapitre 30.4) — sa configuration SSID/VLAN se réapplique automatiquement une fois adoptée dans le même site du contrôleur.
**Vérification :** Nouvelle borne "Connected", couverture rétablie dans la zone.
**Prévention :** Sur une zone jugée critique (hall d'entrée, salle de réunion principale), envisager un léger chevauchement de couverture entre bornes voisines (chapitre 15.1) pour qu'une panne isolée reste transparente.

### Scénario 30 — Certificat expiré

**Symptôme :** Une alerte de sécurité "certificat non valide" apparaît en se connectant à l'interface web d'un équipement (firewall, contrôleur Wi-Fi, NVR).
**Causes possibles :** Certificat auto-signé ou émis expiré, jamais renouvelé.
**Test 1 :** Consulter la date d'expiration affichée par le navigateur → **Résultat :** Date dépassée.
**Test 2 :** Vérifier si un renouvellement automatique était censé être configuré (certains équipements le proposent) → **Résultat :** Fonctionnalité non activée.
**Diagnostic :** Absence de suivi du cycle de vie du certificat.
**Correction :** Régénérer ou renouveler le certificat (procédure spécifique à chaque équipement), en activant si possible le renouvellement automatique pour l'avenir.
**Vérification :** L'alerte de certificat disparaît, connexion normale sans avertissement.
**Prévention :** Ajouter le suivi des dates d'expiration de certificat à la maintenance planifiée (chapitre 49).

*Chapitre suivant : les 10 scénarios de dépannage serveurs, supervision et sauvegarde.*
