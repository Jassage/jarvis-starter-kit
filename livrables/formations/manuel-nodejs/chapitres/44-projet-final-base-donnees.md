<div class="chapitre-titre-num">CHAPITRE 44</div>

# Projet final — Base de données avec Prisma + PostgreSQL

## 44.1 Schéma Prisma complet de MediAPI

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Utilisateur {
  id             Int          @id @default(autoincrement())
  nom            String
  email          String       @unique
  motDePasseHash String
  role           Role         @default(RECEPTIONNISTE)
  refreshTokens  RefreshToken[]
  consultations  Consultation[] @relation("MedecinConsultations")
  rendezVous     RendezVous[]    @relation("MedecinRendezVous")
  createdAt      DateTime     @default(now())
}

model RefreshToken {
  id            Int         @id @default(autoincrement())
  tokenHash     String
  utilisateur   Utilisateur @relation(fields: [utilisateurId], references: [id])
  utilisateurId Int
  revoque       Boolean     @default(false)
  expireLe      DateTime
  createdAt     DateTime    @default(now())

  @@index([utilisateurId])
}

model Patient {
  id             Int            @id @default(autoincrement())
  nom            String
  dateNaissance  DateTime
  telephone      String?
  adresse        String?
  consultations  Consultation[]
  rendezVous     RendezVous[]
  documents      Document[]
  createdAt      DateTime       @default(now())

  @@index([nom])
}

model Consultation {
  id             Int         @id @default(autoincrement())
  patient        Patient     @relation(fields: [patientId], references: [id])
  patientId      Int
  medecin        Utilisateur @relation("MedecinConsultations", fields: [medecinId], references: [id])
  medecinId      Int
  motif          String
  diagnostic     String?
  prescriptions  String?
  date           DateTime    @default(now())

  @@index([patientId])
  @@index([medecinId])
}

model RendezVous {
  id         Int              @id @default(autoincrement())
  patient    Patient          @relation(fields: [patientId], references: [id])
  patientId  Int
  medecin    Utilisateur      @relation("MedecinRendezVous", fields: [medecinId], references: [id])
  medecinId  Int
  dateHeure  DateTime
  statut     StatutRendezVous @default(PLANIFIE)

  @@index([patientId])
  @@index([dateHeure])
}

model Document {
  id         Int      @id @default(autoincrement())
  patient    Patient  @relation(fields: [patientId], references: [id])
  patientId  Int
  nomFichier String
  cheminFichier String
  typeDocument String
  createdAt  DateTime @default(now())

  @@index([patientId])
}

enum Role {
  ADMIN
  MEDECIN
  RECEPTIONNISTE
}

enum StatutRendezVous {
  PLANIFIE
  CONFIRME
  ANNULE
  TERMINE
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi des index sur patientId, medecinId, dateHeure</span>
Rappel du chapitre 25 (SQL indispensable, dans le manuel Java de ce même auteur) et du chapitre 21 de ce manuel : ces colonnes sont systématiquement utilisées dans des `WHERE`/jointures (lister les consultations d'un patient, les rendez-vous d'une période) — les indexer accélère considérablement ces requêtes fréquentes, à mesure que le volume de données grandit.
</div>

## 44.2 Générer et appliquer la première migration

```
$ npx prisma migrate dev --name init
```

```
prisma/migrations/
└── 20260705120000_init/
    └── migration.sql
```

## 44.3 Script de seed (données de démonstration)

```js
// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  const motDePasseHash = await bcrypt.hash("motdepasse123", 10);

  const admin = await prisma.utilisateur.create({
    data: { nom: "Admin Système", email: "admin@mediapi.ht", motDePasseHash, role: "ADMIN" },
  });

  const medecin = await prisma.utilisateur.create({
    data: { nom: "Dr. Jaslin Occius", email: "medecin@mediapi.ht", motDePasseHash, role: "MEDECIN" },
  });

  const patient = await prisma.patient.create({
    data: { nom: "Marie Pierre", dateNaissance: new Date("1990-05-15"), telephone: "+509 3456 7890" },
  });

  await prisma.consultation.create({
    data: {
      patientId: patient.id,
      medecinId: medecin.id,
      motif: "Consultation de routine",
      diagnostic: "Rien à signaler",
    },
  });

  console.log("Seed terminé :", { admin: admin.email, medecin: medecin.email, patient: patient.nom });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

```json
// package.json
"prisma": {
  "seed": "node prisma/seed.js"
},
"scripts": {
  "db:seed": "npx prisma db seed"
}
```

## 44.4 Requête de rapport agrégé (aperçu, détaillé au chapitre 45)

```js
async function consultationsParMedecin(dateDebut, dateFin) {
  return prisma.consultation.groupBy({
    by: ["medecinId"],
    where: { date: { gte: dateDebut, lte: dateFin } },
    _count: { id: true },
  });
}
```

## 44.5 Résumé du chapitre

- Le schéma Prisma complet de MediAPI couvre `Utilisateur`, `RefreshToken`, `Patient`, `Consultation`, `RendezVous`, `Document`, avec index sur les colonnes fréquemment interrogées.
- `prisma migrate dev --name init` génère et applique la première migration versionnée.
- Un script de seed (`prisma/seed.js`) peuple la base avec des comptes et données de démonstration cohérents, réutilisables en développement comme en tests.
- `groupBy` de Prisma permet des agrégations directement en base de données, sans charger toutes les lignes en mémoire Node.js.

*Chapitre suivant : l'upload de documents médicaux et la génération de rapports d'activité complets.*
