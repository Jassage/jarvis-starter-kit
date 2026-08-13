import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const pharmacie = await prisma.pharmacie.upsert({
    where: { id: 'seed-pharmacie-centrale' },
    update: {},
    create: {
      id: 'seed-pharmacie-centrale',
      nom: 'Pharmacie Centrale REMED',
      adresse: 'Pignon, Haïti',
      telephone: '+509 3000-1111',
      email: 'contact@remed.ht',
      devise: 'HTG',
    },
  });
  console.log(`Pharmacie prête : ${pharmacie.nom} (${pharmacie.id})`);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@remed.ht';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMoi123!';

  const admin = await prisma.utilisateur.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      pharmacieId: pharmacie.id,
      email: adminEmail,
      motDePasse: await bcrypt.hash(adminPassword, 12),
      nom: 'Admin',
      prenom: 'REMED',
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`Compte SUPER_ADMIN prêt : ${admin.email}`);

  const pharmacien = await prisma.utilisateur.upsert({
    where: { email: 'pharmacien@remed.ht' },
    update: {},
    create: {
      pharmacieId: pharmacie.id,
      email: 'pharmacien@remed.ht',
      motDePasse: await bcrypt.hash('Pharmacien123!', 12),
      nom: 'Charles',
      prenom: 'Marie',
      role: 'PHARMACIEN',
    },
  });
  console.log(`Compte PHARMACIEN prêt : ${pharmacien.email}`);

  const vendeur = await prisma.utilisateur.upsert({
    where: { email: 'vendeur@remed.ht' },
    update: {},
    create: {
      pharmacieId: pharmacie.id,
      email: 'vendeur@remed.ht',
      motDePasse: await bcrypt.hash('Vendeur123!', 12),
      nom: 'Pierre',
      prenom: 'Jean',
      role: 'VENDEUR',
    },
  });
  console.log(`Compte VENDEUR prêt : ${vendeur.email}`);

  const categorieAntalgiques = await prisma.categorie.upsert({
    where: { pharmacieId_nom: { pharmacieId: pharmacie.id, nom: 'Antalgiques' } },
    update: {},
    create: { pharmacieId: pharmacie.id, nom: 'Antalgiques', description: 'Médicaments contre la douleur' },
  });

  const categorieAntibiotiques = await prisma.categorie.upsert({
    where: { pharmacieId_nom: { pharmacieId: pharmacie.id, nom: 'Antibiotiques' } },
    update: {},
    create: { pharmacieId: pharmacie.id, nom: 'Antibiotiques', description: 'Traitements anti-infectieux' },
  });

  const fournisseur = await prisma.fournisseur.upsert({
    where: { id: 'seed-fournisseur-demo' },
    update: {},
    create: {
      id: 'seed-fournisseur-demo',
      pharmacieId: pharmacie.id,
      nom: 'Distributeur Pharma Haïti',
      contact: 'Service commandes',
      telephone: '+509 3000-0000',
      email: 'commandes@pharmaht-demo.example',
    },
  });

  const paracetamol = await prisma.produit.upsert({
    where: { id: 'seed-produit-paracetamol' },
    update: {},
    create: {
      id: 'seed-produit-paracetamol',
      pharmacieId: pharmacie.id,
      nom: 'Paracétamol',
      dci: 'Paracétamol',
      dosage: '500mg',
      formePharmaceutique: 'COMPRIME',
      categorieId: categorieAntalgiques.id,
      prixAchat: 25,
      prixVente: 50,
      seuilAlerte: 50,
    },
  });

  const amoxicilline = await prisma.produit.upsert({
    where: { id: 'seed-produit-amoxicilline' },
    update: {},
    create: {
      id: 'seed-produit-amoxicilline',
      pharmacieId: pharmacie.id,
      nom: 'Amoxicilline',
      dci: 'Amoxicilline',
      dosage: '500mg',
      formePharmaceutique: 'GELULE',
      categorieId: categorieAntibiotiques.id,
      prixAchat: 60,
      prixVente: 110,
      seuilAlerte: 30,
      necessiteOrdonnance: true,
    },
  });

  const dansUnAn = new Date();
  dansUnAn.setFullYear(dansUnAn.getFullYear() + 1);
  const dans60Jours = new Date();
  dans60Jours.setDate(dans60Jours.getDate() + 60);

  await prisma.lotProduit.upsert({
    where: { produitId_numeroLot: { produitId: paracetamol.id, numeroLot: 'LOT-PARA-001' } },
    update: {},
    create: {
      produitId: paracetamol.id,
      numeroLot: 'LOT-PARA-001',
      dateExpiration: dansUnAn,
      quantiteInitiale: 200,
      quantiteActuelle: 200,
      prixAchatUnitaire: 25,
      fournisseurId: fournisseur.id,
    },
  });

  await prisma.lotProduit.upsert({
    where: { produitId_numeroLot: { produitId: amoxicilline.id, numeroLot: 'LOT-AMOX-001' } },
    update: {},
    create: {
      produitId: amoxicilline.id,
      numeroLot: 'LOT-AMOX-001',
      dateExpiration: dans60Jours,
      quantiteInitiale: 40,
      quantiteActuelle: 40,
      prixAchatUnitaire: 60,
      fournisseurId: fournisseur.id,
    },
  });

  console.log('Données de démonstration insérées (1 pharmacie, 2 produits, 2 lots, 1 fournisseur).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
