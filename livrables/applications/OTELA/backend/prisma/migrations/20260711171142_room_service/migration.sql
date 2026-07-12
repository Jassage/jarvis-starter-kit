-- CreateTable
CREATE TABLE "commandes_room_service" (
    "id" TEXT NOT NULL,
    "chambreId" TEXT NOT NULL,
    "statut" "StatutCommande" NOT NULL DEFAULT 'EN_COURS',
    "folioId" TEXT,
    "employeId" TEXT,
    "dateHeure" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commandes_room_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_commande_room_service" (
    "id" TEXT NOT NULL,
    "commandeRoomServiceId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "lignes_commande_room_service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commandes_room_service_chambreId_idx" ON "commandes_room_service"("chambreId");

-- CreateIndex
CREATE INDEX "commandes_room_service_folioId_idx" ON "commandes_room_service"("folioId");

-- CreateIndex
CREATE INDEX "lignes_commande_room_service_commandeRoomServiceId_idx" ON "lignes_commande_room_service"("commandeRoomServiceId");

-- AddForeignKey
ALTER TABLE "commandes_room_service" ADD CONSTRAINT "commandes_room_service_chambreId_fkey" FOREIGN KEY ("chambreId") REFERENCES "chambres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes_room_service" ADD CONSTRAINT "commandes_room_service_folioId_fkey" FOREIGN KEY ("folioId") REFERENCES "folios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes_room_service" ADD CONSTRAINT "commandes_room_service_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande_room_service" ADD CONSTRAINT "lignes_commande_room_service_commandeRoomServiceId_fkey" FOREIGN KEY ("commandeRoomServiceId") REFERENCES "commandes_room_service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande_room_service" ADD CONSTRAINT "lignes_commande_room_service_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
