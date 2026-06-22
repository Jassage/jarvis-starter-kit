-- CreateEnum
CREATE TYPE "ExamenStatut" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'RESULTAT_DISPONIBLE', 'ANNULE');

-- CreateTable
CREATE TABLE "examens" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "consultationId" TEXT,
    "medecinId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "statut" "ExamenStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "resultat" TEXT,
    "dateResultat" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "examens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "examens_numero_key" ON "examens"("numero");

-- AddForeignKey
ALTER TABLE "examens" ADD CONSTRAINT "examens_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examens" ADD CONSTRAINT "examens_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examens" ADD CONSTRAINT "examens_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
