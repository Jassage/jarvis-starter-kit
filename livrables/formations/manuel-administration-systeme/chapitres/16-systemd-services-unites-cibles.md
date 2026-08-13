<div class="chapitre-titre-num">CHAPITRE 16</div>

# systemd : services, unités, cibles

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre systemd, le système d'initialisation et de gestion de services au cœur de la quasi-totalité des distributions Linux modernes. À la fin de ce chapitre, tu sauras démarrer, arrêter, activer au démarrage et diagnostiquer un service avec `systemctl`, consulter ses journaux avec `journalctl`, et créer une unité systemd simple pour un service maison — une compétence directement transposable au runbook de messagerie du chapitre 3, qui utilisait déjà `systemctl` sans l'expliquer en détail.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Nginx et PostgreSQL, installés au chapitre précédent, tournent normalement sur le serveur du portail client. Un matin, le développeur t'appelle : l'application ne répond plus depuis le redémarrage du serveur effectué la veille pour une mise à jour de sécurité. Tu te connectes et découvres que PostgreSQL ne s'est pas relancé automatiquement après le redémarrage, contrairement à Nginx. <em>"Pourquoi l'un redémarre tout seul et pas l'autre ?"</em> te demande le développeur. La réponse se trouve entièrement dans la configuration systemd de chaque service — exactement le sujet de ce chapitre.
</div>

## 16.1 Qu'est-ce que systemd

