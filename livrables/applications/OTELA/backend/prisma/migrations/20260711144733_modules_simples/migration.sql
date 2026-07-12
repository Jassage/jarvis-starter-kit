-- CreateEnum
CREATE TYPE "StatutBlanchisserie" AS ENUM ('RECUE', 'EN_TRAITEMENT', 'PRETE', 'LIVREE');

-- CreateEnum
CREATE TYPE "StatutConciergerie" AS ENUM ('RECUE', 'EN_COURS', 'TERMINEE');

-- CreateTable
CREATE TABLE "articles_minibar" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prix" DECIMAL(12,2) NOT NULL,
    "devise" "Devise" NOT NULL,

    CONSTRAINT "articles_minibar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consommations_minibar" (
    "id" TEXT NOT NULL,
    "chambreId" TEXT NOT NULL,
    "articleMinibarId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "dateConstat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "folioId" TEXT,
    "employeId" TEXT,

    CONSTRAINT "consommations_minibar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commandes_blanchisserie" (
    "id" TEXT NOT NULL,
    "chambreId" TEXT NOT NULL,
    "articles" TEXT NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "devise" "Devise" NOT NULL,
    "statut" "StatutBlanchisserie" NOT NULL DEFAULT 'RECUE',
    "folioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commandes_blanchisserie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demandes_conciergerie" (
    "id" TEXT NOT NULL,
    "chambreId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "statut" "StatutConciergerie" NOT NULL DEFAULT 'RECUE',
    "employeAssigneId" TEXT,
    "dateHeure" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "montant" DECIMAL(12,2),
    "folioId" TEXT,

    CONSTRAINT "demandes_conciergerie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicules" (
    "id" TEXT NOT NULL,
    "chambreId" TEXT NOT NULL,
    "plaqueImmatriculation" TEXT NOT NULL,
    "dateArrivee" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDepart" TIMESTAMP(3),
    "emplacement" TEXT NOT NULL,
    "montant" DECIMAL(12,2),
    "folioId" TEXT,

    CONSTRAINT "vehicules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "articles_minibar_etablissementId_idx" ON "articles_minibar"("etablissementId");

-- CreateIndex
CREATE INDEX "consommations_minibar_chambreId_idx" ON "consommations_minibar"("chambreId");

-- CreateIndex
CREATE INDEX "consommations_minibar_folioId_idx" ON "consommations_minibar"("folioId");

-- CreateIndex
CREATE INDEX "commandes_blanchisserie_chambreId_idx" ON "commandes_blanchisserie"("chambreId");

-- CreateIndex
CREATE INDEX "demandes_conciergerie_chambreId_idx" ON "demandes_conciergerie"("chambreId");

-- CreateIndex
CREATE INDEX "vehicules_chambreId_idx" ON "vehicules"("chambreId");

-- AddForeignKey
ALTER TABLE "articles_minibar" ADD CONSTRAINT "articles_minibar_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consommations_minibar" ADD CONSTRAINT "consommations_minibar_chambreId_fkey" FOREIGN KEY ("chambreId") REFERENCES "chambres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consommations_minibar" ADD CONSTRAINT "consommations_minibar_articleMinibarId_fkey" FOREIGN KEY ("articleMinibarId") REFERENCES "articles_minibar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consommations_minibar" ADD CONSTRAINT "consommations_minibar_folioId_fkey" FOREIGN KEY ("folioId") REFERENCES "folios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consommations_minibar" ADD CONSTRAINT "consommations_minibar_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes_blanchisserie" ADD CONSTRAINT "commandes_blanchisserie_chambreId_fkey" FOREIGN KEY ("chambreId") REFERENCES "chambres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes_blanchisserie" ADD CONSTRAINT "commandes_blanchisserie_folioId_fkey" FOREIGN KEY ("folioId") REFERENCES "folios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_conciergerie" ADD CONSTRAINT "demandes_conciergerie_chambreId_fkey" FOREIGN KEY ("chambreId") REFERENCES "chambres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_conciergerie" ADD CONSTRAINT "demandes_conciergerie_employeAssigneId_fkey" FOREIGN KEY ("employeAssigneId") REFERENCES "employes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_conciergerie" ADD CONSTRAINT "demandes_conciergerie_folioId_fkey" FOREIGN KEY ("folioId") REFERENCES "folios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicules" ADD CONSTRAINT "vehicules_chambreId_fkey" FOREIGN KEY ("chambreId") REFERENCES "chambres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicules" ADD CONSTRAINT "vehicules_folioId_fkey" FOREIGN KEY ("folioId") REFERENCES "folios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
