-- CreateEnum
CREATE TYPE "StatutRendezVousSpa" AS ENUM ('CONFIRME', 'TERMINE', 'ANNULE');

-- CreateTable
CREATE TABLE "services_spa" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "dureeMinutes" INTEGER NOT NULL,
    "prix" DECIMAL(12,2) NOT NULL,
    "devise" "Devise" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "services_spa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "praticiens" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "specialites" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "praticiens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rendez_vous_spa" (
    "id" TEXT NOT NULL,
    "serviceSpaId" TEXT NOT NULL,
    "praticienId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "dateHeure" TIMESTAMP(3) NOT NULL,
    "statut" "StatutRendezVousSpa" NOT NULL DEFAULT 'CONFIRME',
    "folioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rendez_vous_spa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "services_spa_etablissementId_idx" ON "services_spa"("etablissementId");

-- CreateIndex
CREATE INDEX "praticiens_etablissementId_idx" ON "praticiens"("etablissementId");

-- CreateIndex
CREATE INDEX "rendez_vous_spa_praticienId_dateHeure_idx" ON "rendez_vous_spa"("praticienId", "dateHeure");

-- CreateIndex
CREATE INDEX "rendez_vous_spa_folioId_idx" ON "rendez_vous_spa"("folioId");

-- AddForeignKey
ALTER TABLE "services_spa" ADD CONSTRAINT "services_spa_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "praticiens" ADD CONSTRAINT "praticiens_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendez_vous_spa" ADD CONSTRAINT "rendez_vous_spa_serviceSpaId_fkey" FOREIGN KEY ("serviceSpaId") REFERENCES "services_spa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendez_vous_spa" ADD CONSTRAINT "rendez_vous_spa_praticienId_fkey" FOREIGN KEY ("praticienId") REFERENCES "praticiens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendez_vous_spa" ADD CONSTRAINT "rendez_vous_spa_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendez_vous_spa" ADD CONSTRAINT "rendez_vous_spa_folioId_fkey" FOREIGN KEY ("folioId") REFERENCES "folios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
