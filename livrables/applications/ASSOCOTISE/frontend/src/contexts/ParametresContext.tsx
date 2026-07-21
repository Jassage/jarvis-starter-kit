import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { ecouterParametres } from '../services/parametres.service';
import { definirDeviseCourante } from '../lib/format';
import { PARAMETRES_PAR_DEFAUT, type ParametresAssociation } from '../types';

const ParametresContext = createContext<ParametresAssociation | undefined>(undefined);

export function ParametresProvider({ children }: { children: ReactNode }) {
  const { profil } = useAuth();
  const [parametres, setParametres] = useState<ParametresAssociation>(PARAMETRES_PAR_DEFAUT);

  // Les règles Firestore réservent la lecture aux comptes du bureau : on ne s'abonne
  // qu'une fois le profil chargé, et on se désabonne à la déconnexion.
  useEffect(() => {
    if (!profil) {
      setParametres(PARAMETRES_PAR_DEFAUT);
      return;
    }
    return ecouterParametres(setParametres);
  }, [profil]);

  useEffect(() => {
    definirDeviseCourante(parametres.devise);
  }, [parametres.devise]);

  return <ParametresContext.Provider value={parametres}>{children}</ParametresContext.Provider>;
}

export function useParametres() {
  const ctx = useContext(ParametresContext);
  if (!ctx) throw new Error('useParametres doit être utilisé dans un ParametresProvider');
  return ctx;
}
