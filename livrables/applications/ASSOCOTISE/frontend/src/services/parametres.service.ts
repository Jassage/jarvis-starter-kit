import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PARAMETRES_PAR_DEFAUT, type ParametresAssociation } from '../types';

/** Document unique : une instance de l'application sert une seule association. */
const parametresRef = doc(db, 'settings', 'association');

/**
 * Écoute les paramètres. Tant que le document n'existe pas (première mise en service),
 * les valeurs par défaut sont renvoyées : l'application reste utilisable avant même
 * que le responsable finances ait ouvert l'écran Paramètres.
 */
export function ecouterParametres(cb: (parametres: ParametresAssociation) => void) {
  return onSnapshot(
    parametresRef,
    (snap) => {
      // Fusion avec les valeurs par défaut : un document enregistré avant l'ajout d'un
      // paramètre (modèle de relance, indicatif) reste exploitable sans migration.
      cb(snap.exists() ? { ...PARAMETRES_PAR_DEFAUT, ...(snap.data() as ParametresAssociation) } : PARAMETRES_PAR_DEFAUT);
    },
    () => cb(PARAMETRES_PAR_DEFAUT)
  );
}

export async function enregistrerParametres(
  valeurs: Omit<ParametresAssociation, 'majPar' | 'majLe'>,
  majPar: string
) {
  return setDoc(parametresRef, { ...valeurs, majPar, majLe: new Date().toISOString() });
}
