-- Écrite à la main : le moteur de schéma Prisma refuse l'exécution non-interactive dans cet
-- environnement (cf. HISTORY.md).

-- AlterTable
ALTER TABLE "utilisateurs"
  ADD COLUMN "tentativesEchouees" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "verrouilleJusqua" TIMESTAMP(3);
