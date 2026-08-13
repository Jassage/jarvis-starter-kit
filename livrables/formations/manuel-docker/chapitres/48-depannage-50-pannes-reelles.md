# Chapitre 48 — Dépannage : catalogue de 50 pannes réelles

**Niveau : Toutes les phases précédentes**

---

## Introduction

Dernier chapitre du corps du manuel. Chaque scénario suit la même méthode, appliquée 50 fois : Symptôme → Causes possibles → Commandes de diagnostic → Interprétation → Correction → Vérification → Prévention. Rien ici n'est nouveau sur le plan conceptuel — chaque solution renvoie au chapitre qui l'a déjà enseignée. Ce chapitre est un **index de rappel rapide**, pas un nouveau cours.

---

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras :
- reconnaître 50 pannes réelles et fréquentes, sans paniquer face à un message d'erreur inconnu ;
- appliquer une méthode de diagnostic systématique plutôt que d'essayer des corrections au hasard ;
- retrouver, pour chaque panne, le chapitre exact qui explique le mécanisme sous-jacent en profondeur.

## 📋 Prérequis

L'intégralité des chapitres précédents — ce chapitre n'introduit aucun concept nouveau, il les indexe.

## La méthode générale, avant le catalogue

```text
1. LIRE l'erreur en entier, mot par mot — ne jamais la survoler
2. CONSULTER LES LOGS en premier réflexe (chapitre 22)
3. ISOLER : quel service précis est en cause (docker compose ps, chapitre 21)
4. FORMULER une hypothèse précise, jamais "essayer au hasard"
5. VÉRIFIER l'hypothèse avec UNE commande ciblée
6. CORRIGER, puis VÉRIFIER que la correction a réellement fonctionné
```

---

## A — Installation et environnement

**1. `docker: command not found`**
*Symptôme :* la commande `docker` est introuvable dans le terminal.
*Causes possibles :* Docker non installé, ou terminal non rechargé après l'installation.
*Diagnostic :* `docker --version`
*Interprétation :* si la commande échoue totalement, l'installation n'a jamais réussi ou le `PATH` n'est pas à jour.
*Correction :* reprendre le chapitre 3, section correspondant à l'OS.
*Vérification :* `docker run hello-world` réussit.
*Prévention :* toujours terminer l'installation par les trois commandes de vérification du chapitre 3, section 3.5.

**2. Docker Desktop reste bloqué sur "Starting..."**
*Symptôme :* l'icône baleine ne devient jamais stable (Windows/macOS).
*Causes possibles :* virtualisation désactivée dans le BIOS, ressources système insuffisantes.
*Diagnostic :* Gestionnaire des tâches → Performance → CPU → "Virtualisation" (Windows).
*Interprétation :* si "Désactivée", Docker Desktop ne peut jamais démarrer complètement.
*Correction :* activer la virtualisation dans le BIOS (procédure propre au fabricant), redémarrer.
*Vérification :* Docker Desktop affiche "Running".
*Prévention :* vérifier la virtualisation avant même de tenter l'installation (chapitre 3, section 3.2).

**3. `wsl --list --verbose` affiche `VERSION 1` au lieu de `2`**
*Symptôme :* Docker Desktop échoue à démarrer ou fonctionne de façon instable sous Windows.
*Causes possibles :* conversion automatique en WSL 2 non effectuée.
*Diagnostic :* `wsl --list --verbose`
*Interprétation :* WSL 1 est incompatible avec le fonctionnement normal de Docker Desktop.
*Correction :* `wsl --set-version Ubuntu 2` (chapitre 3, section 3.2).
*Vérification :* la commande affiche `VERSION 2`.
*Prévention :* vérifier explicitement cette valeur juste après l'installation initiale de WSL.

**4. `permission denied while trying to connect to the Docker daemon socket` (Linux)**
*Symptôme :* toute commande `docker` échoue sans `sudo`.
*Causes possibles :* utilisateur non ajouté au groupe `docker`, ou session non rechargée.
*Diagnostic :* `groups $USER`
*Interprétation :* si `docker` n'apparaît pas dans la liste, l'appartenance au groupe n'est pas effective.
*Correction :* `sudo usermod -aG docker $USER && newgrp docker` (chapitre 3, section 3.3).
*Vérification :* `docker ps` fonctionne sans `sudo`.
*Prévention :* toujours vérifier cette étape à la fin d'une installation Linux, avant de continuer.

---

## B — Images et conteneurs

**5. `Unable to find image` / `pull access denied`**
*Symptôme :* `docker run`/`docker pull` échoue à trouver une image.
*Causes possibles :* nom ou tag mal orthographié, image privée sans authentification (chapitre 27).
*Diagnostic :* `docker search nom-image` ou vérification manuelle sur Docker Hub.
*Interprétation :* `pull access denied` sur une image privée signifie une authentification manquante ou insuffisante.
*Correction :* corriger l'orthographe, ou `docker login` (chapitre 27, section 27.1).
*Vérification :* `docker pull` réussit.
*Prévention :* toujours copier-coller le nom exact d'une image plutôt que de le retaper.

