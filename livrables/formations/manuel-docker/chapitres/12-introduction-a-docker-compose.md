# Chapitre 12 — Introduction à Docker Compose

**Niveau : Intermédiaire**

---

## Introduction

Le chapitre 11 s'est terminé sur une promesse : Docker Compose automatise exactement ce que huit chapitres viennent de construire à la main. Ce chapitre tient cette promesse — le laboratoire frontend/backend/database du chapitre 11, réduit à un seul fichier déclaratif et deux commandes.

---

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras :
- expliquer ce que Docker Compose automatise par rapport à une série de `docker run` manuels ;
- écrire un `compose.yaml` avec plusieurs services, ports, volumes et variables d'environnement ;
- démarrer, arrêter et inspecter une application multi-conteneurs avec `docker compose up`/`down`/`ps`/`logs`/`restart` ;
- expliquer pourquoi les services Compose se trouvent automatiquement par leur nom, sans configuration réseau manuelle ;
- éviter l'erreur destructrice la plus fréquente de Compose : `down -v` sur des données qu'on voulait garder.

## 📋 Prérequis

Chapitres 8, 10 et 11 (ports, volumes, réseaux) — Compose orchestre exactement ces trois notions.

## Pourquoi ce chapitre est important

À partir du chapitre 13, plus aucun projet de ce manuel ne se lance avec une suite de `docker run`. Comprendre que Compose n'invente aucun concept nouveau — il ne fait qu'écrire, dans un fichier, ce que les chapitres 4 à 11 ont appris à taper commande par commande — évite de vivre Compose comme une boîte noire magique.

---

## Concepts fondamentaux

1. **Pourquoi Compose** — remplacer une suite de commandes fragile par une déclaration reproductible.
2. **Anatomie de `compose.yaml`** — services, image/build, ports, volumes, environment.
3. **Réseau et volumes automatiques** — ce que Compose crée sans qu'on le lui demande explicitement.
4. **Le cycle de vie Compose** — `up`, `down`, `ps`, `logs`, `restart`.

---

## 12.1 Pourquoi Docker Compose

Reprends mentalement les commandes du laboratoire 2 du chapitre 11 : un `docker network create`, puis trois `docker run` longs, chacun avec ses propres options (`--network`, `-e`, `-v`, `-p`), à retaper à l'identique à chaque redémarrage de la machine, à partager avec un collègue en les copiant-collant sans erreur, à maintenir à jour si un port change.

> 💡 **Analogie** — Reprendre ces commandes une par une à chaque fois, c'est comme donner oralement à un nouvel employé, chaque matin, la liste complète des tâches d'ouverture d'un restaurant. Docker Compose, c'est la procédure d'ouverture écrite une fois, dans un document unique, que n'importe qui peut suivre à l'identique — ou automatiser entièrement.

**Docker Compose** est un outil (installé avec Docker Desktop, ou via le paquet `docker-compose-plugin` sur Linux — chapitre 3) qui lit un fichier déclaratif, `compose.yaml`, décrivant l'ensemble des conteneurs d'une application — ses **services** — et orchestre leur création, dans le bon réseau, avec les bons volumes, en une seule commande.

> 📌 **À retenir** — Docker Compose ne remplace aucun concept des chapitres précédents — il les **déclare** plutôt que de les exécuter un par un. Un `compose.yaml` bien compris se lit comme une traduction directe d'une suite de `docker run`/`docker network create`/`docker volume create`.

---

## 12.2 Anatomie d'un `compose.yaml`

```yaml
services:
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: test1234
      MYSQL_DATABASE: app
    volumes:
      - mysql-data:/var/lib/mysql

  backend:
    image: alpine
    command: sleep 3600

  frontend:
    image: nginx
    ports:
      - "8080:80"

volumes:
  mysql-data:
```

**Explication, clé par clé :**
```yaml
services:
  → la liste des conteneurs de l'application. Chaque clé sous "services"
    (ici "db", "backend", "frontend") devient à la fois le NOM du conteneur
    ET son nom résolu par DNS interne (chapitre 11) — aucun --name séparé nécessaire

  image: mysql:8
  → équivalent du nom d'image passé à "docker run" (chapitre 5)

  environment:
  → équivalent de "-e" répété pour chaque variable (chapitre 9)

  volumes:
  → équivalent de "-v" (chapitre 10) — "mysql-data:/var/lib/mysql" a EXACTEMENT
    la même signification qu'en ligne de commande

  ports:
  → équivalent de "-p" (chapitre 8) — "hôte:conteneur", entre guillemets par convention YAML

  command:
  → équivalent d'une commande passée après le nom de l'image à "docker run" (chapitre 6)

volumes: (au niveau racine, pas sous un service)
  → déclare "mysql-data" comme un volume nommé du projet (chapitre 10),
    exactement comme "docker volume create" — sans cette déclaration, Compose
    le créerait quand même implicitement au premier usage, mais le déclarer
    explicitement documente son existence
```

