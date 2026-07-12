# BANKA — Documentation technique

> Système de gestion bancaire (core banking + comptabilité SYSCOHADA + RH)
> Version 1.0 — Document destiné aux développeurs et à l'exploitation technique.

---

## 1. Présentation

BANKA est une application web de gestion bancaire complète pour institutions financières (banques, coopératives, institutions de microfinance). Elle couvre trois domaines :

- **Bancaire** : clients (KYC), comptes, transactions, caisse, crédits/prêts, épargne programmée, taux de change, conformité (AML), rapports réglementaires (BRH).
- **Comptabilité** : plan comptable SYSCOHADA, journal des écritures, grand livre, bilan, compte de résultat, avec écriture automatique en partie double sur chaque opération.
- **Ressources humaines** : employés, postes, contrats, paie, congés, pointage biométrique.

L'application repose sur un contrôle d'accès à 7 rôles (RBAC), une piste d'audit complète et des notifications temps réel (SSE).

---

## 2. Architecture

### 2.1 Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Zustand |
| Backend | Node.js, Express 4, TypeScript |
| ORM | Prisma v5 |
| Base de données | PostgreSQL |
| Authentification | JWT (access + refresh token rotatif), bcryptjs, 2FA TOTP (otplib + qrcode) |
| Sécurité HTTP | Helmet, CORS, express-rate-limit |
| Validation | Zod |
| Emails | Nodemailer (SMTP) |
| Temps réel | Server-Sent Events (SSE) |
| Pointage biométrique | Protocole ZKTeco ADMS (`/iclock`) |

### 2.2 Schéma d'architecture

```
┌────────────────────┐        HTTPS/JSON        ┌────────────────────┐
│   Frontend Next.js │  ───────────────────────▶ │  Backend Express   │
│   (port 3001)      │  ◀─────────────────────── │   (port 4001)      │
│   App Router       │        SSE (temps réel)   │   API REST /api    │
└────────────────────┘                           └─────────┬──────────┘
                                                            │ Prisma
                                                            ▼
                                                  ┌────────────────────┐
                                                  │    PostgreSQL      │
                                                  │    (banka_db)      │
                                                  └────────────────────┘
        ▲
        │ Protocole ADMS (heartbeat 10s)
┌───────┴────────┐
│ Pointeuse      │
│ ZKTeco (/iclock)│
└────────────────┘
```

### 2.3 Ports par défaut

- Backend : `4001`
- Frontend : `3001`

---

## 3. Prérequis

- Node.js 18 ou supérieur
- PostgreSQL 14 ou supérieur
- npm

---

## 4. Installation

### 4.1 Backend

```bash
cd backend
npm install

# Créer la base PostgreSQL "banka_db" puis renseigner .env (voir section 5)

npx prisma migrate dev --name init   # crée le schéma
npm run db:seed                       # comptes + données de démonstration
npm run db:seed-config                # clés de configuration métier
npm run dev                           # démarre sur http://localhost:4001
```

### 4.2 Frontend

```bash
cd frontend
npm install
npm run dev                           # démarre sur http://localhost:3001
```

### 4.3 Comptes créés par le seed

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@banka.ht | Admin@123 | SUPER_ADMIN |
| directeur@banka.ht | Admin@123 | DIRECTEUR |
| caissier@banka.ht | Admin@123 | CAISSIER |
| credit@banka.ht | Admin@123 | AGENT_CREDIT |

> **Important :** changez ces mots de passe avant toute mise en production.

---

## 5. Configuration (variables d'environnement)

