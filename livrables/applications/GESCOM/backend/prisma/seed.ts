import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const COMPTES_BASE = [
  { numero: '571', intitule: 'Caisse', type: 'ACTIF' as const },
  { numero: '512', intitule: 'Banque', type: 'ACTIF' as const },
  { numero: '411', intitule: 'Clients', type: 'ACTIF' as const },
  { numero: '355', intitule: 'Stock de marchandises', type: 'ACTIF' as const },
  { numero: '401', intitule: 'Fournisseurs', type: 'PASSIF' as const },
  { numero: '101', intitule: 'Capital', type: 'PASSIF' as const },
  { numero: '701', intitule: 'Ventes de marchandises', type: 'PRODUIT' as const },
  { numero: '601', intitule: 'Achats de marchandises', type: 'CHARGE' as const },
  { numero: '607', intitule: 'Charges diverses', type: 'CHARGE' as const },
];

async function main() {
  console.log('Seed GESCOM...');

  for (const c of COMPTES_BASE) {
    await prisma.compteComptable.upsert({
      where: { numero: c.numero },
      update: {},
      create: c,
    });
  }
  console.log(`${COMPTES_BASE.length} comptes comptables OK`);

  const boutique = await prisma.emplacement.upsert({
    where: { id: 'seed-boutique' },
    update: {},
    create: { id: 'seed-boutique', nom: 'Boutique', type: 'BOUTIQUE', adresse: 'À préciser' },
  });

  const entrepot = await prisma.emplacement.upsert({
    where: { id: 'seed-entrepot' },
    update: {},
    create: { id: 'seed-entrepot', nom: 'Entrepôt grossiste', type: 'ENTREPOT', adresse: 'À préciser' },
  });
  console.log('Emplacements OK (Boutique, Entrepôt grossiste)');

  const hash = await bcrypt.hash('Admin@123', 12);
  await prisma.utilisateur.upsert({
    where: { email: 'admin@gescom.ht' },
    update: {},
    create: {
      email: 'admin@gescom.ht',
      motDePasse: hash,
      nom: 'Admin',
      prenom: 'Système',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Utilisateur admin@gescom.ht / Admin@123 OK');

  const produit1 = await prisma.produit.upsert({
    where: { reference: 'PRD-001' },
    update: {},
    create: {
      reference: 'PRD-001',
      nom: 'Sac de riz 25kg',
      categorie: 'Alimentaire',
      unite: 'sac',
      prixAchatMoyen: 1500,
      prixVenteDetail: 1800,
      prixVenteGros: 1650,
      seuilAlerte: 10,
    },
  });

  const produit2 = await prisma.produit.upsert({
    where: { reference: 'PRD-002' },
    update: {},
    create: {
      reference: 'PRD-002',
      nom: 'Carton de boissons gazeuses',
      categorie: 'Boissons',
      unite: 'carton',
      prixAchatMoyen: 800,
      prixVenteDetail: 1000,
      prixVenteGros: 900,
      seuilAlerte: 20,
    },
  });

  for (const produit of [produit1, produit2]) {
    for (const emplacement of [boutique, entrepot]) {
      await prisma.stockEmplacement.upsert({
        where: { produitId_emplacementId: { produitId: produit.id, emplacementId: emplacement.id } },
        update: {},
        create: { produitId: produit.id, emplacementId: emplacement.id, quantite: 0 },
      });
    }
  }
  console.log('Produits démo OK (PRD-001, PRD-002)');

  await prisma.client.upsert({
    where: { id: 'seed-client-particulier' },
    update: {},
    create: { id: 'seed-client-particulier', nom: 'Client comptant', type: 'PARTICULIER' },
  });

  await prisma.fournisseur.upsert({
    where: { id: 'seed-fournisseur-1' },
    update: {},
    create: { id: 'seed-fournisseur-1', nom: 'Fournisseur démo', telephone: '+509 0000-0000' },
  });
  console.log('Client et fournisseur démo OK');

  console.log('Seed terminé.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