> ⚠️ **Attention — indentation YAML** — Le format YAML est **strictement sensible à l'indentation** (des espaces, jamais de tabulation). Une ligne mal indentée d'un seul espace peut rattacher une clé au mauvais parent, sans qu'aucune erreur explicite n'apparaisse toujours immédiatement. Utiliser un éditeur qui affiche l'indentation YAML (la plupart des éditeurs modernes le font par défaut) réduit fortement ce risque.

---

## 12.3 Démarrer et arrêter avec Compose

```bash
# [Windows PowerShell] / [Linux Terminal] / [Terminal macOS] — depuis le dossier contenant compose.yaml
docker compose up -d
```

**Explication :**
```text
docker compose up
→ crée (si nécessaire) et démarre TOUS les services définis dans compose.yaml,
  ainsi que le réseau et les volumes qu'ils déclarent

-d
→ mode détaché, identique en signification à "docker run -d" (chapitre 4)
```

**Résultat attendu**, en substance :
```text
[+] Running 4/4
 ✔ Network hello-compose_default   Created
 ✔ Volume "hello-compose_mysql-data"  Created
 ✔ Container hello-compose-db-1    Started
 ✔ Container hello-compose-backend-1 Started
 ✔ Container hello-compose-frontend-1 Started
```

> 📌 **À retenir** — Le nom du **réseau** créé automatiquement (`hello-compose_default` ici) est dérivé du nom du **dossier** contenant `compose.yaml` (le "nom du projet" Compose, approfondi en encadré ci-dessous) — c'est ce réseau, personnalisé au sens du chapitre 11, qui fournit la résolution DNS entre `db`, `backend` et `frontend`, sans qu'aucune ligne `networks:` n'ait été nécessaire dans cet exemple minimal.

```bash
# [Terminal]
docker compose ps
```

**Explication :** équivalent de `docker ps` (chapitre 4), mais limité aux conteneurs du projet Compose courant.

```bash
# [Terminal] — vérifier la communication entre services, exactement comme au chapitre 11
docker compose exec backend ping -c 2 db
```

**Explication :** `docker compose exec` équivalent de `docker exec` (chapitre 10), ciblant un service par son nom Compose plutôt qu'un nom de conteneur complet.

**Résultat attendu :** succès, exactement comme au laboratoire 2 du chapitre 11 — sauf qu'ici, aucun `docker network create` explicite n'a été tapé.

```bash
# [Terminal]
docker compose logs
docker compose logs -f backend
docker compose restart backend
```

**Explication rapide** (détail complet des logs au chapitre 22) : `docker compose logs` agrège les logs de tous les services ; `-f` (follow) les affiche en continu ; `restart` cible un service précis pour un redémarrage, équivalent de `docker restart` (chapitre 4).

```bash
# [Terminal]
docker compose down
```

**Explication :** arrête et **supprime** tous les conteneurs du projet (équivalent d'un `docker stop` + `docker rm` groupé, chapitre 4), ainsi que le réseau créé — mais **pas** les volumes nommés, préservés par défaut.

> ⚠️ **Attention — l'erreur la plus destructrice de ce chapitre** — `docker compose down -v` (avec `-v`) supprime **également les volumes** du projet, donc **toutes les données** qu'ils contiennent — l'équivalent d'un `docker volume rm` groupé (chapitre 10). Une erreur d'inattention fréquente : taper `-v` par réflexe (habitude d'autres commandes), sans réaliser que cette option précise détruit des données qui auraient autrement survécu à un simple `down`. **Ne jamais utiliser `-v` sans avoir consciemment décidé de perdre les données des volumes du projet.**

---

## Encadré — le "nom de projet" Compose

