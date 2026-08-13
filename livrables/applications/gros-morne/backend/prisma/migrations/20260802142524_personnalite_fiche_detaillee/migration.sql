-- CreateEnum
CREATE TYPE "CategorieHonneur" AS ENUM ('POLITIQUE', 'CULTURE', 'EDUCATION', 'SPORT', 'ENTREPRENEURIAT', 'AUTRE');

-- AlterTable
ALTER TABLE "personnalites" ADD COLUMN     "categorie" "CategorieHonneur" NOT NULL DEFAULT 'AUTRE',
ADD COLUMN     "dateNaissance" TIMESTAMP(3),
ADD COLUMN     "lieuNaissance" TEXT,
ADD COLUMN     "nationalite" TEXT,
ADD COLUMN     "periodeActivite" TEXT,
ADD COLUMN     "profession" TEXT;

-- AlterTable
ALTER TABLE "personnalites_traductions" ADD COLUMN     "citation" TEXT,
ADD COLUMN     "realisations" TEXT[] DEFAULT ARRAY[]::TEXT[];
