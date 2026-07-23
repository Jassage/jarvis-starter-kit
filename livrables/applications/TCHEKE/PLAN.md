# TCHEKE — Plan du projet

> App utilitaire haïtienne grand public. Nom de travail : **TCHEKE** (« vérifie » en kreyòl).
> Document de référence, tenu à jour au fil des chantiers.

---

## Vision

L'app que l'Haïtien ouvre plusieurs fois par jour pour les infos qui rythment son quotidien.
Construite **par couches**, en commençant par les deux usages les plus quotidiens et viraux.

```
Couche 3 (plus tard)    SÉCURITÉ (communautaire)
Couche 2 (monétisation) SERVICES À DOMICILE  ·  PHARMACIES
Couche 1 (LOCOMOTIVE)   BÒLÈT  ·  TO CHANJ
Socle partagé           comptes anonymes · géoloc · offline · notifs · Kreyòl · pub
```

Chaque couche réutilise le même socle. On ne construit la couche 2 qu'une fois la couche 1 lancée.

## Contraintes du marché (imposent tout le reste)

- Android bas de gamme + data chère → app légère, pas d'images lourdes
- Connexion instable + coupures de courant → offline-first
- Faible pouvoir d'achat → gratuit + pub, pas de paywall à l'entrée
- MonCash/NatCash comme rail de paiement (couches futures), pas la carte bancaire
- Langue : **Kreyòl par défaut**, Français en option

---

## Périmètre v1 (Bòlèt + To Chanj)

**Dans la v1 :**
- Onboarding : 2 écrans (langue + notifications), montré une seule fois, skippable
- Bòlèt : résultats du jour (4 tirages), détail + partage WhatsApp, tchèke nimewo, notifications push
- Estatistik : boules chaudes / froides
- To Chanj : taux BRH + marché, calculatrice HTG↔USD, contribution crowdsourcée, alerte de seuil
- Paramètres : langue, thème, notifications
- Publicité AdMob
- Offline-first, usage anonyme (sans compte)

**Hors v1 (architecture prête à les accueillir) :** Famasi, Sèvis, Sécurité, MonCash, comptes complets, premium.

---

## La borlette — règles métier validées avec Jaslin

4 tirages par jour, basés sur la loterie américaine :
- **New York** : midi (~12h30) et soir (~19h30)
- **Floride** : midi (13h30) et soir (21h45)

Chaque tirage produit 5 valeurs affichées :

| Valeur | Calcul | Exemple (Lotto3=456, Lotto4=7891) |
|---|---|---|
| Lotto 3 chif | le tirage à 3 chiffres | 456 |
| Lotto 4 chif | le tirage à 4 chiffres | 7891 |
| 1ye lo | 2 derniers chiffres du Lotto 3 | 56 |
| 2èm lo | 2 derniers chiffres du Lotto 4 | 91 |
| 3èm lo | 2 premiers chiffres du Lotto 4 | 78 |

**Règle critique : tout en `string`, jamais en `number`** (un Lotto 3 « 007 » ne doit jamais devenir 7).

---

## Décisions techniques

| Brique | Choix | Raison |
|---|---|---|
| Mobile | Expo + expo-router | Déjà maîtrisé (KONEKTE, REYINYON, ANTENN) |
| Données | Firestore + persistance offline | Offline natif, temps réel, maîtrisé (ASSOCOTISE) |
| Auth | Anonyme (Firebase) | Zéro friction, permet de contribuer au taux |
| Notifs | Expo Push | Gratuit, pas de plan Blaze |
| Worker | Node + cron sur Railway | Railway déjà utilisé (KONEKTE) |
| i18n | i18next + expo-localization | Kreyòl par défaut |
| État | Zustand + onSnapshot Firestore | Cohérent avec le portefeuille |
| Pub | AdMob | Standard, revenus |

**Coût au lancement : quasi zéro.** Firestore Spark, Auth anonyme, Expo Push, cache offline. Pas de Storage (aucune image utilisateur), donc pas de plan Blaze imposé.

**Source des tirages : scraping gratuit** (décidé). Open Data NY (gratuit) sert au backfill historique pour les stats ; le résultat du jour vient du scraping des sites de résultats (rapide). API tierce payante gardée en filet de secours.

---

## Modèle de données Firestore

Principe : données officielles **écrites uniquement par le worker** (Admin SDK), **lues publiquement**. Le client n'écrit que ses contributions de taux, strictement validées par les règles.

### `tirages/{date}_{etat}_{moment}`
```
date        "2026-07-22"   (YYYY-MM-DD)
etat        "NY" | "FL"
moment      "MIDI" | "SOIR"
lotto3      "056"          (STRING)
lotto4      "7891"         (STRING)
premyeLo    "56"
dezyemLo    "91"
twazyemLo   "78"
publieLe    <timestamp>
statut      "OFFICIEL"
```

