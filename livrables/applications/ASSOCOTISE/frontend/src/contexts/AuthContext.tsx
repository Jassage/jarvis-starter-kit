import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { obtenirProfil } from '../services/users.service';
import type { UtilisateurBureau } from '../types';

interface AuthContextValue {
  utilisateurFirebase: User | null;
  profil: UtilisateurBureau | null;
  chargement: boolean;
  erreurCompteInactif: boolean;
  connecter: (email: string, motDePasse: string) => Promise<void>;
  deconnecter: () => Promise<void>;
  envoyerReinitialisation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateurFirebase, setUtilisateurFirebase] = useState<User | null>(null);
  const [profil, setProfil] = useState<UtilisateurBureau | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreurCompteInactif, setErreurCompteInactif] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setErreurCompteInactif(false);
      if (!user) {
        setUtilisateurFirebase(null);
        setProfil(null);
        setChargement(false);
        return;
      }

      const p = await obtenirProfil(user.uid);
      if (!p || !p.actif) {
        // Compte désactivé (ou profil manquant) : on refuse la session côté client,
        // en plus des règles Firestore qui refuseraient de toute façon toute lecture/écriture.
        setErreurCompteInactif(true);
        await signOut(auth);
        setUtilisateurFirebase(null);
        setProfil(null);
        setChargement(false);
        return;
      }

      setUtilisateurFirebase(user);
      setProfil(p);
      setChargement(false);
    });
  }, []);

  async function connecter(email: string, motDePasse: string) {
    await signInWithEmailAndPassword(auth, email, motDePasse);
  }

  async function deconnecter() {
    await signOut(auth);
  }

  /**
   * Envoi du lien de réinitialisation Firebase. Utilisé aussi bien depuis l'écran de
   * connexion (membre du bureau qui a perdu son mot de passe) que depuis la gestion
   * des utilisateurs (le responsable finances déclenche l'envoi pour quelqu'un d'autre).
   */
  async function envoyerReinitialisation(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  return (
    <AuthContext.Provider
      value={{
        utilisateurFirebase,
        profil,
        chargement,
        erreurCompteInactif,
        connecter,
        deconnecter,
        envoyerReinitialisation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
