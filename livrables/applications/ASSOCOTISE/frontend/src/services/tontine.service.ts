import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CycleTontine, Membre, ParticipantTontine, PaiementTontine, MethodeOrdreTontine } from '../types';

const cyclesRef = collection(db, 'tontineCycles');
const participantsRef = collection(db, 'tontineParticipants');
const paiementsRef = collection(db, 'tontinePayments');

export function ecouterCycles(cb: (cycles: CycleTontine[]) => void) {
  const q = query(cyclesRef, orderBy('creeLe', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CycleTontine, 'id'>) })));
  });
}

export function ecouterCycle(cycleId: string, cb: (cycle: CycleTontine | null) => void) {
  return onSnapshot(doc(db, 'tontineCycles', cycleId), (snap) => {
    cb(snap.exists() ? { id: snap.id, ...(snap.data() as Omit<CycleTontine, 'id'>) } : null);
  });
}

export function ecouterParticipants(cycleId: string, cb: (participants: ParticipantTontine[]) => void) {
  const q = query(participantsRef, where('cycleId', '==', cycleId), orderBy('position'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ParticipantTontine, 'id'>) })));
  });
}

export function ecouterPaiements(cycleId: string, cb: (paiements: PaiementTontine[]) => void) {
  const q = query(paiementsRef, where('cycleId', '==', cycleId), orderBy('periode'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaiementTontine, 'id'>) })));
  });
}

/** Tous les paiements de tontine, tous cycles confondus — utilisé par le tableau de bord global. */
export function ecouterToutesLesTontinePayments(cb: (paiements: PaiementTontine[]) => void) {
  return onSnapshot(paiementsRef, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaiementTontine, 'id'>) })));
  });
}

/** Tous les participants, tous cycles confondus — utilisé par le tableau de bord global. */
export function ecouterTousLesParticipants(cb: (participants: ParticipantTontine[]) => void) {
  return onSnapshot(participantsRef, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ParticipantTontine, 'id'>) })));
  });
}

function ordonnerParticipants(
  membres: Membre[],
  methode: MethodeOrdreTontine
): Membre[] {
  if (methode === 'aleatoire') {
    const copie = [...membres];
    for (let i = copie.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  }
  if (methode === 'anciennete') {
    return [...membres].sort((a, b) => new Date(a.dateAdhesion).getTime() - new Date(b.dateAdhesion).getTime());
  }
  return membres; // 'fixe' : ordre déjà choisi par l'utilisateur (ordre de sélection)
}

/** Crée le cycle, ordonne les participants selon la méthode choisie et génère le calendrier des tours. */
export async function creerCycleTontine(params: {
  nom: string;
  dateDebut: string;
  montantCotisation: number;
  methodeOrdre: MethodeOrdreTontine;
  membres: Membre[];
  creePar: string;
}) {
  const { nom, dateDebut, montantCotisation, methodeOrdre, membres, creePar } = params;
  const ordre = ordonnerParticipants(membres, methodeOrdre);

  const cycleDoc = await addDoc(cyclesRef, {
    nom,
    dateDebut,
    montantCotisation,
    methodeOrdre,
    statut: 'en_cours',
    creePar,
    creeLe: new Date().toISOString(),
  });

  const batch = writeBatch(db);
  ordre.forEach((membre, index) => {
    const dateReceptionPrevue = new Date(dateDebut);
    dateReceptionPrevue.setMonth(dateReceptionPrevue.getMonth() + index);
    const participantDoc = doc(participantsRef);
    batch.set(participantDoc, {
      cycleId: cycleDoc.id,
      memberId: membre.id,
      position: index + 1,
      dateReceptionPrevue: dateReceptionPrevue.toISOString(),
      aRecuSonTour: false,
    });
  });
  await batch.commit();

  return cycleDoc.id;
}

export async function saisirPaiementTontine(data: Omit<PaiementTontine, 'id'>) {
  return addDoc(paiementsRef, data);
}

export async function marquerTourRecu(participantId: string, dateReception: string) {
  return updateDoc(doc(db, 'tontineParticipants', participantId), { aRecuSonTour: true, dateReception });
}

export async function cloturerCycle(cycleId: string) {
  return updateDoc(doc(db, 'tontineCycles', cycleId), { statut: 'clos' });
}

export async function listerParticipantsUneFois(cycleId: string): Promise<ParticipantTontine[]> {
  const snap = await getDocs(query(participantsRef, where('cycleId', '==', cycleId), orderBy('position')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ParticipantTontine, 'id'>) }));
}
