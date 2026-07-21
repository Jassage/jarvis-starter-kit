import { initializeApp, getApps, deleteApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const useEmulator = import.meta.env.VITE_USE_EMULATOR === 'true';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Cache local persistant (IndexedDB) plutôt que le cache mémoire par défaut : les écrans
 * restent consultables sans réseau et les écritures faites hors ligne sont rejouées à la
 * reconnexion. `persistentMultipleTabManager` permet d'ouvrir plusieurs onglets sans que
 * l'un d'eux perde la persistance.
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
export const storage = getStorage(app);

if (useEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}

/**
 * Une instance Firebase App secondaire, dédiée à la création de comptes secrétaire par
 * le responsable finances. `createUserWithEmailAndPassword` connecte automatiquement le
 * compte qu'il vient de créer sur l'instance sur laquelle il est appelé — en l'appelant
 * ici, la session du responsable finances sur l'instance principale (`auth`) n'est jamais touchée.
 */
export function getSecondaryAuth() {
  const name = 'secondary';
  const existing = getApps().find((a) => a.name === name);
  const secondaryApp: FirebaseApp = existing ?? initializeApp(firebaseConfig, name);
  const secondaryAuth = getAuth(secondaryApp);
  if (useEmulator) {
    connectAuthEmulator(secondaryAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
  }
  return { secondaryApp, secondaryAuth };
}

export async function disposeSecondaryApp(secondaryApp: FirebaseApp) {
  await deleteApp(secondaryApp);
}
