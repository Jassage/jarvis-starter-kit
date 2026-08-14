import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculerTrous } from '../src/modules/grille/creneaux.service';

// Détection des trous de grille : l'algorithme dont une régression silencieuse coûte
// le plus cher (un trou non signalé = un écran noir à l'antenne). Testé en pur, sans
// base de données : `calculerTrous` ne dépend que de ses arguments.
//
// Exécution : npm test (node:test, intégré à Node 22 — aucune dépendance ajoutée).

const H = (heure: number, minute = 0) => new Date(Date.UTC(2026, 7, 13, heure, minute, 0, 0));
const FENETRE_DEBUT = H(8);
const FENETRE_FIN = H(20);

const creneau = (debut: Date, fin: Date) => ({ dateHeureDebut: debut, dateHeureFin: fin });

describe('calculerTrous', () => {
  it('signale toute la fenêtre quand la grille est vide', () => {
    const trous = calculerTrous([], FENETRE_DEBUT, FENETRE_FIN);
    assert.equal(trous.length, 1);
    assert.equal(trous[0].debut, FENETRE_DEBUT.toISOString());
    assert.equal(trous[0].fin, FENETRE_FIN.toISOString());
    assert.equal(trous[0].dureeMinutes, 12 * 60);
  });

  it('ne signale rien quand la fenêtre est couverte de bout en bout', () => {
    const trous = calculerTrous(
      [creneau(H(8), H(14)), creneau(H(14), H(20))],
      FENETRE_DEBUT,
      FENETRE_FIN
    );
    assert.deepEqual(trous, []);
  });

  it('traite deux créneaux adjacents comme une couverture continue (bornes half-open)', () => {
    // Fin de l'un = début de l'autre : il n'y a pas d'interruption d'antenne.
    const trous = calculerTrous([creneau(H(8), H(9)), creneau(H(9), H(20))], FENETRE_DEBUT, FENETRE_FIN);
    assert.deepEqual(trous, []);
  });

  it('détecte un trou entre deux créneaux', () => {
    const trous = calculerTrous(
      [creneau(H(8), H(10)), creneau(H(11, 30), H(20))],
      FENETRE_DEBUT,
      FENETRE_FIN
    );
    assert.equal(trous.length, 1);
    assert.equal(trous[0].debut, H(10).toISOString());
    assert.equal(trous[0].fin, H(11, 30).toISOString());
    assert.equal(trous[0].dureeMinutes, 90);
  });

  it('détecte un trou en début et en fin de fenêtre', () => {
    const trous = calculerTrous([creneau(H(10), H(12))], FENETRE_DEBUT, FENETRE_FIN);
    assert.equal(trous.length, 2);
    assert.equal(trous[0].dureeMinutes, 120); // 08:00 → 10:00
    assert.equal(trous[1].dureeMinutes, 8 * 60); // 12:00 → 20:00
  });

  it('tronque un créneau qui déborde avant le début de la fenêtre', () => {
    // Un programme commencé la veille couvre le début de la fenêtre : aucun trou.
    const trous = calculerTrous([creneau(H(2), H(20))], FENETRE_DEBUT, FENETRE_FIN);
    assert.deepEqual(trous, []);
  });

  it('ne recule jamais le curseur sur un créneau imbriqué dans un autre', () => {
    // Cas pathologique (ne devrait pas exister vu la garde de chevauchement, mais une
    // donnée héritée ou importée peut le produire) : le créneau court inclus dans le
    // long ne doit pas rouvrir de trou derrière lui.
    const trous = calculerTrous(
      [creneau(H(8), H(18)), creneau(H(9), H(10)), creneau(H(18), H(20))],
      FENETRE_DEBUT,
      FENETRE_FIN
    );
    assert.deepEqual(trous, []);
  });

  it('compte un trou d\'une minute (pas d\'arrondi à zéro)', () => {
    const trous = calculerTrous(
      [creneau(H(8), H(12)), creneau(H(12, 1), H(20))],
      FENETRE_DEBUT,
      FENETRE_FIN
    );
    assert.equal(trous.length, 1);
    assert.equal(trous[0].dureeMinutes, 1);
  });

  it('additionne plusieurs trous distincts', () => {
    const trous = calculerTrous(
      [creneau(H(9), H(10)), creneau(H(11), H(12)), creneau(H(13), H(14))],
      FENETRE_DEBUT,
      FENETRE_FIN
    );
    // 08→09, 10→11, 12→13, 14→20
    assert.equal(trous.length, 4);
    assert.equal(
      trous.reduce((s, t) => s + t.dureeMinutes, 0),
      60 + 60 + 60 + 6 * 60
    );
  });
});
