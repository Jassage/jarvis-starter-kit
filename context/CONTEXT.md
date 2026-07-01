# CONTEXT.md

> Mon contexte personnel et professionnel pour mon Jarvis.
> Ce fichier sera rempli automatiquement lors de l'installation initiale puis mis à jour au fil du temps par Claude.

---

## Qui je suis

- **Prénom :** Jaslin
- **Ville / Pays :** Originaire de Gros-Morne, vit actuellement à Pignon (Haïti), avec des allers-retours entre les deux villes
- **Situation actuelle :** Étudiant en sciences informatiques, développeur fullstack freelance et professeur de programmation
- **Profil dominant :** Mix (indépendant / freelance + étudiant + enseignant)

---

## Ce que je fais

### Activité principale

Je développe des applications web et mobile pour tous types de clients (entreprises, particuliers, ONG), rémunéré au projet. En parallèle, je poursuis mes études en sciences informatiques et j'enseigne la programmation.

### Détails selon le profil

**Études :**
- Domaine d'études : Sciences informatiques
- Niveau / Année : Études universitaires en cours

**Activité freelance (développement) :**
- Activité : Développement d'applications web et mobile, solutions informatiques sur mesure
- Modèle économique : Rémunération au projet
- Clients types : Entreprises, particuliers, ONG

**Enseignement :**
- Professeur de programmation

---

## Mes objectifs

### Objectifs court terme (3 à 6 mois)

- Développer et lancer une plateforme e-learning destinée aux étudiants et professionnels (cours, évaluations, suivi des progrès)
- Concevoir une application complète de gestion hospitalière (patients, rendez-vous, dossiers médicaux, facturation, utilisateurs)
- Développer des solutions SaaS de gestion pour établissements scolaires et banques, et obtenir les premiers clients pour commencer le déploiement
- En parallèle : progresser dans les études, développer l'activité freelance et renforcer les compétences en développement web et mobile

### Objectifs long terme (1 à 3 ans)

- Terminer les études universitaires et être reconnu comme un professionnel compétent en développement logiciel et systèmes d'information
- Transformer les projets SaaS en entreprises rentables (e-learning, gestion hospitalière, gestion scolaire, solutions financières)
- Disposer d'un portefeuille de clients fidèles en Haïti et à l'international, avec des revenus récurrents
- Créer une entreprise technologique solide capable de développer des solutions innovantes pour organisations, écoles, hôpitaux et institutions financières
- Atteindre l'indépendance financière, investir dans de nouveaux projets, former d'autres développeurs et avoir un impact positif en Haïti grâce à la technologie

---

## Mes projets en cours

Liste des projets ou chantiers actifs sur lesquels je veux que Claude m'aide :

