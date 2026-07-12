-- CreateEnum
CREATE TYPE "StatutFolio" AS ENUM ('OUVERT', 'FERME');

-- CreateEnum
CREATE TYPE "DepartementFolio" AS ENUM ('RESTAURANT', 'BAR', 'ROOM_SERVICE', 'MINIBAR', 'SPA', 'BLANCHISSERIE', 'EVENEMENTIEL', 'VOITURIER', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypePointDeVente" AS ENUM ('RESTAURANT', 'BAR');

-- CreateEnum
CREATE TYPE "StatutTable" AS ENUM ('LIBRE', 'OCCUPEE', 'RESERVEE');

-- CreateEnum
CREATE TYPE "CategorieMenuItem" AS ENUM ('ENTREE', 'PLAT', 'DESSERT', 'BOISSON', 'CARTE_BAR');

-- CreateEnum
CREATE TYPE "StatutCommande" AS ENUM ('EN_COURS', 'ENVOYEE_CUISINE', 'SERVIE', 'PAYEE');

-- AlterEnum
ALTER TYPE "RoleEmploye" ADD VALUE 'SERVEUR';

-- CreateTable
CREATE TABLE "folios" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "statut" "StatutFolio" NOT NULL DEFAULT 'OUVERT',
    "dateOuverture" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFermeture" TIMESTAMP(3),
    "devise" "Devise" NOT NULL,

    CONSTRAINT "folios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_folio" (
    "id" TEXT NOT NULL,
    "folioId" TEXT NOT NULL,
    "departementSource" "DepartementFolio" NOT NULL,
    "description" TEXT NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "dateHeure" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employeId" TEXT,

    CONSTRAINT "lignes_folio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_de_vente" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypePointDeVente" NOT NULL,

    CONSTRAINT "points_de_vente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tables" (
    "id" TEXT NOT NULL,
    "pointDeVenteId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "capacite" INTEGER NOT NULL,
    "statut" "StatutTable" NOT NULL DEFAULT 'LIBRE',

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "pointDeVenteId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prix" DECIMAL(12,2) NOT NULL,
    "devise" "Devise" NOT NULL,
    "categorie" "CategorieMenuItem" NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commandes" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "folioId" TEXT,
    "statut" "StatutCommande" NOT NULL DEFAULT 'EN_COURS',
    "methodePaiement" "MethodePaiement",
    "employeId" TEXT,
    "dateHeure" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commandes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_commande" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "lignes_commande_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "folios_reservationId_key" ON "folios"("reservationId");

-- CreateIndex
CREATE INDEX "folios_etablissementId_idx" ON "folios"("etablissementId");

-- CreateIndex
CREATE INDEX "lignes_folio_folioId_idx" ON "lignes_folio"("folioId");

-- CreateIndex
CREATE INDEX "points_de_vente_etablissementId_idx" ON "points_de_vente"("etablissementId");

-- CreateIndex
CREATE UNIQUE INDEX "tables_pointDeVenteId_numero_key" ON "tables"("pointDeVenteId", "numero");

-- CreateIndex
CREATE INDEX "menu_items_pointDeVenteId_idx" ON "menu_items"("pointDeVenteId");

-- CreateIndex
CREATE INDEX "commandes_tableId_idx" ON "commandes"("tableId");

-- CreateIndex
CREATE INDEX "commandes_folioId_idx" ON "commandes"("folioId");

-- CreateIndex
CREATE INDEX "lignes_commande_commandeId_idx" ON "lignes_commande"("commandeId");

-- AddForeignKey
ALTER TABLE "folios" ADD CONSTRAINT "folios_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folios" ADD CONSTRAINT "folios_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_folio" ADD CONSTRAINT "lignes_folio_folioId_fkey" FOREIGN KEY ("folioId") REFERENCES "folios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_folio" ADD CONSTRAINT "lignes_folio_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_de_vente" ADD CONSTRAINT "points_de_vente_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_pointDeVenteId_fkey" FOREIGN KEY ("pointDeVenteId") REFERENCES "points_de_vente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_pointDeVenteId_fkey" FOREIGN KEY ("pointDeVenteId") REFERENCES "points_de_vente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_folioId_fkey" FOREIGN KEY ("folioId") REFERENCES "folios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande" ADD CONSTRAINT "lignes_commande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "commandes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande" ADD CONSTRAINT "lignes_commande_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
