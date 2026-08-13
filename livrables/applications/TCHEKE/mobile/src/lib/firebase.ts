import { initializeApp, getApps } from "firebase/app";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";
import { initializeAuth, signInAnonymously, onAuthStateChanged, type User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * `getReactNativePersistence` existe reellement a l'execution (Metro resout
 * correctement l'export conditionnel "react-native" de @firebase/auth,
 * confirme dans node_modules/@firebase/auth/package.json), mais tsc ne le
 * voit pas : la cle "types" externe du package.json court-circuite la
 * condition "react-native" imbriquee (quirk connu de resolution des exports
 * conditionnels, pas un bug de notre code). Frontiere non typee volontaire,
 * limitee a ce seul symbole, plutot qu'une suppression globale.
 */
type FonctionPersistanceRN = (
  storage: typeof AsyncStorage,
) => NonNullable<Parameters<typeof initializeAuth>[1]>["persistence"];
const modeleAuthRN = require("@firebase/auth") as { getReactNativePersistence: FonctionPersistanceRN };
const getReactNativePersistence = modeleAuthRN.getReactNativePersistence;

/**
 * Config publique du projet Firebase (pas un secret : les regles Firestore
 * sont la vraie barriere, cf. firestore.rules). A remplacer par la config
 * reelle une fois le projet Firebase cree (meme procedure que ASSOCOTISE).
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

/**
 * ATTENTION - limite connue (a revoir) : `persistentLocalCache` (approche
 * ASSOCOTISE) est une API web basee sur IndexedDB, indisponible sur React
 * Native (confirme en conditions reelles : warning Firebase + repli silencieux
 * sur le cache memoire). Le SDK JS "firebase" pur n'offre pas de persistance
 * disque sur RN ; seul le cache memoire fonctionne ici (donnees perdues au
 * redemarrage de l'app hors ligne). Une vraie persistance offline (coeur du
 * produit, cf. PLAN.md) demanderait de migrer vers @react-native-firebase/
 * firestore (module natif) - a decider avec Jaslin, pas fait dans ce correctif.
 */
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
});

/**
 * Auth avec persistance AsyncStorage : sans ca, Firebase Auth retombe sur une
 * persistance memoire (l'utilisateur anonyme changerait d'uid a chaque
 * redemarrage de l'app, perdant ses contributions de taux et son abonnement
 * push). Confirme en conditions reelles (warning Firebase corrige par ce fix).
 */
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

/**
 * Auth anonyme automatique : zero friction a l'ouverture (pas de compte),
 * mais un uid stable qui permet de contribuer au taux et de recevoir des push
 * (cf. regles Firestore, taux_kontribisyon et push_tokens exigent request.auth).
 */
export function assurerAuthAnonyme(): Promise<User> {
  return new Promise((resolve, reject) => {
    const desabonner = onAuthStateChanged(auth, (user) => {
      desabonner();
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth).then((cred) => resolve(cred.user)).catch(reject);
      }
    });
  });
}
