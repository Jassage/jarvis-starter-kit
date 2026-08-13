<div class="chapitre-titre-num">CHAPITRE 46</div>

# Scénarios 41-50 : vidéosurveillance et pannes matérielles

## Objectifs pédagogiques

Les dix derniers scénarios de dépannage, clôturant le Volume 14 : caméras, NVR, stockage et bande passante vidéosurveillance.

## Prérequis

Chapitre 45.

### Scénario 41 — Caméra inaccessible

**Symptôme :** Une caméra ne répond plus, ni sur son interface web ni depuis le NVR.
**Causes possibles :** Panne d'alimentation PoE, câble endommagé, panne matérielle de la caméra elle-même.
**Test 1 :** `show power inline` sur le switch PoE dédié → **Résultat :** Port toujours actif et fournissant la puissance attendue.
**Test 2 :** `ping 10.10.80.11` (adresse de la caméra) → **Résultat :** Échec malgré une alimentation confirmée normale.
**Diagnostic :** Panne réseau (câble) ou matérielle de la caméra, l'alimentation étant déjà confirmée normale au test 1.
**Correction :** Tester le câble (chapitre 17.12) ; si confirmé bon, remplacer la caméra (procédure facilitée par la configuration exportée et archivée au chapitre 35).
**Vérification :** `ping` réussit, caméra à nouveau visible dans le NVR.
**Prévention :** Certification systématique de tout câblage vidéosurveillance (chapitre 17.12), configuration de chaque caméra sauvegardée (chapitre 35).

### Scénario 42 — Caméra sans PoE

