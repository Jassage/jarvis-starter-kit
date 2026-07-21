# AssoCotise

Gestion financière associative : membres cotisants, cotisations mensuelles, dépenses,
tableau de bord et rapports. Application entièrement client (React + Vite + Firebase),
sans backend applicatif.

Deux rôles : **secrétaire** (membres et saisie des cotisations) et **responsable
finances** (accès complet, dépenses, comptes du bureau, paramètres).

---

## Point d'architecture important

Il n'y a **aucun serveur applicatif**. Toute personne disposant d'un compte du bureau
peut écrire dans Firestore via le SDK sans passer par les formulaires React. La sécurité
et la validation des données reposent donc **entièrement sur `firestore.rules` et
`storage.rules`** : type et format des champs, champs autorisés, montants strictement
positifs, existence du membre référencé, immuabilité de l'historique.

Toute nouvelle collection ou nouveau champ doit être déclaré dans les règles, sinon il
sera rejeté à l'écriture.

Invariants portés par les règles :

- Les **cotisations** sont en append-only : une correction crée un nouveau document,
  jamais une réécriture. Seul le champ `annulee` est modifiable, par le seul responsable
  finances.
- Les **dépenses** sont modifiables (elles n'engagent pas un tiers), mais `saisiPar` et
  `saisiLe` ne peuvent jamais être réécrits, et toute modification de fond doit porter un
  `modifieLe`.
- Les **relances** sont un journal append-only : ni modification ni suppression, pour que
  l'historique des rappels reste opposable en assemblée.
- Toute **annulation** (cotisation ou dépense) doit être signée et datée par son auteur,
  faute de quoi elle est refusée.
- Un **exercice clôturé** fige son année : aucune écriture, correction ou annulation n'y
  est plus possible, y compris pour le responsable finances.
- Aucune suppression n'est autorisée nulle part (désactivation par statut uniquement).
- Un responsable ne peut ni changer son propre rôle ni se désactiver lui-même
  (anti auto-verrouillage : l'association ne peut pas se retrouver sans administrateur).

Ces invariants sont couverts par les tests de `tests/rules.test.ts` (voir plus bas).

---

## Développement local (émulateurs)

```bash
npm install
cp .env.example .env.local     # VITE_USE_EMULATOR=true suffit pour l'émulateur
npm run emulators              # terminal 1 (Auth, Firestore, Storage, UI sur :4009)
npm run seed                   # terminal 2 : données de démonstration
npm run dev                    # terminal 3
```

Comptes de démonstration :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Secrétaire | secretaire@assocotise.ht | `Secretaire123!` |
| Responsable finances | responsable@assocotise.ht | `Responsable123!` |

---

## Mise en service sur un vrai projet Firebase

1. Créer le projet dans la console Firebase, puis activer **Authentication (Email/mot de
   passe)**, **Firestore** et **Storage**.
2. Renseigner `.env.local` avec la config SDK du projet et passer
   `VITE_USE_EMULATOR=false`.
3. Renseigner l'identifiant du projet dans `.firebaserc`.
4. Déployer les règles et les index :
   ```bash
   npx firebase deploy --only firestore:rules,firestore:indexes,storage
   ```
5. **Créer le premier compte responsable finances.** Les règles exigent d'être déjà
   responsable finances pour créer un compte : le premier ne peut donc pas naître depuis
   l'application. Générer une clé de compte de service (Console Firebase > Paramètres du
   projet > Comptes de service), puis :
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/chemin/cle.json \
   ASSOCOTISE_PROJECT_ID=mon-projet \
   ASSOCOTISE_ENV=production \
   npm run creer-responsable -- responsable@monasso.ht "Nom Complet" MotDePasseFort123!
   ```
   Tous les comptes suivants se créent depuis l'écran **Utilisateurs**.
6. Se connecter, ouvrir **Paramètres** et régler le nom de l'association, le montant de
   la cotisation mensuelle et la devise.
7. Déployer l'application :
   ```bash
   npm run build
   npx firebase deploy --only hosting
   ```

---

## Tests

Les règles Firestore sont testées comme du code métier, avec
`@firebase/rules-unit-testing` et Vitest (29 cas : validation des données, RBAC,
immuabilité, verrouillage d'exercice).

```bash
npm run emulators   # terminal 1
npm test            # terminal 2
```

Les tests chargent `firestore.rules` tel quel : modifier une règle sans mettre à jour les
tests fera échouer la suite, ce qui est le but.

---

## Exercices comptables

Un exercice correspond à une année civile (`exercices/{annee}`). Le clôturer fige
définitivement l'année et reporte son solde final sur l'exercice suivant, créé au besoin.
Le verrouillage est appliqué par les règles Firestore, pas seulement par l'interface.

Une année encore en cours ne peut pas être clôturée. La réouverture reste possible pour le
responsable finances et laisse une trace (`rouvertLe`, `rouvertPar`), les traces de la
clôture précédente étant conservées.

Le tableau de bord ne lit que l'exercice en cours plus les six derniers mois, et ajoute le
solde reporté : il ne charge jamais tout l'historique.

---

## Journal d'audit

Le journal est **dérivé des traces portées par les documents eux-mêmes**
(`saisiPar`/`saisiLe`, `modifieLe`, `annuleePar`/`annuleeLe`, `envoyeePar`/`envoyeeLe`,
`creePar`/`creeLe`), et non d'une collection de log séparée.

Raison : sans backend, un log écrit par le client pourrait tout simplement ne pas être
écrit par qui voudrait dissimuler une action, ce qui donnerait une fausse garantie. Le
dériver des documents le rend exactement aussi fiable que les données qu'il décrit.

Limite connue : une dépense modifiée plusieurs fois ne conserve que sa dernière
modification, `modifieLe` étant écrasé à chaque fois. Les cotisations, elles, gardent tout
leur historique puisqu'une correction crée un nouveau document.

---

## Application installable et hors-ligne

L'application est une PWA installable (manifeste, icônes, service worker via
`vite-plugin-pwa`) et Firestore utilise un cache persistant IndexedDB
(`persistentLocalCache`, multi-onglets). Sur une connexion instable :

- les écrans déjà visités restent consultables sans réseau (precache du service worker) ;
- les données déjà chargées restent lisibles (cache Firestore) ;
- les saisies faites hors ligne partent à la reconnexion ;
- un bandeau signale explicitement la perte de réseau, pour que personne ne croie ses
  saisies déjà enregistrées côté serveur.

Le moteur PDF et les écrans réservés au responsable finances sont chargés à la demande :
le bundle initial fait 347 kB (113 kB gzip) au lieu des 2,8 Mo d'un seul bloc.

---

## Relances des membres en retard

La page **Relances** liste, pour un mois donné, les membres actifs dont la cotisation
courante est inférieure au montant attendu, avec le reste à payer.

L'application **n'envoie rien elle-même** : sans backend, sans crédit SMS et sans API
WhatsApp Business, tout envoi automatique serait soit impossible, soit facturé. Elle ouvre
donc WhatsApp (`wa.me`) ou le client mail de l'utilisateur avec un message déjà rédigé,
puis journalise la démarche dans la collection `reminders`. **La trace atteste que le
membre du bureau a déclenché la relance, pas que le message a été reçu.**

Le modèle de message se règle dans **Paramètres** (responsable finances uniquement) et
accepte les variables `{nom}`, `{mois}`, `{montant}` et `{association}`.

Les numéros sont saisis librement dans la fiche membre (`+509 3700 1000`, `37001000`,
`(509) 3700-1000`) puis normalisés pour `wa.me`. Un numéro sans indicatif reçoit celui
configuré dans les paramètres (509 par défaut). Un numéro inexploitable affiche « Numéro
invalide » au lieu d'un lien mort.

### Mots de passe oubliés

Firebase envoie lui-même les emails de réinitialisation. Le lien « Mot de passe oublié »
de l'écran de connexion et le bouton « Réinitialiser le mot de passe » de la page
Utilisateurs déclenchent tous deux `sendPasswordResetEmail`. Aucune configuration SMTP
n'est nécessaire, mais le modèle d'email se personnalise dans la console Firebase
(Authentication > Templates).

---

## Scripts

| Script | Usage |
|--------|-------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (typecheck inclus) |
| `npm run lint` | Oxlint |
| `npm run emulators` | Émulateurs Firebase |
| `npm run seed` | Données de démonstration (émulateur uniquement) |
| `npm run creer-responsable` | Crée le premier compte responsable finances |
| `npm test` | Tests des règles Firestore (émulateur requis) |

---

## Reste à faire

- **Créer le projet Firebase réel** (voir la mise en service plus haut) : l'application
  n'a encore jamais tourné ailleurs que sur les émulateurs.
- Portail membre : aujourd'hui seuls les comptes du bureau ont un accès, un cotisant ne
  peut pas consulter sa propre situation.
- Tests de l'interface (seules les règles sont couvertes automatiquement).
- Le journal d'audit affiche les 200 entrées les plus récentes par type de donnée, sans
  pagination ni recherche par période.
