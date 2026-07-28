/**
 * Tests des règles Firestore.
 *
 * L'application n'a aucun backend : ces règles sont la seule barrière entre un compte du
 * bureau et la base. Elles sont donc testées ici comme du code métier, pas relues à l'œil.
 *
 * Prérequis : `npm run emulators` dans un autre terminal (l'émulateur Firestore doit
 * écouter sur 127.0.0.1:8080, voir firebase.json).
 */
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, deleteDoc, collection, addDoc, getDocs } from 'firebase/firestore';

const UID_SECRETAIRE = 'uid-secretaire';
const UID_RESPONSABLE = 'uid-responsable';
const UID_TRESORIERE = 'uid-tresoriere';
const UID_MEMBRE_COMITE = 'uid-membre-comite';
const UID_INACTIF = 'uid-inactif';
const MEMBRE_ID = 'membre-1';

let env: RulesTestEnvironment;

function secretaire() {
  return env.authenticatedContext(UID_SECRETAIRE).firestore();
}
function responsable() {
  return env.authenticatedContext(UID_RESPONSABLE).firestore();
}
function tresoriere() {
  return env.authenticatedContext(UID_TRESORIERE).firestore();
}
function membreComite() {
  return env.authenticatedContext(UID_MEMBRE_COMITE).firestore();
}
function inactif() {
  return env.authenticatedContext(UID_INACTIF).firestore();
}
function anonyme() {
  return env.unauthenticatedContext().firestore();
}

const cotisationValide = (surcharge: Record<string, unknown> = {}) => ({
  memberId: MEMBRE_ID,
  mois: '2026-07',
  montant: 500,
  date: '2026-07-15',
  moyenPaiement: 'cash',
  saisiPar: UID_SECRETAIRE,
  saisiLe: '2026-07-15T10:00:00.000Z',
  ...surcharge,
});

const depenseValide = (surcharge: Record<string, unknown> = {}) => ({
  description: 'Achat de chaises',
  categorie: 'materiel',
  montant: 4500,
  date: '2026-07-10',
  saisiPar: UID_RESPONSABLE,
  saisiLe: '2026-07-10T10:00:00.000Z',
  ...surcharge,
});

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'assocotise-tests',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  // Jeu de données de base posé en contournant les règles, comme le ferait un seed.
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users', UID_SECRETAIRE), {
      nom: 'Emmanuela Régis',
      email: 'secretaire@assocotise.ht',
      role: 'secretaire',
      actif: true,
      creePar: 'seed',
      creeLe: '2026-01-01T00:00:00.000Z',
    });
    await setDoc(doc(db, 'users', UID_RESPONSABLE), {
      nom: 'Josué Fénelon',
      email: 'responsable@assocotise.ht',
      role: 'responsable_finances',
      actif: true,
      creePar: 'seed',
      creeLe: '2026-01-01T00:00:00.000Z',
    });
    await setDoc(doc(db, 'users', UID_TRESORIERE), {
      nom: 'Wideline Charles',
      email: 'tresoriere@assocotise.ht',
      role: 'tresoriere',
      actif: true,
      creePar: 'seed',
      creeLe: '2026-01-01T00:00:00.000Z',
    });
    await setDoc(doc(db, 'users', UID_MEMBRE_COMITE), {
      nom: 'Membre du comité',
      email: 'membre-comite@assocotise.ht',
      role: 'membre_comite',
      actif: true,
      creePar: 'seed',
      creeLe: '2026-01-01T00:00:00.000Z',
    });
    await setDoc(doc(db, 'users', UID_INACTIF), {
      nom: 'Compte désactivé',
      email: 'inactif@assocotise.ht',
      role: 'responsable_finances',
      actif: false,
      creePar: 'seed',
      creeLe: '2026-01-01T00:00:00.000Z',
    });
    await setDoc(doc(db, 'members', MEMBRE_ID), {
      nom: 'Marie-Ange Joseph',
      telephone: '+509 3700 1000',
      dateAdhesion: '2025-01-10',
      statut: 'actif',
    });
  });
});

describe('accès général', () => {
  it('refuse toute lecture à un utilisateur non connecté', async () => {
    await assertFails(setDoc(doc(anonyme(), 'members', 'x'), { nom: 'X' }));
  });

  it('refuse toute écriture à un compte désactivé', async () => {
    await assertFails(addDoc(collection(inactif(), 'contributions'), cotisationValide()));
  });
});

