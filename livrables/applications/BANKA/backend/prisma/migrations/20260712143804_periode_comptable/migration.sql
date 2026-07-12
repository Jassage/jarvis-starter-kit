-- CreateEnum
CREATE TYPE "StatutPeriodeComptable" AS ENUM ('OUVERTE', 'CLOTUREE');

-- CreateTable
CREATE TABLE "periodes_comptables" (
    "id" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "statut" "StatutPeriodeComptable" NOT NULL DEFAULT 'OUVERTE',
    "clotureeParId" TEXT,
    "clotureeAt" TIMESTAMP(3),
    "reouverteParId" TEXT,
    "reouverteAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periodes_comptables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "periodes_comptables_periode_key" ON "periodes_comptables"("periode");

-- CreateIndex
CREATE INDEX "periodes_comptables_statut_idx" ON "periodes_comptables"("statut");
