# Chapitre 44 — Projet 4 : application professionnelle (React + NestJS + PostgreSQL + Redis + Nginx)

**Niveau : Avancé**

---

## Introduction

Quatrième projet, le premier réellement "professionnel" de la Partie X : la même architecture à cinq services que le chapitre 20, avec NestJS à la place d'Express, et surtout — la différence de ce chapitre — l'application complète des checklists des chapitres 25 (Dockerfile professionnel) et 26 (sécurité), plus une publication réelle sur un registry (chapitre 27).

---

## 🎯 Objectif du projet

L'architecture du chapitre 20, avec NestJS, healthchecks dès la conception, et une conformité vérifiée aux checklists Dockerfile professionnel et sécurité.

## 📋 Prérequis

Chapitres 17 à 21, 25, 26, 27, 38 (section 38.3, NestJS).

## Pourquoi ce projet est important

C'est le premier projet de ce manuel construit **dès le départ** selon les standards professionnels des chapitres 25-27, plutôt que ces standards ajoutés après coup — l'ordre dans lequel un vrai projet devrait être abordé.

---

## Cahier des charges

```text
1. Backend NestJS + PostgreSQL + Redis (cache-aside, rappel chapitre 20)
2. Healthchecks sur TOUS les services dès la conception (pas ajoutés après coup)
3. Conformité à la checklist Dockerfile professionnel (chapitre 25, section 25.7)
4. Conformité à la checklist sécurité (chapitre 26)
5. Image publiée sur un registry (chapitre 27)
```

---

## 44.1 Backend NestJS multi-stage (rappel des chapitres 25 et 38)

```dockerfile
# [backend/Dockerfile]
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s CMD wget -qO- http://localhost:4000/health || exit 1
CMD ["node", "dist/main.js"]
```

**Rappel appliqué du chapitre 38, section 38.3 :** aucune différence structurelle avec le patron déjà vu — NestJS reste du Node.js, avec une étape de compilation.

---

## 44.2 `compose.yaml` avec healthchecks et sécurité dès la conception

```yaml
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
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 3s
      retries: 5
    cap_drop: ["ALL"]

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
    cap_drop: ["ALL"]

  backend:
    build:
      context: ./backend
      target: production
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
    cap_drop: ["ALL"]
    read_only: true
    tmpfs: ["/tmp"]

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

**Rappel synthétique de ce qui est appliqué, chapitre par chapitre :**
```text
target: production            → chapitre 28 (cibles nommées)
condition: service_healthy    → chapitre 21
cap_drop: ["ALL"]              → chapitre 26, section 26.2
read_only + tmpfs              → chapitre 26, section 26.7
Redis avec mot de passe        → chapitre 18, section 18.3
```

> 📌 **À retenir** — Rien de tout ceci n'est nouveau — c'est la **combinaison systématique**, dès la première ligne de `compose.yaml`, qui distingue ce projet du chapitre 20 : la sécurité et la fiabilité n'y sont pas ajoutées après coup, elles font partie de la conception initiale.

---

## 44.3 Publier sur un registry (rappel du chapitre 27)

```bash
# [Terminal]
docker tag backend-image ghcr.io/mon-compte/projet4-backend:1.0.0
docker push ghcr.io/mon-compte/projet4-backend:1.0.0
```

---

## Checklist appliquée à ce projet (synthèse des chapitres 25-26-27)

- [ ] Multi-stage build (chapitre 25).
- [ ] `USER` non-root sur tous les services construits (chapitre 6, 26).
- [ ] `cap_drop: ["ALL"]` appliqué (chapitre 26, section 26.2).
- [ ] `read_only` + `tmpfs` ciblé sur le backend (chapitre 26, section 26.7).
- [ ] Healthchecks et `condition: service_healthy` sur toute la chaîne (chapitre 21).
- [ ] Redis protégé par mot de passe (chapitre 18, section 18.3).
- [ ] Image publiée avec un tag versionné, jamais `latest` seul (chapitre 5, 32).

---

## Laboratoire pratique n°1 — Construire et vérifier le projet complet

**Objectifs :** exécuter les sections 44.1-44.2, seul.
**Prérequis :** Chapitre 43.

**Résultat attendu :** les cinq services actifs et `(healthy)` dès le premier `docker compose up -d --build`.

---

## Laboratoire pratique n°2 — Auditer selon la checklist complète

**Objectifs :** appliquer la checklist de ce chapitre point par point.
**Prérequis :** Laboratoire 1 complété.

**Résultat attendu :** une conformité totale, avec une justification pour chaque point.

---

## Laboratoire pratique n°3 — Publier une version taguée

**Objectifs :** exécuter la section 44.3.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Résultat attendu :** une image versionnée, retéléchargeable depuis une autre machine (rappel du chapitre 27, laboratoire 1).

---

## ✅ Checklist avant de passer au chapitre 45

- [ ] Mon projet est conforme aux checklists des chapitres 25 et 26.
- [ ] Tous les services ont un healthcheck cohérent.
- [ ] Une image a été publiée avec un tag versionné.

---

## Conclusion

Une application construite, dès sa conception, selon les standards professionnels du manuel. Le chapitre 45 déploie ce projet précis sur un vrai VPS, en production.

---

⬅️ [Chapitre 43 — Projet 3 : full stack](43-projet-3-full-stack.md) · ➡️ **Suite : Chapitre 45 — Projet 5 : déploiement en production du Projet 4**
