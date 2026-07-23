import { initializeApp, getApps } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from "firebase/auth";

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
 * Persistance offline multi-onglets (meme approche qu'ASSOCOTISE) : les
 * resultats deja vus restent lisibles sans reseau, essentiel sur une
 * connexion haitienne instable.
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

export const auth = getAuth(app);

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
