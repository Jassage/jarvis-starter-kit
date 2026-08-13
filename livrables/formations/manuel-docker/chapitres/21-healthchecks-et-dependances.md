# Chapitre 21 — Healthchecks et dépendances entre services

**Niveau : Intermédiaire → Avancé**

---

## Introduction

Trois fois déjà (chapitres 13, 16 et 20), ce manuel a observé la même limite sans la corriger : `depends_on` garantit l'ordre de démarrage des conteneurs, jamais que le service à l'intérieur est réellement prêt. Ce chapitre reprend **le projet exact du chapitre 20** et y ajoute des `HEALTHCHECK`, corrigeant définitivement le problème.

---

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras :
- écrire un `HEALTHCHECK` dans un Dockerfile et l'équivalent en Compose ;
- utiliser `depends_on: condition: service_healthy` pour garantir qu'un service ne démarre qu'une fois ses dépendances réellement prêtes ;
- distinguer les états `starting`, `healthy` et `unhealthy` d'un conteneur ;
- corriger, de façon durable, la limite de `depends_on` rencontrée trois fois dans ce manuel.

## 📋 Prérequis

Chapitre 20 (le projet repris ici) et chapitre 6, section 6.9 (introduction de `HEALTHCHECK`).

## Pourquoi ce chapitre est important

Un backend qui échoue au tout premier démarrage (avant que sa base de données ne soit prête) n'est pas juste gênant en développement — en production, un tel échec peut déclencher une boucle de redémarrage infinie ou un état d'erreur visible par de vrais utilisateurs, au pire moment possible : juste après un déploiement.

---

## Concepts fondamentaux

1. **`HEALTHCHECK`** — une commande qui juge la santé réelle d'un conteneur, pas seulement son état "démarré".
2. **États de santé** — `starting`, `healthy`, `unhealthy`.
3. **`depends_on: condition: service_healthy`** — la vraie solution à la limite du `depends_on` simple.

---

## 21.1 `HEALTHCHECK` dans un Dockerfile (rappel et application)

```dockerfile
# [backend/Dockerfile, extrait]
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
ENV NODE_ENV=production
EXPOSE 4000
USER node
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1
CMD ["node", "src/index.js"]
```

**Explication, paramètre par paramètre :**
```text
--interval=10s
→ exécute la vérification toutes les 10 secondes

--timeout=3s
→ si la commande de vérification ne répond pas en 3 secondes, considère l'essai comme un échec

--start-period=5s
→ accorde 5 secondes de grâce au démarrage, sans compter les échecs de cette période
   dans le seuil de bascule "unhealthy" — utile pour une application qui a besoin
   d'un court délai avant d'être opérationnelle

--retries=3
→ il faut 3 échecs consécutifs (après la période de grâce) pour basculer
   le conteneur en "unhealthy", pas un seul échec isolé

CMD wget -qO- http://localhost:4000/health || exit 1
→ la commande réellement exécutée à chaque intervalle : interroge la route /health
   (déjà présente dans le backend depuis le chapitre 14) ; un code de sortie
   différent de 0 (déclenché par "|| exit 1" si wget échoue) marque l'essai en échec
```

```bash
# [Terminal] — observer l'état de santé
docker compose ps
```

**Résultat attendu**, en substance :
```text
NAME                  STATUS
app-complete-backend-1   Up 12 seconds (healthy)
app-complete-db-1        Up 15 seconds
```

> 📌 **À retenir** — `(healthy)` n'apparaît que pour un service dont le Dockerfile (ou la configuration Compose, section 21.2) définit un `HEALTHCHECK`. Un service sans `HEALTHCHECK` reste simplement `Up`, sans jugement sur sa disponibilité réelle — c'est précisément cette absence de jugement qui causait la limite observée aux chapitres 13, 16 et 20.

---

## 21.2 `HEALTHCHECK` pour une image officielle, directement en Compose

Les images officielles (`postgres`, `redis`) n'incluent généralement pas de `HEALTHCHECK` par défaut — Compose permet d'en ajouter un sans reconstruire l'image :

