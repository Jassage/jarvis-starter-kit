# Workspace History

> Journal chronologique de toutes les sessions et décisions importantes.
> Le plus récent en haut. Mis à jour automatiquement par Claude.
>
> **Comment ça marche :** Quand je lance la commande `/update` après une session importante, ou quand je raconte un changement significatif, Claude ajoute une entrée ici automatiquement. Je n'ai pas à écrire ce fichier manuellement.

---

## 2026-07-01

### LAKAY : session de polissage UI/UX + corrections bugs critiques

**Contexte :** Session de debugging et d'amélioration de l'expérience utilisateur sur LAKAY (plateforme immobilière haïtienne). Pas de nouvelles fonctionnalités majeures, mais 10+ corrections et améliorations ciblées.

**Corrections de bugs :**
- **422 PATCH /listings/:id** : `reset(data)` de React Hook Form peuplait tous les champs DB (id, status, images, owner, URLs nulles). Zod rejetait les null. Fix double : schéma accepte `z.union([z.string().url(), z.literal(''), z.null()])` pour les URLs optionnelles + sanitize ALLOWED fields côté frontend avant PATCH
- **401 POST /listings/:id/review** : `requireAdmin` s'appuyait sur `req.user` mais `requireAuth` n'était pas chaîné avant. Fix : ajout de `requireAuth` sur les 2 routes admin listings
- **500 GET /admin/stats** : `prisma.subscription.count({ where: { status: 'ACTIVE' } })` — le modèle `Subscription` a `isActive: Boolean` pas `status`. Fix : `{ isActive: true }`
- **Images property detail ne s'affichent pas** : Next.js `<Image>` échoue dans Edge (Tracking Prevention bloque le CDN Cloudinary via le layer d'optimisation). Fix : remplacement par `<img>` natif
- **Messages silencieux** : bug 1 — admin est owner des annonces seed, backend lance 400 "vous ne pouvez pas vous écrire". Fix : `isOwner` check + UI alternative. Bug 2 — catch vide. Fix : `msgError` state affiché sous le formulaire
- **Register crash** : nodemailer throw `Missing credentials for "PLAIN"` si SMTP pas configuré. Fix : guard early-return + try-catch non-bloquant dans `sendEmail`
- **Messagerie vide** : `queryFn` des conversations et messages n'avaient pas le double-unwrap `r.data.data` (pattern du reste de l'app). `data?.conversations` lisait donc toujours undefined. Fix : `.then(r => r.data.data)` + `sendSuccess(res, { messages: result.messages })` côté backend

**Améliorations UI :**
- **PropertyCard** : redesign complet — prix en overlay gradient sur l'image, badges type/dispo/vedette, favoris animé, hover lift
- **Hero** : passage full-width background image (abandon du split layout) avec fallbacks gradient + `<img>` natif pour éviter les blockers browser
- **Homepage** : section types redesignée, section vedettes avec label "À la une", CTA avec dot pattern, FAQ accordion 6 questions (fix couleurs CTA : `navy-700` et `navy-800` manquaient dans tailwind.config)
- **Départements dynamiques** : endpoint `GET /api/stats` enrichi avec `groupBy department` (Prisma). Nouveau composant `DepartmentsSection.tsx` : affiche les 10 départements haïtiens avec leur vrai count d'annonces actives. Grille 2→3→5 colonnes, départements sans annonces en gris atténué
- **Badges non-lus** : hook `useNavCounts` (messages/30s, notifications/60s, favoris/120s) + composant `NavBadge` dans le Header. Badge rouge avec "99+" si overflow
- **GPS picker** : composant `MapPicker.tsx` (Leaflet cliquable, centrée Haïti) intégré dans l'étape Localisation du formulaire de création d'annonce. Champs lat/lng sync bidirectionnel avec la carte
- **Plans** : bouton "Choisir ce plan" ouvre une modal avec instructions MonCash (numéro à copier, lien email pré-rempli, note 24h). Plus de redirect aveugle vers `/dashboard`
- **Leaflet StrictMode fix** : `PropertyMap` et `MapPicker` suppriment `_leaflet_id` dans le cleanup `useEffect` pour éviter "Map container is already initialized"

**À faire encore :** intégration MonCash API réelle (en attente credentials Digicel Business), pagination cursor-based, Stripe abonnements.

---

## 2026-06-30 (nuit)

### LAKAY : plateforme immobilière haïtienne — MVP complet livré

**Contexte :** Nouveau projet SaaS, plateforme d'annonces immobilières dédiée à Haïti. Jaslin voulait un MVP production-ready en une session (rôle CTO/SA/PM/dev full stack). Ports choisis : 4003 (backend) / 3004 (frontend) pour éviter les conflits avec les projets existants.

**Stack :**
- Backend : Express 4 + TypeScript + Prisma + PostgreSQL + PostGIS + Redis + BullMQ + Socket.IO + Cloudinary + Swagger
- Frontend : Next.js 14 App Router + TypeScript + Tailwind CSS + Shadcn UI + TanStack Query + Zustand + React Hook Form + Zod
- Infra : Docker Compose (postgis:16-3.4-alpine, Redis 7), Nginx reverse proxy, GitHub Actions CI/CD

**Particularités Haïti :**
- Champ `landmark` (point de repère) obligatoire : les adresses numériques n'existent souvent pas en Haïti
- Département enum : 10 départements (OUEST, NORD, NORD_EST, NORD_OUEST, ARTIBONITE, CENTRE, SUD, SUD_EST, NIPPES, GRANDE_ANSE)
- Devise double HTG/USD sur toutes les annonces
- Fonctionnalités spécifiques : eau courante, électricité, citerne, générateur, panneau solaire (critiques en Haïti)

**Architecture — Modèles principaux (schema.prisma) :**
- User (SUPER_ADMIN/ADMIN/AGENCY/AGENT/OWNER/INDIVIDUAL), RefreshToken, Subscription (FREE/BASIC/PROFESSIONAL/ENTERPRISE)
- Listing (9 types de biens, 18 booléens commodités, lat/lng + landmark, statuts DRAFT→PENDING_REVIEW→ACTIVE→…)
- Conversation, ConversationParticipant, Message (messagerie temps réel)
- Payment (MonCash + Stripe scaffoldés), Notification, VisitRequest, Review, Report, AuditLog

**Backend — modules livrés :**
- Auth : register+subscription, login, refresh token rotatif, email verification, reset mot de passe (SHA-256, 1h), changePassword, RBAC middleware (hiérarchie numérique 20→100)
- Listings : CRUD, limites par plan, soumission révision, upload Cloudinary, statuts lifecycle
- Search : 30+ filtres Prisma, Haversine post-filter, autocomplete villes/quartiers, sponsored en tête
- Messages : getOrCreateConversation, sendMessage (Socket.IO broadcast), unreadCount
- Agencies, Favorites, Notifications, Reviews, Payments (MonCash + Stripe), Admin (dashboard, users, reports, config, audit)
- **Nouveaux modules (cette session) :** AI (estimation prix, génération description, recherche NL, chat assistant), Visits (demandes visite, réponse propriétaire)
- Workers BullMQ : email.worker (nodemailer), notification.worker (Socket.IO + DB)

**Frontend — pages livrées :**
- `page.tsx` (home) : hero navy/orange, recherche, grille types, featured listings, départements, CTA
- `properties/page.tsx` : recherche + filtres sidebar, grid/map toggle, pagination
- `properties/[id]/page.tsx` : galerie photos, amenities grid, carte contact, signalement
- `(auth)/login` et `register` : split panel, role selector
- `dashboard/page.tsx` : KPI cards, tableau annonces récentes, subscription card
- `dashboard/listings/page.tsx` : gestion annonces avec filtres statuts, actions CRUD
- `dashboard/listings/new/page.tsx` : formulaire 4 étapes (infos générales, localisation, caractéristiques, photos)
- `dashboard/messages/page.tsx` : messagerie split panel avec Socket.IO temps réel, typing indicator
- Layout main (header nav + footer), layout auth

**Couleurs :** primary #FF6B35 (orange chaud), navy #003B7A (inspiré drapeau haïtien), haiti.red #CE1126

**Comptes seed :** admin@lakay.ht / Admin@Lakay2024!, proprietaire@demo.ht / Owner@123, utilisateur@demo.ht / User@123, agence@demo.ht / Agency@123

**CI/CD :** GitHub Actions (test → build images Docker → push ghcr.io → deploy SSH VPS). Nginx avec rate limiting auth (5r/m) et API (10r/s), WebSocket upgrade pour Socket.IO.

**À faire encore :** admin panel frontend, map Leaflet, module profil/favoris frontend, notifications push, intégration MonCash credentials Digicel (même blocage que KONEKTE), SMS/WhatsApp.

---

## 2026-06-30 (soir)

### GESCOM : Phase 0 (socle) + Phase 1 (Stock/Produits) + Phase 2 (Ventes/Clients) — ERP commercial livré au client

**Contexte :** Nouveau client (entreprise commerciale : boutique détail + entrepôt grossiste, devise HTG, 5-20 utilisateurs). Contrat signé. Projet créé de zéro en une session. Stack : Next.js App Router + Express 4 + TypeScript + Prisma v5 + PostgreSQL. Ports 4002/3003. Patterns réutilisés de BANKA (auth, RBAC, audit, mouvements typés) et MEDIKA (stock par emplacement, commandes fournisseurs).

