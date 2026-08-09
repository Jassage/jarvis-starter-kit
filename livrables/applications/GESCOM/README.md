# GESCOM — ERP commercial (boutique + grossiste)

Nom de code provisoire, renommable sans impact technique.

Client : entreprise commerciale avec 1 boutique (détail) + 1 entrepôt grossiste, stocks séparés, devise HTG.

Modules cibles : Stock/inventaire, Ventes/facturation, Achats/fournisseurs, Comptabilité de base.

Stack : Next.js (App Router) + Express 4 + TypeScript + Prisma 5 + PostgreSQL — mêmes patterns que BANKA et MEDIKA (RBAC, audit log, soft delete, Decimal(15,2) pour les montants).

## État actuel

- Auth JWT (cookie httpOnly + refresh token rotatif) + RBAC (5 rôles : SUPER_ADMIN, GERANT, VENDEUR, MAGASINIER, COMPTABLE) + audit log
- Modules livrés : Produits (avec code-barres), Stock (multi-emplacement), Transferts inter-sites, Ventes (POS, scan code-barres), **Caisse** (sessions journalières, ouverture/fermeture, écart), **Facture PDF**, **Retours/avoirs** (partiels, ligne par ligne, avec restock et écriture comptable inverse), Clients, Achats/Fournisseurs, Comptabilité (journal, grand livre, bilan, compte de résultat), Rapports (ventes/stock/achats/clients), Dashboard
- Toute vente doit être rattachée à une session de caisse ouverte sur son emplacement (`/caisse`)
- Facture PDF téléchargeable depuis chaque vente (`GET /api/ventes/:id/facture`)
- Une vente ayant déjà des retours ne peut plus être annulée globalement (seul le retour reste possible)

Non implémenté : tests automatisés, suivi de dette fournisseur, module Paramètres/Entreprise (l'en-tête de facture se configure via `ENTREPRISE_NOM`/`ENTREPRISE_ADRESSE` en variable d'environnement).

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
