-- CreateEnum
CREATE TYPE "TypeDocument" AS ENUM ('PIECE_IDENTITE', 'JUSTIFICATIF_DOMICILE', 'CONTRAT', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutDocument" AS ENUM ('ACTIF', 'EXPIRE', 'ARCHIVE');

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" "TypeDocument" NOT NULL,
    "nomFichier" TEXT NOT NULL,
    "cheminFichier" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tailleOctets" INTEGER NOT NULL,
    "dateExpiration" TIMESTAMP(3),
    "statut" "StatutDocument" NOT NULL DEFAULT 'ACTIF',
    "notes" TEXT,
    "creeParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documents_clientId_idx" ON "documents"("clientId");

-- CreateIndex
CREATE INDEX "documents_statut_idx" ON "documents"("statut");

-- CreateIndex
CREATE INDEX "documents_dateExpiration_idx" ON "documents"("dateExpiration");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