**6. `port is already allocated`**
*Symptôme :* `docker run -p` échoue au démarrage.
*Causes possibles :* un autre conteneur ou programme utilise déjà ce port hôte.
*Diagnostic :* `docker ps --filter "publish=PORT"` (chapitre 8, section 8.4)
*Interprétation :* le port cible est déjà occupé.
*Correction :* choisir un autre port hôte, ou arrêter le conteneur en conflit.
*Vérification :* le nouveau `docker run` réussit.
*Prévention :* systématiser une convention de ports par projet pour éviter les collisions.

**7. Conteneur `Exited` juste après démarrage**
*Symptôme :* `docker ps` ne montre rien, `docker ps -a` montre `Exited`.
*Causes possibles :* processus principal terminé (normal pour un script ponctuel) ou erreur au démarrage.
*Diagnostic :* `docker logs nom-conteneur` (chapitre 22)
*Interprétation :* un code `0` avec un script ponctuel est normal (chapitre 7) ; un code différent avec une erreur dans les logs signale un vrai problème.
*Correction :* corriger l'erreur indiquée dans les logs.
*Vérification :* le conteneur reste `Up` après correction et redémarrage.
*Prévention :* toujours tester en mode attaché (`docker run` sans `-d`) avant un premier déploiement, pour voir les erreurs immédiatement.

**8. Conteneur en boucle de redémarrage (restart loop)**
*Symptôme :* `docker ps` montre `Restarting` en continu.
*Causes possibles :* politique `restart: always`/`on-failure` combinée à un crash systématique de l'application.
*Diagnostic :* `docker logs --tail 50 nom-conteneur`
*Interprétation :* l'application plante à chaque tentative, pour une cause visible dans les logs (config manquante, dépendance indisponible).
*Correction :* corriger la cause racine du crash, jamais seulement retirer la politique de redémarrage.
*Vérification :* le conteneur reste stable en `Up` sans redémarrage.
*Prévention :* toujours tester une image avant de la déployer avec une politique de redémarrage automatique.

**9. Application inaccessible malgré un conteneur `Up`**
*Symptôme :* `docker ps` montre `Up`, mais aucune réponse HTTP.
*Causes possibles :* port non publié, application liée à `127.0.0.1` au lieu de `0.0.0.0` à l'intérieur du conteneur.
*Diagnostic :* `docker port nom-conteneur` (chapitre 8, section 8.2)
*Interprétation :* si aucun mapping n'apparaît, `-p` a été omis ; si un mapping existe mais rien ne répond, l'application écoute peut-être sur la mauvaise interface interne.
*Correction :* ajouter `-p`, ou corriger l'adresse d'écoute de l'application (`0.0.0.0`, pas `localhost`).
*Vérification :* `curl` depuis l'hôte répond.
*Prévention :* toujours vérifier ces deux points ensemble lors d'un premier déploiement.

**10. Mauvais port utilisé (confusion hôte/conteneur)**
*Symptôme :* l'application répond sur un port inattendu, ou pas du tout au port testé.
*Causes possibles :* inversion de l'ordre `hôte:conteneur` dans `-p` (chapitre 8, section 8.1).
*Diagnostic :* `docker port nom-conteneur`
*Interprétation :* confirme le mapping réel, souvent différent de ce qui était supposé.
*Correction :* corriger l'ordre exact dans `-p`.
*Vérification :* le port attendu répond bien.
*Prévention :* toujours se rappeler : le premier nombre est celui tapé dans le navigateur.

---

## C — Réseau Docker

**11. Deux conteneurs ne se trouvent pas malgré un même projet**
*Symptôme :* `ping`/connexion entre deux conteneurs échoue.
*Causes possibles :* conteneurs sur des réseaux Docker différents.
*Diagnostic :* `docker network inspect nom-reseau` (chapitre 11, section 11.2)
*Interprétation :* si l'un des deux conteneurs n'apparaît pas dans la liste, il est sur un autre réseau.
*Correction :* rattacher les deux au même réseau (`docker network connect`, ou vérifier la configuration Compose).
*Vérification :* `ping` réussit entre les deux.
*Prévention :* toujours utiliser Compose (chapitre 12) plutôt que des `docker run` manuels pour un projet multi-conteneurs, afin d'éviter cette erreur par construction.

**12. Résolution DNS par nom échoue entre conteneurs**
*Symptôme :* `ping nom-service` échoue avec "bad address".
*Causes possibles :* conteneurs sur le réseau `bridge` par défaut, sans résolution DNS (chapitre 11, section 11.1).
*Diagnostic :* `docker inspect nom-conteneur --format "{{.HostConfig.NetworkMode}}"`
*Interprétation :* `bridge` (le réseau par défaut) confirme l'absence de DNS interne.
*Correction :* créer et utiliser un réseau personnalisé.
*Vérification :* `ping` par nom réussit.
*Prévention :* ne jamais utiliser le réseau `bridge` par défaut pour une application à plusieurs conteneurs.