Fichier `backend/.env` :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | Chaîne de connexion PostgreSQL | `postgresql://postgres:pwd@localhost:5432/banka_db` |
| `JWT_SECRET` | Secret de signature des access tokens (≥ 32 caractères) | `change-me-…` |
| `JWT_REFRESH_SECRET` | Secret de signature des refresh tokens (**obligatoire**, distinct de `JWT_SECRET`) | `change-me-…` |
| `JWT_EXPIRES_IN` | Durée de vie de l'access token | `8h` |
| `REFRESH_TOKEN_EXPIRES_IN` | Durée de vie du refresh token | `30d` |
| `PORT` | Port du backend | `4001` |
| `CORS_ORIGINS` | Origines autorisées (séparées par des virgules) | `http://localhost:3001` |
| `NODE_ENV` | Environnement | `development` / `production` |
| `SEUIL_VALIDATION_HTG` | Montant HTG au-delà duquel une transaction requiert validation | `50000` |
| `SEUIL_VALIDATION_USD` | Montant USD au-delà duquel une transaction requiert validation | `500` |
| `FRONTEND_URL` | URL du frontend (liens dans les emails) | `http://localhost:3001` |
| `SMTP_HOST` | Serveur SMTP (reset mot de passe) | `smtp.gmail.com` |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_USER` | Utilisateur SMTP | `…` |
| `SMTP_PASS` | Mot de passe SMTP | `…` |
| `SMTP_FROM` | Adresse expéditeur | `no-reply@banka.ht` |

> Sans configuration SMTP, l'envoi d'emails (réinitialisation de mot de passe) est ignoré sans faire planter l'application.

Certains paramètres métier sont stockés en base (table `Configuration`) et initialisés par `npm run db:seed-config` : seuils AML (`AML_SEUIL_HTG`, `AML_SEUIL_USD`), frais (`FRAIS_TENUE_COMPTE_MENSUEL`, `FRAIS_DOSSIER_PRET_TAUX`, `FRAIS_VIREMENT_TAUX`), pénalités (`TAUX_PENALITE_JOURNALIER`, `DELAI_GRACE_RETARD`), `PLAFOND_RETRAIT_JOURNALIER`. Ils sont modifiables via l'écran Administration.

---

## 6. Structure du projet

```
BANKA/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # modèle de données (34 modèles, 30 enums)
│   │   ├── migrations/          # historique des migrations
│   │   ├── seed.ts              # comptes + données de démo
│   │   └── seed-config.ts       # clés de configuration métier
│   └── src/
│       ├── app.ts               # application Express, montage des routes, middlewares
│       ├── server.ts            # démarrage serveur + lancement des jobs planifiés
│       ├── routes/              # définition des routes par module
│       ├── controllers/         # couche HTTP (validation + réponse)
│       ├── services/            # logique métier (transactions Prisma)
│       ├── middleware/          # auth, rbac, rate limiting, caisse, validation, erreurs
│       ├── jobs/                # tâches planifiées (voir section 9)
│       ├── validation/          # schémas Zod
│       └── utils/               # utilitaires
└── frontend/
    └── src/
        ├── app/                 # routes App Router (auth + dashboard)
        ├── components/          # composants UI par domaine
        ├── stores/              # état global Zustand
        └── lib/                 # helpers (formatage, appels API)
