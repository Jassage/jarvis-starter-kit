<div class="chapitre-titre-num">CHAPITRE 47</div>

# Projet final — Déploiement Docker

## 47.1 Dockerfile de MediAPI

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY . .

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget --spider -q http://localhost:3000/sante || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi générer le client Prisma dans l'étape de build</span>
`npx prisma generate` produit du code JavaScript spécifique au schéma (`node_modules/.prisma`), qui doit être présent dans l'image finale — copié explicitement depuis l'étape `build` vers l'étape `production`, exactement le principe du build multi-étapes du chapitre 37.
</div>

## 47.2 docker-compose.yml complet de MediAPI

```yaml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/mediapi
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - uploads_mediapi:/app/uploads
    restart: always

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=mediapi
    volumes:
      - donnees_postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  donnees_postgres:
  uploads_mediapi:
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un volume dédié pour uploads/, séparé de la base de données</span>
Les documents médicaux téléversés (chapitre 45) doivent survivre aux redémarrages du conteneur `api`, exactement comme les données de `db` — un volume `uploads_mediapi` séparé garantit cette persistance, indépendamment du cycle de vie du conteneur applicatif.
</div>

## 47.3 Variables d'environnement de production

```
# .env.production (jamais commité)
DB_PASSWORD=un-mot-de-passe-tres-solide
JWT_ACCESS_SECRET=cle-secrete-access-tres-longue-et-aleatoire
JWT_REFRESH_SECRET=cle-secrete-refresh-differente-de-lacces
```

## 47.4 Pipeline CI/CD complet pour MediAPI

```yaml
# .github/workflows/deploy.yml
name: CI/CD MediAPI

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: mediapi_test
        ports: ["5432:5432"]
        options: --health-cmd pg_isready --health-interval 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/mediapi_test
      - run: npm test
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/mediapi_test
          NODE_ENV: test

  deployer:
    needs: test
    runs-on: ubuntu-latest
    if: success()
    steps:
      - name: Déployer sur le serveur de production
        run: |
          ssh utilisateur@serveur-mediapi.com "cd mediapi && git pull && docker compose up -d --build"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un vrai PostgreSQL de test dans le pipeline CI, pas une base simulée</span>
Le job `test` démarre un **vrai** conteneur PostgreSQL (via `services:` de GitHub Actions), garantissant que les tests d'intégration (chapitre 46) s'exécutent dans des conditions représentatives de la production — bien plus fiable qu'une base simulée qui pourrait masquer des incompatibilités réelles avec PostgreSQL.
</div>

## 47.5 Checklist finale avant mise en production

<div class="encadre astuce">
<span class="encadre-titre">💡 Récapitulatif transversal du manuel, appliqué à MediAPI</span>
- Toutes les routes sensibles protégées par `authentifier` + `autoriser` (chapitres 23-24).
- Toutes les entrées validées via Zod (chapitre 18) avant d'atteindre les services.
- Gestion d'erreurs centralisée, aucune stack trace exposée en production (chapitre 19).
- Helmet, CORS restreint, rate limiting sur `/auth/connexion` (chapitre 25).
- Migrations appliquées via `migrate deploy`, jamais `migrate dev` en production (chapitres 34, 39).
- Tests unitaires et d'intégration exécutés dans le pipeline CI/CD avant tout déploiement (chapitre 47.4).
- Documents médicaux servis uniquement via une route authentifiée, jamais en accès statique direct (chapitre 45).
- Variables d'environnement (secrets JWT, mot de passe base de données) injectées au lancement, jamais codées dans l'image Docker (chapitre 37).
</div>

## 47.6 Ce que ce projet final a assemblé

<div class="encadre astuce">
<span class="encadre-titre">💡 Récapitulatif de bout en bout</span>
MediAPI a mobilisé, dans un seul projet cohérent : fondamentaux Node.js et JavaScript asynchrone (parties 1-2), Express et architecture en couches (partie 3), robustesse (gestion d'erreurs, journalisation, pagination — partie 4), sécurité et authentification JWT/RBAC (partie 5), upload et documentation Swagger (partie 6), tests unitaires et d'intégration (partie 7), Prisma/PostgreSQL (partie 8), et Docker/déploiement (partie 9). C'est exactement la même méthodologie que celle déjà appliquée aux projets réels mentionnés dans les manuels React et Java de ce même auteur (KONEKTE, BANKA, GESCOM, LAKAY, MEDIKA) : les mêmes briques, assemblées selon les besoins spécifiques de chaque produit.
</div>

## 47.7 Pour aller plus loin après ce manuel

- Ajouter Redis pour le cache et un rate limiting partagé entre plusieurs instances (chapitre 25, 40).
- Explorer TypeScript pour un typage statique complet du projet (mentionné au chapitre 17).
- Ajouter des notifications temps réel (WebSockets/Socket.io) pour les rendez-vous à venir.
- Explorer Kubernetes pour une orchestration à plus grande échelle que Docker Compose.
- Consulter les annexes de ce manuel (aide-mémoire, glossaire, ressources) comme référence rapide au quotidien.

## 47.8 Résumé du chapitre

- Le Dockerfile multi-étapes génère et embarque le client Prisma, applique les migrations au démarrage du conteneur (`prisma migrate deploy && node server.js`).
- `docker-compose.yml` orchestre l'API et PostgreSQL, avec des volumes séparés pour les données et les uploads.
- Le pipeline CI/CD teste contre un vrai PostgreSQL éphémère avant tout déploiement en production.
- La checklist finale récapitule l'ensemble des bonnes pratiques transversales du manuel, appliquées concrètement à MediAPI.

*Ceci clôt la Partie 10 et le corps principal du manuel. Les annexes suivantes (aide-mémoire, erreurs fréquentes, glossaire, ressources) servent de référence rapide pour la suite de ta pratique.*
