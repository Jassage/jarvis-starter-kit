-- Écrite à la main : le moteur de schéma Prisma (JSON-RPC over stdio) refuse de s'exécuter en
-- non-interactif dès qu'un avertissement de contrainte apparaît (cf. HISTORY.md, même limitation
-- que Phase 2/4/5). Appliquée manuellement via un script Node ponctuel, `prisma generate`
-- (moteur de requête, non concerné) régénère ensuite le client. Table `ordonnances` vide au
-- moment de cette migration (base remise à l'état seed après la session précédente) — aucune
-- perte de données réelle.

-- DropForeignKey
ALTER TABLE "ordonnances" DROP CONSTRAINT "ordonnances_venteId_fkey";

-- DropIndex
DROP INDEX "ordonnances_venteId_key";

-- DropIndex
DROP INDEX "ordonnances_numero_key";

-- CreateEnum
CREATE TYPE "StatutOrdonnance" AS ENUM ('ENREGISTREE', 'PARTIELLEMENT_SERVIE', 'SERVIE', 'ANNULEE');

-- AlterTable
ALTER TABLE "ordonnances"
  DROP COLUMN "venteId",
  ADD COLUMN "pharmacieId" TEXT NOT NULL,
  ADD COLUMN "clientId" TEXT,
  ADD COLUMN "statut" "StatutOrdonnance" NOT NULL DEFAULT 'ENREGISTREE',
  ADD COLUMN "pieceJointeUrl" TEXT;

-- AlterTable
ALTER TABLE "ventes" ADD COLUMN "ordonnanceId" TEXT;

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" TEXT NOT NULL,
    "ordonnanceId" TEXT NOT NULL,
    "produitId" TEXT,
    "medicamentNom" TEXT NOT NULL,
    "dosage" TEXT,
    "posologie" TEXT,
    "dureeJours" INTEGER,
    "quantitePrescrite" INTEGER NOT NULL,
    "quantiteServie" INTEGER NOT NULL DEFAULT 0,
    "instructions" TEXT,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ordonnances_pharmacieId_idx" ON "ordonnances"("pharmacieId");

-- CreateIndex
CREATE UNIQUE INDEX "ordonnances_pharmacieId_numero_key" ON "ordonnances"("pharmacieId", "numero");

-- CreateIndex
CREATE INDEX "prescription_items_ordonnanceId_idx" ON "prescription_items"("ordonnanceId");

-- CreateIndex
CREATE INDEX "ventes_ordonnanceId_idx" ON "ventes"("ordonnanceId");

-- AddForeignKey
ALTER TABLE "ordonnances" ADD CONSTRAINT "ordonnances_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordonnances" ADD CONSTRAINT "ordonnances_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_ordonnanceId_fkey" FOREIGN KEY ("ordonnanceId") REFERENCES "ordonnances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_ordonnanceId_fkey" FOREIGN KEY ("ordonnanceId") REFERENCES "ordonnances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
