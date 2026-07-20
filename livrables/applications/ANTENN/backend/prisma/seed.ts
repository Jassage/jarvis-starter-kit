import { PrismaClient, TypeContenu, TypeCreneau, TypePackageSponsor, PositionOverlay } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Antenn@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@antenn.ht' },
    update: {},
    create: {
      email: 'admin@antenn.ht',
      password: passwordHash,
      nom: 'Admin Régie',
      role: 'ADMINISTRATEUR',
    },
  });

  await prisma.user.upsert({
    where: { email: 'operateur@antenn.ht' },
    update: {},
    create: {
      email: 'operateur@antenn.ht',
      password: passwordHash,
      nom: 'Opérateur Régie',
      role: 'OPERATEUR_REGIE',
    },
  });

  const sponsorPrincipal = await prisma.sponsor.create({
    data: {
      nomSponsor: 'Digicel Haïti',
      typePackage: TypePackageSponsor.TITRE_MATCH,
      contactNom: 'Marc Antoine',
      contactTelephone: '+509 3701 0000',
      dateDebutContrat: new Date('2026-01-01'),
      dateFinContrat: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // expire bientôt (20j)
    },
  });

  const sponsorBandeau = await prisma.sponsor.create({
    data: {
      nomSponsor: 'Brasserie Nationale (Prestige)',
      typePackage: TypePackageSponsor.BANDEAU,
      contactNom: 'Sophie Laurent',
      contactTelephone: '+509 3702 1111',
      dateDebutContrat: new Date('2026-02-01'),
      dateFinContrat: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
    },
  });

  const sponsorHabillage = await prisma.sponsor.create({
    data: {
      nomSponsor: 'Sogebank',
      typePackage: TypePackageSponsor.HABILLAGE_PERMANENT,
      contactNom: 'Jean Wilner',
      contactTelephone: '+509 3703 2222',
      dateDebutContrat: new Date('2026-03-01'),
      dateFinContrat: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  const contenuProgramme1 = await prisma.contenu.create({
    data: {
      titre: 'Journal du soir — Rediffusion',
      typeContenu: TypeContenu.VIDEO_BOUCLE,
      urlFichier: 'https://cdn.example.com/antenn/journal-soir.mp4',
      dureeSecondes: 1800,
    },
  });

  const contenuProgramme2 = await prisma.contenu.create({
    data: {
      titre: 'Magazine culturel Ayiti',
      typeContenu: TypeContenu.VIDEO_BOUCLE,
      urlFichier: 'https://cdn.example.com/antenn/magazine-culturel.mp4',
      dureeSecondes: 2700,
    },
  });

  const contenuSpot = await prisma.contenu.create({
    data: {
      titre: 'Spot pub Digicel 30s',
      typeContenu: TypeContenu.SPOT_PUBLICITAIRE,
      urlFichier: 'https://cdn.example.com/antenn/spot-digicel.mp4',
      dureeSecondes: 30,
      sponsorId: sponsorPrincipal.id,
    },
  });

  await prisma.contenu.create({
    data: {
      titre: 'Habillage logo Sogebank',
      typeContenu: TypeContenu.HABILLAGE_LOGO,
      urlFichier: 'https://cdn.example.com/antenn/logo-sogebank.png',
      dureeSecondes: 0,
      sponsorId: sponsorHabillage.id,
    },
  });

  // Grille du jour : quelques créneaux autour de l'heure actuelle
  const now = new Date();
  const startOfHour = new Date(now);
  startOfHour.setMinutes(0, 0, 0);

  const creneauPasse = await prisma.creneauGrille.create({
    data: {
      dateHeureDebut: new Date(startOfHour.getTime() - 2 * 60 * 60 * 1000),
      dateHeureFin: new Date(startOfHour.getTime() - 1 * 60 * 60 * 1000),
      typeCreneau: TypeCreneau.PROGRAMME,
      contenuId: contenuProgramme1.id,
      syncStatus: 'SYNCHRONISE',
      syncedAt: new Date(startOfHour.getTime() - 2 * 60 * 60 * 1000),
    },
  });

  const creneauEnCours = await prisma.creneauGrille.create({
    data: {
      dateHeureDebut: new Date(startOfHour.getTime() - 30 * 60 * 1000),
      dateHeureFin: new Date(startOfHour.getTime() + 30 * 60 * 1000),
      typeCreneau: TypeCreneau.PROGRAMME,
      contenuId: contenuProgramme2.id,
      syncStatus: 'SYNCHRONISE',
      syncedAt: new Date(startOfHour.getTime() - 30 * 60 * 1000),
    },
  });

  await prisma.creneauGrille.create({
    data: {
      dateHeureDebut: new Date(startOfHour.getTime() + 30 * 60 * 1000),
      dateHeureFin: new Date(startOfHour.getTime() + 32 * 60 * 1000),
      typeCreneau: TypeCreneau.PUB,
      contenuId: contenuSpot.id,
    },
  });

  const match = await prisma.match.create({
    data: {
      nomEvenement: 'Championnat D1 — Journée 12',
      equipes: 'Violette AC vs Racing Club Haïtien',
      dateHeurePrevue: new Date(now.getTime() + 3 * 60 * 60 * 1000),
      ingestUrlRtmp: 'rtmp://ingest.example.com/live/match-d1-j12',
      sponsorPrincipalId: sponsorPrincipal.id,
    },
  });

  await prisma.creneauGrille.create({
    data: {
      dateHeureDebut: match.dateHeurePrevue,
      dateHeureFin: new Date(match.dateHeurePrevue.getTime() + 2 * 60 * 60 * 1000),
      typeCreneau: TypeCreneau.MATCH_DIRECT,
      matchId: match.id,
    },
  });

  await prisma.incrustationLogo.create({
    data: {
      creneauId: creneauEnCours.id,
      sponsorId: sponsorHabillage.id,
      logoUrl: 'https://cdn.example.com/antenn/logo-sogebank.png',
      position: PositionOverlay.BAS_DROITE,
      opacite: 0.85,
    },
  });

  await prisma.bandeauSponsor.create({
    data: {
      creneauId: creneauEnCours.id,
      items: [
        { texte: 'Prestige — la bière nationale d\'Haïti', sponsorId: sponsorBandeau.id },
        { texte: 'Digicel — rester connecté partout en Haïti', sponsorId: sponsorPrincipal.id },
      ],
      vitesseDefilement: 60,
    },
  });

  await prisma.diffusionLog.create({
    data: {
      creneauId: creneauPasse.id,
      dateHeureReelle: creneauPasse.dateHeureDebut,
      dureeVisionneeEstimee: 3200,
      nombreVuesEstimees: 480,
    },
  });

  // Identité de la chaîne (singleton) — logo à uploader depuis la régie.
  await prisma.configChaine.create({
    data: { nomChaine: 'ANTENN Télé', logoActif: true },
  });

  // Grille synchronisée sur J+1 et J+2 pour peupler le guide des programmes multi-jours.
  const jourBase = new Date();
  jourBase.setHours(0, 0, 0, 0);
  const programmesGuide = [
    { jour: 1, h: 19, dureeMin: 60, contenuId: contenuProgramme1.id },
    { jour: 1, h: 20, dureeMin: 45, contenuId: contenuProgramme2.id },
    { jour: 2, h: 18, dureeMin: 90, contenuId: contenuProgramme2.id },
  ];
  for (const p of programmesGuide) {
    const debut = new Date(jourBase);
    debut.setDate(debut.getDate() + p.jour);
    debut.setHours(p.h, 0, 0, 0);
    const fin = new Date(debut.getTime() + p.dureeMin * 60 * 1000);
    await prisma.creneauGrille.create({
      data: {
        dateHeureDebut: debut,
        dateHeureFin: fin,
        typeCreneau: TypeCreneau.PROGRAMME,
        contenuId: p.contenuId,
        syncStatus: 'SYNCHRONISE',
        syncedAt: new Date(),
      },
    });
  }

  console.log('✅ Seed ANTENN terminé');
  console.log(`   Admin      : admin@antenn.ht / Antenn@123`);
  console.log(`   Opérateur  : operateur@antenn.ht / Antenn@123`);
  console.log(`   (user admin id: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
