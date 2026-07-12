-- CreateEnum
CREATE TYPE "RoleEmploye" AS ENUM ('RECEPTION', 'MENAGE', 'ADMINISTRATEUR_ETABLISSEMENT', 'ADMINISTRATEUR_CHAINE');

-- CreateEnum
CREATE TYPE "Devise" AS ENUM ('HTG', 'USD');

-- CreateEnum
CREATE TYPE "StatutChambre" AS ENUM ('DISPONIBLE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "StatutReservation" AS ENUM ('CONFIRMEE', 'EN_ATTENTE', 'ANNULEE', 'TERMINEE', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "CanalReservation" AS ENUM ('SITE_DIRECT');

-- CreateTable
CREATE TABLE "chaines" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chaines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etablissements" (
    "id" TEXT NOT NULL,
    "chaineId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "departement" TEXT NOT NULL,
    "devisesAcceptees" "Devise"[],
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etablissements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "types_chambres" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "capaciteMax" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "types_chambres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chambres" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "typeChambreId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "statut" "StatutChambre" NOT NULL DEFAULT 'DISPONIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chambres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarifs" (
    "id" TEXT NOT NULL,
    "typeChambreId" TEXT NOT NULL,
    "devise" "Devise" NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "dateDebutSaison" TIMESTAMP(3) NOT NULL,
    "dateFinSaison" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarifs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "chambreId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "dateArrivee" TIMESTAMP(3) NOT NULL,
    "dateDepart" TIMESTAMP(3) NOT NULL,
    "nombrePersonnes" INTEGER NOT NULL,
    "devise" "Devise" NOT NULL,
    "montantTotal" DECIMAL(12,2) NOT NULL,
    "statut" "StatutReservation" NOT NULL DEFAULT 'CONFIRMEE',
    "canal" "CanalReservation" NOT NULL DEFAULT 'SITE_DIRECT',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employes" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "RoleEmploye" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "etablissements_chaineId_idx" ON "etablissements"("chaineId");

-- CreateIndex
CREATE INDEX "types_chambres_etablissementId_idx" ON "types_chambres"("etablissementId");

-- CreateIndex
CREATE INDEX "chambres_typeChambreId_idx" ON "chambres"("typeChambreId");

-- CreateIndex
CREATE UNIQUE INDEX "chambres_etablissementId_numero_key" ON "chambres"("etablissementId", "numero");

-- CreateIndex
CREATE INDEX "tarifs_typeChambreId_devise_idx" ON "tarifs"("typeChambreId", "devise");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE INDEX "reservations_etablissementId_idx" ON "reservations"("etablissementId");

-- CreateIndex
CREATE INDEX "reservations_chambreId_idx" ON "reservations"("chambreId");

-- CreateIndex
CREATE INDEX "reservations_clientId_idx" ON "reservations"("clientId");

-- CreateIndex
CREATE INDEX "reservations_dateArrivee_dateDepart_idx" ON "reservations"("dateArrivee", "dateDepart");

-- CreateIndex
CREATE UNIQUE INDEX "employes_email_key" ON "employes"("email");

-- CreateIndex
CREATE INDEX "employes_etablissementId_idx" ON "employes"("etablissementId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_employeId_idx" ON "refresh_tokens"("employeId");

-- AddForeignKey
ALTER TABLE "etablissements" ADD CONSTRAINT "etablissements_chaineId_fkey" FOREIGN KEY ("chaineId") REFERENCES "chaines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "types_chambres" ADD CONSTRAINT "types_chambres_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chambres" ADD CONSTRAINT "chambres_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chambres" ADD CONSTRAINT "chambres_typeChambreId_fkey" FOREIGN KEY ("typeChambreId") REFERENCES "types_chambres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarifs" ADD CONSTRAINT "tarifs_typeChambreId_fkey" FOREIGN KEY ("typeChambreId") REFERENCES "types_chambres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_chambreId_fkey" FOREIGN KEY ("chambreId") REFERENCES "chambres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employes" ADD CONSTRAINT "employes_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
