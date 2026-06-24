# BANKA - Système de Gestion Bancaire

Stack : Next.js 15 + Express 4 + TypeScript + Prisma v5 + PostgreSQL

## Démarrage rapide

### 1. Backend

```bash
cd backend
npm install

# Créer la base de données PostgreSQL "banka_db"
# Adapter le mot de passe dans .env

npx prisma migrate dev --name init
ts-node prisma/seed.ts
npm run dev
```

Backend démarre sur : http://localhost:4001

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend démarre sur : http://localhost:3001

## Comptes de test (après seed)

| Email                  | Mot de passe | Rôle        |
|------------------------|--------------|-------------|
| admin@banka.ht         | Admin@123    | SUPER_ADMIN |
| directeur@banka.ht     | Admin@123    | DIRECTEUR   |
| caissier@banka.ht      | Admin@123    | CAISSIER    |
| credit@banka.ht        | Admin@123    | AGENT_CREDIT|

## API - Endpoints principaux

- `POST /api/auth/login` - Connexion
- `GET  /api/clients` - Liste des clients
- `GET  /api/comptes` - Liste des comptes
- `POST /api/transactions/depot` - Dépôt
- `POST /api/transactions/retrait` - Retrait
- `POST /api/transactions/virement` - Virement
- `GET  /api/caisse/active` - Session de caisse active
- `GET  /api/prets` - Liste des prêts
- `GET  /api/stats/dashboard` - Stats dashboard

## Modules MVP

- Clients (KYC, individuel/entreprise)
- Comptes (épargne, courant, terme, HTG/USD)
- Transactions (dépôt, retrait, virement, validation)
- Caisse (ouverture/fermeture, arrêté)
- Crédits/Prêts (workflow complet, tableau d'amortissement)
- Dashboard (KPIs temps réel)
- RBAC (7 rôles)
- Piste d'audit complète
