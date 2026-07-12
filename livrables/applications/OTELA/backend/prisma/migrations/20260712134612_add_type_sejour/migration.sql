-- CreateEnum
CREATE TYPE "TypeSejour" AS ENUM ('NUITEE', 'JOUR');

-- DropIndex
DROP INDEX "tarifs_typeChambreId_devise_idx";

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "typeSejour" "TypeSejour" NOT NULL DEFAULT 'NUITEE';

-- AlterTable
ALTER TABLE "tarifs" ADD COLUMN     "typeSejour" "TypeSejour" NOT NULL DEFAULT 'NUITEE';

-- CreateIndex
CREATE INDEX "tarifs_typeChambreId_devise_typeSejour_idx" ON "tarifs"("typeChambreId", "devise", "typeSejour");