describe('membre du comité (lecture seule)', () => {
  it('peut lire cotisations, dépenses et membres mais ne peut rien écrire', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'contributions', 'c1'), cotisationValide());
      await setDoc(doc(ctx.firestore(), 'expenses', 'd1'), depenseValide({ saisiPar: UID_RESPONSABLE }));
    });

    await assertSucceeds(getDocs(collection(membreComite(), 'contributions')));
    await assertSucceeds(getDocs(collection(membreComite(), 'expenses')));
    await assertSucceeds(getDocs(collection(membreComite(), 'members')));

    await assertFails(addDoc(collection(membreComite(), 'contributions'), cotisationValide({ saisiPar: UID_MEMBRE_COMITE })));
    await assertFails(addDoc(collection(membreComite(), 'expenses'), depenseValide({ saisiPar: UID_MEMBRE_COMITE })));
    await assertFails(addDoc(collection(membreComite(), 'members'), { nom: 'X', telephone: '+509', dateAdhesion: '2026-01-01', statut: 'actif' }));
  });

  it("n'a pas accès à la liste des comptes du bureau", async () => {
    await assertFails(getDocs(collection(membreComite(), 'users')));
  });
});

describe('cotisations', () => {
  it('accepte une cotisation valide saisie par le secrétaire', async () => {
    await assertSucceeds(addDoc(collection(secretaire(), 'contributions'), cotisationValide()));
  });

  it('refuse un montant négatif, nul ou non numérique', async () => {
    await assertFails(addDoc(collection(secretaire(), 'contributions'), cotisationValide({ montant: -500 })));
    await assertFails(addDoc(collection(secretaire(), 'contributions'), cotisationValide({ montant: 0 })));
    await assertFails(addDoc(collection(secretaire(), 'contributions'), cotisationValide({ montant: '500' })));
  });

  it('refuse un mois ou une date mal formés', async () => {
    await assertFails(addDoc(collection(secretaire(), 'contributions'), cotisationValide({ mois: 'juillet' })));
    await assertFails(addDoc(collection(secretaire(), 'contributions'), cotisationValide({ date: '15/07/2026' })));
  });

  it('refuse un membre inexistant', async () => {
    await assertFails(addDoc(collection(secretaire(), 'contributions'), cotisationValide({ memberId: 'fantome' })));
  });

  it('refuse un moyen de paiement hors liste', async () => {
    await assertFails(
      addDoc(collection(secretaire(), 'contributions'), cotisationValide({ moyenPaiement: 'crypto' }))
    );
  });

  it('refuse un champ inconnu injecté', async () => {
    await assertFails(addDoc(collection(secretaire(), 'contributions'), cotisationValide({ valide: true })));
  });

  it("refuse d'attribuer la saisie à quelqu'un d'autre", async () => {
    await assertFails(
      addDoc(collection(secretaire(), 'contributions'), cotisationValide({ saisiPar: UID_RESPONSABLE }))
    );
  });

  it('autorise coordonnateur/trésorière/secrétaire à annuler, avec signature, mais jamais le membre du comité', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'contributions', 'c1'), cotisationValide());
    });

    // Sans signature ni horodatage, même le coordonnateur est refusé.
    await assertFails(updateDoc(doc(responsable(), 'contributions', 'c1'), { annulee: true }));
    await assertSucceeds(
      updateDoc(doc(responsable(), 'contributions', 'c1'), {
        annulee: true,
        annuleePar: UID_RESPONSABLE,
        annuleeLe: '2026-07-20T10:00:00.000Z',
      })
    );

    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'contributions', 'c2'), cotisationValide());
    });
    await assertSucceeds(
      updateDoc(doc(secretaire(), 'contributions', 'c2'), {
        annulee: true,
        annuleePar: UID_SECRETAIRE,
        annuleeLe: '2026-07-20T10:00:00.000Z',
      })
    );

    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'contributions', 'c3'), cotisationValide());
    });
    await assertSucceeds(
      updateDoc(doc(tresoriere(), 'contributions', 'c3'), {
        annulee: true,
        annuleePar: UID_TRESORIERE,
        annuleeLe: '2026-07-20T10:00:00.000Z',
      })
    );

    // Le membre du comité est en lecture seule : même correctement signée, sa tentative échoue.
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'contributions', 'c4'), cotisationValide());
    });
    await assertFails(
      updateDoc(doc(membreComite(), 'contributions', 'c4'), {
        annulee: true,
        annuleePar: UID_MEMBRE_COMITE,
        annuleeLe: '2026-07-20T10:00:00.000Z',
      })
    );
  });

  it('interdit de réécrire le montant après coup', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'contributions', 'c1'), cotisationValide());
    });
    await assertFails(updateDoc(doc(responsable(), 'contributions', 'c1'), { montant: 99999 }));
  });

  it('interdit toute suppression', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'contributions', 'c1'), cotisationValide());
    });
    await assertFails(deleteDoc(doc(responsable(), 'contributions', 'c1')));
  });
});

