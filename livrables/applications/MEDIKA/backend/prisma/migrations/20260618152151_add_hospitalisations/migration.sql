-- CreateEnum
CREATE TYPE "ChambreType" AS ENUM ('STANDARD', 'SOINS_INTENSIFS', 'MATERNITE', 'PEDIATRIE', 'ISOLEMENT');

-- CreateEnum
CREATE TYPE "LitStatut" AS ENUM ('DISPONIBLE', 'OCCUPE', 'MAINTENANCE', 'RESERVE');

-- CreateEnum
CREATE TYPE "SejourStatut" AS ENUM ('EN_COURS', 'SORTI', 'TRANSFERE');

-- CreateTable
CREATE TABLE "chambres" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "etage" INTEGER,
    "serviceId" TEXT,
    "type" "ChambreType" NOT NULL DEFAULT 'STANDARD',
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "chambres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lits" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "chambreId" TEXT NOT NULL,
    "statut" "LitStatut" NOT NULL DEFAULT 'DISPONIBLE',

    CONSTRAINT "lits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sejours" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "litId" TEXT NOT NULL,
    "medecinId" TEXT NOT NULL,
    "dateAdmission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateSortie" TIMESTAMP(3),
    "motif" TEXT,
    "statut" "SejourStatut" NOT NULL DEFAULT 'EN_COURS',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sejours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chambres_numero_key" ON "chambres"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "lits_numero_key" ON "lits"("numero");

-- AddForeignKey
ALTER TABLE "chambres" ADD CONSTRAINT "chambres_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lits" ADD CONSTRAINT "lits_chambreId_fkey" FOREIGN KEY ("chambreId") REFERENCES "chambres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sejours" ADD CONSTRAINT "sejours_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sejours" ADD CONSTRAINT "sejours_litId_fkey" FOREIGN KEY ("litId") REFERENCES "lits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sejours" ADD CONSTRAINT "sejours_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
