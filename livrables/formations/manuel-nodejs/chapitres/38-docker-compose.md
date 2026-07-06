<div class="chapitre-titre-num">CHAPITRE 38</div>

# Docker Compose

## Objectifs pédagogiques

Orchestrer plusieurs conteneurs liés (API + base de données + outil d'administration) avec Docker Compose, pour un environnement de développement reproductible en une seule commande.

## 38.1 Le problème résolu par Docker Compose

Une API réelle ne fonctionne jamais seule : elle a besoin d'une base de données, parfois d'un cache (Redis), d'un outil d'administration. Lancer et connecter manuellement plusieurs conteneurs séparés (`docker run` répété, gestion manuelle du réseau entre eux) devient vite fastidieux. **Docker Compose** décrit **tous** ces services dans un seul fichier YAML, démarrés/arrêtés ensemble en une seule commande.

## 38.2 Fichier docker-compose.yml de base

```yaml
# docker-compose.yml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:motdepasse@db:5432/mabase
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    volumes:
      - ./src:/app/src # synchronise le code local avec le conteneur, utile en développement

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=motdepasse
      - POSTGRES_DB=mabase
    ports:
      - "5432:5432"
    volumes:
      - donnees_postgres:/var/lib/postgresql/data # PERSISTE les données entre redémarrages

volumes:
  donnees_postgres:
```

<div class="encadre astuce">
<span class="encadre-titre">💡 db : le nom du service devient un nom d'hôte résolvable</span>
Remarque essentielle : `DATABASE_URL` référence l'hôte `db` (pas `localhost`) — Docker Compose crée automatiquement un réseau interne où **chaque service est accessible par son nom** défini dans le fichier YAML, comme s'il s'agissait d'un vrai nom de domaine.
</div>

## 38.3 Commandes Docker Compose essentielles

```
$ docker compose up              # démarre TOUS les services définis
$ docker compose up -d            # démarre en arrière-plan (detached)
$ docker compose up --build       # reconstruit les images avant de démarrer (après modification du Dockerfile)
$ docker compose down             # arrête et supprime les conteneurs (garde les volumes par défaut)
$ docker compose down -v          # arrête ET supprime aussi les volumes (perte des données persistées !)
$ docker compose logs -f api      # suit les logs du service "api" en continu
$ docker compose exec api sh      # ouvre un terminal dans le conteneur "api" en cours d'exécution
```

## 38.4 Volumes : persister les données entre redémarrages

<div class="encadre attention">
<span class="encadre-titre">⚠️ Sans volume nommé, les données de la base disparaissent à chaque docker compose down</span>
Un conteneur est, par nature, **éphémère** : son système de fichiers interne disparaît à sa suppression. Le `volume` nommé (`donnees_postgres` dans l'exemple) stocke les données **en dehors** du cycle de vie du conteneur, sur le système hôte, garantissant leur persistance même après un `docker compose down` (sans `-v`).
</div>

## 38.5 Ajouter un outil d'administration (pgAdmin)

```yaml
services:
  # ... api et db comme précédemment ...

  pgadmin:
    image: dpage/pgadmin4
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@monapp.com
      - PGADMIN_DEFAULT_PASSWORD=motdepasse
    ports:
      - "5050:80"
    depends_on:
      - db
```

## 38.6 Fichiers Compose distincts par environnement

```yaml
# docker-compose.override.yml — fusionné AUTOMATIQUEMENT avec docker-compose.yml en développement
services:
  api:
    volumes:
      - ./src:/app/src # rechargement à chaud, utile SEULEMENT en développement
    command: npm run dev # nodemon plutôt que "node server.js"
```

```
$ docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d # explicite, pour la production
```

<div class="encadre astuce">
<span class="encadre-titre">💡 docker-compose.override.yml est chargé automatiquement</span>
Docker Compose fusionne automatiquement `docker-compose.override.yml` avec `docker-compose.yml` si aucun fichier n'est explicitement précisé via `-f` — une convention pratique pour garder une configuration de base commune, complétée par des ajustements spécifiques au développement local, sans dupliquer tout le fichier.
</div>

## 38.7 depends_on ne garantit pas que le service est "prêt"

<div class="encadre attention">
<span class="encadre-titre">⚠️ depends_on attend que le CONTENEUR démarre, pas que la base de données soit PRÊTE à accepter des connexions</span>
`depends_on: - db` garantit seulement que le conteneur `db` est **démarré** avant `api`, pas que PostgreSQL a fini son initialisation interne et accepte déjà des connexions — un démarrage de l'API légèrement trop rapide peut échouer à se connecter à une base "presque prête".
</div>

```yaml
services:
  db:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    depends_on:
      db:
        condition: service_healthy # attend que le HEALTHCHECK de "db" soit VALIDÉ, pas juste démarré
```

## 38.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Utiliser localhost au lieu du nom du service dans la configuration de l'API</span>
```yaml
environment:
  - DATABASE_URL=postgresql://postgres:motdepasse@localhost:5432/mabase # ❌ "localhost" = le conteneur API lui-même !
```
Depuis l'intérieur d'un conteneur, `localhost` désigne **ce conteneur précis**, jamais un autre service du même `docker-compose.yml` — il faut utiliser le nom du service (`db`) comme nom d'hôte, rappel de la section 38.2.
</div>

## 38.9 Résumé du chapitre

- Docker Compose orchestre plusieurs conteneurs liés (API, base de données, outils) via un unique fichier YAML.
- Chaque service est accessible depuis les autres via son **nom** défini dans le fichier, pas via `localhost`.
- Les volumes nommés persistent les données au-delà du cycle de vie éphémère des conteneurs.
- `depends_on` seul ne garantit qu'un démarrage de conteneur, pas une réelle disponibilité du service — `condition: service_healthy` avec un `healthcheck` est nécessaire pour une vraie garantie.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 38.1</span>

Ajoute un service Redis au `docker-compose.yml` de la section 38.2, avec un volume nommé pour la persistance.
</div>

**Corrigé :**
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - donnees_redis:/data

volumes:
  donnees_redis:
```

*Chapitre suivant : le déploiement en production, au-delà de l'environnement de développement local.*
