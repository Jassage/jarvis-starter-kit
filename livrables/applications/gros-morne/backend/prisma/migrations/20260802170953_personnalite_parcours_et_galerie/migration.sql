-- CreateTable
CREATE TABLE "personnalites_etapes" (
    "id" TEXT NOT NULL,
    "personnaliteId" TEXT NOT NULL,
    "annee" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personnalites_etapes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnalites_etapes_traductions" (
    "id" TEXT NOT NULL,
    "etapeId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personnalites_etapes_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnalites_photos" (
    "id" TEXT NOT NULL,
    "personnaliteId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "personnalites_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "personnalites_etapes_personnaliteId_idx" ON "personnalites_etapes"("personnaliteId");

-- CreateIndex
CREATE UNIQUE INDEX "personnalites_etapes_traductions_etapeId_locale_key" ON "personnalites_etapes_traductions"("etapeId", "locale");

-- CreateIndex
CREATE INDEX "personnalites_photos_mediaId_idx" ON "personnalites_photos"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "personnalites_photos_personnaliteId_mediaId_key" ON "personnalites_photos"("personnaliteId", "mediaId");

-- AddForeignKey
ALTER TABLE "personnalites_etapes" ADD CONSTRAINT "personnalites_etapes_personnaliteId_fkey" FOREIGN KEY ("personnaliteId") REFERENCES "personnalites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnalites_etapes_traductions" ADD CONSTRAINT "personnalites_etapes_traductions_etapeId_fkey" FOREIGN KEY ("etapeId") REFERENCES "personnalites_etapes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnalites_photos" ADD CONSTRAINT "personnalites_photos_personnaliteId_fkey" FOREIGN KEY ("personnaliteId") REFERENCES "personnalites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnalites_photos" ADD CONSTRAINT "personnalites_photos_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "medias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