### `taux_officiel/{date}`
```
date, refBrh (number), publieLe
```

### `taux_kontribisyon/{autoId}` (crowdsourcé)
```
achat, vente (number), vil, uid, kreyeLe, votesFyab (0), statut ("AKTIF"|"SIYALE")
```

### `taux_agrege/{date}_{vil}` (calculé par le worker)
```
date, vil, achatMwayen, venteMwayen, nbKontribisyon
```

**Stats borlette** : calculées côté client depuis l'historique en cache (pas de collection dédiée).
**Nimewo favoris / tchèke** : stockés en local (AsyncStorage), pas dans Firestore.

### Règles de sécurité (résumé)
- `tirages`, `taux_officiel`, `taux_agrege` : read public, write interdit au client
- `taux_kontribisyon` : read public ; create si achat/vente numériques > 0, vil connue, aucun champ en trop, votesFyab=0/statut=AKTIF ; update seulement votesFyab ou statut ; delete interdit (append-only)
- Anti-abus : moyenne pondérée écartant les extrêmes + votes + signalement (rate limiting worker si besoin)

---

## Chantiers, dans l'ordre

- **0. Fondations** — ✅ init Expo TS, structure, Firebase + offline, auth anonyme, thème light/dark, composants de base, i18n, navigation 4 onglets, onboarding. Vérifié : `tsc` propre, `expo export --platform android` réussi (1377 modules).
- **1. Worker tirages** — ✅ scraping NY+FL (lotteryusa.com, vérifié en direct), calcul des 5 valeurs (16 tests), écriture `tirages`, backfill Open Data NY, cron + retries, push Expo, taux BRH quotidien (récupération réelle du taux à décider).
- **2. Module Bòlèt** — ✅ résultats du jour, tchèke nimewo, token push + abonnement, cache offline. Détail + partage WhatsApp à vérifier visuellement.
- **3. Estatistik** — ✅ boules chaudes/froides côté client
- **4. Module To Chanj** — ✅ taux, calculatrice. **Reste** : écran de contribution utilisateur (`taux_kontribisyon`).
- **5. Onboarding + Paramètres** — ✅ 2 écrans onboarding, écran paramètres
- **6. Monétisation + build** — **reste à faire** : AdMob (nécessite un dev build EAS), build EAS APK réel sur appareil

**Firebase réel : créé et vérifié** (projet `tcheke-dev`, région `nam5`). Firestore + règles + index déployés, auth anonyme active, testé en conditions réelles avec un vrai utilisateur (écriture propre acceptée, usurpation d'uid rejetée en 403, lecture bloquée où prévu). Config SDK dans `mobile/.env`.

**Cycle complet worker → Firestore vérifié en conditions réelles (2026-07-22) :** clé de compte de service générée par Jaslin, `worker/.env` configuré, `npm start` (RUN_MODE=once) exécuté réellement — scraping du vrai site, calcul des lots, publication sur le vrai Firestore. `tirages/2026-07-22_NY_MIDI` et `tirages/2026-07-22_FL_MIDI` confirmés lisibles publiquement via l'API Firestore (donc visibles par l'app mobile telle quelle). **Bug de configuration trouvé et corrigé au passage** : `.env` n'était jamais chargé par le worker (aucun `dotenv`/`--env-file` câblé) — corrigé en ajoutant `--env-file=.env` aux scripts npm (`dev`/`start`/`backfill`).

EAS déjà connecté (compte `jassage`), `eas.json` et `expo-dev-client` prêts. **Reste avant un test complet sur appareil réel :** premier build dev (`eas build --profile development --platform android`), pas encore lancé.

## Points de vigilance

1. AdMob ne fonctionne pas dans Expo Go → dev build EAS requis
2. AdMob + contenu loterie : valider tôt que Google accepte de monétiser
3. Lectures Firestore : le cache offline absorbe l'essentiel ; optimisation possible (résultat du jour en JSON statique régénéré par le worker) gardée en réserve

## Prérequis (à la charge de Jaslin)

- ~~Créer le projet Firebase~~ **fait** (`tcheke-dev`, voir ci-dessus)
- ~~Générer la clé de compte de service Firebase~~ **fait**, cycle worker→Firestore vérifié
- ~~Connexion EAS~~ **fait** (compte `jassage`)
- Compte Railway réutilisable (déploiement du worker, pas encore fait)
- Compte AdMob (au chantier 6)

## Structure du dépôt

```
TCHEKE/
  PLAN.md          ce document
  mobile/          app Expo
  worker/          service Node (cron scraping + push + taux BRH)
```

---

## Cadre légal / éthique

- L'app affiche des **résultats publics**, ne prend **aucun pari**, ne touche **aucun argent de jeu**.
- Les stats portent une note explicite : « sa ki pase pa garanti sa k ap vini ».
