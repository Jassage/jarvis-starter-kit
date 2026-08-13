<div class="chapitre-titre-num">CHAPITRE 51 · 🔴 PROFESSIONNEL</div>

# Projet final : conteneurisation

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Conteneuriser GestionTâches : un Dockerfile professionnel pour l'API et le frontend, un `compose.yaml` complet orchestrant API, frontend, PostgreSQL. Ce chapitre couvre les phases 5-6 du projet final, appliquant directement les chapitres 12 et 13 à l'application développée au chapitre 50.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
GestionTâches fonctionne en local, mais dépend encore de l'environnement spécifique de ta machine (version de Node.js installée, PostgreSQL local). Ce chapitre élimine cette dépendance en empaquetant chaque composant dans une image Docker reproductible — la même image tournera, à l'identique, sur ton serveur de laboratoire, puis en production (chapitre 52).
</div>

## 51.1 Dockerfile de l'API

```dockerfile
# api/Dockerfile
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app .
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"
CMD ["node", "index.js"]
```

**Explication :** ce Dockerfile applique intégralement le chapitre 12 — cache optimisé (dépendances copiées avant le code, section 12.3), multi-stage build (section 12.4, même si l'API n'a pas de compilation à proprement parler, la structure reste cohérente avec le reste du portefeuille), utilisateur non-root (section 12.5), healthcheck (section 12.6) écrit en Node.js pur plutôt que `curl` (absent de l'image `slim`, exactement le même choix déjà justifié pour l'exemple Python du chapitre 12, section 12.7).

## 51.2 Dockerfile du frontend

```dockerfile
# frontend/Dockerfile
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**Explication :** reprend exactement l'exemple React du chapitre 12 (section 12.7) — l'étape de build Node.js disparaît entièrement de l'image finale, qui ne contient plus que Nginx et les fichiers statiques compilés.

```nginx
# frontend/nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://api:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Explication :** ce fichier route `/api/*` vers le conteneur `api` (résolution par nom, chapitre 11, section 11.5) et sert le reste comme une application React classique (`try_files ... /index.html`, nécessaire pour le routage côté client) — le même Nginx qui deviendra, au chapitre 52, le point d'entrée public complet de l'application.

## 51.3 `compose.yaml` complet

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      api:
        condition: service_healthy

  api:
    build: ./api
    environment:
      DATABASE_URL: postgres://gestiontaches:${DB_PASSWORD}@db:5432/gestiontaches
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 10s
      retries: 3

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: gestiontaches
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: gestiontaches
    volumes:
      - donnees-db:/var/lib/postgresql/data
      - ./api/migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gestiontaches"]
      interval: 5s
      retries: 5

volumes:
  donnees-db:
```

**Explication :** cette architecture reprend exactement le chapitre 13 (section 13.3) — seul `frontend` publie un port (section 13.4, seul le point d'entrée exposé publiquement) ; `${DB_PASSWORD}` provient d'un fichier `.env` non versionné (chapitre 18, préparant directement le chapitre 25) ; le montage de `./api/migrations` dans `/docker-entrypoint-initdb.d` applique automatiquement les migrations SQL du chapitre 50 au premier démarrage de PostgreSQL — une convention native à l'image officielle `postgres`.

```bash
# .env (jamais versionné, chapitre 18)
DB_PASSWORD=un-mot-de-passe-fort-genere-localement
```

```bash
# .env.example (versionné, chapitre 18)
DB_PASSWORD=
```

## Atelier — GestionTâches, entièrement conteneurisé

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 51.1 — Une seule commande pour démarrer toute l'application</span>

**Objectif** : faire tourner GestionTâches entièrement via Docker Compose, sans plus aucune dépendance à un Node.js ou PostgreSQL installés directement sur la machine.

**Étapes détaillées** :

1. Écris les deux Dockerfiles (sections 51.1-51.2) et le `compose.yaml` (section 51.3) pour le projet du chapitre 50.
2. Crée `.env` avec un vrai mot de passe, `.env.example` versionné avec une valeur vide.
3. `docker compose up -d --build`, vérifie que les trois services démarrent dans le bon ordre (`docker compose ps`, tous `healthy`).
4. Vérifie que l'application est utilisable via `http://localhost` (le frontend, qui route lui-même vers l'API).
5. Modifie une ligne de l'API, relance `docker compose up -d --build`, vérifie que seule l'image de l'API se reconstruit grâce au cache (chapitre 12, section 12.3).