**Phase 0 — Socle technique :**
- Schéma Prisma complet (18 modèles, 10 enums) couvrant les 4 modules prévus : Stock multi-emplacement + transferts, Ventes/Facturation avec clients PARTICULIER/GROSSISTE, Achats/Fournisseurs avec réception ligne par ligne, Comptabilité en partie double SYSCOHADA réduite
- Auth JWT (cookie httpOnly) + refresh token rotatif + RBAC 5 rôles (SUPER_ADMIN, GERANT, VENDEUR, MAGASINIER, COMPTABLE) + audit log
- Login vérifié en navigateur. Compte démo : admin@gescom.ht / Admin@123. DB PostgreSQL locale `gescom` créée par `prisma migrate dev`

**Phase 1 — Produits + Stock :**
- Backend : CRUD Produits (création auto des lignes StockEmplacement par emplacement actif), Stock (listage par emplacement, mouvements, alertes seuil, ajustement atomique avec MouvementStock), dashboard/stats (valeur stock, produits sous alerte, répartition par emplacement, mouvements récents)
- Frontend (redesign complet après feedback "trop moche") : dashboard premium (hero gradient vert, KPI cards avec badges gradient colorés, répartition avec barres, timeline mouvements avec timestamps relatifs), sidebar avec icônes lucide-react + drawer mobile + carte profil, header avec dropdown utilisateur + hamburger mobile, police Inter via next/font, responsive 100% desktop/mobile (grilles adaptatives, tables overflow-x-auto, sidebar fixe desktop/overlay mobile)

**Phase 2 — Ventes + Clients :**
- Backend service vente atomique : vérification stocks avant création, décrémentation StockEmplacement, MouvementStock(VENTE) par ligne, écriture comptable débit Caisse(571)/Clients(411) → crédit Ventes(701), mise à jour client.soldeDu pour ventes CREDIT, annulation avec restitution atomique du stock. Numérotation auto VNT-000001
- CRUD Clients (PARTICULIER/GROSSISTE, solde dû, archivage avec guard si solde positif)
- Dashboard enrichi : KPI "VENTES DU JOUR" (count + montant compilé au démarrage de chaque journée) remplace "EMPLACEMENTS" — données réelles vérifiées (344.6 K HTG stock, 3 K HTG ventes du jour, 1 vente validée)
- Frontend : page Ventes (3 KPI cards : total/validées/crédit, tableau historique avec statuts colorés, temps relatif), page Clients (tableau + badge GROSSISTE/PARTICULIER + solde dû en rouge si positif), modal NouvelleVente style POS (sélection produits avec stock disponible affiché, panier multi-lignes avec quantité/prix éditables, tabs mobile Produits↔Panier, 4 modes paiement, calcul solde dû CREDIT en live, bouton validation gradient)

**Vérifications :** 0 erreur TypeScript backend+frontend. Login, création produit, ajustement stock, vente espèces, dashboard temps réel — tout confirmé en navigateur.

**Phases restantes :** Achats/Fournisseurs (Ph3), Transferts boutique↔entrepôt (Ph4), Comptabilité SYSCOHADA réduite (Ph5), Rapports (Ph6)

---

## 2026-06-30 (après-midi)

### SYGS-IMFP : module Messagerie — pièces jointes + accusés de livraison/lecture + corrections

**Pièces jointes :**
- Schéma Prisma étendu : enum `AttachmentType` (PHOTO/DOCUMENT/VOICE) + 4 champs nullable sur `Message` (`attachmentUrl`, `attachmentType`, `fileName`, `fileSize`). Synchronisé via `prisma db push` (drift migration existant empêchait `migrate dev`).
- `src/middleware/upload.ts` : `attachmentStorage` (diskStorage, destination dynamique par catégorie : `uploads/attachments/photos|documents|voice`) + `uploadAttachment = multer(...).single("file")` (10 Mo max, fileFilter par mimetype).
- `src/server.ts` : static serve `/uploads/attachments` + fix CORP header (`Cross-Origin-Resource-Policy: cross-origin`) sur les 3 routes statiques uploads — nécessaire car Helmet 8 pose `same-origin` globalement, bloquant le chargement cross-origin des images/audio depuis le frontend (port 3000 vs backend port 5000).
- `src/socket/io.ts` (nouveau) : singleton `setIO`/`getIO` pour accéder à l'instance Socket.io depuis les contrôleurs REST.
- `POST /api/messages/conversations/:id/attachment` : upload multer → service `sendAttachment` → diffusion `new_message` vers `conv:{id}` ET `user:{participantId}` (garantit livraison même si conversation pas ouverte).
- Frontend : bouton trombone (fichier) + bouton micro (MediaRecorder vocal), rendu des bulles par type (img miniature / icône+téléchargement / `<audio controls>`), aperçu ConversationList (📷 Photo / 📄 Document / 🎤 Message vocal).

