# REMED — Gestion de pharmacie

SaaS générique de gestion de pharmacie (pas de client identifié pour l'instant). Stack du portefeuille : Express 4 + TypeScript + Prisma + PostgreSQL (backend) / Next.js App Router (frontend).

**Ports :** 4011 (backend) / 3013 (frontend) — voir `.claude/launch.json` (`remed-backend`, `remed-frontend`).

**Cahier des charges (2026-08-10, suite) :** Jaslin a fourni un cahier des charges très détaillé (46 sections, stack NestJS/MySQL/React+Vite/shadcn, architecture multi-pharmacie, RBAC granulaire). Conflit direct avec ce qui existait déjà (Phase 0 livrée le même jour sur Express/PostgreSQL/Next.js). Clarifié avec Jaslin (AskUserQuestion) : **on continue sur la stack déjà construite et vérifiée**, ce cahier des charges devient la source fonctionnelle enrichie à intégrer dans les phases suivantes, pas un redémarrage. Ce document est la version fusionnée : stack et fondations REMED existantes + portée fonctionnelle du cahier des charges.

---

## Décisions d'architecture prises en fusionnant les deux

| Sujet | Décision | Pourquoi |
|---|---|---|
| Stack backend | Express 4 (pas NestJS) | Déjà construit, vérifié, cohérent avec BANKA/GESCOM/LAKAY/POSTA/ANTENN/SHOPAY... (seul NEXORA est en NestJS, par choix explicite de Jaslin sur ce projet précis) |
| Base de données | PostgreSQL (pas MySQL) | Déjà provisionnée, cohérente avec la majorité du portefeuille |
| Frontend | Next.js App Router (pas React+Vite+shadcn) | Déjà construit, vérifié, cohérent avec le reste du portefeuille |
| RBAC | **Rôles enum fixes** (5 rôles), pas un moteur de permissions granulaire (`products.create`, `sales.cancel`...) | Décision déjà prise et documentée sur NEXORA dans ce même portefeuille (« rôles en enum Prisma fixe, pas de moteur RBAC générique ») ; suffisant pour 5 rôles métier fixes, un moteur générique serait de la sur-ingénierie tant qu'aucun client ne demande des permissions à la carte |
| Multi-pharmacie | Modèle `Pharmacie` ajouté **maintenant** (avant Phase 1), toutes les tables opérationnelles scopées par `pharmacieId` | Retrofit coûteux si fait plus tard (leçon tirée de SHOPAY/NEXORA où le scoping tenant a été pensé dès le premier modèle) ; la Phase 0 n'a que 2 modules à migrer, encore peu coûteux |
| Tests automatisés | Repoussés en fin de plan, à la demande | **Aucun projet du portefeuille n'a de tests automatisés à ce jour** (pattern documenté et récurrent) ; les ajouter sur REMED serait un écart notable d'effort par rapport à la pratique actuelle — signalé ici pour que Jaslin tranche explicitement le moment venu plutôt que de le découvrir en fin de projet |
| Docker | Repoussé, à la demande | Le portefeuille ne containerise pas le dev (Postgres/MySQL tourne en local), déploiement direct en prod (Vercel/Railway/Firebase selon projet) — seul NEXORA utilise `docker-compose` pour Postgres+pgvector. À revisiter si REMED doit être livré à un client tiers auto-hébergé. |
| Devises multiples (HTG/USD/EUR) | Repoussé après le cœur métier (Phase 1-5) | Aucun projet du portefeuille n'a eu ce besoin réel jusqu'ici (tout est en HTG) ; ajouté au schéma quand un vrai besoin se présente plutôt qu'en spéculatif |

---

## Phase 0 — Socle (livrée le 2026-08-10)

- Auth JWT (access 15 min + refresh 30j en cookie httpOnly, haché SHA-256 en base, rotation à chaque refresh) + RBAC 5 rôles (`SUPER_ADMIN`, `GERANT`, `PHARMACIEN`, `VENDEUR`, `MAGASINIER`)
- Schéma Prisma du domaine (produits, lots/péremption, mouvements de stock, fournisseurs, commandes d'achat, ventes, ordonnances, caisse, audit log)
- Module **Produits & Catégories** : CRUD complet, DCI/dosage/forme pharmaceutique, drapeaux `necessiteOrdonnance`/`substanceControlee`, seuil d'alerte
- Module **Stock** : entrée de stock par lot (numéro de lot + date de péremption), ajustement (compare-and-swap anti-concurrence), journal des mouvements append-only, alertes stock bas + péremption (< 90 jours configurable)
- Module **Fournisseurs** : CRUD simple
- Dashboard : valeur du stock, produits en alerte, lots proches péremption, fournisseurs actifs
- Frontend : login, sidebar/header, pages Tableau de bord / Produits / Stock / Fournisseurs, design system teal clinique dédié
- **Vérifié en conditions réelles** : `tsc --noEmit` propre, API testée au curl, navigateur (Playwright). Comptes seed : `admin@remed.ht` / `ChangeMoi123!` (SUPER_ADMIN), `pharmacien@remed.ht` / `Pharmacien123!` (PHARMACIEN), `vendeur@remed.ht` / `Vendeur123!` (VENDEUR)

## Phase 0.5 — Multi-pharmacie (livrée le 2026-08-10)

- Modèle `Pharmacie` (nom, adresse, téléphone, email, NIF, devise, préfixe facture, seuil péremption par défaut)
- `pharmacieId` ajouté sur les tables « propriétaires » : `Utilisateur`, `Categorie`, `Produit`, `Fournisseur`, `CommandeAchat`, `Vente`, `CaisseSession` — résolu depuis le token JWT vérifié côté serveur, jamais depuis un paramètre client (même garde que SHOPAY `resolveBoutique`). Les tables enfant (`LotProduit`, `MouvementStock`, `LigneVente`, `LigneCommandeAchat`, `Ordonnance`) héritent du scope via leur parent, sans colonne redondante — même principe que SHOPAY (`OrderItem` sans `boutiqueId`)
- Contraintes d'unicité repensées par pharmacie : `Categorie.nom`, `Produit.codeBarres`, `CommandeAchat.numero`, `Vente.numero` sont désormais uniques **par pharmacie**, plus globalement
- Base de dev réinitialisée (aucune donnée réelle perdue, seed re-rejoué avec la pharmacie `Pharmacie Centrale REMED`)
- **Vérifié en conditions réelles** : `tsc --noEmit` propre des deux côtés, API re-testée (login incluant `pharmacieId` dans le JWT, produits/fournisseurs/catégories/stock/dashboard tous scopés). **Test d'isolation cross-tenant qui mord** : une deuxième pharmacie de test créée avec son propre admin — liste produits/fournisseurs vide, lecture d'un produit de l'autre pharmacie par ID → 404, tentative d'ajustement sur un lot d'une autre pharmacie → 404, dashboard à zéro. Pharmacie de test supprimée après vérification. Navigateur réel (Playwright) : login + dashboard toujours fonctionnels après la migration.
- Une hiérarchie Organisation → plusieurs Pharmacies (au-delà du scope simple actuel) reste volontairement non modélisée tant qu'aucun client réel n'a plus d'une pharmacie

## Phase 1 — Ventes / Point de vente (livrée le 2026-08-10)

- Modèle `Client` (nom, prénom, téléphone, email, adresse, date de naissance, sexe, notes) + historique des 20 dernières ventes sur la fiche
- POS (`/ventes`) : recherche produit (douchette USB = clavier, fonctionne telle quelle), panier avec quantités +/-, sélection client optionnelle (ou « client de passage »), remise globale, sélection/ajout de modes de paiement
- Décrément du stock **FEFO** (First-Expired-First-Out) réellement implémenté avec **répartition automatique sur plusieurs lots** si un seul lot ne suffit pas (`vente.service.ts::consommerFefo`), chaque lot consommé protégé par compare-and-swap comme l'ajustement de stock
- Blocage effectif (400) si le panier contient un produit `necessiteOrdonnance` sans bloc ordonnance rempli (médecin/patient/date) ; le formulaire d'ordonnance n'apparaît dans l'UI que si nécessaire
- Modèle `Paiement` (mode ESPECES/CARTE/VIREMENT/CHEQUE/MOBILE_MONEY/CREDIT/AUTRE, montant) séparé de `Vente` : paiement scindé possible (plusieurs lignes), somme validée serveur contre le total (tolérance 0,01)
- `CaisseSession` enrichie de `CaisseTransaction` (append-only, seules les ventes réglées en ESPECES l'alimentent — carte/mobile money ne touchent jamais le tiroir physique) ; ouverture bloque toute vente tant qu'aucune caisse n'est ouverte pour la pharmacie ; fermeture calcule `soldeTheorique` (ouverture + entrées − sorties) et `ecart` (montant compté − théorique)
- **Annulation de vente** (pas de suppression) : restitue la quantité exacte sur le lot d'origine, trace un mouvement `ANNULATION_VENTE`, contre-passe la transaction de caisse si un volet espèces existait — réservée aux rôles de gestion (SUPER_ADMIN/GERANT/PHARMACIEN), pas au vendeur lui-même
- Reçu affiché à l'écran après chaque vente (numéro, lignes, total) ; facture PDF imprimable repoussée (pas bloquant pour un POS fonctionnel, ajoutée si Jaslin la demande)
- **Vérifié en conditions réelles** : `tsc --noEmit` propre des deux côtés. API (curl, cycle complet) : blocage 400 sans ordonnance puis vente acceptée avec ordonnance (stock du bon lot 40→35), paiement scindé espèces+carte, rejet 400 si somme des paiements ≠ total, RBAC 403 sur un VENDEUR tentant d'annuler (mais autorisé à vendre), annulation restituant le stock (35→40 après annulation du lot amoxicilline) avec double-annulation refusée, fermeture de caisse avec écart correctement calculé (vérifié à la transaction près : ouverture 1000 + ventes espèces − contre-passation de l'annulation = solde théorique exact), blocage de toute vente hors session de caisse ouverte. **Navigateur réel (Playwright)** : ouverture de caisse, recherche produit avec badge "Ordonnance", ajout au panier, remplissage du bloc ordonnance apparu automatiquement, total calculé en direct, finalisation, reçu affiché, stock recalculé visible sur `/produits` (40→39), fermeture de caisse avec retour à l'état "aucune caisse ouverte". Base remise à l'état seed propre après chaque vérification.

### Facture / reçu PDF 80mm (livré le 2026-08-12, demande explicite de Jaslin)

- `backend/src/utils/facture.pdf.ts` (pdfkit) : ticket thermique 80mm (226,77pt de large exactement), hauteur calculée dynamiquement au contenu (rendu une première fois dans un document jetable pour mesurer `doc.y`, puis rendu réel à la taille exacte — PDFKit ne permet pas de redimensionner une page après création)
- `GET /api/ventes/:id/facture.pdf` (inline, s'ouvre dans un nouvel onglet prêt à imprimer/télécharger)
- Bouton "Imprimer la facture (80mm)" sur le reçu affiché après une vente + icône imprimante sur chaque ligne de "Ventes récentes" (`/ventes`)
- **Vérifié en conditions réelles** : PDF téléchargé au curl, en-tête `%PDF-1.3` valide, `Content-Type: application/pdf`, `MediaBox [0 0 226.771654 157.720274]` confirmant exactement 80mm de large et une hauteur ajustée (pas de grand vide pour un petit reçu). Bouton cliqué en navigateur réel, requête réseau confirmée 200 OK (l'onglet popup lui-même n'est pas traçable par l'outil de test, limitation d'outillage déjà documentée ailleurs sur le portefeuille pour les popups `window.open`/`wa.me`).

## Phase 2 — Achats / Fournisseurs (livrée le 2026-08-12)

- Commande d'achat (brouillon → envoyée → reçue partielle/complète), réception ligne par ligne créant automatiquement une entrée de stock (réutilise `stock.service.entree`)
- Page `/achats` : création multi-lignes, envoi au fournisseur, réception avec numéro de lot + date de péremption par ligne, annulation (bloquée dès qu'une réception a eu lieu, même partielle)
- **Vérifié en conditions réelles** : cycle complet au curl (création → envoi → réception partielle 30/50 → réception complète 20/50 → statut `RECUE_COMPLETE`), sur-réception au-delà de la commande déjà close refusée, lot cumulé correctement (même numéro de lot upserté). Navigateur réel : liste et détail rendus, quantités commandé/reçu affichées correctement.
- Paiement fournisseur (via le modèle `Paiement` partagé) : **repoussé**, aucun besoin réel exprimé pour l'instant — les achats REMED sont réglés hors système à ce stade

## Phase 3 — Ordonnances (upgrade du modèle simple de la Phase 0)

- `Ordonnance` enrichie : statut (`ENREGISTREE` / `PARTIELLEMENT_SERVIE` / `SERVIE` / `ANNULEE`), pièce jointe (image/PDF, upload disque local façon REYINYON/gros-morne)
- `PrescriptionItem` : médicament, dosage, posologie, durée, quantité prescrite, instructions
- Workflow vente sur ordonnance : vérification du statut du produit → ordonnance requise → sélection/création → association à la vente → délivrance enregistrée (quantité servie vs prescrite, pour gérer le service partiel)
- **Non traitée** : le modèle simple de la Phase 0/1 (médecin/patient/date, sans statut ni pièce jointe) reste en place, suffisant pour bloquer une vente sans ordonnance ; l'upgrade complète (statut de délivrance partielle, pièce jointe) n'a pas été demandée explicitement et modifierait un flux de vente déjà vérifié — repoussée pour ne pas risquer une régression sans besoin confirmé

## Phase 4 — Caisse & Finance (Dépenses et Retours livrés le 2026-08-12)

- `Depense` (catégorie : loyer/électricité/internet/transport/salaires/fournitures/maintenance/autres, montant, description, date, mode de paiement). Une dépense en ESPECES exige une caisse ouverte et crée automatiquement une `CaisseTransaction` SORTIE_MANUELLE — pas de double comptabilité, `caisse.service.fermer` reste la seule source de vérité pour le solde théorique
- `Retour` + `RetourItem` (RETOUR_CLIENT / RETOUR_FOURNISSEUR / PRODUIT_ENDOMMAGE / PRODUIT_EXPIRE / ERREUR_VENTE), chaque retour génère le mouvement de stock adéquat (nouveau `TypeMouvementStock.RETOUR_CLIENT`, symétrique de `RETOUR_FOURNISSEUR` déjà existant) ; sens du mouvement (+/-) dérivé du type, jamais saisi par le client ; sorties protégées par compare-and-swap (jamais de stock négatif)
- Pages `/depenses` (liste + total affiché + création) et `/retours` (liste + création multi-lignes avec sélection de lot)
- **Vérifié en conditions réelles** : dépense espèces refusée sans caisse ouverte puis acceptée caisse ouverte, fermeture de caisse avec solde théorique exact (ouverture 1000 − dépense 500 = 500, écart 0) ; retour client +5 puis produit endommagé -3 sur le même lot (40→42→39 attendu, confirmé 42 après le retour +5 puis re-vérifié après -3), sortie excessive (999) refusée en 400. Navigateur réel : deux pages rendues avec les données créées au curl, badges de couleur corrects par type.
- **Non traité** : rapport de fermeture de caisse formalisé (le calcul existe déjà dans `caisse.service.fermer`, un écran dédié n'a pas été demandé)

## Phase 5 — Inventaire (livrée le 2026-08-12)

- `Inventaire` (complet ou partiel) + `InventaireItem` (quantité théorique figée à la création, quantité réelle saisie, motif). Validation génère les mouvements `AJUSTEMENT_POSITIF`/`AJUSTEMENT_NEGATIF` correspondants (réutilise `stock.service.ajuster`, même compare-and-swap que le reste du portefeuille)
- Page `/inventaire` : création (complet ou sélection de lots), saisie des quantités réelles ligne par ligne avec écart affiché en direct, validation (réservée aux rôles de gestion) ou annulation
- **Vérifié en conditions réelles** : création d'un inventaire partiel sur 1 lot (théorique 42), validation refusée tant que la quantité réelle n'est pas saisie, saisie à 38 puis validation → `AJUSTEMENT_NEGATIF` de 4 appliqué, stock final confirmé à 38. Navigateur réel : liste et statut "Validé" affichés correctement.

## Phase 6 — Dashboard enrichi (livrée le 2026-08-12)

- CA de la période (jour/semaine/mois/année, filtre en un clic), nombre de ventes, bénéfice estimé (CA − coût marchandise vendue, approximation assumée car ignore la remise ligne à ligne), dépenses, ruptures de stock, créances (total des paiements CREDIT non réconciliés — pas de vrai module de recouvrement, juste un chiffre informatif)
- Graphiques SVG maison (skill `dataviz` chargée avant codage, pas de nouvelle dépendance — décision cohérente avec OTELA ailleurs dans le portefeuille) : évolution du CA (ligne, hover crosshair + tooltip), produits les plus vendus (barres horizontales), dépenses par catégorie (barre de proportion + légende, ordre catégoriel fixe)
- Filtres période (aujourd'hui / 7 derniers jours / ce mois / cette année)

## Phase 7 — Rapports (livrée le 2026-08-12)

- Page `/rapports` à onglets : Ventes (CA, par jour, par caissier, par produit, par catégorie), Stock (valeur, ruptures, stock bas, péremptions, mouvements récents — pas de filtre période, c'est un état instantané), Achats (par fournisseur, montant commandé vs reçu), Finance (CA, dépenses, bénéfice estimé, historique des sessions de caisse avec écart)
- Export **CSV** pour Ventes/Stock/Achats (générateur maison sans dépendance, BOM UTF-8 pour Excel — même philosophie qu'ASSOCOTISE ailleurs dans le portefeuille). **Export PDF/Excel non fait** : la facture 80mm couvre déjà le seul besoin PDF exprimé, et aucune demande n'a été faite pour un export Excel — CSV suffit pour tout usage tableur

## Phase 8 — Notifications (livrée le 2026-08-12)

- Table `Notification` (stock bas, péremption proche, commande réceptionnée), consultable et marquable lue, cloche dans le header avec badge de compteur (rafraîchi toutes les 60s) et dropdown
- **Pas de scheduler** (aucun projet du portefeuille n'en a) : synchronisation paresseuse à chaque lecture de la liste plutôt qu'un cron. Déduplication sur une **fenêtre de 24h** (pas seulement "non lue") — un bug réel a été trouvé et corrigé en vérifiant le scénario "tout marquer lu" : la déduplication initiale ne regardait que les notifications non lues, donc la synchronisation suivante recréait aussitôt une notification pour une alerte toujours vraie (stock resté bas), annulant silencieusement l'action de l'utilisateur
- Architecture prête pour un canal email/SMS futur — non branché tant qu'aucun besoin réel ne se présente

## Phase 9 — Sécurité & Audit renforcés (livrée le 2026-08-12)

- **Verrouillage de compte** après 5 tentatives de connexion échouées (30 minutes), au-delà du rate limiting déjà en place sur la route (qui protège une IP, pas un compte précis) — pattern déjà documenté sur ACADÉMIE ailleurs dans le portefeuille. Compteur remis à zéro sur connexion réussie. Verrouillage tracé dans `AuditLog` (`VERROUILLAGE_COMPTE`)
- **Couverture `AuditLog` élargie** : audit trouvé manquant sur la création de catégorie (`categorie.routes.ts`), corrigé — sinon la couverture était déjà quasi complète (toute action de création/modification/suppression à travers les modules déjà construits appelle `logAudit`, vérifié module par module)
- **Revue RBAC** : matrice cohérente confirmée à travers tous les modules (`requireVente` pour le POS, `requireStock` pour les opérations d'entrepôt, `requireGestionCatalogue` pour le financier/les ordonnances/les rapports, `requireAdmin` réservé aux paramètres) — aucun écart trouvé au-delà de l'audit de catégorie ci-dessus

## Gestion des utilisateurs (livrée le 2026-08-12, hors phasage initial)

**Contexte :** trou réel repéré après la Phase 9 — REMED avait 5 rôles (`Role` enum) et un verrouillage de compte, mais **aucun moyen pour un GERANT/SUPER_ADMIN de créer un compte employé depuis l'application** (seul le script de seed ou un accès direct à la base le permettait). Ajouté hors phasage, sur constat plutôt que sur une phase planifiée.

- CRUD comptes réservé à `requireAdmin` (SUPER_ADMIN/GERANT), page `/utilisateurs` : liste, création avec mot de passe initial fixé par l'admin (pas d'invitation par email, REMED n'a pas de SMTP configuré — même choix qu'OTELA), changement de rôle, activation/désactivation, réinitialisation de mot de passe
- **Anti-escalade de privilèges** : seul un SUPER_ADMIN peut créer/promouvoir un compte SUPER_ADMIN
- **Anti-auto-verrouillage** : un compte ne peut ni changer son propre rôle ni se désactiver lui-même
- **Garde du dernier SUPER_ADMIN** : impossible de désactiver ou rétrograder le seul SUPER_ADMIN actif restant
- Désactivation et réinitialisation de mot de passe **révoquent immédiatement les sessions actives** (suppression des refresh tokens), pas seulement un blocage au prochain login
- **Vérifié en conditions réelles** (curl + navigateur, serveur démarré réellement) : création, doublon d'email refusé (409), escalade de privilèges refusée (403 GERANT→SUPER_ADMIN), auto-modification de rôle refusée (400), auto-désactivation refusée (400), désactivation d'un tiers empêchant immédiatement sa connexion (401), reset de mot de passe fonctionnel avec nouvelle connexion réussie, RBAC 403 pour VENDEUR. Base remise à l'état seed, serveurs arrêtés (processus vérifiés absents par PID).

## Phase 10+ — Tests automatisés, Docker, multi-devises

À la demande explicite de Jaslin le moment venu (voir tableau de décisions ci-dessus) — non planifiés par défaut.

---

## Notes de conception

- La quantité en stock d'un produit n'est **jamais** stockée sur `Produit` : toujours recalculée comme la somme des `LotProduit.quantiteActuelle`, pour ne jamais pouvoir diverger du détail par lot (traçabilité péremption).
- `MouvementStock` est **append-only** (même principe qu'ASSOCOTISE/GESCOM) : chaque changement de quantité est tracé avec l'état avant/après, jamais réécrit.
- Ajustements de stock protégés par compare-and-swap (`updateMany` avec condition sur la quantité lue) pour éviter une double modification concurrente — même pattern que BANKA/GESCOM/SHOPAY.
- Aucune suppression physique des données historiques (ventes, mouvements, paiements) : annulation/statut plutôt que `DELETE`, cohérent avec ASSOCOTISE/BANKA.
- `pharmacieId` toujours résolu depuis le token JWT vérifié côté serveur, jamais depuis un paramètre client — même garde que SHOPAY (`resolveBoutique`).
