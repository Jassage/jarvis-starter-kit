-- CreateEnum
CREATE TYPE "StatutReplay" AS ENUM ('BROUILLON', 'PUBLIE', 'RETIRE');

-- CreateTable
CREATE TABLE "replays" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "urlVod" TEXT NOT NULL,
    "vignetteUrl" TEXT,
    "dureeSecondes" INTEGER NOT NULL,
    "statut" "StatutReplay" NOT NULL DEFAULT 'BROUILLON',
    "disponibleDu" TIMESTAMP(3),
    "disponibleAu" TIMESTAMP(3),
    "nombreVues" INTEGER NOT NULL DEFAULT 0,
    "publieAt" TIMESTAMP(3),
    "creneauId" TEXT,
    "matchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "replays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "replays_creneauId_key" ON "replays"("creneauId");

-- CreateIndex
CREATE INDEX "replays_statut_idx" ON "replays"("statut");

-- AddForeignKey
ALTER TABLE "replays" ADD CONSTRAINT "replays_creneauId_fkey" FOREIGN KEY ("creneauId") REFERENCES "creneaux_grille"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "replays" ADD CONSTRAINT "replays_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matchs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
