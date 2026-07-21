import { addDoc, collection, limit as limiter, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CanalRelance, Relance } from '../types';

const relancesRef = collection(db, 'reminders');

export function ecouterRelancesDuMois(mois: string, cb: (relances: Relance[]) => void) {
  const q = query(relancesRef, where('mois', '==', mois), orderBy('envoyeeLe', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Relance, 'id'>) })));
  });
}

/** Dernières relances envoyées, pour le journal d'audit. */
export function ecouterDernieresRelances(limite: number, cb: (relances: Relance[]) => void) {
  const q = query(relancesRef, orderBy('envoyeeLe', 'desc'), limiter(limite));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Relance, 'id'>) })));
  });
}

/**
 * Journalise une relance. Appelé au moment où le membre du bureau ouvre WhatsApp ou son
 * client mail : l'application ne peut pas savoir si le message a effectivement été envoyé,
 * la trace atteste donc de la démarche, pas de la réception.
 */
export async function enregistrerRelance(params: {
  memberId: string;
  mois: string;
  canal: CanalRelance;
  envoyeePar: string;
}) {
  return addDoc(relancesRef, { ...params, envoyeeLe: new Date().toISOString() });
}

/** Dernière relance par membre, la liste étant déjà triée du plus récent au plus ancien. */
export function derniereRelanceParMembre(relances: Relance[]): Map<string, Relance> {
  const parMembre = new Map<string, Relance>();
  for (const r of relances) {
    if (!parMembre.has(r.memberId)) parMembre.set(r.memberId, r);
  }
  return parMembre;
}