```yaml
# [compose.yaml, extrait]
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD-SHELL", "redis-cli -a ${REDIS_PASSWORD} ping | grep PONG"]
      interval: 5s
      timeout: 3s
      retries: 5
```

**Explication :**
```text
test: ["CMD-SHELL", "..."]
→ équivalent Compose de l'instruction HEALTHCHECK d'un Dockerfile, sans modifier l'image

pg_isready
→ un utilitaire fourni PAR L'IMAGE OFFICIELLE POSTGRESQL elle-même, conçu
  précisément pour vérifier si le serveur est prêt à accepter des connexions

redis-cli ... ping | grep PONG
→ interroge Redis avec la commande PING, qui répond PONG uniquement
  si le serveur est réellement opérationnel et accessible avec ce mot de passe
```

---

## 21.3 `depends_on: condition: service_healthy` : la vraie solution

```yaml
# [compose.yaml, complet — reprend le projet du chapitre 20]
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD-SHELL", "redis-cli -a ${REDIS_PASSWORD} ping | grep PONG"]
      interval: 5s
      timeout: 3s
      retries: 5

  backend:
    build: ./backend
    environment:
      DB_HOST: db
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:4000/health || exit 1"]
      interval: 10s
      timeout: 3s
      start_period: 5s
      retries: 3

  nginx:
    build:
      context: ./frontend
      args:
        VITE_API_URL: /api
    ports:
      - "8080:80"
    depends_on:
      backend:
        condition: service_healthy

volumes:
  db-data:
  redis-data:
```

**Explication du changement décisif :**
```yaml
depends_on:
  db:
    condition: service_healthy
```
**contre l'ancienne forme simple**
```yaml
depends_on:
  - db
```

> 📌 **À retenir — la correction définitive** — Avec `condition: service_healthy`, Compose ne démarre `backend` qu'**après** que `db` ait été jugée `healthy` par son propre `HEALTHCHECK` (donc réellement prête à accepter des connexions, pas seulement démarrée) — et de même pour `redis`, puis pour `nginx` qui attend que `backend` lui-même soit `healthy`. C'est une chaîne complète de dépendances **réelles**, remplaçant l'illusion de garantie de la forme simple utilisée jusqu'ici.

```bash
# [Terminal] — reproduire le test du chapitre 20, cette fois sans l'échec initial
docker compose down
docker compose up -d --build
curl http://localhost:8080/api/tasks
```

