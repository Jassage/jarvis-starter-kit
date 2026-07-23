-- CreateTable
CREATE TABLE "avis" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "reponseDirection" TEXT,
    "reponseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "avis_reservationId_key" ON "avis"("reservationId");

-- CreateIndex
CREATE INDEX "avis_etablissementId_idx" ON "avis"("etablissementId");

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
