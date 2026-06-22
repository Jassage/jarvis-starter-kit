-- CreateEnum
CREATE TYPE "VoieAdministration" AS ENUM ('ORAL', 'IV', 'IM', 'SC', 'TOPIQUE', 'INHALATION', 'SUBLINGUALE', 'RECTALE');

-- CreateEnum
CREATE TYPE "PrescriptionStatut" AS ENUM ('ACTIVE', 'SUSPENDUE', 'TERMINEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "AdministrationStatut" AS ENUM ('ADMINISTRE', 'OMIS', 'REFUSE', 'REPORTE');

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medecinId" TEXT NOT NULL,
    "sejourId" TEXT NOT NULL,
    "medicament" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "voie" "VoieAdministration" NOT NULL DEFAULT 'ORAL',
    "frequence" TEXT NOT NULL,
    "intervalleH" INTEGER NOT NULL DEFAULT 8,
    "dureeJours" INTEGER,
    "instructions" TEXT,
    "statut" "PrescriptionStatut" NOT NULL DEFAULT 'ACTIVE',
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administrations" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "infirmierId" TEXT NOT NULL,
    "dateHeure" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "AdministrationStatut" NOT NULL DEFAULT 'ADMINISTRE',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "administrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soins_infirmiers" (
    "id" TEXT NOT NULL,
    "sejourId" TEXT NOT NULL,
    "infirmierId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tension" TEXT,
    "pouls" INTEGER,
    "temperature" DOUBLE PRECISION,
    "spo2" DOUBLE PRECISION,
    "freqResp" INTEGER,
    "entrees" DOUBLE PRECISION,
    "sorties" DOUBLE PRECISION,
    "douleur" INTEGER,
    "actes" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soins_infirmiers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_sejourId_fkey" FOREIGN KEY ("sejourId") REFERENCES "sejours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrations" ADD CONSTRAINT "administrations_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrations" ADD CONSTRAINT "administrations_infirmierId_fkey" FOREIGN KEY ("infirmierId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soins_infirmiers" ADD CONSTRAINT "soins_infirmiers_sejourId_fkey" FOREIGN KEY ("sejourId") REFERENCES "sejours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soins_infirmiers" ADD CONSTRAINT "soins_infirmiers_infirmierId_fkey" FOREIGN KEY ("infirmierId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
