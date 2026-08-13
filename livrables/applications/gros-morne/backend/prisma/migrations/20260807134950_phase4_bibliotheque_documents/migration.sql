-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "mediaId" TEXT NOT NULL,
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documents_mediaId_idx" ON "documents"("mediaId");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "medias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
