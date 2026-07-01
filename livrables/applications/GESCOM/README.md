# GESCOM — ERP commercial (boutique + grossiste)

Nom de code provisoire, renommable sans impact technique.

Client : entreprise commerciale avec 1 boutique (détail) + 1 entrepôt grossiste, stocks séparés, devise HTG.

Modules cibles : Stock/inventaire, Ventes/facturation, Achats/fournisseurs, Comptabilité de base.

Stack : Next.js (App Router) + Express 4 + TypeScript + Prisma 5 + PostgreSQL — mêmes patterns que BANKA et MEDIKA (RBAC, audit log, soft delete, Decimal(15,2) pour les montants).

## État actuel (Phase 0 — socle)

- Schéma Prisma complet pour les 4 modules (voir `backend/prisma/schema.prisma`)
- Auth JWT (cookie httpOnly + refresh token rotatif) + RBAC (5 rôles : SUPER_ADMIN, GERANT, VENDEUR, MAGASINIER, COMPTABLE) + audit log
- Frontend : login + layout dashboard de base, pas encore d'écrans métier

Pas encore implémenté : CRUD Produits/Stock, Ventes, Achats, Transferts, Comptabilité, Rapports. Voir le plan de la session dans `.claude/plans` ou demander à Claude le détail des phases suivantes.

## Mise en route

### 1. Base de données PostgreSQL

Créer une base dédiée (exemple) :

```sql
CREATE DATABASE gescom;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Éditer .env : DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET (générer des secrets forts, distincts)
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Backend sur `http://localhost:4002`. Compte de démo créé par le seed : `admin@gescom.ht` / `Admin@123`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend sur `http://localhost:3003`.

## Ports

| Service  | Port |
|----------|------|
| Backend  | 4002 |
| Frontend | 3003 |

Configs ajoutées dans `.claude/launch.json` (`gescom-backend`, `gescom-frontend`).
