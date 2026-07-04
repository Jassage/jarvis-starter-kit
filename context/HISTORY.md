# Workspace History

> Journal chronologique de toutes les sessions et décisions importantes.
> Le plus récent en haut. Mis à jour automatiquement par Claude.
>
> **Comment ça marche :** Quand je lance la commande `/update` après une session importante, ou quand je raconte un changement significatif, Claude ajoute une entrée ici automatiquement. Je n'ai pas à écrire ce fichier manuellement.

---

## 2026-07-03 (nuit)

### KONEKTE : audit senior dev + durcissement sécurité complet (RBAC, paiements, auth par cookie, scaling Socket.io)

**Contexte :** Jaslin a demandé d'analyser KONEKTE ("analyser connecter", clarifié ensuite). Audit senior dev en lecture seule (agent dédié) sur backend + frontend, puis correctifs appliqués par vagues successives validées avec lui à chaque étape.

**🔴 Critiques (1ère vague) :**
- **RBAC admin absent** : aucun champ `role`/`isAdmin` sur `User`, les routes `/admin/*` (stats, reports, ban) n'étaient protégées que par `requireAuth` — n'importe quel compte fraîchement créé pouvait bannir un autre utilisateur. Fix : champ `isAdmin` + middleware `requireAdmin` vérifié en base à chaque requête (pas depuis le JWT, pour qu'une révocation soit immédiate), garde ajoutée aussi côté frontend (`/admin` redirige un non-admin vers `/discover`).
- **Callback MonCash rejouable** : `GET /moncash/callback` public et sans protection contre le rejeu pouvait, en théorie, prolonger le Premium deux fois pour un seul paiement. Fix : verrou atomique (compare-and-swap) avant `activatePremium`.

**🟠 Importants (2e vague) :**
- Validation Zod (contrôle 18 ans à l'inscription) écrite mais jamais branchée sur le vrai routeur monté (`auth.controller.ts` était du code mort) — corrigé, controller mort supprimé.
- Rate limiting ajouté sur `/auth/login` et `/auth/register` (10 tentatives/15 min).
- **Fuite de données sur "Qui m'a liké"** : un compte FREE recevait déjà la vraie photo et le vrai prénom dans la réponse API, seul un flou CSS masquait l'info à l'écran (contournable via l'onglet réseau du navigateur). Fix : flou appliqué côté serveur via une transformation Cloudinary, prénom/âge/ville masqués à la source.
- Quota de 3 Super Likes/jour imposé côté serveur (n'était vérifié que par le compteur affiché au frontend).
- Index Prisma ajoutés sur les requêtes les plus fréquentes (messages, notifications, swipes, profils pour la découverte) — aucun n'existait avant.
- **Replay Stripe** : ledger `WebhookEvent` (id Stripe en clé primaire) rendant `handleStripeWebhook` idempotent.

**Chantiers plus larges (validés séparément par Jaslin) :**
- **Migration auth JWT localStorage → refresh token cookie httpOnly** : l'ancien JWT unique de 7 jours en localStorage était volable via une seule faille XSS et ne pouvait jamais être révoqué avant expiration. Nouveau modèle `RefreshToken` (token opaque haché SHA-256, rotation à chaque usage, révocable individuellement ou en masse par utilisateur), access token JWT ramené à 15 minutes et gardé en mémoire côté frontend (plus persisté), refresh token en cookie httpOnly. `changePasswordService`, `deleteAccountService` et le ban admin révoquent désormais toutes les sessions actives.
- **Adapter Redis pour Socket.io** : `onlineUsers` (Map en mémoire locale au process) cassait dès qu'on tourne sur plusieurs instances Railway. Remplacé par des rooms Socket.io par utilisateur (`user:{id}`) + `@socket.io/redis-adapter` avec `ioredis` (le Redis système de la machine est en 5.x, incompatible avec le client `redis` v4+ qui exige RESP3/HELLO — `ioredis` reste compatible). Actif uniquement si `REDIS_URL` est définie, sinon retombe sur l'adapter mémoire (comportement inchangé en dev local). Bonus : un utilisateur avec plusieurs onglets ouverts n'est plus marqué "hors ligne" dès que l'un d'eux se ferme (bug latent de l'ancienne Map, sans rapport avec le scaling).

**Vérifications, toutes en conditions réelles (pas de simple lecture de code) :**
- RBAC : testé via API réelle (403 vs 200 selon `isAdmin`) + navigateur (redirection non-admin confirmée, page admin rendue avec vraies stats pour un vrai admin).
- MonCash/Stripe : simulation de callback/webhook concurrent ou rejoué, confirmant qu'une seule activation a lieu (webhook Stripe rejoué deux fois via une vraie signature de test : 31 jours ajoutés, pas 62).
- Auth cookie : inscription réelle en navigateur, cookie httpOnly confirmé invisible via `document.cookie`, navigation vers une page protégée sans aucun token en localStorage (bootstrap via cookie), logout confirmé comme révocation réelle (refresh échoue juste après, réussissait juste avant).
- Socket.io/Redis : test décisif avec **deux process backend distincts** (ports 4000 et 4001) connectés au même Redis, message envoyé depuis l'instance :4000 reçu en temps réel par un utilisateur connecté sur l'instance :4001, statut du message confirmé `DELIVERED` en base.

**Reste à faire (non traité, hors périmètre de cette session) :** zéro test automatisé sur le projet (comme sur tous les autres SaaS de Jaslin) ; credentials MonCash Digicel toujours en attente.

---

## 2026-07-03 (soir)

### EduSpher : dashboards formateur/admin/étudiant complétés (navigation, messagerie, avis, streak)

**Contexte :** Jaslin voulait "terminer" EduSpher. En creusant, le vrai problème n'était pas la migration Postgres/Vercel prévue en Phase 3d, mais une navigation cassée : dans `Sidebar.jsx`, une bonne moitié des items de menu (Étudiants, Revenus, Avis côté formateur ; Utilisateurs, Cours, Revenus côté admin ; Explorer, Messages côté étudiant) redirigeaient silencieusement vers le dashboard principal au lieu d'ouvrir une vraie page. Plus des widgets 100% mockés depuis le prototype d'origine (`lib/data.js`) : notifications, certificats, "Série de 7 jours" figée.

**Découverte au passage :** du travail de la session précédente (Phase 3c complète + une feature d'upload vidéo/PDF déjà codée) était resté non commité dans l'arbre de travail. Commité séparément en premier (`2513788`) pour ne pas mélanger avec le nouveau travail.

**Décisions prises avec Jaslin avant de coder :** construire la messagerie complète plutôt qu'une simple page "bientôt disponible" (choix : polling au lieu de Socket.io, absent des dépendances et moins compatible avec un futur déploiement Vercel serverless) ; construire un vrai suivi de série d'activité plutôt que de garder ou retirer le widget figé.

**Livré :**
- **Navigation** : `navigation.js` complété avec toutes les routes manquantes, `Sidebar.jsx` route directement sur la clé du menu au lieu de retomber sur le dashboard parent. Suppression du sélecteur "Changer de vue (démo)" du Topbar, reliquat du prototype incompatible avec l'auth réelle (changeait de route sans changer le rôle de session).
- **Notifications & certificats réels** : API + branchement, génération automatique d'un certificat et d'une notification à 100% de progression d'un cours (modèle `Certificate` rendu unique par `(userId, courseId)`).
- **Formateur** : pages Étudiants (API déjà existante, jamais branchée), Revenus (mensuel + par cours, même logique que le calcul déjà utilisé côté admin), Avis (liste + moyenne par cours).
- **Admin** : pages Utilisateurs (changement de rôle), Cours (publier/dépublier), Revenus plateforme.
- **Étudiant** : page Explorer (catalogue réel avec recherche/filtre catégorie, réutilise une API `/api/courses` déjà existante mais jamais consommée).
- **Avis** : widget de soumission (étoiles + commentaire) sur la page cours, garde d'inscription requise, upsert.
- **Messagerie 1:1 étudiant↔formateur construite de zéro** : modèles Prisma `Conversation`/`ConversationParticipant`/`Message`, 5 routes API, composant partagé `MessagesView` (liste conversations + fil de discussion, polling 4s/25s), bouton "Contacter le formateur" sur la page cours, bouton "Message" sur la page Étudiants formateur, badge non-lus dynamique dans la sidebar.
- **Série d'activité réelle** : modèle `ActivityLog`, déclenchée uniquement par une vraie action d'apprentissage (compléter une leçon ou soumettre un quiz, pas une simple visite), route `/api/user/streak`, widget sidebar remplacé.

**Bug pré-existant corrigé au passage** (sans rapport avec la demande initiale) : `SettingsPage.jsx` référençait une variable `user` inexistante — crash `ReferenceError` au chargement de `/student|teacher|admin/settings` pour les trois rôles, présent depuis le commit Phase 3c jamais testé en navigateur.

**Vérification :** `next build` propre à chaque étape. Flux vérifié de bout en bout dans un vrai navigateur (Playwright installé à la volée, chromium déjà en cache local) : connexion successive des 3 comptes démo, chaque item de sidebar ouvre sa vraie page avec de vraies données ; avis soumis côté étudiant confirmé visible côté formateur (agrégation correcte) ; message envoyé étudiant→formateur reçu en temps quasi-réel avec badge non-lu à jour ; leçon marquée terminée déclenche bien la série d'activité (widget "Série de 1 jour" affiché). Environnement de test très chargé (4-5 serveurs de dev d'autres projets tournant en parallèle) : plusieurs faux positifs de chargement lents pendant les tests, tous confirmés comme non-bugs après re-vérification avec un délai plus long.

**Suite immédiate, même soirée :** les 2 derniers mocks identifiés ont aussi été traités à la demande de Jaslin. Dashboard étudiant : les 3 StatCards restées en placeholder ("—") branchées sur les vraies données (certificats via `/api/certificates`, série via `/api/user/streak`), et le ring "Objectif de la semaine" recalculé depuis les vraies leçons complétées cette semaine (nouvelle route `/api/user/weekly-progress`, calcul du lundi de la semaine courante + parsing best-effort des durées vidéo `mm:ss` pour les heures) au lieu de la formule fictive `enrolled.length * 2`. Landing page : catalogue et carte hero branchés sur `/api/courses` (triés par popularité, note moyenne et nombre de leçons réels) au lieu du mock `lib/data.js`, désormais supprimé (plus aucune référence dans le code). **Plus aucune donnée mockée sur EduSpher.** Migration SQLite → PostgreSQL/Supabase et déploiement Vercel toujours en attente (Phase 3d), non prioritaires pour l'instant selon Jaslin.

---

## 2026-07-03 (suite)

### BANKA : bilan comptable déséquilibré — root cause diagnostiquée et corrigée

**Contexte :** après avoir clôturé GESCOM, Jaslin a laissé le choix du sujet suivant. Choix motivé par l'urgence signalée le 2026-07-02 (bug bloquant avant toute démo client) et l'absence de dépendance externe (contrairement à MonCash/Digicel sur LAKAY/KONEKTE, en attente de credentials).

**Découverte en démarrant l'investigation :** un fix complet et cohérent existait déjà, non commité, dans l'arbre de travail (fichiers modifiés visibles dès le `git status` de début de session : `seed.ts`, `compta.service.ts`, `interet.service.ts`, `rh.service.ts`, plus 15 migrations supprimées et remplacées par une migration unique `20260703012057_init` datée du matin même). Vraisemblablement le travail d'une session Claude Code antérieure interrompue avant `/update`. Vérifié cohérent (`prisma migrate status` : schéma à jour) et validé mathématiquement avant de poursuivre.

**Root cause cumulée (plusieurs bugs, tous corrigés) :**
1. `compta.service.ts::getBilan()` — `Math.abs()` sur les soldes débit/crédit effaçait le signe nécessaire à l'identité comptable ; comptes 1000-1300 (Capital, Réserves, Report, Résultat) typés PASSIF au lieu de CAPITAUX ; le résultat de l'exercice (produits − charges) n'était jamais intégré au bilan, alors qu'il est structurellement nécessaire dès la première écriture de produit ou de charge ; `ensureComptesBase()` ne resynchronisait pas le type des comptes existants au démarrage.
2. `seed.ts` — le plan comptable seedé (101000, 511000, …) était un doublon jamais référencé par aucune écriture automatique (qui utilise les numéros de `compta.service.ts::COMPTES_BASE`, ex. 5700, 1000). Aucune dotation initiale en capital : la caisse comptable partait de zéro sans jamais avoir été alimentée. Corrigé : plan comptable unifié sur `COMPTES_BASE` + écriture de dotation initiale idempotente (Débit 5700 Caisse / Crédit 1000 Capital social, 1 000 000 HTG).
3. `interet.service.ts` — intérêts servis aux épargnants comptabilisés en PRODUIT (7100) au lieu de CHARGE (6100) pour la banque.
4. `rh.service.ts` — remboursement de crédit sur salaire avec débit/crédit inversés ; écriture d'apurement des avances déduites en paie manquante ; `creerAvance()` ne posait l'écriture que si l'employé avait un compte interne (alors que l'argent sort de la caisse dans tous les cas) ; `annulerAvance()` sans contre-passation.
5. **Trouvé et corrigé dans cette session** (`compte.service.ts::createCompte`, absent du fix préexistant) : ouvrir un compte avec un solde initial > 0 mettait à jour `compte.solde` directement sans jamais poser l'écriture Débit 5700 (Caisse) / Crédit 2600 (dépôts clients) que `POST /transactions` (DEPOT) pose normalement pour un dépôt classique. C'est la cause la plus susceptible de se reproduire en usage réel : chaque nouvelle ouverture de compte avec argent déséquilibrait silencieusement le bilan.

**Vérification :** 0 erreur TypeScript. Testé via l'API réelle (curl, session admin) : état initial équilibré (Actif 1 000 000 = Capitaux 1 000 000) ; après création d'un compte COURANT avec solde initial 25 000 HTG, toujours équilibré (Actif 1 025 000 = Passif 25 000 + Capitaux 1 000 000).

**GESCOM a la même root cause** (`Math.abs()` + résultat non intégré dans `getBilan()`). Pas touché : Jaslin corrigeait le même fichier en parallèle dans son IDE au moment de l'investigation (approche légèrement différente — révision via `getResultat()`, garde `Math.abs()` qui fonctionne dans le cas courant mais reste fragile si un compte a un solde de signe anormal).

**Anomalie relevée en passant, non corrigée (hors périmètre) :** `client.service.ts::createClient` plante en 500 si `dateNaissance` est une simple date `'YYYY-MM-DD'` au lieu d'un datetime ISO complet — le schéma Zod accepte les deux formats mais le service ne convertit pas avant l'appel Prisma.

**Reste à faire :** documentation `docs/` du 2026-07-02 (manuel utilisateur + doc technique) toujours non commitée ; reset de la base de dev recommandé avant démo (données de test créées pendant la vérification : client "Test Verif" + 2 comptes).

---

## 2026-07-03

### GESCOM : module Rapports livré (Phase 6) — roadmap Ph0-6 entièrement clôturée

**Contexte :** Jaslin a demandé de "finaliser GESCOM". Après clarification, trois chantiers retenus parmi ceux laissés ouverts en fin de session précédente : committer un fix CSS resté en attente, construire Rapports (Ph6, jamais scopé au-delà du nom), et faire la première vérification visuelle en navigateur du projet (jamais faite jusqu'ici faute d'outil).

**Fix CSS committé :** `:where(.input)` sur GESCOM (même correctif de spécificité que BANKA le 2026-06-29), resté non commité depuis la session Comptabilité.

**Scoping Rapports (validé avec Jaslin) :** 4 volets — ventes, stock, achats/fournisseurs, clients.

**Backend (`rapport.service.ts`, nouveau) :** 4 fonctions d'agrégation Prisma pures (`groupBy`, buckets quotidiens, `Promise.all`), même style que `dashboard.service.ts` :
- `getRapportVentes({from, to, emplacementId})` : CA, panier moyen, marge estimée (sur `prixAchatMoyen` courant, pas d'historique de coût stocké donc approximation assumée), évolution quotidienne, top 10 produits/clients, ventilation par mode de paiement.
- `getRapportStock()` : valorisation par emplacement/catégorie, rotation sur 90 jours (meilleure rotation vs produits dormants), alertes de seuil.
- `getRapportAchats({from, to})` : montant commandé/reçu, taux de réception, top fournisseurs, commandes en retard. Pas de délai de livraison réel calculable (aucune date de réception effective stockée en base, seulement `dateLivraisonPrevue`).
- `getRapportClients()` : encours crédit total, ventilation PARTICULIER/GROSSISTE, top clients par solde dû et par montant acheté.

RBAC `requireAdmin` (SUPER_ADMIN/GERANT) sur tout le module — vue transversale multi-domaines, même logique que le rapport BRH restreint sur BANKA.

**Frontend :** page `/rapports` à onglets (Ventes, Stock, Achats, Clients), calquée sur le pattern `/compta` (store Zustand dédié `rapportStore.ts`, un composant par onglet dans `components/rapports/`, réutilisation à 100% des composants partagés StatCard/Badge/EmptyState/table-shell). Nouveau petit composant `PeriodeFilter` (sélecteur de dates) partagé entre l'onglet Ventes et l'onglet Achats.

**Vérification :** 0 erreur TypeScript backend + frontend. 4 endpoints testés via l'API réelle (curl, cookies de session) avec les données de seed — résultats cohérents (CA, valorisation stock ~394K HTG, taux de réception 100%, etc.).

**Première vérification visuelle en navigateur du projet GESCOM :** aucun outil de navigateur disponible dans l'environnement (ni `chromium-cli` ni Playwright préinstallés, contrairement à ce qui avait été utilisé pour les captures du manuel BANKA). Playwright + Chromium installés à la volée dans un dossier temporaire (`.tmp-playwright`, ~600 Mo, supprimé après usage, non commité). Script de pilotage : login réel, navigation vers les 4 onglets Rapports + Transferts + les 6 onglets Compta (jamais vérifiés visuellement non plus), capture d'écran de chaque page, écoute des erreurs console/réseau. Résultat : toutes les pages rendent correctement, aucune erreur bloquante (seule anomalie : une requête de police Next.js interrompue, sans impact). Design cohérent avec le reste de l'application.

**Anomalies notées en passant (hors périmètre de cette session, non corrigées) :**
- Bilan comptable toujours signalé déséquilibré (Actif 30 141,2 HTG ≠ Passif 27 616,2 HTG) — bug déjà connu depuis la session Compta, probablement l'absence d'écriture de capital initial dans le seed.
- Nom d'un fournisseur de seed mal encodé en base ("Distributeur Cara?be" au lieu de "Caraïbe") — donnée préexistante, visible aussi sur la page Fournisseurs, sans lien avec le travail de cette session.

**Ceci clôture définitivement la roadmap Ph0-6 de GESCOM.** Reste : tests automatisés (toujours zéro sur tout le projet), investigation du déséquilibre du bilan, correction de l'encodage du nom du fournisseur seed.

---

## 2026-07-02 (nuit)

### GESCOM : module Comptabilité livré (Phase 5) + refonte design system frontend

**Contexte :** suite directe de la Phase 4 (Transferts, session précédente). Pendant que je travaillais sur la Phase 5 via les outils, Jaslin a retravaillé en parallèle dans son IDE le design system frontend (nouveaux composants Badge/StatCard/PageToolbar/EmptyState, classe CSS `table-shell`, palette teal-émeraude) et avait déjà adapté mes pages Transferts et Compta à ce nouveau style au moment où j'ai voulu committer. Confirmé avec lui : tout committer, et aligner mes sous-composants Compta sur le nouveau design system.

**Backend `compta.service.ts` :** plan comptable (lecture), journal avec saisie manuelle (`createEcriture`, validation débit≠crédit), grand livre par compte (solde cumulé ligne par ligne), bilan actif/passif (via `groupBy` Prisma, pas de chargement en mémoire), compte de résultat produits/charges avec marge, dashboard comptable (agrège bilan+résultat+alertes), réconciliation des écritures en échec (liste + résolution). RBAC `requireComptable` (SUPER_ADMIN/GERANT/COMPTABLE) sur tout le module.

**Bug corrigé au passage :** `achat.service.ts` avait un commentaire prétendant tracer les écritures comptables échouées vers `EcritureEchec` lors de la réception d'une commande, mais le bloc `catch` était vide — les échecs étaient silencieusement perdus, rendant la réconciliation invisible pour ce flux. Corrigé sur le modèle de `vente.service.ts` qui le faisait déjà correctement.

**Frontend :** page `/compta` à onglets (Dashboard, Journal, Grand livre, Bilan, Résultat, Réconciliation) plutôt que 6 routes séparées comme sur BANKA (pattern d'origine, adapté pour limiter le nombre de fichiers). Store Zustand `comptaStore`. Composants tabs réalignés sur le nouveau design system (StatCard, Badge, EmptyState, table-shell) après le refactor concurrent de Jaslin.

**Refonte design system (Jaslin, en parallèle) :** nouveaux composants réutilisables `Badge` (tones success/danger/warning/info/violet/brand/neutral), `StatCard` (KPI compact/étendu avec tendance), `PageToolbar` (recherche + bouton d'action), `EmptyState`. Palette CSS étendue (`--color-primary` teal-émeraude distinct du vert succès, `--gradient-brand`, classes `.btn`/`.badge`/`.table-shell`). Appliqué à Login, Dashboard, Produits, Stock, Ventes, Clients, Achats, Fournisseurs, Transferts, Header, Modal.

**Vérification :** 0 erreur TypeScript backend + frontend (avant et après le refactor design). Module Compta testé de bout en bout via l'API réelle (curl) : plan comptable (9 comptes SYSCOHADA réduits), écriture manuelle créée + rejet débit=crédit, grand livre avec solde cumulé cohérent, bilan et compte de résultat arithmétiquement corrects. **Bilan signalé non équilibré** (Actif ≠ Passif) — reflet honnête de données de seed/écritures pré-existantes non balancées (même symptôme observé indépendamment côté BANKA le même soir, voir entrée suivante), pas un bug du module. Réconciliation testée (404 sur écriture inexistante, liste vide). **UI React non vérifiée visuellement** (ni chromium-cli ni playwright disponibles dans cet environnement d'outils).

**Commits distincts :** un pour la refonte design system (fichiers pré-existants + nouveaux composants ui/), un pour le module Comptabilité (backend + frontend, dépend des composants ui/ du premier commit).

**Ceci clôt la roadmap Ph0-5 de GESCOM.** Reste : Rapports (Ph6, jamais scopé en détail au-delà du nom), tests automatisés (toujours zéro sur tout le projet), vérification visuelle en navigateur de tout le flux (Transferts + Compta), investiguer le déséquilibre du bilan (probablement l'absence d'écriture d'apport de capital initial dans le seed).

---

## 2026-07-02 (soir, suite)

### BANKA : manuel d'utilisation + documentation technique livrés

**Contexte :** demande client d'un manuel d'utilisation et d'une documentation pour BANKA. Deux livrables produits dans `livrables/applications/BANKA/docs/`.

**Documentation technique (`DOCUMENTATION_TECHNIQUE.md`) :** rédigée à partir du code réel (routes, schéma Prisma, sidebar, .env). Couvre : présentation, architecture avec diagramme, stack, installation, 15 variables d'environnement + config en base (seed-config), structure du projet, modèle de données (modèles + enums clés), 19 préfixes d'API, 4 jobs planifiés, sécurité (JWT, 2FA, CAS, rate limiting), matrice RBAC complète 7 rôles x 17 écrans, comptabilité partie double, déploiement production, scripts npm.

**Manuel utilisateur (2 formats : `MANUEL_UTILISATEUR.md` + `MANUEL_UTILISATEUR.html` stylé avec page de couverture, prêt à imprimer en PDF ou ouvrir dans Word) :** non technique, en français, destiné au personnel de banque. 7 sections : connexion/interface, rôles, module Bancaire écran par écran (clients KYC, comptes, caisse, transactions avec seuil de validation, prêts, épargne, taux de change, rapports, BRH, AML, audit, administration), Comptabilité, RH, FAQ dépannage.

**Captures d'écran réelles :** BANKA lancé localement, navigation automatisée via Playwright (Chrome headless, connexion admin), 22 captures haute résolution dans `docs/images/`, 19 intégrées dans le manuel avec légendes. Rendu final vérifié en navigateur (0 image cassée).

**⚠️ Bug découvert au passage :** le Bilan comptable affiche « Bilan déséquilibré » (Actif 112 000 HTG ≠ Passif 142 000 HTG, aucun compte capitaux). Problème dans les données de seed ou les écritures automatiques, à investiguer avant toute démo client. Capture écartée du manuel pour cette raison.

**À faire éventuellement :** refaire la capture du login sans le bloc « comptes de démonstration » pour la version production du manuel ; corriger le déséquilibre du bilan.

---

## 2026-07-02 (soir)

### GESCOM : module Transferts inter-sites livré (Phase 4)

**Contexte :** suite de la roadmap GESCOM. D'abord commit des changements en attente (dashboard premium + fix race condition stock de la session du 2026-07-01), puis construction de la Phase 4 (modèle Prisma `Transfert`/`LigneTransfert` déjà présent dans le schéma mais aucune route/service/écran).

**Backend (suit exactement les patterns d'Achats/Stock) :**
- `transfert.service.ts` : `createTransfert` (décrément atomique CAS à la source via `updateMany({ where: { quantite: { gte } } })`, création `Transfert` + `LigneTransfert` + `MouvementStock` TRANSFERT_SORTIE dans une seule transaction), `recevoirTransfert` (incrément à la destination via upsert, `MouvementStock` TRANSFERT_ENTREE, statut → RECU avec CAS sur le statut pour empêcher une double réception concurrente), `annulerTransfert` (restitution du stock à la source, statut → ANNULE, même garde CAS)
- Numérotation auto TRF-000001, RBAC `requireStock` (SUPER_ADMIN/GERANT/MAGASINIER)
- Validation Zod : `emplacementSourceId !== emplacementDestId` refusé au niveau schéma

**Frontend :**
- Page `/transferts` (stats EN_TRANSIT/RECU/total, tableau, actions Réceptionner/Annuler), store Zustand `transfertStore`, modal `NouveauTransfertModal` (sélection source/destination, produits chargés depuis le stock réel de la source via `useStockStore`, quantité plafonnée au disponible)
- Entrée sidebar "Transferts" activée (état "Bientôt" retiré)

**Vérification :** 0 erreur TypeScript backend + frontend. Flux testé de bout en bout via l'API réelle (curl, cookies de session) faute de navigateur pilotable dans l'environnement (ni `chromium-cli` ni `playwright` disponibles) : création avec décrément stock source confirmé (118→108), stock insuffisant rejeté (400), source=destination rejeté, réception avec incrément destination confirmé (50→60) et statut RECU, annulation avec restitution confirmée (103→108), double-annulation bloquée. **UI React non vérifiée visuellement** — logique métier API validée uniquement.

**À faire encore :** vérification visuelle du flux UI en navigateur, Comptabilité SYSCOHADA + Rapports (Ph5/6), tests automatisés (toujours zéro sur le projet).

---

## 2026-07-02 (après-midi)

### EduSpher : Phase 3c livrée (éditeur de contenu, inscriptions, Stripe, admin réel, settings)

**Contexte :** Finalisation d'EduSpher après analyse senior dev. 7 fichiers créés ou modifiés en une session pour rendre la plateforme production-ready sur les fonctionnalités coeur.

**Éditeur de contenu formateur :**
- 4 routes API créées : modules (GET/POST), module/:id (PUT/DELETE), lessons (POST), lesson/:id (PUT/DELETE). Ownership vérifié à chaque niveau (course.authorId via Prisma)
- Page `/teacher/courses/[id]` : liste modules et leçons, inline editing titre, réordonnancement (swap d'order via 2 PUT parallèles), ajout/suppression, types leçons VIDEO/PDF/QUIZ/PROJECT
- Bouton "Contenu" ajouté dans `/teacher/courses` avec navigation dynamique via `useRouter`

**Flow d'inscription étudiant :**
- `POST /api/user/enrollments` : cours gratuits créés directement, cours payants retournent 402 avec le prix
- Page `/course` redessinée : gate d'accès (prévisualisation si non inscrit, player complet si inscrit), banner de confirmation après paiement avec bouton "Actualiser" (`activateEnrollment`)
- Dashboard étudiant : navigation directe vers le cours depuis "Continuer" et les recommandations

**Paiements Stripe :**
- `POST /api/payments/checkout` : crée une Stripe Checkout Session avec `metadata: { courseId, userId }`, retourne `{ url }` pour redirect
- `POST /api/payments/webhook` : vérifie la signature (`request.text()` pour raw body), crée l'enrollment via `upsert` sur `checkout.session.completed` + `payment_status === 'paid'`
- Guard lazy init : retourne 503 si `STRIPE_SECRET_KEY` absent (évite le crash `new Stripe(undefined)`)

**Dashboard admin réel :**
- `GET /api/admin/stats` : 7 requêtes Prisma en parallèle. Revenus estimés (somme des prix). 12 requêtes count mensuelles pour le graphique (SQLite ne supporte pas DATE_TRUNC)
- `admin/page.jsx` entièrement réécrit : KPI cards, graphique SVG inscriptions, tables users/cours, barres catégories, tous branchés sur l'API

**Settings profil réel :**
- `PATCH /api/user/profile` ajouté
- `SettingsPage.jsx` : chargement profil réel + inputs contrôlés + bouton "Enregistrer" avec feedback visuel

**À faire :** Phase 3d — upload fichiers (vidéos/PDF dans les leçons), migration SQLite → Supabase/PostgreSQL, déploiement Vercel.

---

## 2026-07-02

### LAKAY : activation d'abonnement centralisée + paiement manuel MonCash/NatCash + job d'expiration

**Contexte :** suite de la revue de la veille. Trois demandes de Jaslin : débloquer réellement l'édition des annonces actives côté frontend, mettre en place un paiement manuel (numéros MonCash/NatCash affichés + preuve envoyée par l'utilisateur, validée par l'admin) faute d'API disponibles, et compléter le cycle d'abonnement. Tout typé (tsc backend + frontend, 0 erreur). Non testé en navigateur.

**Déblocage édition annonce (frontend) :** la page d'édition bloquait encore sur `status !== 'DRAFT'`. Aligné sur le backend : seuls SUSPENDED/RENTED/SOLD sont non éditables, bandeau d'avertissement "repassera en révision" quand l'annonce n'est pas en brouillon, badge de statut dynamique.

**Service paiement centralisé (`payments.service.ts`, nouveau) :** point d'entrée UNIQUE `activateSubscription(paymentId, transactionId)` appelé par les webhooks MonCash/NatCash ET par la validation admin. Effets idempotents/atomiques : Payment→COMPLETED (compare-and-swap), Subscription upsert (+30j), et selon le plan : ENTERPRISE → `Agency.isVerified=true`. Choix d'ingénierie sur "compte vérifié selon le plan" (Jaslin a laissé trancher) : badge pro **dérivé du plan** (aucun champ dupliqué, jamais désynchronisé) + vérif agence pour ENTERPRISE ; `User.isVerified` (email) non touché. Helpers : `initiatePlanPayment`, `submitPaymentProof`, `getPaymentNumbers`, `rejectPayment`, `expireSubscriptions`, `verifyWebhookSecret`, `isProPlan`.

**Paiement manuel (en attendant les API) :**
- `GET /payments/methods` : numéros MonCash/NatCash, éditables via SystemConfig (`PAYMENT_MONCASH_NUMBER`/`_NAME`, `PAYMENT_NATCASH_*`), défaut placeholder `+509 0000-0000`.
- `POST /payments/submit-proof` (multipart) : Payment PENDING marqué `awaitingVerification`, référence de transaction + capture Cloudinary optionnelle, garde-fou 1 preuve en attente/user.
- Admin : `GET /admin/payments`, `POST /admin/payments/:id/approve` (→ activateSubscription), `/reject` (→ FAILED + notif), avec audit log.
- NatCash ajouté en miroir de MonCash (routes initiate + callback, secret `NATCASH_WEBHOOK_SECRET`).
- Frontend : modal pricing repensée (onglets MonCash/NatCash, numéro copiable, formulaire preuve, écran succès) ; page admin/payments transformée de placeholder en file de validation (onglets En attente/Validés/Rejetés, boutons Valider/Rejeter).

**Job d'expiration (BullMQ) :** queue `maintenance` + `maintenance.worker.ts`, planifié toutes les heures (`scheduleMaintenanceJobs`, jobId fixe idempotent), branché server.ts + Bull Board. `expireSubscriptions()` : payants dépassés → FREE + retrait vérif agence (si ENTERPRISE) + notif (badge pro se corrige seul). `expireListings()` : annonces ACTIVE dépassées → EXPIRED (statut attendu par l'UI mais jamais posé jusqu'ici).

**À configurer :** `.env` → `MONCASH_WEBHOOK_SECRET`, `NATCASH_WEBHOOK_SECRET`, `BULL_BOARD_USER`, `BULL_BOARD_PASSWORD` ; SystemConfig → numéros `PAYMENT_MONCASH_NUMBER`/`_NAME` + `PAYMENT_NATCASH_NUMBER`/`_NAME`.

**Reste à faire :** intégration réelle API MonCash (Digicel) / NatCash (Natcom) avec vraie vérif de signature ; tests bout-en-bout navigateur (auth cookie httpOnly, upload multipart de preuve, validation admin, CSP sur pages Leaflet/Cloudinary).

---

## 2026-07-01 (soir)

### LAKAY : audit senior dev complet + correctifs sécurité, scalabilité et durcissement

**Contexte :** revue de code approfondie de LAKAY (posture senior dev) sur demande de Jaslin : identifier ce qui est bon, ce qui manque, ce qui mérite d'être amélioré. Diagnostic puis correction de bout en bout (backend Express/Prisma + frontend Next.js), le tout typé (tsc exit 0) et migration appliquée.

**Verdict d'ensemble :** architecture solide et pro (modules/services/controllers/routes, Zod partout, RBAC hiérarchique, refresh token rotatif, transactions Prisma, cache Redis fault-tolerant, workers BullMQ). Mais 2 failles critiques + 1 problème de scalabilité majeur avant prod.

**🔴 Critiques corrigés :**
- **Bypass de paiement MonCash** (`payments.routes.ts`) : le webhook `/moncash/callback` était derrière `router.use(requireAuth)` → inaccessible aux serveurs MonCash, et surtout exploitable (tout user connecté pouvait s'auto-créditer un abonnement en POSTant `success:true`). Fix : webhook sorti de l'auth, authentifié par secret partagé `MONCASH_WEBHOOK_SECRET` (header `x-moncash-signature`, `timingSafeEqual`), idempotent (compare-and-swap sur PENDING), fail-closed sans secret (503).
- **IDOR détail d'annonce** (`listings.service.ts:getListingById`) : `GET /listings/:id` en `optionalAuth` sans garde de statut → n'importe qui pouvait lire les DRAFT/PENDING/REJECTED d'autrui (motif de rejet, tel, WhatsApp). Fix : statuts non publics visibles uniquement par propriétaire/admin (sinon 404), + `viewCount` non incrémenté pour le propriétaire ni les annonces non publiques.

**🟠 Importants corrigés :**
- **Zéro index en base** (`schema.prisma`) : ajout d'index composites sur `Listing` (status+dept+type, status+price, status+createdAt, tri sponsorisé, expiresAt) + FK chaudes (`Message(conversationId,createdAt)`, `Favorite.listingId`, `Notification(userId,isRead,createdAt)`, `RefreshToken.userId`, `VisitRequest`, `Payment`). Migration `20260701232949_add_indexes_and_security`.
- **Filtre géo cassé** (`search.service.ts`) : Haversine appliqué APRÈS pagination → total faux, pages incomplètes. Fix : bounding box dans le `where` (pagination/total corrects) + raffinage Haversine sur la page + champ `distanceKm`.
- **Fuite Cloudinary** (`deleteListing`) : suppression d'annonce ne purgeait pas les images Cloudinary → assets orphelins. Fix : purge best-effort `Promise.allSettled`.
- **Collision clé de cache recherche** : `base64.slice(0,80)` remplacé par hash SHA-1 complet.

**🟡 Corrigés :**
- N+1 `getUnreadCount` (1 count par conversation, toutes les 30s) → 2 requêtes fixes (un `count` avec OR par conversation).
- Bull Board inaccessible (`requireAdmin` sans `requireAuth`) → Basic Auth `BULL_BOARD_USER`/`BULL_BOARD_PASSWORD`, fail-closed.

**Décisions produit (validées par Jaslin) + implémentées :**
- **Édition annonce ACTIVE** → toute édition la renvoie en `PENDING_REVIEW` (+ strip des champs protégés côté serveur).
- **Avis** → réservés aux utilisateurs ayant une visite `CONFIRMED`/`COMPLETED` (marqués `isVerified`).
- **Durcissement front** → refresh token migré en **cookie httpOnly** (`path=/api/auth`, secure+sameSite=none en prod), front en `withCredentials`, plus aucun refresh token en localStorage (`setTokens`→`setAccessToken`), CSP + en-têtes sécurité posés dans `next.config.ts` (connect-src dérivé API/Socket, img Cloudinary/OSM/unpkg, frame-ancestors none). Limite connue : Next impose `unsafe-inline`.

**À faire côté Jaslin :** définir `MONCASH_WEBHOOK_SECRET`, `BULL_BOARD_USER`, `BULL_BOARD_PASSWORD` dans le `.env` backend ; tester en navigateur le nouveau flux d'auth par cookie (login/refresh/logout) et vérifier que la CSP ne bloque rien (Leaflet, Cloudinary) ; en prod, HTTPS obligatoire des deux côtés pour le cookie sameSite=none.

---

## 2026-07-01

### GESCOM : analyse senior dev + dashboard premium + fix sécurité stock

**Contexte :** Analyse du projet GESCOM demandée en mode senior dev. Constat que la mémoire/contexte était partiellement dépassé : Achats/Fournisseurs (Phase 3) était en réalité déjà livré (backend + frontend fonctionnels), pas seulement planifié.

**Analyse senior dev — points relevés :**
- Race condition (TOCTOU) sur le décrément de stock dans `vente.service.ts` (createVente) et `stock.service.ts` (ajusterStock) : vérification du stock disponible séparée du décrément, sans garde atomique — même bug que celui corrigé sur BANKA en Semaine 2. Risque réel vu que GESCOM est déjà utilisé par le client.
- Modules manquants vs roadmap : Transferts inter-sites (modèle Prisma présent, aucune route/service/écran), Comptabilité (seules les écritures automatiques existent, pas de saisie manuelle ni de bilan/résultat/grand livre), Rapports (absent).
- Zéro test automatisé sur tout le projet (backend + frontend).
- 0 erreur TypeScript sur les deux côtés, RBAC et audit log appliqués de façon cohérente sur toutes les routes.

**Dashboard premium (livré) :**
- Backend `dashboard.service.ts` enrichi : tendance ventes jour vs veille (%), historique ventes 7 derniers jours (buckets quotidiens), top 5 produits vendus (7j), top 5 clients à risque par solde dû + encours crédit total, détection automatique des commandes fournisseur en retard (dateLivraisonPrevue dépassée), liste des alertes stock (pas juste un compteur)
- Frontend dashboard entièrement redessiné : hero avec actions rapides gérées par rôle (Nouvelle vente / Ajuster le stock / Nouvelle commande — mêmes groupes de rôles que le RBAC backend requireVente/requireStock), 5 KPI avec badge de tendance, graphique ventes 7 jours (barres CSS, sans dépendance externe), widgets top produits/clients à risque/commandes en retard, bannière de succès locale remplaçant tout `alert()`/`confirm()` natif
- Nouveau composant `QuickAjustementModal` : picker produit+emplacement réutilisant l'`AjustementForm` existant, permet d'ajuster le stock sans quitter le dashboard
- Vérifié en navigateur de bout en bout : login, KPI, graphique, ajustement de stock réel (0 → 15, alerte résolue automatiquement), modal nouvelle vente

**Fix sécurité (bonus, pendant la retouche des mêmes fichiers) :**
- `createVente` et `ajusterStock` : remplacement du pattern check-puis-update par un compare-and-swap atomique (`updateMany` avec `where: { quantite: { gte } }`) dans la transaction Prisma, empêchant la survente/stock négatif en cas d'opérations concurrentes sur le même produit

**À faire encore :** Transferts inter-sites (Ph4), Comptabilité SYSCOHADA + Rapports (Ph5/6), tests automatisés.

---

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
