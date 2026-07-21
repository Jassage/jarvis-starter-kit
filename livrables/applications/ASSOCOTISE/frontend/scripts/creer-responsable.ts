/**
 * Crée (ou remet à niveau) un compte responsable finances.
 *
 * Raison d'être : les règles Firestore exigent d'être déjà responsable finances pour
 * créer un compte dans `users`. Le tout premier compte d'une association ne peut donc
 * pas naître depuis l'application elle-même — c'est ce script qui l'amorce.
 *
 * Émulateur (par défaut) :
 *   npm run emulators           # dans un terminal
 *   npm run creer-responsable -- responsable@monasso.ht "Mon Nom" MotDePasse123!
 *
 * Projet Firebase réel :
 *   Récupérer une clé de compte de service (Console Firebase > Paramètres du projet >
 *   Comptes de service > Générer une nouvelle clé privée), puis :
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=/chemin/cle.json \
 *   ASSOCOTISE_PROJECT_ID=mon-projet \
 *   ASSOCOTISE_ENV=production \
 *   npm run creer-responsable -- responsable@monasso.ht "Mon Nom" MotDePasse123!
 */
const PRODUCTION = process.env.ASSOCOTISE_ENV === 'production';

if (!PRODUCTION) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
}

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = process.env.ASSOCOTISE_PROJECT_ID ?? 'assocotise-dev';

const [email, nom, motDePasse] = process.argv.slice(2);

if (!email || !nom || !motDePasse) {
  console.error('Usage : npm run creer-responsable -- <email> "<nom complet>" <motDePasse>');
  process.exit(1);
}

if (motDePasse.length < 8) {
  console.error('Le mot de passe doit contenir au moins 8 caractères.');
  process.exit(1);
}

const app = PRODUCTION
  ? initializeApp({ projectId: PROJECT_ID, credential: applicationDefault() })
  : initializeApp({ projectId: PROJECT_ID });
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  console.log(
    PRODUCTION
      ? `Cible : projet Firebase réel « ${PROJECT_ID} »`
      : `Cible : émulateur local (projet « ${PROJECT_ID} »)`
  );

  let uid: string;
  try {
    const existant = await auth.getUserByEmail(email);
    uid = existant.uid;
    await auth.updateUser(uid, { password: motDePasse, displayName: nom });
    console.log(`Compte Auth existant réutilisé, mot de passe mis à jour (${email}).`);
  } catch {
    const cree = await auth.createUser({ email, password: motDePasse, displayName: nom });
    uid = cree.uid;
    console.log(`Compte Auth créé (${email}).`);
  }

  // `creePar: uid` (lui-même) : le premier compte n'a par définition aucun créateur
  // antérieur, et le champ ne doit jamais rester vide (les règles l'exigent non vide).
  await db.collection('users').doc(uid).set({
    nom,
    email,
    role: 'responsable_finances',
    actif: true,
    creePar: uid,
    creeLe: new Date().toISOString(),
  });

  console.log(`Profil responsable finances enregistré (uid ${uid}).`);
  console.log('Connexion possible dès maintenant dans l\'application.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
