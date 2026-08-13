<div class="chapitre-titre-num">CHAPITRE 45</div>

# Scénarios 31-40 : serveurs, supervision et sauvegarde

## Objectifs pédagogiques

Dix scénarios de dépannage couvrant la disponibilité des serveurs, le stockage, l'alimentation de secours et les sauvegardes.

## Prérequis

Chapitre 44.

### Scénario 31 — Serveur inaccessible

**Symptôme :** Un serveur ne répond plus, aucun service qu'il héberge ne fonctionne.
**Causes possibles :** Panne matérielle, service réseau arrêté, adresse IP en conflit.
**Test 1 :** `ping 10.10.30.10` → **Résultat :** Échec total.
**Test 2 :** Accès console/iDRAC/iLO (accès de gestion matérielle hors bande, indépendant du réseau de production) → **Résultat :** Serveur éteint ou figé (écran bleu, kernel panic).
**Diagnostic :** Panne système complète, pas un simple problème réseau.
**Correction :** Redémarrage contrôlé ; investiguer la cause première (journaux système) après redémarrage plutôt que de l'ignorer une fois le service rétabli.
**Vérification :** `ping` réussit, tous les services hébergés confirmés opérationnels.
**Prévention :** Superviser activement (chapitre 38) pour détecter un serveur qui montre des signes de dégradation avant une panne complète.

### Scénario 32 — Serveur DNS arrêté

**Symptôme :** Résolution de noms interne totalement en panne (scénario proche du 4, mais confirmé ici comme un arrêt de service, pas un problème réseau).
**Causes possibles :** Service `DNS` arrêté sur SRV-01 (redémarrage inattendu, mise à jour ayant échoué).
**Test 1 :** `Get-Service DNS` sur SRV-01 → **Résultat :** `Stopped`.
**Test 2 :** Journal d'événements Windows (`Get-EventLog System -Newest 20`) → **Résultat :** Trace d'un arrêt inattendu ou d'une erreur au démarrage du service.
**Diagnostic :** Service arrêté, cause à investiguer dans les journaux avant de simplement le relancer sans comprendre pourquoi il s'est arrêté.
**Correction :** `Start-Service DNS`, puis investiguer la cause trouvée dans les journaux.
**Vérification :** `Resolve-DnsName` réussit à nouveau.
**Prévention :** Alerte de supervision immédiate sur l'arrêt du service DNS (chapitre 38, un service aussi critique mérite une alerte de sévérité maximale).

### Scénario 33 — Service Linux arrêté

**Symptôme :** L'intranet (Nginx, SRV-02) n'est plus accessible.
**Causes possibles :** Service Nginx arrêté ou en échec après une modification de configuration invalide.
**Test 1 :** `sudo systemctl status nginx` → **Résultat :** `failed`.
**Test 2 :** `sudo nginx -t` → **Résultat :** Erreur de syntaxe signalée avec le fichier et la ligne précise en cause.
**Diagnostic :** Modification de configuration invalide appliquée sans avoir testé au préalable (chapitre 32.9, règle déjà posée).
**Correction :** Corriger l'erreur de syntaxe identifiée, `sudo nginx -t` de nouveau jusqu'à confirmation, puis `sudo systemctl restart nginx`.
**Vérification :** `systemctl status nginx` affiche `active (running)`, site accessible.
**Prévention :** Ne jamais recharger/redémarrer un service après une modification sans l'avoir testé au préalable quand l'outil le permet (`nginx -t`, chapitre 32.9).

### Scénario 34 — Disque serveur plein