**Résultat attendu, cette fois systématiquement :** une réponse réussie dès le premier essai, sans le "connect ECONNREFUSED" observé aux chapitres 13 et 20 — parce que `nginx` n'a même pas démarré avant que `backend` (lui-même attendant `db` et `redis` `healthy`) ne soit prêt.

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Cause | Solution |
|---|---|---|
| Un service reste indéfiniment `starting`, jamais `healthy` | La commande de test du healthcheck échoue systématiquement (mauvais chemin, mauvais port, outil absent de l'image) | Tester la commande manuellement avec `docker compose exec service la-commande` |
| `depends_on: condition: service_healthy` refusé par Compose | Ancienne syntaxe `depends_on: - db` mélangée par erreur avec la forme à conditions | Utiliser uniformément la forme longue (par service, avec `condition:`) dès qu'une condition est nécessaire sur au moins une dépendance |
| Le service semble bloqué en `unhealthy` juste après un démarrage normal | `start_period` trop court pour une application qui a réellement besoin de plus de temps pour s'initialiser | Augmenter `start_period` en conséquence |
| `pg_isready`/`redis-cli` introuvables dans un `healthcheck` personnalisé sur une AUTRE image | Ces outils sont fournis par les images officielles PostgreSQL/Redis spécifiquement, pas universels | Vérifier la disponibilité de l'outil choisi dans l'image concernée avant de l'utiliser dans un test |

---

## Laboratoire pratique n°1 — Ajouter un healthcheck au backend

**Objectifs :** exécuter la section 21.1 sur le projet du chapitre 20.
**Prérequis :** Chapitre 20.

**Étapes :** ajoute le `HEALTHCHECK` de la section 21.1 au `backend/Dockerfile`, reconstruis, et observe `(healthy)` apparaître dans `docker compose ps` après le délai de `start_period`.

**Résultat attendu :** `backend` passe de `starting` à `healthy` en quelques secondes, visible dans `docker compose ps`.

---

## Laboratoire pratique n°2 — Healthchecks Compose pour `db` et `redis`

**Objectifs :** exécuter la section 21.2.
**Prérequis :** Laboratoire 1 complété.

**Étapes :** ajoute les blocs `healthcheck:` de la section 21.2 à `db` et `redis`, reconstruis, et confirme leur état `healthy` dans `docker compose ps`.

**Résultat attendu :** les quatre services (`db`, `redis`, `backend`, `nginx`) affichent tous `(healthy)` une fois pleinement démarrés (`nginx`, sans propre healthcheck ici, reste simplement `Up`, ce qui est acceptable puisqu'il ne sert que du contenu statique et un proxy sans état interne à vérifier).

---

## Laboratoire pratique n°3 — Corriger définitivement la course au démarrage

**Objectifs :** confirmer, par la répétition du test des chapitres 13/20, que le problème est résolu.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :**
1. Applique `depends_on: condition: service_healthy` partout où c'est pertinent (section 21.3).
2. `docker compose down` puis `docker compose up -d --build`, immédiatement suivi d'un `curl http://localhost:8080/api/tasks` **sans délai d'attente**.
3. Répète ce test complet (down puis up puis curl immédiat) au moins trois fois de suite.

**Résultat attendu :** succès systématique, à chaque répétition — contrairement au comportement aléatoire observé aux chapitres 13 et 20.

---

## Exercices

1. Explique la différence entre un conteneur `Up` et un conteneur `healthy`.
2. Que fait `start_period`, et pourquoi son absence pourrait-elle faire basculer un service en `unhealthy` à tort ?
3. Pourquoi `pg_isready` est-il un meilleur choix de test de santé pour PostgreSQL qu'une simple vérification "le port 5432 répond-il" ?
4. Que se passe-t-il pour `nginx` si `backend` ne devient jamais `healthy` ?
5. Pourquoi ce chapitre n'a-t-il ajouté aucun `HEALTHCHECK` à `nginx` lui-même ?

---

## Quiz

**Question 1.** Un conteneur `Up` sans `HEALTHCHECK` défini :
a) Est automatiquement considéré `healthy`
b) N'a simplement aucun état de santé jugé, juste "démarré"
c) Bascule toujours en `unhealthy` après 30 secondes
d) Ne peut jamais être utilisé par `depends_on`

**Question 2.** `depends_on: condition: service_healthy` diffère de la forme simple `depends_on: - service` en ce qu'elle :
a) Attend que le service dépendant soit jugé réellement prêt, pas seulement démarré
b) N'a aucun effet supplémentaire
c) Empêche définitivement deux services de communiquer
d) Remplace le besoin d'un réseau Compose

**Question 3.** `start_period` dans un `HEALTHCHECK` sert à :
a) Définir le délai total avant l'arrêt du conteneur
b) Accorder une période de grâce au démarrage, sans compter ses échecs vers le seuil `unhealthy`
c) Retarder la publication des ports
d) Chiffrer les communications internes

**Question 4.** `pg_isready` est :
a) Un outil générique disponible dans toutes les images Docker
b) Un utilitaire fourni par l'image officielle PostgreSQL, spécifiquement conçu pour vérifier sa disponibilité
c) Une commande Docker native
d) Un remplaçant de `docker compose ps`

**Question 5.** Après avoir ajouté tous les healthchecks et conditions de ce chapitre, un `curl` immédiat après `docker compose up -d` :
a) Continue d'échouer aléatoirement comme avant
b) Réussit systématiquement, car chaque service attend que ses dépendances soient réellement prêtes
c) N'a plus aucun rapport avec l'ordre de démarrage
d) Nécessite toujours un délai manuel

> 🔑 **Corrigé** — 1: b · 2: a · 3: b · 4: b · 5: b

---

## 📝 Résumé du chapitre

