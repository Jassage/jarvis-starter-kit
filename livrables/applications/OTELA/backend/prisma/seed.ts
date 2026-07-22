import { PrismaClient, Devise } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEBUT_SAISON = new Date('2026-01-01');
const FIN_SAISON = new Date('2026-12-31');

async function creerTypesChambres(etablissementId: string, tarifsUsdMultiplicateur: number) {
  const types = [
    { nom: 'Standard', capaciteMax: 2, description: 'Chambre confortable, lit double, vue jardin.', htg: 6500, usd: 55, nombreLits: 1, superficie: 22, equipements: ['Climatisation', 'Wi-Fi', 'Télévision', 'Salle de bain privée'] },
    { nom: 'Suite', capaciteMax: 4, description: 'Suite spacieuse avec salon séparé et balcon.', htg: 12000, usd: 105, nombreLits: 2, superficie: 40, equipements: ['Climatisation', 'Wi-Fi', 'Télévision', 'Salon séparé', 'Balcon', 'Minibar'] },
    { nom: 'Familiale', capaciteMax: 6, description: 'Deux chambres communicantes, idéale en famille.', htg: 16000, usd: 145, nombreLits: 3, superficie: 55, equipements: ['Climatisation', 'Wi-Fi', 'Télévision', 'Chambres communicantes', 'Minibar', 'Coin cuisine'] },
  ];

  for (const t of types) {
    const type = await prisma.typeChambre.create({
      data: {
        etablissementId,
        nom: t.nom,
        capaciteMax: t.capaciteMax,
        description: t.description,
        nombreLits: t.nombreLits,
        superficie: t.superficie,
        equipements: t.equipements,
      },
    });

    await prisma.tarif.createMany({
      data: [
        { typeChambreId: type.id, devise: Devise.HTG, montant: t.htg, dateDebutSaison: DEBUT_SAISON, dateFinSaison: FIN_SAISON },
        { typeChambreId: type.id, devise: Devise.USD, montant: Math.round(t.usd * tarifsUsdMultiplicateur), dateDebutSaison: DEBUT_SAISON, dateFinSaison: FIN_SAISON },
      ],
    });

    const nbChambres = t.nom === 'Standard' ? 5 : t.nom === 'Suite' ? 3 : 2;
    const prefixe = t.nom === 'Standard' ? '1' : t.nom === 'Suite' ? '2' : '3';
    for (let i = 1; i <= nbChambres; i++) {
      await prisma.chambre.create({
        data: {
          etablissementId,
          typeChambreId: type.id,
          numero: `${prefixe}0${i}`,
        },
      });
    }
  }
}

async function creerRestaurantBar(etablissementId: string) {
  const restaurant = await prisma.pointDeVente.create({
    data: { etablissementId, nom: 'Restaurant Le Jardin', type: 'RESTAURANT' },
  });
  const bar = await prisma.pointDeVente.create({
    data: { etablissementId, nom: 'Bar Piscine', type: 'BAR' },
  });

  await prisma.table.createMany({
    data: [1, 2, 3, 4].map((n) => ({ pointDeVenteId: restaurant.id, numero: `R${n}`, capacite: n <= 2 ? 2 : 4 })),
  });
  await prisma.table.createMany({
    data: [1, 2].map((n) => ({ pointDeVenteId: bar.id, numero: `B${n}`, capacite: 4 })),
  });

  await prisma.menuItem.createMany({
    data: [
      { pointDeVenteId: restaurant.id, nom: 'Soupe joumou', prix: 450, devise: Devise.HTG, categorie: 'ENTREE' },
      { pointDeVenteId: restaurant.id, nom: 'Griot + banane pesée', prix: 950, devise: Devise.HTG, categorie: 'PLAT' },
      { pointDeVenteId: restaurant.id, nom: 'Poisson gros sel', prix: 1200, devise: Devise.HTG, categorie: 'PLAT' },
      { pointDeVenteId: restaurant.id, nom: 'Pain patate', prix: 350, devise: Devise.HTG, categorie: 'DESSERT' },
      { pointDeVenteId: restaurant.id, nom: 'Jus de fruit local', prix: 250, devise: Devise.HTG, categorie: 'BOISSON' },
      { pointDeVenteId: bar.id, nom: 'Rhum Barbancourt', prix: 400, devise: Devise.HTG, categorie: 'CARTE_BAR' },
      { pointDeVenteId: bar.id, nom: 'Bière Prestige', prix: 300, devise: Devise.HTG, categorie: 'CARTE_BAR' },
      { pointDeVenteId: bar.id, nom: 'Cocktail rhum-sec', prix: 500, devise: Devise.HTG, categorie: 'CARTE_BAR' },
    ],
  });
}

