import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";
import { env } from "./env.js";

/**
 * Initialise Firebase Admin une seule fois.
 * La cle de compte de service est referencee par chemin (GOOGLE_APPLICATION_CREDENTIALS),
 * jamais commitee. L'Admin SDK contourne les regles Firestore : le worker est la
 * seule autorite qui ecrit dans `tirages`, `taux_officiel` et `taux_agrege`.
 */
function initFirebase() {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(
      readFileSync(env.firebaseCredentials, "utf-8"),
    );
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

export const db = initFirebase();
