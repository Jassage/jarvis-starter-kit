# SMART GROS-MORNE — Cahier des charges & plan

Projet commandé par un client réel (mairie / diaspora / porteur de projet — à préciser). Portail vitrine de la commune de Gros-Morne (Artibonite, Haïti), 20 sections, entièrement administrable depuis un tableau de bord.

## État de l'existant (avant ce document)

Un frontend Next.js 16 + Tailwind 4 + Radix UI + Framer Motion existait déjà, non documenté dans le contexte Jarvis, découvert le 2026-07-28. 9 pages statiques (contenu en dur dans les composants, aucune base de données, aucun backend, aucun admin) :

- Accueil (`/`) : Navbar, TickerBanner, HeroSection, StatsBar, FeaturedSection, HomeOverview, GalleryPreview, SectionsCommunes, DonationSection, SponsorsSection, Footer
- Histoire, Géographie, Culture, Personnalités, Tourisme, Communauté, Galerie, Actualités

Décision : on continue sur cette base plutôt que de repartir de zéro. Le design (thème vert/blanc, cartes, animations Framer Motion) est à conserver et étendre, pas à refaire.

## Décision d'architecture

- Frontend : Next.js (existant, App Router) conservé et étendu
- Backend : Express + TypeScript + Prisma + PostgreSQL, même stack que le reste du portefeuille (BANKA, GESCOM, LAKAY, MEDIKA...) — cohérence, pas de CMS headless tiers
- Admin : tableau de bord sur mesure permettant de modifier tout texte/image/vidéo/document sans intervention développeur (exigence explicite du cahier des charges)
- Modèle de contenu générique multilingue à concevoir dès la fondation (fr / ht au minimum) pour éviter une migration lourde plus tard

## Cahier des charges complet (20 sections)

### 1. Accueil
Header (logo, menu, recherche, langues), bannière principale, slogan, présentation rapide, chiffres clés, sites touristiques populaires, dernières actualités, événements à venir, galerie d'images, carte interactive, témoignages, newsletter, footer. Toutes les sections alimentées depuis la base pour être administrables.

### 2. Découvrir Gros-Morne
- Présentation : mot de bienvenue, situation géographique, carte
- Histoire : origines, fondation, grandes dates, évolution
- Culture : traditions, musique, danses, gastronomie, artisanat
- Patrimoine : monuments, places publiques, églises, bâtiments historiques
- Sections communales : nom, description, population, photos, activités principales (par section)
- Personnalités : biographie, photos, contributions

### 3. Tourisme
Lieux incontournables, cascades, rivières, montagnes, grottes, églises, sites historiques, sentiers, hébergements, restaurants, guides touristiques. Chaque fiche : galerie photos, description, horaires, GPS, carte, conseils, services disponibles.

### 4. Économie
Agriculture, élevage, commerce, artisanat, industrie, coopératives, entreprises locales, marchés publics. Chaque secteur : description, importance, chiffres, opportunités.

### 5. Investir
Pourquoi investir, opportunités (agriculture, immobilier, tourisme, commerce, industrie), témoignages, procédures administratives, contacts utiles.

### 6. Annuaire
Catégories : écoles, universités, pharmacies, hôpitaux, banques, hôtels, restaurants, églises, associations, ONG, stations-service, boutiques, entreprises, garages, professionnels, transport. Chaque fiche : nom, description, adresse, téléphone, WhatsApp, email, site web, réseaux sociaux, horaires, photos, carte, catégorie.

### 7. Actualités
Articles, communiqués, interviews, reportages, culture, sport, santé, agriculture, éducation, politique locale. Recherche, catégories, partage, commentaires.

### 8. Agenda
Calendrier : festivals, carnaval, réunions, matchs, formations, conférences, activités culturelles. Chaque événement : date, heure, lieu, organisateur, description, images, carte.

### 9. Galerie
Albums : nature, culture, histoire, événements, tourisme, drone. Chaque album : photos, vidéos, description.

### 10. Diaspora
Actualités, investissements, associations, témoignages, dons, projets communautaires, opportunités.

### 11. Services Municipaux
Mairie, protection civile, police, santé, eau, électricité, justice. Chaque service : présentation, horaires, coordonnées, responsable, carte.

### 12. Vie Associative
Liste des associations. Chaque association : logo, président, description, domaines d'action, photos, contact.

### 13. Éducation
Écoles, universités, centres de formation, bibliothèques. Chaque établissement : description, directeur, téléphone, adresse, photos.

