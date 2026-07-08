-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMINISTRATEUR', 'OPERATEUR_REGIE');

-- CreateEnum
CREATE TYPE "TypeContenu" AS ENUM ('VIDEO_BOUCLE', 'SPOT_PUBLICITAIRE', 'HABILLAGE_LOGO');

-- CreateEnum
CREATE TYPE "TypeCreneau" AS ENUM ('PROGRAMME', 'MATCH_DIRECT', 'PUB');

-- CreateEnum
CREATE TYPE "StatutDiffusionMatch" AS ENUM ('PLANIFIE', 'EN_COURS', 'TERMINE');

-- CreateEnum
CREATE TYPE "TypePackageSponsor" AS ENUM ('TITRE_MATCH', 'BANDEAU', 'HABILLAGE_PERMANENT');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('BROUILLON', 'SYNCHRONISE');

-- CreateEnum
CREATE TYPE "PositionOverlay" AS ENUM ('HAUT_GAUCHE', 'HAUT_DROITE', 'BAS_GAUCHE', 'BAS_DROITE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATEUR_REGIE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsors" (
    "id" TEXT NOT NULL,
    "nomSponsor" TEXT NOT NULL,
    "logoUrl" TEXT,
    "typePackage" "TypePackageSponsor" NOT NULL,
    "contactNom" TEXT,
    "contactTelephone" TEXT,
    "dateDebutContrat" TIMESTAMP(3) NOT NULL,
    "dateFinContrat" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contenus" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "typeContenu" "TypeContenu" NOT NULL,
    "urlFichier" TEXT NOT NULL,
    "dureeSecondes" INTEGER NOT NULL,
    "sponsorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contenus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matchs" (
    "id" TEXT NOT NULL,
    "nomEvenement" TEXT NOT NULL,
    "equipes" TEXT NOT NULL,
    "dateHeurePrevue" TIMESTAMP(3) NOT NULL,
    "statutDiffusion" "StatutDiffusionMatch" NOT NULL DEFAULT 'PLANIFIE',
    "ingestUrlRtmp" TEXT,
    "sponsorPrincipalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matchs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creneaux_grille" (
    "id" TEXT NOT NULL,
    "dateHeureDebut" TIMESTAMP(3) NOT NULL,
    "dateHeureFin" TIMESTAMP(3) NOT NULL,
    "typeCreneau" "TypeCreneau" NOT NULL,
    "contenuId" TEXT,
    "matchId" TEXT,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'BROUILLON',
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creneaux_grille_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incrustations_logo" (
    "id" TEXT NOT NULL,
    "creneauId" TEXT,
    "matchId" TEXT,
    "sponsorId" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "position" "PositionOverlay" NOT NULL DEFAULT 'BAS_DROITE',
    "opacite" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incrustations_logo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bandeaux_sponsor" (
    "id" TEXT NOT NULL,
    "creneauId" TEXT,
    "matchId" TEXT,
    "items" JSONB NOT NULL,
    "vitesseDefilement" INTEGER NOT NULL DEFAULT 60,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bandeaux_sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diffusion_logs" (
    "id" TEXT NOT NULL,
    "creneauId" TEXT,
    "matchId" TEXT,
    "dateHeureReelle" TIMESTAMP(3) NOT NULL,
    "dureeVisionneeEstimee" INTEGER NOT NULL,
    "nombreVuesEstimees" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diffusion_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "creneaux_grille_dateHeureDebut_idx" ON "creneaux_grille"("dateHeureDebut");

-- CreateIndex
CREATE INDEX "creneaux_grille_dateHeureFin_idx" ON "creneaux_grille"("dateHeureFin");

-- CreateIndex
CREATE INDEX "diffusion_logs_creneauId_idx" ON "diffusion_logs"("creneauId");

-- CreateIndex
CREATE INDEX "diffusion_logs_matchId_idx" ON "diffusion_logs"("matchId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contenus" ADD CONSTRAINT "contenus_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "sponsors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchs" ADD CONSTRAINT "matchs_sponsorPrincipalId_fkey" FOREIGN KEY ("sponsorPrincipalId") REFERENCES "sponsors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creneaux_grille" ADD CONSTRAINT "creneaux_grille_contenuId_fkey" FOREIGN KEY ("contenuId") REFERENCES "contenus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creneaux_grille" ADD CONSTRAINT "creneaux_grille_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matchs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incrustations_logo" ADD CONSTRAINT "incrustations_logo_creneauId_fkey" FOREIGN KEY ("creneauId") REFERENCES "creneaux_grille"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incrustations_logo" ADD CONSTRAINT "incrustations_logo_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matchs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incrustations_logo" ADD CONSTRAINT "incrustations_logo_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "sponsors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bandeaux_sponsor" ADD CONSTRAINT "bandeaux_sponsor_creneauId_fkey" FOREIGN KEY ("creneauId") REFERENCES "creneaux_grille"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bandeaux_sponsor" ADD CONSTRAINT "bandeaux_sponsor_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matchs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diffusion_logs" ADD CONSTRAINT "diffusion_logs_creneauId_fkey" FOREIGN KEY ("creneauId") REFERENCES "creneaux_grille"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diffusion_logs" ADD CONSTRAINT "diffusion_logs_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matchs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
