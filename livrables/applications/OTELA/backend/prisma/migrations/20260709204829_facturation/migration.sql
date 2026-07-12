-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('IMPAYE', 'PARTIEL', 'PAYE');

-- CreateEnum
CREATE TYPE "MethodePaiement" AS ENUM ('ESPECES', 'CARTE', 'MONCASH', 'AUTRE');

-- AlterTable
ALTER TABLE "etablissements" ADD COLUMN     "tauxTaxe" DECIMAL(5,2) NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "factures" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "montantHT" DECIMAL(12,2) NOT NULL,
    "taxes" DECIMAL(12,2) NOT NULL,
    "montantTotal" DECIMAL(12,2) NOT NULL,
    "devise" "Devise" NOT NULL,
    "statutPaiement" "StatutPaiement" NOT NULL DEFAULT 'IMPAYE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "factureId" TEXT NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "methode" "MethodePaiement" NOT NULL,
    "datePaiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "factures_reservationId_key" ON "factures"("reservationId");

-- CreateIndex
CREATE INDEX "paiements_factureId_idx" ON "paiements"("factureId");

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "factures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