Par défaut, Compose déduit un **nom de projet** à partir du nom du dossier contenant `compose.yaml` (`hello-compose` dans l'exemple ci-dessus) — ce nom préfixe le réseau créé, les volumes créés, et les noms de conteneurs (`hello-compose-db-1`). Deux projets Compose dans des dossiers différents, avec des noms de dossier différents, restent donc totalement isolés l'un de l'autre, même avec des `compose.yaml` identiques.

> ✅ **Bonne pratique** — Il est possible de fixer explicitement ce nom (`docker compose -p mon-nom up`, ou une clé `name:` dans le fichier), utile pour lancer plusieurs instances du même projet côte à côte (approfondi implicitement dans les projets de la Partie X) — non nécessaire pour un seul projet à la fois, le cas par défaut de ce manuel.

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Cause | Solution |
|---|---|---|
| Erreur de parsing YAML, souvent peu explicite | Indentation incohérente (espaces vs tabulation, décalage d'un espace) | Relire attentivement l'indentation, utiliser un éditeur qui la met en évidence |
| Perte de données après `docker compose down` | Confusion avec `docker compose down -v` | Toujours vérifier la présence ou l'absence de `-v` avant de valider la commande |
| Un service ne trouve pas un autre par son nom | Nom de service dans `compose.yaml` différent de celui utilisé dans le code de l'application | Le nom du service Compose EST le nom réseau — les deux doivent correspondre exactement |
| Deux exécutions du même `compose.yaml` depuis des dossiers copiés créent des ressources en double | Nom de projet dérivé automatiquement du nom de dossier, différent d'une copie à l'autre | Fixer explicitement un nom de projet si plusieurs copies doivent être lancées intentionnellement, sinon n'utiliser qu'un seul dossier |

---

## Laboratoire pratique n°1 — Recréer le laboratoire du chapitre 11 avec Compose

**Objectifs :** vivre concrètement la réduction "8 commandes → 2 commandes" promise en introduction.
**Prérequis :** Chapitre 11 complété.

**Étapes :**
1. Crée un dossier `hello-compose/` avec le `compose.yaml` de la section 12.2.
2. `docker compose up -d`.
3. `docker compose exec backend ping -c 2 db` — confirme le succès.
4. `docker compose down` — confirme l'arrêt complet.

**Résultat attendu :** l'exacte même communication réseau que le laboratoire 2 du chapitre 11, obtenue avec une fraction du nombre de commandes.

---

## Laboratoire pratique n°2 — Observer ce que `down` préserve, et ce que `down -v` détruit

**Objectifs :** vérifier par l'expérience la mise en garde de la section 12.3, en conditions sûres.
**Prérequis :** Laboratoire 1 complété.

**Étapes :**
1. Relance `docker compose up -d`, puis insère une donnée de test dans `db` (comme au chapitre 10, section 10.7).
2. `docker compose down` (sans `-v`), puis `docker compose up -d` de nouveau — vérifie que la donnée existe toujours.
3. `docker compose down -v` cette fois, puis `docker compose up -d` — vérifie que la donnée a disparu.

**Résultat attendu :** une distinction vécue, pas seulement lue, entre les deux commandes.

---

## Laboratoire pratique n°3 — Lire les logs agrégés

**Objectifs :** se familiariser avec `docker compose logs`, réutilisé à chaque chapitre suivant.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :**
1. `docker compose up -d`.
2. `docker compose logs` — observe que les logs de tous les services apparaissent, préfixés par leur nom de service.
3. `docker compose logs -f db` — observe le flux en continu limité à un seul service, puis `Ctrl+C` pour l'interrompre (sans arrêter le service lui-même).

**Résultat attendu :** compréhension claire de la différence entre les logs agrégés et les logs filtrés par service, réutilisée au chapitre 22.

---

## Exercices

1. Explique, service par service, à quelle commande `docker run` correspondrait le `compose.yaml` de la section 12.2.
2. Pourquoi `frontend`, `backend` et `db` se trouvent-ils par leur nom sans aucune ligne `networks:` explicite dans cet exemple ?
3. Que supprime exactement `docker compose down`, et que préserve-t-il par défaut ?
4. Pourquoi `-v` sur `docker compose down` est-il particulièrement dangereux, comparé à d'autres options ?
5. D'où vient le nom du réseau créé automatiquement par Compose pour un projet donné ?

---

## Quiz

**Question 1.** Dans `compose.yaml`, chaque clé sous `services:` devient :
a) Un fichier séparé
b) Le nom du conteneur ET son nom résolu par DNS interne
c) Un volume nommé
d) Une variable d'environnement

**Question 2.** `docker compose down` (sans option) :
a) Supprime les conteneurs, le réseau, ET les volumes
b) Supprime les conteneurs et le réseau, mais préserve les volumes nommés
c) Ne fait rien tant que `-v` n'est pas ajouté
d) Supprime uniquement les images

**Question 3.** `docker compose down -v` :
a) Est strictement identique à `docker compose down`
b) Supprime en plus les volumes nommés du projet, donc leurs données
c) Affiche uniquement des informations de version
d) Redémarre les services au lieu de les arrêter

**Question 4.** Le réseau créé automatiquement par Compose pour un projet correspond à :
a) Le réseau `bridge` par défaut de Docker
b) Un réseau personnalisé (chapitre 11), avec résolution DNS entre services
c) Le mode réseau `host`
d) Aucun réseau, chaque service reste isolé

