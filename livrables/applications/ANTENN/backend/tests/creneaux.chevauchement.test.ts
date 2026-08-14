import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../src/config/database';
import { createCreneau, updateCreneau, dupliquerCreneau } from '../src/modules/grille/creneaux.service';

// Garde de non-chevauchement de la grille : une chaîne linéaire ne diffuse qu'un seul
// programme à un instant t. La règle vit dans une requête SQL (bornes half-open), elle
// ne peut donc pas être testée hors base sans réimplémenter ce qu'on veut vérifier.
//
// Ce test tourne sur la base de développement, crée ses propres données dans une plage
// horaire lointaine (année 2030, pour ne croiser ni le seed ni un créneau réel) et
// nettoie tout derrière lui.
//
// Exécution : npm test

const D = (jour: number, heure: number, minute = 0) =>
  new Date(Date.UTC(2030, 0, jour, heure, minute, 0, 0)).toISOString();

const PLAGE_DEBUT = new Date(Date.UTC(2030, 0, 1));
const PLAGE_FIN = new Date(Date.UTC(2030, 1, 1));

let contenuId: string;

async function nettoyer() {
  const creneaux = await prisma.creneauGrille.findMany({
    where: { dateHeureDebut: { gte: PLAGE_DEBUT, lt: PLAGE_FIN } },
    select: { id: true },
  });
  const ids = creneaux.map((c) => c.id);
  if (ids.length) {
    await prisma.diffusionLog.deleteMany({ where: { creneauId: { in: ids } } });
    await prisma.audienceSession.deleteMany({ where: { creneauId: { in: ids } } });
    await prisma.replay.deleteMany({ where: { creneauId: { in: ids } } });
    await prisma.creneauGrille.deleteMany({ where: { id: { in: ids } } });
  }
}

before(async () => {
  await nettoyer();
  const contenu = await prisma.contenu.findFirst({ select: { id: true } });
  assert.ok(contenu, 'La base de test doit contenir au moins un contenu (npm run db:seed)');
  contenuId = contenu.id;
});

after(async () => {
  await nettoyer();
  await prisma.$disconnect();
});

const creer = (debut: string, fin: string) =>
  createCreneau({ dateHeureDebut: debut, dateHeureFin: fin, typeCreneau: 'PROGRAMME', contenuId });

describe('garde de non-chevauchement de la grille', () => {
  it('accepte deux créneaux qui ne se recouvrent pas', async () => {
    const a = await creer(D(2, 8), D(2, 9));
    const b = await creer(D(2, 10), D(2, 11));
    assert.ok(a.id && b.id);
  });

  it('accepte deux créneaux adjacents (fin de l\'un = début de l\'autre)', async () => {
    // Bornes half-open [début, fin) : coller deux programmes bout à bout est le cas
    // normal d'une grille continue, pas un conflit.
    await creer(D(3, 8), D(3, 9));
    const suivant = await creer(D(3, 9), D(3, 10));
    assert.ok(suivant.id);
  });

  it('refuse un créneau qui en recouvre partiellement un autre', async () => {
    await creer(D(4, 8), D(4, 10));
    await assert.rejects(() => creer(D(4, 9), D(4, 11)), /chevauche/i);
  });

  it('refuse un créneau entièrement inclus dans un autre', async () => {
    await creer(D(5, 8), D(5, 12));
    await assert.rejects(() => creer(D(5, 9), D(5, 10)), /chevauche/i);
  });

  it('refuse un créneau qui en englobe un autre', async () => {
    await creer(D(6, 9), D(6, 10));
    await assert.rejects(() => creer(D(6, 8), D(6, 12)), /chevauche/i);
  });

  it('refuse un créneau strictement identique à un autre', async () => {
    await creer(D(7, 8), D(7, 9));
    await assert.rejects(() => creer(D(7, 8), D(7, 9)), /chevauche/i);
  });

  it('laisse un créneau être modifié sans se déclarer en conflit avec lui-même', async () => {
    const c = await creer(D(8, 8), D(8, 10));
    const maj = await updateCreneau(c.id, { dateHeureDebut: D(8, 8), dateHeureFin: D(8, 11) });
    assert.equal(new Date(maj.dateHeureFin).toISOString(), D(8, 11));
  });

  it('refuse de déplacer un créneau sur un autre', async () => {
    const a = await creer(D(9, 8), D(9, 9));
    await creer(D(9, 10), D(9, 11));
    await assert.rejects(
      () => updateCreneau(a.id, { dateHeureDebut: D(9, 10, 30), dateHeureFin: D(9, 11, 30) }),
      /chevauche/i
    );
  });

  it('remet un créneau modifié en brouillon (il doit être re-synchronisé)', async () => {
    const c = await creer(D(10, 8), D(10, 9));
    await prisma.creneauGrille.update({
      where: { id: c.id },
      data: { syncStatus: 'SYNCHRONISE', syncedAt: new Date() },
    });
    const maj = await updateCreneau(c.id, { dateHeureFin: D(10, 9, 30) });
    assert.equal(maj.syncStatus, 'BROUILLON');
    assert.equal(maj.syncedAt, null);
  });

  it('refuse une duplication qui atterrit sur un créneau existant', async () => {
    const source = await creer(D(11, 8), D(11, 9));
    await creer(D(11, 12), D(11, 13));
    await assert.rejects(() => dupliquerCreneau(source.id, D(11, 12, 30)), /chevauche/i);
  });

  it('duplique en conservant la durée du créneau source', async () => {
    const source = await creer(D(12, 8), D(12, 9, 30));
    const copie = await dupliquerCreneau(source.id, D(12, 14));
    const dureeSource = new Date(source.dateHeureFin).getTime() - new Date(source.dateHeureDebut).getTime();
    const dureeCopie = new Date(copie.dateHeureFin).getTime() - new Date(copie.dateHeureDebut).getTime();
    assert.equal(dureeCopie, dureeSource);
    // Une copie n'est jamais synchronisée d'office : elle doit être validée par un
    // opérateur avant d'être considérée comme à l'antenne.
    assert.equal(copie.syncStatus, 'BROUILLON');
  });

  it('refuse de modifier un créneau déjà diffusé (historique figé)', async () => {
    const passe = await prisma.creneauGrille.create({
      data: {
        dateHeureDebut: new Date(Date.UTC(2030, 0, 13, 8)),
        dateHeureFin: new Date(Date.UTC(2030, 0, 13, 9)),
        typeCreneau: 'PROGRAMME',
        contenuId,
      },
    });
    // On force la fin dans le passé sans passer par le service (qui l'interdirait).
    await prisma.creneauGrille.update({
      where: { id: passe.id },
      data: { dateHeureFin: new Date(Date.now() - 60_000), dateHeureDebut: new Date(Date.now() - 3_600_000) },
    });
    await assert.rejects(() => updateCreneau(passe.id, { typeCreneau: 'PUB' }), /déjà diffusé/i);
    await prisma.creneauGrille.delete({ where: { id: passe.id } });
  });
});
