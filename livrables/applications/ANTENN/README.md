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

Ligne de partage : **l'opérateur exploite l'antenne au quotidien, l'administrateur contracte et détruit.** Toute action listée ci-dessous est tracée au journal d'audit, quel que soit le rôle.

| Domaine | OPERATEUR_REGIE | ADMINISTRATEUR |
|---------|-----------------|----------------|
| Grille (créer, éditer, dupliquer, synchroniser) | ✅ | ✅ |
| Matchs (créer, démarrer, terminer un direct) | ✅ | ✅ |
| Contenus (créer, modifier, définir le repli d'antenne) | ✅ | ✅ |
| Contenus (supprimer) | ❌ | ✅ |
| Habillage sponsor (poser une incrustation, un bandeau) | ✅ | ✅ |
| Habillage sponsor (retirer) | ❌ | ✅ |
| Replay (créer, publier, retirer du catalogue) | ✅ | ✅ |
| Replay (supprimer définitivement) | ❌ | ✅ |
| Sponsors (consulter) | ✅ | ✅ |
| Sponsors (contrats : créer, modifier, supprimer) | ❌ | ✅ |
| Identité de chaîne (nom, logo permanent) | lecture | ✅ |
| Comptes utilisateurs | ❌ | ✅ |
| Journal d'audit | ❌ | ✅ |

Pourquoi la coupure passe sur la suppression plutôt que sur la création : poser un habillage relève du travail courant, alors que le retirer prive un sponsor d'une exposition qu'il a payée. Même logique pour un contenu supprimé (exposition perdue, historique de diffusion appauvri) et pour un replay supprimé (les vues accumulées, qui comptent dans le rapport sponsor, disparaissent avec lui).

### Comptes et mots de passe

Aucun SMTP n'est configuré sur ce déploiement. Un administrateur crée un compte avec un mot de passe initial, puis génère depuis `/utilisateurs` un **lien de réinitialisation à usage unique** (valable 1 h) qu'il transmet par le canal de son choix : l'intéressé choisit son mot de passe sur `/reinitialiser`, l'administrateur ne le connaît jamais. Le jeton n'est stocké qu'en empreinte SHA-256.

Un compte n'est jamais supprimé (cela romprait le lien entre le journal d'audit et son auteur) : il se désactive, ce qui révoque immédiatement ses sessions. Deux gardes empêchent de se verrouiller dehors : on ne peut ni modifier son propre rôle ni se désactiver soi-même, et le dernier administrateur actif ne peut pas être rétrogradé.

Politique de mot de passe : 10 caractères minimum, avec majuscule, minuscule et chiffre ([`backend/src/utils/password.ts`](backend/src/utils/password.ts)).

## Audience et preuves de diffusion

C'est la chaîne qui rend le rapport sponsor exploitable. Sans elle, le rapport existe mais reste structurellement à zéro.

1. **Heartbeat des players.** Le player web ([`frontend/src/lib/audience.ts`](frontend/src/lib/audience.ts)) et le player mobile ([`mobile/src/api/audience.api.ts`](mobile/src/api/audience.api.ts)) envoient un `POST /api/audience/ping` toutes les 30 s pendant la lecture, avec une clé de session opaque (aucune donnée personnelle). Une ligne `AudienceSession` par couple (session, créneau).
2. **Durée calculée côté serveur.** L'écart entre deux pings est plafonné à 60 s : un onglet mis en veille n'ajoute jamais une heure de visionnage fictive. Un ping est refusé sur un créneau brouillon ou hors de sa plage de diffusion.
3. **Génération des `DiffusionLog`.** Un créneau synchronisé et terminé donne une preuve de diffusion agrégeant ses sessions (nombre de sessions distinctes, durée cumulée réellement visionnée). Le projet n'a pas de tâche de fond : la génération est paresseuse, déclenchée à l'ouverture du moniteur et des rapports, ou par `POST /api/audience/synchroniser`. Elle est idempotente (contrainte d'unicité sur `creneauId`).
4. **Rapport sponsor.** Agrège les preuves de diffusion des créneaux/matchs portant une exposition du sponsor. Les vues en replay sont comptées à part, jamais additionnées aux vues linéaires.

**Ce que ces chiffres ne sont pas :** une mesure d'audience certifiée. Les pings sont déclaratifs (émis par le client). Ils sont bornés côté serveur et dédupliqués par session, mais un document remis à un sponsor doit les présenter comme des estimations. Les sessions brutes sont purgées au-delà de 90 jours, les preuves de diffusion sont conservées.

## Journal d'audit

`GET /api/audit` (administrateur uniquement, lecture seule, page `/journal`). Trace les actions qui engagent la chaîne vis-à-vis d'un tiers : connexions, grille, contrats sponsors, habillage, identité d'antenne, replays, comptes. L'auteur est figé en clair (email + nom) au moment de l'action, pour qu'une désactivation de compte ultérieure ne vide pas l'historique. Aucune route d'écriture ou de suppression n'est exposée.

## Moniteur d'antenne

Écran d'accueil de la régie (`/moniteur`, `GET /api/moniteur`) : ce qui passe à l'antenne avec le temps restant, les programmes suivants, l'audience en direct ventilée web/mobile, et les quatre choses qui peuvent mal tourner — trou de grille dans les 24 h, créneaux jamais répercutés vers le playout, contrat sponsor expirant, absence de contenu de repli. Ce module n'ajoute aucune règle métier, il rassemble en un appel ce qui était réparti sur quatre pages.

## Tests

```bash
cd backend && npm test
```

`node:test` (intégré à Node 22, aucune dépendance ajoutée), 21 tests sur les deux mécanismes dont une régression silencieuse coûterait le plus cher :

- [`tests/creneaux.trous.test.ts`](backend/tests/creneaux.trous.test.ts) — détection des trous de grille, en pur, sans base : un trou non signalé, c'est un écran noir que personne ne voit venir.
- [`tests/creneaux.chevauchement.test.ts`](backend/tests/creneaux.chevauchement.test.ts) — garde de non-chevauchement (la règle vit dans une requête SQL, elle ne peut pas être testée hors base). Ce fichier travaille sur la base de développement dans une plage horaire de l'année 2030 et nettoie derrière lui.

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

- **Intégration ErsatzTV / RTMP / CDN réelle** (cf. section ci-dessus) : c'est le principal chantier restant avant une mise en production.
- **Alerte sortante sur trou d'antenne.** Le moniteur signale un trou dès qu'on l'ouvre, mais rien ne prévient personne à 2 h du matin : il n'y a aucune tâche de fond dans le projet. Un envoi d'email ou de webhook sur trou détecté et sur contrat expirant est le complément naturel.
- **Upload et transcodage vidéo** : les contenus et les replays référencent des URL déjà hébergées, ANTENN ne stocke jamais la vidéo.
- **Docker et CI** : le déploiement se fait encore à la main.
- **Couverture de test au-delà des deux mécanismes ci-dessus** : le reste de l'API est vérifié manuellement (API réelle + navigateur), pas automatiquement.