### 14. Santé
Hôpitaux, centres de santé, pharmacies, médecins. Chaque fiche : adresse, horaires, téléphone, services, localisation.

### 15. Contact
Formulaire de contact, téléphone, email, réseaux sociaux, carte Google, FAQ rapide.

### 16. À propos
Vision du projet, objectifs, équipe, partenaires, historique du portail.

### 17. FAQ
Tourisme, services, investissements, démarches administratives, fonctionnement du site.

### 18. Mentions légales
Éditeur du site, hébergement, droits d'auteur, responsabilités.

### 19. Politique de confidentialité
Données collectées, cookies, conservation, sécurité, droits des utilisateurs.

### 20. Conditions d'utilisation
Règles d'utilisation, responsabilités, propriété intellectuelle, modifications, contact.

## Recommandations techniques transversales (imposées par le client)

- Design moderne et responsive (mobile, tablette, ordinateur)
- Composants réutisables (cartes, boutons, formulaires, galeries, filtres)
- Contenu 100% administrable depuis le dashboard, sans intervention développeur
- Recherche et filtres sur les sections à fort volume (annuaire, tourisme, actualités, événements)
- SEO : URLs lisibles, balises titre/description, partage réseaux sociaux, données structurées
- Performance : lazy loading images, compression médias, cache, optimisation mobile

## Cahier des charges enrichi (2026-07-28, suite) — audit + réconciliation

Jaslin a fourni une version nettement plus détaillée du cahier des charges : structure complète des 20 sections, **28 modules de tableau de bord admin**, et une proposition de **~35 tables de base de données**, plus une stratégie de placement pour les sponsors/partenaires. Audit réalisé avant tout code :

- **Backend réel** : 3 modules (`auth`, `contenu`, `media`), 5 modèles Prisma (`AdminUser` mono-rôle `ADMIN`, `RefreshToken`, `PageSection`/`PageSectionTraduction`, `Media`).
- **Frontend réel** : les 24 pages publiques existent mais **aucune ne fait de `fetch`** (vérifié par grep) — Tourisme, Annuaire, Actualités, Agenda, Galerie, Investir, Diaspora, Services municipaux, Vie associative, Santé, Éducation, Économie sont **100% statiques**, malgré la refonte visuelle livrée en Phase 1.
- **Admin réel** : seulement `/admin/login`, `/admin`, `/admin/contenu`. Aucun écran de gestion pour Tourisme/Annuaire/Actualités/Agenda/Galerie/Associations/Écoles/Santé/etc.

**Décisions d'architecture validées avec Jaslin (AskUserQuestion) avant de re-phaser :**