- `HEALTHCHECK` (Dockerfile) ou `healthcheck:` (Compose) juge la santé réelle d'un conteneur via une commande exécutée périodiquement, produisant les états `starting`, `healthy`, `unhealthy`.
- Les images officielles PostgreSQL et Redis fournissent des outils dédiés (`pg_isready`, `redis-cli ping`) parfaitement adaptés à un healthcheck fiable, sans reconstruction d'image nécessaire.
- `depends_on: condition: service_healthy` est la correction définitive à la limite de `depends_on` observée aux chapitres 13, 16 et 20 : un service n'attend plus seulement que ses dépendances soient démarrées, mais qu'elles soient réellement prêtes.
- Cette chaîne de conditions (`db`/`redis` → `backend` → `nginx`) élimine la course au démarrage, vérifiée par une répétition du test qui échouait auparavant.

## ✅ Checklist avant de passer au chapitre 22

- [ ] J'ai ajouté un `HEALTHCHECK` au backend et vérifié son état `healthy`.
- [ ] J'ai ajouté des `healthcheck:` Compose à `db` et `redis`.
- [ ] J'ai remplacé `depends_on` simple par `condition: service_healthy` partout où c'est pertinent.
- [ ] J'ai confirmé, par répétition, la disparition de la course au démarrage.
- [ ] J'ai réalisé les trois laboratoires de ce chapitre.
- [ ] J'ai obtenu au moins 4/5 au quiz.

---

## Glossaire du chapitre

**`HEALTHCHECK`**
Définition simple : une commande exécutée périodiquement pour juger si un conteneur est réellement opérationnel (rappel du chapitre 6).
Voir : Chapitre 6, section 6.9 ; Chapitre 21, sections 21.1-21.2.

**État de santé (`starting`/`healthy`/`unhealthy`)**
Définition simple : le statut affiché par `docker ps`/`docker compose ps` pour un conteneur doté d'un healthcheck.
Voir : Chapitre 21, section 21.1.

**`condition: service_healthy`**
Définition simple : une variante de `depends_on` qui attend l'état `healthy` d'un service, pas seulement son démarrage.
Voir : Chapitre 21, section 21.3.

---

## ❓ FAQ

**Un healthcheck consomme-t-il des ressources significatives ?**
Marginalement — chaque intervalle exécute une commande légère (`pg_isready`, une requête HTTP simple). L'impact est négligeable comparé au bénéfice de fiabilité, sauf intervalle exagérément court sur un très grand nombre de conteneurs.

**Que se passe-t-il si un service passe de `healthy` à `unhealthy` en cours de fonctionnement, pas seulement au démarrage ?**
Docker continue de le signaler comme `unhealthy` dans `docker ps`, mais ne le redémarre **pas** automatiquement par défaut — une politique de redémarrage (`restart:`, approfondie au chapitre 35) ou une supervision externe (chapitre 34) sont nécessaires pour agir sur ce signal.

**Faut-il un healthcheck sur absolument tous les services, y compris `nginx` ici ?**
Pas obligatoirement — `nginx` sert du contenu statique et un simple proxy, sans état interne complexe à vérifier au-delà de "le conteneur tourne-t-il". Un healthcheck reste possible (vérifier que `nginx` répond sur le port 80) mais apporte moins de valeur qu'un backend qui dépend, lui, de services externes pouvant réellement ne pas être prêts.

---

## Références officielles

- `HEALTHCHECK` (Dockerfile) — [docs.docker.com/reference/dockerfile/#healthcheck](https://docs.docker.com/reference/dockerfile/#healthcheck)
- `healthcheck` et `depends_on` (Compose) — [docs.docker.com/reference/compose-file/services/#healthcheck](https://docs.docker.com/reference/compose-file/services/#healthcheck)
- `pg_isready` — [postgresql.org/docs/current/app-pg-isready.html](https://www.postgresql.org/docs/current/app-pg-isready.html)

---

## Conclusion

La Partie V se termine avec une architecture dont le démarrage est enfin fiable, pas seulement fonctionnel la plupart du temps. La Partie VI s'attaque à l'exploitation au quotidien — logs, debugging, nettoyage — les réflexes nécessaires une fois qu'une application tourne réellement, jour après jour.

---

⬅️ [Chapitre 20 — Application full stack complète](20-application-full-stack-complete.md) · ➡️ **Suite : Chapitre 22 — Consulter et interpréter les logs**
