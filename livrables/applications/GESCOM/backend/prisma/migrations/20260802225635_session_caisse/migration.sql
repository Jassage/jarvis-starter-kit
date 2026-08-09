-- CreateEnum
CREATE TYPE "StatutSessionCaisse" AS ENUM ('OUVERTE', 'FERMEE');

-- AlterTable
ALTER TABLE "ventes" ADD COLUMN     "sessionCaisseId" TEXT;

-- CreateTable
CREATE TABLE "sessions_caisse" (
    "id" TEXT NOT NULL,
    "emplacementId" TEXT NOT NULL,
    "statut" "StatutSessionCaisse" NOT NULL DEFAULT 'OUVERTE',
    "soldeOuverture" DECIMAL(15,2) NOT NULL,
    "soldeTheorique" DECIMAL(15,2),
    "soldeFermeture" DECIMAL(15,2),
    "ecartConstate" DECIMAL(15,2),
    "notes" TEXT,
    "ouvertParId" TEXT NOT NULL,
    "fermeParId" TEXT,
    "dateOuverture" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFermeture" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_caisse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sessions_caisse_emplacementId_statut_idx" ON "sessions_caisse"("emplacementId", "statut");

-- CreateIndex
CREATE INDEX "ventes_sessionCaisseId_idx" ON "ventes"("sessionCaisseId");

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_sessionCaisseId_fkey" FOREIGN KEY ("sessionCaisseId") REFERENCES "sessions_caisse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions_caisse" ADD CONSTRAINT "sessions_caisse_emplacementId_fkey" FOREIGN KEY ("emplacementId") REFERENCES "emplacements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions_caisse" ADD CONSTRAINT "sessions_caisse_ouvertParId_fkey" FOREIGN KEY ("ouvertParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions_caisse" ADD CONSTRAINT "sessions_caisse_fermeParId_fkey" FOREIGN KEY ("fermeParId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