**systemd** est le premier processus démarré par le noyau Linux (PID 1) sur la quasi-totalité des distributions modernes (Ubuntu, Debian, RHEL, Rocky Linux, et bien d'autres). Il démarre et supervise l'ensemble des services du système, gère leurs dépendances entre eux, et détermine ce qui doit démarrer automatiquement au boot.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — le chef d'orchestre du démarrage</span>
Si le démarrage d'un serveur Linux était un orchestre, systemd serait le chef d'orchestre : il ne joue d'aucun instrument lui-même (il ne fait pas le travail des services), mais il sait exactement quel musicien (service) doit entrer en jeu, dans quel ordre, et quoi faire si l'un d'eux s'arrête de jouer en plein concert (un crash inattendu) — le redémarrer automatiquement, ou laisser le silence si ce n'était pas prévu.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Une **unité** (*unit*) est la brique de base que systemd gère — le type le plus courant étant l'unité de <strong>service</strong> (<code>.service</code>), qui décrit comment démarrer, arrêter et superviser un programme précis (Nginx, PostgreSQL...). D'autres types d'unités existent (montages, minuteurs, sockets), mais les services couvrent la grande majorité des besoins quotidiens d'un administrateur système.
</div>

## 16.2 Les commandes essentielles de `systemctl`

```
# Voir l'etat actuel d'un service (actif, en erreur, arrete...)
systemctl status postgresql

# Demarrer un service immediatement (sans effet sur le prochain boot)
sudo systemctl start postgresql

# Arreter un service immediatement
sudo systemctl stop postgresql

# Redemarrer un service (arret puis demarrage, utile apres un changement
# de configuration)
sudo systemctl restart postgresql

# Recharger la configuration d'un service SANS l'arreter completement,
# quand le service le supporte (utile pour ne jamais interrompre les
# connexions actives, ex. Nginx)
sudo systemctl reload nginx

# Activer un service au demarrage automatique du systeme (sans le
# demarrer immediatement)
sudo systemctl enable postgresql

# Desactiver le demarrage automatique (sans arreter le service actuel)
sudo systemctl disable postgresql

# Verifier si un service est active au demarrage
systemctl is-enabled postgresql
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ La confusion la plus fréquente : `start` vs `enable`</span>
C'est exactement la cause du problème du scénario d'ouverture. <code>start</code> démarre un service **maintenant**, mais n'a aucun effet sur les redémarrages futurs du serveur. <code>enable</code> configure un service pour qu'il démarre **automatiquement à chaque prochain démarrage du système**, sans le démarrer immédiatement si ce n'est pas déjà fait. Un service démarré manuellement avec <code>start</code> mais jamais activé avec <code>enable</code> ne survivra à aucun redémarrage futur — très probablement la cause exacte du problème rencontré par le développeur.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — toujours combiner `start` et `enable` pour un service de production</span>
Pour un service censé tourner en permanence en production (comme PostgreSQL ou Nginx), la commande <code>sudo systemctl enable --now postgresql</code> combine les deux actions en une seule : elle démarre le service immédiatement ET l'active pour tous les futurs démarrages, éliminant le risque d'oublier l'une des deux étapes.
</div>

## 16.3 Diagnostiquer le scénario d'ouverture

```
# Verifier si PostgreSQL est actif maintenant
systemctl status postgresql

# Verifier si PostgreSQL est configure pour demarrer automatiquement
systemctl is-enabled postgresql
```

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : "un service ne redémarre pas après un redémarrage du serveur"</span>

- **Diagnostic** : vérifier en priorité si le service est réellement **activé** (<code>enabled</code>) au démarrage, pas seulement s'il fonctionne actuellement — exactement la distinction de la section 16.2.
- **Comment vérifier** : <code>systemctl is-enabled nom-du-service</code> renvoie <code>enabled</code> ou <code>disabled</code> sans ambiguïté.
- **Résolution** : si le service est <code>disabled</code>, l'activer avec <code>systemctl enable</code> puis le démarrer avec <code>systemctl start</code> (ou les deux en une commande, section 16.2). Si le service est déjà correctement <code>enabled</code> mais ne démarre quand même pas, le problème est ailleurs (erreur de configuration, dépendance manquante) — à investiguer via les journaux, section 16.5.
</div>

## 16.4 Créer une unité systemd pour un service maison

Le développeur du scénario d'ouverture a également écrit un petit script Python qui doit tourner en permanence en arrière-plan. Plutôt que de le lancer manuellement (et de perdre le bénéfice de la supervision automatique de systemd), une unité dédiée peut être créée :

```ini
# Fichier : /etc/systemd/system/portail-worker.service

[Unit]
Description=Worker de traitement asynchrone du portail client
After=network.target postgresql.service

[Service]
Type=simple
User=portail
ExecStart=/usr/bin/python3 /opt/portail/worker.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Explication des lignes clés</span>
<code>After=</code> déclare une dépendance d'ordre : ce service ne démarrera qu'après le réseau et PostgreSQL, évitant une erreur de connexion à la base de données au tout premier instant du démarrage. <code>Restart=on-failure</code> relance automatiquement le service s'il se termine de façon anormale (crash) — un comportement de résilience que systemd offre gratuitement, sans qu'aucune ligne de code supplémentaire ne soit nécessaire dans le script Python lui-même. <code>User=portail</code> applique directement le principe du moindre privilège (chapitre 1) : ce service ne tourne jamais en tant que root sans raison.
</div>

```
# Apres creation ou modification d'un fichier d'unite, systemd doit
# etre informe du changement avant que la nouvelle unite soit utilisable
sudo systemctl daemon-reload

# Puis activer et demarrer normalement, comme tout autre service
sudo systemctl enable --now portail-worker
```

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — ne jamais faire tourner un service applicatif en tant que root par défaut</span>
Un service qui n'a besoin d'aucun privilège administratif particulier (comme ce worker Python) ne doit jamais tourner sous le compte root — s'il est un jour compromis (faille dans le code applicatif, dépendance vulnérable), l'impact reste limité aux permissions du compte dédié <code>portail</code>, plutôt qu'un accès total et immédiat à l'ensemble du système. La création de comptes de service dédiés est approfondie au chapitre 18.
</div>

## 16.5 Consulter les journaux avec `journalctl`

systemd centralise les journaux de tous les services qu'il gère dans un système unifié, consultable via `journalctl` — bien plus pratique que de chercher des fichiers de log épars à travers le système.

```
# Voir les journaux d'un service precis
journalctl -u postgresql

# Suivre les journaux en temps reel (utile pendant un diagnostic actif,
# equivalent de "tail -f" applique aux journaux systemd)
journalctl -u nginx -f

# Voir uniquement les journaux depuis le dernier demarrage du systeme
journalctl -u postgresql -b

# Voir les 50 dernieres lignes uniquement
journalctl -u postgresql -n 50
```

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance — un point d'entrée unique pour tous les journaux</span>
Avant systemd et journalctl, chaque service pouvait écrire ses journaux dans un emplacement et un format différents, rendant le diagnostic d'un problème impliquant plusieurs services simultanément particulièrement fastidieux. `journalctl` centralise tout, avec un filtrage cohérent par service, par période, ou par niveau de gravité — un gain de temps concret lors de tout diagnostic d'incident (chapitre 2).
</div>

## Atelier — Corriger et fiabiliser le service PostgreSQL

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 16 — Résoudre le problème du scénario d'ouverture</span>

**Objectif** : appliquer directement les commandes de ce chapitre pour diagnostiquer et corriger le problème rencontré par le développeur.

**Préparation** : accès à un serveur Linux de test avec un service installé (PostgreSQL ou tout autre service via `systemctl`), ou une lecture attentive suffit pour cet atelier conceptuel.

**Étapes détaillées** :

1. Rédige la commande pour vérifier si PostgreSQL est actuellement actif.
2. Rédige la commande pour vérifier si PostgreSQL est activé au démarrage automatique.
3. En supposant que la seconde commande révèle que le service n'est pas activé, rédige la commande corrective en une seule ligne.
4. Propose une explication en 2-3 phrases à donner au développeur sur la cause réelle du problème.
5. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : `systemctl status postgresql` confirme l'état actuel ; `systemctl is-enabled postgresql` révèle probablement `disabled` (l'installation initiale via `apt install`, chapitre 15, active généralement les services automatiquement par défaut — mais une configuration manuelle antérieure a pu désactiver cette activation sans que personne ne le remarque). La commande corrective est `sudo systemctl enable --now postgresql`. L'explication au développeur reprend la distinction centrale de la section 16.2 : démarrer un service et l'activer au démarrage automatique sont deux actions distinctes, et seule la seconde garantit sa survie à un redémarrage du serveur.

