-- CreateEnum
CREATE TYPE "StatutAttente" AS ENUM ('EN_ATTENTE', 'EN_CONSULTATION', 'TERMINE', 'ABSENT');

-- AlterTable
ALTER TABLE "consultations" ADD COLUMN     "plainte" TEXT;

-- CreateTable
CREATE TABLE "file_attente" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "medecinId" TEXT,
    "motif" TEXT,
    "statut" "StatutAttente" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateFile" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appelleA" TIMESTAMP(3),
    "termineA" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_attente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_attente_appointmentId_key" ON "file_attente"("appointmentId");

-- AddForeignKey
ALTER TABLE "file_attente" ADD CONSTRAINT "file_attente_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attente" ADD CONSTRAINT "file_attente_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attente" ADD CONSTRAINT "file_attente_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
