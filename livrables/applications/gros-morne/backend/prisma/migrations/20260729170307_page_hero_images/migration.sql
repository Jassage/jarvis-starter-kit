-- CreateTable
CREATE TABLE "page_hero_images" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_hero_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_hero_images_page_key" ON "page_hero_images"("page");

-- CreateIndex
CREATE INDEX "page_hero_images_mediaId_idx" ON "page_hero_images"("mediaId");

-- AddForeignKey
ALTER TABLE "page_hero_images" ADD CONSTRAINT "page_hero_images_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "medias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