- Mon activité d'enseignement de la programmation
- **EduSpher** : plateforme e-learning (Next.js 14 App Router + NextAuth v5 + Prisma + SQLite). UI complète (landing, auth, dashboards étudiant/formateur/admin, lecteur de cours, quiz, certificats). Phase 1 et 2 livrées : DB SQLite seedée (6 cours, 3 users démo), 10+ API routes (courses, enrollments, profile, lesson progress, quiz, teacher courses/students), dashboard étudiant et formateur branchés sur vraies données, persistance progression leçons, sauvegarde tentatives quiz, course builder formateur (CRUD cours + publication). Comptes démo : julien@eduspher.com / sofia@eduspher.com / admin@eduspher.com (password123). Prochaine étape : Phase 3 (paiements Stripe, notifications temps réel, recherche).
- **SYGS-IMFP** : système de gestion scolaire (Institution Mixte Faustin 1er). Projet avancé (60+ commits) : backend Express 5 + TypeScript + Prisma + MySQL, frontend Vite + React 18 + shadcn/ui. Couvre élèves, profs, notes, bulletins, présence, frais de scolarité, etc. Architecture multi-tenant : modèle Silo décidé (une instance + une base par école). Refactor vers le partagé jugé prématuré avant validation du marché. Module Messagerie complet (2026-06-30) : Socket.io, conversations directes et groupes, temps réel, badge non-lus dans la sidebar, page dédiée full-height. Pièces jointes : photos (miniature cliquable), documents (icône + téléchargement), messages vocaux (MediaRecorder + lecteur audio natif), upload via POST /api/messages/conversations/:id/attachment (multer, 10 Mo max). Accusés style WhatsApp : ✓ Envoyé / ✓✓ gris Livré / ✓✓ bleu Lu, mis à jour en temps réel via Socket.io (ack_delivered → message_status ; markAsRead diffuse aussi message_status). En groupe, "Lu" = tous les membres ont vu. Présence en ligne (point vert, "En ligne"/"Hors ligne"), indicateur de frappe, sécurité join_conversation (vérification appartenance avant socket.join), errorHandler global branché.
- **KONEKTE** : plateforme de rencontres haïtienne, déployée en production. Stack : Next.js 16 + Express + MySQL + Prisma + Socket.io. URLs : konekte-xi.vercel.app (frontend) / jarvis-starter-kit-production-f573.up.railway.app (backend). Fonctionnalités : swipe avec drag, matching, chat (texte, voix, photos), notifications temps réel, "Qui m'a liké", Super Likes, Premium avec Stripe (fonctionnel) + MonCash (prêt, en attente credentials Digicel), emails transactionnels Gmail SMTP, Cloudinary pour les médias, vérification d'email. Prochaine étape : credentials MonCash Digicel Business Haiti
- **BANKA** : système de gestion bancaire complet. Stack : Next.js App Router + Express 4 + TypeScript + Prisma v5 + PostgreSQL. Ports : 4001 (backend) / 3001 (frontend). Modules livrés : Tableau de bord, Clients (KYC renforcé : pièce d'identité + numéro obligatoires pour INDIVIDUEL, âge ≥ 18 validé, soft delete avec guards), Comptes (9 types : EPARGNE, COURANT, TERME, JOINT, MICRO_EPARGNE, TONTINE, RETRAITE, JEUNESSE, CREDIT, clôture avec guards : solde=0 + pas de prêts actifs + pas d'épargnes programmées), Transactions (dépôt/retrait/virement atomiques avec compare-and-swap), Caisse (sessions journalières avec auto-liaison des transactions à la session ouverte), Crédits & Prêts (amortissement dégressif/constant/in fine, décaissement, remboursement, remboursement anticipé avec recalcul du tableau d'amortissement, annulation avant décaissement), Rapports (journalier, PAR 30/90, impayés), Rapport BRH (ratios prudentiels liquidité ≥ 20% / solvabilité ≥ 8%, grandes expositions top 5, comptes capitaux), Journal d'audit, Utilisateurs, Agences (avec compteur d'employés RH), Mandats & Procurations, Administration (paramètres configurables), RH complet (postes, employés, contrats, congés, bulletin de paie BROUILLON→VALIDÉ→PAYÉ, avances sur salaire, éléments variables, pointage biométrique ZKTeco ADMS), Taux de change (CRUD taux HTG/USD, virement cross-devise atomique), Alertes AML (4 détecteurs : seuil déclarable, structuration, vélocité élevée, mandataire blacklisté), Épargne programmée (virements automatiques récurrents multi-fréquences), Comptabilité SYSCOHADA complète (dashboard comptable, plan comptable 31 comptes classes 1/2/4/5/6/7, journal avec saisie manuelle, grand livre par compte, bilan actif/passif, compte de résultat produits/charges, réconciliation écritures en échec). Fonctionnalités transversales : RBAC 7 rôles, audit log complet, frais automatiques (tenue de compte mensuel, dossier prêt 2%, virement 0,5%), notifications temps réel SSE (cloche header, flash ALERTE_AML), double-entry bookkeeping automatique sur toutes les opérations, pénalités de retard, PDF dossier crédit, montants compacts K/M/Md, blocage transactions sans caisse ouverte. Sécurité renforcée (session 2026-06-29) : JWT refresh secret obligatoire, RBAC sur toutes les routes, atomicité transactions avec compare-and-swap, politique mot de passe 12 car minimum (maj+min+chiffre+spécial), révocation sessions sur désactivation compte, reset mot de passe par email (token opaque 256-bit, usage unique, 1h expiry), rate limiting sur endpoints sensibles, whitelist droits mandats, soft delete partout. Page login redesignée (fond sombre navy, carte deux panneaux semi-transparente, tips bancaires carrousel). En cours de développement actif. Aucun module manquant identifié.
- **GESCOM** : ERP commercial pour un client signé (entreprise avec 1 boutique détail + 1 entrepôt grossiste, stocks séparés, devise HTG, 5-20 utilisateurs). Stack : Next.js App Router + Express 4 + TypeScript + Prisma v5 + PostgreSQL. Ports : 4002 (backend) / 3003 (frontend). Phase 0 + Phase 1 (Stock/Produits) + Phase 2 (Ventes/Clients) livrées le 2026-06-30. Modules en prod : Tableau de bord (KPI temps réel : valeur stock, ventes du jour, alertes, produits actifs), Produits (CRUD + alertes seuil), Stock (ajustement atomique, mouvements, alertes), Ventes (création POS atomique : vérif stock + décrément + écriture compta + soldeDu CREDIT, annulation avec restitution, historique), Clients (CRUD PARTICULIER/GROSSISTE, solde dû). Design : thème vert, Inter, sidebar icônes + drawer mobile, header dropdown, responsive 100%. Compte démo : admin@gescom.ht / Admin@123. Prochaines phases : Achats/Fournisseurs (Ph3), Transferts (Ph4), Comptabilité (Ph5), Rapports (Ph6). Nom de code provisoire, renommable.
- **LAKAY** : plateforme immobilière haïtienne (annonces de biens à louer/vendre). Stack : Next.js App Router + Express 4 + TypeScript + Prisma + PostgreSQL + PostGIS + Redis + BullMQ + Socket.IO. Ports : 4003 (backend) / 3004 (frontend). 9 types de biens (chambre, studio, appartement, maison, villa, terrain, local commercial, bureau, entrepôt), 7 rôles RBAC (Super Admin à Visiteur), recherche avancée 30+ filtres avec critères Haïti-spécifiques (eau/électricité/générateur/citerne/panneau solaire), système de messagerie temps réel (fix décalage format API data.data), abonnements (FREE/BASIC/PROFESSIONAL/ENTERPRISE) avec modal de souscription MonCash, paiements MonCash + Stripe, module IA (estimation de prix, génération de descriptions, recherche langage naturel). Fonctionnalités récentes : PropertyCard redesignée avec overlay gradient et animations, hero full-width avec image de fond, stats homepage dynamiques (API /stats), départements dynamiques (10 départements + groupBy Prisma), FAQ accordion, badges non-lus (messages/notifications/favoris) dans le header via useNavCounts, GPS picker carte Leaflet dans le formulaire de création d'annonce, fix 422 édition annonce (sanitize ALLOWED fields), fix 401 admin review (requireAuth manquant), fix 500 admin stats (Subscription.isActive vs status), fix SMTP non-bloquant. Comptes seed : admin@lakay.ht / Admin@Lakay2024!, proprietaire@demo.ht / Owner@123. En développement actif.
- **MEDIKA** : application de gestion hospitalière (patients, consultations, examens médicaux, file d'attente, rendez-vous, facturation, hospitalisations, pharmacie, planning du personnel). Stack : Next.js 15 App Router + Express 4 + TypeScript + Prisma v5 + PostgreSQL, shadcn/ui (sur Base UI). Modules construits : patients, file d'attente (numérotation journalière, workflow EN_ATTENTE → EN_CONSULTATION → TERMINE), consultations (workflow en 2 visites : plainte + examens à V1, diagnostic + prescriptions + prochain RDV à V2), examens médicaux (formulaires structurés par type avec normes et détection de valeurs anormales), hospitalisations (séjours, chambres/lits, prescriptions structurées, administrations infirmières, dossier patient complet), pharmacie (inventaire, lots, mouvements, dispensation liée aux prescriptions, dispensation ambulatoire directe, alertes stock, commandes fournisseurs), planning du personnel (gardes CRUD, absences CRUD, vue semaine, disponibilité, vue personnelle par utilisateur connecté). Dernières fonctionnalités ajoutées : picker médicament avec auto-remplissage du dosage, prescription builder structuré, notifications d'administration médicaments (SSE), auto-création de rendez-vous de suivi, seed 63 médicaments, facturation hospitalière, dashboard enrichi (lits/recettes), export dossier médical PDF complet depuis la page patient (identité, antécédents, consultations, examens, hospitalisations, prescriptions, factures), recherche globale Cmd+K (SearchPalette debounce 280ms, navigation clavier, patients/factures/examens via GET /api/search), rapports avec sélecteur de période (5 presets + dates personnalisées, paramètres from/to), section examens dans les rapports journaliers. En cours de développement actif.

---

## Mes outils et préférences

### Outils que j'utilise au quotidien

- **VS Code** pour le développement
- **GitHub** pour la gestion de versions et le stockage de code
- **Claude Code** et **ChatGPT** comme assistants de développement et de productivité
- **Postman** pour tester les API
- **MySQL**, **PostgreSQL** et **Prisma** pour les bases de données
- **Figma** pour le design d'interfaces
- **Docker** pour la conteneurisation
- **Node.js**, **Next.js**, **React**, **React Native** et **Django** pour les projets web et mobiles
- **Microsoft Word**, **Excel** et **PowerPoint** pour la documentation et les présentations

### Style de communication préféré

Un mélange selon le contexte :
- **Direct et efficace** pour les décisions, le débogage et les problèmes techniques
- **Détaillé et pédagogique** (avec exemples concrets) pour l'apprentissage de nouveaux concepts, l'architecture logicielle et les sujets complexes

### Domaine où j'ai besoin du plus d'aide

**Architecture et développement de mes solutions SaaS**, en priorité :
- L'architecture logicielle et la conception des bases de données
- Le choix des technologies et des bonnes pratiques de développement
- La planification des fonctionnalités (MVP vers version complète)
- La mise en place d'une architecture SaaS multi-clients (multi-tenant)
- La sécurité, les performances et la scalabilité
- La stratégie de lancement et de commercialisation des produits

En second plan : améliorer ma productivité pour mieux équilibrer études, projets freelance, enseignement et développement de mes produits SaaS.

---

## Notes importantes

> Cette section se remplira au fil du temps avec les éléments de contexte qui émergent naturellement dans mes sessions avec Claude.
