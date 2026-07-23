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
(profil `development` avec `expo-dev-client` deja installe). Compte EAS deja
connecte (`jassage`), projet EAS deja cree (`extra.eas.projectId` dans
`app.json`).

**Premier build reussi et verifie le 2026-07-23** (APK reellement compile et
installable, pas juste soumis). Deux correctifs de config ont ete necessaires
au passage, deja appliques ici :
- `.npmrc` (`legacy-peer-deps=true`) — EAS execute `npm ci`, plus strict que
  `npm install`, qui echouait sur le conflit de peer dependency typescript
  entre le scaffold Expo et i18next/react-i18next.
- Plugin `expo-notifications` sans `icon` custom (le fichier
  `./assets/notification-icon.png` n'existait pas, faisait echouer le
  prebuild) + ajout de `expo-font` (peer dependency manquante de
  `@expo/vector-icons`, signale par `expo doctor`).

**Limite connue et contournement necessaire (bug EAS CLI monorepo) :**
`jarvis-starter-kit` est un monorepo geant (TCHEKE n'est qu'un sous-dossier
parmi beaucoup d'autres projets). EAS Build calcule `projectRootDirectory` a
partir de l'emplacement du dossier `.git` (la racine de tout le monorepo),
mais l'archive locale ne contient que `mobile/` a plat — decalage qui fait
echouer le build avec "package.json does not exist" des la premiere etape.
Ni `EAS_NO_VCS=1` ni `EAS_PROJECT_ROOT` ne corrigent ce champ dans cette
version d'eas-cli (bug documente : github.com/expo/eas-cli/issues/2938).

**Contournement qui fonctionne** : lancer `eas build` depuis une copie de
`mobile/` qui a son PROPRE depot git (pour que `git rev-parse --show-toplevel`
retourne ce dossier lui-meme, pas la racine du monorepo) :

```bash
# Depuis mobile/, dans un dossier temporaire hors du monorepo :
cp -r . /tmp/tcheke-mobile-build --exclude=node_modules   # ou equivalent
cd /tmp/tcheke-mobile-build
git init -q && git add . && git commit -q -m "temp build snapshot"
npm install --legacy-peer-deps
npx eas-cli build --profile development --platform android --non-interactive
```

A refaire a chaque nouveau build tant que ce bug eas-cli n'est pas corrige,
ou tant que TCHEKE n'a pas son propre depot git dedie (a discuter avec
Jaslin si ca devient penible).

Une fois le build termine, ouvre le lien fourni par EAS (ou scanne le QR
code) directement sur ton telephone Android pour installer l'APK, puis lance
`npx expo start --dev-client` depuis le vrai `mobile/` pour t'y connecter
avec le code source reel.