**13. Volume non monté (données absentes au démarrage)**
*Symptôme :* une base de données démarre "vide" alors que des données étaient attendues.
*Causes possibles :* volume mal nommé, chemin de montage incorrect.
*Diagnostic :* `docker inspect nom-conteneur --format "{{.Mounts}}"` (chapitre 23, section 23.5)
*Interprétation :* compare le chemin réellement monté à celui attendu par l'image (documentation officielle).
*Correction :* corriger le chemin ou le nom du volume dans la commande/Compose.
*Vérification :* les données attendues apparaissent après correction et redémarrage.
*Prévention :* toujours vérifier le chemin exact documenté par chaque image officielle (chapitres 16-17).

---

## D — Volumes et données

**14. Données perdues après suppression d'un conteneur**
*Symptôme :* toutes les données disparaissent après `docker rm`.
*Causes possibles :* aucun volume monté, données vivant uniquement dans la couche inscriptible (chapitre 1, section 1.4 ; chapitre 10, section 10.1).
*Diagnostic :* `docker volume ls` — le volume attendu n'existe pas.
*Interprétation :* confirmation que la persistance n'était jamais réellement assurée.
*Correction :* recréer le conteneur avec un volume correctement monté ; restaurer une sauvegarde si disponible (chapitre 33).
*Vérification :* les données survivent désormais à un `docker rm` suivi d'une recréation.
*Prévention :* jamais de conteneur de base de données sans volume, sans exception (chapitre 10).

---

## E — Bases de données

**15. MySQL ne démarre pas**
*Symptôme :* le conteneur `db` reste `Exited` ou en boucle de redémarrage.
*Causes possibles :* `MYSQL_ROOT_PASSWORD` absente, volume corrompu d'un essai précédent incompatible.
*Diagnostic :* `docker logs nom-conteneur-db` (chapitre 16)
*Interprétation :* le message d'erreur précis (mot de passe manquant, fichiers de données incompatibles) indique la cause exacte.
*Correction :* fournir la variable manquante ; en développement, repartir d'un volume vide si les fichiers sont incompatibles.
*Vérification :* `docker logs` montre "ready for connections".
*Prévention :* toujours fournir `MYSQL_ROOT_PASSWORD` explicitement, jamais compter sur un défaut.

**16. PostgreSQL ne démarre pas**
*Symptôme :* le conteneur `db` échoue au démarrage.
*Causes possibles :* `POSTGRES_PASSWORD` absente (obligatoire, contrairement à MySQL), conflit `PGDATA` (chapitre 17, section 17.2).
*Diagnostic :* `docker logs nom-conteneur-db`
*Interprétation :* PostgreSQL refuse de démarrer sans mot de passe, contrairement à certaines configurations MySQL tolérantes.
*Correction :* fournir `POSTGRES_PASSWORD` ; vérifier `PGDATA` pointant vers un sous-dossier.
*Vérification :* logs affichant "database system is ready to accept connections".
*Prévention :* toujours définir `PGDATA=/var/lib/postgresql/data/pgdata` par précaution (chapitre 17).

**17. Backend ne trouve pas la base de données**
*Symptôme :* `ECONNREFUSED` ou équivalent au démarrage du backend.
*Causes possibles :* mauvais `DB_HOST` (souvent `localhost` utilisé par erreur au lieu du nom du service), base pas encore prête (limite de `depends_on`, chapitre 13, 21).
*Diagnostic :* `docker compose logs backend db`
*Interprétation :* `localhost` dans un conteneur ne désigne jamais un autre conteneur (chapitre 11) ; une erreur au tout premier démarrage peut aussi signaler la limite du chapitre 13.
*Correction :* utiliser le nom du service Compose comme host ; ajouter un healthcheck avec `condition: service_healthy` (chapitre 21).
*Vérification :* connexion réussie, stable à chaque redémarrage.
*Prévention :* toujours utiliser le nom du service, jamais `localhost` ni une IP codée en dur, entre conteneurs.

**18. Migration de base de données échoue**
*Symptôme :* `migrate deploy` (ou équivalent) échoue en production.
*Causes possibles :* migration jamais testée en conditions réelles, conflit avec une modification manuelle du schéma.
*Diagnostic :* lire le message d'erreur exact de l'outil de migration.
*Interprétation :* identifie précisément la table/colonne en conflit.
*Correction :* corriger la migration, ou restaurer une sauvegarde avant de retenter (chapitre 33, 36).
*Vérification :* `migrate deploy` réussit sans erreur, application fonctionnelle.
*Prévention :* toujours sauvegarder avant une migration en production (cycle du chapitre 32, étape "Backup").

