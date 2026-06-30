-- CreateTable
CREATE TABLE "taux_change" (
    "id" TEXT NOT NULL,
    "devise" TEXT NOT NULL,
    "tauxAchat" DECIMAL(10,4) NOT NULL,
    "tauxVente" DECIMAL(10,4) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "creeParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taux_change_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "taux_change_devise_actif_idx" ON "taux_change"("devise", "actif");