**Question 5.** `docker compose exec backend ping db` équivaut, en logique, à quelle commande vue au chapitre 11 ?
a) `docker network create`
b) `docker exec conteneur-a ping conteneur-b` sur un réseau personnalisé
c) `docker volume inspect`
d) `docker rmi`

> 🔑 **Corrigé** — 1: b · 2: b · 3: b · 4: b · 5: b

---

## 📝 Résumé du chapitre

- Docker Compose déclare, dans un fichier `compose.yaml`, ce que les chapitres 4 à 11 ont appris à construire commande par commande — aucun concept nouveau, une orchestration automatisée.
- Chaque clé sous `services:` est à la fois le nom du conteneur et son nom résolu par DNS, grâce au réseau personnalisé que Compose crée automatiquement pour chaque projet.
- `ports`, `volumes`, `environment`, `command` traduisent directement `-p`, `-v`, `-e` et la commande de `docker run`.
- `docker compose up -d` démarre tout ; `docker compose down` arrête et supprime conteneurs et réseau, **en préservant les volumes** ; `docker compose down -v` les supprime aussi — la commande la plus dangereuse de ce chapitre, à ne jamais taper par réflexe.

## ✅ Checklist avant de passer au chapitre 13

- [ ] Je sais écrire un `compose.yaml` avec plusieurs services, ports, volumes et variables.
- [ ] Je sais expliquer pourquoi les services se trouvent par leur nom sans configuration réseau manuelle.
- [ ] Je sais la différence exacte entre `docker compose down` et `docker compose down -v`.
- [ ] Je sais utiliser `docker compose ps`, `logs` et `exec`.
- [ ] J'ai réalisé les trois laboratoires de ce chapitre.
- [ ] J'ai obtenu au moins 4/5 au quiz.

---

## Glossaire du chapitre

**Service (Compose)**
Définition simple : un conteneur défini dans `compose.yaml`, sous la clé `services`.
Définition technique : une unité déclarative représentant un conteneur, son image ou sa construction, ses ports, volumes et variables, dont le nom sert aussi d'identifiant DNS sur le réseau du projet.
Voir : Chapitre 12, section 12.2.

**Nom de projet (Compose)**
Définition simple : l'identifiant qui préfixe les ressources créées par Compose pour une application donnée.
Définition technique : déduit par défaut du nom du dossier contenant `compose.yaml`, personnalisable via `-p` ou la clé `name:`.
Voir : Chapitre 12, encadré dédié.

---

## ❓ FAQ

**Faut-il encore écrire `version: "3.8"` en haut d'un `compose.yaml` ?**
Non — cette clé, autrefois obligatoire, est aujourd'hui obsolète et ignorée par les versions récentes de Docker Compose (le plugin `docker compose`, sans tiret, installé au chapitre 3). Ce manuel ne l'utilise jamais.

**Quelle est la différence entre `docker-compose` (avec tiret) et `docker compose` (sans tiret, deux mots) ?**
`docker-compose` est l'ancien outil autonome (Python), aujourd'hui remplacé par `docker compose`, intégré directement au Docker CLI comme sous-commande (chapitre 3, installé via `docker-compose-plugin` sur Linux). Ce manuel utilise exclusivement la forme moderne, `docker compose`.

**Peut-on mélanger des services construits depuis un Dockerfile et d'autres utilisant une image toute faite dans le même `compose.yaml` ?**
Oui, sans aucun problème — `image:` pour une image existante (comme dans ce chapitre), `build:` pour construire depuis un Dockerfile local. Ce second cas est développé au chapitre 13.

---

## Références officielles

- Vue d'ensemble de Docker Compose — [docs.docker.com/compose](https://docs.docker.com/compose/)
- Référence complète du fichier Compose — [docs.docker.com/reference/compose-file](https://docs.docker.com/reference/compose-file/)
- `docker compose` (référence CLI) — [docs.docker.com/reference/cli/docker/compose](https://docs.docker.com/reference/cli/docker/compose/)

---

## Conclusion

Compose n'est plus une boîte noire : chaque ligne de `compose.yaml` se traduit directement vers une commande déjà maîtrisée depuis la Partie II. Le chapitre 13 construit le premier vrai projet Compose complet — Nginx, un backend, et MySQL — avec Dockerfile personnalisé, `.env`, et vérifications de bout en bout.

---

⬅️ [Chapitre 11 — Réseaux Docker](11-reseaux-docker.md) · ➡️ **Suite : Chapitre 13 — Premier projet Compose : Nginx + Backend + MySQL**