```

**Convention backend :** chaque module suit le découpage `routes → controllers → services`. Les routes déclarent le RBAC, les contrôleurs valident (Zod) et formatent la réponse, les services portent la logique métier et encapsulent les transactions Prisma.

---

## 7. Modèle de données

Le schéma comporte une trentaine de modèles. Les principaux :

| Modèle | Rôle |
|--------|------|
| `Utilisateur` | Opérateurs de la banque (avec rôle, 2FA) |
| `Agence` | Agences/succursales |
| `Client` | Clients (individuels ou entreprises), KYC |
| `Compte` | Comptes bancaires (9 types, devise HTG/USD) |
| `Transaction` | Mouvements (dépôt, retrait, virement, frais, intérêts…) |
| `SessionCaisse` | Sessions de caisse journalières |
| `Pret` / `LignePret` / `RemboursementPret` | Crédits et tableau d'amortissement |
| `Garantie` | Garanties adossées aux prêts |
| `MandatCompte` | Mandats et procurations |
| `EpargneProgrammee` | Virements récurrents d'épargne |
| `TauxChange` | Taux de change HTG/USD |
| `AlerteAML` | Alertes anti-blanchiment |
| `CompteComptable` / `EcritureComptable` | Comptabilité en partie double |
| `EcritureEchec` | Écritures comptables en échec à rejouer |
| `Configuration` | Paramètres métier configurables |
| `AuditLog` | Piste d'audit |
| `Poste` / `Employe` / `Contrat` / `FichePaie` / `Conge` / `AvanceSalaire` / `ElementVariable` | Module RH |
| `PointageDevice` / `PointageEmploye` | Pointage biométrique |
| `RefreshToken` / `PasswordResetToken` | Sécurité authentification |

### Énumérations clés

- **UserRole** : `SUPER_ADMIN`, `DIRECTEUR`, `SUPERVISEUR`, `CAISSIER`, `AGENT_CREDIT`, `COMPTABLE`, `AUDITEUR`
- **TypeCompte** : `EPARGNE`, `COURANT`, `TERME`, `JOINT`, `MICRO_EPARGNE`, `TONTINE`, `RETRAITE`, `JEUNESSE`, `CREDIT`
- **TypeTransaction** : `DEPOT`, `RETRAIT`, `VIREMENT_DEBIT`, `VIREMENT_CREDIT`, `DECAISSEMENT_PRET`, `REMBOURSEMENT_PRET`, `FRAIS`, `INTERET`, `AJUSTEMENT`
- **StatutTransaction** : `EN_ATTENTE`, `VALIDEE`, `REJETEE`, `ANNULEE`
- **StatutPret** : `EN_ATTENTE`, `APPROUVE`, `DECAISSE`, `EN_COURS`, `SOLDE`, `EN_RETARD`, `REJETE`, `ANNULE`
- **TypeAmortissement** : `DEGRESSIF`, `CONSTANT`, `IN_FINE`

---

## 8. API REST

Base : `http://localhost:4001`. Toutes les routes métier sont préfixées par `/api` et protégées par authentification + RBAC. `GET /health` renvoie l'état du service (non authentifié).

| Préfixe | Module |
|---------|--------|
| `/api/auth` | Connexion, refresh, déconnexion, 2FA, reset mot de passe |
| `/api/clients` | Clients (CRUD, KYC) |
| `/api/comptes` | Comptes bancaires |
| `/api/transactions` | Dépôt, retrait, virement, validation/rejet |
| `/api/caisse` | Sessions de caisse (ouverture, fermeture, arrêté) |
| `/api/prets` | Crédits, amortissement, décaissement, remboursement |
| `/api/epargnes-programmees` | Épargne programmée |
| `/api/taux-change` | Taux de change, virement cross-devise |
| `/api/aml` | Alertes anti-blanchiment |
| `/api/stats` | Indicateurs du tableau de bord |
| `/api/audit` | Journal d'audit |
| `/api/agences` | Agences |
| `/api/configurations` | Paramètres métier |
| `/api/compta` | Comptabilité (plan, journal, grand livre, bilan, résultat) |
| `/api/rh` | Ressources humaines |
| `/api/rh/pointage` | Pointage |
| `/api/rh/pointage/devices` | Appareils de pointage |
| `/api/sse` | Flux de notifications temps réel |
| `/iclock` | Endpoint ZKTeco ADMS (hors `/api`, protocole propriétaire) |

### Exemples d'endpoints

```
POST /api/auth/login              # { email, motDePasse } → tokens
GET  /api/clients                 # liste paginée
POST /api/transactions/depot      # dépôt
POST /api/transactions/retrait    # retrait
POST /api/transactions/virement   # virement
GET  /api/caisse/active           # session de caisse ouverte
GET  /api/prets                   # liste des prêts
GET  /api/stats/dashboard         # KPIs
```

---

## 9. Tâches planifiées (jobs)

Lancées au démarrage du serveur (`server.ts`) :

- **`cleanupTokens`** : purge des refresh tokens expirés.
- **`epargne`** : exécution des virements d'épargne programmée arrivés à échéance.
- **`interets`** : calcul et capitalisation des intérêts.
- **`frais`** : prélèvement des frais récurrents (tenue de compte, etc.).

---

## 10. Sécurité