describe('dépenses', () => {
  it('autorise coordonnateur/trésorière/secrétaire à créer une dépense, mais jamais le membre du comité', async () => {
    await assertSucceeds(
      addDoc(collection(responsable(), 'expenses'), depenseValide({ saisiPar: UID_RESPONSABLE }))
    );
    await assertSucceeds(
      addDoc(collection(secretaire(), 'expenses'), depenseValide({ saisiPar: UID_SECRETAIRE }))
    );
    await assertSucceeds(
      addDoc(collection(tresoriere(), 'expenses'), depenseValide({ saisiPar: UID_TRESORIERE }))
    );
    // Le membre du comité est en lecture seule : même avec un saisiPar correct, refusé.
    await assertFails(
      addDoc(collection(membreComite(), 'expenses'), depenseValide({ saisiPar: UID_MEMBRE_COMITE }))
    );
  });

  it("interdit de réécrire l'auteur ou l'horodatage de saisie", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'expenses', 'd1'), depenseValide());
    });
    await assertFails(
      updateDoc(doc(responsable(), 'expenses', 'd1'), {
        saisiPar: UID_SECRETAIRE,
        modifieLe: '2026-07-20T10:00:00.000Z',
      })
    );
  });

  it('exige une trace pour toute correction de fond', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'expenses', 'd1'), depenseValide());
    });
    await assertFails(updateDoc(doc(responsable(), 'expenses', 'd1'), { montant: 7777 }));
    await assertSucceeds(
      updateDoc(doc(responsable(), 'expenses', 'd1'), {
        montant: 7777,
        modifieLe: '2026-07-20T10:00:00.000Z',
      })
    );
  });
});

describe('comptes du bureau', () => {
  it('empêche un responsable de se désactiver lui-même', async () => {
    await assertFails(updateDoc(doc(responsable(), 'users', UID_RESPONSABLE), { actif: false }));
  });

  it('empêche un secrétaire de se promouvoir', async () => {
    await assertFails(updateDoc(doc(secretaire(), 'users', UID_SECRETAIRE), { role: 'responsable_finances' }));
  });

  it('autorise le responsable à désactiver un autre compte', async () => {
    await assertSucceeds(updateDoc(doc(responsable(), 'users', UID_SECRETAIRE), { actif: false }));
  });
});

describe('relances', () => {
  const relanceValide = (surcharge: Record<string, unknown> = {}) => ({
    memberId: MEMBRE_ID,
    mois: '2026-07',
    canal: 'whatsapp',
    envoyeePar: UID_SECRETAIRE,
    envoyeeLe: '2026-07-20T10:00:00.000Z',
    ...surcharge,
  });

  it('accepte une relance du secrétaire', async () => {
    await assertSucceeds(addDoc(collection(secretaire(), 'reminders'), relanceValide()));
  });

  it('refuse un canal inconnu et un auteur usurpé', async () => {
    await assertFails(addDoc(collection(secretaire(), 'reminders'), relanceValide({ canal: 'pigeon' })));
    await assertFails(addDoc(collection(secretaire(), 'reminders'), relanceValide({ envoyeePar: UID_RESPONSABLE })));
  });

  it('interdit toute modification ou suppression', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'reminders', 'r1'), relanceValide());
    });
    await assertFails(updateDoc(doc(responsable(), 'reminders', 'r1'), { canal: 'email' }));
    await assertFails(deleteDoc(doc(responsable(), 'reminders', 'r1')));
  });
});

