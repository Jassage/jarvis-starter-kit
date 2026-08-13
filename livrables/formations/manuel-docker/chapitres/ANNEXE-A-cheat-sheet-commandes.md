# Annexe A — Cheat sheet des commandes

> Aide-mémoire de référence rapide. Chaque commande renvoie au chapitre qui l'explique en détail — cette annexe rappelle, elle n'enseigne pas.

---

## Images

| Commande | Effet | Chapitre |
|---|---|---|
| `docker images` | Lister les images locales | 5 |
| `docker pull image:tag` | Télécharger une image | 5 |
| `docker build -t nom .` | Construire une image | 7 |
| `docker build --target nom .` | Construire une cible nommée précise | 28 |
| `docker tag ancien nouveau` | Retagger une image (même Image ID) | 27 |
| `docker push nom:tag` | Publier une image vers un registry | 27 |
| `docker rmi nom:tag` | Supprimer une image | 5 |
| `docker history nom` | Voir les couches d'une image | 5 |
| `docker inspect nom` | Métadonnées complètes d'une image | 5 |

## Conteneurs

| Commande | Effet | Chapitre |
|---|---|---|
| `docker run image` | Créer et démarrer un conteneur | 4 |
| `docker run -d image` | Mode détaché | 4 |
| `docker run --name X image` | Nommer le conteneur | 4 |
| `docker run --rm image` | Supprimer automatiquement à l'arrêt | 9 |
| `docker ps` | Conteneurs actifs | 4 |
| `docker ps -a` | Tous les conteneurs | 4 |
| `docker start/stop/restart X` | Changer l'état d'un conteneur existant | 4 |
| `docker rm X` | Supprimer un conteneur | 4 |
| `docker rm -f X` | Arrêter et supprimer en une commande | 4 |
| `docker exec -it X sh` | Shell interactif dans un conteneur actif | 23 |
| `docker top X` | Processus d'un conteneur | 23 |
| `docker stats` | Ressources en temps réel | 23 |
| `docker logs X` | Logs d'un conteneur | 22 |
| `docker logs -f X` | Suivre les logs en continu | 22 |
| `docker port X` | Mappings de ports actifs | 8 |

## Volumes

| Commande | Effet | Chapitre |
|---|---|---|
| `docker volume create nom` | Créer un volume | 10 |
| `docker volume ls` | Lister les volumes | 10 |
| `docker volume inspect nom` | Détails d'un volume | 10 |
| `docker volume rm nom` | Supprimer un volume (données perdues) | 10 |
| `docker volume prune` | Supprimer tous les volumes inutilisés (⚠️ destructeur) | 24 |

## Réseaux

| Commande | Effet | Chapitre |
|---|---|---|
| `docker network create nom` | Créer un réseau personnalisé (DNS interne) | 11 |
| `docker network ls` | Lister les réseaux | 11 |
| `docker network inspect nom` | Détails d'un réseau | 11 |
| `docker network connect/disconnect` | Rattacher/détacher un conteneur | 11 |

## Compose

| Commande | Effet | Chapitre |
|---|---|---|
| `docker compose up -d` | Démarrer tous les services | 12 |
| `docker compose up -d --build` | Reconstruire puis démarrer | 13 |
| `docker compose down` | Arrêter et supprimer (volumes préservés) | 12 |
| `docker compose down -v` | Idem + supprimer les volumes (⚠️ destructeur) | 12 |
| `docker compose ps` | Services du projet | 12 |
| `docker compose logs -f service` | Logs d'un service précis | 22 |
| `docker compose exec service cmd` | Exécuter une commande dans un service | 33, 36 |
| `docker compose config` | Configuration fusionnée réellement active | 28, 48 |
| `docker compose restart service` | Redémarrer un seul service | 4 |
| `docker compose -f a.yaml -f b.yaml up -d` | Fusion explicite de plusieurs fichiers | 28 |

## Diagnostic et nettoyage

| Commande | Effet | Chapitre |
|---|---|---|
| `docker inspect --format "{{.State.Health.Log}}" X` | Historique des healthchecks | 21, 23 |
| `docker inspect --format "{{.State.OOMKilled}}" X` | Vérifier une terminaison OOM | 35 |
| `docker events` | Flux d'événements Docker en temps réel | 23 |
| `docker system df` | Espace disque utilisé par Docker | 24 |
| `docker container prune` | Nettoyer les conteneurs arrêtés | 24 |
| `docker image prune` / `-a` | Nettoyer les images inutilisées | 24 |
| `docker system prune` / `-a --volumes` | Nettoyage combiné (⚠️ `--volumes` destructeur) | 24 |

---

⬅️ [Chapitre 48 — Dépannage](48-depannage-50-pannes-reelles.md) · ➡️ **Suite : Annexe B — Glossaire**