**Accusés de livraison/lecture (style WhatsApp) :**
- Schéma : `ConversationParticipant.lastDeliveredAt DateTime?` ajouté (miroir de `lastReadAt`).
- `markDelivered(conversationId, userId)` : bump `lastDeliveredAt = now()`, appelé dans `getMessages()` (REST fetch = livraison) et dans le handler socket `ack_delivered`.
- `markAsRead` modifié pour retourner le timestamp + émettre `message_status {conversationId, userId, lastReadAt}` vers `conv:{id}` (l'expéditeur sait en temps réel que c'est lu).
- Socket : event `ack_delivered` (client → serveur si message d'un autre) → `markDelivered` → `message_status {lastDeliveredAt}` vers `conv:{id}`.
- Frontend : `getConversations()` expose `lastReadAt`/`lastDeliveredAt` par participant. `ChatWindow` calcule le statut de chaque message envoyé vs les timestamps des autres participants : ✓ gris = Envoyé, ✓✓ gris = Livré (tous ont reçu), ✓✓ bleu = Lu (tous ont ouvert). Groupe : lu = TOUS les membres ont vu. Mise à jour en temps réel via listener `message_status` dans `useSocket`.
- Diffusion `new_message` étendue : en plus de `conv:{id}`, émis vers `user:{participantId}` de chaque participant → badge non-lus mis à jour en temps réel même si la conversation n'est pas ouverte.

**Bug réinscriptions corrigé :**
- `GET /api/enrollments/fee-structures` retournait 404 (code ENROLLMENT_NOT_FOUND). Cause : même bug d'ordre de routes Express qu'en 2026-06-14 (Présence) — `GET /:id` déclaré avant `GET /fee-structures`, Express interceptait "fee-structures" comme id. Corrigé en déplaçant `/fee-structures` avant `/:id` dans `enrollmentRoutes.ts`.

**Bug modal Nouvelle conversation corrigé :**
- `UserRow` défini comme composant à l'intérieur du corps de `NewConversationModal` → remount React à chaque re-render → clics annulés si un re-render tombait entre mousedown et mouseup (fréquent avec les mises à jour temps réel de la messagerie). Corrigé en déplaçant `UserRow` au niveau module.

---

## 2026-06-30

### Lancement du projet GESCOM (ERP commercial) — socle technique (Phase 0)

**Contexte :** nouveau client signé, entreprise commerciale avec 1 boutique (détail) + 1 entrepôt grossiste, stocks séparés, devise HTG, 5-20 utilisateurs. Modules attendus : Stock/inventaire, Ventes/facturation, Achats/fournisseurs, Comptabilité de base. Demande explicite de Jaslin : tout mettre en place avant de développer les écrans métier.

**Exploration préalable :** patterns réutilisés de BANKA (architecture controllers/services/routes, auth JWT + refresh rotatif, RBAC, audit log, comptabilité en partie double) et de MEDIKA (module Pharmacie comme modèle pour mouvements de stock typés et commandes fournisseurs avec réception ligne par ligne).

**Livré (Phase 0 — socle uniquement, pas d'écrans métier) :**
- Schéma Prisma complet pour les 4 modules : Identité/Emplacements (Utilisateur, RefreshToken, AuditLog, Emplacement BOUTIQUE/ENTREPOT), Stock/Produits (Produit, StockEmplacement par site, MouvementStock typé, Transfert/LigneTransfert), Ventes (Client particulier/grossiste, Vente/LigneVente), Achats (Fournisseur, CommandeFournisseur/LigneCommande avec réception partielle), Comptabilité (CompteComptable plan réduit à 9 comptes, EcritureComptable partie double, EcritureEchec)
- RBAC à 5 rôles : SUPER_ADMIN, GERANT, VENDEUR, MAGASINIER, COMPTABLE
- Auth JWT (cookie httpOnly + refresh rotatif), audit log, gestion d'erreurs, rate limiting — backend Express 4 + TypeScript + Prisma 5
- Frontend Next.js App Router : login + layout dashboard protégé (hydratation Zustand avant redirect), store d'auth
- Base PostgreSQL `gescom` créée, migrée, seedée (plan comptable, 2 emplacements, admin démo `admin@gescom.ht` / `Admin@123`, produits/client/fournisseur d'exemple)
- `.claude/launch.json` : configs `gescom-backend` (port 4002) et `gescom-frontend` (port 3003)
- Backend et frontend à 0 erreur TypeScript, login vérifié de bout en bout en navigateur (cookie JWT posé, dashboard affiché avec rôle)

**Incident :** deux installations npm parallèles du frontend ont corrompu `node_modules` (erreurs TAR_ENTRY lors de l'extraction de `next`). Résolu par nettoyage complet et réinstallation unique.

**Prochaine étape :** Phase 1 — CRUD Produits + Stock par emplacement, mouvements, alertes de seuil. Roadmap complète : Phase 2 Ventes/Facturation, Phase 3 Achats/Fournisseurs, Phase 4 Transferts, Phase 5 Comptabilité, Phase 6 Rapports.

---

## 2026-06-29 (après-midi)

### SYGS-IMFP : module Messagerie (Socket.io)

**Backend :**
- 3 modèles Prisma : `Conversation` (DIRECT/GROUP), `ConversationParticipant` (lastReadAt pour accusé de lecture), `Message`. Migration appliquée via `prisma migrate dev --name add_messaging`
- `socket.io` installé. `server.ts` migré de `app.listen` vers `createServer(app)` + `SocketServer(httpServer)` — Socket.io partage le même port HTTP (5000)
- Auth socket : middleware JWT qui vérifie le token via `verifyJwtToken` + `UserService.getUserProfile` avant d'autoriser la connexion
- Events socket : `join_conversation`, `leave_conversation`, `send_message` (callback ACK), `typing`
- REST : `GET /messages/conversations`, `POST /messages/conversations`, `GET /messages/conversations/:id/messages`, `PATCH /messages/conversations/:id/read`, `GET /messages/unread-count`, `GET /messages/users`

**Frontend :**
- `socket.io-client` installé. `useSocket.ts` : connexion singleton (survit aux navigations entre routes), disconnect sur logout
- `messageStore.ts` (Zustand, non persisté) : conversations, messages par conversationId, totalUnread, toutes les actions CRUD
- Composants : `MessagingPage` (layout split responsive), `ConversationList` (filtrage par nom, badges non-lus), `ChatWindow` (bulles de messages groupées par date, indicateur frappe, Entrée pour envoyer), `NewConversationModal` (onglet Direct + onglet Groupe avec recherche)
- `useSocket()` initialisé dans `Index.tsx` — connexion dès que l'utilisateur est authentifié
- Sidebar : badge rouge sur l'icône messagerie (nombre de non-lus), s'efface quand l'onglet est actif et sans non-lus
- Page messagerie sans padding (contrairement aux autres pages) : `overflow-hidden` sur le `main` quand `activeTab === "messaging"`
- Messagerie ouverte à tous les rôles (Admin, Directeur, Secrétaire, Comptable, Professeur, Élève)
- 0 erreur TypeScript frontend + backend après `prisma generate`

---

## 2026-06-29

### BANKA : audit sécurité complet + corrections critiques (Semaines 1–4) + reset mot de passe

**Audit :** analyse ligne par ligne du backend et du frontend par un senior developer fictif. Résultat : 4 semaines de corrections classées par criticité.

**Semaine 1 — Sécurité critique :**
- JWT_REFRESH_SECRET rendu obligatoire (throw si absent)
- RBAC ajouté sur toutes les routes non protégées (caisse, comptes, prêts, taux de change)
- `requireCaisseOuverte` câblé sur POST virement cross-devise

**Semaine 2 — Atomicité des transactions :**
- `validerTransaction` et `rejeterTransaction` : findUnique déplacé DANS `$transaction` + compare-and-swap via `updateMany({ where: { statut: 'EN_ATTENTE' } })` → 0 race condition possible
- `rejeterTransaction` : rejet symétrique du jumeau VIREMENT_CREDIT associé
- `setTaux` : atomique (désactive l'ancien + crée le nouveau dans une seule transaction)
- `annulerAvance` : remboursement compte dans la même transaction que le changement de statut
- `withRetry` enveloppant les $transaction pour absorber les deadlocks PostgreSQL

**Semaine 3 — Sécurité auth :**
- Politique mot de passe : 12 caractères min, maj+min+chiffre+spécial (`PASSWORD_REGEX`)
- Révocation automatique des refresh tokens sur désactivation d'un compte (`actif: false`)
- Droits mandats : whitelist stricte (`DROITS_VALIDES = ['CONSULTATION', 'DEPOT', 'RETRAIT', 'VIREMENT', 'SIGNATURE']`)
- CommKey ZKTeco : correction du bypass (vérification même si device n'a pas de commKey défini)
- Rate limiting sur `/iclock` (60 req/min)

**Semaine 4 — Conformité et qualité :**
- `deleteClient` : soft delete (INACTIF) avec guards (comptes actifs, prêts non soldés)
- `EcritureEchec` : champs résolution (resolu, resoluAt, resoluParId) + endpoints GET/PATCH dans compta.routes
- `listContrats` : effet de bord `expirerContratsEchus` extrait en route dédiée `POST /contrats/expire`
- Ratio solvabilité BRH : calculé depuis les écritures comptables classe 1 (au lieu de placeholder)
- N+1 corrigé dans `getRapportBRH` (clientsMap) et `genererFichesPaie` (3 queries batch + Maps)
- Migration `prisma migrate deploy` : 6 migrations en attente appliquées

**Reset mot de passe par email :**
- Token opaque 256-bit (crypto.randomBytes), usage unique, 1h expiry, stocké haché en DB (PasswordResetToken model)
- Retourne toujours 200 (pas d'énumération email)
- Révoque toutes les sessions actives sur réinitialisation
- `utils/email.ts` : transport nodemailer avec template HTML
- Rate limit 5 req/15min sur les endpoints de reset
- Pages frontend : `/reset-password/request` (email) + `/reset-password` (nouveau MDP avec checklist live)
- Env vars requises : `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `FRONTEND_URL`

**Nettoyage final :**
- 100 occurrences `(prisma as any)` supprimées sur 7 fichiers après `prisma generate`
- 0 erreur TypeScript (`npx tsc --noEmit`)

**Bug UI corrigé — spans sur inputs :**
- Cause : `.input` dans globals.css définit `padding` shorthand → écrase les `pl-*`/`pr-*` Tailwind (même spécificité, globals.css gagne)
- Fix root : `.input` → `:where(.input)` dans globals.css (spécificité 0, les utilitaires Tailwind gagnent toujours)
- Fix explicites : inline `style={{ paddingRight/Left }}` sur tous les inputs affectés (TransactionForm, CompteForm, PretForm, caisse page x2, recherche x4)

**Vérification comptabilité :**
- Module marqué "manquant" dans CONTEXT.md en réalité 100% implémenté
- Backend : 12 routes, service complet (plan comptable CRUD, journal CRUD, grand livre, bilan, compte de résultat, dashboard, réconciliation échecs)
- Frontend : 6 pages (/compta/dashboard, /journal, /grand-livre, /bilan, /resultat, /plan-comptable)
- CONTEXT.md corrigé

---

## 2026-06-28

### BANKA : Priorités 2 & 3 — frais, KYC, AML, SSE, taux de change, rapport BRH, redesign login

**Frais automatiques (M4) :**
- `frais.service.ts` : 3 fonctions — `preleverFraisTenueCompte` (mensuel, depuis config `FRAIS_TENUE_COMPTE_MENSUEL`), `preleverFraisDossierPret` (% sur montant décaissé, config `FRAIS_DOSSIER_PRET_TAUX`), `preleverFraisVirement` (% sur montant virement, config `FRAIS_VIREMENT_TAUX`)
- Câblés dans `transaction.service.ts` (après crédit destination) et `pret.service.ts` (après décaissement)

**KYC renforcé (M5) :**
- `client.schemas.ts` : `refineClient` exige `pieceIdentite` + `numeroPiece` pour `typeClient === 'INDIVIDUEL'`, âge ≥ 18 calculé avec précision mois/jour
- `ClientForm.tsx` : champ `dateNaissance` avec affichage de l'âge en temps réel, labels avec astérisque, message d'erreur inline

**AML — Anti-blanchiment (M6) :**
- `aml.service.ts` (nouveau) : 4 détecteurs fire-and-forget (`SEUIL_DECLARE`, `STRUCTURATION` sur 24h, `VELOCITE_ELEVEE` > 10 tx/h, `MANDATAIRE_BLACKLIST`)
- Modèle `AlerteAML` + migration + routes AUDITEUR (`GET /aml`, `PATCH /aml/:id/traiter`)
- Appelé via `Promise.allSettled()` après chaque transaction (dépôt, retrait, virement)
- Page `/aml` : 4 cards stats, filtres, tableau paginé, bouton "Marquer traitée"

**SSE — Notifications temps réel (M7) :**
- `sse.service.ts` + `sse.routes.ts` : `requireAuthSSE` (token en query param car EventSource ne supporte pas les headers custom), heartbeat 30s
- `useSSE.ts` (hook frontend) : auto-reconnect 10 tentatives
- `Header.tsx` : flash de la cloche 3s sur `TRANSACTION_EN_ATTENTE` et `ALERTE_AML`, incrément compteur en temps réel

**Taux de change (M8) :**
- `TauxChange` model + migration, `tauxChange.service.ts` : `getTauxActif`, `setTaux` (désactive le précédent), `effectuerVirementCross` (atomique dans `prisma.$transaction`, taux achat si source USD, taux vente si destination USD)
- Page `/taux-change` : affichage taux actif USD, formulaire SUPERVISEUR+, virement cross-devise avec résumé, historique des taux

**Rapport BRH (M9) :**
- `getRapportBRH()` : ratio liquidité (actifs liquides / dépôts ≥ 20%), ratio solvabilité (placeholder ≥ 8%), top 5 grandes expositions (% encours par emprunteur, seuil 10%), comptes capitaux classe 1
- Page `/rapport-brh` : `RatioCard` avec barre de conformité + badge conforme/non conforme, bouton Imprimer

**Remboursement anticipé (M10) :**
- `enregistrerRemboursement` : si `type === 'ANTICIPEE'`, supprime les lignes EN_ATTENTE/EN_RETARD et recalcule le tableau via `calculerTableau` à partir de la première échéance restante

**SYSCOHADA étendu :**
- `COMPTES_BASE` étendu de 8 à 31 comptes (classes 1, 2, 4, 5, 6, 7)

**Sidebar et navigation :**
- 3 entrées ajoutées : Taux de change (exchange), Rapport BRH (flag), Alertes AML (triangle warning), avec RBAC appropriés

**Seed config :**
- `prisma/seed-config.ts` : insère idempotent 8 clés (`AML_SEUIL_HTG`, `AML_SEUIL_USD`, `FRAIS_TENUE_COMPTE_MENSUEL`, `FRAIS_DOSSIER_PRET_TAUX`, `FRAIS_VIREMENT_TAUX`, `TAUX_PENALITE_JOURNALIER`, `DELAI_GRACE_RETARD`, `PLAFOND_RETRAIT_JOURNALIER`)
- Script : `npm run db:seed-config`

**Redesign page login :**
- Style sombre inspiré de l'AMAG Académie : fond navy plein écran avec grille de points et halos lumineux
- Carte deux panneaux semi-transparente (backdrop-blur) : panneau gauche (icône banque, badge "★ SYSTÈME BANCAIRE" doré, titre BANKA/ERP Bancaire, carrousel de tips bancaires) + panneau droit (label "PORTAIL BANCAIRE", champs avec icônes et focus effect, bouton bleu, comptes démo cliquables)
- reCAPTCHA supprimé, 2FA conservée

**Bugs corrigés :**
- `--no-engine` Prisma : client regénéré avec moteur complet après libération du verrou DLL
- Double décrémentation dans `enregistrerRemboursement` supprimée
- `return withRetry(...)` → `const result = await withRetry(...)` pour permettre le code fire-and-forget après la transaction

---

### BANKA : formatage compact, agences RH, compte système employé, blocage caisse

**Formatage compact des montants (nouveau) :**
- Fonction `formatMontantCompact` ajoutée dans `frontend/src/lib/utils.ts` : affiche les grands montants en K/M/Md HTG (ex : "1,2 M HTG") avec le montant exact au survol via l'attribut `title`
- Appliquée sur toutes les cartes KPI du dashboard principal (solde total, encours crédit, dépôts/retraits du jour, net jour, tendances 7j) et du dashboard RH (masse salariale)
- Bannière rouge "Caisse fermée" sur le dashboard avec lien direct vers /caisse

**Module Agences — enrichissement RH :**
- Champ `agenceId` ajouté au modèle `Employe` (relation optionnelle vers `Agence`)
- Schéma Prisma mis à jour et synchronisé via `npx prisma db push` (shadow DB P1014 sur `avances_salaire` rendait `migrate dev` impossible)
- `listAgences` et `getAgence` incluent désormais `_count.employes`
- Page agences : 5e KPI "Employés RH" affiché, grille détail par agence étendue (4 colonnes : Agents, Employés, Comptes, Prêts)
- Filtre par agence sur la liste des employés (dropdown → `?agenceId=` param)
- Badge agence sur chaque carte employé

**Transfert d'employé entre agences (nouveau) :**
- Endpoint `PATCH /rh/employes/:id/agence` : valide que la nouvelle agence existe et est active, rejette si c'est la même, enregistre un audit log `TRANSFERT`
- Modal "Transfert" dans la page employés : affiche l'agence actuelle, dropdown de la liste des agences actives, confirmation → appel API

**Création de compte système depuis la fiche employé (nouveau) :**
- Endpoint `POST /rh/employes/:id/compte-systeme` : crée un `Utilisateur` (email + mot de passe haché + rôle) et lie son id à l'employé via `utilisateurId` (unique)
- Endpoint `DELETE /rh/employes/:id/compte-systeme` : délie le compte sans le supprimer
- Modèle `Employe` enrichi : `utilisateurId String? @unique`, relation bidirectionnelle avec `Utilisateur`
- Frontend : bouton personne sur chaque carte employé (vert = compte lié → clic pour délier ; gris = pas de compte → clic pour créer). Modal avec champs email + rôle (6 options) + mot de passe

**Blocage des transactions sans caisse ouverte (nouveau) :**
- Middleware `requireCaisseOuverte` dans `backend/src/middleware/caisse.ts` : cherche une `SessionCaisse` active pour l'agence de l'utilisateur connecté ; les utilisateurs sans `agenceId` (siège) passent directement
- Appliqué sur `POST /transactions/depot`, `/retrait` et `/virement`
- Retourne 403 avec message clair si la caisse est fermée

**Correction technique :**
- Backend bloqué par DLL lock (processus PID 20008 tenant le fichier généré Prisma) : tué manuellement, `npx prisma generate` relancé, backend redémarré sur PID 27012

---

## 2026-06-25

### BANKA : module RH complet, mandats externes, bug caisse corrigé

**Module RH — Paie (nouveau) :**
- Workflow BROUILLON → VALIDÉ → PAYÉ pour les bulletins de paie
- Chaque employé peut avoir un compte bancaire BANKA lié (`compteId`) et un mode de règlement (`VIREMENT_BANKA` ou `ESPECES`)
- `genererFichesPaie` calcule : salaire brut + primes/bonus/indemnités/heures sup (depuis `ElementVariable`) - cotisations ONA 6% - retenues - avance déductible - versement mensuel prêt en cours = net à payer
- `validerFiche` : passage BROUILLON → VALIDÉ par un responsable (nouvel endpoint `PATCH /rh/paie/:id/valider`)
- `payerSalaires` : traite uniquement les fiches VALIDÉES, crée une vraie `Transaction` type `VIREMENT_CREDIT` sur le compte de l'employé (visible dans son relevé), marque la fiche PAYÉE

**Avances sur salaire (nouveau) :**
- Modèle `AvanceSalaire` : montant max 50% du brut, créditée sur le compte de l'employé à la création
- Déduction automatique au moment de `genererFichesPaie` si l'avance est `EN_ATTENTE` et que la `periodeDeduction` correspond
- Endpoints : `GET/POST /rh/avances`, `PATCH /rh/avances/:id/annuler` (débite le compte en cas d'annulation)

**Éléments variables (nouveau) :**
- Modèle `ElementVariable` : 5 types (PRIME, BONUS, INDEMNITE, HEURE_SUP, RETENUE)
- PRIME/BONUS/INDEMNITE/HEURE_SUP s'ajoutent au brut avant les cotisations ; RETENUE se déduit du net après cotisations
- Endpoints : `GET/POST /rh/elements-variables`, `DELETE /rh/elements-variables/:id`

**Mandats & Procurations — Personne externe (fix) :**
- Avant : seuls les clients enregistrés pouvaient être désignés mandataires
- Après : mode "Personne externe" dans `MandatForm` (nom, prénom, téléphone, pièce d'identité) : un client est créé à la volée pour garantir la traçabilité KYC, puis le mandat est créé sur ce client

**Bug Caisse — 0 transactions (fix) :**
- Cause 1 : `getSessionActive` retournait `_count` au lieu du tableau complet des transactions → corrigé (tableau `transactions` avec orderBy)
- Cause 2 : `effectuerDepot`/`effectuerRetrait`/`effectuerVirement` ne passaient jamais `sessionId` car `TransactionForm` ne le transmet pas → helper `resolveSessionId` ajouté dans `transaction.service.ts` : cherche la session ouverte pour l'agence + la devise du compte et l'auto-lie à toute nouvelle transaction

---

## 2026-06-24

### BANKA : mandats/procurations, administration système, pénalités automatiques, 9 types de comptes

**TypeCompte étendu (3 types → 9) :**
- Ajout JOINT, MICRO_EPARGNE, TONTINE, RETRAITE, JEUNESSE, CREDIT (codes : CJ/ME/TN/RT/JE/CL)
- Migration Prisma appliquée, CompteForm mis à jour en grille 3x3, filtre déroulant étendu

**Module Mandats & Procurations (nouveau) :**
- Modèle `MandatCompte` (migration appliquée) : droits flexibles (`String[]`), date d'expiration optionnelle, relation mandataire (client tiers)
- Backend : service avec validation doublon + audit log, 4 endpoints (`GET/POST/PUT/DELETE /comptes/:id/mandats`)
- Frontend : `mandatStore`, composant `MandatForm` (combobox recherche client + sélection droits CONSULTATION/DEPOT/RETRAIT/VIREMENT en cartes)
- Section mandats sur la page détail compte, révocation en un clic

**Module Administration (nouveau) :**
- 10 paramètres configurables : nom/adresse/tel/email institution, taux pénalité journalier, délai grâce, taux intérêt épargne, solde minimum ouverture, plafond retrait, devise principale
- API `GET/PUT/POST /configurations`, modification réservée SUPER_ADMIN/DIRECTEUR
- Page `/administration` en 3 colonnes, sauvegarde individuelle par champ avec feedback visuel
- Entrée "Administration" avec icône engrenage dans la Sidebar

**Pénalités de retard automatiques :**
- `enregistrerRemboursement` calcule la pénalité depuis config : `Capital restant × Taux journalier × (Jours retard - Délai grâce)`
- Ventilation : pénalité d'abord, puis intérêts, puis capital
- Endpoint `GET /prets/:id/penalite` pour consulter la pénalité estimée
- Endpoint `POST /prets/refresh-retards` : bascule les prêts EN_COURS en EN_RETARD si échéances dépassées

**Corrections et compléments de la session :**
- Audit log manquant sur les virements corrigé (`effectuerVirement`)
- Audit logs ajoutés sur tous les services (client, compte, pret, caisse, auth)
- Pages full-width : suppression des `max-w-*` sur toutes les pages dashboard
- Rapport journalier + PAR 30/90 + impayés (nouvelle page `/rapports`)
- PDF dossier crédit depuis la page détail prêt

---

## 2026-06-23

### EduSpher : Phase 1 et Phase 2 livrées (plateforme e-learning opérationnelle)

**Contexte :** La plateforme EduSpher existait avec une UI complète (9 pages, design system cohérent) mais zéro donnée réelle — tout venait de `lib/data.js` (mock). Le projet Supabase du `.env` était mort (ENOTFOUND). Passage à SQLite local pour continuer.

**Phase 1 — Branchement backend :**
- Bascule SQLite : `schema.prisma` provider → sqlite, `DATABASE_URL` → `file:./dev.db`, `directUrl` supprimé
- DB créée via `prisma db push` + seedée (`npm run db:seed`) : 6 cours, 3 users démo (julien/sofia/admin, password123), inscriptions, quiz, certificats
- 4 API routes créées : `GET /api/courses`, `GET /api/courses/[id]`, `GET /api/user/enrollments`, `GET /api/user/profile`
- `SessionProvider` ajouté dans `layout.jsx` via wrapper client `Providers.jsx`
- Bouton Déconnexion corrigé : `go('landing')` → `signOut({ callbackUrl: '/' })` (next-auth/react)
- Dashboard étudiant rebranché : vraies inscriptions + vraies recommandations depuis la DB, prénom depuis la session
- Sidebar rebanchée : vrai nom/rôle depuis `useSession()` au lieu des constantes hardcodées

**Phase 2 — Persistance et fonctionnalités formateur :**
- `GET/POST /api/lesson/progress` : marque une leçon terminée, recalcule automatiquement le % d'enrollment dans la foulée
- `GET /api/quiz` : liste les quizzes de l'utilisateur avec statut réel (passed/failed/available) basé sur les tentatives en DB
- `GET /api/quiz/[quizId]` : charge les questions réelles depuis la DB
- `POST /api/quiz/[quizId]` : sauvegarde une tentative (score + passed)
- Page Cours (`/course`) : charge le cours réel via l'API (premier cours inscrit par défaut, ou `?id=` en param), affiche modules/leçons depuis la DB, persiste chaque clic "Marquer comme terminé"
- Page Quiz (`/quiz`) : charge les quizzes réels, lance avec les vraies questions, sauvegarde le résultat après chaque passage
- `GET/POST/PUT/DELETE /api/teacher/courses` : CRUD complet des cours du formateur (protégé TEACHER)
- `GET /api/teacher/students` : inscriptions récentes dans les cours du formateur
- Page `/teacher/courses` (course builder) : liste des cours avec création, édition, publication/dépublication, suppression
- Dashboard formateur (`/teacher`) : rebranché sur vraies données (stats réelles, tableau des cours depuis la DB, inscriptions récentes, widget course builder avec vrais brouillons)
- Route `tcourses: '/teacher/courses'` ajoutée à `navigation.js`

**Comptes démo :** julien@eduspher.com (étudiant), sofia@eduspher.com (formateur), admin@eduspher.com (admin) — password123

**Prochaine étape :** Phase 3 (Stripe, notifications temps réel, recherche/explore, Google OAuth)

---

## 2026-06-22

### MEDIKA : export PDF, recherche globale et rapports par période

- **Export dossier médical PDF** : bouton "Dossier PDF" sur la page patient (visible pour ADMIN/MEDECIN/INFIRMIER). Appelle `printDossierPatient(patient, sejours, prescriptionsActives)` dans `print.ts`. Génère un document HTML complet imprimé via `openPrintWindow` (pas de lib externe) : identité, antécédents/allergies (fond rouge), timeline consultations, tableau examens, hospitalisations, prescriptions actives, factures, lignes signature médecin + cachet établissement
- **Recherche globale Cmd+K** : nouveau endpoint `GET /api/search?q=` (backend) + composant `SearchPalette` (frontend). Debounce 280ms, résultats groupés (patients × 6, factures × 4, examens × 4), navigation clavier (↑↓↵Esc), scroll into view. Raccourci Cmd+K/Ctrl+K câblé dans Header via `useEffect`. SearchPalette retourne `null` si fermé (pas de portal DOM inutile)
- **Rapports avec sélecteur de période** : endpoint `GET /stats/rapport` enrichi avec `?from=YYYY-MM-DD&to=YYYY-MM-DD`, répond `dateFin` en plus de `date`. Page rapports : 5 presets (aujourd'hui, hier, semaine en cours, mois en cours, mois dernier) + champs date personnalisés. `printRapport` mis à jour pour afficher "Du X au Y" vs date unique. Titre de période contextuel dans l'en-tête de la page
- **Section examens dans les rapports journaliers** : les examens étaient présents dans la réponse API mais jamais rendus. Ajout d'un tableau avec badges de statut colorés entre les sections Consultations et Facturation
- **Fix TypeScript** : `urlBase64ToUint8Array` dans `useNotifications.ts` renvoyait `Uint8Array<ArrayBufferLike>`, incompatible avec `PushSubscribeOptions.applicationServerKey`. Corrigé avec type de retour explicite `Uint8Array<ArrayBuffer>` + construction par boucle au lieu de `Uint8Array.from`

## 2026-06-21

### MEDIKA : enrichissement hospitalisations, pharmacie et dashboard

- Picker médicament dans les formulaires de prescription (dossier séjour + consultation) : liste déroulante depuis le catalogue, auto-remplissage du dosage depuis `dosageForme`, indicateur stock rouge si sous le seuil
- Prescription builder dans le modal consultation : interface structurée (médicament + dosage + fréquence + durée), sérialisation en texte pour compatibilité rétrograde
- Notifications médicaments : badge SSE dans la sidebar (polling 2 min + refresh SSE), section "À administrer maintenant" dans le dossier de séjour (médicaments dus calculés par `lastAdmin.dateHeure + intervalleH <= now`)
- Seed pharmacie : 63 médicaments avec DCI, catégorie, forme, dosageForme, stock, seuil, prixUnitaire
- Auto-création de rendez-vous de suivi quand le médecin saisit `prochainRdv` dans une consultation (dans la même transaction Prisma)
- Facturation hospitalière : champ `sejourId` ajouté à `Facture` (unique), calcul basé uniquement sur les `MouvementStock` type DISPENSATION liés aux prescriptions du séjour
- Dispensation ambulatoire : endpoint `POST /pharmacie/dispenser-direct` + UI dans l'onglet Dispenser (patients externes, ordonnances libres) sans `prescriptionId` requis
- Dashboard : 2 nouvelles cartes KPI (patients hospitalisés avec ratio lits occupés/total, recettes du jour via agrégat Paiement)

### MEDIKA : modules Pharmacie et Planning livrés

- Module Pharmacie : backend (routes CRUD inventaire, lots, mouvements, dispensation, alertes, commandes fournisseurs) + frontend (4 onglets : Inventaire, Alertes, Dispenser, Commandes). CRUD complet avec modals (création/édition médicament, lot, mouvement, dispensation, commande, réception). Badge d'alerte temps réel via SSE. Archivage médicament (actif: false)
- Module Planning du personnel : backend (gardes CRUD, absences CRUD, vue semaine, disponibilité) + frontend (4 onglets : Mon planning, Vue semaine, Aujourd'hui, Absences). "Mon planning" est l'onglet par défaut, chaque utilisateur voit ses propres gardes sur 60 jours
- Correction critique schema mismatch Prisma : les routes planning utilisaient des champs inexistants (Garde.debut, Garde.fin, Garde.statut, Garde.remplacant, Absence.motif, Absence.approbateur). Réécriture complète de planning.routes.ts pour coller au vrai schéma (Garde.date + heureDebut + heureFin en String, Absence.raison + approvedBy)
- Frontend planning/page.tsx entièrement corrigé : interfaces, composants, modals. fmtTime remplacé par les strings heureDebut/heureFin directement. GardeDetailModal passe à DELETE au lieu de PATCH avec statut: ANNULE (champ inexistant). AddGardeModal : datetime-local remplacé par date + deux champs time séparés

## 2026-06-17

### Lancement du projet MEDIKA (gestion hospitalière)
- Projet créé depuis zéro : backend Express 4 + TypeScript + Prisma v5 + PostgreSQL, frontend Next.js 15 App Router + shadcn/ui (Base UI), RBAC avec 5 rôles (ADMIN, MEDECIN, INFIRMIER, CAISSIER, ACCUEIL)
- Modules livrés : Patients, Rendez-vous, Consultations, Examens médicaux, File d'attente, Facturation
- Workflow consultation en 2 visites implémenté : visite 1 (plainte + signes vitaux + prescription d'examens), visite 2 (réouverture de la même consultation, diagnostic + prescriptions + prochain RDV après réception des résultats)
- Formulaires de résultats structurés par type d'examen (15 types avec normes par champ, détection automatique de valeurs anormales avec flags ↑/↓ et mise en rouge)
- File d'attente avec numérotation journalière séquentielle, support patients avec et sans rendez-vous, auto-refresh 30s
- Page examens regroupée par patient (au lieu d'une grille plate), avec lignes compactes par examen et badges de synthèse par statut
- Champ "Prochain rendez-vous" ajouté aux consultations (modèle Prisma + migration + formulaire + affichage sur les cartes)
- Correction : section "Examens à prescrire" visible aussi en mode modification, avec affichage des examens existants (lecture seule) et possibilité d'en ajouter de nouveaux

### Smoke test Admin IMFP_PROTOTYPE : 5 bugs corrigés + 2 bugs infra

**5 bugs métier corrigés et vérifiés en navigateur :**
- Onglet Statistiques (Présences) ne rendait pas son contenu : `activeTab` manquait dans le `useEffect` de rechargement des stats, l'API n'était jamais rappelée au changement d'onglet
- Colonne "Arrivée" affichait l'horodatage ISO brut : fonction de formatage `formatTime` absente de `attendanceUtils.ts`
- Matières : "0 actives" affiché + toutes les lignes grisées à tort (condition `isActive` inversée dans `SubjectsManager.tsx`)
- Emploi du temps : "Total cours 0" et année non sélectionnée automatiquement : `fetchSchedules` absent des hooks destructurés, `useEffect` de chargement incomplet dans `ScheduleManager.tsx`
- Paramètres > Financier : affichait "FCFA" au lieu de "HTG" (migration initiale avec valeurs orientées Bénin). Correction dans `schema.prisma` + nouvelle migration `20260614200000_fix_system_settings_currency` appliquée via `prisma migrate deploy`

**2 bugs infra découverts pendant la vérification :**
- `.claude/launch.json` : port frontend configuré à 3001 alors que Vite sert sur 3000. Corrigé
- `server.ts` : `http://localhost:3000` manquait dans `defaultOrigins` CORS, ce qui bloquait tous les logins

**Décision architecture reconfirmée :** modèle Silo (une instance + une base par école) maintenu pour SYGS-IMFP. Multi-tenant partagé (colonne tenantId) jugé prématuré avant validation du marché

**À noter :** mot de passe admin local (`jslnoccius@gmail.com`) réinitialisé à `Admin@123` pour les tests en navigateur (DB uniquement, hors commit)

### KONEKTE : finalisation des fonctionnalités et déploiement en production
- **Navigation fixe** : refactoring du layout Next.js (`fixed inset-0 flex flex-col`) pour que le header et la BottomNav restent fixes pendant que le contenu défile. Chaque page gère son propre padding
- **Messages vocaux et partage de photos** : endpoint `POST /:conversationId/media` (multer + Cloudinary), enum `MessageType` (TEXT/IMAGE/VOICE) et champ `mediaUrl` ajoutés au schéma Prisma, migration appliquée. Côté chat : bouton micro (MediaRecorder API), bouton image, player audio et aperçu photo dans les bulles
- **Fonctionnalités "faibles et moyennes"** : page "Qui m'a liké" (blurrée pour les non-premium, visible pour premium), quota Super Likes (3/jour, compteur en temps réel), changement de mot de passe, suppression de compte (avec confirmation par mot de passe)
- **Notifications** : cloche dans le header, dropdown avec liste, badge non-lu, écoute socket `notification:new`
- **Page Premium** : 3 plans (1/3/6 mois), modal de choix du moyen de paiement
- **Stripe intégré** : `POST /api/payments/stripe/create-checkout`, webhook `checkout.session.completed` qui active Premium automatiquement, Stripe CLI installée et configurée pour le tunnel webhook local
- **MonCash intégré** : routes `POST /api/payments/moncash/create` et `GET /api/payments/moncash/callback` prêtes, en attente des credentials Digicel Business Haiti
- **Emails transactionnels** : service nodemailer branché sur Gmail SMTP. Email de vérification envoyé à l'inscription, email de reset de mot de passe fonctionnel. Page `/verify-email/[token]` créée côté frontend
- **Cloudinary** : upload des photos et audios de chat directement vers Cloudinary en production
- **AuthGuard** : correction de la race condition de hydratation Zustand (redirect vers /login avec token valide). Attend `persist.onFinishHydration()` avant de vérifier le token
- **Fix releasePointerCapture** : `setPointerCapture` dans SwipeCard wrappé dans try/catch pour éviter le `NotFoundError`
- **Déploiement Railway (backend)** : `railway.json` créé, `@types/*` et outils TypeScript déplacés dans `dependencies` pour le build Railway, `DATABASE_URL` liée au service MySQL Railway, variables d'environnement configurées
- **Déploiement Vercel (frontend)** : `.env.production` commité avec les URLs Railway, 17 pages compilées et déployées sur `konekte-xi.vercel.app`
- **URLs de production** : frontend `konekte-xi.vercel.app`, backend `jarvis-starter-kit-production-f573.up.railway.app`

## 2026-06-14

### Correctifs : "Faire l'appel" (prof) et emploi du temps (étudiant)
- **Bug "Faire l'appel" corrigé (1/2)** : le clic donnait "Route non trouvée". Le frontend (`ProfessorAttendance.tsx`) appelle `GET /api/professeurs/user/:userId` pour retrouver le professeur lié au compte connecté, mais cette route n'existait pas côté backend (seules `/professeurs/:id` et `/professeurs/:id/schedule` existaient). Ajout de la route + contrôleur `getProfesseurByUserId` + service `getProfesseurByUserIdService` (recherche par `userId`, champ unique sur `Professeur`)
- **Bug "Faire l'appel" corrigé (2/2)** : une fois la première erreur passée, `GET /api/attendance/sessions` (utilisé par la supervision admin/directeur des séances) renvoyait aussi 404 ("Présence non trouvée" / `ATTENDANCE_NOT_FOUND`). Cause : dans `attendanceRoutes.ts`, la route `GET /:id` était déclarée avant `GET /sessions` ; Express interceptait `/sessions` comme `id="sessions"` et cherchait une présence inexistante. Réordonné pour déclarer `GET /sessions` avant `GET /:id`
- **Bug emploi du temps étudiant corrigé** : dans `StudentDashboard.tsx`, le mapping de la réponse de `GET /schedules/class/:classId` lisait `scheduleData.subject` et `scheduleData.professeur` (champs inexistants à ce niveau), retombant systématiquement sur les valeurs de repli "Matière"/"Professeur". Les vraies données se trouvent sous `scheduleData.classAssignment.subject` et `scheduleData.classAssignment.professeur`. Corrigé pour lire le bon chemin ; la salle (`classroom`, champ direct du modèle `Schedule`) affichait déjà correctement
- Backend et frontend compilent à 0 erreur après ces correctifs
- Reste à faire par Jaslin : redémarrer le backend pour que les routes corrigées soient prises en compte, puis tester "Faire l'appel", la supervision des séances et l'emploi du temps avec des données réelles

### Migration Prisma "attendance_records" appliquée (drift résolu)
- En répondant à "qu'est-ce qu'il reste à faire", détection d'un décalage entre `schema.prisma` (modèle `AttendanceRecord` enrichi le 2026-06-13 : `attendanceSessionId`, `studentId`, `status`, `checkInTime`, `notes`, `recordedById`, `updatedAt`) et la dernière migration appliquée, qui ne créait pas ces colonnes/contraintes sur `attendance_records`
- `npx prisma migrate dev --name link_attendance_to_session` a généré la migration mais a échoué à l'étape 7/9 : doublon `class_assignments_subjectId_fkey` (contrainte déjà créée par la migration initiale, Prisma tentait de la recréer inutilement)
- Les étapes 1-6 (nouvelles colonnes de `attendance_records`, nouvel index unique `attendanceSessionId+studentId`) étaient déjà appliquées ; les étapes 8-9 (FK `studentId`, `recordedById`) ne l'étaient pas encore. Au passage, la migration générée omettait aussi de recréer la FK `attendance_records_attendanceSessionId_fkey` (supprimée à l'étape 1 et jamais recréée)
- Correction : application manuelle des 3 FK manquantes (`studentId`→students, `recordedById`→users, `attendanceSessionId`→attendance_sessions), fichier de migration corrigé (doublon retiré, FK `attendanceSessionId` ajoutée) pour rester cohérent en cas de réinstallation, migration marquée "applied" via `prisma migrate resolve`. `prisma migrate status` confirme la base à jour. Backend compile à 0 erreur
- Avec cette migration + les correctifs de routes précédents, "Faire l'appel" devrait maintenant fonctionner de bout en bout après redémarrage du backend
- **Bug "Faire l'appel" corrigé (3/3)** : au chargement, `ProfessorAttendance.tsx` appelait `GET /class-assignments?...&limit=200`, mais le backend plafonne `limit` à 100 (`MAX_LIMIT_EXCEEDED`, 400). `limit` ramené à 100
- "Faire l'appel" testé et validé par Jaslin avec données réelles (matière, classe, élèves, statuts de présence)

### Sécurité : mot de passe MySQL changé
- Le mot de passe root MySQL (`Jassageoc84`, exposé en clair dans `.env`) a été changé pour un mot de passe aléatoire fort, via `ALTER USER`. `.env` mis à jour (non versionné, `.gitignore` confirmé), connexion vérifiée (`prisma migrate status` OK)
- Mot de passe d'application Gmail (`SMTP_PASS`) révoqué et remplacé par Jaslin (nouveau mot de passe dans `.env`, non versionné)
- Onglet "Séances" (supervision admin/directeur) et emploi du temps étudiant (nom du prof + salle) testés et validés par Jaslin avec données réelles

### Redesign complet StudentDashboard et ProfessorDashboard
- Carte blanche de Jaslin pour refaire entièrement les deux dashboards (étudiant et professeur), sans changer la source des données (déjà ~90-100% réelles, branchées sur les vrais stores)
- Nouveau langage visuel commun : en-tête "hero" en dégradé bleu/violet avec avatar (initiales), date du jour, badges contextuels, et une jauge circulaire SVG (`CircularGauge` côté étudiant, `ProgressRing` côté professeur)
- **StudentDashboard** : jauge circulaire pour la moyenne /20, 4 cartes KPI restylées (accent de couleur à gauche + icônes en dégradé), nouvelle carte "Prochain cours" qui remplace un widget "Calendrier" cassé (référençait des états supprimés lors d'un nettoyage précédent), correction du bug de grille d'emploi du temps (créneaux horaires en dur remplacés par les vrais créneaux), ajout des imports manquants `School`/`Clock4` (bug latent), nettoyage des imports inutilisés
- **ProfessorDashboard** : nouvel en-tête "hero" avec anneau de progression (cours du jour terminés/total, calculé sur les vraies heures de fin), grille KPI passée de 2 à 4 cartes (ajout "Élèves" et "Cours aujourd'hui"), correction d'un bug Tailwind sur `StatsCard` (classes dynamiques `bg-${color}/10` invalides pour `color="green"`, remplacées par une palette statique), correction de l'incohérence `TabsList` (grid-cols-4 pour 3 onglets), accents de couleur + effet de survol sur les cartes "Emploi du temps du jour"/"Annonces"/"Événements", suppression de 8 imports morts (`TrendingUp, MessageSquare, User, Plus, ChevronLeft, ChevronRight, X, Separator`)
- Frontend compile à 0 erreur (tsc --noEmit) après l'ensemble des changements
- Premier retour de Jaslin sur le StudentDashboard ("très moche") : disposition et style généraux retravaillés (cartes KPI à fonds pastel sans bordures/dégradés, regroupements rééquilibrés "Progression des notes"/"Prochain cours", "Compétences par matière" en pleine largeur, "Annonces"/"Événements" en paire). Validé par Jaslin

### Audit module Palmarès / Notes Totales
- Vérification du câblage complet : routes `/api/grades/palmares` et `/palmares-cumulatif` montées, services de calcul (classement par niveau/contrôle, et cumul des moyennes par matière sur l'année) cohérents avec les enums Prisma (`ClassLevel`), composant `PalmaresReport.tsx` bien branché dans l'onglet "Rapports" (export Excel/PDF inclus)
- **Faille de droits d'accès corrigée** : les deux routes n'avaient que `requireAuth` (n'importe quel compte connecté — élève, parent, prof) alors que la doc et l'onglet "Rapports" sont réservés Admin/Directeur. Un élève authentifié pouvait donc appeler directement l'API et voir le classement + toutes les notes de tout son niveau. Ajout de `requireDirector` (Admin/Directeur) sur les deux routes. Backend compile à 0 erreur
- Testé et validé par Jaslin avec données réelles (palmarès, notes totales, exports Excel/PDF)

### Module Rapports : Palmarès et Notes Totales par niveau
- Analyse de deux fichiers Excel réels fournis par Jaslin (« PALMARES 2e contrôle 2025 » et « DOC-20250723-WA0002 ») pour comprendre le format attendu : classement par niveau, une ligne par matière (barème dans une ligne « MATIERES »), Total, Moyenne, classement décroissant
- Backend : nouveau endpoint `GET /api/grades/palmares` (palmarès d'un niveau pour un contrôle donné : note par matière, Total, Moyenne = Total/somme des barèmes × 100, classement) et `GET /api/grades/palmares-cumulatif` (« Notes Totales » : moyenne par matière sur les contrôles disponibles, puis Total/Moyenne/classement). Backend compile à 0 erreur
- Frontend : nouveau composant `PalmaresReport` (onglet « Rapports », déjà présent mais non câblé dans la nav Admin/Directeur — corrigé au passage un doublon dans la config Directeur). Sélection année/niveau/contrôle (ou mode cumulatif)/statut, aperçu en tableau, export Excel (.xlsx, structure fidèle aux fichiers fournis) et export PDF (paysage). Frontend compile à 0 erreur
- Décision : pas de module « analytics » séparé pour l'instant — les rapports palmarès + le dashboard existant couvrent le besoin exprimé. À revisiter si Jaslin demande des statistiques supplémentaires spécifiques
- Reste à faire : test runtime par Jaslin avec des données réelles (notes saisies), et la migration Prisma de l'appel (Présence) toujours en attente

### Audit et redesign : bulletin, paiements, fiches étudiant/professeur, dashboards
- Bulletin : ajout du classement (place de l'élève) dans le bulletin
- Nouveau rapport de paiements + état imprimable (liste des élèves avec montants versés/restants)
- `PaymentManager.tsx` : suppression des logs de debug, imports inutilisés et d'une fonction dupliquée. Côté backend, suppression de la route morte `/fee-payments/filtered` + `getFeePayments` (controller et service), qui dupliquait exactement la logique de la route `/`. Backend et frontend compilent à 0 erreur
- `StudentDetails.tsx` : bug de fond trouvé — les comparaisons `grade.status === "Valid_"/"Non_valid_"/"Reprise"/"Echec"` ne pouvaient jamais correspondre au vrai enum Prisma `GradeStatus` (workflow de publication Draft/Submitted/.../Published), car elles provenaient d'un enum legacy mort dans `types/grade.ts`. Remplacé par deux helpers basés sur la vraie logique métier (`isGradeValidated` : note ≥ 10/20, `isGradeRetake` : session === "Reprise"). Ajout de l'affichage de la classe/niveau/année en cours dans l'en-tête de la fiche
- `professorDetails.tsx` : l'en-tête n'avait aucune action malgré les props `onEdit`/`onDelete` fournies par le parent (pas de bouton retour, pas de modifier/supprimer) — ajoutés (bouton retour + menu Modifier/Supprimer, réservé aux Admin). Le dialogue « Ajouter une matière » avait un `SelectContent` vide (code commenté, jamais implémenté) — branché sur le store des matières avec filtrage des matières déjà attribuées au professeur. Les fonctions `handleRemoveSubject` et `getExperienceStars` existaient mais n'étaient jamais appelées — câblées dans les cartes de matières (bouton de retrait + badge d'expérience). Nettoyage des logs de debug et imports inutilisés
- `SecretaryDashboard` : les badges de tendance « +12% »/« -5% » et la carte « Indicateurs de performance » (croissance « +12.5% », « 2.3 jours ») étaient des valeurs codées en dur, sans rapport avec les données réelles — supprimés, remplacés par une vraie « Répartition par statut » (en attente/approuvées/rejetées) via le composant `StatusCard` qui existait déjà dans le fichier mais n'était jamais utilisé
- `ParentDashboard.tsx` (682 lignes, entièrement mocké, rôle "Parent" absent du `UserRole` frontend, jamais routé dans `RoleBasedDashboard`) supprimé sur décision de Jaslin — clôt la tâche de fond ouverte le 2026-06-13 sur le portail parent (suppression plutôt que construction d'une vraie fonctionnalité, jugée hors périmètre de cette session)
- Audit grep des 5 autres dashboards (Admin, Directeur, Comptable, Professeur, Étudiant) : aucun pattern de données fictives similaire trouvé. Un audit complet ligne par ligne de ces fichiers (1500 à 2700 lignes chacun) reste un chantier à part si besoin
- Backend et frontend compilent à 0 erreur après l'ensemble des changements

## 2026-06-13

### Analyse du projet SYGS-IMFP (gestion scolaire)
- Analyse complète du projet `livrables/applications/IMFP_PROTOTYPE` à la demande de Jaslin
- Stack : backend Express 5 + TypeScript + Prisma + MySQL (~25 domaines métier), frontend Vite + React 18 + shadcn/ui (269 fichiers). Projet mature (60+ commits, dépôt git propre et séparé)
- Points forts : architecture en couches propre (routes/controllers/services/validators), schéma Prisma solide, RBAC, workflow de validation des notes, audit, sauvegardes
- Problèmes critiques identifiés : JWT_SECRET non secret (blob d'exemple Prisma copié), secrets réels en clair dans .env (mot de passe MySQL + mot de passe d'application Gmail), fallback de secret en dur, CORS trop permissif en dev, pas de helmet
- Constat stratégique : application **mono-établissement**, pas encore SaaS multi-tenant. Valeurs par défaut de SystemSettings orientées Bénin (Cotonou/XOF), pas Haïti
- Corrections appliquées (lot sécurité) : nouveau JWT_SECRET fort généré, suppression du fallback en dur (throw si absent), CORS configurable via CORS_ORIGINS, ajout de helmet
- Actions restant à la charge de Jaslin : révoquer le mot de passe d'application Gmail exposé, changer le mot de passe MySQL, nettoyer les fichiers de debug/test versionnés
- Ajout de SYGS-IMFP à la liste des projets actifs dans CONTEXT.md
- **Décision d'architecture prise : Option A (Silo)** — une instance + une base par école pour les premiers clients, en gardant la couche services comme point d'accès unique aux données pour préparer une éventuelle migration vers le multi-tenant partagé (Option B) plus tard. Refactor multi-tenant complet jugé prématuré avant validation du marché

### Module Présence (appel professeur) refait
- Décision : appel **par cours/séance** (par matière), statut **définitif** (pas d'étape de validation)
- Constat : tout le socle Présence existait (modèle, 18 endpoints, hook complet) mais le prof n'avait aucune entrée de menu ni écran adapté
- Backend : modèle `AttendanceRecord` enrichi (statut par élève par séance) + 3 endpoints (`POST /attendance/sessions/open`, `GET /attendance/sessions/:id/roster`, `POST /attendance/sessions/:id/records`)
- Frontend : entrée menu « Faire l'appel » pour le prof + écran `ProfessorAttendance` (choisir son cours, charger le roster, cocher, enregistrer). Backend et frontend compilent à 0 erreur
- Supervision admin/directeur : ajout d'un onglet « Séances » dans la page de présence (composant `SessionAttendanceSupervision`) qui liste les séances du jour et déplie le détail de présence par élève. Réutilise les endpoints existants `getAttendanceSessions` + `getSessionRoster`, 0 erreur de compilation
- Reste à faire par Jaslin : lancer la migration Prisma sur sa base
- Au passage, `ProfessorGradeManager` (notes côté prof) s'est révélé entièrement mocké (tâche de fond créée)

### Vérification module par module (emploi du temps et autres)
- Méthode : balayage « mocké vs réel » de tous les écrans principaux + recoupement de toutes les URL des stores/services frontend avec les routes montées dans server.ts
- **Bug emploi du temps corrigé** : `timetableStore.ts` appelait `/api/academic/schedules` (double `/api` + chemin inexistant) au lieu de `/schedules`. Cassait 5 écrans (TimetableManager, TimetableGrid, ClassTimetable, emploi du temps de l'élève, SimpleSelect). Corrigé. `scheduleStore` (ScheduleManager) était déjà correct
- **Bug bulletins corrigé** : `bulletinRoutes.ts` (génération/preview/téléchargement PDF) n'était jamais monté dans server.ts. La génération de bulletins via BulletinGenerator était donc cassée (404). Monté sur `/api/bulletins`
- Correction d'un faux positif : le module Notes côté prof n'était PAS cassé. `Index.tsx` branche le vrai `ProfessorGradesManager` (API réelle) ; le fichier `grades/ProfessorGradeManager.tsx` (mocké) était orphelin
- Code mort supprimé : `enrollmentApi.ts`, `assignmentTemplateStore.ts`, et le mock orphelin `grades/ProfessorGradeManager.tsx` (3 fichiers, aucune référence)
- Portail parent : fonctionnalité **inachevée** (le rôle `Parent` est même absent de l'enum `UserRole`, route `/parents` inexistante, sémantique de liaison ambiguë). Le bouton de création de compte parent dans GuardiansManager appelait une route 404 ; remplacé par un message « pas encore disponible » pour ne plus échouer silencieusement. Tâche de fond créée pour construire la vraie fonctionnalité
- Tous les autres modules (élèves, profs, classes, matières, tuteurs, users, inscriptions, frais, paiements, événements, affectations, audit, notes) : réels et URLs correctes. Backend et frontend compilent à 0 erreur
- Limite : la vérification au runtime (clic par clic) reste à faire par Jaslin après application des migrations, car elle nécessite sa base de données live

### Vérification élèves/profs/dashboard + impression liste élèves
- Élèves et Profs : câblage correct, vraies URLs, aucun bug. Mais l'export Excel (`ExportStudents`) n'était même pas rendu dans StudentsManager (aucun export accessible)
- Dashboard : ⚠️ problème réel, plusieurs graphiques d'AdminDashboard et DirectorDashboard utilisent `Math.random()` (tendances inscriptions/revenus/satisfaction/charge) → données fabriquées, trompeuses. À remplacer par des données réelles
- Nouvelle fonctionnalité livrée : impression PDF de la **liste des élèves par classe et année académique** (composant `StudentRosterPrint`, basé sur les inscriptions, en-tête établissement depuis les paramètres, bouton « Imprimer liste » dans StudentsManager). jsPDF + autotable. Frontend compile à 0 erreur
- Rapports PDF ajoutés ensuite : **liste des professeurs** (bouton dans ProfesseurManager, composant `ProfesseurRosterPrint`) et **feuille d'appel vierge** par classe/année (2e bouton dans le dialogue d'impression élèves, grille mensuelle à cocher). Frontend compile à 0 erreur
- Pistes de rapports restantes : état des impayés par classe, effectifs par classe, PV de notes par classe. + Correction à faire : graphiques dashboard en Math.random()

### Dashboard assaini + import Excel réparé + bugfix impression
- Bug corrigé : les composants d'impression importaient `useSystemSettings` qui n'existe pas (le hook s'appelle `useSettings`) → erreur runtime. Corrigé dans StudentRosterPrint et ProfesseurRosterPrint
- Dashboard : suppression de TOUS les `Math.random()` (AdminDashboard + DirectorDashboard). Tendances inscriptions/revenus désormais calculées sur les vraies dates ; distributions événements/annonces en comptes réels ; revenus par source limités à la scolarité réelle. Les 4 métriques non mesurées (satisfaction, charge profs, participation événements, vues annonces) passées en déterministe et signalées à retirer (l'app ne les mesure pas)
- Import Excel des élèves : la fonctionnalité existait (backend `POST /students/import` + composant `ImportStudents`) mais était cassée à 3 niveaux (hook `useAcademicStore` inexistant → vrai `useStudentStore` ; fichier jamais parsé → parsing XLSX/JSON ajouté dans le store ; `downloadImportTemplate` manquant → ajouté ; forme de retour normalisée). Composant branché dans StudentsManager (bouton « Importer (Excel) » + template téléchargeable). Frontend compile à 0 erreur
- À noter : l'export Excel (`ExportStudents`) existait aussi sans être branché ; toujours non exposé (non prioritaire)

## 2026-06-12

### Installation initiale du Jarvis
- Workspace personnalisé pour Jaslin, originaire de Gros-Morne et vivant actuellement à Pignon (Haïti)
- Profil principal : mix (étudiant en sciences informatiques, développeur fullstack freelance et professeur de programmation)
- Activité : développement d'applications web et mobile pour entreprises, particuliers et ONG, rémunéré au projet ; enseignement de la programmation ; études universitaires en cours
- Objectifs court terme identifiés : lancer une plateforme e-learning, concevoir un système de gestion hospitalière, développer des SaaS de gestion scolaire et bancaire et obtenir les premiers clients
- Vision long terme : devenir un entrepreneur technologique reconnu, transformer les SaaS en entreprises rentables, atteindre l'indépendance financière et avoir un impact positif en Haïti grâce à la technologie
- Projets actifs au démarrage : enseignement de la programmation, plateforme e-learning (système d'apprentissage en ligne)
- Domaine d'aide prioritaire : architecture et développement des solutions SaaS (conception logicielle, bases de données, multi-tenant, sécurité, scalabilité, stratégie de lancement)
- Style de communication choisi : mélange selon le contexte (direct pour le technique et le débogage, pédagogique pour l'apprentissage et l'architecture)
- Note : le nom "Jarvis" est provisoire, un prénom définitif sera probablement choisi plus tard
