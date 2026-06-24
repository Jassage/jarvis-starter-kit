-- CreateTable
CREATE TABLE "mandats_compte" (
    "id" TEXT NOT NULL,
    "compteId" TEXT NOT NULL,
    "mandataireId" TEXT NOT NULL,
    "droits" TEXT[],
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFin" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "creeParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mandats_compte_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mandats_compte" ADD CONSTRAINT "mandats_compte_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "comptes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandats_compte" ADD CONSTRAINT "mandats_compte_mandataireId_fkey" FOREIGN KEY ("mandataireId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandats_compte" ADD CONSTRAINT "mandats_compte_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
