-- CreateEnum
CREATE TYPE "TypeMouvement" AS ENUM ('ENTREE', 'SORTIE', 'DISPENSATION', 'AJUSTEMENT', 'PEREMPTION');

-- CreateEnum
CREATE TYPE "StatutCommande" AS ENUM ('BROUILLON', 'ENVOYE', 'RECU_PARTIEL', 'RECU', 'ANNULE');

-- CreateEnum
CREATE TYPE "TypeGarde" AS ENUM ('JOUR', 'NUIT', 'ASTREINTE', 'URGENCE');

-- CreateEnum
CREATE TYPE "TypeAbsence" AS ENUM ('CONGE', 'MALADIE', 'FORMATION', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutAbsence" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REJETE');

-- CreateTable
CREATE TABLE "medicaments" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "dci" TEXT,
    "categorie" TEXT,
    "forme" TEXT,
    "dosageForme" TEXT,
    "unite" TEXT NOT NULL DEFAULT 'unité',
    "stockActuel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "seuilAlerte" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "prixUnitaire" DOUBLE PRECISION,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots_medicaments" (
    "id" TEXT NOT NULL,
    "medicamentId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "quantiteInitiale" DOUBLE PRECISION NOT NULL,
    "quantiteRestante" DOUBLE PRECISION NOT NULL,
    "datePeremption" TIMESTAMP(3),
    "fournisseur" TEXT,
    "dateReception" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lots_medicaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvements_stock" (
    "id" TEXT NOT NULL,
    "medicamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TypeMouvement" NOT NULL,
    "quantite" DOUBLE PRECISION NOT NULL,
    "raison" TEXT,
    "prescriptionId" TEXT,
    "lotId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mouvements_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commandes_fournisseurs" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fournisseur" TEXT NOT NULL,
    "statut" "StatutCommande" NOT NULL DEFAULT 'BROUILLON',
    "dateCommande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateLivraisonPrevue" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commandes_fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_commandes" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "medicamentId" TEXT NOT NULL,
    "quantiteCommandee" DOUBLE PRECISION NOT NULL,
    "quantiteRecue" DOUBLE PRECISION,
    "prixUnitaire" DOUBLE PRECISION,

    CONSTRAINT "lignes_commandes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gardes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "TypeGarde" NOT NULL DEFAULT 'JOUR',
    "heureDebut" TEXT NOT NULL DEFAULT '08:00',
    "heureFin" TEXT NOT NULL DEFAULT '16:00',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gardes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TypeAbsence" NOT NULL DEFAULT 'CONGE',
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "statut" "StatutAbsence" NOT NULL DEFAULT 'EN_ATTENTE',
    "raison" TEXT,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commandes_fournisseurs_numero_key" ON "commandes_fournisseurs"("numero");

-- AddForeignKey
ALTER TABLE "lots_medicaments" ADD CONSTRAINT "lots_medicaments_medicamentId_fkey" FOREIGN KEY ("medicamentId") REFERENCES "medicaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_medicamentId_fkey" FOREIGN KEY ("medicamentId") REFERENCES "medicaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commandes" ADD CONSTRAINT "lignes_commandes_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "commandes_fournisseurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commandes" ADD CONSTRAINT "lignes_commandes_medicamentId_fkey" FOREIGN KEY ("medicamentId") REFERENCES "medicaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gardes" ADD CONSTRAINT "gardes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gardes" ADD CONSTRAINT "gardes_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absences" ADD CONSTRAINT "absences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absences" ADD CONSTRAINT "absences_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
