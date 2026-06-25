-- CreateEnum
CREATE TYPE "TypeGarantie" AS ENUM ('HYPOTHEQUE', 'NANTISSEMENT', 'CAUTION', 'GAGE', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutGarantie" AS ENUM ('ACTIVE', 'LEVEE', 'SAISIE');

-- CreateTable
CREATE TABLE "garanties" (
    "id" TEXT NOT NULL,
    "pretId" TEXT NOT NULL,
    "type" "TypeGarantie" NOT NULL,
    "statut" "StatutGarantie" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT NOT NULL,
    "valeurEstimee" DECIMAL(15,2),
    "dateConstit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateLevee" TIMESTAMP(3),
    "notes" TEXT,
    "creeParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "garanties_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "garanties" ADD CONSTRAINT "garanties_pretId_fkey" FOREIGN KEY ("pretId") REFERENCES "prets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garanties" ADD CONSTRAINT "garanties_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
