import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function numero(prefix: string, base: number, offset: number) {
  return `${prefix}-${String(base + offset + 1).padStart(5, '0')}`
}

async function main() {
  console.log('🌱 Démarrage du seed MEDIKA...\n')

  const [pwdAdmin, pwdMedecin, pwdStaff] = await Promise.all([
    bcrypt.hash('Admin@123',   12),
    bcrypt.hash('Medika@2025', 12),
    bcrypt.hash('Medika@2025', 12),
  ])

  // ── 1. Services (ajoute les manquants seulement) ─────────────────────────────
  const servicesDef = [
    { nom: 'Médecine générale',       description: 'Soins primaires et consultations générales' },
    { nom: 'Urgences',                description: 'Prise en charge des urgences médicales 24h/24' },
    { nom: 'Pédiatrie',               description: 'Soins pour enfants et nourrissons' },
    { nom: 'Gynécologie-Obstétrique', description: 'Santé de la femme, grossesse, accouchement' },
    { nom: 'Laboratoire',             description: 'Analyses biologiques et examens diagnostiques' },
  ]

  const existingServices = await prisma.service.findMany({ select: { id: true, nom: true } })
  const existingNames = new Set(existingServices.map(s => s.nom))
  const toCreate = servicesDef.filter(s => !existingNames.has(s.nom))

  if (toCreate.length > 0) {
    await Promise.all(toCreate.map(s => prisma.service.create({ data: s })))
    console.log(`✅ ${toCreate.length} service(s) ajouté(s)`)
  } else {
    console.log('⏭️  Tous les services existent déjà')
  }

  const services = await prisma.service.findMany({ select: { id: true, nom: true } })
  const svcMedGen = services.find(s => s.nom === 'Médecine générale')!
  const svcPed    = services.find(s => s.nom === 'Pédiatrie')!
  const svcUrg    = services.find(s => s.nom === 'Urgences')!

  if (!svcMedGen) throw new Error('Service "Médecine générale" introuvable après création')

  // ── 2. Utilisateurs ──────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@medika.ht' },
    update: {},
    create: { prenom: 'Admin', nom: 'MEDIKA', email: 'admin@medika.ht', password: pwdAdmin, role: 'ADMIN' },
  })

  const medecin1 = await prisma.user.upsert({
    where:  { email: 'j.prophete@medika.ht' },
    update: {},
    create: { prenom: 'Jacques', nom: 'Prophète', email: 'j.prophete@medika.ht', password: pwdMedecin, role: 'MEDECIN', serviceId: svcMedGen.id },
  })

  const medecin2 = await prisma.user.upsert({
    where:  { email: 'm.louis@medika.ht' },
    update: {},
    create: { prenom: 'Marie-Anne', nom: 'Louis', email: 'm.louis@medika.ht', password: pwdMedecin, role: 'MEDECIN', serviceId: svcPed?.id },
  })

  await prisma.user.upsert({
    where:  { email: 'infirmier@medika.ht' },
    update: {},
    create: { prenom: 'Rosenie', nom: 'Jolicoeur', email: 'infirmier@medika.ht', password: pwdStaff, role: 'INFIRMIER' },
  })

  await prisma.user.upsert({
    where:  { email: 'caissier@medika.ht' },
    update: {},
    create: { prenom: 'Berthony', nom: 'Lafortune', email: 'caissier@medika.ht', password: pwdStaff, role: 'CAISSIER' },
  })

  await prisma.user.upsert({
    where:  { email: 'accueil@medika.ht' },
    update: {},
    create: { prenom: 'Guerline', nom: 'Antoine', email: 'accueil@medika.ht', password: pwdStaff, role: 'ACCUEIL' },
  })

  console.log('✅ 6 utilisateurs upsertés')
  console.log('   admin@medika.ht       / Admin@123')
  console.log('   j.prophete@medika.ht  / Medika@2025  (Médecin)')
  console.log('   m.louis@medika.ht     / Medika@2025  (Médecin)')
  console.log('   infirmier@medika.ht   / Medika@2025  (Infirmier)')
  console.log('   caissier@medika.ht    / Medika@2025  (Caissier)')
  console.log('   accueil@medika.ht     / Medika@2025  (Accueil)')

  // ── 3. Patients (ajoute toujours les 8 patients de test) ─────────────────────
  const patientBase = await prisma.patient.count()

  const patientsDef = [
    { prenom: 'Jean-Baptiste', nom: 'Pierre',    dob: '1985-03-14', sexe: 'M' as const, tel: '509-3610-1234', adresse: 'Rue des Martyrs, Port-au-Prince',      gs: 'O+',  ant: 'Hypertension artérielle',  alg: 'Pénicilline' },
    { prenom: 'Marie-Claire',  nom: 'Dupont',    dob: '1992-07-22', sexe: 'F' as const, tel: '509-4811-5678', adresse: 'Avenue Christophe, Port-au-Prince',    gs: 'A+',  ant: null,                       alg: null },
    { prenom: 'Claudette',     nom: 'François',  dob: '1978-11-05', sexe: 'F' as const, tel: '509-3755-9012', adresse: 'Delmas 33, Port-au-Prince',            gs: 'B+',  ant: 'Diabète type 2',           alg: null },
    { prenom: 'Wilguens',      nom: 'Joseph',    dob: '2015-06-18', sexe: 'M' as const, tel: '509-3620-3456', adresse: 'Pétion-Ville, Port-au-Prince',         gs: 'AB+', ant: 'Asthme',                   alg: 'Aspirine' },
    { prenom: 'Nadège',        nom: 'Toussaint', dob: '1998-02-28', sexe: 'F' as const, tel: '509-4860-7890', adresse: 'Rue Oswald Durand, Cap-Haïtien',       gs: 'O-',  ant: null,                       alg: null },
    { prenom: 'Stéphane',      nom: 'Désir',     dob: '1970-09-10', sexe: 'M' as const, tel: '509-3712-1122', adresse: 'Lalue, Port-au-Prince',                gs: 'A-',  ant: 'Insuffisance cardiaque',   alg: null },
    { prenom: 'Rosette',       nom: 'Bernadin',  dob: '2003-04-01', sexe: 'F' as const, tel: '509-4855-3344', adresse: 'Carrefour, Port-au-Prince',            gs: 'B-',  ant: null,                       alg: 'Ibuprofène' },
    { prenom: 'Elias',         nom: 'Célestin',  dob: '1955-12-25', sexe: 'M' as const, tel: '509-3640-5566', adresse: 'Jacmel, Sud-Est',                      gs: 'O+',  ant: 'Hypertension, Diabète',    alg: null },
  ]

  const patients = await Promise.all(patientsDef.map((p, i) =>
    prisma.patient.create({
      data: {
        numero:        numero('PAT', patientBase, i),
        prenom:        p.prenom,
        nom:           p.nom,
        dateNaissance: new Date(p.dob),
        sexe:          p.sexe,
        telephone:     p.tel,
        adresse:       p.adresse,
        groupeSanguin: p.gs,
        antecedents:   p.ant ?? undefined,
        allergies:     p.alg ?? undefined,
      }
    })
  ))
  console.log(`\n✅ ${patients.length} patients créés`)

  // ── 4. Rendez-vous d'aujourd'hui ─────────────────────────────────────────────
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  function todayAt(h: number, m = 0) {
    const d = new Date(today)
    d.setHours(h, m, 0, 0)
    return d
  }

  const appt1 = await prisma.appointment.create({
    data: { patientId: patients[0].id, medecinId: medecin1.id, serviceId: svcMedGen.id, dateHeure: todayAt(8, 0),  statut: 'TERMINE',         motif: 'Contrôle tension artérielle' },
  })
  const appt2 = await prisma.appointment.create({
    data: { patientId: patients[2].id, medecinId: medecin1.id, serviceId: svcMedGen.id, dateHeure: todayAt(9, 30), statut: 'EN_CONSULTATION', motif: 'Suivi diabète' },
  })
  const appt3 = await prisma.appointment.create({
    data: { patientId: patients[3].id, medecinId: medecin2.id, serviceId: svcPed.id,    dateHeure: todayAt(10, 0), statut: 'EN_ATTENTE',      motif: "Crise d'asthme légère" },
  })
  await prisma.appointment.create({
    data: { patientId: patients[4].id, medecinId: medecin1.id, serviceId: svcMedGen.id, dateHeure: todayAt(11, 0), statut: 'PLANIFIE',        motif: 'Consultation initiale' },
  })
  await prisma.appointment.create({
    data: { patientId: patients[5].id, medecinId: medecin1.id, serviceId: svcUrg.id,    dateHeure: todayAt(11, 30), statut: 'PLANIFIE',       motif: 'Douleur thoracique' },
  })
  console.log("✅ 5 rendez-vous créés pour aujourd'hui")

  // ── 5. File d'attente ────────────────────────────────────────────────────────
  const fileBase = await prisma.fileAttente.count()
  await prisma.fileAttente.create({
    data: { numero: fileBase + 1, patientId: patients[1].id, medecinId: medecin1.id, motif: 'Fièvre et maux de tête', statut: 'EN_ATTENTE' },
  })
  await prisma.fileAttente.create({
    data: { numero: fileBase + 2, patientId: patients[6].id, motif: 'Douleurs abdominales', statut: 'EN_ATTENTE' },
  })
  console.log("✅ 2 entrées en file d'attente créées")

  // ── 6. Consultations ─────────────────────────────────────────────────────────
  const consult1 = await prisma.consultation.create({
    data: {
      patientId:     patients[0].id,
      medecinId:     medecin1.id,
      appointmentId: appt1.id,
      plainte:       'Céphalées et vertiges depuis 3 jours, tension élevée ce matin.',
      diagnostic:    'Hypertension artérielle non contrôlée (TA = 165/105 mmHg)',
      notes:         'Patient sous traitement depuis 2 ans. Arrêt du traitement depuis 3 semaines.',
      prescriptions: 'Amlodipine 5mg — 1 comprimé/jour le matin\nHydrochlorthiazide 25mg — 1 comprimé/jour le matin\nAspirine 100mg — 1 comprimé/jour le soir\nParacétamol 500mg — 2 comprimés si céphalées (max 3x/jour, 5 jours)',
      signesVitaux:  { tension: '165/105', temperature: 37.1, poids: 82 },
      prochainRdv:   new Date(Date.now() + 14 * 24 * 3600 * 1000),
    }
  })

  await prisma.consultation.create({
    data: {
      patientId:     patients[2].id,
      medecinId:     medecin1.id,
      appointmentId: appt2.id,
      plainte:       'Fatigue persistante, polyurie, glycémie à 2.4 g/L ce matin.',
      signesVitaux:  { tension: '130/85', temperature: 36.9, poids: 74 },
    }
  })
  console.log('✅ 2 consultations créées')

  // ── 7. Examens ───────────────────────────────────────────────────────────────
  const examBase = await prisma.examen.count()
  const year = new Date().getFullYear()

  await prisma.examen.create({
    data: {
      numero:            `EXM-${year}-${String(examBase + 1).padStart(5, '0')}`,
      patientId:         patients[0].id,
      consultationId:    consult1.id,
      medecinId:         medecin1.id,
      type:              'NFS / Hémogramme',
      statut:            'RESULTAT_DISPONIBLE',
      dateResultat:      new Date(),
      resultat:          'NFS dans les limites normales. Légère anémie normocytaire.',
      resultatStructure: { gb: '7.2', gr: '4.1', hb: '11.8', ht: '37', vgm: '90', plq: '210', neutrophiles: '60', lymphocytes: '30' },
    }
  })

  await prisma.examen.create({
    data: {
      numero:    `EXM-${year}-${String(examBase + 2).padStart(5, '0')}`,
      patientId: patients[2].id,
      medecinId: medecin1.id,
      type:      'Glycémie à jeun',
      statut:    'EN_ATTENTE',
    }
  })
  console.log('✅ 2 examens créés')

  // ── 8. Factures ──────────────────────────────────────────────────────────────
  const factBase = await prisma.facture.count()

  const fact1 = await prisma.facture.create({
    data: {
      numero:         `FAC-${String(factBase + 1).padStart(5, '0')}`,
      patientId:      patients[0].id,
      consultationId: consult1.id,
      montantTotal:   1500,
      montantPaye:    1500,
      statut:         'PAYE',
      lignes: {
        create: [
          { description: 'Consultation médecine générale', quantite: 1, prixUnitaire: 1000, montant: 1000 },
          { description: 'NFS / Hémogramme',               quantite: 1, prixUnitaire: 500,  montant: 500  },
        ]
      }
    }
  })

  await prisma.paiement.create({
    data: { factureId: fact1.id, montant: 1500, methode: 'CASH', caissierI: admin.id },
  })

  await prisma.facture.create({
    data: {
      numero:      `FAC-${String(factBase + 2).padStart(5, '0')}`,
      patientId:   patients[2].id,
      montantTotal: 800,
      montantPaye:  0,
      statut:      'EN_ATTENTE',
      lignes: {
        create: [
          { description: 'Consultation médecine générale', quantite: 1, prixUnitaire: 500, montant: 500 },
          { description: 'Glycémie à jeun',                quantite: 1, prixUnitaire: 300, montant: 300 },
        ]
      }
    }
  })
  console.log('✅ 2 factures créées (1 payée, 1 en attente)')

  // ── 9. Config hôpital ────────────────────────────────────────────────────────
  await prisma.hopitalConfig.upsert({
    where:  { id: 'singleton' },
    update: {},
    create: { nom: 'CLINIQUE MEDIKA', adresse: 'Rue principale, Port-au-Prince, Haïti', telephone: '509-3000-0000', email: 'contact@medika.ht' },
  })
  console.log('✅ Config hôpital upsertée')

  // ── 10. Tarifs médicaux ──────────────────────────────────────────────────────
  const tarifs = [
    { code: 'CONS_GEN',      libelle: 'Consultation générale',               categorie: 'Consultation',      prixDefaut: 500    },
    { code: 'CONS_SPEC',     libelle: 'Consultation spécialisée',            categorie: 'Consultation',      prixDefaut: 1000   },
    { code: 'CONS_URG',      libelle: 'Consultation urgences',               categorie: 'Consultation',      prixDefaut: 750    },
    { code: 'CONS_PEDIA',    libelle: 'Consultation pédiatrique',            categorie: 'Consultation',      prixDefaut: 600    },
    { code: 'BIO_NFS',       libelle: 'Numération formule sanguine (NFS)',   categorie: 'Biologie',          prixDefaut: 800    },
    { code: 'BIO_GLYC',      libelle: 'Glycémie à jeun',                    categorie: 'Biologie',          prixDefaut: 300    },
    { code: 'BIO_UREE',      libelle: 'Urée créatinine',                    categorie: 'Biologie',          prixDefaut: 500    },
    { code: 'BIO_GRPT',      libelle: 'Groupe sanguin + Rhésus',            categorie: 'Biologie',          prixDefaut: 400    },
    { code: 'BIO_GROS',      libelle: 'Test de grossesse',                  categorie: 'Biologie',          prixDefaut: 350    },
    { code: 'BIO_PALU',      libelle: 'Test paludisme (TDR)',               categorie: 'Biologie',          prixDefaut: 250    },
    { code: 'RADIO_RX',      libelle: 'Radiographie standard',              categorie: 'Radiologie',        prixDefaut: 1200   },
    { code: 'RADIO_ECH_ABD', libelle: 'Échographie abdominale',             categorie: 'Radiologie',        prixDefaut: 2500   },
    { code: 'RADIO_ECH_OBS', libelle: 'Échographie obstétricale',           categorie: 'Radiologie',        prixDefaut: 2000   },
    { code: 'SOIN_PERF',     libelle: 'Perfusion / pose de voie veineuse',  categorie: 'Soins infirmiers',  prixDefaut: 500    },
    { code: 'SOIN_PANS',     libelle: 'Pansement simple',                   categorie: 'Soins infirmiers',  prixDefaut: 300    },
    { code: 'SOIN_INJECT',   libelle: 'Injection intramusculaire',          categorie: 'Soins infirmiers',  prixDefaut: 200    },
    { code: 'HOSP_STD',      libelle: 'Chambre standard (par jour)',        categorie: 'Hospitalisation',   prixDefaut: 3000   },
    { code: 'HOSP_SI',       libelle: 'Soins intensifs (par jour)',         categorie: 'Hospitalisation',   prixDefaut: 8000   },
    { code: 'CHIR_MIN',      libelle: 'Chirurgie mineure',                  categorie: 'Chirurgie',         prixDefaut: 8000   },
    { code: 'CHIR_MAJ',      libelle: 'Chirurgie majeure',                  categorie: 'Chirurgie',         prixDefaut: 25000  },
    { code: 'MAT_ACC_VAG',   libelle: 'Accouchement voie basse',            categorie: 'Maternité',         prixDefaut: 10000  },
    { code: 'MAT_CESAR',     libelle: 'Césarienne',                         categorie: 'Maternité',         prixDefaut: 20000  },
  ]

  let tarifsCreated = 0
  for (const t of tarifs) {
    const res = await prisma.tarifMedical.upsert({ where: { code: t.code }, update: {}, create: t })
    if (res) tarifsCreated++
  }
  console.log(`✅ ${tarifs.length} tarifs médicaux upsertés`)

  // ── 11. Chambres et lits ─────────────────────────────────────────────────────
  // Lit.numero est UNIQUE globalement — préfixé par le numéro de chambre
  const p = prisma as any
  const chambresData = [
    { numero: 'A101', etage: 1,    type: 'STANDARD',        serviceId: svcMedGen.id, lits: ['A101-1', 'A101-2', 'A101-3', 'A101-4'] },
    { numero: 'A102', etage: 1,    type: 'STANDARD',        serviceId: svcMedGen.id, lits: ['A102-1'] },
    { numero: 'U101', etage: null, type: 'STANDARD',        serviceId: svcUrg.id,   lits: ['U101-1', 'U101-2'] },
    { numero: 'P101', etage: 2,    type: 'PEDIATRIE',       serviceId: svcPed.id,   lits: ['P101-1', 'P101-2', 'P101-3'] },
    { numero: 'SI01', etage: 3,    type: 'SOINS_INTENSIFS', serviceId: svcUrg.id,   lits: ['SI01-1', 'SI01-2'] },
  ]

  let litsTotal = 0
  for (const c of chambresData) {
    const { lits, ...fields } = c
    const chambre = await p.chambre.upsert({ where: { numero: fields.numero }, update: {}, create: { ...fields } })
    for (const litNum of lits) {
      await p.lit.upsert({ where: { numero: litNum }, update: {}, create: { numero: litNum, chambreId: chambre.id } })
      litsTotal++
    }
  }
  console.log(`✅ ${chambresData.length} chambres et ${litsTotal} lits upsertés`)

  // ── 12. Catalogue médicaments ─────────────────────────────────────────────────
  const medicaments = [
    // Antibiotiques
    { nom: 'Amoxicilline',              dci: 'Amoxicilline',                      categorie: 'Antibiotique', forme: 'Gélule',    dosageForme: '500mg',          unite: 'gélule',   stockActuel: 500, seuilAlerte: 50,  prixUnitaire: 15  },
    { nom: 'Amoxicilline 250mg/5ml',    dci: 'Amoxicilline',                      categorie: 'Antibiotique', forme: 'Sirop',     dosageForme: '250mg/5ml',      unite: 'flacon',   stockActuel: 80,  seuilAlerte: 10,  prixUnitaire: 120 },
    { nom: 'Augmentin',                 dci: 'Amoxicilline + Acide clavulanique', categorie: 'Antibiotique', forme: 'Comprimé',  dosageForme: '875mg/125mg',    unite: 'comprimé', stockActuel: 200, seuilAlerte: 30,  prixUnitaire: 45  },
    { nom: 'Ampicilline',               dci: 'Ampicilline',                       categorie: 'Antibiotique', forme: 'Gélule',    dosageForme: '500mg',          unite: 'gélule',   stockActuel: 300, seuilAlerte: 40,  prixUnitaire: 12  },
    { nom: 'Métronidazole',             dci: 'Métronidazole',                     categorie: 'Antibiotique', forme: 'Comprimé',  dosageForme: '500mg',          unite: 'comprimé', stockActuel: 400, seuilAlerte: 50,  prixUnitaire: 8   },
    { nom: 'Métronidazole injectable',  dci: 'Métronidazole',                     categorie: 'Antibiotique', forme: 'Perfusion', dosageForme: '500mg/100ml',    unite: 'flacon',   stockActuel: 60,  seuilAlerte: 10,  prixUnitaire: 150 },
    { nom: 'Ciprofloxacine',            dci: 'Ciprofloxacine',                    categorie: 'Antibiotique', forme: 'Comprimé',  dosageForme: '500mg',          unite: 'comprimé', stockActuel: 250, seuilAlerte: 30,  prixUnitaire: 20  },
    { nom: 'Doxycycline',               dci: 'Doxycycline',                       categorie: 'Antibiotique', forme: 'Gélule',    dosageForme: '100mg',          unite: 'gélule',   stockActuel: 200, seuilAlerte: 25,  prixUnitaire: 10  },
    { nom: 'Azithromycine',             dci: 'Azithromycine',                     categorie: 'Antibiotique', forme: 'Comprimé',  dosageForme: '250mg',          unite: 'comprimé', stockActuel: 150, seuilAlerte: 20,  prixUnitaire: 35  },
    { nom: 'Érythromycine',             dci: 'Érythromycine',                     categorie: 'Antibiotique', forme: 'Comprimé',  dosageForme: '500mg',          unite: 'comprimé', stockActuel: 120, seuilAlerte: 15,  prixUnitaire: 18  },
    { nom: 'Ceftriaxone 1g',            dci: 'Ceftriaxone',                       categorie: 'Antibiotique', forme: 'Injectable',dosageForme: '1g',             unite: 'flacon',   stockActuel: 100, seuilAlerte: 15,  prixUnitaire: 200 },
    { nom: 'Gentamicine 80mg',          dci: 'Gentamicine',                       categorie: 'Antibiotique', forme: 'Injectable',dosageForme: '80mg/2ml',       unite: 'ampoule',  stockActuel: 80,  seuilAlerte: 10,  prixUnitaire: 80  },
    { nom: 'Pénicilline V',             dci: 'Phénoxyméthylpénicilline',          categorie: 'Antibiotique', forme: 'Comprimé',  dosageForme: '400 000 UI',     unite: 'comprimé', stockActuel: 300, seuilAlerte: 40,  prixUnitaire: 8   },
    { nom: 'Clindamycine',              dci: 'Clindamycine',                      categorie: 'Antibiotique', forme: 'Gélule',    dosageForme: '300mg',          unite: 'gélule',   stockActuel: 100, seuilAlerte: 15,  prixUnitaire: 30  },
    { nom: 'Cotrimoxazole',             dci: 'Sulfaméthoxazole + Triméthoprime',  categorie: 'Antibiotique', forme: 'Comprimé',  dosageForme: '400mg/80mg',     unite: 'comprimé', stockActuel: 350, seuilAlerte: 40,  prixUnitaire: 7   },
    { nom: 'Nitrofurantoïne',           dci: 'Nitrofurantoïne',                   categorie: 'Antibiotique', forme: 'Gélule',    dosageForme: '100mg',          unite: 'gélule',   stockActuel: 120, seuilAlerte: 15,  prixUnitaire: 25  },
    // Analgésiques / Antipyrétiques
    { nom: 'Paracétamol 500mg',         dci: 'Paracétamol',                       categorie: 'Analgésique',  forme: 'Comprimé',  dosageForme: '500mg',          unite: 'comprimé', stockActuel: 1000,seuilAlerte: 100, prixUnitaire: 3   },
    { nom: 'Paracétamol 1g',            dci: 'Paracétamol',                       categorie: 'Analgésique',  forme: 'Comprimé',  dosageForme: '1g',             unite: 'comprimé', stockActuel: 600, seuilAlerte: 80,  prixUnitaire: 5   },
    { nom: 'Paracétamol IV',            dci: 'Paracétamol',                       categorie: 'Analgésique',  forme: 'Perfusion', dosageForme: '1g/100ml',       unite: 'flacon',   stockActuel: 80,  seuilAlerte: 10,  prixUnitaire: 180 },
    { nom: 'Paracétamol sirop',         dci: 'Paracétamol',                       categorie: 'Analgésique',  forme: 'Sirop',     dosageForme: '250mg/5ml',      unite: 'flacon',   stockActuel: 100, seuilAlerte: 15,  prixUnitaire: 80  },
    { nom: 'Ibuprofène 400mg',          dci: 'Ibuprofène',                        categorie: 'Analgésique',  forme: 'Comprimé',  dosageForme: '400mg',          unite: 'comprimé', stockActuel: 400, seuilAlerte: 50,  prixUnitaire: 10  },
    { nom: 'Ibuprofène sirop',          dci: 'Ibuprofène',                        categorie: 'Analgésique',  forme: 'Sirop',     dosageForme: '200mg/5ml',      unite: 'flacon',   stockActuel: 60,  seuilAlerte: 10,  prixUnitaire: 90  },
    { nom: 'Diclofénac injectable',     dci: 'Diclofénac',                        categorie: 'Analgésique',  forme: 'Injectable',dosageForme: '75mg/3ml',       unite: 'ampoule',  stockActuel: 80,  seuilAlerte: 10,  prixUnitaire: 50  },
    { nom: 'Tramadol 50mg',             dci: 'Tramadol',                          categorie: 'Analgésique',  forme: 'Gélule',    dosageForme: '50mg',           unite: 'gélule',   stockActuel: 150, seuilAlerte: 20,  prixUnitaire: 20  },
    { nom: 'Morphine injectable',       dci: 'Morphine',                          categorie: 'Analgésique',  forme: 'Injectable',dosageForme: '10mg/ml',        unite: 'ampoule',  stockActuel: 30,  seuilAlerte: 5,   prixUnitaire: 300 },
    { nom: 'Aspirine 500mg',            dci: 'Acide acétylsalicylique',           categorie: 'Analgésique',  forme: 'Comprimé',  dosageForme: '500mg',          unite: 'comprimé', stockActuel: 300, seuilAlerte: 40,  prixUnitaire: 4   },
    // Antihypertenseurs
    { nom: 'Amlodipine 5mg',            dci: 'Amlodipine',                        categorie: 'Antihypertenseur', forme: 'Comprimé', dosageForme: '5mg',          unite: 'comprimé', stockActuel: 300, seuilAlerte: 40,  prixUnitaire: 15  },
    { nom: 'Amlodipine 10mg',           dci: 'Amlodipine',                        categorie: 'Antihypertenseur', forme: 'Comprimé', dosageForme: '10mg',         unite: 'comprimé', stockActuel: 200, seuilAlerte: 30,  prixUnitaire: 20  },
    { nom: 'Captopril 25mg',            dci: 'Captopril',                         categorie: 'Antihypertenseur', forme: 'Comprimé', dosageForme: '25mg',         unite: 'comprimé', stockActuel: 250, seuilAlerte: 35,  prixUnitaire: 12  },
    { nom: 'Énalapril 10mg',            dci: 'Énalapril',                         categorie: 'Antihypertenseur', forme: 'Comprimé', dosageForme: '10mg',         unite: 'comprimé', stockActuel: 200, seuilAlerte: 30,  prixUnitaire: 18  },
    { nom: 'Aténolol 50mg',             dci: 'Aténolol',                          categorie: 'Antihypertenseur', forme: 'Comprimé', dosageForme: '50mg',         unite: 'comprimé', stockActuel: 180, seuilAlerte: 25,  prixUnitaire: 15  },
    { nom: 'Hydrochlorothiazide 25mg',  dci: 'Hydrochlorothiazide',               categorie: 'Antihypertenseur', forme: 'Comprimé', dosageForme: '25mg',         unite: 'comprimé', stockActuel: 200, seuilAlerte: 30,  prixUnitaire: 8   },
    { nom: 'Furosémide 40mg',           dci: 'Furosémide',                        categorie: 'Antihypertenseur', forme: 'Comprimé', dosageForme: '40mg',         unite: 'comprimé', stockActuel: 200, seuilAlerte: 30,  prixUnitaire: 10  },
    { nom: 'Furosémide injectable',     dci: 'Furosémide',                        categorie: 'Antihypertenseur', forme: 'Injectable', dosageForme: '20mg/2ml',   unite: 'ampoule',  stockActuel: 60,  seuilAlerte: 10,  prixUnitaire: 60  },
    { nom: 'Nifédipine 10mg',           dci: 'Nifédipine',                        categorie: 'Antihypertenseur', forme: 'Comprimé', dosageForme: '10mg',         unite: 'comprimé', stockActuel: 150, seuilAlerte: 20,  prixUnitaire: 12  },
    // Antidiabétiques
    { nom: 'Metformine 500mg',          dci: 'Metformine',                        categorie: 'Antidiabétique', forme: 'Comprimé',  dosageForme: '500mg',         unite: 'comprimé', stockActuel: 400, seuilAlerte: 50,  prixUnitaire: 8   },
    { nom: 'Metformine 850mg',          dci: 'Metformine',                        categorie: 'Antidiabétique', forme: 'Comprimé',  dosageForme: '850mg',         unite: 'comprimé', stockActuel: 300, seuilAlerte: 40,  prixUnitaire: 12  },
    { nom: 'Glibenclamide 5mg',         dci: 'Glibenclamide',                     categorie: 'Antidiabétique', forme: 'Comprimé',  dosageForme: '5mg',           unite: 'comprimé', stockActuel: 200, seuilAlerte: 30,  prixUnitaire: 10  },
    { nom: 'Insuline NPH 100UI',        dci: 'Insuline humaine isophane',         categorie: 'Antidiabétique', forme: 'Flacon',    dosageForme: '100UI/ml',      unite: 'flacon',   stockActuel: 30,  seuilAlerte: 5,   prixUnitaire: 800 },
    // Antipaludéens (très importants en Haïti)
    { nom: 'Artémether + Luméfantrine', dci: 'Artémether + Luméfantrine',         categorie: 'Antipaludéen', forme: 'Comprimé',    dosageForme: '20mg/120mg',    unite: 'comprimé', stockActuel: 200, seuilAlerte: 30,  prixUnitaire: 50  },
    { nom: 'Artésunat comprimé',        dci: 'Artésunat',                         categorie: 'Antipaludéen', forme: 'Comprimé',    dosageForme: '200mg',         unite: 'comprimé', stockActuel: 150, seuilAlerte: 20,  prixUnitaire: 40  },
    { nom: 'Quinine 300mg',             dci: 'Quinine',                           categorie: 'Antipaludéen', forme: 'Comprimé',    dosageForme: '300mg',         unite: 'comprimé', stockActuel: 200, seuilAlerte: 30,  prixUnitaire: 15  },
    { nom: 'Quinine injectable',        dci: 'Quinine',                           categorie: 'Antipaludéen', forme: 'Injectable',  dosageForme: '600mg/2ml',     unite: 'ampoule',  stockActuel: 50,  seuilAlerte: 8,   prixUnitaire: 120 },
    // Corticoïdes
    { nom: 'Dexaméthasone 4mg',         dci: 'Dexaméthasone',                     categorie: 'Corticoïde', forme: 'Injectable',    dosageForme: '4mg/ml',        unite: 'ampoule',  stockActuel: 100, seuilAlerte: 15,  prixUnitaire: 80  },
    { nom: 'Prednisolone 5mg',          dci: 'Prednisolone',                      categorie: 'Corticoïde', forme: 'Comprimé',      dosageForme: '5mg',           unite: 'comprimé', stockActuel: 200, seuilAlerte: 30,  prixUnitaire: 10  },
    { nom: 'Hydrocortisone 100mg',      dci: 'Hydrocortisone',                    categorie: 'Corticoïde', forme: 'Injectable',    dosageForme: '100mg',         unite: 'flacon',   stockActuel: 60,  seuilAlerte: 10,  prixUnitaire: 200 },
    // Gastro-entérologie
    { nom: 'Oméprazole 20mg',           dci: 'Oméprazole',                        categorie: 'Gastroprotecteur', forme: 'Gélule',  dosageForme: '20mg',          unite: 'gélule',   stockActuel: 300, seuilAlerte: 40,  prixUnitaire: 12  },
    { nom: 'Ranitidine 150mg',          dci: 'Ranitidine',                        categorie: 'Gastroprotecteur', forme: 'Comprimé',dosageForme: '150mg',         unite: 'comprimé', stockActuel: 200, seuilAlerte: 30,  prixUnitaire: 8   },
    { nom: 'Métoclopramide 10mg',       dci: 'Métoclopramide',                    categorie: 'Antiémétique',     forme: 'Comprimé',dosageForme: '10mg',          unite: 'comprimé', stockActuel: 200, seuilAlerte: 30,  prixUnitaire: 10  },
    { nom: 'Métoclopramide injectable', dci: 'Métoclopramide',                    categorie: 'Antiémétique',     forme: 'Injectable', dosageForme: '10mg/2ml',   unite: 'ampoule',  stockActuel: 60,  seuilAlerte: 10,  prixUnitaire: 40  },
    // Vitamines et suppléments
    { nom: 'Fer + Acide folique',       dci: 'Sulfate ferreux + Acide folique',   categorie: 'Supplément', forme: 'Comprimé',      dosageForme: '200mg/0,4mg',   unite: 'comprimé', stockActuel: 500, seuilAlerte: 60,  prixUnitaire: 5   },
    { nom: 'Vitamine C 500mg',          dci: 'Acide ascorbique',                  categorie: 'Supplément', forme: 'Comprimé',      dosageForme: '500mg',         unite: 'comprimé', stockActuel: 300, seuilAlerte: 40,  prixUnitaire: 5   },
    { nom: 'Vitamine B12 1000mcg',      dci: 'Cyanocobalamine',                   categorie: 'Supplément', forme: 'Comprimé',      dosageForme: '1000mcg',       unite: 'comprimé', stockActuel: 200, seuilAlerte: 25,  prixUnitaire: 10  },
    { nom: 'Calcium + Vitamine D3',     dci: 'Calcium + Cholécalciférol',         categorie: 'Supplément', forme: 'Comprimé',      dosageForme: '500mg/400UI',   unite: 'comprimé', stockActuel: 200, seuilAlerte: 30,  prixUnitaire: 12  },
    // Antiparasitaires
    { nom: 'Albendazole 400mg',         dci: 'Albendazole',                       categorie: 'Antiparasitaire', forme: 'Comprimé', dosageForme: '400mg',         unite: 'comprimé', stockActuel: 150, seuilAlerte: 20,  prixUnitaire: 20  },
    { nom: 'Ivermectine 3mg',           dci: 'Ivermectine',                       categorie: 'Antiparasitaire', forme: 'Comprimé', dosageForme: '3mg',           unite: 'comprimé', stockActuel: 100, seuilAlerte: 15,  prixUnitaire: 25  },
    { nom: 'Mébendazole 100mg',         dci: 'Mébendazole',                       categorie: 'Antiparasitaire', forme: 'Comprimé', dosageForme: '100mg',         unite: 'comprimé', stockActuel: 200, seuilAlerte: 25,  prixUnitaire: 8   },
    // Respiratoire
    { nom: 'Salbutamol aérosol',        dci: 'Salbutamol',                        categorie: 'Bronchodilatateur', forme: 'Aérosol', dosageForme: '100mcg/dose',  unite: 'inhalateur', stockActuel: 40, seuilAlerte: 8,  prixUnitaire: 350 },
    { nom: 'Salbutamol sirop',          dci: 'Salbutamol',                        categorie: 'Bronchodilatateur', forme: 'Sirop',   dosageForme: '2mg/5ml',      unite: 'flacon',   stockActuel: 60,  seuilAlerte: 10,  prixUnitaire: 100 },
    // Perfusions
    { nom: 'Glucose 5% 500ml',          dci: 'Glucose',                           categorie: 'Perfusion', forme: 'Perfusion',       dosageForme: '5%',            unite: 'flacon',   stockActuel: 100, seuilAlerte: 15,  prixUnitaire: 250 },
    { nom: 'Sérum physiologique 500ml', dci: 'Chlorure de sodium',                categorie: 'Perfusion', forme: 'Perfusion',       dosageForme: '0,9%',          unite: 'flacon',   stockActuel: 100, seuilAlerte: 15,  prixUnitaire: 220 },
    { nom: 'Ringer Lactate 500ml',      dci: 'Solution de Ringer',                categorie: 'Perfusion', forme: 'Perfusion',       dosageForme: '500ml',         unite: 'flacon',   stockActuel: 80,  seuilAlerte: 12,  prixUnitaire: 280 },
    { nom: 'ORS sachet',                dci: 'Sels de réhydratation orale',       categorie: 'Réhydratation', forme: 'Sachet',    dosageForme: 'pour 1L',        unite: 'sachet',   stockActuel: 200, seuilAlerte: 30,  prixUnitaire: 30  },
  ]

  let medsCreated = 0
  for (const m of medicaments) {
    const existing = await (prisma as any).medicament.findFirst({ where: { nom: m.nom } })
    if (!existing) {
      await (prisma as any).medicament.create({ data: m })
      medsCreated++
    }
  }
  console.log(`✅ ${medsCreated} médicament(s) créé(s) sur ${medicaments.length} définis`)

  console.log('\n✨ Seed terminé avec succès !')
  console.log('\n📋 Résumé :')
  console.log('   • 5 services médicaux')
  console.log('   • 6 utilisateurs (admin + 2 médecins + infirmier + caissier + accueil)')
  console.log('   • 8 patients')
  console.log("   • 5 rendez-vous (aujourd'hui)")
  console.log("   • 2 entrées file d'attente")
  console.log('   • 2 consultations')
  console.log('   • 2 examens')
  console.log('   • 2 factures')
  console.log('\n🔑 Connexion : admin@medika.ht / Admin@123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