**Symptôme :** Une caméra ne s'allume jamais après installation (aucun voyant, aucune image).
**Causes possibles :** Port switch non PoE, standard PoE insuffisant pour cette caméra précise (chapitre 13.3), câble hors norme (paires manquantes empêchant la transmission d'énergie).
**Test 1 :** `show power inline` → **Résultat :** Port n'alimente aucune puissance (`0.0 W`).
**Test 2 :** Vérifier que le port est bien configuré comme port PoE actif, pas désactivé → **Résultat :** Confirme ou infirme une désactivation de port.
**Diagnostic :** Selon le résultat — port non PoE utilisé par erreur, ou standard insuffisant pour la caméra branchée.
**Correction :** Rebrancher sur un port PoE confirmé actif, avec le standard adapté (PoE+ si nécessaire, chapitre 13.3).
**Vérification :** `show power inline` confirme une consommation cohérente avec le profil de la caméra.
**Prévention :** Toujours vérifier le plan de ports (chapitre 47) pour confirmer qu'un port destiné à une caméra est bien PoE avant le câblage.

### Scénario 43 — Caméra avec mauvaise IP

**Symptôme :** Une caméra reçoit une adresse IP différente de celle attendue (hors de la plage `10.10.80.x`).
**Causes possibles :** Réservation DHCP incorrecte ou absente (chapitre 35, étape 2), caméra restée configurée en IP statique d'usine sur un autre VLAN.
**Test 1 :** Vérifier le mode réseau configuré sur la caméra (interface web) → **Résultat :** Toujours en IP statique d'usine, jamais repassée en DHCP (étape 2 du chapitre 35 oubliée).
**Test 2 :** — (le test 1 confirme déjà la cause).
**Diagnostic :** Étape de configuration réseau du chapitre 35 non appliquée à cette caméra précise.
**Correction :** Reconfigurer la caméra en client DHCP (chapitre 35, étape 2), créer la réservation manquante côté serveur.
**Vérification :** Caméra visible à l'adresse réservée attendue.
**Prévention :** Cocher chaque caméra sur la checklist du chapitre 35 individuellement, jamais supposer un lot entier configuré de façon homogène sans vérification unitaire.

### Scénario 44 — NVR ne voit pas la caméra

**Symptôme :** La caméra répond normalement à un ping et à sa propre interface web, mais n'apparaît pas dans la recherche automatique du NVR (chapitre 36.3).
**Causes possibles :** Découverte ONVIF désactivée sur la caméra, VLAN CCTV mal isolé empêchant la découverte réseau (paradoxalement un signe que l'isolation fonctionne trop bien si le NVR n'est pas sur le même segment), identifiants incorrects saisis lors de l'ajout.
**Test 1 :** Vérifier que ONVIF est activé sur la caméra (paramètre parfois désactivé par défaut ou désactivable par erreur) → **Résultat :** Confirme ou infirme.
**Test 2 :** Ajouter la caméra manuellement par adresse IP plutôt que par recherche automatique → **Résultat :** Réussit, confirmant un problème de découverte plutôt que de connectivité réelle.
**Diagnostic :** ONVIF désactivé ou découverte réseau bloquée, la connectivité de base étant par ailleurs confirmée fonctionnelle.
**Correction :** Activer ONVIF sur la caméra, ou ajouter systématiquement par adresse IP si la découverte automatique reste problématique.
**Vérification :** Caméra ajoutée et visible dans le NVR.
**Prévention :** Vérifier ONVIF activé dès la configuration initiale de la caméra (chapitre 35), avant l'étape d'ajout au NVR.

### Scénario 45 — Caméra visible mais pas d'enregistrement

**Symptôme :** Le NVR affiche l'image en direct de la caméra, mais aucune séquence n'est enregistrée.
**Causes possibles :** Calendrier d'enregistrement non configuré pour cette caméra (chapitre 36.4), stockage plein (renvoi scénario 46), permission d'enregistrement désactivée par erreur.
**Test 1 :** Vérifier le calendrier d'enregistrement de cette caméra précise dans le NVR → **Résultat :** Aucune plage horaire configurée (calendrier vide).
**Test 2 :** — (le test 1 confirme déjà la cause dans ce cas).
**Diagnostic :** Oubli de configuration du calendrier d'enregistrement pour cette caméra spécifique lors de l'étape 4 du chapitre 36.
**Correction :** Configurer le calendrier d'enregistrement approprié (continu ou détection de mouvement selon la criticité de la zone, chapitre 36.4).
**Vérification :** Relecture réelle d'une séquence enregistrée dans les minutes suivantes.
**Prévention :** La checklist individuelle du chapitre 33 (étape 18) inclut explicitement la vérification de l'enregistrement réel par relecture, précisément pour détecter ce type d'oubli avant la mise en production.

### Scénario 46 — Stockage NVR plein

**Symptôme :** Alerte de stockage plein sur le NVR, ou séquences les plus anciennes disparaissant plus vite que la rétention prévue (30 jours, chapitre 34).
**Causes possibles :** Débit réel des caméras supérieur à l'hypothèse de calcul (chapitre 34), nombre de caméras en enregistrement continu supérieur à ce qui avait été prévu, disque RAID sous-dimensionné dès l'origine.
**Test 1 :** Comparer le débit réellement configuré sur chaque caméra (chapitre 35, étape 4) au débit utilisé dans le calcul initial (chapitre 34) → **Résultat :** Une ou plusieurs caméras configurées à un débit supérieur à l'hypothèse (par exemple, une caméra repassée en H.264 par erreur au lieu de H.265, chapitre 34.1, doublant son débit réel).
**Test 2 :** Vérifier le calendrier d'enregistrement de chaque caméra → **Résultat :** Une caméra initialement prévue en détection de mouvement est en réalité en enregistrement continu.
**Diagnostic :** Écart entre la configuration réelle et les hypothèses du calcul de dimensionnement du chapitre 34.
**Correction :** Réaligner la configuration de chaque caméra en écart sur les hypothèses initiales, ou recalculer et étendre le stockage si le besoin réel a légitimement évolué (plus de caméras qu'au dimensionnement initial, par exemple).
**Vérification :** Le stockage se stabilise à un rythme de remplissage cohérent avec la rétention prévue.
**Prévention :** Audit périodique comparant la configuration réelle de chaque caméra aux hypothèses du chapitre 34 (à intégrer à la maintenance trimestrielle, chapitre 49).

### Scénario 47 — Image CCTV saccadée

**Symptôme :** L'image d'une ou plusieurs caméras saccade ou se fige par intermittence, en direct ou en relecture.
**Causes possibles :** Bande passante insuffisante sur le lien concerné (renvoi scénario 48), performance du switch PoE dépassée, matériel de décodage du poste de consultation insuffisant (particulièrement en H.265, chapitre 34.1).
**Test 1 :** Vérifier le débit sur le port d'uplink du switch PoE dédié (`show interfaces ... | include rate`) → **Résultat :** Débit proche ou dépassant la capacité du lien.
**Test 2 :** Tester la relecture depuis un autre poste de consultation → **Résultat :** Si le problème disparaît sur un autre poste, la cause est le poste de consultation (décodage), pas le réseau.
**Diagnostic :** Selon le résultat — congestion réseau (lien sous-dimensionné) ou poste de consultation insuffisant.
**Correction :** Selon la cause : améliorer le lien (uplink SFP+ plutôt que cuivre 1G, chapitre 13.6) ou mettre à niveau le matériel du poste de consultation.
**Vérification :** Image fluide en direct et en relecture depuis le poste concerné.
**Prévention :** Recalculer la bande passante (chapitre 34) à chaque ajout de caméra, jamais supposer qu'un lien existant absorbera indéfiniment une charge croissante.

### Scénario 48 — Bande passante insuffisante

**Symptôme :** Ralentissement général observé lors de la consultation simultanée de plusieurs caméras.
**Causes possibles :** Sous-dimensionnement du lien entre le switch PoE dédié et le NVR/switch cœur.
**Test 1 :** Mesurer le débit agrégé réel de toutes les caméras actives simultanément → **Résultat :** Débit proche de la capacité maximale du lien d'uplink.
**Test 2 :** Comparer ce débit mesuré au calcul théorique du chapitre 34 → **Résultat :** Cohérent avec le calcul, confirmant que le lien lui-même est simplement sous-dimensionné pour le nombre réel de caméras.
**Diagnostic :** Lien d'uplink insuffisant par rapport au calcul de bande passante (chapitre 34), potentiellement parce que l'uplink initial (chapitre 13.5) a été choisi avant que le nombre final de caméras ne soit confirmé.
**Correction :** Passer l'uplink en SFP+ (10 Gbit/s, chapitre 13.6) si actuellement en cuivre 1 Gbit/s.
**Vérification :** Débit mesuré confortablement sous la nouvelle capacité du lien.
**Prévention :** Toujours dimensionner l'uplink du switch PoE CCTV avec une marge substantielle au-delà du calcul initial (chapitre 13.5, marge de croissance déjà recommandée au chapitre 8).

### Scénario 49 — Caméra inaccessible depuis un VLAN

**Symptôme :** Un poste administrateur du VLAN Management (10) ne parvient pas à accéder directement à l'interface web d'une caméra pour une opération de maintenance.
**Causes possibles :** Comportement **normal et voulu** — l'ACL du chapitre 26.2 restreint le VLAN CCTV à ne communiquer qu'avec le NVR, dans les deux sens si l'ACL est bidirectionnelle, ou en sortie uniquement selon sa configuration exacte.
**Test 1 :** Relire l'ACL appliquée sur la SVI du VLAN 80 (`show access-lists ACL-CCTV-SORTANT`, chapitre 26.2) → **Résultat :** Seul le NVR est autorisé comme destination/source.
**Test 2 :** Confirmer que l'accès direct à une caméra n'est effectivement jamais nécessaire en fonctionnement normal (la configuration passe par le NVR ou une intervention physique temporaire, chapitre 35) → **Résultat :** Confirme que ce comportement est intentionnel, pas une panne.
**Diagnostic :** Fonctionnement normal du cloisonnement de sécurité conçu depuis le chapitre 11.2 — **pas un dysfonctionnement à corriger**.
**Correction :** Si un accès de maintenance ponctuel est réellement nécessaire, le réaliser depuis un poste temporairement placé sur le VLAN CCTV lui-même (accès physique local), jamais en assouplissant l'ACL de façon permanente pour un besoin ponctuel.
**Vérification :** —
**Prévention :** Documenter explicitement ce comportement attendu dans la documentation finale du client (chapitre 49), pour qu'il ne soit jamais rapporté à tort comme un incident par une future équipe technique qui découvrirait ce cloisonnement sans en connaître l'origine.

### Scénario 50 — Perte d'un NVR

**Symptôme :** Panne matérielle complète du NVR.
**Causes possibles :** Défaillance matérielle catastrophique (même nature que le scénario 40, appliquée ici spécifiquement au NVR).
**Test 1 :** Confirmer l'absence de possibilité de remise en service sur place → **Résultat :** Remplacement matériel nécessaire.
**Test 2 :** Vérifier la disponibilité des exports de sauvegarde des séquences critiques (chapitre 36.8) → **Résultat :** Exports disponibles jusqu'à la dernière sauvegarde réussie ; tout enregistrement postérieur à cette dernière sauvegarde et non encore exporté est définitivement perdu.
**Diagnostic :** Remplacement matériel nécessaire, avec une perte de données limitée à la fenêtre entre la dernière sauvegarde et la panne.
**Correction :** Installer un NVR de remplacement, réinitialiser le RAID (chapitre 36.2), réajouter chaque caméra (chapitre 36.3), reconfigurer intégralement calendriers/utilisateurs/permissions (chapitre 36, étapes 4-7) — un processus long, soulignant l'intérêt de conserver la configuration documentée à jour (chapitre 49) pour accélérer cette reconstruction.
**Vérification :** Toutes les caméras du projet à nouveau visibles, enregistrant, avec les mêmes permissions utilisateurs qu'avant la panne.
**Prévention :** Réduire la fenêtre de perte de données possible en resserrant la fréquence des exports critiques (chapitre 36.8) — un arbitrage entre le coût de stockage externe et la tolérance du client à une perte de données limitée en cas de panne catastrophique.

*Fin du Volume 14 (50 scénarios de dépannage). Chapitre suivant : nomenclature, plan de câblage et plan de ports — premier chapitre du Volume 15, consacré à la méthodologie de projet.*
