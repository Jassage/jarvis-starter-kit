-- CreateEnum
CREATE TYPE "StatutEmploye" AS ENUM ('ACTIF', 'INACTIF', 'CONGE', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "TypeContrat" AS ENUM ('CDI', 'CDD', 'STAGE', 'CONSULTANT');

-- CreateEnum
CREATE TYPE "StatutContrat" AS ENUM ('ACTIF', 'EXPIRE', 'RESILIE');

-- CreateEnum
CREATE TYPE "TypeConge" AS ENUM ('ANNUEL', 'MALADIE', 'MATERNITE', 'PATERNITE', 'SANS_SOLDE', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutConge" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REFUSE', 'ANNULE');

-- CreateEnum
CREATE TYPE "StatutPaie" AS ENUM ('BROUILLON', 'VALIDE', 'PAYE');

-- CreateTable
CREATE TABLE "postes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "departement" TEXT,
    "salaireMin" DECIMAL(15,2),
    "salaireMax" DECIMAL(15,2),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employes" (
    "id" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "dateEmbauche" TIMESTAMP(3) NOT NULL,
    "departement" TEXT,
    "statut" "StatutEmploye" NOT NULL DEFAULT 'ACTIF',
    "salaireBrut" DECIMAL(15,2) NOT NULL,
    "posteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "type" "TypeContrat" NOT NULL,
    "statut" "StatutContrat" NOT NULL DEFAULT 'ACTIF',
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "salaireBrut" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contrats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conges" (
    "id" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "type" "TypeConge" NOT NULL,
    "statut" "StatutConge" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "nbJours" INTEGER NOT NULL,
    "motif" TEXT,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiches_paie" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "salaireBrut" DECIMAL(15,2) NOT NULL,
    "cotisations" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "salaireNet" DECIMAL(15,2) NOT NULL,
    "statut" "StatutPaie" NOT NULL DEFAULT 'BROUILLON',
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fiches_paie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "postes_code_key" ON "postes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "employes_matricule_key" ON "employes"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "contrats_reference_key" ON "contrats"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "fiches_paie_reference_key" ON "fiches_paie"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "fiches_paie_employeId_periode_key" ON "fiches_paie"("employeId", "periode");

-- AddForeignKey
ALTER TABLE "employes" ADD CONSTRAINT "employes_posteId_fkey" FOREIGN KEY ("posteId") REFERENCES "postes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conges" ADD CONSTRAINT "conges_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiches_paie" ADD CONSTRAINT "fiches_paie_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
