import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed BANKA en cours...');

  const agence = await prisma.agence.upsert({
    where: { code: 'SIG' },
    update: {},
    create: {
      code: 'SIG',
      nom: 'Siège Social',
      adresse: 'Port-au-Prince, Haïti',
      telephone: '+509 2000-0000',
    },
  });

  const hash = await bcrypt.hash('Admin@123', 12);

  await prisma.utilisateur.upsert({
    where: { email: 'admin@banka.ht' },
    update: {},
    create: {
      email: 'admin@banka.ht',
      motDePasse: hash,
      nom: 'Admin',
      prenom: 'Super',
      role: 'SUPER_ADMIN',
      agenceId: agence.id,
    },
  });

  await prisma.utilisateur.upsert({
    where: { email: 'directeur@banka.ht' },
    update: {},
    create: {
      email: 'directeur@banka.ht',
      motDePasse: hash,
      nom: 'Directeur',
      prenom: 'Jean',
      role: 'DIRECTEUR',
      agenceId: agence.id,
    },
  });

  await prisma.utilisateur.upsert({
    where: { email: 'caissier@banka.ht' },
    update: {},
    create: {
      email: 'caissier@banka.ht',
      motDePasse: hash,
      nom: 'Caissier',
      prenom: 'Marie',
      role: 'CAISSIER',
      agenceId: agence.id,
    },
  });

  await prisma.utilisateur.upsert({
    where: { email: 'credit@banka.ht' },
    update: {},
    create: {
      email: 'credit@banka.ht',
      motDePasse: hash,
      nom: 'Agent',
      prenom: 'Pierre',
      role: 'AGENT_CREDIT',
      agenceId: agence.id,
    },
  });

  const planComptable = [
    { numero: '101000', intitule: 'Capital social', type: 'CAPITAUX' },
    { numero: '211000', intitule: 'Immobilisations corporelles', type: 'ACTIF' },
    { numero: '411000', intitule: 'Comptes clients - épargne HTG', type: 'PASSIF' },
    { numero: '412000', intitule: 'Comptes clients - courant HTG', type: 'PASSIF' },
    { numero: '413000', intitule: 'Comptes clients - épargne USD', type: 'PASSIF' },
    { numero: '421000', intitule: 'Portefeuille de prêts', type: 'ACTIF' },
    { numero: '511000', intitule: 'Caisse HTG', type: 'ACTIF' },
    { numero: '511100', intitule: 'Caisse USD', type: 'ACTIF' },
    { numero: '512000', intitule: 'Banque principale', type: 'ACTIF' },
    { numero: '611000', intitule: 'Frais financiers', type: 'CHARGE' },
    { numero: '621000', intitule: 'Charges d\'exploitation', type: 'CHARGE' },
    { numero: '711000', intitule: 'Intérêts sur prêts', type: 'PRODUIT' },
    { numero: '712000', intitule: 'Frais de dossier', type: 'PRODUIT' },
    { numero: '713000', intitule: 'Commissions et frais de service', type: 'PRODUIT' },
  ];

  for (const compte of planComptable) {
    await prisma.compteComptable.upsert({
      where: { numero: compte.numero },
      update: {},
      create: compte as any,
    });
  }

  const configs = [
    { cle: 'INSTITUTION_NOM', valeur: 'BANKA - Caisse Populaire', description: 'Nom de l\'institution' },
    { cle: 'INSTITUTION_ADRESSE', valeur: 'Port-au-Prince, Haïti', description: 'Adresse du siège' },
    { cle: 'INSTITUTION_TELEPHONE', valeur: '+509 2000-0000', description: 'Téléphone' },
    { cle: 'DEVISE_PRINCIPALE', valeur: 'HTG', description: 'Devise principale' },
    { cle: 'SEUIL_VALIDATION_HTG', valeur: '50000', description: 'Montant en HTG au-delà duquel une validation est requise' },
    { cle: 'SEUIL_VALIDATION_USD', valeur: '500', description: 'Montant en USD au-delà duquel une validation est requise' },
    { cle: 'TAUX_INTERET_PRET_DEFAULT', valeur: '3', description: 'Taux mensuel par défaut pour les prêts (%)' },
    { cle: 'SOLDE_MINIMUM_EPARGNE', valeur: '500', description: 'Solde minimum compte épargne HTG' },
  ];

  for (const config of configs) {
    await prisma.configuration.upsert({
      where: { cle: config.cle },
      update: { valeur: config.valeur },
      create: config,
    });
  }

  console.log('Seed terminé.');
  console.log('Comptes de test:');
  console.log('  admin@banka.ht       / Admin@123 (SUPER_ADMIN)');
  console.log('  directeur@banka.ht   / Admin@123 (DIRECTEUR)');
  console.log('  caissier@banka.ht    / Admin@123 (CAISSIER)');
  console.log('  credit@banka.ht      / Admin@123 (AGENT_CREDIT)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
