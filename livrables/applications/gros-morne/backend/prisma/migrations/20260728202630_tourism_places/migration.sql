-- CreateEnum
CREATE TYPE "CategorieTourisme" AS ENUM ('NATURE', 'CASCADE', 'RIVIERE', 'MONTAGNE', 'GROTTE', 'EGLISE', 'SITE_HISTORIQUE', 'SENTIER', 'HEBERGEMENT', 'RESTAURANT', 'CULTURE', 'EVENEMENT', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutPublication" AS ENUM ('BROUILLON', 'PUBLIE', 'ARCHIVE');

-- CreateTable
CREATE TABLE "tourism_places" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" "CategorieTourisme" NOT NULL,
    "duree" TEXT,
    "difficulte" TEXT,
    "tags" TEXT[],
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "horaires" TEXT,
    "tarif" TEXT,
    "telephone" TEXT,
    "servicesDisponibles" TEXT[],
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tourism_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tourism_places_traductions" (
    "id" TEXT NOT NULL,
    "tourismPlaceId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "description" TEXT NOT NULL,
    "conseils" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tourism_places_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tourism_places_photos" (
    "id" TEXT NOT NULL,
    "tourismPlaceId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tourism_places_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tourism_places_traductions_tourismPlaceId_locale_key" ON "tourism_places_traductions"("tourismPlaceId", "locale");

-- CreateIndex
CREATE INDEX "tourism_places_photos_mediaId_idx" ON "tourism_places_photos"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "tourism_places_photos_tourismPlaceId_mediaId_key" ON "tourism_places_photos"("tourismPlaceId", "mediaId");

-- AddForeignKey
ALTER TABLE "tourism_places_traductions" ADD CONSTRAINT "tourism_places_traductions_tourismPlaceId_fkey" FOREIGN KEY ("tourismPlaceId") REFERENCES "tourism_places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tourism_places_photos" ADD CONSTRAINT "tourism_places_photos_tourismPlaceId_fkey" FOREIGN KEY ("tourismPlaceId") REFERENCES "tourism_places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tourism_places_photos" ADD CONSTRAINT "tourism_places_photos_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "medias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