---

## F — Frontend et Nginx

**19. React ne trouve pas l'API**
*Symptôme :* les appels `fetch`/`axios` échouent dans le navigateur.
*Causes possibles :* `VITE_API_URL` mal configurée au build (chapitre 15, section 15.4), ou route Nginx incorrecte.
*Diagnostic :* outils de développement du navigateur, onglet réseau — quelle URL exacte est appelée ?
*Interprétation :* une URL absolue vers `localhost:3000` en production, par exemple, révèle une variable de build non adaptée à l'environnement cible.
*Correction :* reconstruire avec la bonne variable, idéalement une URL relative (`/api`, chapitre 20, section 20.4).
*Vérification :* les appels API réussissent depuis le domaine réel.
*Prévention :* toujours utiliser une URL relative quand l'architecture reverse proxy le permet.

**20. Nginx retourne 502 Bad Gateway**
*Symptôme :* Nginx répond, mais avec une erreur 502.
*Causes possibles :* backend arrêté, healthcheck qui empêche `nginx` de trouver `backend` prêt.
*Diagnostic :* `docker compose ps` — le backend est-il `Up`/`healthy` ?
*Interprétation :* 502 signifie que Nginx n'a reçu aucune réponse valide du service en amont.
*Correction :* redémarrer/corriger le backend ; vérifier `depends_on` (chapitre 21).
*Vérification :* la réponse redevient normale.
*Prévention :* toujours healthchecker le backend avant que Nginx ne le sollicite.

**21. Nginx retourne 404**
*Symptôme :* une route existante renvoie 404 via Nginx, mais fonctionne en accès direct au backend.
*Causes possibles :* piège du slash final dans `proxy_pass` (chapitre 19, section 19.3), ou `try_files` absent pour une SPA (chapitre 15, section 15.3).
*Diagnostic :* comparer le chemin réellement transmis au backend (logs, chapitre 22) au chemin attendu.
*Interprétation :* révèle si le préfixe a été supprimé/dupliqué par erreur.
*Correction :* corriger `proxy_pass` ou ajouter `try_files`.
*Vérification :* la route répond normalement via Nginx.
*Prévention :* toujours tester chaque route via le reverse proxy, pas seulement en accès direct au backend.

---

## G — Configuration

**22. Variables `.env` incorrectes ou absentes**
*Symptôme :* l'application démarre avec des valeurs par défaut inattendues, ou plante.
*Causes possibles :* `.env` absent, `--env-file` oublié, mauvais fichier chargé (chapitre 28).
*Diagnostic :* `docker compose config` (affiche la configuration réellement fusionnée, chapitre 28)
*Interprétation :* révèle immédiatement quelles valeurs sont réellement actives.
*Correction :* corriger le fichier `.env` chargé, ou l'option `--env-file`.
*Vérification :* `docker compose config` affiche les bonnes valeurs.
*Prévention :* toujours vérifier `docker compose config` avant un déploiement sensible.

**23. Permission refusée sur un fichier monté (bind mount)**
*Symptôme :* l'application ne peut pas écrire dans un dossier monté.
*Causes possibles :* utilisateur du conteneur (chapitre 6, 26) sans droits suffisants sur le dossier de l'hôte.
*Diagnostic :* `docker exec nom-conteneur whoami` puis comparer aux permissions du dossier hôte.
*Interprétation :* un utilisateur non-root dans le conteneur peut ne pas correspondre au propriétaire du dossier monté côté hôte.
*Correction :* ajuster les permissions du dossier hôte, ou l'UID du conteneur.
*Vérification :* l'écriture réussit.
*Prévention :* documenter explicitement les permissions attendues pour tout bind mount en développement.

---

## H — Build

**24. Le Dockerfile échoue à la construction**
*Symptôme :* `docker build` s'arrête avec une erreur.
*Causes possibles :* instruction mal écrite, fichier référencé absent du contexte de build (chapitre 7, section 7.2).
*Diagnostic :* lire le message d'erreur exact, il indique généralement l'instruction précise en cause.
*Interprétation :* "file not found" signale presque toujours un chemin incorrect ou un fichier hors du contexte.
*Correction :* corriger le chemin ou l'instruction fautive.
*Vérification :* `docker build` réussit jusqu'au bout.
*Prévention :* construire progressivement un Dockerfile, en testant chaque bloc d'instructions.

**25. `npm install`/`npm ci` échoue dans le conteneur**
*Symptôme :* le build s'arrête pendant l'installation des dépendances.
*Causes possibles :* `package-lock.json` désynchronisé (chapitre 14, section 14.2), dépendance native incompatible avec `musl` (chapitre 25).
*Diagnostic :* lire le message d'erreur npm précis.
*Interprétation :* "can only install packages when your package.json and package-lock.json are in sync" indique un lockfile obsolète.
*Correction :* régénérer le lockfile en local, ou passer à une image `slim` plutôt qu'Alpine si le problème est natif.
*Vérification :* `npm ci` réussit dans le build.
*Prévention :* toujours committer un `package-lock.json` à jour après toute modification de dépendances.

