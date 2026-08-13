-- CreateEnum
CREATE TYPE "CategorieDepense" AS ENUM ('LOYER', 'ELECTRICITE', 'INTERNET', 'TRANSPORT', 'SALAIRES', 'FOURNITURES', 'MAINTENANCE', 'AUTRES');

-- CreateEnum
CREATE TYPE "TypeRetour" AS ENUM ('RETOUR_CLIENT', 'RETOUR_FOURNISSEUR', 'PRODUIT_ENDOMMAGE', 'PRODUIT_EXPIRE', 'ERREUR_VENTE');

-- CreateEnum
CREATE TYPE "TypeInventaire" AS ENUM ('COMPLET', 'PARTIEL');

-- CreateEnum
CREATE TYPE "StatutInventaire" AS ENUM ('EN_COURS', 'VALIDE', 'ANNULE');

-- AlterEnum
ALTER TYPE "TypeMouvementStock" ADD VALUE 'RETOUR_CLIENT';

-- CreateTable
CREATE TABLE "depenses" (
    "id" TEXT NOT NULL,
    "pharmacieId" TEXT NOT NULL,
    "categorie" "CategorieDepense" NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "modePaiement" "ModePaiement" NOT NULL,
    "caisseSessionId" TEXT,
    "utilisateurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "depenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retours" (
    "id" TEXT NOT NULL,
    "pharmacieId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "type" "TypeRetour" NOT NULL,
    "venteId" TEXT,
    "fournisseurId" TEXT,
    "motif" TEXT,
    "utilisateurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retour_items" (
    "id" TEXT NOT NULL,
    "retourId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,

    CONSTRAINT "retour_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventaires" (
    "id" TEXT NOT NULL,
    "pharmacieId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "type" "TypeInventaire" NOT NULL,
    "statut" "StatutInventaire" NOT NULL DEFAULT 'EN_COURS',
    "creeParId" TEXT NOT NULL,
    "valideParId" TEXT,
    "valideLe" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventaire_items" (
    "id" TEXT NOT NULL,
    "inventaireId" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "quantiteTheorique" INTEGER NOT NULL,
    "quantiteReelle" INTEGER,
    "motif" TEXT,

    CONSTRAINT "inventaire_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "depenses_pharmacieId_idx" ON "depenses"("pharmacieId");

-- CreateIndex
CREATE INDEX "depenses_createdAt_idx" ON "depenses"("createdAt");

-- CreateIndex
CREATE INDEX "retours_pharmacieId_idx" ON "retours"("pharmacieId");

-- CreateIndex
CREATE UNIQUE INDEX "retours_pharmacieId_numero_key" ON "retours"("pharmacieId", "numero");

-- CreateIndex
CREATE INDEX "retour_items_retourId_idx" ON "retour_items"("retourId");

-- CreateIndex
CREATE INDEX "inventaires_pharmacieId_idx" ON "inventaires"("pharmacieId");

-- CreateIndex
CREATE UNIQUE INDEX "inventaires_pharmacieId_numero_key" ON "inventaires"("pharmacieId", "numero");

-- CreateIndex
CREATE INDEX "inventaire_items_inventaireId_idx" ON "inventaire_items"("inventaireId");

-- AddForeignKey
ALTER TABLE "depenses" ADD CONSTRAINT "depenses_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depenses" ADD CONSTRAINT "depenses_caisseSessionId_fkey" FOREIGN KEY ("caisseSessionId") REFERENCES "caisse_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depenses" ADD CONSTRAINT "depenses_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retours" ADD CONSTRAINT "retours_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retours" ADD CONSTRAINT "retours_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "ventes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retours" ADD CONSTRAINT "retours_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retours" ADD CONSTRAINT "retours_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retour_items" ADD CONSTRAINT "retour_items_retourId_fkey" FOREIGN KEY ("retourId") REFERENCES "retours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retour_items" ADD CONSTRAINT "retour_items_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retour_items" ADD CONSTRAINT "retour_items_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots_produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventaires" ADD CONSTRAINT "inventaires_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventaires" ADD CONSTRAINT "inventaires_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventaires" ADD CONSTRAINT "inventaires_valideParId_fkey" FOREIGN KEY ("valideParId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventaire_items" ADD CONSTRAINT "inventaire_items_inventaireId_fkey" FOREIGN KEY ("inventaireId") REFERENCES "inventaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventaire_items" ADD CONSTRAINT "inventaire_items_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots_produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