**Dépannage** : si le service reste inactif même après `enable --now`, consulte immédiatement `journalctl -u postgresql -b` (section 16.5) pour identifier une éventuelle erreur de configuration empêchant réellement le démarrage, indépendamment de la question de l'activation automatique.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — confondre `start` et `enable`</span>
La cause exacte du scénario d'ouverture, déjà détaillée en section 16.2 — l'une des confusions les plus fréquentes et les plus coûteuses chez les débutants Linux.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — oublier `systemctl daemon-reload` après modification d'une unité</span>
Modifier un fichier d'unité systemd sans recharger la configuration de systemd lui-même laisse l'ancienne définition active en mémoire — les changements semblent alors "ne pas fonctionner", alors que le fichier a pourtant été correctement modifié sur le disque.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — faire tourner un service applicatif maison en tant que root par défaut</span>
Rappel de la section 16.4 : sans raison spécifique justifiant un accès root, un service applicatif doit toujours tourner sous un compte dédié à privilèges limités.
</div>

## En entreprise

- **Bonne pratique répandue** : après toute installation ou création de service critique, vérifier systématiquement à la fois son état actuel ET son activation au démarrage — jamais l'un sans l'autre, pour éviter exactement le piège du scénario d'ouverture.
- **Bonne pratique répandue** : documenter (chapitre 3) les unités systemd personnalisées créées pour des services maison, avec leur emplacement et leur raison d'être — un fichier `.service` non documenté, découvert des mois plus tard par quelqu'un d'autre, pose les mêmes questions qu'un compte non documenté du chapitre 3.
- **Erreur classique observée** : un service critique désactivé accidentellement lors d'une intervention de maintenance (par exemple, une commande `disable` exécutée pour un diagnostic temporaire, jamais réactivée ensuite) — la vérification post-changement (chapitre 2) doit inclure une confirmation explicite de l'état d'activation.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence entre `systemctl start` et `systemctl enable` ?"**
Réponse attendue : `start` démarre un service immédiatement, sans effet sur les futurs redémarrages du système ; `enable` configure le service pour démarrer automatiquement à chaque futur démarrage, sans le démarrer immédiatement si ce n'est pas déjà fait. Les deux sont souvent combinées via `enable --now` pour un service de production.

**Q2. "Comment diagnostiquerais-tu un service qui refuse de démarrer ?"**
Réponse attendue : vérifier d'abord son état actuel avec `systemctl status`, qui affiche souvent directement la cause de l'échec ; consulter ensuite `journalctl -u nom-du-service` pour un historique plus détaillé si la cause n'est pas immédiatement claire dans le status.

