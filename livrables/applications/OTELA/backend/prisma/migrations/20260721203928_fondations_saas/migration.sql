-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RoleEmploye" ADD VALUE 'MAINTENANCE';
ALTER TYPE "RoleEmploye" ADD VALUE 'COMPTABLE';
ALTER TYPE "RoleEmploye" ADD VALUE 'PROPRIETAIRE';

-- AlterEnum
ALTER TYPE "StatutChambre" ADD VALUE 'RESERVEE';

-- AlterTable
ALTER TABLE "etablissements" ADD COLUMN     "description" TEXT,
ADD COLUMN     "devisePrincipale" "Devise" NOT NULL DEFAULT 'HTG',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "equipements" TEXT[],
ADD COLUMN     "fuseauHoraire" TEXT NOT NULL DEFAULT 'America/Port-au-Prince',
ADD COLUMN     "heureCheckIn" TEXT NOT NULL DEFAULT '14:00',
ADD COLUMN     "heureCheckOut" TEXT NOT NULL DEFAULT '12:00',
ADD COLUMN     "latitude" DECIMAL(10,7),
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "longitude" DECIMAL(10,7),
ADD COLUMN     "politiqueAnnulation" TEXT,
ADD COLUMN     "siteWeb" TEXT,
ADD COLUMN     "telephone" TEXT;

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "nombreAdultes" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "nombreEnfants" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "types_chambres" ADD COLUMN     "equipements" TEXT[],
ADD COLUMN     "nombreLits" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "superficie" INTEGER;

-- CreateTable
CREATE TABLE "photos_chambres" (
    "id" TEXT NOT NULL,
    "typeChambreId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "legende" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "estPrincipale" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_chambres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_audit" (
    "id" TEXT NOT NULL,
    "employeId" TEXT,
    "employeNom" TEXT,
    "employeRole" TEXT,
    "etablissementId" TEXT,
    "action" TEXT NOT NULL,
    "entite" TEXT NOT NULL,
    "entiteId" TEXT,
    "details" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "photos_chambres_typeChambreId_idx" ON "photos_chambres"("typeChambreId");

-- CreateIndex
CREATE INDEX "journal_audit_createdAt_idx" ON "journal_audit"("createdAt");

-- CreateIndex
CREATE INDEX "journal_audit_employeId_idx" ON "journal_audit"("employeId");

-- CreateIndex
CREATE INDEX "journal_audit_etablissementId_idx" ON "journal_audit"("etablissementId");

-- CreateIndex
CREATE INDEX "journal_audit_entite_entiteId_idx" ON "journal_audit"("entite", "entiteId");

-- AddForeignKey
ALTER TABLE "photos_chambres" ADD CONSTRAINT "photos_chambres_typeChambreId_fkey" FOREIGN KEY ("typeChambreId") REFERENCES "types_chambres"("id") ON DELETE CASCADE ON UPDATE CASCADE;