- **Authentification JWT** : access token de courte durée + refresh token rotatif stocké en base (`RefreshToken`), révoqué à la déconnexion et à la désactivation d'un compte.
- **2FA** : TOTP optionnel par utilisateur (otplib + QR code).
- **Politique de mot de passe** : 12 caractères minimum, majuscule + minuscule + chiffre + caractère spécial.
- **Reset de mot de passe** : token opaque 256 bits, usage unique, expiration 1 h, stocké haché. Aucune énumération d'email possible (réponse 200 systématique). Révoque toutes les sessions actives.
- **RBAC** : contrôle d'accès par rôle sur toutes les routes (voir section 11).
- **Atomicité** : les opérations financières utilisent `prisma.$transaction` avec compare-and-swap (`updateMany` conditionnel) pour éliminer les race conditions et prévenir tout solde négatif.
- **Rate limiting** : 10 tentatives / 15 min sur le login, limite générale sur `/api`, 60 req/min sur `/iclock`.
- **En-têtes de sécurité** : Helmet. Payload JSON limité à 1 Mo.
- **Piste d'audit** : chaque action sensible est journalisée dans `AuditLog`.
- **Conformité AML** : détecteurs automatiques (seuil déclarable, structuration, vélocité élevée, mandataire blacklisté) déclenchés après chaque transaction.

---

## 11. Rôles et permissions (RBAC)

Sept rôles, appliqués côté backend (routes) et côté frontend (navigation).

| Module / Écran | SUPER_ADMIN | DIRECTEUR | SUPERVISEUR | CAISSIER | AGENT_CREDIT | COMPTABLE | AUDITEUR |
|----------------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Tableau de bord | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Clients | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| Comptes | ✓ | ✓ | ✓ | ✓ | | ✓ | |
| Transactions | ✓ | ✓ | ✓ | ✓ | | ✓ | |
| Caisse | ✓ | ✓ | ✓ | ✓ | | | |
| Crédits & Prêts | ✓ | ✓ | ✓ | | ✓ | | |
| Épargne programmée | ✓ | ✓ | ✓ | ✓ | | | |
| Taux de change | ✓ | ✓ | ✓ | ✓ | | | |
| Rapports | ✓ | ✓ | ✓ | | | ✓ | ✓ |
| Rapport BRH | ✓ | ✓ | | | | | ✓ |
| Alertes AML | ✓ | ✓ | ✓ | | | | ✓ |
| Journal d'audit | ✓ | ✓ | | | | | ✓ |
| Opérateurs | ✓ | ✓ | | | | | |
| Agences | ✓ | ✓ | | | | | |
| Administration | ✓ | ✓ | | | | | |
| Comptabilité | ✓ | ✓ | | | | ✓ | ✓ (lecture) |
| RH | ✓ | ✓ | ✓ (partiel) | | | | |

---

## 12. Comptabilité (partie double)

Chaque opération financière génère automatiquement une écriture comptable équilibrée (débit = crédit) dans `EcritureComptable`, adossée au plan comptable SYSCOHADA (`CompteComptable`, classes 1 à 7). En cas d'échec d'écriture, l'opération est enregistrée dans `EcritureEchec` pour rejeu, sans bloquer la transaction bancaire. Les états financiers (bilan, compte de résultat, grand livre) sont calculés à partir de ces écritures.

---

## 13. Déploiement

### Build & démarrage production

```bash
# Backend
cd backend
npm run build          # prisma generate + tsc
npm start              # prisma migrate deploy + node dist/server.js

# Frontend
cd frontend
npm run build
npm start
```

### Recommandations production

- `NODE_ENV=production`, secrets JWT forts et distincts, HTTPS obligatoire.
- Restreindre `CORS_ORIGINS` au domaine réel du frontend.
- Sauvegardes régulières de PostgreSQL.
- Changer immédiatement les mots de passe des comptes de démonstration.
- Configurer le SMTP pour la réinitialisation de mot de passe.

---

## 14. Scripts npm (backend)

| Script | Effet |
|--------|-------|
| `npm run dev` | Démarrage en développement (nodemon) |
| `npm run build` | `prisma generate` + compilation TypeScript |
| `npm start` | `prisma migrate deploy` + démarrage production |
| `npm run typecheck` | Vérification TypeScript sans émission |
| `npm run db:migrate` | Nouvelle migration |
| `npm run db:seed` | Données de démonstration |
| `npm run db:seed-config` | Clés de configuration métier |
| `npm run db:studio` | Prisma Studio (inspection base) |
| `npm run db:reset` | Réinitialisation complète + reseed |

---

*Document technique BANKA v1.0.*
