-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TypeCompte" ADD VALUE 'JOINT';
ALTER TYPE "TypeCompte" ADD VALUE 'MICRO_EPARGNE';
ALTER TYPE "TypeCompte" ADD VALUE 'TONTINE';
ALTER TYPE "TypeCompte" ADD VALUE 'RETRAITE';
ALTER TYPE "TypeCompte" ADD VALUE 'JEUNESSE';
ALTER TYPE "TypeCompte" ADD VALUE 'CREDIT';
