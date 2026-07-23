# TCHEKE — Mobile

App Expo (expo-router) du MVP TCHEKE : Bòlèt + To Chanj. Voir
[`../PLAN.md`](../PLAN.md) pour le contexte complet du projet.

## Etat verifie

- `npx tsc --noEmit` : propre
- `npx expo export --platform android` : bundle reussi (1377 modules, Hermes),
  preuve que l'app compile et s'assemble reellement, pas juste le typecheck
- **Firebase reel provisionne et verifie en conditions reelles** (projet
  `tcheke-dev`, region `nam5`) : Firestore + regles + index deployes, config
  SDK reelle dans `.env`. Cycle de securite teste avec un vrai utilisateur
  anonyme (pas juste relu) : creation de son propre `push_tokens` acceptee,
  tentative avec un uid usurpe rejetee en 403, lecture client sur
  `push_tokens` bloquee (reserve au worker), suppression de son propre
  document acceptee. Auth anonyme active.
- Scraping des tirages : voir `worker/README.md` (branche et verifie contre
  le vrai site lotteryusa.com).
- Reste non teste : notifications push reelles sur un appareil physique
  (necessite un dev build EAS, pas Expo Go), et le worker n'a pas encore de
  cle de compte de service pour ecrire dans ce projet Firebase reel.

## Structure

```
app/                    routes expo-router
  _layout.tsx           auth anonyme + i18n + theme + redirection onboarding
  onboarding/           2 ecrans : langue puis notifications (une seule fois)
  (tabs)/                Bolet, Taux, Estatistik, Plis (Parametres)
  tcheke.tsx             ecran "tcheke nimewo" (hors des tabs, ouvert en modal/push)
src/
  i18n/                 kreyol.ts (defaut) + francais.ts, memes cles (verifie par le type Dictionnaire)
  theme/                 tokens + ThemeProvider (suit le theme systeme)
  types/firestore.ts     memes types que worker/src (contrat partage)
  lib/                   firebase.ts, push.ts, onboarding.ts
  stores/                tirageStore.ts (Zustand + onSnapshot Firestore)
  bolet/estatistik.ts    calcul boules chaudes/froides + tchèke nimewo, cote client
  components/            Boul, DrawCard
```

## Installation

```bash
npm install --legacy-peer-deps
cp .env.example .env
# renseigner les EXPO_PUBLIC_FIREBASE_* une fois le projet Firebase cree
npx expo start
```

**Note sur `--legacy-peer-deps`** : necessaire a cause d'un conflit de peer
dependency entre `i18next`/`@expo/require-utils` (veulent TypeScript 5) et le
TypeScript 6 du template Expo, plus `firebase/auth` qui vise une version plus
ancienne d'`async-storage`. Aucun des deux ne casse quoi que ce soit en
pratique (verifie par le build Android reussi), mais `npx expo install`
n'accepte pas ce flag lui-meme : en cas d'ajout d'un nouveau paquet Expo,
lancer `npx expo install <paquet>` (qui peut echouer a l'etape npm interne),
puis `npm install --legacy-peer-deps` pour finir l'installation avec les
versions qu'expo aura deja ecrites dans `package.json`.

## Ce qui reste a faire (hors chantier 0)

- Chantier 4 : contribution utilisateur au taux de rue (`taux_kontribisyon`),
  pas encore d'ecran de saisie
- Chantier 6 : AdMob (necessite un dev build EAS, ne fonctionne pas dans Expo Go)
- Icones/assets reels (l'app utilise encore les icones par defaut du scaffold Expo)

## Dev build EAS (necessaire pour tester les notifications push reelles)

Expo Go ne supporte pas les notifications push ni AdMod : il faut un vrai
build EAS installe sur un appareil ou emulateur. `eas.json` est deja pret
(profil `development` avec `expo-dev-client` deja installe). Necessite un
compte Expo (EAS), pas encore connecte dans cet environnement.

```bash
npx eas-cli login          # ta propre connexion Expo, pas automatisable ici
npx eas-cli build:configure  # associe le projet a ton compte EAS (une seule fois)
npx eas-cli build --profile development --platform android
```

Une fois le build termine (APK telechargeable depuis le lien fourni par EAS),
installe-le sur ton telephone, puis lance `npx expo start --dev-client` pour
t'y connecter avec le vrai code source.
