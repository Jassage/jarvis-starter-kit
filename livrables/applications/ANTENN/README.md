# ANTENN — Régie de diffusion pour chaîne de streaming FAST

Backend d'administration et player web pour une chaîne de streaming linéaire (FAST) haïtienne, pour un client de Haitech Solutions. Gère la grille de programmation, les sponsors, les matchs en direct et l'habillage publicitaire. Le moteur de playout (ErsatzTV) et l'ingest RTMP terrain sont des briques externes existantes, non recodées ici.

## Stack

| Couche | Technologie |
|--------|-------------|
| Backend | Node.js, Express 4, TypeScript, Prisma 5, PostgreSQL |
| Frontend | Next.js App Router, TypeScript, Tailwind CSS 4, Zustand, hls.js |
| Auth | JWT access (15 min) + refresh token cookie httpOnly rotatif |

Ports : backend `4006`, frontend `3007`. Base Postgres `antenn_db`.

## Démarrage rapide (développement)

```bash
cd livrables/applications/ANTENN/backend
cp .env.example .env   # adapter DATABASE_URL si besoin
npm install
npx prisma migrate dev
npm run dev             # http://localhost:4006

cd ../frontend
npm install
npm run dev             # http://localhost:3007
```

Comptes de démonstration (seed) : `admin@antenn.ht` (ADMINISTRATEUR) et `operateur@antenn.ht` (OPERATEUR_REGIE), mot de passe commun `Antenn@123`.

## Rôles

- **ADMINISTRATEUR** : accès complet, y compris les contrats sponsors et la gestion des utilisateurs.
- **OPERATEUR_REGIE** : gère la grille et les matchs au quotidien (créer/éditer/dupliquer des créneaux, démarrer/arrêter un direct) mais n'a qu'un accès lecture seule aux sponsors (contrats commerciaux réservés à l'administrateur).

## Intégrations externes — état et points d'API prévus

Ces trois intégrations sont volontairement **documentées mais non câblées** dans cet environnement (pas d'accès à une instance ErsatzTV, un serveur RTMP ou un compte CDN réels). Le code prévoit les points d'entrée pour un branchement ultérieur, sans rien simuler.

### 1. API ErsatzTV (moteur de playout)

- Config : `ERSATZTV_BASE_URL` / `ERSATZTV_API_KEY` dans `backend/.env`.
- Point d'entrée documenté : [`backend/src/integrations/ersatztv.ts`](backend/src/integrations/ersatztv.ts).
- Tant que ce point n'est pas branché : la grille gérée dans ANTENN (`CreneauGrille`) reste la source de vérité "prévue", et un opérateur la marque manuellement `SYNCHRONISE` après l'avoir répercutée dans ErsatzTV (`POST /api/creneaux/:id/synchroniser`). L'UI distingue visuellement brouillon (non répercuté) vs synchronisé pour ne jamais confondre une modification en cours avec ce qui est réellement à l'antenne.
- Le statut d'un `Match` (`PLANIFIE` → `EN_COURS` → `TERMINE`) est également piloté manuellement (`POST /api/matchs/:id/demarrer` / `/terminer`) plutôt que par un poll automatique de l'ingest — cf. commentaire dans `ersatztv.ts` pour le point d'automatisation prévu.

### 2. Ingest RTMP (encodeur terrain, ex. OBS/Larix)

- Le champ `Match.ingestUrlRtmp` est saisi manuellement à la création du match (généré par le serveur de streaming, hors périmètre de ce dépôt).
- Aucune génération automatique d'URL à usage unique n'est implémentée — à ajouter côté serveur de streaming quand ce composant existera.

### 3. CDN de distribution HLS (Bunny Stream / Cloudflare Stream)

- Backend : `CDN_BASE_URL` dans `backend/.env` (exposé en lecture au player via `GET /api/epg`).
- Frontend : `NEXT_PUBLIC_CDN_STREAM_URL` dans `frontend/.env.local` — jamais codé en dur, cf. [`frontend/src/components/player/HlsPlayer.tsx`](frontend/src/components/player/HlsPlayer.tsx).
- Sans flux configuré, le player affiche un état "Hors antenne" propre plutôt qu'une erreur.

## Habillage publicitaire — overlay HTML vs incrustation brûlée

Les deux approches pour afficher un logo/bandeau sponsor par-dessus le flux sont documentées avec leurs compromis respectifs dans [`frontend/src/components/player/Overlay.tsx`](frontend/src/components/player/Overlay.tsx). L'implémentation retenue ici est l'overlay HTML côté player (seule option réalisable sans accès à ErsatzTV) ; les deux approches peuvent coexister une fois l'intégration ErsatzTV branchée.

## Reste hors périmètre

Tests automatisés (cohérent avec le reste du portefeuille), intégration ErsatzTV/RTMP/CDN réelle, upload/transcodage vidéo (les contenus référencent des URL déjà hébergées).
