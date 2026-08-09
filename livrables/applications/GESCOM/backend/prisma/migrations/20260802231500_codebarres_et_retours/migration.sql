-- AlterTable
ALTER TABLE "produits" ADD COLUMN     "codeBarres" TEXT;

-- CreateTable
CREATE TABLE "retours_vente" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "venteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "motif" TEXT,
    "montantTotal" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retours_vente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_retour" (
    "id" TEXT NOT NULL,
    "retourId" TEXT NOT NULL,
    "ligneVenteId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "montantLigne" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "lignes_retour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "retours_vente_numero_key" ON "retours_vente"("numero");

-- CreateIndex
CREATE INDEX "retours_vente_venteId_idx" ON "retours_vente"("venteId");

-- CreateIndex
CREATE INDEX "lignes_retour_ligneVenteId_idx" ON "lignes_retour"("ligneVenteId");

-- CreateIndex
CREATE UNIQUE INDEX "produits_codeBarres_key" ON "produits"("codeBarres");

-- AddForeignKey
ALTER TABLE "retours_vente" ADD CONSTRAINT "retours_vente_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "ventes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retours_vente" ADD CONSTRAINT "retours_vente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_retour" ADD CONSTRAINT "lignes_retour_retourId_fkey" FOREIGN KEY ("retourId") REFERENCES "retours_vente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_retour" ADD CONSTRAINT "lignes_retour_ligneVenteId_fkey" FOREIGN KEY ("ligneVenteId") REFERENCES "lignes_vente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
