<div class="chapitre-titre-num">CHAPITRE 42</div>

# Scénarios 1-10 : réseau de base (IP, DHCP, DNS, Internet)

## Objectifs pédagogiques

Appliquer la méthode du chapitre 41 à dix scénarios réels et complets, couvrant les pannes les plus fréquentes d'adressage, de DHCP, de DNS, de routage de base et d'accès.

## Prérequis

Chapitre 41.

Chaque scénario suit la structure : Symptôme → Causes possibles → Test 1 → Résultat → Test 2 → Résultat → Diagnostic → Correction → Vérification → Prévention.

### Scénario 1 — PC sans IP

**Symptôme :** Le PC affiche "Aucune connectivité réseau", aucune adresse IP visible.
**Causes possibles :** Câble débranché, port switch désactivé, carte réseau désactivée, échec DHCP total.
**Test 1 :** `Get-NetIPConfiguration` → **Résultat :** Interface `Disconnected`.
**Test 2 :** Vérifier le voyant du port switch et `show interfaces status` (chapitre 20) → **Résultat :** Port `notconnect`.
**Diagnostic :** Câble ou prise murale défectueux (aucune négociation de lien physique établie).
**Correction :** Tester le câble avec un testeur (chapitre 17.12) ; remplacer si nécessaire.
**Vérification :** `show interfaces status` affiche `connected`, `Get-NetIPConfiguration` affiche une adresse valide après DHCP.
**Prévention :** Certification systématique de chaque câble à l'installation (chapitre 17.12) — un câble jamais certifié reste une cause potentielle latente.

### Scénario 2 — PC avec mauvaise IP (adresse APIPA)

**Symptôme :** Le PC a une adresse `169.254.x.x`.
**Causes possibles :** Serveur DHCP hors service, pool DHCP épuisé, port switch mal assigné à un VLAN sans service DHCP.
**Test 1 :** `ipconfig /all` → **Résultat :** Confirme l'adresse APIPA et l'absence de serveur DHCP listé.
**Test 2 :** Depuis le serveur DHCP, `Get-DhcpServerv4Statistics` (chapitre 31) → **Résultat :** Pool à 100 % d'utilisation, ou service arrêté.
**Diagnostic :** Épuisement du pool DHCP du VLAN concerné.
**Correction :** Élargir la plage DHCP (chapitre 11) si le besoin réel dépasse le dimensionnement initial, ou nettoyer les baux expirés non libérés.
**Vérification :** `ipconfig /renew` (chapitre 6.8) attribue une adresse normale.
**Prévention :** Dimensionner la plage DHCP avec la marge de croissance du chapitre 8, surveiller l'utilisation du pool via la supervision (chapitre 38).

### Scénario 3 — DHCP inaccessible

**Symptôme :** Aucun poste d'un VLAN entier ne reçoit d'adresse IP.
**Causes possibles :** Service DHCP arrêté, DHCP Snooping bloquant le port légitime (chapitre 23), serveur DHCP non autorisé dans Active Directory (chapitre 31).
**Test 1 :** `Get-DhcpServerInDC` sur le serveur → **Résultat :** Serveur absent de la liste des serveurs autorisés.
**Test 2 :** `show ip dhcp snooping binding` sur le switch → **Résultat :** Aucune entrée, port trust mal configuré.
**Diagnostic :** Combinaison possible des deux causes — toujours vérifier les deux, pas seulement la première trouvée.
**Correction :** Autoriser le serveur (`Add-DhcpServerInDC`, chapitre 31) et/ou corriger le port trust (chapitre 23).
**Vérification :** Un poste de test obtient une adresse complète en moins de 5 secondes.
**Prévention :** Inclure la vérification `Get-DhcpServerInDC` dans la checklist de mise en production (chapitre 48).

### Scénario 4 — DNS inaccessible

