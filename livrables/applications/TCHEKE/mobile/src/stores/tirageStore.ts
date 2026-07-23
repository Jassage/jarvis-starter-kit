import { create } from "zustand";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit as limitQuery,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Tirage } from "../types/firestore";

interface TirageStore {
  tirages: Tirage[];
  chargement: boolean;
  horsLigne: boolean;
  demarrerEcoute: () => () => void;
}

/**
 * Ecoute temps reel de la collection `tirages` (onSnapshot Firestore).
 * Grace a la persistance offline (lib/firebase.ts), le dernier etat connu
 * reste disponible sans reseau ; `horsLigne` est deduit de `snap.metadata`
 * pour afficher un bandeau (meme pattern qu'ASSOCOTISE).
 */
export const useTirageStore = create<TirageStore>((set) => ({
  tirages: [],
  chargement: true,
  horsLigne: false,

  demarrerEcoute: () => {
    const q = query(collection(db, "tirages"), orderBy("date", "desc"), limitQuery(400));
    const desabonner = onSnapshot(
      q,
      (snap) => {
        const tirages = snap.docs.map((d) => d.data() as Tirage);
        set({
          tirages,
          chargement: false,
          horsLigne: snap.metadata.fromCache && !snap.metadata.hasPendingWrites,
        });
      },
      (erreur) => {
        console.error("Ecoute tirages en echec:", erreur);
        set({ chargement: false });
      },
    );
    return desabonner;
  },
}));