**Résultat attendu** : GestionTâches entièrement fonctionnelle en une seule commande, sur n'importe quelle machine disposant de Docker — la portabilité promise depuis le chapitre 1 (le problème du "ça marche sur ma machine"), désormais réellement résolue pour ce projet.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Exposer le port de PostgreSQL directement</span>
Ajouter `ports: ["5432:5432"]` au service `db` "pour déboguer plus facilement" contredit directement le principe de la section 51.3 — seul `frontend` devrait être exposé publiquement, conformément au chapitre 13 (section 13.4).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Un `.env` versionné par erreur</span>
Rappel du chapitre 18 : vérifier `.gitignore` avant de commiter quoi que ce soit de nouveau dans ce chapitre, particulièrement le fichier `.env` réel créé à l'atelier 51.1.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Oublier `depends_on` avec `condition: service_healthy`</span>
Sans cette condition (chapitre 13, section 13.2), l'API pourrait démarrer avant que PostgreSQL ne soit réellement prêt à accepter des connexions, provoquant une erreur de connexion au tout premier démarrage.
</div>

## En entreprise

**Réalité répandue** : la conteneurisation d'un projet réel suit presque toujours exactement cette séquence — Dockerfile par composant, puis assemblage via Compose — rarement dans l'ordre inverse.

**Bonne pratique répandue** : le montage de migrations SQL via `/docker-entrypoint-initdb.d` (section 51.3) convient bien à un environnement de développement local ou de démonstration ; en production, les migrations sont généralement appliquées explicitement par le pipeline de déploiement (chapitre 27), pas automatiquement au démarrage du conteneur de base de données — une nuance approfondie au chapitre 53.

**Erreur classique observée** : des Dockerfiles copiés d'un projet à l'autre sans adaptation, oubliant parfois l'utilisateur non-root ou le healthcheck sur un nouveau projet — un rappel que chaque nouveau projet mérite une relecture consciente du Dockerfile, pas un simple copier-coller aveugle.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Comment as-tu structuré la conteneurisation d'une application avec un frontend, une API et une base de données ?"**
Réponse attendue : reprendre la structure de ce chapitre — un Dockerfile multi-stage par composant, un `compose.yaml` avec `depends_on`/`condition: service_healthy`, seul le frontend exposé publiquement (sections 51.1-51.3).

**Q2. "Pourquoi le healthcheck de l'API de ce projet utilise-t-il Node.js plutôt que `curl` ?"**
Réponse attendue : l'image `node:20-slim` ne contient pas `curl` par défaut ; utiliser directement Node.js pour la vérification HTTP évite d'installer un outil supplémentaire uniquement pour cet usage (section 51.1, rappel du chapitre 12).

**Q3. "Où appliquerais-tu les migrations de base de données pour ce projet en production, par rapport à l'approche locale de ce chapitre ?"**
Réponse attendue : explicitement dans le pipeline de déploiement (chapitre 27), pas via le montage automatique `/docker-entrypoint-initdb.d` réservé au développement local (section "En entreprise") — approfondi concrètement au chapitre 53.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Le mot de passe PostgreSQL (`DB_PASSWORD`) suit déjà, dès cette phase, la doctrine complète du chapitre 25 — jamais en clair dans `compose.yaml` versionné, toujours via `.env` non versionné.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Garde les deux Dockerfiles et le `compose.yaml` versionnés dans Git dès leur création (chapitre 7) — la conteneurisation d'un projet fait partie intégrante de son code, pas une annexe séparée.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Le cache de build (section 51.1, rappel chapitre 12 section 12.3) rend les reconstructions ultérieures rapides — un bénéfice immédiatement mesurable dès ce chapitre, comme vérifié à l'étape 5 de l'atelier 51.1.
</div>

## Résumé du chapitre

- L'API et le frontend de GestionTâches sont chacun conteneurisés avec un Dockerfile professionnel (cache optimisé, multi-stage, non-root, healthcheck).
- Le `compose.yaml` orchestre les trois services (frontend, API, base de données), avec seul le frontend exposé publiquement.
- `depends_on` avec `condition: service_healthy` garantit un démarrage dans le bon ordre, sans erreur de connexion prématurée.
- Les migrations SQL s'appliquent automatiquement en local via `/docker-entrypoint-initdb.d`, une convention réservée au développement, pas à la production.
- L'application tourne désormais de façon identique sur n'importe quelle machine disposant de Docker.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Dans le `compose.yaml` de GestionTâches, quel service devrait être le seul exposé publiquement ?
   - a) `db`
   - b) `frontend`
   - c) Tous les services
   - d) `api` uniquement

