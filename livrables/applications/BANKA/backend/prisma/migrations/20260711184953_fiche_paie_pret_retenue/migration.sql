-- AlterEnum
ALTER TYPE "TypeRemboursement" ADD VALUE 'RETENUE_SALAIRE';

-- AlterTable
ALTER TABLE "fiches_paie" ADD COLUMN     "pretId" TEXT;

-- AddForeignKey
ALTER TABLE "fiches_paie" ADD CONSTRAINT "fiches_paie_pretId_fkey" FOREIGN KEY ("pretId") REFERENCES "prets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