**26. Build trop lent ou trop lourd**
*Symptôme :* `docker build` prend un temps anormalement long.
*Causes possibles :* `.dockerignore` absent/incomplet (chapitre 7, section 7.5), mauvais ordre des instructions cassant le cache (chapitre 7, section 7.4).
*Diagnostic :* observer la ligne "load build context" dans la sortie de `docker build`.
*Interprétation :* une taille de contexte anormalement grande révèle un `.dockerignore` manquant.
*Correction :* ajouter/compléter `.dockerignore` ; réordonner les instructions (dépendances avant code).
*Vérification :* temps de build réduit, cache réutilisé sur les reconstructions suivantes.
*Prévention :* toujours créer `.dockerignore` dès la création du projet (chapitre 25, checklist).

**27. Image finale trop grande**
*Symptôme :* `docker images` révèle une taille disproportionnée.
*Causes possibles :* absence de multi-stage build, image de base non optimisée (chapitre 25).
*Diagnostic :* `docker history nom-image` (chapitre 5, section 5.7)
*Interprétation :* identifie la couche responsable de la majorité de la taille.
*Correction :* appliquer un multi-stage build, passer à une variante `alpine`/`slim`.
*Vérification :* taille réduite, mesurée avec `docker images`.
*Prévention :* appliquer systématiquement la checklist du chapitre 25.

---

## I — Healthchecks et dépendances

**28. Healthcheck échoue en boucle (`unhealthy`)**
*Symptôme :* `docker compose ps` affiche `(unhealthy)` en continu.
*Causes possibles :* commande de test incorrecte, route de santé absente ou mal implémentée.
*Diagnostic :* `docker inspect --format "{{.State.Health.Log}}" nom-conteneur` (chapitre 23, section 23.5)
*Interprétation :* révèle la sortie exacte de chaque tentative de test échouée.
*Correction :* tester la commande manuellement (`docker exec`) pour identifier précisément l'échec.
*Vérification :* le statut passe à `(healthy)`.
*Prévention :* toujours tester manuellement une commande de healthcheck avant de l'intégrer.

**29. Service non prêt malgré `depends_on`**
*Symptôme :* le backend échoue à sa première connexion à la base au démarrage.
*Causes possibles :* `depends_on` sans `condition: service_healthy` (limite documentée du chapitre 13).
*Diagnostic :* vérifier la forme exacte de `depends_on` dans `compose.yaml`.
*Interprétation :* la forme simple garantit l'ordre de démarrage, jamais la disponibilité réelle.
*Correction :* passer à `condition: service_healthy` (chapitre 21).
*Vérification :* démarrage fiable, répété plusieurs fois de suite sans échec.
*Prévention :* toujours utiliser la forme conditionnelle dès qu'une dépendance réelle existe entre services.

---

## J — Redis

**30. Redis inaccessible**
*Symptôme :* le backend échoue à se connecter à Redis.
*Causes possibles :* mot de passe incorrect/absent (`--requirepass`, chapitre 18, section 18.3), mauvais nom de service.
*Diagnostic :* `docker compose exec redis redis-cli -a "$REDIS_PASSWORD" ping`
*Interprétation :* une réponse `PONG` confirme que Redis fonctionne — le problème vient alors de la configuration côté backend.
*Correction :* corriger `REDIS_URL`/le mot de passe côté application.
*Vérification :* connexion réussie depuis le backend.
*Prévention :* toujours tester la connexion à Redis indépendamment de l'application avant de diagnostiquer plus loin.

---

## K — HTTPS, DNS, VPS, SSH

**31. Certificat HTTPS échoue à s'obtenir**
*Symptôme :* Certbot échoue avec un timeout ou "Connection refused".
*Causes possibles :* DNS non propagé, Nginx phase 1 non démarré (chapitre 30, section 30.4-30.5).
*Diagnostic :* `dnschecker.org` pour confirmer la propagation ; `curl http://mondomaine.ht/.well-known/acme-challenge/test`
*Interprétation :* si le domaine ne résout pas encore vers le VPS, Certbot ne peut jamais réussir.
*Correction :* attendre la propagation complète avant de retenter.
*Vérification :* `certbot certonly` réussit.
*Prévention :* toujours vérifier la propagation DNS avant de lancer Certbot.

**32. DNS incorrect**
*Symptôme :* le domaine ne résout pas vers la bonne IP.
*Causes possibles :* enregistrement `A` mal configuré chez le registrar.
*Diagnostic :* `nslookup mondomaine.ht` ou `dnschecker.org`
*Interprétation :* compare l'IP résolue à l'IP réelle du VPS.
*Correction :* corriger l'enregistrement `A` chez le registrar.
*Vérification :* résolution correcte, confirmée depuis plusieurs emplacements.
*Prévention :* toujours vérifier l'enregistrement immédiatement après sa création, avant de continuer le déploiement.

