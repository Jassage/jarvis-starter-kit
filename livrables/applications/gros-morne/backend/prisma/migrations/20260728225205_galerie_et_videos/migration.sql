-- CreateEnum
CREATE TYPE "CategorieGalerie" AS ENUM ('NATURE', 'CULTURE', 'HISTOIRE', 'EVENEMENTS', 'TOURISME', 'DRONE', 'VIE_LOCALE', 'ARCHITECTURE', 'AUTRE');

-- CreateTable
CREATE TABLE "galerie_albums" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" "CategorieGalerie" NOT NULL,
    "photoCouvertureId" TEXT,
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galerie_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galerie_albums_traductions" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galerie_albums_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galerie_medias" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "mediaId" TEXT,
    "icone" TEXT,
    "titre" TEXT NOT NULL,
    "auteur" TEXT,
    "lieu" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "galerie_medias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "categorie" "CategorieGalerie" NOT NULL,
    "miseEnAvant" BOOLEAN NOT NULL DEFAULT false,
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "miniatureId" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos_traductions" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "galerie_albums_photoCouvertureId_idx" ON "galerie_albums"("photoCouvertureId");

-- CreateIndex
CREATE UNIQUE INDEX "galerie_albums_traductions_albumId_locale_key" ON "galerie_albums_traductions"("albumId", "locale");

-- CreateIndex
CREATE INDEX "galerie_medias_mediaId_idx" ON "galerie_medias"("mediaId");

-- CreateIndex
CREATE INDEX "videos_miniatureId_idx" ON "videos"("miniatureId");

-- CreateIndex
CREATE UNIQUE INDEX "videos_traductions_videoId_locale_key" ON "videos_traductions"("videoId", "locale");

-- AddForeignKey
ALTER TABLE "galerie_albums" ADD CONSTRAINT "galerie_albums_photoCouvertureId_fkey" FOREIGN KEY ("photoCouvertureId") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galerie_albums_traductions" ADD CONSTRAINT "galerie_albums_traductions_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "galerie_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galerie_medias" ADD CONSTRAINT "galerie_medias_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "galerie_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galerie_medias" ADD CONSTRAINT "galerie_medias_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_miniatureId_fkey" FOREIGN KEY ("miniatureId") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos_traductions" ADD CONSTRAINT "videos_traductions_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
