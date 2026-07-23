-- CreateEnum
CREATE TYPE "PrioriteTicket" AS ENUM ('BASSE', 'NORMALE', 'HAUTE', 'URGENTE');

-- CreateEnum
CREATE TYPE "StatutTicketMaintenance" AS ENUM ('A_FAIRE', 'EN_COURS', 'RESOLU');

-- CreateEnum
CREATE TYPE "CategorieInventaire" AS ENUM ('LINGE', 'CONSOMMABLE', 'PRODUIT_ENTRETIEN', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeMouvementInventaire" AS ENUM ('ENTREE', 'SORTIE', 'AJUSTEMENT');

-- CreateTable
CREATE TABLE "tickets_maintenance" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "chambreId" TEXT,
    "zone" TEXT,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "priorite" "PrioriteTicket" NOT NULL DEFAULT 'NORMALE',
    "statut" "StatutTicketMaintenance" NOT NULL DEFAULT 'A_FAIRE',
    "bloqueChambre" BOOLEAN NOT NULL DEFAULT false,
    "signalantId" TEXT NOT NULL,
    "employeAssigneId" TEXT,
    "notesResolution" TEXT,
    "dateSignalement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateResolution" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles_inventaire" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" "CategorieInventaire" NOT NULL DEFAULT 'AUTRE',
    "unite" TEXT NOT NULL DEFAULT 'unité',
    "quantiteStock" INTEGER NOT NULL DEFAULT 0,
    "seuilAlerte" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_inventaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvements_inventaire" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "type" "TypeMouvementInventaire" NOT NULL,
    "quantite" INTEGER NOT NULL,
    "stockApres" INTEGER NOT NULL,
    "motif" TEXT,
    "employeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mouvements_inventaire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tickets_maintenance_etablissementId_idx" ON "tickets_maintenance"("etablissementId");

-- CreateIndex
CREATE INDEX "tickets_maintenance_chambreId_idx" ON "tickets_maintenance"("chambreId");

-- CreateIndex
CREATE INDEX "tickets_maintenance_statut_idx" ON "tickets_maintenance"("statut");

-- CreateIndex
CREATE INDEX "articles_inventaire_etablissementId_idx" ON "articles_inventaire"("etablissementId");

-- CreateIndex
CREATE UNIQUE INDEX "articles_inventaire_etablissementId_nom_key" ON "articles_inventaire"("etablissementId", "nom");

-- CreateIndex
CREATE INDEX "mouvements_inventaire_articleId_idx" ON "mouvements_inventaire"("articleId");

-- AddForeignKey
ALTER TABLE "tickets_maintenance" ADD CONSTRAINT "tickets_maintenance_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_maintenance" ADD CONSTRAINT "tickets_maintenance_chambreId_fkey" FOREIGN KEY ("chambreId") REFERENCES "chambres"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_maintenance" ADD CONSTRAINT "tickets_maintenance_signalantId_fkey" FOREIGN KEY ("signalantId") REFERENCES "employes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_maintenance" ADD CONSTRAINT "tickets_maintenance_employeAssigneId_fkey" FOREIGN KEY ("employeAssigneId") REFERENCES "employes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles_inventaire" ADD CONSTRAINT "articles_inventaire_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_inventaire" ADD CONSTRAINT "mouvements_inventaire_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles_inventaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_inventaire" ADD CONSTRAINT "mouvements_inventaire_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