**33. VPS inaccessible**
*Symptôme :* aucune réponse du serveur, même en `ping`.
*Causes possibles :* pare-feu mal configuré (chapitre 29, section 29.9), panne de l'hébergeur.
*Diagnostic :* vérifier le statut depuis l'interface de l'hébergeur.
*Interprétation :* distingue une panne de l'hébergeur d'un pare-feu local trop restrictif.
*Correction :* ajuster le pare-feu depuis la console de l'hébergeur si l'accès SSH est lui-même bloqué.
*Vérification :* connexion rétablie.
*Prévention :* toujours tester chaque règle de pare-feu immédiatement après modification, jamais en lot sans vérification intermédiaire.

**34. SSH inaccessible**
*Symptôme :* `ssh` échoue à se connecter au VPS.
*Causes possibles :* `ufw` bloquant le port 22 (rappel chapitre 29, section 29.3), mauvaise clé.
*Diagnostic :* console de secours de l'hébergeur (contourne le réseau habituel).
*Interprétation :* permet de vérifier et corriger le pare-feu depuis un accès qui ne dépend pas du SSH lui-même.
*Correction :* rouvrir le port 22 depuis la console de secours.
*Vérification :* SSH rétabli.
*Prévention :* toujours garder une console de secours accessible avant toute modification de pare-feu à distance.

---

## L — Ressources système

**35. Disque plein**
*Symptôme :* `docker build`/`docker run` échoue avec "no space left on device".
*Causes possibles :* images/conteneurs/logs accumulés sans nettoyage (chapitres 22, 24).
*Diagnostic :* `docker system df` (chapitre 24, section 24.1)
*Interprétation :* identifie la catégorie responsable (images, cache de build, logs).
*Correction :* nettoyage ciblé (chapitre 24), jamais `docker system prune -a --volumes` sans réflexion.
*Vérification :* espace disque libéré, confirmé avec `df -h` (hôte) et `docker system df`.
*Prévention :* rotation de logs (chapitre 22) et nettoyage régulier automatisé (chapitre 24).

**36. Mémoire insuffisante**
*Symptôme :* lenteurs générales, conteneurs tués sans raison apparente.
*Causes possibles :* absence de limites (chapitre 35), fuite mémoire applicative.
*Diagnostic :* `docker stats` (chapitre 23) puis l'historique Grafana (chapitre 34)
*Interprétation :* une dérive progressive sur plusieurs jours suggère une fuite ; un pic ponctuel suggère une charge normale mal dimensionnée.
*Correction :* corriger la fuite applicative, ou augmenter les ressources du serveur si le dimensionnement est simplement insuffisant.
*Vérification :* consommation stabilisée dans le temps.
*Prévention :* monitoring continu (chapitre 34) plutôt qu'une découverte tardive.

**37. CPU saturé**
*Symptôme :* l'application répond lentement, `docker stats` montre un CPU proche de 100%.
*Causes possibles :* absence de limite (chapitre 35), requête inefficace, boucle infinie.
*Diagnostic :* `docker top` (chapitre 23, section 23.2) pour identifier le processus précis.
*Interprétation :* un seul processus à 100% suggère un bug précis, plutôt qu'une charge globale légitime.
*Correction :* corriger le code en cause, ou fixer une limite CPU pour contenir l'impact (chapitre 35).
*Vérification :* CPU revenu à une valeur normale.
*Prévention :* limites de ressources systématiques dès la conception (chapitre 35, 44).

**38. Conteneur tué par l'OOM killer**
*Symptôme :* arrêt brutal, code de sortie 137.
*Causes possibles :* dépassement de la limite mémoire fixée (chapitre 35, section 35.3).
*Diagnostic :* `docker inspect --format "{{.State.OOMKilled}}" nom-conteneur`
*Interprétation :* `true` confirme la cause exacte, sans ambiguïté.
*Correction :* augmenter la limite si le besoin réel le justifie, ou corriger une fuite mémoire.
*Vérification :* le conteneur reste stable sous charge normale.
*Prévention :* toujours mesurer avant de fixer une limite (chapitre 35, section 35.6).

**39. Logs trop volumineux**
*Symptôme :* disque saturé (rappel scénario 35), spécifiquement par les logs.
*Causes possibles :* absence de rotation configurée (chapitre 22, section 22.5).
*Diagnostic :* `docker inspect --format "{{.HostConfig.LogConfig}}" nom-conteneur`
*Interprétation :* absence de `max-size` confirme le problème.
*Correction :* ajouter `logging: driver: json-file, options: max-size/max-file`.
*Vérification :* taille des logs plafonnée, confirmée dans le temps.
*Prévention :* appliquer la rotation à tous les services dès la conception d'un projet destiné à durer.