**Q3. "Pourquoi un service applicatif ne devrait-il pas tourner en tant que root par défaut ?"**
Réponse attendue : en cas de compromission du service (faille applicative, dépendance vulnérable), un compte root compromis donne un accès total et immédiat au système entier, alors qu'un compte de service dédié limite l'impact aux permissions strictement nécessaires à ce service — une application directe du principe du moindre privilège du chapitre 1.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Applique systématiquement `User=` dans chaque unité de service maison créée, avec un compte dédié et sans privilège superflu — un réflexe aussi automatique que la vérification de `enable` pour chaque service critique.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente chaque unité systemd personnalisée créée (chapitre 3), y compris la raison de ses paramètres spécifiques (pourquoi ce `Restart=`, pourquoi cette dépendance `After=`) — des choix qui semblent évidents au moment de la création, mais rarement des mois plus tard.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
`Restart=on-failure` avec un `RestartSec=` raisonnable offre une résilience automatique face à un crash isolé, sans intervention manuelle — mais une boucle de redémarrage en échec permanent (un service qui plante systématiquement dès son démarrage) doit être détectée par la supervision (Partie 10), pas seulement laissée à la merci de tentatives de redémarrage infinies.
</div>

## Résumé du chapitre

- systemd est le système d'initialisation qui démarre, arrête et supervise les services sur la quasi-totalité des distributions Linux modernes.
- `systemctl start` démarre un service maintenant ; `systemctl enable` l'active pour les futurs démarrages — deux actions distinctes, souvent combinées via `enable --now`.
- Une unité systemd personnalisée se crée dans un fichier `.service`, avec des directives comme `After=` (dépendances d'ordre), `Restart=` (résilience automatique) et `User=` (principe du moindre privilège).
- `journalctl -u nom-du-service` centralise et facilite la consultation des journaux d'un service, essentielle en diagnostic d'incident.
- Après toute modification d'un fichier d'unité, `systemctl daemon-reload` est indispensable avant que le changement ne prenne effet.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. `systemctl start postgresql` :
   - a) Active PostgreSQL pour tous les futurs démarrages du système
   - b) Démarre PostgreSQL immédiatement, sans effet sur les futurs redémarrages
   - c) Désactive PostgreSQL
   - d) Supprime PostgreSQL

2. Après avoir modifié un fichier d'unité systemd, la commande à exécuter avant que le changement prenne effet est :
   - a) `systemctl restart`
   - b) `systemctl daemon-reload`
   - c) `systemctl enable`
   - d) `apt update`

