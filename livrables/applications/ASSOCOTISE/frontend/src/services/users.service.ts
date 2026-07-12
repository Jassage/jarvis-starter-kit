import { doc, onSnapshot, orderBy, query, collection, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db } from '../lib/firebase';
import { getSecondaryAuth, disposeSecondaryApp } from '../lib/firebase';
import type { Role, UtilisateurBureau } from '../types';

const usersRef = collection(db, 'users');

export function ecouterUtilisateurs(cb: (utilisateurs: UtilisateurBureau[]) => void) {
  const q = query(usersRef, orderBy('creeLe', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UtilisateurBureau, 'id'>) })));
  });
}

export async function obtenirProfil(uid: string): Promise<UtilisateurBureau | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<UtilisateurBureau, 'id'>) };
}

/**
 * Crée un compte secrétaire via une instance Firebase App secondaire, pour ne jamais
 * déconnecter la session du responsable finances qui effectue l'opération (voir lib/firebase.ts).
 */
export async function creerCompteSecretaire(params: {
  nom: string;
  email: string;
  motDePasse: string;
  role: Role;
  creePar: string;
}) {
  const { secondaryApp, secondaryAuth } = getSecondaryAuth();
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, params.email, params.motDePasse);
    await setDoc(doc(db, 'users', cred.user.uid), {
      nom: params.nom,
      email: params.email,
      role: params.role,
      actif: true,
      creePar: params.creePar,
      creeLe: new Date().toISOString(),
    });
    await signOut(secondaryAuth);
  } finally {
    await disposeSecondaryApp(secondaryApp);
  }
}

export async function changerStatutUtilisateur(uid: string, actif: boolean) {
  return updateDoc(doc(db, 'users', uid), { actif });
}