async function creerSpa(etablissementId: string) {
  await prisma.serviceSpa.createMany({
    data: [
      { etablissementId, nom: 'Massage relaxant', dureeMinutes: 60, prix: 2500, devise: Devise.HTG },
      { etablissementId, nom: 'Soin du visage', dureeMinutes: 45, prix: 1800, devise: Devise.HTG },
      { etablissementId, nom: 'Manucure', dureeMinutes: 30, prix: 900, devise: Devise.HTG },
    ],
  });
  await prisma.praticien.createMany({
    data: [
      { etablissementId, nom: 'Praticien(ne) Sophia', specialites: 'Massage, soins du corps' },
      { etablissementId, nom: 'Praticien(ne) Marc', specialites: 'Soins du visage, manucure' },
    ],
  });
}

async function creerMinibar(etablissementId: string) {
  await prisma.articleMinibar.createMany({
    data: [
      { etablissementId, nom: 'Eau minérale', prix: 100, devise: Devise.HTG },
      { etablissementId, nom: 'Soda', prix: 150, devise: Devise.HTG },
      { etablissementId, nom: 'Bière', prix: 300, devise: Devise.HTG },
      { etablissementId, nom: 'Chips', prix: 200, devise: Devise.HTG },
    ],
  });
}

async function main() {
  const chaine = await prisma.chaine.upsert({
    where: { id: 'chaine-otela-seed' },
    update: {},
    create: { id: 'chaine-otela-seed', nom: 'OTELA' },
  });

  const etab1 = await prisma.etablissement.create({
    data: {
      chaineId: chaine.id,
      nom: 'OTELA Pétion-Ville',
      adresse: 'Rue Panaméricaine',
      commune: 'Pétion-Ville',
      departement: 'Ouest',
      devisesAcceptees: [Devise.HTG, Devise.USD],
      devisePrincipale: Devise.HTG,
      telephone: '+509 28 12 3456',
      email: 'petionville@otela.ht',
      siteWeb: 'https://otela.ht',
      description: 'Hôtel de charme au cœur de Pétion-Ville, à deux pas des restaurants et boutiques. Piscine, restaurant local et spa.',
      equipements: ['Wi-Fi gratuit', 'Piscine', 'Restaurant', 'Spa', 'Parking', 'Générateur', 'Climatisation'],
      latitude: 18.5125,
      longitude: -72.2853,
      heureCheckIn: '14:00',
      heureCheckOut: '12:00',
      politiqueAnnulation: 'Annulation gratuite jusqu\'à 48h avant l\'arrivée. Au-delà, la première nuit est retenue.',
    },
  });

  const etab2 = await prisma.etablissement.create({
    data: {
      chaineId: chaine.id,
      nom: 'OTELA Cap-Haïtien',
      adresse: 'Boulevard du Cap',
      commune: 'Cap-Haïtien',
      departement: 'Nord',
      devisesAcceptees: [Devise.HTG, Devise.USD],
      devisePrincipale: Devise.HTG,
      telephone: '+509 28 98 7654',
      email: 'cap@otela.ht',
      description: 'À proximité des plages et de la Citadelle, un établissement idéal pour découvrir le Nord d\'Haïti.',
      equipements: ['Wi-Fi gratuit', 'Restaurant', 'Parking', 'Générateur', 'Climatisation', 'Navette aéroport'],
      latitude: 19.7594,
      longitude: -72.1980,
      heureCheckIn: '15:00',
      heureCheckOut: '11:00',
      politiqueAnnulation: 'Annulation gratuite jusqu\'à 72h avant l\'arrivée.',
    },
  });

  await creerTypesChambres(etab1.id, 1);
  await creerTypesChambres(etab2.id, 0.85);
  await creerRestaurantBar(etab1.id);
  await creerRestaurantBar(etab2.id);
  await creerSpa(etab1.id);
  await creerSpa(etab2.id);
  await creerMinibar(etab1.id);
  await creerMinibar(etab2.id);

  const passwordHash = await bcrypt.hash('Otela@123', 12);

  await prisma.employe.upsert({
    where: { email: 'reception@otela.ht' },
    update: {},
    create: { email: 'reception@otela.ht', password: passwordHash, nom: 'Agent Réception', role: 'RECEPTION', etablissementId: etab1.id },
  });

  await prisma.employe.upsert({
    where: { email: 'menage@otela.ht' },
    update: {},
    create: { email: 'menage@otela.ht', password: passwordHash, nom: 'Agent Ménage', role: 'MENAGE', etablissementId: etab1.id },
  });

  await prisma.employe.upsert({
    where: { email: 'serveur@otela.ht' },
    update: {},
    create: { email: 'serveur@otela.ht', password: passwordHash, nom: 'Serveur Restaurant', role: 'SERVEUR', etablissementId: etab1.id },
  });

  await prisma.employe.upsert({
    where: { email: 'administrateur@otela.ht' },
    update: {},
    create: { email: 'administrateur@otela.ht', password: passwordHash, nom: 'Admin Établissement', role: 'ADMINISTRATEUR_ETABLISSEMENT', etablissementId: etab1.id },
  });

  await prisma.employe.upsert({
    where: { email: 'chaine@otela.ht' },
    update: {},
    create: { email: 'chaine@otela.ht', password: passwordHash, nom: 'Admin Chaîne', role: 'ADMINISTRATEUR_CHAINE', etablissementId: null },
  });

  // Comptes des trois rôles ajoutés par la tranche Fondations SaaS.
  await prisma.employe.upsert({
    where: { email: 'proprietaire@otela.ht' },
    update: {},
    create: { email: 'proprietaire@otela.ht', password: passwordHash, nom: 'Propriétaire OTELA', role: 'PROPRIETAIRE', etablissementId: null },
  });

  await prisma.employe.upsert({
    where: { email: 'comptable@otela.ht' },
    update: {},
    create: { email: 'comptable@otela.ht', password: passwordHash, nom: 'Comptable', role: 'COMPTABLE', etablissementId: etab1.id },
  });

  await prisma.employe.upsert({
    where: { email: 'maintenance@otela.ht' },
    update: {},
    create: { email: 'maintenance@otela.ht', password: passwordHash, nom: 'Agent Maintenance', role: 'MAINTENANCE', etablissementId: etab1.id },
  });

  console.log('✅ Seed OTELA terminé');
  console.log(`   Établissements : ${etab1.nom}, ${etab2.nom}`);
  console.log('   Comptes démo (mot de passe commun Otela@123) :');
  console.log('   - reception@otela.ht (RECEPTION)');
  console.log('   - menage@otela.ht (MENAGE)');
  console.log('   - serveur@otela.ht (SERVEUR)');
  console.log('   - maintenance@otela.ht (MAINTENANCE)');
  console.log('   - comptable@otela.ht (COMPTABLE)');
  console.log('   - administrateur@otela.ht (ADMINISTRATEUR_ETABLISSEMENT)');
  console.log('   - proprietaire@otela.ht (PROPRIETAIRE)');
  console.log('   - chaine@otela.ht (ADMINISTRATEUR_CHAINE)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