2. Le healthcheck de l'API utilise Node.js plutôt que `curl` parce que :
   - a) Node.js est plus rapide
   - b) `curl` n'est pas installé par défaut dans l'image `node:20-slim`
   - c) `curl` est interdit par sécurité
   - d) Aucune raison particulière

3. `/docker-entrypoint-initdb.d` sert à :
   - a) Configurer le réseau
   - b) Appliquer automatiquement des scripts SQL au premier démarrage d'un conteneur PostgreSQL
   - c) Chiffrer la base de données
   - d) Créer un nouveau conteneur

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Le port de PostgreSQL devrait être publié publiquement pour faciliter le débogage. — **Faux** (section "Erreurs fréquentes", erreur n°1).
2. `/docker-entrypoint-initdb.d` est la méthode recommandée pour appliquer les migrations en production. — **Faux** (section "En entreprise").
3. `depends_on` avec `condition: service_healthy` garantit que l'API attend réellement que la base soit prête. — **Vrai** (section 51.3, rappel chapitre 13).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 51.1</span>

Explique pourquoi le Dockerfile du frontend (section 51.2) n'a pas besoin d'un utilisateur non-root explicitement configuré, contrairement à celui de l'API (section 51.1).
</div>

**Corrigé :** l'image finale du frontend est basée sur `nginx:1.27-alpine`, dont le processus Nginx officiel est déjà configuré pour ne pas nécessiter un accès root pour ses opérations courantes de service de fichiers statiques (contrairement à l'exécution directe de code Node.js applicatif de l'API, qui bénéficie explicitement d'un cantonnement supplémentaire). Dans un contexte de sécurité renforcée (chapitre 36), il resterait néanmoins possible de vérifier et configurer explicitement l'utilisateur du processus Nginx pour une rigueur maximale — un raffinement que ce chapitre laisse volontairement de côté pour rester concentré sur l'essentiel du processus de conteneurisation.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ J'ai écrit un Dockerfile professionnel pour l'API de GestionTâches (cache, multi-stage, non-root, healthcheck).</li>
<li>☐ J'ai écrit un Dockerfile professionnel pour le frontend, avec Nginx en reverse proxy vers l'API.</li>
<li>☐ J'ai écrit un `compose.yaml` complet, avec seul le frontend exposé publiquement.</li>
<li>☐ Mon fichier `.env` réel n'est jamais versionné, `.env.example` documente les variables attendues.</li>
<li>☐ J'ai vérifié que `docker compose up -d --build` démarre correctement toute l'application, healthchecks compris.</li>
<li>☐ J'ai vérifié que le cache de build accélère bien les reconstructions après un changement de code seul.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il un `compose.override.yaml` séparé pour le développement à ce stade ?</dt>
<dd>Pas nécessairement encore — ce chapitre construit la version de base. Le chapitre 53 (pipeline CI/CD) introduira les nuances entre environnements de façon plus explicite.</dd>

<dt>Le healthcheck en Node.js pur (sans curl) est-il vraiment nécessaire, ou une simplification suffit-elle ?</dt>
<dd>Il reste recommandé pour ne pas ajouter de dépendance supplémentaire (curl) uniquement pour cet usage — une pratique cohérente avec l'objectif d'image minimale du chapitre 12, même si un `curl` installé ferait aussi parfaitement l'affaire fonctionnellement.</dd>

<dt>Pourquoi ne pas conteneuriser PostgreSQL avec un Dockerfile personnalisé plutôt que l'image officielle directement ?</dt>
<dd>L'image officielle `postgres` (chapitre 11) couvre déjà l'essentiel des besoins de ce projet, y compris le montage de scripts d'initialisation — un Dockerfile personnalisé n'apporterait aucun bénéfice réel ici, ajoutant une complexité sans justification (chapitre 36, privilégier les images officielles).</dd>
</dl>

## Références et pour aller plus loin

- Récapitulatif des chapitres mobilisés dans ce chapitre : 11, 12, 13, 18, 25, 36.

*Chapitre suivant : projet final, premier déploiement manuel — serveur, déploiement, Nginx, DNS, HTTPS, phases 7 à 11 du projet.*