---

## M — Sauvegardes

**40. Sauvegarde échouée**
*Symptôme :* le script de sauvegarde se termine en erreur, ou produit un fichier vide/corrompu.
*Causes possibles :* mot de passe changé sans mise à jour du script, service arrêté au moment de la sauvegarde.
*Diagnostic :* exécuter le script manuellement, en lisant chaque ligne de sortie (chapitre 33, section 33.4).
*Interprétation :* révèle l'étape précise en échec.
*Correction :* corriger le script (identifiants, chemin), relancer.
*Vérification :* une sauvegarde valide est produite, de taille cohérente.
*Prévention :* `set -e` dans le script (chapitre 33) pour ne jamais continuer aveuglément après un échec.

**41. Restauration échouée**
*Symptôme :* une tentative de restauration échoue ou produit des données incomplètes.
*Causes possibles :* sauvegarde elle-même corrompue, jamais testée auparavant (chapitre 33, section 33.6).
*Diagnostic :* tenter la restauration dans un environnement isolé, en lisant chaque message d'erreur.
*Interprétation :* confirme si le problème vient du fichier de sauvegarde ou de la procédure de restauration.
*Correction :* utiliser une sauvegarde antérieure si celle-ci est irrémédiablement corrompue ; corriger la procédure.
*Vérification :* une restauration complète et vérifiée réussit.
*Prévention :* tester la restauration régulièrement, jamais seulement au moment de la mise en place initiale (chapitre 33).

---

## N — CI/CD et registry

**42. Déploiement CI/CD échoué**
*Symptôme :* le workflow GitHub Actions échoue.
*Causes possibles :* secret mal nommé, erreur de syntaxe YAML, échec de build (chapitre 31).
*Diagnostic :* consulter le journal détaillé de l'exécution dans l'onglet "Actions" de GitHub.
*Interprétation :* identifie l'étape précise en échec et son message d'erreur exact.
*Correction :* corriger l'étape fautive.
*Vérification :* le workflow réussit intégralement.
*Prévention :* tester un workflow sur une branche secondaire avant de le brancher sur `main`.

**43. Image non poussée vers le registry**
*Symptôme :* le job de build réussit, mais l'image n'apparaît pas dans le registry.
*Causes possibles :* authentification échouée, `push: false` par erreur.
*Diagnostic :* relire les logs de l'étape `docker/build-push-action` (chapitre 31, section 31.2).
*Interprétation :* un message d'authentification refusée révèle un secret incorrect.
*Correction :* corriger le secret ou l'option `push`.
*Vérification :* l'image apparaît dans le registry après le workflow suivant.
*Prévention :* vérifier une première fois manuellement (`docker login`/`push`) avant d'automatiser.

**44. Registry inaccessible**
*Symptôme :* `docker pull`/`push` échoue avec une erreur réseau.
*Causes possibles :* panne du registry distant, contrainte TLS (chapitre 27, section 27.5) pour un registry privé auto-hébergé.
*Diagnostic :* `curl -I https://registry-utilise` pour confirmer l'accessibilité réseau brute.
*Interprétation :* distingue une panne du registry d'un problème de configuration TLS locale.
*Correction :* attendre le rétablissement du service, ou corriger la configuration TLS/`insecure-registries`.
*Vérification :* `docker pull` réussit à nouveau.
*Prévention :* pour un registry privé critique, prévoir une haute disponibilité ou un registry de secours.

**45. Mauvaise version d'image déployée**
*Symptôme :* le comportement observé en production ne correspond pas au dernier commit.
*Causes possibles :* `:latest` non republié correctement, cache local sur le serveur.
*Diagnostic :* `docker inspect --format "{{.Config.Image}}" nom-conteneur` puis comparer au tag attendu.
*Interprétation :* révèle précisément quelle version tourne réellement.
*Correction :* `docker compose pull` explicite avant `up -d` (rappel chapitre 31).
*Vérification :* le comportement correspond désormais à la version attendue.
*Prévention :* toujours utiliser un tag immuable (chapitre 32) pour éliminer toute ambiguïté.

**46. Rollback nécessaire**
*Symptôme :* un déploiement récent casse une fonctionnalité en production.
*Causes possibles :* régression non détectée avant déploiement.
*Diagnostic :* identifier le dernier tag/commit connu fonctionnel (chapitre 32, section 32.3).
*Interprétation :* confirme la version cible du rollback.
*Correction :* `BACKEND_TAG=<sha-precedent> docker compose up -d backend`
*Vérification :* le comportement problématique disparaît.
*Prévention :* toujours publier un tag immuable en plus de `:latest`, et tester "Verify" avant de considérer un déploiement terminé (chapitre 32).

---

## O — Sécurité

