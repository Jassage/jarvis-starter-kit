-- CreateEnum
CREATE TYPE "StatutTacheMenage" AS ENUM ('A_FAIRE', 'EN_COURS', 'TERMINE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StatutChambre" ADD VALUE 'OCCUPEE';
ALTER TYPE "StatutChambre" ADD VALUE 'NETTOYAGE_EN_COURS';

-- CreateTable
CREATE TABLE "taches_menage" (
    "id" TEXT NOT NULL,
    "chambreId" TEXT NOT NULL,
    "dateAssignation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutTacheMenage" NOT NULL DEFAULT 'A_FAIRE',
    "employeAssigneId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taches_menage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "taches_menage_chambreId_idx" ON "taches_menage"("chambreId");

-- CreateIndex
CREATE INDEX "taches_menage_statut_idx" ON "taches_menage"("statut");

-- AddForeignKey
ALTER TABLE "taches_menage" ADD CONSTRAINT "taches_menage_chambreId_fkey" FOREIGN KEY ("chambreId") REFERENCES "chambres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taches_menage" ADD CONSTRAINT "taches_menage_employeAssigneId_fkey" FOREIGN KEY ("employeAssigneId") REFERENCES "employes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
