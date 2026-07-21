/**
 * Peuple l'émulateur Firebase (Auth + Firestore) avec des données de démonstration.
 * Ne touche jamais un vrai projet Firebase : les variables d'environnement ci-dessous
 * forcent le SDK Admin à cibler l'émulateur local (voir firebase.json pour les ports).
 *
 * Utilisation : `npm run emulators` dans un terminal, puis `npm run seed` dans un autre.
 */
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';

import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'assocotise-dev';

const app = initializeApp({ projectId: PROJECT_ID });
const auth = getAuth(app);
const db = getFirestore(app);

const NOMS_MEMBRES = [
  'Marie-Ange Joseph',
  'Jean Baptiste',
  'Rose-Michelle Pierre',
  'Frantz Michel',
  'Nadège Louis',
  'Wilner Charles',
  'Guerline Alexandre',
  'Sonson Estimable',
  'Yvrose Bien-Aimé',
  'Patrick Desrosiers',
];

const MOYENS: Array<'cash' | 'moncash' | 'natcash' | 'virement'> = ['cash', 'moncash', 'natcash', 'virement'];

function moisDecale(delta: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function creerCompte(email: string, motDePasse: string, nom: string, role: 'secretaire' | 'responsable_finances') {
  let uid: string;
  try {
    const existant = await auth.getUserByEmail(email);
    uid = existant.uid;
  } catch {
    const cree = await auth.createUser({ email, password: motDePasse, displayName: nom });
    uid = cree.uid;
  }
  await db.collection('users').doc(uid).set({
    nom,
    email,
    role,
    actif: true,
    creePar: 'seed',
    creeLe: new Date().toISOString(),
  });
  return uid;
}

async function main() {
  console.log('Seed AssoCotise — émulateur local uniquement');

  const secretaireUid = await creerCompte('secretaire@assocotise.ht', 'Secretaire123!', 'Emmanuela Régis', 'secretaire');
  const responsableUid = await creerCompte(
    'responsable@assocotise.ht',
    'Responsable123!',
    'Josué Fénelon',
    'responsable_finances'
  );
  console.log('Comptes créés : secretaire@assocotise.ht / responsable@assocotise.ht (mot de passe voir script)');

  const membreIds: string[] = [];
  for (const [index, nom] of NOMS_MEMBRES.entries()) {
    const dateAdhesion = new Date();
    dateAdhesion.setMonth(dateAdhesion.getMonth() - (12 - index));
    const ref = await db.collection('members').add({
      nom,
      telephone: `+509 3${String(700 + index).padStart(3, '0')}${String(1000 + index).padStart(4, '0')}`,
      email: `${nom.toLowerCase().replace(/[^a-z]+/g, '.')}@example.ht`,
      dateAdhesion: dateAdhesion.toISOString().slice(0, 10),
      statut: index === 9 ? 'inactif' : 'actif',
    });
    membreIds.push(ref.id);
  }
  console.log(`${membreIds.length} membres créés.`);

  // Cotisations sur les 4 derniers mois, la plupart des membres à jour, quelques retards volontaires,
  // et une correction explicite pour vérifier l'historique append-only.
  let nbCotisations = 0;
  for (let m = -3; m <= 0; m++) {
    const mois = moisDecale(m);
    for (const [index, memberId] of membreIds.slice(0, 9).entries()) {
      const enRetardCeMois = m === 0 && (index === 2 || index === 5);
      if (enRetardCeMois) continue;
      const montant = index === 0 ? 800 : index === 3 ? 1000 : 500;
      await db.collection('contributions').add({
        memberId,
        mois,
        montant,
        date: `${mois}-05`,
        moyenPaiement: MOYENS[index % MOYENS.length],
        saisiPar: index % 2 === 0 ? secretaireUid : responsableUid,
        saisiLe: new Date(new Date(`${mois}-05`).getTime() + 1000 * 60 * 60).toISOString(),
      });
      nbCotisations++;
    }
  }
  // Correction : le membre 0 avait en fait payé plus le mois dernier — nouveau document, pas d'écrasement.
  const moisPrecedent = moisDecale(-1);
  const premiereCotisationSnap = await db
    .collection('contributions')
    .where('memberId', '==', membreIds[0])
    .where('mois', '==', moisPrecedent)
    .limit(1)
    .get();
  if (!premiereCotisationSnap.empty) {
    await db.collection('contributions').add({
      memberId: membreIds[0],
      mois: moisPrecedent,
      montant: 1200,
      date: `${moisPrecedent}-20`,
      moyenPaiement: 'moncash',
      note: 'Correction : montant initial mal saisi',
      saisiPar: responsableUid,
      saisiLe: new Date(new Date(`${moisPrecedent}-20`).getTime() + 1000 * 60 * 60 * 24).toISOString(),
      corrige: premiereCotisationSnap.docs[0].id,
    });
    nbCotisations++;
  }
  console.log(`${nbCotisations} cotisations créées (avec 1 correction).`);

  const depenses = [
    { description: 'Achat chaises pour réunion mensuelle', categorie: 'materiel', montant: 4500 },
    { description: 'Location salle pour assemblée générale', categorie: 'logistique', montant: 6000 },
    { description: 'Impression cahier de comptes', categorie: 'administratif', montant: 1200 },
    { description: 'Étude de marché projet business', categorie: 'projet_business', montant: 8000 },
  ] as const;
  for (const d of depenses) {
    await db.collection('expenses').add({
      ...d,
      date: `${moisDecale(0)}-10`,
      saisiPar: responsableUid,
      saisiLe: new Date().toISOString(),
    });
  }
  console.log(`${depenses.length} dépenses créées.`);

  console.log('\nSeed terminé.');
  console.log('Connexion secrétaire   : secretaire@assocotise.ht / Secretaire123!');
  console.log('Connexion responsable  : responsable@assocotise.ht / Responsable123!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
