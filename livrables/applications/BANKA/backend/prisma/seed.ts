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

  // ── Postes bancaires ──────────────────────────────────────────────────────────
  const postes = [
    // Direction Générale
    { code: 'DG-001', intitule: 'Directeur Général',            departement: 'Direction Générale',        salaireMin: 150000, salaireMax: 300000 },
    { code: 'DG-002', intitule: 'Directeur Général Adjoint',    departement: 'Direction Générale',        salaireMin: 120000, salaireMax: 250000 },
    { code: 'DG-003', intitule: 'Secrétaire de Direction',      departement: 'Direction Générale',        salaireMin: 30000,  salaireMax: 55000  },
    // Opérations
    { code: 'OPS-001', intitule: 'Directeur des Opérations',    departement: 'Opérations',                salaireMin: 90000,  salaireMax: 160000 },
    { code: 'OPS-002', intitule: 'Superviseur de Caisse',       departement: 'Opérations',                salaireMin: 45000,  salaireMax: 80000  },
    { code: 'OPS-003', intitule: 'Caissier Principal',          departement: 'Opérations',                salaireMin: 35000,  salaireMax: 60000  },
    { code: 'OPS-004', intitule: 'Caissier',                    departement: 'Opérations',                salaireMin: 25000,  salaireMax: 45000  },
    { code: 'OPS-005', intitule: 'Agent Guichet',               departement: 'Opérations',                salaireMin: 22000,  salaireMax: 38000  },
    { code: 'OPS-006', intitule: 'Agent de Sécurité',           departement: 'Opérations',                salaireMin: 18000,  salaireMax: 28000  },
    // Crédit
    { code: 'CRD-001', intitule: 'Directeur du Crédit',         departement: 'Crédit',                    salaireMin: 90000,  salaireMax: 160000 },
    { code: 'CRD-002', intitule: 'Chef de Service Crédit',      departement: 'Crédit',                    salaireMin: 55000,  salaireMax: 95000  },
    { code: 'CRD-003', intitule: 'Agent de Crédit',             departement: 'Crédit',                    salaireMin: 30000,  salaireMax: 55000  },
    { code: 'CRD-004', intitule: 'Analyste Crédit',             departement: 'Crédit',                    salaireMin: 35000,  salaireMax: 65000  },
    { code: 'CRD-005', intitule: 'Gestionnaire de Portefeuille',departement: 'Crédit',                    salaireMin: 40000,  salaireMax: 70000  },
    { code: 'CRD-006', intitule: 'Agent de Recouvrement',       departement: 'Crédit',                    salaireMin: 25000,  salaireMax: 45000  },
    // Comptabilité & Finance
    { code: 'CPT-001', intitule: 'Directeur Administratif et Financier', departement: 'Finance',          salaireMin: 90000,  salaireMax: 160000 },
    { code: 'CPT-002', intitule: 'Comptable Chef',              departement: 'Finance',                   salaireMin: 55000,  salaireMax: 90000  },
    { code: 'CPT-003', intitule: 'Comptable',                   departement: 'Finance',                   salaireMin: 35000,  salaireMax: 60000  },
    { code: 'CPT-004', intitule: 'Aide-Comptable',              departement: 'Finance',                   salaireMin: 22000,  salaireMax: 38000  },
    { code: 'CPT-005', intitule: 'Contrôleur Interne',          departement: 'Finance',                   salaireMin: 45000,  salaireMax: 80000  },
    { code: 'CPT-006', intitule: 'Trésorier',                   departement: 'Finance',                   salaireMin: 50000,  salaireMax: 85000  },
    // Ressources Humaines
    { code: 'RH-001',  intitule: 'Directeur des Ressources Humaines', departement: 'Ressources Humaines', salaireMin: 80000,  salaireMax: 140000 },
    { code: 'RH-002',  intitule: 'Chargé des Ressources Humaines',    departement: 'Ressources Humaines', salaireMin: 35000,  salaireMax: 65000  },
    { code: 'RH-003',  intitule: 'Assistant RH',                departement: 'Ressources Humaines',       salaireMin: 22000,  salaireMax: 38000  },
    // Informatique
    { code: 'IT-001',  intitule: 'Directeur des Systèmes d\'Information', departement: 'Informatique',    salaireMin: 90000,  salaireMax: 160000 },
    { code: 'IT-002',  intitule: 'Développeur',                 departement: 'Informatique',              salaireMin: 40000,  salaireMax: 80000  },
    { code: 'IT-003',  intitule: 'Administrateur Système',      departement: 'Informatique',              salaireMin: 40000,  salaireMax: 75000  },
    { code: 'IT-004',  intitule: 'Support Technique',           departement: 'Informatique',              salaireMin: 25000,  salaireMax: 45000  },
    // Juridique & Conformité
    { code: 'JRD-001', intitule: 'Directeur Juridique',         departement: 'Juridique',                 salaireMin: 80000,  salaireMax: 140000 },
    { code: 'JRD-002', intitule: 'Juriste',                     departement: 'Juridique',                 salaireMin: 45000,  salaireMax: 85000  },
    { code: 'JRD-003', intitule: 'Agent de Conformité',         departement: 'Conformité',                salaireMin: 40000,  salaireMax: 75000  },
    { code: 'JRD-004', intitule: 'Responsable AML/KYC',         departement: 'Conformité',                salaireMin: 50000,  salaireMax: 90000  },
    // Service Client & Marketing
    { code: 'CLI-001', intitule: 'Responsable Service Client',  departement: 'Service Client',            salaireMin: 45000,  salaireMax: 80000  },
    { code: 'CLI-002', intitule: 'Chargé de Clientèle',         departement: 'Service Client',            salaireMin: 28000,  salaireMax: 50000  },
    { code: 'MKT-001', intitule: 'Directeur Marketing',         departement: 'Marketing',                 salaireMin: 75000,  salaireMax: 130000 },
    { code: 'MKT-002', intitule: 'Chargé de Communication',     departement: 'Marketing',                 salaireMin: 30000,  salaireMax: 55000  },
    // Administration
    { code: 'ADM-001', intitule: 'Responsable Administratif',   departement: 'Administration',            salaireMin: 40000,  salaireMax: 70000  },
    { code: 'ADM-002', intitule: 'Assistant Administratif',     departement: 'Administration',            salaireMin: 20000,  salaireMax: 35000  },
    { code: 'ADM-003', intitule: 'Chauffeur',                   departement: 'Administration',            salaireMin: 15000,  salaireMax: 25000  },
    { code: 'ADM-004', intitule: 'Agent de Maintenance',        departement: 'Administration',            salaireMin: 15000,  salaireMax: 25000  },
  ];

  for (const p of postes) {
    await (prisma as any).poste.upsert({
      where: { code: p.code },
      update: { intitule: p.intitule, departement: p.departement, salaireMin: p.salaireMin, salaireMax: p.salaireMax },
      create: p,
    });
  }
  console.log(`${postes.length} postes bancaires insérés.`);

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