**Symptôme :** Les postes ont une IP valide, mais aucun nom (interne ou public) ne se résout.
**Causes possibles :** Service DNS arrêté sur le serveur, redirecteurs DNS mal configurés, règle firewall bloquant le port 53.
**Test 1 :** `Resolve-DnsName entreprise.local` → **Résultat :** Échec.
**Test 2 :** `Test-NetConnection 10.10.30.10 -Port 53` → **Résultat :** `TcpTestSucceeded : False`.
**Diagnostic :** Service DNS arrêté ou injoignable sur SRV-01.
**Correction :** `Get-Service DNS` puis `Start-Service DNS` sur SRV-01 (chapitre 31) ; vérifier les redirecteurs (chapitre 31, étape 5) si le service tourne mais que seule la résolution publique échoue.
**Vérification :** `Resolve-DnsName` réussit pour un nom interne et un nom public.
**Prévention :** Superviser le service DNS via Zabbix (chapitre 38), alerte immédiate sur arrêt.

### Scénario 5 — Internet inaccessible (mais réseau local fonctionnel)

**Symptôme :** Les postes communiquent entre eux et avec les serveurs, mais aucun site Internet n'est joignable.
**Causes possibles :** Panne de la liaison opérateur, NAT désactivé sur le firewall (chapitre 28), route par défaut manquante.
**Test 1 :** `ping 8.8.8.8` depuis un poste → **Résultat :** Échec.
**Test 2 :** `ping 203.0.113.1` (passerelle opérateur) depuis FW-01 → **Résultat :** Échec.
**Diagnostic :** Panne côté opérateur (le test 2, effectué au plus près du WAN, échoue déjà) — pas un problème de configuration interne.
**Correction :** Contacter le fournisseur d'accès ; aucune action corrective côté projet tant que la liaison opérateur elle-même n'est pas rétablie.
**Vérification :** `ping 203.0.113.1` réussit à nouveau, puis `ping 8.8.8.8` depuis un poste.
**Prévention :** Envisager une seconde liaison WAN redondante (chapitre 14.3) si la continuité Internet est jugée critique pour l'activité du client.

### Scénario 6 — Route manquante

**Symptôme :** Un VLAN précis ne peut joindre ni Internet ni certains autres VLAN, alors que le reste du réseau fonctionne normalement.
**Causes possibles :** SVI non créée ou désactivée sur SW-COEUR (chapitre 26), route statique ou OSPF absente.
**Test 1 :** `show ip route` sur SW-COEUR → **Résultat :** Le réseau du VLAN concerné n'apparaît pas dans la table.
**Test 2 :** `show ip interface brief` → **Résultat :** L'interface VLAN concernée est `administratively down`.
**Diagnostic :** `no shutdown` (chapitre 26, étape 1) oublié sur cette SVI précise.
**Correction :** Appliquer `no shutdown` sur l'interface VLAN concernée.
**Vérification :** `show ip route` affiche désormais le réseau ; un ping depuis ce VLAN vers un autre réussit.
**Prévention :** Vérification systématique `show ip route connected` (chapitre 26) après toute création de VLAN, jamais supposée automatiquement correcte.

### Scénario 7 — Horloge incorrecte

**Symptôme :** Les journaux d'un équipement affichent des horodatages incohérents avec les autres équipements du réseau.
**Causes possibles :** NTP non configuré sur cet équipement précis, serveur NTP de référence injoignable.
**Test 1 :** `show ntp status` sur l'équipement concerné → **Résultat :** `Clock unsynchronized`.
**Test 2 :** `ping 10.10.30.10` (SRV-01, la source NTP du projet, chapitre 40.8) depuis cet équipement → **Résultat :** Échec.
**Diagnostic :** Problème de connectivité vers la source NTP, pas un problème de configuration NTP elle-même.
**Correction :** Résoudre le problème de connectivité sous-jacent (souvent une ACL ou une règle firewall trop restrictive bloquant le port UDP 123).
**Vérification :** `show ntp status` affiche `Clock synchronized`.
**Prévention :** Inclure la vérification NTP dans l'audit de sécurité consolidé (chapitre 40).

### Scénario 8 — Logs absents

