# Workspace History

> Journal chronologique de toutes les sessions et décisions importantes.
> Le plus récent en haut. Mis à jour automatiquement par Claude.
>
> **Comment ça marche :** Quand je lance la commande `/update` après une session importante, ou quand je raconte un changement significatif, Claude ajoute une entrée ici automatiquement. Je n'ai pas à écrire ce fichier manuellement.

---

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