**Symptôme :** Un serveur devient anormalement lent, certains services refusent d'écrire de nouvelles données.
**Causes possibles :** Espace disque épuisé (journaux non purgés, sauvegardes locales accumulées, croissance de données non anticipée).
**Test 1 :** `Get-PSDrive` (Windows) ou `df -h` (Linux) → **Résultat :** Volume à 100 % d'utilisation.
**Test 2 :** Identifier les plus gros consommateurs d'espace (`du -sh /* | sort -rh` sous Linux) → **Résultat :** Un répertoire de journaux ou de sauvegardes locales anormalement volumineux.
**Diagnostic :** Absence de purge automatique des journaux ou des anciennes sauvegardes locales.
**Correction :** Libérer de l'espace immédiatement (purge contrôlée, jamais une suppression aveugle), puis mettre en place une rotation automatique (`logrotate` sous Linux, purge planifiée des anciennes sauvegardes selon la politique de rétention du chapitre 39.4).
**Vérification :** Espace disque revenu à un niveau normal, service de nouveau réactif.
**Prévention :** Alerte de supervision sur un seuil prédictif (85 % d'utilisation, chapitre 38.6), avant l'épuisement complet.

### Scénario 35 — RAID dégradé

**Symptôme :** Une alerte matérielle signale un disque en panne dans un volume RAID (chapitre 16.7).
**Causes possibles :** Panne physique d'un disque — le scénario même pour lequel le RAID a été conçu (chapitre 16.7).
**Test 1 :** Interface de gestion du contrôleur RAID → **Résultat :** Un disque signalé "Failed" ou "Predictive Failure".
**Test 2 :** Vérifier que le volume reste malgré tout accessible → **Résultat :** Oui, en mode dégradé (tolérance de panne du RAID, chapitre 16.7).
**Diagnostic :** Panne d'un disque, absorbée par la redondance RAID — pas une urgence d'arrêt de service, mais une intervention rapide reste nécessaire (un second disque en panne avant remplacement du premier ferait perdre les données, selon le niveau RAID).
**Correction :** Remplacer le disque en panne dès que possible ; le contrôleur RAID reconstruit automatiquement les données sur le nouveau disque.
**Vérification :** Statut du volume RAID revenu à "Optimal"/"Healthy" après reconstruction.
**Prévention :** Alerte de supervision immédiate sur tout changement d'état RAID (chapitre 38), jamais découvert par hasard des semaines plus tard.

### Scénario 36 — UPS en alerte

**Symptôme :** L'onduleur (UPS, chapitre 18.5) signale une alerte.
**Causes possibles :** Coupure secteur en cours (fonctionnement sur batterie), batterie interne de l'UPS en fin de vie, surcharge de l'UPS.
**Test 1 :** Interface de gestion de l'UPS → **Résultat :** Alerte précise identifiée ("On Battery", "Battery Replacement Needed", "Overload").
**Test 2 :** Vérifier l'alimentation secteur du local technique → **Résultat :** Confirme ou infirme une coupure secteur réelle.
**Diagnostic :** Selon le résultat — coupure secteur réelle (rien d'anormal côté UPS lui-même), batterie à remplacer, ou surcharge (renvoi au calcul de dimensionnement du chapitre 18.5, un équipement ajouté depuis sans recalcul).
**Correction :** Selon la cause : attendre le retour du secteur (le rôle même de l'UPS), remplacer la batterie, ou redistribuer la charge/changer de modèle si surcharge confirmée.
**Vérification :** Statut UPS revenu à "Online"/"Normal".
**Prévention :** Recalcul systématique du dimensionnement UPS (chapitre 18.5) à chaque ajout d'équipement dans la baie.

### Scénario 37 — Température élevée

**Symptôme :** Alerte de température élevée dans le local technique ou sur un équipement précis.
**Causes possibles :** Climatisation en panne, ventilation d'un équipement obstruée, sens de ventilation incohérent entre équipements (chapitre 18.9).
**Test 1 :** Thermomètre du local technique → **Résultat :** Température au-delà de la plage recommandée (18-27°C, chapitre 18).
**Test 2 :** Vérifier l'espace arrière de la baie et le sens de ventilation de chaque équipement (chapitre 18.9) → **Résultat :** Obstruction ou équipement mal orienté identifié.
**Diagnostic :** Selon le résultat — panne de climatisation (cause externe au réseau) ou problème d'installation en baie.
**Correction :** Réparer/ajuster la climatisation, ou dégager l'espace de ventilation/réorganiser les équipements mal orientés.
**Vérification :** Température revenue dans la plage normale sur plusieurs heures d'observation.
**Prévention :** Vérification systématique du sens de ventilation avant l'achat de tout nouvel équipement (chapitre 18.9), pas seulement à l'installation.

### Scénario 38 — Sauvegarde échouée

**Symptôme :** Le rapport de sauvegarde planifiée (chapitre 39) signale un échec.
**Causes possibles :** Espace insuffisant sur la destination, service de sauvegarde arrêté, verrou sur un fichier empêchant sa copie.
**Test 1 :** Consulter le journal détaillé de l'échec (Windows Server Backup ou le journal cron/tar) → **Résultat :** Message d'erreur précis (souvent "espace insuffisant" ou "fichier verrouillé").
**Test 2 :** Vérifier l'espace disponible sur la destination de sauvegarde → **Résultat :** Confirme ou infirme la cause.
**Diagnostic :** Selon le message d'erreur précis retrouvé — jamais une simple relance sans en comprendre la cause.
**Correction :** Libérer de l'espace, ou ajuster la planification pour éviter un conflit de verrou de fichier (fenêtre horaire différente).
**Vérification :** Sauvegarde relancée manuellement, confirmée réussie.
**Prévention :** Alerte de supervision immédiate sur tout échec de sauvegarde (chapitre 38), jamais découvert seulement au moment où une restauration devient nécessaire.

### Scénario 39 — Restauration échouée

**Symptôme :** Un test de restauration planifié (chapitre 39.6) échoue.
**Causes possibles :** Sauvegarde source elle-même corrompue, incompatibilité de version entre l'outil de sauvegarde et de restauration, procédure de restauration mal documentée.
**Test 1 :** Tenter la restauration d'un point de sauvegarde antérieur → **Résultat :** Succès ou échec identique.
**Test 2 :** Si l'échec persiste sur plusieurs points de sauvegarde, vérifier l'intégrité du mécanisme de sauvegarde lui-même (pas seulement un fichier isolé corrompu) → **Résultat :** Identifie si le problème est ponctuel ou systémique.
**Diagnostic :** Un échec sur un seul point isolé suggère une corruption ponctuelle ; un échec systémique sur plusieurs points suggère un problème de configuration du mécanisme de sauvegarde lui-même, resté non détecté jusqu'à ce test.
**Correction :** Selon le cas — ignorer le point isolé corrompu (les points suivants restant valides) ou reconfigurer entièrement le mécanisme de sauvegarde si le problème est systémique.
**Vérification :** Une restauration complète réussit et est vérifiée par relecture du contenu (chapitre 39.6).
**Prévention :** C'est précisément la raison d'être du test de restauration trimestriel (chapitre 39.6) — détecter ce problème **avant** qu'une vraie urgence ne le révèle.

### Scénario 40 — Perte d'un serveur

**Symptôme :** Panne matérielle complète et définitive d'un serveur (carte mère, alimentation grillée de façon irréparable sur place).
**Causes possibles :** Défaillance matérielle catastrophique.
**Test 1 :** Confirmer qu'aucune remise en service sur place n'est possible (diagnostic matériel) → **Résultat :** Panne confirmée irréparable sans intervention constructeur/remplacement.
**Test 2 :** Vérifier la disponibilité de la dernière sauvegarde testée (chapitre 39.6) → **Résultat :** Sauvegarde disponible et déjà confirmée restaurable par un test antérieur.
**Diagnostic :** Remplacement matériel nécessaire.
**Correction :** Installer un serveur de remplacement, restaurer depuis la dernière sauvegarde valide, reconfigurer l'adressage réseau (chapitre 11) à l'identique de l'ancien serveur.
**Vérification :** Tous les services précédemment hébergés confirmés opérationnels sur le nouveau matériel.
**Prévention :** Ce scénario est précisément celui pour lequel la politique de sauvegarde du chapitre 39 (règle 3-2-1, tests de restauration réguliers) a été conçue — la rapidité de récupération dépend directement de la rigueur avec laquelle cette politique a été appliquée en amont.

*Chapitre suivant : les 10 derniers scénarios de dépannage — vidéosurveillance et pannes matérielles.*
