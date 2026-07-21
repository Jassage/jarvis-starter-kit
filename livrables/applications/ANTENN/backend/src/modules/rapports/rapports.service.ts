import prisma from '../../config/database';

// Un sponsor est exposé de 3 façons distinctes : ses spots publicitaires (Contenu),
// ses incrustations logo (IncrustationLogo) et son sponsoring de match. On agrège
// les DiffusionLog des créneaux/matchs qui portent l'une de ces expositions.
export async function getRapportSponsors(from?: string, to?: string) {
  const sponsors = await prisma.sponsor.findMany({
    include: {
      contenus: { select: { id: true } },
      matchsTitre: { select: { id: true } },
      incrustations: { select: { id: true, creneauId: true, matchId: true } },
    },
  });

  const periode = {
    ...(from && { gte: new Date(from) }),
    ...(to && { lte: new Date(to) }),
  };

  return Promise.all(
    sponsors.map(async (sponsor) => {
      const contenuIds = sponsor.contenus.map((c) => c.id);
      const matchIds = [
        ...sponsor.matchsTitre.map((m) => m.id),
        ...sponsor.incrustations.map((i) => i.matchId).filter((v): v is string => Boolean(v)),
      ];
      const creneauIdsIncrustation = sponsor.incrustations.map((i) => i.creneauId).filter((v): v is string => Boolean(v));

      const logs = await prisma.diffusionLog.findMany({
        where: {
          ...(Object.keys(periode).length && { dateHeureReelle: periode }),
          OR: [
            { creneau: { contenuId: { in: contenuIds } } },
            { creneauId: { in: creneauIdsIncrustation } },
            { matchId: { in: matchIds } },
          ],
        },
      });

      const nombreDiffusions = logs.length;
      const dureeExpositionSecondes = logs.reduce((sum, l) => sum + l.dureeVisionneeEstimee, 0);
      const nombreVuesEstimees = logs.reduce((sum, l) => sum + l.nombreVuesEstimees, 0);

      // Exposition en replay : les vues à la demande des programmes publiés portant
      // une exposition de ce sponsor. Comptée à part, jamais additionnée aux vues
      // antenne — une vue VOD et une diffusion linéaire ne se valorisent pas pareil.
      const replays = await prisma.replay.findMany({
        where: {
          statut: 'PUBLIE',
          OR: [
            { creneau: { contenuId: { in: contenuIds } } },
            { creneauId: { in: creneauIdsIncrustation } },
            { matchId: { in: matchIds } },
          ],
        },
        select: { nombreVues: true },
      });
      const nombreReplaysPublies = replays.length;
      const vuesReplay = replays.reduce((sum, r) => sum + r.nombreVues, 0);

      return {
        sponsorId: sponsor.id,
        nomSponsor: sponsor.nomSponsor,
        typePackage: sponsor.typePackage,
        nombreDiffusions,
        dureeExpositionSecondes,
        nombreVuesEstimees,
        nombreReplaysPublies,
        vuesReplay,
      };
    })
  );
}
