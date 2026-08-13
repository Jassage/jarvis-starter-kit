<div class="chapitre-titre-num">CHAPITRE 43</div>

# Scénarios 11-20 : switching et VLAN

## Objectifs pédagogiques

Dix scénarios de dépannage couvrant les pannes de couche 2 les plus fréquentes : VLAN, ports, trunks, PoE, fibre/SFP, boucles et agrégation.

## Prérequis

Chapitre 42.

### Scénario 11 — VLAN incorrect

**Symptôme :** Un poste reçoit une adresse IP, mais dans le mauvais sous-réseau (par exemple `10.10.60.x`, Wi-Fi Invité, alors qu'il devrait être sur `10.10.20.x`, Utilisateurs).
**Causes possibles :** Port switch assigné au mauvais VLAN (chapitre 20).
**Test 1 :** `show vlan brief` sur le switch d'accès → **Résultat :** Le port du poste apparaît listé sous le VLAN 60, pas 20.
**Test 2 :** — (le test 1 confirme déjà la cause).
**Diagnostic :** Erreur de saisie lors de la configuration du port (chapitre 20), ou câblage physique branché sur le mauvais port par rapport au plan de ports (chapitre 47).
**Correction :** `switchport access vlan 20` sur le bon port ; vérifier aussi que le câblage physique correspond bien au plan de ports documenté.
**Vérification :** Le poste obtient une nouvelle adresse dans `10.10.20.x` après `ipconfig /renew`.
**Prévention :** Toujours mettre à jour le plan de ports (chapitre 47) immédiatement après toute modification, jamais différé.

### Scénario 12 — Port switch mal configuré

**Symptôme :** Un appareil branché sur un port reste `notconnect` malgré un câble certifié fonctionnel.
**Causes possibles :** Port administrativement désactivé (`shutdown`), port placé sur le VLAN 998 "non utilisé" (chapitre 23) par erreur.
**Test 1 :** `show interfaces status` → **Résultat :** `disabled`.
**Test 2 :** `show running-config interface GigabitEthernet1/0/x` → **Résultat :** Ligne `shutdown` présente.
**Diagnostic :** Port resté fermé depuis la procédure de fermeture des ports inutilisés (chapitre 23), jamais réactivé lors de sa réaffectation à un usage réel.
**Correction :** `no shutdown`, réassigner le bon VLAN.
**Vérification :** `show interfaces status` affiche `connected`.
**Prévention :** Toujours documenter dans le plan de ports (chapitre 47) le passage d'un port de "non utilisé" à "en service".

### Scénario 13 — Trunk incorrect

**Symptôme :** Un VLAN précis fonctionne sur un switch d'accès mais son trafic n'atteint jamais le switch cœur (chapitre 21).
**Causes possibles :** VLAN absent de la liste `allowed vlan` du trunk, sur un seul des deux côtés.
**Test 1 :** `show interfaces trunk` sur SW-ACCES-01 → **Résultat :** VLAN présent dans la liste.
**Test 2 :** `show interfaces trunk` sur SW-COEUR → **Résultat :** VLAN **absent** de la liste.
**Diagnostic :** Configuration asymétrique entre les deux extrémités du trunk (chapitre 21, l'encadré d'attention sur ce point précis).
**Correction :** Ajouter le VLAN manquant côté SW-COEUR (`switchport trunk allowed vlan add`).
**Vérification :** `show interfaces trunk` identique des deux côtés.
**Prévention :** Toujours comparer les deux extrémités d'un trunk après toute modification (méthode déjà recommandée au chapitre 21).

### Scénario 14 — Port fermé (err-disabled)

**Symptôme :** Un port bascule automatiquement en `err-disabled` peu après le branchement d'un appareil.
**Causes possibles :** BPDU Guard déclenché (un switch branché sur un port utilisateur, chapitre 22), Port Security en violation (chapitre 23).
**Test 1 :** `show interfaces status err-disabled` → **Résultat :** Port listé avec la cause `bpduguard` ou `psecure-violation`.
**Test 2 :** Identifier physiquement ce qui est branché sur ce port → **Résultat :** Confirme ou infirme un branchement anormal.
**Diagnostic :** Selon la cause précise identifiée par `show interfaces status err-disabled`.
**Correction :** Retirer l'appareil non autorisé si confirmé, puis réactiver le port (`shutdown` / `no shutdown`) — jamais réactiver sans avoir compris la cause (chapitre 22, encadré de dépannage).
**Vérification :** Le port reste stable (`connected`) après réactivation.
**Prévention :** Documentation claire des ports autorisés à recevoir un switch (uniquement les ports d'uplink prévus, chapitre 21), jamais un port utilisateur standard.

### Scénario 15 — Fibre inactive

**Symptôme :** Un lien fibre entre deux bâtiments affiche `notconnect` des deux côtés.
**Causes possibles :** Polarité TX/RX inversée, câble fibre sectionné ou trop courbé (chapitre 17.4), module SFP défectueux.
**Test 1 :** Inverser les deux brins de fibre à une extrémité (test rapide de polarité) → **Résultat :** Si le lien monte, la cause était une inversion TX/RX.
**Test 2 :** Si le lien reste down, tester avec un module SFP de remplacement connu fonctionnel → **Résultat :** Confirme ou infirme un module défectueux.
**Diagnostic :** Selon le résultat des deux tests — polarité, câble physique, ou module.
**Correction :** Corriger la polarité, remplacer le câble ou le module selon la cause confirmée.
**Vérification :** `show interfaces status` affiche `connected` sur les deux extrémités.
**Prévention :** Certifier également les liaisons fibre à l'installation (chapitre 17.12), pas seulement le cuivre.

### Scénario 16 — SFP incompatible

**Symptôme :** Un module SFP inséré n'est pas reconnu par le switch, ou le lien ne monte jamais malgré un câblage fibre confirmé bon.
**Causes possibles :** Module SFP non certifié par le fabricant du switch (certains équipementiers verrouillent leurs ports SFP à leurs propres modules ou à une liste blanche).
**Test 1 :** `show interfaces transceiver` (ou équivalent) → **Résultat :** Module signalé "non reconnu" ou "non supporté".
**Test 2 :** Tester avec un module de la marque du switch → **Résultat :** Reconnu et fonctionnel.
**Diagnostic :** Incompatibilité de verrouillage fabricant, pas un défaut matériel.
**Correction :** Remplacer par un module compatible (de la marque du switch, ou un module tiers explicitement certifié compatible).
**Vérification :** Lien monte normalement (`connected`).
**Prévention :** Toujours vérifier la compatibilité SFP/switch **avant** l'achat (chapitre 13.6), jamais après réception sur site.

### Scénario 17 — Boucle réseau

**Symptôme :** Le réseau entier ralentit brutalement, les switches affichent une charge CPU anormalement élevée.
**Causes possibles :** Câble branché par erreur entre deux ports du même switch ou de deux switches déjà reliés (chapitre 22.1).
**Test 1 :** `show spanning-tree summary` → **Résultat :** Un nombre élevé de changements de topologie récents (`Topology change count`).
**Test 2 :** Identifier le port en cause via les journaux STP ou en débranchant méthodiquement les liens suspects un par un → **Résultat :** La charge CPU retombe immédiatement au débranchement du câble en cause.
**Diagnostic :** Boucle physique accidentelle, exactement le scénario anticipé au chapitre 22.1.
**Correction :** Retirer le câble en cause définitivement (ou le rebrancher correctement s'il s'agissait d'une erreur de destination).
**Vérification :** Charge CPU normale, `Topology change count` stable.
**Prévention :** RSTP actif partout (déjà le cas depuis le chapitre 22) — sans lui, ce scénario provoquerait une panne totale plutôt qu'un ralentissement contenu.

### Scénario 18 — STP bloque un port de façon inattendue

**Symptôme :** Un port relié à un nouveau switch d'accès reste en état `blocking` indéfiniment.
**Causes possibles :** Une boucle physique existe réellement quelque part dans la topologie (STP fonctionne correctement en bloquant un chemin redondant), ou une priorité STP mal configurée fait élire un root bridge inattendu.
**Test 1 :** `show spanning-tree vlan X` → **Résultat :** Root ID inattendu (pas SW-COEUR).
**Test 2 :** Vérifier la priorité STP du switch actuellement élu root → **Résultat :** Priorité anormalement basse sur un switch qui ne devrait jamais être root.
**Diagnostic :** Un switch d'accès mal configuré (priorité par défaut modifiée par erreur) concurrence SW-COEUR pour le rôle de root.
**Correction :** Corriger la priorité du switch fautif, ou vérifier que Root Guard (chapitre 22.3) est bien actif pour empêcher ce cas à l'avenir.
**Vérification :** `show spanning-tree vlan X` confirme à nouveau SW-COEUR comme root.
**Prévention :** Root Guard sur tous les ports du switch cœur descendant vers des switches d'accès (déjà recommandé au chapitre 22.3).

### Scénario 19 — LACP incorrect

**Symptôme :** Un lien agrégé fonctionne, mais sans le débit ni la redondance attendus.
**Causes possibles :** Un seul des deux câbles physiques réellement intégré au port-channel (chapitre 21).
**Test 1 :** `show etherchannel summary` → **Résultat :** Un port affiche `(P)` (bundled), l'autre `(I)` (independent).
**Test 2 :** Vérifier le mode LACP (`active`/`passive`) et la vitesse/duplex des deux ports → **Résultat :** Une différence de vitesse configurée entre les deux ports du groupe.
**Diagnostic :** LACP refuse de regrouper des ports aux caractéristiques différentes (chapitre 21, dépannage).
**Correction :** Aligner la vitesse et le duplex des deux ports.
**Vérification :** `show etherchannel summary` affiche `(P)` sur les deux ports.
**Prévention :** Toujours provisionner des ports strictement identiques (modèle, vitesse) pour une agrégation LACP.

### Scénario 20 — Switch PoE surchargé

**Symptôme :** Un appareil PoE (caméra ou borne Wi-Fi) perd son alimentation de façon aléatoire, en particulier après l'ajout d'un nouvel appareil PoE sur le même switch.
**Causes possibles :** Budget PoE total du switch dépassé (chapitre 13.4).
**Test 1 :** `show power inline` → **Résultat :** Consommation totale proche ou au-delà du budget maximal du switch.
**Test 2 :** Identifier l'ordre d'activation des ports PoE (les derniers activés sont généralement les premiers coupés en cas de dépassement) → **Résultat :** Confirme que l'appareil récemment ajouté est celui affecté.
**Diagnostic :** Budget PoE total dépassé, exactement le scénario anticipé au chapitre 13.4.
**Correction :** Répartir les appareils PoE sur un second switch, ou remplacer par un modèle à budget PoE supérieur.
**Vérification :** `show power inline` confirme une consommation totale sous le budget maximal, tous les appareils alimentés en continu.
**Prévention :** Toujours recalculer le budget PoE total (chapitre 13.4) avant d'ajouter un nouvel appareil PoE à un switch existant, jamais après coup.

*Chapitre suivant : les 10 scénarios de dépannage routage, firewall et Wi-Fi.*
