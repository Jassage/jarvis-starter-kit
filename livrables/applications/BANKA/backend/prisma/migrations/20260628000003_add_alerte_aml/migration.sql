-- CreateEnum
CREATE TYPE "TypeAlerteAML" AS ENUM ('SEUIL_DECLARE', 'STRUCTURATION', 'MANDATAIRE_BLACKLIST', 'VELOCITE_ELEVEE');

-- CreateTable
CREATE TABLE "alertes_aml" (
    "id" TEXT NOT NULL,
    "type" "TypeAlerteAML" NOT NULL,
    "compteId" TEXT,
    "clientId" TEXT,
    "transactionId" TEXT,
    "montantTotal" DECIMAL(15,2),
    "details" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'NOUVELLE',
    "traitePar" TEXT,
    "traiteAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertes_aml_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alertes_aml_statut_idx" ON "alertes_aml"("statut");
CREATE INDEX "alertes_aml_compteId_idx" ON "alertes_aml"("compteId");
CREATE INDEX "alertes_aml_clientId_idx" ON "alertes_aml"("clientId");
CREATE INDEX "alertes_aml_createdAt_idx" ON "alertes_aml"("createdAt");