1. **Rôles en enum Prisma fixe** (`SUPER_ADMIN`, `ADMIN`, `EDITEUR`, `JOURNALISTE`, `MODERATEUR`, `GESTIONNAIRE_TOURISME`, `GESTIONNAIRE_ANNUAIRE`, `GESTIONNAIRE_EVENEMENTS`) — pas de moteur RBAC générique dynamique (tables `roles`/`permissions`/`role_permissions`), cohérent avec BANKA/OTELA/GESCOM. `rbac.middleware.ts` déjà en place, à généraliser au-delà du rôle unique actuel.
2. **Réconciliation des doublons du document** : un modèle Prisma dédié par vertical ayant son propre module admin explicite (Tourisme, Actualités, Événements, Galerie/Vidéos, Entreprises, Hôtels, Restaurants, Écoles, Santé, Associations, Services municipaux) ; un modèle générique `AnnuaireEntry` (catégorie enum) uniquement pour ce qui reste sans module dédié (banques, églises, ONG, stations-service, boutiques, garages, professionnels, transport) — la page `/annuaire` agrège les deux.
3. **Sponsors + Partenaires fusionnés** en un seul modèle `Partenaire` (catégorie institutionnel/entreprise/sponsor/ONG/mécène/média, niveau platine/or/argent/bronze nullable, emplacements d'affichage) — exactement la recommandation que Jaslin a lui-même formulée.
4. **Catégories en enum Prisma fixes**, pas en table dynamique — cohérent avec la décision 1.
5. **Pas de tracker de visites maison** : le dashboard admin affiche de vrais compteurs de contenu (`count()` Prisma), un vrai suivi de trafic reste une intégration externe (GA/Plausible), pas un développement.

## Phasage réactualisé

**Phase 0 — Fondations backend/admin** ✅ livrée
Backend Express+Prisma+PostgreSQL, modèle de contenu générique multilingue, auth admin, upload médias, dashboard admin skeleton.

**Phase 1 — Accueil + Découvrir + refonte visuelle + toutes les pages restantes (frontend statique)** ✅ livrée
Refonte header/hero/footer + construction des 20 sections en frontend statique (détail dans l'entrée `context/HISTORY.md` du 2026-07-28).

**Phase 2a — Découvrir (suite) : Sections communales + Personnalités** ✅ livrée le 2026-07-28
`SectionCommunale` et `Personnalite` (+ traductions FR/HT, une table fille par locale comme `PageSectionTraduction`, nom propre invariant sur le parent). Câblage réel : `SectionsCommunes.tsx` (grille des 8 sections communales sur l'accueil) et `PersonnalitesSection.tsx` (`/personnalites`) passés du tableau en dur à un `fetch` vers `/api/sections-communales` et `/api/personnalites`. Écrans admin dédiés `/admin/sections-communales` et `/admin/personnalites` (CRUD complet, réutilisant Badge/Modal/PageToolbar/EmptyState). `GeographieSection.tsx` (page `/geographie`, prose généraliste sur le relief/climat) non touché — hors périmètre de cette phase, candidat pour le mécanisme `PageSection` générique si besoin plus tard. Les 8 sections + 4 personnalités réelles (contenu FR exact de l'ancien code en dur) insérées via l'API authentifiée. Détail complet dans `context/HISTORY.md`.

**Phase 2b — Tourisme** ✅ livrée le 2026-07-28
`TourismPlace`/`TourismPlaceTraduction` (nom invariant, description/conseils traduits FR/HT) + `TourismPlacePhoto` (table de jonction vers `Media`, réutilise l'upload déjà existant, ordre explicite). Catégorie en enum (`CategorieTourisme`, 13 valeurs couvrant le cahier des charges + `CULTURE`/`EVENEMENT`/`AUTRE` pour rester fidèle au contenu réel existant), statut de publication (`BROUILLON`/`PUBLIE`/`ARCHIVE`, nouvel enum `StatutPublication` réutilisable par les phases suivantes) — la liste publique ne renvoie jamais un brouillon/archivé (`GET /tourisme`), la liste admin voit tout (`GET /tourisme/admin`). Admin dédié `/admin/tourisme` : formulaire complet (catégorie, statut, durée, difficulté, tags, GPS, horaires, tarif, téléphone, services disponibles) + sélecteur de photos réutilisant `mediaApi` existant (upload direct depuis le formulaire ou réutilisation d'une image déjà en bibliothèque). `TourismeSection.tsx` câblé sur `/api/tourisme` (icône/couleur dérivées de la catégorie côté client, pas stockées en base — même principe que les initiales de `PersonnalitesSection`). **Les 6 fiches réelles déjà en ligne migrées telles quelles** (contenu identique, pas de nouveau lieu inventé — les captures d'écran fournies par Jaslin montraient des noms de sites spécifiques mais non vérifiables comme réels à Gros-Morne, donc non utilisés). Guides touristiques toujours prévus pour l'Annuaire (Phase 2e), pas encore construit. Détail complet dans `context/HISTORY.md`.

**Phase 2c — Actualités & Agenda** ✅ livrée le 2026-07-28
`Article`/`ArticleTraduction` (titre/auteur/tags invariants, résumé+contenu traduits FR/HT, image principale via `Media`) et `Evenement`/`EvenementTraduction` (nom/lieu/GPS invariants, description traduite, `heureAffichage` en texte libre). Nouveaux enums `CategorieArticle` et `CategorieEvenement`. Agenda public strictement filtré aux événements **publiés ET à venir** (`date >= aujourd'hui`, comparaison UTC) — un événement publié dont la date est passée ne s'affiche jamais, vérifié explicitement. Admin dédié `/admin/actualites` et `/admin/agenda`. `ActualitesSection.tsx` et `AgendaSection.tsx` câblés sur l'API (mini-calendrier dynamique sur le mois courant réel, plus de "Mai 2026" en dur). **Bug réel trouvé et corrigé en vérification** : les dates s'affichaient avec un décalage d'un jour (15 juin → 14 juin) côté client, `toLocaleDateString`/`getDate()`/`getMonth()` appliquant le fuseau local à une date stockée en UTC minuit — corrigé en forçant `timeZone: "UTC"` et les méthodes `getUTC*` (même famille de bug que la garde anti-date-passée d'OTELA, référencée dans son propre historique). **6 articles réels migrés avec leurs dates historiques exactes** (mai-juin 2025, statut `PUBLIE` — une actualité garde légitimement sa date passée). **5 événements réels migrés en `BROUILLON`** plutôt que publiés : leurs dates dans le code hérité (25 mai, 10/18/21 juin, 5 juillet) n'indiquaient aucune année et le mini-calendrier affichait "Mai 2026" en dur sans rapport avec le contenu — plutôt que d'inventer une année plausible, les événements restent en brouillon jusqu'à ce que Jaslin fournisse un vrai calendrier avec des dates certaines. Détail complet dans `context/HISTORY.md`.

**Phase 2d — Galerie & Vidéos** ✅ livrée le 2026-07-29
`GalerieAlbum`/`GalerieAlbumTraduction` (nom invariant, description traduite FR/HT) + `GalerieMedia` (média d'un album : titre/auteur/lieu, `mediaId` nullable + `icone` emoji en repli — aucune vraie photo n'existe dans le contenu hérité, seulement des émojis de substitution, l'admin remplacera progressivement via le sélecteur Media déjà construit en Phase 2b). `Video`/`VideoTraduction` (lien externe YouTube/Vimeo, `miseEnAvant`, module admin distinct de la Galerie comme demandé). Nouvel enum `CategorieGalerie` (9 valeurs). Admin dédié `/admin/galerie` (albums + médias imbriqués dans un même formulaire) et `/admin/videos`. `GalerieSection.tsx` (`/galerie`) câblée : grille aplatie de tous les médias des albums publiés avec filtre par catégorie, plus une sous-section Vidéos ajoutée en bas de page (absente du site jusqu'ici). `GalleryPreview.tsx` (aperçu sur l'accueil, doublon de données jusqu'ici) également câblé sur la même API — décision prise pour éviter que l'accueil affiche des données fictives différentes de la vraie page Galerie. **5 albums réels créés** (Nature/Vie locale/Événements/Architecture/Culture) reprenant les 8 photos déjà en ligne (titre/auteur/lieu identiques), statut publié. Compteur de "likes" fictif retiré (aucune donnée d'engagement réelle n'existe, cohérent avec la décision de ne jamais afficher de métrique fabriquée). Aucune vidéo migrée : la fonctionnalité Vidéos est entièrement nouvelle, aucun contenu hérité à reprendre. Détail complet dans `context/HISTORY.md`.

**Phase 2e — Répertoires métier** ✅ livrée le 2026-07-29
8 modèles Prisma (+ traductions FR/HT chacun) : `Business` (Entreprises), `Hotel`, `Restaurant`, `School` (Éducation), `HealthFacility` (Santé), `Association` (Vie associative), `MunicipalService` (Services municipaux, sans photo), `AnnuaireEntry` (catch-all : banques/églises/ONG/stations-service/boutiques/garages/professionnels/transport). 8 modules backend identiques dans leur forme (public/admin, RBAC, validation), 8 écrans admin, sélecteur de photo réutilisant `mediaApi` sur 7 d'entre eux. `/annuaire` agrège désormais 7 sources (toutes sauf `MunicipalService`, absent de la liste de catégories du cahier des charges) via `Promise.all`, en conservant le filtre/recherche client déjà existant. Les 5 pages `FicheCardGrid` (Éducation, Santé, Vie associative, Services municipaux) câblées via un composant `*Section.tsx` dédié par page ; **Économie et Investir laissés statiques** — leur contenu hérité est une prose de secteurs économiques (pas une liste d'entités nommées), hors du périmètre "répertoire" de cette phase. **Déduplication réelle** : plusieurs entités apparaissaient à la fois sur leur page dédiée et dans l'ancien Annuaire statique (Lycée National, Hôpital Saint-Antoine, Association des Femmes Unies) — migrées une seule fois vers leur modèle propre, jamais dupliquées. **2 entreprises, 1 hôtel et 1 restaurant n'existaient que dans l'Annuaire sans description** (contrairement aux autres pages) — une description générique et non-inventée a été rédigée (reformulant simplement la catégorie/le nom, aucun fait spécifique fabriqué). `AnnuaireEntry` reste vide : aucune vraie fiche banque/église/ONG n'existait dans le contenu hérité. Détail complet dans `context/HISTORY.md`.

**Correctif hors-phasage — Images de fond des héros (`PageHeroImage`)** ✅ livré le 2026-07-29
Suite au retour de Jaslin ("chaque héro doit avoir une image de fond"), constat que le hero accueil utilisait un faux carrousel avec 3 fois la même photo Wikipedia (une cascade de Ville Bonheur, pas de Gros-Morne — factuellement fausse) et que les 23 autres pages n'avaient soit aucune image soit la même photo en dur. Nouveau modèle `PageHeroImage` (clé `page` unique parmi 24 valeurs enum, relation vers `Media` existant — pas de stockage dédié). Module backend `hero-images` (GET public par page, GET/PUT/DELETE admin) — route `/admin` déclarée avant `/:page` pour éviter que le paramètre enum intercepte le segment littéral "admin". Composant `DynamicPageHeader` (wrapper autour de `PageHeader` existant, fetch client par page, repli sur le gradient déjà supporté si aucune image) câblé sur les 23 pages secondaires + réécriture de `HeroSection.tsx` (accueil, suppression totale du carrousel/dots/`useCallback`). Écran admin `/admin/images-hero` : grille des 24 pages, upload direct ou réutilisation d'un média existant, suppression. Photo Wikipedia incorrecte retirée de ses deux emplacements (hero Tourisme, bloc décoratif `InvestirSection.tsx`) et remplacée par un gradient neutre, **aucune photo de stock de remplacement insérée** — décision explicite de Jaslin, qui uploade lui-même ses vraies photos. Vérifié en conditions réelles : Jaslin a uploadé en direct 3 photos (accueil/histoire/géographie) pendant la session, chacune confirmée affichée sur sa propre page (URLs distinctes), page sans upload (`/culture`) confirmée en repli gradient neutre sans image cassée. **Bug réel trouvé et corrigé juste après** ("les images s'affichent pas que côté admin ni dans les héros") : les URLs de médias sont stockées en relatif (`/uploads/xxx`) ; chaque `<img src={...}>` du frontend les utilisait telles quelles, donc la requête partait vers l'origine du frontend (3010) au lieu du backend qui sert réellement les fichiers (4010) — 404 systématique, jamais remarqué avant car aucune Phase précédente n'avait de vraie photo en base. Touchait 14 fichiers au total (hero images + 8 déjà existants : 9 sélecteurs de médias admin, Galerie publique, Personnalités). Corrigé par un helper unique `mediaUrl()` dans `lib/api.ts` plutôt que de changer le format de stockage. Détail complet dans `context/HISTORY.md`.

**Phase 2f — Pages transverses & configuration** ✅ livrée le 2026-08-06
`Temoignage`/`TemoignageTraduction` (nom/fonction/photo/note invariants, contenu traduit FR/HT — nouvelle section homepage `TemoignagesSection`, masquée tant qu'aucun témoignage n'est publié, même principe que Vidéos en Phase 2d), `Partenaire` (unifié sponsors+partenaires comme validé avec Jaslin, enum `emplacements` restreint à `ACCUEIL`/`A_PROPOS` — les deux seuls endroits qui affichaient déjà des partenaires en dur), `MessageContact` (formulaire public `/contact` sans authentification, gestion admin avec statuts NOUVEAU/LU/TRAITE/ARCHIVE, passage automatique à LU à l'ouverture), `AbonneNewsletter` (collecte + export CSV, pas d'envoi de campagne comme prévu, upsert idempotent pour gérer une réinscription après désabonnement), `Faq`/`FaqTraduction` (catégorie enum reprenant les 3 catégories déjà utilisées par le contenu hérité + 2 nouvelles du cahier des charges), `SiteSettings` (singleton `id="singleton"`, alimente Footer/TopBar/Contact — un champ vide affiche le même repli visuel qu'avant, aucune régression), et **journal d'activité (`ActivityLog`)** : plutôt qu'un retrofit manuel module par module (~20 modules existants), un **middleware générique unique** (`activityLog.middleware.ts`) capture automatiquement toute requête admin mutante réussie (`res.on('finish')`, lecture de `req.originalUrl` — jamais `req.baseUrl`, dont la valeur dépend de l'empilement des routeurs traversés) : couvre rétroactivement tous les modules existants sans y toucher, vérifié en conditions réelles (actions sur faqs/temoignages/partenaires/contact toutes journalisées sans configuration par module). Écran admin `/admin/journal-activite` avec filtre par module (liste dynamique des entités déjà journalisées) et pagination.

**Nettoyage au passage** : `TopBar.tsx` avait le même défaut que l'ancien `Footer.tsx` (icônes réseaux sociaux `href="#"` non fonctionnelles) — corrigé avec le même hook `useSiteSettings` par cohérence, une icône n'étant visible que si son lien est réellement renseigné. Les 6 questions/réponses FAQ et les 2 vrais partenaires (Francisque FM 98.9, Mairie de Gros-Morne) du contenu hérité migrés tels quels vers les nouveaux modèles (contenu identique, pas de nouveau texte inventé) — un premier essai de migration via un script bash a corrompu les accents (encodage shell Windows), détecté en vérification et corrigé en recréant les entrées via un script Node.js garantissant l'UTF-8.

**Vérifié en conditions réelles** : `tsc --noEmit` propre backend/frontend. API (curl + script Node — CRUD complet sur les 6 nouveaux modules, formulaire de contact et newsletter accessibles sans authentification, journal d'activité protégé 401 sans token, entrées correctement journalisées). Navigateur (accueil avec témoignage et partenaires réels, page FAQ avec les 3 catégories, formulaire de contact soumis réellement avec passage automatique en "Lu" côté admin visible dans le journal d'activité, 7 écrans admin testés). Données de test nettoyées après vérification, ActivityLog conservé tel quel (journal d'audit réel, pas un artefact à purger).

**Phase 3 — Recherche, filtres réels et carte interactive** ✅ livrée le 2026-08-06

**Constat de départ, avant tout code :** Tourisme avait déjà, sans documentation, une recherche serveur (`q` sur nom/description, Phase 2b) et une carte Leaflet réelle (`CarteInteractive.tsx`, générique et réutilisable) — probablement construit en marge d'une session non `/update`ée, comme le module `recherche` (recherche globale légère) déjà repéré au même titre en fin de Phase 2f. L'Annuaire avait aussi déjà sa carte + une recherche, mais **entièrement côté client** : les 7 verticaux étaient chargés en entier (`Promise.all` sans filtre) puis filtrés en mémoire dans le navigateur — fonctionnel au faible volume actuel mais ni "réel" ni scalable au sens du cahier des charges. Seuls Actualités et Agenda n'avaient aucune recherche.

**Livré :** recherche serveur (`q`, debounce 300ms, `contains`/`insensitive`, même convention que Tourisme) ajoutée à Actualités (titre + résumé + contenu) et Agenda (nom + lieu + description, sans toucher au filtre "à venir" déjà en place) — UI de recherche ajoutée aux deux pages dédiées (`ActualitesSection.tsx`/`AgendaSection.tsx`, seulement utilisées sur `/actualites` et `/agenda`, jamais sur l'accueil qui a ses propres composants teaser). Bouton "Voir toutes les actualités" retiré au passage (n'avait jamais de lien, décoratif — le composant affiche déjà la liste complète).

**Annuaire converti en recherche server-side réelle** : nouvel endpoint `GET /annuaire/toutes?secteur=&q=` (module `annuaire`) agrégeant les 7 verticaux (Business/Hotel/Restaurant/School/HealthFacility/Association/AnnuaireEntry) directement en base — `q` et `secteur` sont poussés dans chaque requête Prisma, seuls les résultats déjà filtrés transitent sur le réseau. Les libellés de catégorie (dupliqués jusqu'ici côté frontend) sont désormais résolus une seule fois côté serveur. `AnnuaireSection.tsx` simplifié pour consommer ce seul endpoint au lieu de 7 appels + `useMemo` de filtrage client. Bug latent découvert et documenté (pas corrigé en profondeur, juste explicité) : le code client référençait `latitude`/`longitude` sur École et Association, deux modèles qui n'ont pas ces champs en base — ces fiches n'ont jamais pu apparaître sur la carte, TypeScript côté backend l'a révélé immédiatement (le frontend, moins strict, laissait passer silencieusement).

**Vérifié en conditions réelles** : `tsc --noEmit` propre backend/frontend. API (curl + Node — recherche Actualités/Agenda avec et sans résultat, agrégation Annuaire par secteur et par texte, comptes exacts par secteur). Navigateur : recherche Actualités tapée en direct (8 fiches → 1 résultat pertinent), filtre secteur Santé sur l'Annuaire (18 → 5, requête serveur confirmée dans les logs), non-régression Tourisme (carte Leaflet réelle toujours fonctionnelle). **Incident d'outillage rencontré et résolu** : après redémarrage du serveur Next.js, `/tourisme` a répondu 404 malgré un fichier de route intact — même bug Turbopack déjà documenté en Phase 2a (route non détectée par un serveur déjà démarré), résolu par un redémarrage avec cache `.next` vidé.

**Reste ouvert, non traité dans cette phase** : `AnnuaireEntry` hors catégorie BANQUE (églises, ONG, stations-service...) reste sans filtre dédié (visible seulement sous "Toutes", même limite que le comportement client précédent) ; recherche insensible aux accents non implémentée (`contains` Postgres standard, pas d'extension `unaccent`) ; l'agrégateur ne pagine pas (acceptable au volume actuel, à revisiter si le nombre de fiches grandit significativement).

**Phase 4 — Fonctions avancées différées (partiel)**

**Envoi réel de newsletter (SMTP) ✅ livré le 2026-08-06.** Sur "vas y" répété sans réponse à la clarification sur la priorité entre newsletter/2FA/CAPTCHA — choisi car seul chantier de la Phase 4 constructible sans identifiant externe déjà indisponible dans cet environnement (contrairement à CAPTCHA qui exige une clé tierce). `utils/mailer.ts` (nodemailer) : envoi individuel par abonné (pas de champ "À" groupé, évite d'exposer la liste des abonnés entre eux), **no-op gracieux si SMTP non configuré** (5 variables optionnelles `SMTP_*` dans `env.ts`, mêmes conventions que POSTA) — le contenu est journalisé côté serveur plutôt que perdu, jamais d'échec silencieux. `POST /api/newsletter/envoyer` (admin, journalisé automatiquement par le middleware d'activité générique de la Phase 2f, aucun modèle "Campagne" dédié — décision assumée, cf. Phase 2f : envoi ponctuel, pas de moteur de campagnes planifiées/gabarits). Écran admin `/admin/newsletter` : modal sujet+message, confirmation avant envoi (irréversible), message de résultat honnête ("Envoyé à N abonné(s)" ou "SMTP non configuré : journalisé").

**Vérifié en conditions réelles** : `tsc --noEmit` propre. API (curl — refus propre si aucun abonné actif, envoi en mode no-op confirmé avec contenu réel retrouvé dans les logs serveur). Navigateur : formulaire admin ouvert et rempli avec succès ; la confirmation native `window.confirm()` avant envoi n'a pas pu être pilotée par l'outil de navigateur (limitation d'outillage documentée ailleurs sur ce portefeuille, pas un bug) — le flux d'envoi complet reste donc validé côté API/serveur (curl), pas par un clic navigateur de bout en bout. Donnée de test nettoyée après vérification.

**Bibliothèque de fichiers générique ✅ livrée le 2026-08-07.** Quatrième "vas y" consécutif sans réponse — choix assumé pour le seul item de Phase 4 restant construisible sans identifiant externe ni décision UX imposée à l'admin unique. Nouveau modèle `Document` (titre, description optionnelle, `mediaId` réutilisant le mécanisme Media déjà en place — upload PDF déjà autorisé par `upload.middleware.ts`, pas de traduction : un document officiel est déjà rédigé dans sa langue). Module backend complet (public/admin, RBAC), page publique `/documents` (liste téléchargeable, taille de fichier affichée), écran admin `/admin/documents` (upload direct ou réutilisation d'un média existant), lien ajouté au Footer ("Informations utiles") et au sitemap (Phase 5 déjà livrée).

**Vérifié en conditions réelles** : `tsc --noEmit` propre backend/frontend. API (curl — CRUD complet, cycle création/lecture publique/suppression). Navigateur : page publique rendue avec le document de test, écran admin listant correctement le document, aucune erreur console. **Incident opérationnel rencontré et résolu** : plusieurs instances backend zombies accumulées à nouveau au fil de la session (même limitation Windows/nodemon documentée en Phase 4 précédente), plus une charge CPU élevée (un projet Vite sans rapport tournant en parallèle, non touché) ayant fortement ralenti le démarrage du serveur — confirmé non bloquant une fois identifié (le serveur avait en réalité démarré, seuls mes contrôles `curl` à délai court échouaient). Donnée de test nettoyée après vérification.

**Reste, non traité** : commentaires + modération, notifications internes, gestion de menus dynamique, sauvegardes UI, sécurité avancée (2FA, liste noire IP, CAPTCHA — ce dernier nécessite une clé tierce non disponible). Hors scope tant que non redemandé.

**Phase 5 — SEO technique (partiel, livré le 2026-08-06), i18n réel et performance (non commencés)**

Jaslin a confirmé "vas y" sans trancher entre les options proposées (newsletter SMTP réelle / SEO+i18n / sécurité avancée) — décision assumée de traiter le **volet SEO technique uniquement**, seul sous-chantier ne nécessitant ni identifiants externes (SMTP, CAPTCHA) ni contenu Kreyòl à rédiger (la "traduction FR/HT effective" reste non traitée, aucune traduction fabriquée).

**Livré :** `app/robots.ts` (autorise tout sauf `/admin`, référence le sitemap) et `app/sitemap.ts` (24 pages statiques + entrées dynamiques `actualites/[id]`/`personnalites/[id]`, `fetch` server-side tolérant aux pannes — une panne backend ne fait jamais disparaître les 24 pages statiques du sitemap). `app/layout.tsx` : `metadataBase`, Open Graph/Twitter Card par défaut, et **correction d'une erreur factuelle préexistante** ("Nord-Ouest d'Haïti" alors que Gros-Morne est en Artibonite — ne touchait que le repli metadata racine, les pages qui définissaient leur propre `metadata` avaient déjà la bonne info). `generateMetadata` dynamique sur `actualites/[id]` et `personnalites/[id]` : chaque article/personnalité avait jusqu'ici exactement le même titre générique ("Actualité — ..."), remplacé par un vrai titre/description/image Open Graph par fiche (fetch server-side sur l'API publique, repli générique si l'API échoue). JSON-LD `GovernmentOrganization` sur l'accueil (coordonnées GPS déjà publiées ailleurs sur le site, converties DMS→décimal, rien d'inventé). Nouveau fichier `lib/seo.ts` (`SITE_URL` — repli explicite `localhost:3010`, **aucun domaine réel encore configuré, le site n'a jamais été déployé** — et `COMMUNE_GEO`).

**Vérifié en conditions réelles** : `tsc --noEmit` propre. Navigateur : `/robots.txt` et `/sitemap.xml` rendus et corrects (24 pages + articles), titre d'onglet dynamique confirmé sur une fiche article ("Inauguration du nouveau marché communal — ...") et une fiche personnalité ("Paul Prompt — ..."), balises `og:title`/`og:description`/`og:type` lues via JS et correctes, JSON-LD homepage valide et lu via JS. Aucune erreur console.

**Reste : i18n réel** (traduction FR/HT effective sur tout le site — le sélecteur HT de la Navbar reste décoratif) **et performance** (cache, optimisation mobile), non traités — nécessitent soit du vrai contenu Kreyòl à rédiger avec Jaslin, soit un profilage dédié, hors scope de cette session.

Statut : phasage initial proposé le 2026-07-28, validé par Jaslin. **Phase 0 livrée et vérifiée le 2026-07-28** (détail dans `context/HISTORY.md`). **Phase 1 élargie livrée et vérifiée le 2026-07-28**, sur demande explicite de Jaslin avec deux maquettes de référence : refonte visuelle complète (header top-bar + méga-menu, hero avec carte de statistiques flottante, bandeau newsletter, footer 5 colonnes) + construction des 14 pages restantes du cahier des charges — soit la totalité des 20 sections désormais présentes côté frontend, **restées statiques** (câblage réel reporté aux phases 2a-2f). **Phasage 2a-2f/3/4/5 réactualisé le 2026-07-28 (même jour, suite)** après réception du cahier des charges enrichi (28 modules admin + ~35 tables) et audit confirmant qu'aucune des entités métier proposées n'existe encore côté backend — détail complet dans `context/HISTORY.md`. **Phase 2f livrée le 2026-08-06** : la totalité de la Phase 2 (2a-2f) est désormais close. **Phase 3 livrée le même jour** (recherche/filtres serveur réels + carte interactive sur Annuaire/Tourisme/Actualités/Agenda, détail ci-dessus). **Reste : Phase 4** (commentaires/modération, notifications internes, envoi réel de newsletter, 2FA...) et **Phase 5** (SEO technique, i18n réel, performance), non commencées, hors scope tant que non redemandées.

## Comment lancer le projet en local

```
# Backend (port 4010)
cd backend
npm install          # si pas déjà fait
npm run dev

# Frontend (port 3010)
cd frontend
npm install           # si pas déjà fait
npm run dev
```

Prérequis : PostgreSQL local (base `gros_morne`, `backend/.env` non commité — copier `.env.example` et renseigner `DATABASE_URL`/secrets JWT). Compte admin de démonstration : `admin@grosmorne.ht` / `GrosMorne@123` (modifiable via `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` avant `npm run db:seed`). Interface admin : `http://localhost:3010/admin/login`.