3. Pour consulter les journaux d'un service précis, on utilise :
   - a) `systemctl status --logs`
   - b) `journalctl -u nom-du-service`
   - c) `cat /var/log/systemd.log`
   - d) `dnf logs`

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un service démarré avec `systemctl start` redémarre automatiquement après un redémarrage du serveur, même sans `enable`. — **Faux** (c'est exactement la confusion à l'origine du scénario d'ouverture).
2. `journalctl -u nom-du-service -f` permet de suivre les journaux d'un service en temps réel. — **Vrai**.
3. Un service applicatif maison devrait toujours tourner en tant que root par défaut, pour éviter les problèmes de permissions. — **Faux** (l'inverse est recommandé, un compte dédié limite l'impact d'une compromission).
4. `enable --now` combine l'activation au démarrage et le démarrage immédiat en une seule commande. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi `Restart=on-failure` dans une unité systemd ne remplace pas une supervision proactive (chapitre 1).
2. Reprends le scénario d'ouverture. Propose une vérification systématique à ajouter à tout runbook de redémarrage de serveur (chapitre 3) pour éviter que ce problème ne se reproduise.

**Corrigé 1** : `Restart=on-failure` relance automatiquement un service après un crash isolé, mais un service qui échoue de façon répétée et systématique (une boucle de redémarrage en échec permanent) continuera d'échouer indéfiniment sans jamais alerter personne activement — seule une supervision proactive (Partie 10) peut détecter ce type de dégradation et alerter une personne humaine, la relance automatique n'étant qu'un filet de sécurité de premier niveau, pas une garantie de bon fonctionnement réel.

**Corrigé 2** : j'ajouterais une étape explicite au runbook de redémarrage de serveur : "Après tout redémarrage planifié, vérifier avec `systemctl is-enabled` et `systemctl status` que chaque service critique attendu est bien actif et activé, avant de considérer le redémarrage terminé" — une vérification simple qui aurait immédiatement révélé le problème de PostgreSQL avant même que le développeur ne le signale, plutôt que de découvrir le problème après coup via un incident utilisateur.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 16.1</span>

Explique pourquoi la directive `After=network.target postgresql.service` dans l'unité `portail-worker.service` de la section 16.4 est importante, et ce qui pourrait se passer sans elle.
</div>

**Corrigé :** Sans cette directive, systemd pourrait démarrer le worker Python avant que le réseau ou PostgreSQL ne soient pleinement opérationnels, provoquant une erreur de connexion à la base de données au tout premier lancement du service au démarrage du système — un échec qui n'aurait rien à voir avec un bug du code applicatif lui-même, mais uniquement avec un mauvais ordre de démarrage. La directive `After=` garantit que ce service attend que ses dépendances soient prêtes avant de tenter de démarrer.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 16.2</span>

Rédige, en 3 à 5 phrases, pourquoi centraliser les journaux via `journalctl` plutôt que de chercher des fichiers de log épars facilite le diagnostic d'un incident impliquant plusieurs services (comme un problème de connexion entre le worker Python et PostgreSQL).
</div>

**Corrigé (exemple de réponse) :** Avec `journalctl`, il est possible de filtrer et de comparer les journaux de plusieurs services (le worker et PostgreSQL) sur la même période exacte, sans devoir localiser et ouvrir manuellement plusieurs fichiers de log dans des emplacements et des formats potentiellement différents. Cela permet de corréler rapidement les événements — par exemple, voir si une erreur de connexion côté worker correspond exactement à un redémarrage ou une erreur côté PostgreSQL au même instant — un gain de temps direct sur le MTTR évoqué au chapitre 2, particulièrement précieux lors d'un incident impliquant l'interaction entre plusieurs services.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends le rôle de systemd comme système d'initialisation et de supervision de services.</li>
<li>☐ Je sais utiliser `systemctl start`, `stop`, `restart`, `reload`, `enable`, `disable`.</li>
<li>☐ Je comprends la différence critique entre `start` et `enable`.</li>
<li>☐ Je sais créer une unité systemd simple pour un service maison, avec `After=`, `Restart=` et `User=`.</li>
<li>☐ Je sais consulter les journaux d'un service avec `journalctl -u`.</li>
<li>☐ Je sais pourquoi `daemon-reload` est nécessaire après modification d'une unité.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Tous les services installés via `apt` ou `dnf` sont-ils automatiquement activés au démarrage ?</dt>
<dd>Généralement oui pour les services destinés à tourner en permanence (comme PostgreSQL ou Nginx), mais ce n'est pas une garantie universelle absolue — une vérification explicite avec `systemctl is-enabled` reste la seule façon de le confirmer avec certitude, plutôt que de le supposer.</dd>

<dt>Que se passe-t-il si deux unités ont une dépendance circulaire entre elles ?</dt>
<dd>systemd détecte généralement ce type de configuration incohérente et refuse de démarrer les unités concernées avec une erreur explicite plutôt qu'un blocage silencieux — un signe qu'il faut revoir la logique de dépendances (`After=`/`Requires=`) de l'une des deux unités.</dd>

<dt>`reload` est-il toujours préférable à `restart` pour appliquer un changement de configuration ?</dt>
<dd>Non, cela dépend du service : `reload` évite une coupure de service (utile pour Nginx, qui recharge sa configuration sans interrompre les connexions actives), mais tous les services ne supportent pas cette fonctionnalité — dans ce cas, `restart` reste nécessaire, avec une brève interruption à anticiper dans une fenêtre de maintenance si le service est critique (chapitre 2).</dd>

<dt>Peut-on limiter les ressources (CPU, mémoire) qu'un service systemd peut consommer ?</dt>
<dd>Oui, via des directives comme `MemoryMax=` ou `CPUQuota=` dans la section `[Service]` d'une unité — un sujet utile pour éviter qu'un service défaillant ne monopolise toutes les ressources du serveur, approfondi dans le contexte plus large de la supervision (Partie 10).</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle systemd (freedesktop.org) : [https://www.freedesktop.org/software/systemd/man/systemd.html](https://www.freedesktop.org/software/systemd/man/systemd.html)
- Red Hat — Gestion des services système avec systemctl : [https://access.redhat.com/documentation/fr-fr/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/managing-systemd_configuring-basic-system-settings](https://access.redhat.com/documentation/fr-fr/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/managing-systemd_configuring-basic-system-settings)
- Documentation officielle journalctl : [https://www.freedesktop.org/software/systemd/man/journalctl.html](https://www.freedesktop.org/software/systemd/man/journalctl.html)

*Chapitre suivant : le stockage Linux — partitionnement, LVM et RAID logiciel, pour comprendre comment les données sont réellement organisées sur les disques d'un serveur Linux.*