describe('paramètres', () => {
  const parametresValides = (surcharge: Record<string, unknown> = {}) => ({
    nomAssociation: 'Asso Test',
    montantCotisation: 500,
    devise: 'HTG',
    indicatifPays: '509',
    modeleRelance: 'Bonjour {nom}',
    majPar: UID_RESPONSABLE,
    majLe: '2026-07-20T10:00:00.000Z',
    ...surcharge,
  });

  it('réserve l’écriture au responsable finances', async () => {
    await assertFails(
      setDoc(doc(secretaire(), 'settings', 'association'), parametresValides({ majPar: UID_SECRETAIRE }))
    );
    await assertSucceeds(setDoc(doc(responsable(), 'settings', 'association'), parametresValides()));
  });

  it('refuse un indicatif non numérique, un modèle vide et un montant nul', async () => {
    await assertFails(
      setDoc(doc(responsable(), 'settings', 'association'), parametresValides({ indicatifPays: '+509' }))
    );
    await assertFails(
      setDoc(doc(responsable(), 'settings', 'association'), parametresValides({ modeleRelance: '' }))
    );
    await assertFails(
      setDoc(doc(responsable(), 'settings', 'association'), parametresValides({ montantCotisation: 0 }))
    );
  });
});

describe('exercices comptables', () => {
  async function cloturer2025() {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'exercices', '2025'), {
        annee: '2025',
        statut: 'cloture',
        soldeReporte: 0,
        totalCotise: 10000,
        totalDepense: 4000,
        soldeFinal: 6000,
        clotureLe: '2026-01-05T10:00:00.000Z',
        cloturePar: UID_RESPONSABLE,
      });
    });
  }

  it('réserve la clôture au responsable finances, signée', async () => {
    await assertFails(
      setDoc(doc(secretaire(), 'exercices', '2025'), {
        annee: '2025',
        statut: 'cloture',
        soldeReporte: 0,
        clotureLe: '2026-01-05T10:00:00.000Z',
        cloturePar: UID_SECRETAIRE,
      })
    );
    // Une clôture sans signature est refusée même au responsable.
    await assertFails(
      setDoc(doc(responsable(), 'exercices', '2025'), {
        annee: '2025',
        statut: 'cloture',
        soldeReporte: 0,
      })
    );
    await assertSucceeds(
      setDoc(doc(responsable(), 'exercices', '2025'), {
        annee: '2025',
        statut: 'cloture',
        soldeReporte: 0,
        clotureLe: '2026-01-05T10:00:00.000Z',
        cloturePar: UID_RESPONSABLE,
      })
    );
  });

  it("interdit toute écriture sur une année clôturée", async () => {
    await cloturer2025();
    await assertFails(
      addDoc(collection(secretaire(), 'contributions'), cotisationValide({ mois: '2025-06', date: '2025-06-10' }))
    );
    await assertFails(
      addDoc(collection(responsable(), 'expenses'), depenseValide({ date: '2025-06-10' }))
    );
  });

  it("interdit d'annuler une cotisation d'une année clôturée", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(
        doc(ctx.firestore(), 'contributions', 'c2025'),
        cotisationValide({ mois: '2025-06', date: '2025-06-10' })
      );
    });
    await cloturer2025();
    await assertFails(
      updateDoc(doc(responsable(), 'contributions', 'c2025'), {
        annulee: true,
        annuleePar: UID_RESPONSABLE,
        annuleeLe: '2026-07-20T10:00:00.000Z',
      })
    );
  });

  it("laisse l'année en cours ouverte à l'écriture", async () => {
    await cloturer2025();
    await assertSucceeds(addDoc(collection(secretaire(), 'contributions'), cotisationValide()));
  });

  it('permet la réouverture, puis de nouveau les écritures', async () => {
    await cloturer2025();
    await assertSucceeds(
      updateDoc(doc(responsable(), 'exercices', '2025'), {
        statut: 'ouvert',
        rouvertLe: '2026-07-20T10:00:00.000Z',
        rouvertPar: UID_RESPONSABLE,
      })
    );
    await assertSucceeds(
      addDoc(collection(secretaire(), 'contributions'), cotisationValide({ mois: '2025-06', date: '2025-06-10' }))
    );
  });

  it('interdit la suppression d’un exercice', async () => {
    await cloturer2025();
    await assertFails(deleteDoc(doc(responsable(), 'exercices', '2025')));
  });
});
