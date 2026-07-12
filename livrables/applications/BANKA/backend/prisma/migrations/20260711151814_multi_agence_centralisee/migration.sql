-- CreateEnum
CREATE TYPE "StatutTransfertTresorerie" AS ENUM ('ENVOYE', 'RECU', 'ANNULE');

-- AlterTable
ALTER TABLE "sessions_caisse" ADD COLUMN     "ecartConstate" DECIMAL(15,2),
ADD COLUMN     "justificationEcart" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "agenceExecutionId" TEXT;

-- CreateTable
CREATE TABLE "caisses_agence" (
    "id" TEXT NOT NULL,
    "agenceId" TEXT NOT NULL,
    "devise" "Devise" NOT NULL,
    "solde" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "plafondAlerte" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caisses_agence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transferts_tresorerie" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "agenceSourceId" TEXT,
    "agenceDestId" TEXT,
    "devise" "Devise" NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "statut" "StatutTransfertTresorerie" NOT NULL DEFAULT 'ENVOYE',
    "notes" TEXT,
    "creeParId" TEXT NOT NULL,
    "recuParId" TEXT,
    "envoyeAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recuAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transferts_tresorerie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "caisses_agence_agenceId_devise_key" ON "caisses_agence"("agenceId", "devise");

-- CreateIndex
CREATE UNIQUE INDEX "transferts_tresorerie_reference_key" ON "transferts_tresorerie"("reference");

-- CreateIndex
CREATE INDEX "transferts_tresorerie_agenceSourceId_statut_idx" ON "transferts_tresorerie"("agenceSourceId", "statut");

-- CreateIndex
CREATE INDEX "transferts_tresorerie_agenceDestId_statut_idx" ON "transferts_tresorerie"("agenceDestId", "statut");

-- CreateIndex
CREATE INDEX "transactions_agenceExecutionId_idx" ON "transactions"("agenceExecutionId");

-- AddForeignKey
ALTER TABLE "caisses_agence" ADD CONSTRAINT "caisses_agence_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "agences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts_tresorerie" ADD CONSTRAINT "transferts_tresorerie_agenceSourceId_fkey" FOREIGN KEY ("agenceSourceId") REFERENCES "agences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts_tresorerie" ADD CONSTRAINT "transferts_tresorerie_agenceDestId_fkey" FOREIGN KEY ("agenceDestId") REFERENCES "agences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts_tresorerie" ADD CONSTRAINT "transferts_tresorerie_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts_tresorerie" ADD CONSTRAINT "transferts_tresorerie_recuParId_fkey" FOREIGN KEY ("recuParId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_agenceExecutionId_fkey" FOREIGN KEY ("agenceExecutionId") REFERENCES "agences"("id") ON DELETE SET NULL ON UPDATE CASCADE;