**47. Fuite de secret**
*Symptôme :* un secret apparaît dans un commit Git, une image, ou des logs.
*Causes possibles :* `.env` versionné par erreur, secret dans `ARG`/`ENV` d'un Dockerfile (chapitre 6, 9, 26).
*Diagnostic :* rechercher le secret dans l'historique Git et dans `docker history` de l'image concernée.
*Interprétation :* confirme l'étendue réelle de l'exposition.
*Correction :* **révoquer et régénérer immédiatement** le secret exposé — jamais se contenter de le supprimer du code, insuffisant une fois committé (chapitre 9, section 9.4).
*Vérification :* l'ancien secret ne fonctionne plus, le nouveau est en place partout où nécessaire.
*Prévention :* `.gitignore` créé avant le premier commit, secrets BuildKit pour tout secret de build (chapitre 26, section 26.3).

**48. Conteneur exécuté en root**
*Symptôme :* audit de sécurité révélant l'absence de `USER` non-root.
*Causes possibles :* `USER` omis dans le Dockerfile (chapitre 6, section 6.7).
*Diagnostic :* `docker exec nom-conteneur whoami`
*Interprétation :* `root` confirme l'absence de la bonne pratique.
*Correction :* ajouter `USER` dans le Dockerfile, reconstruire.
*Vérification :* `whoami` renvoie un utilisateur non privilégié.
*Prévention :* intégrer ce point à la checklist systématique du chapitre 25.

**49. Port inutile exposé**
*Symptôme :* audit réseau révélant un port de base de données accessible depuis l'extérieur.
*Causes possibles :* `ports:` laissé par erreur sur un service interne (chapitres 8, 11, 26).
*Diagnostic :* `sudo ufw status numbered` sur le serveur (chapitre 29, section 29.9)
*Interprétation :* tout port hors 22/80/443 est un signal d'alerte.
*Correction :* retirer `ports:` du service concerné, ne garder que le réseau interne (chapitre 11).
*Vérification :* le port n'est plus accessible depuis l'extérieur, l'application continue de fonctionner normalement en interne.
*Prévention :* revue systématique de `compose.prod.yaml` avant chaque déploiement significatif.

---

## P — Le classique

**50. "Ça marche en local mais pas en production"**
*Symptôme :* comportement différent entre développement et production, sans erreur explicite immédiate.
*Causes possibles :* différence d'environnement (chapitre 1, section 1.1 — le problème que Docker résout justement), variable d'environnement manquante en production, différence de version d'image, cache de build local jamais reproduit en CI.
*Diagnostic :* comparer méthodiquement, un par un : `docker compose config` (variables réellement actives), les tags d'image utilisés, les versions des images de base.
*Interprétation :* la différence trouvée EST généralement la cause — ce diagnostic est rarement mystérieux une fois mené méthodiquement plutôt que par intuition.
*Correction :* aligner l'environnement en cause (variable, version, configuration).
*Vérification :* le comportement devient identique entre les deux environnements.
*Prévention :* c'est très exactement le problème que Docker résout depuis le chapitre 1 — cette panne, la dernière du catalogue, signale presque toujours qu'un des principes de ce manuel (image identique partout, `.env` par environnement du chapitre 28, tag immuable du chapitre 32) n'a pas été strictement respecté quelque part.

---

## Laboratoire pratique n°1 — Reproduire trois pannes volontairement

**Objectifs :** provoquer, diagnostiquer et corriger trois scénarios de ce catalogue, choisis librement, sans consulter la solution avant d'avoir tenté un diagnostic complet.
**Prérequis :** l'ensemble du manuel.

**Résultat attendu :** trois diagnostics corrects, obtenus par la méthode de la section "méthode générale", pas par supposition.

---

## Laboratoire pratique n°2 — Construire un arbre de décision personnel

**Objectifs :** pour une catégorie de ce catalogue (au choix), dessiner un arbre de décision reliant symptôme observé → première commande de diagnostic → interprétation → action.
**Prérequis :** Laboratoire 1 complété.

**Résultat attendu :** un outil personnel, réutilisable, structurant la méthode plutôt qu'une simple liste à relire.

---

## Laboratoire pratique n°3 — Simulation chronométrée

**Objectifs :** demander à quelqu'un (ou tirer au sort) un scénario de ce catalogue, et le résoudre en temps limité, en appliquant strictement la méthode générale.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Résultat attendu :** confirmation que la méthode, une fois intériorisée, reste efficace même sous une contrainte de temps réaliste.

---

## Conclusion

Ce catalogue ne remplace aucun chapitre — il en est l'index de retour rapide. Le manuel se termine maintenant par ses annexes : une référence de commandes complète, un glossaire général, et des checklists professionnelles prêtes à imprimer.

---

⬅️ [Chapitre 47 — Projet final](47-projet-final-fil-rouge.md) · ➡️ **Suite : Annexe A — Cheat sheet des commandes**
