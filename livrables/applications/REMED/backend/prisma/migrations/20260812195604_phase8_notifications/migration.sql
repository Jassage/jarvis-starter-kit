-- Écrite à la main : le moteur de schéma Prisma refuse l'exécution non-interactive dans cet
-- environnement (cf. HISTORY.md). Appliquée via un script Node ponctuel.

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('STOCK_BAS', 'PEREMPTION_PROCHE', 'COMMANDE_RECUE');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "pharmacieId" TEXT NOT NULL,
    "type" "TypeNotification" NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lienEntite" TEXT,
    "lue" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_pharmacieId_idx" ON "notifications"("pharmacieId");

-- CreateIndex
CREATE INDEX "notifications_lue_idx" ON "notifications"("lue");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
