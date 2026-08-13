<div class="chapitre-titre-num">CHAPITRE 38</div>

# Docker Compose

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Orchestrer plusieurs conteneurs liés (API + base de données + outil d'administration) avec Docker Compose, pour un environnement de développement reproductible en une seule commande. À la fin de ce chapitre, tu sauras pourquoi `localhost` ne signifie jamais ce qu'on croit à l'intérieur d'un conteneur, et comment garantir qu'une API ne démarre jamais avant que sa base de données ne soit réellement prête.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Un nouveau développeur rejoint l'équipe et configure son environnement en suivant le README. Son API refuse obstinément de se connecter à la base de données, avec une erreur `ECONNREFUSED`, alors que la base tourne visiblement bien (`docker ps` la montre active). Il a copié `DATABASE_URL=postgresql://postgres:motdepasse@localhost:5432/mabase` depuis un ancien projet sans conteneur. Ce chapitre explique précisément pourquoi `localhost`, à l'intérieur d'un conteneur, ne désigne jamais ce que l'on croit — et comment Docker Compose résout élégamment ce problème via son réseau interne.
</div>

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

```mermaid
flowchart TD
    subgraph Hote["Machine hote (ton ordinateur)"]
        Port3000["Port 3000 expose"]
        Port5432["Port 5432 expose"]
    end
    subgraph Reseau["Reseau interne Docker Compose (cree automatiquement)"]
        API["Conteneur 'api'\nlocalhost = CE conteneur lui-meme"]
        DB["Conteneur 'db'\naccessible par les AUTRES\nservices via le nom 'db'"]
        API -->|"postgresql://...@db:5432/..."| DB
    end
    Port3000 -.-> API
    Port5432 -.-> DB
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Explication du schéma</span>
Chaque conteneur a son **propre** `localhost`, isolé des autres — c'est précisément le piège de la mise en situation d'ouverture. Docker Compose crée un réseau interne dédié où chaque service peut joindre les autres, mais uniquement en utilisant leur **nom de service** (`db`, `api`) comme nom d'hôte, jamais `localhost`. Les ports "exposés" (`ports:`) ne servent qu'à rendre un service joignable depuis la machine hôte (ton navigateur, Postman), pas entre les conteneurs eux-mêmes.
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

## Atelier — Diagnostiquer et corriger le problème de la mise en situation

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 38 — localhost vs nom de service, en conditions réelles</span>

**Objectif** : reproduire puis corriger exactement l'erreur du nouveau développeur de la mise en situation d'ouverture.

**Préparation** : le `docker-compose.yml` de la section 38.2.

**Étapes détaillées** :
1. Modifie volontairement `DATABASE_URL` pour utiliser `localhost` au lieu de `db`.
2. Lance `docker compose up` et observe l'erreur de connexion côté API (`ECONNREFUSED` ou équivalent).
3. Entre dans le conteneur API (`docker compose exec api sh`) et tente un `ping db` : observe que ça fonctionne (le nom de service EST résolvable depuis l'intérieur).
4. Tente un `ping localhost` depuis ce même conteneur : observe qu'il se répond à lui-même, pas à la base de données.
5. Corrige `DATABASE_URL` pour utiliser `db`, relance : la connexion doit réussir.

**Validation** : après correction, l'API doit se connecter avec succès à la base de données dès le démarrage, sans erreur `ECONNREFUSED`.

**Résultat attendu** : la compréhension expérimentale (pas seulement théorique) de pourquoi `localhost` désigne toujours le conteneur courant, jamais un autre service.

**Dépannage** : si `ping db` échoue aussi, vérifie que les deux services sont bien définis dans le même fichier `docker-compose.yml` et démarrés ensemble (le réseau interne n'est créé qu'entre services d'un même projet Compose).

**Nettoyage** : `docker compose down` pour arrêter proprement les conteneurs de test.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Utiliser localhost au lieu du nom du service dans la configuration de l'API</span>

```yaml
environment:
  - DATABASE_URL=postgresql://postgres:motdepasse@localhost:5432/mabase # ❌ "localhost" = le conteneur API lui-même !
```
Depuis l'intérieur d'un conteneur, `localhost` désigne **ce conteneur précis**, jamais un autre service du même `docker-compose.yml` — il faut utiliser le nom du service (`db`) comme nom d'hôte, rappel de la section 38.2. Exactement l'erreur du nouveau développeur de la mise en situation d'ouverture.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Compter uniquement sur depends_on sans condition de santé</span>
Sur une machine lente ou sous forte charge, l'API peut démarrer avant que PostgreSQL n'accepte réellement des connexions, même avec `depends_on` — nécessitant `condition: service_healthy` (section 38.7) pour une vraie garantie.
</div>

## Débogage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : ECONNREFUSED alors que le service de base de données tourne visiblement (docker ps)</span>

- **Cause probable** : utilisation de `localhost` au lieu du nom du service dans la chaîne de connexion (erreur fréquente n°1, exactement la mise en situation d'ouverture).
- **Diagnostic** : vérifier la variable `DATABASE_URL` (ou équivalent) utilisée par le service API.
- **Solution** : remplacer par le nom du service tel que défini dans `docker-compose.yml`.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : l'API échoue à se connecter uniquement au tout premier démarrage, jamais ensuite</span>

- **Cause probable** : `depends_on` sans `condition: service_healthy` — la base n'était pas encore prête au moment exact du démarrage de l'API.
- **Solution** : ajouter un `healthcheck` à la base de données et `condition: service_healthy` côté API (section 38.7).
</div>

## En entreprise

- **docker-compose.yml comme documentation vivante de l'architecture** : de nombreuses équipes considèrent ce fichier comme la description la plus à jour des services d'un projet et de leurs dépendances — souvent plus fiable qu'une documentation séparée qui devient obsolète.
- **Onboarding en une commande** : `docker compose up` comme unique étape d'installation pour un nouveau développeur est un objectif courant en entreprise, éliminant les problèmes de configuration locale — exactement ce que la mise en situation d'ouverture visait, avant l'erreur de copier-coller.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi localhost ne fonctionne-t-il pas pour qu'un conteneur en joigne un autre ?"**
Réponse attendue : chaque conteneur a son propre espace réseau isolé ; `localhost` désigne toujours le conteneur courant lui-même, jamais un autre service du même projet Compose — il faut utiliser le nom du service comme nom d'hôte.

**Q2. "Que garantit depends_on, et que ne garantit-il pas ?"**
Réponse attendue : garantit seulement que le conteneur dépendant démarre après que l'autre conteneur a démarré, pas que le service à l'intérieur (comme PostgreSQL) est réellement prêt à accepter des connexions — `condition: service_healthy` avec un healthcheck est nécessaire pour cette garantie.

**Q3. "Pourquoi un volume nommé est-il nécessaire pour une base de données en Docker Compose ?"**
Réponse attendue : un conteneur est éphémère, son système de fichiers disparaît à sa suppression ; un volume nommé stocke les données en dehors de ce cycle de vie, garantissant leur persistance entre redémarrages.
</div>

## Optimisation, sécurité et maintenabilité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Ne jamais exposer publiquement le port de la base de données (`ports: - "5432:5432"`) sur un environnement accessible depuis l'extérieur — en développement local c'est acceptable, en production ce port ne devrait être accessible qu'au réseau interne des conteneurs, jamais exposé directement.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documenter dans le `README.md` du projet la commande exacte pour démarrer l'environnement complet (`docker compose up`) — l'objectif d'onboarding en une seule commande de la section "En entreprise".
</div>

## Résumé du chapitre

- Docker Compose orchestre plusieurs conteneurs liés (API, base de données, outils) via un unique fichier YAML.
- Chaque service est accessible depuis les autres via son **nom** défini dans le fichier, pas via `localhost` — l'erreur la plus fréquente de ce chapitre.
- Les volumes nommés persistent les données au-delà du cycle de vie éphémère des conteneurs.
- `depends_on` seul ne garantit qu'un démarrage de conteneur, pas une réelle disponibilité du service — `condition: service_healthy` avec un `healthcheck` est nécessaire pour une vraie garantie.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM</span>

1. Comment un service "api" doit-il référencer un service "db" dans le même docker-compose.yml ?
   - a) Via localhost
   - b) Via le nom du service "db"
   - c) Via l'adresse IP publique du serveur
   - d) Ce n'est pas possible

2. Que garantit depends_on à lui seul ?
   - a) Que le service dépendant est totalement prêt à recevoir des requêtes
   - b) Que le conteneur a démarré, sans garantie sur sa disponibilité réelle
   - c) Rien du tout
   - d) Que les données sont persistées

3. Pourquoi utiliser un volume nommé pour une base de données ?
   - a) Pour améliorer les performances réseau
   - b) Pour persister les données au-delà du cycle de vie du conteneur
   - c) C'est obligatoire techniquement pour PostgreSQL
   - d) Pour réduire la taille de l'image

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. localhost, depuis un conteneur, désigne un autre service du même docker-compose.yml. — **Faux** (désigne le conteneur lui-même).
2. docker compose down -v supprime aussi les volumes, donc les données persistées. — **Vrai**.
3. depends_on avec condition: service_healthy attend que le healthcheck soit validé, pas juste que le conteneur démarre. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Question ouverte</span>

Pourquoi l'erreur du nouveau développeur de la mise en situation d'ouverture ("copier-coller depuis un ancien projet sans conteneur") est-elle particulièrement facile à commettre, et comment l'éviter structurellement pour toute l'équipe ?

**Corrigé** : `localhost:5432` fonctionne parfaitement pour un projet sans Docker (PostgreSQL installé directement sur la machine), rendant l'habitude naturelle et le copier-coller tentant — l'erreur n'est visible qu'une fois le projet réellement conteneurisé. Pour l'éviter structurellement, le `.env.example` du projet (rappel du chapitre 12) devrait déjà contenir la bonne valeur avec le nom du service Docker Compose, pas une valeur générique à adapter — éliminant le risque de copier-coller depuis une autre source.
</div>

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

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais écrire un docker-compose.yml avec API et base de données.</li>
<li>☐ Je référence toujours les autres services par leur nom, jamais par localhost.</li>
<li>☐ Je sais utiliser des volumes nommés pour persister les données.</li>
<li>☐ Je sais combiner depends_on avec condition: service_healthy pour une vraie garantie de disponibilité.</li>
<li>☐ Je sais utiliser docker-compose.override.yml pour des ajustements de développement.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Docker Compose est-il adapté à un déploiement de production réel ?</dt>
<dd>Pour de petits projets ou un serveur unique, oui, avec un fichier Compose de production dédié. À plus grande échelle (plusieurs serveurs, haute disponibilité), un orchestrateur comme Kubernetes devient plus adapté — hors périmètre de ce manuel.</dd>

<dt>Peut-on utiliser Docker Compose sans jamais construire d'image personnalisée ?</dt>
<dd>Oui, un service peut utiliser directement une image publique existante (`image: postgres:16-alpine`) sans jamais avoir de `Dockerfile` propre — seuls les services nécessitant du code personnalisé (comme l'API) ont besoin de `build: .`.</dd>

<dt>Comment partager un docker-compose.yml entre développeurs sans exposer de vrais secrets ?</dt>
<dd>Utiliser `${VARIABLE}` référençant un fichier `.env` local (jamais commité, rappel du chapitre 12), avec un `.env.example` commité documentant les variables attendues.</dd>
</dl>

## Références et pour aller plus loin

- Documentation Docker Compose : [https://docs.docker.com/compose/](https://docs.docker.com/compose/)
- Référence complète du fichier Compose : [https://docs.docker.com/compose/compose-file/](https://docs.docker.com/compose/compose-file/)

*Chapitre suivant : le déploiement en production, au-delà de l'environnement de développement local.*
