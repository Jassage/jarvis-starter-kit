-- CreateEnum
CREATE TYPE "FrequenceEpargne" AS ENUM ('HEBDOMADAIRE', 'MENSUEL', 'BIMESTRIEL', 'TRIMESTRIEL');

-- AlterTable
ALTER TABLE "comptes" ADD COLUMN     "dateCloture" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "epargnes_programmees" (
    "id" TEXT NOT NULL,
    "compteSourceId" TEXT NOT NULL,
    "compteDestId" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "frequence" "FrequenceEpargne" NOT NULL,
    "prochainVersement" TIMESTAMP(3) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "nombreExecutions" INTEGER NOT NULL DEFAULT 0,
    "derniereExecution" TIMESTAMP(3),
    "creeParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "epargnes_programmees_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "epargnes_programmees" ADD CONSTRAINT "epargnes_programmees_compteSourceId_fkey" FOREIGN KEY ("compteSourceId") REFERENCES "comptes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "epargnes_programmees" ADD CONSTRAINT "epargnes_programmees_compteDestId_fkey" FOREIGN KEY ("compteDestId") REFERENCES "comptes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "epargnes_programmees" ADD CONSTRAINT "epargnes_programmees_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
