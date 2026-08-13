# Chapitre 42 — Projet 2 : Node.js + MySQL

**Niveau : Intermédiaire**

---

## Introduction

Deuxième projet de la Partie X : une API Express connectée à MySQL, orchestrée avec Compose. Ce projet réutilise directement les chapitres 12, 14 et 16 — aucune notion nouvelle, seulement leur assemblage dans un cas concret légèrement plus riche que le chapitre 41.

---

## 🎯 Objectif du projet

Une API REST de gestion de contacts (créer, lister), avec des données qui persistent réellement dans MySQL, orchestrée par Docker Compose.

## 📋 Prérequis

Chapitres 12 (Compose), 14 (Node.js/Express) et 16 (MySQL).

## Pourquoi ce projet est important

C'est le premier projet de la Partie X avec un état persistant réel — l'occasion de vérifier, sur un cas neuf, que les réflexes des chapitres 10 et 16 (jamais de perte de données à un redémarrage) sont bien acquis.

---

## Cahier des charges

```text
1. GET /api/contacts — liste tous les contacts
2. POST /api/contacts — crée un contact (nom, email)
3. Données persistées dans MySQL, survivant à un redémarrage des conteneurs
4. Orchestré par Docker Compose, avec .env.example versionné
```

---

## 42.1 Arborescence

```text
projet-2-node-mysql/
├── backend/
│   ├── src/
│   │   └── index.js
│   ├── package.json
│   ├── package-lock.json
│   ├── Dockerfile
│   └── .dockerignore
├── compose.yaml
└── .env.example
```

---

## 42.2 Backend (rappel du chapitre 14)

```javascript
// [backend/src/index.js]
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/api/contacts", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM contacts ORDER BY id");
  res.json(rows);
});

app.post("/api/contacts", async (req, res) => {
  const { nom, email } = req.body;
  const [result] = await pool.query(
    "INSERT INTO contacts (nom, email) VALUES (?, ?)",
    [nom, email]
  );
  res.status(201).json({ id: result.insertId, nom, email });
});

app.listen(4000, () => console.log("API à l'écoute sur le port 4000"));
```

`backend/Dockerfile` — identique au patron du chapitre 14 (`npm ci --omit=dev`, `USER node`), non reproduit ici pour éviter la répétition.

---

## 42.3 `compose.yaml`

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
      - ./init:/docker-entrypoint-initdb.d

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      DB_HOST: db
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
    depends_on:
      - db

volumes:
  db-data:
```

`init/01-schema.sql` (rappel du chapitre 16) :
```sql
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL
);
```

> 📌 **Simplification assumée par rapport au chapitre 13** — Ce projet publie directement le port du backend (`4000:4000`), sans Nginx devant — un choix volontaire pour rester concentré sur Node.js + MySQL, conformément au périmètre de ce projet précis. Le chapitre 43 réintroduira Nginx.

---

## 42.4 Construire, lancer, vérifier

```bash
# [Terminal]
cp .env.example .env   # puis éditer avec de vraies valeurs
docker compose up -d --build
curl -X POST http://localhost:4000/api/contacts -H "Content-Type: application/json" -d '{"nom":"Jaslin","email":"jaslin@exemple.ht"}'
curl http://localhost:4000/api/contacts
```

**Résultat attendu :** le contact créé apparaît dans la liste.

---

## 42.5 Vérifier la persistance (rappel des chapitres 10 et 16)

```bash
# [Terminal]
docker compose down
docker compose up -d
curl http://localhost:4000/api/contacts
```

**Résultat attendu :** le contact créé précédemment est toujours là — `docker compose down` (sans `-v`, rappel du chapitre 12) préserve le volume `db-data`.

---

## Laboratoire pratique n°1 — Construire le projet complet

**Objectifs :** exécuter les sections 42.1 à 42.4, seul.
**Prérequis :** Chapitre 41.

**Résultat attendu :** un cycle POST/GET fonctionnel de bout en bout.

---

## Laboratoire pratique n°2 — Vérifier la persistance

**Objectifs :** exécuter la section 42.5.
**Prérequis :** Laboratoire 1 complété.

**Résultat attendu :** confirmation que les données survivent à un `docker compose down`/`up`.

---

## Laboratoire pratique n°3 — Provoquer puis corriger une perte de données volontaire

**Objectifs :** vérifier, en conditions contrôlées, la différence entre `down` et `down -v` (rappel du chapitre 12).
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :** `docker compose down -v`, puis `docker compose up -d` — confirme cette fois la perte du contact créé, avant de recréer un nouveau jeu de données de test.

**Résultat attendu :** une distinction vécue, une dernière fois, entre les deux commandes.

---

## ✅ Checklist avant de passer au chapitre 43

- [ ] Mon API répond correctement en GET et POST.
- [ ] Les données survivent à un `docker compose down` sans `-v`.
- [ ] J'ai vérifié la perte de données avec `-v`, en conditions contrôlées.
- [ ] Je sais pourquoi ce projet publie directement le port du backend, sans Nginx.

---

## Conclusion

Un backend et une base de données assemblés sans notion nouvelle, avec des données réellement persistantes. Le chapitre 43 ajoute la troisième pièce manquante : un frontend React, pour un premier vrai projet full stack.

---

⬅️ [Chapitre 41 — Projet 1 : Nginx seul](41-projet-1-nginx-seul.md) · ➡️ **Suite : Chapitre 43 — Projet 3 : full stack (React + Node.js + MySQL + Nginx)**
