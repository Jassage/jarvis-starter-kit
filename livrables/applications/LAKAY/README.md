# LAKAY — Plateforme Immobilière Haïtienne

Plateforme d'annonces immobilières dédiée à Haïti.

## Stack

| Couche | Technologie |
|--------|-------------|
| Backend | Node.js, Express 4, TypeScript, Prisma, PostgreSQL + PostGIS |
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS, Shadcn UI |
| Temps réel | Socket.IO, BullMQ |
| Cache | Redis |
| Stockage | Cloudinary |
| IA | Anthropic Claude (claude-haiku-4-5-20251001) |
| Infra | Docker Compose, Nginx, GitHub Actions |

## Démarrage rapide (développement)

### Prérequis
- Node.js 20+
- PostgreSQL avec extension PostGIS (ou Docker)
- Redis (ou Docker)

### Avec Docker (recommandé)

```bash
cd livrables/applications/LAKAY

# Copier les variables d'environnement
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos clés

# Lancer PostgreSQL + Redis
docker compose up postgres redis -d

# Backend
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev  # port 4003

# Frontend (nouveau terminal)
cd ../frontend
npm install
cp .env.example .env.local
npm run dev  # port 3004
```

### Tout avec Docker

```bash
docker compose up --build
```

Accès : http://localhost (Nginx) ou http://localhost:3004 (frontend direct)

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Super Admin | admin@lakay.ht | Admin@Lakay2024! |
| Propriétaire | proprietaire@demo.ht | Owner@123 |
| Particulier | utilisateur@demo.ht | User@123 |
| Agence | agence@demo.ht | Agency@123 |

## Ports

| Service | Port |
|---------|------|
| Backend API | 4003 |
| Frontend | 3004 |
| PostgreSQL | 5435 |
| Redis | 6381 |
| Nginx | 80/443 |

## Documentation API

Swagger UI disponible à `http://localhost:4003/api-docs`

## Variables d'environnement requises

```env
# backend/.env
DATABASE_URL=postgresql://lakay:lakay_password@localhost:5432/lakay
JWT_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_USER=...
SMTP_PASS=...
ANTHROPIC_API_KEY=sk-ant-...  # Pour le module IA
MONCASH_CLIENT_ID=...         # En attente Digicel Business Haiti
MONCASH_CLIENT_SECRET=...
```

## Déploiement

Le workflow GitHub Actions (`.github/workflows/deploy.yml`) gère automatiquement :
1. Tests avec PostgreSQL + Redis en service
2. Build et push des images Docker sur ghcr.io
3. Deploy SSH sur le VPS

### Secrets GitHub requis

```
JWT_SECRET, JWT_REFRESH_SECRET
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
VPS_HOST, VPS_USER, VPS_SSH_KEY
```

## Architecture

```
LAKAY/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # 20+ modèles, PostGIS lat/lng
│   │   └── seed.ts
│   └── src/
│       ├── modules/
│       │   ├── auth/        # JWT + refresh rotation
│       │   ├── listings/    # CRUD + Cloudinary + lifecycle
│       │   ├── search/      # 30+ filtres + Haversine
│       │   ├── messages/    # Socket.IO temps réel
│       │   ├── agencies/
│       │   ├── payments/    # MonCash + Stripe scaffolds
│       │   ├── admin/       # Dashboard admin complet
│       │   ├── ai/          # Claude (estimation, génération, NL search)
│       │   └── visits/      # Demandes de visite
│       └── workers/
│           ├── email.worker.ts
│           └── notification.worker.ts
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (main)/      # Pages publiques + dashboard
│       │   ├── (auth)/      # Login, register
│       │   └── admin/       # Panel administration
│       ├── components/
│       ├── lib/api.ts       # Axios + auto-refresh
│       ├── store/authStore  # Zustand persist
│       └── hooks/useSocket  # Socket.IO singleton
├── docker/
├── nginx/
└── .github/workflows/
```
