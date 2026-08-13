# Chapitre 43 — Projet 3 : full stack (React + Node.js + MySQL + Nginx)

**Niveau : Intermédiaire**

---

## Introduction

Troisième projet : le projet 2 (chapitre 42) reçoit un vrai frontend React, et Nginx reprend son rôle de point d'entrée unique. Ce projet réutilise directement les chapitres 14 à 16 et 19 — toujours aucune notion nouvelle, seulement un assemblage plus riche.

---

## 🎯 Objectif du projet

Le même carnet de contacts que le chapitre 42, cette fois avec une interface React complète, et Nginx comme unique point d'entrée public.

## 📋 Prérequis

Chapitres 14, 15, 16, 19, et le projet du chapitre 42.

## Pourquoi ce projet est important

C'est le premier projet de la Partie X à réunir les quatre briques les plus courantes de ce manuel (frontend, backend, base de données, reverse proxy) — l'architecture de référence appliquée un cran plus loin que le chapitre 20.

---

## Cahier des charges

```text
1. Frontend React : formulaire de création + liste des contacts
2. Backend Node.js/Express + MySQL (rappel exact du chapitre 42)
3. Nginx : sert le frontend ET reverse-proxifie /api/ vers le backend
4. Seul Nginx publie un port vers l'hôte
```

---

## 43.1 Arborescence

```text
projet-3-full-stack/
├── frontend/
│   ├── src/
│   │   └── App.jsx
│   ├── index.html
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── backend/
│   ├── src/index.js
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── db/
│   └── init/01-schema.sql
├── compose.yaml
└── .env.example
```

---

## 43.2 Frontend (rappel des chapitres 15 et 19)

```jsx
// [frontend/src/App.jsx, extrait]
const charger = () =>
  fetch("/api/contacts").then((r) => r.json()).then(setContacts);
```

**Rappel du chapitre 20, section 20.4 :** l'appel utilise un chemin **relatif** (`/api/contacts`), pas une URL complète — il fonctionne identiquement quel que soit le domaine, tant que Nginx sert le frontend et proxifie `/api/` vers le backend sur la même origine.

`frontend/Dockerfile` : multi-stage identique au chapitre 15 (`AS build` avec Node, puis `nginx:alpine` final).

---

## 43.3 `frontend/nginx.conf` (rappel du chapitre 19)

```nginx
server {
    listen 80;

    location /api/ {
        proxy_pass http://backend:4000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 43.4 `compose.yaml`

```yaml
services:
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db-data:/var/lib/mysql
      - ./db/init:/docker-entrypoint-initdb.d

  backend:
    build: ./backend
    environment:
      DB_HOST: db
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
    depends_on:
      - db

  nginx:
    build: ./frontend
    ports:
      - "8080:80"
    depends_on:
      - backend

volumes:
  db-data:
```

**Rappel du chapitre 20, section 20.1 :** seul `nginx` publie un port — `backend` et `db` ne communiquent que via le réseau Compose interne (chapitre 11).

---

## 43.5 Construire, lancer, vérifier

```bash
# [Terminal]
cp .env.example .env
docker compose up -d --build
curl http://localhost:8080/                    # le frontend React se charge
curl http://localhost:8080/api/contacts         # l'API répond via le proxy
```

**Résultat attendu :** l'interface React s'affiche dans un navigateur sur `http://localhost:8080`, le formulaire crée bien des contacts persistés en MySQL.

---

## Erreurs fréquentes (récapitulatif)

| Erreur | Cause | Renvoi |
|---|---|---|
| 404 sur les routes internes de React au rechargement | `try_files` mal configuré | Chapitre 15, section 15.3 |
| 404 sur `/api/...` | Piège du slash final `proxy_pass` | Chapitre 19, section 19.3 |
| Base de données accessible depuis l'hôte alors que ce n'était pas prévu | `ports:` laissé par erreur sur `db` | Chapitre 11, section 11.6 |

---

## Laboratoire pratique n°1 — Construire le projet complet

**Objectifs :** exécuter les sections 43.1 à 43.5, seul.
**Prérequis :** Chapitre 42.

**Résultat attendu :** une interface React fonctionnelle, connectée à l'API via Nginx.

---

## Laboratoire pratique n°2 — Vérifier l'isolation réseau

**Objectifs :** confirmer qu'aucun port autre que celui de `nginx` n'est accessible depuis l'hôte.
**Prérequis :** Laboratoire 1 complété.

**Étapes :** tente une connexion directe à MySQL depuis l'hôte (elle doit échouer), puis confirme l'accès complet depuis `backend` (rappel du chapitre 11, laboratoire 3).

**Résultat attendu :** confirmation de l'isolation attendue.

---

## Laboratoire pratique n°3 — Reconstruire uniquement le frontend après une modification

**Objectifs :** appliquer le réflexe du chapitre 13, section 13.5.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :** modifie un texte de l'interface React, reconstruis uniquement `nginx` (`docker compose up -d --build nginx`), confirme que `db` et `backend` ne redémarrent pas.

**Résultat attendu :** un déploiement ciblé, sans perturber les données existantes.

---

## ✅ Checklist avant de passer au chapitre 44

- [ ] Mon interface React fonctionne, connectée à l'API via Nginx.
- [ ] Seul `nginx` publie un port.
- [ ] Je sais reconstruire un seul service sans affecter les autres.

---

## Conclusion

Les quatre briques les plus courantes de ce manuel sont maintenant assemblées deux fois (chapitre 20, et ici). Le chapitre 44 ajoute la dernière pièce manquante — Redis, sécurité approfondie, healthchecks — pour une application réellement professionnelle.

---

⬅️ [Chapitre 42 — Projet 2 : Node.js + MySQL](42-projet-2-nodejs-mysql.md) · ➡️ **Suite : Chapitre 44 — Projet 4 : application professionnelle**
