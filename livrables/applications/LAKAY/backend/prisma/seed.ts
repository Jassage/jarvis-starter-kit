import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LAKAY database...');

  // Configs système
  await prisma.systemConfig.createMany({
    data: [
      { key: 'SITE_NAME', value: 'LAKAY', label: 'Nom du site' },
      { key: 'SITE_EMAIL', value: 'contact@lakay.ht', label: 'Email de contact' },
      { key: 'MAX_IMAGES_FREE', value: '5', label: 'Max images plan Free' },
      { key: 'MAX_IMAGES_PAID', value: '20', label: 'Max images plans payants' },
      { key: 'LISTING_EXPIRY_FREE', value: '60', label: 'Jours expiration annonce Free' },
      { key: 'LISTING_EXPIRY_BASIC', value: '90', label: 'Jours expiration annonce Basic' },
      { key: 'LISTING_EXPIRY_PRO', value: '180', label: 'Jours expiration annonce Pro' },
      { key: 'SPONSOR_PRICE_HTG_BRONZE', value: '1000', label: 'Prix sponsoring Bronze (HTG)' },
      { key: 'SPONSOR_PRICE_HTG_SILVER', value: '2500', label: 'Prix sponsoring Silver (HTG)' },
      { key: 'SPONSOR_PRICE_HTG_GOLD', value: '5000', label: 'Prix sponsoring Gold (HTG)' },
    ],
    skipDuplicates: true,
  });

  // Super Admin
  const hashedPwd = await bcrypt.hash('Admin@Lakay2024!', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@lakay.ht' },
    create: {
      email: 'admin@lakay.ht',
      password: hashedPwd,
      firstName: 'Admin',
      lastName: 'LAKAY',
      role: 'SUPER_ADMIN',
      isVerified: true,
      emailVerifiedAt: new Date(),
    },
    update: {},
  });
  await prisma.subscription.upsert({
    where: { userId: superAdmin.id },
    create: { userId: superAdmin.id, plan: 'ENTERPRISE', isActive: true },
    update: {},
  });

  // Utilisateur démo propriétaire
  const ownerPwd = await bcrypt.hash('Owner@123', 12);
  const owner = await prisma.user.upsert({
    where: { email: 'proprietaire@demo.ht' },
    create: {
      email: 'proprietaire@demo.ht',
      password: ownerPwd,
      firstName: 'Jean',
      lastName: 'Baptiste',
      phone: '+50940000001',
      role: 'OWNER',
      isVerified: true,
      emailVerifiedAt: new Date(),
    },
    update: {},
  });
  await prisma.subscription.upsert({
    where: { userId: owner.id },
    create: { userId: owner.id, plan: 'PROFESSIONAL', isActive: true },
    update: {},
  });

  // Utilisateur démo particulier
  const userPwd = await bcrypt.hash('User@123', 12);
  const regularUser = await prisma.user.upsert({
    where: { email: 'utilisateur@demo.ht' },
    create: {
      email: 'utilisateur@demo.ht',
      password: userPwd,
      firstName: 'Marie',
      lastName: 'Pierre',
      role: 'INDIVIDUAL',
      isVerified: true,
      emailVerifiedAt: new Date(),
    },
    update: {},
  });
  await prisma.subscription.upsert({
    where: { userId: regularUser.id },
    create: { userId: regularUser.id, plan: 'FREE', isActive: true },
    update: {},
  });

  // Agence démo
  const agencyOwnerPwd = await bcrypt.hash('Agency@123', 12);
  const agencyOwner = await prisma.user.upsert({
    where: { email: 'agence@demo.ht' },
    create: {
      email: 'agence@demo.ht',
      password: agencyOwnerPwd,
      firstName: 'Sophie',
      lastName: 'Dupont',
      role: 'AGENCY',
      isVerified: true,
      emailVerifiedAt: new Date(),
    },
    update: {},
  });
  await prisma.agency.upsert({
    where: { ownerId: agencyOwner.id },
    create: {
      name: 'Immobilier Haiti Premium',
      description: 'Agence immobilière de référence en Haïti depuis 2010',
      phone: '+50940000002',
      email: 'agence@demo.ht',
      ownerId: agencyOwner.id,
      isVerified: true,
    },
    update: {},
  });
  await prisma.subscription.upsert({
    where: { userId: agencyOwner.id },
    create: { userId: agencyOwner.id, plan: 'ENTERPRISE', isActive: true },
    update: {},
  });

  // Annonces démo
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90);

  await prisma.listing.createMany({
    data: [
      {
        title: 'Belle villa 4 chambres avec piscine à Pétion-Ville',
        description: 'Magnifique villa moderne avec vue panoramique sur Port-au-Prince. Située dans un quartier sécurisé de Pétion-Ville, cette propriété dispose d\'une grande piscine, d\'un jardin aménagé et d\'un garage pour 3 voitures. Groupe électrogène et citerne. Idéale pour une famille ou une location longue durée.',
        propertyType: 'VILLA',
        listingType: 'RENT',
        price: 4500,
        currency: 'USD',
        department: 'OUEST',
        commune: 'Pétion-Ville',
        city: 'Pétion-Ville',
        neighborhood: 'Laboule 12',
        landmark: 'En face de la station Total Laboule, 200m vers la montagne',
        latitude: 18.5135,
        longitude: -72.2862,
        bedrooms: 4,
        bathrooms: 3,
        area: 350,
        hasWater: true,
        hasElectricity: true,
        hasGenerator: true,
        hasInternet: true,
        hasParking: true,
        hasPool: true,
        hasAC: true,
        isFurnished: true,
        hasSecurity: true,
        hasMountainView: true,
        isAvailableNow: true,
        status: 'ACTIVE',
        isFeatured: true,
        viewCount: 245,
        ownerId: owner.id,
        expiresAt,
      },
      {
        title: 'Appartement 2 chambres moderne à Delmas 75',
        description: 'Bel appartement neuf de 2 chambres dans un immeuble sécurisé à Delmas. Premier étage, balcon, cuisine équipée, eau courante H24 avec citerne de 10 000 litres, panneau solaire. Proche de toutes les commodités (marché, pharmacie, école).',
        propertyType: 'APARTMENT',
        listingType: 'RENT',
        price: 45000,
        currency: 'HTG',
        department: 'OUEST',
        commune: 'Delmas',
        city: 'Delmas',
        neighborhood: 'Delmas 75',
        landmark: 'À 50m du carrefour Delmas 75, côté impasse Joyeux',
        bedrooms: 2,
        bathrooms: 1,
        area: 90,
        floor: 1,
        hasWater: true,
        hasElectricity: true,
        hasCistern: true,
        hasSolarPanel: true,
        hasInternet: true,
        hasParking: true,
        isAvailableNow: true,
        status: 'ACTIVE',
        isFeatured: true,
        viewCount: 128,
        ownerId: owner.id,
        expiresAt,
      },
      {
        title: 'Terrain 800m² à Cap-Haïtien pour construction',
        description: 'Terrain plat de 800m² situé dans un quartier résidentiel calme de Cap-Haïtien. Documents légaux disponibles (titre foncier). Idéal pour la construction d\'une maison ou d\'un immeuble. Accès route goudronnée. Eau et électricité disponibles sur la parcelle.',
        propertyType: 'LAND',
        listingType: 'SALE',
        price: 850000,
        currency: 'HTG',
        priceNegotiable: true,
        department: 'NORD',
        commune: 'Cap-Haïtien',
        city: 'Cap-Haïtien',
        neighborhood: 'Vertières',
        landmark: 'Derrière l\'école nationale de Vertières, face au stade',
        area: 800,
        hasWater: true,
        hasElectricity: true,
        isAvailableNow: true,
        status: 'ACTIVE',
        viewCount: 89,
        ownerId: owner.id,
        expiresAt,
      },
      {
        title: 'Maison 3 chambres à vendre à Gonaïves',
        description: 'Jolie maison de plain-pied avec cour, 3 chambres spacieuses, 2 salles de bain. Quartier tranquille et bien desservi. Récemment rénovée avec nouveaux sanitaires et peinture. Citerne de 5000L et espace pour groupe électrogène. Proche école, marché et transport en commun.',
        propertyType: 'HOUSE',
        listingType: 'SALE',
        price: 1200000,
        currency: 'HTG',
        department: 'ARTIBONITE',
        commune: 'Gonaïves',
        city: 'Gonaïves',
        neighborhood: 'Raboteau',
        landmark: 'Rue principale de Raboteau, à 100m de la pharmacie Espoir',
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        hasWater: true,
        hasCistern: true,
        hasParking: true,
        isAvailableNow: true,
        status: 'ACTIVE',
        viewCount: 67,
        ownerId: owner.id,
        expiresAt,
      },
    ],
    skipDuplicates: false,
  });

  console.log('✅ Seed terminé.');
  console.log('\nComptes de démonstration:');
  console.log('  Super Admin : admin@lakay.ht / Admin@Lakay2024!');
  console.log('  Propriétaire: proprietaire@demo.ht / Owner@123');
  console.log('  Particulier : utilisateur@demo.ht / User@123');
  console.log('  Agence      : agence@demo.ht / Agency@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
