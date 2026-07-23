# TCHEKE — Worker

Service Node qui collecte les tirages borlette (NY + FL), publie les resultats
sur Firestore, envoie les notifications push, et tient a jour les taux de
change. Voir [`../PLAN.md`](../PLAN.md) pour le contexte complet du projet.

## Ce qui est fait vs ce qui reste a brancher

**Fait et teste :**
- `src/borlette/mapping.ts` — calcul des 5 valeurs (1ye/2em/3em lo, Lotto3/4) a
  partir d'un tirage brut. C'est le coeur metier, couvert par
  `mapping.test.ts`. Regle validee avec Jaslin : 1ye lo = 2 derniers chiffres du
  Lotto3, 2em lo = 2 derniers du Lotto4, 3em lo = 2 premiers du Lotto4. Tout est
  manipule en `string`, jamais en `number` (zeros de tete).
- `src/publish.ts` — ecriture idempotente dans `tirages` (transaction Firestore,
  jamais de doublon, jamais de double notification).
- `src/push.ts` — notification Expo Push aux abonnes des qu'un tirage est
  *nouveau*.
- `src/taux/brh.ts` — agregation robuste (moyenne elaguee) du taux de rue
  crowdsource par ville.
- `src/index.ts` — planification cron autour des heures de tirage (NY midi
  ~12h30, FL midi 13h30, NY soir ~19h30, FL soir 21h45, heure de l'Est), avec
  une passe de rattrapage apres chaque heure au cas ou la source tarde.
- `src/scripts/backfill.ts` — import de l'historique NY depuis Open Data NY
  (gratuit) pour peupler les statistiques des le lancement.

**Fait et verifie en conditions reelles (pas juste des fixtures) :**
- `src/sources/scraping.ts` — scraping reel de lotteryusa.com (NY + FL, midi et
  soir). Verifie par un vrai appel au site en direct : 8 pages testees
  (HTTP 200, aucun blocage contrairement a data.ny.gov), structure HTML stable
  inspectee directement, pipeline complet execute de bout en bout
  (scraping -> parsing -> `construireResultat`) avec les vraies donnees du
  jour. **Bug reel trouve et corrige pendant cette verification** : la Floride
  ajoute un numero bonus "Fireball" (`class="c-ball--fire"`) dans la meme
  liste que les 4 vrais chiffres du Pick 4 — sans filtre, le parsing
  renvoyait 5 chiffres au lieu de 4. Couvert par un test avec un fixture HTML
  reel (`scraping.test.ts`). Un garde-fou supplementaire : un tirage n'est
  publie que si la page Lotto 3 ET la page Lotto 4 confirment toutes deux la
  date demandee (evite de melanger un ancien Lotto 4 pas encore mis a jour
  avec un nouveau Lotto 3).
  Note : une API JSON interne existe (`/api/draws/US_{etat}_{jeu}/{date}`)
  mais son corps est chiffre sans cle disponible, d'ou le choix du scraping HTML.
- `src/sources/ny.ts` — les noms de colonnes exacts du dataset Socrata
  (`midday_numbers`, `midday_win_4`, etc.) sont a confirmer sur
  https://data.ny.gov une fois l'acces disponible (isoles dans `mapLigne`).
  Ce dataset sert uniquement au **backfill historique** (accuse plusieurs
  jours de retard, confirme lors de l'exploration des sources — inutilisable
  pour le direct).
- `src/taux/brh.ts::enregistrerTauxBrh` — la recuperation reelle du taux BRH
  (pas d'API ouverte connue ; scraping du bulletin ou saisie manuelle admin a
  decider).
- Envoi des `push_tokens` depuis l'app (collection `push_tokens/{token}` avec
  `{ token, bolet: true }`), cote mobile.

## Installation

Le projet Firebase reel (`tcheke-dev`) est deja cree et verifie (Firestore,
regles, index, auth anonyme — voir `../PLAN.md`). Il manque juste une cle de
compte de service pour que ce worker puisse ecrire dedans (Admin SDK).

**A faire par Jaslin (meme procedure que sur ASSOCOTISE)**, la generation
d'une cle de service etant une action sensible qui merite ta propre main :
1. https://console.firebase.google.com/project/tcheke-dev/settings/serviceaccounts/adminsdk
2. "Generer une nouvelle cle privee" -> telecharge le fichier JSON
3. Deposer ce fichier quelque part en dehors du depot git (le `.gitignore`
   du worker bloque deja `service-account.json` par precaution si tu le
   places ici, mais un chemin hors-repo est plus sur)

```bash
npm install
cp .env.example .env
# renseigner GOOGLE_APPLICATION_CREDENTIALS avec le chemin vers le fichier JSON
```

## Commandes

```bash
npm test          # tests du coeur metier (mapping borlette)
npm run typecheck  # tsc --noEmit
npm run dev        # worker en watch mode
RUN_MODE=once npm start   # une seule passe puis sortie (debug)
npm run backfill -- 500   # importe les 500 derniers tirages NY (historique)
```

## Fuseau horaire

Toutes les heures de tirage sont en **heure de l'Est** (`America/New_York`),
qui correspond a l'heure d'Haiti (meme fuseau, pas de decalage).
