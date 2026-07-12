# Workspace History

> Journal chronologique de toutes les sessions et décisions importantes.
> Le plus récent en haut. Mis à jour automatiquement par Claude.
>
> **Comment ça marche :** Quand je lance la commande `/update` après une session importante, ou quand je raconte un changement significatif, Claude ajoute une entrée ici automatiquement. Je n'ai pas à écrire ce fichier manuellement.

---

## 2026-07-12 (suite)

### BANKA : audit sécurité approfondi (6 correctifs), architecture multi-agence centralisée, fix prêt employé/paie, module Documents/KYC

**Contexte :** sur "VERIFICATION PROFONDE" de BANKA, un agent Explore a audité le backend (le working tree contenait déjà un durcissement de sécurité non commité d'une session précédente — hachage des refresh/reset tokens, compare-and-swap sur prêts/frais/virements, RBAC agence sur la création/décaissement de prêt). L'audit a trouvé 6 failles réelles supplémentaires, toutes corrigées et vérifiées : mass assignment sur les créations RH (`createEmploye`/`createPoste`/`createContrat`/`createConge` sans schéma Zod, un `compteId` arbitraire aurait pu détourner le virement de salaire d'un employé), double paiement de salaire possible (`payerSalaires`/`annulerAvance` sans compare-and-swap sur le statut), épargne programmée accessible à n'importe quel rôle authentifié (`epargne-programme.routes.ts` sans `requireRole`) et sans CAS sur le débit, RBAC agence absent sur remboursement de prêt/ouverture de compte/caisse/garanties/mandats, `commKey` des pointeuses biométriques stockée et comparée en clair (hashée SHA-256 + comparaison en temps constant depuis).

**Ensuite, Jaslin a fourni un second prompt** (roadmap de 15 fonctionnalités proposées par son client pour BANKA : RSE, prêts employés/paie, statut compte lié au prêt, rapprochement caisse et bancaire, chèques, PCD, documents/KYC, clôture comptable, multi-agence centralisée, backup, interbancaire, export compta, API externes, messagerie interne). Consigne explicite du prompt : auditer avant de coder. Un agent Explore a déterminé pour chacun des 15 points ce qui existe déjà vs ce qui manque réellement (résultat détaillé dans la conversation, pas reporté ici en entier) — verdict marquant : le point "prêts employés + paie" n'était pas manquant mais **buggé** (voir plus bas), et le rapprochement caisse quotidien s'est retrouvé livré comme effet de bord du chantier multi-agence. Jaslin a laissé Claude choisir l'ordre de priorité puis le point à traiter ; **multi-agence centralisée** choisi en premier, discuté en profondeur (3 décisions de conception tranchées par Claude à la demande de Jaslin) puis planifié (EnterPlanMode) avant codage.

**Multi-agence centralisée — livré :**
- `Transaction.agenceExecutionId` (nullable) sur les 14 points de création de transaction du backend, résolu depuis la session de caisse, l'agence de l'utilisateur exécutant, ou l'agence du compte selon le contexte (jamais de nouvelle fonction partagée pour si peu de sites d'appel).
- Nouveau modèle `CaisseAgence` (solde de cash persistant par agence et par devise, HTG uniquement pour cette tranche) : remplace le solde de session saisi librement — l'ouverture de caisse reprend désormais automatiquement le cash constaté à la dernière fermeture. Dépôts/retraits l'incrémentent/décrémentent en temps réel (compare-and-swap), un virement ne le touche jamais (pas de cash physique déplacé).
- Plafond d'alerte par agence (`CaisseAgence.plafondAlerte`) : ne bloque jamais un dépôt, déclenche une alerte SSE ; en revanche un retrait est bloqué si le cash de l'agence est insuffisant, **indépendamment** du solde du compte client.
- Nouveau module `tresorerie.service.ts`/`.routes.ts`/`.controller.ts` : transferts de trésorerie inter-agences (envoi/confirmation de réception/annulation avec restitution), `agenceId = null` représentant le siège (convention déjà utilisée ailleurs dans BANKA pour `Employe.agenceId`), pas d'écriture comptable classique (le plan comptable BANKA est consolidé au niveau banque, un seul compte 5700 Caisse). RBAC : siège réservé aux admins, sinon l'agent doit être source ou destination du transfert.
- **Bug trouvé en testant un vrai cycle complet** (pas en lisant le code) : l'écart calculé à la fermeture de session ignorait les transferts de trésorerie survenus pendant la session (recalcul séparé sur les seules transactions DEPOT/RETRAIT). Corrigé : l'écart compare désormais le comptage physique au solde `CaisseAgence` actuel, qui intègre déjà tous les mouvements de cash.
- Frontend : plafond configurable sur la fiche agence (avec affichage du cash actuel et alerte visuelle si dépassé), page caisse simplifiée (plus de saisie libre du solde d'ouverture), nouvelle page `/tresorerie`.
- **Vérifié en conditions réelles** : API (curl) — plafond franchi puis alerte, retrait refusé avec message clair pour cash agence insuffisant alors que le compte client a largement de quoi, transfert siège↔agence avec confirmation et restitution après annulation, RBAC confirmé (403 sur transfert siège pour un non-admin, 403 sur confirmation de réception par la mauvaise agence), écart de fermeture à 0 puis avec justification. Navigateur (Playwright) : les 3 pages rendent avec les vraies données, aucun crash. `tsc --noEmit` propre des deux côtés.
- **Hors périmètre assumé, documenté :** USD non couvert par le plafond, salaires payés en espèces non raccordés au solde de caisse persistant.

**Fix bug prêt employé/paie :** `FichePaie` n'avait aucun `pretId` — la retenue calculée à la génération de paie (`creditDeduit`) n'était jamais répercutée sur `Pret.resteARegler`/`montantRembourse`, le prêt et la fiche de paie divergeaient silencieusement. Corrigé : nouveau champ `FichePaie.pretId`, nouvelle fonction `pret.service.ts::appliquerRetenueSalariale()` (même logique que `enregistrerRemboursement` mais sans toucher de compte bancaire, l'argent ne transitant jamais par un compte pour une retenue sur salaire), appelée dans la même transaction que `payerSalaires`. **Bug supplémentaire trouvé en testant réellement** : un prêt tout juste décaissé reste `DECAISSE` (pas encore `EN_COURS`, transition qui n'a lieu qu'au premier remboursement) — `genererFichesPaie` ne cherchait que les prêts `EN_COURS`, donc la toute première retenue d'un prêt neuf n'était jamais appliquée. Élargi aux statuts `DECAISSE/EN_COURS/EN_RETARD`. Vérifié en conditions réelles (prêt de test décaissé, fiche générée puis payée, `Pret.resteARegler` et statut mis à jour correctement, `RemboursementPret` de type `RETENUE_SALAIRE` créé avec la bonne ventilation capital/intérêt).

**Module Documents/KYC (point 8 de la roadmap) :** `multer` était déjà en dépendance mais jamais utilisé dans le code. Nouveau modèle `Document` (type, fichier, date d'expiration, statut ACTIF/EXPIRE/ARCHIVE), upload local sur disque servi via `/uploads` (même pattern que ANTENN), Cross-Origin-Resource-Policy relâché uniquement sur ce chemin précis plutôt que globalement dans `helmet()` — pour ne pas affaiblir la protection du reste d'une API bancaire. Job quotidien d'expiration (`jobs/documentsExpiration.ts`, pattern `setInterval` déjà utilisé ailleurs dans BANKA). UI intégrée à la fiche client (upload, liste, suppression). Vérifié en conditions réelles : upload API et navigateur réels, rejet propre d'un format non supporté et d'une date d'expiration passée, fichier bien servi puis bien supprimé du disque à la suppression, expiration simulée et confirmée (statut basculé `EXPIRE`).

**Reste à faire (documenté, pas codé) :** 11 des 15 points de la roadmap client (RSE, statut compte lié au prêt, rapprochement bancaire BRH, chèques, PCD, clôture comptable, backup infra, interbancaire, export compta, API externes, messagerie interne) — priorités et complexités déjà évaluées, à reprendre dans une prochaine session. Tests automatisés toujours absents. **Rien commité en git à ce stade.**

---

## 2026-07-12

### OTELA : module Gestion des Employés livré

**Contexte :** Jaslin a posé une question produit ("est-ce que le système donne la possibilité de gérer les employés ? et pour les clients ne réservant pas une nuit complète ?"). Audit confirmant un vrai manque côté employés (aucun écran de création, seuls les comptes du seed existaient). Jaslin a choisi de traiter les deux chantiers proposés (gestion des employés, tarif day-use) l'un après l'autre plutôt qu'en parallèle. Ce module est le premier des deux — plan écrit et validé (EnterPlanMode) avant codage.

**Livré :** backend `modules/employes/` (service portant tout le cloisonnement/anti-escalade — jamais dans le routeur — controller, routes montées sous `/api/employes`), frontend `stores/employesStore.ts`, `components/employes/EmployeModal.tsx`, page `/employes` (table + création + désactivation/réactivation + réinitialisation de mot de passe inline), lien Sidebar ajouté aux deux niveaux d'admin. Détails de sécurité et de vérification consignés dans `context/CONTEXT.md` (entrée OTELA).

**Incident notable pendant la vérification navigateur :** le backend s'est arrêté de façon inattendue entre deux étapes de vérification (processus tombé, cause non investiguée — probablement lié à la persistance limitée des process détachés dans cet environnement plutôt qu'à un bug du code) ; détecté via un health-check qui échouait, résolu par un simple redémarrage sans perte de données (tokens JWT expirés entre-temps, ré-authentification suffisante). À garder en tête pour les sessions futures : toujours re-vérifier `/health` avant de conclure qu'un test navigateur qui échoue est un vrai bug.

**Prochaine étape validée par Jaslin, pas encore commencée :** tarif day-use pour les clients qui ne réservent pas une nuit complète (quelques heures plutôt qu'une nuitée). Nécessitera son propre plan (EnterPlanMode).

---

## 2026-07-11 (suite 3)

### REYINYON : chat enrichi — photos et messages vocaux

**Contexte :** Jaslin a demandé si le chat pouvait envoyer des photos et de l'audio (comme LAKAY/SYGS-IMFP). Ajouté sur le même principe que le reste du portefeuille (upload disque local via multer, 10 Mo max), pas de stockage objet externe.

**Livré :**
- `MessageChat.type` (TEXTE/PHOTO/AUDIO) + `urlFichier`, `contenu` devenu optionnel (légende uniquement pour PHOTO/AUDIO).
- Backend : `POST /reunions/:code/messages/media` (multipart, multer, filtre MIME image/audio uniquement, erreurs de validation correctement renvoyées en 422 plutôt qu'en 500 générique), servi via `/uploads/chat` (même principe que `/recordings` pour l'enregistrement — hors de `backend/src`, non surveillé par tsx watch).
- Frontend `ChatPanel.tsx` : bouton photo (input fichier caché), bouton micro (MediaRecorder — clic pour démarrer/arrêter, upload automatique à l'arrêt), rendu par type (image cliquable en taille réelle, lecteur audio natif `<audio controls>`). Diffusion en direct inchangée (le message persisté, avec son `urlFichier`, est rediffusé sur le data channel LiveKit existant).

**Vérifié en conditions réelles (API)** : upload photo réel (fichier PNG confirmé identique une fois re-téléchargé, taille en octets égale), apparition dans l'historique, rejet propre (422) d'un type de fichier non autorisé, acceptation d'un type audio (`audio/webm`). **Non testé** : la capture micro réelle dans un navigateur — bloquée dans ce sandbox de vérification (même limite que pour le test vidéo/audio de la réunion elle-même) — le chemin backend étant strictement identique entre photo et audio (même fonction, même validation, même stockage), la partie serveur est considérée fiable ; seule la capture `MediaRecorder` côté navigateur reste à confirmer par Jaslin. `tsc --noEmit` propre des deux côtés.

---

## 2026-07-11 (suite 2)

### OTELA : extension 5 étoiles tranche 4 livrée — Room Service

**Contexte :** sur "continue" après la tranche 3, Room Service était le seul module de l'extension resté hors des deux tranches précédentes et absent de la phrase de séquencement finale du document ("...puis Spa, puis les modules plus simples..., puis Événementiel et Fidélité en dernier") — mais bien présent dans sa liste numérotée de modules, juste après Restaurant/Bar. Traité comme sa propre tranche plutôt que regroupé avec les 4 modules "simples" de la tranche précédente, car sa complexité réelle (catalogue partagé, cycle de vie commande avec passage en cuisine) est plus proche de Restaurant/Bar. Plan écrit et validé (EnterPlanMode) avant codage.

**Décision d'architecture centrale, documentée dans le plan avant codage :** le document dit que Room Service "peut réutiliser le menu du restaurant principal" — réutilisation du **catalogue** `MenuItem`, pas nécessairement du modèle `Commande`/`Table`. `Commande` est structurée autour d'une `Table` (`tableId` obligatoire) appartenant à un `PointDeVente` ; Room Service n'a ni table ni point de vente, seulement une `Chambre`. Rendre `Commande.tableId` optionnel et ajouter un `chambreId` alternatif aurait cassé la résolution d'établissement déjà écrite et vérifiée dans `restaurant.service.ts` (toutes ses fonctions — `trouverCommande`, `listCommandesCuisine`, etc. — résolvent l'établissement via `table.pointDeVente.etablissementId`) pour un gain de réutilisation marginal. Décision : nouveau modèle **parallèle** `CommandeRoomService`/`LigneCommandeRoomService`, scopé à `chambreId`, référençant le même `MenuItem` (catalogue partagé comme demandé) et réutilisant le même enum `StatutCommande` — pour que les commandes room service apparaissent naturellement aux côtés des commandes restaurant sur l'écran cuisine déjà construit, sans dupliquer sa logique de statut.

**Différence de flux explicite dans le document, plus simple que Restaurant/Bar :** "Commande automatiquement rattachée au folio de la chambre (pas de choix de paiement direct — le client est forcément résident)." `cloturerCommande` ici n'a donc **qu'un seul chemin** (toujours au folio), contrairement à `restaurant.service.ts::cloturerCommande()` qui gère à la fois le folio et le paiement direct pour les clients de passage.

**Livré :** backend `modules/room-service/` (`ouvrirCommande`, `ajouterLigne`, `envoyerEnCuisine`, `marquerLivree`, `cloturerCommande` — toujours via `getFolioOuvertParChambreId` déjà écrite en tranche 3, poste une `LigneFolio` département `ROOM_SERVICE` déjà dans l'enum depuis la tranche 1 — `listCommandesCuisine`), RBAC `SERVEUR`+admin établissement (même personnel que Restaurant/Bar, même cuisine). Frontend : page `/room-service` (sélection d'une chambre occupée, même sélecteur de menu que `/pos` mais un seul bouton de clôture "Facturer au folio de la chambre", pas de choix) ; `/cuisine` étendue pour fusionner l'affichage des commandes restaurant et room service côte à côte, avec un badge "Room service" distinguant les deux types ; aucune modification de `FactureModal` nécessaire.

**Vérifié en conditions réelles :**
- API (curl) : cycle complet ouverture → ajout d'un article depuis le catalogue existant → envoi en cuisine → livraison → clôture, avec `Facture.montantTotal` passée précisément de 7150 à 8100 HTG (plat à 950 HTG).
- Navigateur (Playwright) : connexion serveur, commande réelle via le formulaire, apparition sur `/cuisine` avec le badge "Room service" aux côtés d'éventuelles commandes restaurant, marquage livrée, une seconde commande menée jusqu'à la facturation au folio dans la même session modale, ligne "Room service" visible dans `FactureModal`. **Incident de vérification (pas un bug produit)** : deux lectures du texte de la page dans le script de test ont capturé un état "non visible" avant que le fetch asynchrone de `/cuisine` n'ait fini de se résoudre (course avec le `waitForTimeout` du script) ; vérifié directement en base de données que les deux commandes avaient bien atteint les statuts `SERVIE` et `PAYEE` attendus, confirmant que le script de vérification était en cause, pas l'application.
- `tsc --noEmit` propre backend et frontend. Base de données remise à un état de seed propre après vérification, serveurs arrêtés.

**Bilan de l'extension 5 étoiles à ce stade : 7 des 9 modules numérotés du document livrés** (Restaurant/Bar, Spa, Minibar, Blanchisserie, Conciergerie, Voiturier, Room Service — plus le socle Folio, qui les relie tous). **Reste à faire (documenté, pas codé, hors périmètre) :** Phase 4 du cœur PMS (channel manager), réservation spa en ligne côté site public, Événementiel/Banquets et Programme de fidélité — ces deux derniers volontairement en dernier selon l'ordre du document, leur logique (devis séparé pour l'un, programme transversal à toute la chaîne pour l'autre) étant trop différente des modules déjà livrés pour être mélangée. Tests automatisés toujours absents. Jamais commité en git à ce stade.

---

## 2026-07-11 (suite)

### OTELA : extension 5 étoiles tranche 3 livrée — Minibar, Blanchisserie, Conciergerie, Voiturier

**Contexte :** sur "VAS Y" après un point de situation explicite avec Jaslin ("EST CE TERMINÉ ?" — réponse : non, cœur PMS complet mais 7 des 9 modules de l'extension restaient), poursuite dans l'ordre du document : "...puis les modules plus simples (minibar, blanchisserie, conciergerie, voiturier), puis Événementiel et Fidélité en dernier." Les 4 modules "plus simples" traités ensemble en une seule tranche, contrairement à Restaurant/Bar et Spa traités séparément — le document lui-même les qualifie de plus simples, et leur complexité réelle (CRUD scopé à une chambre, pas de calendrier de créneaux ni de notion de table) confirme que le regroupement était justifié. Plan écrit et validé (EnterPlanMode) avant codage.

**Principe commun, réutilisation de l'infrastructure folio existante :** nouvelle fonction `folios.service.ts::getFolioOuvertParChambreId()` (variante directe de `getFolioOuvertParNumeroChambre` déjà écrite pour Restaurant/Spa — ces 4 modules connaissent déjà la `chambreId`, pas besoin du détour par un numéro saisi). Toujours `ajouterLigneFolio()`/`recalculerStatutPaiement()` pour la facturation, jamais de système parallèle.

**Trois logiques de facturation différentes selon le module, documentées dans le plan avant codage :**
1. **Minibar** : facture immédiatement à chaque constat (`ConsommationMinibar` posée par le ménage lors du contrôle de chambre → `LigneFolio` directe, département `MINIBAR`).
2. **Blanchisserie** : facture automatiquement au passage du statut à `LIVREE` (service rendu, pas juste demandé) — même logique que la clôture d'une commande restaurant ou d'un rendez-vous spa.
3. **Conciergerie** et **Voiturier** : facturation strictement optionnelle, un `montant` fourni ou non à la clôture — reprend mot pour mot la formulation du document ("pas de logique financière complexe, **sauf si** la demande implique une réservation externe payante" pour la conciergerie ; "pas de facturation dans la plupart des hôtels, **sauf si** le client veut un supplément payant" pour le voiturier). La conciergerie n'a pas de département dédié dans l'enum du document, utilise `AUTRE`.

**Deux simplifications assumées, documentées dans le plan :**
- Pas de nouveau rôle dédié (comme pour Spa) : RBAC `MENAGE`+admin établissement pour le minibar (constat lors du contrôle de chambre, cohérent avec le métier du ménage), `RECEPTION`+admin établissement pour les 3 autres.
- Pas de sélecteur d'employé générique pour l'assignation en conciergerie — un endpoint de liste globale des employés (tous rôles confondus) n'existe pas dans le portefeuille, et en créer un uniquement pour ce module aurait été disproportionné. Simplifié en un bouton "Prendre en charge" qui auto-assigne l'employé actuellement connecté (`employe.id` depuis `authStore`), au lieu du dropdown initialement envisagé.

**Livré :** modèles `ArticleMinibar`/`ConsommationMinibar`, `CommandeBlanchisserie` (`articles` en texte libre, pas une table de lignes séparée — cohérent avec le niveau de simplicité voulu), `DemandeConciergerie`, `Vehicule` ; 4 nouveaux modules backend suivant tous le même squelette service/controller/routes ; 4 pages frontend (`/minibar`, `/blanchisserie`, `/conciergerie`, `/voiturier`) réutilisant les patterns déjà établis (liste + formulaire + actions inline, comme `/menage`) ; `Sidebar.tsx` mis à jour par rôle. Aucune modification de `FactureModal` nécessaire — tous les départements (`MINIBAR`, `BLANCHISSERIE`, `VOITURIER`, `AUTRE`) étaient déjà couverts depuis la tranche 1.

**Vérifié en conditions réelles :**
- API (curl) : chaîne complète sur une même réservation avec `Facture.montantTotal` suivi précisément à chaque étape — 7150 HTG (base nuitée+taxes) → 7650 après un constat minibar (2 eaux + 1 bière = 500) → 8450 après une commande blanchisserie menée jusqu'à LIVREE (800) → 9950 après une demande de conciergerie payante (excursion, 1500 HTG — une demande gratuite juste avant n'avait rien ajouté, confirmant le caractère bien optionnel) → 10250 après un supplément voiturier au départ (300 HTG). Double-départ d'un véhicule déjà parti refusé en 409.
- Navigateur (Playwright) : constat minibar réel via le formulaire (connexion ménage), commande blanchisserie créée puis menée jusqu'à Livrée via les vrais boutons de progression de statut (connexion réception), `/conciergerie` et `/voiturier` chargés sans erreur console, `FactureModal` affichant bien les lignes Minibar et Blanchisserie dans la section "Détail du folio".
- `tsc --noEmit` propre backend et frontend (un faux positif transitoire dans le cache de types généré par Next.js, sans lien avec le code applicatif, résolu par un nettoyage du dossier `.next`). Base de données remise à un état de seed propre après vérification (nouveau : 4 articles minibar par établissement), serveurs arrêtés.

**Reste à faire (documenté, pas codé, hors périmètre) :** Phase 4 du cœur PMS (channel manager), réservation spa en ligne côté site public, et 3 modules de l'extension 5 étoiles (Room Service, Événementiel/Banquets, Programme de fidélité — volontairement en dernier selon l'ordre du document, ces deux derniers ayant une logique différente : devis séparé pour l'un, programme transversal à toute la chaîne pour l'autre). Tests automatisés toujours absents. Jamais commité en git à ce stade.

---

## 2026-07-11

### REYINYON : enregistrement serveur réel (LiveKit Egress) + IVR téléphonique Twilio

**Contexte :** Jaslin a demandé de "compléter réunion" — clarifié comme les deux points documentés "hors périmètre" en fin de session précédente : enregistrement des réunions et dial-in téléphonique. Contrairement à l'hypothèse initiale du brief, l'enregistrement ne nécessite PAS de stockage S3/GCS pour du self-host (LiveKit Egress écrit directement sur disque local) — buildable réellement dans cet environnement, contrairement au dial-in qui reste bloqué sur un compte Twilio externe. Jaslin a confirmé ne pas avoir de compte Twilio au départ (scope limité à l'enregistrement), puis a indiqué en avoir un finalement (numéro **américain**, pas local Haïti comme le brief l'imaginait) — scope étendu à un IVR téléphonique réel.

**Enregistrement (LiveKit Egress) :**
- Nouveau conteneur `egress` dans `docker-compose.yml` (image `livekit/egress`, ~550 Mo avec Chrome intégré pour le rendu du layout composite — téléchargement lent et interrompu plusieurs fois par des coupures réseau du sandbox, sans lien avec la configuration). Sortie fichier local (volume `./recordings`), aucun stockage objet externe.
- Modèle `Enregistrement` complété (`egressId` pour pouvoir arrêter un enregistrement en cours). Module `modules/enregistrements/` (démarrer/arrêter/lister, hôte uniquement), route statique `/recordings` pour servir les fichiers produits.
- Frontend : bouton d'enregistrement dans les contrôles de la salle (hôte uniquement, icône rouge clignotante "REC" visible de tous pendant l'enregistrement — transparence vis-à-vis des participants), liste des enregistrements avec téléchargement sur la page détail réunion.

**IVR téléphonique (Twilio), scope volontairement limité :** avant de coder, clarifié avec Jaslin (question à choix) jusqu'où aller — retenu : IVR d'abord et testé pour de vrai, le pont audio final vers LiveKit (nécessite LiveKit SIP + IP publique + certificat TLS, un vrai déploiement) documenté mais pas codé, plutôt que tout coder sans pouvoir rien vérifier.
- Nouveau champ `Reunion.codeTelephone` (6 chiffres, distinct de `codeReunion` — un clavier téléphonique ne saisit pas bien des lettres), généré à la création.
- Module `modules/telephony/` : webhook `/api/telephony/accueil` (décroche, `<Gather>` demande le code à 6 chiffres) et `/api/telephony/valider` (identifie la réunion, confirmation vocale). Signature Twilio (HMAC) vérifiée sur les deux endpoints — rejette toute requête non authentiquement envoyée par Twilio.
- `integrations/telephony.ts` mis à jour pour refléter l'état réel (IVR fait, pont SIP non fait) plutôt que de rester un stub générique.
- **Tunnel public pour tester un vrai appel refusé par Jaslin** après que le système a bloqué une première tentative (consentement générique "faites ce que vous jugez nécessaire" jugé insuffisant pour une action réseau sensible, une confirmation explicite et nommée a été redemandée) — respecté, aucun tunnel ouvert. L'IVR reste donc vérifié uniquement côté serveur (curl : signature invalide rejetée 403, génération du code à 6 chiffres confirmée), pas avec un vrai appel téléphonique.

**Vérification de l'enregistrement en conditions réelles — deux vrais bugs trouvés et corrigés, un blocage d'environnement non résolu :**
1. **Bug réel #1** : `RoomCompositeEgress` échouait systématiquement avec `"requested room does not exist"` sur une réunion tout juste créée — la room LiveKit n'est créée qu'au premier `rejoindre` (`assurerSalle`), jamais à la simple création de la réunion. Comportement correct une fois compris (on ne peut pas enregistrer une réunion qui n'a pas encore démarré), pas un bug à corriger, juste une séquence de test à respecter.
2. **Bug réel #2** : une fois un participant réellement connecté, `egress_aborted "Start signal not received"` à chaque tentative — root cause trouvée dans les logs du conteneur egress : `livekit.yaml` utilise `node_ip: 127.0.0.1` (nécessaire pour que le navigateur de Jaslin, sur la même machine que Docker, reçoive des candidats ICE joignables — cf. session précédente), mais ce même `127.0.0.1` est un loopback **propre à chaque conteneur** : `egress` ne pouvait donc jamais atteindre le flux WebRTC de `livekit`, seulement sa signalisation. Corrigé en faisant partager à `egress` le network namespace de `livekit` (`network_mode: service:livekit`, recommandation officielle LiveKit pour un self-host colocalisé) — root cause confirmée par la disparition de cette erreur précise après le correctif.
3. **Bug réel #3 (robustesse, trouvé en même temps)** : quand Egress meurt de lui-même (crash, timeout), la base restait bloquée sur `EN_COURS` indéfiniment, empêchant tout nouvel enregistrement pour la réunion. Corrigé : `demarrer()` vérifie désormais le statut réel de l'egress en cours via `listEgress` avant de refuser (auto-guérison), et `arreter()` marque l'enregistrement terminé même si `stopEgress` échoue parce qu'il est déjà mort.
4. **Blocage non résolu, documenté honnêtement plutôt que masqué** : une fois le problème réseau réglé, Chrome (embarqué dans l'image `livekit/egress` pour le rendu du layout composite) échoue à atteindre l'état "démarré" de façon incohérente dans cet environnement. Diagnostic approfondi (5 tentatives, dont une avec un participant réellement connecté confirmé avant de démarrer, et un redémarrage complet de la stack Docker après une défaillance runtime OCI de bas niveau sur le conteneur egress — `docker info` a confirmé que ce n'est pas une question de ressources : 8 CPU / 15,5 Go alloués) :
   - Tentatives 1-2 (avant redémarrage) : erreur rapide (`page load error: websocket url timeout reached`, ~20s) ou blocage silencieux.
   - Après redémarrage complet de la stack : Chrome démarre réellement cette fois (confirmé par les métriques mémoire du conteneur — plusieurs processus Chrome actifs, ~1,2 Go utilisés), mais le signal "démarrage" n'arrive toujours jamais, y compris avec un participant confirmé connecté dans la room au moment de la tentative — écarte l'hypothèse d'une room vide.
   - Aucune tentative n'a produit de fichier ni remonté d'erreur applicative claire au-delà de `"Start signal not received"`. La requête Egress elle-même est toujours correctement formée et acceptée par LiveKit (confirmé dans les logs à chaque tentative) — le problème se situe dans le pipeline de rendu Chrome lui-même, pas dans la configuration réseau/permissions déjà corrigée.
   - Cause la plus probable restante : instabilité propre à ce sandbox de virtualisation imbriquée (Docker Desktop/WSL2) après une session très longue et chargée (cohérent avec la défaillance runtime OCI observée juste avant, et les autres instabilités réseau rencontrées plus tôt dans la même session). **À revérifier par Jaslin sur un vrai serveur avant de considérer l'enregistrement fonctionnel** — toute la couche applicative (API, base de données, permissions, UI, topologie réseau) est prête et correcte, seule la production effective du fichier vidéo par Chrome n'a jamais pu être confirmée ici malgré un effort de diagnostic complet.

**Reste à faire (documenté, pas codé) :** pont audio SIP réel (LiveKit SIP + IP publique + TLS, nécessite un déploiement), test d'appel réel (nécessite le tunnel refusé ou un vrai déploiement).

---

### OTELA : extension 5 étoiles tranche 2 livrée — Spa & Bien-être

**Contexte :** sur "CONTINUE" après Folio + Restaurant/Bar, poursuite dans l'ordre prescrit par le document 5 étoiles ("...puis Spa, puis les modules plus simples..."). Cette fois, l'ordre étant sans ambiguïté (contrairement à la session précédente où 9 modules restaient à départager), le plan a été écrit directement sur Spa sans revalider la portée avec Jaslin au préalable. Plan validé (EnterPlanMode) avant codage.

**Réutilisation totale du mécanisme d'intégration folio de la session précédente :** "ajout automatique au folio si le client est résident, paiement direct sinon" (exigence du document pour Spa, identique à Restaurant/Bar) s'appuie sur les mêmes fonctions déjà écrites — `folios.service.ts::ajouterLigneFolio()` et `factures.service.ts::recalculerStatutPaiement()` — sans aucune modification. Aucun nouveau système de paiement.

**Deux scopes réduits assumés, documentés dans le plan avant codage :**
1. Le document autorise explicitement "réservation en ligne possible depuis le site public... **ou en interne**" — seule la voie interne (réception) est construite ; la réservation spa publique reste une extension possible, non codée.
2. Pas de rôle `SPA` dédié (contrairement à `SERVEUR` pour le restaurant) — la réception gère la prise de RDV, jugé suffisant pour ce module plus petit.

**Livré :**
- Modèle : `ServiceSpa` (nom, durée en minutes, prix), `Praticien`, `RendezVousSpa` (statut `CONFIRME`/`TERMINE`/`ANNULE`, `folioId` et `methodePaiement` nullables — même dualité résident/non-résident que `Commande` du module restaurant).
- Chevauchement de créneaux vérifié en application dans `spa.service.ts::creerRendezVous()` (pas de contrainte d'exclusion Postgres cette fois, l'enjeu étant bien moindre qu'une double réservation de chambre) : les rendez-vous confirmés du jour pour le praticien visé sont chargés, et le nouveau créneau `[dateHeure, dateHeure+dureeMinutes)` est comparé en JS à chacun.
- Backend `modules/spa/` : CRUD services/praticiens (admin établissement), `creerRendezVous` (réutilise `clients.service.ts::findOrCreateClient()`, déjà utilisée par les réservations de chambre — pas de dédoublonnage client réinventé), `annulerRendezVous`, `terminerRendezVous` (même pattern exact que `restaurant.service.ts::cloturerCommande()` : `chambreNumero` → résout le folio ouvert et poste une `LigneFolio` département `SPA` ; sinon `methodePaiement` obligatoire).
- Frontend : page `/spa` (liste des RDV, prise de rendez-vous via modal, clôture avec le même choix visuel "Ajouter au folio / Paiement direct" que `/pos`) et `/spa/config` (CRUD services/praticiens, admin établissement). `FactureModal` n'a nécessité **aucune modification** : la section "Détail du folio" ajoutée à la tranche précédente affichait déjà le département `SPA` dans son enum de labels.

**Vérifié en conditions réelles :**
- API (curl) : création de RDV réussie ; second RDV sur le même praticien avec chevauchement de créneau refusé en 409 ; clôture au folio de la chambre 101 faisant passer `Facture.montantTotal` de 7150 à 9650 HTG (nuitée+taxes 7150 + massage 2500) ; validation Zod rejetant une clôture sans `chambreNumero` ni `methodePaiement` (422) ; paiement direct réussi pour un client non-résident, sans toucher au folio ; rendez-vous annulé puis tentative de clôture refusée en 409.
- Navigateur (Playwright) : connexion réception, prise de rendez-vous réelle via le vrai formulaire (sélection service/praticien/date/heure/client), clôture réelle au folio de la chambre 101 via les vrais boutons, vérification sur `/reservations` → `FactureModal` que la section "Détail du folio" affiche bien la ligne Spa avec le bon montant.
- `tsc --noEmit` propre backend et frontend. Base de données remise à un état de seed propre après vérification (`prisma migrate reset` + reseed, enrichi de 3 services + 2 praticiens par établissement), serveurs arrêtés.

**Reste à faire (documenté, pas codé, hors périmètre) :** Phase 4 du cœur PMS (channel manager), réservation spa en ligne côté site public, 7 modules restants de l'extension 5 étoiles (Room Service, Minibar, Événementiel, Conciergerie, Blanchisserie, Voiturier, Fidélité). Tests automatisés toujours absents. Jamais commité en git à ce stade.

---

## 2026-07-10 (suite 2)

### OTELA : extension 5 étoiles tranche 1 livrée — Folio + Restaurant/Bar

**Contexte :** sur "CONTINUE" après la Phase 3 (facturation), la Phase 4 du cœur PMS (channel manager) étant explicitement documentée comme "non construite maintenant", la suite logique était l'extension 5 étoiles. Vu l'ampleur des 9 modules du document (`prompt-claude-code-hotel-5etoiles-extension.md`), Jaslin a choisi de limiter cette session à **Folio + Restaurant/Bar**, exactement l'ordre de construction prescrit par le document lui-même, plutôt que de tenter les 9 modules d'un coup. Plan écrit et validé (EnterPlanMode) avant codage.

**Décision d'intégration centrale, le cœur du plan :** le document décrit le Folio comme "la facture maîtresse" du séjour, mais OTELA a déjà une `Facture` fonctionnelle (Phase 3, avec `Paiement`/`statutPaiement` testés). Construire un système de paiement séparé pour le Folio aurait violé la propre règle du document ("ne construis AUCUN département en facturation isolée"). Choix retenu : le `Folio` référence la `Facture` existante ; chaque `LigneFolio` (charge restaurant/bar) fait grossir `Facture.montantTotal` (recalculé à neuf depuis la somme fraîche de toutes les `LigneFolio`, jamais un cumul incrémental) et appelle `recalculerStatutPaiement()` — logique de Phase 3 extraite en fonction partagée dans `factures.service.ts`, réutilisée telle quelle par l'ajout de ligne folio. Résultat concret : le paiement d'un solde de folio se fait avec l'endpoint `POST /api/factures/:factureId/paiements` déjà construit et vérifié en Phase 3 — zéro nouveau système de paiement écrit.

**Changement de comportement assumé, documenté dans le plan avant de coder :** le document exige explicitement qu'un folio ne se ferme que si son solde est réglé. Comme l'ouverture/fermeture du folio est calquée sur check-in/check-out, ceci **annule la décision prise en Phase 3** ("pas de blocage de check-out sur solde impayé, non demandé à cette phase-là"). `reception.service.ts::checkout()` vérifie désormais le solde de la `Facture` avant toute écriture et rejette en 409 avec message clair si non réglé.

**Livré :**
- Modèle : `Folio`/`LigneFolio` (9 départements, `NUITEE` volontairement absent — synthétisée à l'affichage depuis `Facture.montantHT`+`taxes`, jamais dupliquée en base), POS complet (`PointDeVente`, `Table`, `MenuItem`, `Commande`, `LigneCommande`), nouveau rôle `SERVEUR`.
- Backend `modules/folios/` : ouverture automatique dans la transaction de `checkin()`, fermeture dans celle de `checkout()` (après vérification du solde), ajout de ligne appelé uniquement depuis `restaurant.service.ts::cloturerCommande()` — pas de route HTTP générique d'ajout de ligne folio, conformément à l'esprit du document.
- Backend `modules/restaurant/` : CRUD tables/points de vente (admin, structure qui change rarement) et menu (CRUD complet, change souvent), prise de commande, envoi en cuisine, service, clôture avec choix "ajouter au folio chambre X" (résident) ou paiement direct par méthode (client de passage, jamais de folio touché).
- Frontend : `FactureModal` (déjà existant depuis la Phase 3) étendu avec une section "Détail du folio" listant chaque `LigneFolio` — réutilisation de l'écran de clôture déjà construit plutôt qu'un nouvel écran, exactement ce que demandait le document plutôt qu'une nouvelle interface. Nouvelles pages `/pos` (tables, prise de commande, clôture), `/cuisine` (écran cuisine simple), `/restaurant/menu` (CRUD carte).

**Incident de vérification (pas un bug applicatif) :** le rate limiter d'authentification (10 tentatives/15 min, en mémoire process) a été atteint après de nombreuses connexions successives pendant les tests — résolu en redémarrant le processus backend (l'état du rate limiter vit en mémoire, pas en base, contrairement au reste des données) plutôt qu'en attendant la fenêtre de 15 minutes.

**Vérifié en conditions réelles :**
- API (curl) : check-in ouvre bien un folio ; une commande restaurant clôturée sur le folio de la chambre 101 fait passer `Facture.montantTotal` de 7150 à 9050 HTG (nuitée+taxes 7150 + commande 1900) ; check-out refusé en 409 tant que le solde n'est pas réglé, message clair ; paiement du solde complet puis check-out qui réussit et ferme le folio ; commande d'un client non-résident payée en direct (méthode de paiement) sans jamais toucher au folio ; validation Zod rejetant une clôture sans `chambreNumero` ni `methodePaiement`.
- Navigateur (Playwright, réinstallation nécessaire après une coupure de session ayant vidé le scratchpad temp) : connexion serveur, RBAC visuel confirmé (aucun lien Réception/Ménage/Réservations), prise de commande réelle sur `/pos` (sélection table, ajout d'article via le vrai formulaire), envoi en cuisine, `/cuisine` affiche la commande et la marque servie, retour au POS et clôture réelle au folio de la chambre 201 ; connexion admin établissement, `FactureModal` affichant la section "Détail du folio" avec la ligne restaurant ; solde dû visible dans la liste des départs de `/reception`.
- `tsc --noEmit` propre backend et frontend à chaque étape. Base de données remise à un état de seed propre après vérification (`prisma migrate reset` + reseed, seed enrichi avec `serveur@otela.ht`, 2 points de vente + tables + carte par établissement), serveurs arrêtés.

**Reste à faire (documenté, pas codé, hors périmètre) :** Phase 4 du cœur PMS (channel manager), 7 des 9 modules de l'extension 5 étoiles (Room Service, Minibar, Spa, Événementiel, Conciergerie, Blanchisserie, Voiturier, Fidélité). Tests automatisés toujours absents. Jamais commité en git à ce stade.

---

## 2026-07-10 (suite)

### REYINYON : nouveau projet construit de zéro — visioconférence WebRTC résiliente, LiveKit self-hébergé réel

**Contexte :** Jaslin a fourni un prompt de spécification détaillé pour une application de visioconférence type Zoom/Meet, différenciée par sa résilience en contexte de connexion instable (marché haïtien/Caraïbes). Le document imposait explicitement de ne pas réinventer le cœur WebRTC (LiveKit comme SFU, TURN pour les NAT restrictifs) et de concentrer l'effort sur les différenciateurs, avec un ordre de construction précis : LiveKit de base → dégradation auto → dial-in → reste. Plan écrit et validé (EnterPlanMode) avant codage : nom de code **REYINYON** (créole "réunion"), ports 4008/3009.

**Différence notable avec ANTENN/OTELA :** Docker et un accès réseau sortant étant disponibles dans cet environnement, LiveKit a été **réellement self-hébergé via Docker** (pas seulement documenté comme ErsatzTV sur ANTENN) — premier projet du portefeuille où une tentative de vérification vidéo/audio bout-en-bout en conditions quasi réelles a été faite, avec un résultat partiel honnête plutôt qu'une simulation.

**Livré (Phase 1, tout ce qui ne dépend pas d'un compte externe payant) :**
- Infra : `docker-compose.yml` (LiveKit + Redis), TURN embarqué de LiveKit activé plutôt qu'un coturn séparé (déviation assumée du brief, fonctionnellement équivalente, évite de synchroniser un secret entre deux services).
- Backend : auth (copie exacte du pattern OTELA : JWT 15min + refresh cookie httpOnly + verrou de rafraîchissement partagé appliqué dès le départ), réunions (création avec code type Google Meet, code d'accès optionnel, salle d'attente, verrouillage), participants (rejoindre avec/sans compte, admission, **reprise de session via `reconnectToken` opaque haché**), chat (persistance REST, diffusion live via le data channel LiveKit plutôt qu'un second transport temps réel type Socket.io), wrapper `livekit-server-sdk` (génération de token, contrôles hôte mute/remove/delete room). Déviation assumée du RBAC habituel du portefeuille : permissions scopées **par réunion** (hôte = `reunion.hoteId`) plutôt qu'un rôle global sur le compte.
- Frontend : dashboard réunions, écran de pré-jointe (mode données minimales, sélecteur FR/Kreyòl léger), salle LiveKit complète (grille vidéo, mic/cam, partage d'écran, chat, **indicateur de qualité réseau toujours visible par participant**, **dégradation automatique vers audio seul avec bandeau visible** — pas un flou silencieux, panneau hôte avec salle d'attente/mute/remove/lock), invitation WhatsApp (texte prêt à partager + lien wa.me, sans automatisation d'envoi, conforme au brief).
- `integrations/telephony.ts` : dial-in Twilio documenté en détail (interface, étapes de provisioning) mais non branché — même famille de blocage que MonCash/Digicel ou ErsatzTV, nécessite un compte réel appartenant à Jaslin/au client.

**Deux vrais problèmes trouvés et corrigés pendant la vérification (pas de simple lecture de code) :**
1. Windows/Hyper-V réserve la plage UDP 50000-50159 (`netsh interface ipv4 show excludedportrange`), qui recoupait exactement la plage RTP initialement choisie pour LiveKit — Docker refusait de démarrer le conteneur. Décalé sur 52000-52100, une plage confirmée libre.
2. **Bug de code réel** dans `RoomProvider.tsx` : React StrictMode (dev) double-invoque l'effet de connexion LiveKit (mount → cleanup → remount), et le cleanup du 1er montage déconnectait la room pendant que le `connect()` du 2e montage était encore en cours — l'erreur tardive du 1er montage s'affichait par-dessus une connexion qui, elle, avait réussi. Corrigé par un garde d'annulation (`let annule = false`, vérifié dans tous les callbacks async avant `setState`).

**Vérifié en conditions réelles :**
- API (curl) : login, création de réunion, code d'accès erroné rejeté (401), réunion verrouillée refuse une nouvelle jointe (409), salle d'attente + admission avec émission réelle d'un token LiveKit JWT valide (décodé et confirmé : bon `room`, `roomJoin`, `canPublish`), non-hôte reçoit 403 sur les endpoints de contrôle, chat persisté et relu via REST.
- Navigateur : connexion, création de réunion via le vrai formulaire, écran de pré-jointe, **reprise de session automatique confirmée fonctionnelle** (revenir sur le lien après le bug initial a bien réutilisé le `reconnectToken` sans repasser par le formulaire).
- Logs serveur LiveKit consultés directement (`docker logs`) : confirment que la room est créée, le token authentifié, la session RTC démarrée — toute la couche applicative (backend REYINYON + API LiveKit) fonctionne correctement.

**Suite immédiate, même session — Jaslin a testé lui-même et trouvé deux vrais bugs que le sandbox de vérification ne pouvait pas révéler :**

1. **"could not establish pc connection" reproduit aussi sur sa propre machine** (donc pas une limite du sandbox comme d'abord supposé, cf. paragraphe original ci-dessous conservé pour la trace). Root cause trouvée dans les logs serveur LiveKit (`docker logs`) : avec `use_external_ip: true`, LiveKit annonçait l'IP **publique** de Jaslin (découverte via STUN) comme candidat ICE — alors que son navigateur de test et le conteneur Docker tournent sur la même machine. Son propre routeur refusait la boucle vers sa propre IP publique (NAT hairpinning, non supporté par la plupart des box grand public). Corrigé : `use_external_ip: false` + `node_ip: 127.0.0.1` explicite dans `livekit.yaml` (correct pour du dev sur une seule machine ; à remplacer par une IP LAN pour un test multi-appareils sur le même réseau, ou une vraie IP publique/domaine en production).
2. Une fois la vidéo connectée, **Jaslin n'entendait aucun son**. Bug réel dans `ParticipantTile.tsx` : la piste caméra était attachée à l'élément `<video>`, mais la piste micro n'était attachée nulle part — aucun élément audio ne jouait jamais le son distant. Plus grave : le `<video>` n'étant monté que si la caméra est active, un participant en **audio seul** (le scénario central de dégradation auto du brief) n'aurait de toute façon eu aucun élément média pour son micro. Corrigé par un `<audio>` dédié, toujours monté pour chaque participant distant, indépendant de l'état de la caméra.

**Les deux corrections confirmées fonctionnelles par Jaslin lui-même, en dehors du sandbox** : vidéo et son passent maintenant entre deux participants réels. Ce test réel par l'utilisateur a été décisif : sans lui, ces deux bugs (un de config infra, un de code applicatif) seraient restés invisibles, la vérification en sandbox ne pouvant reproduire ni le NAT d'un vrai routeur domestique ni un test audio avec un vrai microphone/haut-parleur.

*Paragraphe original de fin de session (pour la trace) : la négociation WebRTC (ICE) échouait systématiquement dans le sandbox de vérification ("could not establish pc connection"), y compris à un seul participant. La signalisation (WebSocket, auth, join de room) réussissait toujours ; seul le transport média final semblait bloqué, d'abord attribué à tort à une restriction réseau propre au sandbox plutôt qu'à un vrai bug de configuration.*

**Reste à faire (documenté, pas codé, hors périmètre explicite de cette session) :** dial-in téléphonique Twilio (compte + numéro local Haïti + intégration SIP LiveKit requis), enregistrement serveur réel (LiveKit Egress + stockage objet S3/GCS, modèle `Enregistrement` déjà prêt en base). Tests automatisés absents (cohérent avec le reste du portefeuille). Base de données remise à un état de seed propre après vérification (`prisma migrate reset` + reseed). Comptes seed : demo@reyinyon.ht / Reyinyon@123. Jamais commité en git à ce stade. LiveKit/Redis (Docker) et les serveurs backend/frontend laissés actifs en fin de session pour que Jaslin puisse explorer directement.

**Suite, même session — 4 retours d'usage réel de Jaslin, tous corrigés :**
1. Le panneau d'admission de la salle d'attente n'apparaissait jamais côté hôte. Cause : `/rejoindre` et `/salle` sont hors du layout `(dashboard)` protégé, seul endroit où l'access token est restauré depuis le cookie — un hôte arrivant sur un onglet neuf était donc traité comme un simple invité. Corrigé en appelant `hydrate()` directement sur ces deux pages avant toute vérification de statut hôte.
2. "Quitter" ne faisait que couper la connexion LiveKit, sans jamais enregistrer le départ côté serveur — un participant parti restait marqué "Présent" indéfiniment. Nouvel endpoint self-service `POST /participants/:id/quitter` (auth légère par `reconnectToken`, comme le chat), idempotent.
3. Notifications "X a rejoint / a quitté la réunion" ajoutées dans la salle (toasts éphémères), branchées directement sur `RoomEvent.ParticipantConnected/Disconnected` de LiveKit — déjà diffusés à tous les participants connectés, aucun aller-retour backend supplémentaire nécessaire.
4. Bug annexe trouvé en testant le point 3 avec deux onglets du même navigateur : le `reconnectToken` de reprise de session était stocké en `localStorage`, partagé entre TOUS les onglets d'une même origine (comportement standard des navigateurs) — un deuxième onglet "invité" reprenait donc l'identité du premier onglet au lieu d'être un participant distinct. Corrigé en passant ce stockage en `sessionStorage` (isolé par onglet, survit quand même à un simple rechargement de page).
5. Sur demande explicite ("est-ce que l'hôte peut activer/désactiver caméra et micro des participants") : le bouton unique de contrôle hôte coupait en fait déjà les deux pistes à la fois (mal étiqueté "micro" seulement) — séparé en deux boutons distincts (micro / caméra), chacun ciblant uniquement sa piste (`TrackSource.MICROPHONE`/`CAMERA` côté `livekit-server-sdk`). Limite volontaire expliquée à Jaslin : un hôte peut seulement couper, jamais rallumer le micro/caméra d'un participant à sa place (LiveKit ne le permet pas, même restriction que Zoom/Meet, pour la vie privée).

Les points 1 à 3 ont été confirmés fonctionnels par Jaslin lui-même en conditions réelles ; le point 5 confirmé fonctionnel également. `tsc --noEmit` propre côté backend et frontend à chaque étape.

---

## 2026-07-10

### OTELA : Phase 3 livrée — facturation & paiements

**Contexte :** sur "vas y" sans autre précision après la Phase 2, poursuite d'OTELA avec la Phase 3 du document `prompt-claude-code-hotel-pms.md` plutôt que la Phase 4 (channel manager) ou l'extension 5 étoiles — choix justifié par l'ordre de construction prescrit par le document lui-même ("...puis facturation (Phase 3)"). Plan écrit et validé (EnterPlanMode) avant codage, comme pour les Phases 1 et 2.

**Livré :**
- Modèle : `Etablissement.tauxTaxe` (taxe locale en %, configurable par établissement — jamais de taux global codé en dur, même principe que les tarifs par devise), `Facture` (montantHT/taxes/montantTotal, statut IMPAYE/PARTIEL/PAYE), `Paiement` en historique multi-versements — remplace le champ `datePaiement` unique esquissé dans le document, insuffisant dès qu'on veut vraiment tracer des paiements partiels successifs.
- `reservations.service.ts::creerReservation()` : la `Facture` est désormais générée automatiquement dans la **même transaction** que la `Reservation` (le seul `prisma.reservation.create` est devenu un `$transaction`) — jamais un pas séparé, jamais de réservation sans facture.
- Backend `modules/factures/` : consultation facture + historique de paiements par réservation, enregistrement de paiement (RECEPTION/ADMINISTRATEUR_ETABLISSEMENT) avec garde explicite contre le surpaiement (rejet 400 si le montant dépasse le solde restant) et recalcul transactionnel du statut à chaque paiement.
- `rapports.service.ts` étendu (même fonction `getOccupationEtRevenu`, donc répercuté automatiquement dans les rapports établissement et chaîne déjà existants) : bloc facturation par devise (facturé/payé/impayé), calculé sur la date de **facturation** (pas la date de séjour — plus pertinent pour un rapport de facturation par période).
- Frontend : `FactureModal` (montant HT/taxes/total, badge de statut, historique, formulaire de paiement réel) ouvert depuis un nouveau bouton "Facture" sur `/reservations` ; solde dû affiché en lecture seule à côté du bouton Check-out sur `/reception` (pas de blocage du check-out sur impayé — non demandé par le document pour cette phase) ; sections StatCards Facturé/Payé/Impayé par devise ajoutées à `/rapports` et `/chaine`.

**Vérifié en conditions réelles :**
- API (curl) : réservation de 2 nuits à 6 500 HTG/nuit → facture auto-générée avec HT=13 000, taxes=1 300 (taux établissement 10%), total=14 300 ; paiement partiel de 5 000 → statut PARTIEL ; tentative de paiement de 20 000 (dépasse le solde de 9 300) → rejet 400 propre ; paiement des 9 300 restants → statut PAYE ; nouvelle tentative de paiement sur facture déjà payée → 409 ; rapport établissement et rapport chaîne consolidé renvoient bien 14 300 facturé / 14 300 payé / 0 impayé en HTG sur la période, séparés par devise.
- Navigateur (Playwright, Chromium en cache réutilisé après un aller-retour d'installation npm compliqué par un dossier scratchpad remis à zéro entre deux sessions et une install concurrente ratée en ECONNRESET) : ouverture de la facture d'une réservation depuis `/reservations`, enregistrement d'un paiement partiel via le vrai formulaire (passage visuel Impayée → Partiellement payée, historique des paiements affiché), section FACTURATION visible sur `/rapports`, section FACTURATION CONSOLIDÉE visible sur `/chaine` en tant qu'admin chaîne.
- `tsc --noEmit` propre backend et frontend. Base de données remise à un état de seed propre après vérification (`prisma migrate reset` + reseed), serveurs arrêtés (deux instances zombies détectées et tuées au passage, port déjà occupé par un ancien process backend planté sur `EADDRINUSE`).

**Reste à faire (documenté, pas codé, hors périmètre) :** Phase 4 (channel manager), extension 5 étoiles au complet. Tests automatisés toujours absents. Jamais commité en git à ce stade.

---

## 2026-07-09 (suite)

### OTELA : Phase 2 livrée — réception (check-in/check-out) & ménage

**Contexte :** à la question "on continue", Jaslin a choisi de poursuivre OTELA (plutôt que la Phase 3 facturation ou l'extension 5 étoiles) avec la Phase 2 du document `prompt-claude-code-hotel-pms.md` : module réception et module ménage. Plan écrit et validé (EnterPlanMode) avant codage, comme pour la Phase 1.

**Décision de conception documentée dans le plan avant de coder :** en ajoutant les statuts `OCCUPEE` et `NETTOYAGE_EN_COURS` à `Chambre`, il fallait revoir les requêtes de disponibilité (`disponibilite.service.ts`, `reservations.service.ts::trouverChambreDisponible`) qui filtraient jusque-là sur `statut: 'DISPONIBLE'` strictement. Choix retenu : `OCCUPEE` ne bloque jamais une réservation à dates futures (le chevauchement de `Reservation` gère déjà ça correctement, indépendamment de l'état physique instantané de la chambre) — seuls `MAINTENANCE` et `NETTOYAGE_EN_COURS` excluent la chambre de **toute** recherche, conformément au texte explicite du document ("une chambre en nettoyage_en_cours ne doit jamais apparaître comme disponible... tant que le ménage n'est pas marqué terminé", sans qualification de date). Ce choix a été vérifié empiriquement plus tard dans la session (voir plus bas).

**Livré :**
- Modèle : `StatutChambre` étendu (`DISPONIBLE`/`OCCUPEE`/`MAINTENANCE`/`NETTOYAGE_EN_COURS`), nouveau modèle `TacheMenage` (`StatutTacheMenage` À_FAIRE/EN_COURS/TERMINE), migration Prisma standard (pas de SQL manuel cette fois, ajouts purs).
- Backend `modules/reception/` : vue du jour (arrivées et départs prévus aujourd'hui, compteur de chambres par statut), `checkin()` (compare-and-swap `Chambre.statut: DISPONIBLE → OCCUPEE`, 409 propre si la chambre n'est pas encore libérée par le départ précédent), `checkout()` (transaction : `Reservation.statut → TERMINEE` par CAS, `Chambre.statut → NETTOYAGE_EN_COURS`, création automatique d'une `TacheMenage`).
- Backend `modules/menage/` : liste des tâches, assignation à un employé de rôle MENAGE, progression de statut avec CAS remettant la chambre `DISPONIBLE` uniquement si elle était bien `NETTOYAGE_EN_COURS` (n'écrase jamais un `MAINTENANCE` posé entre-temps).
- Frontend : pages `/reception` (listes arrivées/départs avec boutons Check-in/Check-out réels, StatCards par statut de chambre) et `/menage` (tableau des tâches, assignation, progression par clic). Navigation Sidebar refaite en mapping strict par rôle (`RECEPTION`/`MENAGE`/`ADMINISTRATEUR_ETABLISSEMENT`/`ADMINISTRATEUR_CHAINE` ont chacun leur propre liste de liens — auparavant `MENAGE` héritait par erreur de la nav réception, jamais remarqué faute de compte ménage testé en Phase 1).

**Deux bugs réels supplémentaires trouvés et corrigés en vérification (pas de simple lecture de code) :**
1. **Incohérence de fuseau horaire, latente depuis la Phase 1, révélée par le besoin de réserver "pour aujourd'hui" (nécessaire pour tester le check-in) :** la garde "date d'arrivée pas dans le passé" dans `reservations.service.ts::creerReservation` comparait `input.dateArrivee` (une date `YYYY-MM-DD` du frontend, parsée par JS en minuit **UTC**) à un `debutAujourdhui` calculé via `new Date().setHours(0,0,0,0)`, c'est-à-dire minuit en heure **locale** du serveur (America/Port-au-Prince, UTC-4 → minuit local = 04:00 UTC). Résultat : toute réservation pour le jour même était rejetée à tort ("La date d'arrivée ne peut pas être dans le passé"), le serveur croyant la date déjà passée de 4 heures. Le même défaut affectait `reception.service.ts::bornesAujourdhui()` (vue du jour), qui aurait manqué les arrivées/départs du jour pour la même raison. Les deux corrigés en calculant le début de journée en UTC (`Date.UTC(...)`) plutôt qu'en heure locale — cohérent avec le fait que toutes les dates de séjour sont des dates calendaires sans heure, donc intrinsèquement sans fuseau.
2. **Fuite de données mineure** : `menage.service.ts` incluait `employeAssigne: true` sans filtre dans ses réponses API, exposant le hash bcrypt du mot de passe de l'employé de ménage assigné à quiconque consultait la liste des tâches. Corrigé par un `select: { id, nom }` explicite (pattern déjà systématique ailleurs dans le portefeuille, ex. `auth.service.ts`, oublié ici en copiant rapidement le pattern `include`).

**Vérifié en conditions réelles :**
- API (curl) : check-in réussi puis second check-in refusé (409, chambre déjà occupée) ; check-out crée la `TacheMenage` et bascule la chambre en nettoyage, second check-out refusé (409) ; **test décisif de la décision de conception** — recherche de disponibilité à +60/+63 jours confirmée **inchangée** pour une chambre passée `OCCUPEE` par un check-in (4 chambres disponibles avant et après), mais bien réduite de 1 pour une chambre en `NETTOYAGE_EN_COURS` y compris à ces mêmes dates lointaines, prouvant que `NETTOYAGE_EN_COURS` bloque bel et bien sans condition de date comme voulu ; tâche de ménage terminée remet la chambre `DISPONIBLE`, double-terminaison refusée (409) ; assignation d'un employé et progression de statut testées via l'API.
- Navigateur (Playwright, Chromium réinstallé dans un nouveau dossier scratchpad, le build complet en cache réutilisé directement) : connexion réceptionniste avec RBAC visuel confirmé (aucun lien Chambres/Rapports/Ménage) ; connexion ménage avec RBAC visuel confirmé (aucun lien Réception/Réservations) ; **clics réels** sur le bouton Check-in depuis `/reception`, puis (après avoir avancé artificiellement la date de départ d'une réservation de test en base pour simuler un départ du jour, la création normale ne permettant jamais une réservation avec départ aujourd'hui) clic réel sur Check-out, puis connexion ménage et clics réels faisant progresser la tâche générée À faire → En cours → Terminée.
- `tsc --noEmit` propre backend et frontend à chaque étape. Base de données remise à un état de seed propre après vérification (`prisma migrate reset` + reseed : 2 établissements, 0 réservation/tâche résiduelle).

**Reste à faire (documenté, pas codé, hors périmètre) :** Phase 3 (facturation, paiements), Phase 4 (channel manager), extension 5 étoiles au complet. Tests automatisés toujours absents. Jamais commité en git à ce stade.

---

## 2026-07-09

### OTELA : nouveau projet construit de zéro — PMS hôtelier multi-établissements (Phase 1), pour Haitech Solutions

**Contexte :** Jaslin a fourni deux documents de spécification détaillés (`prompt-claude-code-hotel-pms.md` : cœur PMS en 4 phases, réservation en ligne + réception/ménage + facturation + préparation channel manager ; `prompt-claude-code-hotel-5etoiles-extension.md` : extension "5 étoiles" en 9 modules — folio unifié, restaurant/bar, room service, minibar, spa, événementiel, conciergerie, blanchisserie, voiturier, fidélité) pour un nouveau client Haitech Solutions. Sur "VAS Y", ampleur totale jugée nettement supérieure à tout projet livré en une seule session du portefeuille jusqu'ici — décision prise (documentée dans le plan, validée via EnterPlanMode) de livrer uniquement la **Phase 1 du cœur PMS** cette session, en respectant l'ordre de construction explicitement recommandé par les documents eux-mêmes.

**Recherche de conventions avant de coder :** trois agents Explore lancés en parallèle sur le portefeuille (patterns de verrouillage anti-concurrence BANKA/GESCOM/LAKAY/ANTENN, patterns multi-tenant et auth SHOPAY/LAKAY/ANTENN, design system et structure Next.js GESCOM/ANTENN/LAKAY). Nom de code **OTELA** (créole "otèl" + suffixe -A, cohérent avec BANKA/MEDIKA/POSTA), ports 4007/3008 (suite logique du portefeuille).

**Livré (Phase 1 uniquement) :**
- Modèle de données : Chaine, Etablissement, TypeChambre, Chambre, Tarif (par devise HTG/USD, jamais de conversion automatique, snapshotté sur la réservation), Client (profil unique multi-établissements dédupliqué par email), Reservation (statut + champ `canal` préparé pour la Phase 4 channel manager sans être utilisé), Employe (4 rôles RBAC).
- **Moteur anti-double-booking à deux niveaux**, le point le plus critique du cahier des charges : contrainte d'exclusion PostgreSQL (`EXCLUDE USING gist`, extension `btree_gist`, migration SQL manuelle écrite à la main comme les vues `mail_domains` de POSTA — Prisma ne sait pas exprimer ce type de contrainte) doublée d'un pré-check applicatif rapide, le tout dans un **service unique** `reservations.service.ts::creerReservation()` utilisé à l'identique par le site public et par la création manuelle back-office (jamais deux chemins de code différents, exigence explicite du document).
- Backend : auth (JWT 15min + refresh cookie httpOnly + rotation + verrou de rafraîchissement partagé, appliqué préventivement dès le départ plutôt qu'en correctif après coup comme sur LAKAY), `resolveEtablissement` (calqué sur `resolveBoutique` de SHOPAY), modules etablissements/chambres-tarifs/disponibilite/reservations/clients/rapports.
- Frontend : site public glassmorphism navy/or (recherche par établissement/dates/devise, résultats, réservation sans compte, confirmation) ; back-office établissement (réservations avec recherche et création manuelle, calendrier d'occupation par chambre, gestion types de chambres/tarifs/chambres, rapport occupation+revenu) ; back-office chaîne (vue consolidée occupation/revenu par établissement **jamais mélangée entre devises**, gestion établissements ajout/désactivation). Design system Badge/StatCard/PageToolbar/EmptyState/Modal réutilisé de GESCOM/ANTENN, palette dédiée navy/or.

**Deux bugs réels trouvés et corrigés en vérification (pas de simple lecture de code) :**
1. `GET /chambres/types` était laissée accessible sans authentification pour un usage "public" finalement jamais câblé côté frontend (le site public passe par `/disponibilite`, qui combine déjà types+tarifs+disponibilité) — cassait silencieusement le chargement du back-office établissement faute d'`etablissementId` résolu. Corrigé en réservant la route au personnel authentifié.
2. **Plus significatif** : `validate.middleware.ts` (pattern copié tel quel du reste du portefeuille, présent depuis ANTENN) validait les payloads avec Zod mais ne réassignait jamais le résultat parsé à `req.body`/`req.query`/`req.params` — un `z.coerce.date()` n'avait donc aucun effet réel sur la requête, et la création d'un tarif plantait en 500 côté Prisma ("Invalid value... premature end of input") en recevant une chaîne brute au lieu d'une date. Passé inaperçu jusqu'ici sur le reste du portefeuille car les contrôleurs concernés reconvertissaient manuellement les dates eux-mêmes en aval, contournant sans le savoir le défaut. Corrigé par réassignation **conditionnelle** (seulement les clés effectivement déclarées par chaque schéma) après un premier correctif trop large qui cassait les routes ne validant que `body` (leurs `params`/`query` non déclarés se retrouvaient `undefined`).

**Vérifié en conditions réelles :**
- API (curl) : **test de concurrence réel décisif** — 8 requêtes HTTP strictement simultanées visant la même chambre et les mêmes dates, exactement 1 a réussi (201), les 7 autres rejetées proprement (409 "Chambre non disponible sur ces dates") grâce à la contrainte PostgreSQL, pas au pré-check applicatif seul. Garde d'immutabilité, double-annulation refusée, isolation stricte par établissement, création de type de chambre + tarif + établissement, RBAC 403 sur une action réservée à la chaîne.
- Navigateur (Playwright ; Chromium installé à la volée dans le scratchpad, un premier téléchargement du build `headless_shell` a échoué par coupures réseau répétées — contourné en pointant `executablePath` directement sur le Chromium complet déjà téléchargé) : parcours public complet recherche → réservation → confirmation ; connexion + navigation des 4 pages back-office établissement ; création manuelle de réservation via le vrai formulaire puis annulation depuis l'interface ; connexion admin chaîne avec séparation RBAC **visuelle** confirmée (aucun lien Chambres/Réservations dans son menu) et vue consolidée correcte sur les 2 établissements de seed.
- `tsc --noEmit` propre backend et frontend. Base de données remise à un état de seed propre après vérification (`prisma migrate reset` + reseed : 2 établissements, 6 types de chambres, 0 réservation/client résiduel).

Comptes seed : reception@otela.ht / administrateur@otela.ht / chaine@otela.ht, mot de passe commun Otela@123.

**Reste à faire (documenté dans le plan, pas codé, hors périmètre explicite de cette session) :** Phase 2 (check-in/check-out réception, tâches de ménage), Phase 3 (facturation, statut de paiement, point d'intégration MonCash/carte), Phase 4 (channel manager Booking.com/Expedia, seul le champ `canal` est préparé), et l'intégralité de l'extension 5 étoiles (Folio unifiant restaurant/bar/room service/minibar/spa/blanchisserie, événementiel volontairement en devis séparé du folio, conciergerie, voiturier, fidélité). Tests automatisés absents (cohérent avec le reste du portefeuille). Jamais commité en git à ce stade.

---

## 2026-07-08 (suite)

### ANTENN : nouveau projet construit de zéro — régie TV pour chaîne de streaming FAST (Haitech Solutions)

**Contexte :** Jaslin a fourni un prompt de spécification détaillé pour un nouveau projet, client de Haitech Solutions : le système d'administration et le player web d'une chaîne de streaming linéaire (FAST). Le moteur de playout (ErsatzTV, open source) et l'ingest RTMP terrain étaient explicitement désignés comme des briques externes existantes à ne pas recoder — seul le backend d'administration ("régie") et le player web étaient à construire, avec les points d'intégration externes (API ErsatzTV, RTMP, CDN HLS) à documenter sans les coder. Ordre de construction imposé par le brief : modèle de données + grille, puis sponsors, puis player web avec EPG — respecté.

**Recherche de conventions avant de coder :** deux agents Explore lancés en parallèle sur le reste du portefeuille (LAKAY pour les conventions backend — structure modules/RBAC/JWT/Prisma ; GESCOM+BANKA pour le frontend — design system, composants ui/, pattern de login dark two-panel). Plan validé avec Jaslin (EnterPlanMode) avant le codage : nom de code **ANTENN** (créole pour "antenne"), ports 4006/4007→3007 (suite logique du portefeuille), stack identique au reste (Express+Prisma+PostgreSQL / Next.js).

**Livré :**
- Schéma Prisma complet (User/RefreshToken, Sponsor, Contenu, Match, CreneauGrille, IncrustationLogo, BandeauSponsor, DiffusionLog) avec `SyncStatus` (BROUILLON/SYNCHRONISE) sur `CreneauGrille` — exigence explicite du client de ne jamais confondre visuellement une grille en cours d'édition et ce qui est réellement à l'antenne.
- RBAC 2 rôles (ADMINISTRATEUR complet / OPERATEUR_REGIE restreint — ne peut pas toucher aux contrats sponsors), immutabilité de l'historique codée en service (créneau déjà diffusé → 409 sur modification/suppression, pas juste une restriction UI).
- 8 modules backend (auth, grille, matchs, contenus, sponsors avec upload logo local + alerte contrat à 30j, habillage, rapports agrégés par sponsor, EPG public sans auth).
- Frontend : premier dashboard du portefeuille entièrement dark mode (nouveau thème navy/cyan/or — tous les autres projets n'ont du dark mode que sur l'écran de login). Grille avec timeline horaire visuelle + liste, bandeau persistant brouillon/synchronisé. Player public `/regarder` avec hls.js, EPG, badge EN DIRECT, overlay logo/bandeau (les deux options — overlay HTML vs incrustation brûlée côté playout — documentées avec leurs compromis en commentaire dans le code), indicateur qualité réseau.
- `src/integrations/ersatztv.ts` : point d'intégration ErsatzTV documenté en détail mais non branché (pas d'accès à une instance réelle dans cet environnement) — statuts (créneau synchronisé, match en direct) pilotés manuellement par l'opérateur en attendant, pour ne fabriquer aucun comportement automatique inexistant.

**Durci de manière préventive :** le correctif de race condition sur le rafraîchissement de token découvert sur LAKAY plus tôt dans la journée (verrou partagé entre le hydrate() du layout et l'intercepteur Axios) a été appliqué directement dès la construction d'ANTENN plutôt que découvert après coup.

**Vérifié en conditions réelles :** API (curl — guard 409 créneau passé, RBAC 403 sur écriture sponsor pour un opérateur, duplication de créneau, alerte contrat), navigateur (connexion admin et opérateur, RBAC visuel différencié par rôle confirmé, création de créneau via le vrai formulaire de bout en bout, les 7 pages du dashboard + le player). Lecture HLS réellement testée avec un flux de démonstration public (Apple bipbop, retiré de la config après coup — aucun CDN client réel disponible dans cet environnement). `tsc --noEmit` propre côté backend et frontend. Base de données remise à un état de seed propre après la session de vérification (`prisma migrate reset`), configuration `prisma.seed` ajoutée au `package.json` pour que ça marche automatiquement à l'avenir.

**Reste à faire (documenté, pas codé, hors périmètre du brief) :** intégration API ErsatzTV réelle, provisioning d'un compte CDN HLS (Bunny Stream/Cloudflare Stream), génération d'URL RTMP par le serveur de streaming — ces trois points nécessitent des comptes/accès externes appartenant au client, pas quelque chose que Claude peut provisionner. Tests automatisés absents (cohérent avec le reste du portefeuille). Projet jamais commité en git à ce stade.

---

## 2026-07-08

### LAKAY : audit senior dev + 4 correctifs, refresh token enfin migré en cookie httpOnly (root cause de l'échec précédent trouvée)

**Contexte :** Jaslin a demandé une analyse "senior dev" de LAKAY (failles à corriger, manques, ce qui peut être ajouté). Audit délégué à un agent Explore en lecture seule, avec pour consigne explicite de ne pas re-signaler les 9 correctifs déjà connus de l'audit du 2026-07-01 (webhook MonCash, IDOR listing, index Prisma, géo-recherche, fuite Cloudinary, cache collision, N+1, Bull Board, CSP) — seulement l'état actuel et les régressions/nouveautés depuis. Sur "VAS Y", les 4 problèmes retenus ont été corrigés, typés (tsc backend+frontend, 0 erreur) et vérifiés.

**1. Refresh token migré en cookie httpOnly — cette fois avec succès.** La mémoire du projet notait qu'une tentative précédente (début juillet) avait été **rollback** en localStorage car elle cassait l'auth en dev. `auth.controller.ts` pose désormais le cookie (`lakay_refresh_token`, `httpOnly`, path `/api/auth`, `sameSite=lax` en dev / `none`+`secure` en prod) au lieu de le renvoyer en JSON ; `/refresh` et `/logout` le lisent depuis `req.cookies`. Frontend : `accessToken` gardé en mémoire uniquement (Zustand), plus aucun token en `localStorage`, `hydrate()` au démarrage de l'app échange le cookie contre un token frais.

**Vérification par `curl` d'abord jugée suffisante à tort** (login/refresh/logout fonctionnaient parfaitement) — mais la mémoire du projet, relue avant d'écrire cette entrée, signalait explicitement que la tentative précédente avait échoué en navigateur réel avec le même genre de symptôme ("boucle de redirection vers /login"). C'est cette note qui a déclenché une vérification Playwright complète plutôt que de s'arrêter à `curl` (qui ne reproduit pas les règles SameSite d'un navigateur). **Le test navigateur a effectivement reproduit l'échec** : la session ne survivait pas à un rechargement de page (401 en boucle, redirection /login), exactement le symptôme historique. **Root cause trouvée** : ce n'était pas un problème de cookie cross-origin comme supposé à l'époque, mais une **race condition** — `hydrate()` au bootstrap de l'app et l'intercepteur Axios (refresh automatique sur 401 d'une requête tierce, ex. compteurs de notifications) appelaient chacun `/auth/refresh` indépendamment ; le refresh token étant à usage unique (rotation en base à chaque appel), le second appel concurrent avec le même cookie échouait systématiquement. **Fix : verrou partagé unique** (`refreshAccessToken()` dans `api.ts`, une seule promesse de refresh en vol à la fois, réutilisée par `hydrate()` et par l'intercepteur). **Re-testé en navigateur réel (Playwright, serveurs relancés localement contre la vraie base Postgres)** : login → cookie confirmé `httpOnly=true`/`sameSite=Lax`, aucun JWT en `localStorage` ; **rechargement de page → session survit** (point qui échouait avant) ; logout → cookie supprimé, refresh révoqué. Environnement de test nettoyé après coup (serveurs arrêtés, dossier Playwright temporaire supprimé).

**2. `favoriteCount` pouvait devenir négatif** : `favorites.routes.ts` décrémentait le compteur sans vérifier qu'une ligne avait réellement été supprimée — un appel répété sur un favori jamais ajouté le faisait dériver. Corrigé, vérifié via API réelle (3 DELETE répétés, compteur resté stable).

**3. Paiement PENDING orphelin bloquait tout paiement futur** : un checkout Stripe/MonCash/NatCash initié puis abandonné empêchait indéfiniment `submitPaymentProof` (409 systématique), aucun job ne nettoyait jamais les `Payment` (contrairement aux `Subscription`/`Listing`). Nouveau job horaire `expireStalePendingPayments` (délai de grâce 2h, épargne les vraies preuves manuelles `awaitingVerification` en attente d'admin).

**4. Workflow visites cassé, bloquait de fait les avis vérifiés** : le statut `COMPLETED` de `VisitRequest` n'était jamais atteint (aucune UI ne le pose), alors que le système d'avis l'accepte en alternative à `CONFIRMED`. Nouveau `visits.service.ts::completeElapsedVisits()` (bascule automatique une fois `proposedDate` dépassée), câblé dans le job de maintenance horaire déjà existant — qui couvre donc désormais 4 balayages (abonnements, annonces, paiements orphelins, visites élapsées).

**Découverte annexe en cours de session :** Jaslin travaillait en parallèle dans son IDE sur BANKA (refactor des schémas de validation en fichiers séparés) pendant cette session — signalé, fichiers disjoints, aucun conflit.

**Reste à faire :** intégration réelle API MonCash/NatCash, tests automatisés quasi inexistants sur les chemins critiques (le dossier `__tests__` existe mais ne couvre que des calculs purs), checkout Stripe réel non testable (pas de clé de test dans l'environnement).

---

## 2026-07-07 (soir, session distincte)

### SHOPAY : demande initiale "plateforme SaaS e-commerce complète" + vérification navigateur + fix affichage plan illimité

**Contexte :** Jaslin a demandé une "plateforme SAAS e-commerce complète" en partant de zéro dans une session dédiée. Clarifié avec lui via questions ciblées avant de coder : store builder multi-tenant (pas marketplace ni boutique unique), base partagée avec `boutiqueId`, paiements Stripe+MonCash+preuve manuelle, même stack que le reste du portefeuille (Next.js+Express+Prisma+PostgreSQL). Plan validé (EnterPlanMode) après exploration des conventions GESCOM/LAKAY/POSTA, nom retenu **SHOPAY** (Shop+Ayiti), ports 4005/3006.

**Découverte en cours de session :** une deuxième session Claude Code travaillait en parallèle sur le même dossier `livrables/applications/SHOPAY/` (voir entrée suivante ci-dessous, écrite par cette autre session qui a découvert le projet via `/prime` en le croyant "non documenté" et l'a documenté à sa façon). Les deux sessions ont progressé sans se marcher dessus grâce à des commits successifs cohérents : build initial + fix survente checkout, ajout marketplace cross-boutiques, vérification email/mot de passe oublié.

**Vérification en navigateur réel (Playwright via l'outil preview) faite dans cette session :** inscription marchand → boutique créée directement `ACTIVE` (bug corrigé : le premier jet renvoyait un statut manquant dans la réponse d'inscription, affichant "Boutique non publiée" à tort) → création produit → boutique publique `/store/[slug]` → ajout panier → checkout invité avec champs Haïti (département/commune/point de repère) → refus correct si stock insuffisant (409) → preuve de paiement manuelle → validation admin → commande passée en `PAID` avec décrément de stock confirmé → transition de statut marchand (Payée → En préparation) → flux mot de passe oublié/reset testé (token invalide correctement rejeté, token valide bien créé en base).

**Bug trouvé et corrigé dans cette session :** page Abonnement affichait "Jusqu'à null produits" pour le plan Pro au lieu de "Produits illimités" — `JSON.stringify(Infinity)` produit silencieusement `null`, cassant la comparaison `=== Infinity` côté frontend après un aller-retour API. Fix : `serializePlanLimits()`/`serializeAllPlanLimits()` dans `config/plans.ts` convertissant explicitement `Infinity` en `null` avant sérialisation, frontend adapté pour interpréter `null` comme illimité.

**Reste à faire (identifié par les deux sessions) :** intégration MonCash réelle (credentials Digicel toujours en attente, comme sur tous les autres projets du portefeuille), notifications `ORDER_PLACED`/`LOW_STOCK` jamais déclenchées malgré leur modélisation, pas d'édition inline stock/prix sur un produit existant (seule la création et le statut sont éditables depuis le dashboard), tests automatisés absents.

---

## 2026-07-07 (suite)

### SHOPAY : découverte d'un projet non documenté (SaaS e-commerce multi-tenant)

**Contexte :** en `/prime`, git status a révélé deux dossiers jamais documentés : `livrables/applications/SHOPAY/` et `livrables/reseau/`. Jaslin a demandé d'abord de documenter SHOPAY (reseau laissé en attente, nature à clarifier avec lui).

**Ce qui a été trouvé (lecture seule, aucun code touché) :** SHOPAY est une plateforme SaaS e-commerce multi-tenant (store builder pour marchands haïtiens), jamais commitée en git (`git log` vide sur le dossier). Backend Express/TypeScript/Prisma/PostgreSQL (port 4005) déjà structuré en 9 modules (auth, boutiques, catalog, cart, orders, payments Stripe+MonCash, billing/quotas, storefront public, admin plateforme, notifications), frontend Next.js (port 3006) avec zone marchand, zone admin et vitrine publique `/store/[slug]`. Modèle multi-tenant classique du portefeuille (boutiqueId posé + indexé sur les tables scopées, isolation garantie côté middleware via le JWT et jamais un paramètre client). Migration Prisma datée du jour même — vraisemblablement le travail d'une session Claude Code antérieure interrompue avant `/update`, comme cela s'est déjà produit pour BANKA et POSTA.

**Non fait dans cette session :** aucune vérification API/navigateur, aucun audit de sécurité ou de complétude — seule une lecture du code pour documenter son existence. `context/CONTEXT.md` mis à jour avec une entrée SHOPAY.

**Audit de complétude effectué immédiatement après (même session), délégué à un agent Explore en lecture seule** : RBAC, rate limiting, idempotence des paiements, signature webhook Stripe, audit log et quota produits déjà corrects (meilleur que prévu pour un projet interrompu). Failles confirmées : pas d'email de vérification/mot de passe oublié, MonCash non intégré (placeholder avec TODO explicite), et surtout **aucune vérification de stock au checkout** — une commande pouvait être créée sans aucun contrôle de disponibilité, le stock n'étant décrémenté qu'à l'activation du paiement, sans garde contre la survente.

**Correctif appliqué et vérifié en conditions réelles (sur demande de Jaslin, "VAS Y") :** deux changements ciblés, alignés sur le pattern compare-and-swap déjà utilisé ailleurs dans le portefeuille (BANKA/GESCOM) :
1. `orders.service.ts::checkout()` : vérification du stock disponible (produit ou variante) pour chaque article du panier avant de créer la commande, rejet 409 avec message explicite si insuffisant.
2. `payments.service.ts::activateOrder()` : le décrément de stock à l'activation du paiement passe d'un `update` inconditionnel à un `updateMany` compare-and-swap (`stockQty: { gte: quantity }`) ; si la garde échoue, toute la transaction (y compris le passage du paiement à COMPLETED) est annulée — le paiement reste PENDING, rejouable, plutôt que de valider une commande dont le stock a disparu entretemps.

**Vérification en API réelle** (backend lancé localement contre la vraie base Postgres `shopay`, seed rechargé) : commande avec quantité (500) dépassant le stock (48) → 409 avec message clair ; commande dans les clous → 201 normal ; stock réduit artificiellement à 1 après création d'une commande de 2, tentative d'approbation du paiement → rejetée proprement, stock resté à 1 (jamais négatif), paiement resté PENDING. Données de test nettoyées après coup (commande, paiement, panier de test supprimés, stock restauré).

**Découverte annexe pendant la vérification :** un serveur backend ET un serveur frontend (port 3006) de SHOPAY tournaient déjà en arrière-plan avant même le début de cette session — zombies d'une session antérieure jamais arrêtée (même symptôme déjà documenté sur POSTA). Seule l'instance backend lancée pour cette vérification a été arrêtée après coup ; les processus pré-existants n'ont pas été touchés (pas certain que Jaslin ne les utilise pas activement).

**Marketplace de découverte ajoutée dans la foulée :** Jaslin a demandé "comment les clients verront les produits des boutiques", révélant un malentendu — il imaginait un modèle marketplace façon Amazon (panier unique multi-vendeur), alors que SHOPAY était construit en pur store builder (chaque boutique isolée, lien à partager, aucune découverte centralisée). Clarifié avec lui avant de coder : panier unifié multi-vendeur écarté (refonte lourde de Order/Cart/Payment pour répartir un paiement entre plusieurs marchands, aucun besoin business validé à ce stade), retenu à la place une découverte centralisée façon Etsy (recherche/parcours cross-boutiques) avec panier/checkout qui restent scopés à une seule boutique comme avant.

Livré : module backend `marketplace/` (service + controller + routes, monté à part dans `app.ts` pour éviter toute collision avec la route `/api/storefront/:slug`), `GET /api/marketplace/products` (recherche texte sur le nom, filtre département, pagination — jusqu'ici absente même du storefront par-boutique), `GET /api/marketplace/boutiques`. Page frontend `/marketplace` (recherche, filtre département par select, grille produits avec badge "vendu par X" liant vers la fiche produit réelle de la boutique), lien "Découvrir les boutiques" ajouté à la landing page à côté du CTA marchand.

**Découverte en cours de route :** en testant, deux boutiques supplémentaires sont apparues en base (« Boutique Playwright », « Ma Petite Boutique ») en plus de la boutique seed — confirmant que Jaslin codait bel et bien en parallèle sur SHOPAY (quotas de facturation) pendant cette session, comme suspecté après avoir vu `plans.ts`/`billing.*` se modifier tout seuls. Signalé à Jaslin en cours de session, confirmé sans conflit (fichiers disjoints).

**Vérifié en API réelle** (contre les serveurs déjà en cours d'exécution, sans en relancer de nouveaux) : agrégation correcte des produits des 3 boutiques actives, recherche texte filtrant correctement, filtre département correct, département invalide ignoré proprement (fallback silencieux) plutôt que 500. Page `/marketplace` confirmée servie (200) par le serveur Next.js déjà actif. `tsc --noEmit` propre côté backend et frontend.

**Auth complétée dans la foulée (vérification email + mot de passe oublié) :** faille critique restante de l'audit, corrigée en reprenant le pattern déjà utilisé sur LAKAY/POSTA (jeton opaque 32 octets, seul le hash SHA-256 stocké en base). Schéma : `User.isVerified`, modèles `EmailVerificationToken` (24h) et `PasswordResetToken` (usage unique, 1h). `utils/email.ts` créé (wrapper nodemailer best-effort, log le contenu en dev si SMTP absent). `register()` envoie l'email de vérification sans bloquer l'inscription si l'envoi échoue ; `login()` ne bloque pas sur `isVerified` (même choix que LAKAY, évite de verrouiller un compte si le SMTP tombe en panne) ; `forgotPassword()` ne révèle jamais si l'email existe ; `resetPassword()` révoque tous les refresh tokens actifs. Nouvelles routes `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password` + pages frontend correspondantes.

**Vérifié sur une instance temporaire dédiée (port 4999)**, pour ne pas perturber le serveur de Jaslin déjà en cours d'exécution : vérification email (token valide/rejoué/invalide), reset password complet (ancien mot de passe révoqué, nouveau accepté, token à usage unique), non-énumération confirmée. Données de test nettoyées.

**Important pour Jaslin :** son serveur backend déjà en cours d'exécution devra être redémarré pour charger le nouveau client Prisma (nouveaux modèles) et les nouvelles routes auth — pas fait automatiquement pour ne pas interrompre son travail en cours sur la facturation.

**Reste à faire sur SHOPAY :** email de vérification/mot de passe oublié, intégration MonCash réelle, câblage des notifications `ORDER_PLACED`/`LOW_STOCK`/`PAYMENT_PROOF_SUBMITTED` (modélisées mais jamais déclenchées), quota au-delà du nombre de produits, coupons/remboursements/avis absents, taux de change HTG→USD codé en dur, zéro test automatisé, jamais commité en git.

**`livrables/reseau/` clarifié dans la foulée :** confirmé par Jaslin, il s'agit d'un document de formation pour un réseau (informatique), pas un projet logiciel. Ajouté à `context/CONTEXT.md` sous l'activité d'enseignement.

---

## 2026-07-07

### POSTA : découverte du projet et complétion de bout en bout (mail views, dashboard, utilisateurs, audit, emails transactionnels, facturation, landing page)

**Contexte :** en `/prime`, git status a révélé un dossier `livrables/applications/POSTA/` jamais documenté ni mentionné en mémoire ou en contexte : un projet déjà entamé (backend Express/Prisma/PostgreSQL + frontend Next.js, migration datée du 2026-07-06). Après exploration, confirmé avec Jaslin : POSTA est une plateforme permettant de créer des adresses email personnalisées sur son propre nom de domaine (façon Migadu/Google Workspace en plus petit). Session longue, entièrement consacrée à faire passer ce projet de "panel squelette" à "quasi prêt pour un premier client".

**Backend, état initial vérifié en conditions réelles (API réelle, pas juste lecture de code) :** auth (login/refresh/logout/me, cookies httpOnly), domaines (création + génération clé DKIM + vérification DNS MX/SPF/DKIM/DMARC), boîtes mail et alias (nested sous `/api/domains/:id/...`, correctement câblés — un doute initial sur un routing manquant s'est avéré infondé après vérification). Aucun bug trouvé sur ce périmètre.

**Vues SQL Postfix/Dovecot (chantier jugé le plus bloquant) :** le schéma Prisma mentionnait des vues jamais créées. Migration manuelle ajoutée (`mail_views`) : trois vues en lecture seule (`mail_domains`, `mail_mailboxes`, `mail_aliases`, un domaine n'étant éligible au mail qu'une fois son statut `VERIFIE`) + deux rôles Postgres à privilèges minimaux (`postfix_ro` sans accès à la colonne mot de passe via GRANT column-level, `dovecot_ro` avec). Vérifié avec `SET ROLE` : `postfix_ro` confirmé bloqué sur la colonne password, `dovecot_ro` confirmé autorisé. Documentation complète `docs/MAIL_SERVER_SETUP.md` rédigée pour la configuration Postfix/Dovecot/OpenDKIM réelle sur un VPS (aucun VPS encore provisionné, chantier hors périmètre de cette session, feuille de route donnée à Jaslin en fin de session).

**Dashboard frontend construit de zéro** (le frontend n'avait qu'une page de login) : layout authentifié (sidebar, déconnexion), page Domaines (création, statuts, indicateurs MX/SPF/DKIM/DMARC), page détail domaine (vérification DNS avec instructions copiables, CRUD boîtes mail et alias). Client API avec intercepteur de refresh automatique, middleware Next.js de protection des routes.

**Gestion des utilisateurs :** SUPER_ADMIN peut créer des comptes CLIENT_ADMIN, les désactiver (révocation immédiate des sessions). Décision prise en cours de route : l'admin ne choisit plus le mot de passe du client à la création (sécurité), un email d'invitation avec lien à usage unique le fait choisir lui-même.

**Emails transactionnels :** utilitaire mailer (nodemailer, no-op gracieux si SMTP non configuré, contenu loggé en dev faute de SMTP réel dans l'environnement). Mot de passe oublié (jeton opaque à usage unique, 1h, hash SHA-256) et email d'invitation branchés sur le même mécanisme. Vérifiés en navigateur avec extraction du jeton depuis les logs.

**Journal d'audit :** le modèle `AuditLog` existait dans le schéma mais n'était écrit nulle part. Branché sur toutes les actions sensibles (connexion/déconnexion, CRUD domaines/boîtes mail/alias, activation/désactivation compte, validation paiement), page dédiée SUPER_ADMIN.

**Plans, quotas et facturation :** structure de plans (FREE/STARTER/PRO/BUSINESS, prix HTG et limites domaines/boîtes/stockage) validée avec Jaslin avant codage. Quotas réellement appliqués à la création de domaine/boîte mail (pas juste affichés), SUPER_ADMIN exempté. Paiement MonCash manuel (preuve + validation admin, comme LAKAY) et Stripe Checkout + webhook idempotent (clés réelles indisponibles dans l'environnement, jamais testé contrairement au reste). **Bug trouvé et corrigé pendant la vérification navigateur** : les nouvelles boîtes mail recevaient le quota par défaut du schéma Prisma (1024 Mo) au lieu du quota du plan actif (ex. 500 Mo pour Starter) quand aucune valeur n'était fournie explicitement — corrigé, le quota est désormais toujours résolu depuis le plan.

**Landing page publique :** suite à la question de Jaslin ("est-ce qu'il ne devrait pas y avoir une page web ?"), choix fait ensemble (page vitrine + CTA "nous contacter", onboarding manuel assumé plutôt qu'auto-inscription) car le VPS mail n'existe pas encore et ouvrir l'auto-inscription donnerait une fausse impression de service fonctionnel. Restructuration du routage : dashboard authentifié déplacé de `/` vers `/app`, racine devenue la landing publique avec tarifs réels (tirés de l'API, rendue publique) et middleware simplifié.

**Vérifications :** tout vérifié en navigateur à chaque étape (Playwright réinstallé à la volée dans le scratchpad à plusieurs reprises, browser Chromium déjà en cache). Quelques faux départs sans lien avec le code applicatif : processus backend zombie sur le port 4004 après un `Stop-Process` incomplet (répété deux fois), sélecteur Playwright ambigu (`:has-text` insensible à la casse ayant matché le mauvais lien), jeton de reset à usage unique déjà consommé lors d'un rejeu de script.

**Reste à faire :** provisionner un vrai VPS mail (le seul vrai bloquant), tester Stripe avec de vraies clés, credentials MonCash Digicel toujours en attente (comme LAKAY/KONEKTE), aucun test automatisé.

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