**Symptôme :** Un équipement n'envoie aucun journal vers la supervision centralisée (SRV-03, chapitre 38).
**Causes possibles :** Commande `logging host`/`syslogd setting` non appliquée, niveau de journalisation trop restrictif, règle firewall bloquant le port syslog (UDP 514).
**Test 1 :** `show running-config | include logging` sur l'équipement → **Résultat :** Commande absente.
**Test 2 :** — (le test 1 suffit déjà à confirmer la cause dans ce scénario, une configuration simplement jamais appliquée).
**Diagnostic :** Configuration de journalisation centralisée (chapitre 40.7) oubliée sur cet équipement lors du déploiement initial.
**Correction :** Appliquer `logging host 10.10.30.12` (ou l'équivalent FortiOS).
**Vérification :** Un événement test généré sur l'équipement apparaît dans Zabbix/le collecteur syslog en quelques secondes.
**Prévention :** Ajouter la vérification des logs centralisés à la checklist de mise en production (chapitre 48) pour chaque nouvel équipement.

### Scénario 9 — Utilisateur sans permission

**Symptôme :** Un utilisateur légitime ne peut pas accéder à une ressource (partage de fichiers, VPN, NVR) qu'il devrait normalement pouvoir utiliser.
**Causes possibles :** Utilisateur non ajouté au bon groupe (chapitre 31), permission mal accordée (accordée à l'utilisateur individuellement plutôt qu'à son groupe, chapitre 31.9), compte désactivé par erreur.
**Test 1 :** `Get-ADPrincipalGroupMembership <utilisateur>` → **Résultat :** L'utilisateur n'appartient pas au groupe attendu.
**Test 2 :** Vérifier les permissions du partage/de la ressource (`Get-SmbShareAccess`) → **Résultat :** Seul le groupe attendu a accès, confirmant que l'appartenance au groupe est bien la cause.
**Diagnostic :** Utilisateur jamais ajouté au groupe lors de sa création, ou retiré par erreur ultérieurement.
**Correction :** `Add-ADGroupMember` (chapitre 31.7).
**Vérification :** L'utilisateur, après une déconnexion/reconnexion (le jeton de groupe Windows se met à jour à la connexion), accède normalement à la ressource.
**Prévention :** Toujours accorder les permissions à un groupe, jamais à un utilisateur individuellement (principe déjà posé au chapitre 31.9) — un oubli d'ajout au groupe reste alors la seule cause possible, plus simple à diagnostiquer qu'une multitude de permissions individuelles éparpillées.

### Scénario 10 — Problème intermittent

**Symptôme :** Une panne réseau survient de façon aléatoire, quelques minutes par jour, sans schéma horaire évident, puis se résout d'elle-même.
**Causes possibles :** Câble partiellement endommagé (faux contact), interférence électromagnétique intermittente, surcharge périodique d'un équipement (pic d'usage à heure de pointe), boucle réseau intermittente (chapitre 43).
**Test 1 :** Consulter l'historique de supervision (Zabbix, chapitre 38) sur la période de l'incident → **Résultat :** Un pic d'utilisation CPU ou de perte de paquets corrèle avec les horaires signalés.
**Test 2 :** Si aucune corrélation horaire claire, examiner les journaux de l'interface concernée (`show interfaces` — compteurs d'erreurs CRC, collisions) → **Résultat :** Un compteur d'erreurs qui augmente régulièrement, signe d'un problème physique intermittent (câble, connecteur).
**Diagnostic :** Un problème intermittent, contrairement à une panne franche, exige presque toujours de **corréler des données dans le temps** (supervision) plutôt qu'un simple test ponctuel — la méthode du chapitre 41 s'applique toujours, mais étalée sur plusieurs observations au lieu d'un diagnostic en une seule session.
**Correction :** Selon la cause confirmée : remplacement du câble suspect, déplacement d'un équipement loin d'une source d'interférence identifiée, ou dimensionnement revu si un pic de charge légitime est en cause.
**Vérification :** Absence de récurrence du symptôme sur une période d'observation d'au moins une semaine après correction.
**Prévention :** La supervision continue (chapitre 38) est la seule véritable prévention efficace contre ce type de panne — sans historique de données, un problème intermittent reste presque impossible à diagnostiquer avec certitude.

*Chapitre suivant : les 10 scénarios de dépannage switching et VLAN.*
